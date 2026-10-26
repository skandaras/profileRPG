/**
 * The bridge between SvelteKit and play(): guards, and turning the game's
 * refusals into HTTP. Every route goes through one of these.
 */
import { error, fail } from '@sveltejs/kit';
import type { SessionUser } from './auth';
import { GameError, NotFound, type Ctx, type Notice } from './events';
import { play } from './game';
import { db } from './db';
import { findPlayer } from './modules/player';

export function requireUser(locals: App.Locals): SessionUser {
	if (!locals.user) error(401, 'Unauthorized');
	return locals.user;
}

/** For loads: run inside the game transaction and return what fn built. */
export function read<T>(locals: App.Locals, fn: (ctx: Ctx) => T): T {
	const user = requireUser(locals);
	if (!findPlayer(db, user.id)) error(404, 'No hero yet');
	try {
		return play(user.id, fn).result;
	} catch (err) {
		if (err instanceof NotFound) error(404, err.message);
		throw err;
	}
}

/**
 * For form actions: run, and hand the page the notices to toast. A GameError
 * is a refusal the player should read, so it comes back as a 400 with its
 * own words rather than an error page.
 */
export function act(locals: App.Locals, fn: (ctx: Ctx) => unknown) {
	const user = requireUser(locals);
	try {
		const { notices } = play(user.id, fn);
		return { ok: true as const, notices };
	} catch (err) {
		if (err instanceof GameError) return fail(400, { ok: false as const, error: err.message, notices: [] as Notice[] });
		if (err instanceof NotFound) error(404, err.message);
		throw err;
	}
}

export function str(form: FormData, key: string): string {
	const v = form.get(key);
	return typeof v === 'string' ? v : '';
}

export function num(form: FormData, key: string): number | null {
	const v = form.get(key);
	if (typeof v !== 'string' || v.trim() === '') return null;
	const n = Number(v);
	return Number.isFinite(n) ? n : null;
}
