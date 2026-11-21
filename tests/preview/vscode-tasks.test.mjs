import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const config = JSON.parse(read('.vscode/tasks.json'));

test('Codespaces exposes exactly the two requested selectable tasks', () => {
  assert.equal(config.version, '2.0.0');
  assert.deepEqual(config.tasks.map((task) => task.label), [
    'Start Expo Project (Tunnel)',
    'Git Pull (FF-only)',
  ]);
  for (const task of config.tasks) {
    assert.equal(task.type, 'process');
    assert.deepEqual(task.options, { cwd: '${workspaceFolder}' });
    assert.deepEqual(task.problemMatcher, []);
    assert.equal(task.presentation?.reveal, 'always');
  }
});

test('Expo task reuses the project-owned managed tunnel instead of launching duplicate Metro', () => {
  const task = config.tasks[0];
  assert.equal(task.command, 'node');
  assert.deepEqual(task.args, ['scripts/start-codespace-expo.mjs', '--start']);
  assert.equal(JSON.parse(read('.devcontainer/devcontainer.json')).postStartCommand,
    'node scripts/start-codespace-expo.mjs');
  assert.equal(JSON.parse(read('package.json')).scripts.mobile, 'expo start --tunnel --go');
});

test('Pull task is fast-forward-only and follows the checked-out branch upstream', () => {
  const task = config.tasks[1];
  assert.equal(task.command, 'git');
  assert.deepEqual(task.args, ['pull', '--ff-only']);
  assert.equal(task.args.some((arg) => ['main', 'master', 'checkout', 'reset', 'stash',
    'rebase', '--force'].includes(arg)), false);
});

test('Only the task configuration is unignored inside .vscode', () => {
  const ignore = read('.gitignore');
  assert.match(ignore, /^\.vscode\/\*$/m);
  assert.match(ignore, /^!\.vscode\/tasks\.json$/m);
  assert.doesNotMatch(ignore, /^\.vscode\/$/m);
});
