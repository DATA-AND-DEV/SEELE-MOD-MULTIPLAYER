// ---- adaptador.js: a única porta para a API da máquina ----
//
// **Todo nome da API 8 que a metade de máquina chama está aqui, e só aqui.**
// Os nomes são os que o SEELE entregou nas partes 3 e 4 (api/v8.json,
// «metade-de-maquina», copiado em test/contrato/api-v8.json):
//
//   maquina.servidor, maquina.oferta, maquina.plataforma
//   maquina.pedir(valor) -> Promise<texto>       maquina.aoAviso(fn(carga em texto))
//   maquina.aoParar(fn(motivo))
//   maquina.porta.servir({ nome, protocolo, porta }) / parar(nome) / quedas(nome)
//   maquina.programa.baixar({ url, sha1|sha256|sha512, tamanho, destino, aoProgresso })
//   maquina.programa.escrever({ destino, texto })
//   maquina.programa.desempacotar({ arquivo, destino, raiz })
//   maquina.programa.rodar({ comando, argumentos, pasta }) -> processo
//     processo.aoLinha(fn(linha, fluxo)) / aoSair(fn(fim)) / fim / escrever(texto) / matar()
//   maquina.programa.recusas() -> Promise<{ nome: vezes }>
//
// **Uma metade de máquina é um servidor de jogo**: o produto sobe uma por
// (MOD, servidor), já presa à pasta daquele servidor. Nenhuma chamada leva o
// servidor; quem precisa do nome lê `servidor`.
//
// O que o resto da metade de máquina vê:
//
//   servidor                                        -> o servidor de jogo desta metade
//   plataforma()                                    -> 'mac-aarch64' | 'windows-x64' | ...
//   baixar({ url, hash, tamanho, destino, aoProgresso })  -> Promise
//   desempacotar({ arquivo, destino, raiz })        -> Promise
//   rodar({ comando, argumentos, pasta })           -> Promise<{ aoLinha, aoSair, escrever, encerrar }>
//   servirPorta({ nome, protocolo, porta })         -> Promise<{ fechar }>
//   escrever(caminho, texto)                        -> Promise
//   copiar                                          -> null: a cópia do mundo é da reserva (parte 7)
//   pedir(valor)                                    -> Promise<resposta da metade de servidor, já lida>
//   aoAviso(fn(servidor, carga já lida))
//   aoParar(fn(motivo))
//   recusas()                                       -> Promise<{ nome: vezes }>
//   esperar(ms)                                     -> Promise
//   registrar(texto)

/** Uma promessa, mesmo de quem devolveu um valor ou lançou. */
const promessa = fn => {
  try {
    return Promise.resolve(fn());
  } catch (erro) {
    return Promise.reject(erro);
  }
};

/** JSON.parse que devolve o texto cru quando ele não é JSON. */
const lido = texto => {
  if (typeof texto !== 'string') return texto;
  try { return JSON.parse(texto); } catch { return texto; }
};

function criarAdaptador(g = globalThis) {
  const m = g.maquina;
  if (!m || !m.programa || !m.porta) {
    throw new Error('a metade de máquina subiu sem «maquina.programa» e «maquina.porta» da API 8');
  }
  return {
    servidor: String(m.servidor ?? ''),

    // O sistema desta máquina, já no nome das receitas.
    plataforma: () => String(m.plataforma ?? ''),

    baixar: ({ url, hash, tamanho, destino, aoProgresso }) => promessa(() => m.programa.baixar({
      url, [hash.algoritmo]: hash.hex, tamanho, destino, ...(aoProgresso ? { aoProgresso } : {}),
    })),

    desempacotar: ({ arquivo, destino, raiz }) => promessa(() => m.programa.desempacotar({ arquivo, destino, raiz })),

    rodar: ({ comando, argumentos, pasta }) => promessa(() => m.programa.rodar({ comando, argumentos, pasta }))
      .then(proc => ({
        aoLinha: fn => proc.aoLinha(linha => fn(linha)),
        // O fim do produto, na forma que a metade lê: o código, e se foi
        // morto a pedido (encerrar, ou a parada da metade).
        aoSair: fn => proc.aoSair(fim => fn({
          codigo: fim.codigo, sinal: fim.mortoAPedido ? 'morto-a-pedido' : null,
          linhasPerdidas: fim.linhasPerdidas, linhasNaoOuvidas: fim.linhasNaoOuvidas,
        })),
        escrever: texto => promessa(() => proc.escrever(texto)),
        encerrar: () => promessa(() => proc.matar()),
      })),

    servirPorta: ({ nome, protocolo, porta }) => promessa(() => m.porta.servir({ nome, protocolo, porta }))
      .then(() => ({ fechar: () => m.porta.parar(nome) })),

    escrever: (caminho, texto) => promessa(() => m.programa.escrever({ destino: caminho, texto })),

    // Sem cópia de arquivo no `programa`: copiar o mundo é da reserva (parte
    // 7), que o leva a outra máquina. A metade diz isso ao salvar.
    copiar: null,

    pedir: valor => promessa(() => m.pedir(valor)).then(lido),
    aoAviso: fn => m.aoAviso(carga => fn(String(m.servidor ?? ''), lido(carga))),
    aoParar: fn => m.aoParar(fn),
    recusas: () => promessa(() => m.programa.recusas()),

    // O relógio do executor (o mesmo `setTimeout` das outras metades).
    esperar: ms => new Promise(resolve => g.setTimeout(resolve, ms)),
    registrar: texto => g.console?.log?.(texto),
  };
}
