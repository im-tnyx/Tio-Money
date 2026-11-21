// Issue #59: isolated EAS security audit without changing the QR-free Expo Go flow.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  compareNumericVersions, inventoryLockfile, numericVersion, researchFloorFor,
} from '../../.github/preview-eas-cli/audit-security.mjs';

function fixture(nanoidVersion = '3.3.8', joiVersion = '17.13.9') {
  return {
    lockfileVersion: 3,
    packages: {
      '': { dependencies: { 'eas-cli': '27.4.1' }, devDependencies: { typescript: '5.9.3' } },
      'node_modules/eas-cli': { version: '27.4.1' },
      'node_modules/nanoid': { version: nanoidVersion },
      'node_modules/@expo/steps/node_modules/joi': { version: joiVersion },
    },
  };
}

test('security audit compares numeric versions and never treats prereleases as fixed', () => {
  assert.deepEqual(numericVersion('3.3.18'), [3, 3, 18]);
  assert.equal(compareNumericVersions('3.3.18', '3.3.18'), 0);
  assert.equal(compareNumericVersions('3.3.17', '3.3.18'), -1);
  assert.equal(compareNumericVersions('3.3.19', '3.3.18'), 1);
  assert.equal(compareNumericVersions('3.3.18-rc.1', '3.3.18'), null);
  assert.equal(researchFloorFor('minimatch', '3.1.5'), '3.1.4');
  assert.equal(researchFloorFor('minimatch', '10.2.6'), '10.2.3');
  assert.equal(researchFloorFor('node-forge', '1.4.1'), '1.4.3');
  assert.equal(researchFloorFor('ajv', '8.11.0'), '8.18.0');
  assert.equal(researchFloorFor('yaml', '2.6.0'), '2.8.3');
  assert.equal(researchFloorFor('glob', '14.0.2'), '14.0.2');
  assert.equal(researchFloorFor('minimatch', '11.0.9'), '11.0.1');
  assert.equal(researchFloorFor('uuid', '11.1.1'), '11.1.1');
  assert.equal(researchFloorFor('ts-deepmerge', '8.0.0'), '8.0.0');
  assert.equal(researchFloorFor('nanoid', '6.0.0'), null);
});

test('inventory discovers nested transitive copies, tracks known floors and unknowns', () => {
  const old = inventoryLockfile(fixture());
  assert.equal(old.belowFloor, 1);
  assert.equal(old.unknown, 0);
  assert.deepEqual(old.copies.map((row) => [row.name, row.result]), [
    ['joi', 'MEETS_FLOOR'],
    ['nanoid', 'BELOW_FLOOR'],
  ]);
  const upgraded = inventoryLockfile(fixture('3.3.18'));
  assert.equal(upgraded.belowFloor, 0);
  assert.equal(upgraded.unknown, 0);
  const future = inventoryLockfile(fixture('6.0.0'));
  assert.equal(future.unknown, 1);
});

test('audit fails closed for missing or changed trusted EAS CLI identity', () => {
  assert.throws(() => inventoryLockfile({}), /Invalid npm lockfile/);
  const altered = fixture();
  altered.packages[''].dependencies['eas-cli'] = '28.0.0';
  assert.throws(() => inventoryLockfile(altered), /identity changed/);
});

test('actual isolated lockfile remains valid and auditable without any installation', () => {
  const lock = JSON.parse(readFileSync(new URL('../../.github/preview-eas-cli/package-lock.json', import.meta.url), 'utf8'));
  const report = inventoryLockfile(lock);
  assert.equal(report.cliVersion, '27.4.1');
  assert.ok(Array.isArray(report.copies));
  assert.equal(report.belowFloor, 0);
  assert.equal(report.unknown, 0);
});

test('QR-free Expo Go entry point and project identity stay unchanged', () => {
  const root = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
  const app = JSON.parse(readFileSync(new URL('../../app.json', import.meta.url), 'utf8')).expo;
  assert.equal(root.scripts.mobile, 'expo start --tunnel --go');
  assert.equal(app.owner, 'tnyx-23');
  assert.equal(app.slug, 'tio-money');
  assert.equal(app.extra?.eas?.projectId, '722e6857-1159-4414-a024-6a4351e7d3e1');
});
