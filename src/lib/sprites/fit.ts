/** Fit contracts use template coordinates and alpha coverage, independent of paint colours. */
import type { RgbaImage } from './compose';

export type Point = readonly [number, number];
export interface FitContract {
	allowance: number;
	seams: readonly Rect[];
	coverage?: readonly (readonly Point[])[];
}

export type Rect = readonly [number, number, number, number];
export const GARMENT_FIT = {
	top: { coverage: [[[169, 250], [181, 250], [204, 272], [220, 250], [236, 250], [266, 280], [256, 289], [242, 280], [242, 308], [165, 308], [165, 280], [150, 289], [141, 281]]] as Point[][], allowance: 16, seams: [[180, 246, 187, 250], [219, 246, 225, 250], [175, 270, 230, 303], [145, 281, 151, 284], [253, 281, 259, 284]] as Rect[] },
	bottom: { coverage: [[[162, 304], [244, 304], [257, 345], [257, 367], [204, 377], [150, 367], [149, 345]]] as Point[][], allowance: 12, seams: [[174, 310, 235, 318], [166, 350, 193, 359], [214, 350, 241, 359]] as Rect[] },
	shoes: { coverage: [[[157, 460], [194, 460], [205, 500], [153, 500]], [[215, 460], [251, 460], [254, 500], [204, 500]]] as Point[][], allowance: 14, seams: [[167, 465, 188, 469], [224, 465, 243, 469]] as Rect[] }
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

export function garmentCoverage(contract: FitContract): readonly (readonly Point[])[] {
	return [...(contract.coverage ?? []), ...contract.seams.map(([x1, y1, x2, y2]): Point[] => [[x1, y1], [x2 + 1, y1], [x2 + 1, y2 + 1], [x1, y2 + 1]])];
}

export function fitFailures(body: RgbaImage, garment: RgbaImage, contract: FitContract): string[] {
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
	if (contract.coverage) {
		const regions = garmentCoverage(contract);
		for (let y = 0; y < body.h; y++) {
			const row: number[] = [];
			for (let x = 0; x < body.w; x++) {
				const i = (y * body.w + x) * 4;
				if (covers(regions, x, y) && body.data[i + 3] >= 32) row.push(x);
			}
			// Check the two sides of every connected leg/sleeve before the interior.
			for (const x of row.filter((x, n) => n === 0 || n === row.length - 1 || row[n - 1] !== x - 1 || row[n + 1] !== x + 1)) {
				if (garment.data[(y * body.w + x) * 4 + 3] < 240) return [...failures, `side coverage at ${x},${y}`];
			}
			for (const x of row) if (garment.data[(y * body.w + x) * 4 + 3] < 240) return [...failures, `body showing at ${x},${y}`];
		}
	}
	return failures;
}

/** Pixel centres define a garment's fixed body coverage, including its hems. */
export function covers(regions: readonly (readonly Point[])[], x: number, y: number): boolean {
	return regions.some((polygon) => {
		let inside = false;
		for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
			const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
			if ((yi > y + 0.5) !== (yj > y + 0.5) && x + 0.5 < (xj - xi) * (y + 0.5 - yi) / (yj - yi) + xi) inside = !inside;
		}
		return inside;
	});
}

export function clipCoverage(body: RgbaImage, regions: readonly (readonly Point[])[]): RgbaImage {
	const clipped = { ...body, data: body.data.slice() };
	for (let y = 0; y < body.h; y++) for (let x = 0; x < body.w; x++) {
		if (covers(regions, x, y)) clipped.data.fill(0, (y * body.w + x) * 4, (y * body.w + x + 1) * 4);
	}
	return clipped;
}
