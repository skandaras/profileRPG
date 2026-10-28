/**
 * UI colour themes. Each is a set of CSS custom properties written onto
 * <html data-theme>. Text pairs are held to WCAG AA by themes.test.ts, so a
 * new theme that reads badly fails the build rather than reaching a phone.
 */
import type { Unlock } from './types';

type BaseTokens = {
	bg: string;
	bg2: string;
	bg3: string;
	ink: string;
	inkSoft: string;
	line: string;
	focus: string;
	trim: string;
	accent: string;
	accentInk: string;
	good: string;
	bad: string;
	xp: string;
	gp: string;
	sky: string;
	floor: string;
	statStr: string;
	statDex: string;
	statInt: string;
	statKno: string;
};

export type ThemeTokens = BaseTokens & { wash: string; wash2: string; paper: string; window: string; plant: string; shadow: string };

export interface Theme {
	id: string;
	name: string;
	blurb: string;
	unlock: Unlock;
	dark: boolean;
	tokens: ThemeTokens;
}

const STATS_LIGHT = { statStr: '#a52e43', statDex: '#376b3e', statInt: '#315d9e', statKno: '#76429b' };
const STATS_DARK = { statStr: '#ff94a0', statDex: '#72d88a', statInt: '#8ab5ff', statKno: '#c99aff' };

const BASE_THEMES: (Omit<Theme, 'tokens'> & { tokens: BaseTokens })[] = [
	{
		id: 'meadow',
		name: 'Meadow',
		blurb: 'Grass, sunshine and a picnic blanket.',
		unlock: { kind: 'starter' },
		dark: false,
		tokens: {
			bg: '#f1eadc',
			bg2: '#fff9ee',
			bg3: '#e6dfcc',
			ink: '#3b3329',
			inkSoft: '#665b4a',
			line: '#83745f',
			accent: '#4d6740',
			accentInk: '#fff9ee',
			good: '#4d6740',
			bad: '#a23932',
			xp: '#687b46',
			gp: '#906324',
			sky: '#e6dfcc',
			floor: '#d7c7ab',
			focus: '#8d3c2b',
			trim: '#d7c7ab',
			...STATS_LIGHT
		}
	},
	{
		id: 'night',
		name: 'Starry night',
		blurb: 'For late-evening check-ins.',
		unlock: { kind: 'level', level: 3 },
		dark: true,
		tokens: {
			bg: '#24251e',
			bg2: '#303128',
			bg3: '#3d4032',
			ink: '#fbefda',
			inkSoft: '#d0c7ae',
			line: '#a99d80',
			accent: '#c2cd92',
			accentInk: '#292e1d',
			good: '#c2cd92',
			bad: '#f3ac98',
			xp: '#c2cd92',
			gp: '#f7d998',
			sky: '#3d4032',
			floor: '#5f624b',
			focus: '#f3ba98',
			trim: '#5f624b',
			...STATS_DARK
		}
	},
	{
		id: 'sakura',
		name: 'Sakura',
		blurb: 'Cherry blossom season, all year round.',
		unlock: { kind: 'drop' },
		dark: false,
		tokens: {
			focus: '#753b4c',
			trim: '#d3b9b3',
			bg: '#f2e5df',
			bg2: '#fff7f0',
			bg3: '#e8d8d3',
			ink: '#493137',
			inkSoft: '#6e5056',
			line: '#886c70',
			accent: '#874259',
			accentInk: '#fff7f0',
			good: '#3d623e',
			bad: '#9b343a',
			xp: '#885469',
			gp: '#855d28',
			sky: '#e8d8d3',
			floor: '#d3b9b3',
			...STATS_LIGHT
		}
	},
	{
		id: 'ocean',
		name: 'Tidepool',
		blurb: 'Sea breeze and warm sand.',
		unlock: { kind: 'drop' },
		dark: false,
		tokens: {
			focus: '#245b78',
			trim: '#becdbf',
			bg: '#e4ebe5',
			bg2: '#f8faf0',
			bg3: '#d4e0d8',
			ink: '#293e3c',
			inkSoft: '#4b6059',
			line: '#657d72',
			accent: '#35675f',
			accentInk: '#f8faf0',
			good: '#3a623d',
			bad: '#9b3b35',
			xp: '#486e66',
			gp: '#815b25',
			sky: '#d4e0d8',
			floor: '#c8ceb4',
			...STATS_LIGHT
		}
	},
	{
		id: 'ember',
		name: 'Hearth',
		blurb: 'Glowing coals and a warm fire.',
		unlock: { kind: 'shop', price: 150, level: 6 },
		dark: true,
		tokens: {
			focus: '#ffcfaa',
			trim: '#705842',
			bg: '#2d2520',
			bg2: '#3b3028',
			bg3: '#483a2f',
			ink: '#ffefdb',
			inkSoft: '#e0c4aa',
			line: '#bb9e7d',
			accent: '#efbd83',
			accentInk: '#34251b',
			good: '#c4d5a0',
			bad: '#ffb4a2',
			xp: '#efbd83',
			gp: '#f7d998',
			sky: '#483a2f',
			floor: '#6b5140',
			...STATS_DARK
		}
	},
	{
		id: 'crystal',
		name: 'Crystal cave',
		blurb: 'Deep purple stone and glowing gems.',
		unlock: { kind: 'drop' },
		dark: true,
		tokens: {
			focus: '#a6dfdc',
			trim: '#65566f',
			bg: '#292633',
			bg2: '#353140',
			bg3: '#423c50',
			ink: '#f9eef6',
			inkSoft: '#d3c4df',
			line: '#afa0bb',
			accent: '#c9b6e5',
			accentInk: '#2d263c',
			good: '#bed8b7',
			bad: '#ffb0bc',
			xp: '#c9b6e5',
			gp: '#f3d5a0',
			sky: '#423c50',
			floor: '#65566f',
			...STATS_DARK
		}
	}
];

export const THEMES: Theme[] = BASE_THEMES.map((theme) => {
	const t = theme.tokens;
	const painted = theme.id === 'meadow' ? {
		bg: '#f6f1e7', bg2: '#fffbf3', bg3: '#dfe8d3', ink: '#343e37', inkSoft: '#535e52',
		accent: '#49634d', accentInk: '#fffdf5', good: '#49634d', bad: '#953f3d', xp: '#49634d', gp: '#835a27',
		line: '#74816b', sky: '#e1e7cf', floor: '#dedac2', trim: '#c5c9b7'
	} : theme.id === 'night' ? {
		bg: '#242f31', bg2: '#303d3e', bg3: '#435448', ink: '#f8f0df', inkSoft: '#d3dfd3',
		accent: '#c9e1b0', accentInk: '#24302c', good: '#c9e1b0', bad: '#f3bcb4', xp: '#c9e1b0', gp: '#efd08e',
		statStr: '#ffc0c5', statDex: '#a6dba9', statInt: '#b2cafa', statKno: '#d5bce8',
		line: '#a4b6a5', sky: '#3c534d', floor: '#4a5249', trim: '#708475'
	} : {};
	const tokens = { ...t, ...painted };
	return { ...theme, tokens: {
		...tokens, wash: theme.id === 'meadow' ? '#e1e7cf' : theme.id === 'night' ? '#3c534d' : tokens.bg3,
		wash2: theme.id === 'meadow' ? '#f1dbc9' : theme.id === 'night' ? '#56483f' : tokens.bg,
		paper: tokens.bg2, window: theme.id === 'meadow' ? '#edf3dc' : theme.id === 'night' ? '#45616a' : tokens.sky,
		plant: tokens.accent, shadow: theme.dark ? '#152527' : '#b9bdab'
	} };
});

const CSS_NAMES: Record<keyof ThemeTokens, string> = {
	wash: '--wash',
	wash2: '--wash-2',
	paper: '--paper',
	window: '--window',
	plant: '--plant',
	shadow: '--shadow',
	bg: '--bg',
	bg2: '--bg-2',
	bg3: '--bg-3',
	ink: '--ink',
	inkSoft: '--ink-soft',
	line: '--line',
	focus: '--focus',
	trim: '--trim',
	accent: '--accent',
	accentInk: '--accent-ink',
	good: '--good',
	bad: '--bad',
	xp: '--xp',
	gp: '--gp',
	sky: '--sky',
	floor: '--floor',
	statStr: '--stat-str',
	statDex: '--stat-dex',
	statInt: '--stat-int',
	statKno: '--stat-kno'
};

/** Every theme as a `[data-theme=...]` rule, emitted once into the layout. */
export function themeCss(): string {
	return THEMES.map((t) => {
		const vars = (Object.keys(t.tokens) as (keyof ThemeTokens)[])
			.map((k) => `${CSS_NAMES[k]}:${t.tokens[k]}`)
			.join(';');
		return `[data-theme="${t.id}"]{${vars};color-scheme:${t.dark ? 'dark' : 'light'}}`;
	}).join('\n');
}
