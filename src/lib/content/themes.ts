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

const STATS_LIGHT = { statStr: '#d6455a', statDex: '#3f9f52', statInt: '#3f72d0', statKno: '#9a5cd0' };
const STATS_DARK = { statStr: '#ff7a8a', statDex: '#72d88a', statInt: '#7aa8ff', statKno: '#c99aff' };

export const THEMES: Theme[] = [
	{
		id: 'meadow',
		name: 'Meadow',
		blurb: 'Grass, sunshine and a picnic blanket.',
		unlock: { kind: 'starter' },
		dark: false,
		tokens: {
			bg: '#e3f1d9',
			bg2: '#fffaf0',
			bg3: '#f1ead8',
			ink: '#22202b',
			inkSoft: '#57525f',
			line: '#2b1f33',
			accent: '#2f6f4f',
			accentInk: '#ffffff',
			good: '#2a7a3a',
			bad: '#b3283c',
			xp: '#4a90e2',
			gp: '#e0a800',
			sky: '#bfe6ff',
			floor: '#d8b98c',
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
			bg: '#141428',
			bg2: '#1f2140',
			bg3: '#2a2d52',
			ink: '#f1eefc',
			inkSoft: '#b8b4d4',
			line: '#08080f',
			accent: '#a596ff',
			accentInk: '#120f2a',
			good: '#7ee08a',
			bad: '#ff8a9a',
			xp: '#7ab8ff',
			gp: '#ffd04a',
			sky: '#26305e',
			floor: '#3b3366',
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
			bg: '#fde8ef',
			bg2: '#fffafc',
			bg3: '#f8e3ea',
			ink: '#3a1f2b',
			inkSoft: '#6b4757',
			line: '#3a1f2b',
			accent: '#b2366a',
			accentInk: '#ffffff',
			good: '#2a7a3a',
			bad: '#b3283c',
			xp: '#e872a6',
			gp: '#e0a800',
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
			bg: '#dff1f7',
			bg2: '#f7fdff',
			bg3: '#e5f3f8',
			ink: '#12313f',
			inkSoft: '#3d5e6d',
			line: '#12313f',
			accent: '#1d6a88',
			accentInk: '#ffffff',
			good: '#1e7a45',
			bad: '#b3283c',
			xp: '#2fa8c9',
			gp: '#e0a800',
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
			bg: '#24130f',
			bg2: '#331c16',
			bg3: '#43261d',
			ink: '#fbeee6',
			inkSoft: '#d8bcae',
			line: '#0f0705',
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
			bg: '#1b1430',
			bg2: '#261d42',
			bg3: '#332858',
			ink: '#f3eeff',
			inkSoft: '#c4b8e8',
			line: '#0a0714',
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
