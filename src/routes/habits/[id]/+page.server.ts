import { redirect } from '@sveltejs/kit';
import { act, read } from '$lib/server/api';
import { habitFromForm } from '$lib/server/forms';
import { archiveHabit, deleteHabit, getHabit, history, updateHabit } from '$lib/server/modules/habits';
import { dayLabel } from '$lib/game/schedule';

export const load = ({ locals, params }) =>
	read(locals, (ctx) => {
		const h = getHabit(ctx.tx, ctx.userId, params.id);
		return {
			habit: {
				id: h.id,
				kind: h.kind,
				title: h.title,
				icon: h.icon,
				notes: h.notes,
				difficulty: h.difficulty,
				weights: h.weights,
				schedule: h.schedule,
				quantity: h.quantity,
				unit: h.unit,
				dueDay: h.dueDay,
				streak: h.streak,
				bestStreak: h.bestStreak,
				archived: !!h.archivedAt
			},
			history: history(ctx.tx, ctx.userId, h.id, ctx.today).map((d) => ({ ...d, label: dayLabel(d.day) }))
		};
	});

export const actions = {
	save: async ({ request, locals, params }) => {
		const f = await request.formData();
		return act(locals, (ctx) => updateHabit(ctx, params.id, habitFromForm(f)));
	},
	archive: async ({ locals, params }) => {
		const r = act(locals, (ctx) => archiveHabit(ctx, params.id, true));
		if ('ok' in r && r.ok) redirect(303, '/habits');
		return r;
	},
	delete: async ({ locals, params }) => {
		const r = act(locals, (ctx) => deleteHabit(ctx, params.id));
		if ('ok' in r && r.ok) redirect(303, '/habits');
		return r;
	}
};
