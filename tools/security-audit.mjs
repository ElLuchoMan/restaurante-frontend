#!/usr/bin/env node
/**
 * Security audit script para verificar vulnerabilidades
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

console.log('🔒 Ejecutando audit de seguridad...\n');

// 1. Audit de dependencias vulnerables
console.log('📦 Verificando dependencias vulnerables...');
try {
  const auditResult = execSync('npm audit --audit-level=moderate', { encoding: 'utf8' });
  console.log('✅ No se encontraron vulnerabilidades moderadas o altas');
} catch (error) {
  console.log('⚠️  Se encontraron vulnerabilidades:');
  console.log(error.stdout);
}

// 2. Verificar CSP headers
console.log('\n🛡️  Verificando configuración CSP...');
const netlifyConfig = readFileSync('netlify.toml', 'utf8');
if (netlifyConfig.includes('Content-Security-Policy')) {
  console.log('✅ CSP configurado en netlify.toml');
} else {
  console.log('❌ CSP no encontrado en netlify.toml');
}

// 3. Verificar scripts inline
console.log('\n📜 Verificando scripts inline...');
try {
  const scriptCheck = execSync('grep -r "<script" src/ || true', { encoding: 'utf8' });
  if (scriptCheck.trim()) {
    console.log('⚠️  Scripts inline encontrados:');
    console.log(scriptCheck);
  } else {
    console.log('✅ No se encontraron scripts inline');
  }
} catch (error) {
  console.log('✅ No se encontraron scripts inline');
}

// 4. Verificar innerHTML usage
console.log('\n🔍 Verificando uso de innerHTML...');
try {
  const innerHTMLCheck = execSync('grep -r "innerHTML" src/ || true', { encoding: 'utf8' });
  if (innerHTMLCheck.trim()) {
    console.log('⚠️  Uso de innerHTML encontrado:');
    console.log(innerHTMLCheck);
  } else {
    console.log('✅ No se encontró uso directo de innerHTML');
  }
} catch (error) {
  console.log('✅ No se encontró uso directo de innerHTML');
}

console.log('\n🔒 Audit de seguridad completado');
