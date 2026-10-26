import { STAT_IDS } from '$lib/content/stats';
import type { StatBlock, StatWeights } from '$lib/content/types';

/**
 * Each stat trains on its own curve from the activities tagged with it, and
 * level-ups add points on top. A stat's value is 1 + trained + allocated.
 */
export function statXpToNext(trained: number): number {
	return Math.round(20 + 15 * (trained + 1) ** 1.15);
}

export function training(xp: number): { level: number; into: number; next: number } {
	let level = 0;
	let rest = Math.max(0, xp);
	while (rest >= statXpToNext(level)) {
		rest -= statXpToNext(level);
		level++;
	}
	return { level, into: rest, next: statXpToNext(level) };
}

export function statTotals(statXp: StatBlock, allocated: StatBlock): StatBlock {
	const out = {} as StatBlock;
	for (const s of STAT_IDS) out[s] = 1 + training(statXp[s] ?? 0).level + (allocated[s] ?? 0);
	return out;
}

/** Weights scaled to sum to 1; an untagged activity counts as a little of everything. */
export function normalizeWeights(weights: StatWeights): StatWeights {
	const entries = STAT_IDS.map((s) => [s, Math.max(0, Number(weights[s]) || 0)] as const).filter(([, v]) => v > 0);
	const sum = entries.reduce((n, [, v]) => n + v, 0);
	if (!sum) return { str: 0.25, dex: 0.25, int: 0.25, kno: 0.25 };
	return Object.fromEntries(entries.map(([s, v]) => [s, v / sum]));
}
