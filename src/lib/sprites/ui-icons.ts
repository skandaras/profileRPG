/** The Garden icons the interface itself uses, each with its colours. */
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
	gp: { art: I.coin(), palette: pal({ accent: GOLD }) },
	xp: { art: I.star(), palette: pal({ primary: GOLD }) },
	joy: { art: I.heart(), palette: pal({ primary: RED }) },
	food: { art: I.drumstick(), palette: pal({ skin: MEAT, secondary: CREAM }) },
	tidy: { art: I.sparkle(), palette: pal({ accent: GOLD }) },
	str: { art: I.dumbbell(), palette: pal({}) },
	dex: { art: I.feather(), palette: pal({ primary: GREEN }) },
	int: { art: I.bulb(), palette: pal({ accent: GOLD }) },
	kno: { art: I.book(), palette: pal({ primary: PURPLE, secondary: CREAM }) },
	egg: { art: I.egg(), palette: pal({ secondary: CREAM, primary: GREEN }) },
	chest: { art: I.chest(), palette: pal({ primary: WOOD, accent: GOLD }) },
	map: { art: I.map(), palette: pal({ secondary: CREAM, primary: RED }) },
	shield: { art: I.shield(), palette: pal({ primary: BLUE, accent: GOLD }) },
	flame: { art: I.flame(), palette: pal({ accent: ['#9b5140', '#d99a50', '#f7d998'] }) },
	hourglass: { art: I.hourglass(), palette: pal({ skin: WOOD, accent: GOLD }) },
	paw: { art: I.paw(), palette: pal({ primary: WOOD }) },
	sword: { art: I.sword(), palette: pal({ accent: WOOD }) },
	scroll: { art: I.scroll(), palette: pal({ secondary: CREAM, primary: RED }) },
	bottle: { art: I.bottle(), palette: pal({ primary: BLUE, secondary: CREAM }) },
	berry: { art: I.berry(), palette: pal({ hair: GREEN, primary: PURPLE, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	ball: { art: I.ball(), palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	bowl: { art: I.bowl(), palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	house: { art: U.house(), palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	clipboard: { art: U.clipboard(), palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	shirt: { art: U.shirt(), palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	bag: { art: U.bag(), palette: pal({ primary: PURPLE, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	confetti: { art: U.confetti(), palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	gear: { art: U.gear(), palette: pal({ primary: BLUE, secondary: METAL, accent: GOLD, skin: MEAT }) },
	flower: { art: U.flower(), palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT, hair: GREEN }) },
	dojo: { art: U.dojo(), palette: pal({ primary: CREAM, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	pine: { art: U.pine(), palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT, hair: GREEN }) },
	gem: { art: U.gem(), palette: pal({ primary: PURPLE, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	shell: { art: U.shell(), palette: pal({ primary: CREAM, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	tower: { art: U.tower(), palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	dragon: { art: U.dragon(), palette: pal({ primary: MEAT, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	key: { art: U.key(), palette: pal({ primary: GOLD, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	compass: { art: U.compass(), palette: pal({ primary: BLUE, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	runner: { art: U.runner(), palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	walker: { art: U.walker(), palette: pal({ primary: BLUE, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	stretch: { art: U.stretch(), palette: pal({ primary: PURPLE, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	laptop: { art: U.laptop(), palette: pal({ primary: BLUE, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	puzzle: { art: U.puzzle(), palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	newspaper: { art: U.newspaper(), palette: pal({ primary: BLUE, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	palette: { art: U.palette(), palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	speech: { art: U.speech(), palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	bicycle: { art: U.bicycle(), palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	swimmer: { art: U.swimmer(), palette: pal({ primary: BLUE, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	guitar: { art: U.guitar(), palette: pal({ primary: MEAT, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	plant: { art: U.plant(), palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT, hair: GREEN }) },
	writing: { art: U.writing(), palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	phone: { art: U.phone(), palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT, hair: GREEN }) },
	pill: { art: U.pill(), palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	tooth: { art: U.tooth(), palette: pal({ primary: CREAM, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	dog: { art: U.dog(), palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	target: { art: U.target(), palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	brain: { art: U.brain(), palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	repeat: { art: U.repeat(), palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	trophy: { art: U.trophy(), palette: pal({ primary: GOLD, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	rest: { art: U.rest(), palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	broom: { art: U.broom(), palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	check: { art: U.check(), palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	bandage: { art: U.bandage(), palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	lock: { art: U.lock(), palette: pal({ primary: GOLD, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	sun: { art: U.sun(), palette: pal({ primary: GOLD, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	warning: { art: U.warning(), palette: pal({ primary: GOLD, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	undo: { art: U.undo(), palette: pal({ primary: BLUE, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	gift: { art: U.gift(), palette: pal({ primary: RED, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	backpack: { art: U.backpack(), palette: pal({ primary: GREEN, secondary: CREAM, accent: GOLD, skin: MEAT }) },
	hatch: { art: U.hatch(), palette: pal({ primary: MEAT, secondary: CREAM, accent: GOLD, skin: MEAT }) }
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
