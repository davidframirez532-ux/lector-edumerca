# Lector Edumerca — la app

App web instalable (PWA) de **Minimercado Edumerca**, publicada con GitHub Pages desde `main` (este repo es
**público** por eso). Hablar con el usuario en **español**, sin jerga.

- `index.html`: casi toda la app (lector de precios, conteo, proveedores, abastos, KPIs, desarmes…).
- `compras.js`: facturas por aprobar y documento soporte (se carga después de `index.html` y usa sus funciones).
- `sw.js`: service worker. Subir `CACHE` cuando cambie algo para que los celulares bajen la versión nueva.

El servidor es Google Apps Script y su código está en el repo **privado** `davidframirez532-ux/apps-script-edumerca`
(con su propio `CLAUDE.md`: cómo publicar, reglas del PIN, dónde están las claves). El usuario solo puede elegir un
repo al crear el chat: si la tarea toca el servidor (Siigo, cálculos, datos que manda Apps Script), conecta
`apps-script-edumerca` a la sesión tú mismo (herramienta para agregar repos) y lee su `CLAUDE.md`.

## Reglas

- **Nada secreto en este repo** (es público): ni claves, ni PIN, ni código del servidor.
- **PIN**: el servidor lo exige en todo. La app lo pide al entrar, lo guarda y lo manda sola: `postApp` y `postAdmin`
  lo agregan al cuerpo, `pinUrl()` a las consultas GET. Toda llamada nueva al servidor debe usar esas funciones.
- **No cambiar `VERSION`** sin avisar: `esAdmin()` la compara y cambiarla obliga a todos a ingresar el PIN de nuevo.
- **Numeración de `VERSION`**: cada cambio publicado sube el último número de 5 en 5 (`v2.4.05`, `v2.4.10`, … `v2.4.95`);
  al llegar a 100 pasa a `v2.5.00`, luego `v2.5.05`, y así. Va con la fecha del día (`v2.4.05 · 9-nov-2026`).
- Si el servidor va a exigir algo nuevo, **publicar primero la app** (compatible con el servidor viejo) y después el
  servidor.
- En **Ajustes** se ve "App vX · Servidor vNNN": así el usuario confirma qué versión responde.
- Probar con Playwright interceptando `https://script.google.com/**` (la red de la sesión no llega al servidor real).
