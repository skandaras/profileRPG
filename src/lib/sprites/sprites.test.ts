import { getSpecies } from '$lib/content';
import { uiIconFigure } from './ui-icons';
import { paintPreview } from './preview-png';
import { encodePng } from './png';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { REFERENCE_PALETTE, SKIN_TONES } from '$lib/content/palettes';
import { blank, bob, drawOver, recolor, renderSprite } from './compose';
import { FIXED_COLORS, Pix } from './grid';
import { paintFigure, pixelPetFigure as petFigure } from './layers';

const px = (img: { w: number; data: Uint8ClampedArray }, x: number, y: number) =>
	Array.from(img.data.subarray((y * img.w + x) * 4, (y * img.w + x) * 4 + 4));

describe('sprites', () => {
	it('paints channel characters in the given palette', () => {
		const s = new Pix(2, 1).set(0, 0, 'S').toSprite();
		const img = renderSprite(s, REFERENCE_PALETTE);
		expect(px(img, 0, 0)).toEqual([0xf5, 0xc6, 0xa5, 255]);
		expect(px(img, 1, 0)[3]).toBe(0);
	});

	it('recolours reference colours and leaves the rest', () => {
		const s = new Pix(2, 1).set(0, 0, 'S').set(1, 0, 'k').toSprite();
		const img = recolor(renderSprite(s, REFERENCE_PALETTE), REFERENCE_PALETTE, { ...REFERENCE_PALETTE, skin: SKIN_TONES[5].ramp });
		expect(px(img, 0, 0)).toEqual([0x68, 0x40, 0x2a, 255]);
		expect(px(img, 1, 0)).toEqual([0x1a, 0x13, 0x22, 255]);
	});

	it('draws later layers over earlier ones', () => {
		const base = blank(1, 1);
		drawOver(base, renderSprite(new Pix(1, 1).set(0, 0, 'w').toSprite(), REFERENCE_PALETTE));
		drawOver(base, renderSprite(new Pix(1, 1).set(0, 0, 'k').toSprite(), REFERENCE_PALETTE));
		expect(px(base, 0, 0)).toEqual([0x1a, 0x13, 0x22, 255]);
	});

	it('bobs the top half and plants the feet', () => {
		const p = new Pix(1, 4).set(0, 0, 'w').set(0, 3, 'k');
		const img = bob(renderSprite(p.toSprite(), REFERENCE_PALETTE), 2);
		expect(px(img, 0, 0)[3]).toBe(0);
		expect(px(img, 0, 1)[0]).toBe(255);
		expect(px(img, 0, 3)[0]).toBe(0x1a);
	});

	it('puts a head accessory on the head anchor', () => {
		const fig = petFigure('emberkit', 'baby', 'petacc.bow');
		expect(fig.layers).toHaveLength(2);
		const art = fig.layers[1];
		expect(art.dy! + 8 - 1).toBe(getSpecies('emberkit')!.art.baby.anchors.head[1]);
		expect(petFigure('emberkit', 'egg', 'petacc.bow').layers).toHaveLength(1);
	});
});


it('preserves fixed white when a reference PNG is recoloured', () => {
	const sprite = new Pix(2, 1).stamp(0, 0, ['wd']).toSprite();
	const palette = { ...REFERENCE_PALETTE, secondary: SKIN_TONES[5].ramp };
	const reference = renderSprite(sprite, REFERENCE_PALETTE);
	expect(recolor(reference, REFERENCE_PALETTE, palette)).toEqual(renderSprite(sprite, palette));
	expect(Object.values(REFERENCE_PALETTE).flat()).not.toContain(FIXED_COLORS.w);
});

it('keeps pet PNG colours and declared frames while accessories still recolour', () => {
	const species = getSpecies('emberkit')!;
	const original = species.art.baby;
	try {
		species.art.baby = { png: '/dragon.png', frames: 3, anchors: original.anchors };
		const figure = petFigure(species.id, 'baby', 'petacc.bow');
		const sheet = renderSprite(new Pix(96, 32).rect(0, 0, 32, 32, 'S').rect(32, 0, 32, 32, 'd').rect(64, 0, 32, 32, 'P').toSprite(), REFERENCE_PALETTE);
		const accessory = new Pix(12, 8).rect(0, 0, 12, 8, 'P').toSprite();
		figure.layers[1].art = { png: '/bow.png', w: 12, h: 8 };
		const frames = paintFigure(figure, new Map([['/dragon.png', sheet], ['/bow.png', renderSprite(accessory, REFERENCE_PALETTE)]]));
		expect(px(frames[0], figure.layers[1].dx!, figure.layers[1].dy!)).toEqual(px(renderSprite(accessory, figure.layers[1].palette), 0, 0));
		expect(frames).toHaveLength(3);
		expect(px(frames[0], 0, 0)).toEqual([245, 198, 165, 255]);
		expect(px(frames[1], 0, 0)).toEqual([255, 255, 255, 255]);
		expect(px(frames[2], 0, 0)).toEqual([214, 69, 90, 255]);
		expect(figure.layers[1].fixedColors).not.toBe(true);
	} finally {
		species.art.baby = original;
	}
});

it('loads named PNG icons through the same preview and tint path as grids', () => {
	const root = mkdtempSync(join(tmpdir(), 'sprite-preview-'));
	try {
		const sprite = new Pix(16, 16).stamp(2, 2, ['Pdw']).toSprite();
		writeFileSync(join(root, 'icon.png'), encodePng(renderSprite(sprite, REFERENCE_PALETTE)));
		const palette = { ...REFERENCE_PALETTE, primary: SKIN_TONES[5].ramp, secondary: SKIN_TONES[0].ramp };
		const grid = uiIconFigure({ art: { sprite }, palette });
		const png = uiIconFigure({ art: { png: '/icon.png', w: 16, h: 16 }, palette });
		expect(paintPreview(png, root)).toEqual(paintFigure(grid));
		expect(paintPreview(uiIconFigure({ art: { png: '/icon.png', w: 16, h: 16 }, palette, fixedColors: true }), root)[0]).toEqual(renderSprite(sprite, REFERENCE_PALETTE));
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});
