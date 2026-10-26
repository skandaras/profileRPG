/**
 * The daily welcome-back ritual (see game/welcome.ts for the numbers).
 */
import { eq } from 'drizzle-orm';
import { getItem } from '$lib/content';
import { mod } from '$lib/game/modifiers';
import { arrive, GREET_JOY, GREET_XP, greetGp, MESS_GP, MESS_TIDINESS, MISSED_YOU_DAYS, RETURN_MILESTONES } from '$lib/game/welcome';
import type { DbOrTx } from '../db';
import { players } from '../db/schema';
import { GameError, notify, type Ctx } from '../events';
import { post } from './feed';
import { addItem } from './inventory';
import { freshenRoom } from './pets';
import { grantGp, grantXp, playerModifiers, playerRow } from './progression';

/** Runs at the start of every request; only the first one of a game day does anything. */
export function onArrive(ctx: Ctx) {
	const p = playerRow(ctx.tx, ctx.userId);
	const a = arrive(p.lastVisitDay, p.returnStreak, ctx.today);
	if (!a.newDay) return;
	ctx.tx
		.update(players)
		.set({
			lastVisitDay: ctx.today,
			returnStreak: a.returnStreak,
			welcomeDay: ctx.today,
			welcomeMess: a.mess,
			welcomeAway: a.daysAway,
			welcomeDone: false
		})
		.where(eq(players.userId, ctx.userId))
		.run();
}

export function welcomeState(db: DbOrTx, userId: string, today: number) {
	const p = playerRow(db, userId);
	const active = p.welcomeDay === today && !p.welcomeDone;
	return {
		active,
		mess: active ? p.welcomeMess : 0,
		daysAway: p.welcomeAway,
		returnStreak: p.returnStreak,
		missedYou: p.welcomeAway >= MISSED_YOU_DAYS
	};
}

export function cleanMess(ctx: Ctx) {
	const p = playerRow(ctx.tx, ctx.userId);
	if (p.welcomeDay !== ctx.today || p.welcomeDone || p.welcomeMess < 1) throw new GameError('All tidy already');
	ctx.tx.update(players).set({ welcomeMess: p.welcomeMess - 1 }).where(eq(players.userId, ctx.userId)).run();
	freshenRoom(ctx, MESS_TIDINESS);
	grantGp(ctx, MESS_GP, true);
	notify(ctx, 'gp', `Tidied! +${MESS_GP} GP`, '🧹');
}

export function greet(ctx: Ctx) {
	const p = playerRow(ctx.tx, ctx.userId);
	if (p.welcomeDay !== ctx.today || p.welcomeDone) throw new GameError('You already said hello today');
	if (p.welcomeMess > 0) throw new GameError('Tidy up first');
	ctx.tx.update(players).set({ welcomeDone: true }).where(eq(players.userId, ctx.userId)).run();
	freshenRoom(ctx, 0, GREET_JOY);
	grantXp(ctx, GREET_XP);
	const gp = greetGp(p.welcomeAway, mod(playerModifiers(ctx.tx, ctx.userId), 'welcome.gp'));
	if (p.welcomeAway >= MISSED_YOU_DAYS) {
		notify(ctx, 'pet', 'Your companion missed you so much! A welcome-home gift', '💝');
		post(ctx, 'return', `${p.heroName} is back after ${p.welcomeAway} days away`, '💝');
	}
	grantGp(ctx, gp);
	const milestone = RETURN_MILESTONES[p.returnStreak];
	if (milestone && getItem(milestone.item)) {
		notify(ctx, 'item', milestone.text, '🎁');
		addItem(ctx, milestone.item, milestone.qty, false);
	}
}
