import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  applyMigrations,
  migrations,
  type MigrationDriver,
} from '../../src/data/sqlite/migrations';

function fakeDatabase(startVersion = 0, failOn?: string) {
  let version = startVersion;
  const statements: string[] = [];
  const driver: MigrationDriver = {
    async readVersion() {
      return version;
    },
    async exec(sql) {
      if (failOn && sql.includes(failOn)) throw new Error('Injected write fault');
      statements.push(sql);
      if (sql.startsWith('PRAGMA user_version = ')) {
        version = Number(sql.slice('PRAGMA user_version = '.length));
      }
    },
    async transaction(task) {
      const savedVersion = version;
      const start = statements.length;
      try {
        await task();
      } catch (error) {
        version = savedVersion;
        statements.splice(start);
        throw error;
      }
    },
  };
  return { driver, statements, getVersion: () => version };
}

test('fresh initialization runs v1 and records a version', async () => {
  const database = fakeDatabase();
  assert.equal(await applyMigrations(database.driver), 1);
  assert.equal(database.getVersion(), 1);
  assert.ok(database.statements.some((sql) => sql.includes('app_settings')));
});

test('reopening a migrated database is idempotent', async () => {
  const database = fakeDatabase(1);
  assert.equal(await applyMigrations(database.driver), 1);
  assert.equal(database.statements.length, 0);
});

test('newer database blocks startup without downgrading', async () => {
  const database = fakeDatabase(5);
  await assert.rejects(() => applyMigrations(database.driver), /supported app version/);
  assert.equal(database.getVersion(), 5);
});

test('an interrupted migration does not advance version', async () => {
  const database = fakeDatabase(0, 'app_settings');
  await assert.rejects(() => applyMigrations(database.driver), /Injected write fault/);
  assert.equal(database.getVersion(), 0);
  assert.deepEqual(database.statements, []);
});

test('migration sequence must be contiguous', async () => {
  const database = fakeDatabase();
  await assert.rejects(
    () => applyMigrations(database.driver, [{ version: 2, statements: [] }]),
    /Invalid versioned migration plan/,
  );
});

test('migrations are ordered and do not create money tables in Phase 0', () => {
  assert.deepEqual(migrations.map((entry) => entry.version), [1]);
  assert.ok(migrations.every((entry) => entry.statements.every((sql) => !sql.includes('ledger_postings'))));
});
