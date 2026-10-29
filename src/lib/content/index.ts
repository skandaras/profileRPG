/**
 * One lookup surface over every catalogue. The inventory table stores ids from
 * several catalogues side by side, so "what is item X?" is answered here.
 */
import type { Ramp } from '$lib/sprites/grid';
import { ABILITIES, type Ability } from './abilities';
import { COSMETICS, PET_ACCESSORIES, type Cosmetic, type PetAccessory } from './cosmetics';
import { HABIT_TEMPLATES, type HabitTemplate } from './habits';
import { CONSUMABLES, type Consumable } from './items';
import { MISSIONS, type Mission } from './missions';
import { DYES, type Dye } from './palettes';
import { SPECIES, type Species } from './pets';
import { THEMES, type Theme } from './themes';
import type { AvatarSlot, Unlock } from './types';

export type ItemKind = 'food' | 'toy' | 'cosmetic' | 'dye' | 'theme' | 'petacc';

export interface ItemInfo {
	id: string;
	name: string;
	kind: ItemKind;
	unlock: Unlock;
	blurb?: string;
	slot?: AvatarSlot;
	tint?: Ramp;
	/** Stackable items can be held in quantity; everything else is owned once. */
	stackable: boolean;
	retired?: boolean;
}

const index = <T extends { id: string }>(list: T[]) => new Map(list.map((x) => [x.id, x]));

const cosmetics = index(COSMETICS);
const petAccessories = index(PET_ACCESSORIES);
const consumables = index(CONSUMABLES);
const species = index(SPECIES);
const missions = index(MISSIONS);
const abilities = index(ABILITIES);
const templates = index(HABIT_TEMPLATES);
const themes = index(THEMES);

export const dyeItemId = (id: string) => `dye.${id}`;
export const themeItemId = (id: string) => `theme.${id}`;

const ITEMS: ItemInfo[] = [
	...CONSUMABLES.map((c) => ({
		id: c.id,
		name: c.name,
		kind: c.kind,
		unlock: c.unlock,
		blurb: c.blurb,
		tint: c.tint,
		stackable: c.kind === 'food'
	})),
	...COSMETICS.map((c) => ({ id: c.id, name: c.name, kind: 'cosmetic' as const, unlock: c.unlock, slot: c.slot, retired: c.retired, stackable: false })),
	...DYES.map((d: Dye) => ({
		id: dyeItemId(d.id),
		name: `${d.name} dye`,
		kind: 'dye' as const,
		retired: d.retired,
		unlock: d.unlock,
		tint: d.ramp,
		blurb: 'A new colour for your clothes.',
		stackable: false
	})),
	...THEMES.map((t) => ({ id: themeItemId(t.id), name: `${t.name} theme`, kind: 'theme' as const, unlock: t.unlock, blurb: t.blurb, stackable: false })),
	...PET_ACCESSORIES.map((a) => ({ id: a.id, name: a.name, kind: 'petacc' as const, unlock: a.unlock, tint: a.tint, stackable: false }))
];
const items = index(ITEMS);

export const allItems = () => ITEMS;
export const getItem = (id: string): ItemInfo | undefined => items.get(id);
export const getCosmetic = (id: string): Cosmetic | undefined => cosmetics.get(id);
export const getPetAccessory = (id: string): PetAccessory | undefined => petAccessories.get(id);
export const getConsumable = (id: string): Consumable | undefined => consumables.get(id);
export const getSpecies = (id: string): Species | undefined => species.get(id);
export const getMission = (id: string): Mission | undefined => missions.get(id);
export const getAbility = (id: string): Ability | undefined => abilities.get(id);
export const getTemplate = (id: string): HabitTemplate | undefined => templates.get(id);
export const getTheme = (id: string): Theme | undefined => themes.get(id);

/** Only active items appear in shop and unlock surfaces. Inventory lookups include retired ids. */
export const availableItems = () => ITEMS.filter((item) => !item.retired);
