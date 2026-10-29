/** Saved cosmetic ids are permanent; retired entries keep metadata but no artwork. */
import * as P from '$lib/sprites/art/pets';
import type { Ramp } from '$lib/sprites/grid';
import type { Art, AvatarConfig, AvatarSlot, Unlock } from './types';

export interface Cosmetic {
	id: string;
	slot: AvatarSlot;
	name: string;
	unlock: Unlock;
	retired?: boolean;
}

const starter: Unlock = { kind: 'starter' };
const level = (n: number): Unlock => ({ kind: 'level', level: n });
const shop = (price: number, lvl?: number): Unlock => ({ kind: 'shop', price, level: lvl });
const drop: Unlock = { kind: 'drop' };

export const COSMETICS: Cosmetic[] = [
	{ id: 'body.human', slot: 'body', name: 'Human', unlock: starter },
	{ id: 'body.elf', slot: 'body', name: 'Elf', unlock: starter, retired: true },
	{ id: 'body.cat', slot: 'body', name: 'Catfolk', unlock: starter, retired: true },
	{ id: 'body.bunny', slot: 'body', name: 'Bunnyfolk', unlock: starter, retired: true },
	{ id: 'face.bright', slot: 'face', name: 'Bright', unlock: starter },
	{ id: 'face.cheery', slot: 'face', name: 'Cheery', unlock: starter, retired: true },
	{ id: 'face.calm', slot: 'face', name: 'Calm', unlock: starter, retired: true },
	{ id: 'face.determined', slot: 'face', name: 'Determined', unlock: starter, retired: true },
	{ id: 'face.sleepy', slot: 'face', name: 'Sleepy', unlock: starter, retired: true },
	{ id: 'face.sparkle', slot: 'face', name: 'Sparkly', unlock: starter, retired: true },
	{ id: 'feature.freckles', slot: 'feature', name: 'Freckles', unlock: starter, retired: true },
	{ id: 'feature.glasses', slot: 'feature', name: 'Glasses', unlock: starter, retired: true },
	{ id: 'feature.bandage', slot: 'feature', name: 'Plaster', unlock: starter, retired: true },
	{ id: 'feature.star', slot: 'feature', name: 'Star mark', unlock: level(4), retired: true },
	{ id: 'hair.short', slot: 'hair', name: 'Short', unlock: starter, retired: true },
	{ id: 'hair.spiky', slot: 'hair', name: 'Spiky', unlock: starter, retired: true },
	{ id: 'hair.bob', slot: 'hair', name: 'Bob', unlock: starter },
	{ id: 'hair.long', slot: 'hair', name: 'Long', unlock: starter, retired: true },
	{ id: 'hair.twintails', slot: 'hair', name: 'Twin tails', unlock: starter, retired: true },
	{ id: 'hair.ponytail', slot: 'hair', name: 'Ponytail', unlock: starter, retired: true },
	{ id: 'hair.bun', slot: 'hair', name: 'Top bun', unlock: starter, retired: true },
	{ id: 'hair.curly', slot: 'hair', name: 'Curly', unlock: starter, retired: true },
	{ id: 'top.tee', slot: 'top', name: 'Collar and shorts', unlock: starter },
	{ id: 'top.hoodie', slot: 'top', name: 'Hood-down jacket', unlock: starter },
	{ id: 'top.tank', slot: 'top', name: 'Tank top', unlock: starter, retired: true },
	{ id: 'top.sweater', slot: 'top', name: 'Jumper and skirt', unlock: starter },
	{ id: 'top.sailor', slot: 'top', name: 'Sailor top', unlock: level(3), retired: true },
	{ id: 'top.tunic', slot: 'top', name: 'Starry overall dress', unlock: starter },
	{ id: 'top.kimono', slot: 'top', name: 'Kimono jacket', unlock: shop(120, 5), retired: true },
	{ id: 'top.vest', slot: 'top', name: 'Explorer vest', unlock: level(6), retired: true },
	{ id: 'bottom.shorts', slot: 'bottom', name: 'Shorts', unlock: starter, retired: true },
	{ id: 'bottom.pants', slot: 'bottom', name: 'Trousers', unlock: starter, retired: true },
	{ id: 'bottom.skirt', slot: 'bottom', name: 'Skirt', unlock: starter, retired: true },
	{ id: 'bottom.overalls', slot: 'bottom', name: 'Overalls', unlock: shop(60), retired: true },
	{ id: 'shoes.sneakers', slot: 'shoes', name: 'Sneakers', unlock: starter, retired: true },
	{ id: 'shoes.sandals', slot: 'shoes', name: 'Sandals', unlock: starter, retired: true },
	{ id: 'shoes.boots', slot: 'shoes', name: 'Trail boots', unlock: level(2), retired: true },
	{ id: 'hat.cap', slot: 'headwear', name: 'Cap', unlock: starter, retired: true },
	{ id: 'hat.beanie', slot: 'headwear', name: 'Beanie', unlock: shop(40), retired: true },
	{ id: 'hat.headband', slot: 'headwear', name: 'Headband', unlock: level(4), retired: true },
	{ id: 'hat.flowers', slot: 'headwear', name: 'Flower crown', unlock: drop, retired: true },
	{ id: 'hat.wizard', slot: 'headwear', name: 'Wizard hat', unlock: drop, retired: true },
	{ id: 'hat.crown', slot: 'headwear', name: 'Crown', unlock: drop, retired: true },
	{ id: 'acc.scarf', slot: 'accessory', name: 'Scarf', unlock: starter, retired: true },
	{ id: 'acc.backpack', slot: 'accessory', name: 'Backpack', unlock: level(3), retired: true },
	{ id: 'acc.sword', slot: 'accessory', name: 'Wooden sword', unlock: level(8), retired: true },
	{ id: 'acc.cape', slot: 'accessory', name: 'Hero cape', unlock: drop, retired: true },
	{ id: 'acc.wings', slot: 'accessory', name: 'Fairy wings', unlock: drop, retired: true },
];

export const OUTFITS = ['top.tee', 'top.sweater', 'top.hoodie', 'top.tunic'].map((id) => COSMETICS.find((c) => c.id === id)!);

/** Optional slots in saved data; only the top selects the rendered outfit. */
export const OPTIONAL_SLOTS: AvatarSlot[] = ['feature', 'headwear', 'accessory'];

export const SLOT_ORDER: AvatarSlot[] = ['body', 'face', 'feature', 'hair', 'top', 'bottom', 'shoes', 'headwear', 'accessory'];

export const DEFAULT_AVATAR: AvatarConfig = {
	parts: {
		body: 'body.human',
		face: 'face.bright',
		hair: 'hair.bob',
		top: 'top.tee',
		bottom: 'bottom.shorts',
		shoes: 'shoes.sneakers'
	},
	colors: {
		skin: 'peach',
		hair: 'chestnut',
		eyes: 'hazel',
		top: 'white',
		bottom: 'navy',
		shoes: 'white',
		headwear: 'yellow',
		accessory: 'purple'
	}
};

export interface PetAccessory {
	id: string;
	name: string;
	unlock: Unlock;
	place: 'head' | 'neck';
	art: Art;
	tint: Ramp;
	accent?: Ramp;
}

const PET_GOLD: Ramp = ['#9b652d', '#d9a84e', '#f7d998'];
const PET_ROSE: Ramp = ['#9d4f57', '#cd7f82', '#f0b4a7'];
const PET_CLAY: Ramp = ['#9b5140', '#cd815b', '#efbc83'];
const PET_MOSS: Ramp = ['#426647', '#78915c', '#b2c98a'];
const PET_SLATE: Ramp = ['#414953', '#687584', '#a6b6ba'];

export const PET_ACCESSORIES_ENABLED: boolean = false;

export const PET_ACCESSORIES: PetAccessory[] = [
	{ id: 'petacc.bow', name: 'Ribbon bow', unlock: shop(25), place: 'head', art: { sprite: P.petBow() }, tint: PET_ROSE, accent: PET_GOLD },
	{ id: 'petacc.bandana', name: 'Bandana', unlock: shop(30), place: 'neck', art: { sprite: P.petBandana() }, tint: PET_CLAY },
	{ id: 'petacc.bell', name: 'Bell collar', unlock: level(4), place: 'neck', art: { sprite: P.petBell() }, tint: PET_MOSS, accent: PET_GOLD },
	{ id: 'petacc.tophat', name: 'Tiny top hat', unlock: shop(80, 5), place: 'head', art: { sprite: P.petTopHat() }, tint: PET_SLATE, accent: PET_ROSE },
	{ id: 'petacc.flower', name: 'Flower', unlock: drop, place: 'head', art: { sprite: P.petFlower() }, tint: PET_ROSE, accent: PET_GOLD },
	{ id: 'petacc.crown', name: 'Tiny crown', unlock: drop, place: 'head', art: { sprite: P.petCrown() }, tint: PET_GOLD, accent: PET_GOLD }
];
