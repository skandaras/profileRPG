/** Names and drawings can change; species ids remain permanent in pets and inventories. */
import type { StatId } from './types';

export type PetStage = 'egg' | 'baby' | 'teen' | 'adult';
export type Rarity = 'common' | 'uncommon' | 'rare';

export interface Species {
	id: string;
	name: string;
	blurb: string;
	/** Matching activities earn extra pet XP; these stats also help on missions. */
	affinity: StatId[];
	starter: boolean;
	rarity: Rarity;
}

export const SPECIES: Species[] = [
	{
		id: 'emberkit', name: 'Brambleback',
		blurb: 'A russet dragon with branching golden thorns. Grows from a little sitter into a broad-winged trail companion.',
		affinity: ['str'], starter: true, rarity: 'common'
	},
	{
		id: 'puddlefin', name: 'Brookbell',
		blurb: 'A slate-teal river seal wearing a necklace of found shells. Turns every puddle into a place to play.',
		affinity: ['dex'], starter: true, rarity: 'common'
	},
	{
		id: 'mossling', name: 'Cloverruff',
		blurb: 'A long-eared hound with a ruff of clover and fern. Keeps watch while you finish one more page.',
		affinity: ['int', 'kno'], starter: true, rarity: 'common'
	},
	{
		id: 'pebblet', name: 'Cairnback',
		blurb: 'A patient slate tortoise carrying a garden of amber crystals. Always finds the sunniest path.',
		affinity: ['str', 'kno'], starter: false, rarity: 'common'
	},
	{
		id: 'fluffle', name: 'Cloudwool',
		blurb: 'A shaggy cream ram with golden spiral horns. Looks rather wise; mostly thinks about snacks.',
		affinity: ['dex', 'kno'], starter: false, rarity: 'uncommon'
	},
	{
		id: 'glimmerwing', name: 'Lamplume',
		blurb: 'A velvet-plum moth with amber lanterns on its wings. A small light for the long way home.',
		affinity: ['int'], starter: false, rarity: 'rare'
	}
];

export const STARTERS = SPECIES.filter((s) => s.starter);
