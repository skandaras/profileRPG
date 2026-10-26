/**
 * UI colour themes. Each is a set of CSS custom properties written onto
 * <html data-theme>. Text pairs are held to WCAG AA by themes.test.ts, so a
 * new theme that reads badly fails the build rather than reaching a phone.
 */
import type { Unlock } from './types';

export type ThemeTokens = {
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

export const THEMES: Theme[] = [
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
			focus: '#813455',
			trim: '#e8b5c4',
			bg: '#fde8ef',
			bg2: '#fffafc',
			bg3: '#f8e3ea',
			ink: '#3a1f2b',
			inkSoft: '#6b4757',
			line: '#816273',
			accent: '#b2366a',
			accentInk: '#ffffff',
			good: '#30683c',
			bad: '#b3283c',
			xp: '#a43c70',
			gp: '#906324',
			sky: '#ffd6e6',
			floor: '#e8b5c4',
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
			focus: '#245c85',
			trim: '#b7d0d8',
			bg: '#dff1f7',
			bg2: '#f7fdff',
			bg3: '#e5f3f8',
			ink: '#12313f',
			inkSoft: '#3d5e6d',
			line: '#557681',
			accent: '#1d6a88',
			accentInk: '#ffffff',
			good: '#286c43',
			bad: '#b3283c',
			xp: '#23768e',
			gp: '#906324',
			sky: '#a8e0f5',
			floor: '#e9d9a8',
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
			focus: '#ffd1ae',
			trim: '#6d493a',
			bg: '#24130f',
			bg2: '#331c16',
			bg3: '#43261d',
			ink: '#fbeee6',
			inkSoft: '#d8bcae',
			line: '#ba927c',
			accent: '#f08a3c',
			accentInk: '#24130f',
			good: '#8be09a',
			bad: '#ff9a8a',
			xp: '#ffb46a',
			gp: '#ffd04a',
			sky: '#4a1f16',
			floor: '#5b3226',
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
			focus: '#b8eaf0',
			trim: '#574775',
			bg: '#1b1430',
			bg2: '#261d42',
			bg3: '#332858',
			ink: '#f3eeff',
			inkSoft: '#c4b8e8',
			line: '#a494c0',
			accent: '#5fd6e0',
			accentInk: '#10202a',
			good: '#8be0b0',
			bad: '#ff96b0',
			xp: '#5fd6e0',
			gp: '#ffd04a',
			sky: '#2a2350',
			floor: '#3d3270',
			...STATS_DARK
		}
	}
];

const CSS_NAMES: Record<keyof ThemeTokens, string> = {
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
