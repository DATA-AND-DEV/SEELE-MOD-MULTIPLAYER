// A metade de máquina com mods (API 8 parte 6), contra um adaptador falso com
// um disco de mentira, e com a metade de servidor de verdade do outro lado: o
// pack trazido pelo volume (ou baixado do CDN pelo link), aberto, o índice
// lido e conferido de novo, cada arquivo do servidor baixado pelo sha512 (e o
// só-do-cliente não), os overrides e depois os server-overrides por cima, o
// instalador do loader rodado uma vez com os argumentos aceitos, e cada falha
// na tela com os dados.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { carregar, buscarDasFixtures, fixture } = require('./carregar.cjs');
const { criarAnfitriao } = require('./anfitriao.cjs');
const { packDeProva } = require('../ferramentas/pack-de-prova.cjs');
const { lerZip, escreverZip } = require('./zip.cjs');

const { criarMaquina } = carregar('maquina', ['criarMaquina'], { __testeSemPartida: true });
const local = v => JSON.parse(JSON.stringify(v));
const assentar = () => new Promise(r => setImmediate(r));
async function assentarTudo() { for (let i = 0; i < 40; i++) await assentar(); }

const PACK = packDeProva();
const VERSOES = 'https://api.modrinth.com/v2/project/prova-do-seele/version';
const URL_DO_PACK = JSON.parse(fixture('modrinth-prova-versoes.json'))[0].files[0].url;

/** Um processo de mentira, que o teste faz sair. */
function processoFalso() {
  const p = { entrada: [], linhas: null, sair: null };
  p.api = {
    aoLinha: fn => { p.linhas = fn; },
    aoSair: fn => { p.sair = fn; },
    escrever: texto => { p.entrada.push(texto); },
    encerrar: () => p.sair?.({ codigo: null, sinal: 'morto-a-pedido' }),
  };
  return p;
}

/** O adaptador falso com um disco: o que se baixa, traz, abre e lê fica em `disco`. */
function adaptadorComDisco(a, pessoa, opcoes = {}) {
  const f = { disco: new Map(), baixados: [], trazidos: [], abertos: [], rodados: [], processos: [], ouvinte: null };
  const erro = (nome, extra = {}) => Object.assign(new Error(nome), { erro: nome, ...extra });
  f.ad = {
    plataforma: () => opcoes.plataforma ?? 'mac-aarch64',
    baixar: async pedido => {
      f.baixados.push(local(pedido));
      f.disco.set(pedido.destino, pedido.url === URL_DO_PACK ? PACK : Buffer.from('baixado ' + pedido.url));
      return { jaEstava: false };
    },
    trazer: async ({ pedido, destino }) => {
      f.trazidos.push(local({ pedido, destino }));
      if (opcoes.trazer) return opcoes.trazer({ pedido, destino });
      let bytes;
      try { bytes = a.lerDoVolume(pessoa, pedido); } catch (e) { throw erro('pack-nao-veio', { motivo: e.erro }); }
      f.disco.set(destino, bytes);
      return { destino, tamanho: bytes.length, jaEstava: false };
    },
    desempacotar: async ({ arquivo, destino, raiz, mesclar }) => {
      f.abertos.push(local({ arquivo, destino, raiz, mesclar: Boolean(mesclar) }));
      // O Java é um .tar.gz de mentira: abrir é só dizer que abriu.
      if (arquivo !== 'pack.mrpack') return { arquivos: 1 };
      const prefixo = raiz ? raiz + '/' : '';
      const entradas = lerZip(f.disco.get(arquivo)).filter(e => e.nome.startsWith(prefixo));
      if (!entradas.length) throw erro('nada-sob-a-raiz', { arquivo, raiz });
      if (!mesclar) for (const k of [...f.disco.keys()]) if (k.startsWith(destino + '/')) f.disco.delete(k);
      for (const e of entradas) f.disco.set((destino ? destino + '/' : '') + e.nome.slice(prefixo.length), e.dados);
      return { arquivos: entradas.length };
    },
    ler: async arquivo => {
      if (!f.disco.has(arquivo)) throw erro('disco', { caminho: arquivo });
      return f.disco.get(arquivo).toString('utf8');
    },
    escrever: async (caminho, texto) => { f.disco.set(caminho, Buffer.from(texto)); },
    rodar: async pedido => {
      f.rodados.push(local(pedido));
      const p = processoFalso();
      f.processos.push(p);
      // O instalador sai sozinho, com o código que o teste pedir.
      if (pedido.argumentos.includes('fabric-installer.jar')) {
        setImmediate(() => {
          p.linhas?.('Installing Fabric Server: 0.16.14');
          p.sair?.({ codigo: opcoes.codigoDoInstalador ?? 0 });
        });
      }
      return p.api;
    },
    servirPorta: async () => ({ fechar: () => {} }),
    recusas: async () => ({}),
    copiar: null,
    pedir: async valor => a.daMaquina(pessoa, f.servidor, valor),
    aoAviso: fn => { f.ouvinte = fn; },
    aoParar: () => {},
    esperar: () => new Promise(() => {}),
    registrar: () => {},
  };
  return f;
}

async function entregar(a, f) {
  f.lidos = f.lidos ?? 0;
  while (f.lidos < a.avisosAMaquinas.length) {
    const aviso = a.avisosAMaquinas[f.lidos++];
    if (aviso.para === '2') f.ouvinte(aviso.servidor, aviso.carga);
    await assentarTudo();
  }
  await assentarTudo();
}

/** Um Minecraft com o pack de prova (pelo envio, ou pelo link), na máquina da pessoa 2, aceito. */
async function comMods(opcoes = {}) {
  const a = criarAnfitriao({ buscar: buscarDasFixtures({ [VERSOES]: fixture('modrinth-prova-versoes.json') }), packsDoCdn: { [URL_DO_PACK]: PACK } });
  const id = a.acao(1, 'criar-servidor-de-jogo', { op: 'criar', receita: 'minecraft' }).servidor.id;
  a.acao(1, 'configurar-servidor-de-jogo', { op: 'configurar', id, variante: 'com-mods', quem: '2', config: {} });
  if (opcoes.link) {
    a.acao(1, 'configurar-servidor-de-jogo', { op: 'pack-link', id, link: 'https://modrinth.com/modpack/prova-do-seele' });
  } else {
    const e = a.acao(1, 'configurar-servidor-de-jogo', { op: 'pack-enviar', id });
    a.enviarAoVolume(e.token, opcoes.pack ?? PACK);
    a.acao(1, 'configurar-servidor-de-jogo', { op: 'pack-chegou', id, token: e.token });
  }
  const f = adaptadorComDisco(a, 2, opcoes);
  f.servidor = id;
  f.ad.servidor = id;
  criarMaquina(f.ad);
  a.aceitar(id);
  await entregar(a, f);
  return { a, f, id };
}

const doServidor = (a, id) => a.pedir(1, { op: 'estado' }).servidores.find(s => s.id === id);

test('o pack enviado vem pelo volume, é aberto, e só os arquivos do servidor são baixados, pelo sha512', async () => {
  const { a, f, id } = await comMods();
  assert.deepEqual(f.trazidos, [{ pedido: { op: 'pack-ler', id }, destino: 'pack.mrpack' }]);
  const doPack = f.baixados.filter(b => b.destino.startsWith('mods/'));
  assert.deepEqual(doPack.map(b => b.destino), ['mods/fabric-api-0.119.4+1.21.4.jar', 'mods/lithium-fabric-0.15.3+mc1.21.4.jar']);
  assert.ok(doPack.every(b => b.hash.algoritmo === 'sha512' && b.hash.hex.length === 128));
  assert.ok(!f.baixados.some(b => /sodium/.test(b.url)), 'o mod só do cliente foi baixado');
  assert.ok(f.baixados.some(b => b.destino === 'fabric-installer.jar' && b.hash.algoritmo === 'sha512'));
  assert.equal(doServidor(a, id).estado, 'pronto', JSON.stringify(doServidor(a, id).falhas));
});

test('os overrides entram, e os server-overrides por cima deles', async () => {
  const { f } = await comMods();
  const mesclados = f.abertos.filter(x => x.mesclar);
  assert.deepEqual(mesclados.map(x => [x.raiz, x.destino]), [['overrides', ''], ['server-overrides', '']]);
  assert.equal(f.disco.get('config/seele-prova.txt').toString(), 'de server-overrides\n');
  assert.equal(f.disco.get('config/so-overrides.txt').toString(), 'fica\n');
});

test('o instalador do loader roda uma vez, com os argumentos do aceite, e a marca evita a segunda', async () => {
  const { a, f, id } = await comMods();
  assert.deepEqual(f.rodados, [{ comando: 'java/bin/java', argumentos: ['-jar', 'fabric-installer.jar', 'server', '-mcversion', '1.21.4', '-loader', '0.16.14'], pasta: '' }]);
  assert.equal(f.disco.get('.seele-loader').toString(), 'fabric-loader@0.16.14@1.21.4\n');
  // Ligar: o servidor roda com o lançador do Fabric, e o instalador não roda de novo.
  a.acao(1, 'ligar-desligar-servidor-de-jogo', { op: 'ligar', id });
  await entregar(a, f);
  assert.equal(f.rodados.length, 2);
  assert.deepEqual(f.rodados[1].argumentos, ['-Xms1G', '-Xmx2G', '-jar', 'fabric-server-launch.jar', 'nogui']);
});

test('a metade que sobe de novo (o app reaberto) acha a marca e não roda o instalador outra vez', async () => {
  const { a, f, id } = await comMods();
  assert.equal(f.rodados.length, 1);
  // Outra metade, o mesmo disco: a memória dela não sabe o que foi preparado.
  criarMaquina(f.ad);
  await entregar(a, f);
  await assentarTudo();
  assert.equal(f.rodados.length, 1, 'o instalador rodou de novo: ' + JSON.stringify(f.rodados));
  assert.equal(doServidor(a, id).estado, 'pronto');
});

test('o instalador que sai com erro para tudo, e a tela tem o código e as linhas', async () => {
  const { a, f, id } = await comMods({ codigoDoInstalador: 3 });
  const falha = doServidor(a, id).falhas.at(-1);
  assert.equal(falha.etapa, 'instalar');
  assert.equal(falha.erro, 'instalador-falhou');
  assert.equal(falha.dados.codigo, 3);
  assert.ok(falha.dados.linhas.some(l => l.includes('Installing Fabric')));
  assert.ok(!f.disco.has('.seele-loader'));
  assert.notEqual(doServidor(a, id).estado, 'pronto');
});

test('pelo link, o .mrpack vem do CDN do Modrinth como artefato, sem passar pelo volume', async () => {
  const { a, f, id } = await comMods({ link: true });
  assert.deepEqual(f.trazidos, []);
  const pack = f.baixados.find(b => b.destino === 'pack.mrpack');
  assert.equal(pack.url, URL_DO_PACK);
  assert.equal(pack.hash.algoritmo, 'sha512');
  assert.equal(doServidor(a, id).estado, 'pronto', JSON.stringify(doServidor(a, id).falhas));
});

test('o pack que não veio da metade de servidor é dito, com o motivo do produto', async () => {
  const { a, id } = await comMods({ trazer: () => { throw Object.assign(new Error('pack-diferente'), { erro: 'pack-diferente', esperado: 'a', obtido: 'b' }); } });
  const falha = doServidor(a, id).falhas.at(-1);
  assert.deepEqual([falha.etapa, falha.erro, falha.dados.esperado, falha.dados.obtido], ['trazer-pack', 'pack-diferente', 'a', 'b']);
});

test('o índice dos bytes aceitos é conferido de novo na máquina, e um que não serve para tudo', async () => {
  const { a, f, id } = await comMods({
    trazer: ({ destino }) => {
      const ruim = escreverZip([['modrinth.index.json', JSON.stringify({ formatVersion: 1, game: 'minecraft', files: [{ path: '../fora.jar', hashes: { sha512: 'a'.repeat(128) }, downloads: ['https://cdn.modrinth.com/x.jar'], fileSize: 1 }], dependencies: { minecraft: '1.21.4', 'fabric-loader': '0.16.14' } }), true]]);
      f_.disco.set(destino, ruim);
      return {};
    },
  });
  const falha = doServidor(a, id).falhas.at(-1);
  assert.deepEqual([falha.etapa, falha.erro, falha.dados.path], ['indice', 'caminho-recusado', '../fora.jar']);
  assert.ok(!f.baixados.some(b => b.destino.includes('fora')));
});

// O adaptador do teste acima precisa do disco antes de existir: um atalho.
let f_ = null;
const original = adaptadorComDisco;
// eslint-disable-next-line no-func-assign
adaptadorComDisco = (...args) => (f_ = original(...args));
