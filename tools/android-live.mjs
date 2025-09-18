#!/usr/bin/env node
// Auto dev live-reload for Android (Capacitor)
// - Detects local IP
// - Updates capacitor.config.ts server url and cleartext
// - Ensures network_security_config allows the IP
// - Runs `npx cap sync android`
// - Starts `ng serve` and then `npx cap run android -l --external`

import os from 'os';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { spawn, spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cwd = process.cwd();

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const idx = args.indexOf(name);
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  return fallback;
};
const PORT = Number(process.env.PORT || getArg('--port', '4200'));
const TARGET = getArg('--target', undefined);
const REVERSE = getArg('--reverse', '');

function detectLocalIp() {
  const ifaces = os.networkInterfaces();
  const isPrivate = (ip) =>
    ip.startsWith('192.168.') || ip.startsWith('10.') || ip.match(/^172\.(1[6-9]|2\d|3[0-1])\./);
  for (const name of Object.keys(ifaces)) {
    for (const it of ifaces[name] || []) {
      if (it.family === 'IPv4' && !it.internal && isPrivate(it.address)) return it.address;
    }
  }
  // Fallback: localhost (works with adb reverse)
  return 'localhost';
}

const IP = getArg('--ip', detectLocalIp());
const SERVER_URL = `http://${IP}:${PORT}`;
const reversePorts = (REVERSE ? REVERSE.split(',') : [])
  .map((p) => Number(p.trim()))
  .filter((n) => Number.isFinite(n) && n > 0);
if (IP === 'localhost' && !reversePorts.includes(PORT)) reversePorts.push(PORT);

function updateCapacitorConfig() {
  const file = path.join(cwd, 'capacitor.config.ts');
  if (!fs.existsSync(file)) return;
  let txt = fs.readFileSync(file, 'utf8');
  const serverBlock = `server: {\n    url: '${SERVER_URL}',\n    cleartext: true,\n  },`;
  if (/server:\s*\{[\s\S]*?\},?/.test(txt)) {
    txt = txt.replace(/server:\s*\{[\s\S]*?\},?/, serverBlock);
  } else {
    txt = txt.replace(/webDir:\s*'[^']*',?/, (m) => `${m}\n  ${serverBlock}`);
  }
  fs.writeFileSync(file, txt);
  console.log(`[android-live] capacitor.config.ts -> ${SERVER_URL}`);
}

function ensureNetworkSecurityIp() {
  const file = path.join(
    cwd,
    'android',
    'app',
    'src',
    'main',
    'res',
    'xml',
    'network_security_config.xml',
  );
  if (!fs.existsSync(file)) return;
  let txt = fs.readFileSync(file, 'utf8');
  if (!txt.includes(IP)) {
    txt = txt.replace(
      '</domain-config>',
      `    <domain includeSubdomains="true">${IP}</domain>\n  </domain-config>`,
    );
    fs.writeFileSync(file, txt);
    console.log(`[android-live] network_security_config.xml -> added ${IP}`);
  }
}

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  return await new Promise((resolve, reject) => {
    const tick = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve(true);
      });
      req.on('error', () => {
        if (Date.now() - start > timeoutMs)
          return reject(new Error('timeout waiting for dev server'));
        setTimeout(tick, 1000);
      });
    };
    tick();
  });
}

async function main() {
  updateCapacitorConfig();
  ensureNetworkSecurityIp();

  // Sync native
  spawnSync('npx', ['cap', 'sync', 'android'], { stdio: 'inherit', shell: true });

  // Start ng serve
  const ng = spawn('npx', ['ng', 'serve', '--host', '0.0.0.0', '--port', String(PORT)], {
    stdio: 'inherit',
    shell: true,
  });

  // When server is ready, run cap live
  try {
    await waitForServer(SERVER_URL, 90000);
  } catch (e) {
    console.error('[android-live] Dev server not reachable:', e.message);
  }

  const capArgs = ['cap', 'run', 'android', '-l', '--external', '--port', String(PORT)];
  // If reverse requested (or localhost IP), set up adb reverse on requested ports
  if (reversePorts.length) {
    const targetForReverse = resolveTargetApprox(TARGET);
    if (targetForReverse) {
      for (const p of reversePorts) adbReverse(targetForReverse, p);
    } else {
      console.log('[android-live] No target para adb reverse aún. Saltando reverse.');
    }
  }
  if (TARGET) {
    const resolved = resolveTargetApprox(TARGET);
    if (resolved && resolved !== TARGET) {
      console.log(
        `[android-live] --target '${TARGET}' no coincide exactamente. Usando '${resolved}'.`,
      );
    }
    capArgs.push('--target', resolved || TARGET);
  }
  const cap = spawn('npx', capArgs, {
    stdio: 'inherit',
    shell: true,
  });

  // Reintento de reverse unos segundos después del deploy (algunos dispositivos Wi‑Fi lo requieren)
  try {
    const tgt = resolveTargetApprox(TARGET);
    if (tgt && reversePorts.length) {
      setTimeout(() => {
        for (const p of reversePorts) adbReverse(tgt, p);
      }, 5000);
    }
  } catch {}

  const cleanup = () => {
    try {
      ng.kill('SIGINT');
    } catch {}
    try {
      cap.kill('SIGINT');
    } catch {}
    try {
      const targetForReverse = resolveTargetApprox(TARGET);
      if (targetForReverse && reversePorts.length) {
        for (const p of reversePorts) adbReverse(targetForReverse, p, true);
      }
    } catch {}
    process.exit(0);
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

function resolveTargetApprox(input) {
  try {
    const out = spawnSync('adb', ['devices'], { encoding: 'utf8' });
    const lines = (out.stdout || '').split(/\r?\n/).slice(1);
    const devices = lines
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('*'))
      .map((l) => l.split(/\s+/))
      .filter(([, state]) => state === 'device')
      .map(([id]) => id);
    if (devices.length === 0) return undefined;
    if (devices.includes(input)) return input;
    const lower = input.toLowerCase();
    const hit = devices.find((id) => id.toLowerCase().includes(lower));
    return hit;
  } catch (e) {
    return undefined;
  }
}

function adbReverse(target, port, clear = false) {
  try {
    const args = ['-s', target, 'reverse'];
    if (clear) {
      // Unreverse: use 'adb -s <id> reverse --remove tcp:PORT'
      const rm = spawnSync('adb', ['-s', target, 'reverse', '--remove', `tcp:${port}`], {
        encoding: 'utf8',
      });
      if ((rm.stderr || '').trim())
        console.log(`[android-live] reverse remove ${port}:`, rm.stderr);
      else console.log(`[android-live] reverse removed tcp:${port}`);
      return;
    }
    const out = spawnSync('adb', [...args, `tcp:${port}`, `tcp:${port}`], { encoding: 'utf8' });
    if ((out.stderr || '').trim()) console.log(`[android-live] adb reverse ${port}:`, out.stderr);
    else console.log(`[android-live] adb reverse tcp:${port} established`);
  } catch (e) {
    console.log('[android-live] adb reverse error:', e.message);
  }
}
