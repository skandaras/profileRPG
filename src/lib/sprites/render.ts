/**
 * Browser side of the sprite pipeline: decode PNG layers, paint the figure,
 * and hand back a data URL for a CSS sprite strip. Results are cached by a
 * key the caller picks, so a list of twenty party members paints each once.
 */
import { hstack, type RgbaImage } from './compose';
import { paintFigure, type DecodedPngs, type Figure } from './layers';

const pngCache = new Map<string, Promise<RgbaImage | null>>();
const stripCache = new Map<string, Promise<{ url: string; frames: number }>>();

function decode(src: string): Promise<RgbaImage | null> {
	let p = pngCache.get(src);
	if (!p) {
		p = new Promise((resolve) => {
			const img = new Image();
			img.onload = () => {
				const c = document.createElement('canvas');
				c.width = img.naturalWidth;
				c.height = img.naturalHeight;
				const ctx = c.getContext('2d');
				if (!ctx) return resolve(null);
				ctx.drawImage(img, 0, 0);
				const data = ctx.getImageData(0, 0, c.width, c.height);
				resolve({ w: c.width, h: c.height, data: data.data });
			};
			// A missing PNG leaves that layer out rather than breaking the figure.
			img.onerror = () => resolve(null);
			img.src = src;
		});
		pngCache.set(src, p);
	}
	return p;
}

export function renderFigure(fig: Figure, key: string): Promise<{ url: string; frames: number }> {
	let p = stripCache.get(key);
	if (!p) {
		p = (async () => {
			const pngs: DecodedPngs = new Map();
			for (const l of fig.layers) {
				if ('png' in l.art) {
					const img = await decode(l.art.png);
					if (img) pngs.set(l.art.png, img);
				}
			}
			const frames = paintFigure(fig, pngs);
			const sheet = hstack(frames);
			const canvas = document.createElement('canvas');
			canvas.width = sheet.w;
			canvas.height = sheet.h;
			canvas.getContext('2d')?.putImageData(new ImageData(new Uint8ClampedArray(sheet.data), sheet.w, sheet.h), 0, 0);
			return { url: canvas.toDataURL('image/png'), frames: frames.length };
		})();
		stripCache.set(key, p);
		if (stripCache.size > 300) stripCache.delete(stripCache.keys().next().value!);
	}
	return p;
}
