import { randomUUID } from 'node:crypto';
import { beforeAll, beforeEach, expect, it } from 'vitest';
import { DEFAULT_AVATAR } from '$lib/content/cosmetics';
import { advanceClock, setClock } from './clock';
import { db, runMigrations } from './db';
import { completions } from './db/schema';
import { play } from './game';
import { provisionUser } from './users';
import { archiveHabit, complete, createHabit, listHabits, reopenTask, undo } from './modules/habits';
import { createPlayer, saveSettings } from './modules/player';
import { playerRow } from './modules/progression';
import { removeWorkGoal, setWorkGoal, weeklyGoals } from './modules/work-goals';

const START = Date.parse('2026-11-02T12:00:00Z'); // Monday
const DAY = 86_400_000;
const person = () => {
	const user = provisionUser({ username: 'goals-' + randomUUID(), email: null, displayName: null, groups: [] });
	play(user.id, (ctx) => createPlayer(ctx, { heroName: 'Robin', avatar: DEFAULT_AVATAR, starter: 'mossling', petName: 'Sprout', timezone: 'UTC', templates: ['read'] }));
	return user.id;
};
const board = (id: string) => play(id, (ctx) => weeklyGoals(ctx.tx, ctx.userId, ctx.today)).result;
const task = (id: string) => play(id, (ctx) => createHabit(ctx, { kind: 'task', title: 'Private report', icon: '⭐', difficulty: 'medium', weights: { int: 1 } })).result;

beforeAll(() => runMigrations());
beforeEach(() => setClock(START));

it('counts work already logged, including archived work, and follows later corrections', () => {
	const id = person(), item = task(id);
	const habit = play(id, (ctx) => listHabits(ctx.tx, id, ctx.today)).result.find((h) => h.kind === 'habit')!;
	play(id, (ctx) => { complete(ctx, item); archiveHabit(ctx, item, true); complete(ctx, habit.id); complete(ctx, habit.id); });
	play(id, (ctx) => { setWorkGoal(ctx, 'tasks', 1); setWorkGoal(ctx, 'check-ins', 2); setWorkGoal(ctx, 'active-days', 2); });
	expect(board(id).goals.map(({ count, complete }) => ({ count, complete }))).toEqual([{ count: 1, complete: true }, { count: 2, complete: true }, { count: 1, complete: false }]);
	play(id, (ctx) => undo(ctx, habit.id));
	expect(board(id).goals[1]).toMatchObject({ count: 1, complete: false });
	advanceClock(DAY);
	play(id, (ctx) => complete(ctx, habit.id));
	expect(board(id).goals[2]).toMatchObject({ count: 2, complete: true });
	play(id, (ctx) => reopenTask(ctx, item));
	expect(board(id).goals[0]).toMatchObject({ count: 0, complete: false });
});

it('isolates targets and progress across owners, including inconsistent joined records', () => {
	const a = person(), b = person(), item = task(b);
	play(a, (ctx) => setWorkGoal(ctx, 'tasks', 3));
	play(b, (ctx) => { setWorkGoal(ctx, 'tasks', 7); complete(ctx, item); });
	play(a, (ctx) => ctx.tx.insert(completions).values({ id: randomUUID(), userId: a, habitId: item, at: ctx.now, day: ctx.today, period: ctx.today, effects: {} }).run());
	expect(board(a).goals[0]).toMatchObject({ target: 3, count: 0 });
	expect(board(b).goals[0]).toMatchObject({ target: 7, count: 1 });
	play(a, (ctx) => removeWorkGoal(ctx, 'tasks'));
	expect(board(a).goals[0].target).toBeNull();
	expect(board(b).goals[0].target).toBe(7);
});

it('updates a single target and never awards currency or XP for setting, reaching or removing it', () => {
	const id = person(), item = task(id);
	play(id, (ctx) => complete(ctx, item));
	const before = playerRow(db, id);
	for (let i = 0; i < 3; i++) {
		play(id, (ctx) => setWorkGoal(ctx, 'tasks', 1));
		expect(board(id).goals[0]).toMatchObject({ target: 1, count: 1, complete: true });
		play(id, (ctx) => setWorkGoal(ctx, 'tasks', 4));
		expect(board(id).goals[0]).toMatchObject({ target: 4, count: 1, complete: false });
		play(id, (ctx) => removeWorkGoal(ctx, 'tasks'));
	}
	expect(playerRow(db, id)).toMatchObject({ gp: before.gp, totalXp: before.totalXp, level: before.level, attrPoints: before.attrPoints, abilityPoints: before.abilityPoints });
});

it('starts fresh on Monday without carrying old counts or targets into the new week', () => {
	const id = person(), item = task(id);
	play(id, (ctx) => { setWorkGoal(ctx, 'tasks', 1); complete(ctx, item); });
	const firstWeek = board(id).week.index;
	advanceClock(7 * DAY);
	const next = board(id);
	expect(next.week.index).toBe(firstWeek + 1);
	expect(next.goals.every((g) => g.target === null && g.count === 0)).toBe(true);
});

it('uses the chosen day-start hour at the weekly boundary', () => {
	setClock(START - DAY); // Sunday noon.
	const id = person(), item = task(id);
	play(id, (ctx) => { saveSettings(ctx, { dayStartHour: 8 }); setWorkGoal(ctx, 'tasks', 1); });
	setClock(START - 5 * 3_600_000); // Monday 7am still belongs to Sunday.
	play(id, (ctx) => complete(ctx, item));
	expect(board(id).goals[0]).toMatchObject({ target: 1, count: 1, complete: true });
	advanceClock(2 * 3_600_000);
	expect(board(id).goals[0]).toMatchObject({ target: null, count: 0, complete: false });
});

it('rejects invalid targets without saving a partial configuration', () => {
	const id = person();
	for (const value of [null, 0, -1, 1.5, 101, Infinity, NaN]) {
		expect(() => play(id, (ctx) => setWorkGoal(ctx, 'tasks', value))).toThrow('whole-number target');
	}
	expect(() => play(id, (ctx) => setWorkGoal(ctx, 'active-days', 8))).toThrow('1 to 7');
	expect(() => play(id, (ctx) => setWorkGoal(ctx, 'unknown', 1))).toThrow('Choose a task');
	expect(board(id).goals.every((g) => g.target === null)).toBe(true);
});
