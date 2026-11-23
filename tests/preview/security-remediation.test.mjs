import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { validateDiff } from '../../.github/scripts/verify-eas-preview-scope.mjs';
import { listenerState, preflightDecision } from '../../.github/scripts/preflight-pr-codespaces-preview.mjs';
import { readBounded, verifySourceMap } from '../../.github/scripts/verify-codespace-served-source.mjs';
import { request } from '../../scripts/start-codespace-expo.mjs';

const diff = (stream, status = 0) => ({ status, stdout: Buffer.from(stream) });

test('EAS scope rejects incomplete diffs and both forbidden move or copy endpoints', () => {
  assert.doesNotThrow(() => validateDiff(diff('M\0src/index.ts\0R100\0docs/old.md\0docs/new.md\0')));
  for (const record of [
    diff('M\0src/index.ts\0', 128), { ...diff('M\0src/index.ts\0'), error: Error('overflow') },
    diff(''), diff('M\0src/index.ts'), diff('R100\0src/index.ts\0'), diff('X\0src/index.ts\0'),
    diff('R100\0package-lock.json\0docs/old.md\0'), diff('C100\0eas.json\0src/eas.json\0'),
    diff('R099\0src/index.ts\0.github/tool.mjs\0'), diff('M\0app.json\0'), diff('M\0docs/tool.sh\0'),
  ]) assert.throws(() => validateDiff(record));
});

test('both Metro probes refuse redirects, external targets and malformed JSON', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch');
  const endpoint = 'http://127.0.0.1:8081/';
  for (const status of [301, 302, 307, 308]) {
    fetch.mock.mockImplementation(async (url, options) => {
      assert.equal(new URL(url).origin, new URL(endpoint).origin);
      assert.equal(options.redirect, 'error');
      return new Response('', { status, headers: { Location: 'http://127.0.0.1:9999/' } });
    });
    await assert.rejects(readBounded(endpoint), /failed/);
    assert.equal(await request('/status'), null);
  }
  fetch.mock.mockImplementation(async () => new Response('{broken'));
  await assert.rejects(readBounded(endpoint), SyntaxError);
  assert.equal(await request('/', true), null);
  await assert.rejects(readBounded('https://example.invalid/'), /Unexpected/);
});

test('managed Metro rejects foreign or ambiguous ports even with a valid ownership record', () => {
  const record = { pid: 321, startTicks: '9' };
  const proc = { cwd: '/workspaces/Tio-Money', command: 'npm run mobile', startTicks: '9' };
  assert.equal(listenerState(new Set(['1']), new Set(['1'])), 'OWNED');
  assert.equal(listenerState(new Set(), new Set(['1'])), 'EMPTY');
  for (const sockets of [['2'], ['1', '2']]) {
    const state = listenerState(new Set(sockets), new Set(['1']));
    assert.throws(() => preflightDecision(true, record, proc, false, state), /listener ownership/);
  }
  assert.throws(() => preflightDecision(true, record, null, true), /ownership/);
  assert.throws(() => preflightDecision(true, record, { ...proc, startTicks: '10' }, true), /ownership/);
});

test('source graph evidence is specific to each platform and does not require unloaded modules', () => {
  const tracked = new Map([
    ['src/shared.ts', 'unchanged'], ['src/card.android.ts', 'android new'],
    ['src/card.ios.ts', 'ios new'], ['src/lazy.ts', 'lazy new'],
  ]);
  const affected = new Set(['src/card.android.ts', 'src/card.ios.ts', 'src/lazy.ts']);
  const evaluate = (sources, sourcesContent = sources.map((path) => tracked.get(path))) =>
    verifySourceMap({ sources, sourcesContent }, tracked, affected);
  assert.equal(evaluate(['src/shared.ts']), 0);
  assert.equal(evaluate(['src/shared.ts', 'src/card.ios.ts']), 1);
  assert.equal(evaluate(['src/card.android.ts', 'src/lazy.ts']), 2);
  assert.throws(() => evaluate(['src/card.android.ts', 'src/lazy.ts'], ['android new', 'stale']), /does not match/);
  assert.throws(() => evaluate(['src/shared.ts', 'src/card.ios.ts'], ['unchanged', 'stale']), /does not match/);
});

test('failed status and dirty worktree abort trusted shell scripts before further Git operations', () => {
  for (const name of ['check', 'sync']) {
    const file = new URL(`../../.github/scripts/${name}-pr-codespaces-preview.sh`, import.meta.url);
    const script = readFileSync(file, 'utf8').replaceAll('/workspaces/Tio-Money', '.');
    for (const status of ['return 1', 'echo dirty']) {
      const fakeGit = `git() {
        case "$1" in remote) echo https://github.com/im-tnyx/Tio-Money.git;; status) ${status};; *) return 99;; esac
      }\n`;
      const sha = 'a'.repeat(40);
      const result = spawnSync('bash', ['-s', '--', sha, '88',
        `/tmp/tio-money-preview-${sha}-42/source.bundle`, 'b'.repeat(64)],
      { input: fakeGit + script, encoding: 'utf8' });
      assert.equal(result.status, 1, result.stderr);
      assert.match(result.stderr, /unable to verify worktree status|unsaved work/);
    }
  }
});
