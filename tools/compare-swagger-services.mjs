#!/usr/bin/env node
/*
  Compare Swagger (context/swagger.json) vs Angular services (src/app/core/services)
  - Lists all Swagger endpoints (method + path)
  - Finds HttpClient calls in services and normalizes to basePath + path
  - Cross-checks presence and parameter signatures (query params + body)
  - Prints a compact report per requested format
*/

import fs from 'fs';
import path from 'path';

const SWAGGER_PATH = path.resolve('context/swagger.json');
const SERVICES_DIR = path.resolve('src/app/core/services');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function toPascalCase(name) {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : ''))
    .join('');
}

function suggestServiceNameFromPath(pathname) {
  // pathname like "/reservas" or "/metodos_pago/search" -> take first segment
  const parts = pathname.replace(/^\//, '').split('/');
  const first = parts[0] || '';
  if (!first) return 'ApiService';
  return `${toPascalCase(first)}Service`;
}

function extractSwaggerEndpoints(swagger) {
  const basePath = swagger.basePath || '';
  const endpoints = [];
  const map = new Map();
  for (const [p, methods] of Object.entries(swagger.paths || {})) {
    for (const [m, def] of Object.entries(methods || {})) {
      const method = m.toUpperCase();
      if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].includes(method)) continue;
      const fullPath = `${basePath}${p}`.replace(/\/\/+/, '/');
      const params = [];
      for (const pr of def.parameters || []) {
        if (pr.in === 'query') params.push(pr.name);
        if (pr.in === 'body') params.push('body');
      }
      const key = `${method} ${fullPath}`;
      const rec = { method, path: fullPath, params: Array.from(new Set(params)).sort() };
      endpoints.push(rec);
      map.set(key, rec);
    }
  }
  endpoints.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
  return { basePath, endpoints, map };
}

function readServiceFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.service.ts'))
    .map((f) => ({
      file: f,
      abs: path.join(dir, f),
      src: fs.readFileSync(path.join(dir, f), 'utf8'),
    }));
}

function findBaseVarNames(src) {
  // Capture variable names assigned to environment.apiUrl in the service
  // Example: private baseUrl = `${environment.apiUrl}/categorias`;
  const names = new Set();
  const re = /(?:private|protected|public)?\s*(\w+)\s*=\s*([^;]*environment\.apiUrl[^;]*);/g;
  let m;
  while ((m = re.exec(src))) {
    names.add(m[1]);
  }
  // Common default
  if (!names.size) names.add('baseUrl');
  return Array.from(names);
}

function deriveBaseVarSuffixes(src, baseVarNames) {
  const out = {};
  for (const varName of baseVarNames) {
    const declRe = new RegExp(
      String.raw`(?:private|protected|public)?\s*${varName}\s*=\s*([^;]*environment\.apiUrl[^;]*);`,
      'm',
    );
    const mm = src.match(declRe);
    let suffix = '';
    if (mm) {
      const init = mm[1];
      // Try to grab the literal suffix right after environment.apiUrl inside quotes/backticks
      // Patterns:
      //  - `${environment.apiUrl}/categorias`
      //  - "${environment.apiUrl}/categorias"
      //  - environment.apiUrl
      const sufMatch = init.match(/environment\.apiUrl\s*\}?([^`'\"]*)/);
      if (sufMatch && sufMatch[1]) {
        suffix = sufMatch[1].trim();
      }
      // Normalize
      if (suffix && !suffix.startsWith('/')) suffix = '/' + suffix.replace(/^\/+/, '');
      // Remove trailing template/quote fragments
      suffix = suffix.replace(/[`'"].*$/, '');
      // Remove duplicate slashes
      suffix = suffix.replace(/\/\/+/, '/');
    }
    out[varName] = suffix || '';
  }
  return out;
}

function normalizeUrlToSwaggerPath(url, basePath) {
  let u = url;
  // Drop protocol+host
  u = u.replace(/^https?:\/\/[^/]+/, '');
  // If contains the basePath, strip it to keep only resource path
  if (basePath && u.startsWith(basePath)) {
    u = u.slice(basePath.length);
  }
  // Ensure leading slash
  if (!u.startsWith('/')) u = '/' + u;
  // Remove duplicate slashes
  u = u.replace(/\/\/+/, '/');
  // Remove trailing slash (but keep root)
  if (u.length > 1) u = u.replace(/\/$/, '');
  // Return basePath + resource
  const full = `${basePath}${u}`.replace(/\/\/+/, '/');
  return full;
}

function extractServiceCalls(service, basePath) {
  const { file, src } = service;
  const baseVarNames = findBaseVarNames(src);
  const baseVarSuffix = deriveBaseVarSuffixes(src, baseVarNames);

  const httpCallRegexes = [
    /\.http\.(get|post|put|delete|patch)\s*(?:<[^>]*>\s*>*)?\s*\(([^\)]*)\)/g,
    /\bthis\.http\.(get|post|put|delete|patch)\s*(?:<[^>]*>\s*>*)?\s*\(([^\)]*)\)/g,
  ];

  const calls = [];
  for (const re of httpCallRegexes) {
    let m;
    while ((m = re.exec(src))) {
      const method = m[1].toUpperCase();
      const args = m[2];
      // Extract URL literal or template
      let url = null;
      const urlMatch = args.match(/`([^`]*)`/) || args.match(/['\"]([^'\"]*)['\"]/);
      if (urlMatch) {
        url = urlMatch[1];
      } else {
        // Check if first arg is exactly this.baseVar
        for (const varName of baseVarNames) {
          const usesVar = new RegExp(String.raw`^\s*this\.${varName}\s*(?:[,)]|$)`).test(args);
          if (usesVar) {
            url = baseVarSuffix[varName] || '';
            break;
          }
        }
      }
      if (url == null) continue;

      // Remove ${this.baseVar} or ${environment.apiUrl}
      for (const varName of baseVarNames) {
        url = url.replace(new RegExp(String.raw`\$\{\s*this\.${varName}\s*\}`, 'g'), '');
      }
      url = url.replace(/\$\{\s*environment\.apiUrl\s*\}/g, '');
      url = url.replace(/^\$\{[^}]+\}/, '');

      // Parse query params inline (e.g., ?id=1)
      const qp = [];
      const qm = url.indexOf('?');
      if (qm >= 0) {
        const qs = url.slice(qm + 1);
        url = url.slice(0, qm);
        for (const kv of qs.split('&')) {
          const [k] = kv.split('=');
          if (k) qp.push(k);
        }
      }

      // Also look around for HttpParams .set('k', ...) near the call
      const windowStart = Math.max(0, m.index - 500);
      const windowEnd = Math.min(src.length, m.index + 300);
      const around = src.slice(windowStart, windowEnd);
      const setRe = /\.set\(\s*['\"]([a-zA-Z0-9_]+)['\"]/g;
      let sm;
      while ((sm = setRe.exec(around))) {
        if (!qp.includes(sm[1])) qp.push(sm[1]);
      }

      // Determine if body is present (POST/PUT/PATCH)
      let hasBody = false;
      const argParts = args.split(',');
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        if (argParts.length >= 2) hasBody = true;
      }

      const fullPath = normalizeUrlToSwaggerPath(url, basePath);
      calls.push({
        service: file.replace(/\.ts$/, ''),
        method,
        path: fullPath,
        params: Array.from(new Set(qp)).sort(),
        hasBody,
      });
    }
  }

  return calls;
}

function buildServiceMap(servicesCalls) {
  const map = new Map();
  for (const c of servicesCalls) {
    const params = c.params ? [...c.params] : [];
    if (c.hasBody && !params.includes('body')) params.push('body');
    const key = `${c.method} ${c.path}`;
    // Prefer aggregating by key; if multiple services hit same endpoint, keep the first (or we could join service names)
    if (!map.has(key)) map.set(key, { ...c, params: params.sort() });
  }
  return map;
}

function main() {
  const swagger = readJson(SWAGGER_PATH);
  const { basePath, endpoints: swaggerList, map: swaggerMap } = extractSwaggerEndpoints(swagger);
  const serviceFiles = readServiceFiles(SERVICES_DIR);

  const calls = serviceFiles.flatMap((sf) => extractServiceCalls(sf, basePath));
  const serviceMap = buildServiceMap(calls);

  const diffs = [];
  // Missing in services
  for (const [key, sw] of swaggerMap.entries()) {
    if (!serviceMap.has(key)) {
      diffs.push({
        type: 'missing_service',
        endpoint: key,
        suggest: suggestServiceNameFromPath(sw.path.replace(basePath, '') || '/'),
      });
    }
  }
  // Orphans
  for (const [key, sv] of serviceMap.entries()) {
    if (!swaggerMap.has(key)) {
      diffs.push({ type: 'orphan_service', service: `${sv.service}:${key}` });
    }
  }
  // Param mismatches
  for (const [key, sw] of swaggerMap.entries()) {
    const sv = serviceMap.get(key);
    if (!sv) continue;
    const exp = (sw.params || []).slice().sort();
    const act = (sv.params || []).slice().sort();
    if (JSON.stringify(exp) !== JSON.stringify(act)) {
      diffs.push({ type: 'param_mismatch', key, expected: exp, actual: act, service: sv.service });
    }
  }

  // Print report
  const lines = [];
  lines.push('### Endpoints Swagger');
  for (const e of swaggerList) {
    lines.push(`- ${e.method} ${e.path}`);
  }
  lines.push('');
  lines.push('### Resumen de diferencias (Services)');
  if (!diffs.length) {
    lines.push('- Sin diferencias detectadas.');
  } else {
    for (const d of diffs) {
      if (d.type === 'missing_service') {
        lines.push(
          `- ${d.endpoint}: falta en services → **Acción**: crear service \`${d.suggest}\`.`,
        );
      } else if (d.type === 'orphan_service') {
        lines.push(
          `- ${d.service}: no existe en Swagger → **Acción**: eliminar o revisar service.`,
        );
      } else if (d.type === 'param_mismatch') {
        lines.push(
          `- ${d.service}/${d.key}: parámetros no coinciden (esperado: [${d.expected.join(', ')}], actual: [${d.actual.join(', ')}]) → **Acción**: ajustar firma.`,
        );
      }
    }
  }
  lines.push('');
  const allSwaggerCovered = [...swaggerMap.keys()].every((k) => serviceMap.has(k));
  const noOrphans = [...serviceMap.keys()].every((k) => swaggerMap.has(k));
  const noParamMismatches = !diffs.some((d) => d.type === 'param_mismatch');
  lines.push('### Checklist de cierre');
  lines.push(
    `- [${allSwaggerCovered ? 'x' : ' '}] Todos los endpoints de Swagger tienen su service.`,
  );
  lines.push(`- [${noOrphans ? 'x' : ' '}] No hay services huérfanos.`);
  lines.push(`- [${noParamMismatches ? 'x' : ' '}] Firmas alineadas (método, ruta, parámetros).`);

  console.log(lines.join('\n'));
}

try {
  main();
} catch (err) {
  console.error('Error ejecutando comparación:', err);
  process.exit(1);
}
