import { act, num, read, str } from '$lib/server/api';
import { THEMES } from '$lib/content/themes';
import { themeItemId } from '$lib/content';
import { owns } from '$lib/server/modules/inventory';
import { saveSettings, setResting } from '$lib/server/modules/player';
import { playerRow } from '$lib/server/modules/progression';
import { unlockHint } from '$lib/unlocks';

export const load = ({ locals }) =>
	read(locals, (ctx) => {
		const p = playerRow(ctx.tx, ctx.userId);
		return {
			heroName: p.heroName,
			timezone: p.timezone,
			dayStartHour: p.dayStartHour,
			themeId: p.themeId,
			resting: p.resting,
			themes: THEMES.map((t) => ({
				id: t.id,
				name: t.name,
				blurb: t.blurb,
				tokens: t.tokens,
				owned: owns(ctx.tx, ctx.userId, p.level, themeItemId(t.id)),
				hint: unlockHint(t.unlock)
			}))
		};
	});

export const actions = {
	profile: async ({ request, locals }) => {
		const f = await request.formData();
		return act(locals, (ctx) =>
			saveSettings(ctx, { heroName: str(f, 'heroName'), timezone: str(f, 'timezone'), dayStartHour: num(f, 'dayStartHour') ?? undefined })
		);
	},
	theme: async ({ request, locals }) => {
		const f = await request.formData();
		return act(locals, (ctx) => saveSettings(ctx, { themeId: str(f, 'theme') }));
	},
	rest: async ({ request, locals }) => {
		const f = await request.formData();
		return act(locals, (ctx) => setResting(ctx, str(f, 'resting') === 'on'));
	}
};
