/**
 * From a saved avatar or pet to an ordered list of layers, each with the
 * palette it should be painted in. Pure, so the server, the browser and the
 * tests all agree on what a character looks like.
 */
import { REFERENCE_PALETTE } from '$lib/content/palettes';
import type { Art, AvatarConfig } from '$lib/content/types';
import type { PetStage } from '$lib/content/pets';
import { svgDocument } from './svg';
import { preparePaint } from './painted';
import { paintedAvatar, paintedPet } from './painted-figures';
import type { PaletteSet } from './grid';
import { blank, bob, drawOver, recolor, renderSprite, type RgbaImage } from './compose';

export interface LayerSpec {
	z: number;
	art: Art;
	palette: PaletteSet;
	/** PNG icons and props may carry final colours instead of reference palette channels. */
	fixedColors?: boolean;
	paintColor?: string;
	dx?: number;
	dy?: number;
}

export interface Figure {
	w: number;
	h: number;
	pivot: number;
	painted?: boolean;
	/** Height in the original scale API; native painted pixels stay separate. */
	displayHeight?: number;
	layers: LayerSpec[];
}

export function avatarFigure(avatar: AvatarConfig): Figure {
	return paintedAvatar(avatar);
}

export function petFigure(speciesId: string, stage: PetStage, _accessoryId?: string | null): Figure {
	return paintedPet(speciesId, stage);
}

/** PNG layers arrive already decoded (the browser does that); sprites are painted here. */
export type DecodedPngs = Map<string, RgbaImage>;

export function layerFrames(l: LayerSpec): number {
	return 'sprite' in l.art ? l.art.sprite.frames : 'png' in l.art ? (l.art.frames ?? 1) : 1;
}

/**
 * Paint a figure into animation frames. If any layer brings its own frames
 * they are used; otherwise the idle bounce is made from the single pose.
 */
export function paintFigure(fig: Figure, pngs: DecodedPngs = new Map()): RgbaImage[] {
	const frames = Math.max(1, ...fig.layers.map(layerFrames));
	const paint = (frame: number) => {
		const img = blank(fig.w, fig.h);
		for (const l of fig.layers) {
			let src: RgbaImage | undefined;
			if ('sprite' in l.art) src = renderSprite(l.art.sprite, l.palette, frame);
			else if ('svg' in l.art) src = pngs.get(svgDocument(l.art, l.palette));
			else if ('painted' in l.art) {
				src = pngs.get(l.art.painted);
				if (src) src = preparePaint(src, l.art, l.paintColor);
			}
			else {
				const png = pngs.get(l.art.png);
				if (png) {
					src = pngFrame(png, l.art.w, frame);
					if (!l.fixedColors) src = recolor(src, REFERENCE_PALETTE, l.palette);
				}
			}
			if (src) {
				drawOver(img, src, l.dx ?? 0, l.dy ?? 0);
			}
		}
		return img;
	};
	if (frames > 1) return Array.from({ length: frames }, (_, f) => paint(f));
	const pose = paint(0);
	return fig.painted ? [pose] : [pose, bob(pose, fig.pivot)];
}

function pngFrame(sheet: RgbaImage, w: number, frame: number): RgbaImage {
	const frames = Math.max(1, Math.floor(sheet.w / w));
	const f = Math.min(frame, frames - 1);
	if (frames === 1) return sheet;
	const out = blank(w, sheet.h);
	for (let y = 0; y < sheet.h; y++) {
		out.data.set(sheet.data.subarray((y * sheet.w + f * w) * 4, (y * sheet.w + (f + 1) * w) * 4), y * w * 4);
	}
	return out;
}
