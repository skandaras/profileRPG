import { and, eq, isNull, max } from 'drizzle-orm';
import type { DbOrTx } from '../db';
import { habits, pets, players, users } from '../db/schema';
import { petView } from './pets';
import { playerModifiers, playerStats } from './progression';

/** Everyone who has made a hero: their look, level, stats and companion. */
export function partyCards(db: DbOrTx, now: number) {
	const rows = db.select().from(players).innerJoin(users, eq(players.userId, users.id)).all();
	return rows
		.map(({ players: p, users: u }) => {
			const pet = db
				.select()
				.from(pets)
				.where(and(eq(pets.userId, p.userId), eq(pets.active, true)))
				.get();
			const best = db
				.select({ n: max(habits.streak) })
				.from(habits)
				.where(and(eq(habits.userId, p.userId), isNull(habits.archivedAt)))
				.get();
			return {
				userId: p.userId,
				heroName: p.heroName,
				username: u.displayName || u.username,
				avatar: p.avatar,
				level: p.level,
				totalXp: p.totalXp,
				stats: playerStats(p),
				bestStreak: best?.n ?? 0,
				returnStreak: p.returnStreak,
				resting: p.resting,
				pet: pet ? petView(pet, now, playerModifiers(db, p.userId), p.resting, new Set()) : null
			};
		})
		.sort((a, b) => b.totalXp - a.totalXp);
}
