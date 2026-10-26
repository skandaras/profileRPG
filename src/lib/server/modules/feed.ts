import { randomUUID } from 'node:crypto';
import { desc } from 'drizzle-orm';
import type { DbOrTx } from '../db';
import { feedEvents, type FeedType } from '../db/schema';
import type { Ctx } from '../events';

/**
 * The party feed: level-ups, hatches, mission results, streak milestones.
 * Habit titles never go in here; what someone is working on is theirs to share.
 */
export function post(ctx: Ctx, type: FeedType, text: string, icon: string) {
	ctx.tx.insert(feedEvents).values({ id: randomUUID(), userId: ctx.userId, type, text, icon, at: ctx.now }).run();
}

export function recentFeed(db: DbOrTx, limit = 30) {
	return db.select().from(feedEvents).orderBy(desc(feedEvents.at)).limit(limit).all();
}
