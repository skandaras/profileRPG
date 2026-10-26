import { act, read, str } from '$lib/server/api';
import { inventoryOf } from '$lib/server/modules/inventory';
import { saveAvatar } from '$lib/server/modules/player';
import { playerRow } from '$lib/server/modules/progression';
import type { AvatarConfig } from '$lib/content/types';
import { fail } from '@sveltejs/kit';

export const load = ({ locals }) =>
	read(locals, (ctx) => {
		const p = playerRow(ctx.tx, ctx.userId);
		return { avatar: p.avatar, level: p.level, owned: [...inventoryOf(ctx.tx, ctx.userId).keys()] };
	});

export const actions = {
	save: async ({ request, locals }) => {
		const f = await request.formData();
		let avatar: AvatarConfig;
		try {
			avatar = JSON.parse(str(f, 'avatar'));
		} catch {
			return fail(400, { ok: false, error: 'Could not read that outfit', notices: [] });
		}
		return act(locals, (ctx) => saveAvatar(ctx, avatar));
	}
};
