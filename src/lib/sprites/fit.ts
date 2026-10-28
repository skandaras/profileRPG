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
	top: {
		coverage: [[[180, 201], [201, 226], [222, 201], [268, 219], [282, 272], [255, 287], [247, 274], [247, 304], [257, 323], [150, 323], [160, 304], [160, 274], [147, 287], [118, 272], [131, 219]]] as Point[][],
		allowance: 16,
		seams: [[179, 207, 185, 213], [216, 207, 222, 213], [130, 277, 148, 281], [255, 277, 272, 281], [168, 317, 242, 322]] as Rect[]
	},
	bottom: {
		coverage: [[[163, 316], [247, 316], [269, 360], [272, 417], [207, 430], [203, 399], [199, 430], [133, 417], [132, 361]]] as Point[][],
		allowance: 12,
		seams: [[168, 319, 242, 323], [138, 360, 146, 368], [258, 360, 266, 368], [149, 414, 195, 419], [211, 414, 259, 419]] as Rect[]
	},
	shoes: {
		coverage: [[[144, 635], [178, 635], [186, 681], [137, 681]], [[210, 635], [240, 635], [256, 681], [205, 681]]] as Point[][],
		allowance: 14,
		seams: [[147, 635, 172, 639], [214, 635, 236, 639]] as Rect[]
	}
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
