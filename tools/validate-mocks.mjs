#!/usr/bin/env node
import globby from 'globby';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const PROJECT_ROOT = process.cwd();
const SPEC_GLOB = 'src/**/*.spec.ts';
const ALLOWED_MOCKS_DIR = path.join('src', 'app', 'shared', 'mocks');

const INLINE_PATTERNS = [/jest\.fn\(/, /createSpyObj\(/];

function isAllowed(filePath) {
  return filePath.replace(/\\/g, '/').includes(ALLOWED_MOCKS_DIR.replace(/\\/g, '/'));
}

function isWhitelistLine(line) {
  // Allow jest.spyOn when spying on imported module functions (not building mock objects)
  // This is heuristic; strict policy can be refined.
  return /jest\.spyOn\(.*\)\.mock(Resolved|Rejected)?Value/.test(line);
}

async function main() {
  const files = await globby(SPEC_GLOB, { gitignore: true, absolute: true });
  const violations = [];

  for (const file of files) {
    if (isAllowed(path.relative(PROJECT_ROOT, file))) continue;
    const content = await readFile(file, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, idx) => {
      for (const re of INLINE_PATTERNS) {
        if (re.test(line) && !isWhitelistLine(line)) {
          violations.push({ file, line: idx + 1, snippet: line.trim() });
          break;
        }
      }
    });
  }

  if (violations.length) {
    console.error('Se detectaron mocks inline fuera de app/shared/mocks:\n');
    for (const v of violations) {
      const rel = path.relative(PROJECT_ROOT, v.file).replace(/\\/g, '/');
      console.error(`- ${rel}:${v.line} -> ${v.snippet}`);
    }
    process.exit(1);
  } else {
    console.log('OK: No hay mocks inline en archivos .spec.ts (fuera de app/shared/mocks).');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
