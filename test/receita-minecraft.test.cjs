// A receita do Minecraft Vanilla, lida contra o que a Mojang e a Adoptium
// publicam — pelas fixtures de test/fixtures, gravadas em 30/10/2026. Nada aqui
// sai para a rede.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { carregar, receitaDoDisco, buscarDasFixtures, fixture } = require('./carregar.cjs');

const m = carregar('servidor', [
  'listarVersoes', 'resolverVersao', 'montarOferta', 'validarConfig', 'configPadrao',
  'escreverPropriedades', 'casarSaida', 'sha1Hex',
]);
const local = v => JSON.parse(JSON.stringify(v));
const mc = receitaDoDisco('minecraft');

test('as versões vêm do version_manifest_v2, só as releases, as mais novas primeiro', () => {
  const buscar = buscarDasFixtures();
  const r = local(m.listarVersoes(mc, buscar));
  assert.equal(r.ok, true);
  assert.equal(r.versoes.length, 24, 'a receita pede 24');
  assert.equal(r.versoes[0].id, '26.3');
  assert.ok(!r.versoes.some(v => v.id.includes('snapshot')), 'um snapshot entrou na lista');
  assert.deepEqual(buscar.pedidos, ['https://piston-meta.mojang.com/mc/game/version_manifest_v2.json']);
});

test('a Mojang fora do ar é dita com a URL, e não vira uma lista vazia', () => {
  const r = local(m.listarVersoes(mc, () => null));
  assert.deepEqual(r, { ok: false, erro: 'origem-nao-respondeu', url: mc.versoes.manifesto });
  const s = local(m.listarVersoes(mc, () => '<html>manutenção</html>'));
  assert.equal(s.erro, 'origem-ilegivel');
});

test('o server.jar sai de downloads.server, com url, sha1 e tamanho', () => {
  const r = local(m.resolverVersao(mc, '1.21.4', buscarDasFixtures()));
  assert.equal(r.ok, true, JSON.stringify(r));
  const servidor = r.artefatos.find(a => a.id === 'servidor');
  assert.deepEqual(servidor, {
    id: 'servidor',
    nome: 'server.jar',
    url: 'https://piston-data.mojang.com/v1/objects/4707d00eb834b446575d89a61a11b5d548d8c001/server.jar',
    tamanho: 56880250,
    hash: { algoritmo: 'sha1', hex: '4707d00eb834b446575d89a61a11b5d548d8c001' },
    destino: 'server.jar',
  });
});

test('o Java é o majorVersion que a versão pede, da Adoptium, com sha256, por plataforma', () => {
  const buscar = buscarDasFixtures();
  const r = local(m.resolverVersao(mc, '1.21.4', buscar));
  assert.equal(r.javaMajor, 21);
  assert.ok(buscar.pedidos.includes('https://api.adoptium.net/v3/assets/latest/21/hotspot?image_type=jre&vendor=eclipse'));
  const macArm = r.artefatos.find(a => a.nome === r.porPlataforma['mac-aarch64']);
  assert.deepEqual(macArm, {
    id: 'java',
    nome: 'OpenJDK21U-jre_aarch64_mac_hotspot_21.0.13_9.tar.gz',
    url: 'https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.13%2B9/OpenJDK21U-jre_aarch64_mac_hotspot_21.0.13_9.tar.gz',
    tamanho: 47935740,
    hash: { algoritmo: 'sha256', hex: macArm.hash.hex },
    destino: 'java',
    desempacotar: { raiz: 'jdk-21.0.13+9-jre/Contents/Home' },
  });
  assert.match(macArm.hash.hex, /^[0-9a-f]{64}$/);
  const win = r.artefatos.find(a => a.nome === r.porPlataforma['windows-x64']);
  assert.equal(win.desempacotar.raiz, 'jdk-21.0.13+9-jre');
  assert.ok(win.url.endsWith('.zip'));
  assert.deepEqual(Object.keys(r.porPlataforma).sort(), ['linux-aarch64', 'linux-x64', 'mac-aarch64', 'mac-x64', 'windows-x64']);
  assert.deepEqual(r.semJava, []);
});

test('o Minecraft 26.3 pede o Java 25, e o 1.16.5 o 8', () => {
  assert.equal(local(m.resolverVersao(mc, '26.3', buscarDasFixtures())).javaMajor, 25);
  assert.equal(local(m.resolverVersao(mc, '1.16.5', buscarDasFixtures())).javaMajor, 8);
});

test('sem Java 8 para Mac ARM, a receita usa o de Mac Intel, e diz isso', () => {
  const r = local(m.resolverVersao(mc, '1.16.5', buscarDasFixtures()));
  assert.equal(r.porPlataforma['mac-aarch64'], r.porPlataforma['mac-x64']);
  assert.deepEqual(r.substituidas, { 'mac-aarch64': 'mac-x64' });
  // O mesmo pacote não entra duas vezes na oferta.
  const nomes = r.artefatos.map(a => a.nome);
  assert.equal(new Set(nomes).size, nomes.length);
});

test('uma versão que a Mojang não tem é dita pelo nome', () => {
  const r = local(m.resolverVersao(mc, '9.9.9', buscarDasFixtures()));
  assert.deepEqual(r, { ok: false, erro: 'versao-desconhecida', versao: '9.9.9' });
});

/** Um `buscar` em que a Mojang publica `texto` como o JSON da versão, com o sha1 do manifesto de acordo. */
function buscarComVersaoPublicada(id, texto) {
  const manifesto = JSON.parse(fixture('mojang-version_manifest_v2.json'));
  const entrada = manifesto.versions.find(v => v.id === id);
  entrada.sha1 = m.sha1Hex(texto);
  return buscarDasFixtures({ [mc.versoes.manifesto]: JSON.stringify(manifesto), [entrada.url]: texto });
}

test('uma URL fora das origens da receita é recusada antes de chegar à oferta', () => {
  const buscar = buscarDasFixtures();
  const manifesto = JSON.parse(buscar(mc.versoes.manifesto));
  const url = manifesto.versions.find(v => v.id === '1.21.4').url;
  const versao = JSON.parse(buscar(url));
  versao.downloads.server.url = 'https://espelho.qualquer.net/server.jar';
  const r = local(m.resolverVersao(mc, '1.21.4', buscarComVersaoPublicada('1.21.4', JSON.stringify(versao))));
  assert.deepEqual(r, { ok: false, erro: 'url-fora-das-origens', url: 'https://espelho.qualquer.net/server.jar', host: 'espelho.qualquer.net' });
});

test('uma versão sem servidor oficial é dita, e não vira oferta sem jar', () => {
  const buscar = buscarDasFixtures();
  const manifesto = JSON.parse(buscar(mc.versoes.manifesto));
  const url = manifesto.versions.find(v => v.id === '1.21.4').url;
  const versao = JSON.parse(buscar(url));
  delete versao.downloads.server;
  const r = local(m.resolverVersao(mc, '1.21.4', buscarComVersaoPublicada('1.21.4', JSON.stringify(versao))));
  assert.deepEqual(r, { ok: false, erro: 'versao-sem-servidor', versao: '1.21.4', url });
});

test('a oferta tem a forma que mundo.maquinas.pedir valida (OfertaDeMaquina)', () => {
  const resolvido = m.resolverVersao(mc, '1.21.4', buscarDasFixtures());
  const o = local(m.montarOferta(mc, { servidor: 'minecraft-1', versao: '1.21.4', porta: 25565 }, resolvido));
  assert.deepEqual(Object.keys(o).sort(), [
    'artefatos', 'disco_maximo', 'dominios_do_jogo', 'origens', 'pack', 'receita', 'rodar',
    'termos', 'titulo', 'tuneis', 'versao_da_receita', 'versao_do_jogo',
  ]);
  assert.equal(o.receita, 'minecraft');
  assert.equal(o.versao_da_receita, '1.0.0');
  assert.equal(o.versao_do_jogo, '1.21.4');
  assert.deepEqual(o.tuneis, [{ nome: 'minecraft-1', protocolo: 'tcp', porta: 25565 }]);
  assert.deepEqual(o.rodar, { comando: 'java/bin/java', argumentos: ['-Xms1G', '-Xmx2G', '-jar', 'server.jar', 'nogui'] });
  assert.deepEqual(o.termos, [{ titulo: 'EULA do Minecraft (Mojang)', url: 'https://aka.ms/MinecraftEULA' }]);
  assert.equal(o.pack, null);
  assert.ok(Buffer.byteLength(o.titulo) <= 64);
  assert.ok(o.artefatos.length <= 16);
  for (const a of o.artefatos) {
    assert.deepEqual(Object.keys(a).sort(), ['hash', 'nome', 'tamanho', 'url']);
    assert.match(a.url, /^https:\/\//);
    const host = new URL(a.url).host;
    assert.ok(o.origens.includes(host), host + ' fora das origens');
  }
  assert.ok(o.disco_maximo > mc.disco.mundoMaximo && o.disco_maximo <= 64 * 1024 ** 3);
});

test('a oferta não muda quando só a configuração muda', () => {
  // O aceite prende a oferta; um campo do esquema de configuração não pede aceite novo.
  const resolvido = m.resolverVersao(mc, '1.21.4', buscarDasFixtures());
  const a = JSON.stringify(m.montarOferta(mc, { servidor: 'minecraft-1', versao: '1.21.4', porta: 25565 }, resolvido));
  const b = JSON.stringify(m.montarOferta(mc, { servidor: 'minecraft-1', versao: '1.21.4', porta: 25565, config: { nome: 'Outro', maximo: 3 } }, resolvido));
  assert.equal(a, b);
});

test('a configuração padrão sai dos padrões da receita', () => {
  assert.deepEqual(local(m.configPadrao(mc)), {
    nome: 'Servidor do SEELE', cor: 'b', maximo: 10, dificuldade: 'normal', modo: 'survival',
    pvp: true, hardcore: false, protecao: 16, inativo: 0,
  });
});

test('a configuração é conferida contra o esquema da receita, com a frase por campo', () => {
  const r = local(m.validarConfig(mc, { nome: '', maximo: 500, dificuldade: 'pesadelo', pvp: 'sim', cor: 'b', modo: 'creative' }));
  assert.deepEqual(r.erros, {
    nome: 'Preencha este campo.',
    maximo: 'Use um número de 1 a 100.',
    dificuldade: 'Escolha uma das opções.',
    pvp: 'Use ligado ou desligado.',
  });
  const s = local(m.validarConfig(mc, { nome: 'x'.repeat(60) }));
  assert.deepEqual(s.erros, { nome: 'Use até 59 caracteres; este tem 60.' });
  const t = local(m.validarConfig(mc, { semente: '42' }));
  assert.deepEqual(t.erros, { semente: 'A receita não tem o campo «semente».' });
  const u = local(m.validarConfig(mc, { maximo: 2.5 }));
  assert.deepEqual(u.erros, { maximo: 'Use um número inteiro.' });
});

test('o que não veio fica com o que estava, e o que veio certo entra', () => {
  const r = local(m.validarConfig(mc, { maximo: 4 }, { ...m.configPadrao(mc), nome: 'Casa do Alê' }));
  assert.deepEqual(r.erros, {});
  assert.equal(r.config.maximo, 4);
  assert.equal(r.config.nome, 'Casa do Alê');
});

test('o server.properties sai do esquema, com a porta e o nome escapados', () => {
  const config = { ...local(m.configPadrao(mc)), nome: 'Casa do Alê', cor: '6', maximo: 4, pvp: false };
  const texto = m.escreverPropriedades(mc, config, 25566);
  const linhas = texto.split('\n');
  assert.ok(linhas[0].startsWith('#'), 'o arquivo diz quem o escreveu');
  assert.ok(linhas.includes('motd=\\u00a76Casa do Al\\u00ea'), texto);
  assert.ok(linhas.includes('max-players=4'));
  assert.ok(linhas.includes('pvp=false'));
  assert.ok(linhas.includes('server-port=25566'));
  assert.ok(linhas.includes('server-ip=127.0.0.1'), 'o jogo só escuta no túnel');
  assert.ok(linhas.includes('difficulty=normal'));
  assert.ok(linhas.includes('gamemode=survival'));
  assert.ok(linhas.includes('online-mode=true'));
  assert.ok(texto.endsWith('\n'));
});

test('um nome não escreve uma segunda propriedade no arquivo', () => {
  const config = { ...local(m.configPadrao(mc)), nome: 'a\nserver-ip=0.0.0.0' };
  const texto = m.escreverPropriedades(mc, config, 25565);
  assert.ok(!texto.split('\n').includes('server-ip=0.0.0.0'), texto);
  assert.ok(texto.includes('motd=\\u00a7ba\\nserver-ip=0.0.0.0'));
});

test('a saída do jogo diz quando ele está pronto, e quem entrou e saiu', () => {
  const casar = m.casarSaida(mc);
  assert.deepEqual(local(casar('[12:00:01] [Server thread/INFO]: Done (4.211s)! For help, type "help"')), { tipo: 'pronto' });
  assert.deepEqual(local(casar('[12:00:09] [Server thread/INFO]: Alexandre joined the game')), { tipo: 'entrou', jogador: 'Alexandre' });
  assert.deepEqual(local(casar('[12:05:09] [Server thread/INFO]: Alexandre left the game')), { tipo: 'saiu', jogador: 'Alexandre' });
  assert.equal(casar('[12:05:10] [Server thread/INFO]: <Alexandre> Done (brincadeira)'), null, 'o chat não liga o servidor');
  assert.equal(casar('[12:05:11] [Server thread/INFO]: <Bia> Ze joined the game'), null, 'o chat não põe ninguém dentro');
});

// ---- o sha1 do JSON de cada versão ----

const crypto = require('node:crypto');
const URL_1_21_4 = 'https://piston-meta.mojang.com/v1/packages/64843a304d7747da779448f853323962233f39ff/1.21.4.json';

test('o sha1 em JS puro dá o mesmo que o do Node, inclusive com acentos e além de um bloco', () => {
  const casos = ['', 'abc', 'é', 'Casa do Alê §', '😀 emoji', 'x'.repeat(55), 'x'.repeat(56), 'x'.repeat(64), 'y'.repeat(1000)];
  for (const texto of casos) {
    assert.equal(m.sha1Hex(texto), crypto.createHash('sha1').update(texto, 'utf8').digest('hex'), JSON.stringify(texto.slice(0, 20)));
  }
  assert.equal(m.sha1Hex('abc'), 'a9993e364706816aba3e25717850c26c9cd0d89d');
});

test('o JSON de cada versão bate com o sha1 do manifesto, nas três fixtures gravadas', () => {
  for (const id of ['26.3', '1.21.4', '1.16.5']) {
    const r = local(m.resolverVersao(mc, id, buscarDasFixtures()));
    assert.equal(r.ok, true, id + ' ' + JSON.stringify(r));
  }
});

test('um JSON de versão adulterado é recusado com a URL, o sha1 esperado e o obtido', () => {
  const original = fixture('mojang-1.21.4.json');
  const adulterado = original.replace('"majorVersion": 21', '"majorVersion": 8');
  assert.notEqual(adulterado, original, 'o teste não adulterou nada');
  const r = local(m.resolverVersao(mc, '1.21.4', buscarDasFixtures({ [URL_1_21_4]: adulterado })));
  assert.deepEqual(r, {
    ok: false,
    erro: 'sha1-diferente',
    url: URL_1_21_4,
    esperado: '64843a304d7747da779448f853323962233f39ff',
    obtido: crypto.createHash('sha1').update(adulterado, 'utf8').digest('hex'),
  });
});

test('um manifesto sem sha1 para a versão não deixa a conferência passar em branco', () => {
  const manifesto = JSON.parse(fixture('mojang-version_manifest_v2.json'));
  delete manifesto.versions.find(v => v.id === '1.21.4').sha1;
  const r = local(m.resolverVersao(mc, '1.21.4', buscarDasFixtures({ [mc.versoes.manifesto]: JSON.stringify(manifesto) })));
  assert.equal(r.ok, false);
  assert.equal(r.erro, 'manifesto-sem-sha1');
  assert.equal(r.url, URL_1_21_4);
});
