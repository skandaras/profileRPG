import { act, read, str } from '$lib/server/api';
import { PET_ACCESSORIES, PET_ACCESSORIES_ENABLED } from '$lib/content/cosmetics';
import { owns } from '$lib/server/modules/inventory';
import { canForage, feed, foodStock, forage, hatch, listPets, pat, play, rename, setAccessory, setActive, tidy } from '$lib/server/modules/pets';
import { playerRow } from '$lib/server/modules/progression';
import { SPECIES } from '$lib/content/pets';
import { MISSIONS } from '$lib/content/missions';
import { getMission } from '$lib/content';
import { openRuns } from '$lib/server/modules/missions';

export const load = ({ locals }) =>
	read(locals, (ctx) => {
		const p = playerRow(ctx.tx, ctx.userId);
		const pets = listPets(ctx.tx, ctx.userId, ctx.now);
		const companion = pets.find((pet) => pet.active);
		const trip = openRuns(ctx.tx, ctx.userId).find((run) => run.petId === companion?.id);
		return {
			pets,
			companionTrip: trip ? { name: getMission(trip.missionId)?.name ?? 'an expedition', endsAt: trip.endsAt } : null,
			discoveries: SPECIES.filter((s) => !s.starter).map((s) => {
				const owned = pets.filter((pet) => pet.speciesId === s.id);
				const hatched = owned.find((pet) => pet.stage !== 'egg');
				const source = MISSIONS.find((m) => m.loot.some((loot) => 'egg' in loot && loot.egg === s.id));
				return { ...s, stage: hatched?.stage ?? 'egg' as const, owned: owned.length > 0, hatched: !!hatched,
					source: source ? { name: source.name, minLevel: source.minLevel, unlocked: p.level >= source.minLevel } : null };
			}),
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
