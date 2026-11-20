import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const LOCK_DIR = join(ROOT, '.github', 'preview-eas-cli');

test('CI verifies isolated committed EAS CLI using npm ci and registry signatures', (t) => {
  if (process.env.GITHUB_ACTIONS !== 'true') {
    t.skip('networked npm package-signature verification is exercised on GitHub CI');
    return;
  }

  const target = mkdtempSync(join(tmpdir(), 'tio-eas-ci-'));
  for (const name of ['package.json', 'package-lock.json']) {
    copyFileSync(join(LOCK_DIR, name), join(target, name));
  }

  const npmCi = spawnSync('npm', [
    'ci', '--prefix', target, '--ignore-scripts', '--no-audit', '--no-fund',
    '--registry=https://registry.npmjs.org'
  ], { encoding: 'utf8', timeout: 240000, maxBuffer: 4 * 1024 * 1024 });
  assert.equal(npmCi.status, 0, npmCi.stderr || npmCi.error?.message);

  const signatures = spawnSync('npm', [
    'audit', 'signatures', '--registry=https://registry.npmjs.org'
  ], { cwd: target, encoding: 'utf8', timeout: 180000, maxBuffer: 4 * 1024 * 1024 });
  assert.equal(signatures.status, 0, signatures.stderr || signatures.error?.message);

  const installed = JSON.parse(readFileSync(join(target, 'node_modules/eas-cli/package.json'), 'utf8'));
  assert.equal(installed.version, '27.4.1');

  const cli = spawnSync(join(target, 'node_modules/.bin/eas'), ['--version'], {
    cwd: ROOT, encoding: 'utf8', timeout: 45000, maxBuffer: 4 * 1024 * 1024
  });
  assert.equal(cli.status, 0, cli.stderr || cli.error?.message);
  assert.match(cli.stdout + cli.stderr, /27\\.4\\.1/);
});
