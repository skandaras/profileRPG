import { act, num, read, str } from '$lib/server/api';
import { complete, dismissAwayNote, listHabits, undo } from '$lib/server/modules/habits';
import { missionBoard } from '$lib/server/modules/missions';
import { listPets } from '$lib/server/modules/pets';
import { playerRow } from '$lib/server/modules/progression';
import { cleanMess, greet, welcomeState } from '$lib/server/modules/welcome';

export const load = ({ locals }) =>
	read(locals, (ctx) => {
		const p = playerRow(ctx.tx, ctx.userId);
		const pets = listPets(ctx.tx, ctx.userId, ctx.now);
		const board = missionBoard(ctx.tx, ctx.userId, ctx.now);
		return {
			heroName: p.heroName,
			avatar: p.avatar,
			awayNote: p.awayNote,
			welcome: welcomeState(ctx.tx, ctx.userId, ctx.today),
			habits: listHabits(ctx.tx, ctx.userId, ctx.today),
			companion: pets.find((x) => x.active) ?? null,
			eggsReady: pets.filter((x) => x.stage === 'egg' && x.warmth >= x.warmthNeeded).length,
			runs: board.runs,
			now: ctx.now
		};
	});

export const actions = {
	tick: async ({ request, locals }) => {
		const f = await request.formData();
		return act(locals, (ctx) => complete(ctx, str(f, 'id'), num(f, 'amount')));
	},
	undo: async ({ request, locals }) => {
		const f = await request.formData();
		return act(locals, (ctx) => undo(ctx, str(f, 'id')));
	},
	clean: async ({ locals }) => act(locals, (ctx) => cleanMess(ctx)),
	greet: async ({ locals }) => act(locals, (ctx) => greet(ctx)),
	dismiss: async ({ locals }) => act(locals, (ctx) => dismissAwayNote(ctx))
};
