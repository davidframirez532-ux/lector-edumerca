/* compras.js — Facturas por aprobar y Documento soporte (15_compras.gs)
   Se carga después del script principal de index.html y usa sus funciones:
   $, ir, irMenu, postAdmin, elegir, pedirForm, esc, plata, num, fechaTxt, normal, productos. */
(function(){
"use strict";
const COMPRAS_VERSION = "compras v34";
const SERVIDOR_MINIMO = 25;   /* versión de 15_compras.gs que necesita esta app */

/* ---------- Pantallas ---------- */
const html = `
<section class="pantalla" id="cpMenuProv">
  <div class="cabeza"><h2>Proveedores</h2><button class="sec" id="btnCpMenuProvVolver">Volver</button></div>
  <div class="menu" id="cpMenuProvBotones"></div>
</section>
<section class="pantalla" id="cpMenuFact">
  <div class="cabeza"><h2>Facturas</h2><button class="sec" id="btnCpMenuFactVolver">Volver</button></div>
  <div class="menu">
    <button class="ghost" id="btnCpTodas">Ver todas las facturas</button>
    <button class="ppal" id="btnCpPorAprobar">Facturas por aprobar</button>
    <button class="ghost" id="btnCpDs">Documento soporte (foto)</button>
    <button class="ghost" id="btnCpAjustes">⚖ Pendientes por ajuste de impuestos</button>
  </div>
</section>
<section class="pantalla" id="cpAjustes">
  <div class="cabeza"><h2 style="font-size:1.35rem">Ajuste de impuestos</h2>
    <button class="sec" id="btnCpAjActualizar" aria-label="Actualizar" style="font-size:1.3rem;padding:8px 14px">↻</button>
    <button class="sec" id="btnCpAjVolver">Volver</button></div>
  <p id="cpAjEstado" style="margin:0;font-size:.85rem;opacity:.85;text-align:center;min-height:1.2em"></p>
  <div class="items" id="cpAjItems"></div>
</section>
<section class="pantalla" id="cpAjDet">
  <div class="cabeza"><h2 id="cpAjDetTitulo" style="font-size:1.35rem">Paso a paso</h2><button class="sec" id="btnCpAjDetVolver">Volver</button></div>
  <p id="cpAjDetEstado" style="margin:0;font-size:.9rem;text-align:center;min-height:1.2em;font-weight:600"></p>
  <div class="panel" id="cpAjDetPanel"></div>
  <div class="acciones"><button class="ppal" id="btnCpAjRevisar" style="flex:1">Ya lo hice, revisar en Siigo</button></div>
</section>
<section class="pantalla" id="cpCola">
  <div class="cabeza"><h2>Por aprobar</h2>
    <button class="sec" id="btnCpActualizar" aria-label="Actualizar" style="font-size:1.3rem;padding:8px 14px">↻</button>
    <button class="sec" id="btnCpVolver">Volver</button></div>
  <p id="cpEstado" style="margin:0;font-size:.85rem;opacity:.85;text-align:center;min-height:1.2em"></p>
  <div class="resumen" id="cpResumen"></div>
  <input class="buscador" id="cpBuscarCola" type="search" placeholder="Buscar proveedor, número o NIT" autocomplete="off" enterkeyhint="search">
  <div class="chips" id="cpChips"></div>
  <div id="cpColaFiltros" class="cp-filtros"></div>
  <div class="items" id="cpItems"></div>
</section>
<section class="pantalla" id="cpTodas">
  <div class="cabeza"><h2>Todas las facturas</h2>
    <button class="sec" id="btnCpTodasActualizar" aria-label="Actualizar" style="font-size:1.3rem;padding:8px 14px">↻</button>
    <button class="sec" id="btnCpTodasVolver">Volver</button></div>
  <div class="chips" id="cpTodasChips"></div>
  <input class="buscador" id="cpTodasBuscar" type="search" placeholder="Buscar proveedor, número o NIT" autocomplete="off" enterkeyhint="search">
  <div id="cpTodasFiltros" class="cp-filtros"></div>
  <p id="cpTodasEstado" style="margin:0;font-size:.85rem;opacity:.85;text-align:center;min-height:1.2em"></p>
  <div class="items" id="cpTodasItems"></div>
</section>
<section class="pantalla" id="cpBuscar">
  <div class="cabeza"><h2 id="cpBuscarTitulo" style="font-size:1.4rem">Elegir producto</h2><button class="sec" id="btnCpBuscarVolver">Volver</button></div>
  <div style="display:flex;gap:8px;flex:none">
    <input class="buscador" id="cpBuscarCampo" type="search" placeholder="Escribe nombre o código, o escanea" autocomplete="off" enterkeyhint="search" style="flex:1;min-width:0">
    <button class="sec" id="btnCpBuscarCamara" aria-label="Escanear" style="flex:none;font-size:1.4rem;padding:0 16px">📷</button>
  </div>
  <p id="cpBuscarNota" style="margin:0;font-size:.85rem;opacity:.85;min-height:1.1em"></p>
  <div class="items" id="cpBuscarItems"></div>
</section>
<section class="pantalla" id="cpDet">
  <div class="cabeza"><h2 id="cpDetTitulo" style="font-size:1.45rem">Factura</h2><button class="sec" id="btnCpDetVolver">Volver</button></div>
  <p id="cpDetEstado" style="margin:0;font-size:.9rem;text-align:center;min-height:1.2em;font-weight:600"></p>
  <div class="panel" id="cpDetPanel"></div>
  <div class="acciones">
    <button class="sec" id="btnCpIgnorar">Gasto / Ignorar</button>
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
<input type="file" id="dsArchivo" accept="image/*,application/pdf" hidden>
<style>
  .cp-filtros{display:grid;grid-template-columns:1fr 1fr;gap:6px;flex:none}
  .cp-filtros .sel-hora{padding:8px;font-size:.9rem}
  .cp-filtros .ancho{grid-column:1 / -1}
  .cp-paso{border-left:3px solid var(--amarillo);padding:4px 0 4px 10px;margin:10px 0}
  .cp-paso b.n{color:var(--amarillo);margin-right:4px}
  .cp-lin{border-bottom:1px solid rgba(251,250,245,.14);padding:8px 0;font-size:.92rem;line-height:1.45}
  .cp-mes{display:flex;justify-content:space-between;gap:8px;padding:10px 2px 4px;font-weight:600;font-size:.95rem;
    color:var(--amarillo);border-bottom:1px solid rgba(251,250,245,.25)}
</style>`;
document.getElementById("entrada").insertAdjacentHTML("beforebegin", html);
["cpDet", "cpDs", "cpCola", "cpTodas", "cpBuscar"].forEach(id => { if(!ESCRIBIBLES.includes(id)) ESCRIBIBLES.push(id); });

/* 🏠 en las pantallas nuevas */
["cpMenuProv", "cpMenuFact", "cpCola", "cpDet", "cpDs", "cpTodas", "cpBuscar", "cpAjustes", "cpAjDet"].forEach(id => {
  const cab = $(id).querySelector(".cabeza");
  const b = document.createElement("button");
  b.className = "sec casita"; b.textContent = "🏠"; b.setAttribute("aria-label", "Menú principal");
  b.addEventListener("click", () => { if(esAdmin()) irMenu("principal"); else inicio(); });
  cab.insertBefore(b, [...cab.querySelectorAll("button")].pop());
});

/* Compras → Proveedores (ver todos, pedidos, abastos) y Facturas (ver todas, por aprobar, documento soporte) */
const menu = document.querySelector("#compras .menu");
const subProv = $("cpMenuProvBotones");
[["btnProveedores", "Ver todos los proveedores", "ghost"], ["btnPedidos", "Pedidos sugeridos", "ppal"], ["btnAbastosPlaza", "Lista de abastos", "ghost"]]
  .forEach(([id, txt, cls]) => { const b = $(id); b.textContent = txt; b.className = cls; subProv.appendChild(b); });
menu.innerHTML = `<button class="ppal" id="btnCpMenuProv">Proveedores</button><button class="ghost" id="btnCpMenuFact">Facturas</button>`;
$("btnCpMenuProv").addEventListener("click", () => irMenu("cpMenuProv"));
$("btnCpMenuFact").addEventListener("click", () => irMenu("cpMenuFact"));
$("btnCpMenuProvVolver").addEventListener("click", () => irMenu("compras"));
$("btnCpMenuFactVolver").addEventListener("click", () => irMenu("compras"));
/* Los "Volver" de proveedores, pedidos y abastos ahora regresan al submenú */
["btnVolverProvs", "btnVolverPedidos", "btnVolverAbastos"].forEach(id => {
  const viejo = $(id), nuevo = viejo.cloneNode(true);
  viejo.replaceWith(nuevo);
  nuevo.addEventListener("click", () => irMenu("cpMenuProv"));
});

const abrir = id => { clearTimeout(tLista); ir(id); };
/* Sin teclado al abrir la app: el campo oculto del lector ya no se enfoca. El lector de código de barras
   (Bluetooth/USB) se escucha desde todo el documento: escribe muy rápido y termina en Enter. */
(function(){
  window.enfocarLector = function(){ if(document.activeElement === entrada) entrada.blur(); };
  entrada.setAttribute("readonly", "readonly");
  entrada.blur();
  let buffer = "", ultimo = 0;
  const editable = el => el && el !== entrada && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
  document.addEventListener("keydown", e => {
    if(editable(e.target) || editable(document.activeElement)) return;      // escribiendo en un campo: no es el lector
    const ahora = Date.now();
    if(ahora - ultimo > 80) buffer = "";                                     // el lector escribe muy rápido; una persona no
    ultimo = ahora;
    if(e.key === "Enter"){
      const codigo = buffer.trim(); buffer = "";
      if(codigo.length < 3) return;
      e.preventDefault();
      entrada.value = codigo;
      entrada.dispatchEvent(new KeyboardEvent("keydown", {key: "Enter", bubbles: false}));   // lo procesa la app como siempre
      return;
    }
    if(e.key && e.key.length === 1) buffer += e.key;
  }, true);
})();

/* Sin zoom en la app: ni con dos dedos ni con doble toque */
(function(){
  const vp = document.querySelector('meta[name="viewport"]');
  if(vp) vp.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover");
  const st = document.createElement("style");
  st.textContent = "*{touch-action:pan-x pan-y}html,body{-webkit-text-size-adjust:100%}";
  document.head.appendChild(st);
  ["gesturestart", "gesturechange", "gestureend"].forEach(ev => document.addEventListener(ev, e => e.preventDefault(), {passive:false}));
})();
/* Versión visible en Ajustes (5 toques en el logo), para saber si el celular tiene el compras.js nuevo */
$("verApp").textContent += " · " + COMPRAS_VERSION;
/* ✅ cuadra · ⚠ aviso (diferencia de total o IVA mayor a la tolerancia: deja subir) · ❌ bloquea */
const chk = c => `<div class="fila-dato"><span${c.aviso ? ' style="color:#ffd23f"' : ""}>${c.ok ? "✅" : c.aviso ? "⚠️" : "❌"} ${esc(c.texto)}</span></div>`;

/* ══════════════ FILTROS COMUNES: mes, proveedor y orden ══════════════ */
const MESES_L = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const ORDENES = [["reciente", "Más recientes"], ["antigua", "Más antiguas"], ["proveedor", "Proveedor A-Z"], ["valor", "Mayor valor"]];
const fx = {cola: {mes: "", prov: "", orden: "reciente"}, todas: {mes: "", prov: "", orden: "reciente"}};
const mesDe = f => String(f.fecha || "").slice(0, 7);
const nombreMes = m => m ? MESES_L[Number(m.slice(5, 7)) - 1] + " " + m.slice(0, 4) : "Sin fecha";
/* Pinta los 3 selectores con las opciones que existen en la lista (base = antes de filtrar por mes y proveedor) */
function pintarFiltros(contId, base, st){
  const meses = [...new Set(base.map(mesDe).filter(Boolean))].sort().reverse();
  const provs = [...new Set(base.map(f => f.proveedor || "").filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  if(st.mes && !meses.includes(st.mes)) meses.unshift(st.mes);
  if(st.prov && !provs.includes(st.prov)) provs.unshift(st.prov);
  const op = (v, t, sel) => `<option value="${esc(v)}"${v === sel ? " selected" : ""}>${esc(t)}</option>`;
  $(contId).innerHTML =
    `<select class="sel-hora" data-fx="mes">${op("", "📅 Todos los meses", st.mes)}${meses.map(m => op(m, nombreMes(m), st.mes)).join("")}</select>` +
    `<select class="sel-hora" data-fx="orden">${ORDENES.map(([v, t]) => op(v, "↕ " + t, st.orden)).join("")}</select>` +
    `<select class="sel-hora ancho" data-fx="prov">${op("", "🏪 Todos los proveedores", st.prov)}${provs.map(p => op(p, p, st.prov)).join("")}</select>` +
    (st.mes || st.prov ? `<button class="chip ancho" data-fx="limpiar" style="text-transform:none;justify-self:start">✕ Quitar filtro de mes/proveedor</button>` : "");
}
function aplicarFiltros(lista, st, valor){
  const r = lista.filter(f => (!st.mes || mesDe(f) === st.mes) && (!st.prov || f.proveedor === st.prov));
  const porFecha = (a, b) => String(a.fecha || "").localeCompare(String(b.fecha || "")) || String(a.numero).localeCompare(String(b.numero));
  if(st.orden === "antigua") r.sort(porFecha);
  else if(st.orden === "proveedor") r.sort((a, b) => String(a.proveedor).localeCompare(String(b.proveedor), "es") || porFecha(b, a));
  else if(st.orden === "valor") r.sort((a, b) => valor(b) - valor(a));
  else r.sort((a, b) => porFecha(b, a));
  return r;
}
/* Si se ordena por fecha, la lista se agrupa por mes con cuántas facturas y cuánto suman */
function htmlAgrupado(lista, st, valor, fila){
  if(st.orden !== "reciente" && st.orden !== "antigua") return lista.map(fila).join("");
  let h = "", mes = null;
  lista.forEach((f, i) => {
    const m = mesDe(f);
    if(m !== mes){
      mes = m;
      const delMes = lista.filter(x => mesDe(x) === m);
      h += `<div class="cp-mes"><span>${nombreMes(m)}</span><span>${delMes.length} · ${plata(delMes.reduce((t, x) => t + (valor(x) || 0), 0))}</span></div>`;
    }
    h += fila(f, i);
  });
  return h;
}
function escucharFiltros(contId, st, repintar){
  $(contId).addEventListener("change", e => {
    const k = e.target.dataset.fx; if(!k) return;
    st[k] = e.target.value; repintar();
  });
  $(contId).addEventListener("click", e => {
    if(e.target.dataset.fx !== "limpiar") return;
    st.mes = ""; st.prov = ""; repintar();
  });
}

/* ══════════════ FACTURAS POR APROBAR ══════════════ */
let cola = null, sel = null, cargandoCola = false, porGuardar = null, revisandoGuardar = false;
try{ porGuardar = JSON.parse(localStorage.getItem("cp_por_guardar") || "null"); }catch(e){ porGuardar = null; }
async function revisarPorGuardar(){
  if(revisandoGuardar) return;
  revisandoGuardar = true; pintarPorGuardar(true);
  try{
    porGuardar = await postAdmin({accion: "compras_por_guardar"});
    try{ localStorage.setItem("cp_por_guardar", JSON.stringify(porGuardar)); }catch(e){}
  }catch(e){ console.warn(e); }
  finally{ revisandoGuardar = false; pintarPorGuardar(false); }
}
let htmlPorGuardar = "";
function pintarPorGuardar(cargando){
  const l = (porGuardar && porGuardar.pendientes) || [];
  const ic = (porGuardar && porGuardar.impoconsumo) || [];
  const st = v => v === null || v === undefined ? "?" : num(v);
  const boton = (id, txt) => `<button class="sec chico" id="${id}" style="display:block;margin:10px 0 2px;width:100%;box-sizing:border-box;white-space:normal">${
    cargando ? "Revisando…" : txt}</button>`;
  if(porGuardar && porGuardar.impoconsumo){ ajustes = porGuardar.impoconsumo; guardarAjustes(); pintarBotonAjustes(); }
  const htmlIc = !ic.length ? "" :
    `<div class="bloque" style="border:2px solid #ff9a86;margin-bottom:10px"><p class="nota" style="margin:0 0 8px;opacity:1">
    ⚖ <b>${ic.length} factura${ic.length > 1 ? "s" : ""} pendiente${ic.length > 1 ? "s" : ""} por ajuste de impuestos</b>: falta agregar el impoconsumo en Siigo.</p>` +
    ic.map(c => `<small style="display:block;opacity:.9">• ${esc(c.doc)} · ${esc(c.proveedor)} · total final ${plata(c.total_final)}</small>`).join("") +
    `<button class="ppal chico" id="btnCpIrAjustes" style="display:block;margin-top:10px;width:100%">Ver el paso a paso</button></div>`;
  const htmlStock = !l.length ? "" :
    `<details class="alerta" open style="border:2px solid #ffd23f;margin-bottom:10px;box-sizing:border-box;max-width:100%;overflow:hidden">
    <summary><span>⚠ ${l.length} compra${l.length > 1 ? "s" : ""} no ha${l.length > 1 ? "n" : ""} movido el stock</span>
    <span class="num-alerta amarillo">${l.length}</span></summary>
    <p class="nota" style="margin:0 0 6px">Ábrelas en Siigo → <b>Editar</b> → <b>Guardar</b> (sin cambiar nada). Siigo solo suma el inventario así.
      El stock esperado ya descuenta lo que vendiste desde que la subiste.</p>` +
    l.map(c => `<div class="fila-dato" style="display:block;white-space:normal"><b>${esc(c.doc)}</b> · ${esc(c.proveedor)} <small style="opacity:.7">fac. ${esc(c.factura)}</small>` +
      (c.productos || []).map(p => `<small style="display:block;opacity:.85">${p.sumo === false ? "❌" : p.sumo ? "✅" : "•"} ${esc(p.nombre || p.codigo)}: ` +
        (p.esperado !== undefined && p.esperado !== null
          ? `debería tener <b>${num(p.esperado)}</b> (antes ${st(p.antes)} + compra ${num(p.suma)}${p.vendido ? " − vendido " + num(p.vendido) : ""}) · tiene <b>${st(p.ahora)}</b>`
          : `antes ${st(p.antes)} · ahora ${st(p.ahora)} · debe sumar +${num(p.suma)}`) + `</small>`).join("") +
      `</div>`).join("") +
    boton("btnCpYaGuarde", "Ya las guardé, revisar") + `</details>`;
  htmlPorGuardar = htmlIc + htmlStock;
  const vieja = $("cpPorGuardar"); if(vieja) vieja.remove();
  if($("cpCola").classList.contains("activa")) pintarCola();
}
try{ cola = JSON.parse(localStorage.getItem("cp_cola") || "null"); }catch(e){ cola = null; }

async function abrirCola(){
  abrir("cpCola");
  pintarCola();
  pintarPorGuardar(false);
  revisarPorGuardar();
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
let filtroCola = "";
const FILTROS_COLA = [
  ["", "Todas", f => true],
  ["lista", "✓ Listas", f => f.lista],
  ["asociar", "Sin asociar", f => !f.lista && (f.lineas || []).some(l => l.precio === undefined && l.destino !== "OBSEQUIO" &&
      /asoci|Productos_proveedor|Sin producto|no existe|varios productos/i.test(l.motivo || ""))],
  ["costo", "Caja / costo alto", f => (f.lineas || []).some(l => /caja|Costo|factor/i.test((l.motivo || "") + " " + (l.alerta || "")))],
  ["prov", "Proveedor no existe", f => (f.conciliacion || []).some(c => !c.ok && /proveedor no existe/i.test(c.texto))],
  ["otras", "Otros pendientes", f => !f.lista && !FILTROS_COLA.slice(2, 5).some(x => x[2](f))]
];
function pintarCola(){
  const box = $("cpItems");
  if(!cola){ box.innerHTML = '<div class="vacio">Cargando…</div>'; $("cpResumen").innerHTML = ""; return; }
  const todasF = cola.facturas || [];
  $("cpChips").innerHTML = FILTROS_COLA.map(([k, t, fn]) =>
    `<button class="chip" data-fc="${k}" aria-pressed="${filtroCola === k}" style="text-transform:none">${t} · ${todasF.filter(fn).length}</button>`).join("");
  const q = normal($("cpBuscarCola").value.trim());
  const fn = (FILTROS_COLA.find(x => x[0] === filtroCola) || FILTROS_COLA[0])[2];
  const base = todasF.filter(fn).filter(f => !q || normal(f.proveedor + " " + f.numero + " " + f.nit).includes(q));
  const valorF = f => (f.totales || {}).xml || 0;
  pintarFiltros("cpColaFiltros", base, fx.cola);
  const fs = aplicarFiltros(base, fx.cola, valorF);
  const listas = fs.filter(f => f.lista);
  const caja = (n, t) => `<div class="caja"><b>${n}</b><span>${t}</span></div>`;
  const listasT = todasF.filter(f => f.lista);
  $("cpResumen").innerHTML = caja(listasT.length, "listas") + caja(todasF.length - listasT.length, "con pendientes") +
    caja(plata(listasT.reduce((s, f) => s + f.totales.total, 0)), "por subir");
  let h = "";
  if((cola.version_servidor || 0) < SERVIDOR_MINIMO) h += `<div class="bloque" style="border:2px solid var(--rojo)"><p class="nota" style="margin:0;opacity:1">
    ⚠ <b>El servidor no está actualizado</b> (versión ${cola.version_servidor || "anterior"}, se necesita ${SERVIDOR_MINIMO}).
    En Apps Script: Implementar → Gestionar implementaciones → ✏️ → Nueva versión. Luego toca ↻.
    Mientras tanto no apruebes facturas: el servidor viejo sube mal el impoconsumo y las bonificaciones.</p></div>`;
  if(cola.config_ok === false) h += `<div class="bloque" style="border:2px solid var(--rojo)"><p class="nota" style="margin:0">
    Falta configurar en 15_compras.gs: <b>${esc((cola.config_falta || []).join(", "))}</b>. Ejecuta cpDiagnostico() en el editor.</p></div>`;
  h = htmlPorGuardar + h;
  if(!todasF.length) h += `<div class="vacio">No hay facturas por aprobar.<br>Todas las del correo ya están en Siigo o ignoradas.</div>`;
  else if(!fs.length) h += `<div class="vacio">Ninguna factura con ese filtro.</div>`;
  h += htmlAgrupado(fs, fx.cola, valorF, f => {
    const malo = (f.conciliacion || []).filter(c => !c.ok && !c.aviso)[0] || (f.conciliacion || []).filter(c => c.aviso)[0];
    return `<button class="item" data-id="${esc(f.id)}">
      <span class="cod" style="${f.lista ? "background:#4fd6a8;color:var(--verde)" : "background:#ffd23f;color:var(--verde)"}">${f.lista ? "✓" : "!"}</span>
      <span class="nom">${esc(f.proveedor)}
        <small>${esc(f.numero)} · ${fechaTxt(f.fecha)} · ${f.lineas.length} líneas${malo ? `<br><span style="color:#ffd23f">${esc(malo.texto)}</span>` : ""}</small></span>
      <span class="pre">${plata(f.totales.xml)}<small>›</small></span></button>`;
  });
  h += `<p class="nota" style="text-align:center">${cola.ya_en_siigo || 0} ya en Siigo · ${cola.ignoradas || 0} ignoradas${
    cola.notas_credito ? " · " + cola.notas_credito + " notas crédito (en KPIs → Alertas)" : ""}<br>Revisado ${esc(cola.generado || "")}</p>`;
  box.innerHTML = h;
}
$("cpItems").addEventListener("click", e => {
  if(e.target.closest("#btnCpYaGuarde")){ revisarPorGuardar(); return; }
  if(e.target.closest("#btnCpIrAjustes")){ abrirAjustes(); return; }
  const b = e.target.closest(".item"); if(!b || !cola) return;
  sel = cola.facturas.find(f => f.id === b.dataset.id);
  if(sel) abrirDetalle();
});
$("cpChips").addEventListener("click", e => {
  const b = e.target.closest("[data-fc]"); if(!b) return;
  filtroCola = b.dataset.fc; pintarCola();
});
$("cpBuscarCola").addEventListener("input", pintarCola);
escucharFiltros("cpColaFiltros", fx.cola, pintarCola);
$("btnCpActualizar").addEventListener("click", () => cargarCola(true));
$("btnCpVolver").addEventListener("click", () => irMenu("cpMenuFact"));
$("btnCpPorAprobar").addEventListener("click", abrirCola);

/* ---------- Detalle ---------- */
function abrirDetalle(){
  $("cpDetEstado").textContent = "";
  pintarDetalle();
  abrir("cpDet");
  $("cpDetPanel").scrollTop = 0;
}
/* Lo que entra a Siigo por cada producto: cantidad (con factor), costo unitario sin IVA y con IVA */
/* "15", "0,5" o "1/30" → número */
function leerFactor(v){
  const t = String(v || "").trim().replace(",", ".");
  const m = /^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/.exec(t);
  const n = m ? Number(m[1]) / Number(m[2]) : Number(t);
  return n > 0 && isFinite(n) ? n : 0;
}
function detalleTxt(l){
  if(!l.detalle || !l.detalle.length) return "";
  const varios = l.detalle.length > 1;
  return l.detalle.map(d => `<span style="display:block;margin-top:3px;color:#bcd9dc">↳ ${varios ? esc(d.nombre) + ": " : ""}<b>${num(d.cantidad)} und</b> × ${plata(d.costo)}` +
    `${Math.abs(d.costo_iva - d.costo) >= 0.5 ? ` · con IVA <b>${plata(d.costo_iva)}</b>` : " · sin IVA"} c/u</span>`).join("");
}
/* Notas de IVA e impoconsumo de una línea */
function notasIva(l){
  return (l.impoconsumo ? `<br><span style="color:#4fd6a8">🧾 ${esc(l.otros_nom || "Impoconsumo")} ${plata(l.impoconsumo)} sube como impuesto (mayor valor, al costo)</span>` : "") +
    (l.ic_pendiente ? `<br><span style="color:#ffd23f">➕ ${esc(l.otros_nom || "Impoconsumo")} ${plata(l.ic_pendiente)}: lo agregas tú en Siigo (va al costo)</span>` : "") +
    (l.iva_no_reg ? `<br><span style="color:#8fc9ff">IVA ${plata(l.iva_no_reg)} al registro de IVA descontable</span>` : "");
}
function lineaTxt(l){
  if(l.destino === "OBSEQUIO") return `<span style="opacity:.7">Cantidad 0 · no se sube</span>`;
  if(l.por_fuera) return `🎁 Bonificación de un producto no facturado: no se sube (queda en las observaciones)` + notasIva(l);
  if(l.bonificacion && l.fusion) return `🎁 Bonificación sumada a la línea ${esc(l.fusion)} (costo promedio)` + notasIva(l);
  const bon = l.bonificacion ? `🎁 Bonificación · ` : "";
  const extra = l.bonif_unidades ? ` · <b>+${num(l.bonif_unidades)} de bonificación</b>, costo promedio ${plata(l.precio)}` : "";
  if(l.destino === "MEZCLA") return bon + (l.precio !== undefined ? `🔀 ${esc(l.nombre)}` + notasIva(l) : `<span style="color:#ff9a86">⚠ ${esc(l.motivo || "mezcla incompleta")}</span>`);
  if(l.destino === "GASTO") return l.precio !== undefined
    ? `🧾 Gasto · ${esc(l.nombre || l.cuenta)}` : `<span style="color:#ff9a86">⚠ ${esc(l.motivo || "gasto sin cuenta")}</span>`;
  if(l.precio === undefined) return bon + `<span style="color:#ff9a86">⚠ ${esc(l.motivo || "sin asociar")}</span> · toca para resolver`;
  return bon + `📦 ${esc(l.nombre)}${l.factor && l.factor !== 1 ? ` · ${num(l.cant)} ${l.factor < 1 ? "÷ " + num(Math.round(1 / l.factor)) : "× " + num(l.factor)} = <b>${num(l.cant_siigo - (l.bonif_unidades || 0))}</b>` : ""}${l.desarme ? " · caja de desarme" : ""}${extra}` +
    (l.temporal ? ` · <span style="color:#8fc9ff">asociación temporal</span>` : "") + notasIva(l) +
    (l.alerta ? `<br><span style="color:#ffd23f">⚠ ${esc(l.alerta)}</span>` : "");
}
function pintarDetalle(){
  const f = sel; if(!f) return;
  $("cpDetTitulo").textContent = f.proveedor;
  const t = f.totales;
  let h = `<div class="bloque"><h3 style="margin-bottom:4px">${esc(f.numero)}<small>${f.lista ? "✅ lista" : "⚠ con pendientes"}</small></h3>
    <p class="nota" style="margin:0">NIT ${esc(f.nit)} · ${fechaTxt(f.fecha)} · vence ${fechaTxt(f.vence)}${
      f.pdf ? ` · <a href="${esc(f.pdf)}" target="_blank" rel="noopener" style="color:var(--amarillo)">ver PDF</a>` : ""}</p>
    <div class="grilla" style="margin-top:10px">
      <div class="dato"><span>Total Siigo</span><b>${plata(t.total)}</b><div class="sub">base ${plata(t.base)} · IVA ${plata(t.iva)}${
        t.impoconsumo ? ` · impoconsumo ${plata(t.impoconsumo)}` : ""}${
        t.impoconsumo_pendiente ? `<br>+ impoconsumo ${plata(t.impoconsumo_pendiente)} que agregas tú = <b>${plata(t.total_final)}</b>` : ""}${
        t.iva_no_registrado ? `<br>IVA ${plata(t.iva_no_registrado)} al registro de IVA descontable` : ""}</div></div>
      <div class="dato"><span>Total XML</span><b>${plata(t.xml)}</b><div class="sub">IVA ${plata(t.xml_iva)}</div></div>
    </div></div>`;
  const pagos = cola.pagos || [];
  if(pagos.length){
    if(!f.pagoElegido) f.pagoElegido = f.pago;
    const pg = pagos.find(x => x.id === Number(f.pagoElegido)) || pagos[0];
    h += `<div class="bloque"><h3>¿Cómo la pagaste? <small>sugerido: ${esc(f.pago_origen || "")}</small></h3>
      <div style="display:flex;flex-direction:column;gap:6px">` + pagos.map(x =>
        `<button class="chip" data-pago="${x.id}" aria-pressed="${x.id === pg.id}" style="text-transform:none;text-align:left">${esc(x.nombre)}</button>`).join("") +
      `</div><p class="nota">${pg.credito ? "Queda como cuenta por pagar, vence " + fechaTxt(f.vence) + ". La marcas pagada en Proveedores cuando le pagues al repartidor."
        : "Se registra en Siigo pagada con " + (/transfer/i.test(pg.nombre) ? "Pagos por cuenta bancaria" : "Efectivo") + ", sin cuenta por pagar. Queda pagada también en Proveedores."}</p></div>`;
  }
  const malTer = (f.conciliacion || []).find(c => !c.ok && /proveedor no existe|solo como CLIENTE|INACTIVO/i.test(c.texto));
  const botonTer = !malTer ? "" : /no existe/i.test(malTer.texto)
    ? `<button class="ppal chico" data-tercero="crear" style="width:100%;margin-top:8px">➕ Crear proveedor en Siigo con los datos de la factura</button>`
    : `<button class="ppal chico" data-tercero="habilitar" style="width:100%;margin-top:8px">🛠 Habilitarlo como proveedor activo en Siigo</button>`;
  h += `<div class="bloque"><h3>Conciliación <small>antes de subir</small></h3>${(f.conciliacion || []).map(chk).join("")}${botonTer}</div>`;
  if((f.avisos || []).length) h += `<div class="bloque"><h3>Avisos</h3>${f.avisos.map(a => `<p class="nota" style="margin:0 0 6px">⚠ ${esc(a)}</p>`).join("")}</div>`;
  h += `<div class="bloque"><h3>Líneas <small>toca para cambiar</small></h3>` + f.lineas.map((l, i) =>
    `<button class="item" data-l="${i}" style="width:100%">
      <span class="cod">${esc(l.n)}</span>
      <span class="nom">${esc(l.desc)}<small>${num(l.cant)} und en la factura${l.iva ? " · IVA " + num(l.iva) + "%" : ""}${l.otros ? " · " + esc(l.otros_nom || "otros imp.") + " " + plata(l.otros) : ""}<br>${lineaTxt(l)}${detalleTxt(l)}</small></span>
      <span class="pre">${plata(l.base)}<small>›</small></span></button>`).join("") + `</div>`;
  h += `<p class="nota" style="text-align:center">Al aprobar se crea la factura de compra en Siigo. No se envía a la DIAN.</p>`;
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

/* Elegir producto del catálogo: pantalla con buscador que filtra mientras escribes (nombre o código)
   y botón para escanear. Devuelve {codigo, nombre} o null si vuelves sin elegir. */
let buscarCtx = null;
function buscarCatalogo(q){
  const t = normal(q).trim(); if(!t) return [];
  const pal = t.split(/\s+/).filter(Boolean), d = t.replace(/\s+/g, "").replace(/^0+(?=\d)/, "");
  const res = productos.filter(p => pal.every(w => normal(p.n).includes(w)) ||
    (d.length >= 2 && ((p.c && normal(p.c).replace(/^0+(?=\d)/, "").includes(d)) || (p.b && normal(p.b).replace(/^0+(?=\d)/, "").includes(d)))));
  // primero los que empiezan con lo escrito
  res.sort((a, b) => (normal(b.n).startsWith(pal[0]) - normal(a.n).startsWith(pal[0])) || a.n.localeCompare(b.n, "es"));
  return res.slice(0, 60);
}
function elegirProducto(titulo, sugeridos, textoBusqueda){
  return new Promise(resolve => {
    buscarCtx = {resolve, volver: (document.querySelector(".pantalla.activa") || {}).id || "cpDet", sugeridos: sugeridos || []};
    $("cpBuscarTitulo").textContent = titulo || "Elegir producto";
    $("cpBuscarCampo").value = "";
    $("cpBuscarNota").textContent = textoBusqueda ? "En la factura: " + textoBusqueda : "";
    pintarBuscar();
    abrir("cpBuscar");
    setTimeout(() => $("cpBuscarCampo").focus(), 120);
  });
}
function terminarBuscar(p){
  const c = buscarCtx; if(!c) return;
  buscarCtx = null;
  ir(c.volver);
  c.resolve(p);
}
function pintarBuscar(){
  if(!buscarCtx) return;
  const q = $("cpBuscarCampo").value.trim();
  const fila = (cod, nom, sub) => `<button class="item" data-pcod="${esc(cod)}" data-pnom="${esc(nom)}" style="width:100%">
    <span class="cod">${esc(cod)}</span><span class="nom">${esc(nom)}<small>${sub || ""}</small></span><span class="pre">›</span></button>`;
  let h = "";
  if(!q){
    if(buscarCtx.sugeridos.length) h += `<p class="nota" style="margin:6px 0">Sugeridos</p>` +
      buscarCtx.sugeridos.map(x => fila(x.codigo, x.nombre, x.aprendido ? "usado antes" : "")).join("");
    h += `<div class="vacio">Escribe parte del nombre o del código, o toca 📷 para escanear.</div>`;
  }else{
    const res = buscarCatalogo(q);
    h = res.length ? res.map(p => fila(p.c || p.b, p.n, (p.b && p.b !== p.c ? "barras " + esc(p.b) + " · " : "") + plata(p.p) +
                                     (p.q != null ? " · " + num(p.q) + " en Siigo" : ""))).join("")
      : `<div class="vacio">No hay productos con "${esc(q)}".<br>Si es un producto nuevo, créalo en Siigo y actualiza el inventario desde Ajustes.</div>`;
  }
  $("cpBuscarItems").innerHTML = h;
}
$("cpBuscarCampo").addEventListener("input", pintarBuscar);
$("cpBuscarCampo").addEventListener("keydown", e => {
  if(e.key !== "Enter") return;
  e.preventDefault();
  const v = e.target.value.trim(), it = buscar(v);          // lector de código de barras: escribe y da Enter
  if(it) return terminarBuscar({codigo: it.c || it.b, nombre: it.n});
  const res = buscarCatalogo(v);
  if(res.length === 1) terminarBuscar({codigo: res[0].c || res[0].b, nombre: res[0].n});
});
$("cpBuscarItems").addEventListener("click", e => {
  const b = e.target.closest("[data-pcod]"); if(!b) return;
  terminarBuscar({codigo: b.dataset.pcod, nombre: b.dataset.pnom});
});
$("btnCpBuscarVolver").addEventListener("click", () => terminarBuscar(null));
$("btnCpBuscarCamara").addEventListener("click", () => abrirCamara("asociar"));
/* La cámara de la app llama a mostrar() y volverDeCamara(); mientras se elige producto, se usan aquí */
const mostrarApp = window.mostrar, volverCamaraApp = window.volverDeCamara;
window.mostrar = function(codigo, volverA){
  if(!buscarCtx) return mostrarApp(codigo, volverA);
  const it = buscar(codigo);
  if(it) return terminarBuscar({codigo: it.c || it.b, nombre: it.n});
  ir("cpBuscar");
  $("cpBuscarCampo").value = String(codigo).trim();
  pintarBuscar();
  $("cpBuscarNota").textContent = "El código " + codigo + " no está en el catálogo de Siigo.";
};
window.volverDeCamara = function(){
  if(buscarCtx && modoCamara === "asociar"){ ir("cpBuscar"); return; }
  return volverCamaraApp();
};
function avisoNuevo(l){
  const cod = l.barras || l.codProv || "(sin código)";
  alert(`Producto nuevo: créalo primero en Siigo.\n\nNombre: ${String(l.desc).toUpperCase()}\nCódigo: ${cod.replace(/^0+(?=\d{8})/, "")}\nIVA: ${l.iva ? l.iva + "%" : "0% / excluido (verifícalo)"}\nCategoría: la que corresponda (no se puede cambiar después de la primera venta).\n\nDespués de crearlo, en Inventario toca "Actualizar inventario desde Siigo" y vuelve aquí a asociarlo.`);
}
/* Una línea del proveedor repartida en 2 o más productos con cantidades fijas.
   (Si los sabores vienen al azar, mejor regístrala como caja y usa Desarmes.) */
const preguntar = (titulo, ops) => new Promise(ok => elegir(titulo, ops.map(([t, sub, v]) => ({t, sub, fn: () => ok(v)}))));
async function armarMezcla(l){
  // Se pide el TOTAL de cada producto en esta factura (ej. 305 huevos → 10 cubetas + 5 unidades);
  // al servidor va por cada unidad de la factura (total ÷ cantidad de la factura).
  const cantFac = Number(l.cant) || 1;
  const partes = (l.partes || []).map(x => ({codigo: x.codigo, nombre: x.nombre, total: x.cantidad}));
  if(partes.length){
    const seguir = await preguntar("Reparto actual: " + partes.map(x => num(x.total) + " × " + x.nombre).join(" + "),
      [["Empezar de nuevo", "Se borran los productos actuales", "nuevo"], ["Agregar otro producto", "", "agregar"]]);
    if(seguir === "nuevo") partes.length = 0;
  }
  while(true){
    const p = await elegirProducto(partes.length ? `Producto ${partes.length + 1}` : "Primer producto del reparto", [], l.desc);
    if(!p) return;
    const r = await pedirForm(p.nombre, [{id: "q", label: `¿Cuántas unidades de este producto entran en total? (la factura trae ${num(cantFac)})`,
      valor: "", inputmode: "decimal", obligatorio: true, validar: v => Number(String(v).replace(",", ".")) > 0 || "Debe ser mayor que 0"}], "Agregar");
    if(!r) return;
    partes.push({codigo: p.codigo, nombre: p.nombre, total: Number(String(r.q).replace(",", "."))});
    if(partes.length < 2) continue;
    const resumen = partes.map(x => num(x.total) + " × " + x.nombre).join(" + ");
    const sig = await preguntar(resumen, [["✓ Guardar reparto", "Temporal: se borra a medianoche. El costo se reparte según el precio de venta", "guardar"],
      ["+ Agregar otro producto", "", "otro"]]);
    if(sig === "guardar") break;
  }
  const envio = partes.map(x => ({codigo: x.codigo, cantidad: x.total / cantFac}));
  const d = await conEspera("Guardando reparto…", () => postAdmin({accion: "compra_destino", id: sel.id, linea: l.clave, destino: "MEZCLA",
    partes: envio, proveedor: sel.proveedor, descripcion: l.desc}));
  if(d){ reemplazar(d.factura); $("cpDetEstado").style.color = ""; $("cpDetEstado").textContent = "✓ Reparto guardado (temporal: se borra a medianoche)"; }
}
$("cpDetPanel").addEventListener("click", async e => {
  const bt = e.target.closest("[data-tercero]");
  if(bt && sel){
    const crear = bt.dataset.tercero === "crear";
    if(!confirm(crear ? `¿Crear en Siigo el proveedor ${sel.proveedor} (NIT ${sel.nit}) con los datos que trae la factura?`
                      : `¿Habilitar en Siigo a ${sel.proveedor} (NIT ${sel.nit}) como proveedor activo?\n\nSe conservan sus demás datos.`)) return;
    const d = await conEspera(crear ? "Creando proveedor en Siigo…" : "Actualizando el tercero en Siigo…",
      () => postAdmin({accion: crear ? "compra_crear_tercero" : "compra_habilitar_tercero", id: sel.id}));
    if(d){ reemplazar(d.factura); $("cpDetEstado").style.color = ""; $("cpDetEstado").textContent = "✓ " + d.mensaje; }
    return;
  }
  const pg = e.target.closest("[data-pago]");
  if(pg && sel){ sel.pagoElegido = Number(pg.dataset.pago); const sc = $("cpDetPanel").scrollTop; pintarDetalle(); $("cpDetPanel").scrollTop = sc; return; }
  const b = e.target.closest("[data-l]"); if(!b || !sel) return;
  const l = sel.lineas[Number(b.dataset.l)];
  if(l.destino === "OBSEQUIO") return alert("Esta línea viene con cantidad 0: no se sube.");
  const ops = [{t: "📦 Asociar a un producto de Siigo", sub: l.codigo ? "Ahora: " + l.nombre + " × " + (l.factor || 1) : "Queda guardado para las próximas facturas", fn: async () => {
    const actual = l.codigo ? [{codigo: l.codigo, nombre: l.nombre + " (el actual: solo cambiar el factor)"}] : [];
    const p = await elegirProducto("¿Qué producto es?", actual, l.desc);
    if(!p) return;
    const fx = l.factor && l.factor < 1 ? "1/" + Math.round(1 / l.factor) : (l.factor_sugerido || l.factor || 1);
    const r = await pedirForm(p.nombre, [{id: "f", label: "Factor. Caja de 15 que se vende suelta → 15 · Igual que en Siigo → 1 · " +
      "Viene suelto y en Siigo se vende por paquete (30 huevos = 1 cubeta) → 1/30", valor: fx, inputmode: "text",
      validar: v => leerFactor(v) > 0 || "Escribe un número (15) o una fracción (1/30)"}], "Asociar");
    if(!r) return;
    const d = await conEspera("Guardando asociación…", () => postAdmin({accion: "compra_asociar", id: sel.id, linea: l.clave,
      codigo: p.codigo, factor: leerFactor(r.f), proveedor: sel.proveedor, descripcion: l.desc, codProv: l.codProv, barras: l.barras}));
    if(d){ reemplazar(d.factura); $("cpDetEstado").style.color = ""; $("cpDetEstado").textContent = "✓ Asociada (temporal: se borra a medianoche; al subir la factura queda guardada desde Siigo)"; }
  }}];
  ops.push({t: "🔀 Repartir en varios productos", sub: l.destino === "MEZCLA" ? "Ahora: " + l.nombre : "Ej. caja con 6 de un sabor y 6 de otro", fn: () => armarMezcla(l)});
  if(l.destino === "GASTO" || l.destino === "MEZCLA") ops.push({t: "↩ Volver a un solo producto", sub: "Usa la asociación de Productos_proveedor", fn: async () => {
    const d = await conEspera("Guardando…", () => postAdmin({accion: "compra_destino", id: sel.id, linea: l.clave, destino: "INVENTARIO"}));
    if(d) reemplazar(d.factura);
  }});
  ops.push({t: "🆕 Es un producto nuevo", sub: "Te digo con qué datos crearlo en Siigo", fn: () => avisoNuevo(l)});
  elegir(l.desc, ops);
});
$("btnCpAprobar").addEventListener("click", async () => {
  const f = sel; if(!f || !f.lista) return;
  const pg = (cola.pagos || []).find(x => x.id === Number(f.pagoElegido || f.pago)) || {nombre: "", credito: true};
  const t = f.totales;
  const avisos = (f.conciliacion || []).filter(c => c.aviso);
  if(!confirm(`¿Subir a Siigo la factura ${f.numero} de ${f.proveedor}?\n\nTotal ${plata(t.total)}` +
    (avisos.length ? `\n\n⚠ Tiene diferencias con el XML:\n` + avisos.map(c => "• " + c.texto.replace(/^Aviso: /, "")).join("\n") +
      `\nSe sube igual; revisa en Siigo después.\n` : "") +
    (t.impoconsumo_pendiente ? `\n+ impoconsumo ${plata(t.impoconsumo_pendiente)} que agregas tú en Siigo = ${plata(t.total_final)}` : "") +
    `\nForma de pago: ${pg.nombre}\n` +
    (pg.credito ? `Queda como cuenta por pagar, vence ${fechaTxt(f.vence)}.` : `Queda PAGADA con ${pg.nombre.replace("Contado · ", "")}.`) +
    `\n\nNo se envía a la DIAN.`)) return;
  const d = await conEspera("Subiendo a Siigo…", () => postAdmin({accion: "compra_aprobar", id: f.id, pago: f.pagoElegido || f.pago}));
  if(!d){
    // Siigo no deja usar el tercero como proveedor: ofrecer habilitarlo ahí mismo
    if(/habilitado como proveedor|customer_settings/i.test($("cpDetEstado").textContent) &&
       confirm(`Siigo no deja usar a ${f.proveedor} (NIT ${f.nit}) como proveedor.\n\n¿Lo habilito como proveedor activo en Siigo ahora? Luego vuelves a tocar Aprobar.`)){
      const h = await conEspera("Actualizando el tercero en Siigo…", () => postAdmin({accion: "compra_habilitar_tercero", id: f.id}));
      if(h){ reemplazar(h.factura); $("cpDetEstado").style.color = ""; $("cpDetEstado").textContent = "✓ " + h.mensaje + ". Ya puedes aprobar."; }
      return;
    }
    cargarCola(false); return;
  }
  quitarDeCola(f.id);
  historial = null;
  revisarPorGuardar();
  const ic = d.impoconsumo_pendiente;
  alert(`${d.cuadra ? "✅" : "⚠"} Creada en Siigo: ${d.nombre} · ${d.pago}` +
    (d.recibo ? `\nRecibo de pago: ${d.recibo} (pagada)` : "") +
    (d.recibo_nota ? `\n⚠ No se creó recibo de pago: ${d.recibo_nota}.` : "") +
    (!d.credito ? `\nQuedó pagada con ${String(d.pago || "").replace("Contado · ", "")}.` : "") +
    (ic ? `\n\n⚖ FALTA EL IMPOCONSUMO (${plata((ic.lineas || []).reduce((t, x) => t + x.valor, 0))}). Quedó en ` +
      `Facturas → Pendientes por ajuste de impuestos, con el paso a paso para hacerlo en Siigo. Total final ${plata(ic.total_final)}.` : "") +
    (d.guardar_en_siigo ? `\n\n👉 Para que sume el stock: abre ${d.guardar_en_siigo} en Siigo → Editar → Guardar` +
      (ic ? " (la misma edición del impoconsumo)." : ".") : "") +
    ((d.stock || []).length ? `\nDespués de guardarla, el stock debe quedar así:\n` + d.stock.map(x =>
      `• ${x.nombre}: tenías ${x.antes === null || x.antes === undefined ? "?" : num(x.antes)} → debe quedar en ${x.esperado === null || x.esperado === undefined ? "(+" + num(x.suma) + ")" : num(x.esperado)}`).join("\n") : "") +
    (d.saldo_siigo !== undefined && d.saldo_siigo !== null ? `\nSaldo que informa Siigo al crearla: ${plata(d.saldo_siigo)}` : "") +
    (d.recibo_error ? `\n⚠ La compra quedó como cuenta por pagar, pero el recibo de pago falló: ${d.recibo_error}\nCréalo desde Ver todas las facturas → Pagos.` : "") +
    `\n\nConciliación después de subir:\n` +
    d.conciliacion.map(c => (c.ok ? "✓ " : "✗ ") + c.texto).join("\n") +
    (d.cuadra ? "" : "\n\nRevisa la compra en Siigo: algo no cuadra con lo esperado."));
  if(ic){ cargarAjustes(true); abrirAjustes(); return; }
  abrir("cpCola");
});
$("btnCpIgnorar").addEventListener("click", async () => {
  const f = sel; if(!f) return;
  let motivo = await preguntar(`${f.proveedor} · ${f.numero}`, [
    ["🧾 Gasto del negocio", "Bolsas, aseo del local, papelería, arreglos… No entra al inventario", "Gasto"],
    ["🙋 Personal", "No es del negocio", "Personal"],
    ["✏️ Otro motivo", "Lo escribes tú", "otro"]]);
  if(motivo === "otro"){
    const r = await pedirForm(`Ignorar ${f.numero}`, [{id: "m", label: "Motivo", valor: "", obligatorio: true,
      validar: v => !!v.trim() || "Escribe el motivo"}], "Guardar");
    if(!r) return;
    motivo = r.m;
  }
  const d = await conEspera("Guardando…", () => postAdmin({accion: "compra_ignorar", id: f.id, motivo}));
  if(!d) return;
  quitarDeCola(f.id);
  historial = null;
  abrir("cpCola");
});
$("btnCpDetVolver").addEventListener("click", () => abrir("cpCola"));

/* ══════════════ PENDIENTES POR AJUSTE DE IMPUESTOS ══════════════
   Compras subidas con base + IVA a las que falta el impoconsumo / IBUA (Siigo no lo deja subir por la API).
   El paso a paso trae TODAS las líneas, porque al activar "Incluye otros Impuestos cargo" Siigo borra los productos. */
let ajustes = null, ajSel = null, cargandoAj = false;
try{ ajustes = JSON.parse(localStorage.getItem("cp_ajustes") || "null"); }catch(e){ ajustes = null; }
function guardarAjustes(){ try{ localStorage.setItem("cp_ajustes", JSON.stringify(ajustes)); }catch(e){} }
const nfmt = v => Number(v || 0).toLocaleString("es-CO", {maximumFractionDigits: 4});
function pintarBotonAjustes(){
  const n = (ajustes || []).length;
  $("btnCpAjustes").innerHTML = "⚖ Pendientes por ajuste de impuestos" + (n ? ` <span class="num-alerta" style="margin-left:6px">${n}</span>` : "");
  $("btnCpAjustes").className = n ? "ppal" : "ghost";
}
async function cargarAjustes(silencio){
  if(cargandoAj) return;
  cargandoAj = true;
  const msg = $("cpAjEstado"), t0 = Date.now();
  if(!silencio){ msg.style.color = ""; msg.textContent = "Revisando en Siigo…"; }
  const reloj = silencio ? null : setInterval(() => { msg.textContent = "Revisando en Siigo… " + Math.round((Date.now() - t0) / 1000) + "s"; }, 1000);
  try{
    const d = await postAdmin({accion: "compras_impoconsumo"});
    ajustes = d.pendientes || []; guardarAjustes();
    msg.textContent = "";
  }catch(e){ msg.style.color = "#ff9a86"; msg.textContent = (ajustes ? "Mostrando la última copia · " : "") + e.message; }
  finally{ if(reloj) clearInterval(reloj); cargandoAj = false; pintarAjustes(); pintarBotonAjustes(); }
}
function abrirAjustes(){
  abrir("cpAjustes");
  pintarAjustes();
  cargarAjustes(false);
}
function pintarAjustes(){
  const l = ajustes || [];
  $("cpAjItems").innerHTML = !l.length ? `<div class="vacio">${ajustes ? "No hay facturas pendientes por ajuste de impuestos. ✅" : "Cargando…"}</div>` :
    `<p class="nota" style="text-align:center">Compras subidas sin el impoconsumo: Siigo no deja subirlo por la API. Toca una para ver el paso a paso.</p>` +
    l.map((c, i) => `<button class="item" data-aj="${i}">
      <span class="cod" style="background:#ff9a86;color:var(--verde)">⚖</span>
      <span class="nom">${esc(c.proveedor)}<small>${esc(c.doc)} · fac. ${esc(c.factura)}${c.fecha_factura ? " · " + fechaTxt(c.fecha_factura) : ""}<br>
        impoconsumo ${plata((c.todas_ic || c.lineas || []).reduce((t, x) => t + (Number(x.valor) || 0), 0))} · hoy en Siigo ${plata(c.total_siigo)}</small></span>
      <span class="pre">${plata(c.total_final)}<small>›</small></span></button>`).join("");
}
$("cpAjItems").addEventListener("click", e => {
  const b = e.target.closest("[data-aj]"); if(!b) return;
  ajSel = (ajustes || [])[Number(b.dataset.aj)];
  if(ajSel){ $("cpAjDetEstado").textContent = ""; pintarAjDet(); abrir("cpAjDet"); $("cpAjDetPanel").scrollTop = 0; }
});
function pintarAjDet(){
  const c = ajSel; if(!c) return;
  $("cpAjDetTitulo").textContent = c.doc + " · " + c.proveedor;
  const guia = c.guia || [];
  const conIc = guia.filter(x => x.ic > 0);
  const paso = (n, html) => `<div class="cp-paso"><b class="n">${n}.</b>${html}</div>`;
  let h = `<div class="bloque"><h3 style="margin-bottom:4px">${esc(c.doc)} <small>fac. ${esc(c.factura)}</small></h3>
    <p class="nota" style="margin:0">${esc(c.proveedor)}${c.nit ? " · NIT " + esc(c.nit) : ""}${c.fecha_factura ? " · " + fechaTxt(c.fecha_factura) : ""}${
      c.pdf ? ` · <a href="${esc(c.pdf)}" target="_blank" rel="noopener" style="color:var(--amarillo)">ver PDF</a>` : ""}</p>
    <div class="grilla" style="margin-top:10px">
      <div class="dato"><span>Hoy en Siigo</span><b>${plata(c.total_siigo)}</b><div class="sub">sin impoconsumo</div></div>
      <div class="dato"><span>Debe quedar en</span><b>${plata(c.total_final)}</b><div class="sub">total de la factura</div></div>
    </div></div>`;
  h += `<div class="bloque"><h3>Paso a paso en Siigo</h3>` +
    paso(1, ` Abre la compra <b>${esc(c.doc)}</b> en Siigo y toca <b>Editar</b>.`) +
    paso(2, ` <b>Borra todas las líneas</b> de productos.`) +
    paso(3, ` Marca <b>"Incluye otros Impuestos cargo"</b>.`) +
    paso(4, ` Vuelve a agregar las <b>${guia.length} línea${guia.length > 1 ? "s" : ""}</b> de abajo: producto, cantidad y <b>valor unitario</b>${
      guia.some(x => x.descuento) ? " (y el descuento donde lo indique)" : ""}. En cada una, botón de impuestos: <b>Impuesto cargo 1: IVA</b>
      y, en las marcadas con ⚖, <b>Impuesto cargo 2: Impoconsumo por valor</b> con el valor indicado y
      <b>"Impuesto como mayor valor de la compra"</b> marcado.`) +
    paso(5, ` En la forma de pago (${esc(c.pago || "la misma")}), cambia el valor a <b>${plata(c.total_final)}</b>.`) +
    paso(6, ` Revisa que el <b>Total Neto</b> dé <b>${plata(c.total_final)}</b> y toca <b>Guardar</b>. Esta misma edición hace que la compra mueva el stock.`) +
    paso(7, ` Vuelve aquí y toca <b>"Ya lo hice, revisar en Siigo"</b>.`) + `</div>`;
  h += `<div class="bloque"><h3>Líneas para digitar <small>en este orden</small></h3>` + guia.map((x, i) => `<div class="cp-lin">
      <b>${i + 1}. ${x.tipo === "Account" ? "Cuenta" : "Producto"} ${esc(x.codigo)}</b> · ${esc(x.nombre)}<br>
      Cant <b>${nfmt(x.cantidad)}</b> · Valor unitario <b>${nfmt(x.precio)}</b>${x.descuento ? ` · Descuento <b>${nfmt(x.descuento)}</b>` : ""}<br>
      Impuesto cargo 1: <b>${x.iva ? "IVA " + nfmt(x.iva) + "%" : "ninguno"}</b>` +
      (x.ic > 0 ? `<br><span style="color:#ffd23f">⚖ Impuesto cargo 2: <b>Impoconsumo por valor ${nfmt(x.ic)}</b> · ✔ mayor valor de la compra</span>` : "") +
    `</div>`).join("") + `</div>`;
  const faltan = (c.todas_ic || []).filter(x => !x.ok);
  if(c.revisado) h += `<div class="bloque"><h3>Última revisión</h3>` + ((c.todas_ic || []).map(x =>
      `<div class="fila-dato"><span>${x.ok ? "✅" : "❌"} ${esc(x.nombre || x.codigo)}: impoconsumo ${nfmt(x.valor)}</span></div>`).join("")) +
    `<div class="fila-dato"><span>${Math.abs((c.total_siigo || 0) - (c.total_final || 0)) <= 100 ? "✅" : "❌"} Total en Siigo ${plata(c.total_siigo)} (debe ser ${plata(c.total_final)})</span></div>` +
    (faltan.length ? "" : `<p class="nota" style="margin:6px 0 0">Los impuestos ya están; falta que el total cuadre.</p>`) + `</div>`;
  $("cpAjDetPanel").innerHTML = h;
}
$("btnCpAjRevisar").addEventListener("click", async () => {
  const c = ajSel; if(!c) return;
  const msg = $("cpAjDetEstado");
  msg.style.color = ""; msg.textContent = "Revisando en Siigo…";
  $("cpAjDetPanel").style.opacity = ".5";
  try{
    const d = await postAdmin({accion: "compras_impoconsumo"});
    ajustes = d.pendientes || []; guardarAjustes(); pintarBotonAjustes(); pintarAjustes();
    const sigue = ajustes.find(x => String(x.id) === String(c.id));
    if(!sigue){
      msg.textContent = "";
      alert(`✅ ${c.doc} quedó con el impoconsumo y el total de la factura (${plata(c.total_final)}).\n\n` +
        `Revisa en Siigo que "Impuesto como mayor valor de la compra" quedó marcado: eso no se puede ver desde la app.`);
      abrirAjustes();
      return;
    }
    ajSel = Object.assign(sigue, {revisado: true});
    msg.style.color = "#ff9a86";
    msg.textContent = "Todavía falta: mira la última revisión abajo.";
    pintarAjDet();
    $("cpAjDetPanel").scrollTop = $("cpAjDetPanel").scrollHeight;
  }catch(e){ msg.style.color = "#ff9a86"; msg.textContent = e.message; }
  finally{ $("cpAjDetPanel").style.opacity = ""; }
});
$("btnCpAjustes").addEventListener("click", abrirAjustes);
$("btnCpAjActualizar").addEventListener("click", () => cargarAjustes(false));
$("btnCpAjVolver").addEventListener("click", () => irMenu("cpMenuFact"));
$("btnCpAjDetVolver").addEventListener("click", () => abrir("cpAjustes"));
pintarBotonAjustes();

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
  ds = null; irMenu("cpMenuFact");
});
$("btnCpDs").addEventListener("click", abrirDs);

/* ══════════════ VER TODAS LAS FACTURAS ══════════════ */
let historial = null, vistaTodas = "aprobar", cargandoHist = false, pagos = null, cargandoPagos = false, estadoPago = "";
try{ pagos = JSON.parse(localStorage.getItem("cp_pagos") || "null"); }catch(e){ pagos = null; }
const COLOR_PAGO = {"PAGADA": "#4fd6a8", "PAGADA DE CONTADO": "#4fd6a8", "PAGADA SIN RECIBO": "#8fc9ff", "PENDIENTE": "#ffd23f", "VENCIDA": "#ff9a86", "PAGO PARCIAL": "#ff9a86", "FALTA RECIBO EN SIIGO": "#ff9a86"};
async function cargarPagos(){
  if(cargandoPagos) return;
  cargandoPagos = true;
  const msg = $("cpTodasEstado"), t0 = Date.now();
  msg.style.color = "";
  const reloj = setInterval(() => { msg.textContent = "Comparando compras y recibos de pago en Siigo… " + Math.round((Date.now() - t0) / 1000) + "s"; }, 1000);
  try{
    pagos = await postAdmin({accion: "compras_pagos"});
    try{ localStorage.setItem("cp_pagos", JSON.stringify(pagos)); }catch(e){}
    msg.textContent = "";
  }catch(e){ msg.style.color = "#ff9a86"; msg.textContent = (pagos ? "Mostrando la última copia · " : "") + e.message; }
  finally{ clearInterval(reloj); cargandoPagos = false; pintarTodas(); }
}
try{ historial = JSON.parse(localStorage.getItem("cp_historial") || "null"); }catch(e){ historial = null; }
async function abrirTodas(){
  abrir("cpTodas");
  pintarTodas();
  if(!cola) cargarCola(false).then(pintarTodas);
  await cargarHistorial();
}
async function cargarHistorial(){
  if(cargandoHist) return;
  cargandoHist = true;
  $("cpTodasEstado").style.color = ""; $("cpTodasEstado").textContent = "Cargando…";
  try{
    historial = await postAdmin({accion: "compras_historial"});
    try{ localStorage.setItem("cp_historial", JSON.stringify(historial)); }catch(e){}
    $("cpTodasEstado").textContent = "";
  }catch(e){
    $("cpTodasEstado").style.color = "#ff9a86";
    $("cpTodasEstado").textContent = (historial ? "Mostrando la última copia · " : "") + e.message;
  }finally{ cargandoHist = false; pintarTodas(); }
}
function pintarTodas(){
  const H = historial || {}, porAprobar = (cola && cola.facturas) || [];
  const grupos = {
    aprobar: ["Por aprobar", porAprobar.map(f => ({fecha: f.fecha, numero: f.numero, proveedor: f.proveedor, nit: f.nit,
               total: f.totales.xml, sub: f.lista ? "✓ lista" : "con pendientes", id: f.id}))],
    siigo: ["En Siigo", (H.en_siigo || []).map(f => ({fecha: f.fecha, numero: f.numero, proveedor: f.proveedor, nit: f.nit,
               total: f.total, sub: f.doc, url: f.pdf}))],
    subidas: ["Subidas desde la app", (H.subidas || []).map(f => ({fecha: String(f.fecha).slice(0, 10), numero: f.numero, proveedor: f.proveedor,
               nit: f.nit, total: f.total, sub: [f.tipo === "DS" ? "Documento soporte" : "Factura", f.doc, f.quien,
               /^CUADRA|SIN ENVIAR|ENVIADO/.test(f.conciliacion) ? f.conciliacion.toLowerCase() : "⚠ " + f.conciliacion].filter(Boolean).join(" · "),
               url: f.soporte}))],
    pagos: ["Pagos", ((pagos && pagos.filas) || []).filter(f => !estadoPago || f.estado === estadoPago).map(f => ({fecha: f.fecha,
               numero: f.factura + " · " + f.doc, proveedor: f.proveedor, nit: f.nit, total: f.total, pago: f,
               sub: `<b style="color:${COLOR_PAGO[f.estado] || "inherit"}">${esc(f.estado)}</b>` +
                 (f.saldo > 0.5 ? " · saldo " + plata(f.saldo) : "") + (f.saldo > 0.5 && f.vence ? " · vence " + esc(dmy(f.vence)) : "") +
                 (f.recibos ? " · " + esc(f.recibos) : "")}))],
    gastos: ["Gastos", (H.ignoradas || []).filter(f => /^gasto/i.test(f.motivo || "")).map(f => ({fecha: f.fecha, numero: f.numero,
               proveedor: f.proveedor, nit: f.nit, total: f.total, sub: "🧾 Gasto" + (f.quien ? " · " + f.quien : ""), ignorada: true}))],
    ignoradas: ["Ignoradas", (H.ignoradas || []).filter(f => !/^gasto/i.test(f.motivo || "")).map(f => ({fecha: f.fecha, numero: f.numero,
               proveedor: f.proveedor, nit: f.nit, total: f.total, sub: "Motivo: " + (f.motivo || "") + (f.quien ? " · " + f.quien : ""), ignorada: true}))]
  };
  $("cpTodasChips").innerHTML = Object.keys(grupos).map(k =>
    `<button class="chip" data-vt="${k}" aria-pressed="${vistaTodas === k}" style="text-transform:none">${grupos[k][0]} · ${grupos[k][1].length}</button>`).join("");
  const q = normal($("cpTodasBuscar").value.trim());
  const base = grupos[vistaTodas][1].filter(f => !q || normal(f.proveedor + " " + f.numero + " " + f.nit).includes(q));
  const valorT = f => Number(f.total) || 0;
  pintarFiltros("cpTodasFiltros", base, fx.todas);
  const lista = aplicarFiltros(base, fx.todas, valorT);
  $("cpTodasItems").innerHTML = lista.length ? htmlAgrupado(lista, fx.todas, valorT, (f, i) => `<button class="item" data-ti="${i}">
      <span class="cod">${esc(dmy(f.fecha).slice(0, 5))}</span>
      <span class="nom">${esc(f.proveedor || "Proveedor")}<small>${esc(f.numero)} · ${f.pago ? f.sub : esc(f.sub || "")}</small></span>
      <span class="pre">${plata(f.total)}<small>›</small></span></button>`)
    : `<div class="vacio">${historial || vistaTodas === "aprobar" ? (base.length ? "Ninguna factura con ese mes o proveedor." : "Nada por aquí.") : "Cargando…"}</div>`;
  $("cpTodasItems").dataset.vista = vistaTodas;
  pintarTodas.lista = lista;
  // Pagos: resumen por estado (toca uno para filtrar) y carga la primera vez
  if(vistaTodas === "pagos"){
    if(!pagos && !cargandoPagos) cargarPagos();
    if(pagos && !cargandoPagos){
      const c = pagos.conteo || {};
      $("cpTodasEstado").innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center">` +
        [["", "Todas"], ...Object.keys(COLOR_PAGO).map(k => [k, k.charAt(0) + k.slice(1).toLowerCase()])].filter(([k]) => !k || c[k])
          .map(([k, t]) => `<button class="chip" data-est="${esc(k)}" aria-pressed="${estadoPago === k}" style="text-transform:none">${esc(t)}${k ? " · " + c[k] : ""}</button>`).join("") +
        `</div><span style="opacity:.7">Compras desde ${esc(dmy(pagos.desde))} · revisado ${esc(pagos.generado || "")}</span>`;
    }
  }else if(!cargandoHist && !/Cargando|Mostrando/.test($("cpTodasEstado").textContent)) $("cpTodasEstado").textContent = "";
}
$("cpTodasChips").addEventListener("click", e => {
  const b = e.target.closest("[data-vt]"); if(!b) return;
  vistaTodas = b.dataset.vt; pintarTodas(); $("cpTodasItems").scrollTop = 0;
});
$("cpTodasBuscar").addEventListener("input", pintarTodas);
$("cpTodasEstado").addEventListener("click", e => {
  const b = e.target.closest("[data-est]"); if(!b) return;
  estadoPago = b.dataset.est; pintarTodas();
});
escucharFiltros("cpTodasFiltros", fx.todas, pintarTodas);
$("cpTodasItems").addEventListener("click", async e => {
  const b = e.target.closest("[data-ti]"); if(!b) return;
  const f = (pintarTodas.lista || [])[Number(b.dataset.ti)]; if(!f) return;
  if(f.id){ sel = cola.facturas.find(x => x.id === f.id); if(sel) abrirDetalle(); return; }
  if(f.pago){
    const p = f.pago;
    if(p.saldo <= 0.5) return alert(`${p.proveedor} · ${p.doc}\n${p.estado}${p.recibos ? "\nRecibos: " + p.recibos : ""}`);
    const crear = async (idPago, nombre) => {
      if(!confirm(`¿Crear en Siigo el recibo de pago de ${p.doc} (${p.proveedor}) por ${plata(p.saldo)}, ${nombre}?`)) return;
      $("cpTodasEstado").textContent = "Creando recibo de pago…";
      try{
        const d = await postAdmin({accion: "compra_recibo", id: p.id, pago: idPago, fecha: hoyISO()});
        alert(`✅ Recibo ${d.recibo} por ${plata(d.valor)}. La factura queda pagada en Siigo y en Proveedores.`);
        cargarPagos();
      }catch(err){ $("cpTodasEstado").textContent = ""; alert("No se pudo: " + err.message); }
    };
    const ops = ((cola && cola.pagos) || []).filter(x => x.rp).map(x => ({t: "💵 Crear recibo de pago · " + x.nombre.replace("Contado · ", ""),
      sub: "Salda " + plata(p.saldo) + " en Siigo", fn: () => crear(x.rp, x.nombre.replace("Contado · ", ""))}));
    elegir(`${p.proveedor} · ${p.doc} · ${p.estado}`, ops.length ? ops : [{t: "Actualiza Por aprobar (↻) para cargar las formas de pago", fn: () => {}}]);
    return;
  }
  if(f.ignorada){
    elegir(f.proveedor + " · " + f.numero, [{t: "↩ Volver a Facturas por aprobar", sub: "Deja de estar ignorada", fn: async () => {
      try{
        const d = await postAdmin({accion: "compra_reactivar", nit: f.nit, numero: f.numero});
        historial.ignoradas = historial.ignoradas.filter(x => !(x.nit === f.nit && x.numero === f.numero));
        pintarTodas();
        alert(d.mensaje);
      }catch(err){ alert("No se pudo: " + err.message); }
    }}]);
    return;
  }
  if(f.url) window.open(f.url, "_blank");
  else alert(f.proveedor + "\n" + f.numero + "\n" + (f.sub || ""));
});
$("btnCpTodasActualizar").addEventListener("click", () => {
  if(vistaTodas === "pagos") return cargarPagos();
  cargarHistorial(); cargarCola(false).then(pintarTodas);
});
$("btnCpTodasVolver").addEventListener("click", () => irMenu("cpMenuFact"));
$("btnCpTodas").addEventListener("click", abrirTodas);

/* ══════════════ ORDENAR PROVEEDORES ══════════════ */
const ORDEN_PROV = [["nombre", "↕ Nombre A-Z"], ["debo", "↕ Lo que más les debo"], ["reciente", "↕ Compra más reciente"],
                    ["comprado", "↕ Lo que más les compro"], ["productos", "↕ Más productos"]];
let ordenProv = (function(){ try{ return localStorage.getItem("orden_prov") || "nombre"; }catch(e){ return "nombre"; } })();
(function(){
  const sel = document.createElement("select");
  sel.className = "sel-hora"; sel.id = "provOrden"; sel.style.flex = "none";
  sel.innerHTML = ORDEN_PROV.map(([v, t]) => `<option value="${v}"${v === ordenProv ? " selected" : ""}>${t}</option>`).join("");
  $("provChips").insertAdjacentElement("afterend", sel);
  sel.addEventListener("change", () => { ordenProv = sel.value; try{ localStorage.setItem("orden_prov", ordenProv); }catch(e){} pintarProveedores(); });
  const pintarProvApp = window.pintarProveedores;
  window.pintarProveedores = function(){
    const fecha = p => /^\d{4}-\d{2}-\d{2}$/.test(String(p.ultima_compra || "")) ? p.ultima_compra : "";
    const nom = (a, b) => String(a.nombre || "").localeCompare(String(b.nombre || ""), "es");
    const f = {
      nombre: nom,
      debo: (a, b) => (Number(b.pendiente) || 0) - (Number(a.pendiente) || 0) || nom(a, b),
      reciente: (a, b) => fecha(b).localeCompare(fecha(a)) || nom(a, b),
      comprado: (a, b) => (Number(b.total_comprado) || 0) - (Number(a.total_comprado) || 0) || nom(a, b),
      productos: (a, b) => (Number(b.productos) || 0) - (Number(a.productos) || 0) || nom(a, b)
    }[ordenProv] || nom;
    try{ provs.sort(f); }catch(e){}
    return pintarProvApp.apply(this, arguments);
  };
})();

/* ══════════════ ALERTAS DE PAGOS EN KPIs ══════════════ */
function abrirPagosFiltrado(estado){
  vistaTodas = "pagos"; estadoPago = estado || "";
  abrirTodas();
}
const pintarKpisApp = window.pintarKpis;
window.pintarKpis = function(){
  pintarKpisApp.apply(this, arguments);
  try{
    const pg = ((kpis || {}).alertas_compras || {}).pagos;
    const bloque = [...$("kpiPanel").querySelectorAll(".bloque")].find(b => /^Alertas/.test((b.querySelector("h3") || {}).textContent || ""));
    if(!bloque) return;
    const cont = bloque.querySelector("div");
    const fila = x => `<div class="fila-dato"><span>${esc(x.proveedor || "")}<small style="display:block;opacity:.65">${esc(x.doc)} · ${esc(x.factura || "")}${
      x.vence ? " · vence " + esc(dmy(x.vence)) : ""}</small></span><b>${plata(x.saldo)}</b></div>`;
    const det = (titulo, n, valor, clase, lista, estado, nota) => `<details class="alerta"><summary><span>${titulo}</span>
      <span class="num-alerta ${n ? clase : "cero"}">${n}</span></summary>
      <p class="nota" style="margin:0 0 6px">${nota}${n ? " · total " + plata(valor) : ""}</p>${(lista || []).map(fila).join("")}
      ${n ? `<button class="sec chico" data-ir-pagos="${estado}" style="margin-top:8px">Ver en Facturas → Pagos</button>` : ""}</details>`;
    const nota = pg ? `Revisado ${esc(pg.generado || "")}. ` : "Sin datos todavía: se revisa cada madrugada o al abrir Facturas → Ver todas → Pagos. ";
    const p = pg || {};
    const h = det("Facturas marcadas pagadas sin recibo en Siigo", p.n_falta_recibo || 0, p.valor_falta_recibo, "", p.falta_recibo,
        "FALTA RECIBO EN SIIGO", nota + "En la app están pagadas pero en Siigo siguen con saldo. Crea el recibo de pago desde Pagos.") +
      det("Facturas vencidas sin pagar", p.n_vencidas || 0, p.valor_vencidas, "", p.vencidas, "VENCIDA",
        nota + "A crédito, ya pasó su vencimiento y no tienen recibo de pago.") +
      det("Pagos parciales", p.n_parciales || 0, p.valor_parciales, "amarillo", p.parciales, "PAGO PARCIAL",
        nota + "Tienen recibo de pago pero aún queda saldo.");
    const g = ((kpis || {}).alertas_compras || {}).guardar;
    const hg = g && g.n ? `<details class="alerta"><summary><span>Compras subidas que no han movido el stock</span>
      <span class="num-alerta amarillo">${g.n}</span></summary><p class="nota" style="margin:0 0 6px">Ábrelas en Siigo → Editar → Guardar.</p>` +
      (g.lista || []).map(c => `<div class="fila-dato"><span>${esc(c.doc)}<small style="display:block;opacity:.65">${esc(c.proveedor)} · fac. ${esc(c.factura)}</small></span></div>`).join("") +
      `</details>` : "";
    /* Compras sin el impoconsumo agregado en Siigo, con los valores a poner */
    const ic = ((kpis || {}).alertas_compras || {}).impoconsumo;
    const hic = ic && ic.n ? `<details class="alerta"><summary><span>Facturas pendientes por ajuste de impuestos</span>
      <span class="num-alerta">${ic.n}</span></summary><p class="nota" style="margin:0 0 6px">Falta agregar el impoconsumo en Siigo.</p>` +
      (ic.lista || []).map(c => `<div class="fila-dato"><span>${esc(c.doc)}<small style="display:block;opacity:.65">${esc(c.proveedor)} · fac. ${esc(c.factura)}</small></span>
        <b>${plata(c.total_final)}</b></div>`).join("") +
      `<button class="sec chico" data-ir-ajustes="1" style="margin-top:8px">Ver el paso a paso</button></details>` : "";
    if(cont) cont.insertAdjacentHTML("afterbegin", hic + hg + h);
  }catch(e){ console.warn("Alertas de pagos:", e); }
};
$("kpiPanel").addEventListener("click", e => {
  if(e.target.closest("[data-ir-ajustes]")){ abrirAjustes(); return; }
  const b = e.target.closest("[data-ir-pagos]"); if(!b) return;
  abrirPagosFiltrado(b.dataset.irPagos);
});
})();
