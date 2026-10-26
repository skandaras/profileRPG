/**
 * Missions: send the hero (and companion) off, come back later, claim.
 * The outcome is rolled from a seed stored at departure, so it cannot be
 * rerolled by reloading.
 */
import { randomUUID } from 'node:crypto';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { getItem, getMission, getSpecies } from '$lib/content';
import { MISSIONS } from '$lib/content/missions';
import { missionDurationMs, missionSlots, petBonus, resolveMission, successChance } from '$lib/game/missions';
import { randomSeed } from '$lib/game/rng';
import type { DbOrTx } from '../db';
import { missionRuns, pets } from '../db/schema';
import { emit, GameError, NotFound, notify, type Ctx } from '../events';
import { post } from './feed';
import { addItem } from './inventory';
import { addEgg, companionRow, givePetXp } from './pets';
import { grantGp, grantXp, playerModifiers, playerRow, playerStats } from './progression';

const TIER_TEXT = { great: 'A triumph', success: 'Success', partial: 'A bumpy trip' } as const;

export function openRuns(db: DbOrTx, userId: string) {
	return db
		.select()
		.from(missionRuns)
		.where(and(eq(missionRuns.userId, userId), isNull(missionRuns.claimedAt)))
		.all();
}

export function missionBoard(db: DbOrTx, userId: string, now: number) {
	const p = playerRow(db, userId);
	const mods = playerModifiers(db, userId);
	const stats = playerStats(p);
	const companion = companionRow(db, userId);
	const runs = openRuns(db, userId);
	const busyPets = new Set(runs.map((r) => r.petId));
	const pet =
		companion && companion.stage !== 'egg' && !busyPets.has(companion.id)
			? { level: companion.level, affinity: getSpecies(companion.speciesId)?.affinity ?? [] }
			: null;
	return {
		slots: missionSlots(mods),
		runs: runs.map((r) => {
			const m = getMission(r.missionId);
			return { id: r.id, missionId: r.missionId, name: m?.name ?? r.missionId, icon: m?.icon ?? '🗺️', startedAt: r.startedAt, endsAt: r.endsAt, ready: now >= r.endsAt, petId: r.petId };
		}),
		companion: companion && pet ? { id: companion.id, name: companion.name } : null,
		missions: MISSIONS.map((m) => ({
			...m,
			locked: p.level < m.minLevel,
			durationMs: missionDurationMs(m, mods),
			chance: Math.round(successChance(m, stats, petBonus(pet, m), mods) * 100),
			chanceAlone: Math.round(successChance(m, stats, 0, mods) * 100),
			running: runs.some((r) => r.missionId === m.id)
		}))
	};
}

export function startMission(ctx: Ctx, missionId: string, withPet: boolean) {
	const m = getMission(missionId);
	if (!m) throw new NotFound('No such mission');
	const p = playerRow(ctx.tx, ctx.userId);
	if (p.level < m.minLevel) throw new GameError(`Reach level ${m.minLevel} first`);
	const mods = playerModifiers(ctx.tx, ctx.userId);
	const runs = openRuns(ctx.tx, ctx.userId);
	if (runs.length >= missionSlots(mods)) throw new GameError('Your party is already out. Claim a mission first');
	if (runs.some((r) => r.missionId === m.id)) throw new GameError('Already on that mission');
	let petId: string | null = null;
	if (withPet) {
		const pet = companionRow(ctx.tx, ctx.userId);
		if (pet && pet.stage !== 'egg' && !runs.some((r) => r.petId === pet.id)) petId = pet.id;
	}
	ctx.tx
		.insert(missionRuns)
		.values({
			id: randomUUID(),
			userId: ctx.userId,
			missionId: m.id,
			petId,
			seed: randomSeed(),
			startedAt: ctx.now,
			endsAt: ctx.now + missionDurationMs(m, mods)
		})
		.run();
	notify(ctx, 'info', `Set off for ${m.name}`, m.icon);
}

export function claimMission(ctx: Ctx, runId: string) {
	const run = ctx.tx
		.select()
		.from(missionRuns)
		.where(and(eq(missionRuns.id, runId), eq(missionRuns.userId, ctx.userId)))
		.get();
	if (!run) throw new NotFound('No such mission');
	if (run.claimedAt) throw new GameError('Already claimed');
	if (ctx.now < run.endsAt) throw new GameError('Still on the road');
	const m = getMission(run.missionId);
	if (!m) throw new NotFound('That mission no longer exists');
	const p = playerRow(ctx.tx, ctx.userId);
	const mods = playerModifiers(ctx.tx, ctx.userId);
	const pet = run.petId ? ctx.tx.select().from(pets).where(eq(pets.id, run.petId)).get() : undefined;
	const bonus = petBonus(pet ? { level: pet.level, affinity: getSpecies(pet.speciesId)?.affinity ?? [] } : null, m);
	const outcome = resolveMission(m, playerStats(p), bonus, mods, run.seed);
	ctx.tx.update(missionRuns).set({ claimedAt: ctx.now, outcome }).where(eq(missionRuns.id, run.id)).run();

	notify(ctx, 'info', `${TIER_TEXT[outcome.tier]} at ${m.name}!`, m.icon);
	grantXp(ctx, outcome.xp);
	grantGp(ctx, outcome.gp);
	if (pet) givePetXp(ctx, pet, Math.round(outcome.xp / 2));
	for (const d of outcome.drops) {
		if ('gp' in d) grantGp(ctx, d.gp);
		else if ('egg' in d) addEgg(ctx, d.egg, `mission:${m.id}`);
		else if (getItem(d.item)) addItem(ctx, d.item, d.qty);
	}
	if (outcome.tier === 'great' || outcome.drops.some((d) => 'egg' in d)) {
		const found = outcome.drops.find((d) => 'egg' in d) ? ' and found an egg' : '';
		post(ctx, 'mission', `${p.heroName} had ${TIER_TEXT[outcome.tier].toLowerCase()} at ${m.name}${found}`, m.icon);
	}
	emit(ctx, { type: 'mission.claimed', missionId: m.id, tier: outcome.tier });
	return outcome;
}

export function recentRuns(db: DbOrTx, userId: string, limit = 5) {
	return db
		.select()
		.from(missionRuns)
		.where(eq(missionRuns.userId, userId))
		.orderBy(desc(missionRuns.startedAt))
		.limit(limit)
		.all()
		.filter((r) => r.claimedAt);
}
