// ---- adaptador.js: a única porta para a API da máquina ----
//
// **Todo nome da API 8 que a metade de máquina chama está aqui, e só aqui.**
// As partes 3 (a metade de máquina e o aceite) e 4 (o poder `programa`) estão
// sendo construídas enquanto este MOD é escrito, e os nomes delas ainda podem
// mudar. Os nomes abaixo são os do desenho
// (docs/superpowers/specs/2026-10-29-api-8-e-mod-multiplayer-design.md, §3 e
// §5); o que o desenho não diz está marcado SUPOSIÇÃO. Trocar um nome é trocar
// uma linha deste arquivo, e os testes rodam contra um adaptador falso com a
// mesma forma (test/maquina.test.cjs).
//
// O que o resto da metade de máquina vê:
//
//   plataforma()                                   -> 'mac-aarch64' | 'windows-x64' | ...
//   baixar({ servidor, url, hash, tamanho, destino, desempacotar? })  -> Promise
//   rodar({ servidor, comando, argumentos, pasta }) -> Promise<{ aoLinha, aoSair, escrever, encerrar }>
//   servirPorta({ servidor, nome, protocolo, porta }) -> Promise<{ fechar? }>
//   escrever(servidor, caminho, texto)             -> Promise
//   copiar(servidor, de, para)                     -> Promise
//   pedir(servidor, valor)                         -> Promise<resposta da metade de servidor>
//   aoAviso(fn(servidor, carga))
//   esperar(ms)                                    -> Promise
//   registrar(texto)

/** O nome de plataforma das receitas, a partir do que a máquina diz de si. */
function nomeDaPlataforma(dita) {
  const sistema = String(dita?.sistema ?? '').toLowerCase();
  const arq = String(dita?.arquitetura ?? '').toLowerCase();
  const so = { macos: 'mac', darwin: 'mac', mac: 'mac', windows: 'windows', win32: 'windows', linux: 'linux' }[sistema] ?? sistema;
  const a = { arm64: 'aarch64', aarch64: 'aarch64', x86_64: 'x64', amd64: 'x64', x64: 'x64' }[arq] ?? arq;
  return `${so}-${a}`;
}

/** Uma promessa, mesmo de quem devolveu um valor. */
const promessa = fn => {
  try {
    return Promise.resolve(fn());
  } catch (erro) {
    return Promise.reject(erro);
  }
};

function criarAdaptador(g = globalThis) {
  const m = g.maquina;
  if (!m || !m.programa || !m.porta) {
    throw new Error('a metade de máquina subiu sem «maquina.programa» e «maquina.porta» da API 8');
  }
  return {
    // SUPOSIÇÃO: o desenho não diz como a máquina conta o sistema dela. A
    // receita precisa disso para escolher o Java (um por plataforma).
    plataforma: () => nomeDaPlataforma(typeof m.plataforma === 'function' ? m.plataforma() : m.plataforma),

    // §5: `maquina.programa.baixar({ url, sha1|sha256|sha512, tamanho, destino })`.
    // SUPOSIÇÃO: `servidor` diz em que pasta de servidor de jogo, e
    // `desempacotar: { raiz }` pede ao produto que abra o .tar.gz/.zip e ponha
    // em `destino` o que está sob `raiz` (o Java da Adoptium).
    baixar: ({ servidor, url, hash, tamanho, destino, desempacotar }) => promessa(() => m.programa.baixar({
      servidor, url, [hash.algoritmo]: hash.hex, tamanho, destino, ...(desempacotar ? { desempacotar } : {}),
    })),

    // §5: `maquina.programa.rodar({ comando, argumentos, pasta })`, que lê a
    // saída, escreve na entrada e sabe do fim. SUPOSIÇÃO: o processo devolvido
    // tem `aoLinha(fn)`, `aoSair(fn({ codigo, sinal }))`, `escrever(texto)` e
    // `encerrar()`.
    rodar: ({ servidor, comando, argumentos, pasta }) => promessa(() => m.programa.rodar({ servidor, comando, argumentos, pasta }))
      .then(proc => ({
        aoLinha: fn => proc.aoLinha(fn),
        aoSair: fn => proc.aoSair(fn),
        escrever: texto => proc.escrever(texto),
        encerrar: () => proc.encerrar(),
      })),

    // §3: `maquina.porta.servir({ nome, protocolo, porta })`.
    servirPorta: ({ nome, protocolo, porta }) => promessa(() => m.porta.servir({ nome, protocolo, porta })),

    // SUPOSIÇÃO: os arquivos do servidor de jogo (eula.txt, server.properties)
    // e a cópia do mundo são `maquina.arquivos.escrever` e `.copiar`, presos à
    // pasta daquele servidor de jogo como o `arquivos` da metade de servidor.
    escrever: (servidor, caminho, texto) => promessa(() => m.arquivos.escrever({ servidor, caminho, texto })),
    copiar: (servidor, de, para) => promessa(() => m.arquivos.copiar({ servidor, de, para })),

    // §2: a máquina fala com a metade de servidor «pelo mesmo caminho de
    // pedido e aviso» (PedidoDaMaquina e AvisoParaMaquina, no protocolo 12).
    // SUPOSIÇÃO: `maquina.pedir(servidor, valor)` resolve com a resposta já
    // lida, e `maquina.aoAviso(fn(servidor, carga))` recebe a carga já lida.
    pedir: (servidor, valor) => promessa(() => m.pedir(servidor, valor)),
    aoAviso: fn => m.aoAviso(fn),

    // O relógio do executor (o mesmo `setTimeout` das outras metades).
    esperar: ms => new Promise(resolve => g.setTimeout(resolve, ms)),
    registrar: texto => g.console?.log?.(texto),
  };
}
