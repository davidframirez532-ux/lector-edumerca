/* asistencia.js — Botón 🎧 de asistencia (arriba, al lado de la 🔔): Llamar o Escribir por WhatsApp.
   Es TEMPORAL. Para quitarlo: borrar este archivo y sacar "asistencia.js" de la lista que lo carga al final de index.html.
   Se carga después de compras.js (usa elegir y abrirWa de index.html). */
(function(){
"use strict";
const TEL = "3508124095", WA = "573508124095";
const st = document.createElement("style");
st.textContent = `.asistencia{position:fixed;top:calc(env(safe-area-inset-top,0px) + 6px);right:12px;z-index:6;background:transparent;
  border:0;font-size:22px;line-height:26px;padding:6px 8px;cursor:pointer}`;
document.head.appendChild(st);
const b = document.createElement("button");
b.className = "asistencia"; b.id = "asistencia"; b.setAttribute("aria-label", "Asistencia"); b.textContent = "🎧";
document.body.appendChild(b);
b.addEventListener("click", () => elegir("🎧 Asistencia", [
  {t: "📞 Llamar", sub: TEL.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3"), fn: () => { location.href = "tel:+57" + TEL; }},
  {t: "💬 Escribir por WhatsApp", sub: "Abre el chat de WhatsApp", fn: () => abrirWa(WA, "Hola, necesito ayuda con la app Edumerca")}]));
/* Se pone a la izquierda de la 🔔 (que solo sale en modo administración) y corre el aviso de "estado" para que no se tapen */
function ubicar(){
  const c = document.getElementById("campana"), e = document.getElementById("estado");
  const conCampana = c && c.style.display !== "none";
  b.style.right = conCampana ? "52px" : "12px";
  if(e) e.style.setProperty("right", conCampana ? "102px" : "62px", "important");
}
ubicar(); setInterval(ubicar, 1000);
})();
