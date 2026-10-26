import { act, num, read, str } from '$lib/server/api';
import { archiveHabit, complete, listHabits, undo } from '$lib/server/modules/habits';

export const load = ({ locals }) =>
	read(locals, (ctx) => ({
		habits: listHabits(ctx.tx, ctx.userId, ctx.today),
		archived: listHabits(ctx.tx, ctx.userId, ctx.today, { archived: true })
	}));

export const actions = {
	tick: async ({ request, locals }) => {
		const f = await request.formData();
		return act(locals, (ctx) => complete(ctx, str(f, 'id'), num(f, 'amount')));
	},
	undo: async ({ request, locals }) => {
		const f = await request.formData();
		return act(locals, (ctx) => undo(ctx, str(f, 'id')));
	},
	restore: async ({ request, locals }) => {
		const f = await request.formData();
		return act(locals, (ctx) => archiveHabit(ctx, str(f, 'id'), false));
	}
};
