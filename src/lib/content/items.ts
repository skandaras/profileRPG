/**
 * Consumables and toys. Cosmetics, dyes, pet accessories and themes are
 * catalogued in their own files; content/index.ts presents all of them as one
 * item registry, since the inventory table holds them all.
 */
import * as I from '$lib/sprites/art/icons';
import type { Ramp } from '$lib/sprites/grid';
import type { Art, Unlock } from './types';

export interface Consumable {
	id: string;
	name: string;
	blurb: string;
	kind: 'food' | 'toy';
	unlock: Unlock;
	icon: Art;
	tint: Ramp;
	/** What feeding it, or playing with it, does. Toys are kept, food is eaten. */
	effect: { fullness?: number; joy?: number; petXp?: number };
}

export const CONSUMABLES: Consumable[] = [
	{
		id: 'food.berry',
		name: 'Wild berry',
		blurb: 'Foraged for free once a day. A small snack.',
		kind: 'food',
		unlock: { kind: 'drop' },
		icon: I.berry(),
		tint: ['#70566f', '#a2809d', '#d4b1c4'],
		effect: { fullness: 15, joy: 2, petXp: 2 }
	},
	{
		id: 'food.kibble',
		name: 'Crunchy kibble',
		blurb: 'A filling bowl of the good stuff.',
		kind: 'food',
		unlock: { kind: 'shop', price: 5 },
		icon: I.bowl(),
		tint: ['#9d3f46', '#d9676c', '#f8b0a0'],
		effect: { fullness: 30, petXp: 3 }
	},
	{
		id: 'food.fish',
		name: 'Sun fish',
		blurb: 'Grilled, golden, and very popular.',
		kind: 'food',
		unlock: { kind: 'shop', price: 12, level: 2 },
		icon: I.fish(),
		tint: ['#9b652d', '#d9a84e', '#f7d998'],
		effect: { fullness: 45, joy: 5, petXp: 5 }
	},
	{
		id: 'treat.cake',
		name: 'Honey cake',
		blurb: 'A sweet treat. Mostly joy, a little filling.',
		kind: 'food',
		unlock: { kind: 'shop', price: 15 },
		icon: I.cake(),
		tint: ['#9d3f46', '#d9676c', '#f8b0a0'],
		effect: { fullness: 10, joy: 30, petXp: 6 }
	},
	{
		id: 'treat.star',
		name: 'Star candy',
		blurb: 'Found on adventures. Pure delight.',
		kind: 'food',
		unlock: { kind: 'drop' },
		icon: I.star(),
		tint: ['#9b652d', '#d9a84e', '#f7d998'],
		effect: { joy: 50, petXp: 15 }
	},
	{
		id: 'toy.ball',
		name: 'Bouncy ball',
		blurb: 'Makes playtime better. Kept forever.',
		kind: 'toy',
		unlock: { kind: 'shop', price: 40 },
		icon: I.ball(),
		tint: ['#9d3f46', '#d9676c', '#f8b0a0'],
		effect: { joy: 10, petXp: 3 }
	},
	{
		id: 'toy.yarn',
		name: 'Yarn ball',
		blurb: 'Endlessly fascinating. Kept forever.',
		kind: 'toy',
		unlock: { kind: 'shop', price: 60, level: 3 },
		icon: I.yarn(),
		tint: ['#426647', '#78915c', '#b2c98a'],
		effect: { joy: 15, petXp: 5 }
	},
	{
		id: 'toy.plush',
		name: 'Pocket plush',
		blurb: 'A tiny friend for your friend. Found on adventures.',
		kind: 'toy',
		unlock: { kind: 'drop' },
		icon: I.plush(),
		tint: ['#9b5140', '#cd815b', '#efbc83'],
		effect: { joy: 25, petXp: 8 }
	}
];
