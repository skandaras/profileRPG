/**
 * Everything the avatar can wear, and the pets' accessories.
 *
 * Add a part by adding an entry: give it an id under its slot's prefix, an
 * unlock, and its layers. A layer with `png` instead of `sprite` loads art from
 * static/sprites (see docs/ART.md); nothing else needs to change.
 */
import * as A from '$lib/sprites/art/avatar';
import * as P from '$lib/sprites/art/pets';
import { Z } from '$lib/sprites/frames';
import type { Ramp } from '$lib/sprites/grid';
import { ACCENT_RUBY, ACCENT_SILVER, DYES, WHITE_RAMP } from './palettes';
import type { Art, AvatarConfig, AvatarSlot, Unlock } from './types';

export interface CosmeticLayer {
	z: number;
	art: Art;
}

export interface Cosmetic {
	id: string;
	slot: AvatarSlot;
	name: string;
	unlock: Unlock;
	layers: CosmeticLayer[];
	/** Closed hats hide hair above their brim, including buns and rear layers. */
	coversHairAbove?: number;
	/** Fixed colours for the channels the player does not choose. */
	secondary?: Ramp;
	accent?: Ramp;
}

const starter: Unlock = { kind: 'starter' };
const level = (n: number): Unlock => ({ kind: 'level', level: n });
const shop = (price: number, lvl?: number): Unlock => ({ kind: 'shop', price, level: lvl });
const drop: Unlock = { kind: 'drop' };

const layer = (z: number, draw: () => import('$lib/sprites/grid').Sprite): CosmeticLayer => ({
	z,
	art: { sprite: draw() }
});

export const COSMETICS: Cosmetic[] = [
	// bodies
	{ id: 'body.human', slot: 'body', name: 'Human', unlock: starter, layers: [layer(Z.body, A.bodyHuman)] },
	{ id: 'body.elf', slot: 'body', name: 'Elf', unlock: starter, layers: [layer(Z.body, A.bodyElf)] },
	{
		id: 'body.cat',
		slot: 'body',
		name: 'Catfolk',
		unlock: starter,
		layers: [layer(Z.tail, A.catTail), layer(Z.body, A.bodyBeast), layer(Z.ears, A.catEars)]
	},
	{
		id: 'body.bunny',
		slot: 'body',
		name: 'Bunnyfolk',
		unlock: starter,
		layers: [layer(Z.body, A.bodyBeast), layer(Z.ears, A.bunnyEars)]
	},

	// faces
	{ id: 'face.bright', slot: 'face', name: 'Bright', unlock: starter, layers: [layer(Z.face, A.faceBright)] },
	{ id: 'face.cheery', slot: 'face', name: 'Cheery', unlock: starter, layers: [layer(Z.face, A.faceCheery)] },
	{ id: 'face.calm', slot: 'face', name: 'Calm', unlock: starter, layers: [layer(Z.face, A.faceCalm)] },
	{ id: 'face.determined', slot: 'face', name: 'Determined', unlock: starter, layers: [layer(Z.face, A.faceDetermined)] },
	{ id: 'face.sleepy', slot: 'face', name: 'Sleepy', unlock: starter, layers: [layer(Z.face, A.faceSleepy)] },
	{ id: 'face.sparkle', slot: 'face', name: 'Sparkly', unlock: starter, layers: [layer(Z.face, A.faceSparkle)] },

	// features
	{ id: 'feature.freckles', slot: 'feature', name: 'Freckles', unlock: starter, layers: [layer(Z.feature, A.featureFreckles)] },
	{ id: 'feature.glasses', slot: 'feature', name: 'Glasses', unlock: starter, layers: [layer(Z.feature, A.featureGlasses)] },
	{ id: 'feature.bandage', slot: 'feature', name: 'Plaster', unlock: starter, layers: [layer(Z.feature, A.featureBandage)] },
	{ id: 'feature.star', slot: 'feature', name: 'Star mark', unlock: level(4), layers: [layer(Z.feature, A.featureStar)] },

	// hair
	{ id: 'hair.short', slot: 'hair', name: 'Short', unlock: starter, layers: [layer(Z.back, A.hairShortBack), layer(Z.hair, A.hairShort)] },
	{ id: 'hair.spiky', slot: 'hair', name: 'Spiky', unlock: starter, layers: [layer(Z.back, A.hairSpikyBack), layer(Z.hair, A.hairSpiky)] },
	{ id: 'hair.bob', slot: 'hair', name: 'Curled bob', unlock: starter, layers: [layer(Z.back, A.hairBobBack), layer(Z.hair, A.hairBob)] },
	{
		id: 'hair.long',
		slot: 'hair',
		name: 'Long',
		unlock: starter,
		layers: [layer(Z.back, A.hairLongBack), layer(Z.hair, A.hairLongFront)]
	},
	{
		id: 'hair.twintails',
		slot: 'hair',
		name: 'Twin tails',
		unlock: starter,
		accent: ACCENT_RUBY,
		layers: [layer(Z.back, A.hairTwinTailsBack), layer(Z.hair, A.hairTwinTails)]
	},
	{
		id: 'hair.ponytail',
		slot: 'hair',
		name: 'Ponytail',
		unlock: starter,
		accent: ACCENT_RUBY,
		layers: [layer(Z.back, A.hairPonytailBack), layer(Z.hair, A.hairPonytail)]
	},
	{ id: 'hair.bun', slot: 'hair', name: 'Top bun', unlock: starter, layers: [layer(Z.back, A.hairBunBack), layer(Z.hair, A.hairBun)] },
	{ id: 'hair.curly', slot: 'hair', name: 'Curly', unlock: starter, layers: [layer(Z.back, A.hairCurlyBack), layer(Z.hair, A.hairCurly)] },

	// tops
	{ id: 'top.tee', slot: 'top', name: 'Collared blouse', unlock: starter, layers: [layer(Z.top, A.topTee)] },
	{ id: 'top.hoodie', slot: 'top', name: 'Hoodie', unlock: starter, layers: [layer(Z.top, A.topHoodie)] },
	{ id: 'top.tank', slot: 'top', name: 'Tank top', unlock: starter, layers: [layer(Z.top, A.topTank)] },
	{ id: 'top.sweater', slot: 'top', name: 'Sweater', unlock: starter, layers: [layer(Z.top, A.topSweater)] },
	{
		id: 'top.sailor',
		slot: 'top',
		name: 'Sailor top',
		unlock: level(3),
		accent: ACCENT_RUBY,
		layers: [layer(Z.top, A.topSailor)]
	},
	{ id: 'top.tunic', slot: 'top', name: 'Adventurer tunic', unlock: drop, layers: [layer(Z.top, A.topTunic)] },
	{ id: 'top.kimono', slot: 'top', name: 'Kimono jacket', unlock: shop(120, 5), layers: [layer(Z.top, A.topKimono)] },
	{
		id: 'top.vest',
		slot: 'top',
		name: 'Explorer vest',
		unlock: level(6),
		secondary: WHITE_RAMP,
		layers: [layer(Z.top, A.topVest)]
	},

	// bottoms
	{ id: 'bottom.shorts', slot: 'bottom', name: 'Shorts', unlock: starter, layers: [layer(Z.bottom, A.bottomShorts)] },
	{ id: 'bottom.pants', slot: 'bottom', name: 'Trousers', unlock: starter, layers: [layer(Z.bottom, A.bottomPants)] },
	{ id: 'bottom.skirt', slot: 'bottom', name: 'Skirt', unlock: starter, layers: [layer(Z.bottom, A.bottomSkirt)] },
	{ id: 'bottom.overalls', slot: 'bottom', name: 'Overalls', unlock: shop(60), layers: [layer(Z.bottom, A.bottomOveralls), layer(Z.neck, A.bottomOverallBib)] },

	// shoes
	{ id: 'shoes.sneakers', slot: 'shoes', name: 'Sneakers', unlock: starter, layers: [layer(Z.shoes, A.shoesSneakers)] },
	{ id: 'shoes.sandals', slot: 'shoes', name: 'Sandals', unlock: starter, layers: [layer(Z.shoes, A.shoesSandals)] },
	{ id: 'shoes.boots', slot: 'shoes', name: 'Trail boots', unlock: level(2), layers: [layer(Z.shoes, A.shoesBoots)] },

	// headwear
	{ id: 'hat.cap', slot: 'headwear', coversHairAbove: 14, name: 'Cap', unlock: starter, layers: [layer(Z.headwear, A.hatCap)] },
	{ id: 'hat.beanie', slot: 'headwear', coversHairAbove: 15, name: 'Beanie', unlock: shop(40), layers: [layer(Z.headwear, A.hatBeanie)] },
	{ id: 'hat.headband', slot: 'headwear', name: 'Headband', unlock: level(4), layers: [layer(Z.headwear, A.hatHeadband)] },
	{
		id: 'hat.flowers',
		slot: 'headwear',
		name: 'Flower crown',
		unlock: drop,
		layers: [layer(Z.headwear, A.hatFlowers)]
	},
	{ id: 'hat.wizard', slot: 'headwear', coversHairAbove: 14, name: 'Wizard hat', unlock: drop, layers: [layer(Z.headwear, A.hatWizard)] },
	{ id: 'hat.crown', slot: 'headwear', name: 'Crown', unlock: drop, layers: [layer(Z.headwear, A.hatCrown)] },

	// accessories
	{ id: 'acc.scarf', slot: 'accessory', name: 'Scarf', unlock: starter, layers: [layer(Z.neck, A.accScarf)] },
	{
		id: 'acc.backpack',
		slot: 'accessory',
		name: 'Backpack',
		unlock: level(3),
		layers: [layer(Z.back, A.accBackpack), layer(Z.neck, A.accBackpackStraps)]
	},
	{ id: 'acc.sword', slot: 'accessory', name: 'Wooden sword', unlock: level(8), accent: ACCENT_SILVER, layers: [layer(Z.held, A.accSword)] },
	{ id: 'acc.cape', slot: 'accessory', name: 'Hero cape', unlock: drop, layers: [layer(Z.back, A.accCape)] },
	{
		id: 'acc.wings',
		slot: 'accessory',
		name: 'Fairy wings',
		unlock: drop,
		secondary: DYES.find((d) => d.id === 'white')!.ramp,
		layers: [layer(Z.back, A.accWings)]
	}
];

/** Slots that can be left empty. Body, face, hair, top, bottom and shoes always show. */
export const OPTIONAL_SLOTS: AvatarSlot[] = ['feature', 'headwear', 'accessory'];

export const SLOT_ORDER: AvatarSlot[] = ['body', 'face', 'feature', 'hair', 'top', 'bottom', 'shoes', 'headwear', 'accessory'];

export const SLOT_NAMES: Record<AvatarSlot, string> = {
	body: 'Body',
	face: 'Face',
	feature: 'Feature',
	hair: 'Hair',
	top: 'Top',
	bottom: 'Bottom',
	shoes: 'Shoes',
	headwear: 'Hat',
	accessory: 'Accessory'
};

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
