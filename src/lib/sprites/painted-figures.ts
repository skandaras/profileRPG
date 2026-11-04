import { keeperLook } from '$lib/content/keeper';
import type { AvatarConfig } from '$lib/content/types';
import { paintSwatch } from '$lib/content/painted-palettes';
import { REFERENCE_PALETTE } from '$lib/content/palettes';
import type { Figure } from './layers';
import type { PetStage } from '$lib/content/pets';

export const PAINT_AVATAR = { w: 224, h: 384, pivot: 310, displayHeight: 44 } as const;
export const PAINT_PET = { w: 256, h: 224, pivot: 180, displayHeight: 36 } as const;
export const OUTFIT_COLUMNS: Record<string, number> = { 'top.tee': 0, 'top.sweater': 1, 'top.hoodie': 2, 'top.tunic': 3 };
export const SPECIES_ROWS: Record<string, number> = { emberkit: 0, puddlefin: 1, mossling: 2, pebblet: 3, fluffle: 4, glimmerwing: 5 };
export const STAGES: PetStage[] = ['egg', 'baby', 'teen', 'adult'];

/** Measured alpha bounds, with a clear three-pixel gutter around each whole silhouette. */
const PET_REGIONS = [
	[[59, 112, 121, 146], [285, 115, 151, 142], [491, 61, 228, 195], [735, 15, 271, 241]],
	[[58, 357, 122, 149], [262, 383, 180, 125], [488, 342, 213, 167], [728, 290, 281, 220]],
	[[56, 607, 128, 161], [262, 636, 172, 132], [484, 584, 228, 184], [724, 535, 272, 234]],
	[[57, 849, 127, 152], [269, 890, 155, 111], [476, 841, 218, 159], [719, 784, 298, 215]],
	[[53, 1100, 133, 160], [265, 1134, 156, 125], [480, 1071, 214, 190], [740, 1013, 251, 247]],
	[[59, 1355, 118, 157], [265, 1377, 163, 135], [465, 1332, 220, 179], [708, 1271, 303, 240]]
] as const;

export function paintedAvatar(avatar: AvatarConfig): Figure {
	const look = keeperLook(avatar);
	return { ...PAINT_AVATAR, painted: true, layers: [{
		z: 0,
		art: { painted: '/painted/wayfarers.png', ...PAINT_AVATAR, cell: [OUTFIT_COLUMNS[look.parts.top!], look.colors.skin === 'deep' ? 1 : 0, 4, 2], height: 352, ground: 372 },
		palette: REFERENCE_PALETTE,
		paintColor: paintSwatch('hair', look.colors.hair).ramp[1]
	}] };
}

export function paintedPet(species: string, stage: PetStage): Figure {
	const row = SPECIES_ROWS[species];
	if (row === undefined) return { ...PAINT_PET, painted: true, layers: [] };
	return { ...PAINT_PET, painted: true, layers: [{
		z: 0,
		art: { painted: '/painted/familiars.png', ...PAINT_PET, region: PET_REGIONS[row][STAGES.indexOf(stage)], height: { egg: 112, baby: 140, teen: 176, adult: 200 }[stage], ground: 212 },
		palette: REFERENCE_PALETTE
	}] };
}
