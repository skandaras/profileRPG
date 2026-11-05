/**
 * The hero's level curve. Tuned so about three habits a day reaches level 2 on
 * the first day, level 5 in about a week and level 10 in about five weeks.
 * Retune here; nothing else hard-codes a threshold.
 */
export const MAX_LEVEL = 99;
export const ATTR_POINTS_PER_LEVEL = 2;
export const ABILITY_POINTS_PER_LEVEL = 1;

export function xpToNext(level: number): number {
	return Math.round(40 + 30 * level ** 1.25);
}

export function addXp(level: number, xp: number, gained: number): { level: number; xp: number; levelsGained: number } {
	let l = level;
	let x = xp + Math.max(0, gained);
	let levelsGained = 0;
	while (l < MAX_LEVEL && x >= xpToNext(l)) {
		x -= xpToNext(l);
		l++;
		levelsGained++;
	}
	if (l === MAX_LEVEL) x = Math.min(x, xpToNext(l) - 1);
	return { level: l, xp: x, levelsGained };
}

/** Corrected totals determine progress; earned levels remain unlocked. */
export function progressFromTotal(level: number, totalXp: number) {
	let floor = 0;
	for (let l = 1; l < level; l++) floor += xpToNext(l);
	return addXp(level, 0, Math.max(0, totalXp - floor));
}
