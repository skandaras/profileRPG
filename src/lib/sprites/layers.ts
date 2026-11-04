/**
 * From a saved avatar or pet to an ordered list of layers, each with the
 * palette it should be painted in. Pure, so the server, the browser and the
 * tests all agree on what a character looks like.
 */
import { getPetAccessory, getSpecies } from '$lib/content';
import { ACCENT_GOLD, REFERENCE_PALETTE } from '$lib/content/palettes';
import { speciesPalette } from '$lib/content/pets';
import { PET_ACCESSORIES_ENABLED } from '$lib/content/cosmetics';
import type { Art, AvatarConfig } from '$lib/content/types';
import type { PetStage } from './art/pets';
import { PET_ACC } from './art/pets';
import { PET } from './frames';
import { svgDocument } from './svg';
import { clipCoverage, type Point } from './fit';
import { tintPaint } from './painted';
import { paintedAvatar, paintedPet } from './painted-figures';
import type { PaletteSet } from './grid';
import { blank, bob, drawOver, recolor, renderSprite, type RgbaImage } from './compose';

export interface LayerSpec {
	z: number;
	art: Art;
	palette: PaletteSet;
	/** Pet PNGs carry final colours; avatar and accessory PNGs use reference channels. */
	fixedColors?: boolean;
	paintColor?: string;
	body?: boolean;
	occludesBody?: readonly (readonly Point[])[];
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

export function pixelPetFigure(speciesId: string, stage: PetStage, accessoryId?: string | null): Figure {
	const species = getSpecies(speciesId);
	if (!species) return { w: PET.w, h: PET.h, pivot: PET.pivot, layers: [] };
	const art = species.art[stage];
	const palette = speciesPalette(species);
	const layers: LayerSpec[] = [
		{ z: 0, art: 'sprite' in art ? { sprite: art.sprite } : { png: art.png, w: PET.w, h: PET.h, frames: art.frames }, palette, fixedColors: true }
	];
	const acc = accessoryId && stage !== 'egg' ? getPetAccessory(accessoryId) : undefined;
	if (acc) {
		const [ax, ay] = art.anchors[acc.place];
		layers.push({
			z: 1,
			art: acc.art,
			palette: { ...palette, primary: acc.tint, accent: acc.accent ?? ACCENT_GOLD },
			dx: Math.round(ax - PET_ACC.w / 2),
			dy: acc.place === 'head' ? ay - PET_ACC.h + 1 : Math.round(ay - PET_ACC.h / 2)
		});
	}
	return { w: PET.w, h: PET.h, pivot: PET.pivot, layers };
}

export function avatarFigure(avatar: AvatarConfig): Figure {
	return paintedAvatar(avatar);
}

export function petFigure(speciesId: string, stage: PetStage, accessoryId?: string | null): Figure {
	if (!PET_ACCESSORIES_ENABLED) accessoryId = null;
	return paintedPet(speciesId, stage, accessoryId) ?? pixelPetFigure(speciesId, stage, accessoryId);
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
	const coverage = fig.layers.flatMap((l) => l.occludesBody ?? []);
	const paint = (frame: number) => {
		const img = blank(fig.w, fig.h);
		for (const l of fig.layers) {
			let src: RgbaImage | undefined;
			if ('sprite' in l.art) src = renderSprite(l.art.sprite, l.palette, frame);
			else if ('svg' in l.art) src = pngs.get(svgDocument(l.art, l.palette));
			else if ('painted' in l.art) {
				src = pngs.get(l.art.painted);
				if (src && l.paintColor) src = tintPaint(src, l.paintColor);
			}
			else {
				const png = pngs.get(l.art.png);
				if (png) {
					src = pngFrame(png, l.art.w, frame);
					if (!l.fixedColors) src = recolor(src, REFERENCE_PALETTE, l.palette);
				}
			}
			if (src) {
				if (l.body && coverage.length) src = clipCoverage(src, coverage);
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
