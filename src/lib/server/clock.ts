/**
 * The game's idea of "now". Everything time-based (pet needs, missed habits,
 * mission timers) reads this instead of Date.now(), so tests can set it and
 * dev mode can skip ahead with /dev/skip instead of waiting a day.
 */
let offsetMs = 0;
let fixed: number | null = null;

export function now(): number {
	return (fixed ?? Date.now()) + offsetMs;
}

export function advanceClock(ms: number) {
	offsetMs += ms;
}

/** Tests only: pin the clock to an exact instant, or release it with null. */
export function setClock(at: number | null) {
	fixed = at;
	offsetMs = 0;
}
