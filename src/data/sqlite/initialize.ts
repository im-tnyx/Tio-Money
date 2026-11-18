import * as SQLite from 'expo-sqlite';

import { AppError } from '@/shared/errors/app-error';

import { applyMigrations, type MigrationDriver } from './migrations';

export interface InitializedDatabase {
  readonly db: SQLite.SQLiteDatabase;
  readonly version: number;
}

/**
 * One bootstrap connection; migration writes run before any feature access.
 * Financial write coordination is a separate Phase 2 design gate.
 */
let initialization: Promise<InitializedDatabase> | undefined;

async function openAndInitialize(): Promise<InitializedDatabase> {
  let db: SQLite.SQLiteDatabase | undefined;
  try {
    db = await SQLite.openDatabaseAsync('tio-money.db');
    // Must be enabled outside a transaction, on the actual working connection.
    await db.execAsync('PRAGMA foreign_keys = ON');
    const fk = await db.getFirstAsync<{ foreign_keys: number }>('PRAGMA foreign_keys');
    if (fk?.foreign_keys !== 1) {
      throw new AppError('DATABASE_INIT', 'Local database constraints could not be enabled.');
    }

    const activeDb = db;
    const driver: MigrationDriver = {
      async readVersion() {
        const row = await activeDb.getFirstAsync<{ user_version: number }>(
          'PRAGMA user_version',
        );
        return row?.user_version ?? 0;
      },
      transaction(work) {
        // Bootstrap has no concurrent feature writers. Phase 2 will serialize *all*
        // financial writes and retest transaction isolation on both platforms.
        return activeDb.withTransactionAsync(work);
      },
      exec(sql) {
        return activeDb.execAsync(sql);
      },
    };

    const version = await applyMigrations(driver);
    const fkAfterMigration = await activeDb.getFirstAsync<{ foreign_keys: number }>(
      'PRAGMA foreign_keys',
    );
    if (fkAfterMigration?.foreign_keys !== 1) {
      throw new AppError('DATABASE_INIT', 'Foreign-key validation failed after migration.');
    }
    return { db: activeDb, version };
  } catch (cause) {
    if (db) {
      try {
        await db.closeAsync();
      } catch {
        // Preserve the original startup failure; never delete a user database.
      }
    }
    if (cause instanceof AppError) throw cause;
    throw new AppError(
      'DATABASE_INIT',
      'Unable to open your local data. Nothing was erased. Retry or restart.',
      { cause },
    );
  }
}

export function initializeDatabase(): Promise<InitializedDatabase> {
  initialization ??= openAndInitialize().catch((error: unknown) => {
    initialization = undefined; // explicit retry, not a permanent rejected promise
    throw error;
  });
  return initialization;
}
