import { json } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';

export const GET = () => {
	try {
		db.run(sql`SELECT 1`);
		return json({ status: 'ok' });
	} catch (e) {
		return json({ status: 'error', detail: String(e) }, { status: 503 });
	}
};
