// Carrega as fontes de uma metade num `vm`, sem o invólucro do build, e devolve
// os nomes pedidos. É o mesmo código que o build escreve (ferramentas/montar.cjs).
'use strict';
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const { corpo, RAIZ } = require('../ferramentas/montar.cjs');

/**
 * @param {string} metade servidor, maquina ou cliente
 * @param {string[]} nomes o que expor do escopo das fontes
 * @param {object} globais o ambiente (mundo, dados, SeeleUI...)
 * @param {object} opcoes { receitas } para trocar as receitas embutidas
 */
function carregar(metade, nomes, globais = {}, opcoes = {}) {
  const contexto = vm.createContext({ console, ...globais });
  const codigo = corpo(metade, opcoes) + `\n;globalThis.__expostos = { ${nomes.join(', ')} };`;
  vm.runInContext(codigo, contexto, { filename: metade + '.js' });
  return { ...contexto.__expostos, contexto };
}

const fixture = nome => fs.readFileSync(path.join(RAIZ, 'test', 'fixtures', nome), 'utf8');
const receitaDoDisco = nome => JSON.parse(fs.readFileSync(path.join(RAIZ, 'receitas', nome + '.json'), 'utf8'));

/** Um `buscar` que só conhece as fixtures: nada sai para a rede num teste. */
function buscarDasFixtures(extra = {}) {
  const mapa = {
    'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json': 'mojang-version_manifest_v2.json',
    'https://api.adoptium.net/v3/assets/latest/8/hotspot?image_type=jre&vendor=eclipse': 'adoptium-8.json',
    'https://api.adoptium.net/v3/assets/latest/21/hotspot?image_type=jre&vendor=eclipse': 'adoptium-21.json',
    'https://api.adoptium.net/v3/assets/latest/25/hotspot?image_type=jre&vendor=eclipse': 'adoptium-25.json',
  };
  const manifesto = JSON.parse(fixture('mojang-version_manifest_v2.json'));
  for (const id of ['26.3', '1.21.4', '1.16.5']) {
    mapa[manifesto.versions.find(v => v.id === id).url] = `mojang-${id}.json`;
  }
  const pedidos = [];
  const buscar = url => {
    pedidos.push(url);
    if (url in extra) return extra[url];
    return mapa[url] ? fixture(mapa[url]) : null;
  };
  buscar.pedidos = pedidos;
  return buscar;
}

module.exports = { carregar, fixture, receitaDoDisco, buscarDasFixtures };
