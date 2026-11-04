/**
 * Missions: timed trips your hero (and companion) go on while you get on with
 * your day. Gated by level; success depends on how your stats compare with the
 * recommended ones, and even a stumble brings something home.
 */
import type { StatId } from './types';

export type LootEntry =
	| { item: string; weight: number; qty?: [number, number] }
	| { egg: string; weight: number }
	| { gp: [number, number]; weight: number };

export interface Mission {
	id: string;
	name: string;
	region: string;
	icon: string;
	blurb: string;
	minLevel: number;
	minutes: number;
	/** Stat levels at which the mission is a comfortable success. */
	recommended: Partial<Record<StatId, number>>;
	xp: number;
	gp: number;
	loot: LootEntry[];
}

export const REGIONS = ['Sunny Meadow', 'Old Town', 'Whispering Woods', 'Crystal Caves', 'Tidepool Coast', 'Sky Spire'] as const;

export const MISSIONS: Mission[] = [
	{
		id: 'meadow-stroll',
		name: 'Meadow stroll',
		region: 'Sunny Meadow',
		icon: '🌼',
		blurb: 'A gentle wander through the wildflowers. Good for finding snacks.',
		minLevel: 1,
		minutes: 15,
		recommended: { str: 2 },
		xp: 15,
		gp: 8,
		loot: [
			{ item: 'food.berry', weight: 40, qty: [1, 3] },
			{ item: 'food.kibble', weight: 25, qty: [1, 2] },
			{ gp: [3, 8], weight: 20 },
			{ gp: [10, 20], weight: 6 },
			{ egg: 'pebblet', weight: 4 }
		]
	},
	{
		id: 'library-errand',
		name: 'Library errand',
		region: 'Old Town',
		icon: '📜',
		blurb: 'Return some overdue books and browse the stacks on the way out.',
		minLevel: 1,
		minutes: 30,
		recommended: { int: 2, kno: 2 },
		xp: 22,
		gp: 10,
		loot: [
			{ item: 'treat.cake', weight: 25 },
			{ item: 'food.kibble', weight: 25, qty: [1, 2] },
			{ gp: [5, 10], weight: 25 },
			{ gp: [10, 20], weight: 6 },
			{ item: 'theme.sakura', weight: 4 }
		]
	},
	{
		id: 'sunny-dojo',
		name: 'Sunny dojo',
		region: 'Old Town',
		icon: '🥋',
		blurb: 'Spar with the dojo regulars. Balance beats brawn here.',
		minLevel: 2,
		minutes: 45,
		recommended: { dex: 3 },
		xp: 30,
		gp: 14,
		loot: [
			{ item: 'food.fish', weight: 25 },
			{ gp: [8, 15], weight: 30 },
			{ gp: [10, 20], weight: 8 },
			{ item: 'treat.star', weight: 6 },
			{ egg: 'pebblet', weight: 5 }
		]
	},
	{
		id: 'whispering-woods',
		name: 'Whispering woods',
		region: 'Whispering Woods',
		icon: '🌲',
		blurb: 'Follow the trail markers and listen to what the trees know.',
		minLevel: 3,
		minutes: 60,
		recommended: { kno: 4, dex: 3 },
		xp: 40,
		gp: 18,
		loot: [
			{ item: 'food.berry', weight: 20, qty: [2, 4] },
			{ item: 'treat.cake', weight: 20 },
			{ item: 'petacc.flower', weight: 8 },
			{ gp: [10, 20], weight: 6 },
			{ egg: 'fluffle', weight: 5 },
			{ egg: 'pebblet', weight: 5 },
			{ gp: [10, 20], weight: 20 }
		]
	},
	{
		id: 'crystal-caves',
		name: 'Crystal caves',
		region: 'Crystal Caves',
		icon: '💎',
		blurb: 'Haul gems out of the deep. Bring strong arms and a clear head.',
		minLevel: 5,
		minutes: 120,
		recommended: { str: 5, int: 4 },
		xp: 65,
		gp: 30,
		loot: [
			{ gp: [20, 40], weight: 30 },
			{ item: 'treat.star', weight: 15 },
			{ item: 'theme.crystal', weight: 6 },
			{ gp: [10, 20], weight: 5 },
			{ egg: 'pebblet', weight: 10 },
			{ egg: 'glimmerwing', weight: 3 },
			{ item: 'toy.plush', weight: 6 }
		]
	},
	{
		id: 'tidepool-coast',
		name: 'Tidepool coast',
		region: 'Tidepool Coast',
		icon: '🐚',
		blurb: 'Hop between rock pools at low tide. Watch your footing.',
		minLevel: 6,
		minutes: 180,
		recommended: { dex: 6, str: 4 },
		xp: 85,
		gp: 40,
		loot: [
			{ item: 'food.fish', weight: 25, qty: [2, 3] },
			{ gp: [25, 45], weight: 25 },
			{ item: 'theme.ocean', weight: 8 },
			{ gp: [10, 20], weight: 4 },
			{ egg: 'fluffle', weight: 6 },
			{ item: 'treat.star', weight: 10 }
		]
	},
	{
		id: 'sky-spire',
		name: 'Sky spire',
		region: 'Sky Spire',
		icon: '🗼',
		blurb: 'Climb the tower of riddles. Each landing has a puzzle to solve.',
		minLevel: 8,
		minutes: 240,
		recommended: { int: 7, kno: 6 },
		xp: 110,
		gp: 55,
		loot: [
			{ gp: [35, 60], weight: 25 },
			{ gp: [10, 20], weight: 8 },
			{ gp: [10, 20], weight: 5 },
			{ gp: [10, 20], weight: 8 },
			{ egg: 'glimmerwing', weight: 6 },
			{ item: 'treat.star', weight: 15 },
			{ item: 'petacc.crown', weight: 4 }
		]
	},
	{
		id: 'dragons-hearth',
		name: "Dragon's hearth",
		region: 'Sky Spire',
		icon: '🐉',
		blurb: 'A dragon has lost its treasure. Help it look, and it shares.',
		minLevel: 10,
		minutes: 480,
		recommended: { str: 9, dex: 8 },
		xp: 200,
		gp: 100,
		loot: [
			{ gp: [60, 120], weight: 25 },
			{ gp: [10, 20], weight: 6 },
			{ gp: [10, 20], weight: 6 },
			{ gp: [10, 20], weight: 6 },
			{ egg: 'glimmerwing', weight: 8 },
			{ egg: 'fluffle', weight: 8 },
			{ item: 'petacc.crown', weight: 6 }
		]
	}
];
