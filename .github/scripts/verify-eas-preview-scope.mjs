import { Buffer } from 'node:buffer';
import { spawnSync } from 'node:child_process';
import { TextDecoder } from 'node:util';
import { pathToFileURL } from 'node:url';

const sha = /^[0-9a-f]{40}$/u;
const allowed = /^(?:(?:src|assets|tests)\/.+|(?:docs|\.ai)\/.+\.md|(?:README|DESIGN|CHANGELOG)\.md)$/su;

export function validateDiff({ status, error, signal, stdout }) {
  if (error || signal || status !== 0 || !Buffer.isBuffer(stdout) ||
      !stdout.length || stdout.at(-1) !== 0) {
    throw Error('Incomplete or unsuccessful EAS scope diff.');
  }
  const fields = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true })
    .decode(stdout).slice(0, -1).split('\0');
  const changedPaths = new Set();
  for (let index = 0; index < fields.length;) {
    const change = fields[index++];
    const paired = /^[RC](?:100|[0-9]{1,2})$/u.test(change);
    if (!paired && !/^(?:[ADT]|M(?:100|[0-9]{1,2})?)$/u.test(change)) {
      throw Error('Unexpected EAS scope diff record.');
    }
    const paths = fields.slice(index, index + (paired ? 2 : 1));
    if (paths.length !== (paired ? 2 : 1) || paths.some((path) =>
      !allowed.test(path) || /[\r\n]/u.test(path) ||
      path.split('/').some((part) => !part || part === '.' || part === '..'))) {
      throw Error('EAS permits app source/assets, tests and Markdown documentation/AI task records only.');
    }
    const path = paths.at(-1);
    if (changedPaths.has(path)) throw Error('Ambiguous duplicate EAS diff record.');
    changedPaths.add(path);
    index += paths.length;
  }
}

export function checkScope(base, head, operation) {
  if (!sha.test(base) || !sha.test(head)) throw Error('Invalid EAS scope commit.');
  validateDiff(spawnSync('git', ['diff', '--no-ext-diff', '--no-textconv',
    '--name-status', '-z', '-M', '-C', '-l0', '--find-copies-harder', `${base}...${head}`, '--'],
  { maxBuffer: 8 * 1024 * 1024, timeout: 30000 }));
  if (operation !== 'publish_draft_update') return;
  // Drafts run before code review. Compare both source trees directly so an
  // outdated draft cannot silently reintroduce old configuration from main.
  const diff = spawnSync('git', ['diff', '--no-ext-diff', '--no-textconv',
    '--name-status', '-z', base, head, '--'], { maxBuffer: 8 * 1024 * 1024, timeout: 30000 });
  if (diff.status !== 0 || diff.error || diff.signal || !Buffer.isBuffer(diff.stdout)) {
    throw Error('Unable to verify the Draft OTA base-to-head source tree.');
  }
  if (diff.stdout.length) validateDiff(diff);
  // A source or asset symlink could otherwise make bundling read outside the checkout.
  const tree = spawnSync('git', ['ls-tree', '-r', '-z', head],
    { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout: 30000 });
  if (tree.status !== 0 || tree.error || tree.signal || !tree.stdout.endsWith('\0') ||
      tree.stdout.split('\0').slice(0, -1).some((entry) => !/^100(?:644|755) blob /.test(entry))) {
    throw Error('Draft OTA requires a complete regular-file tree without symlinks or Git submodules.');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (![4, 5].includes(process.argv.length)) throw Error('Expected EAS base and head SHAs and optional operation.');
  checkScope(...process.argv.slice(2));
}
