import { CHANNEL_CHARS, type Sprite } from './grid';

const neighbours = (x: number, y: number) => [-1, 0, 1].flatMap((dy) =>
	[-1, 0, 1].filter((dx) => dx || dy).map((dx) => [x + dx, y + dy]));

export function regions(sprite: Sprite, accepts: (char: string) => boolean, within?: Set<number>) {
	const pending = new Set<number>();
	for (let y = 0; y < sprite.h; y++) for (let x = 0; x < sprite.w; x++) {
		const at = y * sprite.w + x;
		if ((!within || within.has(at)) && accepts(sprite.rows[y][x])) pending.add(at);
	}
	const result: Set<number>[] = [];
	while (pending.size) {
		const region = new Set<number>();
		const queue = [pending.values().next().value!];
		while (queue.length) {
			const at = queue.pop()!;
			if (!pending.delete(at)) continue;
			region.add(at);
			for (const [x, y] of neighbours(at % sprite.w, Math.floor(at / sprite.w))) {
				if (x >= 0 && x < sprite.w && y >= 0 && y < sprite.h) queue.push(y * sprite.w + x);
			}
		}
		result.push(region);
	}
	return result;
}

export function reflectedMismatches(sprite: Sprite, structural = false) {
	const structure = (char: string) => {
		if (!structural || char === '.' || char === 'o') return char;
		return CHANNEL_CHARS[char]?.[0] ?? char;
	};
	const mismatches: number[][] = [];
	for (let y = 0; y < sprite.h; y++) for (let x = 0; x < sprite.w / 2; x++) {
		if (structure(sprite.rows[y][x]) !== structure(sprite.rows[y][sprite.w - 1 - x])) mismatches.push([x, y]);
	}
	return mismatches;
}

