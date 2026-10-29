import { and, eq, sql } from 'drizzle-orm';
import { PET_ACCESSORIES_ENABLED } from '$lib/content/cosmetics';
import { getItem } from '$lib/content';
import { canBuy, isUnlocked } from '$lib/game/ownership';
import type { DbOrTx } from '../db';
import { inventory, players } from '../db/schema';
import { GameError, notify, type Ctx } from '../events';

/** A drop of something already owned turns into coins instead. */
export const DUPLICATE_GP = 10;

export function inventoryOf(db: DbOrTx, userId: string): Map<string, number> {
	const rows = db.select().from(inventory).where(eq(inventory.userId, userId)).all();
	return new Map(rows.filter((r) => r.qty > 0).map((r) => [r.itemId, r.qty]));
}

export function owns(db: DbOrTx, userId: string, level: number, itemId: string): boolean {
	const item = getItem(itemId);
	if (!item) return false;
	const row = db
		.select({ qty: inventory.qty })
		.from(inventory)
		.where(and(eq(inventory.userId, userId), eq(inventory.itemId, itemId)))
		.get();
	return isUnlocked(item.unlock, level, (row?.qty ?? 0) > 0);
}

/** Add to the bag. Returns false (and pays out GP) if a non-stackable item was already owned. */
export function addItem(ctx: Ctx, itemId: string, qty = 1, announce = true): boolean {
	const item = getItem(itemId);
	if (!item) throw new GameError(`Unknown item ${itemId}`);
	if (!PET_ACCESSORIES_ENABLED && item.kind === 'petacc') announce = false;
	const existing = ctx.tx
		.select({ qty: inventory.qty })
		.from(inventory)
		.where(and(eq(inventory.userId, ctx.userId), eq(inventory.itemId, itemId)))
		.get();
	if (!item.stackable && (existing?.qty ?? 0) > 0) {
		ctx.tx.update(players).set({ gp: sql`${players.gp} + ${DUPLICATE_GP}` }).where(eq(players.userId, ctx.userId)).run();
		if (announce) notify(ctx, 'gp', `Another ${item.name}! Traded for ${DUPLICATE_GP} GP`, '🪙');
		return false;
	}
	const add = item.stackable ? qty : 1;
	ctx.tx
		.insert(inventory)
		.values({ userId: ctx.userId, itemId, qty: add, acquiredAt: ctx.now })
		.onConflictDoUpdate({ target: [inventory.userId, inventory.itemId], set: { qty: sql`${inventory.qty} + ${add}` } })
		.run();
	if (announce) notify(ctx, 'item', add > 1 ? `Found ${item.name} ×${add}` : `Found ${item.name}`, '🎁');
	return true;
}

export function consume(ctx: Ctx, itemId: string, qty = 1): boolean {
	const res = ctx.tx
		.update(inventory)
		.set({ qty: sql`${inventory.qty} - ${qty}` })
		.where(and(eq(inventory.userId, ctx.userId), eq(inventory.itemId, itemId), sql`${inventory.qty} >= ${qty}`))
		.run();
	return res.changes > 0;
}

export function buy(ctx: Ctx, itemId: string, qty = 1) {
	const item = getItem(itemId);
	if (!item || item.retired || (!PET_ACCESSORIES_ENABLED && item.kind === 'petacc')) throw new GameError('That is not in the shop');
	const player = ctx.tx.select().from(players).where(eq(players.userId, ctx.userId)).get()!;
	const count = item.stackable ? Math.max(1, Math.min(20, Math.floor(qty))) : 1;
	const owned = !item.stackable && owns(ctx.tx, ctx.userId, player.level, itemId);
	if (item.unlock.kind !== 'shop') throw new GameError('Not for sale');
	const price = item.unlock.price * count;
	const check = canBuy(item.unlock, player.level, owned, player.gp);
	if (!check.ok) throw new GameError(check.reason);
	if (player.gp < price) throw new GameError('Not enough GP');
	ctx.tx.update(players).set({ gp: player.gp - price }).where(eq(players.userId, ctx.userId)).run();
	addItem(ctx, itemId, count, false);
	notify(ctx, 'item', count > 1 ? `Bought ${item.name} ×${count}` : `Bought ${item.name}`, '🛍️');
}
