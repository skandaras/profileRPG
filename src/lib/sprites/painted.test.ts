import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { DEFAULT_AVATAR, COSMETICS } from '$lib/content/cosmetics';
import { DYES, EYE_COLORS, HAIR_COLORS, SKIN_TONES } from '$lib/content/palettes';
import { paintSwatch, paintSwatches } from '$lib/content/painted-palettes';
import { blank, drawOver, type RgbaImage } from './compose';
import { fitFailures, GARMENT_FIT } from './fit';
import { avatarFigure, paintFigure, petFigure, pixelAvatarFigure } from './layers';
import { PAINT_PARTS, BRAMBLE_ANCHORS } from './painted-figures';
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
		it(`shares the fixed torso and fits every painted garment on ${id}`, () => {
			expect(PAINT_PARTS[id].find(([z]) => z === 10)?.[1]).toBe('body');
			for (const [name, contract] of Object.entries(GARMENT_FIT)) expect(fitFailures(body, master(name), contract), `${id}: ${name}`).toEqual([]);
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
		const clothes = blank(400, 512);
		drawOver(clothes, master('bottom')); drawOver(clothes, master('top'));
		expect(fitFailures(body, clothes, { allowance: 16, seams: [[165, 304, 242, 309]] })).toEqual([]);
	});
	it('rejects an outlying paint mark and a gap cut into a shoe seam', () => {
		const shoes = master('shoes');
		shoes.data.set([255, 255, 255, 255], (400 * 440 + 20) * 4);
		expect(fitFailures(body, shoes, GARMENT_FIT.shoes).some((s) => s.startsWith('outside'))).toBe(true);
		shoes.data[(400 * 467 + 177) * 4 + 3] = 0;
		expect(fitFailures(body, shoes, GARMENT_FIT.shoes).some((s) => s.startsWith('seam'))).toBe(true);
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
	it('uses all four Brambleback paintings and puts accessories at their named anchors', () => {
		for (const stage of ['egg', 'baby', 'teen', 'adult'] as const) for (const acc of [undefined, 'petacc.bandana', 'petacc.bow']) {
			const figure = petFigure('emberkit', stage, acc);
			expect(figure.painted).toBe(true);
			const image = paintPreview(figure)[0];
			expect(image.data.some((v, i) => i % 4 === 3 && v > 0)).toBe(true);
			if (acc && stage !== 'egg') {
				const bow = acc.endsWith('bow'); const layer = figure.layers[1];
				expect([layer.dx! + 50, layer.dy! + (bow ? 70 : 28)]).toEqual(BRAMBLE_ANCHORS[stage][bow ? 'head' : 'neck']);
			} else expect(figure.layers).toHaveLength(1);
		}
	});
});
