import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  compatibleRuntime, previewAction, requireSyncSnapshot, runtimeFingerprint,
} from '../../scripts/start-codespace-expo.mjs';

test('compatible consecutive UI revisions preserve the managed process and tunnel decision', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'tio-metro-runtime-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  const write = (file, value) => writeFileSync(join(root, file), value);
  const commit = (message) => {
    git('add', '.');
    git('-c', 'user.name=Preview Test', '-c', 'user.email=preview@example.invalid', 'commit', '-qm', message);
    return git('rev-parse', 'HEAD');
  };
  git('init', '-q');
  mkdirSync(join(root, 'src'));
  write('package.json', '{}');
  write('package-lock.json', '{}');
  write('app.json', '{}');
  write('metro.config.mjs', 'export default {};');
  write('src/view.ts', 'export const view = 0;');
  const baseline = commit('Initial preview');
  const process = { pid: 321, startTicks: '1099', runtimeFingerprint: runtimeFingerprint(baseline, root) };
  const tunnel = { url: 'exps://fixture.on.expo.app' };

  for (const value of [1, 2]) {
    write('src/view.ts', `export const view = ${value};`);
    const head = commit('UI change');
    assert.notEqual(head, baseline);
    const compatible = compatibleRuntime(process, runtimeFingerprint(head, root));
    assert.equal(previewAction(process, compatible, true), 'reuse');
    assert.equal(process.pid, 321);
    assert.equal(tunnel.url, 'exps://fixture.on.expo.app');
    assert.throws(() => requireSyncSnapshot(baseline, head, ''), /checkout changed/);
    assert.throws(() => requireSyncSnapshot(head, head, ' M src/view.ts'), /dirty/);
    assert.doesNotThrow(() => requireSyncSnapshot(head, head, ''));
    assert.equal(compatibleRuntime(process, runtimeFingerprint(head, root), false), false);
  }

  write('package-lock.json', '{"lockfileVersion":3}');
  assert.equal(compatibleRuntime(process, runtimeFingerprint(commit('Dependency update'), root)), false);
  write('package-lock.json', '{}');
  write('metro.config.mjs', 'export default { resetCache: true };');
  assert.equal(compatibleRuntime(process, runtimeFingerprint(commit('Metro config update'), root)), false);
  assert.equal(compatibleRuntime({ pid: 321 }, process.runtimeFingerprint), false);
});
