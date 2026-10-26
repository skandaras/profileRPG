import type { Mission } from '$lib/content/missions';
import type { StatBlock, StatId } from '$lib/content/types';
import { rollLoot, type Drop } from './loot';
import { mod, type Modifiers } from './modifiers';
import { seeded } from './rng';

export const BASE_MISSION_SLOTS = 1;

export function missionSlots(mods: Modifiers): number {
	return BASE_MISSION_SLOTS + Math.max(0, Math.floor(mod(mods, 'mission.slots')));
}

export function missionDurationMs(m: Mission, mods: Modifiers): number {
	return Math.round(m.minutes * 60_000 * Math.max(0.5, 1 + mod(mods, 'mission.duration')));
}

/** A companion helps a little for its level, and more on missions that test its favourite stats. */
export function petBonus(pet: { level: number; affinity: StatId[] } | null, m: Mission): number {
	if (!pet) return 0;
	const tested = Object.keys(m.recommended) as StatId[];
	const fits = pet.affinity.some((s) => tested.includes(s));
	return Math.min(0.15, 0.01 * pet.level + (fits ? 0.05 : 0));
}

export function successChance(m: Mission, stats: StatBlock, bonus: number, mods: Modifiers): number {
	const tested = Object.entries(m.recommended) as [StatId, number][];
	const gap = tested.length ? tested.reduce((n, [s, want]) => n + (stats[s] - want), 0) / tested.length : 0;
	const chance = 0.65 + gap * 0.06 + bonus + mod(mods, 'mission.success');
	return Math.min(0.97, Math.max(0.25, chance));
}

export type Tier = 'great' | 'success' | 'partial';

export interface Outcome {
	tier: Tier;
	chance: number;
	xp: number;
	gp: number;
	drops: Drop[];
}

const TIER_MULT: Record<Tier, number> = { great: 1.25, success: 1, partial: 0.4 };

/**
 * Settle a mission from its seed. A failed roll is a "partial": a fraction of
 * the reward and a coin-flip at one find, so a long trip never comes back empty.
 */
export function resolveMission(m: Mission, stats: StatBlock, bonus: number, mods: Modifiers, seed: number): Outcome {
	const rng = seeded(seed);
	const chance = successChance(m, stats, bonus, mods);
	const r = rng();
	const tier: Tier = r < chance * 0.3 ? 'great' : r < chance ? 'success' : 'partial';
	let rolls = tier === 'great' ? 2 : tier === 'success' ? 1 : rng() < 0.5 ? 1 : 0;
	if (rng() < mod(mods, 'loot.extra')) rolls++;
	const drops: Drop[] = [];
	for (let i = 0; i < rolls; i++) {
		const d = rollLoot(m.loot, rng);
		if (d) drops.push(d);
	}
	return {
		tier,
		chance,
		xp: Math.round(m.xp * TIER_MULT[tier]),
		gp: Math.round(m.gp * TIER_MULT[tier]),
		drops
	};
}
