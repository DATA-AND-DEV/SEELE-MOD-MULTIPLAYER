// ---- maquina.js: a metade de máquina ----
//
// Roda só numa máquina cujo dono aceitou, na tela do produto, rodar aquele
// servidor de jogo. Baixa e confere o que a receita pede, escreve os termos e
// a configuração, roda o jogo, lê a saída (pronto, quem entrou, quem saiu),
// serve o túnel quando o jogo está pronto, aceita comandos do console e para
// limpo.
//
// **Não confia em si para saber se foi aceita**: cada passo começa pedindo o
// plano à metade de servidor, que só o entrega à máquina aceita. Sem o plano,
// nada é baixado, nada é escrito e nada roda.
//
// **Nada calado.** Toda falha vai à metade de servidor (`op: 'falha'`), com a
// etapa, o nome do erro e os dados dele, e de lá à tela de quem configura.
//
// Toda a API da máquina passa pelo adaptador (adaptador.js).

const LINHAS_GUARDADAS = 8;
/** Quanto a parada da metade espera o jogo sair depois do `stop`, abaixo dos 20 s do produto. */
const PRAZO_DA_PARADA_DA_METADE = 15000;

function criarMaquina(ad) {
  const instancias = new Map();

  function instancia(servidor) {
    let i = instancias.get(servidor);
    if (!i) {
      i = {
        servidor, fila: Promise.resolve(), plano: null, preparado: null, proc: null, tunel: null,
        estado: 'desligado', jogadores: [], linhas: [], parando: false, esperas: [], progresso: null,
        casar: null,
      };
      instancias.set(servidor, i);
    }
    return i;
  }

  // ---- falar com a metade de servidor ----

  async function falha(i, etapa, erro, dados = {}) {
    const frase = typeof erro === 'string' ? erro : fraseDoErro(erro);
    ad.registrar(`${i.servidor}: ${etapa}: ${frase} ${JSON.stringify(dados)}`);
    // As recusas do produto nesta máquina, contadas por nome, vão junto: é o
    // que diz à tela se a falha é a primeira ou a décima.
    let recusas = null;
    try { recusas = ad.recusas ? await ad.recusas() : null; } catch { recusas = null; }
    try {
      await ad.pedir({ op: 'falha', etapa, erro: frase, dados: { ...dados, ...(recusas && Object.keys(recusas).length ? { recusas } : {}) } });
    } catch (e) {
      // Sem a metade de servidor, o log desta máquina é o que sobra.
      ad.registrar(`${i.servidor}: a falha não chegou à metade de servidor: ${fraseDoErro(e)}`);
    }
  }

  async function contar(i, estado, extra = {}) {
    i.estado = estado;
    let resposta;
    try {
      resposta = await ad.pedir({
        op: 'estado', estado, jogadores: i.jogadores, linhas: i.linhas,
        ...(i.progresso ? { progresso: i.progresso } : {}), ...extra,
      });
    } catch (e) {
      ad.registrar(`${i.servidor}: o estado não chegou à metade de servidor: ${fraseDoErro(e)}`);
      return;
    }
    // A metade de servidor é quem decide quem roda: se ela manda parar, para.
    if (resposta?.ordem === 'desligar' && i.proc && !i.parando) enfileirar(i, () => desligar(i));
  }

  async function lerPlano(i) {
    const r = await ad.pedir({ op: 'plano' });
    if (!r || r.ok !== true || !r.plano) {
      // Sem aceite, a máquina nem é ouvida (o produto a dispensa); com outro
      // motivo, a tela fica sabendo.
      if (r && r.erro && r.erro !== 'sem-aceite') await falha(i, 'plano', r.erro, dadosDoErro(r));
      ad.registrar(`${i.servidor}: sem plano: ${JSON.stringify(r)}`);
      return null;
    }
    i.plano = r.plano;
    const receita = receitaPorId(r.plano.receita);
    if (!receita) {
      await falha(i, 'plano', 'receita-desconhecida', { receita: r.plano.receita });
      return null;
    }
    i.receita = receita;
    i.casar = casarSaida(receita);
    return r.plano;
  }

  // ---- preparar: baixar e conferir ----

  async function preparar(i) {
    const plano = await lerPlano(i);
    if (!plano) return false;
    const chave = JSON.stringify(plano.artefatos);
    if (i.preparado === chave) return true;

    const plataforma = ad.plataforma();
    const java = new Set(Object.values(plano.porPlataforma));
    const meuJava = plano.porPlataforma[plataforma];
    if (java.size && !meuJava) {
      await falha(i, 'java', 'sem-java-para-esta-maquina', { plataforma, plataformas: Object.keys(plano.porPlataforma) });
      return false;
    }
    const baixar = plano.artefatos.filter(a => !java.has(a.nome) || a.nome === meuJava);
    i.progresso = { feitos: 0, total: baixar.length };
    await contar(i, 'baixando');
    for (const a of baixar) {
      // Um pacote (o Java) é baixado ao lado e aberto no destino: o produto
      // confere o hash do pacote, e abre só o que está sob a raiz dele.
      const destino = a.desempacotar ? `pacotes/${a.nome}` : a.destino;
      try {
        await ad.baixar({ url: a.url, hash: a.hash, tamanho: a.tamanho, destino });
      } catch (erro) {
        await falha(i, 'baixar', erro, { arquivo: a.nome, url: a.url, tamanho: a.tamanho, hash: a.hash, ...dadosDoErro(erro) });
        await contar(i, 'desligado');
        return false;
      }
      if (a.desempacotar) {
        try {
          await ad.desempacotar({ arquivo: destino, destino: a.destino, raiz: a.desempacotar.raiz });
        } catch (erro) {
          await falha(i, 'desempacotar', erro, { arquivo: a.nome, raiz: a.desempacotar.raiz, ...dadosDoErro(erro) });
          await contar(i, 'desligado');
          return false;
        }
      }
      i.progresso = { feitos: i.progresso.feitos + 1, total: baixar.length };
    }
    i.preparado = chave;
    await contar(i, 'pronto');
    return true;
  }

  // ---- ligar: escrever, rodar e vigiar ----

  async function escreverArquivos(i, plano) {
    // **Os termos só são escritos aqui**, com o plano que só a máquina aceita
    // recebe: o EULA foi aceito por quem é dono desta máquina, na tela do produto.
    for (const t of plano.termos) await ad.escrever(t.arquivo, t.conteudo);
    await ad.escrever(plano.arquivoDeConfig, plano.propriedades);
  }

  function lembrar(i, linha) {
    i.linhas = [...i.linhas, cortar(linha, 160)].slice(-LINHAS_GUARDADAS);
  }

  function aoLinha(i, linha) {
    lembrar(i, linha);
    for (const e of [...i.esperas]) {
      if (e.re.test(linha)) {
        i.esperas = i.esperas.filter(x => x !== e);
        e.resolver(true);
      }
    }
    const lido = i.casar?.(linha);
    if (!lido) return;
    if (lido.tipo === 'pronto') enfileirar(i, () => abrirTunel(i));
    else if (lido.tipo === 'entrou') {
      if (!i.jogadores.includes(lido.jogador)) i.jogadores = [...i.jogadores, lido.jogador];
      contar(i, i.estado);
    } else if (lido.tipo === 'saiu') {
      i.jogadores = i.jogadores.filter(j => j !== lido.jogador);
      contar(i, i.estado);
    }
  }

  async function abrirTunel(i) {
    const t = i.plano.tunel;
    try {
      i.tunel = await ad.servirPorta({ nome: t.nome, protocolo: t.protocolo, porta: t.porta });
    } catch (erro) {
      await falha(i, 'tunel', erro, { nome: t.nome, protocolo: t.protocolo, porta: t.porta, ...dadosDoErro(erro) });
    }
    await contar(i, 'ligado');
  }

  function fecharTunel(i) {
    try {
      i.tunel?.fechar?.();
    } catch (erro) {
      falha(i, 'tunel', erro, { fechando: true });
    }
    i.tunel = null;
  }

  async function aoSair(i, saida) {
    const pedido = i.parando;
    i.proc = null;
    i.parando = false;
    i.jogadores = [];
    fecharTunel(i);
    for (const e of i.esperas.splice(0)) e.resolver(false);
    i.aoTerminar?.();
    i.aoTerminar = null;
    const codigo = saida?.codigo ?? null;
    if (pedido) await contar(i, 'desligado');
    else await contar(i, 'caiu', { saida: { codigo, sinal: saida?.sinal ?? null, linhas: i.linhas } });
  }

  async function ligar(i) {
    if (i.proc) return;
    if (!(await preparar(i))) return;
    const plano = i.plano;
    try {
      await escreverArquivos(i, plano);
    } catch (erro) {
      await falha(i, 'escrever', erro, dadosDoErro(erro));
      return;
    }
    i.linhas = [];
    i.jogadores = [];
    await contar(i, 'ligando');
    let proc;
    try {
      // `pasta: ''` é a pasta deste servidor de jogo.
      proc = await ad.rodar({ comando: plano.rodar.comando, argumentos: plano.rodar.argumentos, pasta: '' });
    } catch (erro) {
      await falha(i, 'rodar', erro, { comando: plano.rodar.comando, ...dadosDoErro(erro) });
      await contar(i, 'desligado');
      return;
    }
    i.proc = proc;
    proc.aoLinha(linha => aoLinha(i, String(linha)));
    proc.aoSair(saida => { aoSair(i, saida); });
  }

  /** Espera uma linha que case, ou o prazo; resolve com true ou false. */
  function esperarLinha(i, fonte, prazo) {
    return new Promise(resolver => {
      const e = { re: new RegExp(fonte), resolver };
      i.esperas.push(e);
      ad.esperar(prazo * 1000).then(() => {
        if (i.esperas.includes(e)) {
          i.esperas = i.esperas.filter(x => x !== e);
          resolver(false);
        }
      });
    });
  }

  /** Um passo de console da receita: manda a linha e, se pedir, espera a resposta. */
  async function passoDeConsole(i, passo) {
    if (!i.proc) return false;
    const espera = passo.esperar ? esperarLinha(i, passo.esperar, passo.prazo ?? 60) : null;
    i.proc.escrever(passo.console + '\n');
    return espera ? espera : true;
  }

  async function desligar(i) {
    if (!i.proc) {
      await contar(i, 'desligado');
      return;
    }
    i.parando = true;
    await contar(i, 'parando');
    const passo = i.receita.saida.parar;
    const prazo = passo.prazo ?? 60;
    const proc = i.proc;
    const saiu = new Promise(resolver => { i.aoTerminar = resolver; });
    // O jogo sai sozinho depois do stop; o prazo é o da receita.
    proc.escrever(passo.console + '\n');
    const venceu = await Promise.race([saiu.then(() => false), ad.esperar(prazo * 1000).then(() => true)]);
    if (venceu && i.proc === proc) {
      await falha(i, 'parar', 'nao-parou-no-prazo', { prazo });
      proc.encerrar();
    }
  }

  async function salvar(i) {
    if (!i.proc) {
      await falha(i, 'salvar', 'servidor-desligado');
      return;
    }
    const passos = i.receita.mundo.salvar;
    const ultimo = passos.at(-1);
    await contar(i, 'salvando');
    let falhou = null;
    let semCopia = null;
    for (const passo of passos) {
      if (passo.copiar && !ad.copiar) {
        // Sem cópia no produto ainda: o mundo foi salvo com segurança, e a
        // cópia é da reserva (parte 7). Dito, e não calado.
        semCopia = passo.copiar;
      } else if (passo.copiar) {
        try {
          await ad.copiar(passo.copiar, `copias/${passo.copiar}-${Date.now()}`);
        } catch (erro) {
          falhou = { erro: fraseDoErro(erro), dados: { passo, ...dadosDoErro(erro) } };
          break;
        }
      } else {
        const ok = await passoDeConsole(i, passo);
        if (!ok) {
          falhou = { erro: i.proc ? 'o-jogo-nao-respondeu' : 'o-jogo-saiu', dados: { passo } };
          break;
        }
      }
    }
    if (falhou) {
      // O mundo não pode ficar sem salvar automático: o último passo de
      // console (o save-on) vai mesmo assim.
      if (ultimo.console && i.proc) i.proc.escrever(ultimo.console + '\n');
      await falha(i, 'salvar', falhou.erro, falhou.dados);
    } else if (semCopia) {
      await falha(i, 'salvar', 'copia-fica-para-a-reserva', { pasta: semCopia });
    }
    if (i.proc) await contar(i, 'ligado');
  }

  async function console_(i, comando) {
    if (!i.proc) {
      await falha(i, 'console', 'servidor-desligado', { comando });
      return;
    }
    i.proc.escrever(String(comando) + '\n');
  }

  async function configurar(i) {
    const plano = await lerPlano(i);
    if (!plano) return;
    try {
      await ad.escrever(plano.arquivoDeConfig, plano.propriedades);
    } catch (erro) {
      await falha(i, 'escrever', erro, dadosDoErro(erro));
    }
  }

  // ---- a fila: um passo por vez em cada servidor de jogo ----

  function enfileirar(i, passo) {
    i.fila = i.fila.then(passo).catch(erro => falha(i, 'interno', erro, dadosDoErro(erro)));
    return i.fila;
  }

  const OPERACOES = {
    preparar: i => preparar(i),
    ligar: i => ligar(i),
    desligar: i => desligar(i),
    salvar: i => salvar(i),
    configurar: i => configurar(i),
    console: (i, carga) => console_(i, carga.comando),
  };

  ad.aoAviso((servidor, carga) => {
    const i = instancia(String(servidor));
    i.avisado = true;
    const op = OPERACOES[carga?.op];
    if (!op) {
      falha(i, 'aviso', 'aviso-desconhecido', { op: carga?.op ?? null });
      return;
    }
    // Desligar e o console não esperam o que está na fila (um download longo).
    if (carga.op === 'console') op(i, carga).catch(erro => falha(i, 'console', erro));
    else enfileirar(i, () => op(i, carga));
  });

  // **A parada da metade** (DESLIGAR, REVOGAR, o app fechando, o MOD
  // desligado): o jogo recebe `stop` e tem o prazo do produto para salvar
  // (20 s com um processo vivo); depois disso o produto o encerra. Não passa
  // pela fila: um download longo não segura a parada.
  ad.aoParar?.(async motivo => {
    const parando = [];
    for (const i of instancias.values()) {
      if (!i.proc) continue;
      ad.registrar(`${i.servidor}: parada da metade (${motivo}): stop`);
      i.parando = true;
      const saiu = new Promise(resolver => { i.aoTerminar = resolver; });
      i.proc.escrever(i.receita.saida.parar.console + '\n');
      parando.push(Promise.race([saiu, ad.esperar(PRAZO_DA_PARADA_DA_METADE)]));
    }
    await Promise.all(parando);
  });

  // **Ao subir, a máquina pergunta o plano**, em vez de esperar um aviso: o
  // aviso pode ter saído antes de esta metade estar de pé, e a metade de
  // servidor junta avisos seguidos no mais novo.
  if (ad.servidor) {
    const i = instancia(ad.servidor);
    enfileirar(i, async () => {
      const plano = await lerPlano(i);
      // Um aviso chegou enquanto o plano vinha: quem manda é ele.
      if (!plano || i.avisado) return;
      if (plano.ligar) await ligar(i);
      else await preparar(i);
    });
  }

  return { instancias };
}

// A partida: no executor, a metade de máquina sobe com o adaptador de
// verdade. Sem a API da máquina, `criarAdaptador` lança com o que falta, e o
// erro vai ao log do produto em vez de a metade ficar de pé sem fazer nada.
if (!globalThis.__testeSemPartida) criarMaquina(criarAdaptador(globalThis));
