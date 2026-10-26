/**
 * The one way into the game state. Every page load and every action runs
 * inside play(): one SQLite transaction that first catches up on anything that
 * happened while the player was away (closed habit periods, a new day's
 * welcome), then does the work, then hands back what to tell the player.
 */
import { gameDay } from '$lib/game/schedule';
import { now } from './clock';
import { db } from './db';
import type { Ctx, Notice } from './events';
import './modules';
import { rollover } from './modules/habits';
import { findPlayer } from './modules/player';
import { onArrive } from './modules/welcome';

export function play<T>(userId: string, fn: (ctx: Ctx) => T): { result: T; notices: Notice[] } {
	return db.transaction((tx) => {
		const t = now();
		const ctx: Ctx = { tx, userId, now: t, today: 0, notices: [] };
		const p = findPlayer(tx, userId);
		if (p) {
			ctx.today = gameDay(t, p.timezone, p.dayStartHour);
			rollover(ctx);
			onArrive(ctx);
		}
		const result = fn(ctx);
		return { result, notices: ctx.notices };
	});
}
