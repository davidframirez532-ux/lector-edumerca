# Lector Edumerca — la app

App web instalable (PWA) de **Minimercado Edumerca**, publicada con GitHub Pages desde `main` (este repo es
**público** por eso). Hablar con el usuario en **español**, sin jerga.

- `index.html`: casi toda la app (lector de precios, conteo, proveedores, abastos, KPIs, desarmes…).
- `compras.js`: facturas por aprobar y documento soporte (se carga después de `index.html` y usa sus funciones).
- `sw.js`: service worker. Subir `CACHE` cuando cambie algo para que los celulares bajen la versión nueva.

El servidor es Google Apps Script y su código está en el repo **privado** `davidframirez532-ux/apps-script-edumerca`
(con su propio `CLAUDE.md`: cómo publicar, reglas del PIN, dónde están las claves). Para cambios que tocan los dos,
abrir la sesión con ambos repos.

## Reglas

- **Nada secreto en este repo** (es público): ni claves, ni PIN, ni código del servidor.
- **PIN**: el servidor lo exige en todo. La app lo pide al entrar, lo guarda y lo manda sola: `postApp` y `postAdmin`
  lo agregan al cuerpo, `pinUrl()` a las consultas GET. Toda llamada nueva al servidor debe usar esas funciones.
- **No cambiar `VERSION`** sin avisar: `esAdmin()` la compara y cambiarla obliga a todos a ingresar el PIN de nuevo.
- Si el servidor va a exigir algo nuevo, **publicar primero la app** (compatible con el servidor viejo) y después el
  servidor.
- En **Ajustes** se ve "App vX · Servidor vNNN": así el usuario confirma qué versión responde.
- Probar con Playwright interceptando `https://script.google.com/**` (la red de la sesión no llega al servidor real).
