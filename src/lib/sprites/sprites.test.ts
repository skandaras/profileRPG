import { describe, expect, it } from 'vitest';
import { DEFAULT_AVATAR } from '$lib/content/cosmetics';
import { REFERENCE_PALETTE, SKIN_TONES } from '$lib/content/palettes';
import { blank, bob, drawOver, recolor, renderSprite } from './compose';
import { Pix } from './grid';
import { avatarFigure, paintFigure, petFigure } from './layers';

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

	it('orders avatar layers back to front', () => {
		const fig = avatarFigure({ ...DEFAULT_AVATAR, parts: { ...DEFAULT_AVATAR.parts, hair: 'hair.long' } });
		const zs = fig.layers.map((l) => l.z);
		expect(zs).toEqual([...zs].sort((a, b) => a - b));
		expect(paintFigure(fig)).toHaveLength(2);
	});

	it('puts a head accessory on the head anchor', () => {
		const fig = petFigure('emberkit', 'baby', 'petacc.bow');
		expect(fig.layers).toHaveLength(2);
		const art = fig.layers[1];
		expect(art.dy! + 8 - 1).toBe(12);
		expect(petFigure('emberkit', 'egg', 'petacc.bow').layers).toHaveLength(1);
	});
});
