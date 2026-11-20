import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  KNOWN_EDITING_CODESPACE,
  PREVIEW_ONLY_DISPLAY_NAME,
  requireDedicatedPreviewCodespace,
} from '../../.github/scripts/verify-pr-preview-codespace.mjs';

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
  assert.match(worker, /actions\/checkout@v4/);
  assert.match(worker, /ref: \$\{\{ github\.sha \}\}/);
  assert.match(worker, /persist-credentials: false/);
  assert.match(worker, /\.github\/scripts\/sync-pr-codespaces-preview\.sh/);
  assert.doesNotMatch(worker, /secrets\.EXPO_TOKEN|pr-preview\s*--environment|pull_request_target/);
  assert.doesNotMatch(worker, /ref: \$\{\{ steps\.pr\.outputs\.head_sha \}\}/);
});

test('remote script refuses unsafe source and never force resets or changes git refs', () => {
  assert.match(sync, /expected_remote="https:\/\/github\.com\/im-tnyx\/Tio-Money"/);
  assert.match(sync, /git status --porcelain=v1 --untracked-files=normal/);
  assert.match(sync, /git fetch --no-tags origin "\$target_sha"/);
  assert.match(sync, /"\$fetched_sha" != "\$target_sha"/);
  assert.match(sync, /git -c advice\.detachedHead=false switch --detach "\$target_sha"/);
  assert.match(sync, /scripts\/start-codespace-expo\.mjs --stop/);
  assert.match(sync, /scripts\/start-codespace-expo\.mjs --status/);
  assert.doesNotMatch(sync, /git\s+(?:push|reset|clean|checkout\s+-f|switch\s+-C)/);
  assert.doesNotMatch(sync, /curl\s+[^\n]*\|\s*bash/);
});

test('Codespaces container declares SSHD while preserving managed startup', () => {
  assert.equal(devcontainer.features['ghcr.io/devcontainers/features/sshd:1'].version, 'latest');
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
