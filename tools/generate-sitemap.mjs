import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist/restaurante-frontend/browser');
const out = path.join(distDir, 'sitemap.xml');

// Rutas públicas prerenderadas por ahora
const routes = ['/', '/home', '/menu', '/ubicacion', '/login', '/registro-cliente', '/not-found'];

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  routes
    .map(
      (r) => `  <url><loc>${r}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
    )
    .join('\n') +
  `\n</urlset>\n`;

fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(out, xml, 'utf8');
console.log('Sitemap generado en', out);
