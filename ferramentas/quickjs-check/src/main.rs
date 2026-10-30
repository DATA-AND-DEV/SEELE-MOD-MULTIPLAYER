//! O MOD de multiplayer, no motor de verdade: as três metades no QuickJS
//! 0.12.2, com o teto de 8 MiB, conversando entre si.
//!
//! - a **metade de servidor** sobe com o que a API 8 dá a ela (`dados`,
//!   `mundo.buscar` respondido pelas fixtures, `mundo.avisar`,
//!   `mundo.maquinas.pedir` e `.avisar`) e atende a janela e a máquina;
//! - a **metade de máquina** sobe com um `maquina` de mentira, com os nomes que
//!   o adaptador supõe (fonte/adaptador.js), e passa por aceitar, baixar,
//!   escrever, rodar, ficar pronta, servir o túnel, ver alguém entrar e parar;
//! - a **metade de cliente** sobe em cima do prelúdio do motor
//!   (`SEELE_RAIZ/crates/seele-motor/src/preludio.rs`, o da API 8, que tem o
//!   `SeeleUI.tunel`), sem DOM e sem Node, e o clique de «entrar» leva o
//!   bilhete de gesto.
//!
//! # O que este exercício não prova
//!
//! O executor, a tela de aceite do produto, o download e o processo de
//! verdade, e se os nomes que o adaptador supõe são os que as partes 3 e 4
//! entregam. É o motor, o teto de memória e o prelúdio.

use rquickjs::{Context, Function, Runtime};
use serde_json::{json, Value};
use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;

type Erro = Box<dyn std::error::Error>;

fn preludio() -> Result<String, String> {
    const FONTE: &str = include_str!(concat!(env!("SEELE_RAIZ"), "/crates/seele-motor/src/preludio.rs"));
    const MARCA: &str = "pub const PRELUDIO: &str = r#\"";
    let inicio = FONTE.find(MARCA).ok_or("`PRELUDIO` não foi encontrado em preludio.rs")?;
    let resto = &FONTE[inicio + MARCA.len()..];
    let fim = resto.find("\"#;").ok_or("`PRELUDIO` não fecha")?;
    Ok(resto[..fim].to_owned())
}

fn motor() -> Result<(Runtime, Context), Erro> {
    let runtime = Runtime::new()?;
    runtime.set_memory_limit(8 * 1024 * 1024);
    let started = std::time::Instant::now();
    runtime.set_interrupt_handler(Some(Box::new(move || started.elapsed().as_secs() > 20)));
    let context = Context::full(&runtime)?;
    Ok((runtime, context))
}

fn avaliar(ctx: &Context, codigo: &str, onde: &str) -> Result<(), Erro> {
    ctx.with(|c| -> Result<(), String> {
        c.eval::<(), _>(codigo).map_err(|e| format!("{onde}: {e}: {:?}", c.catch()))?;
        while c.execute_pending_job() {}
        Ok(())
    })
    .map_err(|e| std::io::Error::other(e).into())
}

fn texto(ctx: &Context, codigo: &str) -> Result<String, Erro> {
    ctx.with(|c| c.eval::<String, _>(codigo).map_err(|e| format!("{codigo}: {e}: {:?}", c.catch())))
        .map_err(|e| std::io::Error::other(e).into())
}

/// As fixtures: o que `mundo.buscar` responde. Nada sai para a rede.
fn fixtures() -> Result<HashMap<String, String>, Erro> {
    let manifesto = include_str!("../../../test/fixtures/mojang-version_manifest_v2.json");
    let mut mapa = HashMap::new();
    mapa.insert("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json".to_owned(), manifesto.to_owned());
    let lido: Value = serde_json::from_str(manifesto)?;
    let por_id = |id: &str| -> Option<String> {
        lido["versions"].as_array()?.iter().find(|v| v["id"] == id).and_then(|v| v["url"].as_str()).map(str::to_owned)
    };
    mapa.insert(por_id("1.21.4").ok_or("1.21.4")?, include_str!("../../../test/fixtures/mojang-1.21.4.json").to_owned());
    mapa.insert(
        "https://api.adoptium.net/v3/assets/latest/21/hotspot?image_type=jre&vendor=eclipse".to_owned(),
        include_str!("../../../test/fixtures/adoptium-21.json").to_owned(),
    );
    Ok(mapa)
}

const AMBIENTE_DO_SERVIDOR: &str = r#"globalThis.dados = {};
    globalThis.__avisos = []; globalThis.__pedidosDeMaquina = []; globalThis.__avisosAMaquina = []; globalThis.__registro = [];
    globalThis.mundo = {
      agora: () => 1000000,
      registrar: t => { __registro.push(String(t)); },
      buscar: url => { const t = __buscar(url); return t === '' ? null : t; },
      avisar: a => { if (JSON.stringify(a.carga).length > 1024) throw new Error('aviso-grande-demais'); __avisos.push(a); return { ok: true }; },
      maquinas: {
        pedir: p => { __pedidosDeMaquina.push(JSON.parse(JSON.stringify(p))); },
        avisar: a => { __avisosAMaquina.push(JSON.parse(JSON.stringify(a))); },
      },
    };"#;

fn servidor() -> Result<(Runtime, Context), Erro> {
    let (rt, ctx) = motor()?;
    let mapa = fixtures()?;
    ctx.with(|c| -> Result<(), String> {
        let buscar = Function::new(c.clone(), move |url: String| -> String { mapa.get(&url).cloned().unwrap_or_default() })
            .map_err(|e| e.to_string())?;
        c.globals().set("__buscar", buscar).map_err(|e| e.to_string())
    })
    .map_err(std::io::Error::other)?;
    avaliar(&ctx, AMBIENTE_DO_SERVIDOR, "ambiente do servidor")?;
    avaliar(&ctx, include_str!("../../../servidor/main.js"), "servidor/main.js")?;
    Ok((rt, ctx))
}

/// Uma volta de `aoPedir`, como o anfitrião a faz.
fn pedir(srv: &Context, contexto: &Value, valor: &Value) -> Result<Value, Erro> {
    srv.with(|c| -> Result<(), String> {
        c.globals().set("__c", contexto.to_string()).map_err(|e| e.to_string())?;
        c.globals().set("__v", valor.to_string()).map_err(|e| e.to_string())
    })
    .map_err(std::io::Error::other)?;
    Ok(serde_json::from_str(&texto(srv, "aoPedir(__c, __v)")?)?)
}

fn momento(srv: &Context, nome: &str, carga: &Value) -> Result<(), Erro> {
    avaliar(srv, &format!("aoAcontecer({}, {})", json!(nome), json!(carga.to_string())), nome)
}

fn de(acao: Option<&str>) -> Value {
    json!({ "person": "1", "channel": null, "admin": true, "write": true, "sala": null, "acao": acao,
            "permissoes": ["criar-servidor-de-jogo", "configurar-servidor-de-jogo", "ligar-desligar-servidor-de-jogo", "entrar-no-jogo"] })
}

fn avisos_a_maquina(srv: &Context) -> Result<Vec<Value>, Erro> {
    Ok(serde_json::from_str(&texto(srv, "JSON.stringify(__avisosAMaquina.splice(0))")?)?)
}

fn estado_do(srv: &Context, id: &str) -> Result<Value, Erro> {
    let e = pedir(srv, &de(None), &json!({ "op": "estado" }))?;
    e["servidores"].as_array().and_then(|l| l.iter().find(|s| s["id"] == id).cloned()).ok_or_else(|| format!("{id} sumiu").into())
}

const AMBIENTE_DA_MAQUINA: &str = r#"
    let n = 0; const espera = new Map();
    globalThis.__fila = [];
    globalThis.__responder = (k, t) => { const r = espera.get(k); espera.delete(k); r(JSON.parse(t)); };
    const reg = (tipo, extra) => new Promise(res => { const k = ++n; espera.set(k, res); __fila.push(JSON.stringify({ k, tipo, ...extra })); });
    const proc = {
      aoLinha: fn => { globalThis.__linha = fn; }, aoSair: fn => { globalThis.__sair = fn; },
      escrever: t => { __fila.push(JSON.stringify({ tipo: 'entrada', t })); }, encerrar: () => { __fila.push(JSON.stringify({ tipo: 'encerrar' })); },
    };
    globalThis.maquina = {
      plataforma: () => ({ sistema: 'macos', arquitetura: 'arm64' }),
      programa: { baixar: p => reg('baixar', { p }), rodar: p => reg('rodar', { p }).then(() => proc) },
      porta: { servir: p => reg('servir', { p }) },
      arquivos: { escrever: p => reg('escrever', { p }), copiar: p => reg('copiar', { p }) },
      pedir: (servidor, valor) => reg('pedir', { servidor, valor }),
      aoAviso: fn => { globalThis.__aviso = fn; },
    };
    globalThis.setTimeout = () => 1;
    globalThis.__log = [];
    globalThis.console = { log: t => __log.push(String(t)), info: () => {}, warn: t => __log.push('warn: ' + t), error: t => __log.push('error: ' + t) };"#;

/// O que a máquina fez, até a conversa assentar.
#[derive(Default)]
struct Fita {
    baixados: Vec<Value>,
    escritos: Vec<Value>,
    rodados: Vec<Value>,
    servidos: Vec<Value>,
    entrada: Vec<String>,
}

fn assentar_maquina(maq: &Context, srv: &Context, fita: &mut Fita) -> Result<(), Erro> {
    for _ in 0..200 {
        avaliar(maq, "0", "jobs")?;
        let fila: Vec<String> = serde_json::from_str(&texto(maq, "JSON.stringify(__fila.splice(0))")?)?;
        let avisos = avisos_a_maquina(srv)?;
        if fila.is_empty() && avisos.is_empty() {
            return Ok(());
        }
        for aviso in avisos {
            avaliar(maq, &format!("__aviso({}, {})", aviso["servidor"], aviso["carga"]), "aviso")?;
        }
        for item in fila {
            let m: Value = serde_json::from_str(&item)?;
            let resposta = match m["tipo"].as_str().unwrap_or_default() {
                "pedir" => {
                    let contexto = json!({ "person": "2", "channel": null, "admin": false, "write": true, "sala": null, "acao": null,
                                           "permissoes": [], "maquina": { "servidor": m["servidor"] } });
                    pedir(srv, &contexto, &m["valor"])?
                }
                "baixar" => { fita.baixados.push(m["p"].clone()); json!({ "ok": true }) }
                "escrever" => { fita.escritos.push(m["p"].clone()); json!({ "ok": true }) }
                "rodar" => { fita.rodados.push(m["p"].clone()); json!({ "ok": true }) }
                "servir" => { fita.servidos.push(m["p"].clone()); json!({ "ok": true }) }
                "entrada" => { fita.entrada.push(m["t"].as_str().unwrap_or_default().to_owned()); continue; }
                _ => continue,
            };
            avaliar(maq, &format!("__responder({}, {})", m["k"], json!(resposta.to_string())), "responder")?;
        }
    }
    Err("a conversa com a máquina não assentou".into())
}

fn maquina_e_servidor(srv: &Context) -> Result<String, Erro> {
    let r = pedir(srv, &de(Some("criar-servidor-de-jogo")), &json!({ "op": "criar", "receita": "minecraft" }))?;
    let id = r["servidor"]["id"].as_str().ok_or_else(|| format!("criar: {r}"))?.to_owned();
    let r = pedir(srv, &de(Some("configurar-servidor-de-jogo")),
        &json!({ "op": "configurar", "id": id, "versao": "1.21.4", "quem": "2", "config": { "nome": "Casa do Alê", "maximo": 6 } }))?;
    if r["ok"] != true { return Err(format!("configurar: {r}").into()); }
    let pedidos: Vec<Value> = serde_json::from_str(&texto(srv, "JSON.stringify(__pedidosDeMaquina)")?)?;
    if pedidos.len() != 1 || pedidos[0]["oferta"]["versao_do_jogo"] != "1.21.4" {
        return Err(format!("a oferta não saiu: {pedidos:?}").into());
    }

    let (_rm, maq) = motor()?;
    avaliar(&maq, AMBIENTE_DA_MAQUINA, "ambiente da máquina")?;
    avaliar(&maq, include_str!("../../../maquina/main.js"), "maquina/main.js")?;
    let mut fita = Fita::default();

    momento(srv, "MaquinaAceitou", &json!({ "servidor": id, "pessoa": "2" }))?;
    assentar_maquina(&maq, srv, &mut fita)?;
    let destinos: Vec<String> = fita.baixados.iter().filter_map(|b| b["destino"].as_str().map(str::to_owned)).collect();
    if destinos != ["server.jar", "java"] || fita.baixados[0]["sha1"].as_str().map(str::len) != Some(40)
        || fita.baixados[1]["sha256"].as_str().map(str::len) != Some(64)
        || !fita.baixados[1]["url"].as_str().unwrap_or_default().contains("aarch64_mac") {
        return Err(format!("baixou errado: {:?}", fita.baixados).into());
    }
    if !fita.escritos.is_empty() { return Err("escreveu antes de ligar".into()); }

    pedir(srv, &de(Some("ligar-desligar-servidor-de-jogo")), &json!({ "op": "ligar", "id": id }))?;
    assentar_maquina(&maq, srv, &mut fita)?;
    let caminhos: Vec<String> = fita.escritos.iter().filter_map(|e| e["caminho"].as_str().map(str::to_owned)).collect();
    if caminhos != ["eula.txt", "server.properties"] { return Err(format!("escreveu: {caminhos:?}").into()); }
    if fita.rodados.len() != 1 || fita.rodados[0]["comando"] != "java/bin/java" { return Err(format!("rodou: {:?}", fita.rodados).into()); }
    if !fita.servidos.is_empty() { return Err("serviu o túnel antes do Done".into()); }

    avaliar(&maq, r#"__linha('[12:00:04] [Server thread/INFO]: Done (4.211s)! For help, type "help"')"#, "Done")?;
    assentar_maquina(&maq, srv, &mut fita)?;
    avaliar(&maq, "__linha('[12:01:00] [Server thread/INFO]: Bia joined the game')", "entrou")?;
    assentar_maquina(&maq, srv, &mut fita)?;
    if fita.servidos.len() != 1 || fita.servidos[0]["porta"] != 25565 { return Err(format!("túnel: {:?}", fita.servidos).into()); }
    let s = estado_do(srv, &id)?;
    if s["estado"] != "ligado" || s["jogadores"] != json!(["Bia"]) { return Err(format!("estado ligado: {s}").into()); }

    pedir(srv, &de(Some("ligar-desligar-servidor-de-jogo")), &json!({ "op": "desligar", "id": id }))?;
    assentar_maquina(&maq, srv, &mut fita)?;
    if fita.entrada != ["stop\n"] { return Err(format!("entrada: {:?}", fita.entrada).into()); }
    avaliar(&maq, "__sair({ codigo: 0 })", "sair")?;
    assentar_maquina(&maq, srv, &mut fita)?;
    let s = estado_do(srv, &id)?;
    if s["estado"] != "desligado" || !s["falhas"].as_array().map(Vec::is_empty).unwrap_or(false) {
        return Err(format!("estado desligado: {s}").into());
    }
    let log: Vec<String> = serde_json::from_str(&texto(&maq, "JSON.stringify(__log.filter(l => /^(warn|error)/.test(l)))")?)?;
    if !log.is_empty() { return Err(format!("a máquina anotou erros: {log:?}").into()); }
    // Deixa o servidor de jogo ligado para a janela ver o cartão.
    avaliar(srv, &format!("aoPedir({}, {})", json!(json!({"person":"2","maquina":{"servidor":id}}).to_string()),
        json!(json!({"op":"estado","estado":"ligado","jogadores":["Bia"]}).to_string())), "religar")?;
    println!("máquina: aceitar, baixar {} artefato(s), escrever {}, rodar, Done, túnel na {}, Bia dentro, stop e desligado.",
        fita.baixados.len(), caminhos.join(" e "), fita.servidos[0]["porta"]);
    Ok(id)
}

fn cliente(srv: &Context, id: &str) -> Result<(), Erro> {
    let (_rc, cli) = motor()?;
    let fita: Rc<RefCell<Vec<String>>> = Rc::new(RefCell::new(Vec::new()));
    let registro: Rc<RefCell<Vec<String>>> = Rc::new(RefCell::new(Vec::new()));
    let grandes: Rc<RefCell<usize>> = Rc::new(RefCell::new(0));
    cli.with(|c| -> Result<(), String> {
        let eco = Rc::clone(&fita);
        let excesso = Rc::clone(&grandes);
        let postar = Function::new(c.clone(), move |t: String| -> bool {
            if t.len() > 12 * 1024 { *excesso.borrow_mut() += 1; return false; }
            eco.borrow_mut().push(t);
            true
        }).map_err(|e| e.to_string())?;
        let anotado = Rc::clone(&registro);
        let console = Function::new(c.clone(), move |nivel: String, t: String| { anotado.borrow_mut().push(format!("{nivel}: {t}")); })
            .map_err(|e| e.to_string())?;
        let seele = rquickjs::Object::new(c.clone()).map_err(|e| e.to_string())?;
        seele.set("postar", postar).map_err(|e| e.to_string())?;
        seele.set("console", console).map_err(|e| e.to_string())?;
        c.globals().set("seele", seele).map_err(|e| e.to_string())
    }).map_err(std::io::Error::other)?;

    // As capacidades da API 8, mais `tunel`, que vem do poder `porta`.
    let contrato: Value = serde_json::from_str(include_str!("../../../test/contrato/api-v8.json"))?;
    let mut capacidades = contrato["compatibilidade"]["capacidades-por-versao"]["8"].as_array().cloned().ok_or("sem capacidades da 8")?;
    capacidades.extend(contrato["compatibilidade"]["capacidades-por-poder"]["porta"].as_array().cloned().unwrap_or_default());
    avaliar(&cli, &format!("globalThis.__seeleCapacidades = {};", Value::Array(capacidades)), "capacidades")?;
    avaliar(&cli, &preludio()?, "prelúdio")?;
    let vazios = texto(&cli, r#"['document','window','fetch','localStorage','require','process','maquina'].filter(n => typeof globalThis[n] !== 'undefined').join(',')"#)?;
    if !vazios.is_empty() { return Err(format!("o contexto do MOD tem o que não deveria: {vazios}").into()); }
    if texto(&cli, "typeof SeeleUI.tunel?.entrar")? != "function" { return Err("o prelúdio não deu SeeleUI.tunel".into()); }
    avaliar(&cli, include_str!("../../../cliente/main.js"), "cliente/main.js")?;

    let retrato = json!({ "eu": 1, "servidor": { "nome": "QuickJS" },
        "pessoas": [{ "id": 1, "apelido": "Alexandre", "falando": false, "mudo": false }, { "id": 2, "apelido": "Fulano", "falando": false, "mudo": false }],
        "salas": [], "canais": [], "onde": "computador", "regioes": ["servidor.navegacao", "pagina"] });
    let eventos = [
        json!({ "tipo": "evento", "nome": "acao", "acao": "abrir-multiplayer", "pessoa": "", "canal": "" }),
        json!({ "tipo": "evento", "nome": "botao", "chave": format!("entrar:{id}"), "gesto": "bilhete-1" }),
        json!({ "tipo": "evento", "nome": "botao", "chave": format!("configurar:{id}"), "gesto": "bilhete-2" }),
        json!({ "tipo": "evento", "nome": "aba", "chave": "aba", "valor": "aba-maquina" }),
        json!({ "tipo": "evento", "nome": "aba", "chave": "aba", "valor": "aba-jogadores" }),
        json!({ "tipo": "evento", "nome": "aba", "chave": "aba", "valor": "aba-mods" }),
        json!({ "tipo": "evento", "nome": "aba", "chave": "aba", "valor": "aba-geral" }),
        json!({ "tipo": "evento", "nome": "numero", "chave": "cfg:maximo", "valor": 8 }),
        json!({ "tipo": "evento", "nome": "botao", "chave": "salvar", "gesto": "bilhete-3" }),
    ];
    let (mut tipos, mut erros_ditos, mut entradas) = (Vec::<String>::new(), Vec::<String>::new(), Vec::<Value>::new());
    let mut proximo = 0;
    for _ in 0..400 {
        let falas: Vec<String> = fita.borrow_mut().drain(..).collect();
        if falas.is_empty() {
            if proximo == eventos.len() { break; }
            responder(&cli, &eventos[proximo].to_string())?;
            proximo += 1;
            continue;
        }
        for t in falas {
            let m: Value = serde_json::from_str(&t)?;
            let tipo = m["tipo"].as_str().unwrap_or_default().to_owned();
            tipos.push(tipo.clone());
            if tipo == "superficie-criar" && m["descricao"]["tipo"] == "aviso" && m["descricao"]["tom"] == "erro" {
                erros_ditos.push(m["descricao"].to_string());
            }
            let valor = match tipo.as_str() {
                "retrato" => retrato.clone(),
                "pedido" => pedir(srv, &de(None), &m["valor"])?,
                "acao" => pedir(srv, &de(m["acao"].as_str()), &m["valor"])?,
                "superficie-criar" => json!({ "superficie": m["descricao"]["id"], "reaproveitada": false }),
                "contribuir" => json!({ "handle": "c1" }),
                "tunel-entrar" => { entradas.push(m.clone()); json!(25565) }
                "erro-no-evento" => { erros_ditos.push(m.to_string()); continue; }
                _ => Value::Null,
            };
            responder(&cli, &json!({ "tipo": "resposta", "n": m["n"], "ok": true, "valor": valor }).to_string())?;
        }
    }
    let conta = |n: &str| tipos.iter().filter(|t| t.as_str() == n).count();
    let erros: Vec<String> = registro.borrow().iter().filter(|l| l.starts_with("error") || l.starts_with("warn")).cloned().collect();
    if *grandes.borrow() > 0 { return Err(format!("{} mensagem(ns) passaram dos 12 KiB", grandes.borrow()).into()); }
    if !erros.is_empty() { return Err(format!("o MOD anotou erros: {erros:?}").into()); }
    if !erros_ditos.is_empty() { return Err(format!("o MOD disse erros a quem usa: {erros_ditos:?}").into()); }
    if entradas.len() != 1 || entradas[0]["gesto"] != "bilhete-1" || entradas[0]["nome"] != id {
        return Err(format!("o entrar não levou o bilhete do clique: {entradas:?}").into());
    }
    for preciso in ["retrato", "pedido", "acao", "contribuir", "superficie-criar", "superficie-classes", "superficie-montar"] {
        if conta(preciso) == 0 { return Err(format!("o MOD não chegou a «{preciso}»: {tipos:?}").into()); }
    }
    if proximo < eventos.len() { return Err("a conversa não assentou".into()); }
    if estado_do(srv, id)?["config"]["maximo"] != 8 { return Err("o salvar não chegou à metade de servidor".into()); }
    println!("cliente: prelúdio da API 8 sem DOM e sem Node, {} montagem(ns), {} pedido(s), {} ação(ões), o entrar com o bilhete do clique, nenhuma mensagem acima de 12 KiB.",
        conta("superficie-montar"), conta("pedido"), conta("acao"));
    Ok(())
}

fn responder(cli: &Context, t: &str) -> Result<(), Erro> {
    cli.with(|c| -> Result<(), String> {
        c.globals().set("__r", t.to_owned()).map_err(|e| e.to_string())?;
        c.eval::<(), _>("aoResponder(__r)").map_err(|e| format!("aoResponder: {e}: {:?}", c.catch()))?;
        while c.execute_pending_job() {}
        Ok(())
    }).map_err(|e| std::io::Error::other(e).into())
}

fn main() -> Result<(), Erro> {
    let (_rs, srv) = servidor()?;
    let id = maquina_e_servidor(&srv)?;
    let dados_sao_texto = texto(&srv, "String(Object.values(dados).every(v => typeof v === 'string'))")?;
    if dados_sao_texto != "true" { return Err("o quintal tem valor que não é texto".into()); }
    println!("servidor: criar, configurar, a oferta, o aceite, o plano e os estados da máquina, no quintal só texto.");
    cliente(&srv, &id)?;
    println!("QuickJS 0.12.2 / 8 MiB: as três metades passaram.");
    Ok(())
}
