import { act, num, read, str } from '$lib/server/api';
import { PET_ACCESSORIES_ENABLED } from '$lib/content/cosmetics';
import { availableItems } from '$lib/content';
import { buy, inventoryOf, owns } from '$lib/server/modules/inventory';
import { companionRow } from '$lib/server/modules/pets';
import { playerRow } from '$lib/server/modules/progression';

export const load = ({ locals }) =>
	read(locals, (ctx) => {
		const p = playerRow(ctx.tx, ctx.userId);
		const bag = inventoryOf(ctx.tx, ctx.userId);
		const stock = availableItems()
			.filter((i) => i.unlock.kind === 'shop' && (PET_ACCESSORIES_ENABLED || i.kind !== 'petacc'))
			.map((i) => ({
				id: i.id,
				name: i.name,
				kind: i.kind,
				blurb: i.blurb ?? '',
				price: i.unlock.kind === 'shop' ? i.unlock.price : 0,
				level: i.unlock.kind === 'shop' ? (i.unlock.level ?? 1) : 1,
				stackable: i.stackable,
				have: bag.get(i.id) ?? 0,
				owned: !i.stackable && owns(ctx.tx, ctx.userId, p.level, i.id)
			}));
		const pet = companionRow(ctx.tx, ctx.userId);
		return { gp: p.gp, level: p.level, stock, pet: pet && pet.stage !== 'egg' ? { speciesId: pet.speciesId, stage: pet.stage } : null };
	});

export const actions = {
	buy: async ({ request, locals }) => {
		const f = await request.formData();
		return act(locals, (ctx) => buy(ctx, str(f, 'item'), num(f, 'qty') ?? 1));
	}
};
