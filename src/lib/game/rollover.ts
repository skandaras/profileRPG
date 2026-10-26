/**
 * What happens to habits while nobody is looking.
 *
 * Nothing runs on a timer: each visit evaluates every period that has closed
 * since the last evaluation. A period that met its target already bumped the
 * streak when the last tick landed, so this only has to deal with misses.
 */
import type { Difficulty } from '$lib/content/types';
import { MISS_FINE } from './rewards';
import { isDue, type Schedule } from './schedule';

/** No single visit costs more than this, however long someone was away. */
export const FINE_CAP = 15;

export interface RollInput {
	schedule: Schedule;
	difficulty: Difficulty;
	streak: number;
	/** The last period already judged. A new habit starts at its creation period, which is never judged. */
	lastEvaluated: number;
	currentPeriod: number;
	counts: Map<number, number>;
	resting: boolean;
	shieldsLeft: number;
}

export interface RollResult {
	streak: number;
	lastEvaluated: number;
	missed: number;
	fine: number;
	shieldsUsed: number;
	rested: number;
	/** The streak that a miss ended, for the "while you were away" note. 0 if none. */
	streakLost: number;
}

export function rollHabit(input: RollInput): RollResult {
	const out: RollResult = {
		streak: input.streak,
		lastEvaluated: input.lastEvaluated,
		missed: 0,
		fine: 0,
		shieldsUsed: 0,
		rested: 0,
		streakLost: 0
	};
	for (let p = input.lastEvaluated + 1; p < input.currentPeriod; p++) {
		if (!isDue(input.schedule, p)) continue;
		if ((input.counts.get(p) ?? 0) >= input.schedule.target) continue;
		if (input.resting) {
			out.rested++;
			continue;
		}
		if (out.shieldsUsed < input.shieldsLeft) {
			out.shieldsUsed++;
			continue;
		}
		out.missed++;
		out.fine += MISS_FINE[input.difficulty];
		if (out.streak > 0) out.streakLost = Math.max(out.streakLost, out.streak);
		out.streak = 0;
	}
	out.lastEvaluated = Math.max(input.lastEvaluated, input.currentPeriod - 1);
	return out;
}

/** The fine actually charged: capped per visit, and never more than the purse holds. */
export function chargeFine(total: number, gp: number): number {
	return Math.max(0, Math.min(total, FINE_CAP, gp));
}

/**
 * Streak bookkeeping for one tick. The streak counts periods met in a row, so
 * it moves only on the tick that reaches the target, and only on a due period.
 */
export function streakAfterTick(countBefore: number, target: number, streak: number, due: boolean): number {
	return due && countBefore + 1 === target ? streak + 1 : streak;
}

export function streakAfterUndo(countBefore: number, target: number, streak: number, due: boolean): number {
	return due && countBefore === target ? Math.max(0, streak - 1) : streak;
}
