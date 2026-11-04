/** Atlas cutouts use the same alpha-aware sampler in the browser and art reviews. */
import { blank, hexToRgb, type RgbaImage } from './compose';

export interface PaintedArt {
	painted: string;
	w: number;
	h: number;
	/** Column, row, columns, rows. Rounded boundaries also support odd-sized sheets. */
	cell?: readonly [number, number, number, number];
	/** Exact source bounds for illustrations whose silhouettes cross nominal grid lines. */
	region?: readonly [number, number, number, number];
	height?: number;
	ground?: number;
}

const prepared = new WeakMap<RgbaImage, Map<string, RgbaImage>>();

export function preparePaint(image: RgbaImage, art: PaintedArt, hairColor?: string): RgbaImage {
	if (!art.cell && !art.region) return image;
	const key = JSON.stringify([art.cell, art.region, art.w, art.h, art.height, art.ground, hairColor]);
	let cache = prepared.get(image);
	if (!cache) { cache = new Map(); prepared.set(image, cache); }
	const hit = cache.get(key);
	if (hit) return hit;
	const [col, row, cols, rows] = art.cell ?? [0, 0, 1, 1];
	if (col < 0 || row < 0 || col >= cols || row >= rows) throw new Error('Atlas cell is outside the sheet');
	const x0 = art.region?.[0] ?? Math.round(col * image.w / cols);
	const y0 = art.region?.[1] ?? Math.round(row * image.h / rows);
	const x1 = art.region ? x0 + art.region[2] : Math.round((col + 1) * image.w / cols);
	const y1 = art.region ? y0 + art.region[3] : Math.round((row + 1) * image.h / rows);
	if (x0 < 0 || y0 < 0 || x1 > image.w || y1 > image.h) throw new Error('Atlas region is outside the sheet');
	let left = x1, top = y1, right = x0, bottom = y0;
	for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
		if (image.data[(y * image.w + x) * 4 + 3] < 24) continue;
		left = Math.min(left, x); top = Math.min(top, y);
		right = Math.max(right, x + 1); bottom = Math.max(bottom, y + 1);
	}
	if (left >= right || top >= bottom) throw new Error(`Empty atlas cell: ${col},${row}`);
	const width = right - left, height = bottom - top;
	const source = blank(width, height);
	for (let y = 0; y < height; y++) {
		source.data.set(image.data.subarray(((y + top) * image.w + left) * 4, ((y + top) * image.w + right) * 4), y * width * 4);
	}
	if (hairColor) tintHair(source, hairColor);
	const scale = Math.min((art.w - 16) / width, (art.height ?? art.h - 16) / height);
	const dw = Math.max(1, Math.round(width * scale)), dh = Math.max(1, Math.round(height * scale));
	const dx = Math.floor((art.w - dw) / 2), dy = (art.ground ?? art.h - 8) - dh;
	const out = blank(art.w, art.h);
	for (let y = 0; y < dh; y++) for (let x = 0; x < dw; x++) {
		if (y + dy < 0 || y + dy >= out.h) continue;
		const sx = Math.max(0, Math.min(width - 1, (x + 0.5) * width / dw - 0.5));
		const sy = Math.max(0, Math.min(height - 1, (y + 0.5) * height / dh - 0.5));
		const ix = Math.floor(sx), iy = Math.floor(sy), fx = sx - ix, fy = sy - iy;
		const samples = [
			[(iy * width + ix) * 4, (1 - fx) * (1 - fy)],
			[(iy * width + Math.min(ix + 1, width - 1)) * 4, fx * (1 - fy)],
			[((Math.min(iy + 1, height - 1)) * width + ix) * 4, (1 - fx) * fy],
			[((Math.min(iy + 1, height - 1)) * width + Math.min(ix + 1, width - 1)) * 4, fx * fy]
		];
		// Premultiplication keeps invisible background pigment out of the ink edges.
		const a = samples.reduce((sum, [i, weight]) => sum + source.data[i + 3] * weight, 0);
		const at = ((y + dy) * out.w + x + dx) * 4;
		if (a < 1) continue;
		for (let c = 0; c < 3; c++) out.data[at + c] = samples.reduce((sum, [i, weight]) => sum + source.data[i + c] * source.data[i + 3] * weight, 0) / a;
		out.data[at + 3] = a;
	}
	cache.set(key, out);
	return out;
}

/** Neutral hair in the head band is tintable; warm skin and all clothing stay painted. */
function tintHair(image: RgbaImage, color: string) {
	const pigment = hexToRgb(color);
	for (let y = 0; y < image.h * 0.15; y++) for (let x = 0; x < image.w; x++) {
		const i = (y * image.w + x) * 4;
		if (!image.data[i + 3]) continue;
		const rgb = [...image.data.subarray(i, i + 3)], hi = Math.max(...rgb), lo = Math.min(...rgb);
		if (hi < 42 || hi - lo > hi * 0.24) continue;
		const value = (rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722) / 150;
		for (let c = 0; c < 3; c++) image.data[i + c] = value <= 1 ? pigment[c] * value : pigment[c] + (238 - pigment[c]) * Math.min(0.65, (value - 1) * 0.55);
	}
}
