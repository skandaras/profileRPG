import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { DEFAULT_AVATAR } from '$lib/content/cosmetics';
import { historyFilters } from '$lib/work-history';
import { advanceClock, setClock } from './clock';
import { db, runMigrations } from './db';
import { completions } from './db/schema';
import { GameError, NotFound, on } from './events';
import { play } from './game';
import { provisionUser } from './users';
import { archiveHabit, complete, createHabit, listHabits, reopenTask, undo } from './modules/habits';
import { createPlayer, saveSettings } from './modules/player';
import { abilityIds, allocate, grantXp, learnAbility, playerRow } from './modules/progression';
import { buy, inventoryOf } from './modules/inventory';
import { recentFeed } from './modules/feed';
import { workHistory } from './modules/work-history';

const H = 3_600_000;
const START = Date.parse('2026-10-26T12:00:00Z');
const DAY = Date.parse('2026-10-26T00:00:00Z') / 86_400_000;
const person = (timezone = 'UTC', templates: string[] = []) => {
	const user = provisionUser({ username: 'history-' + randomUUID(), email: null, displayName: null, groups: [] });
	play(user.id, (ctx) => createPlayer(ctx, { heroName: 'Robin', avatar: DEFAULT_AVATAR, starter: 'mossling', petName: 'Sprout', timezone, templates }));
	return user.id;
};
const task = (id: string, title: string) => play(id, (ctx) => createHabit(ctx, { kind: 'task', title, icon: '⭐', difficulty: 'medium', weights: { int: 1 }, dueDay: ctx.today })).result;
const history = (id: string, query = '') => play(id, (ctx) => workHistory(ctx.tx, id, ctx.today, historyFilters(new URLSearchParams(query)))).result;

beforeAll(() => runMigrations());
beforeEach(() => setClock(START));

describe('completed-work history', () => {
	it('keeps completed and archived work after the day ends and groups habit check-ins by day', () => {
		const id = person('UTC', ['read']);
		const habit = play(id, (ctx) => listHabits(ctx.tx, id, ctx.today)).result[0];
		const report = task(id, 'Send report');
		play(id, (ctx) => { complete(ctx, report); complete(ctx, habit.id); complete(ctx, habit.id); archiveHabit(ctx, report, true); });
		advanceClock(24 * H);
		expect(play(id, (ctx) => listHabits(ctx.tx, id, ctx.today)).result.some((h) => h.id === report)).toBe(false);
		let result = history(id);
		expect(result.total).toBe(2);
		expect(result.entries.find((entry) => entry.habitId === report)).toMatchObject({ day: DAY, count: 1, archivedAt: START });
		expect(result.entries.find((entry) => entry.habitId === habit.id)).toMatchObject({ day: DAY, count: 2 });
		expect(result.summary).toEqual({ tasks: 1, checkIns: 2, activeDays: 1 });
		play(id, (ctx) => complete(ctx, habit.id));
		result = history(id);
		expect(result.total).toBe(3);
		expect(result.entries[0]).toMatchObject({ day: DAY + 1, habitId: habit.id, count: 1 });
		expect(result.summary).toEqual({ tasks: 1, checkIns: 3, activeDays: 2 });
		advanceClock(7 * 24 * H);
		expect(history(id).total).toBe(3);
		expect(history(id, 'range=7').total).toBe(0);
		expect(history(id, 'range=30').total).toBe(3);
		expect(history(id).summary).toEqual({ tasks: 0, checkIns: 0, activeDays: 0 });
	});

	it('searches literally, filters work type, and scopes both joined tables to their owner', () => {
		const a = person('UTC', ['read']), b = person();
		const first = task(a, 'Review 100%_ready');
		const second = task(a, 'Review ordinary');
		const secret = task(b, 'Private report');
		const habit = play(a, (ctx) => listHabits(ctx.tx, a, ctx.today)).result.find((h) => h.kind === 'habit')!;
		play(a, (ctx) => { complete(ctx, first); complete(ctx, second); complete(ctx, habit.id); });
		play(b, (ctx) => complete(ctx, secret));
		play(a, (ctx) => ctx.tx.insert(completions).values({ id: randomUUID(), userId: a, habitId: secret, at: ctx.now, day: ctx.today, period: ctx.today, effects: {} }).run());
		expect(history(a, 'q=100%25_ready').entries.map((entry) => entry.habitId)).toEqual([first]);
		expect(history(a, 'q=REVIEW').total).toBe(2);
		expect(history(a, 'kind=habit').entries.map((entry) => entry.habitId)).toEqual([habit.id]);
		expect(history(a, 'kind=task').summary).toEqual({ tasks: 2, checkIns: 1, activeDays: 1 });
		expect(history(a, 'q=Private').total).toBe(0);
		expect(history(a, "q=' OR 1=1 --").total).toBe(0);
		expect(history(b).total).toBe(1);
		expect(history(b).entries[0].count).toBe(1);
	});

	it('paginates with a stable order and clamps pages after a result set shrinks', () => {
		const id = person();
		for (let i = 0; i < 25; i++) {
			const item = task(id, 'Work ' + i);
			play(id, (ctx) => complete(ctx, item));
			advanceClock(60_000);
		}
		const first = history(id), second = history(id, 'page=2');
		expect(first).toMatchObject({ total: 25, page: 1, pages: 2 });
		expect(first.entries).toHaveLength(20);
		expect(second.entries).toHaveLength(5);
		expect(new Set([...first.entries, ...second.entries].map((entry) => entry.habitId)).size).toBe(25);
		expect(history(id, 'page=999').page).toBe(2);
		for (const entry of second.entries) play(id, (ctx) => reopenTask(ctx, entry.habitId));
		expect(history(id, 'page=2')).toMatchObject({ total: 20, page: 1, pages: 1 });
	});

	it('uses the person’s timezone and chosen day-start hour for completion days', () => {
		const id = person('Pacific/Auckland');
		setClock(START + 6.5 * H); // Tuesday morning in Auckland, still Monday in UTC.
		const item = task(id, 'Local calendar task');
		play(id, (ctx) => complete(ctx, item));
		expect(history(id).entries[0].day).toBe(DAY + 1);
		expect(history(id).summary).toEqual({ tasks: 1, checkIns: 0, activeDays: 1 });
		const laterStart = person('Pacific/Auckland');
		play(laterStart, (ctx) => saveSettings(ctx, { dayStartHour: 8 }));
		const earlyTask = task(laterStart, 'Before the workday starts');
		play(laterStart, (ctx) => complete(ctx, earlyTask));
		expect(history(laterStart).entries[0].day).toBe(DAY);
		advanceClock(H); // 8:30am starts the next workday; the stored completion stays put.
		expect(history(laterStart).entries[0].day).toBe(DAY);
		expect(history(laterStart).summary).toEqual({ tasks: 1, checkIns: 0, activeDays: 1 });
	});
});

describe('completion corrections', () => {
	it('reopens an older archived task, removes its record and avoids applying the correction twice', () => {
		const id = person();
		const item = task(id, 'Past task');
		play(id, (ctx) => { complete(ctx, item); archiveHabit(ctx, item, true); });
		advanceClock(3 * 24 * H);
		play(id, (ctx) => reopenTask(ctx, item));
		expect(history(id).total).toBe(0);
		expect(history(id).summary.tasks).toBe(0);
		const open = play(id, (ctx) => listHabits(ctx.tx, id, ctx.today)).result.find((h) => h.id === item);
		expect(open).toMatchObject({ done: false, archived: false, dueDay: DAY });
		const xp = playerRow(db, id).totalXp;
		expect(() => play(id, (ctx) => reopenTask(ctx, item))).toThrow('already open');
		expect(playerRow(db, id).totalXp).toBe(xp);
		expect(() => play(person(), (ctx) => reopenTask(ctx, item))).toThrow(NotFound);
	});

	it('corrects after a level-up and spent rewards without duplicate level points on redo', () => {
		const id = person();
		play(id, (ctx) => grantXp(ctx, 54));
		const item = task(id, 'Confidential budget');
		play(id, (ctx) => complete(ctx, item));
		const completed = playerRow(db, id);
		expect(completed).toMatchObject({ level: 2, xp: 5, totalXp: 75 });
		play(id, (ctx) => { allocate(ctx, 'str', 2); learnAbility(ctx, 'iron-resolve'); buy(ctx, 'food.kibble', 4); });
		for (let i = 0; i < 3; i++) {
			play(id, (ctx) => reopenTask(ctx, item));
			expect(playerRow(db, id)).toMatchObject({ level: 2, xp: 0, totalXp: 54, attrPoints: 0, abilityPoints: 0, gp: 0 });
			expect(inventoryOf(db, id).get('food.kibble')).toBe(4);
			expect(abilityIds(db, id)).toContain('iron-resolve');
			expect(playerRow(db, id).allocated.str).toBe(2);
			play(id, (ctx) => complete(ctx, item));
			expect(playerRow(db, id)).toMatchObject({ level: 2, xp: 5, totalXp: 75, attrPoints: 0, abilityPoints: 0 });
		}
		expect(history(id).summary.tasks).toBe(1);
		expect(recentFeed(db, 100).filter((event) => event.userId === id).some((event) => event.text.includes('Confidential budget'))).toBe(false);
	});

	it('also allows today’s habit undo after crossing a level and only re-awards genuinely new levels', () => {
		const id = person('UTC', ['read']);
		play(id, (ctx) => grantXp(ctx, 64)); // The reading template earns 11 XP.
		const item = play(id, (ctx) => listHabits(ctx.tx, id, ctx.today)).result[0];
		for (let i = 0; i < 3; i++) {
			play(id, (ctx) => complete(ctx, item.id));
			expect(playerRow(db, id)).toMatchObject({ level: 2, xp: 5, attrPoints: 2, abilityPoints: 1 });
			play(id, (ctx) => undo(ctx, item.id));
			expect(playerRow(db, id)).toMatchObject({ level: 2, xp: 0, totalXp: 64, attrPoints: 2, abilityPoints: 1 });
		}
		expect(history(id).total).toBe(0);
		play(id, (ctx) => grantXp(ctx, 117));
		expect(playerRow(db, id)).toMatchObject({ level: 3, xp: 0, totalXp: 181, attrPoints: 4, abilityPoints: 2 });
	});

	it('rejects other people’s tasks and recurring habits, and rolls back if an event handler fails', () => {
		const id = person('UTC', ['read']), other = person();
		const item = task(id, 'Keep this record');
		play(id, (ctx) => complete(ctx, item));
		expect(() => play(other, (ctx) => reopenTask(ctx, item))).toThrow(NotFound);
		const habit = play(id, (ctx) => listHabits(ctx.tx, id, ctx.today)).result.find((h) => h.kind === 'habit')!;
		expect(() => play(id, (ctx) => reopenTask(ctx, habit.id))).toThrow(GameError);
		const before = playerRow(db, id).totalXp;
		on('activity.undone', (ctx) => { if (ctx.userId === id) throw new Error('Downstream correction failed'); });
		expect(() => play(id, (ctx) => reopenTask(ctx, item))).toThrow('Downstream correction failed');
		expect(history(id).entries.find((entry) => entry.habitId === item)).toBeDefined();
		expect(playerRow(db, id).totalXp).toBe(before);
		expect(play(id, (ctx) => listHabits(ctx.tx, id, ctx.today)).result.find((entry) => entry.id === item)?.done).toBe(true);
	});
});
