import { mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { vi } from 'vitest';

// Vite snapshots .env before workers start. Tests must use the worker's env,
// otherwise a local DATA_DIR can send every suite to the development database.
vi.mock('$env/dynamic/private', () => ({ env: process.env }));

/**
 * Give every vitest worker its own DATA_DIR, and therefore its own SQLite file.
 *
 * Suites run in parallel and open the database at import time. One shared file
 * means a worker switching to WAL while another migrates fails with SQLITE_BUSY,
 * and suites see each other's players. Wiped up front so no run inherits state.
 * This runs before any test module is imported, which is why it works:
 * db/index.ts reads DATA_DIR once, at import.
 */
const workerId = process.env.VITEST_WORKER_ID ?? process.env.VITEST_POOL_ID ?? String(process.pid);
const dir = join(tmpdir(), `levelup-test-${process.pid}-${workerId}`);

rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
process.env.DATA_DIR = dir;
