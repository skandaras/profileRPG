import { describe, expect, it } from 'vitest';
import { Resvg } from '@resvg/resvg-js';
import { UI_ICONS } from './ui-icons';
import { svgDocument } from './svg';
import { blank, drawOver } from './compose';

const icons = Object.entries(UI_ICONS).map(([name, spec]) => ({ name, ...spec }));

describe('interface SVG icons', () => {
	for (const spec of icons) {
		it(`${spec.name} renders at every UI size and honours its symmetry mark`, () => {
			if (!('svg' in spec.art)) throw Error('Expected SVG icon');
			const svg = svgDocument(spec.art, spec.palette);
			expect(svg).not.toMatch(/[{}]/);
			expect(svg).not.toMatch(/<script|<image|<foreignObject|\bid=|\burl\(/);
			for (const size of [16, 24, 32]) {
				const scale = 8;
				const image = new Resvg(svg, { background: '#f1eadc', fitTo: { mode: 'width', value: size * scale } }).render();
				const pixels = image.pixels;
				const average = (x: number, y: number, c: number) => {
					let sum = 0;
					for (let sy = 0; sy < scale; sy++) for (let sx = 0; sx < scale; sx++) sum += pixels[((y * scale + sy) * size * scale + x * scale + sx) * 4 + c];
					return sum / (scale * scale);
				};
				expect(image.pixels.some((v) => v > 0)).toBe(true);
				if (!spec.art.symmetric) continue;
				let difference = 0;
				for (let y = 0; y < size; y++) for (let x = 0; x < size / 2; x++) {
					for (let c = 0; c < 4; c++) difference = Math.max(difference, Math.abs(average(x, y, c) - average(size - 1 - x, y, c)));
				}
				// Supersampling limits curve tessellation noise while catching shifted geometry.
				expect(difference, `${spec.name} at ${size}px`).toBeLessThanOrEqual(4);
			}
		});
	}

});

it('preserves antialias coverage when compositing an SVG edge over empty and opaque pixels', () => {
	const edge = { w: 1, h: 1, data: new Uint8ClampedArray([200, 100, 50, 128]) };
	expect(drawOver(blank(1, 1), edge).data).toEqual(edge.data);
	const paper = { w: 1, h: 1, data: new Uint8ClampedArray([100, 200, 250, 255]) };
	expect(Array.from(drawOver(paper, edge).data)).toEqual([150, 150, 150, 255]);
});
