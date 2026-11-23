import { spawnSync } from 'node:child_process';
import { lstatSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const sha = /^[0-9a-f]{40}$/u;
const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/u;
const dashboard = 'https://expo.dev/accounts/tnyx-23/projects/tio-money/updates';

export function draftBranch(number) {
  if (!/^[1-9][0-9]*$/u.test(number)) throw Error('Draft OTA requires a positive integer PR number.');
  return 'pr-draft-' + number;
}

export function requireDraftSnapshot(pr, number, repo, head, base) {
  draftBranch(number);
  if (!sha.test(head) || !sha.test(base) || String(pr?.number) !== number ||
      pr.state !== 'open' || pr.draft !== true || pr.user?.login !== 'im-tnyx' ||
      pr.head?.repo?.full_name !== repo || pr.base?.repo?.full_name !== repo ||
      pr.head.ref === 'main' || pr.base.ref !== 'main' ||
      pr.head.sha !== head || pr.base.sha !== base) {
    throw Error('Draft PR eligibility or immutable head/base changed before publishing.');
  }
}

function nativePlatforms(platform) {
  if (platform === 'all') return ['android', 'ios'];
  if (['android', 'ios'].includes(platform)) return [platform];
  throw Error('Invalid native Draft OTA platform.');
}

function requireBundleFile(root, relative) {
  let path = root;
  const parts = relative.split('/');
  for (const [index, name] of parts.entries()) {
    path = join(path, name);
    const stat = lstatSync(path);
    if (index === parts.length - 1 ? !stat.isFile() : !stat.isDirectory()) {
      throw Error('Draft OTA artifact must contain only regular referenced files and directories.');
    }
  }
}

export function requireDraftBundle(root, platform) {
  if (!lstatSync(root).isDirectory()) throw Error('Draft OTA artifact directory is missing or unsafe.');
  requireBundleFile(root, 'metadata.json');
  const { bundler, fileMetadata } = JSON.parse(readFileSync(join(root, 'metadata.json'), 'utf8'));
  const platforms = nativePlatforms(platform);
  if (bundler !== 'metro' || Object.keys(fileMetadata ?? {}).sort().join(',') !== platforms.join(',')) {
    throw Error('Draft OTA export does not exactly match the requested native platforms.');
  }
  for (const target of platforms) {
    const { bundle, assets } = fileMetadata[target] ?? {};
    const pattern = new RegExp('^_expo/static/js/' + target + '/[a-zA-Z0-9_.-]+\\.(hbc|js)$', 'u');
    if (typeof bundle !== 'string' || !pattern.test(bundle) || !Array.isArray(assets)) {
      throw Error('Malformed Draft OTA launch bundle metadata.');
    }
    requireBundleFile(root, bundle);
    for (const asset of assets) {
      if (typeof asset?.path !== 'string' || !/^assets\/[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)?$/u.test(asset.path) ||
          typeof asset.ext !== 'string' || !/^[a-zA-Z0-9_-]+$/u.test(asset.ext)) {
        throw Error('Draft OTA asset metadata references an unsafe path or extension.');
      }
      requireBundleFile(root, asset.path);
    }
  }
  // The pinned publisher reads optional asset or source-map metadata when present.
  // The draft artifact consists only of its native bundles, assets and metadata.
  for (const name of ['assetmap.json', 'eas-update-metadata.json']) {
    if (lstatSync(join(root, name), { throwIfNoEntry: false })) {
      throw Error('Unexpected optional metadata in the Draft OTA artifact.');
    }
  }
}

export function assertUnmapped(channels, branchName, branchId) {
  for (const channel of channels) {
    const mapping = JSON.parse(channel.branchMapping);
    if (mapping?.version !== 0 || !Array.isArray(mapping.data) ||
        mapping.data.some((target) => !uuid.test(target?.branchId))) {
      throw Error('Cannot verify an unsupported Expo channel mapping.');
    }
    if (channel.name === branchName || mapping.data.some((target) => target.branchId === branchId)) {
      throw Error('Draft OTA branch is associated with an Expo channel. Publishing was refused.');
    }
  }
}

function readPages(eas, command, limit, selectPage) {
  const result = [];
  for (let offset = 0; offset < limit * 24; offset += limit) {
    const response = spawnSync(eas, [command, '--limit', String(limit), '--offset', String(offset), '--json', '--non-interactive'], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 4 * 1024 * 1024, timeout: 30_000,
    });
    if (response.status !== 0 || response.error) throw Error('Cannot inspect Expo branches and channel mappings.');
    const page = selectPage(JSON.parse(response.stdout));
    if (!Array.isArray(page) || page.length > limit || page.some((entry) =>
      typeof entry?.name !== 'string' || !uuid.test(entry.id))) {
      throw Error('Unexpected Expo branch or channel inventory.');
    }
    result.push(...page);
    if (page.length < limit) return result;
  }
  throw Error('Expo branch/channel inventory exceeded the bounded isolation check.');
}

function requireIsolation(eas, branch) {
  if (!/^pr-draft-[1-9][0-9]*$/u.test(branch)) throw Error('Unexpected Draft OTA branch namespace.');
  const matches = readPages(eas, 'branch:list', 50, (value) => value)
    .filter(({ name }) => name === branch);
  if (matches.length > 1) throw Error('Ambiguous Draft OTA branch.');
  const channels = readPages(eas, 'channel:list', 25, (value) => value?.currentPage);
  assertUnmapped(channels, branch, matches[0]?.id);
}

export function draftSummary(updates, number, head, platform) {
  const branch = draftBranch(number);
  const required = nativePlatforms(platform);
  if (!sha.test(head) || !Array.isArray(updates) ||
      updates.map((update) => update?.platform).sort().join(',') !== required.join(',') ||
      updates.some((update) => update.branch !== branch || update.gitCommitHash !== head ||
        !uuid.test(update.id) || !uuid.test(update.group) || !sha.test(update.runtimeVersion))) {
    throw Error('Expo reported publication but its result could not be safely verified. Check the isolated branch before retrying.');
  }
  const rows = updates.map((update) =>
    `| ${update.platform} | \`${update.runtimeVersion}\` | \`${update.id}\` | [${update.group}](${dashboard}/${update.group}) |`);
  return [
    '### Draft PR OTA published',
    '',
    `PR #${number} · commit \`${head}\` · EAS branch \`${branch}\``,
    '',
    '| Platform | Runtime fingerprint | Update ID | Expo group |',
    '|---|---|---|---|',
    ...rows,
    '',
    'Opening this update requires an authorized matching development build. Device loading has not been verified.',
  ].join('\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [command, ...args] = process.argv.slice(2);
    if (command === 'branch') console.log(draftBranch(args[0]));
    else if (command === 'selection') requireDraftSnapshot(JSON.parse(readFileSync(0, 'utf8')), ...args);
    else if (command === 'bundle') requireDraftBundle(...args);
    else if (command === 'isolation') requireIsolation(...args);
    else if (command === 'summary') console.log(draftSummary(JSON.parse(readFileSync(args.shift(), 'utf8')), ...args));
    else throw Error('Invalid trusted Draft OTA command.');
  } catch (error) {
    // Files and API payloads may contain signed URLs or untrusted text.
    const safe = error instanceof SyntaxError || error.code
      ? 'Unable to read or parse the expected Draft OTA data.'
      : error.message;
    console.error('Draft OTA: ' + safe);
    process.exitCode = 1;
  }
}
