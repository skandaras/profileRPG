import { describe, expect, it } from 'vitest';
import { addXp, MAX_LEVEL, removeXp, xpToNext } from './levels';
import { activityReward } from './rewards';

describe('levels', () => {
	it('rises steadily', () => {
		for (let l = 1; l < 30; l++) expect(xpToNext(l + 1)).toBeGreaterThan(xpToNext(l));
	});

	it('crosses several levels in one gain', () => {
		const r = addXp(1, 0, xpToNext(1) + xpToNext(2) + 5);
		expect(r).toEqual({ level: 3, xp: 5, levelsGained: 2 });
	});

	it('stops at the cap', () => {
		const r = addXp(MAX_LEVEL, 0, 1e9);
		expect(r.level).toBe(MAX_LEVEL);
		expect(r.xp).toBeLessThan(xpToNext(MAX_LEVEL));
	});

	it('refuses to take back XP a level-up already used', () => {
		expect(removeXp(30, 20)).toBe(10);
		expect(removeXp(10, 20)).toBeNull();
	});

	it('paces about as intended for three medium habits a day', () => {
		const perDay = 3 * activityReward({ difficulty: 'medium', weights: { str: 1 }, streak: 3, mods: {}, petHappy: true }).xp;
		const daysTo = (target: number) => {
			let level = 1;
			let xp = 0;
			let days = 0;
			while (level < target) {
				({ level, xp } = addXp(level, xp, perDay));
				days++;
			}
			return days;
		};
		expect(daysTo(2)).toBe(1);
		expect(daysTo(5)).toBeLessThanOrEqual(8);
		expect(daysTo(10)).toBeGreaterThanOrEqual(20);
		expect(daysTo(10)).toBeLessThanOrEqual(45);
	});
});
