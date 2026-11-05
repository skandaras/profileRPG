import { act, read, str } from '$lib/server/api';
import { reopenTask } from '$lib/server/modules/habits';
import { workHistory } from '$lib/server/modules/work-history';
import { historyFilters } from '$lib/work-history';

export const load = ({ locals, url }) => read(locals, (ctx) => {
	const filters = historyFilters(url.searchParams);
	const history = workHistory(ctx.tx, ctx.userId, ctx.today, filters);
	return { ...history, filters: { ...filters, page: history.page }, today: ctx.today };
});

export const actions = {
	reopen: async ({ request, locals }) => {
		const form = await request.formData();
		return act(locals, (ctx) => reopenTask(ctx, str(form, 'id')));
	}
};
