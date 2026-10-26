/**
 * Every row stores catalogue ids, never catalogue contents (see content/types.ts).
 * Timestamps are UTC milliseconds; "days" and "periods" are the integers from
 * game/schedule.ts, already in the player's own calendar.
 */
import { sqliteTable, text, integer, real, primaryKey, index } from 'drizzle-orm/sqlite-core';
import type { AvatarConfig, Difficulty, StatBlock, StatWeights } from '$lib/content/types';
import type { Schedule } from '$lib/game/schedule';
import type { Outcome } from '$lib/game/missions';

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	email: text('email'),
	displayName: text('display_name'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
	lastSeenAt: integer('last_seen_at', { mode: 'timestamp_ms' }).notNull()
});

export const players = sqliteTable('players', {
	userId: text('user_id')
		.primaryKey()
		.references(() => users.id, { onDelete: 'cascade' }),
	heroName: text('hero_name').notNull(),
	avatar: text('avatar', { mode: 'json' }).$type<AvatarConfig>().notNull(),
	level: integer('level').notNull().default(1),
	/** XP into the current level, not lifetime. */
	xp: integer('xp').notNull().default(0),
	totalXp: integer('total_xp').notNull().default(0),
	gp: integer('gp').notNull().default(0),
	attrPoints: integer('attr_points').notNull().default(0),
	abilityPoints: integer('ability_points').notNull().default(0),
	allocated: text('allocated', { mode: 'json' }).$type<StatBlock>().notNull(),
	statXp: text('stat_xp', { mode: 'json' }).$type<StatBlock>().notNull(),
	themeId: text('theme_id').notNull().default('meadow'),
	timezone: text('timezone').notNull().default('UTC'),
	dayStartHour: integer('day_start_hour').notNull().default(4),
	/** Rest mode: no fines, no broken streaks, pet needs frozen. */
	resting: integer('resting', { mode: 'boolean' }).notNull().default(false),
	lastVisitDay: integer('last_visit_day'),
	returnStreak: integer('return_streak').notNull().default(0),
	/** The welcome-back ritual for `welcomeDay`: mess left to tidy, and whether the pat happened. */
	welcomeDay: integer('welcome_day'),
	welcomeMess: integer('welcome_mess').notNull().default(0),
	welcomeAway: integer('welcome_away').notNull().default(0),
	welcomeDone: integer('welcome_done', { mode: 'boolean' }).notNull().default(true),
	/** Misses noticed since the last time the player was told about them. */
	awayNote: text('away_note', { mode: 'json' }).$type<AwayNote | null>(),
	shieldWeek: integer('shield_week'),
	shieldsUsed: integer('shields_used').notNull().default(0),
	lastForageDay: integer('last_forage_day'),
	createdAt: integer('created_at').notNull()
});

export interface AwayNote {
	missed: { title: string; count: number; streakLost: number }[];
	fined: number;
	shielded: number;
}

export const habits = sqliteTable(
	'habits',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		kind: text('kind').$type<'habit' | 'task'>().notNull(),
		title: text('title').notNull(),
		icon: text('icon').notNull(),
		notes: text('notes'),
		templateId: text('template_id'),
		difficulty: text('difficulty').$type<Difficulty>().notNull(),
		weights: text('weights', { mode: 'json' }).$type<StatWeights>().notNull(),
		/** Null for one-off tasks. */
		schedule: text('schedule', { mode: 'json' }).$type<Schedule | null>(),
		quantity: integer('quantity'),
		unit: text('unit'),
		dueDay: integer('due_day'),
		anchorDay: integer('anchor_day').notNull(),
		streak: integer('streak').notNull().default(0),
		bestStreak: integer('best_streak').notNull().default(0),
		lastEvaluated: integer('last_evaluated').notNull(),
		sortOrder: integer('sort_order').notNull().default(0),
		createdAt: integer('created_at').notNull(),
		archivedAt: integer('archived_at'),
		completedAt: integer('completed_at')
	},
	(t) => [index('habits_user').on(t.userId)]
);

/**
 * What a tick handed out, by handler, so an undo can hand back exactly that.
 * Each module reads and writes only its own key.
 */
export type TickEffects = Record<string, unknown>;

export const completions = sqliteTable(
	'completions',
	{
		id: text('id').primaryKey(),
		habitId: text('habit_id')
			.notNull()
			.references(() => habits.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		at: integer('at').notNull(),
		day: integer('day').notNull(),
		period: integer('period').notNull(),
		amount: real('amount'),
		effects: text('effects', { mode: 'json' }).$type<TickEffects>().notNull()
	},
	(t) => [index('completions_habit_period').on(t.habitId, t.period), index('completions_user_day').on(t.userId, t.day)]
);

export const pets = sqliteTable(
	'pets',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		speciesId: text('species_id').notNull(),
		name: text('name').notNull(),
		stage: text('stage').$type<'egg' | 'baby' | 'teen' | 'adult'>().notNull(),
		level: integer('level').notNull().default(1),
		xp: integer('xp').notNull().default(0),
		fullness: real('fullness').notNull().default(80),
		joy: real('joy').notNull().default(80),
		tidiness: real('tidiness').notNull().default(80),
		needsAt: integer('needs_at').notNull(),
		warmth: integer('warmth').notNull().default(0),
		warmthNeeded: integer('warmth_needed').notNull().default(0),
		accessoryId: text('accessory_id'),
		active: integer('active', { mode: 'boolean' }).notNull().default(false),
		lastPatAt: integer('last_pat_at'),
		lastPlayAt: integer('last_play_at'),
		lastTidyAt: integer('last_tidy_at'),
		source: text('source').notNull(),
		obtainedAt: integer('obtained_at').notNull(),
		hatchedAt: integer('hatched_at')
	},
	(t) => [index('pets_user').on(t.userId)]
);

export const inventory = sqliteTable(
	'inventory',
	{
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		itemId: text('item_id').notNull(),
		qty: integer('qty').notNull().default(1),
		acquiredAt: integer('acquired_at').notNull()
	},
	(t) => [primaryKey({ columns: [t.userId, t.itemId] })]
);

export const playerAbilities = sqliteTable(
	'player_abilities',
	{
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		abilityId: text('ability_id').notNull(),
		acquiredAt: integer('acquired_at').notNull()
	},
	(t) => [primaryKey({ columns: [t.userId, t.abilityId] })]
);

export const missionRuns = sqliteTable(
	'mission_runs',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		missionId: text('mission_id').notNull(),
		petId: text('pet_id').references(() => pets.id, { onDelete: 'set null' }),
		seed: integer('seed').notNull(),
		startedAt: integer('started_at').notNull(),
		endsAt: integer('ends_at').notNull(),
		claimedAt: integer('claimed_at'),
		outcome: text('outcome', { mode: 'json' }).$type<Outcome>()
	},
	(t) => [index('mission_runs_user').on(t.userId)]
);

export type FeedType =
	| 'joined'
	| 'level'
	| 'hatched'
	| 'evolved'
	| 'mission'
	| 'streak'
	| 'ability'
	| 'return';

export const feedEvents = sqliteTable(
	'feed_events',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		type: text('type').$type<FeedType>().notNull(),
		text: text('text').notNull(),
		icon: text('icon').notNull(),
		at: integer('at').notNull()
	},
	(t) => [index('feed_at').on(t.at)]
);
