/* pos.js — EDUMERCA POS → Registrar: caja de respaldo para cuando Siigo no funciona (17_pos.gs en el servidor).
   Se escanean los productos (lector USB/Bluetooth, cámara 📷 o buscando por nombre), la app totaliza y
   "Guardar cuenta" la sube a Drive: EDUMERCA/EDUMERCA POS/CUENTAS/Cuentas AAAA-MM-DD.txt (Cuenta 1:, Cuenta 2:, …).
   En "Cuentas" se ven las del día, se anulan y se descargan en TXT o PDF (el archivo también queda en Drive), y el
   botón grande "CREAR FACTURA EN SIIGO" las sube a Siigo: factura electrónica o documento soporte (no electrónico),
   una factura por cuenta o todas en una sola. El registro queda en EDUMERCA/EDUMERCA POS/FACTURAS DE VENTA/CREADAS.
   Nada se pierde sin internet: la cuenta en curso y las guardadas que no han subido quedan en este equipo
   y se suben solas cuando vuelve la conexión.
   Se carga después de index.html y usa sus funciones: $, ir, irMenu, postAdmin, plata, pesos, esc, normal, buscar,
   productos, abrirCamara, pedirForm, elegir, leer, guardar, leerJSON, trFechaDe, fechaTxt, quien. */
(function(){
"use strict";
const ACT_KEY = "pos_actual", PEND_KEY = "pos_pend", DIA_KEY = "pos_dia", PAGOS = ["Efectivo", "Transferencia"];
const hoy = () => trFechaDe(0);
const hora = () => new Date().toTimeString().slice(0, 5);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const nueva = () => ({id: uid(), lineas: [], pago: "Efectivo"});
const sub = l => Math.round(l.q * l.p);
const totalDe = c => c.lineas.reduce((t, l) => t + sub(l), 0);
const cant = q => String(Math.round(q * 1000) / 1000).replace(".", ",");
let cuenta = leerJSON(ACT_KEY, null) || nueva();
let pend = leerJSON(PEND_KEY, []);                 // cuentas guardadas que todavía no llegan a Drive
let dias = leerJSON(DIA_KEY, {});                  // lo último que dijo el servidor de cada día: {fecha: {cuentas, total, n}}
let vista = "cuenta", verFecha = hoy(), enviando = false, servidorViejo = false, marcada = -1, facturando = false, tipoFac = "soporte";   // documento soporte por defecto
const guardarCuenta = () => { try{ localStorage.setItem(ACT_KEY, JSON.stringify(cuenta)); }catch(e){} };
const guardarPend = () => { try{ localStorage.setItem(PEND_KEY, JSON.stringify(pend)); }catch(e){} };
const guardarDias = () => { try{ const ks = Object.keys(dias).sort().slice(-10), o = {}; ks.forEach(k => o[k] = dias[k]);
  dias = o; localStorage.setItem(DIA_KEY, JSON.stringify(dias)); }catch(e){} };
function estado(t, mal){ const e = $("posEstado"); e.textContent = t || ""; e.style.color = mal ? "#ff9a86" : ""; }

/* ---------- Estilos ---------- */
(function(){
  const st = document.createElement("style");
  st.textContent = `.pos-l{display:grid;grid-template-columns:1fr auto auto;gap:4px 10px;align-items:center;padding:10px 0;
      border-bottom:1px solid rgba(251,250,245,.12)}
    .pos-l.pos-nueva{background:rgba(47,211,147,.16);border-radius:8px;padding-left:8px;padding-right:8px}
    .pos-l .pn{font-weight:600;line-height:1.2;min-width:0}
    .pos-l .pn small{display:block;font-weight:400;opacity:.7;font-size:.8rem;margin-top:2px}
    .pos-l .pn small button{background:none;border:0;color:inherit;text-decoration:underline;font:inherit;padding:0;cursor:pointer}
    .pos-q{display:flex;align-items:center;gap:2px}
    .pos-q button{min-width:38px;height:38px;border-radius:9px;border:0;background:var(--verde2);color:var(--papel);
      font:700 1.15rem "Barlow",sans-serif;cursor:pointer}
    .pos-q button.n{background:transparent;min-width:40px;text-decoration:underline}
    .pos-l .ps{text-align:right;min-width:84px}
    .pos-l .px{grid-column:3;justify-self:end;background:none;border:0;color:var(--rojo);font-size:.85rem;cursor:pointer;padding:0}
    .pos-tot{display:flex;justify-content:space-between;align-items:baseline;gap:10px;padding:6px 2px}
    .pos-tot b{font:800 clamp(2.2rem,9vw,3.6rem)/1 "Barlow Condensed",sans-serif;color:var(--amarillo)}
    .pos-fila{display:flex;gap:8px;margin-top:8px}
    .pos-fila > *{flex:1}
    .pos-res{width:100%;text-align:left;display:flex;justify-content:space-between;gap:10px;padding:12px 6px;background:none;border:0;
      border-bottom:1px solid rgba(251,250,245,.12);color:var(--papel);font:500 1rem "Barlow",sans-serif;cursor:pointer}
    .pos-res small{display:block;opacity:.65;font-size:.8rem}
    .pos-cta{border-bottom:1px solid rgba(251,250,245,.12);padding:10px 0}
    .pos-cta.anulada{opacity:.5}
    .pos-cta summary{display:flex;justify-content:space-between;gap:10px;cursor:pointer;list-style:none;font-weight:600}
    .pos-cta summary::-webkit-details-marker{display:none}
    .pos-cta .det{font-size:.88rem;opacity:.85;margin:6px 0 0 10px}
    .pos-cta .fac{color:#2fd393;font-weight:600}
    .pos-cta .fac a{color:inherit}
    .pos-fac{width:100%;min-height:64px;margin-top:10px;border:0;border-radius:14px;background:var(--amarillo);color:var(--verde);
      font:800 1.35rem/1.1 "Barlow Condensed",sans-serif;letter-spacing:.02em;cursor:pointer}
    .pos-fac small{display:block;font:500 .85rem "Barlow",sans-serif;opacity:.75;margin-top:2px;letter-spacing:0}
    .pos-fac:disabled{opacity:.45;cursor:default}`;
  document.head.appendChild(st);
})();

/* ---------- Agregar productos ---------- */
function agregar(it){
  const c = String(it.c || it.b || "");
  let i = cuenta.lineas.findIndex(l => l.c === c && l.n === it.n && l.p === Number(it.p));
  if(i >= 0) cuenta.lineas[i].q = Math.round((cuenta.lineas[i].q + 1) * 1000) / 1000;
  else { cuenta.lineas.push({c, n: it.n, p: Number(it.p) || 0, q: 1}); i = cuenta.lineas.length - 1; }
  marcada = i; guardarCuenta();
  $("posBuscar").value = ""; vista = "cuenta";
  estado("✓ " + it.n + " · " + plata(it.p));
  if(navigator.vibrate) navigator.vibrate(40);
  pintar();
  const fila = document.querySelector(`.pos-l[data-i="${i}"]`); if(fila) fila.scrollIntoView({block: "nearest"});
}
/* Lo que lee el lector (USB/Bluetooth o la cámara) */
window.posCodigo = function(v){
  v = String(v || "").trim(); if(!v) return;
  const it = buscar(v);
  if(it) return agregar(it);
  estado(`⚠ El código ${v} no está en el catálogo. Búscalo por nombre o agrégalo con el botón +.`, true);
  if(navigator.vibrate) navigator.vibrate([100, 60, 100]);
};
function resultados(q){
  const t = normal(q).trim(); if(!t) return [];
  const pal = t.split(/\s+/), d = t.replace(/\s+/g, "").replace(/^0+(?=\d)/, "");
  const r = productos.filter(p => pal.every(w => normal(p.n).includes(w)) ||
    (d.length >= 3 && /^\d+$/.test(d) && (String(p.c).replace(/^0+/, "").includes(d) || String(p.b).replace(/^0+/, "").includes(d))));
  r.sort((a, b) => (normal(b.n).startsWith(pal[0]) - normal(a.n).startsWith(pal[0])) || a.n.localeCompare(b.n, "es"));
  return r.slice(0, 40);
}

/* ---------- Pintar ---------- */
function pintar(){
  if(vista === "cuentas") return pintarCuentas();
  $("btnPosCuentas").textContent = "Cuentas" + (pend.length ? ` (⏳${pend.length})` : "");
  const q = $("posBuscar").value.trim(), p = $("posPanel");
  if(q){
    const r = resultados(q);
    p.innerHTML = r.length ? r.map((x, i) => `<button class="pos-res" data-r="${i}"><span>${esc(x.n)}<small>${esc(x.c || x.b || "")}</small></span><b>${plata(x.p)}</b></button>`).join("")
      : `<div class="vacio">No hay productos con "${esc(q)}". Si no está en el catálogo, agrégalo con el botón +.</div>`;
    p._res = r;
  }else if(!cuenta.lineas.length){
    p.innerHTML = `<div class="vacio">Escanea un producto con el lector o con 📷, o escribe el nombre arriba.<br><br>
      Al terminar toca <b>Guardar cuenta</b>: queda en Drive (EDUMERCA / EDUMERCA POS / CUENTAS). Después, en <b>Cuentas</b>,
      el botón <b>Crear factura en Siigo</b> la sube a Siigo.</div>`;
  }else{
    p.innerHTML = cuenta.lineas.map((l, i) => `<div class="pos-l${i === marcada ? " pos-nueva" : ""}" data-i="${i}">
      <div class="pn">${esc(l.n)}<small>${l.c ? esc(l.c) + " · " : ""}<button data-precio="${i}" title="Cambiar precio">${plata(l.p)} c/u</button></small></div>
      <div class="pos-q"><button data-menos="${i}" aria-label="Uno menos">−</button><button class="n" data-cant="${i}" aria-label="Cambiar cantidad">${cant(l.q)}</button><button data-mas="${i}" aria-label="Uno más">+</button></div>
      <b class="ps">${plata(sub(l))}</b><button class="px" data-quitar="${i}">quitar</button></div>`).join("");
  }
  const n = cuenta.lineas.reduce((t, l) => t + l.q, 0);
  $("posPie").innerHTML = `<div class="pos-tot"><span>TOTAL${n ? ` <small style="opacity:.7">(${cant(n)} ${n === 1 ? "producto" : "productos"})</small>` : ""}</span><b>${plata(totalDe(cuenta))}</b></div>
    <div class="seg">${PAGOS.map(x => `<button data-pago="${x}" aria-pressed="${cuenta.pago === x}">${x}</button>`).join("")}</div>
    <div class="pos-fila"><button class="ghost" id="btnPosVaciar">Vaciar</button><button class="ppal" id="btnPosGuardar" style="flex:2">Guardar cuenta</button></div>`;
}
function pintarCuentas(){
  $("btnPosCuentas").textContent = "← Cuenta";
  $("posBuscar").parentElement.style.display = "none";
  const d = dias[verFecha], deEste = pend.filter(x => x.fecha === verFecha);
  const lista = (d ? d.cuentas : []).slice().reverse();
  let h = `<div class="pos-fila" style="margin:0 0 10px;align-items:center"><label style="flex:none">Día</label>
    <input type="date" id="posFecha" value="${verFecha}" max="${hoy()}" style="font:500 1rem 'Barlow',sans-serif;padding:8px;border-radius:8px;border:0"></div>`;
  if(deEste.length) h += `<div class="ale-aviso" style="margin-bottom:10px"><span>⏳ ${deEste.length} ${deEste.length === 1 ? "cuenta guardada en este equipo todavía no sube" : "cuentas guardadas en este equipo todavía no suben"} a Drive${
    servidorViejo ? " (el servidor todavía no tiene Registrar)" : ""}.</span><button class="ppal" id="btnPosReintentar" style="flex:none;padding:8px 12px">Subir</button></div>`;
  const sinStock = [...new Set((d ? d.cuentas : []).filter(c => stockMal(c.factura)).map(c => c.factura.nombre))];
  if(sinStock.length) h += `<div class="ale-aviso" style="margin-bottom:10px"><span>⚠ El stock NO bajó en Siigo con ${sinStock.length === 1 ? "la factura" : "las facturas"} ${esc(sinStock.join(", "))}.
    Ábrela${sinStock.length > 1 ? "s" : ""} en Siigo → Editar → Guardar, y en la cuenta toca "Revisar stock otra vez".</span></div>`;
  h += `<div class="bloque"><h3>Cuentas ${verFecha === hoy() ? "de hoy" : "del " + esc(fechaTxt(verFecha))} <small>${d ? d.n + " · " + plata(d.total) : "…"}</small></h3>`;
  h += deEste.slice().reverse().map(c => `<details class="pos-cta"><summary><span>⏳ Sin subir · ${esc(c.hora)} · ${esc(c.pago)}</span><span>${plata(totalDe(c))}</span></summary>
    <div class="det">${c.lineas.map(l => `${cant(l.q)} x ${esc(l.n)} = ${plata(sub(l))}`).join("<br>")}</div></details>`).join("");
  h += lista.length ? lista.map(c => `<details class="pos-cta${c.anulada ? " anulada" : ""}"><summary><span>Cuenta ${c.numero}: ${esc(c.hora)} · ${esc(c.pago)}${c.anulada ? " · ANULADA" : ""}${
      c.factura ? ` · <span class="fac">✓ ${esc(c.factura.nombre)}</span>${stockMal(c.factura) ? ` <span style="color:#ff9a86">⚠ stock</span>` : ""}` : ""}</span><span>${plata(c.total)}</span></summary>
    <div class="det">${c.lineas.map(l => `${cant(l.q)} x ${esc(l.n)}${l.c ? ` <span style="opacity:.6">[${esc(l.c)}]</span>` : ""} = ${plata(sub(l))}`).join("<br>")}
    ${c.quien ? `<br><span style="opacity:.6">Registró: ${esc(c.quien)}</span>` : ""}
    ${c.factura ? `<br><span class="fac">Facturada en Siigo: ${c.factura.url ? `<a href="${esc(c.factura.url)}" target="_blank" rel="noopener">${esc(c.factura.nombre)}</a>` : esc(c.factura.nombre)} · ${
      c.factura.tipo === "electronica" ? "factura electrónica" : "documento soporte"}</span>${stockHtml(c.factura)}${
      stockMal(c.factura) ? `<br><button class="chip" data-stock="${esc(c.id)}" style="margin-top:8px;text-transform:none">Revisar stock otra vez</button>` : ""}` : ""}
    ${c.anulada || c.factura ? "" : `<br><button class="chip" data-facturar="${esc(c.id)}" data-num="${c.numero}" style="margin-top:8px;text-transform:none">Factura solo de esta cuenta</button>
      <button class="chip" data-anular="${esc(c.id)}" data-num="${c.numero}" style="margin-top:8px;text-transform:none">Anular cuenta ${c.numero}</button>`}</div></details>`).join("")
    : (deEste.length ? "" : `<p class="nota" style="margin:0">${d ? "No hay cuentas registradas este día." : "Cargando…"}</p>`);
  h += `</div><div class="pos-fila"><button class="ghost" data-bajar="txt">Descargar TXT</button><button class="ghost" data-bajar="pdf">Descargar PDF</button></div>
    <p class="nota">Todo queda en Drive: EDUMERCA / EDUMERCA POS / CUENTAS / Cuentas ${esc(verFecha)}.txt (y el PDF cuando lo descargas).
    Las facturas creadas quedan en EDUMERCA / EDUMERCA POS / FACTURAS DE VENTA / CREADAS.</p>`;
  $("posPanel").innerHTML = h;
  const porFacturar = (d ? d.cuentas : []).filter(c => !c.anulada && !c.factura);
  const tot = porFacturar.reduce((t, c) => t + (c.total || 0), 0);
  $("posPie").innerHTML = `<div class="seg">${[["soporte", "Documento soporte"], ["electronica", "Factura electrónica"]].map(([v, t]) =>
      `<button data-tipofac="${v}" aria-pressed="${tipoFac === v}">${t}</button>`).join("")}</div>
    <button class="pos-fac" id="btnPosFacturar" ${facturando || !porFacturar.length ? "disabled" : ""}>${
    facturando ? "CREANDO FACTURA EN SIIGO…" : "CREAR FACTURA EN SIIGO"}<small>${
    facturando ? "No cierres la app" : porFacturar.length ? `${porFacturar.length} ${porFacturar.length === 1 ? "cuenta" : "cuentas"} por facturar · ${plata(tot)}`
      : d && d.cuentas.length ? "Todas las cuentas de este día ya están facturadas" : "No hay cuentas por facturar"}</small></button>`;
  $("posFecha").addEventListener("change", e => { if(e.target.value){ verFecha = e.target.value; pintar(); cargarDia(verFecha); } });
}

/* ---------- Servidor ---------- */
function recibirDia(r){
  if(!r || !Array.isArray(r.cuentas) || !r.fecha) throw new Error("viejo");
  dias[r.fecha] = {cuentas: r.cuentas, n: r.n, total: r.total}; guardarDias();
}
async function cargarDia(fecha){
  try{ recibirDia(await postAdmin({accion: "pos_dia", fecha})); servidorViejo = false; if(vista === "cuentas") pintar(); }
  catch(e){ if(e.message === "viejo"){ servidorViejo = true; if(!dias[fecha]) dias[fecha] = {cuentas: [], n: 0, total: 0}; }
    if(vista === "cuentas"){ pintar(); estado(e.message === "viejo" ? "⚠ El servidor todavía no tiene Registrar: las cuentas quedan en este equipo." : "⚠ " + e.message, true); } }
}
/* Sube una por una las cuentas guardadas en este equipo */
async function enviar(){
  if(enviando || !pend.length || !esAdmin() || !claveAdmin) return;   // sin PIN del día no se pregunta nada por detrás
  enviando = true;
  try{
    while(pend.length){
      const c = pend[0];
      let r;
      try{ r = await postAdmin({accion: "pos_guardar", fecha: c.fecha, cuenta: c}); recibirDia(r); }
      catch(e){
        if(e.message === "viejo"){ servidorViejo = true; estado("⚠ Cuenta guardada en este equipo. El servidor todavía no tiene Registrar: se sube cuando lo tenga.", true); }
        else if(/no tiene productos|Falta la cuenta/.test(e.message)){ pend.shift(); guardarPend(); continue; }
        else estado("⏳ Cuenta guardada en este equipo; se sube a Drive cuando haya conexión (" + e.message + ")", true);
        break;
      }
      servidorViejo = false;
      pend.shift(); guardarPend();
      estado(`✓ Cuenta ${r.numero} guardada en Drive · ${plata(totalDe(c))}`);
    }
  }finally{ enviando = false; pintar(); }
}
async function bajar(tipo){
  const fecha = verFecha, n = pend.filter(x => x.fecha === fecha).length;
  if(n && !confirm(`Hay ${n} cuenta${n > 1 ? "s" : ""} de este día que todavía no ${n > 1 ? "suben" : "sube"} a Drive y no ${n > 1 ? "saldrán" : "saldrá"} en el archivo.\n\n¿Descargar de todas formas?`)) return;
  estado("Preparando el " + tipo.toUpperCase() + "…");
  try{
    const r = await postAdmin({accion: "pos_archivo", fecha, tipo});
    if(!r.base64) throw new Error("El servidor todavía no tiene Registrar. Hay que publicarlo.");
    recibirDia(r);
    const bin = atob(r.base64), bytes = new Uint8Array(bin.length);
    for(let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([bytes], {type: r.mime || (tipo === "pdf" ? "application/pdf" : "text/plain")}));
    const a = document.createElement("a"); a.href = url; a.download = r.nombre || `Cuentas ${fecha}.${tipo}`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    estado("✓ Descargado · también quedó en Drive (EDUMERCA / EDUMERCA POS)");
    pintar();
  }catch(e){ estado("⚠ " + e.message, true); }
}

/* ---------- Facturas en Siigo ---------- */
/* Stock de la factura: el servidor lo lee en Siigo justo antes y unos segundos después de crearla */
function stockHtml(f){
  const st = f.stock;
  if(!st) return "";                              // facturas de antes de revisar stock
  if(st.ok === null || st.ok === undefined) return `<br><span style="opacity:.7">Stock: sin productos con control de inventario para revisar</span>`;
  const det = (st.productos || []).filter(p => p.antes !== null && p.antes !== undefined)
    .map(p => `${p.bajo ? "✓" : "✗"} ${esc(p.nombre || p.codigo)}: ${cant(p.antes)} → ${p.ahora === null || p.ahora === undefined ? "?" : cant(p.ahora)}`).join("<br>");
  const g = f.guardado;
  return st.ok ? `<br><span class="fac">✓ El stock bajó en Siigo${g && g.ok ? " (la app la guardó sola en Siigo)" : ""}</span><br><span style="opacity:.75">${det}</span>`
    : `<br><span style="color:#ff9a86;font-weight:600">⚠ El stock NO bajó en Siigo.</span> Ábrela en Siigo → Editar → Guardar y toca "Revisar stock otra vez".
      ${g && !g.ok ? `<br><span style="opacity:.75">La app intentó guardarla sola y Siigo dijo: ${esc(g.error)}</span>` : ""}
      <br><span style="opacity:.75">${det}</span>`;
}
function stockMal(f){ return f && f.stock && f.stock.ok === false; }
async function revisarStock(id){
  estado("Revisando el stock en Siigo…");
  try{
    const r = await postAdmin({accion: "pos_stock", fecha: verFecha, id});
    recibirDia(r);
    estado(r.stock && r.stock.ok ? `✓ ${r.factura}: el stock ya bajó en Siigo${r.guardado && r.guardado.ok ? " (la app la guardó sola)" : ""}` : `⚠ ${r.factura}: el stock todavía no baja. Guárdala en Siigo (Editar → Guardar).`, !(r.stock && r.stock.ok));
  }catch(e){ estado("⚠ " + (/desconocida/i.test(e.message) ? "El servidor todavía no tiene Revisar stock." : e.message), true); }
  pintar();
}
function preguntar(titulo, opciones){
  return new Promise(res => {
    elegir(titulo, opciones.map(o => ({t: o.t, sub: o.sub, fn: () => res(o.v)})));
    const h = $("hoja"), mirar = setInterval(() => { if(h.hidden){ clearInterval(mirar); setTimeout(() => res(null), 0); } }, 300);
  });
}
async function facturar(ids){
  if(facturando) return;
  const fecha = verFecha, d = dias[fecha];
  const cuentas = (d ? d.cuentas : []).filter(c => !c.anulada && !c.factura && (!ids || ids.includes(c.id)));
  if(!cuentas.length) return estado("No hay cuentas por facturar este día.", true);
  const sinSubir = pend.filter(x => x.fecha === fecha).length;
  const tipo = tipoFac;   // se escoge arriba del botón; por defecto Documento soporte
  let modo = "una";
  if(!ids && cuentas.length > 1){
    modo = await preguntar(`¿Cómo subo las ${cuentas.length} cuentas?`, [
      {t: "Una por una", sub: `Una factura por cada cuenta (${cuentas.length} facturas)`, v: "una"},
      {t: "Todas en una sola factura", sub: `Una factura con todas las cuentas · ${plata(cuentas.reduce((t, c) => t + c.total, 0))}`, v: "todas"}]);
    if(!modo) return;
  }
  const nombre = tipo === "electronica" ? "factura electrónica" : "documento soporte";
  const cuantas = modo === "todas" || cuentas.length === 1 ? `1 ${nombre}` : `${cuentas.length} ${tipo === "electronica" ? "facturas electrónicas" : "documentos soporte"}`;
  if(!confirm(`Se va a crear en Siigo: ${cuantas}\n` +
    (cuentas.length === 1 ? `Cuenta ${cuentas[0].numero} · ${plata(cuentas[0].total)}` : `Cuentas ${cuentas.map(c => c.numero).join(", ")} · ${plata(cuentas.reduce((t, c) => t + c.total, 0))}`) +
    (tipo === "electronica" ? "\n\nLa factura electrónica se envía a la DIAN: después no se puede borrar, solo anular con nota crédito." +
      (fecha !== hoy() ? " Queda con fecha de hoy (la DIAN no deja fechas pasadas)." : "") : "") +
    (sinSubir ? `\n\nOjo: ${sinSubir} ${sinSubir === 1 ? "cuenta de este día todavía no sube" : "cuentas de este día todavía no suben"} a Drive y no ${sinSubir === 1 ? "entra" : "entran"}.` : "") +
    "\n\n¿Crear?")) return;
  facturando = true; pintar();
  const creadas = [], errores = [];
  try{
    let r, vueltas = 0;
    do{
      estado(`Creando ${cuantas} en Siigo…` + (creadas.length ? ` (${creadas.length} lista${creadas.length > 1 ? "s" : ""})` : ""));
      try{ r = await postAdmin({accion: "pos_facturar", fecha, tipo, modo, ids: ids || cuentas.map(c => c.id)}); }
      catch(e){
        if(/desconocida/i.test(e.message)) throw new Error("El servidor todavía no tiene Crear factura en Siigo. Hay que publicarlo.");
        throw e;
      }
      recibirDia(r);
      creadas.push(...(r.creadas || [])); errores.push(...(r.errores || []));
    }while(r.faltan > 0 && ++vueltas < 20);
    const txt = creadas.length ? `✓ ${creadas.length === 1 ? "Creada " + creadas[0].nombre + " · " + plata(creadas[0].total) : creadas.length + " facturas creadas en Siigo"}` : "";
    const malas = creadas.filter(c => stockMal(c));
    if(malas.length) alert(`⚠ OJO: el stock NO bajó en Siigo con ${malas.map(c => c.nombre).join(", ")}.\n\n` +
      malas.map(c => c.nombre + ":\n" + (c.stock.productos || []).filter(p => p.antes !== null && p.antes !== undefined)
        .map(p => `  ${p.nombre || p.codigo}: tenía ${cant(p.antes)}, vendió ${cant(p.vendido)}, quedó ${p.ahora === null || p.ahora === undefined ? "?" : cant(p.ahora)}`).join("\n")).join("\n\n") +
      "\n\nÁbrela en Siigo → Editar → Guardar y después toca \"Revisar stock otra vez\" en la cuenta.");
    else if(creadas.some(c => c.stock && c.stock.ok)) estado(txt + " · ✓ el stock bajó en Siigo" + (creadas.some(c => c.guardado && c.guardado.ok) ? " (guardada sola en Siigo)" : ""));
    if(errores.length){
      estado((txt ? txt + " · " : "") + `⚠ ${errores.length} con problema`, true);
      alert((txt ? txt + "\n\n" : "") + "No se pudieron crear:\n\n" + errores.map(x => `Cuenta${x.cuentas.length > 1 ? "s" : ""} ${x.cuentas.join(", ")}: ${x.error}`).join("\n\n"));
    }else if(!creadas.some(c => c.stock && c.stock.ok) || malas.length) estado(txt + (malas.length ? " · ⚠ revisar stock" : " · registro en Drive (FACTURAS DE VENTA / CREADAS)"), !!malas.length);
  }catch(e){ estado("⚠ " + e.message, true); }
  finally{ facturando = false; pintar(); }
}

/* ---------- Pantalla ---------- */
function abrirPos(){
  clearTimeout(tLista);
  vista = "cuenta"; verFecha = hoy(); estado(pend.length ? `⏳ ${pend.length} cuenta${pend.length > 1 ? "s" : ""} por subir a Drive` : "");
  $("posBuscar").parentElement.style.display = "flex";
  ir("pos"); pintar();
  enviar(); cargarDia(hoy());
}
$("btnPos").addEventListener("click", abrirPos);
$("btnVolverPos").addEventListener("click", () => {
  if(vista === "cuentas"){ vista = "cuenta"; $("posBuscar").parentElement.style.display = "flex"; estado(""); return pintar(); }
  irMenu("ventas");
});
$("btnPosCuentas").addEventListener("click", () => {
  if(vista === "cuentas"){ vista = "cuenta"; $("posBuscar").parentElement.style.display = "flex"; estado(""); return pintar(); }
  vista = "cuentas"; verFecha = hoy(); tipoFac = "soporte"; estado(""); pintar(); cargarDia(verFecha); enviar();
});
$("btnPosCamara").addEventListener("click", () => abrirCamara("pos"));
$("btnPosSuelto").addEventListener("click", async () => {
  const f = await pedirForm("Producto suelto (no está en el catálogo)", [
    {id: "n", label: "Nombre", placeholder: "Ej.: Bolsa de hielo", validar: v => !!v || "Escribe el nombre", obligatorio: true},
    {id: "p", label: "Precio", inputmode: "numeric", placeholder: "0", validar: v => Number(v.replace(/\D/g, "")) > 0 || "Escribe el precio", obligatorio: true},
    {id: "q", label: "Cantidad", inputmode: "decimal", valor: "1"}], "Agregar");
  if(!f) return;
  agregar({n: f.n.trim(), p: Number(f.p.replace(/\D/g, "")), c: ""});
  const l = cuenta.lineas[marcada], q = Number(String(f.q).replace(",", "."));
  if(l && q > 0 && q !== 1){ l.q = q; guardarCuenta(); pintar(); }
});
/* Si lo escrito (o pegado) es exactamente un código de barras del catálogo, se agrega solo, sin dar Enter.
   Se espera un momento sin teclear para no confundir un código de 8 dígitos con el comienzo de uno de 13. */
let tExacto = null;
$("posBuscar").addEventListener("input", e => {
  marcada = -1; pintar();
  clearTimeout(tExacto);
  const v = e.target.value.trim();
  if(/^\d{8,14}$/.test(v)) tExacto = setTimeout(() => {
    if($("posBuscar").value.trim() !== v) return;
    const it = catalogo.get(v.replace(/^0+/, ""));
    if(it) agregar(it);
  }, 700);
});
$("posBuscar").addEventListener("keydown", e => {
  if(e.key !== "Enter") return;
  e.preventDefault();
  const v = e.target.value.trim(); if(!v) return;
  const it = buscar(v);                                   // el lector escribe el código aquí y da Enter
  if(it) return agregar(it);
  const r = resultados(v);
  if(r.length === 1) return agregar(r[0]);
  if(/^\d{6,}$/.test(v)){ e.target.value = ""; pintar(); posCodigo(v); }
});
$("posPanel").addEventListener("click", async e => {
  const t = e.target.closest("button"); if(!t) return;
  const d = t.dataset;
  if(d.r !== undefined){ const it = ($("posPanel")._res || [])[Number(d.r)]; if(it) agregar(it); return; }
  if(d.mas !== undefined || d.menos !== undefined){
    const i = Number(d.mas !== undefined ? d.mas : d.menos), l = cuenta.lineas[i];
    l.q = Math.round((l.q + (d.mas !== undefined ? 1 : -1)) * 1000) / 1000;
    if(l.q <= 0) cuenta.lineas.splice(i, 1);
    marcada = i; guardarCuenta(); return pintar();
  }
  if(d.quitar !== undefined){ cuenta.lineas.splice(Number(d.quitar), 1); marcada = -1; guardarCuenta(); return pintar(); }
  if(d.cant !== undefined){
    const l = cuenta.lineas[Number(d.cant)];
    const v = prompt("Cantidad de " + l.n + " (puede llevar decimales, ej. 0,5):", cant(l.q));
    if(v === null) return;
    const q = Number(v.replace(",", "."));
    if(!(q >= 0)) return alert("Esa cantidad no es válida.");
    if(q === 0) cuenta.lineas.splice(Number(d.cant), 1); else l.q = q;
    guardarCuenta(); return pintar();
  }
  if(d.precio !== undefined){
    const l = cuenta.lineas[Number(d.precio)];
    const v = prompt("Precio de " + l.n + " (por unidad):", pesos(l.p));
    if(v === null) return;
    const p = Number(v.replace(/\D/g, ""));
    if(!(p > 0)) return alert("Ese precio no es válido.");
    l.p = p; guardarCuenta(); return pintar();
  }
  if(d.bajar) return bajar(d.bajar);
  if(d.facturar) return facturar([d.facturar]);
  if(d.stock) return revisarStock(d.stock);
  if(d.anular){
    if(!confirm(`¿Anular la cuenta ${d.num}?\n\nSigue apareciendo en el archivo, marcada como ANULADA (no subir a Siigo).`)) return;
    try{ recibirDia(await postAdmin({accion: "pos_anular", fecha: verFecha, id: d.anular})); estado(`Cuenta ${d.num} anulada`); pintar(); }
    catch(x){ estado("⚠ " + (x.message === "viejo" ? "El servidor todavía no tiene Registrar." : x.message), true); }
    return;
  }
  if(t.id === "btnPosReintentar"){ servidorViejo = false; return enviar(); }
});
$("posPie").addEventListener("click", e => {
  const t = e.target.closest("button"); if(!t) return;
  if(t.id === "btnPosFacturar") return facturar(null);
  if(t.dataset.tipofac){ tipoFac = t.dataset.tipofac; return pintar(); }
  if(t.dataset.pago){ cuenta.pago = t.dataset.pago; guardarCuenta(); return pintar(); }
  if(t.id === "btnPosVaciar"){
    if(cuenta.lineas.length && !confirm("¿Vaciar esta cuenta? Se borran los productos escaneados.")) return;
    cuenta = nueva(); marcada = -1; guardarCuenta(); estado(""); return pintar();
  }
  if(t.id === "btnPosGuardar"){
    if(!cuenta.lineas.length) return estado("La cuenta está vacía: escanea los productos primero.", true);
    const c = Object.assign({}, cuenta, {fecha: hoy(), hora: hora(), total: totalDe(cuenta)});
    pend.push(c); guardarPend();
    cuenta = nueva(); marcada = -1; guardarCuenta();
    $("posBuscar").value = "";
    estado(`Guardando cuenta de ${plata(c.total)}…`);
    pintar(); enviar();
  }
});
window.addEventListener("online", enviar);
setInterval(() => { if(pend.length) enviar(); }, 60000);   // si quedó algo sin subir, se reintenta cada minuto
setTimeout(enviar, 5000);
})();
