import type { Difficulty, StatBlock, StatWeights } from '$lib/content/types';
import { STAT_IDS } from '$lib/content/stats';
import { mod, type Modifiers } from './modifiers';
import { normalizeWeights } from './stats';

export const BASE_XP: Record<Difficulty, number> = { easy: 10, medium: 20, hard: 35 };
export const BASE_GP: Record<Difficulty, number> = { easy: 2, medium: 4, hard: 7 };
/** What missing a period costs. Capped per visit in rollover. */
export const MISS_FINE: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 };
export const HAPPY_PET_BONUS = 0.05;

/** +10% per period in a row, up to +50%. */
export function streakBonus(streak: number): number {
	return Math.min(0.5, 0.1 * Math.max(0, streak));
}

/** Logging more (or less) than the habit's usual amount scales the reward, within reason. */
export function amountScale(amount: number | null | undefined, quantity: number | null | undefined): number {
	if (!amount || !quantity || amount <= 0 || quantity <= 0) return 1;
	return Math.min(2, Math.max(0.5, amount / quantity));
}

export interface ActivityReward {
	xp: number;
	gp: number;
	statXp: Partial<StatBlock>;
}

export function activityReward(opts: {
	difficulty: Difficulty;
	weights: StatWeights;
	streak: number;
	scale?: number;
	mods: Modifiers;
	petHappy: boolean;
}): ActivityReward {
	const w = normalizeWeights(opts.weights);
	const scale = opts.scale ?? 1;
	const base = BASE_XP[opts.difficulty] * scale;
	const streak = streakBonus(opts.streak);
	const statBonus = STAT_IDS.reduce((n, s) => n + (w[s] ?? 0) * mod(opts.mods, `xp.${s}`), 0);
	const xpMult = 1 + streak + statBonus + mod(opts.mods, 'xp.all') + (opts.petHappy ? HAPPY_PET_BONUS : 0);
	const gpMult = 1 + streak + mod(opts.mods, 'gp.all');
	// Training reflects the effort itself, so it takes no bonuses.
	const statXp: Partial<StatBlock> = {};
	for (const s of STAT_IDS) if (w[s]) statXp[s] = Math.max(1, Math.round(base * (w[s] ?? 0)));
	return {
		xp: Math.round(base * xpMult),
		gp: Math.round(BASE_GP[opts.difficulty] * scale * gpMult),
		statXp
	};
}
