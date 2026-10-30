// O adaptador é a única porta para a API da máquina. Este teste escreve,
// chamada a chamada, o que ele supõe que as partes 3 e 4 entregam: quando elas
// saírem com outros nomes, é aqui (e só em fonte/adaptador.js) que se troca.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { carregar } = require('./carregar.cjs');

const local = v => JSON.parse(JSON.stringify(v));

/** Um `maquina` global que anota cada chamada. */
function maquinaFalsa() {
  const chamadas = [];
  const anota = nome => (...args) => { chamadas.push([nome, ...local(args)]); return { ok: true }; };
  const proc = { aoLinha: anota('proc.aoLinha'), aoSair: anota('proc.aoSair'), escrever: anota('proc.escrever'), encerrar: anota('proc.encerrar') };
  const maquina = {
    plataforma: () => ({ sistema: 'macos', arquitetura: 'arm64' }),
    programa: { baixar: anota('programa.baixar'), rodar: (...a) => { chamadas.push(['programa.rodar', ...local(a)]); return proc; } },
    porta: { servir: anota('porta.servir') },
    arquivos: { escrever: anota('arquivos.escrever'), copiar: anota('arquivos.copiar') },
    pedir: anota('pedir'),
    aoAviso: anota('aoAviso'),
  };
  return { maquina, chamadas };
}

test('cada chamada do adaptador vira a chamada da API 8 que o desenho nomeia', async () => {
  const { maquina, chamadas } = maquinaFalsa();
  const { criarAdaptador } = carregar('maquina', ['criarAdaptador'], { __testeSemPartida: true, maquina, setTimeout });
  const ad = criarAdaptador();
  assert.equal(ad.plataforma(), 'mac-aarch64');
  await ad.baixar({ servidor: 'minecraft-1', url: 'https://x/y.jar', hash: { algoritmo: 'sha1', hex: 'ab' }, tamanho: 3, destino: 'server.jar' });
  await ad.baixar({ servidor: 'minecraft-1', url: 'https://x/j.tgz', hash: { algoritmo: 'sha256', hex: 'cd' }, tamanho: 4, destino: 'java', desempacotar: { raiz: 'jdk/Contents/Home' } });
  const proc = await ad.rodar({ servidor: 'minecraft-1', comando: 'java/bin/java', argumentos: ['-jar', 'server.jar'], pasta: '.' });
  proc.escrever('stop\n');
  await ad.servirPorta({ servidor: 'minecraft-1', nome: 'minecraft-1', protocolo: 'tcp', porta: 25565 });
  await ad.escrever('minecraft-1', 'eula.txt', 'eula=true\n');
  await ad.copiar('minecraft-1', 'world', 'copias/world-1');
  await ad.pedir('minecraft-1', { op: 'plano' });
  assert.deepEqual(chamadas, [
    ['programa.baixar', { servidor: 'minecraft-1', url: 'https://x/y.jar', sha1: 'ab', tamanho: 3, destino: 'server.jar' }],
    ['programa.baixar', { servidor: 'minecraft-1', url: 'https://x/j.tgz', sha256: 'cd', tamanho: 4, destino: 'java', desempacotar: { raiz: 'jdk/Contents/Home' } }],
    ['programa.rodar', { servidor: 'minecraft-1', comando: 'java/bin/java', argumentos: ['-jar', 'server.jar'], pasta: '.' }],
    ['proc.escrever', 'stop\n'],
    ['porta.servir', { nome: 'minecraft-1', protocolo: 'tcp', porta: 25565 }],
    ['arquivos.escrever', { servidor: 'minecraft-1', caminho: 'eula.txt', texto: 'eula=true\n' }],
    ['arquivos.copiar', { servidor: 'minecraft-1', de: 'world', para: 'copias/world-1' }],
    ['pedir', 'minecraft-1', { op: 'plano' }],
  ]);
});

test('um erro síncrono da API vira promessa rejeitada, e não some no meio da fila', async () => {
  const { maquina } = maquinaFalsa();
  maquina.programa.baixar = () => { throw Object.assign(new Error('fora-das-origens'), { erro: 'fora-das-origens' }); };
  const { criarAdaptador } = carregar('maquina', ['criarAdaptador'], { __testeSemPartida: true, maquina, setTimeout });
  const falha = await criarAdaptador().baixar({ servidor: 's', url: 'https://x', hash: { algoritmo: 'sha1', hex: 'a' }, tamanho: 1, destino: 'x' }).then(() => null, e => e);
  assert.equal(falha?.erro, 'fora-das-origens');
});

test('sem a API da máquina, a metade de máquina lança dizendo o que falta, e não sobe calada', () => {
  assert.throws(() => carregar('maquina', [], {}), /maquina\.programa.*maquina\.porta/);
});

test('só o adaptador alcança o objeto maquina', () => {
  // Trocar um nome da API é uma mudança num arquivo só.
  for (const nome of ['comum', 'esquema', 'receita', 'maquina', 'servidor', 'cliente']) {
    const fonte = fs.readFileSync(path.join(__dirname, '..', 'fonte', nome + '.js'), 'utf8')
      .replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    assert.doesNotMatch(fonte, /\bmaquina\.(programa|porta|arquivos|pedir|aoAviso|plataforma)\b/, nome + '.js chama a API da máquina por fora do adaptador');
  }
});
