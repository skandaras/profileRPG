/**
 * XP, levels, GP, stats and abilities: everything that makes the hero stronger.
 */
import { eq } from 'drizzle-orm';
import { ABILITIES } from '$lib/content/abilities';
import { getAbility } from '$lib/content';
import { STAT_IDS } from '$lib/content/stats';
import type { StatBlock, StatId } from '$lib/content/types';
import { ABILITY_POINTS_PER_LEVEL, addXp, ATTR_POINTS_PER_LEVEL, removeXp } from '$lib/game/levels';
import { collectModifiers, type Modifiers } from '$lib/game/modifiers';
import { statTotals } from '$lib/game/stats';
import type { DbOrTx } from '../db';
import { playerAbilities, players } from '../db/schema';
import { emit, GameError, notify, on, type Ctx } from '../events';
import { post } from './feed';

export function playerRow(db: DbOrTx, userId: string) {
	const p = db.select().from(players).where(eq(players.userId, userId)).get();
	if (!p) throw new GameError('No hero yet');
	return p;
}

export function abilityIds(db: DbOrTx, userId: string): string[] {
	return db
		.select({ id: playerAbilities.abilityId })
		.from(playerAbilities)
		.where(eq(playerAbilities.userId, userId))
		.all()
		.map((r) => r.id);
}

export function playerModifiers(db: DbOrTx, userId: string): Modifiers {
	return collectModifiers(...abilityIds(db, userId).map((id) => getAbility(id)?.effects ?? []));
}

export function playerStats(p: { statXp: StatBlock; allocated: StatBlock }): StatBlock {
	return statTotals(p.statXp, p.allocated);
}

export function grantXp(ctx: Ctx, amount: number) {
	if (amount <= 0) return;
	const p = playerRow(ctx.tx, ctx.userId);
	const r = addXp(p.level, p.xp, amount);
	ctx.tx
		.update(players)
		.set({
			level: r.level,
			xp: r.xp,
			totalXp: p.totalXp + amount,
			attrPoints: p.attrPoints + r.levelsGained * ATTR_POINTS_PER_LEVEL,
			abilityPoints: p.abilityPoints + r.levelsGained * ABILITY_POINTS_PER_LEVEL
		})
		.where(eq(players.userId, ctx.userId))
		.run();
	notify(ctx, 'xp', `+${amount} XP`, '⭐');
	for (let l = p.level + 1; l <= r.level; l++) {
		notify(ctx, 'level', `Level up! You reached level ${l}`, '🎉');
		post(ctx, 'level', `${p.heroName} reached level ${l}`, '🎉');
		emit(ctx, { type: 'level.up', level: l });
	}
}

export function grantGp(ctx: Ctx, amount: number, quiet = false) {
	if (amount <= 0) return;
	const p = playerRow(ctx.tx, ctx.userId);
	ctx.tx.update(players).set({ gp: p.gp + amount }).where(eq(players.userId, ctx.userId)).run();
	if (!quiet) notify(ctx, 'gp', `+${amount} GP`, '🪙');
}

export function grantStatXp(ctx: Ctx, gains: Partial<StatBlock>, sign = 1) {
	const p = playerRow(ctx.tx, ctx.userId);
	const before = playerStats(p);
	const statXp = { ...p.statXp };
	for (const s of STAT_IDS) statXp[s] = Math.max(0, (statXp[s] ?? 0) + sign * (gains[s] ?? 0));
	ctx.tx.update(players).set({ statXp }).where(eq(players.userId, ctx.userId)).run();
	if (sign < 0) return;
	const after = playerStats({ ...p, statXp });
	for (const s of STAT_IDS) {
		if (after[s] > before[s]) notify(ctx, 'stat', `${s.toUpperCase()} trained up to ${after[s]}`, '💪');
	}
}

export function allocate(ctx: Ctx, stat: StatId, points: number) {
	const p = playerRow(ctx.tx, ctx.userId);
	const n = Math.floor(points);
	if (!STAT_IDS.includes(stat) || n < 1) throw new GameError('Pick a stat');
	if (n > p.attrPoints) throw new GameError('Not enough points');
	ctx.tx
		.update(players)
		.set({ attrPoints: p.attrPoints - n, allocated: { ...p.allocated, [stat]: (p.allocated[stat] ?? 0) + n } })
		.where(eq(players.userId, ctx.userId))
		.run();
	notify(ctx, 'stat', `${stat.toUpperCase()} +${n}`, '✨');
}

export function learnAbility(ctx: Ctx, abilityId: string) {
	const a = getAbility(abilityId);
	if (!a) throw new GameError('Unknown ability');
	const p = playerRow(ctx.tx, ctx.userId);
	const have = abilityIds(ctx.tx, ctx.userId);
	if (have.includes(a.id)) throw new GameError('Already learned');
	if (p.abilityPoints < 1) throw new GameError('No ability points to spend');
	if (p.level < a.minLevel) throw new GameError(`Reach level ${a.minLevel} first`);
	const missing = (a.requires ?? []).filter((r) => !have.includes(r));
	if (missing.length) throw new GameError(`Learn ${missing.map((m) => getAbility(m)?.name ?? m).join(', ')} first`);
	ctx.tx.insert(playerAbilities).values({ userId: ctx.userId, abilityId: a.id, acquiredAt: ctx.now }).run();
	ctx.tx.update(players).set({ abilityPoints: p.abilityPoints - 1 }).where(eq(players.userId, ctx.userId)).run();
	notify(ctx, 'info', `Learned ${a.name}`, a.icon);
	post(ctx, 'ability', `${p.heroName} learned ${a.name}`, a.icon);
}

export function abilityBoard(db: DbOrTx, userId: string, level: number) {
	const have = new Set(abilityIds(db, userId));
	return ABILITIES.map((a) => ({
		...a,
		learned: have.has(a.id),
		ready: !have.has(a.id) && level >= a.minLevel && (a.requires ?? []).every((r) => have.has(r))
	}));
}

interface ProgressionEffects {
	xp: number;
	gp: number;
	statXp: Partial<StatBlock>;
}

on('activity.logged', (ctx, e) => {
	grantXp(ctx, e.reward.xp);
	grantGp(ctx, e.reward.gp);
	grantStatXp(ctx, e.reward.statXp);
	e.effects.progression = { xp: e.reward.xp, gp: e.reward.gp, statXp: e.reward.statXp } satisfies ProgressionEffects;
});

/** Whether undoing a tick can take its XP back without un-levelling. */
export function canTakeBack(db: DbOrTx, userId: string, effects: Record<string, unknown>): boolean {
	const fx = effects.progression as ProgressionEffects | undefined;
	return !fx || removeXp(playerRow(db, userId).xp, fx.xp) !== null;
}

on('activity.undone', (ctx, e) => {
	const fx = e.effects.progression as ProgressionEffects | undefined;
	if (!fx) return;
	const p = playerRow(ctx.tx, ctx.userId);
	ctx.tx
		.update(players)
		.set({ xp: removeXp(p.xp, fx.xp) ?? p.xp, totalXp: Math.max(0, p.totalXp - fx.xp), gp: Math.max(0, p.gp - fx.gp) })
		.where(eq(players.userId, ctx.userId))
		.run();
	grantStatXp(ctx, fx.statXp, -1);
	notify(ctx, 'info', `Took back ${fx.xp} XP and ${fx.gp} GP`, '↩️');
});
