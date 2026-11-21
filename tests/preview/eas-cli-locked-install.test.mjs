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
  // npm audit signatures sometimes reports registry verification failures on
  // stdout, not stderr. Preserve the fail-closed gate and surface a bounded
  // diagnostic rather than an unexplained "1 !== 0" assertion.
  const diagnostic = [signatures.stdout, signatures.stderr, signatures.error?.message]
    .filter(Boolean)
    .join('\n')
    .replace(/[\x00-\x08\x0b-\x1f\x7f]/g, '?')
    .slice(-4000);
  assert.equal(signatures.status, 0, `npm audit signatures failed: ${diagnostic || 'no diagnostic output'}`);

  // Enforce that the committed isolated EAS dependency graph stays clear
  // of Critical, High and Moderate advisories. Known Low findings are
  // documented separately and never silently dismissed.
  const audit = spawnSync('npm', [
    'audit', '--json', '--registry=https://registry.npmjs.org'
  ], { cwd: target, encoding: 'utf8', timeout: 180000, maxBuffer: 8 * 1024 * 1024 });
  assert.ok(audit.status === 0 || audit.status === 1,
    'npm audit execution failed: ' + (audit.stderr || audit.error?.message || audit.status));
  let auditReport;
  try {
    auditReport = JSON.parse(audit.stdout);
  } catch {
    assert.fail('npm audit returned invalid JSON');
  }
  const severity = auditReport.metadata?.vulnerabilities;
  assert.ok(severity && Number.isInteger(severity.moderate) &&
    Number.isInteger(severity.high) && Number.isInteger(severity.critical),
  'npm audit response lacks vulnerability severity totals');
  assert.equal(severity.critical, 0, 'Isolated EAS CLI Critical advisory must be addressed');
  assert.equal(severity.high, 0, 'Isolated EAS CLI High advisory must be addressed');
  assert.equal(severity.moderate, 0, 'Isolated EAS CLI Moderate advisory must be addressed');
  assert.ok(Number.isInteger(severity.low) && severity.low <= 2,
    'New Low advisories require fresh risk disposition');

  const installed = JSON.parse(readFileSync(join(target, 'node_modules/eas-cli/package.json'), 'utf8'));
  assert.equal(installed.version, '27.4.1');

  const cli = spawnSync(join(target, 'node_modules/.bin/eas'), ['--version'], {
    cwd: ROOT, encoding: 'utf8', timeout: 45000, maxBuffer: 4 * 1024 * 1024
  });
  assert.equal(cli.status, 0, cli.stderr || cli.error?.message);
  assert.ok((cli.stdout + cli.stderr).includes('27.4.1'));

  // Offline, secretless compatibility checks for the major transitive patches.
  // These only load the CLI help and local library APIs; they NEVER invoke a
  // privileged EAS preview, Expo login, OTA publish, or build operation.
  const cliEnv = { ...process.env, EXPO_TOKEN: '', GITHUB_TOKEN: '', NODE_AUTH_TOKEN: '', CI: 'true' };
  for (const command of ['build', 'update']) {
    const help = spawnSync(join(target, 'node_modules/.bin/eas'), [command, '--help'], {
      cwd: ROOT, env: cliEnv, encoding: 'utf8', timeout: 45000, maxBuffer: 4 * 1024 * 1024
    });
    assert.equal(help.status, 0, command + ' --help failed: ' + (help.stderr || help.error?.message || ''));
  }

  const functionalScript = `
    const assert = require('node:assert/strict');
    const { createRequire } = require('node:module');
    const { join } = require('node:path');
    const dep = createRequire(join(process.cwd(), 'package.json'));
    const uuid = dep('uuid');
    const glob = dep('glob');
    const minimatch = dep('minimatch');
    const merge = dep('ts-deepmerge');
    const ajv = dep('ajv');
    const yaml = dep('yaml');
    const forge = dep('node-forge');
    assert.equal(typeof uuid.v4, 'function');
    assert.equal(uuid.v4().length, 36);
    assert.equal(typeof glob.globSync, 'function');
    assert.ok(glob.globSync('package.json').includes('package.json'));
    const match = typeof minimatch === 'function' ? minimatch : minimatch.minimatch;
    assert.equal(typeof match, 'function');
    assert.ok(match('a.json', '*.json'));
    assert.equal(typeof merge.merge, 'function');
    assert.deepEqual(merge.merge({ a: { x: 1 } }, { a: { y: 2 } }), { a: { x: 1, y: 2 } });
    assert.ok(new ajv().validate({ type: 'object' }, { ok: true }));
    assert.equal(yaml.parse('x: 1').x, 1);
    assert.equal(typeof forge.pki.createCertificate, 'function');
    for (const name of ['@expo/config', '@expo/config-plugins', '@expo/prebuild-config',
      'sucrase', '@oclif/core', '@expo/bunyan', '@expo/rudder-sdk-node', 'xcode']) {
      assert.notEqual(dep(name), undefined, name);
    }
  `;
  const functional = spawnSync(process.execPath, ['-e', functionalScript], {
    cwd: target, env: cliEnv, encoding: 'utf8', timeout: 45000, maxBuffer: 4 * 1024 * 1024
  });
  assert.equal(functional.status, 0,
    'EAS dependency functional smoke failed: ' + (functional.stderr || functional.error?.message || ''));
});
