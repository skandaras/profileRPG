import type { Handle } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { db, runMigrations } from '$lib/server/db';
import { isAllowed, isTrustedProxy, parseAuthHeaders } from '$lib/server/auth';
import { provisionUser } from '$lib/server/users';
import { findPlayer } from '$lib/server/modules/player';
import { themeCss } from '$lib/content/themes';

runMigrations();

const PUBLIC_PATHS = new Set(['/healthz']);
const THEME_CSS = themeCss();

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = null;
	if (PUBLIC_PATHS.has(event.url.pathname)) return resolve(event);

	if ((env.AUTH_MODE || 'authelia') === 'dev') {
		const username = env.DEV_USER || 'dev';
		event.locals.user = provisionUser({ username, email: null, displayName: username, groups: [] });
	} else {
		// Identity headers are only believed when the request came straight from
		// the reverse proxy; anyone else could simply send a Remote-User header.
		const trusted = (env.TRUSTED_PROXY_IPS || '127.0.0.1,::1').split(',');
		if (!isTrustedProxy(event.getClientAddress(), trusted)) {
			error(403, 'Forbidden: request did not arrive via the trusted proxy');
		}
		const auth = parseAuthHeaders((name) => event.request.headers.get(name));
		if (!auth) error(401, 'Unauthorized: no identity headers present');
		if (!isAllowed(auth.groups, env.ALLOWED_GROUP ?? '')) {
			error(403, `Your account is not in the ${env.ALLOWED_GROUP} group`);
		}
		event.locals.user = provisionUser(auth);
	}

	// The theme goes on <html> server-side, so a dark theme never flashes light first.
	const theme = findPlayer(db, event.locals.user.id)?.themeId ?? 'meadow';
	return resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace('data-theme="meadow"', `data-theme="${theme}"`).replace('/*themes*/', THEME_CSS)
	});
};
