// Trusted main-only source probe streamed into the verified Codespace.
// A successful Metro /status alone does not prove the current JS bundle.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const ROOT = '/workspaces/Tio-Money';
const LIMIT = 96 * 1024 * 1024;
const PROJECT_ID = '722e6857-1159-4414-a024-6a4351e7d3e1';
const [sha, platform] = process.argv.slice(3);

export function verifySourceMap(map, tracked) {
  if (!map || !Array.isArray(map.sources) || !Array.isArray(map.sourcesContent) ||
      map.sources.length !== map.sourcesContent.length) throw Error('Invalid Metro source map.');
  let matched = 0;
  const seen = new Set();
  for (let i = 0; i < map.sources.length; i++) {
    const source = String(map.sources[i]);
    // Metro paths may be absolute, file URLs or workspace relative.
    const match = source.match(/(?:^|\/)src\/[a-zA-Z0-9_./()-]+\.(?:js|jsx|ts|tsx)$/);
    if (!match) continue;
    const path = match[0].replace(/^\//, '');
    if (!tracked.has(path)) continue;
    if (seen.has(path) || map.sourcesContent[i] !== tracked.get(path)) {
      throw Error('Metro source does not match the selected Git revision.');
    }
    seen.add(path);
    matched++;
  }
  if (matched === 0) throw Error('Metro did not attest any tracked application source.');
  return matched;
}

async function readBounded(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(120_000) });
  if (!response.ok || !response.body) throw Error('Metro source-map request failed.');
  let size = 0;
  const chunks = [];
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > LIMIT) throw Error('Metro source map exceeds the safe limit.');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function main() {
  if (!/^[0-9a-f]{40}$/.test(sha) || !['android', 'ios', 'all'].includes(platform)) {
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
  const tracked = new Map(files.filter((f) => /^src\/[a-zA-Z0-9_./()-]+\.(?:js|jsx|ts|tsx)$/.test(f))
    .map((f) => [f, git('show', `HEAD:${f}`)]));
  for (const p of platform === 'all' ? ['android', 'ios'] : [platform]) {
    const url = `http://127.0.0.1:8081/node_modules/expo-router/entry.map?platform=${p}&dev=true&minify=false`;
    const count = verifySourceMap(await readBounded(url), tracked);
    console.log(`Metro ${p} source verified against selected Git HEAD (${count} app modules).`);
  }
  if (git('rev-parse', 'HEAD').trim() !== sha || git('status', '--porcelain=v1', '--untracked-files=normal').trim()) {
    throw Error('Codespace source changed during verification.');
  }
}

if (process.argv[1] === '-') {
  main().catch(() => { console.error('Metro source verification failed closed.'); process.exitCode = 1; });
}
