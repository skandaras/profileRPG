import { redirect } from '@sveltejs/kit';
import { act, read, str } from '$lib/server/api';
import { habitFromForm } from '$lib/server/forms';
import { createFromTemplate, createHabit, listHabits } from '$lib/server/modules/habits';

export const load = ({ locals }) =>
	read(locals, (ctx) => ({ have: listHabits(ctx.tx, ctx.userId, ctx.today).map((h) => h.templateId).filter(Boolean) }));

export const actions = {
	template: async ({ request, locals }) => {
		const f = await request.formData();
		const r = act(locals, (ctx) => createFromTemplate(ctx, str(f, 'template')));
		if ('ok' in r && r.ok) redirect(303, '/habits');
		return r;
	},
	create: async ({ request, locals }) => {
		const f = await request.formData();
		const r = act(locals, (ctx) => createHabit(ctx, habitFromForm(f)));
		if ('ok' in r && r.ok) redirect(303, '/habits');
		return r;
	}
};
