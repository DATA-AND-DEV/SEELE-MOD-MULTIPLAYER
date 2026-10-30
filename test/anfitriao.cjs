// O anfitrião da metade de servidor, simulado pelo que a API 8 diz
// (test/contrato/api-v8.json): `aoPedir` com o contexto do servidor, o portão
// das ações (cargos), `dados` transacional, `mundo.avisar` e `mundo.maquinas`
// declarativos (só saem se a chamada termina), os momentos `MaquinaAceitou`,
// `MaquinaRecusou` e `MaquinaParou`, e o `contexto.maquina` que só a máquina
// aceita recebe.
//
// O que ele não prova: o executor de verdade, os tetos de tempo e de memória e
// a tela de aceite do produto. Para o motor, há o ferramentas/quickjs-check.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { buscarDasFixtures } = require('./carregar.cjs');
const { montar } = require('../ferramentas/montar.cjs');

const RAIZ = path.resolve(__dirname, '..');
const manifesto = JSON.parse(fs.readFileSync(path.join(RAIZ, 'mod.json'), 'utf8'));
const DECLARADAS = manifesto.permissoes.map(p => p.acao);
const CHAVES_DA_OFERTA = ['titulo', 'receita', 'versao_da_receita', 'versao_do_jogo', 'tuneis', 'artefatos', 'pack', 'origens', 'dominios_do_jogo', 'rodar', 'disco_maximo', 'termos'];
const servidorValido = s => typeof s === 'string' && s.length <= 32 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s);

/**
 * @param {object} opcoes
 *   codigo: o código da metade de servidor (padrão: o que o build escreveria agora)
 *   buscar: o `mundo.buscar` (padrão: as fixtures)
 *   concessoes: pessoa -> ações que ela tem (padrão: a pessoa 1 tem todas, e todos têm entrar-no-jogo)
 */
function criarAnfitriao(opcoes = {}) {
  const codigo = opcoes.codigo ?? montar('servidor');
  const buscar = opcoes.buscar ?? buscarDasFixtures();
  const concessoes = new Map(Object.entries(opcoes.concessoes ?? { 1: DECLARADAS }));
  const todos = manifesto.permissoes.filter(p => p.todos).map(p => p.acao);
  const temAcao = (pessoa, acao) => todos.includes(acao) || (concessoes.get(String(pessoa)) ?? []).includes(acao);

  let dados = {};
  let agora = 1_000_000;
  const registro = [];
  const avisosAJanelas = [];
  const avisosAMaquinas = [];
  const pedidosDeMaquina = [];
  /** O livro do produto: servidor de jogo -> { quem, oferta, aceito }. */
  const livro = new Map();
  const conectados = new Set(opcoes.conectados ?? ['1', '2', '3']);

  // A cada chamada, o que ela declarou; só sai se ela terminar.
  let declarado = null;
  const mundo = {
    agora: () => agora,
    registrar: texto => registro.push(String(texto)),
    buscar: url => buscar(url),
    avisar: aviso => {
      assert.ok(aviso && typeof aviso === 'object', 'aviso-invalido');
      assert.ok(Buffer.byteLength(JSON.stringify(aviso.carga)) <= 1024, 'aviso-grande-demais: ' + JSON.stringify(aviso.carga));
      declarado.janelas.push(JSON.parse(JSON.stringify(aviso)));
      return { ok: true };
    },
    maquinas: {
      pedir: pedido => {
        if (!pedido || typeof pedido !== 'object') throw new Error('pedido-invalido');
        if (!servidorValido(pedido.servidor)) throw new Error('servidor-invalido');
        if (!/^[1-9][0-9]*$/.test(String(pedido.quem))) throw new Error('quem-invalido');
        const oferta = pedido.oferta;
        if (!oferta || typeof oferta !== 'object') throw new Error('oferta-invalida:oferta');
        const estranha = Object.keys(oferta).find(k => !CHAVES_DA_OFERTA.includes(k));
        if (estranha) throw new Error('oferta-invalida:' + estranha);
        if (Buffer.byteLength(oferta.titulo) > 64) throw new Error('oferta-invalida:titulo');
        if (oferta.artefatos.length > 16) throw new Error('oferta-invalida:artefatos');
        for (const a of oferta.artefatos) {
          if (!/^https:\/\/\S+$/.test(a.url)) throw new Error('oferta-invalida:artefato_url');
          const tam = { sha1: 40, sha256: 64, sha512: 128 }[a.hash.algoritmo];
          if (!tam || a.hash.hex.length !== tam) throw new Error('oferta-invalida:artefato_hash');
        }
        if (oferta.disco_maximo > 64 * 1024 ** 3) throw new Error('oferta-invalida:disco_maximo');
        declarado.maquinas = declarado.maquinas.filter(p => p.servidor !== pedido.servidor);
        declarado.maquinas.push(JSON.parse(JSON.stringify({ quem: String(pedido.quem), servidor: pedido.servidor, oferta })));
      },
      avisar: aviso => {
        if (!servidorValido(aviso?.servidor)) throw new Error('servidor-invalido');
        if (aviso.carga === undefined) throw new Error('aviso-invalido');
        assert.ok(Buffer.byteLength(JSON.stringify(aviso.carga)) <= 1024, 'aviso-grande-demais');
        declarado.avisos = declarado.avisos.filter(a => a.servidor !== aviso.servidor);
        declarado.avisos.push(JSON.parse(JSON.stringify(aviso)));
      },
    },
  };
  const contexto = vm.createContext({ console, mundo, dados: {} });
  vm.runInContext(codigo, contexto, { filename: 'servidor/main.js' });
  assert.equal(typeof contexto.aoPedir, 'function', 'a metade de servidor não define aoPedir');

  /** Uma chamada, transacional como a do produto. */
  function chamar(fn) {
    declarado = { janelas: [], maquinas: [], avisos: [] };
    const antes = JSON.stringify(dados);
    contexto.dados = Object.assign(Object.create(null), dados);
    let resultado;
    try {
      resultado = fn();
    } catch (erro) {
      dados = JSON.parse(antes);
      declarado = null;
      throw erro;
    }
    for (const [k, v] of Object.entries(contexto.dados)) assert.equal(typeof v, 'string', `dados.${k} não é texto`);
    const uso = Object.entries(contexto.dados).reduce((n, [k, v]) => n + Buffer.byteLength(k) + Buffer.byteLength(v), 0);
    assert.ok(uso <= 256 * 1024, 'quintal-cheio: ' + uso);
    dados = { ...contexto.dados };
    avisosAJanelas.push(...declarado.janelas);
    for (const p of declarado.maquinas) {
      pedidosDeMaquina.push(p);
      if (!conectados.has(p.quem)) {
        momentoInterno('MaquinaRecusou', { servidor: p.servidor, pessoa: p.quem, motivo: 'nao-esta-aqui' });
        continue;
      }
      // Um pedido a outra pessoa dispensa a máquina de antes.
      const antes = livro.get(p.servidor);
      livro.set(p.servidor, { quem: p.quem, oferta: p.oferta, aceito: false });
      if (antes && antes.quem !== p.quem && antes.aceito) {
        momentoInterno('MaquinaParou', { servidor: p.servidor, pessoa: antes.quem, motivo: 'outro-pedido' });
      }
    }
    for (const a of declarado.avisos) {
      const maquina = livro.get(a.servidor);
      if (maquina?.aceito) avisosAMaquinas.push({ ...a, para: maquina.quem });
      else registro.push('sem-maquina: ' + a.servidor);
    }
    declarado = null;
    return resultado;
  }

  const fila = [];
  function momentoInterno(nome, carga) {
    fila.push([nome, carga]);
  }
  function escoar() {
    while (fila.length) {
      const [nome, carga] = fila.shift();
      if (typeof contexto.aoAcontecer === 'function') chamar(() => contexto.aoAcontecer(nome, JSON.stringify(carga)));
    }
  }

  return {
    get dados() { return dados; },
    registro, avisosAJanelas, avisosAMaquinas, pedidosDeMaquina, livro, conectados, concessoes,
    passar(segundos) { agora += segundos; },

    /** Um `SeeleMods.request`: sem ação, o contexto.acao é null. */
    pedir(pessoa, valor) {
      const ctx = { person: String(pessoa), channel: null, admin: String(pessoa) === '1', write: true, sala: null, acao: null, permissoes: DECLARADAS.filter(a => temAcao(pessoa, a)) };
      const r = chamar(() => contexto.aoPedir(JSON.stringify(ctx), JSON.stringify(valor)));
      escoar();
      return JSON.parse(r);
    },

    /** Um `SeeleMods.acao`: o portão dos cargos vem antes, e o MOD nem é chamado sem a permissão. */
    acao(pessoa, acao, valor) {
      if (!DECLARADAS.includes(acao)) return { ok: false, recusa: 'acao-nao-declarada' };
      if (!temAcao(pessoa, acao)) return { ok: false, recusa: 'sem-permissao' };
      const ctx = { person: String(pessoa), channel: null, admin: String(pessoa) === '1', write: true, sala: null, acao, permissoes: DECLARADAS.filter(a => temAcao(pessoa, a)) };
      const r = chamar(() => contexto.aoPedir(JSON.stringify(ctx), JSON.stringify(valor)));
      escoar();
      return JSON.parse(r);
    },

    /** Um `PedidoDaMaquina`: só a máquina aceita daquele servidor de jogo chega ao MOD. */
    daMaquina(pessoa, servidor, valor) {
      const maquina = livro.get(servidor);
      if (!maquina || !maquina.aceito || maquina.quem !== String(pessoa)) return { dispensada: 'sem-aceite' };
      const ctx = { person: String(pessoa), channel: null, admin: false, write: true, sala: null, acao: null, permissoes: [], maquina: { servidor } };
      const r = chamar(() => contexto.aoPedir(JSON.stringify(ctx), JSON.stringify(valor)));
      escoar();
      return JSON.parse(r);
    },

    /** A pessoa da máquina aceita, na tela do produto. */
    aceitar(servidor) {
      const maquina = livro.get(servidor);
      assert.ok(maquina, 'ninguém foi chamado a rodar ' + servidor);
      maquina.aceito = true;
      momentoInterno('MaquinaAceitou', { servidor, pessoa: maquina.quem });
      escoar();
    },
    recusar(servidor, motivo = 'pelo-dono') {
      const maquina = livro.get(servidor);
      livro.delete(servidor);
      momentoInterno('MaquinaRecusou', { servidor, pessoa: maquina.quem, motivo });
      escoar();
    },
    /** O botão do produto que desliga, ou a pessoa que sai. */
    parar(servidor, motivo = 'pelo-dono') {
      const maquina = livro.get(servidor);
      livro.delete(servidor);
      momentoInterno('MaquinaParou', { servidor, pessoa: maquina.quem, motivo });
      escoar();
    },
  };
}

module.exports = { criarAnfitriao, DECLARADAS };
