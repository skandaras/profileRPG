import { describe, expect, it } from 'vitest';
import { planToday, taskDueLabel, type PlannedItem } from './planning';

const TODAY = Date.parse('2026-11-05T00:00:00Z') / 86_400_000;
const task = (id: string, dueDay: number | null, done = false) => ({ id, kind: 'task' as const, dueDay, done, due: true });

describe('daily planning', () => {
	it('puts overdue and due tasks first, keeps undated work, and separates upcoming work', () => {
		const items = [task('no-date', null), task('future', TODAY + 4), task('today', TODAY), task('earlier', TODAY - 3), task('tomorrow', TODAY + 1)];
		const before = items.map((item) => item.id);
		const plan = planToday(items, TODAY);
		expect(plan.todayTasks.map((item) => item.id)).toEqual(['earlier', 'today', 'no-date']);
		expect(plan.upcomingTasks.map((item) => item.id)).toEqual(['tomorrow', 'future']);
		expect(plan.total).toBe(3);
		expect(items.map((item) => item.id)).toEqual(before);
	});

	it('counts due habits and completed work, including tasks finished before their due date', () => {
		const habit = (id: string, due: boolean, done: boolean) => ({ id, kind: 'habit' as const, dueDay: null, due, done });
		const plan = planToday([habit('daily', true, true), habit('off-day', false, false), task('early', TODAY + 2, true), task('future', TODAY + 3), task('now', TODAY)], TODAY);
		expect(plan).toMatchObject({ total: 3, completed: 2, remaining: 1 });
		expect(plan.dueHabits.map((item) => item.id)).toEqual(['daily']);
		expect(plan.offDayHabits.map((item) => item.id)).toEqual(['off-day']);
		expect(plan.todayTasks.map((item) => item.id)).toEqual(['now', 'early']);
	});

	it('keeps task ordering stable on completion and uses the supplied day at rollover', () => {
		const items = [task('one', TODAY), task('two', TODAY), task('no-date', null), task('tomorrow', TODAY + 1)];
		expect(planToday(items, TODAY).todayTasks.map((item) => item.id)).toEqual(['one', 'two', 'no-date']);
		items[0].done = true;
		expect(planToday(items, TODAY).todayTasks.map((item) => item.id)).toEqual(['one', 'two', 'no-date']);
		expect(planToday(items, TODAY + 1).todayTasks.map((item) => item.id)).toEqual(['one', 'two', 'tomorrow', 'no-date']);
	});

	it('handles an empty day and a day containing only future work', () => {
		expect(planToday<PlannedItem>([], TODAY)).toMatchObject({ total: 0, completed: 0, remaining: 0 });
		expect(planToday([task('later', TODAY + 1)], TODAY)).toMatchObject({ total: 0, completed: 0, remaining: 0 });
	});

	it('labels dates against the supplied local calendar day rather than the machine clock', () => {
		expect(taskDueLabel(null, TODAY)).toBe('No due date');
		expect(taskDueLabel(TODAY, TODAY)).toBe('Due today');
		expect(taskDueLabel(TODAY + 1, TODAY)).toBe('Due tomorrow');
		expect(taskDueLabel(TODAY - 1, TODAY)).toMatch(/^Overdue · /);
		expect(taskDueLabel(TODAY, TODAY - 1)).toBe('Due tomorrow');
		expect(taskDueLabel(TODAY)).toContain('2026');
	});
});
