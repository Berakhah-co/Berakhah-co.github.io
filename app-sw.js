// App instalable de berakhahmedellin.shop («Instalar app» / «Agregar a pantalla de inicio»).
// La tienda carga dentro del marco desde el servidor, así que aquí no se guarda nada de la tienda: solo se muestra
// una pantalla amable cuando el celular no tiene internet. Se publica en el sitio con tools/sitio/generar_paginas_seo.py.
const SIN_CONEXION = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>Berakhah · sin conexión</title></head>
<body style="margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;
background:#0c0b0a;color:#d4af37;font-family:Georgia,serif;text-align:center;padding:24px">
<div style="font-size:26px;letter-spacing:4px">BERAKHAH</div>
<div style="color:#cfc6b2;font-family:system-ui,sans-serif;font-size:15px;line-height:1.5">No hay conexión a internet.<br>Revisa tus datos o el wifi e inténtalo de nuevo.</div>
<button onclick="location.reload()" style="margin-top:6px;background:#d4af37;color:#111;border:0;border-radius:999px;padding:11px 22px;font-size:15px;font-weight:700">Reintentar</button>
</body></html>`;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  // Solo las páginas del propio sitio; todo lo demás pasa directo, como si no hubiera service worker
  if (e.request.mode !== 'navigate' || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(fetch(e.request).catch(() => new Response(SIN_CONEXION, {
    status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' }
  })));
});
