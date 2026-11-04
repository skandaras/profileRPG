import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { DEFAULT_AVATAR, PET_ACCESSORIES, OUTFITS } from '$lib/content/cosmetics';
import { DYES, EYE_COLORS, HAIR_COLORS, SKIN_TONES } from '$lib/content/palettes';
import { PAINT_SKIN, PAINT_HAIR, paintSwatch, paintSwatches } from '$lib/content/painted-palettes';
import { blank, drawOver, type RgbaImage } from './compose';
import { covers, fitFailures, GARMENT_FIT, garmentCoverage, paintDefects } from './fit';
import { avatarFigure, paintFigure, petFigure } from './layers';
import { BRAMBLE_ANCHORS, PAINT_AVATAR, OUTFIT_PAINT } from './painted-figures';
import { tintPaint } from './painted';
import { paintPreview } from './preview-png';

const master = (name: string): RgbaImage => {
	const p = PNG.sync.read(readFileSync(`art/painted/masters/${name}.png`));
	return { w: p.width, h: p.height, data: new Uint8ClampedArray(p.data) };
};

describe('chibi template fit', () => {
	for (const outfit of OUTFITS) for (const skin of PAINT_SKIN) {
		it(`covers ${outfit.id} on ${skin.id} including its full bands and edges`, () => {
			const name = OUTFIT_PAINT[outfit.id], contract = GARMENT_FIT[name];
			const body = master(skin.id === 'deep' ? 'keeper-deep' : 'keeper-light');
			expect(fitFailures(body, master(name), contract)).toEqual([]);
			const figure = avatarFigure({ ...DEFAULT_AVATAR, parts: { ...DEFAULT_AVATAR.parts, top: outfit.id }, colors: { ...DEFAULT_AVATAR.colors, skin: skin.id } });
			const dressed = paintPreview({ ...figure, layers: figure.layers.slice(0, 2) })[0];
			const cloth = paintPreview({ ...figure, layers: [figure.layers[1]] })[0];
			let residual: string | undefined;
			for (let y = 0; y < body.h; y++) for (let x = 0; x < body.w; x++) {
				if (!covers(garmentCoverage(contract), x, y)) continue;
				const i = (y * body.w + x) * 4;
				if ([0, 1, 2, 3].some((c) => dressed.data[i + c] !== cloth.data[i + c])) residual ??= `${x},${y}`;
			}
			expect(residual).toBeUndefined();
		});
	}
	it('rejects deliberately narrowed clothing even with body clipping enabled', () => {
		const body = master('keeper-light'), outfit = master('outfit-01'), contract = GARMENT_FIT['outfit-01'];
		for (let y = 450; y < 490; y++) {
			const row = Array.from({ length: body.w }, (_, x) => x).filter((x) => body.data[(y * body.w + x) * 4 + 3] >= 32);
			for (let x = row[0]; x < row[0] + 8; x++) outfit.data[(y * body.w + x) * 4 + 3] = 0;
		}
		expect(fitFailures(body, outfit, contract).some((f) => f.startsWith('side coverage'))).toBe(true);
	});
	it('rejects a hole at every neckline, cuff, hem and shoe top', () => {
		for (const [name, contract] of Object.entries(GARMENT_FIT)) for (const [x1, y1, x2, y2] of contract.seams) {
			const cloth = master(name), body = master('keeper-light');
			let cut = false;
			for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) {
				if (body.data[(y * body.w + x) * 4 + 3] < 200) continue;
				cloth.data[(y * body.w + x) * 4 + 3] = 0; cut = true;
			}
			expect(cut, `${name}: ${x1},${y1}`).toBe(true);
			expect(fitFailures(body, cloth, contract).some((f) => f.startsWith('seam'))).toBe(true);
		}
	});
	it('rejects misplaced paint, enclosed holes and extraction flecks', () => {
		const body = master('keeper-light');
		for (const name of Object.values(OUTFIT_PAINT)) {
			const cloth = master(name);
			expect(paintDefects(cloth), name).toEqual([]);
			cloth.data.set([255, 255, 255, 255], (40 * cloth.w + 20) * 4);
			expect(fitFailures(body, cloth, GARMENT_FIT[name]).some((f) => f.startsWith('outside'))).toBe(true);
			expect(paintDefects(cloth)).toContain('fleck');
			cloth.data.fill(0, (400 * cloth.w + 200) * 4, (400 * cloth.w + 201) * 4);
			expect(paintDefects(cloth)).toContain('hole');
		}
	});
	it('keeps every layer aligned and clear of invisible RGB', () => {
		const files = ['keeper-light', 'keeper-deep', 'keeper-bob', ...Object.values(OUTFIT_PAINT)];
		for (const file of files) {
			const image = master(file);
			expect([image.w, image.h]).toEqual([PAINT_AVATAR.w, PAINT_AVATAR.h]);
			let bad = false;
			for (let i = 0; i < image.data.length; i += 4) if (!image.data[i + 3] && image.data.slice(i, i + 3).some(Boolean)) bad = true;
			expect(bad, file).toBe(false);
		}
		const template = JSON.parse(readFileSync('art/painted/template.json', 'utf8'));
		expect(template.canvas).toEqual([PAINT_AVATAR.w, PAINT_AVATAR.h]);
		for (const name of ['head', 'neckline', 'shoulders', 'armholes', 'wrists', 'waist', 'hips', 'knees', 'ankles', 'soles']) expect(template.landmarks[name]).toBeDefined();
	});
});

describe('paint engine', () => {
	it('composites fractional alpha without darkening transparent edges', () => {
		const base = { w: 1, h: 1, data: new Uint8ClampedArray([20, 40, 60, 128]) };
		drawOver(base, { w: 1, h: 1, data: new Uint8ClampedArray([200, 100, 50, 128]) });
		expect([...base.data]).toEqual([140, 80, 53, 192]);
	});
	it('caches hair tint, preserving alpha and distinct colours', () => {
		const source = master('keeper-bob'), tinted = tintPaint(source, '#503628');
		expect(tintPaint(source, '#503628')).toBe(tinted);
		let bad = false;
		for (let i = 3; i < source.data.length; i += 4) if (source.data[i] !== tinted.data[i]) bad = true;
		expect(bad).toBe(false);
		for (const color of PAINT_HAIR.filter((s) => s.id !== 'cocoa')) expect(tintPaint(source, color.ramp[1]).data).not.toEqual(tinted.data);
	});
	it('preserves the eye whites and irises and shares one body alpha across skins', () => {
		const light = master('keeper-light'), deep = master('keeper-deep');
		for (const [x, y] of [[118, 246], [126, 265], [277, 246], [269, 265], [145, 245], [252, 245], [145, 263], [253, 263]]) {
			const i = (y * light.w + x) * 4;
			expect([...deep.data.slice(i, i + 4)], `${x},${y}`).toEqual([...light.data.slice(i, i + 4)]);
		}
		let alphaChanged = false;
		for (let i = 3; i < light.data.length; i += 4) if (light.data[i] !== deep.data[i]) alphaChanged = true;
		expect(alphaChanged).toBe(false);
	});
	it('keeps brows and the smile readable on both skins in the final composite', () => {
		const luminance = (image: RgbaImage, x: number, y: number) => {
			const i = (y * image.w + x) * 4;
			return [0.2126, 0.7152, 0.0722].reduce((sum, weight, c) => {
				const v = image.data[i + c] / 255;
				return sum + weight * (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
			}, 0);
		};
		for (const skin of PAINT_SKIN) {
			const image = paintPreview(avatarFigure({ ...DEFAULT_AVATAR, colors: { ...DEFAULT_AVATAR.colors, skin: skin.id } }))[0];
			for (const [x1, y1, x2, y2] of [[122, 182, 153, 199], [182, 278, 213, 291]]) {
				const samples: number[] = [];
				for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) samples.push(luminance(image, x, y));
				expect((Math.max(...samples) + 0.05) / (Math.min(...samples) + 0.05), skin.id).toBeGreaterThan(3);
			}
		}
	});
	it('maps every saved palette id to a kept option', () => {
		for (const [slot, choices] of [['skin', SKIN_TONES], ['hair', HAIR_COLORS], ['eyes', EYE_COLORS], ['top', DYES]] as const) {
			for (const swatch of choices) expect(paintSwatches(slot)).toContain(paintSwatch(slot, swatch.id));
		}
	});
	it('renders legacy elf, glasses, crown, cape, overalls and colours exactly as their mapped default', () => {
		const legacy = { parts: { body: 'body.elf', face: 'face.calm', feature: 'feature.glasses', headwear: 'hat.crown', accessory: 'acc.cape', hair: 'hair.curly', top: 'top.tank', bottom: 'bottom.overalls', shoes: 'shoes.boots' }, colors: { skin: 'porcelain', hair: 'seafoam', eyes: 'rose', top: 'starlight' } };
		const mapped = { ...DEFAULT_AVATAR, colors: { ...DEFAULT_AVATAR.colors, hair: 'honey' } };
		expect(avatarFigure(legacy)).toEqual(avatarFigure(mapped));
		expect(Buffer.from(paintPreview(avatarFigure(legacy))[0].data).equals(Buffer.from(paintPreview(avatarFigure(mapped))[0].data))).toBe(true);
	});
	it('uses one painted pose for every outfit and ignores stored pet accessories while disabled', () => {
		for (const outfit of OUTFITS) expect(paintPreview(avatarFigure({ ...DEFAULT_AVATAR, parts: { ...DEFAULT_AVATAR.parts, top: outfit.id } }))).toHaveLength(1);
		for (const species of ['emberkit', 'mossling', 'puddlefin', 'pebblet', 'fluffle', 'glimmerwing']) for (const stage of ['egg', 'baby', 'teen', 'adult'] as const) {
			for (const accessory of PET_ACCESSORIES) expect(petFigure(species, stage, accessory.id)).toEqual(petFigure(species, stage));
		}
	});
	it('composes native painted props', () => {
		const prop = blank(100, 80); prop.data.set([90, 130, 100, 128], (100 * 80 - 1) * 4);
		const image = paintFigure({ w: 100, h: 80, pivot: 70, painted: true, layers: [{ z: 0, art: { painted: '/prop.webp', w: 100, h: 80 }, palette: avatarFigure(DEFAULT_AVATAR).layers[0].palette }] }, new Map([['/prop.webp', prop]]));
		expect([...image[0].data.slice(-4)]).toEqual([90, 130, 100, 128]);
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
