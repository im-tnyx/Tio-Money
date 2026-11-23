import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { metroMapUrl, verifySourceMap } from '../../.github/scripts/verify-codespace-served-source.mjs';
import { ownedMetro, preflightDecision } from '../../.github/scripts/preflight-pr-codespaces-preview.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p) => readFileSync(join(root, p), 'utf8');
const manual = read('.github/workflows/tio-money-eas-pr-preview.yml');
const worker = read('.github/workflows/tio-money-codespaces-pr-preview.yml');
const recheck = read('.github/scripts/recheck-codespaces-preview.sh');
const sync = read('.github/scripts/sync-pr-codespaces-preview.sh');
const check = read('.github/scripts/check-pr-codespaces-preview.sh');
const starter = read('scripts/start-codespace-expo.mjs');
const source = read('.github/scripts/verify-codespace-served-source.mjs');
const preflight = read('.github/scripts/preflight-pr-codespaces-preview.mjs');

test('one manual entry routes three operations with isolated environments and secrets', () => {
  assert.match(manual, /^name: TIO MONEY EXPO PR REVIEW$/m);
  assert.equal((manual.match(/^  workflow_dispatch:$/gm) || []).length, 1);
  assert.doesNotMatch(worker, /^  workflow_dispatch:$/m);
  assert.match(worker, /^  workflow_call:$/m);
  assert.match(manual, /default: codespaces_live\s+type: choice\s+options:\s+- codespaces_live\s+- publish_update\s+- build_preview/);
  assert.match(manual, /inputs.operation == 'codespaces_live'/);
  assert.match(manual, /inputs.operation == 'publish_update' \|\| inputs.operation == 'build_preview'/);
  assert.match(manual, /uses: \.\/\.github\/workflows\/tio-money-codespaces-pr-preview\.yml/);
  assert.doesNotMatch(manual, /secrets: inherit|secrets\.CODESPACES_TOKEN/);
  assert.doesNotMatch(worker, /secrets\.EXPO_TOKEN/);
  assert.match(manual, /environment: tio-money-eas-preview-trusted/);
  assert.match(worker, /environment: tio-money-codespaces-trusted/);
  assert.match(manual, /EXPO_TOKEN: \$\{\{ secrets\.EXPO_TOKEN \}\}/);
  assert.match(worker, /GH_TOKEN: \$\{\{ secrets\.CODESPACES_TOKEN \}\}/);
  assert.match(manual, /pr_number:\s+description: [^\n]+\s+required: true\s+type: string/);
  assert.match(worker, /if \[\[ ! "\$INPUT_PR" =~ \^\[1-9\]\[0-9\]\*\$ \]\]/);
  assert.match(manual, /android\|ios\|all/);
  assert.match(worker, /android\|ios\|all/);
  const selection = manual.slice(manual.indexOf('  select:'), manual.indexOf('  validate:'));
  const validation = manual.slice(manual.indexOf('  validate:'), manual.indexOf('  preview:'));
  const publishing = manual.slice(manual.indexOf('  preview:'));
  assert.ok(selection.includes('base_sha: ${{ steps.pr.outputs.base_sha }}'));
  assert.match(selection, /head_sha: \$\{\{ steps\.pr\.outputs\.head_sha \}\}/);
  assert.doesNotMatch(selection, /checkout@|npm run check|environment:|secrets\./);
  assert.match(validation, /needs: select/);
  assert.match(validation, /SELECTED_SHA: \$\{\{ needs\.select\.outputs\.head_sha \}\}/);
  assert.ok(validation.includes('SELECTED_BASE: ${{ needs.select.outputs.base_sha }}'));
  assert.ok(validation.includes('!= "$SELECTED_BASE"'));
  assert.match(validation, /PR advanced since trusted selection/);
  assert.doesNotMatch(validation, /^    environment:|secrets\.EXPO_TOKEN|secrets\.CODESPACES_TOKEN/m);
  assert.match(validation, /npm run check/);
  assert.doesNotMatch(validation, /^    outputs:/m);
  assert.match(publishing, /needs: \[select, validate\]/);
  assert.match(publishing, /VALIDATED_SHA: \$\{\{ needs\.select\.outputs\.head_sha \}\}/);
  assert.ok(publishing.includes('SELECTED_BASE: ${{ needs.select.outputs.base_sha }}'));
  assert.ok(publishing.includes('!= "$SELECTED_BASE"'));
  assert.match(publishing, /PR advanced since secretless validation/);
  assert.match(publishing, /npm ci --ignore-scripts/);
  assert.doesNotMatch(publishing, /npm run check|npx expo install --check/);
  assert.equal((publishing.match(/EXPO_TOKEN: \$\{\{ secrets\.EXPO_TOKEN \}\}/g) || []).length, 1);
});

test('push signal reaches Codespaces only; EAS safeguards and scope remain', () => {
  assert.match(worker, /workflow_run:\s+workflows:/);
  assert.doesNotMatch(manual, /^  workflow_run:$/m);
  assert.match(worker, /workflow_run\.event == 'push'/);
  assert.match(worker, /workflow_run\.head_repository\.full_name == 'im-tnyx\/Tio-Money'/);
  assert.match(worker, /github\.run_attempt == '1'/);
  assert.match(worker, /Exactly one open PR may carry tio-preview/);
  assert.match(worker, /compare\/\$\{PR_BASE_SHA\}\.\.\.\$\{PR_SHA\}/);
  assert.match(recheck, /src\/\*\|assets\/\*\|tests\/\*\|docs\/\*/);
  assert.match(manual, /\.draft == false/);
  assert.match(manual, /Missing approved android\.package/);
  assert.match(manual, /Missing approved ios\.bundleIdentifier/);
  assert.match(manual, /npm audit signatures/);
  assert.match(manual, /"\$eas" update/);
  assert.match(manual, /"\$eas" build/);
});

test('same SHA is a healthy no-op; new SHA never stops a healthy Metro/tunnel', () => {
  assert.match(check, /git status --porcelain=v1 --untracked-files=normal/);
  assert.doesNotMatch(check, /start-codespace-expo\.mjs --preflight/);
  assert.match(worker, /--status < "\$RUNNER_TEMP\/trusted-metro-starter\.mjs"/);
  assert.match(worker, /< \.github\/scripts\/preflight-pr-codespaces-preview\.mjs/g);
  assert.match(check, /EXACT_SHA/);
  assert.match(worker, /steps.existing.outputs.no_op != 'true'/);
  assert.match(worker, /Verify served Metro source and healthy tunnel/);
  assert.match(sync, /git fetch --no-tags "\$bundle_path" "refs\/tio-preview\/selected"/);
  assert.match(sync, /run_trusted_metro_sync "\$before_sha" "\$target_sha"/);
  assert.doesNotMatch(sync, /start-codespace-expo\.mjs --stop|git (?:reset|clean)|git pull/);
  assert.match(worker, /< "\$RUNNER_TEMP\/trusted-metro-sync\.sh"/);
  assert.match(worker, /gh: The codespace is already running \(HTTP 409\)/);
  assert.match(worker, /for attempt in \$\(seq 1 120\); do/);
  assert.match(worker, /if \[\[ "\$state" != "Available" \]\]/);
});

test('trusted preflight supports old starters and refuses ambiguous Metro ownership', () => {
  const record = { pid: 321, startTicks: '12345' };
  const proc = { startTicks: '12345', cwd: '/workspaces/Tio-Money', command: 'node /usr/lib/node_modules/npm/bin/npm-cli.js run mobile' };
  assert.equal(ownedMetro(record, proc), true);
  assert.equal(preflightDecision(true, record, proc, false), 'OWNED_METRO');
  assert.equal(preflightDecision(false, null, null, true), 'EMPTY_PORT');
  for (const foreign of [null, { ...proc, cwd: '/workspaces/another' },
    { ...proc, startTicks: 'changed' }, { ...proc, command: 'node unowned-metro.js' }]) {
    assert.throws(() => preflightDecision(true, record, foreign, false), /ownership is uncertain/);
  }
  assert.throws(() => preflightDecision(false, null, null, false), /occupied without/);
  assert.match(preflight, /lstatSync\(recordPath\)/);
  assert.match(preflight, /stat\.uid !== process\.getuid\(\)/);
  assert.doesNotMatch(preflight, /process\.kill|rmSync|child_process/);
  assert.equal((worker.match(/< \.github\/scripts\/preflight-pr-codespaces-preview\.mjs/g) || []).length, 2);
});

test('served source map is matched byte-for-byte against selected tracked Git source', () => {
  const files = new Map([['src/app/index.tsx', 'export default 1;']]);
  const affected = new Set(files.keys());
  const good = { sources: ['file:///workspaces/Tio-Money/src/app/index.tsx'], sourcesContent: ['export default 1;'] };
  assert.equal(verifySourceMap(good, files, affected), 1);
  assert.throws(() => verifySourceMap({ ...good, sourcesContent: ['old'] }, files, affected), /does not match/);
  assert.equal(verifySourceMap({ sources: ['other.tsx'], sourcesContent: ['test'] }, files, affected), 0);
  assert.throws(() => verifySourceMap({ sources: ['src/app/deleted.tsx', 'src/app/index.tsx'], sourcesContent: ['old', 'export default 1;'] }, files, affected), /outside selected/);
  assert.equal(verifySourceMap({ sources: ['node_modules/lib/src/other.ts', 'src/app/index.tsx'], sourcesContent: ['external', 'export default 1;'] }, files, affected), 1);
  assert.throws(() => verifySourceMap({ ...good, sources: [...good.sources, ...good.sources], sourcesContent: [...good.sourcesContent, ...good.sourcesContent] }, files, affected), /does not match/);
  assert.match(source, /git\('rev-parse', 'HEAD'\)\.trim\(\) !== sha/);
  assert.match(source, /expo\.extra\?\.eas\?\.projectId !== PROJECT_ID/);
  assert.match(source, /AbortSignal\.timeout\(120_000\)/);
  assert.match(source, /size > limit/);
  assert.match(worker, /node --input-type=module - -- "\$TARGET_SHA" "\$TARGET_PLATFORM"/);
  assert.equal(metroMapUrl({ launchAsset: {
    url: 'https://signed.on.expo.app/node_modules/expo-router/entry.bundle?platform=ios&dev=true&transform.routerRoot=src%2Fapp',
  } }, 'ios'), 'http://127.0.0.1:8081/node_modules/expo-router/entry.map?platform=ios&dev=true&transform.routerRoot=src%2Fapp');
  for (const url of ['https://evil.example/private?platform=ios&dev=true',
    'file:///etc/passwd', 'https://x/index.bundle?platform=android&dev=true',
    'https://x/index.bundle?platform=ios&platform=android&dev=true',
    'https://x/index.bundle?platform=ios&dev=true&dev=false',
    'https://x/index.bundle?platform=ios&dev=false']) {
    assert.throws(() => metroMapUrl({ launchAsset: { url } }, 'ios'), /Unexpected/);
  }
});

test('controlled runtime recovery stops only owned Metro before detaching or installing', () => {
  const start = starter.indexOf('async function syncSelected(');
  const end = starter.indexOf('async function main()', start);
  const syncSelected = starter.slice(start, end);
  const incompatible = syncSelected.indexOf('!compatibleRuntime(current, fingerprint, dependenciesReady)');
  const stop = syncSelected.indexOf('await stopManaged();', incompatible);
  const checkout = syncSelected.indexOf("'switch', '--detach', target");
  const install = syncSelected.indexOf("spawnSync('npm', ['ci'");
  const reuse = syncSelected.indexOf('compatible Metro PID and tunnel reused');
  const startManaged = syncSelected.indexOf('await startManaged(fingerprint)');
  assert.ok(incompatible >= 0 && incompatible < stop && stop < checkout && checkout < install);
  assert.ok(install < reuse && reuse < startManaged);
  assert.match(starter, /await withLock\(async \(\) => \{\n      const current = checkedManagedRecord\(\);\n      if \(current\) verifyListener\(current\);/);
  assert.match(starter, /verifyListener\(record\);\n  if \(!recordMatches/);
  assert.match(syncSelected, /currentRecord.pid !== managed.pid/);
  assert.match(syncSelected, /await ownedTunnel\(currentRecord\) !== previousTunnel/);
  assert.match(starter, /requireSyncSnapshot\(before,/);
  assert.match(starter, /'FETCH_HEAD\^\{commit\}'/);
});
