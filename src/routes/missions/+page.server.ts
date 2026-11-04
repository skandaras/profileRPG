import { PET_ACCESSORIES_ENABLED } from '$lib/content/cosmetics';
import { act, read, str } from '$lib/server/api';
import { claimMission, missionBoard, recentRuns, startMission } from '$lib/server/modules/missions';
import { playerRow, playerStats } from '$lib/server/modules/progression';
import { getItem, getMission, getSpecies } from '$lib/content';

export const load = ({ locals }) =>
	read(locals, (ctx) => {
		const p = playerRow(ctx.tx, ctx.userId);
		return {
			board: missionBoard(ctx.tx, ctx.userId, ctx.now),
			level: p.level,
			stats: playerStats(p),
			recent: recentRuns(ctx.tx, ctx.userId).map((r) => ({
				id: r.id,
				name: getMission(r.missionId)?.name ?? r.missionId,
				icon: getMission(r.missionId)?.icon ?? '🗺️',
				tier: r.outcome?.tier,
				xp: r.outcome?.xp ?? 0,
				gp: r.outcome?.gp ?? 0,
				finds: (r.outcome?.drops ?? []).filter((d) => PET_ACCESSORIES_ENABLED || !('item' in d) || getItem(d.item)?.kind !== 'petacc').map((d) =>
					'egg' in d ? `${getSpecies(d.egg)?.rarity ?? ''} egg` : 'gp' in d ? `${d.gp} GP` : `${getItem(d.item)?.name ?? d.item}${d.qty > 1 ? ` ×${d.qty}` : ''}`
				)
			})),
			now: ctx.now
		};
	});

export const actions = {
	start: async ({ request, locals }) => {
		const f = await request.formData();
		return act(locals, (ctx) => startMission(ctx, str(f, 'mission'), f.get('pet') === 'on'));
	},
	claim: async ({ request, locals }) => {
		const f = await request.formData();
		return act(locals, (ctx) => claimMission(ctx, str(f, 'run')));
	}
};
