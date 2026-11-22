import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const readJson = (path) => JSON.parse(readFileSync(join(ROOT, path), 'utf8'));

test('EAS preview is tied only to owner-confirmed Tio-Money project', () => {
  const expo = readJson('app.json').expo;
  assert.equal(expo.name, 'Tio Money');
  assert.equal(expo.owner, 'tnyx-23');
  assert.equal(expo.slug, 'tio-money');
  assert.equal(expo.extra.eas.projectId, '722e6857-1159-4414-a024-6a4351e7d3e1');
  assert.equal(expo.extra.releaseStage, 'phase-0-foundation');
  assert.equal(expo.updates.url, 'https://u.expo.dev/722e6857-1159-4414-a024-6a4351e7d3e1');
  assert.deepEqual(expo.runtimeVersion, { policy: 'fingerprint' });
  assert.equal(expo.android.permissions.length, 0);
  assert.equal(expo.ios.supportsTablet, true);
  // Native IDs are owner-controlled and may be configured in a later
  // separately reviewed PR; fail-closed build checks are asserted below.
});

test('preview build is internal and not a production release', () => {
  const eas = readJson('eas.json');
  assert.deepEqual(Object.keys(eas.build), ['preview']);
  assert.equal(eas.build.preview.distribution, 'internal');
  assert.equal(eas.build.preview.channel, 'pr-preview');
  assert.equal(eas.build.preview.android.buildType, 'apk');
  assert.equal(eas.build.production, undefined);
  assert.equal(eas.submit, undefined);
  assert.deepEqual(eas.cli, { version: '27.4.1' });
});

test('SDK 58 expo-updates is checked into both manifests with resolved transitive entries', () => {
  const manifest = readJson('package.json');
  const lock = readJson('package-lock.json');
  assert.equal(manifest.dependencies['expo-updates'], '~58.0.22');
  assert.equal(lock.packages[''].dependencies['expo-updates'], '~58.0.22');
  assert.equal(lock.packages['node_modules/expo-updates'].version, '58.0.22');
  for (const name of ['expo-eas-client', 'expo-json-utils', 'expo-manifests',
    'expo-structured-headers', 'expo-updates-interface']) {
    assert.ok(lock.packages['node_modules/' + name]?.integrity, name);
  }
  assert.equal(lock.packages['node_modules/expo-updates/node_modules/arg'].version, '4.1.3');
});

test('EAS CLI has its own committed full dependency lock and registry integrities', () => {
  const manifest = readJson('.github/preview-eas-cli/package.json');
  const lock = readJson('.github/preview-eas-cli/package-lock.json');
  assert.equal(manifest.private, true);
  assert.deepEqual(manifest.dependencies, { 'eas-cli': '27.4.1' });
  assert.deepEqual(manifest.devDependencies, { typescript: '5.9.3' });
  assert.equal(lock.packages[''].devDependencies.typescript, '5.9.3');
  assert.equal(lock.packages['node_modules/typescript'].version, '5.9.3');
  assert.equal(lock.lockfileVersion, 3);
  assert.equal(lock.packages[''].dependencies['eas-cli'], manifest.dependencies['eas-cli']);
  assert.equal(lock.packages['node_modules/eas-cli'].version, '27.4.1');
  // The official npm resolver deduplicates old vulnerable nested copies.
  // Do not require a historical package COUNT that rewards unsafe duplication.
  assert.ok(Object.keys(lock.packages).length >= 450, 'Expected a complete EAS CLI dependency tree');
  for (const [name, expected] of Object.entries({
    'eas-cli': '27.4.1',
    typescript: '5.9.3',
    'node-forge': '1.4.3',
    ajv: '8.18.0',
    yaml: '2.8.3',
    glob: '14.0.2',
    uuid: '11.1.1',
    'ts-deepmerge': '8.0.0',
  })) {
    assert.equal(lock.packages['node_modules/' + name]?.version, expected, name);
  }
  for (const [path, pkg] of Object.entries(lock.packages)) {
    if (!path || !pkg.resolved) continue;
    assert.ok(pkg.resolved.startsWith('https://registry.npmjs.org/'), path);
    assert.match(pkg.integrity, /^sha512-/, path);
  }
});

test('EAS publishing workflow is manual, owner-gated, nonproduction and isolated', () => {
  const text = readFileSync(join(ROOT, '.github/workflows/tio-money-eas-pr-preview.yml'), 'utf8');
  assert.match(text, /^name: TIO MONEY EXPO PR REVIEW$/m);
  assert.match(text, /workflow_dispatch:/);
  const dispatchInputs = text.split('workflow_dispatch:')[1].split('\npermissions:')[0];
  assert.deepEqual(
    [...dispatchInputs.matchAll(/^      ([a-z_]+):$/gm)].map((match) => match[1]),
    ['pr_number', 'operation', 'platform'],
  );
  assert.match(dispatchInputs, /      pr_number:\n        description: Open non-Draft owner PR \(src\/assets, tests and Markdown docs\)\n        required: true\n        type: string\n/);
  assert.doesNotMatch(dispatchInputs, /^\s*type: number$/m);
  assert.match(
    dispatchInputs,
    /      operation:\n        description: Publish an OTA update or queue an internal preview build\n        required: true\n        default: publish_update\n        type: choice\n        options:\n          - publish_update\n          - build_preview\n/,
  );
  assert.match(
    dispatchInputs,
    /      platform:\n        description: Android, iOS or both \(build requires signing and app identifiers\)\n        required: true\n        default: all\n        type: choice\n        options:\n          - android\n          - ios\n          - all\n/,
  );
  assert.match(text, /case "\$TARGET_PLATFORM" in\s*\n\s*android\|ios\|all\)/);
  assert.match(text, /--platform "\$TARGET_PLATFORM"/);
  assert.match(text, /case "\$TARGET_OPERATION" in\s*\n\s*publish_update\|build_preview\)/);
  assert.match(text, /TARGET_OPERATION: \$\{\{ inputs\.operation \}\}/);
  assert.match(text, /if \[\[ "\$TARGET_OPERATION" == "build_preview" \]\]/);
  assert.match(text, /const onlyPreview = Object\.keys\(eas\.build \|\| \{\}\)\.length === 1/);
  assert.match(text, /profile\.distribution !== 'internal'/);
  assert.match(text, /profile\.channel !== 'pr-preview'/);
  assert.match(text, /profile\.android\?\.buildType !== 'apk'/);
  assert.match(text, /expo\.android\?\.package/);
  assert.match(text, /expo\.ios\?\.bundleIdentifier/);
  assert.match(text, /Missing approved android\.package/);
  assert.match(text, /Missing approved ios\.bundleIdentifier/);
  assert.match(text, /"\$eas" update/);
  assert.match(text, /"\$eas" build/);
  assert.match(text, /--profile preview/);
  assert.match(text, /--no-wait/);
  assert.match(text, /--non-interactive/);
  assert.doesNotMatch(text, /--profile production|--auto-submit|\beas init\b/);
  assert.doesNotMatch(text, /^\s+push:\s*$/m);
  assert.doesNotMatch(text, /^\s+pull_request:\s*$/m);
  assert.doesNotMatch(text, /workflow_run:/);
  assert.match(text, /github\.actor == 'im-tnyx'/);
  assert.match(text, /github\.triggering_actor == 'im-tnyx'/);
  assert.match(text, /github\.run_attempt == '1'/);
  assert.match(text, /github\.ref == 'refs\/heads\/main'/);
  assert.match(text, /tio-money-eas-preview-trusted/);
  assert.match(text, /EXPO_TOKEN: \$\{\{ secrets\.EXPO_TOKEN \}\}/);
  assert.doesNotMatch(text, /eas-cli@latest/);
  assert.match(text, /actions\/checkout@11bd71901bbe5b1630ceea73d27597364c9af683/);
  assert.match(text, /actions\/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1/);
  assert.doesNotMatch(text, /uses: actions\/(?:checkout|setup-node)@v[0-9]/);
  assert.ok(text.includes('EAS_CLI_VERSION: "27.4.1"'));
  assert.ok(text.includes('--registry=https://registry.npmjs.org'));
  assert.ok(text.includes('eas="$RUNNER_TEMP/tio-money-verified-eas-cli/node_modules/.bin/eas"'));
  assert.match(text, /npm ci --prefix/);
  assert.ok(text.includes('cp .github/preview-eas-cli/package-lock.json'));
  assert.doesNotMatch(text, /npm install --prefix/);
  assert.ok(text.includes('src/*|assets/*'));
  assert.match(text, /native_change=0/);
  assert.match(text, /npm audit signatures/);
  assert.match(text, /--ignore-scripts/);
  assert.match(text, /--branch pr-preview/);
  assert.match(text, /--environment preview/);
  assert.doesNotMatch(text, /--branch production|--channel production/);
  assert.match(text, /native_change=0/);
  assert.match(text, /\.head\.repo\.full_name == \$repo/);
  assert.match(text, /\.user\.login == "im-tnyx"/);
});

test('manual EAS PR number stays a strict positive integer string without relaxing publish gates', () => {
  const workflow = readFileSync(join(ROOT, '.github/workflows/tio-money-eas-pr-preview.yml'), 'utf8');
  const metadata = workflow.split('workflow_dispatch:')[1].split('\npermissions:')[0];
  assert.match(metadata, /      pr_number:\n(?:        [^\n]+\n){3}/);
  assert.match(metadata, /      pr_number:\n        description: [^\n]+\n        required: true\n        type: string\n/);
  assert.doesNotMatch(metadata, /^\s*type: number$/m);
  assert.ok(workflow.includes('PR_NUMBER: ${{ inputs.pr_number }}'));
  assert.ok(workflow.includes('if ! [[ "$PR_NUMBER" =~ ^[1-9][0-9]*$ ]]; then'));
  assert.ok(workflow.includes('gh api "repos/${GITHUB_REPOSITORY}/pulls/${PR_NUMBER}"'));
  const validPR = /^[1-9][0-9]*$/;
  for (const input of ['1', '18', '5000']) assert.ok(validPR.test(input), input);
  for (const input of ['18.0', '0', '018', '-18', '1e3', '18/../', '', '18 ', '+18']) {
    assert.equal(validPR.test(input), false, input);
  }
  assert.match(workflow, /github\.actor == 'im-tnyx'/);
  assert.match(workflow, /github\.triggering_actor == 'im-tnyx'/);
  assert.match(workflow, /github\.run_attempt == '1'/);
  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/);
  assert.ok(workflow.includes('.draft == false'));
  assert.ok(workflow.includes('if ! jq -e --arg repo "$GITHUB_REPOSITORY"'));
  assert.ok(workflow.includes('::error title=Draft PR not eligible::'));
  assert.ok(workflow.includes('::error title=Invalid PR selection::'));
  assert.ok(workflow.includes('::error title=Preview change scope::'));
  assert.ok(workflow.includes('.head.repo.full_name == $repo'));
  assert.ok(workflow.includes('.base.ref == "main"'));
  assert.ok(workflow.includes('src/*|assets/*'));
  assert.ok(workflow.includes('native_change=0'));
  assert.ok(workflow.includes('environment: tio-money-eas-preview-trusted'));
  assert.ok(workflow.includes('EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}'));
  assert.doesNotMatch(workflow, /pull_request_target/);
});

test('EAS preview permits normal tracked task/docs/tests with strict config exclusions', () => {
  const workflow = readFileSync(join(ROOT, '.github/workflows/tio-money-eas-pr-preview.yml'), 'utf8');
  const scope = workflow.split('case "$path" in\n')[1]?.split('\n')[0].trim();
  assert.equal(scope, 'src/*|assets/*|tests/*|docs/*.md|.ai/*.md|README.md|DESIGN.md|CHANGELOG.md) ;;');
  assert.ok(workflow.includes('if [[ "$native_change" -ne 0 ]]'));
  assert.ok(workflow.includes('::error title=Preview change scope::'));
  assert.ok(workflow.includes('.draft == false'));
  assert.ok(workflow.includes("github.actor == 'im-tnyx'"));
  assert.ok(workflow.includes('environment: tio-money-eas-preview-trusted'));
  assert.ok(workflow.includes('EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}'));
});

// The nonprivileged Phase 0 runner must also use the reviewed immutable
// setup-node commit, without enabling automatic PR dependency caching.
test('Phase 0 setup-node uses the reviewed pinned v7.1.0 SHA without automatic package cache', () => {
  const workflow = readFileSync(join(ROOT, '.github/workflows/phase-0-checks.yml'), 'utf8');
  assert.match(workflow, /actions\/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1/);
  assert.doesNotMatch(workflow, /uses: actions\/setup-node@v[0-9]/);
  assert.match(workflow, /^\s+package-manager-cache: false$/m);
});
