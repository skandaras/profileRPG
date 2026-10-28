/** Fit contracts use template coordinates and alpha coverage, independent of paint colours. */
import type { RgbaImage } from './compose';

export type Rect = readonly [number, number, number, number];
export const GARMENT_FIT = {
	top: { allowance: 16, seams: [[180, 246, 187, 250], [219, 246, 225, 250], [175, 270, 230, 303], [145, 281, 151, 284], [253, 281, 259, 284]] as Rect[] },
	bottom: { allowance: 12, seams: [[174, 310, 235, 318], [166, 350, 193, 359], [214, 350, 241, 359]] as Rect[] },
	shoes: { allowance: 14, seams: [[167, 465, 188, 469], [224, 465, 243, 469]] as Rect[] }
} as const;

/** Chebyshev distance includes diagonal paint edges; antialiased fringe is not solid pigment. */
export function silhouetteDistance(body: RgbaImage): Uint16Array {
	const distance = new Uint16Array(body.w * body.h).fill(65535);
	for (let y = 0; y < body.h; y++) for (let x = 0; x < body.w; x++) {
		const i = y * body.w + x;
		if (body.data[i * 4 + 3] >= 128) distance[i] = 0;
		if (x) distance[i] = Math.min(distance[i], distance[i - 1] + 1);
		if (y) for (let dx = -1; dx <= 1; dx++) if (x + dx >= 0 && x + dx < body.w) distance[i] = Math.min(distance[i], distance[i - body.w + dx] + 1);
	}
	for (let y = body.h - 1; y >= 0; y--) for (let x = body.w - 1; x >= 0; x--) {
		const i = y * body.w + x;
		if (x < body.w - 1) distance[i] = Math.min(distance[i], distance[i + 1] + 1);
		if (y < body.h - 1) for (let dx = -1; dx <= 1; dx++) if (x + dx >= 0 && x + dx < body.w) distance[i] = Math.min(distance[i], distance[i + body.w + dx] + 1);
	}
	return distance;
}

export function fitFailures(body: RgbaImage, garment: RgbaImage, contract: { allowance: number; seams: readonly Rect[] }): string[] {
	if (body.w !== garment.w || body.h !== garment.h) return ['frame'];
	const distance = silhouetteDistance(body);
	const failures: string[] = [];
	for (let i = 0; i < distance.length; i++) if (garment.data[i * 4 + 3] >= 128 && distance[i] > contract.allowance) {
		failures.push(`outside at ${i % body.w},${Math.floor(i / body.w)} (${distance[i]}px)`); break;
	}
	for (const [x1, y1, x2, y2] of contract.seams) {
		for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) {
			const i = (y * body.w + x) * 4;
			if (body.data[i + 3] >= 200 && garment.data[i + 3] < 240) {
				failures.push(`seam at ${x},${y}`); break;
			}
		}
	}
	return failures;
}
