import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import {
  assertUnmapped, draftBranch, draftSummary, requireDraftBundle, requireDraftSnapshot,
} from '../../.github/scripts/draft-eas-update.mjs';

const head = 'a'.repeat(40);
const base = 'b'.repeat(40);
const repo = 'im-tnyx/Tio-Money';
const updateId = '11111111-1111-1111-1111-111111111111';
const groupId = '22222222-2222-2222-2222-222222222222';
const pr = {
  number: 23, state: 'open', draft: true, user: { login: 'im-tnyx' },
  base: { ref: 'main', sha: base, repo: { full_name: repo } },
  head: { ref: 'feat/ui', sha: head, repo: { full_name: repo } },
};
const workflow = readFileSync(new URL('../../.github/workflows/tio-money-eas-pr-preview.yml', import.meta.url), 'utf8');
const codespaces = workflow.slice(workflow.indexOf('  codespaces_live:'), workflow.indexOf('  select:'));
const eas = workflow.slice(workflow.indexOf('  select:'));

test('manual operation routing enforces the target Draft state at selection, validation and publication', () => {
  const predicates = [...eas.matchAll(/--arg operation "\$TARGET_OPERATION" --arg number "\$PR_NUMBER" '([\s\S]+?)' "\$RUNNER_TEMP\/pr\.json"/g)];
  assert.equal(predicates.length, 3);
  for (const [, predicate] of predicates) {
    for (const [operation, draft, allowed] of [
      ['publish_draft_update', true, true], ['publish_draft_update', false, false],
      ['publish_update', false, true], ['publish_update', true, false],
      ['build_preview', false, true], ['build_preview', true, false],
    ]) {
      const result = spawnSync('jq', ['-e', '--arg', 'repo', repo, '--arg', 'operation', operation,
        '--arg', 'number', '23', predicate], { input: JSON.stringify({ ...pr, draft }) });
      assert.equal(result.status === 0, allowed, `${operation}, Draft=${draft}: ${result.stderr}`);
    }
  }
  const codespaceGate = codespaces.match(/jq -e --arg repo "\$GITHUB_REPOSITORY" '([\s\S]+?)' "\$RUNNER_TEMP\/preview-pr\.json"/)[1];
  for (const draft of [true, false]) {
    const input = { ...pr, draft, changed_files: 1, labels: [{ name: 'tio-preview' }] };
    assert.equal(spawnSync('jq', ['-e', '--arg', 'repo', repo, codespaceGate],
      { input: JSON.stringify(input) }).status, 0);
  }
  assert.match(workflow, /\n  workflow_run:\n    workflows:\n      - Tio Money preview push signal/);
  assert.match(workflow, /^name: TIO MONEY EXPO PR PREVIEW$/m);
  assert.doesNotMatch(eas, /github\.event_name == 'workflow_run'|secrets\.CODESPACES_TOKEN/);
});

test('final selection rejects invalid numbers, closed or ready PRs, forks, wrong owners and stale commits', () => {
  const verify = (snapshot, number = '23') => requireDraftSnapshot(snapshot, number, repo, head, base);
  assert.doesNotThrow(() => verify(pr));
  for (const snapshot of [
    { ...pr, state: 'closed' }, { ...pr, draft: false }, { ...pr, number: 24 },
    { ...pr, user: { login: 'someone-else' } },
    { ...pr, head: { ...pr.head, ref: 'main' } },
    { ...pr, head: { ...pr.head, repo: { full_name: 'fork/Tio-Money' } } },
    { ...pr, head: { ...pr.head, sha: base } },
    { ...pr, base: { ...pr.base, sha: head } },
    { ...pr, base: { ...pr.base, ref: 'other' } },
  ]) assert.throws(() => verify(snapshot), /eligibility or immutable/);
  for (const number of ['0', '02', '23/anything', '23\n']) {
    assert.throws(() => verify(pr, number), /positive integer/);
  }
});

test('draft branch is PR-scoped and must be unmapped from every EAS channel', () => {
  assert.equal(draftBranch('23'), 'pr-draft-23');
  assert.notEqual(draftBranch('24'), draftBranch('23'));
  const channel = (name, ids) => ({
    name, branchMapping: JSON.stringify({ version: 0, data: ids.map((branchId) => ({ branchId })) }),
  });
  assert.doesNotThrow(() => assertUnmapped([channel('production', [updateId])], 'pr-draft-23', groupId));
  assert.throws(() => assertUnmapped([channel('pr-preview', [updateId, groupId])], 'pr-draft-23', groupId), /associated/);
  assert.throws(() => assertUnmapped([channel('pr-draft-23', [])], 'pr-draft-23'), /associated/);
  assert.throws(() => assertUnmapped([{ branchMapping: '{"version":1}' }], 'pr-draft-23'), /unsupported/);
  assert.match(eas, /--branch "\$branch"/);
  assert.doesNotMatch(eas, /channel:edit|channel:create|--channel /);
});

test('Draft export is secretless and publish only consumes a prebuilt native bundle by artifact ID', () => {
  const publish = eas.slice(eas.indexOf('  preview:'));
  const operation = publish.slice(publish.indexOf('      - name: Publish OTA or queue'));
  assert.doesNotMatch(eas.slice(0, eas.indexOf('  preview:')), /secrets\.|\bEXPO_TOKEN:/);
  assert.deepEqual([...eas.matchAll(/secrets\.EXPO_TOKEN/g)].length, 1);
  assert.match(operation, /EXPO_TOKEN: \$\{\{ secrets\.EXPO_TOKEN \}\}/);
  assert.match(operation, /env -u GH_TOKEN "\$eas" update[\s\S]+--skip-bundler --input-dir/);
  assert.match(operation, /env -u EXPO_TOKEN gh api[\s\S]+node "\$helper" selection/);
  assert.match(eas, /artifact-ids: \$\{\{ needs\.validate\.outputs\.draft_artifact_id \}\}/);
  assert.match(eas, /all\) platforms=\(--platform ios --platform android\)/);
  assert.match(eas, /&&[\s\S]+c\.runtimeVersion\?\.policy !== "fingerprint"/);
  assert.ok(eas.indexOf('      - name: Store the exact Draft OTA export') < eas.indexOf('      - name: Validate preview source and dependencies'));
});

test('prebuilt artifact enforces platform and rejects traversal and symlink assets', () => {
  const root = mkdtempSync(join(tmpdir(), 'tio-ota-bundle-'));
  try {
    const write = (path, contents = '') => {
      mkdirSync(join(root, path, '..'), { recursive: true });
      writeFileSync(join(root, path), contents);
    };
    const metadata = { bundler: 'metro', fileMetadata: {
      android: { bundle: '_expo/static/js/android/entry-1.hbc', assets: [{ path: 'assets/abc', ext: 'png' }] },
      ios: { bundle: '_expo/static/js/ios/entry-2.hbc', assets: [] },
    } };
    const save = () => write('metadata.json', JSON.stringify(metadata));
    write(metadata.fileMetadata.android.bundle);
    write(metadata.fileMetadata.ios.bundle);
    write('assets/abc');
    save();
    requireDraftBundle(root, 'all');
    assert.throws(() => requireDraftBundle(root, 'android'), /native platforms/);
    delete metadata.fileMetadata.android;
    save();
    requireDraftBundle(root, 'ios');
    metadata.fileMetadata.ios.assets = [{ path: 'assets/../metadata.json', ext: 'png' }];
    save();
    assert.throws(() => requireDraftBundle(root, 'ios'), /unsafe path/);
    metadata.fileMetadata.ios.assets[0].path = 'assets/link';
    symlinkSync('../metadata.json', join(root, 'assets/link'));
    save();
    assert.throws(() => requireDraftBundle(root, 'ios'), /regular referenced/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('summary records only verified platform, SHA, runtime and update/group metadata', () => {
  const update = { id: updateId, group: groupId, gitCommitHash: head, branch: 'pr-draft-23',
    platform: 'android', runtimeVersion: base, manifestPermalink: 'https://ignored.example/signed' };
  for (const [platform, updates] of [['android', [update]], ['ios', [{ ...update, platform: 'ios' }]],
    ['all', [update, { ...update, platform: 'ios' }]]]) {
    const summary = draftSummary(updates, '23', head, platform);
    assert.match(summary, /PR #23.*pr-draft-23/);
    assert.ok(summary.includes(head) && summary.includes(updateId) && summary.includes(base));
    assert.ok(summary.includes(`https://expo.dev/accounts/tnyx-23/projects/tio-money/updates/${groupId}`));
    assert.doesNotMatch(summary, /ignored\.example/);
  }
  for (const candidate of [{ ...update, branch: 'production' }, { ...update, gitCommitHash: base },
    { ...update, runtimeVersion: '0.0.1' }, { ...update, group: 'unsafe' }]) {
    assert.throws(() => draftSummary([candidate], '23', head, 'android'), /could not be safely verified/);
  }
  assert.throws(() => draftSummary([update], '23', head, 'all'), /could not be safely verified/);
});

test('Draft scope rejects symlinks and a head carrying config older than the verified base', () => {
  const dir = mkdtempSync(join(tmpdir(), 'tio-ota-scope-'));
  const scope = fileURLToPath(new URL('../../.github/scripts/verify-eas-preview-scope.mjs', import.meta.url));
  const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim();
  const commit = (message) => {
    git('add', '.');
    git('-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', 'commit', '-qm', message);
    return git('rev-parse', 'HEAD');
  };
  const check = (b, h, mode) => spawnSync(process.execPath, [scope, b, h, mode], { cwd: dir, encoding: 'utf8' });
  try {
    git('init', '-q', '-b', 'main');
    mkdirSync(join(dir, 'src'));
    writeFileSync(join(dir, 'app.json'), '{}');
    writeFileSync(join(dir, 'src/index.ts'), 'initial');
    const initial = commit('base');
    git('checkout', '-qb', 'draft');
    writeFileSync(join(dir, 'src/index.ts'), 'draft');
    const source = commit('draft change');
    assert.equal(check(initial, source, 'publish_draft_update').status, 0);
    symlinkSync('../app.json', join(dir, 'src/escape'));
    const linked = commit('symlink');
    assert.match(check(initial, linked, 'publish_draft_update').stderr, /without symlinks/);
    git('checkout', '-q', 'main');
    writeFileSync(join(dir, 'app.json'), '{"runtime":2}');
    const updated = commit('base configuration change');
    assert.equal(check(updated, source, 'publish_update').status, 0);
    assert.match(check(updated, source, 'publish_draft_update').stderr, /permits app source/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
