import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist/restaurante-frontend/browser');
const out = path.join(distDir, 'sitemap.xml');

// Intenta cargar rutas prerenderadas generadas por Angular (si existen)
function loadRoutes() {
  try {
    const prerenderFile = path.resolve('dist/restaurante-frontend/prerendered-routes.json');
    if (fs.existsSync(prerenderFile)) {
      const data = JSON.parse(fs.readFileSync(prerenderFile, 'utf8'));
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch {}
  // Fallback: rutas públicas principales
  return [
    '/',
    '/home',
    '/menu',
    '/ubicacion',
    '/login',
    '/registro-cliente',
    '/offline',
    '/not-found',
  ];
}

const routes = Array.from(
  new Set(
    loadRoutes()
      .filter((r) => typeof r === 'string' && r.trim())
      .map((r) => r.replace(/index\.html$/i, ''))
      .map((r) => (r.startsWith('/') ? r : `/${r}`)),
  ),
);

// Base URL desde variables de Netlify o fallback relativo
const base = process.env.URL || process.env.DEPLOY_PRIME_URL || '';
const withBase = (r) => (base ? `${base.replace(/\/$/, '')}${r}` : r);

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  routes
    .map(
      (r) =>
        `  <url><loc>${withBase(r)}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
    )
    .join('\n') +
  `\n</urlset>\n`;

fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(out, xml, 'utf8');
console.log('Sitemap generado en', out);
