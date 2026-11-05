import { weekIndex } from './game/schedule';

export const WORK_GOALS = [
	{ kind: 'tasks', name: 'Finish tasks', unit: 'tasks finished', singular: 'task finished', defaultTarget: 3, max: 100, icon: 'clipboard' },
	{ kind: 'check-ins', name: 'Keep your routines', unit: 'habit check-ins', singular: 'habit check-in', defaultTarget: 5, max: 100, icon: 'repeat' },
	{ kind: 'active-days', name: 'Make a little progress', unit: 'active days', singular: 'active day', defaultTarget: 3, max: 7, icon: 'sun' }
] as const;

export type WorkGoalKind = typeof WORK_GOALS[number]['kind'];

export function workWeek(today: number) {
	const index = weekIndex(today);
	const start = index * 7 + 4;
	const end = start + 6;
	const format = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', timeZone: 'UTC' });
	return { index, start, end, label: `${format.format(start * 86_400_000)} – ${format.format(end * 86_400_000)}` };
}
