/**
 * Days, weeks and periods, in the player's own calendar.
 *
 * A "game day" is a local calendar date that starts at `dayStartHour` rather
 * than midnight, so ticking off a habit at 1am counts for the evening it
 * belongs to. Days are plain integers (days since 1970-01-01), which makes
 * week and interval arithmetic exact across DST changes.
 */
export type Schedule =
	/** `days`: 0 = Sunday … 6 = Saturday. Omitted means every day. */
	| { type: 'daily'; target: number; days?: number[] }
	| { type: 'weekly'; target: number }
	| { type: 'interval'; every: number; target: number };

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string): Intl.DateTimeFormat {
	let f = formatters.get(timeZone);
	if (!f) {
		f = new Intl.DateTimeFormat('en-US', {
			timeZone,
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			hourCycle: 'h23'
		});
		formatters.set(timeZone, f);
	}
	return f;
}

export function isValidTimeZone(tz: string): boolean {
	try {
		formatter(tz);
		return true;
	} catch {
		return false;
	}
}

export function gameDay(at: number, timeZone: string, dayStartHour: number): number {
	const tz = isValidTimeZone(timeZone) ? timeZone : 'UTC';
	const parts = Object.fromEntries(formatter(tz).formatToParts(new Date(at)).map((p) => [p.type, p.value]));
	const day = Math.round(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)) / 86_400_000);
	return Number(parts.hour) < dayStartHour ? day - 1 : day;
}

/** 0 = Sunday. 1970-01-01 was a Thursday. */
export function weekday(day: number): number {
	return (((day + 4) % 7) + 7) % 7;
}

/** Weeks start on Monday; day 4 (1970-01-05) was the first Monday. */
export function weekIndex(day: number): number {
	return Math.floor((day - 4) / 7);
}

export function periodOf(schedule: Schedule, day: number, anchorDay: number): number {
	switch (schedule.type) {
		case 'daily':
			return day;
		case 'weekly':
			return weekIndex(day);
		case 'interval':
			return Math.floor((day - anchorDay) / schedule.every);
	}
}

export function periodRange(schedule: Schedule, period: number, anchorDay: number): [number, number] {
	switch (schedule.type) {
		case 'daily':
			return [period, period];
		case 'weekly':
			return [period * 7 + 4, period * 7 + 10];
		case 'interval':
			return [anchorDay + period * schedule.every, anchorDay + (period + 1) * schedule.every - 1];
	}
}

/** Whether a period asks anything of you. Only day-of-week habits have periods off. */
export function isDue(schedule: Schedule, period: number): boolean {
	if (schedule.type !== 'daily' || !schedule.days?.length) return true;
	return schedule.days.includes(weekday(period));
}

export function daysLeft(schedule: Schedule, day: number, anchorDay: number): number {
	const [, last] = periodRange(schedule, periodOf(schedule, day, anchorDay), anchorDay);
	return last - day + 1;
}

export function dayLabel(day: number): string {
	return new Date(day * 86_400_000).toISOString().slice(0, 10);
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function describeSchedule(s: Schedule): string {
	const times = (n: number) => (n === 1 ? 'once' : n === 2 ? 'twice' : `${n} times`);
	switch (s.type) {
		case 'daily':
			if (s.days?.length && s.days.length < 7) {
				const days = [...s.days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map((d) => WEEKDAY_SHORT[d]);
				return `${s.target > 1 ? times(s.target) + ' on ' : ''}${days.join(', ')}`;
			}
			return s.target > 1 ? `${times(s.target)} a day` : 'Every day';
		case 'weekly':
			return `${times(s.target)} a week`;
		case 'interval':
			return `${times(s.target)} every ${s.every} days`;
	}
}

/** Clamp whatever a form sent into a schedule the rules can trust. */
export function normalizeSchedule(input: Partial<Schedule> & { type?: string }): Schedule {
	const target = clampInt((input as { target?: number }).target, 1, 20, 1);
	if (input.type === 'weekly') return { type: 'weekly', target: Math.min(target, 14) };
	if (input.type === 'interval') {
		return { type: 'interval', every: clampInt((input as { every?: number }).every, 2, 30, 2), target };
	}
	const days = [...new Set(((input as { days?: number[] }).days ?? []).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))];
	return days.length && days.length < 7 ? { type: 'daily', target, days: days.sort() } : { type: 'daily', target };
}

function clampInt(v: unknown, min: number, max: number, fallback: number): number {
	const n = Math.round(Number(v));
	return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}
