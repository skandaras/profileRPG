/** The pixel icons the interface itself uses, each with its colours. */
import type { Art } from '$lib/content/types';
import * as I from './art/icons';
import * as U from './art/ui';
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
	bottle: { art: { sprite: I.bottle() }, palette: pal({ primary: BLUE, secondary: CREAM }) },
	berry: { art: { sprite: I.berry() }, palette: pal({ primary: PURPLE, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	ball: { art: { sprite: I.ball() }, palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	bowl: { art: { sprite: I.bowl() }, palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	house: { art: { sprite: U.house() }, palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	clipboard: { art: { sprite: U.clipboard() }, palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	shirt: { art: { sprite: U.shirt() }, palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	bag: { art: { sprite: U.bag() }, palette: pal({ primary: PURPLE, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	confetti: { art: { sprite: U.confetti() }, palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	gear: { art: { sprite: U.gear() }, palette: pal({ primary: BLUE, secondary: METAL, accent: GOLD, skin: MEAT }) },
	flower: { art: { sprite: U.flower() }, palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT, hair: GREEN }) },
	dojo: { art: { sprite: U.dojo() }, palette: pal({ primary: CREAM, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	pine: { art: { sprite: U.pine() }, palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT, hair: GREEN }) },
	gem: { art: { sprite: U.gem() }, palette: pal({ primary: PURPLE, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	shell: { art: { sprite: U.shell() }, palette: pal({ primary: CREAM, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	tower: { art: { sprite: U.tower() }, palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	dragon: { art: { sprite: U.dragon() }, palette: pal({ primary: MEAT, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	key: { art: { sprite: U.key() }, palette: pal({ primary: GOLD, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	compass: { art: { sprite: U.compass() }, palette: pal({ primary: BLUE, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	runner: { art: { sprite: U.runner() }, palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	walker: { art: { sprite: U.walker() }, palette: pal({ primary: BLUE, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	stretch: { art: { sprite: U.stretch() }, palette: pal({ primary: PURPLE, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	laptop: { art: { sprite: U.laptop() }, palette: pal({ primary: BLUE, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	puzzle: { art: { sprite: U.puzzle() }, palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	newspaper: { art: { sprite: U.newspaper() }, palette: pal({ primary: BLUE, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	palette: { art: { sprite: U.palette() }, palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	speech: { art: { sprite: U.speech() }, palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	bicycle: { art: { sprite: U.bicycle() }, palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	swimmer: { art: { sprite: U.swimmer() }, palette: pal({ primary: BLUE, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	guitar: { art: { sprite: U.guitar() }, palette: pal({ primary: MEAT, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	plant: { art: { sprite: U.plant() }, palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT, hair: GREEN }) },
	writing: { art: { sprite: U.writing() }, palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	phone: { art: { sprite: U.phone() }, palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT, hair: GREEN }) },
	pill: { art: { sprite: U.pill() }, palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	tooth: { art: { sprite: U.tooth() }, palette: pal({ primary: CREAM, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	dog: { art: { sprite: U.dog() }, palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	target: { art: { sprite: U.target() }, palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	brain: { art: { sprite: U.brain() }, palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	repeat: { art: { sprite: U.repeat() }, palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	trophy: { art: { sprite: U.trophy() }, palette: pal({ primary: GOLD, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	rest: { art: { sprite: U.rest() }, palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	broom: { art: { sprite: U.broom() }, palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	check: { art: { sprite: U.check() }, palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	bandage: { art: { sprite: U.bandage() }, palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	lock: { art: { sprite: U.lock() }, palette: pal({ primary: GOLD, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	sun: { art: { sprite: U.sun() }, palette: pal({ primary: GOLD, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	warning: { art: { sprite: U.warning() }, palette: pal({ primary: GOLD, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	undo: { art: { sprite: U.undo() }, palette: pal({ primary: BLUE, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	gift: { art: { sprite: U.gift() }, palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	backpack: { art: { sprite: U.backpack() }, palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	hatch: { art: { sprite: U.hatch() }, palette: pal({ primary: MEAT, secondary: CREAM, accent: GOLD, skin: MEAT }) }
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
