import type { StatBlock, StatId } from './types';

export interface StatDef {
	id: StatId;
	name: string;
	short: string;
	blurb: string;
	/** Matches a theme token, so the bars recolour with the theme. */
	color: string;
}

export const STAT_IDS: StatId[] = ['str', 'dex', 'int', 'kno'];

export const STATS: Record<StatId, StatDef> = {
	str: {
		id: 'str',
		name: 'Strength',
		short: 'STR',
		blurb: 'Fitness and physical strength: workouts, walks, sleep, water.',
		color: 'var(--stat-str)'
	},
	dex: {
		id: 'dex',
		name: 'Dexterity',
		short: 'DEX',
		blurb: 'Coordination and flow: yoga, sports, games, crafts.',
		color: 'var(--stat-dex)'
	},
	int: {
		id: 'int',
		name: 'Intellect',
		short: 'INT',
		blurb: 'Reasoning: meaningful books, puzzles, challenges, coding projects.',
		color: 'var(--stat-int)'
	},
	kno: {
		id: 'kno',
		name: 'Knowledge',
		short: 'KNO',
		blurb: 'Learning about the world: news, reading, a new hobby or skill.',
		color: 'var(--stat-kno)'
	}
};

export const zeroStats = (): StatBlock => ({ str: 0, dex: 0, int: 0, kno: 0 });
