import { read } from '$lib/server/api';
import { recentFeed } from '$lib/server/modules/feed';
import { partyCards } from '$lib/server/modules/party';

export const load = ({ locals }) =>
	read(locals, (ctx) => ({
		me: ctx.userId,
		cards: partyCards(ctx.tx, ctx.now),
		feed: recentFeed(ctx.tx, 40),
		now: ctx.now
	}));
