import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

const read = (path) => readFileSync(new URL('../../' + path, import.meta.url), 'utf8');
const workflow = read('.github/workflows/tio-money-eas-pr-preview.yml');
const validation = workflow.slice(workflow.indexOf('\n  validate:'), workflow.indexOf('\n  preview:'));
const publishing = workflow.slice(workflow.indexOf('\n  preview:'));
const script = (job, step) => job.split('      - name: ' + step + '\n')[1]
  .split('        run: |\n')[1].split('\n\n      - ')[0]
  .split('\n').map((line) => line.slice(10)).join('\n');
const validate = script(validation, 'Install locked project dependencies');
const root = script(publishing, 'Install locked project dependencies');
const cli = script(publishing, 'Install committed and verify EAS CLI without Expo credentials');
const revalidate = script(publishing, 'Revalidate immutable PR and source scope before EAS');
const cacheGuard = revalidate.split('test "$(git rev-parse HEAD)"')[0];
const publishStepName = 'Publish OTA or queue internal preview build (owner dispatch only)';
const publish = script(publishing, publishStepName);

test('both jobs retain v4 and Node 22 without restoring or saving Actions npm caches', () => {
  for (const job of [validation, publishing]) {
    assert.match(job, /setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020[\s\S]*?node-version: 22\.16\.0/);
    assert.doesNotMatch(job, /^\s*(?:cache|cache-dependency-path|package-manager-cache):|actions\/cache@|actions\/cache\//m);
  }
  assert.doesNotMatch(validation, /secrets\.EXPO_TOKEN/);
  assert.ok(publishing.indexOf('npm audit signatures') < publishing.indexOf('secrets.EXPO_TOKEN'));
  assert.equal(publishing.match(/npm audit signatures/g)?.length, 1);
  assert.match(root, /npm ci --ignore-scripts/);
  assert.match(cli, /npm ci --prefix[\s\S]*?--ignore-scripts/);
});

function fixture(run) {
  const dir = mkdtempSync(join(tmpdir(), 'tio-eas-cache-test-'));
  try {
    const temp = join(dir, 'runner');
    const isolated = join(temp, 'tio-money-verified-eas-cli');
    const initial = join(dir, 'default-cache');
    const trace = join(dir, 'trace');
    const source = join(dir, '.github/preview-eas-cli');
    mkdirSync(temp);
    mkdirSync(initial);
    mkdirSync(source, { recursive: true });
    writeFileSync(join(initial, 'sentinel'), 'must be left alone');
    for (const file of ['package.json', 'package-lock.json']) {
      writeFileSync(join(source, file), read('.github/preview-eas-cli/' + file));
    }
    writeFileSync(join(dir, 'npm'), `#!/bin/bash
set -eu
if [[ "$1" == config ]]; then
  printf '%s\\n' "${'${MISMATCH:-$NPM_CONFIG_CACHE}'}"
  exit
fi
[[ "$*" == *"--cache $NPM_CONFIG_CACHE --registry=https://registry.npmjs.org"* ]]
printf '%s|%s\\n' "$1" "$NPM_CONFIG_CACHE" >> "$TRACE"
if [[ "$1" == audit ]]; then exit "${'${AUDIT_EXIT:-0}'}"; fi
if [[ "$*" == *--prefix* ]]; then
  mkdir -p "$EAS_CLI_ROOT/node_modules/"{eas-cli,.bin}
  printf '{"version":"27.4.1"}' > "$EAS_CLI_ROOT/node_modules/eas-cli/package.json"
  printf '#!/bin/bash\\nexit 0\\n' > "$EAS_CLI_ROOT/node_modules/.bin/eas"
  chmod +x "$EAS_CLI_ROOT/node_modules/.bin/eas"
fi
`, { mode: 0o700 });
    const env = { ...process.env, PATH: dir + ':' + process.env.PATH, RUNNER_TEMP: temp,
      EAS_CLI_ROOT: isolated, EAS_CLI_VERSION: '27.4.1', NPM_CONFIG_CACHE: initial,
      GITHUB_ENV: join(dir, 'github-env'), GITHUB_OUTPUT: join(dir, 'github-output'), TRACE: trace };
    const execute = (command, overrides = {}) => spawnSync('bash', ['-c', command], {
      cwd: dir, env: { ...env, ...overrides }, encoding: 'utf8',
    });
    run({ execute, initial, temp, source, trace, env });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('install and signatures use three distinct private caches, ignoring the inherited cache', () => fixture(({ execute, initial, temp, trace }) => {
  let result = execute(validate);
  assert.equal(result.status, 0, result.stderr);
  const seed = readFileSync(trace, 'utf8').trim().split('|')[1];
  result = execute(root + '\n' + cli, { NPM_CONFIG_CACHE: seed });
  assert.equal(result.status, 0, result.stderr);
  const [validationPath, rootPath, cliPath, auditPath] = readFileSync(trace, 'utf8').trim().split('\n').map((line) => line.split('|')[1]);
  assert.equal(new Set([validationPath, rootPath, cliPath]).size, 3);
  assert.equal(auditPath, cliPath);
  for (const path of [validationPath, rootPath, cliPath]) {
    assert.ok(path.startsWith(temp + '/'));
    assert.equal(statSync(path).mode & 0o777, 0o700);
  }
  assert.equal(readFileSync(join(initial, 'sentinel'), 'utf8'), 'must be left alone');
}));

test('cache initialization, effective path, lock or signature failure stop before the next step', () => {
  for (const failure of ['directory', 'configuration', 'lock', 'integrity', 'signature']) {
    fixture(({ execute, source, temp, trace }) => {
      if (failure === 'lock' || failure === 'integrity') {
        const lockPath = join(source, 'package-lock.json');
        const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
        if (failure === 'lock') lock.packages['node_modules/eas-cli'].version = '0.0.0';
        else delete lock.packages['node_modules/eas-cli'].integrity;
        writeFileSync(lockPath, JSON.stringify(lock));
      }
      const overrides = {
        ...(failure === 'directory' && { RUNNER_TEMP: join(temp, 'absent') }),
        ...(failure === 'configuration' && { MISMATCH: '/unexpected-cache' }),
        ...(failure === 'signature' && { AUDIT_EXIT: '1' }),
      };
      const result = execute((['directory', 'configuration'].includes(failure) ? root : cli)
        + '\nprintf "next step reached\\n"', overrides);
      assert.notEqual(result.status, 0, failure);
      assert.doesNotMatch(result.stdout, /next step reached/);
      if (failure === 'signature') assert.equal(readFileSync(trace, 'utf8').match(/^audit\|/gm)?.length, 1);
      else assert.throws(() => readFileSync(trace));
    });
  }
});

test('the verified publisher root cache reaches downstream EAS subprocesses', () => fixture(({ execute, env, initial, trace }) => {
  const rootCacheBinding = 'NPM_CONFIG_CACHE: ${{ steps.publisher_npm.outputs.cache_path }}';
  const preTokenStep = publishing.split('      - name: Revalidate immutable PR and source scope before EAS\n')[1]
    .split('      - name: ' + publishStepName)[0];
  assert.ok(preTokenStep.includes(rootCacheBinding));
  assert.doesNotMatch(preTokenStep, /secrets\.EXPO_TOKEN/);
  assert.ok(publishing.split('      - name: ' + publishStepName)[1].includes(rootCacheBinding));
  assert.doesNotMatch(publishing.split('      - name: Install committed and verify EAS CLI without Expo credentials\n')[1]
    .split('      - name: Require the exact Draft OTA artifact identifier')[0], /steps\.publisher_npm/);

  const setup = execute(root + '\n' + cli);
  assert.equal(setup.status, 0, setup.stderr);
  const [applicationCache, verificationCache] = readFileSync(trace, 'utf8').trim().split('\n').map((line) => line.split('|')[1]);
  assert.equal(readFileSync(env.GITHUB_OUTPUT, 'utf8'), 'cache_path=' + applicationCache + '\n');
  assert.notEqual(applicationCache, verificationCache);

  writeFileSync(join(env.EAS_CLI_ROOT, 'node_modules/.bin/eas'), `#!/bin/bash
set -eu
printf 'child|%s|%s\\n' "$1" "$(npm config get cache)" >> "$TRACE"
`, { mode: 0o700 });
  for (const operation of ['publish_update', 'build_preview']) {
    const fixtureEnv = {
      NPM_CONFIG_CACHE: applicationCache, EXPO_TOKEN: 'synthetic-test-token',
      TARGET_OPERATION: operation, TARGET_PLATFORM: 'all', PR_NUMBER: '109', PR_SHA: 'a'.repeat(40),
    };
    const result = execute(cacheGuard + '\n' + publish, fixtureEnv);
    assert.equal(result.status, 0, result.stderr);
  }
  assert.deepEqual(readFileSync(trace, 'utf8').trim().split('\n').filter((line) => line.startsWith('child|')),
    ['child|update|' + applicationCache, 'child|build|' + applicationCache]);

  for (const overrides of [
    { NPM_CONFIG_CACHE: '' },
    { NPM_CONFIG_CACHE: initial },
    { NPM_CONFIG_CACHE: verificationCache },
    { NPM_CONFIG_CACHE: applicationCache, MISMATCH: initial },
  ]) {
    const result = execute(cacheGuard + '\nprintf "token step reachable\\n"', overrides);
    assert.notEqual(result.status, 0);
    assert.doesNotMatch(result.stdout, /token step reachable/);
  }
}));
