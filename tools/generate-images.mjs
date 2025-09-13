// Genera variantes responsivas para imágenes del carrusel
// Requisitos: sharp
// Uso: npm run images:generate

import fs from 'node:fs';
import path from 'node:path';

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (e) {
  console.error('\n[images:generate] Falta dependencia opcional: sharp');
  console.error('Instala con: npm i -D sharp\n');
  process.exit(1);
}

const root = path.resolve(process.cwd(), 'src/assets/img');
const inputs = ['carousel-1.webp', 'carousel-2.webp', 'carousel-3.webp'];
const targets = [
  { suffix: '768', width: 768 },
  { suffix: '1200', width: 1200 },
  { suffix: '1600', width: 1600 },
];

async function ensureWebpVariants(file) {
  const inputPath = path.join(root, file);
  if (!fs.existsSync(inputPath)) {
    console.warn(`[images:generate] No existe ${inputPath}, saltando.`);
    return;
  }
  const base = file.replace(/\.webp$/i, '');
  const buf = fs.readFileSync(inputPath);
  await Promise.all(
    targets.map(async ({ suffix, width }) => {
      const out = path.join(root, `${base}-${suffix}.webp`);
      if (fs.existsSync(out)) return;
      const image = sharp(buf, { limitInputPixels: false });
      const meta = await image.metadata();
      const targetWidth = Math.min(width, meta.width ?? width);
      await image
        .resize({ width: targetWidth, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(out);
      console.log(`[images:generate] ✔ ${path.basename(out)} (${targetWidth}px)`);
    }),
  );
}

for (const f of inputs) {
  // eslint-disable-next-line no-await-in-loop
  await ensureWebpVariants(f);
}

console.log('\n[images:generate] Hecho.');
