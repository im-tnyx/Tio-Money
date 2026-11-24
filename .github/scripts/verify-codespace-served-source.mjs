// Trusted main-only source probe streamed into the verified Codespace.
// A successful Metro /status alone does not prove the current JS bundle.
import { Buffer } from 'node:buffer';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { requirePreviewListener } from './preflight-pr-codespaces-preview.mjs';

const ROOT = '/workspaces/Tio-Money';
const LIMIT = 96 * 1024 * 1024;
const MODULE = /^src\/(?:[^/\x00-\x1f]+\/)*[^/\x00-\x1f]+\.(?:[cm]?js|jsx|ts|tsx|json)$/u;
const PROJECT_ID = '722e6857-1159-4414-a024-6a4351e7d3e1';
const [sha, platform, mergeBase] = process.argv.slice(3);

export function verifySourceMap(map, tracked, affected) {
  if (!map || !Array.isArray(map.sources) || !Array.isArray(map.sourcesContent) ||
      map.sources.length !== map.sourcesContent.length) throw Error('Invalid Metro source map.');
  let matched = 0;
  const seen = new Set();
  for (let i = 0; i < map.sources.length; i++) {
    const source = map.sources[i];
    if (typeof source !== 'string') throw Error('Malformed Metro source path.');
    // Limit this comparison to the known checkout, not dependency packages
    // that also happen to have a node_modules/.../src directory.
    const path = source.replace(/^file:\/\/\/workspaces\/Tio-Money\//, '')
      .replace(/^\/workspaces\/Tio-Money\//, '');
    if (!MODULE.test(path)) continue;
    if (path.split('/').some((part) => part === '.' || part === '..')) {
      throw Error('Noncanonical Metro source path.');
    }
    if (!tracked.has(path)) throw Error('Metro contains source outside selected Git revision.');
    if (seen.has(path) || map.sourcesContent[i] !== tracked.get(path)) {
      throw Error('Metro source does not match the selected Git revision.');
    }
    seen.add(path);
    if (affected.has(path)) matched++;
  }
  return matched;
}

export function metroMapUrl(manifest, platform, port = 8081) {
  const raw = manifest?.launchAsset?.url;
  if (typeof raw !== 'string' || raw.length > 4096) throw Error('Missing Expo Go launch bundle.');
  const url = new URL(raw, 'http://127.0.0.1:8081/');
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
      !/^\/(?:node_modules\/expo-router\/entry|\.expo\/\.virtual-metro-entry|index)\.bundle$/.test(url.pathname) ||
      url.searchParams.getAll('platform').join(',') !== platform ||
      url.searchParams.getAll('dev').join(',') !== 'true') {
    throw Error('Unexpected Expo Go launch bundle.');
  }
  // Query the exact bundle parameters supplied by this local Metro manifest,
  // never follow the tunnel hostname or make an outbound HTTP request.
  url.protocol = 'http:';
  url.hostname = '127.0.0.1';
  url.port = String(port);
  url.pathname = url.pathname.replace(/\.bundle$/, '.map');
  return url.toString();
}

export async function readBounded(url, limit = LIMIT, headers = {}, port = 8081) {
  if (new URL(url).origin !== `http://127.0.0.1:${port}`) throw Error('Unexpected Metro probe endpoint.');
  const response = await fetch(url, { headers, redirect: 'error', signal: AbortSignal.timeout(120_000) });
  if (response.status !== 200 || response.redirected || !response.body) throw Error('Metro source-map request failed.');
  let size = 0;
  const chunks = [];
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > limit) throw Error('Metro response exceeds the safe limit.');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function main() {
  if (!/^[0-9a-f]{40}$/.test(sha) || !/^[0-9a-f]{40}$/.test(mergeBase) || !['android', 'ios', 'all'].includes(platform)) {
    throw Error('Invalid immutable source selection.');
  }
  const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  if (git('rev-parse', 'HEAD').trim() !== sha || git('status', '--porcelain=v1', '--untracked-files=normal').trim()) {
    throw Error('Codespace source moved or became dirty.');
  }
  const expo = JSON.parse(readFileSync(ROOT + '/app.json', 'utf8')).expo;
  if (expo.owner !== 'tnyx-23' || expo.slug !== 'tio-money' ||
      expo.extra?.eas?.projectId !== PROJECT_ID ||
      expo.updates?.url !== 'https://u.expo.dev/' + PROJECT_ID) {
    throw Error('Expo project identity changed.');
  }
  const files = git('ls-files', '-z', 'src').split('\0').filter(Boolean);
  const tracked = new Map(files.filter((f) => MODULE.test(f))
    .map((f) => [f, git('show', `HEAD:${f}`)]));
  const affected = new Set(git('diff', '--no-ext-diff', '--no-renames', '--name-only', '-z',
    mergeBase, sha, '--', 'src').split('\0').filter(Boolean));
  const outcomes = [];
  for (const p of platform === 'all' ? ['android', 'ios'] : [platform]) {
    try {
      const listener = await requirePreviewListener();
      const { port } = listener;
      const manifest = await readBounded(`http://127.0.0.1:${port}/`, 65536, { 'expo-platform': p }, port);
      await requirePreviewListener(listener);
      const count = verifySourceMap(await readBounded(metroMapUrl(manifest, p, port), LIMIT, {}, port), tracked, affected);
      await requirePreviewListener(listener);
      outcomes.push({ platform: p, status: count ? 'PASS' : 'UNVERIFIED', count });
    } catch {
      outcomes.push({ platform: p, status: 'FAILED', count: 0 });
    }
  }
  if (git('rev-parse', 'HEAD').trim() !== sha || git('status', '--porcelain=v1', '--untracked-files=normal').trim()) {
    throw Error('Codespace source changed during verification.');
  }
  for (const result of outcomes) {
    console.log(`Metro ${result.platform}: ${result.status} (${result.count} affected app modules verified).`);
  }
  if (outcomes.some(({ status }) => status !== 'PASS')) process.exitCode = 1;
}

if (process.argv[1] === '-') {
  main().catch(() => { console.error('Metro source verification failed closed.'); process.exitCode = 1; });
}
