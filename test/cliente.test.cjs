// A metade de cliente: o seletor de jogos, a configuração em quatro abas
// (GERAL · MODS · JOGADORES · MÁQUINA, o desenho config-layout-v2), e o cartão
// de quem joga, com o «entrar» que abre o túnel de dentro do clique.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { criarAnfitriao } = require('./anfitriao.cjs');
const { criarJanela, nos } = require('./janela.cjs');

async function aberta(opcoes = {}) {
  const a = opcoes.anfitriao ?? criarAnfitriao();
  const j = criarJanela(a, opcoes);
  await j.abrir();
  assert.deepEqual(j.erros, [], 'a janela anotou erros ao abrir');
  return { a, j };
}

/** Um Minecraft criado, com versão e máquina escolhidas e aceito, ligado e com gente. */
function servidorLigado() {
  const a = criarAnfitriao();
  const id = a.acao(1, 'criar-servidor-de-jogo', { op: 'criar', receita: 'minecraft' }).servidor.id;
  a.acao(1, 'configurar-servidor-de-jogo', { op: 'configurar', id, versao: '1.21.4', quem: '2', config: { nome: 'Casa do Alê' } });
  a.aceitar(id);
  a.acao(1, 'ligar-desligar-servidor-de-jogo', { op: 'ligar', id });
  a.daMaquina(2, id, { op: 'estado', estado: 'ligado', jogadores: ['Bia', 'Ze'] });
  return { a, id };
}

test('a entrada «Multiplayer» fica na navegação do servidor', async () => {
  const { j } = await aberta();
  assert.deepEqual(j.contribuicoes.map(c => [c.ponto, c.modo, c.rotulo, c.acaoPrincipal]), [['servidor.navegacao', 'adicionar', 'Multiplayer', 'abrir-multiplayer']]);
  assert.ok(j.pagina()?.visivel, 'a página não abriu');
});

test('o seletor mostra as receitas para criar, e diz quando quem vê não pode criar', async () => {
  const { j } = await aberta();
  assert.match(j.texto(), /CRIAR UM SERVIDOR/);
  assert.match(j.texto('receita:minecraft'), /Minecraft/);
  assert.equal(j.no('criar:minecraft').desligado, false);
  const { j: k } = await aberta({ pessoa: 3 });
  assert.equal(k.no('criar:minecraft').desligado, true);
  assert.match(k.texto('receita:minecraft'), /permissão «Criar um servidor de jogo»/);
});

test('criar abre a configuração, na aba GERAL, com Vanilla e Com mods no topo', async () => {
  const { j } = await aberta();
  await j.apertar('criar:minecraft');
  assert.deepEqual(j.acoes.map(x => x.acao), ['criar-servidor-de-jogo']);
  const abas = j.no('aba');
  assert.equal(abas.forma, 'abas');
  assert.equal(abas.valor, 'aba-geral');
  assert.deepEqual(abas.dentro.map(x => x.rotulo), ['GERAL', 'MODS', 'JOGADORES', 'MÁQUINA']);
  // As duas opções grandes, lado a lado, antes de qualquer campo.
  const geral = nos(abas.dentro[0]);
  const vanilla = geral.findIndex(n => n.chave === 'variante:vanilla');
  const comMods = geral.findIndex(n => n.chave === 'variante:com-mods');
  const primeiroCampo = geral.findIndex(n => ['campo', 'numero', 'escolha', 'interruptor'].includes(n.forma));
  assert.ok(vanilla > 0 && comMods > vanilla && comMods < primeiroCampo, 'Vanilla e Com mods não estão no topo');
  assert.match(j.texto('variante:vanilla'), /Minecraft puro, sem mods/);
  assert.equal(j.no('variante:com-mods').desligado, true);
  assert.match(j.texto('variante:com-mods'), /chega na próxima versão/);
  assert.match(j.texto('titulo'), /MINECRAFT · SERVIDOR DO SEELE/);
});

test('a aba GERAL monta os campos da receita, com as três regras lado a lado', async () => {
  const { j } = await aberta();
  await j.apertar('criar:minecraft');
  for (const chave of ['versao', 'cfg:nome', 'cfg:cor', 'cfg:maximo', 'cfg:dificuldade', 'cfg:modo', 'cfg:pvp', 'so-seele']) {
    assert.ok(j.no(chave), `falta «${chave}» na aba GERAL`);
  }
  const grade = nos(j.pagina().arvore).find(n => n.chave === 'grupo:regras');
  assert.equal(grade.forma, 'grade');
  assert.equal(grade.estilo.colunas, 3);
  assert.deepEqual(nos(grade).filter(n => n.chave?.startsWith('cfg:')).map(n => n.chave), ['cfg:maximo', 'cfg:dificuldade', 'cfg:modo']);
  assert.equal(j.no('cfg:dificuldade').valor, 'normal');
  assert.deepEqual(j.no('cfg:modo').opcoes.map(o => o.dentro), ['Sobrevivência', 'Criativo', 'Aventura', 'Espectador']);
  // As versões vêm da Mojang, pela metade de servidor.
  assert.equal(j.no('versao').opcoes[0].valor, '26.3');
  // «Só entra quem está neste servidor SEELE» é o túnel, e vale sempre nesta versão.
  assert.equal(j.no('so-seele').valor, true);
  assert.equal(j.no('so-seele').desligado, true);
});

test('salvar manda a configuração pela ação, e a recusa volta ao campo dela', async () => {
  const { a, j } = await aberta();
  await j.apertar('criar:minecraft');
  await j.mudar('numero', 'cfg:maximo', 500);
  await j.mudar('campo', 'cfg:nome', 'Casa do Alê');
  await j.apertar('salvar');
  const pedido = j.acoes.at(-1);
  assert.equal(pedido.acao, 'configurar-servidor-de-jogo');
  assert.equal(pedido.valor.config.maximo, 500);
  assert.equal(j.no('cfg:maximo').erro, 'Use um número de 1 a 100.');
  await j.mudar('numero', 'cfg:maximo', 6);
  await j.apertar('salvar');
  assert.equal(j.no('cfg:maximo').erro, undefined);
  const s = a.pedir(1, { op: 'estado' }).servidores[0];
  assert.equal(s.config.maximo, 6);
  assert.equal(s.config.nome, 'Casa do Alê');
});

test('escolher a máquina na aba MÁQUINA mostra o aceite que se espera', async () => {
  const { a, j } = await aberta();
  await j.apertar('criar:minecraft');
  await j.mudar('escolha', 'versao', '1.21.4');
  await j.mudar('aba', 'aba', 'aba-maquina');
  await j.mudar('escolha', 'quem', '2');
  await j.apertar('salvar');
  assert.equal(a.pedidosDeMaquina.at(-1).quem, '2');
  assert.match(j.texto('roda-em'), /Fulano/);
  assert.match(j.texto('chip-aceite'), /ESPERANDO O ACEITE DE FULANO/);
  // O que a pessoa da máquina vai aceitar, dito também aqui.
  assert.match(j.texto('o-que-roda'), /server\.jar/);
  a.aceitar(a.pedidosDeMaquina.at(-1).servidor);
  await j.avisoDoServidor({ revisao: 99 });
  assert.match(j.texto('chip-aceite'), /ACEITO/);
});

test('a aba MODS diz que com mods chega na próxima versão', async () => {
  const { j } = await aberta();
  await j.apertar('criar:minecraft');
  await j.mudar('aba', 'aba', 'aba-mods');
  assert.match(j.texto('aba-mods'), /com mods chega na próxima versão/i);
});

test('a aba JOGADORES mostra quem está dentro, e os campos dela', async () => {
  const { a, id } = servidorLigado();
  const { j } = await aberta({ anfitriao: a });
  await j.apertar('configurar:' + id);
  await j.mudar('aba', 'aba', 'aba-jogadores');
  assert.match(j.texto('aba-jogadores'), /2 de 10/);
  assert.match(j.texto('aba-jogadores'), /Bia/);
  assert.ok(j.no('cfg:hardcore') && j.no('cfg:protecao') && j.no('cfg:inativo'));
});

test('o cartão de quem joga diz ligado, quantos estão dentro, e o entrar abre o túnel de dentro do clique', async () => {
  const { a, id } = servidorLigado();
  const { j } = await aberta({ anfitriao: a, pessoa: 3 });
  const cartao = j.texto('cartao:' + id);
  assert.match(cartao, /LIGADO/);
  assert.match(cartao, /2 de 10 jogando/);
  assert.match(cartao, /Casa do Alê/);
  await j.apertar('entrar:' + id);
  assert.equal(j.entradas.length, 1);
  assert.ok(j.entradas[0].bilhete, 'o entrar saiu sem o bilhete do clique: depois de um await, ou fora do botão');
  assert.equal(j.entradas[0].nome, id);
  assert.match(j.texto('cartao:' + id), /localhost:25565/);
});

test('a porta trocada pelo produto é a que o cartão mostra', async () => {
  const { a, id } = servidorLigado();
  const { j } = await aberta({ anfitriao: a, pessoa: 3, portaLocal: 25570 });
  await j.apertar('entrar:' + id);
  assert.match(j.texto('cartao:' + id), /localhost:25570/);
});

test('a recusa do túnel fica no cartão, com o nome e a frase', async () => {
  const { a, id } = servidorLigado();
  const { j } = await aberta({ anfitriao: a, pessoa: 3, portaOcupada: true });
  await j.apertar('entrar:' + id);
  const cartao = j.texto('cartao:' + id);
  assert.match(cartao, /porta-local-ocupada/);
  assert.match(cartao, /ocupadas/);
});

test('um servidor desligado não oferece entrar', async () => {
  const a = criarAnfitriao();
  const id = a.acao(1, 'criar-servidor-de-jogo', { op: 'criar', receita: 'minecraft' }).servidor.id;
  const { j } = await aberta({ anfitriao: a, pessoa: 3 });
  assert.match(j.texto('cartao:' + id), /DESLIGADO/);
  assert.equal(j.no('entrar:' + id)?.desligado ?? true, true);
  assert.equal(j.no('configurar:' + id), null, 'quem só joga não configura');
});

test('ligar pede a ação, e a resposta «esperando o aceite» é dita', async () => {
  const { a, j } = await aberta();
  await j.apertar('criar:minecraft');
  await j.mudar('escolha', 'versao', '1.21.4');
  await j.mudar('aba', 'aba', 'aba-maquina');
  await j.mudar('escolha', 'quem', '2');
  await j.apertar('salvar');
  await j.mudar('aba', 'aba', 'aba-geral');
  await j.apertar('ligar');
  assert.equal(j.acoes.at(-1).acao, 'ligar-desligar-servidor-de-jogo');
  assert.match(j.texto('situacao'), /esperando o aceite/i);
  void a;
});

test('a falha da máquina aparece na tela de quem configura, com os dados', async () => {
  const { a, id } = servidorLigado();
  a.daMaquina(2, id, { op: 'falha', etapa: 'baixar', erro: 'hash-diferente', dados: { arquivo: 'server.jar', obtido: 'ffff' } });
  const { j } = await aberta({ anfitriao: a });
  await j.apertar('configurar:' + id);
  await j.mudar('aba', 'aba', 'aba-maquina');
  const falhas = j.texto('falhas');
  assert.match(falhas, /hash-diferente/);
  assert.match(falhas, /O hash do arquivo baixado não bate/);
  assert.match(falhas, /server\.jar/);
  assert.match(falhas, /ffff/);
});

test('a recusa de quem não tem a permissão é dita na tela, e não some', async () => {
  const { a, id } = servidorLigado();
  const { j } = await aberta({ anfitriao: a, pessoa: 3 });
  // Quem só joga não vê o botão; se a tela pedir mesmo assim, a recusa aparece.
  j.emitir({ nome: 'botao', chave: 'desligar:' + id });
  await new Promise(r => setTimeout(r, 5));
  assert.match(j.texto('aviso'), /sem-permissao/);
});

test('uma ponte caída é dita na página, com o nome', async () => {
  const j = criarJanela(criarAnfitriao(), { ponteCaida: true });
  await j.abrir();
  assert.match(j.texto('aviso'), /sessao-encerrada/);
});

test('o console manda a linha pela ação de configurar', async () => {
  const { a, id } = servidorLigado();
  const { j } = await aberta({ anfitriao: a });
  await j.apertar('configurar:' + id);
  await j.mudar('aba', 'aba', 'aba-maquina');
  await j.mudar('campo', 'console:texto', 'say oi');
  await j.apertar('console:enviar');
  assert.deepEqual(j.acoes.at(-1), { acao: 'configurar-servidor-de-jogo', valor: { op: 'console', id, comando: 'say oi' } });
  assert.deepEqual(a.avisosAMaquinas.at(-1).carga, { op: 'console', comando: 'say oi' });
});

test('nenhuma montagem passa de 12 KiB, nem com oito servidores cheios de falhas', async () => {
  const a = criarAnfitriao();
  for (let n = 0; n < 8; n++) {
    const id = a.acao(1, 'criar-servidor-de-jogo', { op: 'criar', receita: 'minecraft' }).servidor.id;
    a.acao(1, 'configurar-servidor-de-jogo', { op: 'configurar', id, versao: '1.21.4', quem: '2', config: { nome: 'É'.repeat(59) } });
    a.aceitar(id);
    for (let k = 0; k < 6; k++) a.daMaquina(2, id, { op: 'falha', etapa: 'baixar', erro: 'hash-diferente', dados: { arquivo: 'x'.repeat(200), url: 'https://piston-data.mojang.com/' + 'y'.repeat(300) } });
    a.daMaquina(2, id, { op: 'estado', estado: 'ligado', jogadores: Array.from({ length: 30 }, (_, i) => 'Jogador' + i), linhas: Array.from({ length: 8 }, () => 'z'.repeat(160)) });
  }
  const { j } = await aberta({ anfitriao: a });
  assert.deepEqual(j.mensagensGrandes, []);
  await j.apertar('configurar:minecraft-1');
  for (const aba of ['aba-geral', 'aba-mods', 'aba-jogadores', 'aba-maquina']) await j.mudar('aba', 'aba', aba);
  assert.deepEqual(j.mensagensGrandes, []);
  assert.deepEqual(j.erros, []);
});

test('o estilo segue o desenho: fundo preto, laranja #F47732 no que está escolhido', async () => {
  const { j } = await aberta();
  await j.apertar('criar:minecraft');
  const raiz = j.pagina().arvore[0];
  assert.equal(raiz.estilo.fundo, '#000000');
  const vanilla = j.no('variante:vanilla');
  assert.equal(vanilla.estilo.borda.cor, '#F47732');
  assert.equal(vanilla.estilo.fundo, '#331704');
  assert.equal(j.no('variante:com-mods').estilo.borda.cor, '#626262');
});

test('a página que passaria do teto monta o resumo, e diz que é resumo', async () => {
  const { a, id } = servidorLigado();
  for (let k = 0; k < 6; k++) a.daMaquina(2, id, { op: 'falha', etapa: 'baixar', erro: 'hash-diferente', dados: { url: 'https://x/' + 'y'.repeat(300) } });
  a.daMaquina(2, id, { op: 'estado', estado: 'ligado', linhas: Array.from({ length: 8 }, () => 'z'.repeat(160)) });
  const pessoas = Array.from({ length: 200 }, (_, i) => ({ id: i + 1, apelido: 'Pessoa com nome comprido ' + i, falando: false, mudo: false }));
  const { j } = await aberta({ anfitriao: a, pessoas });
  await j.apertar('configurar:' + id);
  await j.mudar('aba', 'aba', 'aba-maquina');
  assert.ok(j.mensagensGrandes.length > 0, 'o teste não chegou a passar do teto');
  assert.ok(j.no('resumo'), 'a página não disse que é resumo');
  assert.ok(j.no('falhas'), 'o resumo tirou as falhas');
  assert.deepEqual(j.erros, []);
});
