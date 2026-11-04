import { keeperLook } from '$lib/content/keeper';
import type { AvatarConfig } from '$lib/content/types';
import { PET_ACCESSORIES_ENABLED } from '$lib/content/cosmetics';
import { GARMENT_FIT, garmentCoverage } from './fit';
import { paintSwatch } from '$lib/content/painted-palettes';
import { REFERENCE_PALETTE } from '$lib/content/palettes';
import type { Figure, LayerSpec } from './layers';
import type { PetStage } from './art/pets';

export const PAINT_AVATAR = { w: 400, h: 704, pivot: 570, displayHeight: 44 } as const;
export const PAINT_PET = { w: 512, h: 384, pivot: 310 } as const;
export const OUTFIT_PAINT: Record<string, keyof typeof GARMENT_FIT> = {
	'top.tee': 'outfit-01', 'top.sweater': 'outfit-02', 'top.hoodie': 'outfit-03', 'top.tunic': 'outfit-04'
};

export function paintedAvatar(avatar: AvatarConfig): Figure {
	const look = keeperLook(avatar);
	const outfit = OUTFIT_PAINT[look.parts.top!];
	const layer = (z: number, file: string): LayerSpec => ({
		z, art: { painted: `/painted/${file}.webp`, ...PAINT_AVATAR }, palette: REFERENCE_PALETTE
	});
	return { ...PAINT_AVATAR, painted: true, layers: [
		{ ...layer(10, look.colors.skin === 'deep' ? 'keeper-deep' : 'keeper-light'), body: true },
		{ ...layer(30, outfit), occludesBody: garmentCoverage(GARMENT_FIT[outfit]) },
		{ ...layer(50, 'keeper-bob'), paintColor: paintSwatch('hair', look.colors.hair).ramp[1] }
	] };
}

/** Anchors belong to each painting, in its delivered 512 × 384 canvas. */
export const BRAMBLE_ANCHORS: Record<PetStage, { head: [number, number]; neck: [number, number] }> = {
	egg: { head: [256, 110], neck: [256, 230] },
	baby: { head: [212, 99], neck: [213, 205] },
	teen: { head: [218, 74], neck: [225, 157] },
	adult: { head: [200, 95], neck: [211, 187] }
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
