// Read-only advisory-floor inventory for the isolated, pinned EAS CLI lockfile.
// Issue #59: https://github.com/im-tnyx/Tio-Money/issues/59
// These researched floors are NOT a complete npm audit or proof of safety.
// This file never contacts a registry, changes a dependency or reads credentials.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const RESEARCHED_FLOORS = Object.freeze({
  'node-forge': Object.freeze({ 1: '1.4.1' }),
  minimatch: Object.freeze({
    3: '3.1.4', 4: '4.2.5', 5: '5.1.8', 6: '6.2.2',
    7: '7.4.8', 8: '8.0.6', 9: '9.0.7', 10: '10.2.3',
  }),
  nanoid: Object.freeze({ 3: '3.3.18', 5: '5.1.16' }),
  joi: Object.freeze({ 17: '17.13.9', 18: '18.3.1' }),
  tar: Object.freeze({ 7: '7.5.21' }),
});

export function numericVersion(value) {
  // Prerelease and unknown formats must not be marked as fixed.
  const m = typeof value === 'string' && /^(\d+)\.(\d+)\.(\d+)$/.exec(value);
  return m ? m.slice(1).map(Number) : null;
}

export function compareNumericVersions(a, b) {
  const left = numericVersion(a);
  const right = numericVersion(b);
  if (!left || !right) return null;
  for (let i = 0; i < 3; i++) {
    if (left[i] !== right[i]) return Math.sign(left[i] - right[i]);
  }
  return 0;
}

export function researchFloorFor(name, version) {
  const parsed = numericVersion(version);
  if (!parsed) return null;
  return RESEARCHED_FLOORS[name]?.[parsed[0]] ?? null;
}

export function inventoryLockfile(lock) {
  if (!lock || typeof lock !== 'object' || !lock.packages || typeof lock.packages !== 'object') {
    throw new Error('Invalid npm lockfile: packages map missing');
  }
  if (lock.lockfileVersion !== 3 ||
      lock.packages['']?.dependencies?.['eas-cli'] !== '27.4.1' ||
      lock.packages['node_modules/eas-cli']?.version !== '27.4.1' ||
      lock.packages['']?.devDependencies?.typescript !== '5.9.3') {
    throw new Error('Refusing audit: reviewed EAS CLI / TypeScript / npm-lockfile identity changed');
  }
  const copies = [];
  for (const [path, pkg] of Object.entries(lock.packages)) {
    if (!path || !pkg?.version) continue;
    for (const name of Object.keys(RESEARCHED_FLOORS)) {
      if (path !== 'node_modules/' + name && !path.endsWith('/node_modules/' + name)) continue;
      const version = pkg.version;
      const floor = researchFloorFor(name, version);
      const comparison = floor ? compareNumericVersions(version, floor) : null;
      copies.push({
        name,
        path,
        version,
        researchedFloor: floor,
        result: comparison === null ? 'UNKNOWN' : comparison < 0 ? 'BELOW_FLOOR' : 'MEETS_FLOOR',
      });
    }
  }
  copies.sort((a, b) => a.name.localeCompare(b.name) || a.path.localeCompare(b.path));
  return {
    cliVersion: '27.4.1',
    note: 'Curated advisory floors only; npm audit, npm audit signatures, CI and Android/iOS Expo Go device QA remain mandatory.',
    copies,
    belowFloor: copies.filter((entry) => entry.result === 'BELOW_FLOOR').length,
    unknown: copies.filter((entry) => entry.result === 'UNKNOWN').length,
  };
}

const self = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (self) {
  const flags = new Set(process.argv.slice(2));
  const allowed = new Set(['--json', '--strict']);
  if ([...flags].some((f) => !allowed.has(f))) {
    console.error('Usage: node .github/preview-eas-cli/audit-security.mjs [--json] [--strict]');
    process.exitCode = 2;
  } else {
    try {
      const lockPath = fileURLToPath(new URL('./package-lock.json', import.meta.url));
      const report = inventoryLockfile(JSON.parse(readFileSync(lockPath, 'utf8')));
      if (flags.has('--json')) {
        console.log(JSON.stringify(report, null, 2));
      } else {
        for (const copy of report.copies) {
          console.log([copy.result, copy.name + '@' + copy.version, copy.path, 'floor=' + (copy.researchedFloor ?? 'UNMAPPED')].join(' | '));
        }
        console.log('Below researched floors: ' + report.belowFloor + '; unmapped: ' + report.unknown);
        console.log(report.note);
      }
      if (flags.has('--strict') && (report.belowFloor > 0 || report.unknown > 0)) process.exitCode = 1;
    } catch (error) {
      console.error('EAS security inventory aborted: ' + error.message);
      process.exitCode = 2;
    }
  }
}
