import type { LootEntry } from '$lib/content/missions';
import { intBetween, type Rng } from './rng';

export type Drop = { item: string; qty: number } | { egg: string } | { gp: number };

export function rollLoot(table: LootEntry[], rng: Rng): Drop | null {
	const total = table.reduce((n, e) => n + e.weight, 0);
	if (total <= 0) return null;
	let r = rng() * total;
	for (const e of table) {
		r -= e.weight;
		if (r >= 0) continue;
		if ('egg' in e) return { egg: e.egg };
		if ('gp' in e) return { gp: intBetween(rng, e.gp) };
		return { item: e.item, qty: e.qty ? intBetween(rng, e.qty) : 1 };
	}
	return null;
}
