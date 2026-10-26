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
		icon: { sprite: I.berry() },
		tint: ['#5a2f8a', '#8450c0', '#b88ae6'],
		effect: { fullness: 15, joy: 2, petXp: 2 }
	},
	{
		id: 'food.kibble',
		name: 'Crunchy kibble',
		blurb: 'A filling bowl of the good stuff.',
		kind: 'food',
		unlock: { kind: 'shop', price: 5 },
		icon: { sprite: I.bowl() },
		tint: ['#9c2939', '#d6455a', '#f2808d'],
		effect: { fullness: 30, petXp: 3 }
	},
	{
		id: 'food.fish',
		name: 'Sun fish',
		blurb: 'Grilled, golden, and very popular.',
		kind: 'food',
		unlock: { kind: 'shop', price: 12, level: 2 },
		icon: { sprite: I.fish() },
		tint: ['#2c4f9d', '#4a76d5', '#90b1f5'],
		effect: { fullness: 45, joy: 5, petXp: 5 }
	},
	{
		id: 'treat.cake',
		name: 'Honey cake',
		blurb: 'A sweet treat. Mostly joy, a little filling.',
		kind: 'food',
		unlock: { kind: 'shop', price: 15 },
		icon: { sprite: I.cake() },
		tint: ['#c0578a', '#ef8bb4', '#ffc4db'],
		effect: { fullness: 10, joy: 30, petXp: 6 }
	},
	{
		id: 'treat.star',
		name: 'Star candy',
		blurb: 'Found on adventures. Pure delight.',
		kind: 'food',
		unlock: { kind: 'drop' },
		icon: { sprite: I.star() },
		tint: ['#a2761a', '#e0b030', '#ffe48a'],
		effect: { joy: 50, petXp: 15 }
	},
	{
		id: 'toy.ball',
		name: 'Bouncy ball',
		blurb: 'Makes playtime better. Kept forever.',
		kind: 'toy',
		unlock: { kind: 'shop', price: 40 },
		icon: { sprite: I.ball() },
		tint: ['#9c2939', '#d6455a', '#f2808d'],
		effect: { joy: 10, petXp: 3 }
	},
	{
		id: 'toy.yarn',
		name: 'Yarn ball',
		blurb: 'Endlessly fascinating. Kept forever.',
		kind: 'toy',
		unlock: { kind: 'shop', price: 60, level: 3 },
		icon: { sprite: I.yarn() },
		tint: ['#2d773d', '#4aa85a', '#8ad890'],
		effect: { joy: 15, petXp: 5 }
	},
	{
		id: 'toy.plush',
		name: 'Pocket plush',
		blurb: 'A tiny friend for your friend. Found on adventures.',
		kind: 'toy',
		unlock: { kind: 'drop' },
		icon: { sprite: I.plush() },
		tint: ['#ad501e', '#e67a35', '#f9aa6a'],
		effect: { joy: 25, petXp: 8 }
	}
];
