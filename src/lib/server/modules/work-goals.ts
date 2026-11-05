import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { WORK_GOALS, workWeek } from '$lib/quests';
import type { DbOrTx } from '../db';
import { completions, habits, workGoals } from '../db/schema';
import { GameError, notify, type Ctx } from '../events';

export function weeklyGoals(db: DbOrTx, userId: string, today: number) {
	const week = workWeek(today);
	const rows = db.select({ kind: habits.kind, day: completions.day, n: sql<number>`count(*)` })
		.from(completions).innerJoin(habits, eq(habits.id, completions.habitId))
		.where(and(eq(completions.userId, userId), eq(habits.userId, userId), gte(completions.day, week.start), lte(completions.day, today)))
		.groupBy(habits.kind, completions.day).all();
	const totals = {
		tasks: rows.filter((r) => r.kind === 'task').reduce((sum, r) => sum + r.n, 0),
		'check-ins': rows.filter((r) => r.kind === 'habit').reduce((sum, r) => sum + r.n, 0),
		'active-days': new Set(rows.map((r) => r.day)).size
	};
	const saved = db.select().from(workGoals).where(and(eq(workGoals.userId, userId), eq(workGoals.week, week.index))).all();
	return {
		week,
		goals: WORK_GOALS.map((goal) => {
			const target = saved.find((r) => r.kind === goal.kind)?.target ?? null;
			const count = totals[goal.kind];
			return { ...goal, target, count, complete: target !== null && count >= target };
		})
	};
}

export function setWorkGoal(ctx: Ctx, kind: string, target: number | null) {
	const goal = WORK_GOALS.find((g) => g.kind === kind);
	if (!goal) throw new GameError('Choose a task, habit or active-day target');
	if (target === null || !Number.isSafeInteger(target) || target < 1 || target > goal.max) {
		throw new GameError(`Choose a whole-number target from 1 to ${goal.max}`);
	}
	ctx.tx.insert(workGoals).values({ userId: ctx.userId, week: workWeek(ctx.today).index, kind: goal.kind, target })
		.onConflictDoUpdate({ target: [workGoals.userId, workGoals.week, workGoals.kind], set: { target } }).run();
	notify(ctx, 'info', 'Weekly target saved', '🎯');
}

export function removeWorkGoal(ctx: Ctx, kind: string) {
	const goal = WORK_GOALS.find((g) => g.kind === kind);
	if (!goal) throw new GameError('Choose a task, habit or active-day target');
	ctx.tx.delete(workGoals).where(and(eq(workGoals.userId, ctx.userId), eq(workGoals.week, workWeek(ctx.today).index), eq(workGoals.kind, goal.kind))).run();
	notify(ctx, 'info', 'Weekly target removed', '🎯');
}
