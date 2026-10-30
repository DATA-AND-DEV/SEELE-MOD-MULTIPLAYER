// O formato de receita, e o validador que o confere.
//
// A receita é a porta da comunidade: ela chega por pull request, e o validador
// é o que responde a quem a escreveu. Uma chave errada que fosse ignorada
// instalaria calada uma receita que não faz o que o autor quis — por isso toda
// chave desconhecida é recusada pelo nome, com o caminho até ela.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { carregar, receitaDoDisco } = require('./carregar.cjs');

const { validarReceita } = carregar('servidor', ['validarReceita']);
const minecraft = () => receitaDoDisco('minecraft');
const erros = receita => [...validarReceita(receita).erros];

test('a receita do Minecraft passa', () => {
  assert.deepEqual(erros(minecraft()), []);
});

test('uma chave desconhecida no topo é recusada pelo nome', () => {
  const r = minecraft();
  r.vesao = '1.0.0';
  assert.deepEqual(erros(r), ['receita: chave desconhecida «vesao»']);
});

test('uma chave desconhecida lá dentro é recusada com o caminho até ela', () => {
  const r = minecraft();
  r.configuracao.campos[2].maxmo = 50;
  assert.deepEqual(erros(r), ['receita.configuracao.campos[2]: chave desconhecida «maxmo»']);
  const s = minecraft();
  s.artefatos[1].plataformas[0].sistema = 'windows';
  assert.deepEqual(erros(s), ['receita.artefatos[1].plataformas[0]: chave desconhecida «sistema»']);
  const t = minecraft();
  t.mundo.salvar[1].esperra = 'x';
  assert.deepEqual(erros(t), ['receita.mundo.salvar[1]: chave desconhecida «esperra»']);
});

test('falta de chave obrigatória é dita pelo nome', () => {
  const r = minecraft();
  delete r.mundo.salvar;
  assert.deepEqual(erros(r), ['receita.mundo: falta a chave «salvar»']);
  const s = minecraft();
  delete s.saida;
  assert.deepEqual(erros(s), ['receita: falta a chave «saida»']);
});

test('tipos, valores fechados e padrões são conferidos', () => {
  const r = minecraft();
  r.rede.protocolo = 'quic';
  r.rede.portaPadrao = '25565';
  r.origens.push('https://cdn.exemplo.com');
  assert.deepEqual(erros(r), [
    'receita.origens[4]: «https://cdn.exemplo.com» não tem a forma pedida',
    'receita.rede.protocolo: «quic» não é um dos valores aceitos (tcp, udp)',
    'receita.rede.portaPadrao: devia ser integer',
  ]);
});

test('um caminho com .. ou absoluto é recusado', () => {
  for (const ruim of ['../fora', '/etc/passwd', 'java/../../x', '..']) {
    const r = minecraft();
    r.rodar.comando = ruim;
    assert.deepEqual(erros(r), [`receita.rodar.comando: «${ruim}» não tem a forma pedida`], ruim);
  }
});

test('o modelo de uma propriedade só usa campos declarados e a porta', () => {
  const r = minecraft();
  r.configuracao.propriedades['level-seed'] = '{semente}';
  assert.deepEqual(erros(r), ['receita.configuracao.propriedades.level-seed: «{semente}» não é campo da receita nem {porta}']);
});

test('o padrão de cada campo tem de servir à forma dele', () => {
  const r = minecraft();
  r.configuracao.campos[3].padrao = 'impossivel';
  r.configuracao.campos[2].padrao = 500;
  r.configuracao.campos[5].padrao = 'sim';
  assert.deepEqual(erros(r), [
    'receita.configuracao.campos[2].padrao: 500 fora de 1 a 100',
    'receita.configuracao.campos[3].padrao: «impossivel» não é uma das opções',
    'receita.configuracao.campos[5].padrao: um interruptor tem padrão true ou false',
  ]);
});

test('uma escolha sem opções e um número sem limites são recusados', () => {
  const r = minecraft();
  delete r.configuracao.campos[1].opcoes;
  delete r.configuracao.campos[2].minimo;
  assert.deepEqual(erros(r), [
    'receita.configuracao.campos[1]: uma escolha precisa de «opcoes»',
    'receita.configuracao.campos[2]: um número precisa de «minimo» e «maximo»',
  ]);
});

test('chaves de campo repetidas são recusadas', () => {
  const r = minecraft();
  r.configuracao.campos[4].chave = 'modoDeJogo';
  r.configuracao.campos[3].chave = 'modoDeJogo';
  r.configuracao.propriedades.difficulty = '{modoDeJogo}';
  r.configuracao.propriedades.gamemode = '{modoDeJogo}';
  assert.deepEqual(erros(r), ['receita.configuracao.campos[4].chave: «modoDeJogo» repetida']);
});

test('as expressões da saída compilam, e entrou e saiu têm um grupo só', () => {
  const r = minecraft();
  r.saida.pronto = 'Done (';
  r.saida.entrou = '\\]: [A-Za-z0-9_]+ joined';
  assert.deepEqual(erros(r), [
    'receita.saida.pronto: não é uma expressão regular válida',
    'receita.saida.entrou: precisa de exatamente um grupo de captura (o nome de quem joga)',
  ]);
});

test('o salvamento seguro precisa copiar o mundo, e cada passo faz uma coisa', () => {
  const r = minecraft();
  r.mundo.salvar = [{ console: 'save-all' }];
  assert.deepEqual(erros(r), ['receita.mundo.salvar: nenhum passo copia o mundo']);
  const s = minecraft();
  s.mundo.salvar[0] = { console: 'save-off', copiar: 'world' };
  assert.deepEqual(erros(s), ['receita.mundo.salvar[0]: um passo é «console» ou «copiar», não os dois']);
  const t = minecraft();
  t.mundo.salvar[0] = {};
  assert.deepEqual(erros(t), ['receita.mundo.salvar[0]: um passo é «console» ou «copiar»']);
});

test('cada fonte de artefato pede o que ela usa', () => {
  const r = minecraft();
  delete r.artefatos[1].consulta;
  assert.deepEqual(erros(r), ['receita.artefatos[1]: a fonte adoptium precisa de «consulta», «majorPadrao» e «plataformas»']);
  const s = minecraft();
  s.artefatos[1].plataformas[1].senaoHouver = 'windows-aarch64';
  assert.deepEqual(erros(s), ['receita.artefatos[1].plataformas[1].senaoHouver: «windows-aarch64» não é uma das plataformas da receita']);
  const t = minecraft();
  t.versoes = { fonte: 'mojang' };
  assert.deepEqual(erros(t), ['receita.versoes: a fonte mojang precisa de «manifesto», «tipos» e «quantas»']);
});

test('a URL de um artefato fixo tem de cair numa das origens', () => {
  const r = minecraft();
  r.versoes = { fonte: 'fixo', lista: [{ id: '1.0' }] };
  r.artefatos = [{
    id: 'servidor', fonte: 'fixo', destino: 'server.bin',
    porVersao: { '1.0': { url: 'https://cdn.estranho.net/x.bin', hash: { algoritmo: 'sha256', hex: 'a'.repeat(64) }, tamanho: 10 } },
  }];
  assert.deepEqual(erros(r), ['receita.artefatos[0].porVersao.1.0.url: cdn.estranho.net não está nas origens']);
});

test('o hash fixo tem o tamanho do algoritmo, e cada versão fixa tem o artefato', () => {
  const r = minecraft();
  r.origens.push('cdn.jogo.net');
  r.versoes = { fonte: 'fixo', lista: [{ id: '1.0' }, { id: '2.0' }] };
  r.artefatos = [{
    id: 'servidor', fonte: 'fixo', destino: 'server.bin',
    porVersao: { '1.0': { url: 'https://cdn.jogo.net/x.bin', hash: { algoritmo: 'sha256', hex: 'ab' }, tamanho: 10 } },
  }];
  assert.deepEqual(erros(r), [
    'receita.artefatos[0].porVersao.1.0.hash: sha256 tem 64 caracteres, este tem 2',
    'receita.artefatos[0]: a versão «2.0» não tem artefato fixo',
  ]);
});

test('o validador não lança com qualquer lixo, e diz o que achou', () => {
  for (const lixo of [null, 42, 'receita', [], { formato: 2 }]) {
    const r = validarReceita(lixo);
    assert.equal(r.ok, false);
    assert.ok(r.erros.length > 0, JSON.stringify(lixo));
  }
});

test('a receita do disco é a que o build embute', () => {
  const { RECEITAS } = carregar('servidor', ['RECEITAS']);
  assert.deepEqual(JSON.parse(JSON.stringify(RECEITAS)), [minecraft()]);
});
