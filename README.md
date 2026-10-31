# SEELE MOD MULTIPLAYER — 1.0.0

Servidores de jogo multiplayer nas máquinas de quem está no servidor SEELE, sem VPN, sem servidor pago e sem serviço de fora. Quem hospeda o SEELE escolhe o jogo, escolhe em que máquina ele roda e configura pela tela do SEELE; a pessoa dona da máquina aceita, na máquina dela, antes de qualquer coisa ser baixada, e pode desligar a qualquer momento. Os amigos entram pelo botão **ENTRAR**, que abre `localhost:<porta>` no computador de cada um.

Requer a **API de MOD 8** (contrato em `api/v8.json` do SEELE; cópia em `test/contrato/api-v8.json`) e só roda no **app de computador** (`"plataformas": ["app"]`): o navegador não abre porta local.

Esta é a parte 5 do desenho `docs/superpowers/specs/2026-10-29-api-8-e-mod-multiplayer-design.md`: o MOD com a receita do **Minecraft Vanilla**. Com mods (`.mrpack` do Modrinth) é a parte 6; a máquina reserva, a parte 7.

## O que tem

- **O seletor de jogos** (entrada **Multiplayer** na navegação do servidor): as receitas para criar e os servidores de jogo que já existem, cada um num cartão com o estado, quantos estão jogando, o **ENTRAR** e o endereço `localhost:<porta>` depois de entrar.
- **A configuração** de um servidor de jogo, em quatro abas, como no desenho aprovado (`config-layout-v2`): **GERAL** (Vanilla / Com mods no topo, a versão, o nome com uma cor por palavra, máximo de jogadores, dificuldade, modo, PvP), **MODS** (chega na próxima versão), **JOGADORES** (quem está dentro e as regras de convívio) e **MÁQUINA** (quem roda, o estado do aceite, o que roda e de onde vem, o console, as últimas linhas e o que deu errado).
- **Mais de um servidor de jogo ao mesmo tempo** (até 8), cada um com a sua porta; dois na mesma máquina ganham portas diferentes.
- **Uma máquina por vez**: trocar a máquina ou a versão pede o servidor desligado e um aceite novo; uma máquina que fala sem ser a dona é mandada parar.
- **Nada calado**: download que falhou, hash que não bateu, Java que não existe para a máquina, túnel que não abriu, jogo que caiu ou não parou, recusa do aceite, recusa de permissão — tudo aparece na tela, com o nome e os dados, e no log.

## Quem pode o quê

| ação | padrão |
|---|---|
| `criar-servidor-de-jogo` (criar e apagar) | quem administra |
| `configurar-servidor-de-jogo` (configuração, versão, máquina, console) | quem administra |
| `ligar-desligar-servidor-de-jogo` | quem administra, e quem o dono quiser |
| `entrar-no-jogo` | todos |

A metade de servidor confere a ação que o **anfitrião** escreveu em `contexto.acao`, nunca o corpo do pedido. Ser dono da máquina não se compra com cargo: o aceite, na tela do produto, vale acima de qualquer permissão.

## Como a comunidade adiciona um jogo

Cada jogo é uma **receita**: um arquivo JSON em `receitas/`, sem código. O formato está em [`receitas/esquema.json`](receitas/esquema.json) (JSON Schema), e a receita do Minecraft em [`receitas/minecraft.json`](receitas/minecraft.json) é o exemplo inteiro.

1. **Faça um fork** deste repositório e crie `receitas/<jogo>.json`. O `id` vira o começo do nome de cada servidor de jogo e do túnel (`terraria-1`): minúsculas, dígitos e hífen, até 24.
2. **Declare tudo o que o jogo precisa**:
   - `versoes` e `artefatos`: de onde vem a lista de versões e o que baixar. Para um jogo cujos arquivos têm URL, hash e tamanho fixos, use a fonte **`fixo`** (`versoes.lista` e `artefatos[].porVersao`), e não precisa de código nenhum. As fontes `mojang`, `mojang-servidor` e `adoptium` leem as APIs da Mojang e da Adoptium; uma origem nova que precise ser lida (uma API) entra com código em `fonte/receita.js`, no mesmo pull request, com teste e fixtures.
   - `origens`: os domínios de onde a máquina baixa. Toda URL de artefato tem de cair num deles; o aceite os mostra, e o SEELE recusa o resto.
   - `dominiosDoJogo`: os domínios com que o jogo fala sozinho, sem o SEELE conferir. O aceite os mostra.
   - `rodar`, `rede` (protocolo `tcp` ou `udp` e a porta padrão) e `disco.mundoMaximo`.
   - `termos`: o que a pessoa da máquina aceita (como o EULA), e o arquivo que se escreve só depois do aceite.
   - `configuracao`: cada campo (`campo`, `numero`, `escolha`, `interruptor` ou `segmentos`, uma lista de palavras com cor, com o padrão, os limites e as opções), em que aba fica (`geral` ou `jogadores`) e, em `propriedades`, como ele vira o arquivo de configuração do jogo (`{chave}` é o valor de um campo; `{porta}` é a porta que o MOD escolheu). Campos com o mesmo `grupo` ficam lado a lado.
   - `mundo.salvar`: o salvamento seguro, passo a passo (`console`, com `esperar` e `prazo`, ou `copiar`). Obrigatório: é o que torna a reserva possível.
   - `saida`: expressões regulares sobre a saída do jogo — `pronto`, `entrou` e `saiu` (as duas com um grupo de captura: o nome de quem joga) — e o passo de `parar`.
3. **Rode os testes**: `npm test`. O validador recusa toda chave desconhecida pelo nome e com o caminho (`receita.configuracao.campos[2]: chave desconhecida «maxmo»`), e confere o que um esquema não diz: modelo que cita campo que não existe, padrão fora das opções, expressão que não compila, salvamento que não copia o mundo, URL fora das origens. `npm run build` também recusa uma receita inválida.
4. **Escreva um teste** para a receita, como `test/receita-minecraft.test.cjs` ou `test/receita-fixa.test.cjs`, com as fixtures da origem em `test/fixtures/`: os testes nunca vão à rede.
5. **Abra o pull request.** A receita vai dentro do pacote do MOD (o build a embute nas três metades) e passa pela mesma avaliação do indexador que o MOD passa.

O seletor não oferece jogos cujo multiplayer não passa por uma porta de rede (como os que usam o P2P da Steam): não há o que tunelar.

## Como é feito

```
mod.json                 o manifesto (API 8, só o app, poderes porta e programa, as quatro ações)
receitas/esquema.json    o formato de receita
receitas/minecraft.json  a receita do Minecraft Vanilla
fonte/comum.js           o que as três metades usam
fonte/esquema.js         o validador de receitas
fonte/receita.js         versões, artefatos, oferta, configuração, server.properties, saída
fonte/servidor.js        a metade de servidor
fonte/adaptador.js       a única porta para a API da máquina (maquina.*)
fonte/maquina.js         a metade de máquina
fonte/cliente.js         a metade de cliente
cliente/ servidor/ maquina/main.js   gerados por npm run build
ferramentas/             build, package e o exercício no QuickJS
test/                    os testes (node --test), o anfitrião e a janela simulados, as fixtures e o contrato
```

**O adaptador.** As partes 3 (metade de máquina e aceite) e 4 (o poder `programa`) estão sendo construídas junto com este MOD. Todo nome da API da máquina que a metade de máquina chama mora em `fonte/adaptador.js`, com o que é suposição marcado; trocar um nome é trocar uma linha ali. `test/adaptador.test.cjs` escreve, chamada a chamada, o que ele supõe.

## Desenvolvimento e validação

```sh
npm run build
npm run check
npm test
SEELE_RAIZ=/caminho/do/SEELE-com-a-API-8 npm run quickjs
```

`npm test` roda as três metades: a de servidor num anfitrião simulado pela API 8 (`test/anfitriao.cjs`: o portão das ações, o `dados` transacional, `mundo.maquinas`, os momentos `MaquinaAceitou`, `MaquinaRecusou` e `MaquinaParou`, o `contexto.maquina`), a de máquina contra um adaptador falso com a de servidor de verdade do outro lado, e a de cliente numa janela gerada do contrato (`test/janela.cjs`: só as formas, os pontos e os tipos do `api-v8.json`, o teto de 12 KiB por mensagem, e o bilhete de gesto do `SeeleUI.tunel.entrar`). O `quickjs` sobe as três no QuickJS 0.12.2 com o teto de 8 MiB e o prelúdio do motor de um checkout do SEELE com a API 8.

Nada disso substitui o Minecraft de verdade entre duas máquinas reais, que o desenho pede e que depende das partes 3 e 4 publicadas.

## Preparar o pacote

```sh
npm run build
npm run package -- /caminho/absoluto/novo/pacote
```

O destino precisa ser novo. O pacote leva `mod.json` e as três metades (as receitas vão dentro delas).
