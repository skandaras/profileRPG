/**
 * Pet needs, derived from the last stored values and how long ago they were
 * stored, so nothing ticks in the background. Pets never die or leave: low
 * needs change their mood, and a happy pet gives a small XP bonus.
 */
export interface Needs {
	fullness: number;
	joy: number;
	tidiness: number;
}

export const DECAY_PER_HOUR: Needs = { fullness: 2, joy: 1.5, tidiness: 1 };
export const HAPPY_AT = 60;
export const LOW_AT = 25;

const clamp = (v: number) => Math.max(0, Math.min(100, v));

export function clampNeeds(n: Needs): Needs {
	return { fullness: clamp(n.fullness), joy: clamp(n.joy), tidiness: clamp(n.tidiness) };
}

/** `decay` is the modifier sum for pet.decay (e.g. -0.25). Resting freezes needs entirely. */
export function needsAt(stored: Needs, since: number, now: number, decay: number, resting: boolean): Needs {
	if (resting || now <= since) return clampNeeds(stored);
	const hours = (now - since) / 3_600_000;
	const rate = Math.max(0.1, 1 + decay);
	return clampNeeds({
		fullness: stored.fullness - DECAY_PER_HOUR.fullness * hours * rate,
		joy: stored.joy - DECAY_PER_HOUR.joy * hours * rate,
		tidiness: stored.tidiness - DECAY_PER_HOUR.tidiness * hours * rate
	});
}

export type Mood = 'happy' | 'okay' | 'hungry' | 'bored' | 'messy' | 'sulking';

export function mood(n: Needs): Mood {
	if (n.fullness >= HAPPY_AT && n.joy >= HAPPY_AT && n.tidiness >= HAPPY_AT) return 'happy';
	if (n.fullness <= 5 && n.joy <= 5) return 'sulking';
	const lowest = Math.min(n.fullness, n.joy, n.tidiness);
	if (lowest >= LOW_AT) return 'okay';
	if (lowest === n.fullness) return 'hungry';
	if (lowest === n.joy) return 'bored';
	return 'messy';
}

export const MOOD_TEXT: Record<Mood, string> = {
	happy: 'is beaming',
	okay: 'is doing fine',
	hungry: 'is peckish',
	bored: 'wants to play',
	messy: 'would like a tidy room',
	sulking: 'is sulking in bed. A treat and a pat will help'
};

export function isHappy(n: Needs): boolean {
	return mood(n) === 'happy';
}

// ── Growth ──────────────────────────────────────────────────────────────────

export type GrownStage = 'baby' | 'teen' | 'adult';
export const TEEN_AT = 5;
export const ADULT_AT = 12;

export function petXpToNext(level: number): number {
	return 30 + 20 * level;
}

export function stageFor(level: number): GrownStage {
	return level >= ADULT_AT ? 'adult' : level >= TEEN_AT ? 'teen' : 'baby';
}

export function addPetXp(level: number, xp: number, gained: number) {
	let l = level;
	let x = xp + Math.max(0, gained);
	while (l < 50 && x >= petXpToNext(l)) {
		x -= petXpToNext(l);
		l++;
	}
	return { level: l, xp: x, grew: stageFor(l) !== stageFor(level) };
}

/** Share of the hero's activity XP the companion earns, more for its favourite stats. */
export function companionShare(xp: number, affinityWeight: number, petXpMod: number): number {
	return Math.round(xp * (0.25 + 0.25 * affinityWeight) * (1 + petXpMod));
}

// ── Care ────────────────────────────────────────────────────────────────────

export const CARE = {
	pat: { cooldownMs: 60 * 60_000, joy: 8, petXp: 2 },
	play: { cooldownMs: 3 * 60 * 60_000, joy: 20, fullness: -5, petXp: 5 },
	tidy: { cooldownMs: 6 * 60 * 60_000, tidiness: 35, petXp: 2 }
} as const;

export function cooldownLeft(lastAt: number | null, cooldownMs: number, now: number): number {
	if (lastAt === null) return 0;
	return Math.max(0, lastAt + cooldownMs - now);
}

// ── Eggs ────────────────────────────────────────────────────────────────────

export const WARMTH_NEEDED = { common: 60, uncommon: 100, rare: 150 } as const;
export const WARMTH_PER_ACTIVITY = 10;
