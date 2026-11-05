import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { HISTORY_PAGE_SIZE, type HistoryFilters } from '$lib/work-history';
import type { DbOrTx } from '../db';
import { completions, habits } from '../db/schema';

/** Completed work stays searchable when it leaves Today, including archived items. */
export function workHistory(db: DbOrTx, userId: string, today: number, filters: HistoryFilters) {
	const own = and(eq(completions.userId, userId), eq(habits.userId, userId));
	const where = and(own,
		filters.q ? sql`instr(lower(${habits.title}), lower(${filters.q})) > 0` : undefined,
		filters.kind !== 'all' ? eq(habits.kind, filters.kind) : undefined,
		filters.range !== 'all' ? gte(completions.day, today - Number(filters.range) + 1) : undefined,
		filters.range !== 'all' ? lte(completions.day, today) : undefined
	);
	const groups = db.select({ habitId: habits.id, day: completions.day })
		.from(completions).innerJoin(habits, eq(habits.id, completions.habitId)).where(where)
		.groupBy(habits.id, completions.day).as('completed_work');
	const total = db.select({ n: sql<number>`count(*)` }).from(groups).get()?.n ?? 0;
	const pages = Math.max(1, Math.ceil(total / HISTORY_PAGE_SIZE));
	const page = Math.min(Math.max(1, Number.isSafeInteger(filters.page) ? filters.page : 1), pages);
	const entries = db.select({
		habitId: habits.id, title: habits.title, icon: habits.icon, kind: habits.kind,
		day: completions.day, count: sql<number>`count(*)`, lastAt: sql<number>`max(${completions.at})`,
		archivedAt: habits.archivedAt, completedAt: habits.completedAt
	}).from(completions).innerJoin(habits, eq(habits.id, completions.habitId)).where(where)
		.groupBy(habits.id, completions.day)
		.orderBy(desc(completions.day), desc(sql`max(${completions.at})`), desc(habits.id))
		.limit(HISTORY_PAGE_SIZE).offset((page - 1) * HISTORY_PAGE_SIZE).all();
	const recent = db.select({ kind: habits.kind, day: completions.day, count: sql<number>`count(*)` })
		.from(completions).innerJoin(habits, eq(habits.id, completions.habitId))
		.where(and(own, gte(completions.day, today - 6), lte(completions.day, today)))
		.groupBy(habits.kind, completions.day).all();
	const summary = {
		tasks: recent.filter((row) => row.kind === 'task').reduce((n, row) => n + row.count, 0),
		checkIns: recent.filter((row) => row.kind === 'habit').reduce((n, row) => n + row.count, 0),
		activeDays: new Set(recent.map((row) => row.day)).size
	};
	return { entries, total, pages, page, summary };
}
