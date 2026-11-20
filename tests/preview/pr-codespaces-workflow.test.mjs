import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { chmodSync, mkdirSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  KNOWN_EDITING_CODESPACE,
  PREVIEW_ONLY_DISPLAY_NAME,
  requireDedicatedPreviewCodespace,
} from '../../.github/scripts/verify-pr-preview-codespace.mjs';
import { requireImmutablePRChangedPaths } from '../../.github/scripts/verify-pr-preview-pr-snapshot.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const signal = read('.github/workflows/tio-money-preview-push-signal.yml');
const worker = read('.github/workflows/tio-money-codespaces-pr-preview.yml');
const sync = read('.github/scripts/sync-pr-codespaces-preview.sh');
const devcontainer = JSON.parse(read('.devcontainer/devcontainer.json'));

test('push signal never receives privileged credentials or checks out feature code', () => {
  assert.match(signal, /name: Tio Money preview push signal/);
  assert.match(signal, /branches-ignore:\s*\n\s*- main/);
  assert.match(signal, /permissions:\s*\n\s*contents: read/);
  assert.doesNotMatch(signal, /secrets\.|GH_TOKEN|actions\/checkout|pull_request_target/);
  assert.doesNotMatch(signal, /^\s{2}workflow_run:/m);
});

test('trusted worker has exact owner, repo, main and successful push gates', () => {
  assert.match(worker, /github\.ref == 'refs\/heads\/main'/);
  assert.match(worker, /github\.actor == 'im-tnyx'/);
  assert.match(worker, /workflow_run\.actor\.login == 'im-tnyx'/);
  assert.match(worker, /workflow_run\.head_repository\.full_name == 'im-tnyx\/Tio-Money'/);
  assert.match(worker, /workflow_run\.conclusion == 'success'/);
  assert.match(worker, /head\.sha \| test\("\^\[0-9a-f\]\{40\}\$"\)/);
  assert.match(worker, /\.head\.ref != "main"/);
  assert.match(worker, /\.base\.ref == "main"/);
  assert.match(worker, /\.user\.login == "im-tnyx"/);
  assert.match(worker, /tio-preview/);
  assert.match(worker, /\$PUSH_SHA" != "\$pr_sha"/);
  assert.match(worker, /github\.triggering_actor == 'im-tnyx'/);
  assert.match(worker, /github\.run_attempt == '1'/);
  assert.match(worker, /base_sha=\%s/);
});

test('trusted worker uses main-scoped Codespaces secret, owner-selected Codespace and source-only guard', () => {
  assert.match(worker, /environment: tio-money-codespaces-trusted/);
  assert.match(worker, /GH_TOKEN: \$\{\{ secrets\.CODESPACES_TOKEN \}\}/);
  assert.match(worker, /vars\.TIO_MONEY_PREVIEW_CODESPACE/);
  assert.match(worker, /vars\.TIO_MONEY_PREVIEW_CODESPACE_ID/);
  assert.match(worker, /verify-pr-preview-codespace\.mjs/);
  assert.match(worker, /Editing Codespace is explicitly disallowed/);
  assert.match(worker, /Configure TIO_MONEY_PREVIEW_CODESPACE/);
  assert.match(worker, /src\/\*\|assets\/\*\|tests\/\*\|docs\/\*/);
  assert.match(worker, /actions\/checkout@11bd71901bbe5b1630ceea73d27597364c9af683/);
  assert.match(worker, /ref: \$\{\{ github\.sha \}\}/);
  assert.match(worker, /persist-credentials: false/);
  assert.match(worker, /\.github\/scripts\/sync-pr-codespaces-preview\.sh/);
  assert.doesNotMatch(worker, /secrets\.EXPO_TOKEN|pr-preview\s*--environment|pull_request_target/);
  assert.doesNotMatch(worker, /ref: \$\{\{ steps\.pr\.outputs\.head_sha \}\}/);
});

test('immutable preview scope rejects PR head race, altered compare, and native rename source', () => {
  const headSha = 'a'.repeat(40);
  const baseSha = 'b'.repeat(40);
  const captured = {
    number: 42,
    state: 'open',
    changed_files: 1,
    user: { login: 'im-tnyx' },
    head: {
      sha: headSha,
      ref: 'feat/one-source-file',
      repo: { full_name: 'im-tnyx/Tio-Money' },
    },
    base: { sha: baseSha, ref: 'main' },
    labels: [{ name: 'tio-preview' }],
  };
  const compare = {
    base_commit: { sha: baseSha },
    total_commits: 1,
    commits: [{ sha: headSha }],
    files: [{ filename: 'src/feature.ts' }],
  };
  assert.deepEqual(
    requireImmutablePRChangedPaths(captured, compare, { ...captured }, headSha, baseSha),
    ['src/feature.ts'],
  );


  // GitHub's real compare payload has no head_commit. Its commits list is
  // the attestation source; fail closed if it is missing or incomplete.
  assert.equal('head_commit' in compare, false);
  assert.throws(
    () => requireImmutablePRChangedPaths(
      captured, { ...compare, commits: [] }, captured, headSha, baseSha,
    ),
    /Immutable PR comparison/,
  );
  assert.throws(
    () => requireImmutablePRChangedPaths(
      captured, { ...compare, commits: undefined }, captured, headSha, baseSha,
    ),
    /Immutable PR comparison/,
  );
  assert.throws(
    () => requireImmutablePRChangedPaths(
      captured, { ...compare, total_commits: 2 }, captured, headSha, baseSha,
    ),
    /Immutable PR comparison/,
  );
  assert.throws(
    () => requireImmutablePRChangedPaths(
      captured, { ...compare, total_commits: 0 }, captured, headSha, baseSha,
    ),
    /Immutable PR comparison/,
  );
  assert.throws(
    () => requireImmutablePRChangedPaths(
      captured, { ...compare, base_commit: { sha: 'd'.repeat(40) } },
      captured, headSha, baseSha,
    ),
    /Immutable PR comparison/,
  );
  assert.throws(
    () => requireImmutablePRChangedPaths(
      captured, { ...compare, total_commits: 2, commits: [{ sha: headSha }, { sha: 'c'.repeat(40) }] },
      captured, headSha, baseSha,
    ),
    /Immutable PR comparison/,
  );
  // A genuine multi-commit response is accepted only when the final
  // returned SHA is exactly the originally captured head SHA.
  assert.deepEqual(
    requireImmutablePRChangedPaths(
      captured,
      { ...compare, total_commits: 2, commits: [{ sha: 'c'.repeat(40) }, { sha: headSha }] },
      captured, headSha, baseSha,
    ),
    ['src/feature.ts'],
  );

  // Regression for the P2 TOCTOU: PR head advances after its original capture.
  assert.throws(
    () => requireImmutablePRChangedPaths(
      captured, compare,
      { ...captured, head: { ...captured.head, sha: 'c'.repeat(40) } },
      headSha, baseSha,
    ),
    /changed after immutable head selection/,
  );
  assert.throws(
    () => requireImmutablePRChangedPaths(
      captured, compare,
      { ...captured, base: { ...captured.base, sha: 'd'.repeat(40) } },
      headSha, baseSha,
    ),
    /changed after immutable head selection/,
  );
  assert.throws(
    () => requireImmutablePRChangedPaths(
      captured, { ...compare, commits: [{ sha: 'c'.repeat(40) }] },
      captured, headSha, baseSha,
    ),
    /Immutable PR comparison/,
  );
  assert.throws(
    () => requireImmutablePRChangedPaths(
      captured, { ...compare, files: [{ filename: 'src/feature.ts' }, { filename: 'ios/Native.m' }] },
      captured, headSha, baseSha,
    ),
    /file count/,
  );
  assert.deepEqual(
    requireImmutablePRChangedPaths(
      captured, { ...compare, files: [{ filename: 'src/feature.ts', previous_filename: 'ios/Native.m' }] },
      captured, headSha, baseSha,
    ),
    ['src/feature.ts', 'ios/Native.m'],
  );
  assert.throws(
    () => requireImmutablePRChangedPaths(
      captured, { ...compare, files: [{ filename: 'src/a\nmalicious.ts' }] },
      captured, headSha, baseSha,
    ),
    /Invalid or ambiguous/,
  );
});

test('trusted main snapshot validation precedes any Codespace start or SSH', () => {
  assert.match(worker, /compare\/\$\{PR_BASE_SHA\}\.\.\.\$\{PR_SHA\}/);
  assert.doesNotMatch(worker, /pulls\/\$\{TARGET_PR\}\/files/);
  assert.match(worker, /verify-pr-preview-pr-snapshot\.mjs/);
  const selected = worker.indexOf('node .github/scripts/verify-pr-preview-pr-snapshot.mjs');
  const start = worker.indexOf('"/user/codespaces/${codespace}/start"');
  const ssh = worker.indexOf('gh codespace ssh --codespace');
  assert.ok(selected > 0 && selected < start && start < ssh);
});

test('trusted worker copies a private immutable bundle, never sends Git credentials to Codespace', () => {
  const prepare = worker.slice(
    worker.indexOf('      - name: Prepare exact immutable PR source bundle'),
    worker.indexOf('      - name: Discover and start only the verified preview-only Codespace'),
  );
  const transfer = worker.slice(worker.indexOf('      - name: Sync exact PR source'));
  assert.ok(prepare.includes('GH_TOKEN: ${{ github.token }}'));
  assert.ok(!prepare.includes('CODESPACES_TOKEN'));
  assert.ok(transfer.includes('GH_TOKEN: ${{ secrets.CODESPACES_TOKEN }}'));
  assert.ok(!transfer.includes('git fetch'));
  assert.ok(!transfer.includes('base64 < "$bundle" | gh codespace ssh'));
  assert.ok(transfer.includes('gh codespace cp --expand -c "$CODESPACE_NAME" "$bundle" "remote:$remote_bundle"'));
  assert.ok(!transfer.includes('gh codespace cp -c "$CODESPACE_NAME"'));
  // --expand is safe only because the run ID and SHA are explicitly validated.
  assert.ok(transfer.includes('! "$TARGET_SHA" =~ ^[0-9a-f]{40}
  assert.ok(transfer.includes('remote_dir="/tmp/tio-money-preview-${TARGET_SHA}-${GITHUB_RUN_ID}"'));
  assert.ok(transfer.includes('remote_bundle="${remote_dir}/source.bundle"'));
  assert.ok(transfer.includes('mkdir -m 700 -- %q'));
  assert.ok(transfer.includes('trap cleanup_remote_bundle EXIT'));
  assert.ok(transfer.includes('chmod 600 -- %q'));
  assert.ok(transfer.includes('test ! -L %q'));
  assert.ok(transfer.includes('bundle_sha256="$(sha256sum -- "$bundle"'));
  assert.ok(transfer.includes('"$remote_bundle" "$bundle_sha256"'));
  assert.ok(transfer.includes('source-only') || worker.includes('source-only'));
});

test('SCP remote destination does not inherit literal quotes under validated --expand', () => {
  const transfer = worker.slice(worker.indexOf('      - name: Sync exact PR source'));
  const copy = transfer.match(/^\s*(gh codespace cp[^\n]*)$/m)?.[1];
  assert.equal(copy, 'gh codespace cp --expand -c "$CODESPACE_NAME" "$bundle" "remote:$remote_bundle"');
  // Local mock captures the exact argv passed to GitHub CLI; no Codespace network call.
  const sha = 'a'.repeat(40);
  const runId = '44828410270';
  const remoteDir = `/tmp/tio-money-preview-${sha}-${runId}`;
  const script = [
    'set -euo pipefail',
    'gh() { printf "%s\\n" "$@"; }',
    'CODESPACE_NAME=preview-only',
    'bundle=/tmp/trusted-runner.bundle',
    `remote_bundle="${remoteDir}/source.bundle"`,
    copy,
  ].join('\n');
  const run = spawnSync('bash', ['-c', script], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  assert.deepEqual(run.stdout.trim().split('\n'), [
    'codespace', 'cp', '--expand', '-c', 'preview-only',
    '/tmp/trusted-runner.bundle', `remote:${remoteDir}/source.bundle`,
  ]);
  assert.match(run.stdout, /--expand/);
  assert.doesNotMatch(run.stdout, /'\/tmp\//);
  // Without --expand, GitHub CLI may quote the absolute path as literal text
  // in SFTP mode; never expand arbitrary owner input or other remote commands.
  assert.equal((transfer.match(/gh codespace cp --expand /g) || []).length, 1);
  assert.equal((worker.match(/gh codespace cp --expand /g) || []).length, 1);
  assert.ok(transfer.includes('remote_dir="/tmp/tio-money-preview-${TARGET_SHA}-${GITHUB_RUN_ID}"'));
  assert.ok(transfer.includes('remote_bundle="${remote_dir}/source.bundle"'));
});

test('remote trusted script verifies private path, mode, UID, SHA-256 and exact bundle commit', () => {
  assert.match(sync, /expected_remote="https:\/\/github\.com\/im-tnyx\/Tio-Money"/);
  assert.match(sync, /git status --porcelain=v1 --untracked-files=normal/);
  assert.ok(sync.includes('git bundle verify "$bundle_path"'));
  assert.ok(sync.includes('git fetch --no-tags "$bundle_path" "refs/tio-preview/selected"'));
  assert.ok(sync.includes('validate_preview_bundle "$bundle_path" "$target_sha" "$expected_bundle_sha256"'));
  assert.ok(sync.includes('trap \'rm -f -- "$bundle_path"; rmdir -- "$bundle_dir"'));
  assert.ok(sync.includes('stat -c \'%a\''));
  assert.ok(sync.includes('stat -c \'%u\''));
  assert.ok(sync.includes('SHA-256 mismatch'));
  assert.ok(sync.includes('private bundle directory mode or owner invalid'));
  assert.ok(sync.includes('! -f "$path" || -L "$path"'));
  assert.ok(sync.includes('source\\.bundle'));
  assert.match(sync, /"\$fetched_sha" != "\$target_sha"/);
  assert.match(sync, /git -c advice\.detachedHead=false switch --detach "\$target_sha"/);
  assert.match(sync, /scripts\/start-codespace-expo\.mjs --stop/);
  assert.match(sync, /scripts\/start-codespace-expo\.mjs --status/);
  assert.doesNotMatch(sync, /git\s+(?:push|reset|clean|checkout\s+-f|switch\s+-C)/);
  assert.doesNotMatch(sync, /curl\s+[^\n]*\|\s*bash/);
});

test('remote bundle validator rejects tampering, permissive mode and untrusted paths', () => {
  const validator = sync.match(/validate_preview_bundle\(\) \{\n[\s\S]*?\n\}/)?.[0];
  assert.ok(validator, 'extract the exact trusted validator');
  const sha = 'a'.repeat(40);
  const dir = join('/tmp', `tio-money-preview-${sha}-${process.pid}${process.hrtime.bigint()}`);
  const file = join(dir, 'source.bundle');
  const content = 'complete immutable bundle transfer test';
  mkdirSync(dir, { mode: 0o700 });
  writeFileSync(file, content, { mode: 0o600 });
  const digest = createHash('sha256').update(content).digest('hex');
  const verify = (hash = digest) => spawnSync('bash', [
    '-c', `${validator}\nvalidate_preview_bundle "$1" "$2" "$3"`,
    'bundle-regression', file, sha, hash,
  ], { encoding: 'utf8' });
  try {
    assert.equal(verify().status, 0, 'correct private transfer must pass');
    assert.equal(statSync(file).mode & 0o777, 0o600);
    assert.match(verify('f'.repeat(64)).stderr, /SHA-256 mismatch/);

    chmodSync(file, 0o644);
    assert.match(verify().stderr, /mode 600/);
    chmodSync(file, 0o600);

    chmodSync(dir, 0o755);
    assert.match(verify().stderr, /directory mode or owner invalid/);
    chmodSync(dir, 0o700);

    writeFileSync(file, '');
    assert.match(verify().stderr, /size outside/);
    writeFileSync(file, content);

    writeFileSync(file, 'corrupted');
    assert.match(verify().stderr, /SHA-256 mismatch/);
    rmSync(file);
    const other = join(dir, 'other.bundle');
    writeFileSync(other, content, { mode: 0o600 });
    symlinkSync(other, file);
    assert.match(verify().stderr, /non-regular bundle path/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('Codespaces SSHD feature uses reviewed exact patch, no ignored latest option', () => {
  assert.deepEqual(Object.keys(devcontainer.features), [
    'ghcr.io/devcontainers/features/sshd:1.1.0',
  ]);
  assert.deepEqual(devcontainer.features['ghcr.io/devcontainers/features/sshd:1.1.0'], {});
  assert.equal(JSON.stringify(devcontainer.features).includes('latest'), false);
  assert.equal(devcontainer.postStartCommand, 'node scripts/start-codespace-expo.mjs');
  assert.equal(devcontainer.portsAttributes['8081'].visibility, 'private');
});

test('privileged Codespaces worker verifies preview-only identity before starting or SSH', () => {
  const verified = worker.indexOf('node .github/scripts/verify-pr-preview-codespace.mjs');
  const start = worker.indexOf('"/user/codespaces/${codespace}/start"');
  const ssh = worker.indexOf('gh codespace ssh --codespace');
  assert.ok(verified > 0 && verified < start && start < ssh);
  assert.equal(worker.match(/node \.github\/scripts\/verify-pr-preview-codespace\.mjs/g)?.length, 2);
});

test('dedicated preview identity gate fails closed for owner editing Codespace and spoofed metadata', () => {
  const previewName = 'dedicated-preview-abc123';
  const previewId = '123456';
  const valid = {
    name: previewName,
    id: 123456,
    display_name: PREVIEW_ONLY_DISPLAY_NAME,
    owner: { login: 'im-tnyx' },
    repository: { full_name: 'im-tnyx/Tio-Money' },
    state: 'Available',
  };
  assert.equal(requireDedicatedPreviewCodespace(valid, previewName, previewId), previewName);

  const editing = { ...valid, name: KNOWN_EDITING_CODESPACE };
  assert.throws(
    () => requireDedicatedPreviewCodespace(editing, KNOWN_EDITING_CODESPACE, previewId),
    /editing Codespace/,
  );
  assert.throws(
    () => requireDedicatedPreviewCodespace(editing, previewName, previewId),
    /editing Codespace/,
  );
  assert.throws(() => requireDedicatedPreviewCodespace(valid, previewName, ''), /ID allowlist/);
  assert.throws(() => requireDedicatedPreviewCodespace(valid, previewName, '1'), /allowlist/);
  assert.throws(() => requireDedicatedPreviewCodespace(valid, 'other-preview-name', previewId), /allowlist/);
  assert.throws(
    () => requireDedicatedPreviewCodespace({ ...valid, display_name: 'Editing Tio-Money' }, previewName, previewId),
    /allowlist/,
  );
  assert.throws(
    () => requireDedicatedPreviewCodespace({ ...valid, repository: { full_name: 'im-tnyx/Tio-Workspace' } }, previewName, previewId),
    /allowlist/,
  );
  assert.throws(
    () => requireDedicatedPreviewCodespace({ ...valid, owner: { login: 'another-owner' } }, previewName, previewId),
    /allowlist/,
  );
  assert.throws(() => requireDedicatedPreviewCodespace(null, previewName, previewId), /allowlist/);
});

test('PR metadata HTTP diagnostic stays read-only, safe and before Codespace activation', () => {
  const fetch = worker.indexOf('pr_status="$(printf ');
  const check = worker.indexOf('jq -e --arg repo "$GITHUB_REPOSITORY"');
  const start = worker.indexOf('"/user/codespaces/${codespace}/start"');
  assert.ok(fetch > 0 && fetch < check && check < start);
  assert.ok(worker.includes('GH_TOKEN: ${{ github.token }}'));
  assert.ok(worker.includes('curl --config - --silent --show-error --max-time 20'));
  assert.ok(worker.includes('Authorization: Bearer %s'));
  assert.ok(worker.includes('"$GH_TOKEN" |'));
  assert.doesNotMatch(worker, /--header "Authorization: Bearer/);
  assert.ok(worker.includes('if [[ "$pr_status" != "200" ]]'));
  assert.ok(worker.includes('gsub(/[^[:alnum:]._,;= -]/, "?", value)'));
  for (const name of [
    'x-accepted-github-permissions',
    'x-github-request-id',
    'x-github-api-version-selected',
  ]) assert.ok(worker.includes(name), name);
  assert.ok(worker.includes('Codespace activation denied'));
  assert.ok(!worker.includes('set -x'));
  assert.ok(!worker.includes('echo "$GH_TOKEN"'));
  assert.ok(!worker.includes('secrets.EXPO_TOKEN'));
});

test('manual dispatch PR is a strict positive integer string, not a rounded numeric input', () => {
  const inputDefinition = worker.match(/workflow_dispatch:\s*\n\s*inputs:\s*\n\s*pr_number:\s*\n(?:\s{8}[^\n]+\n){3}/);
  assert.ok(inputDefinition, 'workflow_dispatch pr_number input must exist');
  assert.match(inputDefinition[0], /^\s*type: string$/m);
  assert.doesNotMatch(inputDefinition[0], /^\s*type: number$/m);
  assert.ok(worker.includes('if [[ ! "$INPUT_PR" =~ ^[1-9][0-9]*$ ]]; then'));
  const validPR = /^[1-9][0-9]*$/;
  for (const input of ['1', '18', '99999']) assert.ok(validPR.test(input), input);
  for (const input of ['18.0', '0', '-18', '01', '1e3', '18/../../', '', '18 ']) {
    assert.equal(validPR.test(input), false, input);
  }
  assert.match(worker, /github\.actor == 'im-tnyx'/);
  assert.match(worker, /github\.ref == 'refs\/heads\/main'/);
  assert.match(worker, /github\.run_attempt == '1'/);
});

test('trusted worker scopes issue-label enumeration to issues: read without write escalation', () => {
  const permissionBlock = worker.match(/^permissions:\n((?:  [a-z-]+: (?:read|write)\n)+)/m);
  assert.ok(permissionBlock, 'top-level permissions block must exist');
  assert.deepEqual(
    permissionBlock[1].trim().split('\n').map((entry) => entry.trim()),
    ['contents: read', 'pull-requests: read', 'issues: read'],
  );
  assert.ok(worker.includes('issues?state=open&labels=tio-preview&per_page=100'));
  assert.ok(worker.includes('if [[ "${#active[@]}" -ne 1 || "${active[0]:-}" != "$selected" ]]'));
  assert.match(worker, /github\.actor == 'im-tnyx'/);
  assert.match(worker, /github\.run_attempt == '1'/);
  assert.doesNotMatch(permissionBlock[1], /write/);
});
));
  assert.ok(transfer.includes('! "$GITHUB_RUN_ID" =~ ^[1-9][0-9]*
  assert.ok(transfer.includes('remote_dir="/tmp/tio-money-preview-${TARGET_SHA}-${GITHUB_RUN_ID}"'));
  assert.ok(transfer.includes('remote_bundle="${remote_dir}/source.bundle"'));
  assert.ok(transfer.includes('mkdir -m 700 -- %q'));
  assert.ok(transfer.includes('trap cleanup_remote_bundle EXIT'));
  assert.ok(transfer.includes('chmod 600 -- %q'));
  assert.ok(transfer.includes('test ! -L %q'));
  assert.ok(transfer.includes('bundle_sha256="$(sha256sum -- "$bundle"'));
  assert.ok(transfer.includes('"$remote_bundle" "$bundle_sha256"'));
  assert.ok(transfer.includes('source-only') || worker.includes('source-only'));
});

test('remote trusted script verifies private path, mode, UID, SHA-256 and exact bundle commit', () => {
  assert.match(sync, /expected_remote="https:\/\/github\.com\/im-tnyx\/Tio-Money"/);
  assert.match(sync, /git status --porcelain=v1 --untracked-files=normal/);
  assert.ok(sync.includes('git bundle verify "$bundle_path"'));
  assert.ok(sync.includes('git fetch --no-tags "$bundle_path" "refs/tio-preview/selected"'));
  assert.ok(sync.includes('validate_preview_bundle "$bundle_path" "$target_sha" "$expected_bundle_sha256"'));
  assert.ok(sync.includes('trap \'rm -f -- "$bundle_path"; rmdir -- "$bundle_dir"'));
  assert.ok(sync.includes('stat -c \'%a\''));
  assert.ok(sync.includes('stat -c \'%u\''));
  assert.ok(sync.includes('SHA-256 mismatch'));
  assert.ok(sync.includes('private bundle directory mode or owner invalid'));
  assert.ok(sync.includes('! -f "$path" || -L "$path"'));
  assert.ok(sync.includes('source\\.bundle'));
  assert.match(sync, /"\$fetched_sha" != "\$target_sha"/);
  assert.match(sync, /git -c advice\.detachedHead=false switch --detach "\$target_sha"/);
  assert.match(sync, /scripts\/start-codespace-expo\.mjs --stop/);
  assert.match(sync, /scripts\/start-codespace-expo\.mjs --status/);
  assert.doesNotMatch(sync, /git\s+(?:push|reset|clean|checkout\s+-f|switch\s+-C)/);
  assert.doesNotMatch(sync, /curl\s+[^\n]*\|\s*bash/);
});

test('remote bundle validator rejects tampering, permissive mode and untrusted paths', () => {
  const validator = sync.match(/validate_preview_bundle\(\) \{\n[\s\S]*?\n\}/)?.[0];
  assert.ok(validator, 'extract the exact trusted validator');
  const sha = 'a'.repeat(40);
  const dir = join('/tmp', `tio-money-preview-${sha}-${process.pid}${process.hrtime.bigint()}`);
  const file = join(dir, 'source.bundle');
  const content = 'complete immutable bundle transfer test';
  mkdirSync(dir, { mode: 0o700 });
  writeFileSync(file, content, { mode: 0o600 });
  const digest = createHash('sha256').update(content).digest('hex');
  const verify = (hash = digest) => spawnSync('bash', [
    '-c', `${validator}\nvalidate_preview_bundle "$1" "$2" "$3"`,
    'bundle-regression', file, sha, hash,
  ], { encoding: 'utf8' });
  try {
    assert.equal(verify().status, 0, 'correct private transfer must pass');
    assert.equal(statSync(file).mode & 0o777, 0o600);
    assert.match(verify('f'.repeat(64)).stderr, /SHA-256 mismatch/);

    chmodSync(file, 0o644);
    assert.match(verify().stderr, /mode 600/);
    chmodSync(file, 0o600);

    chmodSync(dir, 0o755);
    assert.match(verify().stderr, /directory mode or owner invalid/);
    chmodSync(dir, 0o700);

    writeFileSync(file, '');
    assert.match(verify().stderr, /size outside/);
    writeFileSync(file, content);

    writeFileSync(file, 'corrupted');
    assert.match(verify().stderr, /SHA-256 mismatch/);
    rmSync(file);
    const other = join(dir, 'other.bundle');
    writeFileSync(other, content, { mode: 0o600 });
    symlinkSync(other, file);
    assert.match(verify().stderr, /non-regular bundle path/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('Codespaces SSHD feature uses reviewed exact patch, no ignored latest option', () => {
  assert.deepEqual(Object.keys(devcontainer.features), [
    'ghcr.io/devcontainers/features/sshd:1.1.0',
  ]);
  assert.deepEqual(devcontainer.features['ghcr.io/devcontainers/features/sshd:1.1.0'], {});
  assert.equal(JSON.stringify(devcontainer.features).includes('latest'), false);
  assert.equal(devcontainer.postStartCommand, 'node scripts/start-codespace-expo.mjs');
  assert.equal(devcontainer.portsAttributes['8081'].visibility, 'private');
});

test('privileged Codespaces worker verifies preview-only identity before starting or SSH', () => {
  const verified = worker.indexOf('node .github/scripts/verify-pr-preview-codespace.mjs');
  const start = worker.indexOf('"/user/codespaces/${codespace}/start"');
  const ssh = worker.indexOf('gh codespace ssh --codespace');
  assert.ok(verified > 0 && verified < start && start < ssh);
  assert.equal(worker.match(/node \.github\/scripts\/verify-pr-preview-codespace\.mjs/g)?.length, 2);
});

test('dedicated preview identity gate fails closed for owner editing Codespace and spoofed metadata', () => {
  const previewName = 'dedicated-preview-abc123';
  const previewId = '123456';
  const valid = {
    name: previewName,
    id: 123456,
    display_name: PREVIEW_ONLY_DISPLAY_NAME,
    owner: { login: 'im-tnyx' },
    repository: { full_name: 'im-tnyx/Tio-Money' },
    state: 'Available',
  };
  assert.equal(requireDedicatedPreviewCodespace(valid, previewName, previewId), previewName);

  const editing = { ...valid, name: KNOWN_EDITING_CODESPACE };
  assert.throws(
    () => requireDedicatedPreviewCodespace(editing, KNOWN_EDITING_CODESPACE, previewId),
    /editing Codespace/,
  );
  assert.throws(
    () => requireDedicatedPreviewCodespace(editing, previewName, previewId),
    /editing Codespace/,
  );
  assert.throws(() => requireDedicatedPreviewCodespace(valid, previewName, ''), /ID allowlist/);
  assert.throws(() => requireDedicatedPreviewCodespace(valid, previewName, '1'), /allowlist/);
  assert.throws(() => requireDedicatedPreviewCodespace(valid, 'other-preview-name', previewId), /allowlist/);
  assert.throws(
    () => requireDedicatedPreviewCodespace({ ...valid, display_name: 'Editing Tio-Money' }, previewName, previewId),
    /allowlist/,
  );
  assert.throws(
    () => requireDedicatedPreviewCodespace({ ...valid, repository: { full_name: 'im-tnyx/Tio-Workspace' } }, previewName, previewId),
    /allowlist/,
  );
  assert.throws(
    () => requireDedicatedPreviewCodespace({ ...valid, owner: { login: 'another-owner' } }, previewName, previewId),
    /allowlist/,
  );
  assert.throws(() => requireDedicatedPreviewCodespace(null, previewName, previewId), /allowlist/);
});

test('PR metadata HTTP diagnostic stays read-only, safe and before Codespace activation', () => {
  const fetch = worker.indexOf('pr_status="$(printf ');
  const check = worker.indexOf('jq -e --arg repo "$GITHUB_REPOSITORY"');
  const start = worker.indexOf('"/user/codespaces/${codespace}/start"');
  assert.ok(fetch > 0 && fetch < check && check < start);
  assert.ok(worker.includes('GH_TOKEN: ${{ github.token }}'));
  assert.ok(worker.includes('curl --config - --silent --show-error --max-time 20'));
  assert.ok(worker.includes('Authorization: Bearer %s'));
  assert.ok(worker.includes('"$GH_TOKEN" |'));
  assert.doesNotMatch(worker, /--header "Authorization: Bearer/);
  assert.ok(worker.includes('if [[ "$pr_status" != "200" ]]'));
  assert.ok(worker.includes('gsub(/[^[:alnum:]._,;= -]/, "?", value)'));
  for (const name of [
    'x-accepted-github-permissions',
    'x-github-request-id',
    'x-github-api-version-selected',
  ]) assert.ok(worker.includes(name), name);
  assert.ok(worker.includes('Codespace activation denied'));
  assert.ok(!worker.includes('set -x'));
  assert.ok(!worker.includes('echo "$GH_TOKEN"'));
  assert.ok(!worker.includes('secrets.EXPO_TOKEN'));
});

test('manual dispatch PR is a strict positive integer string, not a rounded numeric input', () => {
  const inputDefinition = worker.match(/workflow_dispatch:\s*\n\s*inputs:\s*\n\s*pr_number:\s*\n(?:\s{8}[^\n]+\n){3}/);
  assert.ok(inputDefinition, 'workflow_dispatch pr_number input must exist');
  assert.match(inputDefinition[0], /^\s*type: string$/m);
  assert.doesNotMatch(inputDefinition[0], /^\s*type: number$/m);
  assert.ok(worker.includes('if [[ ! "$INPUT_PR" =~ ^[1-9][0-9]*$ ]]; then'));
  const validPR = /^[1-9][0-9]*$/;
  for (const input of ['1', '18', '99999']) assert.ok(validPR.test(input), input);
  for (const input of ['18.0', '0', '-18', '01', '1e3', '18/../../', '', '18 ']) {
    assert.equal(validPR.test(input), false, input);
  }
  assert.match(worker, /github\.actor == 'im-tnyx'/);
  assert.match(worker, /github\.ref == 'refs\/heads\/main'/);
  assert.match(worker, /github\.run_attempt == '1'/);
});

test('trusted worker scopes issue-label enumeration to issues: read without write escalation', () => {
  const permissionBlock = worker.match(/^permissions:\n((?:  [a-z-]+: (?:read|write)\n)+)/m);
  assert.ok(permissionBlock, 'top-level permissions block must exist');
  assert.deepEqual(
    permissionBlock[1].trim().split('\n').map((entry) => entry.trim()),
    ['contents: read', 'pull-requests: read', 'issues: read'],
  );
  assert.ok(worker.includes('issues?state=open&labels=tio-preview&per_page=100'));
  assert.ok(worker.includes('if [[ "${#active[@]}" -ne 1 || "${active[0]:-}" != "$selected" ]]'));
  assert.match(worker, /github\.actor == 'im-tnyx'/);
  assert.match(worker, /github\.run_attempt == '1'/);
  assert.doesNotMatch(permissionBlock[1], /write/);
});
));
  assert.ok(transfer.includes('remote_dir="/tmp/tio-money-preview-${TARGET_SHA}-${GITHUB_RUN_ID}"'));
  assert.ok(transfer.includes('remote_bundle="${remote_dir}/source.bundle"'));
  assert.ok(transfer.includes('mkdir -m 700 -- %q'));
  assert.ok(transfer.includes('trap cleanup_remote_bundle EXIT'));
  assert.ok(transfer.includes('chmod 600 -- %q'));
  assert.ok(transfer.includes('test ! -L %q'));
  assert.ok(transfer.includes('bundle_sha256="$(sha256sum -- "$bundle"'));
  assert.ok(transfer.includes('"$remote_bundle" "$bundle_sha256"'));
  assert.ok(transfer.includes('source-only') || worker.includes('source-only'));
});

test('remote trusted script verifies private path, mode, UID, SHA-256 and exact bundle commit', () => {
  assert.match(sync, /expected_remote="https:\/\/github\.com\/im-tnyx\/Tio-Money"/);
  assert.match(sync, /git status --porcelain=v1 --untracked-files=normal/);
  assert.ok(sync.includes('git bundle verify "$bundle_path"'));
  assert.ok(sync.includes('git fetch --no-tags "$bundle_path" "refs/tio-preview/selected"'));
  assert.ok(sync.includes('validate_preview_bundle "$bundle_path" "$target_sha" "$expected_bundle_sha256"'));
  assert.ok(sync.includes('trap \'rm -f -- "$bundle_path"; rmdir -- "$bundle_dir"'));
  assert.ok(sync.includes('stat -c \'%a\''));
  assert.ok(sync.includes('stat -c \'%u\''));
  assert.ok(sync.includes('SHA-256 mismatch'));
  assert.ok(sync.includes('private bundle directory mode or owner invalid'));
  assert.ok(sync.includes('! -f "$path" || -L "$path"'));
  assert.ok(sync.includes('source\\.bundle'));
  assert.match(sync, /"\$fetched_sha" != "\$target_sha"/);
  assert.match(sync, /git -c advice\.detachedHead=false switch --detach "\$target_sha"/);
  assert.match(sync, /scripts\/start-codespace-expo\.mjs --stop/);
  assert.match(sync, /scripts\/start-codespace-expo\.mjs --status/);
  assert.doesNotMatch(sync, /git\s+(?:push|reset|clean|checkout\s+-f|switch\s+-C)/);
  assert.doesNotMatch(sync, /curl\s+[^\n]*\|\s*bash/);
});

test('remote bundle validator rejects tampering, permissive mode and untrusted paths', () => {
  const validator = sync.match(/validate_preview_bundle\(\) \{\n[\s\S]*?\n\}/)?.[0];
  assert.ok(validator, 'extract the exact trusted validator');
  const sha = 'a'.repeat(40);
  const dir = join('/tmp', `tio-money-preview-${sha}-${process.pid}${process.hrtime.bigint()}`);
  const file = join(dir, 'source.bundle');
  const content = 'complete immutable bundle transfer test';
  mkdirSync(dir, { mode: 0o700 });
  writeFileSync(file, content, { mode: 0o600 });
  const digest = createHash('sha256').update(content).digest('hex');
  const verify = (hash = digest) => spawnSync('bash', [
    '-c', `${validator}\nvalidate_preview_bundle "$1" "$2" "$3"`,
    'bundle-regression', file, sha, hash,
  ], { encoding: 'utf8' });
  try {
    assert.equal(verify().status, 0, 'correct private transfer must pass');
    assert.equal(statSync(file).mode & 0o777, 0o600);
    assert.match(verify('f'.repeat(64)).stderr, /SHA-256 mismatch/);

    chmodSync(file, 0o644);
    assert.match(verify().stderr, /mode 600/);
    chmodSync(file, 0o600);

    chmodSync(dir, 0o755);
    assert.match(verify().stderr, /directory mode or owner invalid/);
    chmodSync(dir, 0o700);

    writeFileSync(file, '');
    assert.match(verify().stderr, /size outside/);
    writeFileSync(file, content);

    writeFileSync(file, 'corrupted');
    assert.match(verify().stderr, /SHA-256 mismatch/);
    rmSync(file);
    const other = join(dir, 'other.bundle');
    writeFileSync(other, content, { mode: 0o600 });
    symlinkSync(other, file);
    assert.match(verify().stderr, /non-regular bundle path/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('Codespaces SSHD feature uses reviewed exact patch, no ignored latest option', () => {
  assert.deepEqual(Object.keys(devcontainer.features), [
    'ghcr.io/devcontainers/features/sshd:1.1.0',
  ]);
  assert.deepEqual(devcontainer.features['ghcr.io/devcontainers/features/sshd:1.1.0'], {});
  assert.equal(JSON.stringify(devcontainer.features).includes('latest'), false);
  assert.equal(devcontainer.postStartCommand, 'node scripts/start-codespace-expo.mjs');
  assert.equal(devcontainer.portsAttributes['8081'].visibility, 'private');
});

test('privileged Codespaces worker verifies preview-only identity before starting or SSH', () => {
  const verified = worker.indexOf('node .github/scripts/verify-pr-preview-codespace.mjs');
  const start = worker.indexOf('"/user/codespaces/${codespace}/start"');
  const ssh = worker.indexOf('gh codespace ssh --codespace');
  assert.ok(verified > 0 && verified < start && start < ssh);
  assert.equal(worker.match(/node \.github\/scripts\/verify-pr-preview-codespace\.mjs/g)?.length, 2);
});

test('dedicated preview identity gate fails closed for owner editing Codespace and spoofed metadata', () => {
  const previewName = 'dedicated-preview-abc123';
  const previewId = '123456';
  const valid = {
    name: previewName,
    id: 123456,
    display_name: PREVIEW_ONLY_DISPLAY_NAME,
    owner: { login: 'im-tnyx' },
    repository: { full_name: 'im-tnyx/Tio-Money' },
    state: 'Available',
  };
  assert.equal(requireDedicatedPreviewCodespace(valid, previewName, previewId), previewName);

  const editing = { ...valid, name: KNOWN_EDITING_CODESPACE };
  assert.throws(
    () => requireDedicatedPreviewCodespace(editing, KNOWN_EDITING_CODESPACE, previewId),
    /editing Codespace/,
  );
  assert.throws(
    () => requireDedicatedPreviewCodespace(editing, previewName, previewId),
    /editing Codespace/,
  );
  assert.throws(() => requireDedicatedPreviewCodespace(valid, previewName, ''), /ID allowlist/);
  assert.throws(() => requireDedicatedPreviewCodespace(valid, previewName, '1'), /allowlist/);
  assert.throws(() => requireDedicatedPreviewCodespace(valid, 'other-preview-name', previewId), /allowlist/);
  assert.throws(
    () => requireDedicatedPreviewCodespace({ ...valid, display_name: 'Editing Tio-Money' }, previewName, previewId),
    /allowlist/,
  );
  assert.throws(
    () => requireDedicatedPreviewCodespace({ ...valid, repository: { full_name: 'im-tnyx/Tio-Workspace' } }, previewName, previewId),
    /allowlist/,
  );
  assert.throws(
    () => requireDedicatedPreviewCodespace({ ...valid, owner: { login: 'another-owner' } }, previewName, previewId),
    /allowlist/,
  );
  assert.throws(() => requireDedicatedPreviewCodespace(null, previewName, previewId), /allowlist/);
});

test('PR metadata HTTP diagnostic stays read-only, safe and before Codespace activation', () => {
  const fetch = worker.indexOf('pr_status="$(printf ');
  const check = worker.indexOf('jq -e --arg repo "$GITHUB_REPOSITORY"');
  const start = worker.indexOf('"/user/codespaces/${codespace}/start"');
  assert.ok(fetch > 0 && fetch < check && check < start);
  assert.ok(worker.includes('GH_TOKEN: ${{ github.token }}'));
  assert.ok(worker.includes('curl --config - --silent --show-error --max-time 20'));
  assert.ok(worker.includes('Authorization: Bearer %s'));
  assert.ok(worker.includes('"$GH_TOKEN" |'));
  assert.doesNotMatch(worker, /--header "Authorization: Bearer/);
  assert.ok(worker.includes('if [[ "$pr_status" != "200" ]]'));
  assert.ok(worker.includes('gsub(/[^[:alnum:]._,;= -]/, "?", value)'));
  for (const name of [
    'x-accepted-github-permissions',
    'x-github-request-id',
    'x-github-api-version-selected',
  ]) assert.ok(worker.includes(name), name);
  assert.ok(worker.includes('Codespace activation denied'));
  assert.ok(!worker.includes('set -x'));
  assert.ok(!worker.includes('echo "$GH_TOKEN"'));
  assert.ok(!worker.includes('secrets.EXPO_TOKEN'));
});

test('manual dispatch PR is a strict positive integer string, not a rounded numeric input', () => {
  const inputDefinition = worker.match(/workflow_dispatch:\s*\n\s*inputs:\s*\n\s*pr_number:\s*\n(?:\s{8}[^\n]+\n){3}/);
  assert.ok(inputDefinition, 'workflow_dispatch pr_number input must exist');
  assert.match(inputDefinition[0], /^\s*type: string$/m);
  assert.doesNotMatch(inputDefinition[0], /^\s*type: number$/m);
  assert.ok(worker.includes('if [[ ! "$INPUT_PR" =~ ^[1-9][0-9]*$ ]]; then'));
  const validPR = /^[1-9][0-9]*$/;
  for (const input of ['1', '18', '99999']) assert.ok(validPR.test(input), input);
  for (const input of ['18.0', '0', '-18', '01', '1e3', '18/../../', '', '18 ']) {
    assert.equal(validPR.test(input), false, input);
  }
  assert.match(worker, /github\.actor == 'im-tnyx'/);
  assert.match(worker, /github\.ref == 'refs\/heads\/main'/);
  assert.match(worker, /github\.run_attempt == '1'/);
});

test('trusted worker scopes issue-label enumeration to issues: read without write escalation', () => {
  const permissionBlock = worker.match(/^permissions:\n((?:  [a-z-]+: (?:read|write)\n)+)/m);
  assert.ok(permissionBlock, 'top-level permissions block must exist');
  assert.deepEqual(
    permissionBlock[1].trim().split('\n').map((entry) => entry.trim()),
    ['contents: read', 'pull-requests: read', 'issues: read'],
  );
  assert.ok(worker.includes('issues?state=open&labels=tio-preview&per_page=100'));
  assert.ok(worker.includes('if [[ "${#active[@]}" -ne 1 || "${active[0]:-}" != "$selected" ]]'));
  assert.match(worker, /github\.actor == 'im-tnyx'/);
  assert.match(worker, /github\.run_attempt == '1'/);
  assert.doesNotMatch(permissionBlock[1], /write/);
});
