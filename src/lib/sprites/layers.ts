/**
 * From a saved avatar or pet to an ordered list of layers, each with the
 * palette it should be painted in. Pure, so the server, the browser and the
 * tests all agree on what a character looks like.
 */
import { getCosmetic, getPetAccessory, getSpecies } from '$lib/content';
import { ACCENT_GOLD, dyeRamp, eyeRamp, faceInkRamp, hairRamp, REFERENCE_PALETTE, skinRamp, WHITE_RAMP } from '$lib/content/palettes';
import { speciesPalette } from '$lib/content/pets';
import { SLOT_ORDER } from '$lib/content/cosmetics';
import type { Art, AvatarConfig, ColorSlot } from '$lib/content/types';
import type { PetStage } from './art/pets';
import { PET_ACC } from './art/pets';
import { AVATAR, PET } from './frames';
import { svgDocument } from './svg';
import type { PaletteSet } from './grid';
import { blank, bob, drawOver, recolor, renderSprite, type RgbaImage } from './compose';

export interface LayerSpec {
	z: number;
	art: Art;
	palette: PaletteSet;
	/** Pet PNGs carry final colours; avatar and accessory PNGs use reference channels. */
	fixedColors?: boolean;
	/** Keep a closed hat from being pierced by the hair beneath it. */
	clipTop?: number;
	dx?: number;
	dy?: number;
}

export interface Figure {
	w: number;
	h: number;
	pivot: number;
	layers: LayerSpec[];
}

const TINTED_SLOTS: ColorSlot[] = ['top', 'bottom', 'shoes', 'headwear', 'accessory'];

export function avatarFigure(avatar: AvatarConfig): Figure {
	const c = avatar.colors;
	const layers: LayerSpec[] = [];
	const headwear = avatar.parts.headwear ? getCosmetic(avatar.parts.headwear) : undefined;
	for (const slot of SLOT_ORDER) {
		const id = avatar.parts[slot];
		const part = id ? getCosmetic(id) : undefined;
		if (!part) continue;
		const tint = (TINTED_SLOTS as string[]).includes(slot) ? c[slot as ColorSlot] : c.top;
		const palette: PaletteSet = {
			skin: skinRamp(c.skin),
			hair: hairRamp(c.hair),
			eye: eyeRamp(c.eyes),
			primary: (slot === 'face' || slot === 'feature') ? faceInkRamp(c.skin) : dyeRamp(tint),
			secondary: part.secondary ?? WHITE_RAMP,
			accent: part.accent ?? ACCENT_GOLD
		};
		for (const l of part.layers) layers.push({
			z: l.z, art: l.art, palette,
			clipTop: slot === 'hair' ? headwear?.coversHairAbove : undefined
		});
	}
	// Stable: parts at the same depth keep slot order.
	layers.sort((a, b) => a.z - b.z);
	return { w: AVATAR.w, h: AVATAR.h, pivot: AVATAR.pivot, layers };
}

export function petFigure(speciesId: string, stage: PetStage, accessoryId?: string | null): Figure {
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
			else {
				const png = pngs.get(l.art.png);
				if (png) {
					src = pngFrame(png, l.art.w, frame);
					if (!l.fixedColors) src = recolor(src, REFERENCE_PALETTE, l.palette);
				}
			}
			if (src) {
				if (l.clipTop) {
					src = { ...src, data: src.data.slice() };
					src.data.fill(0, 0, Math.min(src.h, l.clipTop) * src.w * 4);
				}
				drawOver(img, src, l.dx ?? 0, l.dy ?? 0);
			}
		}
		return img;
	};
	if (frames > 1) return Array.from({ length: frames }, (_, f) => paint(f));
	const pose = paint(0);
	return [pose, bob(pose, fig.pivot)];
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
