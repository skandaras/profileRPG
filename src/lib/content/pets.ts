/**
 * Pet species. Names and drawings can change; ids are permanent because saved
 * pets and inventory entries refer to them.
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
	art: Record<PetStage, PetArt | { png: string; frames?: number; anchors: PetArt['anchors'] }>;
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
		name: 'Brambleback',
		blurb: 'A gentle hedge dragon who folds up his wings to follow you down narrow paths.',
		affinity: ['str'],
		starter: true,
		rarity: 'common',
		palette: {
			primary: ['#9b5140', '#cd815b', '#efbc83'],
			secondary: ['#b2a77e', '#e5d9ae', '#fff2d3'],
			accent: ['#9b652d', '#d9a84e', '#f7d998']
		},
		art: { ...stages(P.emberkit), egg: P.bramblebackEgg() }
	},
	{
		id: 'puddlefin',
		name: 'Brookbell',
		blurb: 'A soft river seal with a cream bib and broad little flippers. Turns every puddle into a place to play.',
		affinity: ['dex'],
		starter: true,
		rarity: 'common',
		palette: {
			primary: ['#536e76', '#8aafb1', '#c0d8cf'],
			secondary: ['#b2a77e', '#e5d9ae', '#fff2d3'],
			accent: ['#9b652d', '#d9a84e', '#f7d998']
		},
		art: { ...stages(P.puddlefin), egg: P.brookbellEgg() }
	},
	{
		id: 'mossling',
		name: 'Cloverruff',
		blurb: 'A floppy-eared moss pup who noses through clover and naps beside your books.',
		affinity: ['int', 'kno'],
		starter: true,
		rarity: 'common',
		palette: {
			primary: ['#426647', '#78915c', '#b2c98a'],
			secondary: ['#b2a77e', '#e5d9ae', '#fff2d3'],
			accent: ['#9b652d', '#d9a84e', '#f7d998']
		},
		art: { ...stages(P.mossling), egg: P.cloverruffEgg() }
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
