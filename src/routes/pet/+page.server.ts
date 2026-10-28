import { act, read, str } from '$lib/server/api';
import { PET_ACCESSORIES, PET_ACCESSORIES_ENABLED } from '$lib/content/cosmetics';
import { owns } from '$lib/server/modules/inventory';
import { canForage, feed, foodStock, forage, hatch, listPets, pat, play, rename, setAccessory, setActive, tidy } from '$lib/server/modules/pets';
import { playerRow } from '$lib/server/modules/progression';

export const load = ({ locals }) =>
	read(locals, (ctx) => {
		const p = playerRow(ctx.tx, ctx.userId);
		return {
			pets: listPets(ctx.tx, ctx.userId, ctx.now),
			food: foodStock(ctx.tx, ctx.userId),
			accessories: (PET_ACCESSORIES_ENABLED ? PET_ACCESSORIES : []).filter((a) => owns(ctx.tx, ctx.userId, p.level, a.id)).map((a) => ({ id: a.id, name: a.name })),
			canForage: canForage(ctx.tx, ctx.userId, ctx.today),
			now: ctx.now
		};
	});

const withPet =
	(fn: (ctx: Parameters<Parameters<typeof act>[1]>[0], petId: string, f: FormData) => unknown) =>
	async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const f = await request.formData();
		return act(locals, (ctx) => fn(ctx, str(f, 'pet'), f));
	};

export const actions = {
	feed: withPet((ctx, id, f) => feed(ctx, id, str(f, 'item'))),
	pat: withPet((ctx, id) => pat(ctx, id)),
	play: withPet((ctx, id) => play(ctx, id)),
	tidy: withPet((ctx, id) => tidy(ctx, id)),
	hatch: withPet((ctx, id) => hatch(ctx, id)),
	active: withPet((ctx, id) => setActive(ctx, id)),
	rename: withPet((ctx, id, f) => rename(ctx, id, str(f, 'name'))),
	accessory: withPet((ctx, id, f) => setAccessory(ctx, id, str(f, 'accessory') || null)),
	forage: async ({ locals }) => act(locals, (ctx) => forage(ctx))
};
