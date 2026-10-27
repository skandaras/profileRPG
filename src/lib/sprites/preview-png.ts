/** Node counterpart of the browser decoder, used only for art review. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { svgDocument } from './svg';
import { PNG } from 'pngjs';
import { paintFigure, type Figure, type DecodedPngs } from './layers';

export function paintPreview(figure: Figure, root = 'static') {
	const pngs: DecodedPngs = new Map();
	for (const layer of figure.layers) {
		if ('svg' in layer.art) {
			const svg = svgDocument(layer.art, layer.palette);
			const rendered = new Resvg(svg, { fitTo: { mode: 'width', value: figure.w } }).render();
			pngs.set(svg, { w: rendered.width, h: rendered.height, data: new Uint8ClampedArray(rendered.pixels) });
		}
		if ('png' in layer.art && !pngs.has(layer.art.png)) {
			const png = PNG.sync.read(readFileSync(join(root, layer.art.png)));
			pngs.set(layer.art.png, { w: png.width, h: png.height, data: new Uint8ClampedArray(png.data) });
		}
	}
	return paintFigure(figure, pngs);
}
