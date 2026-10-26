/**
 * Shapes shared by every catalogue in this folder.
 *
 * The database stores only ids from these catalogues, never their contents, so
 * renaming an item, retuning a mission or redrawing a sprite is a code change
 * with no migration. An id, once shipped, is forever: a player's inventory row
 * points at it.
 */
import type { Sprite } from '$lib/sprites/grid';

export type StatId = 'str' | 'dex' | 'int' | 'kno';
export type StatBlock = Record<StatId, number>;
export type StatWeights = Partial<Record<StatId, number>>;
export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * How something becomes available. `starter` and `level` are implicit (no
 * inventory row is written); `shop` and `drop` are owned only once an
 * inventory row exists. See owns() in game/ownership.ts.
 */
export type Unlock =
	| { kind: 'starter' }
	| { kind: 'level'; level: number }
	| { kind: 'shop'; price: number; level?: number }
	| { kind: 'drop' };

/**
 * Art for a catalogue entry: a sprite drawn in code, or a PNG under static/.
 * A PNG is drawn with the reference palettes in content/palettes.ts and is
 * recoloured by swapping those exact colours. See docs/ART.md.
 */
export type Art = { sprite: Sprite } | { png: string; w: number; h: number; frames?: number };

export type ModifierKey =
	| 'xp.str'
	| 'xp.dex'
	| 'xp.int'
	| 'xp.kno'
	| 'xp.all'
	| 'gp.all'
	| 'pet.decay'
	| 'pet.xp'
	| 'mission.duration'
	| 'mission.slots'
	| 'mission.success'
	| 'loot.extra'
	| 'streak.shield'
	| 'egg.warmth'
	| 'welcome.gp';

export interface Effect {
	key: ModifierKey;
	value: number;
}

export type AvatarSlot =
	| 'body'
	| 'face'
	| 'feature'
	| 'hair'
	| 'top'
	| 'bottom'
	| 'shoes'
	| 'headwear'
	| 'accessory';

/** Which colour choice tints which part. Clothing slots tint their primary channel. */
export type ColorSlot = 'skin' | 'hair' | 'eyes' | 'top' | 'bottom' | 'shoes' | 'headwear' | 'accessory';

export interface AvatarConfig {
	parts: Partial<Record<AvatarSlot, string>>;
	colors: Partial<Record<ColorSlot, string>>;
}
