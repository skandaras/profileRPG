import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

// process.env is the fallback for tests: SvelteKit snapshots the dynamic env when
// Vite loads its config, so it cannot vary per vitest worker. See src/test-setup.ts.
export const dataDir = env.DATA_DIR || process.env.DATA_DIR || './data';
mkdirSync(dataDir, { recursive: true });

const sqlite = new Database(join(dataDir, 'levelup.db'));

// WAL is persistent once set. Switching needs an exclusive lock that ignores
// busy_timeout, so losing that race at boot must not take the process down when
// the file is almost certainly in WAL already.
try {
	sqlite.pragma('journal_mode = WAL');
} catch (err) {
	const mode = String(sqlite.pragma('journal_mode', { simple: true }) ?? '').toLowerCase();
	if (mode !== 'wal') {
		console.warn(`[db] could not switch to WAL (${err instanceof Error ? err.message : err}); running in "${mode}" mode`);
	}
}
sqlite.pragma('foreign_keys = ON');
sqlite.pragma('busy_timeout = 5000');
sqlite.pragma('synchronous = NORMAL');

export const db = drizzle(sqlite, { schema });
export type Db = typeof db;
/** The handle a transaction callback receives; module functions accept either. */
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];
export type DbOrTx = Db | Tx;

// Migrations ship with the image and run on every boot. They stay additive so a
// rollback to the previous image never meets a schema it cannot read.
export function runMigrations() {
	migrate(db, { migrationsFolder: 'drizzle' });
}
