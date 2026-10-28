import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { DEFAULT_AVATAR, COSMETICS, PET_ACCESSORIES } from '$lib/content/cosmetics';
import { DYES, EYE_COLORS, HAIR_COLORS, SKIN_TONES } from '$lib/content/palettes';
import { paintSwatch, paintSwatches } from '$lib/content/painted-palettes';
import { blank, drawOver, type RgbaImage } from './compose';
import { covers, fitFailures, GARMENT_FIT, garmentCoverage } from './fit';
import { avatarFigure, paintFigure, petFigure, pixelAvatarFigure } from './layers';
import { BRAMBLE_ANCHORS, PAINT_AVATAR, PAINT_PARTS } from './painted-figures';
import { tintPaint } from './painted';
import { paintPreview } from './preview-png';
import { uiIconFigure } from './ui-icons';

const master = (name: string): RgbaImage => {
	const p = PNG.sync.read(readFileSync(`art/painted/masters/${name}.png`));
	return { w: p.width, h: p.height, data: new Uint8ClampedArray(p.data) };
};

describe('painted template fit', () => {
	const body = master('body');
	for (const id of ['body.human', 'body.elf', 'body.cat', 'body.bunny']) {
		for (const [name, contract] of Object.entries(GARMENT_FIT)) it(`covers the full ${name} band on ${id} in every curated skin`, () => {
			expect(PAINT_PARTS[id].find(([z]) => z === 10)?.[1]).toBe('body');
			expect(fitFailures(body, master(name), contract), `${id}: ${name}`).toEqual([]);
			// Coverage is geometric, so reuse its full pixel set across colourways.
			const regions = garmentCoverage(contract);
			const pixels: number[] = [];
			for (let y = 0; y < body.h; y++) for (let x = 0; x < body.w; x++) {
				if (covers(regions, x, y)) pixels.push((y * body.w + x) * 4);
			}
			for (const skin of paintSwatches('skin')) {
				const figure = avatarFigure({ ...DEFAULT_AVATAR, parts: { ...DEFAULT_AVATAR.parts, body: id }, colors: { ...DEFAULT_AVATAR.colors, skin: skin.id } });
				const z = { top: 30, bottom: 20, shoes: 25 }[name as 'top' | 'bottom' | 'shoes'];
				const dressed = { ...figure, layers: figure.layers.filter((l) => l.z === 10 || l.z === z) };
				const composite = paintPreview(dressed)[0];
				const cloth = paintPreview({ ...figure, layers: figure.layers.filter((l) => l.z === z) })[0];
				let residual: string | undefined;
				for (const i of pixels) {
					if ([0, 1, 2, 3].some((c) => composite.data[i + c] !== cloth.data[i + c])) {
						residual = `body showing at ${i / 4 % body.w},${Math.floor(i / 4 / body.w)} (${skin.id})`;
						break;
					}
				}
				expect(residual, `${id}: ${name}`).toBeUndefined();
			}
		});
	}
	it('keeps each garment joined, with exactly two separate shoes', () => {
		for (const [name, expected] of [['top', 1], ['bottom', 1], ['shoes', 2]] as const) {
			const image = master(name); const seen = new Set<number>(); let components = 0;
			for (let i = 0; i < image.w * image.h; i++) {
				if (seen.has(i) || image.data[i * 4 + 3] < 128) continue;
				components++; const queue = [i]; seen.add(i);
				for (const p of queue) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
					const x = p % image.w + dx, y = Math.floor(p / image.w) + dy, q = y * image.w + x;
					if (x < 0 || y < 0 || x >= image.w || y >= image.h || seen.has(q) || image.data[q * 4 + 3] < 128) continue;
					seen.add(q); queue.push(q);
				}
			}
			expect(components, name).toBe(expected);
		}
	});
	it('covers the waistband join without a skin gap, including its sides', () => {
		const clothes = blank(PAINT_AVATAR.w, PAINT_AVATAR.h);
		drawOver(clothes, master('bottom')); drawOver(clothes, master('top'));
		expect(fitFailures(body, clothes, { allowance: 16, seams: [[168, 319, 242, 323]] })).toEqual([]);
	});
	it('rejects an outlying paint mark and a gap cut into a shoe seam', () => {
		const shoes = master('shoes');
		shoes.data.set([255, 255, 255, 255], (400 * 640 + 20) * 4);
		expect(fitFailures(body, shoes, GARMENT_FIT.shoes).some((s) => s.startsWith('outside'))).toBe(true);
		shoes.data[(400 * 637 + 160) * 4 + 3] = 0;
		expect(fitFailures(body, shoes, GARMENT_FIT.shoes).some((s) => s.startsWith('seam'))).toBe(true);
	});
	it('rejects skin gaps at the neckline, cuffs, waist, hips, hems and shoe tops', () => {
		for (const [name, x, y] of [['top', 180, 210], ['top', 139, 279], ['bottom', 180, 321], ['bottom', 140, 365], ['bottom', 186, 423], ['shoes', 160, 637]] as const) {
			const cloth = master(name);
			cloth.data[(y * cloth.w + x) * 4 + 3] = 0;
			expect(fitFailures(body, cloth, GARMENT_FIT[name]).length, `${name} at ${x},${y}`).toBeGreaterThan(0);
		}
	});
	it('rejects deliberately narrowed shorts even when the compositor would mask the body', () => {
		const shorts = master('bottom');
		for (let y = 310; y < 380; y++) {
			const row = Array.from({ length: body.w }, (_, x) => x).filter((x) => body.data[(y * body.w + x) * 4 + 3] >= 32 && covers(GARMENT_FIT.bottom.coverage, x, y));
			if (!row.length) continue;
			for (let x = row[0]; x < row[0] + 6; x++) shorts.data[(y * body.w + x) * 4 + 3] = 0;
		}
		expect(fitFailures(body, shorts, GARMENT_FIT.bottom).some((failure) => failure.startsWith('side coverage at '))).toBe(true);
	});
	it('keeps every keeper master aligned, greyscale and free of hidden RGB', () => {
		const files = new Set(Object.values(PAINT_PARTS).flatMap((layers) => layers.map(([, file]) => file)));
		for (const file of files) {
			const image = master(file);
			expect([image.w, image.h], file).toEqual([PAINT_AVATAR.w, PAINT_AVATAR.h]);
			let invalid = false;
			for (let i = 0; i < image.data.length; i += 4) {
				if (image.data[i] !== image.data[i + 1] || image.data[i] !== image.data[i + 2] || (!image.data[i + 3] && image.data[i])) { invalid = true; break; }
			}
			expect(invalid, file).toBe(false);
			expect(image.data.some((v, i) => i % 4 === 3 && v > 0), file).toBe(true);
		}
	});
	it('keeps detail paint inside its collar, cuff, button, hem and shoe bands without extraction flecks', () => {
		const template = JSON.parse(readFileSync('art/painted/template.json', 'utf8'));
		const outside = (image: RgbaImage, bands: number[][]) => {
			for (let y = 0; y < image.h; y++) for (let x = 0; x < image.w; x++) {
				if (image.data[(y * image.w + x) * 4 + 3] && !bands.some(([x1, y1, x2, y2]) => x >= x1 && x <= x2 && y >= y1 && y <= y2)) return [x, y];
			}
		};
		for (const name of ['top-collar', 'top-trim', 'bottom-trim', 'shoes-trim']) {
			const image = master(name);
			expect(outside(image, template.detailBands[name]), name).toBeUndefined();
			const seen = new Set<number>();
			for (let i = 0; i < image.w * image.h; i++) {
				if (seen.has(i) || !image.data[i * 4 + 3]) continue;
				const queue = [i]; seen.add(i);
				for (const p of queue) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
					const x = p % image.w + dx, y = Math.floor(p / image.w) + dy, q = y * image.w + x;
					if (x < 0 || y < 0 || x >= image.w || y >= image.h || seen.has(q) || !image.data[q * 4 + 3]) continue;
					seen.add(q); queue.push(q);
				}
				expect(queue.length, `${name} fleck at ${i % image.w},${Math.floor(i / image.w)}`).toBeGreaterThanOrEqual(6);
			}
		}
		const collar = master('top-collar');
		collar.data.set([180, 180, 180, 255], (296 * collar.w + 246) * 4);
		expect(outside(collar, template.detailBands['top-collar'])).toEqual([246, 296]);
	});
	it('keeps the blouse free of enclosed transparent holes, including the right underarm', () => {
		const holes = (image: RgbaImage) => {
			const exterior = new Uint8Array(image.w * image.h); const queue = [0]; exterior[0] = 1;
			for (const p of queue) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
				const x = p % image.w + dx, y = Math.floor(p / image.w) + dy, q = y * image.w + x;
				if (x < 0 || y < 0 || x >= image.w || y >= image.h || exterior[q] || image.data[q * 4 + 3] >= 16) continue;
				exterior[q] = 1; queue.push(q);
			}
			return Array.from(exterior.keys()).filter((i) => !exterior[i] && image.data[i * 4 + 3] < 16);
		};
		const blouse = master('top');
		expect(holes(blouse)).toEqual([]);
		for (let y = 295; y <= 300; y++) blouse.data.fill(0, (y * blouse.w + 246) * 4, (y * blouse.w + 248) * 4);
		expect(holes(blouse)).toContain(296 * blouse.w + 246);
	});
	it('reserves the painted crown and brim for future hats above the shared head', () => {
		const template = JSON.parse(readFileSync('art/painted/template.json', 'utf8'));
		expect(template.canvas).toEqual([PAINT_AVATAR.w, PAINT_AVATAR.h]);
		expect(template.torsoSharedBy).toEqual(['human', 'elf', 'cat', 'bunny']);
		for (const name of ['head', 'neckline', 'shoulders', 'armholes', 'wrists', 'waist', 'hips', 'knees', 'ankles', 'soles']) expect(template.landmarks[name], name).toBeDefined();
		expect(template.hat.crown[0]).toBe(template.landmarks.head[0]);
		expect(template.hat.crown[1]).toBeLessThan(template.landmarks.head[1]);
		expect(template.hat.brim[0][0]).toBeLessThan(template.landmarks.head[0]);
		expect(template.hat.brim[1][0]).toBeGreaterThan(template.landmarks.head[0]);
		expect(template.hat.hairIds).toContain('hair.bob');
		const heads = (template.proportions.ground - template.proportions.skullTop) / (template.proportions.chin - template.proportions.skullTop);
		expect(heads).toBeGreaterThanOrEqual(5);
		expect(heads).toBeLessThanOrEqual(5.5);
	});
	it('keeps retained hats at their head landmark over every retained hair style', () => {
		for (const hat of COSMETICS.filter((c) => c.slot === 'headwear')) for (const hair of COSMETICS.filter((c) => c.slot === 'hair')) {
			const figure = pixelAvatarFigure({ ...DEFAULT_AVATAR, parts: { ...DEFAULT_AVATAR.parts, headwear: hat.id, hair: hair.id } });
			const layer = figure.layers.find((l) => l.z === 60)!;
			const image = paintFigure({ ...figure, layers: [layer] })[0];
			let contact = 0;
			for (let y = 10; y <= 16; y++) for (let x = 10; x <= 21; x++) if (image.data[(y * 32 + x) * 4 + 3]) contact++;
			expect(contact, `${hat.id}/${hair.id}`).toBeGreaterThan(0);
		}
	});
});

describe('paint engine', () => {
	it('composites fractional alpha without losing coverage or darkening transparent edges', () => {
		const base = { w: 1, h: 1, data: new Uint8ClampedArray([20, 40, 60, 128]) };
		drawOver(base, { w: 1, h: 1, data: new Uint8ClampedArray([200, 100, 50, 128]) });
		expect([...base.data]).toEqual([140, 80, 53, 192]);
	});
	it('composes painted props at their native frame while keeping the icon scale API', () => {
		const figure = uiIconFigure({ art: { painted: '/prop.webp', w: 100, h: 80 }, palette: avatarFigure(DEFAULT_AVATAR).layers[0].palette });
		const prop = blank(100, 80); prop.data.set([90, 130, 100, 128], (100 * 80 - 1) * 4);
		const image = paintFigure(figure, new Map([['/prop.webp', prop]]));
		expect(figure.displayHeight).toBe(16);
		expect(image).toHaveLength(1);
		expect([...image[0].data.slice(-4)]).toEqual([90, 130, 100, 128]);
	});
	it('caches tinted values, preserves every alpha value, and retains the ink/paper ramp', () => {
		const image = master('top');
		const tinted = tintPaint(image, '#819b75');
		expect(tintPaint(image, '#819b75')).toBe(tinted);
		for (let i = 3; i < image.data.length; i += 4) expect(tinted.data[i]).toBe(image.data[i]);
		expect(tintPaint(image, '#a89bc4').data).not.toEqual(tinted.data);
	});
	it('keeps facial marks distinct from every curated skin in the real compositor', () => {
		const luminance = (data: Uint8ClampedArray, i: number) => [0.2126, 0.7152, 0.0722].reduce((sum, weight, c) => {
			const v = data[i + c] / 255;
			return sum + weight * (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
		}, 0);
		for (const skin of paintSwatches('skin')) {
			const figure = avatarFigure({ ...DEFAULT_AVATAR, colors: { ...DEFAULT_AVATAR.colors, skin: skin.id } });
			const body = paintPreview({ ...figure, layers: figure.layers.filter((l) => l.body) })[0];
			for (const file of ['face-ink', 'face-mouth']) {
				const source = master(file);
				const composite = paintPreview({ ...figure, layers: figure.layers.filter((l) => l.body || ('painted' in l.art && l.art.painted.endsWith(`/${file}.webp`))) })[0];
				let solid = 0, distinct = 0;
				for (let i = 0; i < source.data.length; i += 4) {
					if (source.data[i + 3] < 200 || body.data[i + 3] < 200) continue;
					solid++;
					const a = luminance(body.data, i), b = luminance(composite.data, i);
					if ((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 2) distinct++;
				}
				expect(solid, `${skin.id}/${file}`).toBeGreaterThan(0);
				expect(distinct / solid, `${skin.id}/${file}`).toBeGreaterThan(0.9);
			}
		}
	});
	it('keeps dark hair highlights below pale grey', () => {
		const source = master('hair-front');
		for (const id of ['ink', 'cocoa']) {
			const image = tintPaint(source, paintSwatch('hair', id).ramp[1]);
			const samples = [];
			for (let i = 0; i < source.data.length; i += 4) {
				if (source.data[i + 3] < 240) continue;
				samples.push(Math.max(image.data[i], image.data[i + 1], image.data[i + 2]));
			}
			samples.sort((a, b) => a - b);
			expect(samples[Math.floor(samples.length * 0.9)], id).toBeLessThan(100);
		}
	});
	it('keeps navy shoe highlights blue rather than pale grey', () => {
		const source = master('shoes');
		const image = tintPaint(source, paintSwatch('shoes', 'navy').ramp[1]);
		const ratios = [];
		for (let i = 0; i < source.data.length; i += 4) {
			if (source.data[i + 3] < 240) continue;
			ratios.push(image.data[i] / image.data[i + 2]);
		}
		ratios.sort((a, b) => a - b);
		expect(ratios[Math.floor(ratios.length * 0.95)]).toBeLessThan(0.8);
	});
	it('keeps every saved palette id valid and maps retired ids to curated swatches', () => {
		for (const [slot, swatches] of [['skin', SKIN_TONES], ['hair', HAIR_COLORS], ['eyes', EYE_COLORS], ['top', DYES]] as const) {
			for (const swatch of swatches) expect(paintSwatches(slot)).toContain(paintSwatch(slot, swatch.id));
		}
	});
	it('uses one smooth painted pose and keeps the retained wardrobe available', () => {
		const figure = avatarFigure(DEFAULT_AVATAR);
		expect(figure.painted).toBe(true);
		expect(paintPreview(figure)).toHaveLength(1);
		expect(avatarFigure({ ...DEFAULT_AVATAR, parts: { ...DEFAULT_AVATAR.parts, top: 'top.hoodie' } }).w).toBe(32);
	});
	it('ignores every stored accessory on every species and stage while disabled', () => {
		for (const species of ['emberkit', 'mossling', 'puddlefin', 'pebblet', 'fluffle', 'glimmerwing']) {
			for (const stage of ['egg', 'baby', 'teen', 'adult'] as const) {
				const plain = petFigure(species, stage);
				for (const acc of PET_ACCESSORIES) expect(petFigure(species, stage, acc.id)).toEqual(plain);
			}
		}
		for (const stage of ['egg', 'baby', 'teen', 'adult'] as const) {
			const figure = petFigure('emberkit', stage, 'petacc.bow');
			expect(figure.painted).toBe(true);
			expect(Buffer.from(paintPreview(figure)[0].data).equals(Buffer.from(paintPreview(petFigure('emberkit', stage))[0].data))).toBe(true);
		}
	});
});


describe('Midnight tarot Brambleback masters', () => {
	const bounds = (image: RgbaImage) => {
		let left = image.w, top = image.h, right = 0, bottom = 0;
		for (let y = 0; y < image.h; y++) for (let x = 0; x < image.w; x++) {
			const i = (y * image.w + x) * 4;
			if (!image.data[i + 3]) {
				if (image.data[i] || image.data[i + 1] || image.data[i + 2]) throw new Error(`Transparent RGB at ${x},${y}`);
				continue;
			}
			left = Math.min(left, x); top = Math.min(top, y);
			right = Math.max(right, x); bottom = Math.max(bottom, y);
		}
		return { left, top, right, bottom, width: right - left + 1 };
	};
	for (const stage of ['egg', 'baby', 'teen', 'adult'] as const) {
		it(`${stage} keeps the native canvas, clear margins, ground line and painted anchors`, () => {
			const image = master(`brambleback-${stage}`);
			expect([image.w, image.h]).toEqual([512, 384]);
			const b = bounds(image);
			expect(b.left).toBeGreaterThanOrEqual(12);
			expect(b.right).toBeLessThan(500);
			expect(b.top).toBeGreaterThanOrEqual(20);
			expect(b.bottom).toBe(350);
			for (const [x, y] of Object.values(BRAMBLE_ANCHORS[stage])) {
				expect(image.data[(y * image.w + x) * 4 + 3]).toBeGreaterThan(200);
			}
		});
	}
	it('gives the open-winged adult a wider silhouette than the upright teen', () => {
		const span = (stage: string) => {
			const image = master(`brambleback-${stage}`);
			let left = 512, right = 0;
			for (let y = 0; y < image.h; y++) for (let x = 0; x < image.w; x++) if (image.data[(y * image.w + x) * 4 + 3] > 128) { left = Math.min(left, x); right = Math.max(right, x); }
			return right - left;
		};
		expect(span('adult')).toBeGreaterThan(span('teen') * 1.7);
	});
});
