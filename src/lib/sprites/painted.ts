/** Painted layers share full canvases; a colour changes pigment values, never their alpha. */
import type { ColorSlot } from '$lib/content/types';
import { blank, hexToRgb, type RgbaImage } from './compose';

export interface PaintedArt {
	painted: string;
	w: number;
	h: number;
	channel?: ColorSlot;
}

const tinted = new WeakMap<RgbaImage, Map<string, RgbaImage>>();

export function tintPaint(image: RgbaImage, color: string): RgbaImage {
	let cache = tinted.get(image);
	if (!cache) { cache = new Map(); tinted.set(image, cache); }
	const hit = cache.get(color);
	if (hit) return hit;
	const ink = [67, 53, 59];
	const pigment = hexToRgb(color);
	const out = blank(image.w, image.h);
	for (let i = 0; i < image.data.length; i += 4) {
		const v = (image.data[i] * 0.2126 + image.data[i + 1] * 0.7152 + image.data[i + 2] * 0.0722) / 255;
		for (let c = 0; c < 3; c++) out.data[i + c] = v < 0.25 ? ink[c] * (0.55 + v * 1.8)
			: v < 0.78 ? ink[c] + (pigment[c] - ink[c]) * (v - 0.25) / 0.53
			: pigment[c] + (255 - pigment[c]) * (v - 0.78) / 0.22 * 0.55;
		out.data[i + 3] = image.data[i + 3];
	}
	cache.set(color, out);
	return out;
}
