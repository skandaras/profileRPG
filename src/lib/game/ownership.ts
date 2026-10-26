import type { Unlock } from '$lib/content/types';

/**
 * Starter and level unlocks are owned implicitly, so adding a level-10 hat is a
 * content change with nothing to backfill. Shop and drop unlocks need a row.
 */
export function isUnlocked(unlock: Unlock, level: number, owned: boolean): boolean {
	switch (unlock.kind) {
		case 'starter':
			return true;
		case 'level':
			return level >= unlock.level;
		case 'shop':
		case 'drop':
			return owned;
	}
}

export function canBuy(unlock: Unlock, level: number, owned: boolean, gp: number): { ok: boolean; reason?: string } {
	if (unlock.kind !== 'shop') return { ok: false, reason: 'Not for sale' };
	if (owned) return { ok: false, reason: 'Already yours' };
	if (unlock.level && level < unlock.level) return { ok: false, reason: `Reach level ${unlock.level} first` };
	if (gp < unlock.price) return { ok: false, reason: 'Not enough GP' };
	return { ok: true };
}
