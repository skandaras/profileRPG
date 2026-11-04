import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { DEFAULT_AVATAR, PET_ACCESSORIES, OUTFITS } from '$lib/content/cosmetics';
import { DYES, EYE_COLORS, HAIR_COLORS, SKIN_TONES } from '$lib/content/palettes';
import { PAINT_SKIN, PAINT_HAIR, paintSwatch, paintSwatches } from '$lib/content/painted-palettes';
import { SPECIES } from '$lib/content/pets';
import { blank, drawOver, type RgbaImage } from './compose';
import { avatarFigure, petFigure } from './layers';
import { STAGES } from './painted-figures';
import { preparePaint } from './painted';
import { paintPreview } from './preview-png';

const digest = (image: RgbaImage) => createHash('sha256').update(image.data).digest('hex');
const bounds = (image: RgbaImage) => {
	let left = image.w, top = image.h, right = 0, bottom = 0, pixels = 0;
	for (let y = 0; y < image.h; y++) for (let x = 0; x < image.w; x++) {
		if (image.data[(y * image.w + x) * 4 + 3] < 24) continue;
		left = Math.min(left, x); top = Math.min(top, y);
		right = Math.max(right, x); bottom = Math.max(bottom, y); pixels++;
	}
	return { left, top, right, bottom, pixels };
};

function substantialPieces(image: RgbaImage): number {
	const seen = new Uint8Array(image.w * image.h);
	let pieces = 0;
	for (let start = 0; start < seen.length; start++) {
		if (seen[start] || image.data[start * 4 + 3] < 48) continue;
		const stack = [start]; seen[start] = 1;
		let count = 0;
		while (stack.length) {
			const at = stack.pop()!, x = at % image.w, y = Math.floor(at / image.w); count++;
			for (let yy = Math.max(0, y - 1); yy <= Math.min(image.h - 1, y + 1); yy++) for (let xx = Math.max(0, x - 1); xx <= Math.min(image.w - 1, x + 1); xx++) {
				const next = yy * image.w + xx;
				if (seen[next] || image.data[next * 4 + 3] < 48) continue;
				seen[next] = 1; stack.push(next);
			}
		}
		if (count > 64) pieces++;
	}
	return pieces;
}

describe('Wayfarer production art', () => {
	it('renders all eight complete outfits with clear margins and a shared ground', () => {
		const drawings = new Set<string>();
		for (const outfit of OUTFITS) for (const skin of PAINT_SKIN) {
			const figure = avatarFigure({ ...DEFAULT_AVATAR, parts: { ...DEFAULT_AVATAR.parts, top: outfit.id }, colors: { ...DEFAULT_AVATAR.colors, skin: skin.id } });
			const frames = paintPreview(figure);
			expect(frames).toHaveLength(1);
			const b = bounds(frames[0]);
			expect(b.pixels, outfit.id).toBeGreaterThan(14000);
			expect(b.left).toBeGreaterThanOrEqual(8);
			expect(b.right).toBeLessThan(frames[0].w - 8);
			expect(b.top).toBeGreaterThanOrEqual(8);
			expect(b.bottom).toBe(371);
			drawings.add(digest(frames[0]));
		}
		expect(drawings.size).toBe(8);
	});

	it('changes all five hair colours without changing alpha, warm skin, or the outfit', () => {
		for (const outfit of OUTFITS) for (const skin of PAINT_SKIN) {
			const images = PAINT_HAIR.map((hair) => paintPreview(avatarFigure({
				...DEFAULT_AVATAR, parts: { ...DEFAULT_AVATAR.parts, top: outfit.id },
				colors: { ...DEFAULT_AVATAR.colors, skin: skin.id, hair: hair.id }
			}))[0]);
			expect(new Set(images.map(digest)).size).toBe(5);
			for (const image of images.slice(1)) {
				expect(Buffer.from(image.data.filter((_, i) => i % 4 === 3)).equals(Buffer.from(images[0].data.filter((_, i) => i % 4 === 3)))).toBe(true);
				// The tinted head band ends well before the collar and both hands.
				expect(Buffer.from(image.data.subarray(80 * image.w * 4)).equals(Buffer.from(images[0].data.subarray(80 * image.w * 4)))).toBe(true);
			}
		}
	});

	it('renders every species and stage as a distinct painted cutout with transparent gutters', () => {
		const drawings = new Set<string>();
		for (const species of SPECIES) for (const stage of STAGES) {
			const figure = petFigure(species.id, stage), frames = paintPreview(figure);
			expect(figure.painted).toBe(true);
			expect(frames).toHaveLength(1);
			const b = bounds(frames[0]);
			expect(b.pixels, species.id + stage).toBeGreaterThan(2500);
			expect(substantialPieces(frames[0]), species.id + stage + ': no neighbouring sprite fragments').toBe(1);
			expect(b.left).toBeGreaterThanOrEqual(8);
			expect(b.right).toBeLessThan(frames[0].w - 8);
			expect(b.top).toBeGreaterThanOrEqual(8);
			// A fine antenna or foot can antialias into the last ground-line pixel.
			expect(b.bottom).toBeGreaterThanOrEqual(210);
			expect(b.bottom).toBeLessThanOrEqual(211);
			drawings.add(digest(frames[0]));
		}
		expect(drawings.size).toBe(24);
	});

	it('retains legacy avatar mappings and every saved colour id without rewriting input', () => {
		for (const [slot, choices] of [['skin', SKIN_TONES], ['hair', HAIR_COLORS], ['eyes', EYE_COLORS], ['top', DYES]] as const) {
			for (const swatch of choices) expect(paintSwatches(slot)).toContain(paintSwatch(slot, swatch.id));
		}
		const legacy = { parts: { body: 'body.elf', face: 'face.calm', feature: 'feature.glasses', headwear: 'hat.crown', accessory: 'acc.cape', hair: 'hair.curly', top: 'top.tank', bottom: 'bottom.overalls', shoes: 'shoes.boots' }, colors: { skin: 'porcelain', hair: 'seafoam', eyes: 'rose', top: 'starlight' } };
		const before = JSON.stringify(legacy);
		const mapped = { ...DEFAULT_AVATAR, colors: { ...DEFAULT_AVATAR.colors, hair: 'honey' } };
		expect(digest(paintPreview(avatarFigure(legacy))[0])).toBe(digest(paintPreview(avatarFigure(mapped))[0]));
		expect(JSON.stringify(legacy)).toBe(before);
	});

	it('preserves disabled accessory saves on every stage without adding old pixel art', () => {
		for (const species of SPECIES) for (const stage of STAGES) for (const accessory of PET_ACCESSORIES) {
			expect(petFigure(species.id, stage, accessory.id)).toEqual(petFigure(species.id, stage));
		}
		expect(petFigure('unknown-species', 'baby').layers).toEqual([]);
	});
});

describe('atlas sampling', () => {
	it('isolates neighbouring cells, rounds odd-sized boundaries and caches by cell', () => {
		const source = blank(41, 20);
		for (let y = 2; y < 18; y++) for (let x = 2; x < 39; x++) {
			source.data.set(x < 21 ? [180, 70, 30, 255] : [40, 90, 190, 255], (y * source.w + x) * 4);
		}
		const art = { painted: '/atlas.png', w: 32, h: 32, cell: [0, 0, 2, 1] as const, height: 16, ground: 24 };
		const before = source.data.slice();
		const first = preparePaint(source, art);
		expect(preparePaint(source, art)).toBe(first);
		const second = preparePaint(source, { ...art, cell: [1, 0, 2, 1] });
		expect(digest(first)).not.toBe(digest(second));
		for (let i = 0; i < first.data.length; i += 4) if (first.data[i + 3]) expect([...first.data.slice(i, i + 3)]).toEqual([180, 70, 30]);
		for (let i = 0; i < second.data.length; i += 4) if (second.data[i + 3]) expect([...second.data.slice(i, i + 3)]).toEqual([40, 90, 190]);
		expect(source.data).toEqual(before);
		expect(() => preparePaint(source, { ...art, cell: [2, 0, 2, 1] })).toThrow('outside');
		expect(() => preparePaint(blank(20, 20), art)).toThrow('Empty');
	});

	it('resamples alpha without importing invisible background colour into edges', () => {
		const image = blank(20, 20);
		for (let i = 0; i < image.data.length; i += 4) image.data.set([255, 0, 0, 0], i);
		for (let y = 4; y < 16; y++) for (let x = 4; x < 16; x++) image.data.set([40, 100, 150, 128], (y * 20 + x) * 4);
		image.data.set([255, 0, 0, 0], (10 * 20 + 10) * 4);
		const out = preparePaint(image, { painted: '/alpha.png', w: 32, h: 32, cell: [0, 0, 1, 1], height: 17, ground: 24 });
		for (let i = 0; i < out.data.length; i += 4) {
			if (!out.data[i + 3]) expect([...out.data.slice(i, i + 3)]).toEqual([0, 0, 0]);
			else {
				expect([...out.data.slice(i, i + 3)]).toEqual([40, 100, 150]);
				expect(out.data[i + 3]).toBeLessThanOrEqual(128);
			}
		}
	});

	it('composites fractional alpha without darkening transparent edges', () => {
		const base = { w: 1, h: 1, data: new Uint8ClampedArray([20, 40, 60, 128]) };
		drawOver(base, { w: 1, h: 1, data: new Uint8ClampedArray([200, 100, 50, 128]) });
		expect([...base.data]).toEqual([140, 80, 53, 192]);
	});
});
