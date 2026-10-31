// ---- servidor.js: a metade de servidor ----
//
// Guarda a lista de servidores de jogo e a configuração de cada um, quem roda
// onde, e a regra de uma máquina por vez. Fala com a máquina pelo
// `mundo.maquinas` da API 8, e com as janelas pelo `mundo.avisar`.
//
// # Quem pode o quê
//
// Toda mudança é uma ação declarada no manifesto, e quem decide se a pessoa a
// tem é o anfitrião (os cargos), antes de chamar este código. Aqui só se
// confere que a ação que o **anfitrião** escreveu em `contexto.acao` é a da
// operação pedida: um pedido comum com o corpo falsificado não muda nada, e a
// ação de entrar no jogo não liga servidor nenhum.
//
// # Nada calado
//
// Toda recusa volta com o nome e com os dados (`{ ok: false, erro, ... }`), e
// toda falha que acontece longe de quem pediu — a recusa da máquina, o hash
// que não bateu, o jogo que caiu — fica no servidor de jogo, em `falhas`, que
// a tela mostra, e no log de quem hospeda.

const TETO_DE_SERVIDORES = 8;
const TETO_DE_FALHAS = 6;
const TETO_DE_LINHAS = 8;
const VALIDADE_DAS_VERSOES = 3600;
/** O teto de `mundo.buscarPack` (o de `mundo.buscar`): um pack maior vai pelo envio. */
const TETO_DO_PACK_PELO_LINK = 4 * 1024 * 1024;
/** Quanto uma espera de envio do pack vale, em segundos (o teto do produto é 600). */
const PRAZO_DO_ENVIO = 600;

/** A ação que cada operação de mudança pede. As outras são leitura. */
const ACAO_DA_OP = Object.freeze({
  criar: 'criar-servidor-de-jogo',
  apagar: 'criar-servidor-de-jogo',
  configurar: 'configurar-servidor-de-jogo',
  console: 'configurar-servidor-de-jogo',
  // O modpack (parte 6): escolher o pack muda o que roda, como a versão.
  'pack-link': 'configurar-servidor-de-jogo',
  'pack-enviar': 'configurar-servidor-de-jogo',
  'pack-chegou': 'configurar-servidor-de-jogo',
  ligar: 'ligar-desligar-servidor-de-jogo',
  desligar: 'ligar-desligar-servidor-de-jogo',
});

/** Os estados em que o processo do jogo está de pé, ou a caminho. */
const RODANDO = new Set(['ligando', 'ligado', 'parando', 'salvando']);
const ESTADOS_DA_MAQUINA = new Set(['desligado', 'baixando', 'instalando', 'pronto', 'ligando', 'ligado', 'parando', 'salvando', 'caiu']);

// ---------------------------------------------------------------- o quintal

function lerServidores() {
  const lido = lerJson(dados.servidores);
  return lido && typeof lido === 'object' ? lido : {};
}

function gravarServidores(servidores) {
  dados.servidores = JSON.stringify(servidores);
  dados.revisao = String(Number(dados.revisao ?? '0') + 1);
  mundo.avisar({ carga: { revisao: Number(dados.revisao) } });
}

/** Uma falha no servidor de jogo, que a tela mostra com os dados, e no log. */
function anotarFalha(s, onde, erro, extra = {}) {
  const falha = { quando: mundo.agora(), onde, ...extra, erro: String(erro) };
  s.falhas = [...(s.falhas ?? []), falha].slice(-TETO_DE_FALHAS);
  mundo.registrar(`${s.id}: ${onde}: ${erro} ${JSON.stringify(extra)}`);
}

/** O que a tela de cada pessoa recebe de um servidor de jogo. */
function publico(s) {
  const receita = receitaPorId(s.receita);
  return {
    id: s.id,
    receita: s.receita,
    variante: s.variante,
    versao: s.versao,
    config: s.config,
    quem: s.quem,
    porta: s.porta,
    aceite: s.aceite,
    motivo: s.motivo ?? null,
    ligar: s.ligar,
    estado: s.estado,
    progresso: s.progresso ?? null,
    jogadores: s.jogadores ?? [],
    maximo: s.config?.maximo ?? null,
    falhas: s.falhas ?? [],
    linhas: s.linhas ?? [],
    precisaReiniciar: Boolean(s.precisaReiniciar),
    semJava: s.resolvido?.semJava ?? [],
    substituidas: s.resolvido?.substituidas ?? {},
    disco: s.oferta ? s.oferta.disco_maximo : null,
    protocolo: receita?.rede.protocolo ?? 'tcp',
    pack: s.pack ? publicoDoPack(s.pack) : null,
  };
}

/** O que a tela mostra do pack: o resumo, de onde veio, o hash e o tamanho. */
function publicoDoPack(p) {
  return {
    origem: p.origem, link: p.link ?? null, pagina: p.pagina ?? null, sha512: p.sha512, bytes: p.bytes,
    ...p.resumo, instalador: p.instalador ? { nome: p.instalador.nome, tamanho: p.instalador.tamanho } : null,
  };
}

// ---------------------------------------------------------------- a oferta

/** A porta do jogo na máquina de `quem`: a padrão, ou a primeira livre depois dela. */
function portaPara(servidores, s, quem) {
  const receita = receitaPorId(s.receita);
  const tomadas = new Set(Object.values(servidores).filter(o => o.id !== s.id && o.quem === quem && o.porta).map(o => o.porta));
  let porta = receita.rede.portaPadrao;
  while (tomadas.has(porta)) porta++;
  return porta;
}

/** Monta a oferta da versão e da máquina escolhidas, e chama a pessoa. */
function pedirAMaquina(servidores, s) {
  const receita = receitaPorId(s.receita);
  const comMods = s.variante === 'com-mods';
  if (comMods && !s.pack) {
    s.aceite = 'sem-pack';
    return { ok: true };
  }
  if (!s.resolvido || s.resolvido.versao !== s.versao) {
    const resolvido = resolverVersao(receita, s.versao, url => mundo.buscar(url));
    if (!resolvido.ok) return resolvido;
    s.resolvido = resolvido;
  }
  s.porta = portaPara(servidores, s, s.quem);
  const args = { servidor: s.id, versao: s.versao, porta: s.porta };
  s.oferta = comMods ? montarOfertaComMods(receita, args, s.resolvido, s.pack) : montarOferta(receita, args, s.resolvido);
  try {
    mundo.maquinas.pedir({ quem: s.quem, servidor: s.id, oferta: s.oferta });
  } catch (erro) {
    return { ok: false, erro: 'oferta-recusada', porque: fraseDoErro(erro) };
  }
  s.aceite = 'esperando';
  s.motivo = null;
  return { ok: true };
}

// ---------------------------------------------------------------- as operações

function opEstado(contexto) {
  const servidores = lerServidores();
  return {
    ok: true,
    revisao: Number(dados.revisao ?? '0'),
    receitas: RECEITAS.map(r => {
      const v = validarReceita(r);
      return { id: r.id, nome: r.nome, edicao: r.edicao ?? '', icone: r.icone, descricao: r.descricao, versao: r.versao, valida: v.ok, erros: v.erros.slice(0, 4) };
    }),
    servidores: Object.values(servidores).map(publico),
    podem: Array.isArray(contexto.permissoes) ? contexto.permissoes : [],
  };
}

function opVersoes(pedido) {
  const receita = receitaPorId(pedido.receita);
  if (!receita) return { ok: false, erro: 'receita-desconhecida', receita: pedido.receita ?? null };
  const cache = lerJson(dados['versoes:' + receita.id]);
  if (cache && mundo.agora() - cache.quando < VALIDADE_DAS_VERSOES) return { ok: true, versoes: cache.versoes };
  const r = listarVersoes(receita, url => mundo.buscar(url));
  if (!r.ok) return r;
  const versoes = r.versoes.map(v => v.id);
  dados['versoes:' + receita.id] = JSON.stringify({ quando: mundo.agora(), versoes });
  return { ok: true, versoes };
}

function opCriar(pedido, contexto) {
  const receita = receitaPorId(pedido.receita);
  if (!receita) return { ok: false, erro: 'receita-desconhecida', receita: pedido.receita ?? null };
  const valida = validarReceita(receita);
  if (!valida.ok) return { ok: false, erro: 'receita-invalida', receita: receita.id, erros: valida.erros.slice(0, 4) };
  const servidores = lerServidores();
  if (Object.keys(servidores).length >= TETO_DE_SERVIDORES) return { ok: false, erro: 'servidores-demais', teto: TETO_DE_SERVIDORES };
  const contador = lerJson(dados.contadores) ?? {};
  let n = contador[receita.id] ?? 0;
  let id;
  do { id = `${receita.id}-${++n}`; } while (servidores[id]);
  contador[receita.id] = n;
  dados.contadores = JSON.stringify(contador);
  const s = {
    id, receita: receita.id, variante: 'vanilla', versao: null, config: configPadrao(receita),
    quem: null, porta: null, aceite: 'sem-maquina', motivo: null, ligar: false, estado: 'desligado',
    jogadores: [], falhas: [], linhas: [], criadoPor: contexto.person,
  };
  servidores[id] = s;
  gravarServidores(servidores);
  return { ok: true, servidor: publico(s) };
}

function opApagar(s, servidores) {
  if (RODANDO.has(s.estado)) return { ok: false, erro: 'desligue-antes', estado: s.estado };
  if (s.pack?.caminho) volume.apagar(s.pack.caminho);
  delete servidores[s.id];
  gravarServidores(servidores);
  return { ok: true };
}

function opConfigurar(s, servidores, pedido) {
  const receita = receitaPorId(s.receita);
  const variante = pedido.variante !== undefined ? pedido.variante : (s.variante ?? 'vanilla');
  const v = receita.variantes[variante];
  if (!v || v.disponivel === false || (variante === 'com-mods' && !receita.modpack)) {
    return { ok: false, erro: 'variante-indisponivel', variante, porque: v?.porque ?? null };
  }
  let config = s.config;
  if (pedido.config !== undefined) {
    const r = validarConfig(receita, pedido.config, s.config);
    if (Object.keys(r.erros).length) return { ok: false, erro: 'config-invalida', erros: r.erros };
    config = r.config;
  }
  // Com mods, a versão é a que o pack pede, e não a que a tela manda.
  const versao = variante === 'com-mods'
    ? (s.pack?.mc ?? null)
    : pedido.versao !== undefined ? (pedido.versao === null ? null : String(pedido.versao)) : (s.variante === 'com-mods' ? null : s.versao);
  const quem = pedido.quem !== undefined ? (pedido.quem === null ? null : String(pedido.quem)) : s.quem;
  if (quem !== null && !/^[1-9][0-9]*$/.test(quem)) return { ok: false, erro: 'quem-invalido', quem };
  const mudaOQueRoda = versao !== s.versao || quem !== s.quem || variante !== (s.variante ?? 'vanilla');
  if (mudaOQueRoda && RODANDO.has(s.estado)) return { ok: false, erro: 'desligue-antes', estado: s.estado };

  const configMudou = JSON.stringify(config) !== JSON.stringify(s.config);
  s.config = config;
  s.versao = versao;
  s.quem = quem;
  s.variante = variante;
  if (mudaOQueRoda) {
    if (quem === null) {
      s.aceite = 'sem-maquina';
      s.porta = null;
      s.oferta = null;
    } else if (variante === 'com-mods' && !s.pack) {
      s.aceite = 'sem-pack';
    } else if (versao === null) {
      s.aceite = 'sem-versao';
    } else {
      const r = pedirAMaquina(servidores, s);
      if (!r.ok) return r;
    }
  }
  if (configMudou && !mudaOQueRoda && s.aceite === 'aceito') {
    if (RODANDO.has(s.estado)) s.precisaReiniciar = true;
    mundo.maquinas.avisar({ servidor: s.id, carga: { op: 'configurar' } });
  }
  gravarServidores(servidores);
  return { ok: true, servidor: publico(s) };
}

function opLigar(s, servidores) {
  if (s.variante === 'com-mods' && !s.pack) return { ok: false, erro: 'sem-pack' };
  if (!s.versao) return { ok: false, erro: 'sem-versao' };
  if (!s.quem) return { ok: false, erro: 'sem-maquina' };
  s.ligar = true;
  let esperando = null;
  if (s.aceite === 'aceito') {
    mundo.maquinas.avisar({ servidor: s.id, carga: { op: 'ligar' } });
  } else if (s.aceite === 'esperando') {
    esperando = 'aceite';
  } else {
    // Parada, revogada ou recusada: ligar de novo é perguntar de novo.
    const r = pedirAMaquina(servidores, s);
    if (!r.ok) return r;
    esperando = 'aceite';
  }
  gravarServidores(servidores);
  return { ok: true, ...(esperando ? { esperando } : {}), servidor: publico(s) };
}

function opDesligar(s, servidores) {
  s.ligar = false;
  if (s.aceite === 'aceito') mundo.maquinas.avisar({ servidor: s.id, carga: { op: 'desligar' } });
  gravarServidores(servidores);
  return { ok: true, servidor: publico(s) };
}

function opConsole(s, pedido) {
  const comando = pedido.comando;
  if (typeof comando !== 'string' || comando.trim() === '' || /[\u0000-\u001f\u007f]/.test(comando) || bytesDe(comando) > 256) {
    return { ok: false, erro: 'comando-invalido' };
  }
  if (s.estado !== 'ligado') return { ok: false, erro: 'servidor-desligado', estado: s.estado };
  mundo.maquinas.avisar({ servidor: s.id, carga: { op: 'console', comando } });
  return { ok: true };
}

// ---------------------------------------------------------------- o modpack

/**
 * **O pack lido vira o pack do servidor de jogo** (pelo link ou pelo envio):
 * o índice conferido pelas regras da spec, o instalador do loader que ele
 * pede, e a variante e a versão que ele define. Se já há máquina, pede o
 * aceite de novo: o pack, o loader e os comandos mudaram o que roda.
 */
function usarPack(s, servidores, pack, texto) {
  const receita = receitaPorId(s.receita);
  const lido = lerIndice(texto, receita);
  if (!lido.ok) return lido;
  const indice = lido.indice;
  let instalador = null;
  if (indice.loader) {
    const r = instaladorDoLoader(receita, indice.loader, indice.mc, url => mundo.buscar(url));
    if (!r.ok) return r;
    instalador = r.artefato;
  }
  const antes = s.pack;
  s.pack = { ...pack, mc: indice.mc, loader: indice.loader, instalador, resumo: resumoDoIndice(indice) };
  if (antes?.caminho && antes.caminho !== s.pack.caminho) volume.apagar(antes.caminho);
  s.variante = 'com-mods';
  s.versao = indice.mc;
  s.resolvido = s.resolvido?.versao === indice.mc ? s.resolvido : null;
  if (s.quem) {
    const r = pedirAMaquina(servidores, s);
    if (!r.ok) return r;
  }
  gravarServidores(servidores);
  return { ok: true, servidor: publico(s) };
}

/** O pack pelo link do Modrinth: a API dá o .mrpack e o sha512; o produto o abre. */
function opPackLink(s, servidores, pedido) {
  if (RODANDO.has(s.estado)) return { ok: false, erro: 'desligue-antes', estado: s.estado };
  const receita = receitaPorId(s.receita);
  if (!receita.modpack) return { ok: false, erro: 'variante-indisponivel', variante: 'com-mods' };
  const link = lerLinkDoModrinth(pedido.link);
  if (!link.ok) return link;
  const url = `${receita.modpack.api}/project/${link.slug}/version`;
  const lido = buscarJson(url => mundo.buscar(url), url);
  if (!lido.ok) return lido;
  const escolhida = escolherVersaoDoModrinth(lido.json, link.versao, receita);
  if (!escolhida.ok) return escolhida;
  const arquivo = escolhida.arquivo;
  if (arquivo.tamanho > TETO_DO_PACK_PELO_LINK) {
    return { ok: false, erro: 'pack-grande-para-o-link', tamanho: arquivo.tamanho, teto: TETO_DO_PACK_PELO_LINK };
  }
  const r = mundo.buscarPack({ url: arquivo.url, sha512: arquivo.sha512, tamanho: arquivo.tamanho });
  if (!r || r.ok !== true) return { ...(r ?? {}), ok: false, erro: r?.erro ?? 'busca-falhou', url: arquivo.url };
  return usarPack(s, servidores, {
    origem: 'link', link: `${receita.modpack.pagina}${link.slug}`, pagina: `${receita.modpack.pagina}${link.slug}/version/${escolhida.versao.id}`,
    url: arquivo.url, sha512: r.sha512, bytes: r.bytes, versaoDoModrinth: escolhida.versao.id,
  }, r.indice);
}

/** O envio do .mrpack: a espera no volume (o produto confere os bytes e o teto de 64 MiB). */
function opPackEnviar(s) {
  if (RODANDO.has(s.estado)) return { ok: false, erro: 'desligue-antes', estado: s.estado };
  const receita = receitaPorId(s.receita);
  if (!receita.modpack) return { ok: false, erro: 'variante-indisponivel', variante: 'com-mods' };
  const n = Number(dados.envios ?? '0') + 1;
  dados.envios = String(n);
  const token = `${s.id}-${mundo.agora()}-${n}`;
  const caminho = `packs/${s.id}/${token}.mrpack`;
  if (!volume.esperar(token, caminho, ['mrpack'], PRAZO_DO_ENVIO)) return { ok: false, erro: 'espera-recusada' };
  dados['envio:' + token] = JSON.stringify({ id: s.id, caminho });
  return { ok: true, token, teto: receita.modpack.teto };
}

/** O envio chegou: o produto abre o pack do volume, e ele vira o pack do servidor. */
function opPackChegou(s, servidores, pedido) {
  const envio = lerJson(dados['envio:' + String(pedido.token ?? '')]);
  if (!envio || envio.id !== s.id) return { ok: false, erro: 'envio-desconhecido', token: pedido.token ?? null };
  delete dados['envio:' + pedido.token];
  const r = volume.pack(envio.caminho);
  if (!r || r.ok !== true) {
    volume.apagar(envio.caminho);
    return { ok: false, ...(r ?? {}), erro: r?.erro ?? 'pack-nao-chegou' };
  }
  const usado = usarPack(s, servidores, { origem: 'enviado', caminho: envio.caminho, sha512: r.sha512, bytes: r.bytes }, r.indice);
  if (!usado.ok) volume.apagar(envio.caminho);
  return usado;
}

/** **O pack para quem pede** (quem joga, pelo `SeeleUI.salvar`, e a máquina, pelo `trazer`): o caminho no volume. */
function opPackLer(pedido) {
  const s = lerServidores()[pedido.id];
  if (!s) return { ok: false, erro: 'servidor-desconhecido', servidor: pedido.id ?? null };
  if (s.pack?.origem !== 'enviado') return { ok: false, erro: 'sem-pack-enviado' };
  const caminho = volume.servir(s.pack.caminho);
  if (!caminho) return { ok: false, erro: 'pack-sumiu' };
  return { ok: true, volume: caminho };
}

// ---------------------------------------------------------------- a máquina

/** O que a máquina aceita precisa para baixar, configurar e rodar. */
function planoDe(s) {
  const receita = receitaPorId(s.receita);
  return {
    servidor: s.id,
    receita: receita.id,
    versao: s.versao,
    artefatos: s.resolvido.artefatos,
    porPlataforma: s.resolvido.porPlataforma,
    semJava: s.resolvido.semJava,
    arquivoDeConfig: receita.configuracao.arquivo,
    propriedades: escreverPropriedades(receita, s.config, s.porta),
    termos: receita.termos.filter(t => t.arquivo).map(t => ({ id: t.id, arquivo: t.arquivo, conteudo: t.conteudo })),
    rodar: s.oferta.rodar,
    tunel: s.oferta.tuneis[0],
    ligar: s.ligar,
    ...(s.variante === 'com-mods' && s.pack ? planoDoPack(s) : {}),
  };
}

/** O que a máquina precisa do pack: de onde ele vem, o hash, o loader e o passo de instalar. */
function planoDoPack(s) {
  const p = s.pack;
  const extras = [];
  if (p.instalador) extras.push(p.instalador);
  if (p.origem === 'link') extras.push({ id: 'pack', nome: 'pack.mrpack', url: p.url, tamanho: p.bytes, hash: { algoritmo: 'sha512', hex: p.sha512 }, destino: 'pack.mrpack' });
  return {
    artefatos: [...s.resolvido.artefatos, ...extras],
    modpack: {
      origem: p.origem, destino: 'pack.mrpack', pedido: { op: 'pack-ler', id: s.id },
      sha512: p.sha512, bytes: p.bytes, mc: p.mc, loader: p.loader, instalar: s.oferta.instalar ?? null,
    },
  };
}

function daMaquina(contexto, pedido) {
  const servidores = lerServidores();
  const s = servidores[contexto.maquina.servidor];
  if (!s) return { ok: false, erro: 'servidor-desconhecido', servidor: contexto.maquina.servidor, ordem: 'desligar' };
  // **Uma dona por vez.** O anfitrião só deixa a máquina aceita falar, mas a
  // posse é desta metade: quem não é a dona agora desliga.
  if (s.quem !== contexto.person) {
    anotarFalha(s, 'maquina', 'nao-e-a-dona', { dados: { pessoa: contexto.person } });
    gravarServidores(servidores);
    return { ok: false, erro: 'nao-e-a-dona', ordem: 'desligar' };
  }
  if (pedido.op === 'plano') {
    if (s.aceite !== 'aceito' || !s.resolvido || !s.oferta) return { ok: false, erro: 'sem-aceite' };
    return { ok: true, plano: planoDe(s) };
  }
  if (pedido.op === 'estado') {
    if (!ESTADOS_DA_MAQUINA.has(pedido.estado)) return { ok: false, erro: 'estado-desconhecido', estado: pedido.estado ?? null };
    const antes = s.estado;
    s.estado = pedido.estado;
    if (Array.isArray(pedido.jogadores)) s.jogadores = pedido.jogadores.map(j => cortar(j, 32)).slice(0, 200);
    if (s.estado === 'desligado' || s.estado === 'caiu') s.jogadores = [];
    if (pedido.progresso !== undefined) s.progresso = pedido.progresso;
    if (Array.isArray(pedido.linhas)) s.linhas = pedido.linhas.map(l => cortar(l, 160)).slice(-TETO_DE_LINHAS);
    if (s.estado === 'ligando' || s.estado === 'desligado') s.precisaReiniciar = false;
    if (s.estado === 'caiu' && antes !== 'caiu') anotarFalha(s, 'jogo', 'o-jogo-caiu', { dados: pedido.saida ?? {} });
    gravarServidores(servidores);
    // O jogo de pé quando ninguém o quer de pé desliga.
    if (RODANDO.has(s.estado) && !s.ligar && s.estado !== 'parando') return { ok: true, ordem: 'desligar' };
    return { ok: true };
  }
  if (pedido.op === 'falha') {
    anotarFalha(s, 'maquina', cortar(pedido.erro ?? 'falhou', 64), { etapa: cortar(pedido.etapa ?? '', 32), dados: pedido.dados ?? {} });
    gravarServidores(servidores);
    return { ok: true };
  }
  return { ok: false, erro: 'op-desconhecida', op: pedido.op ?? null };
}

// ---------------------------------------------------------------- as portas

globalThis.aoPedir = (textoDoContexto, textoDoPedido) => {
  const contexto = lerJson(textoDoContexto) ?? {};
  const pedido = lerJson(textoDoPedido);
  if (!pedido || typeof pedido !== 'object') return JSON.stringify({ ok: false, erro: 'pedido-invalido' });
  if (contexto.maquina) return JSON.stringify(daMaquina(contexto, pedido));

  const op = pedido.op;
  const acaoPedida = ACAO_DA_OP[op];
  if (contexto.acao && contexto.acao !== acaoPedida) return JSON.stringify({ ok: false, erro: 'acao-nao-serve', acao: contexto.acao, op: op ?? null });
  if (acaoPedida && contexto.acao !== acaoPedida) return JSON.stringify({ ok: false, erro: 'pede-a-acao', acao: acaoPedida });

  let resposta;
  if (op === 'estado') resposta = opEstado(contexto);
  else if (op === 'versoes') resposta = opVersoes(pedido);
  else if (op === 'pack-ler') resposta = opPackLer(pedido);
  else if (op === 'criar') resposta = opCriar(pedido, contexto);
  else if (acaoPedida) {
    const servidores = lerServidores();
    const s = servidores[pedido.id];
    if (!s) resposta = { ok: false, erro: 'servidor-desconhecido', servidor: pedido.id ?? null };
    else if (op === 'apagar') resposta = opApagar(s, servidores);
    else if (op === 'configurar') resposta = opConfigurar(s, servidores, pedido);
    else if (op === 'ligar') resposta = opLigar(s, servidores);
    else if (op === 'desligar') resposta = opDesligar(s, servidores);
    else if (op === 'pack-link') resposta = opPackLink(s, servidores, pedido);
    else if (op === 'pack-enviar') resposta = opPackEnviar(s);
    else if (op === 'pack-chegou') resposta = opPackChegou(s, servidores, pedido);
    else resposta = opConsole(s, pedido);
  } else resposta = { ok: false, erro: 'op-desconhecida', op: op ?? null };
  return JSON.stringify(resposta);
};

globalThis.aoAcontecer = (momento, textoDaCarga) => {
  if (!['MaquinaAceitou', 'MaquinaRecusou', 'MaquinaParou'].includes(momento)) return;
  const carga = lerJson(textoDaCarga) ?? {};
  const servidores = lerServidores();
  const s = servidores[carga.servidor];
  if (!s) {
    mundo.registrar(`${momento} de um servidor de jogo que não existe mais: ${JSON.stringify(carga)}`);
    return;
  }
  const pessoa = String(carga.pessoa ?? '');
  if (pessoa !== s.quem) {
    // A máquina de antes, dispensada por um pedido a outra pessoa: conta, e não mexe na de agora.
    anotarFalha(s, 'aceite', carga.motivo ?? momento, { dados: { pessoa, momento } });
    gravarServidores(servidores);
    return;
  }
  if (momento === 'MaquinaAceitou') {
    s.aceite = 'aceito';
    s.motivo = null;
    mundo.maquinas.avisar({ servidor: s.id, carga: { op: s.ligar ? 'ligar' : 'preparar' } });
  } else if (momento === 'MaquinaRecusou') {
    s.aceite = 'recusado';
    s.motivo = String(carga.motivo ?? '');
    s.ligar = false;
    anotarFalha(s, 'aceite', s.motivo, { dados: { pessoa } });
  } else {
    s.aceite = 'parado';
    s.motivo = String(carga.motivo ?? '');
    s.ligar = false;
    s.estado = 'desligado';
    s.jogadores = [];
    anotarFalha(s, 'aceite', s.motivo, { dados: { pessoa } });
  }
  gravarServidores(servidores);
};
