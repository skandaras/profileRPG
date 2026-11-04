/** Fit contracts use template coordinates and alpha coverage, independent of paint colours. */
import type { RgbaImage } from './compose';

export type Point = readonly [number, number];
export interface FitContract {
	allowance: number;
	seams: readonly Rect[];
	coverage?: readonly (readonly Point[])[];
}

export type Rect = readonly [number, number, number, number];
const shirt: Point[] = [[177, 327], [177, 335], [200, 359], [224, 335], [224, 327], [251, 337], [296, 390], [250, 415], [244, 435], [276, 478], [280, 499], [270, 503], [260, 506], [250, 509], [240, 511], [220, 512], [205, 511], [200, 509], [195, 511], [180, 511], [170, 510], [160, 508], [150, 506], [140, 503], [130, 500], [118, 496], [121, 478], [152, 435], [151, 410], [105, 388], [147, 337]];
const feet: Point[][] = [
	[[134, 633], [190, 633], [199, 684], [130, 684]],
	[[207, 633], [255, 633], [278, 684], [200, 684]]
];
export const GARMENT_FIT: Record<string, FitContract> = {
	'outfit-01': { coverage: [shirt, ...feet], allowance: 34, seams: [[184, 345, 188, 349], [135, 398, 143, 401], [257, 400, 266, 404], [153, 501, 187, 506], [213, 501, 246, 506], [154, 635, 177, 639], [218, 635, 241, 639]] },
	'outfit-02': {
		coverage: [[[180, 332], [200, 346], [222, 332], [248, 338], [302, 416], [263, 451], [246, 425], [281, 501], [270, 507], [260, 510], [250, 512], [240, 514], [220, 515], [210, 516], [200, 518], [180, 517], [170, 515], [160, 513], [150, 512], [140, 511], [130, 509], [118, 502], [150, 425], [131, 450], [96, 416], [153, 338]], [[130, 583], [194, 583], [199, 684], [130, 684]], [[205, 583], [267, 583], [278, 684], [200, 684]]],
		allowance: 40, seams: [[189, 344, 210, 347], [122, 431, 130, 437], [273, 431, 281, 436], [154, 510, 185, 514], [217, 510, 245, 514], [153, 585, 180, 589], [217, 585, 246, 589]]
	},
	'outfit-03': {
		coverage: [[[176, 327], [177, 337], [200, 350], [225, 337], [225, 327], [250, 333], [303, 412], [269, 446], [250, 433], [269, 684], [130, 684], [150, 433], [132, 446], [98, 412], [151, 333]]],
		allowance: 28, seams: [[191, 348, 209, 352], [126, 429, 134, 435], [269, 429, 276, 435], [147, 502, 185, 506], [213, 502, 248, 506], [152, 635, 179, 639], [218, 635, 245, 639]]
	},
	'outfit-04': {
		coverage: [[[177, 327], [177, 336], [200, 352], [224, 336], [224, 327], [252, 340], [297, 388], [250, 415], [244, 430], [288, 513], [280, 516], [270, 519], [260, 523], [250, 525], [240, 527], [220, 527], [200, 526], [180, 527], [160, 526], [150, 524], [140, 521], [130, 519], [111, 514], [153, 430], [151, 410], [105, 388], [147, 337]], [[130, 617], [194, 617], [199, 684], [130, 684]], [[205, 617], [267, 617], [278, 684], [200, 684]]],
		allowance: 46, seams: [[189, 348, 210, 352], [135, 400, 143, 404], [258, 400, 265, 404], [154, 521, 185, 525], [217, 521, 241, 525], [153, 618, 180, 622], [217, 618, 246, 622]]
	}
};

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

/** Enclosed clear pixels and detached pigment are extraction errors, regardless of fit. */
export function paintDefects(image: RgbaImage): string[] {
	const failures = new Set<string>();
	const seen = new Uint8Array(image.w * image.h);
	for (let i = 0; i < seen.length; i++) {
		if (seen[i]) continue;
		const painted = image.data[i * 4 + 3] >= 16;
		const queue = [i]; seen[i] = 1; let border = false;
		for (const p of queue) {
			const x = p % image.w, y = Math.floor(p / image.w);
			if (!x || !y || x === image.w - 1 || y === image.h - 1) border = true;
			for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
				if (!painted && dx && dy) continue;
				const nx = x + dx, ny = y + dy, q = ny * image.w + nx;
				if (nx < 0 || ny < 0 || nx >= image.w || ny >= image.h || seen[q] || (image.data[q * 4 + 3] >= 16) !== painted) continue;
				seen[q] = 1; queue.push(q);
			}
		}
		if (painted && queue.length < 6) failures.add('fleck');
		if (!painted && !border) failures.add('hole');
	}
	return [...failures];
}
