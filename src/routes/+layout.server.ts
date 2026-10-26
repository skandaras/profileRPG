import { redirect } from '@sveltejs/kit';
import { requireUser } from '$lib/server/api';
import { play } from '$lib/server/game';
import { findPlayer } from '$lib/server/modules/player';
import { xpToNext } from '$lib/game/levels';
import { env } from '$env/dynamic/private';

export const load = ({ locals, url }) => {
	const user = requireUser(locals);
	const { result: hero, notices } = play(user.id, (ctx) => {
		const p = findPlayer(ctx.tx, user.id);
		if (!p) return null;
		return {
			heroName: p.heroName,
			level: p.level,
			xp: p.xp,
			xpNext: xpToNext(p.level),
			gp: p.gp,
			avatar: p.avatar,
			resting: p.resting,
			themeId: p.themeId,
			points: p.attrPoints + p.abilityPoints
		};
	});
	const onboarding = url.pathname.startsWith('/onboarding');
	if (!hero && !onboarding) redirect(303, '/onboarding');
	if (hero && onboarding) redirect(303, '/');
	return { hero, notices, devMode: (env.AUTH_MODE || 'authelia') === 'dev' };
};
