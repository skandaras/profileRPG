/**
 * Pet species. The three starters are placeholders until the real designs
 * exist: change names, blurbs and art freely, but keep the ids, which are
 * stored on every pet row.
 */
import * as P from '$lib/sprites/art/pets';
import type { PetArt, PetStage } from '$lib/sprites/art/pets';
import type { PaletteSet, Ramp } from '$lib/sprites/grid';
import type { StatId } from './types';

export type Rarity = 'common' | 'uncommon' | 'rare';

export interface Species {
	id: string;
	name: string;
	blurb: string;
	/** Activities training these stats give this pet extra XP, and it helps on missions that test them. */
	affinity: StatId[];
	starter: boolean;
	rarity: Rarity;
	palette: { primary: Ramp; secondary: Ramp; accent: Ramp };
	/** Art per stage, or a PNG per stage with the same anchors. See docs/ART.md. */
	art: Record<PetStage, PetArt | { png: string; anchors: PetArt['anchors'] }>;
}

const NONE: Ramp = ['#000000', '#000000', '#000000'];

export function speciesPalette(s: Species): PaletteSet {
	return { ...s.palette, skin: NONE, hair: NONE, eye: NONE };
}

const stages = (draw: (stage: 'baby' | 'teen' | 'adult') => PetArt): Species['art'] => ({
	egg: P.egg(),
	baby: draw('baby'),
	teen: draw('teen'),
	adult: draw('adult')
});

export const SPECIES: Species[] = [
	{
		id: 'emberkit',
		name: 'Emberkit',
		blurb: 'A fox kit with a flame for a tail. Burns brighter the more you move.',
		affinity: ['str'],
		starter: true,
		rarity: 'common',
		palette: {
			primary: ['#c1532a', '#ee8238', '#ffb46a'],
			secondary: ['#e6cfa8', '#fff1d6', '#ffffff'],
			accent: ['#d0451f', '#f5a524', '#ffe27a']
		},
		art: stages(P.emberkit)
	},
	{
		id: 'puddlefin',
		name: 'Puddlefin',
		blurb: 'A water sprite with frilly gills. Nimble, playful, always splashing.',
		affinity: ['dex'],
		starter: true,
		rarity: 'common',
		palette: {
			primary: ['#4d86c9', '#7fb6ef', '#bfe0ff'],
			secondary: ['#bcd6ef', '#e8f4ff', '#ffffff'],
			accent: ['#c9507a', '#f285a8', '#ffc2d6']
		},
		art: stages(P.puddlefin)
	},
	{
		id: 'mossling',
		name: 'Mossling',
		blurb: 'A round little sprout that blooms as it learns. Loves a good book.',
		affinity: ['int', 'kno'],
		starter: true,
		rarity: 'common',
		palette: {
			primary: ['#3f8a46', '#6cbf5c', '#a9e48c'],
			secondary: ['#2d6b33', '#5aa84e', '#8cd07a'],
			accent: ['#d0577f', '#f58fb0', '#ffd0e0']
		},
		art: stages(P.mossling)
	},
	{
		id: 'pebblet',
		name: 'Pebblet',
		blurb: 'A pebble that grew a crystal. Sturdy, patient and surprisingly heavy.',
		affinity: ['str', 'kno'],
		starter: false,
		rarity: 'common',
		palette: {
			primary: ['#6f6a7d', '#9a95a8', '#c8c4d4'],
			secondary: ['#8a8598', '#b5b1c2', '#e0ddea'],
			accent: ['#2a8fa8', '#4fd0e0', '#b5f5ff']
		},
		art: stages(P.pebblet)
	},
	{
		id: 'fluffle',
		name: 'Fluffle',
		blurb: 'A lamb made of cloud. Floats when it is very happy.',
		affinity: ['dex', 'kno'],
		starter: false,
		rarity: 'uncommon',
		palette: {
			primary: ['#d9a98a', '#f2c8a8', '#ffe4cc'],
			secondary: ['#c9cde0', '#f4f6ff', '#ffffff'],
			accent: ['#b07a3a', '#d8a55a', '#f5d08a']
		},
		art: stages(P.fluffle)
	},
	{
		id: 'glimmerwing',
		name: 'Glimmerwing',
		blurb: 'A moth whose wings glow like lanterns. Drawn to bright ideas.',
		affinity: ['int'],
		starter: false,
		rarity: 'rare',
		palette: {
			primary: ['#6b4a9a', '#9a74cf', '#c9a8f5'],
			secondary: ['#c8a8e8', '#ecdcff', '#ffffff'],
			accent: ['#d0a020', '#ffd84a', '#fff2a8']
		},
		art: stages(P.glimmerwing)
	}
];

export const STARTERS = SPECIES.filter((s) => s.starter);
