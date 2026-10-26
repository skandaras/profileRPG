import { STAT_IDS } from '$lib/content/stats';
import type { Difficulty, StatWeights } from '$lib/content/types';
import { num, str } from './api';
import type { HabitInput } from './modules/habits';

/** Read the habit form (components/HabitForm.svelte) into what the habits module accepts. */
export function habitFromForm(form: FormData): HabitInput {
	const stats = form.getAll('stats').filter((s): s is string => typeof s === 'string');
	const weights: StatWeights = {};
	for (const s of STAT_IDS) if (stats.includes(s)) weights[s] = 1;
	const type = str(form, 'scheduleType');
	const due = str(form, 'due');
	return {
		kind: str(form, 'kind') === 'task' ? 'task' : 'habit',
		title: str(form, 'title'),
		icon: str(form, 'icon'),
		notes: str(form, 'notes'),
		difficulty: (str(form, 'difficulty') || 'medium') as Difficulty,
		weights,
		schedule: {
			type: type === 'weekly' || type === 'interval' ? type : 'daily',
			target: num(form, 'target') ?? 1,
			every: num(form, 'every') ?? 2,
			days: form.getAll('days').map(Number)
		} as HabitInput['schedule'],
		quantity: num(form, 'quantity'),
		unit: str(form, 'unit'),
		dueDay: /^\d{4}-\d{2}-\d{2}$/.test(due) ? Math.round(Date.parse(due + 'T00:00:00Z') / 86_400_000) : null
	};
}
