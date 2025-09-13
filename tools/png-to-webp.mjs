// Conversión PNG/JPG -> WebP y AVIF (lote o archivo)
// Uso:
//  - 1 archivo: node tools/png-to-webp.mjs src/assets/img/logo2.png
//  - directorio: node tools/png-to-webp.mjs src/assets/img
import fs from 'node:fs';
import path from 'node:path';

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('Falta sharp. Instala con: npm i -D sharp');
  process.exit(1);
}

async function convertOne(inPath) {
  const { ext, dir, name } = path.parse(inPath);
  const lower = ext.toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(lower)) return;
  const outWebp = path.join(dir, `${name}.webp`);
  const outAvif = path.join(dir, `${name}.avif`);
  try {
    await sharp(inPath).webp({ quality: 80 }).toFile(outWebp);
    console.log('WebP:', outWebp);
  } catch (e) {
    console.error('Error WebP:', inPath, e);
  }
  try {
    await sharp(inPath).avif({ quality: 50 }).toFile(outAvif);
    console.log('AVIF:', outAvif);
  } catch (e) {
    console.error('Error AVIF:', inPath, e);
  }
}

async function convertDir(dir) {
  const items = fs.readdirSync(dir);
  for (const f of items) {
    const full = path.join(dir, f);
    const st = fs.statSync(full);
    if (st.isFile()) {
      await convertOne(full);
    }
  }
}

const input = process.argv[2];
if (!input) {
  console.error('Uso: node tools/png-to-webp.mjs <ruta-archivo-o-directorio>');
  process.exit(1);
}
const target = path.resolve(process.cwd(), input);
if (!fs.existsSync(target)) {
  console.error('No existe:', target);
  process.exit(1);
}
const stat = fs.statSync(target);
if (stat.isDirectory()) {
  await convertDir(target);
} else {
  await convertOne(target);
}
console.log('Conversión completada.');
