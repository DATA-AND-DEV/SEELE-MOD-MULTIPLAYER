// O `.mrpack` de prova (API 8 parte 6): um Fabric 1.21.4 pequeno e de
// verdade, com três mods reais do Modrinth — Fabric API e Lithium (que rodam
// no servidor) e Sodium (`env.server: unsupported`, que a máquina não baixa) —,
// um `overrides` e um `server-overrides` que troca um arquivo dele. Os
// arquivos, as URLs, os tamanhos e os hashes são os que a API do Modrinth deu
// em 31/10/2026 (`test/fixtures/modrinth-*.json`).
//
//   node ferramentas/pack-de-prova.cjs test/fixtures/fabric-prova.mrpack
//
// É o pack das fixtures dos testes e o das duas provas com rede do SEELE.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { escreverZip } = require(path.join(__dirname, '..', 'test', 'zip.cjs'));

const FIXTURES = path.join(__dirname, '..', 'test', 'fixtures');
const arquivo = (projeto, env) => {
  const v = JSON.parse(fs.readFileSync(path.join(FIXTURES, `modrinth-${projeto}.json`), 'utf8'))[0];
  const f = v.files.find(x => x.primary);
  return { path: 'mods/' + f.filename, hashes: { sha1: f.hashes.sha1, sha512: f.hashes.sha512 }, env, downloads: [f.url], fileSize: f.size };
};

function indiceDeProva() {
  return {
    formatVersion: 1,
    game: 'minecraft',
    versionId: '1.0.0',
    name: 'Prova do SEELE',
    summary: 'Fabric 1.21.4 com Fabric API e Lithium, para as provas do MOD de multiplayer.',
    files: [
      arquivo('fabric-api', { client: 'required', server: 'required' }),
      arquivo('lithium', { client: 'optional', server: 'optional' }),
      arquivo('sodium', { client: 'required', server: 'unsupported' }),
    ],
    dependencies: { minecraft: '1.21.4', 'fabric-loader': '0.16.14' },
  };
}

function packDeProva() {
  const indice = indiceDeProva();
  return escreverZip([
    ['modrinth.index.json', JSON.stringify(indice, null, 2) + '\n', true],
    ['overrides/config/seele-prova.txt', 'de overrides\n', false],
    ['overrides/config/so-overrides.txt', 'fica\n', false],
    ['server-overrides/config/seele-prova.txt', 'de server-overrides\n', true],
  ]);
}

module.exports = { packDeProva, indiceDeProva };

if (require.main === module) {
  const destino = process.argv[2];
  if (!destino) throw new Error('uso: node ferramentas/pack-de-prova.cjs <destino.mrpack>');
  fs.writeFileSync(destino, packDeProva());
  // O índice ao lado, em texto: o que o QuickJS check entrega a quem pede.
  fs.writeFileSync(destino.replace(/\.mrpack$/, '.index.json'), JSON.stringify(indiceDeProva(), null, 2) + '\n');
  console.log(`${destino}: ${fs.statSync(destino).size} bytes`);
}
