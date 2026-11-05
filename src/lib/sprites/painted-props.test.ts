import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { expect, it } from 'vitest';
import { CONSUMABLES } from '$lib/content/items';
import { ICON_PALETTE } from './svg';
import { uiIconFigure } from './ui-icons';
import { bed, messFigures } from './room';
import { paintPreview } from './preview-png';
import { blank, drawOver } from './compose';

it('renders every provision and room prop as a distinct painted cutout with clear margins', () => {
	const figures = [...CONSUMABLES.map((item) => uiIconFigure({ art: item.icon, palette: ICON_PALETTE })), bed, ...messFigures.map((m) => m.figure)];
	const hashes = new Set<string>();
	for (const figure of figures) {
		expect(figure.painted).toBe(true);
		const frames = paintPreview(figure);
		expect(frames).toHaveLength(1);
		const img = frames[0];
		let visible = 0, left = img.w, top = img.h, right = 0, bottom = 0;
		for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) {
			if (img.data[(y * img.w + x) * 4 + 3] < 24) continue;
			visible++;
			left = Math.min(left, x); right = Math.max(right, x);
			top = Math.min(top, y); bottom = Math.max(bottom, y);
		}
		expect(left).toBeGreaterThanOrEqual(8); expect(right).toBeLessThan(img.w - 8);
		expect(top).toBeGreaterThanOrEqual(8); expect(bottom).toBeLessThan(img.h - 8);
		expect(visible).toBeGreaterThan(1000);
		hashes.add(createHash('sha256').update(img.data).digest('hex'));
	}
	expect(hashes.size).toBe(14);
});

it('preserves painted colours across legacy tint metadata and light/dark compositing', () => {
	for (const item of CONSUMABLES) {
		const a = paintPreview(uiIconFigure({ art: item.icon, palette: { ...ICON_PALETTE, primary: item.tint } }))[0];
		const b = paintPreview(uiIconFigure({ art: item.icon, palette: { ...ICON_PALETTE, primary: ['#000000', '#ff0000', '#ffffff'] } }))[0];
		expect(b).toEqual(a);
		for (const bg of [[247, 238, 217, 255], [17, 28, 49, 255]]) {
			const paper = blank(a.w, a.h);
			for (let i = 0; i < paper.data.length; i += 4) paper.data.set(bg, i);
			const composed = drawOver(paper, a);
			expect([...composed.data.subarray(0, 4)]).toEqual(bg);
		}
	}
});

it('keeps the study background opaque and sized for both room crops', () => {
	const image = PNG.sync.read(readFileSync('static/painted/study-nook.png'));
	expect([image.width, image.height]).toEqual([1536, 1024]);
	let transparent = 0;
	for (let i = 3; i < image.data.length; i += 4) if (image.data[i] < 255) transparent++;
	expect(transparent).toBe(0);
});

it('records the unchanged production source files in the provenance manifest', () => {
	const manifest = JSON.parse(readFileSync('art/wayfarer/sources.json', 'utf8')) as { assets: { path: string; sha256: string }[] };
	for (const asset of manifest.assets) {
		expect(createHash('sha256').update(readFileSync(asset.path)).digest('hex'), asset.path).toBe(asset.sha256);
	}
});
