/**
 * Passive powers, bought with ability points (one per level from level 2).
 * An ability is only a list of modifier effects; the rules read modifiers by
 * key (game/modifiers.ts), so a new power is usually just a new entry here.
 */
import type { Effect } from './types';

export interface Ability {
	id: string;
	name: string;
	blurb: string;
	icon: string;
	minLevel: number;
	requires?: string[];
	effects: Effect[];
}

export const ABILITIES: Ability[] = [
	{
		id: 'iron-resolve',
		name: 'Iron Resolve',
		blurb: '+15% XP from Strength activities.',
		icon: '💪',
		minLevel: 2,
		effects: [{ key: 'xp.str', value: 0.15 }]
	},
	{
		id: 'light-feet',
		name: 'Light Feet',
		blurb: '+15% XP from Dexterity activities.',
		icon: '🍃',
		minLevel: 2,
		effects: [{ key: 'xp.dex', value: 0.15 }]
	},
	{
		id: 'bright-spark',
		name: 'Bright Spark',
		blurb: '+15% XP from Intellect activities.',
		icon: '💡',
		minLevel: 2,
		effects: [{ key: 'xp.int', value: 0.15 }]
	},
	{
		id: 'bookworm',
		name: 'Bookworm',
		blurb: '+15% XP from Knowledge activities.',
		icon: '📚',
		minLevel: 2,
		effects: [{ key: 'xp.kno', value: 0.15 }]
	},
	{
		id: 'pet-whisperer',
		name: 'Pet Whisperer',
		blurb: 'Your pets get hungry and bored 25% slower, and grow 25% faster.',
		icon: '🐾',
		minLevel: 3,
		effects: [
			{ key: 'pet.decay', value: -0.25 },
			{ key: 'pet.xp', value: 0.25 }
		]
	},
	{
		id: 'homebody',
		name: 'Homebody',
		blurb: '+3 GP from the daily welcome-back tidy.',
		icon: '🏡',
		minLevel: 3,
		effects: [{ key: 'welcome.gp', value: 3 }]
	},
	{
		id: 'warm-heart',
		name: 'Warm Heart',
		blurb: 'Eggs warm 50% faster.',
		icon: '🥚',
		minLevel: 4,
		effects: [{ key: 'egg.warmth', value: 0.5 }]
	},
	{
		id: 'gold-sense',
		name: 'Gold Sense',
		blurb: '+15% GP from activities.',
		icon: '🪙',
		minLevel: 4,
		effects: [{ key: 'gp.all', value: 0.15 }]
	},
	{
		id: 'streak-shield',
		name: 'Streak Shield',
		blurb: 'Once a week, a missed habit keeps its streak and costs no GP.',
		icon: '🛡️',
		minLevel: 5,
		effects: [{ key: 'streak.shield', value: 1 }]
	},
	{
		id: 'treasure-nose',
		name: 'Treasure Nose',
		blurb: '20% chance of an extra find on every mission.',
		icon: '🗝️',
		minLevel: 5,
		effects: [{ key: 'loot.extra', value: 0.2 }]
	},
	{
		id: 'swift-travels',
		name: 'Swift Travels',
		blurb: 'Missions take 20% less time.',
		icon: '🧭',
		minLevel: 6,
		effects: [{ key: 'mission.duration', value: -0.2 }]
	},
	{
		id: 'second-party',
		name: 'Second Party',
		blurb: 'Run two missions at once.',
		icon: '🗺️',
		minLevel: 8,
		requires: ['swift-travels'],
		effects: [{ key: 'mission.slots', value: 1 }]
	},
	{
		id: 'heroic-focus',
		name: 'Heroic Focus',
		blurb: '+10% XP from everything, and missions succeed more often.',
		icon: '⭐',
		minLevel: 10,
		effects: [
			{ key: 'xp.all', value: 0.1 },
			{ key: 'mission.success', value: 0.1 }
		]
	}
];
