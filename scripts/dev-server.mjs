/**
 * MysticDo zero-dependency dev server (Node built-ins only)
 *
 * Why: the site is pure static (no build step, no dependencies).
 * `npm run dev` runs this file — nothing to install, ever.
 *
 * Usage: node scripts/dev-server.mjs   (or: npm run dev)
 * Env:   PORT (default 8765), HOST (default 127.0.0.1)
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, resolve, sep } from 'node:path';

const ROOT = resolve(process.argv[2] || process.cwd());
const PORT = Number(process.env.PORT || 8765);
const HOST = process.env.HOST || '127.0.0.1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.md': 'text/markdown; charset=utf-8',
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let filePath = resolve(join(ROOT, decodeURIComponent(url.pathname)));

    // path traversal guard
    if (filePath !== ROOT && !filePath.startsWith(ROOT + sep)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' }).end('Forbidden');
      return;
    }

    let st = await stat(filePath).catch(() => null);
    if (st && st.isDirectory()) {
      filePath = join(filePath, 'index.html');
      st = await stat(filePath).catch(() => null);
    }

    if (!st) {
      const body = await readFile(join(ROOT, '404.html')).catch(() => '404 Not Found');
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end(body);
      return;
    }

    const type = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(await readFile(filePath));
  } catch (err) {
    console.error('[mysticdo] request error:', err.message);
    res.writeHead(500, { 'Content-Type': 'text/plain' }).end('Internal error');
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[mysticdo] Port ${PORT} is already in use — the site is probably already running at http://localhost:${PORT}`);
    process.exit(2);
  }
  throw err;
});

server.listen(PORT, HOST, () => {
  console.log(`[mysticdo] serving ${ROOT}`);
  console.log(`[mysticdo] http://localhost:${PORT}`);
});
