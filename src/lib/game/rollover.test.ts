import { describe, expect, it } from 'vitest';
import { chargeFine, FINE_CAP, rollHabit, streakAfterTick, streakAfterUndo, type RollInput } from './rollover';

const base = (over: Partial<RollInput> = {}): RollInput => ({
	schedule: { type: 'daily', target: 1 },
	difficulty: 'medium',
	streak: 4,
	lastEvaluated: 99,
	currentPeriod: 101,
	counts: new Map(),
	resting: false,
	shieldsLeft: 0,
	...over
});

describe('rollHabit', () => {
	it('does nothing for a period that met its target', () => {
		const r = rollHabit(base({ counts: new Map([[100, 1]]) }));
		expect(r).toMatchObject({ streak: 4, missed: 0, fine: 0, lastEvaluated: 100 });
	});

	it('breaks the streak and fines a miss', () => {
		const r = rollHabit(base());
		expect(r).toMatchObject({ streak: 0, missed: 1, fine: 2, streakLost: 4, lastEvaluated: 100 });
	});

	it('never judges the period still running', () => {
		const r = rollHabit(base({ lastEvaluated: 100, currentPeriod: 101 }));
		expect(r.missed).toBe(0);
		expect(r.lastEvaluated).toBe(100);
	});

	it('counts each missed day after a long absence', () => {
		const r = rollHabit(base({ currentPeriod: 110 }));
		expect(r.missed).toBe(10);
		expect(r.fine).toBe(20);
	});

	it('forgives everything while resting, streak included', () => {
		const r = rollHabit(base({ currentPeriod: 110, resting: true }));
		expect(r).toMatchObject({ streak: 4, missed: 0, fine: 0, rested: 10 });
	});

	it('spends shields before breaking a streak', () => {
		const r = rollHabit(base({ currentPeriod: 102, shieldsLeft: 1 }));
		expect(r).toMatchObject({ shieldsUsed: 1, missed: 1, streak: 0 });
		const saved = rollHabit(base({ shieldsLeft: 1 }));
		expect(saved).toMatchObject({ shieldsUsed: 1, missed: 0, streak: 4 });
	});

	it('skips days a day-of-week habit has off', () => {
		// day 100 is a Saturday (weekday 6); a Mon/Wed/Fri habit is not due
		const r = rollHabit(base({ schedule: { type: 'daily', target: 1, days: [1, 3, 5] } }));
		expect(r.missed).toBe(0);
	});

	it('needs the whole target, not just one tick', () => {
		const r = rollHabit(base({ schedule: { type: 'weekly', target: 3 }, lastEvaluated: 10, currentPeriod: 12, counts: new Map([[11, 2]]) }));
		expect(r.missed).toBe(1);
	});
});

describe('fines', () => {
	it('is capped per visit and never overdraws', () => {
		expect(chargeFine(40, 100)).toBe(FINE_CAP);
		expect(chargeFine(6, 3)).toBe(3);
		expect(chargeFine(6, 0)).toBe(0);
	});
});

describe('streak ticks', () => {
	it('moves only on the tick that reaches the target', () => {
		expect(streakAfterTick(0, 3, 2, true)).toBe(2);
		expect(streakAfterTick(2, 3, 2, true)).toBe(3);
		expect(streakAfterTick(3, 3, 3, true)).toBe(3);
		expect(streakAfterTick(0, 1, 2, false)).toBe(2);
	});

	it('undoes that same tick and no other', () => {
		expect(streakAfterUndo(3, 3, 3, true)).toBe(2);
		expect(streakAfterUndo(4, 3, 3, true)).toBe(3);
		expect(streakAfterUndo(1, 1, 0, true)).toBe(0);
	});
});
