/**
 * Turning sprites into pixels, kept free of the DOM so it runs in tests.
 *
 * The browser side (sprites/render.ts) only adds two things on top: decoding a
 * PNG into an RgbaImage and putting the final strip on a canvas.
 */
import { CHANNEL_CHARS, FIXED_COLORS, TRANSPARENT, type PaletteSet, type Sprite } from './grid';

export interface RgbaImage {
	w: number;
	h: number;
	data: Uint8ClampedArray;
}

export function blank(w: number, h: number): RgbaImage {
	return { w, h, data: new Uint8ClampedArray(w * h * 4) };
}

export function hexToRgb(hex: string): [number, number, number] {
	const n = parseInt(hex.replace('#', ''), 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function colorFor(ch: string, palette: PaletteSet): string | null {
	if (ch === TRANSPARENT) return null;
	const mapped = CHANNEL_CHARS[ch];
	if (mapped) return palette[mapped[0]][mapped[1]];
	return FIXED_COLORS[ch] ?? null;
}

/** One frame of a sprite, coloured. Frames past the sprite's last reuse its last. */
export function renderSprite(sprite: Sprite, palette: PaletteSet, frame = 0): RgbaImage {
	const f = Math.min(frame, sprite.frames - 1);
	const img = blank(sprite.w, sprite.h);
	for (let y = 0; y < sprite.h; y++) {
		const row = sprite.rows[y] ?? '';
		for (let x = 0; x < sprite.w; x++) {
			const hex = colorFor(row[f * sprite.w + x] ?? TRANSPARENT, palette);
			if (!hex) continue;
			const [r, g, b] = hexToRgb(hex);
			const i = (y * sprite.w + x) * 4;
			img.data[i] = r;
			img.data[i + 1] = g;
			img.data[i + 2] = b;
			img.data[i + 3] = 255;
		}
	}
	return img;
}

/**
 * Swap every pixel that exactly matches a colour in `from` for the colour in
 * the same channel and shade of `to`. This is how a PNG drawn in the reference
 * palette takes the player's skin, hair and dye choices.
 */
export function recolor(img: RgbaImage, from: PaletteSet, to: PaletteSet): RgbaImage {
	const map = new Map<number, [number, number, number]>();
	for (const channel of Object.keys(from) as (keyof PaletteSet)[]) {
		from[channel].forEach((hex, shade) => {
			const [r, g, b] = hexToRgb(hex);
			map.set((r << 16) | (g << 8) | b, hexToRgb(to[channel][shade]));
		});
	}
	const out = { w: img.w, h: img.h, data: new Uint8ClampedArray(img.data) };
	for (let i = 0; i < out.data.length; i += 4) {
		if (out.data[i + 3] === 0) continue;
		const hit = map.get((out.data[i] << 16) | (out.data[i + 1] << 8) | out.data[i + 2]);
		if (hit) [out.data[i], out.data[i + 1], out.data[i + 2]] = hit;
	}
	return out;
}

/** Draw `top` over `base` at an offset. Pixel art has no partial alpha worth blending. */
export function drawOver(base: RgbaImage, top: RgbaImage, ox = 0, oy = 0): RgbaImage {
	for (let y = 0; y < top.h; y++) {
		for (let x = 0; x < top.w; x++) {
			const tx = x + ox;
			const ty = y + oy;
			if (tx < 0 || ty < 0 || tx >= base.w || ty >= base.h) continue;
			const s = (y * top.w + x) * 4;
			if (top.data[s + 3] < 128) continue;
			const d = (ty * base.w + tx) * 4;
			base.data[d] = top.data[s];
			base.data[d + 1] = top.data[s + 1];
			base.data[d + 2] = top.data[s + 2];
			base.data[d + 3] = 255;
		}
	}
	return base;
}

/**
 * The idle bounce: everything above `pivot` drops one pixel, everything below
 * stays planted. Applied to the finished composite, so every part of an outfit
 * moves together and a single-frame PNG animates like the code-drawn art.
 */
export function bob(img: RgbaImage, pivot: number): RgbaImage {
	const out = blank(img.w, img.h);
	for (let y = 0; y < img.h; y++) {
		const src = y < pivot ? y - 1 : y;
		if (src < 0) continue;
		out.data.set(img.data.subarray(src * img.w * 4, (src + 1) * img.w * 4), y * img.w * 4);
	}
	// Row pivot-1 now holds row pivot-2; the row at the pivot is what it was, so
	// the seam is a one-pixel stretch rather than a gap.
	return out;
}

export function hstack(frames: RgbaImage[]): RgbaImage {
	const { w, h } = frames[0];
	const out = blank(w * frames.length, h);
	frames.forEach((f, n) => drawOver(out, f, n * w, 0));
	return out;
}
