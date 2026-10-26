import { describe, expect, it } from 'vitest';
import { addPetXp, companionShare, cooldownLeft, mood, needsAt, stageFor, TEEN_AT } from './pet-needs';
import { arrive, greetGp } from './welcome';

const H = 3_600_000;

describe('pet needs', () => {
	it('decays with time', () => {
		const n = needsAt({ fullness: 100, joy: 100, tidiness: 100 }, 0, 10 * H, 0, false);
		expect(n).toEqual({ fullness: 80, joy: 85, tidiness: 90 });
	});

	it('decays slower with Pet Whisperer, and not at all while resting', () => {
		expect(needsAt({ fullness: 100, joy: 100, tidiness: 100 }, 0, 10 * H, -0.25, false).fullness).toBe(85);
		expect(needsAt({ fullness: 50, joy: 50, tidiness: 50 }, 0, 100 * H, 0, true)).toEqual({ fullness: 50, joy: 50, tidiness: 50 });
	});

	it('never goes below empty', () => {
		expect(needsAt({ fullness: 10, joy: 10, tidiness: 10 }, 0, 1000 * H, 0, false)).toEqual({ fullness: 0, joy: 0, tidiness: 0 });
	});

	it('names the most pressing need', () => {
		expect(mood({ fullness: 90, joy: 90, tidiness: 90 })).toBe('happy');
		expect(mood({ fullness: 10, joy: 50, tidiness: 50 })).toBe('hungry');
		expect(mood({ fullness: 50, joy: 10, tidiness: 50 })).toBe('bored');
		expect(mood({ fullness: 50, joy: 50, tidiness: 10 })).toBe('messy');
		expect(mood({ fullness: 0, joy: 0, tidiness: 50 })).toBe('sulking');
		expect(mood({ fullness: 50, joy: 50, tidiness: 50 })).toBe('okay');
	});
});

describe('pet growth', () => {
	it('grows into its next stage', () => {
		let level = 1;
		let xp = 0;
		let grew = false;
		while (level < TEEN_AT) ({ level, xp, grew } = addPetXp(level, xp, 10));
		expect(grew).toBe(true);
		expect(stageFor(level)).toBe('teen');
	});

	it('shares more of the activities it likes', () => {
		expect(companionShare(40, 1, 0)).toBe(20);
		expect(companionShare(40, 0, 0)).toBe(10);
	});

	it('reports what is left of a cooldown', () => {
		expect(cooldownLeft(null, H, 5)).toBe(0);
		expect(cooldownLeft(0, H, H / 2)).toBe(H / 2);
	});
});

describe('welcome back', () => {
	it('counts consecutive days and mess', () => {
		expect(arrive(9, 4, 10)).toEqual({ newDay: true, daysAway: 0, returnStreak: 5, mess: 1 });
		expect(arrive(10, 4, 10).newDay).toBe(false);
	});

	it('makes more mess and a bigger greeting after a gap', () => {
		const a = arrive(2, 9, 10);
		expect(a).toEqual({ newDay: true, daysAway: 7, returnStreak: 1, mess: 5 });
		expect(greetGp(a.daysAway, 0)).toBeGreaterThan(greetGp(0, 0));
	});

	it('treats the first ever visit as day one', () => {
		expect(arrive(null, 0, 10)).toEqual({ newDay: true, daysAway: 0, returnStreak: 1, mess: 1 });
	});
});
