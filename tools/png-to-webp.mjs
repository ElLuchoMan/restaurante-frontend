// Convierte PNG a WebP manteniendo transparencia
// Uso: node tools/png-to-webp.mjs src/assets/img/logo2.png
import fs from 'node:fs';
import path from 'node:path';

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('Falta sharp. Instala con: npm i -D sharp');
  process.exit(1);
}

const input = process.argv[2];
if (!input) {
  console.error('Uso: node tools/png-to-webp.mjs <ruta.png>');
  process.exit(1);
}
const inPath = path.resolve(process.cwd(), input);
if (!fs.existsSync(inPath)) {
  console.error('No existe:', inPath);
  process.exit(1);
}
const outPath = inPath.replace(/\.png$/i, '.webp');

await sharp(inPath).webp({ quality: 85 }).toFile(outPath);
console.log('Generado:', outPath);
