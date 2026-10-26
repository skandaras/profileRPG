import { act, num, read, str } from '$lib/server/api';
import { abilityBoard, allocate, learnAbility, playerRow, playerStats } from '$lib/server/modules/progression';
import { training } from '$lib/game/stats';
import { xpToNext } from '$lib/game/levels';
import { STAT_IDS } from '$lib/content/stats';
import type { StatId } from '$lib/content/types';

export const load = ({ locals }) =>
	read(locals, (ctx) => {
		const p = playerRow(ctx.tx, ctx.userId);
		return {
			hero: {
				heroName: p.heroName,
				avatar: p.avatar,
				level: p.level,
				xp: p.xp,
				xpNext: xpToNext(p.level),
				totalXp: p.totalXp,
				gp: p.gp,
				attrPoints: p.attrPoints,
				abilityPoints: p.abilityPoints
			},
			stats: playerStats(p),
			allocated: p.allocated,
			training: Object.fromEntries(STAT_IDS.map((s) => [s, training(p.statXp[s] ?? 0)])) as Record<StatId, ReturnType<typeof training>>,
			abilities: abilityBoard(ctx.tx, ctx.userId, p.level)
		};
	});

export const actions = {
	allocate: async ({ request, locals }) => {
		const f = await request.formData();
		return act(locals, (ctx) => allocate(ctx, str(f, 'stat') as StatId, num(f, 'points') ?? 1));
	},
	learn: async ({ request, locals }) => {
		const f = await request.formData();
		return act(locals, (ctx) => learnAbility(ctx, str(f, 'ability')));
	}
};
