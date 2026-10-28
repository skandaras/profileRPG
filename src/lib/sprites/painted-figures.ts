import type { Art, AvatarConfig, ColorSlot } from '$lib/content/types';
import { PET_ACCESSORIES_ENABLED } from '$lib/content/cosmetics';
import { GARMENT_FIT, garmentCoverage } from './fit';
import { paintSwatch } from '$lib/content/painted-palettes';
import { REFERENCE_PALETTE } from '$lib/content/palettes';
import type { Figure, LayerSpec } from './layers';
import type { PetStage } from './art/pets';

export const PAINT_AVATAR = { w: 400, h: 512, pivot: 430 } as const;
export const PAINT_PET = { w: 512, h: 384, pivot: 310 } as const;
export const PAINT_PARTS: Record<string, [number, string, ColorSlot?][]> = {
	'body.human': [[10, 'body', 'skin']],
	'body.elf': [[10, 'body', 'skin'], [55, 'elf-ears', 'skin']],
	'body.cat': [[2, 'tail', 'hair'], [10, 'body', 'skin'], [55, 'cat-ears', 'hair']],
	'body.bunny': [[10, 'body', 'skin'], [55, 'bunny-ears', 'hair']],
	'face.bright': [[40, 'face'], [41, 'eyes', 'eyes']],
	'hair.bob': [[0, 'hair-back', 'hair'], [50, 'hair-front', 'hair']],
	'top.tee': [[30, 'top', 'top']],
	'bottom.shorts': [[20, 'bottom', 'bottom']],
	'shoes.sneakers': [[25, 'shoes', 'shoes']]
};

export function paintedAvatar(avatar: AvatarConfig): Figure | null {
	const ids = Object.values(avatar.parts).filter((id): id is string => !!id);
	if (!ids.length || ids.some((id) => !PAINT_PARTS[id])) return null;
	const layers: LayerSpec[] = ids.flatMap((id) => PAINT_PARTS[id].map(([z, file, channel]) => ({
		body: file === 'body',
		occludesBody: file in GARMENT_FIT ? garmentCoverage(GARMENT_FIT[file as keyof typeof GARMENT_FIT]) : undefined,
		z, art: { painted: `/painted/${file}.webp`, ...PAINT_AVATAR, channel } as Art,
		palette: REFERENCE_PALETTE,
		paintColor: channel ? paintSwatch(channel, avatar.colors[channel]).ramp[1] : undefined
	})));
	layers.sort((a, b) => a.z - b.z);
	return { ...PAINT_AVATAR, painted: true, displayHeight: 40, layers };
}

/** Anchors belong to each painting, in its delivered 512 × 384 canvas. */
export const BRAMBLE_ANCHORS: Record<PetStage, { head: [number, number]; neck: [number, number] }> = {
	egg: { head: [256, 150], neck: [256, 250] },
	baby: { head: [201, 145], neck: [220, 264] },
	teen: { head: [126, 73], neck: [163, 208] },
	adult: { head: [120, 78], neck: [146, 191] }
};

export function paintedPet(species: string, stage: PetStage, accessory?: string | null): Figure | null {
	if (!PET_ACCESSORIES_ENABLED) accessory = null;
	if (species !== 'emberkit' || (accessory && stage !== 'egg' && !['petacc.bow', 'petacc.bandana'].includes(accessory))) return null;
	const layers: LayerSpec[] = [{ z: 0, art: { painted: `/painted/brambleback-${stage}.webp`, ...PAINT_PET }, palette: REFERENCE_PALETTE }];
	if (accessory && stage !== 'egg') {
		const bow = accessory === 'petacc.bow';
		const [x, y] = BRAMBLE_ANCHORS[stage][bow ? 'head' : 'neck'];
		layers.push({ z: 1, art: { painted: `/painted/${bow ? 'bow' : 'bandana'}.webp`, w: 100, h: 80 }, palette: REFERENCE_PALETTE, dx: x - 50, dy: y - (bow ? 70 : 28) });
	}
	return { ...PAINT_PET, painted: true, displayHeight: 32, layers };
}
