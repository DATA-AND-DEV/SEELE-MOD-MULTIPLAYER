// A oferta e o plano que a metade de servidor deste MOD dá a uma máquina
// aceita, para um Minecraft 1.21.4, montados pelo código de verdade
// (fonte/servidor.js, pelo anfitrião de test/anfitriao.cjs) sobre as fixtures
// byte a byte da Mojang e da Adoptium. É a entrada das duas provas com rede do
// SEELE (API 8 parte 4):
//
//   node ferramentas/plano-de-verdade.cjs /caminho/plano.json
//   SEELE_MINECRAFT_DE_VERDADE=/caminho/plano.json SEELE_MOD_MULTIPLAYER=$PWD \
//   SEELE_MINECRAFT_CASA=/uma/pasta cargo test -p seele-app --bin seele-app \
//     minecraft_de_verdade -- --ignored --nocapture
//   SEELE_MINECRAFT_DE_VERDADE=/caminho/plano.json cargo test -p seele-conformance \
//     --test minecraft_pelo_tunel -- --ignored --nocapture
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { criarAnfitriao } = require(path.join(__dirname, '..', 'test', 'anfitriao.cjs'));

const destino = process.argv[2];
// `--mods` (parte 6): o mesmo Minecraft com o pack de prova (Fabric 1.21.4,
// ferramentas/pack-de-prova.cjs), enviado ao volume como quem configura o
// envia; o plano leva `pack_local`, o .mrpack que o volume guardaria.
const comMods = process.argv.includes('--mods');
if (!destino || destino.startsWith('--')) throw new Error('uso: node ferramentas/plano-de-verdade.cjs <plano.json> [--mods]');
const a = criarAnfitriao();
const id = a.acao(1, 'criar-servidor-de-jogo', { op: 'criar', receita: 'minecraft' }).servidor.id;
const r = a.acao(1, 'configurar-servidor-de-jogo', {
  op: 'configurar', id, versao: '1.21.4', quem: '2', variante: comMods ? 'com-mods' : 'vanilla',
  config: { nome: [{ texto: 'Casa', cor: 'aqua' }, { texto: comMods ? 'com mods' : 'do SEELE', cor: 'gold' }], maximo: 4 },
});
if (!r.ok) throw new Error(JSON.stringify(r));
let packLocal = null;
if (comMods) {
  packLocal = path.join(__dirname, '..', 'test', 'fixtures', 'fabric-prova.mrpack');
  const e = a.acao(1, 'configurar-servidor-de-jogo', { op: 'pack-enviar', id });
  a.enviarAoVolume(e.token, fs.readFileSync(packLocal));
  const c = a.acao(1, 'configurar-servidor-de-jogo', { op: 'pack-chegou', id, token: e.token });
  if (!c.ok) throw new Error(JSON.stringify(c));
}
a.acao(1, 'ligar-desligar-servidor-de-jogo', { op: 'ligar', id });
a.aceitar(id);
const oferta = a.pedidosDeMaquina.at(-1).oferta;
const plano = a.daMaquina(2, id, { op: 'plano' });
if (!plano.ok) throw new Error(JSON.stringify(plano));
fs.writeFileSync(destino, JSON.stringify({ servidor: id, oferta, plano: plano.plano, ...(packLocal ? { pack_local: packLocal } : {}) }, null, 1));
console.log(`${id}: ${oferta.artefatos.length} artefatos na oferta, plano com ligar=${plano.plano.ligar}`);
