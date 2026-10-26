/**
 * The game's event bus.
 *
 * A feature that reacts to something happening (an activity logged, a level
 * gained) registers a handler here instead of being called by name, so adding
 * achievements or a party quest later is a new module and one line in
 * modules/index.ts, with nothing else edited. Handlers run synchronously inside
 * the action's SQLite transaction: if one throws, the whole action rolls back.
 */
import type { StatBlock, StatWeights } from '$lib/content/types';
import type { Tier } from '$lib/game/missions';
import type { TickEffects } from './db/schema';
import type { Tx } from './db';

export interface Notice {
	kind: 'xp' | 'gp' | 'level' | 'stat' | 'pet' | 'egg' | 'item' | 'info' | 'warn';
	text: string;
	icon?: string;
}

export interface Ctx {
	tx: Tx;
	userId: string;
	now: number;
	/** Today in the player's own calendar (see game/schedule.ts). */
	today: number;
	notices: Notice[];
}

export interface ActivityReward {
	xp: number;
	gp: number;
	statXp: Partial<StatBlock>;
}

export type GameEvent =
	| {
			type: 'activity.logged';
			habitId: string;
			weights: StatWeights;
			reward: ActivityReward;
			/** Handlers record what they handed out under their own key, for undo. */
			effects: TickEffects;
	  }
	| { type: 'activity.undone'; habitId: string; effects: TickEffects }
	| { type: 'level.up'; level: number }
	| { type: 'mission.claimed'; missionId: string; tier: Tier }
	| { type: 'pet.hatched'; petId: string; speciesId: string };

type Of<K extends GameEvent['type']> = Extract<GameEvent, { type: K }>;
type Handler<K extends GameEvent['type']> = (ctx: Ctx, event: Of<K>) => void;

type AnyHandler = (ctx: Ctx, event: GameEvent) => void;
const handlers = new Map<GameEvent['type'], AnyHandler[]>();

export function on<K extends GameEvent['type']>(type: K, handler: Handler<K>) {
	const list = handlers.get(type) ?? [];
	list.push(handler as unknown as AnyHandler);
	handlers.set(type, list);
}

export function emit<K extends GameEvent['type']>(ctx: Ctx, event: Of<K>) {
	for (const h of handlers.get(event.type) ?? []) h(ctx, event);
}

export function notify(ctx: Ctx, kind: Notice['kind'], text: string, icon?: string) {
	ctx.notices.push({ kind, text, icon });
}

/** Thrown for a refusal the player should read ("Not enough GP"), answered as 400. */
export class GameError extends Error {}
/** Thrown for something that does not exist or is not yours, answered as 404. */
export class NotFound extends Error {}
