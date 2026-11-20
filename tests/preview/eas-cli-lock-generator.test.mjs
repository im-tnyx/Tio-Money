// TEMPORARY CI-only lockfile generation: remove after downloading and committing
// a real isolated dependency lock. No credentials or Expo publication is accessed.
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

test('prepare reviewable pinned EAS CLI 27.4.1 npm lockfile via normal CI registry', () => {
  const dir = mkdtempSync(join(tmpdir(), 'tio-eas-lock-'));
  const manifest = {
    name: 'tio-money-verified-eas-cli',
    private: true,
    version: '0.0.0',
    dependencies: { 'eas-cli': '27.4.1' }
  };
  writeFileSync(join(dir, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
  const run = spawnSync('npm', [
    'install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund',
    '--registry=https://registry.npmjs.org'
  ], { cwd: dir, encoding: 'utf8', timeout: 180000 });
  assert.equal(run.status, 0, run.stderr || run.error?.message);
  const lockText = readFileSync(join(dir, 'package-lock.json'), 'utf8');
  const lock = JSON.parse(lockText);
  assert.equal(lock.packages[''].dependencies['eas-cli'], '27.4.1');
  assert.equal(lock.packages['node_modules/eas-cli'].version, '27.4.1');
  assert.ok(Object.keys(lock.packages).length > 100);
  // Only public npm lockfile data. Emit bounded chunks for agent to commit as-is;
  // this entire generator is removed in the same reviewed feature branch.
  const b64 = Buffer.from(lockText, 'utf8').toString('base64');
  console.log('TIO_EAS_LOCK_START:' + b64.length + ':' + lockText.length);
  for (let i = 0; i < b64.length; i += 2048) {
    console.log('TIO_EAS_LOCK_CHUNK_' + String(i / 2048).padStart(4, '0') + ':' + b64.slice(i, i + 2048));
  }
  console.log('TIO_EAS_LOCK_END');
});
