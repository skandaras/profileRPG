/**
 * A small seeded generator (mulberry32). Mission outcomes are rolled from the
 * run's stored seed, so a result is fixed the moment the hero sets out and
 * reloading the claim page cannot reroll it.
 */
export type Rng = () => number;

export function seeded(seed: number): Rng {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export function randomSeed(): number {
	return Math.floor(Math.random() * 2 ** 31);
}

export function intBetween(rng: Rng, [min, max]: [number, number]): number {
	return min + Math.floor(rng() * (max - min + 1));
}
