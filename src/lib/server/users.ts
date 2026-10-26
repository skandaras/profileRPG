import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import type { AuthHeaders, SessionUser } from '$lib/server/auth';

// Throttle last-seen writes so every request isn't a DB write.
const LAST_SEEN_INTERVAL_MS = 5 * 60 * 1000;
const lastSeenCache = new Map<string, number>();

/** Find-or-create the user for an authenticated identity. */
export function provisionUser(auth: AuthHeaders): SessionUser {
	const now = Date.now();
	const existing = db.select().from(users).where(eq(users.username, auth.username)).get();

	if (!existing) {
		const row = {
			id: randomUUID(),
			username: auth.username,
			email: auth.email,
			displayName: auth.displayName,
			createdAt: new Date(now),
			lastSeenAt: new Date(now)
		};
		db.insert(users).values(row).run();
		lastSeenCache.set(auth.username, now);
		return { ...pick(row), groups: auth.groups };
	}

	if (now - (lastSeenCache.get(auth.username) ?? 0) > LAST_SEEN_INTERVAL_MS) {
		db.update(users)
			.set({
				lastSeenAt: new Date(now),
				email: auth.email ?? existing.email,
				displayName: auth.displayName ?? existing.displayName
			})
			.where(eq(users.id, existing.id))
			.run();
		lastSeenCache.set(auth.username, now);
	}
	return { ...pick(existing), groups: auth.groups };
}

function pick(row: { id: string; username: string; email: string | null; displayName: string | null }) {
	return { id: row.id, username: row.username, email: row.email, displayName: row.displayName };
}
