import { describe, expect, it } from 'vitest';
import {
	dayLabel,
	daysLeft,
	describeSchedule,
	gameDay,
	isDue,
	normalizeSchedule,
	periodOf,
	periodRange,
	weekday,
	weekIndex,
	type Schedule
} from './schedule';

const at = (iso: string) => Date.parse(iso);

describe('gameDay', () => {
	it('uses the local calendar date', () => {
		// 23:30 in Sydney on the 1st is still the 1st there, though UTC says the 1st at 12:30
		expect(dayLabel(gameDay(at('2026-03-01T12:30:00Z'), 'Australia/Sydney', 0))).toBe('2026-03-01');
		expect(dayLabel(gameDay(at('2026-03-01T13:30:00Z'), 'Australia/Sydney', 0))).toBe('2026-03-02');
	});

	it('counts the small hours toward the evening before', () => {
		// 02:00 London time on the 10th, with the day starting at 04:00
		expect(dayLabel(gameDay(at('2026-01-10T02:00:00Z'), 'Europe/London', 4))).toBe('2026-01-09');
		expect(dayLabel(gameDay(at('2026-01-10T04:00:00Z'), 'Europe/London', 4))).toBe('2026-01-10');
	});

	it('follows the wall clock across a DST change', () => {
		// London springs forward on 2026-03-29: 03:30 local is 02:30 UTC
		expect(dayLabel(gameDay(at('2026-03-29T02:30:00Z'), 'Europe/London', 4))).toBe('2026-03-28');
		// and 04:30 local (03:30 UTC) is the new day
		expect(dayLabel(gameDay(at('2026-03-29T03:30:00Z'), 'Europe/London', 4))).toBe('2026-03-29');
	});

	it('falls back to UTC for a nonsense timezone', () => {
		expect(dayLabel(gameDay(at('2026-05-05T10:00:00Z'), 'Not/AZone', 0))).toBe('2026-05-05');
	});
});

describe('weeks', () => {
	it('starts weeks on Monday', () => {
		const monday = gameDay(at('2026-10-26T12:00:00Z'), 'UTC', 0);
		expect(weekday(monday)).toBe(1);
		expect(weekIndex(monday)).toBe(weekIndex(monday + 6));
		expect(weekIndex(monday - 1)).toBe(weekIndex(monday) - 1);
		const [first, last] = periodRange({ type: 'weekly', target: 3 }, weekIndex(monday), 0);
		expect(first).toBe(monday);
		expect(last).toBe(monday + 6);
	});
});

describe('periods', () => {
	it('splits interval habits from their anchor day', () => {
		const s = { type: 'interval', every: 3, target: 1 } as const;
		expect(periodOf(s, 100, 100)).toBe(0);
		expect(periodOf(s, 102, 100)).toBe(0);
		expect(periodOf(s, 103, 100)).toBe(1);
		expect(daysLeft(s, 101, 100)).toBe(2);
	});

	it('only asks for day-of-week habits on their days', () => {
		const s: Schedule = { type: 'daily', target: 1, days: [1, 3, 5] };
		const monday = 4;
		expect(isDue(s, monday)).toBe(true);
		expect(isDue(s, monday + 1)).toBe(false);
		expect(isDue({ type: 'daily', target: 1 }, monday + 1)).toBe(true);
	});
});

describe('normalizeSchedule', () => {
	it('clamps and cleans form input', () => {
		expect(normalizeSchedule({ type: 'weekly', target: 99 })).toEqual({ type: 'weekly', target: 14 });
		expect(normalizeSchedule({ type: 'interval', every: 1, target: 0 })).toEqual({ type: 'interval', every: 2, target: 1 });
		expect(normalizeSchedule({ type: 'daily', target: 1, days: [0, 1, 2, 3, 4, 5, 6] })).toEqual({ type: 'daily', target: 1 });
		expect(normalizeSchedule({ type: 'daily', target: 2, days: [5, 1, 1, 9] })).toEqual({ type: 'daily', target: 2, days: [1, 5] });
		expect(normalizeSchedule({ type: 'bogus' } as never)).toEqual({ type: 'daily', target: 1 });
	});
});

describe('describeSchedule', () => {
	it('reads like a person wrote it', () => {
		expect(describeSchedule({ type: 'daily', target: 1 })).toBe('Every day');
		expect(describeSchedule({ type: 'weekly', target: 3 })).toBe('3 times a week');
		expect(describeSchedule({ type: 'daily', target: 1, days: [0, 1, 3] })).toBe('Mon, Wed, Sun');
		expect(describeSchedule({ type: 'interval', every: 2, target: 1 })).toBe('once every 2 days');
	});
});
