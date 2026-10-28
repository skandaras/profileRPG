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

const stages = (draw: (stage: 'baby' | 'teen' | 'adult') => PetArt, egg: PetArt): Species['art'] => ({
	egg,
	baby: draw('baby'),
	teen: draw('teen'),
	adult: draw('adult')
});

export const SPECIES: Species[] = [
	{
		id: 'emberkit',
		name: 'Brambleback',
		blurb: 'An indigo dragon with golden crescent horns. Grows from a round little sitter into a wide-winged friend.',
		affinity: ['str'],
		starter: true,
		rarity: 'common',
		palette: {
			primary: ['#9b5140', '#cd815b', '#efbc83'],
			secondary: ['#b2a77e', '#e5d9ae', '#fff2d3'],
			accent: ['#9b652d', '#d9a84e', '#f7d998']
		},
		art: stages(P.emberkit, P.bramblebackEgg())
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
		art: stages(P.puddlefin, P.brookbellEgg())
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
		art: stages(P.mossling, P.cloverruffEgg())
	},
	{
		id: 'pebblet',
		name: 'Cairnback',
		blurb: 'A patient stone tortoise with jade growing from its shell. Stops to warm its feet on sunny paths.',
		affinity: ['str', 'kno'],
		starter: false,
		rarity: 'common',
		palette: {
			primary: ['#666875', '#96999f', '#c4c9c4'],
			secondary: ['#b2a77e', '#e5d9ae', '#fff2d3'],
			accent: ['#42736b', '#7faf96', '#cee0b5']
		},
		art: stages(P.pebblet, P.cairnbackEgg())
	},
	{
		id: 'fluffle',
		name: 'Cloudwool',
		blurb: 'A small lamb with amber curls and a fleece like piled cream. Keeps close when the garden mist rolls in.',
		affinity: ['dex', 'kno'],
		starter: false,
		rarity: 'uncommon',
		palette: {
			primary: ['#a56b58', '#d5a07e', '#f1c7a0'],
			secondary: ['#b2a77e', '#e5d9ae', '#fff2d3'],
			accent: ['#9b652d', '#d9a84e', '#f7d998']
		},
		art: stages(P.fluffle, P.cloudwoolEgg())
	},
	{
		id: 'glimmerwing',
		name: 'Lamplume',
		blurb: 'A velvet moth with lantern marks on its folded wings. Settles beside you for one more page.',
		affinity: ['int'],
		starter: false,
		rarity: 'rare',
		palette: {
			primary: ['#675064', '#9c7b8c', '#ceb0bc'],
			secondary: ['#b2a77e', '#e5d9ae', '#fff2d3'],
			accent: ['#9b652d', '#d9a84e', '#f7d998']
		},
		art: stages(P.glimmerwing, P.lamplumeEgg())
	}
];

export const STARTERS = SPECIES.filter((s) => s.starter);
