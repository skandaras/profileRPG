import { expect, it } from 'vitest';
import { COSMETICS, DEFAULT_AVATAR, PET_ACCESSORIES } from '$lib/content/cosmetics';
import { DYES, HAIR_COLORS, REFERENCE_PALETTE, SKIN_TONES } from '$lib/content/palettes';
import { bed, messFigures } from './room';
import { SPECIES } from '$lib/content/pets';
import { Z } from './frames';
import { blank, recolor, renderSprite, type RgbaImage } from './compose';
import { avatarFigure, paintFigure, petFigure } from './layers';

const pixel = (img: RgbaImage, x: number, y: number) =>
	Array.from(img.data.subarray((y * img.w + x) * 4, (y * img.w + x) * 4 + 4));
const hair = COSMETICS.filter((c) => c.slot === 'hair');
const faces = COSMETICS.filter((c) => c.slot === 'face');
const hats = COSMETICS.filter((c) => c.slot === 'headwear');

it('leaves every face clear under every Garden hair style and hat', () => {
	for (const face of faces) {
		const avatar = { ...DEFAULT_AVATAR, parts: { ...DEFAULT_AVATAR.parts, face: face.id, hair: undefined } };
		const base = paintFigure(avatarFigure(avatar));
		const faceArt = face.layers[0].art;
		if (!('sprite' in faceArt)) throw Error('Expected a face grid');
		for (const style of hair) for (const hat of [undefined, ...hats]) {
			const frames = paintFigure(avatarFigure({ ...avatar, parts: { ...avatar.parts, hair: style.id, headwear: hat?.id } }));
			for (let y = 18; y <= 24; y++) for (let x = 10; x <= 21; x++) {
				if (faceArt.sprite.rows[y][x] === '.') continue;
				for (let f = 0; f < frames.length; f++) {
					expect(pixel(frames[f], x, y + f), `${style.id}, ${face.id}, ${hat?.id}, frame ${f}`).toEqual(pixel(base[f], x, y + f));
				}
			}
		}
	}
});

it('recolours every Garden base part through the reference palette in all skin and hair choices', () => {
	const parts = COSMETICS.filter((c) => ['body', 'hair', 'face'].includes(c.slot));
	for (const part of parts) for (const layer of part.layers) {
		if (!('sprite' in layer.art)) throw Error('Expected a Garden grid');
		const reference = renderSprite(layer.art.sprite, REFERENCE_PALETTE);
		for (const skin of SKIN_TONES) for (const color of HAIR_COLORS) {
			const palette = { ...REFERENCE_PALETTE, skin: skin.ramp, hair: color.ramp };
			const png = recolor(reference, REFERENCE_PALETTE, palette);
			const grid = renderSprite(layer.art.sprite, palette);
			expect(Buffer.compare(Buffer.from(png.data), Buffer.from(grid.data)), `${part.id}, ${skin.id}, ${color.id}`).toBe(0);
		}
	}
});

it('keeps face strokes distinct from skin with dark hair and reference PNGs', () => {
	const luminance = (rgb: number[]) => rgb.slice(0, 3).reduce((sum, value, i) => {
		const s = value / 255;
		return sum + (s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4) * [0.2126, 0.7152, 0.0722][i];
	}, 0);
	for (const face of faces) for (const skin of SKIN_TONES) for (const color of ['ink', 'cocoa', 'chestnut']) {
		const avatar = { ...DEFAULT_AVATAR, parts: { ...DEFAULT_AVATAR.parts, face: face.id }, colors: { ...DEFAULT_AVATAR.colors, skin: skin.id, hair: color } };
		const figure = avatarFigure(avatar);
		const layer = figure.layers.find((l) => l.z === Z.face)!;
		if (!('sprite' in layer.art)) throw Error('Expected a face grid');
		const sprite = layer.art.sprite;
		const rendered = paintFigure(figure)[0];
		const bare = paintFigure(avatarFigure({ ...avatar, parts: { ...avatar.parts, face: undefined } }))[0];
		for (let y = 0; y < sprite.h; y++) for (let x = 0; x < sprite.w; x++) {
			if (!['p', 'P'].includes(sprite.rows[y][x])) continue;
			const a = luminance(pixel(rendered, x, y)), b = luminance(pixel(bare, x, y));
			expect((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05), `${face.id}, ${skin.id}, ${color}, ${x}, ${y}`).toBeGreaterThanOrEqual(2);
		}
		const png = renderSprite(sprite, REFERENCE_PALETTE);
		const fromPng = paintFigure({ ...figure, layers: figure.layers.map((l) => l === layer ? { ...l, art: { png: '/face.png', w: 32, h: 40 } } : l) }, new Map([['/face.png', png]]))[0];
		expect(fromPng.data).toEqual(rendered.data);
		if (skin.id === 'porcelain' || skin.id === 'peach') {
			expect(layer.palette.primary.slice(0, 2)).toEqual(['#2b1f33', '#1a1322']);
		}
	}
});

it('keeps both hair layers under closed hats and preserves hair under bands and crowns', () => {
	for (const style of hair) for (const hat of hats) {
		const figure = avatarFigure({ ...DEFAULT_AVATAR, parts: { ...DEFAULT_AVATAR.parts, hair: style.id, headwear: hat.id } });
		const layers = figure.layers.filter((l) => l.z === Z.hair || l.z === Z.back);
		expect(layers).toHaveLength(2);
		for (const layer of layers) {
			expect(layer.clipTop).toBe(hat.coversHairAbove);
			const isolated = paintFigure({ ...figure, layers: [layer] })[0];
			if (hat.coversHairAbove) {
				for (let y = 0; y < hat.coversHairAbove; y++) for (let x = 0; x < isolated.w; x++) expect(pixel(isolated, x, y)[3]).toBe(0);
			}
		}
	}
	const source = blank(32, 40);
	source.data.fill(255);
	const pngs = new Map([['/hair.png', source]]);
	const figure = avatarFigure(DEFAULT_AVATAR);
	const clipped = paintFigure({ ...figure, layers: [{ ...figure.layers[0], art: { png: '/hair.png', w: 32, h: 40 }, clipTop: 14 }] }, pngs)[0];
	expect(pixel(clipped, 16, 13)[3]).toBe(0);
	expect(pixel(clipped, 16, 14)[3]).toBe(255);
	expect(pixel(source, 16, 13)[3]).toBe(255);
});

it('fits every accessory on every species and stage and preserves the eyes in both idle frames', () => {
	for (const species of SPECIES) for (const stage of ['baby', 'teen', 'adult'] as const) {
		const base = paintFigure(petFigure(species.id, stage));
		for (const accessory of PET_ACCESSORIES) {
			const figure = petFigure(species.id, stage, accessory.id);
			const layer = figure.layers[1];
			if (!('sprite' in layer.art)) throw Error('Expected an accessory grid');
			const { sprite } = layer.art;
			for (let y = 0; y < sprite.h; y++) for (let x = 0; x < sprite.w; x++) {
				if (sprite.rows[y][x] === '.') continue;
				const tx = x + layer.dx!, ty = y + layer.dy!;
				expect(tx, `${species.id}, ${stage}, ${accessory.id}`).toBeGreaterThanOrEqual(0);
				expect(tx).toBeLessThan(32);
				expect(ty).toBeGreaterThanOrEqual(0);
				expect(ty).toBeLessThan(32);
			}
			const dressed = paintFigure(figure);
			for (let f = 0; f < base.length; f++) for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
				const rgba = pixel(base[f], x, y);
				if (rgba.toString() === '26,19,34,255' || rgba.toString() === '255,254,253,255') {
					expect(pixel(dressed[f], x, y), `${species.id}, ${stage}, ${accessory.id}, frame ${f}`).toEqual(rgba);
				}
			}
		}
	}
	for (const species of SPECIES) for (const accessory of PET_ACCESSORIES) {
		expect(petFigure(species.id, 'egg', accessory.id).layers).toHaveLength(1);
	}
});

it('keeps Brookbell’s eyes level inside the brow at every age', () => {
	for (const stage of ['baby', 'teen', 'adult'] as const) {
		const figure = petFigure('puddlefin', stage);
		const image = paintFigure(figure)[0];
		const top = { baby: 16, teen: 12, adult: 9 }[stage];
		for (const x of [10, 15]) {
			expect(pixel(image, x, top + 4)).toEqual([255, 254, 253, 255]);
			expect(pixel(image, x, top + 5)).toEqual([26, 19, 34, 255]);
		}
	}
});

it('preserves the eyes under every wardrobe piece, body and hair in both frames', () => {
	const parts = COSMETICS.filter((c) => ['top', 'bottom', 'shoes', 'headwear', 'feature', 'accessory'].includes(c.slot));
	for (const body of COSMETICS.filter((c) => c.slot === 'body')) for (const style of hair) {
		const avatar = { ...DEFAULT_AVATAR, parts: { ...DEFAULT_AVATAR.parts, body: body.id, hair: style.id } };
		const base = paintFigure(avatarFigure(avatar));
		for (const part of parts) {
			const dressed = paintFigure(avatarFigure({ ...avatar, parts: { ...avatar.parts, [part.slot]: part.id } }));
			for (let f = 0; f < base.length; f++) for (let y = 19; y <= 21; y++) for (const start of [10, 19]) for (let x = start; x < start + 3; x++) {
				expect(pixel(dressed[f], x, y + f), `${body.id}, ${style.id}, ${part.id}`).toEqual(pixel(base[f], x, y + f));
			}
		}
	}
});

it('recolours every wardrobe layer from reference PNGs with every dye', () => {
	const parts = COSMETICS.filter((c) => ['top', 'bottom', 'shoes', 'headwear', 'feature', 'accessory'].includes(c.slot));
	for (const part of parts) for (const dye of DYES) {
		for (const skin of ['peach', 'deep']) {
			const avatar = { ...DEFAULT_AVATAR, parts: { ...DEFAULT_AVATAR.parts, [part.slot]: part.id }, colors: { ...DEFAULT_AVATAR.colors, [part.slot]: dye.id, skin } };
			const figure = avatarFigure(avatar);
			const pngs = new Map<string, RgbaImage>();
			let number = 0;
			const layers = figure.layers.map((layer) => {
				if (!part.layers.some((p) => p.art === layer.art)) return layer;
				if (!('sprite' in layer.art)) throw Error('Expected a wardrobe grid');
				expect([layer.art.sprite.w, layer.art.sprite.h]).toEqual([32, 40]);
				const path = `/wardrobe-${number++}.png`;
				pngs.set(path, renderSprite(layer.art.sprite, REFERENCE_PALETTE));
				return { ...layer, art: { png: path, w: 32, h: 40 } };
			});
			const fromPng = paintFigure({ ...figure, layers }, pngs);
			const fromGrid = paintFigure(figure);
			for (let f = 0; f < fromGrid.length; f++) {
				expect(Buffer.compare(Buffer.from(fromPng[f].data), Buffer.from(fromGrid[f].data)), `${part.id}, ${dye.id}, ${skin}, frame ${f}`).toBe(0);
			}
		}
	}
});

it('puts the overalls bib over shirts and hair backs behind capes and wings', () => {
	const overall = avatarFigure({ ...DEFAULT_AVATAR, parts: { ...DEFAULT_AVATAR.parts, bottom: 'bottom.overalls', top: 'top.hoodie' } });
	const bib = overall.layers.find((l) => l.z === Z.neck)!;
	const image = paintFigure(overall)[0];
	const alone = paintFigure({ ...overall, layers: [bib] })[0];
	expect(pixel(image, 14, 29)).toEqual(pixel(alone, 14, 29));
	for (const style of hair) for (const accessory of ['acc.cape', 'acc.wings', 'acc.backpack']) {
		const figure = avatarFigure({ ...DEFAULT_AVATAR, parts: { ...DEFAULT_AVATAR.parts, hair: style.id, accessory } });
		const backs = figure.layers.filter((l) => l.z === Z.back);
		expect(backs).toHaveLength(2);
		const cover = paintFigure({ ...figure, layers: [backs[1]] })[0];
		const composed = paintFigure({ ...figure, layers: backs })[0];
		for (let y = 0; y < 40; y++) for (let x = 0; x < 32; x++) {
			if (pixel(cover, x, y)[3]) expect(pixel(composed, x, y)).toEqual(pixel(cover, x, y));
		}
	}
});

it('renders Garden pet accessories identically from reference PNGs on every species', () => {
	for (const species of SPECIES) for (const stage of ['baby', 'teen', 'adult'] as const) for (const accessory of PET_ACCESSORIES) {
		const figure = petFigure(species.id, stage, accessory.id);
		const layer = figure.layers[1];
		if (!('sprite' in layer.art)) throw Error('Expected an accessory grid');
		expect([layer.art.sprite.w, layer.art.sprite.h]).toEqual([12, 8]);
		const png = renderSprite(layer.art.sprite, REFERENCE_PALETTE);
		const fromPng = paintFigure({ ...figure, layers: [figure.layers[0], { ...layer, art: { png: '/accessory.png', w: 12, h: 8 } }] }, new Map([['/accessory.png', png]]));
		expect(fromPng, `${species.id}, ${stage}, ${accessory.id}`).toEqual(paintFigure(figure));
	}
});

it('keeps Garden room art identical through reference PNG recolouring', () => {
	const figures = [
				bed, ...messFigures.map((m) => m.figure)
	];
	for (const figure of figures) {
		const pngs = new Map<string, RgbaImage>();
		const layers = figure.layers.map((layer, i) => {
			if (!('sprite' in layer.art)) throw Error('Expected a Garden grid');
			const path = `/prop-${i}.png`;
			pngs.set(path, renderSprite(layer.art.sprite, REFERENCE_PALETTE));
			return { ...layer, art: { png: path, w: figure.w, h: figure.h } };
		});
		expect(paintFigure({ ...figure, layers }, pngs)).toEqual(paintFigure(figure));
	}
});
