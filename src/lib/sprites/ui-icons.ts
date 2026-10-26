/** The pixel icons the interface itself uses, each with its colours. */
import type { Art } from '$lib/content/types';
import * as I from './art/icons';
import type { PaletteSet, Ramp } from './grid';
import { REFERENCE_PALETTE, ACCENT_GOLD } from '$lib/content/palettes';

const RED: Ramp = ['#9c2939', '#d6455a', '#f2808d'];
const GREEN: Ramp = ['#2d773d', '#4aa85a', '#8ad890'];
const BLUE: Ramp = ['#274a98', '#3f72d0', '#86a8f0'];
const PURPLE: Ramp = ['#582d88', '#8450c0', '#b88ae6'];
const MEAT: Ramp = ['#9a5a30', '#d08a50', '#f2b884'];
const CREAM: Ramp = ['#d8c8a8', '#fff1d6', '#ffffff'];
const WOOD: Ramp = ['#5a3a24', '#8a5a36', '#b88454'];

const pal = (over: Partial<PaletteSet>): PaletteSet => ({ ...REFERENCE_PALETTE, ...over });

export const UI_ICONS = {
	gp: { art: { sprite: I.coin() }, palette: pal({ accent: ACCENT_GOLD }) },
	xp: { art: { sprite: I.star() }, palette: pal({ accent: ACCENT_GOLD }) },
	joy: { art: { sprite: I.heart() }, palette: pal({ primary: RED }) },
	food: { art: { sprite: I.drumstick() }, palette: pal({ skin: MEAT }) },
	tidy: { art: { sprite: I.sparkle() }, palette: pal({ accent: ACCENT_GOLD }) },
	str: { art: { sprite: I.dumbbell() }, palette: pal({}) },
	dex: { art: { sprite: I.feather() }, palette: pal({ primary: GREEN }) },
	int: { art: { sprite: I.bulb() }, palette: pal({ accent: ACCENT_GOLD }) },
	kno: { art: { sprite: I.book() }, palette: pal({ primary: PURPLE }) },
	egg: { art: { sprite: I.egg() }, palette: pal({ secondary: CREAM, primary: GREEN }) },
	chest: { art: { sprite: I.chest() }, palette: pal({ primary: WOOD, accent: ACCENT_GOLD }) },
	map: { art: { sprite: I.map() }, palette: pal({ secondary: CREAM, primary: RED }) },
	shield: { art: { sprite: I.shield() }, palette: pal({ primary: BLUE, accent: ACCENT_GOLD }) },
	flame: { art: { sprite: I.flame() }, palette: pal({ accent: ['#d0451f', '#f5a524', '#ffe27a'] }) },
	hourglass: { art: { sprite: I.hourglass() }, palette: pal({ skin: WOOD, accent: ACCENT_GOLD }) },
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
