/**
 * Habits and one-off tasks: building them, ticking them off, and judging the
 * periods that closed while nobody was looking.
 */
import { randomUUID } from 'node:crypto';
import { and, asc, desc, eq, gt, isNull, lt, sql } from 'drizzle-orm';
import { getTemplate } from '$lib/content';
import { HABIT_TEMPLATES } from '$lib/content/habits';
import { STAT_IDS } from '$lib/content/stats';
import type { Difficulty, StatWeights } from '$lib/content/types';
import { mod } from '$lib/game/modifiers';
import { activityReward, amountScale } from '$lib/game/rewards';
import { chargeFine, rollHabit, streakAfterTick, streakAfterUndo } from '$lib/game/rollover';
import { daysLeft, describeSchedule, isDue, normalizeSchedule, periodOf, weekIndex, type Schedule } from '$lib/game/schedule';
import type { DbOrTx } from '../db';
import { completions, habits, players, type AwayNote, type TickEffects } from '../db/schema';
import { emit, GameError, NotFound, notify, type Ctx } from '../events';
import { post } from './feed';
import { companionIsHappy } from './pets';
import { canTakeBack, playerModifiers, playerRow } from './progression';

type HabitRow = typeof habits.$inferSelect;

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const STREAK_MILESTONES = [7, 14, 30, 60, 100];

export interface HabitInput {
	kind: 'habit' | 'task';
	title: string;
	icon: string;
	notes?: string | null;
	templateId?: string | null;
	difficulty: Difficulty;
	weights: StatWeights;
	schedule?: Partial<Schedule> | null;
	quantity?: number | null;
	unit?: string | null;
	dueDay?: number | null;
}

function clean(input: HabitInput) {
	const title = input.title.trim().slice(0, 60);
	if (!title) throw new GameError('Give it a name');
	const weights: StatWeights = {};
	for (const s of STAT_IDS) {
		const v = Number(input.weights[s]);
		if (v > 0) weights[s] = Math.min(1, v);
	}
	const quantity = input.quantity && input.quantity > 0 ? Math.min(100_000, Math.round(input.quantity)) : null;
	return {
		kind: input.kind === 'task' ? ('task' as const) : ('habit' as const),
		title,
		icon: [...(input.icon || '⭐')].slice(0, 2).join('') || '⭐',
		notes: input.notes?.trim().slice(0, 280) || null,
		templateId: input.templateId && getTemplate(input.templateId) ? input.templateId : null,
		difficulty: DIFFICULTIES.includes(input.difficulty) ? input.difficulty : ('medium' as const),
		weights: Object.keys(weights).length ? weights : { str: 0.25, dex: 0.25, int: 0.25, kno: 0.25 },
		schedule: input.kind === 'task' ? null : normalizeSchedule(input.schedule ?? {}),
		quantity,
		unit: quantity ? input.unit?.trim().slice(0, 20) || null : null,
		dueDay: input.kind === 'task' ? (input.dueDay ?? null) : null
	};
}

function ownHabit(db: DbOrTx, userId: string, id: string): HabitRow {
	const h = db
		.select()
		.from(habits)
		.where(and(eq(habits.id, id), eq(habits.userId, userId)))
		.get();
	if (!h) throw new NotFound('No such habit');
	return h;
}

function periodFor(h: HabitRow, day: number): number {
	return h.schedule ? periodOf(h.schedule, day, h.anchorDay) : day;
}

export function createHabit(ctx: Ctx, input: HabitInput): string {
	const c = clean(input);
	const id = randomUUID();
	const anchorDay = ctx.today;
	const max = ctx.tx
		.select({ n: sql<number>`coalesce(max(${habits.sortOrder}), 0)` })
		.from(habits)
		.where(eq(habits.userId, ctx.userId))
		.get();
	ctx.tx
		.insert(habits)
		.values({
			id,
			userId: ctx.userId,
			...c,
			anchorDay,
			// The creation period is never judged: a habit added at 11pm owes nothing today.
			lastEvaluated: c.schedule ? periodOf(c.schedule, ctx.today, anchorDay) : ctx.today,
			sortOrder: (max?.n ?? 0) + 1,
			createdAt: ctx.now
		})
		.run();
	return id;
}

export function createFromTemplate(ctx: Ctx, templateId: string): string {
	const t = getTemplate(templateId);
	if (!t) throw new GameError('Unknown template');
	return createHabit(ctx, { kind: 'habit', templateId, ...t });
}

export function updateHabit(ctx: Ctx, id: string, input: HabitInput) {
	const h = ownHabit(ctx.tx, ctx.userId, id);
	const c = clean({ ...input, kind: h.kind });
	const scheduleChanged = JSON.stringify(c.schedule) !== JSON.stringify(h.schedule);
	ctx.tx
		.update(habits)
		.set({
			...c,
			// A new schedule means new periods; start judging from today so nothing
			// old is held to the new rules.
			...(scheduleChanged && c.schedule
				? { anchorDay: ctx.today, lastEvaluated: periodOf(c.schedule, ctx.today, ctx.today) }
				: {})
		})
		.where(eq(habits.id, h.id))
		.run();
}

export function archiveHabit(ctx: Ctx, id: string, archived: boolean) {
	const h = ownHabit(ctx.tx, ctx.userId, id);
	const set: Partial<HabitRow> = { archivedAt: archived ? ctx.now : null };
	// Coming back from the archive starts fresh rather than owing the gap.
	if (!archived && h.schedule) set.lastEvaluated = periodOf(h.schedule, ctx.today, h.anchorDay);
	ctx.tx.update(habits).set(set).where(eq(habits.id, h.id)).run();
}

export function deleteHabit(ctx: Ctx, id: string) {
	const h = ownHabit(ctx.tx, ctx.userId, id);
	ctx.tx.delete(habits).where(eq(habits.id, h.id)).run();
}

function countIn(db: DbOrTx, habitId: string, period: number): number {
	return (
		db
			.select({ n: sql<number>`count(*)` })
			.from(completions)
			.where(and(eq(completions.habitId, habitId), eq(completions.period, period)))
			.get()?.n ?? 0
	);
}

export function complete(ctx: Ctx, id: string, amount?: number | null) {
	const h = ownHabit(ctx.tx, ctx.userId, id);
	if (h.archivedAt) throw new GameError('That habit is archived');
	if (h.kind === 'task' && h.completedAt) throw new GameError('Already done');
	const period = periodFor(h, ctx.today);
	const before = countIn(ctx.tx, h.id, period);
	const due = h.schedule ? isDue(h.schedule, period) : true;
	const reward = activityReward({
		difficulty: h.difficulty,
		weights: h.weights,
		streak: h.streak,
		scale: amountScale(amount, h.quantity),
		mods: playerModifiers(ctx.tx, ctx.userId),
		petHappy: companionIsHappy(ctx.tx, ctx.userId, ctx.now)
	});
	const completionId = randomUUID();
	const effects: TickEffects = {};
	ctx.tx
		.insert(completions)
		.values({ id: completionId, habitId: h.id, userId: ctx.userId, at: ctx.now, day: ctx.today, period, amount: amount ?? null, effects })
		.run();
	if (h.schedule) {
		const streak = streakAfterTick(before, h.schedule.target, h.streak, due);
		ctx.tx
			.update(habits)
			.set({ streak, bestStreak: Math.max(h.bestStreak, streak) })
			.where(eq(habits.id, h.id))
			.run();
		if (streak > h.streak) {
			if (streak > 1) notify(ctx, 'info', `${h.title}: ${streak} in a row`, '🔥');
			if (STREAK_MILESTONES.includes(streak)) {
				post(ctx, 'streak', `${playerRow(ctx.tx, ctx.userId).heroName} kept a habit going ${streak} times in a row`, '🔥');
			}
		}
	} else {
		ctx.tx.update(habits).set({ completedAt: ctx.now }).where(eq(habits.id, h.id)).run();
	}
	emit(ctx, { type: 'activity.logged', habitId: h.id, weights: h.weights, reward, effects });
	ctx.tx.update(completions).set({ effects }).where(eq(completions.id, completionId)).run();
}

/** Take back the latest tick in the current period, refunding exactly what it gave. */
export function undo(ctx: Ctx, id: string) {
	const h = ownHabit(ctx.tx, ctx.userId, id);
	const period = periodFor(h, ctx.today);
	const last = ctx.tx
		.select()
		.from(completions)
		.where(and(eq(completions.habitId, h.id), eq(completions.period, period), eq(completions.day, ctx.today)))
		.orderBy(desc(completions.at))
		.get();
	if (!last) throw new GameError('Nothing to undo today');
	if (!canTakeBack(ctx.tx, ctx.userId, last.effects)) {
		throw new GameError('That XP already went into a level-up, so the tick stays');
	}
	const before = countIn(ctx.tx, h.id, period);
	ctx.tx.delete(completions).where(eq(completions.id, last.id)).run();
	if (h.schedule) {
		const due = isDue(h.schedule, period);
		ctx.tx.update(habits).set({ streak: streakAfterUndo(before, h.schedule.target, h.streak, due) }).where(eq(habits.id, h.id)).run();
	} else {
		ctx.tx.update(habits).set({ completedAt: null }).where(eq(habits.id, h.id)).run();
	}
	emit(ctx, { type: 'activity.undone', habitId: h.id, effects: last.effects });
}

/**
 * Judge every closed period since the last visit. Misses cost the streak and a
 * little GP (capped per visit); rest mode and streak shields forgive them.
 */
export function rollover(ctx: Ctx) {
	const p = playerRow(ctx.tx, ctx.userId);
	const mods = playerModifiers(ctx.tx, ctx.userId);
	const week = weekIndex(ctx.today);
	const usedThisWeek = p.shieldWeek === week ? p.shieldsUsed : 0;
	let shieldsLeft = Math.max(0, Math.floor(mod(mods, 'streak.shield')) - usedThisWeek);
	const note: AwayNote = { missed: [], fined: 0, shielded: 0 };
	let fineTotal = 0;
	let shieldsUsed = 0;

	const active = ctx.tx
		.select()
		.from(habits)
		.where(and(eq(habits.userId, ctx.userId), eq(habits.kind, 'habit'), isNull(habits.archivedAt)))
		.all();
	for (const h of active) {
		if (!h.schedule) continue;
		const current = periodOf(h.schedule, ctx.today, h.anchorDay);
		if (h.lastEvaluated >= current - 1) continue;
		const rows = ctx.tx
			.select({ period: completions.period, n: sql<number>`count(*)` })
			.from(completions)
			.where(and(eq(completions.habitId, h.id), gt(completions.period, h.lastEvaluated), lt(completions.period, current)))
			.groupBy(completions.period)
			.all();
		const r = rollHabit({
			schedule: h.schedule,
			difficulty: h.difficulty,
			streak: h.streak,
			lastEvaluated: h.lastEvaluated,
			currentPeriod: current,
			counts: new Map(rows.map((x) => [x.period, x.n])),
			resting: p.resting,
			shieldsLeft
		});
		shieldsLeft -= r.shieldsUsed;
		shieldsUsed += r.shieldsUsed;
		fineTotal += r.fine;
		if (r.missed) note.missed.push({ title: h.title, count: r.missed, streakLost: r.streakLost });
		ctx.tx.update(habits).set({ streak: r.streak, lastEvaluated: r.lastEvaluated }).where(eq(habits.id, h.id)).run();
	}

	if (!note.missed.length && !shieldsUsed) return;
	const fined = chargeFine(fineTotal, p.gp);
	note.fined = fined;
	note.shielded = shieldsUsed;
	const previous = p.awayNote;
	const merged: AwayNote = previous
		? { missed: [...previous.missed, ...note.missed], fined: previous.fined + fined, shielded: previous.shielded + shieldsUsed }
		: note;
	ctx.tx
		.update(players)
		.set({
			gp: p.gp - fined,
			shieldWeek: week,
			shieldsUsed: usedThisWeek + shieldsUsed,
			awayNote: merged
		})
		.where(eq(players.userId, ctx.userId))
		.run();
	if (shieldsUsed) notify(ctx, 'info', `Streak Shield saved ${shieldsUsed} streak${shieldsUsed > 1 ? 's' : ''}`, '🛡️');
}

export function dismissAwayNote(ctx: Ctx) {
	ctx.tx.update(players).set({ awayNote: null }).where(eq(players.userId, ctx.userId)).run();
}

export function habitView(h: HabitRow, count: number, today: number) {
	const period = periodFor(h, today);
	const target = h.schedule?.target ?? 1;
	return {
		id: h.id,
		kind: h.kind,
		title: h.title,
		icon: h.icon,
		notes: h.notes,
		templateId: h.templateId,
		difficulty: h.difficulty,
		weights: h.weights,
		schedule: h.schedule,
		scheduleText: h.schedule ? describeSchedule(h.schedule) : h.dueDay !== null ? 'Due' : 'One-off task',
		quantity: h.quantity,
		unit: h.unit,
		dueDay: h.dueDay,
		streak: h.streak,
		bestStreak: h.bestStreak,
		archived: !!h.archivedAt,
		done: h.kind === 'task' ? !!h.completedAt : count >= target,
		count,
		target,
		due: h.schedule ? isDue(h.schedule, period) : true,
		daysLeft: h.schedule ? daysLeft(h.schedule, today, h.anchorDay) : null,
		completedToday: false
	};
}
export type HabitView = ReturnType<typeof habitView>;

export function listHabits(db: DbOrTx, userId: string, today: number, opts: { archived?: boolean } = {}): HabitView[] {
	const rows = db
		.select()
		.from(habits)
		.where(eq(habits.userId, userId))
		.orderBy(asc(habits.sortOrder), asc(habits.createdAt))
		.all()
		.filter((h) => (opts.archived ? !!h.archivedAt : !h.archivedAt))
		// Finished tasks drop off once their day has passed.
		.filter((h) => !(h.kind === 'task' && h.completedAt && !completedOn(db, h.id, today)));
	const todays = new Set(
		db
			.select({ habitId: completions.habitId })
			.from(completions)
			.where(and(eq(completions.userId, userId), eq(completions.day, today)))
			.all()
			.map((r) => r.habitId)
	);
	return rows.map((h) => ({ ...habitView(h, countIn(db, h.id, periodFor(h, today)), today), completedToday: todays.has(h.id) }));
}

function completedOn(db: DbOrTx, habitId: string, day: number): boolean {
	return !!db
		.select({ id: completions.id })
		.from(completions)
		.where(and(eq(completions.habitId, habitId), eq(completions.day, day)))
		.get();
}

export function getHabit(db: DbOrTx, userId: string, id: string) {
	return ownHabit(db, userId, id);
}

/** Recent history for the habit page: ticks per day over the last few weeks. */
export function history(db: DbOrTx, userId: string, id: string, today: number, days = 28) {
	const h = ownHabit(db, userId, id);
	const rows = db
		.select({ day: completions.day, n: sql<number>`count(*)` })
		.from(completions)
		.where(and(eq(completions.habitId, h.id), gt(completions.day, today - days)))
		.groupBy(completions.day)
		.all();
	const byDay = new Map(rows.map((r) => [r.day, r.n]));
	return Array.from({ length: days }, (_, i) => {
		const day = today - days + 1 + i;
		return { day, count: byDay.get(day) ?? 0 };
	});
}

export const TEMPLATES = HABIT_TEMPLATES;
