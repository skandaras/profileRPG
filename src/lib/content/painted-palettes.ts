/** Curated paint colours; saved ids continue to resolve through the nearest swatch. */
import { DYES, EYE_COLORS, HAIR_COLORS, SKIN_TONES, type Swatch } from './palettes';
import type { ColorSlot } from './types';
import { hexToRgb } from '$lib/sprites/compose';

const curated = <T extends Swatch>(source: T[], colors: Record<string, string>): T[] =>
	source.filter((s) => colors[s.id]).map((s) => ({ ...s, ramp: [s.ramp[0], colors[s.id], s.ramp[2]] }));

export const PAINT_SKIN = curated(SKIN_TONES, {
	porcelain: '#f3d5c3', peach: '#edbc9a', honey: '#dba77f', tan: '#bb8665', umber: '#90664e', deep: '#624838'
});
export const PAINT_HAIR = curated(HAIR_COLORS, {
	ink: '#45404e', cocoa: '#665044', chestnut: '#84513f', honey: '#c5a56c', ginger: '#b57650', lavender: '#91839f', silver: '#b4b6b5'
});
export const PAINT_EYES = curated(EYE_COLORS, {
	hazel: '#746044', ocean: '#6095af', leaf: '#526f51', violet: '#827297'
});
export const PAINT_DYES = curated(DYES, {
	red: '#b9726d', orange: '#c78d69', yellow: '#cfb574', green: '#819b75', blue: '#829bb8', purple: '#a89bc4',
	pink: '#cb9ca7', white: '#e8e0cd', black: '#534e53', brown: '#97745b', teal: '#749f99', navy: '#56667b', gold: '#c3a36a'
});

export function paintSwatches(slot: ColorSlot) {
	return slot === 'skin' ? PAINT_SKIN : slot === 'hair' ? PAINT_HAIR : slot === 'eyes' ? PAINT_EYES : PAINT_DYES;
}

export function paintSwatch(slot: ColorSlot, id?: string): Swatch {
	const choices = paintSwatches(slot);
	const exact = choices.find((s) => s.id === id);
	if (exact) return exact;
	const original = (slot === 'skin' ? SKIN_TONES : slot === 'hair' ? HAIR_COLORS : slot === 'eyes' ? EYE_COLORS : DYES).find((s) => s.id === id);
	if (!original) return choices.find((s) => s.id === ({ skin: 'peach', hair: 'chestnut', eyes: 'hazel' }[slot as string] ?? 'green')) ?? choices[0];
	const rgb = hexToRgb(original.ramp[1]);
	// Weighted RGB distance keeps green perception from being lost in retired fantasy dyes.
	const distance = (s: Swatch) => hexToRgb(s.ramp[1]).reduce((sum, v, i) => sum + [0.2126, 0.7152, 0.0722][i] * (v - rgb[i]) ** 2, 0);
	return choices.reduce((best, s) => distance(s) < distance(best) ? s : best);
}
