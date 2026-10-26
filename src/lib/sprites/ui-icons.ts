/** The pixel icons the interface itself uses, each with its colours. */
import * as I from './art/icons';
import type { PaletteSet, Ramp, Sprite } from './grid';
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
	gp: { sprite: I.coin(), palette: pal({ accent: ACCENT_GOLD }) },
	xp: { sprite: I.star(), palette: pal({ accent: ACCENT_GOLD }) },
	joy: { sprite: I.heart(), palette: pal({ primary: RED }) },
	food: { sprite: I.drumstick(), palette: pal({ skin: MEAT }) },
	tidy: { sprite: I.sparkle(), palette: pal({ accent: ACCENT_GOLD }) },
	str: { sprite: I.dumbbell(), palette: pal({}) },
	dex: { sprite: I.feather(), palette: pal({ primary: GREEN }) },
	int: { sprite: I.bulb(), palette: pal({ accent: ACCENT_GOLD }) },
	kno: { sprite: I.book(), palette: pal({ primary: PURPLE }) },
	egg: { sprite: I.egg(), palette: pal({ secondary: CREAM, primary: GREEN }) },
	chest: { sprite: I.chest(), palette: pal({ primary: WOOD, accent: ACCENT_GOLD }) },
	map: { sprite: I.map(), palette: pal({ secondary: CREAM, primary: RED }) },
	shield: { sprite: I.shield(), palette: pal({ primary: BLUE, accent: ACCENT_GOLD }) },
	flame: { sprite: I.flame(), palette: pal({ accent: ['#d0451f', '#f5a524', '#ffe27a'] }) },
	hourglass: { sprite: I.hourglass(), palette: pal({ skin: WOOD, accent: ACCENT_GOLD }) },
	paw: { sprite: I.paw(), palette: pal({ primary: WOOD }) },
	sword: { sprite: I.sword(), palette: pal({ accent: WOOD }) },
	scroll: { sprite: I.scroll(), palette: pal({ secondary: CREAM, primary: RED }) },
	bottle: { sprite: I.bottle(), palette: pal({}) }
} satisfies Record<string, { sprite: Sprite; palette: PaletteSet }>;

export type UiIconName = keyof typeof UI_ICONS;
