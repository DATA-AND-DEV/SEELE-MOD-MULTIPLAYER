// ---- cliente.js: a metade de cliente ----
//
// O seletor de jogos (as receitas e os servidores de jogo que já existem, com
// o estado de cada um), a configuração de um servidor de jogo em quatro abas —
// GERAL · MODS · JOGADORES · MÁQUINA, como no desenho aprovado
// (config-layout-v2) — e o cartão de quem joga, com o «entrar».
//
// # O «entrar» é a primeira coisa do clique
//
// `SeeleUI.tunel.entrar` só vale na volta síncrona do evento `botao`: o
// prelúdio lê o bilhete de gesto na hora da chamada, e um `await` antes dela
// o perde. Por isso o ouvinte trata o `entrar:` antes de tudo, sem esperar
// nada.
//
// # Nada calado
//
// Toda recusa — da ponte, dos cargos, da metade de servidor, do túnel — fica
// na página com o nome e os dados (`estado.aviso`), ou no cartão a que ela
// pertence. Uma página que não monta é dita num aviso do produto e no log.

const COR = Object.freeze({
  fundo: '#000000', texto: '#EAEAEA', acento: '#F47732', apagado: '#8A8A8A', linha: '#252525',
  borda: '#626262', escolhido: '#331704', chip: '#2B0F05', erro: '#FF7A7A',
});

const ABAS = Object.freeze([
  { chave: 'aba-geral', rotulo: 'GERAL' },
  { chave: 'aba-mods', rotulo: 'MODS' },
  { chave: 'aba-jogadores', rotulo: 'JOGADORES' },
  { chave: 'aba-maquina', rotulo: 'MÁQUINA' },
]);

const NOME_DAS_PERMISSOES = Object.freeze({
  'criar-servidor-de-jogo': 'Criar um servidor de jogo',
  'configurar-servidor-de-jogo': 'Configurar um servidor de jogo',
  'ligar-desligar-servidor-de-jogo': 'Ligar e desligar um servidor de jogo',
  'entrar-no-jogo': 'Entrar no jogo',
});

/** A frase de cada nome de recusa que este MOD conhece. Um nome fora daqui aparece como é. */
const FRASES = Object.freeze({
  // a máquina e o jogo
  'hash-diferente': 'O hash do arquivo baixado não bate com o que a origem publica. O arquivo foi apagado.',
  'sem-java-para-esta-maquina': 'A Adoptium não publica o Java desta versão para o sistema desta máquina.',
  'o-jogo-caiu': 'O jogo parou sozinho. As últimas linhas da saída estão nos dados.',
  'nao-parou-no-prazo': 'O jogo não parou no prazo depois do stop e foi encerrado à força.',
  'o-jogo-nao-respondeu': 'O jogo não respondeu no prazo; o salvamento automático foi religado.',
  'o-jogo-saiu': 'O jogo saiu no meio do salvamento.',
  'nao-e-a-dona': 'Uma máquina que não é a dona deste servidor de jogo tentou rodá-lo, e foi mandada parar.',
  'aviso-desconhecido': 'A máquina recebeu uma ordem que ela não conhece: as versões do MOD diferem.',
  'servidor-desligado': 'O servidor de jogo está desligado.',
  // as origens
  'origem-nao-respondeu': 'A origem não respondeu.',
  'origem-ilegivel': 'A origem respondeu algo que não é o que se esperava.',
  'url-fora-das-origens': 'Uma URL de download não está nas origens da receita.',
  'versao-sem-servidor': 'Esta versão não tem servidor oficial.',
  'versao-desconhecida': 'A origem não conhece esta versão.',
  'sha1-diferente': 'O arquivo da versão não bate com o sha1 que a Mojang publica; não foi usado.',
  'manifesto-sem-sha1': 'O manifesto da Mojang não traz o sha1 desta versão; não dá para conferir.',
  // a metade de servidor
  'pede-a-acao': 'Isto só vale pela ação com permissão.',
  'acao-nao-serve': 'Esta permissão não serve para isso.',
  'desligue-antes': 'Desligue o servidor de jogo antes de trocar a versão, a máquina ou de apagá-lo.',
  'config-invalida': 'Há campos que não servem; veja cada um.',
  'servidores-demais': 'Este servidor SEELE já tem o máximo de servidores de jogo.',
  'sem-versao': 'Escolha a versão do jogo antes de ligar.',
  'sem-maquina': 'Escolha a máquina antes de ligar.',
  'comando-invalido': 'O comando é uma linha só, de até 256 bytes.',
  'oferta-recusada': 'O SEELE recusou a oferta antes de mostrá-la à pessoa da máquina.',
  'receita-desconhecida': 'Este MOD não tem essa receita.',
  'receita-invalida': 'A receita não passou no validador.',
  'variante-indisponivel': 'Essa variante ainda não existe.',
  'servidor-desconhecido': 'Esse servidor de jogo não existe mais.',
  // o aceite
  'pelo-dono': 'A pessoa da máquina disse não, ou desligou.',
  'sem-tela': 'Essa máquina não tem tela onde aceitar.',
  'so-no-app': 'Só funciona no app de computador.',
  'pacote-diferente': 'A máquina tem outra versão deste MOD.',
  'oferta-invalida': 'A oferta não passou na conferência do SEELE.',
  'nao-esta-aqui': 'A pessoa não está no servidor agora.',
  'pendentes-demais': 'Há pedidos de máquina demais esperando resposta.',
  'maquinas-demais': 'Há máquinas de jogo demais neste servidor.',
  'revogada': 'A pessoa revogou a autorização.',
  'app-fechou': 'O app da máquina fechou.',
  'metade-falhou': 'A metade de máquina do MOD falhou.',
  'saiu': 'A pessoa saiu do servidor.',
  'mod-desligado': 'O MOD foi desligado.',
  'outro-pedido': 'Outra máquina foi escolhida.',
  // o túnel
  'fora-de-um-clique': 'O SEELE só abre a porta de dentro de um clique.',
  'nao-existe': 'Nenhuma máquina serve esse jogo agora.',
  'sem-permissao': 'Você não tem a permissão para isso neste servidor.',
  'acao-nao-declarada': 'O MOD não declara essa permissão.',
  'mod-sem-porta': 'O MOD não está ligado neste servidor, ou não tem o túnel.',
  'nome-tomado': 'Outra máquina já serve um jogo com esse nome.',
  'maquina-saiu': 'A máquina do jogo saiu do servidor.',
  'tuneis-demais': 'O servidor já tem túneis demais.',
  'canais-esgotados': 'Não há canais de túnel livres para você agora.',
  'servidor-antigo': 'O servidor SEELE é antigo demais para túneis.',
  'porta-local-ocupada': 'A porta do jogo e as 64 seguintes estão ocupadas neste computador.',
  'sem-resposta': 'O servidor não respondeu a tempo.',
  'fora-do-aceite': 'A máquina não aceitou servir este jogo, ou nesta porta.',
  'tunel-indisponivel': 'Este app não abre túnel de jogo.',
  // a ponte
  'sessao-encerrada': 'A sessão acabou antes da resposta.',
  'bridge-refused': 'A metade de servidor do MOD falhou ao responder.',
  'quintal-cheio': 'O espaço do MOD no servidor acabou.',
  'too-many-requests': 'Pedidos demais de uma vez.',
  'mensagem-grande': 'A mensagem passou do teto do SEELE.',
});

const ROTULO_DO_ESTADO = Object.freeze({
  desligado: 'DESLIGADO', baixando: 'BAIXANDO', pronto: 'PRONTO PARA LIGAR', ligando: 'LIGANDO',
  ligado: 'LIGADO', parando: 'DESLIGANDO', salvando: 'SALVANDO', caiu: 'CAIU',
});

const fraseDe = erro => FRASES[erro] ?? '';

// ---------------------------------------------------------------- as formas

/**
 * As classes da página: o estilo que se repete vai uma vez, na superfície, e
 * cada nó só diz o nome. Com o estilo escrito em cada nó, oito cartões
 * passavam dos 12 KiB de uma montagem.
 */
const CLASSES = Object.freeze({
  lb: { base: { familia: 'mono', corpo: 11, cor: COR.apagado, espacamento: 1, transformar: 'maiuscula' } },
  ap: { base: { cor: COR.apagado, corpo: 14, entrelinha: 1.4 } },
  mono: { base: { familia: 'mono', corpo: 12, cor: COR.apagado } },
  chip: { base: { familia: 'mono', corpo: 11, fundo: COR.chip, cor: COR.acento, raio: 4, preenchimento: 4 } },
  cheio: { base: { fundo: COR.acento, cor: COR.fundo, raio: 6, preenchimento: 10, borda: { largura: 1, estilo: 'solida', cor: COR.acento } } },
  vazado: { base: { cor: COR.acento, raio: 6, preenchimento: 10, borda: { largura: 1, estilo: 'solida', cor: COR.acento } } },
  cartao: { base: { borda: { largura: 1, estilo: 'solida', cor: COR.linha }, raio: 6, preenchimento: 16 } },
  aceso: { base: { borda: { largura: 1, estilo: 'solida', cor: COR.acento }, raio: 6, preenchimento: 16 } },
  quadro: { base: { fundo: COR.chip, raio: 6, preenchimento: 12, borda: { largura: 1, estilo: 'solida', cor: COR.acento } } },
  erro: { base: { familia: 'mono', corpo: 13, cor: COR.acento } },
  grande: { base: { corpo: 20 } },
  acento: { base: { corpo: 22, espacamento: 1, cor: COR.acento } },
});

const lb = (texto, chave) => ({ forma: 'texto', ...(chave ? { chave } : {}), dentro: String(texto).toUpperCase(), classe: 'lb' });
const tx = (texto, estilo, extra) => ({ forma: 'texto', dentro: String(texto), ...(estilo ? { estilo } : {}), ...extra });
const cl = (texto, classe, extra) => ({ forma: 'texto', dentro: String(texto), classe, ...extra });
const apagado = (texto, extra) => cl(texto, 'ap', extra);
const mono = (texto, extra) => cl(texto, 'mono', extra);
const pilha = (dentro, intervalo = 8, extra) => ({ forma: 'pilha', dentro: dentro.filter(Boolean), estilo: { intervalo }, ...extra });
const linhaH = (dentro, extra) => ({ forma: 'linha', dentro: dentro.filter(Boolean), estilo: { intervalo: 10, alinhar: 'centro', quebra: 'sim' }, ...extra });
const bloco = (rotulo, dentro, extra) => pilha([lb(rotulo), ...dentro], 8, extra);
const separador = () => ({ forma: 'separador', estilo: { cor: COR.linha } });
const chip = (texto, chave) => ({ forma: 'distintivo', ...(chave ? { chave } : {}), dentro: String(texto).toUpperCase(), classe: 'chip' });
const botao = (chave, dentro, extra = {}) => ({ forma: 'botao', chave, dentro, ...extra });

/** O quadro de recusa, com o nome, a frase e os dados. */
function quadroDeFalha(f, chave) {
  const dados = !estado.enxuta && f.dados && Object.keys(f.dados).length ? cortar(JSON.stringify(f.dados), 240) : '';
  return {
    forma: 'caixa', ...(chave ? { chave } : {}), classe: 'quadro',
    dentro: [pilha([
      cl(f.erro, 'erro'),
      fraseDe(f.erro) ? tx(fraseDe(f.erro), { corpo: 14 }) : null,
      dados ? mono(dados) : null,
    ], 4)],
  };
}

// ---------------------------------------------------------------- o estado

const estado = {
  aberta: false, punho: null, dados: null, retrato: null,
  vista: 'seletor', atual: null, aba: 'aba-geral',
  rascunho: null, erros: {}, aviso: null, versoes: {},
  portas: {}, entradas: {}, consoleTexto: '', situacao: null,
  // A página passou do teto de uma montagem: o resumo, sem os dados longos.
  enxuta: false,
};

const pode = acao => Boolean(estado.dados?.podem?.includes(acao));
const servidorAtual = () => estado.dados?.servidores.find(s => s.id === estado.atual) ?? null;
const apelidoDe = quem => {
  const p = estado.retrato?.pessoas?.find(x => String(x.id) === String(quem));
  return p ? p.apelido : quem ? `a pessoa ${quem}` : null;
};

/** O que a ponte, os cargos ou a metade de servidor recusaram, na forma do aviso. */
function recusaDe(resposta, onde) {
  if (resposta && resposta.ok === false) {
    const erro = resposta.erro ?? resposta.recusa ?? resposta.error ?? 'falhou';
    const dados = {};
    for (const [k, v] of Object.entries(resposta)) if (!['ok', 'erro', 'recusa', 'error', 'servidor'].includes(k)) dados[k] = v;
    return { erro, onde, dados };
  }
  return null;
}

async function pedir(valor) {
  try {
    return await SeeleMods.request(EU, 0, valor);
  } catch (erro) {
    return { ok: false, erro: erro?.erro ?? fraseDoErro(erro), ...dadosDoErro(erro) };
  }
}

async function agir(acao, valor) {
  try {
    return await SeeleMods.acao(EU, 0, acao, valor);
  } catch (erro) {
    return { ok: false, erro: erro?.erro ?? fraseDoErro(erro), ...dadosDoErro(erro) };
  }
}

function avisar(falha) {
  estado.aviso = falha;
  console.warn(`multiplayer: ${falha.onde}: ${falha.erro} ${JSON.stringify(falha.dados ?? {})}`);
}

async function carregar() {
  const r = await pedir({ op: 'estado' });
  const recusa = recusaDe(r, 'estado');
  if (recusa) {
    avisar(recusa);
    return;
  }
  if (!r || r.ok !== true) {
    avisar({ erro: 'resposta-estranha', onde: 'estado', dados: { resposta: cortar(JSON.stringify(r), 200) } });
    return;
  }
  estado.dados = r;
  const s = servidorAtual();
  if (estado.vista === 'config' && !s) {
    estado.vista = 'seletor';
    estado.atual = null;
  }
}

async function carregarVersoes(receita) {
  const r = await pedir({ op: 'versoes', receita });
  estado.versoes[receita] = r && r.ok ? r.versoes : { falha: recusaDe(r, 'versoes') ?? { erro: 'resposta-estranha', onde: 'versoes', dados: {} } };
  if (estado.rascunho && estado.rascunho.versao === null && Array.isArray(estado.versoes[receita])) {
    estado.rascunho.versao = estado.versoes[receita][0] ?? null;
  }
}

function rascunhoDe(s) {
  return { versao: s.versao, quem: s.quem, config: { ...s.config }, variante: s.variante ?? 'vanilla' };
}

async function abrirConfig(id) {
  estado.vista = 'config';
  estado.atual = id;
  estado.aba = 'aba-geral';
  estado.erros = {};
  estado.situacao = null;
  const s = servidorAtual();
  if (!s) return;
  estado.rascunho = rascunhoDe(s);
  if (!estado.versoes[s.receita] || estado.versoes[s.receita].falha) await carregarVersoes(s.receita);
  else if (estado.rascunho.versao === null) estado.rascunho.versao = estado.versoes[s.receita][0] ?? null;
}

// ---------------------------------------------------------------- o entrar

/** Chamado na volta síncrona do clique: o túnel antes de qualquer espera. */
function entrar(id) {
  let promessa;
  try {
    promessa = SeeleUI.tunel.entrar(id);
  } catch (erro) {
    promessa = Promise.reject(SeeleUI.tunel ? erro : { erro: 'tunel-indisponivel' });
  }
  Promise.resolve(promessa).then(
    porta => {
      estado.portas[id] = porta;
      delete estado.entradas[id];
    },
    erro => {
      estado.entradas[id] = { erro: erro?.erro ?? fraseDoErro(erro), onde: 'entrar', dados: dadosDoErro(erro) };
      console.warn(`multiplayer: entrar em ${id}: ${estado.entradas[id].erro}`);
    },
  ).then(pintar);
}

// ---------------------------------------------------------------- os eventos

async function aposAcao(r, onde) {
  const recusa = recusaDe(r, onde);
  if (recusa) avisar(recusa);
  else estado.aviso = null;
  await carregar();
  return !recusa;
}

async function salvar() {
  const s = servidorAtual();
  if (!s || !estado.rascunho) return;
  const r = await agir('configurar-servidor-de-jogo', {
    op: 'configurar', id: s.id, versao: estado.rascunho.versao, quem: estado.rascunho.quem, config: estado.rascunho.config,
  });
  if (r?.ok === false && r.erro === 'config-invalida') {
    estado.erros = r.erros ?? {};
    avisar({ erro: 'config-invalida', onde: 'salvar', dados: {} });
    return;
  }
  estado.erros = {};
  if (await aposAcao(r, 'salvar')) {
    const novo = servidorAtual();
    if (novo) estado.rascunho = rascunhoDe(novo);
  }
}

async function ligarOuDesligar(id, ligar) {
  const r = await agir('ligar-desligar-servidor-de-jogo', { op: ligar ? 'ligar' : 'desligar', id });
  estado.situacao = r?.ok && r.esperando === 'aceite' ? 'Liga assim que a pessoa da máquina aceitar: esperando o aceite.' : null;
  await aposAcao(r, ligar ? 'ligar' : 'desligar');
}

async function tratarBotao(chave) {
  const [nome, id] = chave.split(/:(.*)/s);
  if (chave === 'voltar') {
    estado.vista = 'seletor';
    estado.atual = null;
    estado.aviso = null;
  } else if (chave === 'fechar-aviso') {
    estado.aviso = null;
  } else if (nome === 'criar') {
    const r = await agir('criar-servidor-de-jogo', { op: 'criar', receita: id });
    if (await aposAcao(r, 'criar')) await abrirConfig(r.servidor.id);
  } else if (nome === 'configurar') {
    estado.aviso = null;
    await abrirConfig(id);
  } else if (nome === 'variante') {
    const s = servidorAtual();
    const v = receitaPorId(s?.receita)?.variantes[id];
    if (v && v.disponivel !== false && estado.rascunho) estado.rascunho.variante = id;
    else avisar({ erro: 'variante-indisponivel', onde: 'variante', dados: { variante: id, porque: v?.porque ?? null } });
  } else if (chave === 'salvar') {
    await salvar();
  } else if (chave === 'ligar' || chave === 'desligar') {
    await ligarOuDesligar(estado.atual, chave === 'ligar');
  } else if (nome === 'ligar' || nome === 'desligar') {
    await ligarOuDesligar(id, nome === 'ligar');
  } else if (chave === 'apagar') {
    const r = await agir('criar-servidor-de-jogo', { op: 'apagar', id: estado.atual });
    if (await aposAcao(r, 'apagar')) {
      estado.vista = 'seletor';
      estado.atual = null;
    }
  } else if (chave === 'console:enviar') {
    const r = await agir('configurar-servidor-de-jogo', { op: 'console', id: estado.atual, comando: estado.consoleTexto });
    if (await aposAcao(r, 'console')) estado.consoleTexto = '';
  } else {
    avisar({ erro: 'botao-desconhecido', onde: 'tela', dados: { chave } });
  }
}

function tratarCampo(evento) {
  const { chave, valor } = evento;
  if (chave === 'console:texto') {
    estado.consoleTexto = String(valor ?? '');
    return false;
  }
  if (!estado.rascunho) return false;
  if (chave === 'versao') estado.rascunho.versao = valor || null;
  else if (chave === 'quem') estado.rascunho.quem = valor ? String(valor) : null;
  else if (chave.startsWith('cfg:')) {
    estado.rascunho.config[chave.slice(4)] = valor;
    delete estado.erros[chave.slice(4)];
  } else return false;
  // Só a amostra da cor muda o desenho; o resto o produto já mostra.
  return chave === 'cfg:cor' || chave === 'quem';
}

async function tratar(evento) {
  if (evento.nome === 'acao' && evento.acao === 'abrir-multiplayer') {
    if (!estado.punho) {
      estado.punho = await SeeleUI.superficies.criar({ id: 'multiplayer', tipo: 'pagina', titulo: 'Multiplayer' });
      // Recusadas, as classes que serviram valem e a página abre do mesmo
      // jeito, mais crua; a recusa é dita.
      try {
        await estado.punho.classes(CLASSES);
      } catch (erro) {
        avisar({ erro: erro?.erro ?? fraseDoErro(erro), onde: 'classes', dados: dadosDoErro(erro) });
      }
    } else {
      await estado.punho.mostrar();
    }
    estado.aberta = true;
    if (!estado.retrato) estado.retrato = await SeeleUI.retrato();
    await carregar();
  } else if (evento.nome === 'servidor') {
    if (!estado.aberta) return;
    await carregar();
  } else if (evento.nome === 'pessoas') {
    estado.retrato = await SeeleUI.retrato();
  } else if (evento.nome === 'fechar' && evento.superficie === 'multiplayer') {
    estado.aberta = false;
    return;
  } else if (evento.nome === 'aba' && evento.chave === 'aba') {
    estado.aba = evento.valor;
  } else if (evento.nome === 'botao') {
    await tratarBotao(String(evento.chave ?? ''));
  } else if (['campo', 'escolha', 'numero', 'marca', 'cor'].includes(evento.nome)) {
    if (!tratarCampo(evento)) return;
  } else {
    return;
  }
  await pintar();
}

SeeleUI.aoEvento(evento => {
  // O túnel primeiro, sem nenhum `await` antes: o bilhete do clique vale só agora.
  if (evento.nome === 'botao' && String(evento.chave).startsWith('entrar:')) {
    entrar(String(evento.chave).slice('entrar:'.length));
    return;
  }
  tratar(evento).catch(erro => {
    avisar({ erro: erro?.erro ?? fraseDoErro(erro), onde: 'tela', dados: dadosDoErro(erro) });
    pintar();
  });
});

// ---------------------------------------------------------------- o desenho

/** Um controle da receita, com o valor do rascunho, o gravado como inicial e a frase do servidor. */
function controle(campo, s) {
  const chave = 'cfg:' + campo.chave;
  const valor = estado.rascunho?.config[campo.chave] ?? campo.padrao;
  const inicial = s.config?.[campo.chave] ?? campo.padrao;
  const desligado = !pode('configurar-servidor-de-jogo');
  const comum = { chave, rotulo: campo.rotulo, desligado, ...(estado.erros[campo.chave] ? { erro: estado.erros[campo.chave] } : {}) };
  let no;
  if (campo.forma === 'campo') no = { forma: 'campo', ...comum, valor: String(valor), inicial: String(inicial), ...(campo.tamanhoMaximo ? { tamanhoMaximo: campo.tamanhoMaximo } : {}), ...(campo.obrigatorio ? { obrigatorio: true } : {}) };
  else if (campo.forma === 'numero') no = { forma: 'numero', ...comum, valor, inicial, minimo: campo.minimo, maximo: campo.maximo, inteiro: true };
  else if (campo.forma === 'escolha') no = { forma: 'escolha', ...comum, valor: String(valor), inicial: String(inicial), opcoes: campo.opcoes.map(o => ({ valor: o.valor, dentro: o.rotulo })) };
  else no = { forma: 'interruptor', ...comum, valor: valor === true, inicial: inicial === true };
  const amostra = campo.forma === 'escolha' ? campo.opcoes.find(o => o.valor === valor)?.amostra : null;
  return pilha([
    no,
    amostra ? tx('■ ' + (campo.opcoes.find(o => o.valor === valor)?.rotulo ?? ''), { cor: amostra, corpo: 14 }, { chave: 'amostra:' + campo.chave }) : null,
    campo.ajuda ? apagado(campo.ajuda) : null,
  ], 6);
}

/** Os campos de uma aba, na ordem da receita, com os de um mesmo grupo lado a lado. */
function camposDaAba(receita, s, aba) {
  const campos = receita.configuracao.campos.filter(c => c.aba === aba);
  const blocos = [];
  const vistos = new Set();
  for (const campo of campos) {
    if (campo.grupo) {
      if (vistos.has(campo.grupo)) continue;
      vistos.add(campo.grupo);
      const doGrupo = campos.filter(c => c.grupo === campo.grupo);
      blocos.push({ forma: 'grade', chave: 'grupo:' + campo.grupo, estilo: { colunas: doGrupo.length, intervalo: 20 }, dentro: doGrupo.map(c => controle(c, s)) });
    } else {
      blocos.push(controle(campo, s));
    }
  }
  return blocos;
}

function rotuloDoEstado(s) {
  if (s.estado === 'baixando' && s.progresso) return `BAIXANDO ${s.progresso.feitos}/${s.progresso.total}`;
  return ROTULO_DO_ESTADO[s.estado] ?? String(s.estado).toUpperCase();
}

function rotuloDoAceite(s) {
  const quem = apelidoDe(s.quem);
  if (s.aceite === 'sem-maquina') return 'NENHUMA MÁQUINA';
  if (s.aceite === 'sem-versao') return 'ESCOLHA A VERSÃO';
  if (s.aceite === 'esperando') return `ESPERANDO O ACEITE DE ${quem}`;
  if (s.aceite === 'aceito') return 'ACEITO';
  if (s.aceite === 'recusado') return `RECUSADO: ${s.motivo ?? ''}`;
  if (s.aceite === 'parado') return `PARADO: ${s.motivo ?? ''}`;
  return String(s.aceite);
}

function rodaEm(s) {
  const quem = apelidoDe(s.quem);
  return bloco('Roda em', [linhaH([
    tx(quem ? `Máquina de ${quem}` : 'Nenhuma máquina escolhida'),
    chip(rotuloDoAceite(s), 'chip-aceite'),
  ])], { chave: 'roda-em' });
}

function situacao(s) {
  const linhas = [];
  if (estado.situacao) linhas.push(estado.situacao);
  else if (s.ligar && s.aceite === 'esperando') linhas.push('Liga assim que a pessoa da máquina aceitar: esperando o aceite.');
  if (s.precisaReiniciar) linhas.push('A configuração nova vale quando o servidor reiniciar.');
  if (s.falhas.length) linhas.push(`${s.falhas.length} falha(s) registrada(s): veja a aba MÁQUINA.`);
  return pilha([
    linhaH([lb('Estado'), chip(rotuloDoEstado(s))]),
    ...linhas.map(l => apagado(l)),
  ], 6, { chave: 'situacao' });
}

function opcaoDeVariante(receita, s, chave) {
  const v = receita.variantes[chave];
  if (!v) return null;
  const escolhida = (estado.rascunho?.variante ?? s.variante ?? 'vanilla') === chave;
  const indisponivel = v.disponivel === false;
  return botao('variante:' + chave, [pilha([
    tx(v.nome, { corpo: 20, peso: 'forte', cor: escolhida ? COR.acento : COR.texto }),
    tx(v.descricao, { corpo: 14, cor: COR.apagado, entrelinha: 1.4 }),
    indisponivel && v.porque ? tx(v.porque, { familia: 'mono', corpo: 11, cor: COR.acento }) : null,
  ], 6)], {
    desligado: indisponivel || !pode('configurar-servidor-de-jogo'),
    estilo: {
      borda: { largura: 1, estilo: 'solida', cor: escolhida ? COR.acento : COR.borda },
      fundo: escolhida ? COR.escolhido : COR.fundo, raio: 6, preenchimento: 20, alinhamento: 'esquerda',
    },
  });
}

function escolhaDeVersao(receita, s) {
  const versoes = estado.versoes[receita.id];
  if (!versoes) return bloco('Versão do jogo', [apagado('Lendo as versões…')]);
  if (versoes.falha) return bloco('Versão do jogo', [quadroDeFalha(versoes.falha, 'falha-versoes')]);
  const atual = estado.rascunho?.versao ?? '';
  const lista = atual && !versoes.includes(atual) ? [atual, ...versoes] : versoes;
  return bloco('Versão do jogo', [{
    forma: 'escolha', chave: 'versao', rotulo: 'Versão', valor: atual, inicial: s.versao ?? '',
    desligado: !pode('configurar-servidor-de-jogo'),
    opcoes: lista.map(v => ({ valor: v, dentro: v })),
  }, apagado('Trocar a versão pede o aceite de novo na máquina do jogo.')]);
}

function botoesDaConfig(s) {
  const rodando = ['ligando', 'ligado', 'parando', 'salvando'].includes(s.estado) || s.ligar;
  return {
    forma: 'acoes', chave: 'botoes',
    dentro: [
      botao('salvar', 'SALVAR', { variante: 'primaria', desligado: !pode('configurar-servidor-de-jogo'), classe: 'cheio' }),
      rodando
        ? botao('desligar', 'DESLIGAR SERVIDOR', { variante: 'secundaria', desligado: !pode('ligar-desligar-servidor-de-jogo'), classe: 'vazado' })
        : botao('ligar', 'LIGAR SERVIDOR', { variante: 'secundaria', desligado: !pode('ligar-desligar-servidor-de-jogo'), classe: 'vazado' }),
      pode('criar-servidor-de-jogo')
        ? botao('apagar', 'APAGAR', { variante: 'perigo', desligado: rodando, confirmar: 'Apagar este servidor de jogo? A configuração some; os arquivos na máquina ficam.' })
        : null,
    ].filter(Boolean),
  };
}

function abaGeral(receita, s) {
  return pilha([
    { forma: 'grade', chave: 'variantes', estilo: { colunas: 2, intervalo: 16 }, dentro: ['vanilla', 'com-mods'].map(v => opcaoDeVariante(receita, s, v)).filter(Boolean) },
    escolhaDeVersao(receita, s),
    separador(),
    ...camposDaAba(receita, s, 'geral'),
    pilha([
      { forma: 'interruptor', chave: 'so-seele', rotulo: 'Só entra quem está neste servidor SEELE', valor: true, inicial: true, desligado: true },
      apagado('O jogo só escuta no túnel do SEELE, nesta versão: sempre ligado.'),
    ], 6),
    separador(),
    rodaEm(s),
    situacao(s),
    botoesDaConfig(s),
  ], 32);
}

function abaMods() {
  return pilha([
    tx('Com mods chega na próxima versão.', { corpo: 20, cor: COR.acento }),
    apagado('Nesta versão o servidor é Vanilla: o Minecraft puro, na versão que você escolher. O modpack do Modrinth, por link ou pelo arquivo .mrpack, vem na próxima.'),
  ], 12);
}

function abaJogadores(receita, s) {
  const dentro = s.jogadores ?? [];
  return pilha([
    bloco('Quem está dentro', [
      tx(`${dentro.length} de ${s.maximo ?? '?'}`, { corpo: 20 }),
      dentro.length
        ? { forma: 'lista', chave: 'jogadores', dentro: dentro.slice(0, 40).map(j => ({ forma: 'item', dentro: j })) }
        : apagado(s.estado === 'ligado' ? 'Ninguém agora.' : 'O servidor não está ligado.'),
    ], { chave: 'quem-esta' }),
    separador(),
    ...camposDaAba(receita, s, 'jogadores'),
    botoesDaConfig(s),
  ], 32);
}

function gib(bytes) {
  return (bytes / (1024 ** 3)).toFixed(1).replace('.', ',') + ' GiB';
}

function abaMaquina(receita, s) {
  const pessoas = estado.retrato?.pessoas ?? [];
  const opcoes = [{ valor: '', dentro: 'Nenhuma máquina' }, ...pessoas.slice(0, estado.enxuta ? 12 : 48).map(p => ({ valor: String(p.id), dentro: `Máquina de ${p.apelido}` }))];
  const quem = estado.rascunho?.quem ?? '';
  if (quem && !opcoes.some(o => o.valor === quem)) opcoes.push({ valor: quem, dentro: `Máquina de ${apelidoDe(quem)}` });
  const ligado = s.estado === 'ligado';
  return pilha([
    bloco('Escolher a máquina', [
      { forma: 'escolha', chave: 'quem', rotulo: 'Quem roda este servidor de jogo', valor: quem, inicial: s.quem ?? '', opcoes, desligado: !pode('configurar-servidor-de-jogo') },
      apagado('A pessoa aceita no SEELE dela antes de qualquer coisa ser baixada, e pode desligar a qualquer momento. Uma máquina por vez: trocar pede o servidor desligado.'),
    ]),
    rodaEm(s),
    bloco('O que roda', [
      mono(`${receita.rodar.comando} ${receita.rodar.argumentos.join(' ')}`),
      apagado(`Baixa ${receita.artefatos.map(a => a.destino === 'server.jar' ? 'o server.jar oficial' : a.fonte === 'adoptium' ? 'o Java da Adoptium para o sistema da máquina' : a.destino).join(' e ')}, cada um conferido pelo hash, só de: ${receita.origens.join(', ')}.`),
      s.disco ? apagado(`Disco: até ${gib(s.disco)}, contando o mundo.`) : null,
      Object.keys(s.substituidas ?? {}).length ? apagado(`Sem Java desta versão para ${Object.keys(s.substituidas).join(', ')}: usa o de ${Object.values(s.substituidas).join(', ')}.`) : null,
      (s.semJava ?? []).length ? tx(`Sem Java desta versão para: ${s.semJava.join(', ')}.`, { cor: COR.erro, corpo: 14 }) : null,
    ], { chave: 'o-que-roda' }),
    situacao(s),
    ligado && pode('configurar-servidor-de-jogo')
      ? bloco('Console', [
        linhaH([
          { forma: 'campo', chave: 'console:texto', rotulo: 'Comando', valor: estado.consoleTexto, inicial: estado.consoleTexto, tamanhoMaximo: 256 },
          botao('console:enviar', 'ENVIAR', { classe: 'vazado' }),
        ]),
      ])
      : null,
    s.linhas?.length && !estado.enxuta ? bloco('Últimas linhas', [{ forma: 'pilha', chave: 'linhas', estilo: { intervalo: 2 }, dentro: s.linhas.map(l => mono(l)) }]) : null,
    s.falhas?.length
      ? bloco('O que deu errado', s.falhas.slice().reverse().map((f, i) => pilha([
        mono(`${hora(f.quando)} · ${f.onde}${f.etapa ? '/' + f.etapa : ''}`),
        quadroDeFalha(f, 'falha:' + i),
      ], 4)), { chave: 'falhas' })
      : null,
    botoesDaConfig(s),
  ], 32);
}

function hora(segundos) {
  const d = new Date(Number(segundos) * 1000);
  return Number.isFinite(d.getTime()) ? `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : '--:--';
}

function vistaConfig() {
  const s = servidorAtual();
  const receita = receitaPorId(s.receita);
  const nome = estado.rascunho?.config?.nome ?? s.config?.nome ?? s.id;
  const conteudo = {
    'aba-geral': () => abaGeral(receita, s),
    'aba-mods': () => abaMods(),
    'aba-jogadores': () => abaJogadores(receita, s),
    'aba-maquina': () => abaMaquina(receita, s),
  };
  const aberta = conteudo[estado.aba] ? estado.aba : 'aba-geral';
  return [
    linhaH([botao('voltar', '← SERVIDORES DE JOGO', { variante: 'discreta' })]),
    cl(`${receita.nome} · ${nome}`.toUpperCase(), 'acento', { chave: 'titulo' }),
    estado.aviso ? avisoDaPagina() : null,
    {
      forma: 'abas', chave: 'aba', valor: aberta,
      dentro: ABAS.map(a => ({ forma: 'aba', chave: a.chave, rotulo: a.rotulo, dentro: a.chave === aberta ? [conteudo[a.chave]()] : [] })),
    },
  ];
}

function avisoDaPagina() {
  return pilha([
    quadroDeFalha(estado.aviso),
    linhaH([botao('fechar-aviso', 'ENTENDI', { variante: 'discreta' })]),
  ], 6, { chave: 'aviso' });
}

function cartao(s) {
  const receita = receitaPorId(s.receita);
  const ligado = s.estado === 'ligado';
  const porta = estado.portas[s.id];
  const recusa = estado.entradas[s.id];
  const configura = pode('configurar-servidor-de-jogo') || pode('ligar-desligar-servidor-de-jogo') || pode('criar-servidor-de-jogo');
  return {
    forma: 'caixa', chave: 'cartao:' + s.id,
    classe: ligado ? 'aceso' : 'cartao',
    dentro: [pilha([
      linhaH([
        cl(receita?.icone ?? '?', 'erro'),
        cl(s.config?.nome ?? s.id, 'grande'),
        chip(rotuloDoEstado(s)),
      ]),
      apagado(`${receita?.nome ?? s.receita} ${s.versao ?? '(sem versão)'} · ${s.quem ? 'na máquina de ' + apelidoDe(s.quem) : 'sem máquina'}`),
      tx(`${(s.jogadores ?? []).length} de ${s.maximo ?? '?'} jogando`, { corpo: 14 }),
      porta ? pilha([
        tx(`localhost:${porta}`, { familia: 'mono', corpo: 20, cor: COR.acento }),
        apagado(`No ${receita?.nome ?? 'jogo'}: Multijogador, Conexão direta, e este endereço.${porta !== s.porta && s.porta ? ' A porta é outra porque a do jogo estava ocupada neste computador.' : ''}`),
      ], 4) : null,
      recusa ? quadroDeFalha(recusa) : null,
      configura && s.falhas?.length ? apagado(`Última falha: ${s.falhas.at(-1).erro}`) : null,
      {
        forma: 'acoes',
        dentro: [
          botao('entrar:' + s.id, 'ENTRAR', { desligado: !ligado || !pode('entrar-no-jogo'), classe: 'cheio' }),
          configura ? botao('configurar:' + s.id, 'CONFIGURAR', { classe: 'vazado' }) : null,
        ].filter(Boolean),
      },
      !pode('entrar-no-jogo') ? apagado(`Só quem tem a permissão «${NOME_DAS_PERMISSOES['entrar-no-jogo']}» entra.`) : null,
    ], 8)],
  };
}

function vistaSeletor() {
  const dados = estado.dados;
  const servidores = dados?.servidores ?? [];
  const criar = pode('criar-servidor-de-jogo');
  return [
    cl('MULTIPLAYER', 'acento', { chave: 'titulo' }),
    estado.aviso ? avisoDaPagina() : null,
    !dados ? apagado('Lendo os servidores de jogo…') : null,
    servidores.length ? bloco('Servidores de jogo', servidores.map(cartao)) : null,
    dados ? bloco('Criar um servidor', [{
      forma: 'grade', estilo: { colunas: 2, intervalo: 16 },
      dentro: dados.receitas.map(r => ({
        forma: 'caixa', chave: 'receita:' + r.id,
        classe: 'cartao',
        dentro: [pilha([
          linhaH([cl(r.icone, 'erro'), tx(r.nome, { corpo: 20, peso: 'forte' })]),
          r.edicao ? apagado(r.edicao) : null,
          apagado(r.descricao),
          r.valida ? null : quadroDeFalha({ erro: 'receita-invalida', dados: { erros: r.erros } }),
          botao('criar:' + r.id, 'CRIAR', { desligado: !criar || !r.valida, classe: 'cheio' }),
          criar ? null : apagado(`Só quem tem a permissão «${NOME_DAS_PERMISSOES['criar-servidor-de-jogo']}» cria um servidor.`),
        ], 8)],
      })),
    }]) : null,
  ];
}

let pintando = Promise.resolve();

function montarRaiz() {
  const conteudo = estado.vista === 'config' && servidorAtual() ? vistaConfig() : vistaSeletor();
  if (estado.enxuta) conteudo.splice(1, 0, apagado('A página passou do tamanho que o SEELE monta de uma vez: este é o resumo, sem as linhas e os dados das falhas.', { chave: 'resumo' }));
  return {
    forma: 'caixa', chave: 'raiz',
    estilo: { fundo: COR.fundo, cor: COR.texto, familia: 'sans', corpo: 16, borda: { largura: 1, estilo: 'solida', cor: COR.linha }, raio: 6, preenchimento: 32 },
    dentro: [pilha(conteudo, 32)],
  };
}

/** Monta a página inteira; uma montagem por vez. */
function pintar() {
  pintando = pintando.then(async () => {
    if (!estado.aberta || !estado.punho) return;
    estado.enxuta = false;
    try {
      await estado.punho.montar([montarRaiz()]);
    } catch (erro) {
      const nome = erro?.erro ?? fraseDoErro(erro);
      if (nome === 'mensagem-grande' && !estado.enxuta) {
        // Grande demais para uma montagem: o resumo, e a página diz que é resumo.
        estado.enxuta = true;
        try {
          await estado.punho.montar([montarRaiz()]);
          return;
        } catch (segundo) {
          erro = segundo;
        }
      }
      const nomeFinal = erro?.erro ?? fraseDoErro(erro);
      console.error(`multiplayer: a página não montou inteira: ${nomeFinal} ${JSON.stringify(dadosDoErro(erro))}`);
      try {
        await SeeleUI.superficies.avisar(`O multiplayer não montou a página inteira: ${nomeFinal}`, 'erro');
      } catch (e) {
        console.error('multiplayer: nem o aviso saiu: ' + fraseDoErro(e));
      }
    }
  });
  return pintando;
}

// ---------------------------------------------------------------- a partida

SeeleUI.contribuicoes.registrar({
  ponto: 'servidor.navegacao',
  modo: 'adicionar',
  rotulo: 'Multiplayer',
  acaoPrincipal: 'abrir-multiplayer',
}).catch(falha => console.error(`multiplayer: a entrada na navegação não entrou: ${falha?.erro ?? fraseDoErro(falha)}`));
