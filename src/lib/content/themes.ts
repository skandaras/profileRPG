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
	statStr: string;
	statDex: string;
	statInt: string;
	statKno: string;
};

export type ThemeTokens = BaseTokens & { wash: string; wash2: string; paper: string; window: string; shadow: string };

export interface Theme {
	id: string;
	name: string;
	blurb: string;
	unlock: Unlock;
	dark: boolean;
	tokens: ThemeTokens;
}

const STATS_LIGHT = { statStr: '#923341', statDex: '#365c3b', statInt: '#305384', statKno: '#71427e' };
const STATS_DARK = { statStr: '#ffc0c5', statDex: '#b6e1bc', statInt: '#c2d5ff', statKno: '#e1c6f2' };

export const DEFAULT_THEME = 'night';

// Every wash endpoint is also a tested surface: the pigment never hides the ink.
export const THEMES: Theme[] = [
	{
		id: 'meadow', name: 'Meadow dawn', blurb: 'Ivory card stock, moss washes and gold-brown ink.',
		unlock: { kind: 'starter' }, dark: false,
		tokens: {
			bg: '#f5efdf', bg2: '#fff9ed', bg3: '#e9e1cd', paper: '#fff9ed',
			wash: '#e2e4d0', wash2: '#eddfcc', ink: '#433722', inkSoft: '#655237',
			line: '#897047', trim: '#897047', accent: '#745222', accentInk: '#fff9ed',
			focus: '#724025', good: '#365c3b', bad: '#923341', xp: '#745222', gp: '#745222',
			window: '#e2e4d0', shadow: '#433722',
			...STATS_LIGHT
		}
	},
	{
		id: 'night', name: 'Midnight tarot', blurb: 'Midnight-blue watercolour and old gold.',
		unlock: { kind: 'starter' }, dark: true,
		tokens: {
			bg: '#111c31', bg2: '#1b2b44', bg3: '#25394c', paper: '#1b2b44',
			wash: '#354563', wash2: '#2a304d', ink: '#f8e8c7', inkSoft: '#ecdbb9',
			line: '#c7a872', trim: '#c7a872', accent: '#e5c58b', accentInk: '#162137',
			focus: '#ffe3a6', good: '#b6e1bc', bad: '#ffc0c5', xp: '#e5c58b', gp: '#e5c58b',
			window: '#25394c', shadow: '#111c31',
			...STATS_DARK
		}
	},
	{
		id: 'sakura', name: 'Sakura', blurb: 'Rose-plum washes with pale rose-gold ink.',
		unlock: { kind: 'drop' }, dark: true,
		tokens: {
			bg: '#281824', bg2: '#382433', bg3: '#463040', paper: '#382433',
			wash: '#503345', wash2: '#392b45', ink: '#ffeddd', inkSoft: '#edd1d0',
			line: '#d0a18b', trim: '#d0a18b', accent: '#f1c4a9', accentInk: '#281824',
			focus: '#ffe0bb', good: '#c3e3bc', bad: '#ffc0c5', xp: '#f1c4a9', gp: '#f1c4a9',
			window: '#463040', shadow: '#281824',
			...STATS_DARK
		}
	},
	{
		id: 'ocean', name: 'Deep sea', blurb: 'Deep teal washes, sea-glass ink and antique gold.',
		unlock: { kind: 'drop' }, dark: true,
		tokens: {
			bg: '#102c32', bg2: '#163a40', bg3: '#21464b', paper: '#163a40',
			wash: '#295158', wash2: '#20394c', ink: '#f5edce', inkSoft: '#d0e5dc',
			line: '#c6b382', trim: '#c6b382', accent: '#e6cf94', accentInk: '#102c32',
			focus: '#bcf4e4', good: '#c3e3bc', bad: '#ffc0c5', xp: '#e6cf94', gp: '#e6cf94',
			window: '#21464b', shadow: '#102c32',
			...STATS_DARK
		}
	},
	{
		id: 'ember', name: 'Hearth', blurb: 'Oxblood and wine washes edged in warm copper-gold.',
		unlock: { kind: 'shop', price: 150, level: 6 }, dark: true,
		tokens: {
			bg: '#30191f', bg2: '#40232a', bg3: '#4c3035', paper: '#40232a',
			wash: '#57343a', wash2: '#3f2937', ink: '#ffedcf', inkSoft: '#f2d1bd',
			line: '#d3a17b', trim: '#d3a17b', accent: '#f2c28e', accentInk: '#30191f',
			focus: '#ffe0aa', good: '#c3e3bc', bad: '#ffc0c5', xp: '#f2c28e', gp: '#f2c28e',
			window: '#4c3035', shadow: '#30191f',
			...STATS_DARK
		}
	},
	{
		id: 'crystal', name: 'Amethyst', blurb: 'Amethyst washes with lavender ink and pale gold.',
		unlock: { kind: 'drop' }, dark: true,
		tokens: {
			bg: '#251c35', bg2: '#342743', bg3: '#413253', paper: '#342743',
			wash: '#4b3b60', wash2: '#30334f', ink: '#f9e9dd', inkSoft: '#e0d0ed',
			line: '#c5ad96', trim: '#c5ad96', accent: '#e8d0a2', accentInk: '#251c35',
			focus: '#e6d6ff', good: '#c3e3bc', bad: '#ffc0c5', xp: '#e8d0a2', gp: '#e8d0a2',
			window: '#413253', shadow: '#251c35',
			...STATS_DARK
		}
	}
];

const CSS_NAMES: Record<keyof ThemeTokens, string> = {
	wash: '--wash',
	wash2: '--wash-2',
	paper: '--paper',
	window: '--window',
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
