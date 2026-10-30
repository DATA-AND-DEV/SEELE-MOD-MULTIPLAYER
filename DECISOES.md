# Decisões

Uma linha por decisão, com o custo se estiver errada.

- **As receitas vão embutidas nas três metades pelo build**, porque nenhuma metade lê arquivo do pacote em tempo de execução. Se errada: uma receita trocada sem `npm run build` não entra — o teste `pacote.test.cjs` recusa metade velha.
- **De onde vêm versões e artefatos é uma fonte com nome (`mojang`, `mojang-servidor`, `adoptium`, `fixo`)**; um jogo com arquivos fixos entra só com dado, uma API nova entra com código revisado. Se errada: a segunda receita (parte 8) pode pedir uma fonte nova em código.
- **O validador interpreta um subconjunto do JSON Schema e lança se o esquema usar uma palavra que ele não lê.** Se errada: quem quiser `oneOf`/`if` no esquema precisa estender o validador.
- **A oferta leva o Java das cinco plataformas** (Windows x64, Mac ARM e Intel, Linux x64 e ARM), e a máquina baixa só o seu, porque a metade de servidor não sabe o sistema da máquina antes do aceite. Se errada: o aceite mostra uns 200 MB a mais do que se baixa; se a parte 3 contar o sistema antes da oferta, ela encolhe para um Java.
- **Sem Java 8 da Adoptium para Mac ARM, a receita usa o de Mac Intel** (`senaoHouver`), e a tela diz. Se errada: Minecraft até 1.16 roda pelo Rosetta, mais lento.
- **O Java é desempacotado pelo produto** (`desempacotar: { raiz }` no `baixar`), e o comando aceito é sempre `java/bin/java`. Se errada: a parte 4 precisa desse campo, ou a receita precisa de outro jeito de abrir o .tar.gz/.zip.
- **O disco da oferta é o baixado, mais três vezes o maior pacote desempacotado, mais 8 GiB de mundo.** Se errada: um mundo grande passa do teto aceito e precisa de aceite novo.
- **Os argumentos são fixos (`-Xms1G -Xmx2G`)**, sem memória configurável, porque argumento fora do esquema de configuração pede aceite novo. Se errada: servidores cheios ou modpacks pedem mais memória já na parte 6.
- **O jogo escuta só em 127.0.0.1** (`server-ip`), e «só entra quem está neste servidor SEELE» aparece ligado e travado. Se errada: o dono queria um interruptor real (expor o jogo à rede da máquina), que mudaria o que o aceite cobre.
- **A cor do nome é uma só, das 16 do Minecraft**, aplicada ao nome todo (o `motd` não aceita hexadecimal). Se errada: o desenho mostrava uma cor por palavra; precisa de um campo de lista.
- **A versão escolhida e a máquina pedem aceite novo; a configuração do jogo não** — ela não entra na oferta e vira só o `server.properties`. Se errada: nenhuma, é o desenho §4.
- **A porta do jogo é escolhida pela metade de servidor**: a padrão, ou a primeira livre entre os servidores de jogo da mesma máquina. Se errada: um programa de fora usando 25565 na máquina faz o jogo não subir (e a falha aparece).
- **Ligar depois de uma parada, de uma revogação ou de uma recusa pede o aceite de novo**, em vez de supor que a autorização segue de pé. Se errada: um aceite a mais quando o produto já guardava a autorização.
- **A máquina baixa ao ser aceita (`preparar`) e roda só ao ligar.** Se errada: banda gasta num servidor que nunca liga.
- **A máquina não confia em si: cada passo começa pedindo o plano**, que a metade de servidor só dá à máquina aceita e dona. Se errada: um pedido a mais por passo.
- **A posse é da metade de servidor**: a máquina que fala sem ser a dona recebe `ordem: 'desligar'`. Se errada: nenhuma; é o começo da reserva (parte 7).
- **Desligar manda `stop` e espera a saída pelo prazo da receita (60 s); depois, encerra à força e conta.** Se errada: um mundo grande que demora mais que 60 s para salvar é cortado no meio.
- **O salvamento seguro devolve o último passo de console (`save-on`) mesmo quando um passo falha.** Se errada: nenhuma conhecida; sem isso o mundo ficaria sem salvar automático.
- **As cópias do salvamento vão para `copias/<pasta>-<hora>` na própria máquina**; mandar à reserva é a parte 7. Se errada: disco cresce a cada salvamento até alguém limpar.
- **Cada chamada do adaptador leva `servidor`**, supondo que o produto prende os caminhos à pasta daquele servidor de jogo. Se errada: um campo a tirar em `fonte/adaptador.js`, ou um prefixo a pôr.
- **Até 8 servidores de jogo, 6 falhas e 8 linhas por servidor**, para o estado caber no quintal e a página caber em 12 KiB. Se errada: o nono servidor é recusado com o teto.
- **O estilo repetido vai em `classes` da superfície**, porque oito cartões com estilo em cada nó passavam dos 12 KiB; e uma página que ainda passasse monta um resumo que diz que é resumo. Se errada: classes recusadas deixam a página crua, e a recusa aparece.
- **O botão ENTRAR trata o túnel antes de qualquer `await`**, porque o bilhete de gesto só vale na volta síncrona do clique. Se errada: nenhuma; o teste e o QuickJS com o prelúdio de verdade recusam o contrário.
- **`entrar-no-jogo` aparece no cartão como botão desligado para quem não o tem**, e a recusa do produto, se vier, fica no cartão. Se errada: nenhuma.
- **Apagar um servidor de jogo usa a ação de criar** e só desligado; os arquivos na máquina ficam. Se errada: uma quinta ação, e uma limpeza de disco pela máquina.
- **O console é da ação de configurar**, uma linha de até 256 bytes, só com o jogo ligado. Se errada: quem só liga e desliga não manda comando (`op`, `whitelist`).
- **Os textos de erro são nomes fechados com a frase em português ao lado**, e um nome desconhecido aparece como é. Se errada: nenhuma; um nome novo das partes 3 e 4 aparece sem frase até alguém escrevê-la.
- **Os console.warn de uma recusa vão ao log**, além da tela. Se errada: o QuickJS check trata `warn` como erro só no caminho feliz.
