import { describe, expect, it } from 'vitest';
import { getMission } from '$lib/content';
import { rollLoot } from './loot';
import { missionDurationMs, missionSlots, petBonus, resolveMission, successChance } from './missions';
import { seeded } from './rng';

const stats = (n: number) => ({ str: n, dex: n, int: n, kno: n });
const stroll = getMission('meadow-stroll')!;
const caves = getMission('crystal-caves')!;

describe('missions', () => {
	it('settles the same way from the same seed', () => {
		const a = resolveMission(caves, stats(4), 0, {}, 1234);
		const b = resolveMission(caves, stats(4), 0, {}, 1234);
		expect(a).toEqual(b);
	});

	it('gets easier as stats grow, within bounds', () => {
		const weak = successChance(caves, stats(1), 0, {});
		const strong = successChance(caves, stats(9), 0, {});
		expect(strong).toBeGreaterThan(weak);
		expect(weak).toBeGreaterThanOrEqual(0.25);
		expect(strong).toBeLessThanOrEqual(0.97);
	});

	it('always pays something, even on a stumble', () => {
		for (let seed = 0; seed < 200; seed++) {
			const o = resolveMission(caves, stats(1), 0, {}, seed);
			expect(o.xp).toBeGreaterThan(0);
			expect(o.gp).toBeGreaterThan(0);
		}
	});

	it('mostly succeeds when you are well past the recommendation', () => {
		let wins = 0;
		for (let seed = 0; seed < 300; seed++) if (resolveMission(stroll, stats(6), 0, {}, seed).tier !== 'partial') wins++;
		expect(wins / 300).toBeGreaterThan(0.85);
	});

	it('honours duration and slot modifiers', () => {
		expect(missionDurationMs(stroll, {})).toBe(15 * 60_000);
		expect(missionDurationMs(stroll, { 'mission.duration': -0.2 })).toBe(12 * 60_000);
		expect(missionSlots({})).toBe(1);
		expect(missionSlots({ 'mission.slots': 1 })).toBe(2);
	});

	it('gives a companion a bonus, more on its favourite ground', () => {
		expect(petBonus(null, caves)).toBe(0);
		expect(petBonus({ level: 3, affinity: ['str'] }, caves)).toBeGreaterThan(petBonus({ level: 3, affinity: ['dex'] }, caves));
	});
});

describe('loot', () => {
	it('draws in proportion to weight', () => {
		const rng = seeded(7);
		const counts = { a: 0, b: 0 };
		for (let i = 0; i < 2000; i++) {
			const d = rollLoot(
				[
					{ item: 'a', weight: 3 },
					{ item: 'b', weight: 1 }
				],
				rng
			);
			if (d && 'item' in d) counts[d.item as 'a' | 'b']++;
		}
		expect(counts.a / counts.b).toBeGreaterThan(2.4);
		expect(counts.a / counts.b).toBeLessThan(3.8);
	});
});
