import { describe, expect, it } from 'vitest';
import { ABILITIES } from './abilities';
import { COSMETICS, DEFAULT_AVATAR, PET_ACCESSORIES } from './cosmetics';
import { HABIT_TEMPLATES } from './habits';
import { allItems, getAbility, getCosmetic, getItem, getSpecies } from './index';
import { MISSIONS } from './missions';
import { SPECIES, STARTERS } from './pets';
import { RETURN_MILESTONES } from '$lib/game/welcome';

/**
 * Catalogue integrity. Ids are stored in the database, so a duplicate or a
 * dangling reference is a bug that would otherwise surface on someone's phone.
 */
describe('catalogues', () => {
	it('has unique ids across every item kind', () => {
		const ids = allItems().map((i) => i.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('resolves every mission drop', () => {
		for (const m of MISSIONS) {
			expect(m.loot.length, m.id).toBeGreaterThan(0);
			for (const e of m.loot) {
				expect(e.weight, m.id).toBeGreaterThan(0);
				if ('item' in e) expect(getItem(e.item), `${m.id} → ${e.item}`).toBeDefined();
				if ('egg' in e) expect(getSpecies(e.egg), `${m.id} → ${e.egg}`).toBeDefined();
			}
		}
	});

	it('only drops what is marked as a drop or bought in a shop', () => {
		for (const m of MISSIONS) {
			for (const e of m.loot) {
				if (!('item' in e)) continue;
				const kind = getItem(e.item)!.unlock.kind;
				expect(['drop', 'shop'], `${m.id} → ${e.item}`).toContain(kind);
			}
		}
	});

	it('gives every drop-only item at least one way to be found', () => {
		const dropped = new Set(MISSIONS.flatMap((m) => m.loot.flatMap((e) => ('item' in e ? [e.item] : []))));
		for (const g of Object.values(RETURN_MILESTONES)) dropped.add(g.item);
		dropped.add('food.berry'); // the daily forage
		for (const item of allItems()) {
			if (item.unlock.kind === 'drop') expect(dropped.has(item.id), item.id).toBe(true);
		}
	});

	it('makes every non-starter species findable as an egg', () => {
		const eggs = new Set(MISSIONS.flatMap((m) => m.loot.flatMap((e) => ('egg' in e ? [e.egg] : []))));
		for (const s of SPECIES.filter((s) => !s.starter)) expect(eggs.has(s.id), s.id).toBe(true);
		expect(STARTERS).toHaveLength(3);
	});

	it('keeps ability prerequisites reachable', () => {
		for (const a of ABILITIES) {
			for (const r of a.requires ?? []) {
				const req = getAbility(r);
				expect(req, `${a.id} requires ${r}`).toBeDefined();
				expect(req!.minLevel).toBeLessThanOrEqual(a.minLevel);
			}
		}
	});

	it('builds the default avatar from starter parts', () => {
		for (const id of Object.values(DEFAULT_AVATAR.parts)) {
			expect(getCosmetic(id!)?.unlock.kind, id).toBe('starter');
		}
	});

	it('draws every cosmetic on the avatar frame', () => {
		for (const c of COSMETICS) {
			for (const l of c.layers) {
				if ('sprite' in l.art) {
					expect(l.art.sprite.w, c.id).toBe(32);
					expect(l.art.sprite.h, c.id).toBe(40);
				}
			}
		}
		expect(PET_ACCESSORIES.length).toBeGreaterThan(0);
	});

	it('gives every template sensible weights', () => {
		for (const t of HABIT_TEMPLATES) {
			const sum = Object.values(t.weights).reduce((n, v) => n + (v ?? 0), 0);
			expect(sum, t.id).toBeCloseTo(1);
		}
	});
});
