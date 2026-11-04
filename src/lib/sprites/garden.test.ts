import { expect, it } from 'vitest';
import { REFERENCE_PALETTE } from '$lib/content/palettes';
import { bed, messFigures } from './room';
import { renderSprite, type RgbaImage } from './compose';
import { paintFigure } from './layers';

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
