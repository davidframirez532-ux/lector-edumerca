/* compras.js — Facturas por aprobar y Documento soporte (15_compras.gs)
   Se carga después del script principal de index.html y usa sus funciones:
   $, ir, irMenu, postAdmin, elegir, pedirForm, esc, plata, num, fechaTxt, normal, productos. */
(function(){
"use strict";

/* ---------- Pantallas ---------- */
const html = `
<section class="pantalla" id="cpCola">
  <div class="cabeza"><h2>Por aprobar</h2>
    <button class="sec" id="btnCpActualizar" aria-label="Actualizar" style="font-size:1.3rem;padding:8px 14px">↻</button>
    <button class="sec" id="btnCpVolver">Volver</button></div>
  <p id="cpEstado" style="margin:0;font-size:.85rem;opacity:.85;text-align:center;min-height:1.2em"></p>
  <div class="resumen" id="cpResumen"></div>
  <div class="items" id="cpItems"></div>
</section>
<section class="pantalla" id="cpDet">
  <div class="cabeza"><h2 id="cpDetTitulo" style="font-size:1.45rem">Factura</h2><button class="sec" id="btnCpDetVolver">Volver</button></div>
  <p id="cpDetEstado" style="margin:0;font-size:.9rem;text-align:center;min-height:1.2em;font-weight:600"></p>
  <div class="panel" id="cpDetPanel"></div>
  <div class="acciones">
    <button class="sec" id="btnCpIgnorar">Ignorar</button>
    <button class="ppal" id="btnCpAprobar" style="flex:2">Aprobar y subir a Siigo</button>
  </div>
</section>
<section class="pantalla" id="cpDs">
  <div class="cabeza"><h2>Documento soporte</h2><button class="sec" id="btnDsVolver">Volver</button></div>
  <p id="dsEstado" style="margin:0;font-size:.9rem;text-align:center;min-height:1.2em;font-weight:600"></p>
  <div class="panel" id="dsPanel"></div>
  <div class="acciones" id="dsAcciones" hidden>
    <button class="sec" id="btnDsOtra">Otra foto</button>
    <button class="ppal" id="btnDsCrear" style="flex:2">Crear en Siigo</button>
  </div>
</section>
<input type="file" id="dsArchivo" accept="image/*,application/pdf" hidden>`;
document.getElementById("entrada").insertAdjacentHTML("beforebegin", html);
["cpDet", "cpDs"].forEach(id => { if(!ESCRIBIBLES.includes(id)) ESCRIBIBLES.push(id); });

/* 🏠 en las pantallas nuevas */
["cpCola", "cpDet", "cpDs"].forEach(id => {
  const cab = $(id).querySelector(".cabeza");
  const b = document.createElement("button");
  b.className = "sec casita"; b.textContent = "🏠"; b.setAttribute("aria-label", "Menú principal");
  b.addEventListener("click", () => { if(esAdmin()) irMenu("principal"); else inicio(); });
  cab.insertBefore(b, [...cab.querySelectorAll("button")].pop());
});

/* Botones en el menú Compras */
const menu = document.querySelector("#compras .menu");
menu.insertAdjacentHTML("afterbegin",
  `<button class="ppal" id="btnCpPorAprobar">Facturas por aprobar</button>
   <button class="ghost" id="btnCpDs">Documento soporte (foto)</button>`);

const abrir = id => { clearTimeout(tLista); ir(id); };
const chk = c => `<div class="fila-dato"><span>${c.ok ? "✅" : "❌"} ${esc(c.texto)}</span></div>`;

/* ══════════════ FACTURAS POR APROBAR ══════════════ */
let cola = null, sel = null, cargandoCola = false;
try{ cola = JSON.parse(localStorage.getItem("cp_cola") || "null"); }catch(e){ cola = null; }

async function abrirCola(){
  abrir("cpCola");
  pintarCola();
  await cargarCola(false);
}
async function cargarCola(actualizar){
  if(cargandoCola) return;
  cargandoCola = true;
  const msg = $("cpEstado"), t0 = Date.now();
  const txt = actualizar ? "Revisando el correo y Siigo… " : "Cargando… ";
  msg.style.color = ""; msg.textContent = txt;
  const reloj = setInterval(() => { msg.textContent = txt + Math.round((Date.now() - t0) / 1000) + "s"; }, 1000);
  try{
    const d = await postAdmin({accion: "compras_cola", actualizar: !!actualizar});
    cola = d; try{ localStorage.setItem("cp_cola", JSON.stringify(d)); }catch(e){}
    msg.textContent = "";
  }catch(e){
    msg.style.color = "#ff9a86";
    msg.textContent = (cola ? "Mostrando la última copia · " : "") + e.message;
  }finally{ clearInterval(reloj); cargandoCola = false; pintarCola(); }
}
function pintarCola(){
  const box = $("cpItems");
  if(!cola){ box.innerHTML = '<div class="vacio">Cargando…</div>'; $("cpResumen").innerHTML = ""; return; }
  const fs = cola.facturas || [];
  const listas = fs.filter(f => f.lista);
  const caja = (n, t) => `<div class="caja"><b>${n}</b><span>${t}</span></div>`;
  $("cpResumen").innerHTML = caja(listas.length, "listas") + caja(fs.length - listas.length, "con pendientes") +
    caja(plata(listas.reduce((s, f) => s + f.totales.total, 0)), "por subir");
  let h = "";
  if(cola.config_ok === false) h += `<div class="bloque" style="border:2px solid var(--rojo)"><p class="nota" style="margin:0">
    Falta configurar en 15_compras.gs: <b>${esc((cola.config_falta || []).join(", "))}</b>. Ejecuta cpDiagnostico() en el editor.</p></div>`;
  if(!fs.length) h += `<div class="vacio">No hay facturas por aprobar.<br>Todas las del correo ya están en Siigo o ignoradas.</div>`;
  h += fs.map((f, i) => {
    const malo = (f.conciliacion || []).filter(c => !c.ok)[0];
    return `<button class="item" data-i="${i}">
      <span class="cod" style="${f.lista ? "background:#4fd6a8;color:var(--verde)" : "background:#ffd23f;color:var(--verde)"}">${f.lista ? "✓" : "!"}</span>
      <span class="nom">${esc(f.proveedor)}
        <small>${esc(f.numero)} · ${fechaTxt(f.fecha)} · ${f.lineas.length} líneas${malo ? `<br><span style="color:#ffd23f">${esc(malo.texto)}</span>` : ""}</small></span>
      <span class="pre">${plata(f.totales.xml)}<small>›</small></span></button>`;
  }).join("");
  h += `<p class="nota" style="text-align:center">${cola.ya_en_siigo || 0} ya en Siigo · ${cola.ignoradas || 0} ignoradas${
    cola.notas_credito ? " · " + cola.notas_credito + " notas crédito (en KPIs → Alertas)" : ""}<br>Revisado ${esc(cola.generado || "")}</p>`;
  box.innerHTML = h;
}
$("cpItems").addEventListener("click", e => {
  const b = e.target.closest(".item"); if(!b || !cola) return;
  sel = cola.facturas[Number(b.dataset.i)];
  abrirDetalle();
});
$("btnCpActualizar").addEventListener("click", () => cargarCola(true));
$("btnCpVolver").addEventListener("click", () => irMenu("compras"));
$("btnCpPorAprobar").addEventListener("click", abrirCola);

/* ---------- Detalle ---------- */
function abrirDetalle(){
  $("cpDetEstado").textContent = "";
  pintarDetalle();
  abrir("cpDet");
  $("cpDetPanel").scrollTop = 0;
}
function lineaTxt(l){
  if(l.destino === "OBSEQUIO") return `<span style="opacity:.7">Obsequio en $0 · no se sube</span>`;
  if(l.destino === "GASTO") return l.precio !== undefined
    ? `🧾 Gasto · ${esc(l.nombre || l.cuenta)}` : `<span style="color:#ff9a86">⚠ ${esc(l.motivo || "gasto sin cuenta")}</span>`;
  if(l.precio === undefined) return `<span style="color:#ff9a86">⚠ ${esc(l.motivo || "sin asociar")}</span> · toca para resolver`;
  return `📦 ${esc(l.nombre)}${l.factor && l.factor !== 1 ? ` · ${num(l.cant)} × ${num(l.factor)} = <b>${num(l.cant_siigo)}</b>` : ""}`;
}
function pintarDetalle(){
  const f = sel; if(!f) return;
  $("cpDetTitulo").textContent = f.proveedor;
  const t = f.totales;
  let h = `<div class="bloque"><h3 style="margin-bottom:4px">${esc(f.numero)}<small>${f.lista ? "✅ lista" : "⚠ con pendientes"}</small></h3>
    <p class="nota" style="margin:0">NIT ${esc(f.nit)} · ${fechaTxt(f.fecha)} · vence ${fechaTxt(f.vence)}${
      f.pdf ? ` · <a href="${esc(f.pdf)}" target="_blank" rel="noopener" style="color:var(--amarillo)">ver PDF</a>` : ""}</p>
    <div class="grilla" style="margin-top:10px">
      <div class="dato"><span>Total Siigo</span><b>${plata(t.total)}</b><div class="sub">base ${plata(t.base)} · IVA ${plata(t.iva)}</div></div>
      <div class="dato"><span>Total XML</span><b>${plata(t.xml)}</b><div class="sub">IVA ${plata(t.xml_iva)}</div></div>
    </div></div>`;
  h += `<div class="bloque"><h3>Conciliación <small>antes de subir</small></h3>${(f.conciliacion || []).map(chk).join("")}</div>`;
  if((f.avisos || []).length) h += `<div class="bloque"><h3>Avisos</h3>${f.avisos.map(a => `<p class="nota" style="margin:0 0 6px">⚠ ${esc(a)}</p>`).join("")}</div>`;
  h += `<div class="bloque"><h3>Líneas <small>toca para cambiar</small></h3>` + f.lineas.map((l, i) =>
    `<button class="item" data-l="${i}" style="width:100%">
      <span class="cod">${esc(l.n)}</span>
      <span class="nom">${esc(l.desc)}<small>${num(l.cant)} und${l.iva ? " · IVA " + num(l.iva) + "%" : ""}${l.otros ? " · otros imp. " + plata(l.otros) : ""}<br>${lineaTxt(l)}</small></span>
      <span class="pre">${plata(l.base)}<small>›</small></span></button>`).join("") + `</div>`;
  h += `<p class="nota" style="text-align:center">Al aprobar se crea la factura de compra en Siigo (no se envía a la DIAN) y queda pendiente de pago en Proveedores.</p>`;
  $("cpDetPanel").innerHTML = h;
  const ap = $("btnCpAprobar");
  ap.disabled = !f.lista; ap.style.opacity = f.lista ? "1" : ".45";
  ap.textContent = f.lista ? `Aprobar y subir ${plata(t.total)}` : "Resuelve los pendientes";
}
function reemplazar(nueva){
  const i = cola.facturas.findIndex(x => x.id === nueva.id);
  if(i >= 0) cola.facturas[i] = nueva;
  sel = nueva;
  try{ localStorage.setItem("cp_cola", JSON.stringify(cola)); }catch(e){}
  pintarDetalle(); pintarCola();
}
function quitarDeCola(id){
  cola.facturas = cola.facturas.filter(x => x.id !== id);
  try{ localStorage.setItem("cp_cola", JSON.stringify(cola)); }catch(e){}
  pintarCola();
}
async function conEspera(texto, fn){
  const msg = $("cpDetEstado"), t0 = Date.now();
  msg.style.color = ""; msg.textContent = texto;
  const reloj = setInterval(() => { msg.textContent = texto + " " + Math.round((Date.now() - t0) / 1000) + "s"; }, 1000);
  $("cpDetPanel").style.opacity = ".5";
  try{ return await fn(); }
  catch(e){ msg.style.color = "#ff9a86"; msg.textContent = e.message; return null; }
  finally{ clearInterval(reloj); $("cpDetPanel").style.opacity = ""; if(msg.textContent.startsWith(texto)) msg.textContent = ""; }
}

/* Elegir producto del catálogo de la app */
function buscarCatalogo(q){
  const t = normal(q).trim(); if(!t) return [];
  const pal = t.split(/\s+/), d = t.replace(/\s+/g, "");
  return productos.filter(p => pal.every(w => normal(p.n).includes(w)) || (p.c && normal(p.c).includes(d)) || (p.b && normal(p.b).includes(d))).slice(0, 15);
}
function elegirProducto(titulo, sugeridos, textoBusqueda){
  return new Promise(resolve => {
    const ops = (sugeridos || []).map(c => ({t: c.nombre, sub: "código " + c.codigo + (c.aprendido ? " · usado antes" : ""), fn: () => resolve(c)}));
    ops.push({t: "🔍 Buscar en el catálogo", sub: "Por nombre o código de barras", fn: async () => {
      const r = await pedirForm("Buscar producto", [{id: "q", label: "Nombre o código", valor: textoBusqueda || ""}], "Buscar");
      if(!r) return resolve(null);
      const res = buscarCatalogo(r.q);
      if(!res.length){ alert("No encontré productos con esa búsqueda.\nSi es un producto nuevo, créalo primero en Siigo."); return resolve(null); }
      elegir("Elige el producto", res.map(p => ({t: p.n, sub: "código " + (p.c || p.b) + " · " + plata(p.p), fn: () => resolve({codigo: p.c || p.b, nombre: p.n})})));
    }});
    elegir(titulo, ops);
  });
}
function avisoNuevo(l){
  const cod = l.barras || l.codProv || "(sin código)";
  alert(`Producto nuevo: créalo primero en Siigo.\n\nNombre: ${String(l.desc).toUpperCase()}\nCódigo: ${cod.replace(/^0+(?=\d{8})/, "")}\nIVA: ${l.iva ? l.iva + "%" : "0% / excluido (verifícalo)"}\nCategoría: la que corresponda (no se puede cambiar después de la primera venta).\n\nDespués de crearlo, en Inventario toca "Actualizar inventario desde Siigo" y vuelve aquí a asociarlo.`);
}
$("cpDetPanel").addEventListener("click", e => {
  const b = e.target.closest("[data-l]"); if(!b || !sel) return;
  const l = sel.lineas[Number(b.dataset.l)];
  if(l.destino === "OBSEQUIO") return alert("Las líneas en $0 (obsequios) no se suben a Siigo porque exige precio mayor que cero. Si entra al inventario, ajústalo aparte.");
  const ops = [{t: "📦 Asociar a un producto de Siigo", sub: l.codigo ? "Ahora: " + l.nombre : "Queda guardado para las próximas facturas", fn: async () => {
    const p = await elegirProducto("¿Qué producto es?", [], String(l.desc).split(" ").slice(0, 3).join(" "));
    if(!p) return;
    const r = await pedirForm(p.nombre, [{id: "f", label: "¿Cuántas unidades de Siigo es 1 unidad de la factura? (factor)", valor: l.factor || 1, inputmode: "decimal",
      validar: v => Number(String(v).replace(",", ".")) > 0 || "Debe ser mayor que 0"}], "Asociar");
    if(!r) return;
    const d = await conEspera("Guardando asociación…", () => postAdmin({accion: "compra_asociar", id: sel.id, clave: l.clave,
      codigo: p.codigo, factor: Number(String(r.f).replace(",", ".")), proveedor: sel.proveedor, descripcion: l.desc, codProv: l.codProv, barras: l.barras}));
    if(d) reemplazar(d.factura);
  }}];
  (cola.cuentas_gasto || []).forEach(c => ops.push({t: "🧾 Gasto: " + c.nombre, sub: "Cuenta " + c.cuenta + " · no entra al inventario", fn: async () => {
    const d = await conEspera("Guardando…", () => postAdmin({accion: "compra_destino", id: sel.id, clave: l.clave, destino: "GASTO",
      cuenta: c.cuenta, proveedor: sel.proveedor, descripcion: l.desc}));
    if(d) reemplazar(d.factura);
  }}));
  if(!(cola.cuentas_gasto || []).length) ops.push({t: "🧾 Gasto", sub: "Pide a tu contador las cuentas y llénalas en CP.CUENTAS_GASTO", fn: () => {}});
  if(l.destino === "GASTO") ops.push({t: "↩ Volver a inventario", sub: "Usa la asociación de Productos_proveedor", fn: async () => {
    const d = await conEspera("Guardando…", () => postAdmin({accion: "compra_destino", id: sel.id, clave: l.clave, destino: "INVENTARIO"}));
    if(d) reemplazar(d.factura);
  }});
  ops.push({t: "🆕 Es un producto nuevo", sub: "Te digo con qué datos crearlo en Siigo", fn: () => avisoNuevo(l)});
  elegir(l.desc, ops);
});
$("btnCpAprobar").addEventListener("click", async () => {
  const f = sel; if(!f || !f.lista) return;
  if(!confirm(`¿Subir a Siigo la factura ${f.numero} de ${f.proveedor}?\n\nTotal ${plata(f.totales.total)} · vence ${fechaTxt(f.vence)}\n\nQueda como cuenta por pagar. No se envía a la DIAN.`)) return;
  const d = await conEspera("Subiendo a Siigo…", () => postAdmin({accion: "compra_aprobar", id: f.id}));
  if(!d){ cargarCola(false); return; }
  quitarDeCola(f.id);
  alert(`${d.cuadra ? "✅" : "⚠"} Creada en Siigo: ${d.nombre}\n\nConciliación después de subir:\n` +
    d.conciliacion.map(c => (c.ok ? "✓ " : "✗ ") + c.texto).join("\n") +
    (d.cuadra ? "" : "\n\nRevisa la compra en Siigo: algo no cuadra con el XML."));
  abrir("cpCola");
});
$("btnCpIgnorar").addEventListener("click", async () => {
  const f = sel; if(!f) return;
  const r = await pedirForm(`Ignorar ${f.numero}`, [{id: "m", label: "Motivo (no se registra en Siigo)", valor: "Personal", obligatorio: true,
    validar: v => !!v.trim() || "Escribe el motivo"}], "Ignorar factura");
  if(!r) return;
  const d = await conEspera("Guardando…", () => postAdmin({accion: "compra_ignorar", id: f.id, motivo: r.m}));
  if(!d) return;
  quitarDeCola(f.id);
  abrir("cpCola");
});
$("btnCpDetVolver").addEventListener("click", () => abrir("cpCola"));

/* ══════════════ DOCUMENTO SOPORTE ══════════════ */
let ds = null;
function abrirDs(){
  if(!ds) dsInicio();
  abrir("cpDs");
}
function dsInicio(){
  ds = null;
  $("dsAcciones").hidden = true;
  $("dsEstado").textContent = "";
  $("dsPanel").innerHTML = `<div class="bloque" style="text-align:center;display:flex;flex-direction:column;gap:12px">
    <p style="margin:0">Para compras <b>sin factura electrónica</b>: plaza, huevos, pan, abastos.</p>
    <button class="ppal" id="btnDsFoto" style="font-size:1.3rem;padding:22px">📷 Tomar foto o subir PDF</button>
    <p class="nota" style="margin:0">Claude lee el recibo y te propone los productos. Lo revisas aquí y se crea en Siigo <b>sin enviarlo a la DIAN</b>: lo transmites tú desde Siigo cuando lo revises.</p></div>`;
}
const aB64 = b => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(",")[1]); r.onerror = no; r.readAsDataURL(b); });
async function prepararArchivo(file){
  if(file.type === "application/pdf"){
    if(file.size > 15e6) throw new Error("El PDF pesa más de 15 MB");
    return {mime: file.type, data: await aB64(file)};
  }
  let bmp;
  try{ bmp = await createImageBitmap(file); }catch(e){ throw new Error("No pude abrir la imagen. Usa una foto JPG o PNG."); }
  const k = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  const blob = await new Promise(r => c.toBlob(r, "image/jpeg", 0.85));
  return {mime: "image/jpeg", data: await aB64(blob)};
}
$("dsArchivo").addEventListener("change", async e => {
  const file = e.target.files && e.target.files[0];
  e.target.value = "";
  if(!file) return;
  const msg = $("dsEstado"), t0 = Date.now();
  msg.style.color = ""; msg.textContent = "Claude está leyendo el documento… ";
  const reloj = setInterval(() => { msg.textContent = "Claude está leyendo el documento… " + Math.round((Date.now() - t0) / 1000) + "s"; }, 1000);
  $("dsPanel").style.opacity = ".5";
  try{
    const archivo = await prepararArchivo(file);
    const d = await postAdmin({accion: "ds_leer", archivo});
    const L = d.lectura || {};
    ds = {ident: String(L.proveedor_identificacion || ""), nombreLeido: L.proveedor_nombre || "", tercero: d.tercero,
      fecha: /^\d{4}-\d{2}-\d{2}$/.test(L.fecha || "") ? L.fecha : hoyISO(), numero: String(L.numero || ""),
      notas: L.notas || "", totalDoc: Number(L.total) || 0, soporte: d.soporte,
      lineas: d.lineas.map(l => ({descripcion: l.descripcion, cantidad: l.cantidad, valor: l.valor_total,
        producto: l.sugerido, candidatos: l.candidatos}))};
    msg.textContent = "";
    pintarDs();
  }catch(err){
    msg.style.color = "#ff9a86"; msg.textContent = "No se pudo leer: " + err.message;
  }finally{ clearInterval(reloj); $("dsPanel").style.opacity = ""; }
});
function dsTotal(){ return ds.lineas.reduce((s, l) => s + (Number(l.valor) || 0), 0); }
function pintarDs(){
  const t = ds.tercero;
  let h = `<div class="bloque" style="display:flex;flex-direction:column;gap:10px"><h3 style="margin:0">Proveedor</h3>
    <label class="campo">Cédula o NIT<input id="dsIdent" inputmode="numeric" value="${esc(ds.ident)}" autocomplete="off"></label>
    <p class="nota" style="margin:0">${esc(ds.nombreLeido || "")}${t ? (t.existe ? ` · <span style="color:#4fd6a8">✓ en Siigo: ${esc(t.nombre)}</span>`
      : ` · <span style="color:#ff9a86">⚠ no existe en Siigo: créalo con sus datos completos antes de crear el documento</span>`) : ""}</p>
    <div class="fechas"><label class="campo">Fecha<input id="dsFecha" type="date" value="${esc(ds.fecha)}"></label>
      <label class="campo">N° recibo (opcional)<input id="dsNumero" inputmode="numeric" value="${esc(ds.numero)}" autocomplete="off"></label></div>
    ${ds.soporte ? `<a href="${esc(ds.soporte.url)}" target="_blank" rel="noopener" style="color:var(--amarillo);font-size:.9rem">Ver el documento guardado en Drive</a>` : ""}
  </div>`;
  if(ds.notas) h += `<div class="bloque"><p class="nota" style="margin:0">🤖 ${esc(ds.notas)}</p></div>`;
  h += `<div class="bloque"><h3>Productos <small>toca el producto para cambiarlo</small></h3>` + ds.lineas.map((l, i) => `
    <div style="border-bottom:1px solid rgba(251,250,245,.14);padding:8px 0;display:flex;flex-direction:column;gap:6px">
      <div style="display:flex;justify-content:space-between;gap:8px"><span style="font-weight:600;font-size:.95rem">${esc(l.descripcion || "Línea agregada")}</span>
        <button class="quitar" data-quitar="${i}" aria-label="Quitar">×</button></div>
      <button class="chip" data-prod="${i}" style="text-transform:none;text-align:left;${l.producto ? "" : "border-color:#ff9a86;color:#ff9a86"}">${
        l.producto ? "📦 " + esc(l.producto.nombre) + (l.producto.aprendido ? " · usado antes" : "") : "⚠ Elegir producto de Siigo"}</button>
      <div class="fechas"><label class="campo">Cantidad<input data-cant="${i}" inputmode="decimal" value="${esc(l.cantidad)}"></label>
        <label class="campo">Valor total ($)<input data-valor="${i}" inputmode="numeric" value="${l.valor ? pesos(l.valor) : ""}"></label></div>
    </div>`).join("") +
    `<button class="sec chico" id="btnDsLinea" style="margin-top:8px">+ Agregar producto</button></div>`;
  const tot = dsTotal();
  h += `<div class="bloque"><div class="fila-dato"><span>Total</span><b>${plata(tot)}</b></div>${
    ds.totalDoc ? `<div class="fila-dato"><span>Total del documento</span><b style="color:${Math.abs(ds.totalDoc - tot) > 100 ? "#ff9a86" : "inherit"}">${plata(ds.totalDoc)}</b></div>` : ""}</div>`;
  $("dsPanel").innerHTML = h;
  $("dsAcciones").hidden = false;
}
function leerDs(){
  if(!ds) return;
  ds.ident = ($("dsIdent") || {}).value || ds.ident;
  ds.fecha = ($("dsFecha") || {}).value || ds.fecha;
  ds.numero = ($("dsNumero") || {}).value || "";
}
$("dsPanel").addEventListener("input", e => {
  if(!ds) return;
  const t = e.target;
  if(t.dataset.cant !== undefined) ds.lineas[Number(t.dataset.cant)].cantidad = Number(t.value.replace(",", ".")) || 0;
  if(t.dataset.valor !== undefined){
    const n = Number(t.value.replace(/\D/g, "")) || 0;
    ds.lineas[Number(t.dataset.valor)].valor = n; t.value = n ? pesos(n) : "";
  }
  if(t.dataset.cant !== undefined || t.dataset.valor !== undefined){
    const b = $("dsPanel").querySelector(".bloque:last-child b");
    if(b) b.textContent = plata(dsTotal());
  }
});
$("dsPanel").addEventListener("click", async e => {
  if(e.target.closest("#btnDsFoto")) return $("dsArchivo").click();
  if(!ds) return;
  leerDs();
  const q = e.target.closest("[data-quitar]");
  if(q){ ds.lineas.splice(Number(q.dataset.quitar), 1); pintarDs(); return; }
  const p = e.target.closest("[data-prod]");
  if(p){
    const l = ds.lineas[Number(p.dataset.prod)];
    const sug = (l.candidatos || []).slice();
    if(l.producto && !sug.some(c => c.codigo === l.producto.codigo)) sug.unshift(l.producto);
    const r = await elegirProducto(l.descripcion || "Producto", sug, String(l.descripcion || "").split(" ").slice(0, 2).join(" "));
    if(r){ l.producto = r; pintarDs(); }
    return;
  }
  if(e.target.closest("#btnDsLinea")){
    const r = await elegirProducto("Agregar producto", [], "");
    if(!r) return;
    ds.lineas.push({descripcion: r.nombre, cantidad: 1, valor: 0, producto: r, candidatos: []});
    pintarDs();
  }
});
$("btnDsCrear").addEventListener("click", async () => {
  if(!ds) return;
  leerDs();
  const ident = String(ds.ident).replace(/\D/g, "");
  if(!ident) return alert("Escribe la cédula o NIT del proveedor.");
  const sinProd = ds.lineas.filter(l => !l.producto);
  if(sinProd.length) return alert("Falta elegir el producto de:\n" + sinProd.map(l => "• " + (l.descripcion || "línea")).join("\n"));
  const malos = ds.lineas.filter(l => !(Number(l.cantidad) > 0) || !(Number(l.valor) > 0));
  if(malos.length) return alert("Cantidad y valor deben ser mayores que 0 en:\n" + malos.map(l => "• " + l.producto.nombre).join("\n"));
  const tot = dsTotal();
  if(!confirm(`¿Crear el documento soporte en Siigo?\n\nProveedor ${ident} · ${fechaTxt(ds.fecha)}\n${ds.lineas.length} productos · ${plata(tot)}\n\nQueda en Siigo SIN enviar a la DIAN.`)) return;
  const btn = $("btnDsCrear"); btn.disabled = true; btn.textContent = "Creando…";
  try{
    const d = await postAdmin({accion: "ds_crear", proveedor_identificacion: ident, fecha: ds.fecha, numero: ds.numero,
      total_documento: ds.totalDoc, soporte_id: ds.soporte && ds.soporte.id, soporte_url: ds.soporte && ds.soporte.url,
      lineas: ds.lineas.map(l => ({descripcion: l.descripcion, codigo: l.producto.codigo, cantidad: Number(l.cantidad), valor_total: Number(l.valor)}))});
    alert(`✅ Creado en Siigo: ${d.nombre} por ${plata(d.total)}.\n\n${d.enviado_dian ? "Se envió a la DIAN." :
      "NO se envió a la DIAN: revísalo en Siigo y transmítelo desde allá cuando estés seguro."}\n\nLa próxima vez que llegue un recibo de este proveedor, los productos se proponen solos.`);
    dsInicio();
  }catch(err){ alert("No se pudo crear: " + err.message); }
  finally{ btn.disabled = false; btn.textContent = "Crear en Siigo"; }
});
$("btnDsOtra").addEventListener("click", () => {
  if(ds && !confirm("¿Descartar este documento y tomar otra foto?")) return;
  dsInicio(); $("dsArchivo").click();
});
$("btnDsVolver").addEventListener("click", () => {
  if(ds && !confirm("¿Salir? Se pierde lo que no hayas creado en Siigo.")) return;
  ds = null; irMenu("compras");
});
$("btnCpDs").addEventListener("click", abrirDs);
})();
