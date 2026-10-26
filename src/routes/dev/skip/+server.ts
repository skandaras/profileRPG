import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { advanceClock } from '$lib/server/clock';
import { requireUser } from '$lib/server/api';

/**
 * Dev mode only: move the game clock forward, to see a missed day, a hungry
 * pet or a finished mission without waiting. `/dev/skip?hours=24`.
 */
export const GET = ({ url, locals }) => {
	if ((env.AUTH_MODE || 'authelia') !== 'dev') error(404, 'Not found');
	requireUser(locals);
	const hours = Math.min(24 * 30, Math.max(0, Number(url.searchParams.get('hours') ?? 24)));
	advanceClock(hours * 3_600_000);
	redirect(303, url.searchParams.get('to') || '/');
};
