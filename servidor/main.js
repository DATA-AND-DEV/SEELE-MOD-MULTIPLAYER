/* Gerado por ferramentas/build.mjs a partir de fonte/ e receitas/. API 8. Não edite aqui. */
(() => {
"use strict";
const RECEITAS = [{"formato":1,"id":"minecraft","nome":"Minecraft","edicao":"Java Edition","icone":"MC","versao":"1.0.0","descricao":"O servidor oficial da Mojang, com o Java que cada versão pede.","variantes":{"vanilla":{"nome":"Vanilla","descricao":"Minecraft puro, sem mods. Você escolhe só a versão."},"com-mods":{"nome":"Com mods","descricao":"Um modpack do Modrinth define a versão, o loader e os mods.","disponivel":false,"porque":"Com mods chega na próxima versão."}},"versoes":{"fonte":"mojang","manifesto":"https://piston-meta.mojang.com/mc/game/version_manifest_v2.json","tipos":["release"],"quantas":24},"artefatos":[{"id":"servidor","fonte":"mojang-servidor","destino":"server.jar"},{"id":"java","fonte":"adoptium","destino":"java","consulta":"https://api.adoptium.net/v3/assets/latest/{major}/hotspot?image_type=jre&vendor=eclipse","majorPadrao":8,"plataformas":[{"plataforma":"windows-x64","os":"windows","arquitetura":"x64","raiz":"{release}-jre"},{"plataforma":"mac-aarch64","os":"mac","arquitetura":"aarch64","raiz":"{release}-jre/Contents/Home","senaoHouver":"mac-x64"},{"plataforma":"mac-x64","os":"mac","arquitetura":"x64","raiz":"{release}-jre/Contents/Home"},{"plataforma":"linux-x64","os":"linux","arquitetura":"x64","raiz":"{release}-jre"},{"plataforma":"linux-aarch64","os":"linux","arquitetura":"aarch64","raiz":"{release}-jre"}]}],"origens":["piston-data.mojang.com","github.com","objects.githubusercontent.com","release-assets.githubusercontent.com"],"dominiosDoJogo":["sessionserver.mojang.com","api.minecraftservices.com","api.mojang.com"],"rodar":{"comando":"java/bin/java","argumentos":["-Xms1G","-Xmx2G","-jar","server.jar","nogui"]},"rede":{"protocolo":"tcp","portaPadrao":25565},"disco":{"mundoMaximo":8589934592},"termos":[{"id":"eula","titulo":"EULA do Minecraft (Mojang)","url":"https://aka.ms/MinecraftEULA","arquivo":"eula.txt","conteudo":"eula=true\n"}],"configuracao":{"arquivo":"server.properties","formato":"properties","campos":[{"chave":"nome","aba":"geral","forma":"segmentos","rotulo":"Nome que aparece na lista do jogo","ajuda":"Cada palavra tem a sua cor, entre as 16 do Minecraft.","padrao":[{"texto":"Servidor do SEELE","cor":"aqua"}],"tamanhoMaximo":59,"maximoSegmentos":6,"opcoes":[{"valor":"white","rotulo":"Branco","amostra":"#FFFFFF","codigo":"f"},{"valor":"gray","rotulo":"Cinza","amostra":"#AAAAAA","codigo":"7"},{"valor":"dark_gray","rotulo":"Cinza-escuro","amostra":"#555555","codigo":"8"},{"valor":"black","rotulo":"Preto","amostra":"#000000","codigo":"0"},{"valor":"yellow","rotulo":"Amarelo","amostra":"#FFFF55","codigo":"e"},{"valor":"gold","rotulo":"Dourado","amostra":"#FFAA00","codigo":"6"},{"valor":"red","rotulo":"Vermelho","amostra":"#FF5555","codigo":"c"},{"valor":"dark_red","rotulo":"Vermelho-escuro","amostra":"#AA0000","codigo":"4"},{"valor":"light_purple","rotulo":"Rosa","amostra":"#FF55FF","codigo":"d"},{"valor":"dark_purple","rotulo":"Roxo","amostra":"#AA00AA","codigo":"5"},{"valor":"blue","rotulo":"Azul","amostra":"#5555FF","codigo":"9"},{"valor":"dark_blue","rotulo":"Azul-escuro","amostra":"#0000AA","codigo":"1"},{"valor":"aqua","rotulo":"Ciano","amostra":"#55FFFF","codigo":"b"},{"valor":"dark_aqua","rotulo":"Ciano-escuro","amostra":"#00AAAA","codigo":"3"},{"valor":"green","rotulo":"Verde","amostra":"#55FF55","codigo":"a"},{"valor":"dark_green","rotulo":"Verde-escuro","amostra":"#00AA00","codigo":"2"}]},{"chave":"maximo","aba":"geral","grupo":"regras","forma":"numero","rotulo":"Máx. jogadores","padrao":10,"minimo":1,"maximo":100},{"chave":"dificuldade","aba":"geral","grupo":"regras","forma":"escolha","rotulo":"Dificuldade","padrao":"normal","opcoes":[{"valor":"peaceful","rotulo":"Pacífica"},{"valor":"easy","rotulo":"Fácil"},{"valor":"normal","rotulo":"Normal"},{"valor":"hard","rotulo":"Difícil"}]},{"chave":"modo","aba":"geral","grupo":"regras","forma":"escolha","rotulo":"Modo","padrao":"survival","opcoes":[{"valor":"survival","rotulo":"Sobrevivência"},{"valor":"creative","rotulo":"Criativo"},{"valor":"adventure","rotulo":"Aventura"},{"valor":"spectator","rotulo":"Espectador"}]},{"chave":"pvp","aba":"geral","forma":"interruptor","rotulo":"PvP","padrao":true},{"chave":"hardcore","aba":"jogadores","forma":"interruptor","rotulo":"Hardcore","ajuda":"Quem morre vira espectador até o mundo acabar.","padrao":false},{"chave":"protecao","aba":"jogadores","grupo":"convivio","forma":"numero","rotulo":"Proteção em volta do nascimento","ajuda":"Em blocos. Só quem é operador constrói ali.","padrao":16,"minimo":0,"maximo":64},{"chave":"inativo","aba":"jogadores","grupo":"convivio","forma":"numero","rotulo":"Tirar quem fica parado","ajuda":"Em minutos. Zero é nunca.","padrao":0,"minimo":0,"maximo":120}],"propriedades":{"motd":"{nome}","max-players":"{maximo}","difficulty":"{dificuldade}","gamemode":"{modo}","pvp":"{pvp}","hardcore":"{hardcore}","spawn-protection":"{protecao}","player-idle-timeout":"{inativo}","server-ip":"127.0.0.1","server-port":"{porta}","online-mode":"true","enable-rcon":"false","enable-query":"false"}},"mundo":{"pasta":"world","salvar":[{"console":"save-off"},{"console":"save-all flush","esperar":"\\]: Saved the game","prazo":60},{"copiar":"world"},{"console":"save-on"}]},"saida":{"pronto":"\\]: Done \\(","entrou":"\\]: ([A-Za-z0-9_]{1,16}) joined the game$","saiu":"\\]: ([A-Za-z0-9_]{1,16}) left the game$","parar":{"console":"stop","esperar":"\\]: Stopping the server","prazo":60}}}];
const ESQUEMA_DA_RECEITA = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"https://github.com/DATA-AND-DEV/SEELE-MOD-MULTIPLAYER/receitas/esquema.json","title":"Receita de jogo do MOD de multiplayer do SEELE","description":"Uma receita diz como um jogo é hospedado: o que baixar, o que rodar, a configuração e como ela vira o arquivo do jogo, os termos, como salvar o mundo com segurança e o que a saída do jogo quer dizer. É dado, e não código. Toda chave desconhecida é recusada pelo nome (additionalProperties: false em todo objeto).","type":"object","additionalProperties":false,"required":["formato","id","nome","icone","versao","descricao","variantes","versoes","artefatos","origens","dominiosDoJogo","rodar","rede","disco","termos","configuracao","mundo","saida"],"properties":{"formato":{"description":"A versão deste formato. Hoje, 1.","const":1},"id":{"description":"O nome da receita: vira o começo do nome de cada servidor de jogo (minecraft-1) e do túnel.","type":"string","pattern":"^[a-z0-9]+(-[a-z0-9]+)*$","maxLength":24},"nome":{"type":"string","minLength":1,"maxLength":40},"edicao":{"type":"string","minLength":1,"maxLength":40},"icone":{"description":"Um ou dois caracteres que a tela mostra no cartão do jogo.","type":"string","minLength":1,"maxLength":8},"versao":{"description":"A versão da receita: vai na oferta que a pessoa da máquina aceita.","type":"string","pattern":"^[0-9]+\\.[0-9]+\\.[0-9]+$"},"descricao":{"type":"string","minLength":1,"maxLength":200},"variantes":{"type":"object","additionalProperties":false,"required":["vanilla"],"properties":{"vanilla":{"$ref":"#/$defs/variante"},"com-mods":{"$ref":"#/$defs/variante"}}},"versoes":{"description":"De onde vem a lista de versões do jogo. mojang: o version_manifest_v2.json. fixo: a lista escrita aqui.","type":"object","additionalProperties":false,"required":["fonte"],"properties":{"fonte":{"enum":["mojang","fixo"]},"manifesto":{"$ref":"#/$defs/url"},"tipos":{"type":"array","minItems":1,"uniqueItems":true,"items":{"enum":["release","snapshot","old_beta","old_alpha"]}},"quantas":{"type":"integer","minimum":1,"maximum":40},"lista":{"type":"array","minItems":1,"maxItems":40,"items":{"$ref":"#/$defs/versaoFixa"}}}},"artefatos":{"description":"O que a máquina baixa. mojang-servidor: o downloads.server da versão (sha1). adoptium: o Java que a versão pede (javaVersion.majorVersion), um por plataforma (sha256). fixo: url, hash e tamanho por versão, escritos aqui.","type":"array","minItems":1,"maxItems":4,"items":{"$ref":"#/$defs/artefato"}},"origens":{"description":"Os domínios de onde a máquina pode baixar. Toda URL de artefato tem de cair num deles.","type":"array","minItems":1,"maxItems":16,"uniqueItems":true,"items":{"$ref":"#/$defs/host"}},"dominiosDoJogo":{"description":"Os domínios com que o jogo fala por conta própria, sem o SEELE conferir. O aceite os mostra.","type":"array","maxItems":16,"uniqueItems":true,"items":{"$ref":"#/$defs/host"}},"rodar":{"type":"object","additionalProperties":false,"required":["comando","argumentos"],"properties":{"comando":{"$ref":"#/$defs/caminho"},"argumentos":{"type":"array","maxItems":64,"items":{"type":"string","maxLength":256}}}},"rede":{"type":"object","additionalProperties":false,"required":["protocolo","portaPadrao"],"properties":{"protocolo":{"enum":["tcp","udp"]},"portaPadrao":{"type":"integer","minimum":1024,"maximum":65535}}},"disco":{"type":"object","additionalProperties":false,"required":["mundoMaximo"],"properties":{"mundoMaximo":{"description":"Quanto o mundo pode ocupar, em bytes, além do que se baixa.","type":"integer","minimum":1,"maximum":34359738368}}},"termos":{"type":"array","maxItems":4,"items":{"$ref":"#/$defs/termo"}},"configuracao":{"type":"object","additionalProperties":false,"required":["arquivo","formato","campos","propriedades"],"properties":{"arquivo":{"$ref":"#/$defs/caminho"},"formato":{"enum":["properties"]},"campos":{"type":"array","minItems":1,"maxItems":24,"items":{"$ref":"#/$defs/campo"}},"propriedades":{"description":"Cada propriedade do arquivo do jogo e o modelo do valor. {chave} é o valor de um campo; {porta} é a porta que o MOD escolheu.","type":"object","additionalProperties":{"type":"string","maxLength":256}}}},"mundo":{"type":"object","additionalProperties":false,"required":["pasta","salvar"],"properties":{"pasta":{"$ref":"#/$defs/caminho"},"salvar":{"description":"O salvamento seguro, passo a passo. Obrigatório: é o que torna a reserva possível.","type":"array","minItems":1,"maxItems":8,"items":{"$ref":"#/$defs/passo"}}}},"saida":{"description":"Expressões regulares sobre cada linha da saída do jogo. entrou e saiu têm um grupo de captura: o nome de quem joga.","type":"object","additionalProperties":false,"required":["pronto","entrou","saiu","parar"],"properties":{"pronto":{"type":"string","minLength":1,"maxLength":200},"entrou":{"type":"string","minLength":1,"maxLength":200},"saiu":{"type":"string","minLength":1,"maxLength":200},"parar":{"$ref":"#/$defs/passo"}}}},"$defs":{"variante":{"type":"object","additionalProperties":false,"required":["nome","descricao"],"properties":{"nome":{"type":"string","minLength":1,"maxLength":24},"descricao":{"type":"string","minLength":1,"maxLength":120},"disponivel":{"type":"boolean"},"porque":{"type":"string","minLength":1,"maxLength":120}}},"url":{"type":"string","pattern":"^https://[^\\s]+$","maxLength":512},"host":{"type":"string","pattern":"^(\\*\\.)?[a-z0-9]([a-z0-9-]*[a-z0-9])?(\\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$","maxLength":253},"caminho":{"description":"Relativo à pasta do servidor de jogo, sem .. e sem começar por /.","type":"string","pattern":"^(?!/)(?!.*(^|/)\\.\\.(/|$))[A-Za-z0-9._/-]+$","maxLength":200},"hex":{"type":"string","pattern":"^[0-9a-f]+$"},"hash":{"type":"object","additionalProperties":false,"required":["algoritmo","hex"],"properties":{"algoritmo":{"enum":["sha1","sha256","sha512"]},"hex":{"$ref":"#/$defs/hex"}}},"baixavel":{"type":"object","additionalProperties":false,"required":["url","hash","tamanho"],"properties":{"url":{"$ref":"#/$defs/url"},"hash":{"$ref":"#/$defs/hash"},"tamanho":{"type":"integer","minimum":1}}},"versaoFixa":{"type":"object","additionalProperties":false,"required":["id"],"properties":{"id":{"type":"string","pattern":"^[A-Za-z0-9._+-]{1,64}$"}}},"plataforma":{"type":"object","additionalProperties":false,"required":["plataforma","os","arquitetura","raiz"],"properties":{"plataforma":{"enum":["windows-x64","windows-aarch64","mac-aarch64","mac-x64","linux-x64","linux-aarch64"]},"os":{"type":"string","pattern":"^[a-z-]+$"},"arquitetura":{"type":"string","pattern":"^[a-z0-9_]+$"},"raiz":{"description":"A pasta do pacote que vira o destino; {release} é o release_name da Adoptium.","type":"string","minLength":1,"maxLength":120},"senaoHouver":{"description":"A plataforma cujo Java serve quando a Adoptium não publica para esta.","enum":["windows-x64","windows-aarch64","mac-aarch64","mac-x64","linux-x64","linux-aarch64"]}}},"artefato":{"type":"object","additionalProperties":false,"required":["id","fonte","destino"],"properties":{"id":{"type":"string","pattern":"^[a-z0-9-]{1,24}$"},"fonte":{"enum":["mojang-servidor","adoptium","fixo"]},"destino":{"$ref":"#/$defs/caminho"},"consulta":{"$ref":"#/$defs/url"},"majorPadrao":{"type":"integer","minimum":8,"maximum":99},"plataformas":{"type":"array","minItems":1,"maxItems":6,"items":{"$ref":"#/$defs/plataforma"}},"porVersao":{"type":"object","additionalProperties":{"$ref":"#/$defs/baixavel"}}}},"termo":{"type":"object","additionalProperties":false,"required":["id","titulo","url"],"properties":{"id":{"type":"string","pattern":"^[a-z0-9-]{1,24}$"},"titulo":{"type":"string","minLength":1,"maxLength":120},"url":{"$ref":"#/$defs/url"},"arquivo":{"$ref":"#/$defs/caminho"},"conteudo":{"description":"O que se escreve no arquivo, e só depois do aceite.","type":"string","maxLength":256}}},"opcao":{"type":"object","additionalProperties":false,"required":["valor","rotulo"],"properties":{"valor":{"type":"string","minLength":1,"maxLength":64},"rotulo":{"type":"string","minLength":1,"maxLength":40},"amostra":{"description":"Uma cor #rrggbb que a tela mostra ao lado.","type":"string","pattern":"^#[0-9a-fA-F]{6}$"},"codigo":{"description":"O caractere depois do § no jogo (as 16 cores do Minecraft: 0-9 e a-f).","type":"string","pattern":"^[0-9a-f]$"}}},"segmento":{"type":"object","additionalProperties":false,"required":["texto","cor"],"properties":{"texto":{"type":"string","minLength":1,"maxLength":64},"cor":{"type":"string","minLength":1,"maxLength":64}}},"campo":{"type":"object","additionalProperties":false,"required":["chave","aba","forma","rotulo","padrao"],"properties":{"chave":{"type":"string","pattern":"^[a-z][a-zA-Z0-9]{0,23}$"},"aba":{"enum":["geral","jogadores"]},"grupo":{"description":"Campos com o mesmo grupo ficam lado a lado.","type":"string","pattern":"^[a-z0-9-]{1,24}$"},"forma":{"enum":["campo","numero","escolha","interruptor","segmentos"]},"rotulo":{"type":"string","minLength":1,"maxLength":80},"ajuda":{"type":"string","minLength":1,"maxLength":160},"padrao":{"description":"Uma lista de palavras ({texto, cor}) é o padrão de uma forma «segmentos».","type":["string","integer","boolean","array"],"items":{"$ref":"#/$defs/segmento"}},"obrigatorio":{"type":"boolean"},"tamanhoMaximo":{"description":"Em caracteres; numa lista de palavras, o nome todo com um espaço entre as palavras.","type":"integer","minimum":1,"maximum":256},"maximoSegmentos":{"description":"O teto de palavras de uma forma «segmentos».","type":"integer","minimum":1,"maximum":16},"minimo":{"type":"integer"},"maximo":{"type":"integer"},"opcoes":{"type":"array","minItems":1,"maxItems":24,"items":{"$ref":"#/$defs/opcao"}}}},"passo":{"description":"Um passo: mandar uma linha ao console (e, se quiser, esperar uma linha na saída, com prazo em segundos), ou copiar uma pasta do servidor de jogo.","type":"object","additionalProperties":false,"properties":{"console":{"type":"string","minLength":1,"maxLength":200,"pattern":"^[^\\n\\r]+$"},"esperar":{"type":"string","minLength":1,"maxLength":200},"prazo":{"type":"integer","minimum":1,"maximum":600},"copiar":{"$ref":"#/$defs/caminho"}}}}};
// ---- comum.js: o que as três metades usam igual ----
//
// `RECEITAS` e `ESQUEMA_DA_RECEITA` vêm do build (ferramentas/montar.cjs), no
// topo de cada metade.

const EU = 'seele/multiplayer';

/** Bytes de um texto em UTF-8, a conta que os tetos do SEELE fazem. */
function bytesDe(texto) {
  let n = 0;
  for (const c of String(texto)) {
    const p = c.codePointAt(0);
    n += p < 0x80 ? 1 : p < 0x800 ? 2 : p < 0x10000 ? 3 : 4;
  }
  return n;
}

/** Corta um texto em `teto` bytes UTF-8, sem partir um caractere. */
function cortar(texto, teto) {
  let saida = '', n = 0;
  for (const c of String(texto ?? '')) {
    const b = bytesDe(c);
    if (n + b > teto) break;
    saida += c;
    n += b;
  }
  return saida;
}

/** JSON.parse que devolve `null` em vez de lançar. */
function lerJson(texto) {
  if (typeof texto !== 'string') return null;
  try { return JSON.parse(texto); } catch { return null; }
}

/** A frase de um erro qualquer, sem lançar de novo. */
function fraseDoErro(erro) {
  try {
    if (erro && typeof erro === 'object') return String(erro.erro ?? erro.message ?? erro.error ?? JSON.stringify(erro));
    return String(erro);
  } catch {
    return 'erro sem descrição';
  }
}

/** O que um erro traz além da frase, para a tela mostrar com os dados. */
function dadosDoErro(erro) {
  if (!erro || typeof erro !== 'object') return {};
  const dados = {};
  for (const k of Object.keys(erro)) {
    if (k === 'message' || k === 'stack') continue;
    const v = erro[k];
    if (v === undefined || typeof v === 'function') continue;
    dados[k] = v;
  }
  return dados;
}

/** A receita pelo id, ou `null`. */
const receitaPorId = id => RECEITAS.find(r => r.id === id) ?? null;

/** O host de uma URL `https://`, ou `null`. */
function hostDaUrl(url) {
  const m = /^https:\/\/([^/?#:]+)/i.exec(String(url));
  return m ? m[1].toLowerCase() : null;
}

/** Se `host` cai numa das origens (com `*.` valendo para os subdomínios). */
function hostNasOrigens(host, origens) {
  return origens.some(o => o.startsWith('*.') ? host.endsWith(o.slice(1)) : host === o);
}

/** Os bytes UTF-8 de um texto. */
function utf8De(texto) {
  const bytes = [];
  for (const c of String(texto)) {
    const p = c.codePointAt(0);
    if (p < 0x80) bytes.push(p);
    else if (p < 0x800) bytes.push(0xc0 | (p >> 6), 0x80 | (p & 63));
    else if (p < 0x10000) bytes.push(0xe0 | (p >> 12), 0x80 | ((p >> 6) & 63), 0x80 | (p & 63));
    else bytes.push(0xf0 | (p >> 18), 0x80 | ((p >> 12) & 63), 0x80 | ((p >> 6) & 63), 0x80 | (p & 63));
  }
  return bytes;
}

/**
 * O SHA-1 (hexadecimal) dos bytes UTF-8 de um texto, em JS puro: o QuickJS do
 * SEELE não traz `crypto`. Serve para conferir o que a Mojang publica com
 * sha1; não é escolha de segurança nossa.
 */
function sha1Hex(texto) {
  const bytes = utf8De(texto);
  const bits = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  // O tamanho em bits, 64 bits big-endian (o alto cabe em 32 bits para o que cabe na memória).
  const alto = Math.floor(bits / 0x100000000), baixo = bits >>> 0;
  for (const w of [alto, baixo]) bytes.push((w >>> 24) & 255, (w >>> 16) & 255, (w >>> 8) & 255, w & 255);
  let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476, h4 = 0xc3d2e1f0;
  const w = new Array(80);
  const rot = (x, n) => ((x << n) | (x >>> (32 - n))) >>> 0;
  for (let i = 0; i < bytes.length; i += 64) {
    for (let t = 0; t < 16; t++) w[t] = ((bytes[i + 4 * t] << 24) | (bytes[i + 4 * t + 1] << 16) | (bytes[i + 4 * t + 2] << 8) | bytes[i + 4 * t + 3]) >>> 0;
    for (let t = 16; t < 80; t++) w[t] = rot(w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16], 1);
    let a = h0, b = h1, c = h2, d = h3, e = h4;
    for (let t = 0; t < 80; t++) {
      let f, k;
      if (t < 20) { f = (b & c) | (~b & d); k = 0x5a827999; }
      else if (t < 40) { f = b ^ c ^ d; k = 0x6ed9eba1; }
      else if (t < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8f1bbcdc; }
      else { f = b ^ c ^ d; k = 0xca62c1d6; }
      const tmp = (rot(a, 5) + (f >>> 0) + e + k + w[t]) >>> 0;
      e = d; d = c; c = rot(b, 30); b = a; a = tmp;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0; h4 = (h4 + e) >>> 0;
  }
  return [h0, h1, h2, h3, h4].map(x => x.toString(16).padStart(8, '0')).join('');
}

// ---- esquema.js: o validador de receitas ----
//
// Duas passadas. A primeira lê `receitas/esquema.json` — um pedaço do JSON
// Schema 2020-12, o que o esquema usa e nada mais — e confere a forma. A
// segunda confere o que um esquema não diz: o modelo de uma propriedade que
// cita um campo que não existe, o padrão fora das opções, a expressão que não
// compila, o salvamento que não copia o mundo. A segunda só roda se a primeira
// passou: ela lê a receita supondo a forma certa.
//
// **Toda chave desconhecida é recusada pelo nome**, com o caminho até ela. Uma
// receita chega por pull request; a recusa é a única resposta que o autor tem.

/** O que este validador sabe ler de um esquema. Uma palavra fora daqui é defeito do esquema, e lança. */
const PALAVRAS_DO_ESQUEMA = new Set([
  '$schema', '$id', '$defs', '$ref', 'title', 'description', 'type', 'properties', 'required',
  'additionalProperties', 'items', 'enum', 'const', 'pattern', 'minLength', 'maxLength',
  'minimum', 'maximum', 'minItems', 'maxItems', 'uniqueItems',
]);

const TAMANHO_DO_HASH = { sha1: 40, sha256: 64, sha512: 128 };

function tipoDe(valor) {
  if (valor === null) return 'null';
  if (Array.isArray(valor)) return 'array';
  if (Number.isInteger(valor)) return 'integer';
  return typeof valor;
}

function serveAoTipo(valor, tipo) {
  const t = tipoDe(valor);
  return t === tipo || (tipo === 'number' && t === 'integer');
}

function mostrar(valor) {
  return typeof valor === 'string' ? '«' + valor + '»' : JSON.stringify(valor);
}

/** A primeira passada: o valor contra um pedaço do esquema. */
function conferirForma(valor, esquema, raiz, caminho, erros) {
  for (const palavra of Object.keys(esquema)) {
    if (!PALAVRAS_DO_ESQUEMA.has(palavra)) throw new Error('o esquema usa «' + palavra + '», que o validador não lê');
  }
  if (esquema.$ref) {
    const nome = esquema.$ref.replace(/^#\/\$defs\//, '');
    const alvo = raiz.$defs?.[nome];
    if (!alvo) throw new Error('o esquema cita ' + esquema.$ref + ', que não existe');
    return conferirForma(valor, alvo, raiz, caminho, erros);
  }
  if ('const' in esquema && valor !== esquema.const) {
    erros.push(`${caminho}: devia ser ${mostrar(esquema.const)}`);
    return;
  }
  if (esquema.enum && !esquema.enum.includes(valor)) {
    erros.push(`${caminho}: ${mostrar(valor)} não é um dos valores aceitos (${esquema.enum.join(', ')})`);
    return;
  }
  if (esquema.type) {
    const tipos = Array.isArray(esquema.type) ? esquema.type : [esquema.type];
    if (!tipos.some(t => serveAoTipo(valor, t))) {
      erros.push(`${caminho}: devia ser ${tipos.join(' ou ')}`);
      return;
    }
  }
  const t = tipoDe(valor);
  if (t === 'string') {
    if (esquema.minLength !== undefined && valor.length < esquema.minLength) erros.push(`${caminho}: ${mostrar(valor)} é curto demais`);
    if (esquema.maxLength !== undefined && valor.length > esquema.maxLength) erros.push(`${caminho}: passa de ${esquema.maxLength} caracteres`);
    if (esquema.pattern && !new RegExp(esquema.pattern).test(valor)) erros.push(`${caminho}: ${mostrar(valor)} não tem a forma pedida`);
  }
  if (t === 'integer' || t === 'number') {
    if (esquema.minimum !== undefined && valor < esquema.minimum) erros.push(`${caminho}: ${valor} é menor que ${esquema.minimum}`);
    if (esquema.maximum !== undefined && valor > esquema.maximum) erros.push(`${caminho}: ${valor} é maior que ${esquema.maximum}`);
  }
  if (t === 'array') {
    if (esquema.minItems !== undefined && valor.length < esquema.minItems) erros.push(`${caminho}: precisa de ao menos ${esquema.minItems}`);
    if (esquema.maxItems !== undefined && valor.length > esquema.maxItems) erros.push(`${caminho}: passa de ${esquema.maxItems} itens`);
    if (esquema.uniqueItems) {
      const vistos = new Set();
      valor.forEach((item, i) => {
        const chave = JSON.stringify(item);
        if (vistos.has(chave)) erros.push(`${caminho}[${i}]: ${mostrar(item)} repetido`);
        vistos.add(chave);
      });
    }
    if (esquema.items) valor.forEach((item, i) => conferirForma(item, esquema.items, raiz, `${caminho}[${i}]`, erros));
  }
  if (t === 'object') {
    const props = esquema.properties ?? {};
    for (const chave of Object.keys(valor)) {
      if (chave in props) continue;
      if (esquema.additionalProperties === false) erros.push(`${caminho}: chave desconhecida «${chave}»`);
    }
    for (const chave of esquema.required ?? []) {
      if (!(chave in valor)) erros.push(`${caminho}: falta a chave «${chave}»`);
    }
    for (const [chave, sub] of Object.entries(props)) {
      if (chave in valor) conferirForma(valor[chave], sub, raiz, `${caminho}.${chave}`, erros);
    }
    if (esquema.additionalProperties && typeof esquema.additionalProperties === 'object') {
      for (const chave of Object.keys(valor)) {
        if (!(chave in props)) conferirForma(valor[chave], esquema.additionalProperties, raiz, `${caminho}.${chave}`, erros);
      }
    }
  }
}

/** Quantos grupos de captura uma expressão tem, ou `null` se ela não compila. */
function gruposDe(fonte) {
  try {
    return new RegExp(fonte + '|').exec('').length - 1;
  } catch {
    return null;
  }
}

/** As variáveis `{x}` de um modelo. */
const variaveisDe = modelo => [...String(modelo).matchAll(/\{([A-Za-z0-9]+)\}/g)].map(m => m[1]);

/** A segunda passada: o que o esquema não diz. */
function conferirSentido(r, erros) {
  const c = 'receita';

  // ---- versões ----
  if (r.versoes.fonte === 'mojang' && !(r.versoes.manifesto && r.versoes.tipos && r.versoes.quantas)) {
    erros.push(`${c}.versoes: a fonte mojang precisa de «manifesto», «tipos» e «quantas»`);
  }
  if (r.versoes.fonte === 'fixo' && !r.versoes.lista) erros.push(`${c}.versoes: a fonte fixo precisa de «lista»`);

  // ---- artefatos ----
  r.artefatos.forEach((a, i) => {
    const ca = `${c}.artefatos[${i}]`;
    if (a.fonte === 'adoptium') {
      if (!(a.consulta && a.majorPadrao && a.plataformas)) {
        erros.push(`${ca}: a fonte adoptium precisa de «consulta», «majorPadrao» e «plataformas»`);
        return;
      }
      if (!a.consulta.includes('{major}')) erros.push(`${ca}.consulta: falta {major}`);
      const nomes = a.plataformas.map(p => p.plataforma);
      a.plataformas.forEach((p, j) => {
        if (p.senaoHouver && !nomes.includes(p.senaoHouver)) {
          erros.push(`${ca}.plataformas[${j}].senaoHouver: «${p.senaoHouver}» não é uma das plataformas da receita`);
        }
      });
    }
    if (a.fonte === 'fixo') {
      if (!a.porVersao) {
        erros.push(`${ca}: a fonte fixo precisa de «porVersao»`);
        return;
      }
      for (const [versao, b] of Object.entries(a.porVersao)) {
        const cb = `${ca}.porVersao.${versao}`;
        const host = hostDaUrl(b.url);
        if (!host || !hostNasOrigens(host, r.origens)) erros.push(`${cb}.url: ${host} não está nas origens`);
        const esperado = TAMANHO_DO_HASH[b.hash.algoritmo];
        if (b.hash.hex.length !== esperado) erros.push(`${cb}.hash: ${b.hash.algoritmo} tem ${esperado} caracteres, este tem ${b.hash.hex.length}`);
      }
      if (r.versoes.fonte === 'fixo' && r.versoes.lista) {
        for (const v of r.versoes.lista) {
          if (!a.porVersao[v.id]) erros.push(`${ca}: a versão «${v.id}» não tem artefato fixo`);
        }
      }
    }
  });
  const ids = new Set();
  r.artefatos.forEach((a, i) => {
    if (ids.has(a.id)) erros.push(`${c}.artefatos[${i}].id: «${a.id}» repetido`);
    ids.add(a.id);
  });

  // ---- configuração ----
  const chaves = new Set();
  r.configuracao.campos.forEach((campo, i) => {
    const cc = `${c}.configuracao.campos[${i}]`;
    if (chaves.has(campo.chave)) erros.push(`${cc}.chave: «${campo.chave}» repetida`);
    chaves.add(campo.chave);
    if (campo.chave === 'porta') erros.push(`${cc}.chave: «porta» é da receita, e não de um campo`);
    const p = campo.padrao;
    if (campo.maximoSegmentos !== undefined && campo.forma !== 'segmentos') erros.push(`${cc}: só uma lista de palavras tem «maximoSegmentos»`);
    if (campo.forma !== 'segmentos') {
      (campo.opcoes ?? []).forEach((o, k) => {
        if (o.codigo !== undefined) erros.push(`${cc}.opcoes[${k}]: só a lista de palavras usa «codigo»`);
      });
    }
    if (campo.forma === 'segmentos') {
      if (!campo.opcoes) {
        erros.push(`${cc}: uma lista de palavras precisa de «opcoes»`);
        return;
      }
      if (campo.maximoSegmentos === undefined) {
        erros.push(`${cc}: uma lista de palavras precisa de «maximoSegmentos»`);
        return;
      }
      const codigos = new Set();
      campo.opcoes.forEach((o, k) => {
        if (o.codigo === undefined) erros.push(`${cc}.opcoes[${k}]: falta o «codigo» do § desta cor`);
        else if (codigos.has(o.codigo)) erros.push(`${cc}.opcoes[${k}]: o código «${o.codigo}» repete o de outra cor`);
        else codigos.add(o.codigo);
      });
      if (campo.opcoes.some(o => o.codigo === undefined)) return;
      const c = conferirSegmentos(campo, p);
      if (c.erro) erros.push(`${cc}.padrao: ${c.erro.charAt(0).toLowerCase()}${c.erro.slice(1).replace(/\.$/, '')}`);
    } else if (campo.forma === 'escolha') {
      if (!campo.opcoes) {
        erros.push(`${cc}: uma escolha precisa de «opcoes»`);
        return;
      }
      if (!campo.opcoes.some(o => o.valor === p)) erros.push(`${cc}.padrao: ${mostrar(p)} não é uma das opções`);
    } else if (campo.forma === 'numero') {
      if (campo.minimo === undefined || campo.maximo === undefined) {
        erros.push(`${cc}: um número precisa de «minimo» e «maximo»`);
        return;
      }
      if (!Number.isInteger(p)) erros.push(`${cc}.padrao: um número tem padrão inteiro`);
      else if (p < campo.minimo || p > campo.maximo) erros.push(`${cc}.padrao: ${p} fora de ${campo.minimo} a ${campo.maximo}`);
    } else if (campo.forma === 'interruptor') {
      if (typeof p !== 'boolean') erros.push(`${cc}.padrao: um interruptor tem padrão true ou false`);
    } else if (campo.forma === 'campo') {
      if (typeof p !== 'string') erros.push(`${cc}.padrao: um campo tem padrão em texto`);
      else if (campo.tamanhoMaximo && p.length > campo.tamanhoMaximo) erros.push(`${cc}.padrao: passa de ${campo.tamanhoMaximo} caracteres`);
    }
    if (campo.opcoes && campo.forma !== 'escolha' && campo.forma !== 'segmentos') erros.push(`${cc}: só uma escolha tem «opcoes»`);
  });
  for (const [prop, modelo] of Object.entries(r.configuracao.propriedades)) {
    for (const v of variaveisDe(modelo)) {
      if (v !== 'porta' && !chaves.has(v)) erros.push(`${c}.configuracao.propriedades.${prop}: «{${v}}» não é campo da receita nem {porta}`);
    }
  }

  // ---- mundo e saída ----
  const conferirPasso = (passo, cp) => {
    if (passo.console && passo.copiar) erros.push(`${cp}: um passo é «console» ou «copiar», não os dois`);
    else if (!passo.console && !passo.copiar) erros.push(`${cp}: um passo é «console» ou «copiar»`);
    if ((passo.esperar || passo.prazo) && !passo.console) erros.push(`${cp}: só um passo de console espera`);
    if (passo.esperar && gruposDe(passo.esperar) === null) erros.push(`${cp}.esperar: não é uma expressão regular válida`);
  };
  r.mundo.salvar.forEach((passo, i) => conferirPasso(passo, `${c}.mundo.salvar[${i}]`));
  if (!r.mundo.salvar.some(p => p.copiar)) erros.push(`${c}.mundo.salvar: nenhum passo copia o mundo`);
  conferirPasso(r.saida.parar, `${c}.saida.parar`);
  if (r.saida.parar.copiar) erros.push(`${c}.saida.parar: parar é um passo de console`);
  for (const nome of ['pronto', 'entrou', 'saiu']) {
    const grupos = gruposDe(r.saida[nome]);
    if (grupos === null) erros.push(`${c}.saida.${nome}: não é uma expressão regular válida`);
    else if (nome !== 'pronto' && grupos !== 1) erros.push(`${c}.saida.${nome}: precisa de exatamente um grupo de captura (o nome de quem joga)`);
  }

  // ---- termos ----
  r.termos.forEach((t, i) => {
    if (Boolean(t.arquivo) !== Boolean(t.conteudo)) erros.push(`${c}.termos[${i}]: «arquivo» e «conteudo» vão juntos`);
  });
}

/**
 * Confere uma receita. Nunca lança por causa dela: devolve `{ ok, erros }`,
 * cada erro uma frase com o caminho.
 */
function validarReceita(receita, esquema = ESQUEMA_DA_RECEITA) {
  const erros = [];
  conferirForma(receita, esquema, esquema, 'receita', erros);
  if (erros.length === 0) {
    try {
      conferirSentido(receita, erros);
    } catch (erro) {
      erros.push('receita: o validador não conseguiu ler a receita: ' + fraseDoErro(erro));
    }
  }
  return { ok: erros.length === 0, erros };
}

// ---- receita.js: o que uma receita quer dizer ----
//
// Funções puras sobre uma receita: listar as versões, resolver o que baixar
// numa versão, montar a oferta que a pessoa da máquina aceita, conferir a
// configuração, escrever o arquivo do jogo e ler a saída dele.
//
// **Onde o código ainda é preciso.** Uma receita é dado, mas de onde vem a
// lista de versões e o que baixar é uma fonte com nome: `mojang`, `adoptium`
// ou `fixo`. Um jogo cujos arquivos têm URL, hash e tamanho fixos entra só com
// dado (`fixo`); uma origem nova que precise ser lida (uma API como a da
// Mojang) entra com código, revisado, aqui.
//
// `buscar(url)` devolve o texto ou `null`: no servidor é `mundo.buscar`, e nos
// testes, as fixtures.

/**
 * Busca e lê um JSON, ou diz por que não deu. Com `sha1`, o texto que veio
 * tem de ter esse hash (o que a Mojang publica no manifesto): se não tem, é
 * recusado com a URL, o esperado e o obtido, antes de ser lido.
 */
function buscarJson(buscar, url, sha1) {
  let texto;
  try {
    texto = buscar(url);
  } catch (erro) {
    return { ok: false, erro: 'origem-nao-respondeu', url, porque: fraseDoErro(erro) };
  }
  if (texto === null || texto === undefined) return { ok: false, erro: 'origem-nao-respondeu', url };
  if (sha1 !== undefined) {
    const obtido = sha1Hex(texto);
    if (obtido !== sha1) return { ok: false, erro: 'sha1-diferente', url, esperado: sha1, obtido };
  }
  const json = lerJson(texto);
  if (json === null) return { ok: false, erro: 'origem-ilegivel', url };
  return { ok: true, json };
}

/** O manifesto inteiro da Mojang, filtrado pelos tipos da receita. */
function versoesDoManifesto(receita, buscar) {
  const lido = buscarJson(buscar, receita.versoes.manifesto);
  if (!lido.ok) return lido;
  const lista = Array.isArray(lido.json.versions) ? lido.json.versions : null;
  if (!lista) return { ok: false, erro: 'origem-ilegivel', url: receita.versoes.manifesto };
  const versoes = lista
    .filter(v => v && typeof v.id === 'string' && typeof v.url === 'string' && receita.versoes.tipos.includes(v.type))
    .map(v => ({ id: v.id, url: v.url, sha1: v.sha1 }));
  return { ok: true, versoes };
}

/** As versões que a tela oferece, as mais novas primeiro. */
function listarVersoes(receita, buscar) {
  if (receita.versoes.fonte === 'fixo') return { ok: true, versoes: receita.versoes.lista.map(v => ({ id: v.id })) };
  const todas = versoesDoManifesto(receita, buscar);
  if (!todas.ok) return todas;
  return { ok: true, versoes: todas.versoes.slice(0, receita.versoes.quantas) };
}

/** Um artefato só entra se a URL dele cai numa origem da receita. */
function conferirOrigem(receita, url) {
  const host = hostDaUrl(url);
  if (!host || !hostNasOrigens(host, receita.origens)) return { ok: false, erro: 'url-fora-das-origens', url, host };
  return null;
}

/** Os artefatos de uma fonte `adoptium`: o Java do major pedido, um por plataforma. */
function resolverAdoptium(receita, artefato, major, buscar) {
  const url = artefato.consulta.replace('{major}', String(major));
  const lido = buscarJson(buscar, url);
  if (!lido.ok) return lido;
  if (!Array.isArray(lido.json)) return { ok: false, erro: 'origem-ilegivel', url };
  const achados = {};
  for (const p of artefato.plataformas) {
    const item = lido.json.find(a => a?.binary?.os === p.os && a.binary.architecture === p.arquitetura && a.binary.image_type === 'jre');
    const pacote = item?.binary?.package;
    if (!pacote || typeof pacote.link !== 'string' || !/^[0-9a-f]{64}$/.test(String(pacote.checksum)) || !Number.isInteger(pacote.size)) continue;
    achados[p.plataforma] = {
      id: artefato.id,
      nome: String(pacote.name ?? artefato.destino),
      url: pacote.link,
      tamanho: pacote.size,
      hash: { algoritmo: 'sha256', hex: pacote.checksum },
      destino: artefato.destino,
      desempacotar: { raiz: p.raiz.replace('{release}', String(item.release_name ?? '')) },
    };
  }
  const porPlataforma = {}, substituidas = {}, semJava = [];
  const artefatos = [];
  const usar = a => {
    const igual = artefatos.find(x => x.url === a.url);
    if (igual) return igual.nome;
    artefatos.push(a);
    return a.nome;
  };
  for (const p of artefato.plataformas) {
    if (achados[p.plataforma]) porPlataforma[p.plataforma] = usar(achados[p.plataforma]);
  }
  for (const p of artefato.plataformas) {
    if (achados[p.plataforma]) continue;
    if (p.senaoHouver && achados[p.senaoHouver]) {
      porPlataforma[p.plataforma] = usar(achados[p.senaoHouver]);
      substituidas[p.plataforma] = p.senaoHouver;
    } else {
      semJava.push(p.plataforma);
    }
  }
  for (const a of artefatos) {
    const fora = conferirOrigem(receita, a.url);
    if (fora) return fora;
  }
  return { ok: true, artefatos, porPlataforma, substituidas, semJava, url };
}

/**
 * O que a máquina baixa para rodar `versao`: cada artefato com url, hash,
 * tamanho e destino, e qual Java serve a cada plataforma.
 */
function resolverVersao(receita, versao, buscar) {
  const artefatos = [];
  let porPlataforma = {}, substituidas = {}, semJava = [], javaMajor = null;
  let versaoJson = null, urlDaVersao = null;

  if (receita.versoes.fonte === 'mojang') {
    const todas = versoesDoManifesto(receita, buscar);
    if (!todas.ok) return todas;
    const entrada = todas.versoes.find(v => v.id === versao);
    if (!entrada) return { ok: false, erro: 'versao-desconhecida', versao };
    urlDaVersao = entrada.url;
    // Sem o sha1 do manifesto a conferência passaria em branco: recusa-se, dizendo.
    if (!/^[0-9a-f]{40}$/.test(String(entrada.sha1))) return { ok: false, erro: 'manifesto-sem-sha1', versao, url: entrada.url };
    const lido = buscarJson(buscar, entrada.url, entrada.sha1);
    if (!lido.ok) return lido;
    versaoJson = lido.json;
  } else if (!receita.versoes.lista.some(v => v.id === versao)) {
    return { ok: false, erro: 'versao-desconhecida', versao };
  }

  for (const artefato of receita.artefatos) {
    if (artefato.fonte === 'mojang-servidor') {
      const s = versaoJson?.downloads?.server;
      if (!s || typeof s.url !== 'string' || !/^[0-9a-f]{40}$/.test(String(s.sha1)) || !Number.isInteger(s.size)) {
        return { ok: false, erro: 'versao-sem-servidor', versao, url: urlDaVersao };
      }
      const fora = conferirOrigem(receita, s.url);
      if (fora) return fora;
      artefatos.push({ id: artefato.id, nome: artefato.destino.split('/').pop(), url: s.url, tamanho: s.size, hash: { algoritmo: 'sha1', hex: s.sha1 }, destino: artefato.destino });
    } else if (artefato.fonte === 'adoptium') {
      const pedido = versaoJson?.javaVersion?.majorVersion;
      javaMajor = Number.isInteger(pedido) ? pedido : artefato.majorPadrao;
      const java = resolverAdoptium(receita, artefato, javaMajor, buscar);
      if (!java.ok) return java;
      artefatos.push(...java.artefatos);
      ({ porPlataforma, substituidas, semJava } = java);
    } else if (artefato.fonte === 'fixo') {
      const b = artefato.porVersao[versao];
      if (!b) return { ok: false, erro: 'versao-sem-artefato', versao, artefato: artefato.id };
      artefatos.push({ id: artefato.id, nome: artefato.destino.split('/').pop(), url: b.url, tamanho: b.tamanho, hash: b.hash, destino: artefato.destino });
    }
  }
  return { ok: true, versao, artefatos, porPlataforma, substituidas, semJava, javaMajor };
}

/** O teto de uma oferta: 64 GiB (`MAX_DISCO`, seele-proto/src/maquina.rs). */
const DISCO_MAXIMO_DA_OFERTA = 64 * 1024 * 1024 * 1024;

/**
 * A oferta que a pessoa da máquina vê e aceita, com os nomes de campo de
 * `OfertaDeMaquina` (seele-proto/src/maquina.rs).
 *
 * **Só entra o que muda o que roda**: a receita e a versão dela, a versão do
 * jogo, a porta, os artefatos, as origens, o comando. A configuração do jogo
 * não entra — ela vira texto no `server.properties`, e mudar o nome do
 * servidor não pode pedir aceite novo.
 */
function montarOferta(receita, { servidor, versao, porta }, resolvido) {
  // **Cada Java leva os sistemas em que serve** (`plataformas`, API 8 parte 4):
  // a metade de servidor não sabe o sistema da máquina antes do aceite e manda
  // o de cada um; com a marca, a tela da máquina soma só o dela e o produto
  // recusa baixar os outros. O Java de Mac Intel que serve no Mac ARM
  // (`senaoHouver`) leva os dois. Sem marca, serve em todos (o server.jar).
  const sistemasDe = nome => Object.entries(resolvido.porPlataforma ?? {}).filter(([, n]) => n === nome).map(([p]) => p);
  const artefatos = resolvido.artefatos.map(a => {
    const plataformas = sistemasDe(a.nome);
    return {
      nome: a.nome, url: a.url, tamanho: a.tamanho, hash: { algoritmo: a.hash.algoritmo, hex: a.hash.hex },
      ...(plataformas.length ? { plataformas } : {}),
    };
  });
  // O disco: o que se baixa, o Java desempacotado (cerca de três vezes o
  // pacote) e o mundo que a receita admite.
  const baixado = resolvido.artefatos.reduce((soma, a) => soma + a.tamanho, 0);
  const maiorPacote = resolvido.artefatos.reduce((maior, a) => (a.desempacotar ? Math.max(maior, a.tamanho) : maior), 0);
  const disco = Math.min(DISCO_MAXIMO_DA_OFERTA, baixado + 3 * maiorPacote + receita.disco.mundoMaximo);
  return {
    titulo: cortar(`${receita.nome} ${versao} · ${servidor}`, 64),
    receita: receita.id,
    versao_da_receita: receita.versao,
    versao_do_jogo: versao,
    tuneis: [{ nome: servidor, protocolo: receita.rede.protocolo, porta }],
    artefatos,
    pack: null,
    origens: [...receita.origens],
    dominios_do_jogo: [...receita.dominiosDoJogo],
    rodar: { comando: receita.rodar.comando, argumentos: [...receita.rodar.argumentos] },
    disco_maximo: disco,
    termos: receita.termos.map(t => ({ titulo: t.titulo, url: t.url })),
  };
}

// ---------------------------------------------------------------- configuração

/** Uma cópia da lista de palavras, para o padrão da receita nunca ser o que se edita. */
function copiarSegmentos(lista) {
  return lista.map(p => ({ texto: p.texto, cor: p.cor }));
}

/** O nome como texto simples, as palavras separadas por um espaço. */
function nomeEmTexto(segmentos) {
  return Array.isArray(segmentos) ? segmentos.map(p => p?.texto ?? '').join(' ') : String(segmentos ?? '');
}

/**
 * Confere uma lista de palavras `{texto, cor}` de um campo `segmentos`.
 * Devolve `{ lista }` com as palavras já aparadas, ou `{ erro }` com a frase.
 *
 * O `texto` nunca carrega `§` (uma palavra não escolhe a cor de outra por
 * fora do campo `cor`) nem quebra de linha, e a `cor` é uma das opções da
 * receita — as 16 do Minecraft.
 */
function conferirSegmentos(campo, valor) {
  if (!Array.isArray(valor)) return { erro: 'Use uma lista de palavras, cada uma com texto e cor.' };
  if (valor.length === 0) return { erro: 'Preencha o nome com ao menos uma palavra.' };
  if (valor.length > campo.maximoSegmentos) return { erro: `Use até ${campo.maximoSegmentos} palavras; são ${valor.length}.` };
  const lista = [];
  for (let i = 0; i < valor.length; i++) {
    const p = valor[i];
    const n = i + 1;
    const chaves = p && typeof p === 'object' && !Array.isArray(p) ? Object.keys(p) : [];
    if (chaves.length !== 2 || !chaves.includes('texto') || !chaves.includes('cor') || typeof p.texto !== 'string') {
      return { erro: `A palavra ${n} está mal formada: use {texto, cor}.` };
    }
    if (/[\u0000-\u001f\u007f-\u009f\u2028\u2029§]/.test(p.texto)) return { erro: `A palavra ${n} tem § ou uma quebra de linha, que não valem num nome.` };
    const texto = p.texto.trim();
    if (texto === '') return { erro: `A palavra ${n} está vazia.` };
    if (!campo.opcoes.some(o => o.valor === p.cor)) {
      return { erro: `A palavra ${n} usa a cor ${typeof p.cor === 'string' ? '«' + p.cor + '»' : JSON.stringify(p.cor)}, que não é uma das 16 do Minecraft.` };
    }
    lista.push({ texto, cor: p.cor });
  }
  const tamanho = [...nomeEmTexto(lista)].length;
  if (campo.tamanhoMaximo && tamanho > campo.tamanhoMaximo) return { erro: `Use até ${campo.tamanhoMaximo} caracteres no nome todo; este tem ${tamanho}.` };
  return { lista };
}

/** O nome com o `§` de cada cor antes da palavra dela: o que o `motd` lê. */
function motdDe(campo, segmentos) {
  return segmentos.map(p => '§' + campo.opcoes.find(o => o.valor === p.cor).codigo + p.texto).join(' ');
}

/** A configuração com os padrões da receita. */
function configPadrao(receita) {
  const config = {};
  for (const campo of receita.configuracao.campos) config[campo.chave] = campo.forma === 'segmentos' ? copiarSegmentos(campo.padrao) : campo.padrao;
  return config;
}

/**
 * Confere `entrada` contra o esquema de configuração da receita, sobre a
 * configuração `atual`. Devolve a configuração nova e, por campo, a frase do
 * que não serviu — as mesmas frases que o SEELE usa num formulário.
 */
function validarConfig(receita, entrada, atual = configPadrao(receita)) {
  const config = { ...configPadrao(receita), ...atual };
  const erros = {};
  if (!entrada || typeof entrada !== 'object' || Array.isArray(entrada)) return { config, erros: { '': 'A configuração não veio.' } };
  const campos = new Map(receita.configuracao.campos.map(c => [c.chave, c]));
  for (const [chave, valor] of Object.entries(entrada)) {
    const campo = campos.get(chave);
    if (!campo) {
      erros[chave] = `A receita não tem o campo «${chave}».`;
      continue;
    }
    let erro = null;
    let valorFinal = valor;
    if (campo.forma === 'segmentos') {
      const c = conferirSegmentos(campo, valor);
      if (c.erro) erro = c.erro;
      else valorFinal = c.lista;
    } else if (campo.forma === 'campo') {
      if (typeof valor !== 'string') erro = 'Use um texto.';
      else if (campo.obrigatorio && valor.trim() === '') erro = 'Preencha este campo.';
      else if (campo.tamanhoMaximo && [...valor].length > campo.tamanhoMaximo) erro = `Use até ${campo.tamanhoMaximo} caracteres; este tem ${[...valor].length}.`;
    } else if (campo.forma === 'numero') {
      if (typeof valor !== 'number' || !Number.isFinite(valor)) erro = `Use um número de ${campo.minimo} a ${campo.maximo}.`;
      else if (!Number.isInteger(valor)) erro = 'Use um número inteiro.';
      else if (valor < campo.minimo || valor > campo.maximo) erro = `Use um número de ${campo.minimo} a ${campo.maximo}.`;
    } else if (campo.forma === 'escolha') {
      if (!campo.opcoes.some(o => o.valor === valor)) erro = 'Escolha uma das opções.';
    } else if (campo.forma === 'interruptor') {
      if (typeof valor !== 'boolean') erro = 'Use ligado ou desligado.';
    }
    if (erro) erros[chave] = erro;
    else config[chave] = valorFinal;
  }
  return { config, erros };
}

/**
 * Um valor de `.properties`: `\`, `:`, `=`, `#`, `!`, as quebras e tudo fora
 * do ASCII escapados (o `§` sai `\u00a7`, que é como o Java o lê).
 */
function escaparPropriedade(texto) {
  let saida = '';
  for (const c of String(texto)) {
    const p = c.codePointAt(0);
    if (c === '\\') saida += '\\\\';
    else if (c === ':' || c === '=' || c === '#' || c === '!') saida += '\\' + c;
    else if (c === '\n') saida += '\\n';
    else if (c === '\r') saida += '\\r';
    else if (c === '\t') saida += '\\t';
    else if (p < 0x20 || p > 0x7e) {
      // Fora do BMP, o par substituto, como o Java lê.
      const unidades = p > 0xffff ? [0xd800 + ((p - 0x10000) >> 10), 0xdc00 + ((p - 0x10000) & 0x3ff)] : [p];
      for (const u of unidades) saida += '\\u' + u.toString(16).padStart(4, '0');
    } else saida += c;
  }
  return saida.startsWith(' ') ? '\\' + saida : saida;
}

/** O arquivo de configuração do jogo, a partir da configuração e da porta. */
function escreverPropriedades(receita, config, porta) {
  const valores = { ...configPadrao(receita), ...config, porta };
  // Uma lista de palavras entra no modelo já com o § de cada cor.
  for (const campo of receita.configuracao.campos) {
    if (campo.forma === 'segmentos') valores[campo.chave] = motdDe(campo, valores[campo.chave]);
  }
  const linhas = [
    `# Escrito pelo MOD de multiplayer do SEELE (receita ${receita.id} ${receita.versao}).`,
    '# Mude pela tela do SEELE: o que mudar aqui é reescrito ao ligar.',
  ];
  for (const [chave, modelo] of Object.entries(receita.configuracao.propriedades)) {
    const valor = modelo.replace(/\{([A-Za-z0-9]+)\}/g, (_, nome) => String(valores[nome]));
    linhas.push(`${chave}=${escaparPropriedade(valor)}`);
  }
  return linhas.join('\n') + '\n';
}

// ---------------------------------------------------------------- saída

/** Uma função que lê uma linha da saída do jogo e diz o que ela quer dizer. */
function casarSaida(receita) {
  const pronto = new RegExp(receita.saida.pronto);
  const entrou = new RegExp(receita.saida.entrou);
  const saiu = new RegExp(receita.saida.saiu);
  return linha => {
    const texto = String(linha);
    if (pronto.test(texto)) return { tipo: 'pronto' };
    let m = entrou.exec(texto);
    if (m) return { tipo: 'entrou', jogador: m[1] };
    m = saiu.exec(texto);
    if (m) return { tipo: 'saiu', jogador: m[1] };
    return null;
  };
}

// ---- servidor.js: a metade de servidor ----
//
// Guarda a lista de servidores de jogo e a configuração de cada um, quem roda
// onde, e a regra de uma máquina por vez. Fala com a máquina pelo
// `mundo.maquinas` da API 8, e com as janelas pelo `mundo.avisar`.
//
// # Quem pode o quê
//
// Toda mudança é uma ação declarada no manifesto, e quem decide se a pessoa a
// tem é o anfitrião (os cargos), antes de chamar este código. Aqui só se
// confere que a ação que o **anfitrião** escreveu em `contexto.acao` é a da
// operação pedida: um pedido comum com o corpo falsificado não muda nada, e a
// ação de entrar no jogo não liga servidor nenhum.
//
// # Nada calado
//
// Toda recusa volta com o nome e com os dados (`{ ok: false, erro, ... }`), e
// toda falha que acontece longe de quem pediu — a recusa da máquina, o hash
// que não bateu, o jogo que caiu — fica no servidor de jogo, em `falhas`, que
// a tela mostra, e no log de quem hospeda.

const TETO_DE_SERVIDORES = 8;
const TETO_DE_FALHAS = 6;
const TETO_DE_LINHAS = 8;
const VALIDADE_DAS_VERSOES = 3600;

/** A ação que cada operação de mudança pede. As outras são leitura. */
const ACAO_DA_OP = Object.freeze({
  criar: 'criar-servidor-de-jogo',
  apagar: 'criar-servidor-de-jogo',
  configurar: 'configurar-servidor-de-jogo',
  console: 'configurar-servidor-de-jogo',
  ligar: 'ligar-desligar-servidor-de-jogo',
  desligar: 'ligar-desligar-servidor-de-jogo',
});

/** Os estados em que o processo do jogo está de pé, ou a caminho. */
const RODANDO = new Set(['ligando', 'ligado', 'parando', 'salvando']);
const ESTADOS_DA_MAQUINA = new Set(['desligado', 'baixando', 'pronto', 'ligando', 'ligado', 'parando', 'salvando', 'caiu']);

// ---------------------------------------------------------------- o quintal

function lerServidores() {
  const lido = lerJson(dados.servidores);
  return lido && typeof lido === 'object' ? lido : {};
}

function gravarServidores(servidores) {
  dados.servidores = JSON.stringify(servidores);
  dados.revisao = String(Number(dados.revisao ?? '0') + 1);
  mundo.avisar({ carga: { revisao: Number(dados.revisao) } });
}

/** Uma falha no servidor de jogo, que a tela mostra com os dados, e no log. */
function anotarFalha(s, onde, erro, extra = {}) {
  const falha = { quando: mundo.agora(), onde, ...extra, erro: String(erro) };
  s.falhas = [...(s.falhas ?? []), falha].slice(-TETO_DE_FALHAS);
  mundo.registrar(`${s.id}: ${onde}: ${erro} ${JSON.stringify(extra)}`);
}

/** O que a tela de cada pessoa recebe de um servidor de jogo. */
function publico(s) {
  const receita = receitaPorId(s.receita);
  return {
    id: s.id,
    receita: s.receita,
    variante: s.variante,
    versao: s.versao,
    config: s.config,
    quem: s.quem,
    porta: s.porta,
    aceite: s.aceite,
    motivo: s.motivo ?? null,
    ligar: s.ligar,
    estado: s.estado,
    progresso: s.progresso ?? null,
    jogadores: s.jogadores ?? [],
    maximo: s.config?.maximo ?? null,
    falhas: s.falhas ?? [],
    linhas: s.linhas ?? [],
    precisaReiniciar: Boolean(s.precisaReiniciar),
    semJava: s.resolvido?.semJava ?? [],
    substituidas: s.resolvido?.substituidas ?? {},
    disco: s.oferta ? s.oferta.disco_maximo : null,
    protocolo: receita?.rede.protocolo ?? 'tcp',
  };
}

// ---------------------------------------------------------------- a oferta

/** A porta do jogo na máquina de `quem`: a padrão, ou a primeira livre depois dela. */
function portaPara(servidores, s, quem) {
  const receita = receitaPorId(s.receita);
  const tomadas = new Set(Object.values(servidores).filter(o => o.id !== s.id && o.quem === quem && o.porta).map(o => o.porta));
  let porta = receita.rede.portaPadrao;
  while (tomadas.has(porta)) porta++;
  return porta;
}

/** Monta a oferta da versão e da máquina escolhidas, e chama a pessoa. */
function pedirAMaquina(servidores, s) {
  const receita = receitaPorId(s.receita);
  if (!s.resolvido || s.resolvido.versao !== s.versao) {
    const resolvido = resolverVersao(receita, s.versao, url => mundo.buscar(url));
    if (!resolvido.ok) return resolvido;
    s.resolvido = resolvido;
  }
  s.porta = portaPara(servidores, s, s.quem);
  s.oferta = montarOferta(receita, { servidor: s.id, versao: s.versao, porta: s.porta }, s.resolvido);
  try {
    mundo.maquinas.pedir({ quem: s.quem, servidor: s.id, oferta: s.oferta });
  } catch (erro) {
    return { ok: false, erro: 'oferta-recusada', porque: fraseDoErro(erro) };
  }
  s.aceite = 'esperando';
  s.motivo = null;
  return { ok: true };
}

// ---------------------------------------------------------------- as operações

function opEstado(contexto) {
  const servidores = lerServidores();
  return {
    ok: true,
    revisao: Number(dados.revisao ?? '0'),
    receitas: RECEITAS.map(r => {
      const v = validarReceita(r);
      return { id: r.id, nome: r.nome, edicao: r.edicao ?? '', icone: r.icone, descricao: r.descricao, versao: r.versao, valida: v.ok, erros: v.erros.slice(0, 4) };
    }),
    servidores: Object.values(servidores).map(publico),
    podem: Array.isArray(contexto.permissoes) ? contexto.permissoes : [],
  };
}

function opVersoes(pedido) {
  const receita = receitaPorId(pedido.receita);
  if (!receita) return { ok: false, erro: 'receita-desconhecida', receita: pedido.receita ?? null };
  const cache = lerJson(dados['versoes:' + receita.id]);
  if (cache && mundo.agora() - cache.quando < VALIDADE_DAS_VERSOES) return { ok: true, versoes: cache.versoes };
  const r = listarVersoes(receita, url => mundo.buscar(url));
  if (!r.ok) return r;
  const versoes = r.versoes.map(v => v.id);
  dados['versoes:' + receita.id] = JSON.stringify({ quando: mundo.agora(), versoes });
  return { ok: true, versoes };
}

function opCriar(pedido, contexto) {
  const receita = receitaPorId(pedido.receita);
  if (!receita) return { ok: false, erro: 'receita-desconhecida', receita: pedido.receita ?? null };
  const valida = validarReceita(receita);
  if (!valida.ok) return { ok: false, erro: 'receita-invalida', receita: receita.id, erros: valida.erros.slice(0, 4) };
  const servidores = lerServidores();
  if (Object.keys(servidores).length >= TETO_DE_SERVIDORES) return { ok: false, erro: 'servidores-demais', teto: TETO_DE_SERVIDORES };
  const contador = lerJson(dados.contadores) ?? {};
  let n = contador[receita.id] ?? 0;
  let id;
  do { id = `${receita.id}-${++n}`; } while (servidores[id]);
  contador[receita.id] = n;
  dados.contadores = JSON.stringify(contador);
  const s = {
    id, receita: receita.id, variante: 'vanilla', versao: null, config: configPadrao(receita),
    quem: null, porta: null, aceite: 'sem-maquina', motivo: null, ligar: false, estado: 'desligado',
    jogadores: [], falhas: [], linhas: [], criadoPor: contexto.person,
  };
  servidores[id] = s;
  gravarServidores(servidores);
  return { ok: true, servidor: publico(s) };
}

function opApagar(s, servidores) {
  if (RODANDO.has(s.estado)) return { ok: false, erro: 'desligue-antes', estado: s.estado };
  delete servidores[s.id];
  gravarServidores(servidores);
  return { ok: true };
}

function opConfigurar(s, servidores, pedido) {
  const receita = receitaPorId(s.receita);
  if (pedido.variante !== undefined && pedido.variante !== 'vanilla') {
    return { ok: false, erro: 'variante-indisponivel', variante: pedido.variante, porque: receita.variantes[pedido.variante]?.porque ?? null };
  }
  let config = s.config;
  if (pedido.config !== undefined) {
    const r = validarConfig(receita, pedido.config, s.config);
    if (Object.keys(r.erros).length) return { ok: false, erro: 'config-invalida', erros: r.erros };
    config = r.config;
  }
  const versao = pedido.versao !== undefined ? (pedido.versao === null ? null : String(pedido.versao)) : s.versao;
  const quem = pedido.quem !== undefined ? (pedido.quem === null ? null : String(pedido.quem)) : s.quem;
  if (quem !== null && !/^[1-9][0-9]*$/.test(quem)) return { ok: false, erro: 'quem-invalido', quem };
  const mudaOQueRoda = versao !== s.versao || quem !== s.quem;
  if (mudaOQueRoda && RODANDO.has(s.estado)) return { ok: false, erro: 'desligue-antes', estado: s.estado };

  const configMudou = JSON.stringify(config) !== JSON.stringify(s.config);
  s.config = config;
  s.versao = versao;
  s.quem = quem;
  if (mudaOQueRoda) {
    if (quem === null) {
      s.aceite = 'sem-maquina';
      s.porta = null;
      s.oferta = null;
    } else if (versao === null) {
      s.aceite = 'sem-versao';
    } else {
      const r = pedirAMaquina(servidores, s);
      if (!r.ok) return r;
    }
  }
  if (configMudou && !mudaOQueRoda && s.aceite === 'aceito') {
    if (RODANDO.has(s.estado)) s.precisaReiniciar = true;
    mundo.maquinas.avisar({ servidor: s.id, carga: { op: 'configurar' } });
  }
  gravarServidores(servidores);
  return { ok: true, servidor: publico(s) };
}

function opLigar(s, servidores) {
  if (!s.versao) return { ok: false, erro: 'sem-versao' };
  if (!s.quem) return { ok: false, erro: 'sem-maquina' };
  s.ligar = true;
  let esperando = null;
  if (s.aceite === 'aceito') {
    mundo.maquinas.avisar({ servidor: s.id, carga: { op: 'ligar' } });
  } else if (s.aceite === 'esperando') {
    esperando = 'aceite';
  } else {
    // Parada, revogada ou recusada: ligar de novo é perguntar de novo.
    const r = pedirAMaquina(servidores, s);
    if (!r.ok) return r;
    esperando = 'aceite';
  }
  gravarServidores(servidores);
  return { ok: true, ...(esperando ? { esperando } : {}), servidor: publico(s) };
}

function opDesligar(s, servidores) {
  s.ligar = false;
  if (s.aceite === 'aceito') mundo.maquinas.avisar({ servidor: s.id, carga: { op: 'desligar' } });
  gravarServidores(servidores);
  return { ok: true, servidor: publico(s) };
}

function opConsole(s, pedido) {
  const comando = pedido.comando;
  if (typeof comando !== 'string' || comando.trim() === '' || /[\u0000-\u001f\u007f]/.test(comando) || bytesDe(comando) > 256) {
    return { ok: false, erro: 'comando-invalido' };
  }
  if (s.estado !== 'ligado') return { ok: false, erro: 'servidor-desligado', estado: s.estado };
  mundo.maquinas.avisar({ servidor: s.id, carga: { op: 'console', comando } });
  return { ok: true };
}

// ---------------------------------------------------------------- a máquina

/** O que a máquina aceita precisa para baixar, configurar e rodar. */
function planoDe(s) {
  const receita = receitaPorId(s.receita);
  return {
    servidor: s.id,
    receita: receita.id,
    versao: s.versao,
    artefatos: s.resolvido.artefatos,
    porPlataforma: s.resolvido.porPlataforma,
    semJava: s.resolvido.semJava,
    arquivoDeConfig: receita.configuracao.arquivo,
    propriedades: escreverPropriedades(receita, s.config, s.porta),
    termos: receita.termos.filter(t => t.arquivo).map(t => ({ id: t.id, arquivo: t.arquivo, conteudo: t.conteudo })),
    rodar: s.oferta.rodar,
    tunel: s.oferta.tuneis[0],
    ligar: s.ligar,
  };
}

function daMaquina(contexto, pedido) {
  const servidores = lerServidores();
  const s = servidores[contexto.maquina.servidor];
  if (!s) return { ok: false, erro: 'servidor-desconhecido', servidor: contexto.maquina.servidor, ordem: 'desligar' };
  // **Uma dona por vez.** O anfitrião só deixa a máquina aceita falar, mas a
  // posse é desta metade: quem não é a dona agora desliga.
  if (s.quem !== contexto.person) {
    anotarFalha(s, 'maquina', 'nao-e-a-dona', { dados: { pessoa: contexto.person } });
    gravarServidores(servidores);
    return { ok: false, erro: 'nao-e-a-dona', ordem: 'desligar' };
  }
  if (pedido.op === 'plano') {
    if (s.aceite !== 'aceito' || !s.resolvido || !s.oferta) return { ok: false, erro: 'sem-aceite' };
    return { ok: true, plano: planoDe(s) };
  }
  if (pedido.op === 'estado') {
    if (!ESTADOS_DA_MAQUINA.has(pedido.estado)) return { ok: false, erro: 'estado-desconhecido', estado: pedido.estado ?? null };
    const antes = s.estado;
    s.estado = pedido.estado;
    if (Array.isArray(pedido.jogadores)) s.jogadores = pedido.jogadores.map(j => cortar(j, 32)).slice(0, 200);
    if (s.estado === 'desligado' || s.estado === 'caiu') s.jogadores = [];
    if (pedido.progresso !== undefined) s.progresso = pedido.progresso;
    if (Array.isArray(pedido.linhas)) s.linhas = pedido.linhas.map(l => cortar(l, 160)).slice(-TETO_DE_LINHAS);
    if (s.estado === 'ligando' || s.estado === 'desligado') s.precisaReiniciar = false;
    if (s.estado === 'caiu' && antes !== 'caiu') anotarFalha(s, 'jogo', 'o-jogo-caiu', { dados: pedido.saida ?? {} });
    gravarServidores(servidores);
    // O jogo de pé quando ninguém o quer de pé desliga.
    if (RODANDO.has(s.estado) && !s.ligar && s.estado !== 'parando') return { ok: true, ordem: 'desligar' };
    return { ok: true };
  }
  if (pedido.op === 'falha') {
    anotarFalha(s, 'maquina', cortar(pedido.erro ?? 'falhou', 64), { etapa: cortar(pedido.etapa ?? '', 32), dados: pedido.dados ?? {} });
    gravarServidores(servidores);
    return { ok: true };
  }
  return { ok: false, erro: 'op-desconhecida', op: pedido.op ?? null };
}

// ---------------------------------------------------------------- as portas

globalThis.aoPedir = (textoDoContexto, textoDoPedido) => {
  const contexto = lerJson(textoDoContexto) ?? {};
  const pedido = lerJson(textoDoPedido);
  if (!pedido || typeof pedido !== 'object') return JSON.stringify({ ok: false, erro: 'pedido-invalido' });
  if (contexto.maquina) return JSON.stringify(daMaquina(contexto, pedido));

  const op = pedido.op;
  const acaoPedida = ACAO_DA_OP[op];
  if (contexto.acao && contexto.acao !== acaoPedida) return JSON.stringify({ ok: false, erro: 'acao-nao-serve', acao: contexto.acao, op: op ?? null });
  if (acaoPedida && contexto.acao !== acaoPedida) return JSON.stringify({ ok: false, erro: 'pede-a-acao', acao: acaoPedida });

  let resposta;
  if (op === 'estado') resposta = opEstado(contexto);
  else if (op === 'versoes') resposta = opVersoes(pedido);
  else if (op === 'criar') resposta = opCriar(pedido, contexto);
  else if (acaoPedida) {
    const servidores = lerServidores();
    const s = servidores[pedido.id];
    if (!s) resposta = { ok: false, erro: 'servidor-desconhecido', servidor: pedido.id ?? null };
    else if (op === 'apagar') resposta = opApagar(s, servidores);
    else if (op === 'configurar') resposta = opConfigurar(s, servidores, pedido);
    else if (op === 'ligar') resposta = opLigar(s, servidores);
    else if (op === 'desligar') resposta = opDesligar(s, servidores);
    else resposta = opConsole(s, pedido);
  } else resposta = { ok: false, erro: 'op-desconhecida', op: op ?? null };
  return JSON.stringify(resposta);
};

globalThis.aoAcontecer = (momento, textoDaCarga) => {
  if (!['MaquinaAceitou', 'MaquinaRecusou', 'MaquinaParou'].includes(momento)) return;
  const carga = lerJson(textoDaCarga) ?? {};
  const servidores = lerServidores();
  const s = servidores[carga.servidor];
  if (!s) {
    mundo.registrar(`${momento} de um servidor de jogo que não existe mais: ${JSON.stringify(carga)}`);
    return;
  }
  const pessoa = String(carga.pessoa ?? '');
  if (pessoa !== s.quem) {
    // A máquina de antes, dispensada por um pedido a outra pessoa: conta, e não mexe na de agora.
    anotarFalha(s, 'aceite', carga.motivo ?? momento, { dados: { pessoa, momento } });
    gravarServidores(servidores);
    return;
  }
  if (momento === 'MaquinaAceitou') {
    s.aceite = 'aceito';
    s.motivo = null;
    mundo.maquinas.avisar({ servidor: s.id, carga: { op: s.ligar ? 'ligar' : 'preparar' } });
  } else if (momento === 'MaquinaRecusou') {
    s.aceite = 'recusado';
    s.motivo = String(carga.motivo ?? '');
    s.ligar = false;
    anotarFalha(s, 'aceite', s.motivo, { dados: { pessoa } });
  } else {
    s.aceite = 'parado';
    s.motivo = String(carga.motivo ?? '');
    s.ligar = false;
    s.estado = 'desligado';
    s.jogadores = [];
    anotarFalha(s, 'aceite', s.motivo, { dados: { pessoa } });
  }
  gravarServidores(servidores);
};

})();
