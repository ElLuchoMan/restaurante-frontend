#!/usr/bin/env node
/**
 * Smoke tests para verificar que el build está funcionando correctamente
 */

import { existsSync, statSync } from 'fs';
import { glob } from 'glob';

console.log('🚀 Ejecutando smoke tests...\n');

const distPath = 'dist/restaurante-frontend/browser';
let passed = 0;
let failed = 0;

function test(description, condition) {
  if (condition) {
    console.log(`✅ ${description}`);
    passed++;
  } else {
    console.log(`❌ ${description}`);
    failed++;
  }
}

// 1. Verificar archivos críticos
test('index.html existe', existsSync(`${distPath}/index.html`));
test('sitemap.xml existe', existsSync(`${distPath}/sitemap.xml`));
test('manifest.webmanifest existe', existsSync(`${distPath}/manifest.webmanifest`));

// 2. Verificar bundles JavaScript
const mainFiles = glob.sync(`${distPath}/main-*.js`);
test('Bundle principal (main-*.js) existe', mainFiles.length > 0);

const styleFiles = glob.sync(`${distPath}/styles-*.css`);
test('Estilos principales (styles-*.css) existen', styleFiles.length > 0);

// 3. Verificar chunks lazy por tamaño (aproximado)
const allChunks = glob.sync(`${distPath}/chunk-*.js`);
test('Al menos 4 chunks lazy existen', allChunks.length >= 4);

// Buscar chunks grandes que probablemente sean las rutas
const largeChunks = allChunks.filter((file) => {
  const size = statSync(file).size;
  return size > 400000; // > 400KB probablemente sean rutas
});

test('Chunks de rutas principales existen (>400KB)', largeChunks.length >= 4);

// 4. Verificar componentes lazy por tamaño
const mediumChunks = allChunks.filter((file) => {
  const size = statSync(file).size;
  return size > 200000 && size < 400000; // 200KB-400KB probablemente sean componentes
});

test('Chunks de componentes lazy existen (200KB-400KB)', mediumChunks.length >= 2);

// 5. Verificar tamaños de bundles
if (mainFiles.length > 0) {
  const mainSize = statSync(mainFiles[0]).size;
  const mainSizeMB = (mainSize / 1024 / 1024).toFixed(2);
  test(`Bundle principal < 2MB (actual: ${mainSizeMB}MB)`, mainSize < 2 * 1024 * 1024);
}

// 6. Verificar assets
test('Directorio assets existe', existsSync(`${distPath}/assets`));
test('Favicon existe', existsSync(`${distPath}/favicon.ico`));

// 7. Verificar Service Worker
test('Service Worker (ngsw-worker.js) existe', existsSync(`${distPath}/ngsw-worker.js`));
test('Service Worker config (ngsw.json) existe', existsSync(`${distPath}/ngsw.json`));

// Resumen
console.log(`\n📊 Resumen: ${passed} ✅ | ${failed} ❌`);

if (failed > 0) {
  console.log('\n❌ Algunos smoke tests fallaron');
  process.exit(1);
} else {
  console.log('\n🎉 Todos los smoke tests pasaron');
  process.exit(0);
}
