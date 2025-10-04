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

// Buscar chunks grandes (>100KB) - Build SPA genera chunks más pequeños
const largeChunks = allChunks.filter((file) => {
  const size = statSync(file).size;
  return size > 100000; // > 100KB
});

test('Chunks lazy significativos existen (>100KB)', largeChunks.length >= 2);

// 4. Verificar que hay variedad de tamaños (optimización de code-splitting)
const chunkSizes = allChunks.map((file) => statSync(file).size);
const hasVariety = chunkSizes.some((s) => s > 50000) && chunkSizes.some((s) => s < 50000);

test('Code-splitting funcionando (variedad de tamaños)', hasVariety);

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
