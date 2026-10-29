/**
 * Permanent colour ids and reference ramps: [shadow, base, light].
 * The keeper editor uses the kept subset in painted-palettes.ts.
 */
import type { PaletteSet, Ramp } from '$lib/sprites/grid';
import type { Unlock } from './types';

export interface Swatch {
	id: string;
	name: string;
	retired?: boolean;
	ramp: Ramp;
}

export interface Dye extends Swatch {
	unlock: Unlock;
}

export const SKIN_TONES: Swatch[] = [
	{ id: 'porcelain', retired: true, name: 'Porcelain', ramp: ['#e3b19e', '#fbe1d4', '#fff4ee'] },
	{ id: 'peach', name: 'Light', ramp: ['#dc9b7c', '#f5c6a5', '#ffe2cc'] },
	{ id: 'honey', retired: true, name: 'Honey', ramp: ['#c07f55', '#e0a677', '#f3c79b'] },
	{ id: 'tan', retired: true, name: 'Tan', ramp: ['#9f633c', '#c4885a', '#dea67a'] },
	{ id: 'umber', retired: true, name: 'Umber', ramp: ['#77462a', '#99623f', '#b98059'] },
	{ id: 'deep', name: 'Deep', ramp: ['#4b2b1b', '#68402a', '#875841'] }
];

export const HAIR_COLORS: Swatch[] = [
	{ id: 'ink', name: 'Black', ramp: ['#16131d', '#2c2736', '#4d4659'] },
	{ id: 'cocoa', name: 'Dark brown', ramp: ['#46291a', '#6c4128', '#92613d'] },
	{ id: 'chestnut', name: 'Chestnut', ramp: ['#77321a', '#a44a26', '#cb6d3f'] },
	{ id: 'honey', name: 'Honey blonde', ramp: ['#b8862b', '#e4bd58', '#fae39b'] },
	{ id: 'ginger', name: 'Auburn', ramp: ['#ad4520', '#de692d', '#f6995b'] },
	{ id: 'bubblegum', retired: true, name: 'Bubblegum', ramp: ['#c0578a', '#ef8bb4', '#ffc4db'] },
	{ id: 'lavender', retired: true, name: 'Lavender', ramp: ['#7659ad', '#a589df', '#d3c2fb'] },
	{ id: 'seafoam', retired: true, name: 'Seafoam', ramp: ['#21787a', '#38a8a4', '#7cd8cf'] },
	{ id: 'sky', retired: true, name: 'Sky', ramp: ['#2c4f9d', '#4a76d5', '#90b1f5'] },
	{ id: 'silver', retired: true, name: 'Silver', ramp: ['#868ba0', '#bdc1d3', '#eceef6'] }
];

export const EYE_COLORS: Swatch[] = [
	{ id: 'hazel', retired: true, name: 'Hazel', ramp: ['#4a2b1a', '#7c4c2b', '#b27c4c'] },
	{ id: 'ocean', retired: true, name: 'Ocean', ramp: ['#1d468a', '#3a78d0', '#8bb9f5'] },
	{ id: 'leaf', retired: true, name: 'Leaf', ramp: ['#1d683a', '#36a058', '#8bd89b'] },
	{ id: 'violet', retired: true, name: 'Violet', ramp: ['#4a2a8a', '#7a4ad0', '#b99bf5'] },
	{ id: 'amber', retired: true, name: 'Amber', ramp: ['#87570f', '#d0901a', '#f5c85a'] },
	{ id: 'rose', retired: true, name: 'Rose', ramp: ['#8a2a4f', '#d04a7f', '#f59ac0'] }
];

export const DYES: Dye[] = [
	{ id: 'red', retired: true, name: 'Cherry', ramp: ['#9c2939', '#d6455a', '#f2808d'], unlock: { kind: 'starter' } },
	{ id: 'orange', retired: true, name: 'Tangerine', ramp: ['#ad501e', '#e67a35', '#f9aa6a'], unlock: { kind: 'starter' } },
	{ id: 'yellow', retired: true, name: 'Lemon', ramp: ['#b38b1d', '#e8c440', '#f8e488'], unlock: { kind: 'starter' } },
	{ id: 'green', retired: true, name: 'Clover', ramp: ['#2d773d', '#4aa85a', '#8ad890'], unlock: { kind: 'starter' } },
	{ id: 'blue', retired: true, name: 'Cornflower', ramp: ['#274a98', '#3f72d0', '#86a8f0'], unlock: { kind: 'starter' } },
	{ id: 'purple', retired: true, name: 'Grape', ramp: ['#582d88', '#8450c0', '#b88ae6'], unlock: { kind: 'starter' } },
	{ id: 'pink', retired: true, name: 'Peony', ramp: ['#b5447a', '#e872a6', '#f8aed0'], unlock: { kind: 'starter' } },
	{ id: 'white', retired: true, name: 'Cotton', ramp: ['#b3b7c8', '#e6e8f0', '#ffffff'], unlock: { kind: 'starter' } },
	{ id: 'black', retired: true, name: 'Charcoal', ramp: ['#16141d', '#2c2935', '#4a4652'], unlock: { kind: 'starter' } },
	{ id: 'brown', retired: true, name: 'Acorn', ramp: ['#583823', '#7f5636', '#a87a54'], unlock: { kind: 'starter' } },
	{ id: 'teal', retired: true, name: 'Lagoon', ramp: ['#1b6b6e', '#2f9c9a', '#71d2c8'], unlock: { kind: 'shop', price: 40 } },
	{ id: 'navy', retired: true, name: 'Midnight', ramp: ['#1b2350', '#2e3b7a', '#5062a8'], unlock: { kind: 'starter' } },
	{ id: 'mint', retired: true, name: 'Mint', ramp: ['#4b9e84', '#7fd0b0', '#c0f2dc'], unlock: { kind: 'shop', price: 60, level: 3 } },
	{ id: 'sakura', retired: true, name: 'Sakura', ramp: ['#cf7795', '#f5a8c0', '#ffd8e5'], unlock: { kind: 'drop' } },
	{ id: 'starlight', retired: true, name: 'Starlight', ramp: ['#4c3f8f', '#7c6fd8', '#c8c0ff'], unlock: { kind: 'drop' } },
	{ id: 'gold', retired: true, name: 'Gilded', ramp: ['#a2761a', '#dcae30', '#ffe274'], unlock: { kind: 'level', level: 10 } }
];

export const ACCENT_GOLD: Ramp = ['#a2761a', '#e0b030', '#ffe48a'];
export const WHITE_RAMP: Ramp = ['#b3b7c8', '#e6e8f0', '#ffffff'];

/**
 * The palette PNG art is drawn in. The renderer swaps these exact colours for
 * the player's choices, so artists draw a "default" character and every pixel
 * not in this table stays as drawn. See docs/ART.md.
 */
export const REFERENCE_PALETTE: PaletteSet = {
	skin: SKIN_TONES[1].ramp,
	hair: HAIR_COLORS[2].ramp,
	eye: EYE_COLORS[0].ramp,
	primary: DYES[0].ramp,
	secondary: WHITE_RAMP,
	accent: ACCENT_GOLD
};

const byId = <T extends { id: string }>(list: T[]) => new Map(list.map((s) => [s.id, s]));
const skinMap = byId(SKIN_TONES);
const hairMap = byId(HAIR_COLORS);
const eyeMap = byId(EYE_COLORS);
const dyeMap = byId(DYES);

export const getDye = (id: string) => dyeMap.get(id);
export const isSkin = (id: string) => skinMap.has(id);
export const isHair = (id: string) => hairMap.has(id);
export const isEye = (id: string) => eyeMap.has(id);
