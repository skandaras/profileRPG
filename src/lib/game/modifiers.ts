import type { Effect, ModifierKey } from '$lib/content/types';

/**
 * Everything that bends a rule (abilities now; gear, pet bonds or seasonal
 * events later) contributes keyed effects, summed here. Rules ask for a key and
 * never for a specific ability, which is what lets a new power be pure content.
 */
export type Modifiers = Partial<Record<ModifierKey, number>>;

export function collectModifiers(...sources: Effect[][]): Modifiers {
	const out: Modifiers = {};
	for (const effects of sources) for (const { key, value } of effects) out[key] = (out[key] ?? 0) + value;
	return out;
}

export function mod(m: Modifiers, key: ModifierKey): number {
	return m[key] ?? 0;
}
