import { fail, redirect } from '@sveltejs/kit';
import { requireUser, str } from '$lib/server/api';
import { GameError } from '$lib/server/events';
import { play } from '$lib/server/game';
import { createPlayer } from '$lib/server/modules/player';
import type { AvatarConfig } from '$lib/content/types';

export const actions = {
	default: async ({ request, locals }) => {
		const user = requireUser(locals);
		const form = await request.formData();
		let avatar: AvatarConfig;
		try {
			avatar = JSON.parse(str(form, 'avatar'));
		} catch {
			return fail(400, { error: 'Your hero got lost on the way. Try again?' });
		}
		try {
			play(user.id, (ctx) =>
				createPlayer(ctx, {
					heroName: str(form, 'heroName'),
					avatar,
					starter: str(form, 'starter'),
					petName: str(form, 'petName'),
					timezone: str(form, 'timezone'),
					templates: form.getAll('templates').filter((t): t is string => typeof t === 'string')
				})
			);
		} catch (err) {
			if (err instanceof GameError) return fail(400, { error: err.message });
			throw err;
		}
		redirect(303, '/');
	}
};
