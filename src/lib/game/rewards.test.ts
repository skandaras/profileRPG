import { describe, expect, it } from 'vitest';
import { activityReward, amountScale, streakBonus } from './rewards';
import { collectModifiers } from './modifiers';
import { normalizeWeights, statTotals, training } from './stats';

describe('rewards', () => {
	it('caps the streak bonus at +50%', () => {
		expect(streakBonus(0)).toBe(0);
		expect(streakBonus(3)).toBeCloseTo(0.3);
		expect(streakBonus(40)).toBe(0.5);
	});

	it('scales with how much was logged, within limits', () => {
		expect(amountScale(60, 30)).toBe(2);
		expect(amountScale(300, 30)).toBe(2);
		expect(amountScale(5, 30)).toBe(0.5);
		expect(amountScale(null, 30)).toBe(1);
	});

	it('splits training by the activity stat weights', () => {
		const r = activityReward({ difficulty: 'medium', weights: { int: 1, kno: 1 }, streak: 0, mods: {}, petHappy: false });
		expect(r.xp).toBe(20);
		expect(r.gp).toBe(4);
		expect(r.statXp).toEqual({ int: 10, kno: 10 });
	});

	it('applies stat abilities only to their own stat', () => {
		const mods = collectModifiers([{ key: 'xp.str', value: 0.5 }]);
		const str = activityReward({ difficulty: 'medium', weights: { str: 1 }, streak: 0, mods, petHappy: false });
		const int = activityReward({ difficulty: 'medium', weights: { int: 1 }, streak: 0, mods, petHappy: false });
		expect(str.xp).toBe(30);
		expect(int.xp).toBe(20);
	});

	it('adds a happy-pet bonus', () => {
		const base = { difficulty: 'hard' as const, weights: { str: 1 }, streak: 0, mods: {} };
		expect(activityReward({ ...base, petHappy: true }).xp).toBeGreaterThan(activityReward({ ...base, petHappy: false }).xp);
	});
});

describe('stats', () => {
	it('trains up a level at a time', () => {
		expect(training(0).level).toBe(0);
		const first = training(0).next;
		expect(training(first).level).toBe(1);
		expect(training(first - 1).level).toBe(0);
	});

	it('adds training and allocation onto a base of 1', () => {
		const t = statTotals({ str: training(0).next, dex: 0, int: 0, kno: 0 }, { str: 2, dex: 0, int: 1, kno: 0 });
		expect(t).toEqual({ str: 4, dex: 1, int: 2, kno: 1 });
	});

	it('treats an untagged activity as a bit of everything', () => {
		expect(normalizeWeights({})).toEqual({ str: 0.25, dex: 0.25, int: 0.25, kno: 0.25 });
		expect(normalizeWeights({ str: 2, dex: 2 })).toEqual({ str: 0.5, dex: 0.5 });
	});
});
