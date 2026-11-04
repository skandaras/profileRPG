/** Two skins and five hair colours; saved colour ids map without rewriting saves. */
import { DYES, EYE_COLORS, HAIR_COLORS, SKIN_TONES, type Swatch } from './palettes';
import type { ColorSlot } from './types';

const curated = (source: Swatch[], colors: Record<string, string>): Swatch[] =>
	source.filter((s) => colors[s.id]).map((s) => ({ ...s, ramp: [s.ramp[0], colors[s.id], s.ramp[2]] }));

export const PAINT_SKIN = curated(SKIN_TONES, { peach: '#ffce9e', deep: '#995f3b' });
export const PAINT_HAIR = curated(HAIR_COLORS, {
	ink: '#29232c', cocoa: '#503628', chestnut: '#795439', honey: '#c5a56c', ginger: '#995637'
});

export const SKIN_MAPPING: Record<string, string> = {
	porcelain: 'peach', peach: 'peach', honey: 'peach', tan: 'deep', umber: 'deep', deep: 'deep'
};
export const HAIR_MAPPING: Record<string, string> = {
	ink: 'ink', cocoa: 'cocoa', chestnut: 'chestnut', honey: 'honey', ginger: 'ginger',
	bubblegum: 'honey', lavender: 'honey', seafoam: 'honey', sky: 'chestnut', silver: 'honey'
};

// Eye and dye ids still resolve for saved data; the whole outfit has fixed colours.
export function paintSwatches(slot: ColorSlot): Swatch[] {
	return slot === 'skin' ? PAINT_SKIN : slot === 'hair' ? PAINT_HAIR : slot === 'eyes' ? [EYE_COLORS[0]] : [DYES.find((d) => d.id === 'white')!];
}

export function paintSwatch(slot: ColorSlot, id?: string): Swatch {
	const choices = paintSwatches(slot);
	const mapped = slot === 'skin' ? SKIN_MAPPING[id ?? ''] : slot === 'hair' ? HAIR_MAPPING[id ?? ''] : undefined;
	return choices.find((s) => s.id === (mapped ?? id)) ?? choices.find((s) => s.id === (slot === 'hair' ? 'chestnut' : 'peach')) ?? choices[0];
}
