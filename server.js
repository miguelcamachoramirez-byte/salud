// Servidor estático simple para servir las presentaciones
const http = require('http');
const fs   = require('fs');
const path = require('path');

// URL pública del túnel (se puede pasar como variable de entorno TUNNEL_URL)
const TUNNEL_URL = process.env.TUNNEL_URL || '';

const PORT = 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
};

const server = http.createServer((req, res) => {
  // Ruta solicitada
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(ROOT, urlPath);

  // Si es directorio, buscar index.html
  const target = fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()
    ? path.join(filePath, 'index.html')
    : filePath;

  fs.readFile(target, (err, data) => {
    if (err) {
      // Listar presentaciones disponibles
      if (urlPath === '/index.html' || urlPath === '/') {
        const pDir = path.join(ROOT, 'presentaciones');
        let lista = '';
        if (fs.existsSync(pDir)) {
          const items = fs.readdirSync(pDir).filter(d =>
            fs.statSync(path.join(pDir, d)).isDirectory()
          );
          lista = items.map(d =>
            `<li><a href="/presentaciones/${d}/">${d.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</a></li>`
          ).join('');
        }
        const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Presentaciones SST</title>
<style>
  body{font-family:'Segoe UI',sans-serif;background:#0f0f1a;color:#e2e8f0;
       display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
  .box{max-width:480px;width:100%;padding:40px;background:rgba(255,255,255,.05);
       border:1px solid rgba(255,255,255,.1);border-radius:20px}
  h1{font-size:1.6rem;margin-bottom:8px}
  p{color:#94a3b8;font-size:.9rem;margin-bottom:28px}
  ul{list-style:none;padding:0;display:flex;flex-direction:column;gap:12px}
  a{display:block;padding:14px 20px;background:rgba(167,139,250,.1);
    border:1px solid rgba(167,139,250,.25);border-radius:12px;color:#a78bfa;
    text-decoration:none;font-weight:600;transition:background .2s}
  a:hover{background:rgba(167,139,250,.2)}
</style></head><body>
<div class="box">
  <h1>📊 Presentaciones SST</h1>
  <p>Selecciona una presentación para abrirla</p>
  <ul>${lista || '<li style="color:#94a3b8">No hay presentaciones aún</li>'}</ul>
</div></body></html>`;
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 - No encontrado');
      }
      return;
    }

    const ext  = path.extname(target).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n✅  Servidor corriendo en http://localhost:${PORT}`);
  console.log(`\n📊  Presentaciones disponibles:`);
  const pDir = path.join(ROOT, 'presentaciones');
  if (fs.existsSync(pDir)) {
    fs.readdirSync(pDir).forEach(d => {
      console.log(`    → http://localhost:${PORT}/presentaciones/${d}/`);
    });
  }
  console.log(`\n🌐  Para tunelizar con ngrok:`);
  console.log(`    npx ngrok http ${PORT}\n`);
});
