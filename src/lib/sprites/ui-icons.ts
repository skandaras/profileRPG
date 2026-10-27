/** The pixel icons the interface itself uses, each with its colours. */
import type { Art } from '$lib/content/types';
import * as I from './art/icons';
import type { PaletteSet, Ramp } from './grid';
import { REFERENCE_PALETTE } from '$lib/content/palettes';

const RED: Ramp = ['#9d3f46', '#d9676c', '#f8b0a0'];
const GREEN: Ramp = ['#426647', '#78915c', '#b2c98a'];
const BLUE: Ramp = ['#526970', '#829f9c', '#bed3bb'];
const PURPLE: Ramp = ['#70566f', '#a2809d', '#d4b1c4'];
const MEAT: Ramp = ['#925038', '#c7834e', '#f1bc7e'];
const CREAM: Ramp = ['#b2a77e', '#e5d9ae', '#fff2d3'];
const WOOD: Ramp = ['#704b3b', '#a57650', '#d4ab77'];

const GOLD: Ramp = ['#9b652d', '#d9a84e', '#f7d998'];
const METAL: Ramp = ['#727b7b', '#a6b6b0', '#dde2cc'];

const pal = (over: Partial<PaletteSet>): PaletteSet => ({ ...REFERENCE_PALETTE, secondary: METAL, hair: WOOD, ...over });

export const UI_ICONS = {
	gp: { art: { sprite: I.coin() }, palette: pal({ accent: GOLD }) },
	xp: { art: { sprite: I.star() }, palette: pal({ accent: GOLD }) },
	joy: { art: { sprite: I.heart() }, palette: pal({ primary: RED }) },
	food: { art: { sprite: I.drumstick() }, palette: pal({ skin: MEAT, secondary: CREAM }) },
	tidy: { art: { sprite: I.sparkle() }, palette: pal({ accent: GOLD }) },
	str: { art: { sprite: I.dumbbell() }, palette: pal({}) },
	dex: { art: { sprite: I.feather() }, palette: pal({ primary: GREEN }) },
	int: { art: { sprite: I.bulb() }, palette: pal({ accent: GOLD }) },
	kno: { art: { sprite: I.book() }, palette: pal({ primary: PURPLE, secondary: CREAM }) },
	egg: { art: { sprite: I.egg() }, palette: pal({ secondary: CREAM, primary: GREEN }) },
	chest: { art: { sprite: I.chest() }, palette: pal({ primary: WOOD, accent: GOLD }) },
	map: { art: { sprite: I.map() }, palette: pal({ secondary: CREAM, primary: RED }) },
	shield: { art: { sprite: I.shield() }, palette: pal({ primary: BLUE, accent: GOLD }) },
	flame: { art: { sprite: I.flame() }, palette: pal({ accent: ['#9b5140', '#d99a50', '#f7d998'] }) },
	hourglass: { art: { sprite: I.hourglass() }, palette: pal({ skin: WOOD, accent: GOLD }) },
	paw: { art: { sprite: I.paw() }, palette: pal({ primary: WOOD }) },
	sword: { art: { sprite: I.sword() }, palette: pal({ accent: WOOD }) },
	scroll: { art: { sprite: I.scroll() }, palette: pal({ secondary: CREAM, primary: RED }) },
	bottle: { art: { sprite: I.bottle() }, palette: pal({}) }
} satisfies Record<string, UiIcon>;

export type UiIconName = keyof typeof UI_ICONS;

export interface UiIcon {
	art: Art;
	palette: PaletteSet;
	fixedColors?: boolean;
}

export function uiIconFigure(icon: UiIcon) {
	return { w: 16, h: 16, pivot: 0, layers: [{ z: 0, ...icon }] };
}

// Saved notices retain their text; familiar symbols use the shared pixel art.
const NOTICE_ICONS: Record<string, UiIconName> = {
	'⭐': 'xp', '🌟': 'xp', '🪙': 'gp', '💕': 'joy', '😋': 'food',
	'🎾': 'paw', '🧹': 'tidy', '🐾': 'paw', '🎁': 'chest', '🛡️': 'shield', '🔥': 'flame'
};

export const noticeIcon = (text: string): UiIconName | undefined => NOTICE_ICONS[text];
