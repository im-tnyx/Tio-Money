import { AppError } from '@/shared/errors/app-error';

/**
 * Schema migrations are trusted, static SQL. No user input is ever interpolated.
 * Version 1 intentionally creates settings only: ledger DDL awaits Phase 2 ADR approval.
 */
export interface Migration {
  readonly version: number;
  readonly statements: readonly string[];
}

export interface MigrationDriver {
  readVersion(): Promise<number>;
  transaction(work: () => Promise<void>): Promise<void>;
  exec(trustedSql: string): Promise<void>;
}

export const migrations: readonly Migration[] = [
  {
    version: 1,
    statements: [
      'CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value_json TEXT NOT NULL, updated_at_ms INTEGER NOT NULL)',
    ],
  },
];

export async function applyMigrations(
  driver: MigrationDriver,
  plan: readonly Migration[] = migrations,
): Promise<number> {
  let previous = 0;
  for (const migration of plan) {
    if (!Number.isSafeInteger(migration.version) || migration.version !== previous + 1) {
      throw new AppError('DATABASE_MIGRATION', 'Invalid versioned migration plan.');
    }
    previous = migration.version;
  }

  let current = await driver.readVersion();
  if (!Number.isSafeInteger(current) || current < 0 || current > previous) {
    throw new AppError('DATABASE_MIGRATION', 'This database needs a supported app version.');
  }

  for (const migration of plan) {
    if (migration.version <= current) continue;

    await driver.transaction(async () => {
      for (const sql of migration.statements) await driver.exec(sql);
      // Validated version numbers from the immutable application registry only.
      await driver.exec('PRAGMA user_version = ' + migration.version);
    });
    current = migration.version;
  }
  return current;
}
