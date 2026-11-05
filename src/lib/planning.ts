/** A daily view of work, using the person's configured calendar day. */
export interface PlannedItem {
	kind: 'habit' | 'task';
	dueDay: number | null;
	due: boolean;
	done: boolean;
}

export function planToday<T extends PlannedItem>(items: readonly T[], today: number) {
	const tasks = items.filter((item) => item.kind === 'task');
	const byDate = (a: T, b: T) => a.dueDay === b.dueDay ? 0 : (a.dueDay ?? Infinity) - (b.dueDay ?? Infinity);
	// A task finished early still belongs to the work completed today.
	const todayTasks = tasks.filter((item) => item.done || item.dueDay === null || item.dueDay <= today).sort(byDate);
	const upcomingTasks = tasks.filter((item) => !item.done && item.dueDay !== null && item.dueDay > today).sort(byDate);
	const dueHabits = items.filter((item) => item.kind === 'habit' && item.due);
	const offDayHabits = items.filter((item) => item.kind === 'habit' && !item.due);
	const planned = [...todayTasks, ...dueHabits];
	const completed = planned.filter((item) => item.done).length;
	return { todayTasks, upcomingTasks, dueHabits, offDayHabits, total: planned.length, completed, remaining: planned.length - completed };
}

export function taskDueLabel(dueDay: number | null, today?: number): string {
	if (dueDay === null) return 'No due date';
	if (dueDay === today) return 'Due today';
	if (today !== undefined && dueDay === today + 1) return 'Due tomorrow';
	const date = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(dueDay * 86_400_000);
	return today !== undefined && dueDay < today ? `Overdue · ${date}` : `Due ${date}`;
}
