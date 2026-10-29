import { expect, it } from 'vitest';
import { PET_ACCESSORIES } from '$lib/content/cosmetics';
import { REFERENCE_PALETTE } from '$lib/content/palettes';
import { bed, messFigures } from './room';
import { SPECIES } from '$lib/content/pets';
import { renderSprite, type RgbaImage } from './compose';
import { paintFigure, pixelPetFigure as petFigure } from './layers';

const pixel = (img: RgbaImage, x: number, y: number) =>
	Array.from(img.data.subarray((y * img.w + x) * 4, (y * img.w + x) * 4 + 4));
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
