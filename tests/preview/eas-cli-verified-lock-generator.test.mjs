// TEMPORARY non-secret GitHub CI fixture; remove after committing validated lock.
// npm install materializes the actual dependency graph, then npm ci must accept it.
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

test('generate tested EAS CLI lock after npm install + npm ci in non-secret CI', () => {
  const dir = mkdtempSync(join(tmpdir(), 'tio-verified-eas-lock-'));
  copyFileSync(join(ROOT, '.github/preview-eas-cli/package.json'), join(dir, 'package.json'));
  for (const args of [
    ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--registry=https://registry.npmjs.org'],
    ['ci', '--ignore-scripts', '--no-audit', '--no-fund', '--registry=https://registry.npmjs.org'],
    ['audit', 'signatures', '--registry=https://registry.npmjs.org']
  ]) {
    const run = spawnSync('npm', args, { cwd: dir, encoding: 'utf8', timeout: 240000, maxBuffer: 5 * 1024 * 1024 });
    assert.equal(run.status, 0, args[0] + ' failed: ' + (run.stderr || run.error?.message || run.stdout));
  }
  const installed = JSON.parse(readFileSync(join(dir, 'node_modules/eas-cli/package.json'), 'utf8'));
  assert.equal(installed.version, '27.4.1');
  const lockText = readFileSync(join(dir, 'package-lock.json'), 'utf8');
  const lock = JSON.parse(lockText);
  assert.equal(lock.packages[''].dependencies['eas-cli'], '27.4.1');
  assert.equal(lock.packages['node_modules/eas-cli'].version, '27.4.1');
  assert.ok(Object.keys(lock.packages).length > 100);
  const b64 = Buffer.from(lockText, 'utf8').toString('base64');
  console.log('TIO_EAS_VERIFIED_START:' + b64.length + ':' + lockText.length);
  for (let i = 0; i < b64.length; i += 1800) {
    console.log('TIO_EAS_VERIFIED_CHUNK_' + String(i / 1800).padStart(4, '0') + ':' + b64.slice(i, i + 1800));
  }
  console.log('TIO_EAS_VERIFIED_END');
});
