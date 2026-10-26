/**
 * Pets: the companion's needs and care, the nest, eggs and hatching.
 *
 * Needs are stored as a snapshot plus the time it was taken (see
 * game/pet-needs.ts). Anything that changes a need first reads the current
 * value, applies the change, and stores a fresh snapshot.
 */
import { randomUUID } from 'node:crypto';
import { and, eq, isNull } from 'drizzle-orm';
import { getConsumable, getPetAccessory, getSpecies } from '$lib/content';
import { mod, type Modifiers } from '$lib/game/modifiers';
import { normalizeWeights } from '$lib/game/stats';
import {
	addPetXp,
	CARE,
	clampNeeds,
	companionShare,
	cooldownLeft,
	isHappy,
	mood,
	needsAt,
	stageFor,
	WARMTH_NEEDED,
	WARMTH_PER_ACTIVITY,
	type Needs
} from '$lib/game/pet-needs';
import type { DbOrTx } from '../db';
import { inventory, missionRuns, pets, players } from '../db/schema';
import { emit, GameError, NotFound, notify, on, type Ctx } from '../events';
import { post } from './feed';
import { addItem, consume, owns } from './inventory';
import { playerModifiers, playerRow } from './progression';

type PetRow = typeof pets.$inferSelect;

export function currentNeeds(pet: PetRow, now: number, mods: Modifiers, resting: boolean): Needs {
	return needsAt(pet, pet.needsAt, now, mod(mods, 'pet.decay'), resting);
}

function storeNeeds(ctx: Ctx, pet: PetRow, needs: Needs, extra: Partial<PetRow> = {}) {
	const n = clampNeeds(needs);
	ctx.tx
		.update(pets)
		.set({ ...n, needsAt: ctx.now, ...extra })
		.where(eq(pets.id, pet.id))
		.run();
}

function awayPetIds(db: DbOrTx, userId: string): Set<string> {
	const rows = db
		.select({ petId: missionRuns.petId })
		.from(missionRuns)
		.where(and(eq(missionRuns.userId, userId), isNull(missionRuns.claimedAt)))
		.all();
	return new Set(rows.map((r) => r.petId).filter((x): x is string => !!x));
}

export function petView(pet: PetRow, now: number, mods: Modifiers, resting: boolean, away: Set<string>) {
	const species = getSpecies(pet.speciesId);
	const needs = currentNeeds(pet, now, mods, resting);
	return {
		id: pet.id,
		name: pet.name,
		speciesId: pet.speciesId,
		speciesName: species?.name ?? pet.speciesId,
		affinity: species?.affinity ?? [],
		stage: pet.stage,
		level: pet.level,
		xp: pet.xp,
		accessoryId: pet.accessoryId,
		active: pet.active,
		away: away.has(pet.id),
		needs: { fullness: Math.round(needs.fullness), joy: Math.round(needs.joy), tidiness: Math.round(needs.tidiness) },
		mood: mood(needs),
		warmth: pet.warmth,
		warmthNeeded: pet.warmthNeeded,
		cooldowns: {
			pat: cooldownLeft(pet.lastPatAt, CARE.pat.cooldownMs, now),
			play: cooldownLeft(pet.lastPlayAt, CARE.play.cooldownMs, now),
			tidy: cooldownLeft(pet.lastTidyAt, CARE.tidy.cooldownMs, now)
		}
	};
}
export type PetView = ReturnType<typeof petView>;

export function listPets(db: DbOrTx, userId: string, now: number): PetView[] {
	const p = playerRow(db, userId);
	const mods = playerModifiers(db, userId);
	const away = awayPetIds(db, userId);
	return db
		.select()
		.from(pets)
		.where(eq(pets.userId, userId))
		.all()
		.map((pet) => petView(pet, now, mods, p.resting, away))
		.sort((a, b) => Number(b.active) - Number(a.active) || Number(a.stage === 'egg') - Number(b.stage === 'egg'));
}

export function companionRow(db: DbOrTx, userId: string): PetRow | undefined {
	return db
		.select()
		.from(pets)
		.where(and(eq(pets.userId, userId), eq(pets.active, true)))
		.get();
}

export function companionIsHappy(db: DbOrTx, userId: string, now: number): boolean {
	const pet = companionRow(db, userId);
	if (!pet || pet.stage === 'egg') return false;
	const p = playerRow(db, userId);
	return isHappy(currentNeeds(pet, now, playerModifiers(db, userId), p.resting));
}

function ownPet(ctx: Ctx, petId: string): PetRow {
	const pet = ctx.tx
		.select()
		.from(pets)
		.where(and(eq(pets.id, petId), eq(pets.userId, ctx.userId)))
		.get();
	if (!pet) throw new NotFound('No such pet');
	return pet;
}

function carePet(ctx: Ctx, petId: string): { pet: PetRow; needs: Needs } {
	const pet = ownPet(ctx, petId);
	if (pet.stage === 'egg') throw new GameError('Eggs just need warmth. Log activities to warm them');
	if (awayPetIds(ctx.tx, ctx.userId).has(pet.id)) throw new GameError(`${pet.name} is away on a mission`);
	const p = playerRow(ctx.tx, ctx.userId);
	return { pet, needs: currentNeeds(pet, ctx.now, playerModifiers(ctx.tx, ctx.userId), p.resting) };
}

export function givePetXp(ctx: Ctx, pet: PetRow, amount: number) {
	if (amount <= 0 || pet.stage === 'egg') return;
	const r = addPetXp(pet.level, pet.xp, amount);
	const stage = stageFor(r.level);
	ctx.tx.update(pets).set({ level: r.level, xp: r.xp, stage }).where(eq(pets.id, pet.id)).run();
	if (r.level > pet.level) notify(ctx, 'pet', `${pet.name} grew to level ${r.level}`, '🐾');
	if (r.grew) {
		notify(ctx, 'pet', `${pet.name} evolved into a ${stage}!`, '🌟');
		const hero = playerRow(ctx.tx, ctx.userId).heroName;
		post(ctx, 'evolved', `${hero}'s ${pet.name} grew into a ${stage}`, '🌟');
	}
}

export function feed(ctx: Ctx, petId: string, itemId: string) {
	const { pet, needs } = carePet(ctx, petId);
	const food = getConsumable(itemId);
	if (!food || food.kind !== 'food') throw new GameError('That is not food');
	if (!consume(ctx, itemId)) throw new GameError(`You have no ${food.name} left`);
	storeNeeds(ctx, pet, {
		fullness: needs.fullness + (food.effect.fullness ?? 0),
		joy: needs.joy + (food.effect.joy ?? 0),
		tidiness: needs.tidiness
	});
	notify(ctx, 'pet', `${pet.name} enjoyed the ${food.name.toLowerCase()}`, '😋');
	givePetXp(ctx, ownPet(ctx, petId), Math.round((food.effect.petXp ?? 0) * (1 + mod(playerModifiers(ctx.tx, ctx.userId), 'pet.xp'))));
}

export function pat(ctx: Ctx, petId: string) {
	const { pet, needs } = carePet(ctx, petId);
	if (cooldownLeft(pet.lastPatAt, CARE.pat.cooldownMs, ctx.now) > 0) throw new GameError(`${pet.name} is still glowing from the last one`);
	storeNeeds(ctx, pet, { ...needs, joy: needs.joy + CARE.pat.joy }, { lastPatAt: ctx.now });
	notify(ctx, 'pet', `${pet.name} leans into the pat`, '💕');
	givePetXp(ctx, ownPet(ctx, petId), CARE.pat.petXp);
}

/** Play is free on a cooldown; the best toy owned makes it count for more. */
export function play(ctx: Ctx, petId: string) {
	const { pet, needs } = carePet(ctx, petId);
	if (cooldownLeft(pet.lastPlayAt, CARE.play.cooldownMs, ctx.now) > 0) throw new GameError(`${pet.name} is worn out. Try again later`);
	const level = playerRow(ctx.tx, ctx.userId).level;
	const toys = ['toy.plush', 'toy.yarn', 'toy.ball'].map((id) => getConsumable(id)!).filter((t) => owns(ctx.tx, ctx.userId, level, t.id));
	const toy = toys[0];
	storeNeeds(
		ctx,
		pet,
		{ ...needs, joy: needs.joy + CARE.play.joy + (toy?.effect.joy ?? 0), fullness: needs.fullness + CARE.play.fullness },
		{ lastPlayAt: ctx.now }
	);
	notify(ctx, 'pet', toy ? `${pet.name} plays with the ${toy.name.toLowerCase()}` : `${pet.name} chases you around`, '🎾');
	givePetXp(ctx, ownPet(ctx, petId), CARE.play.petXp + (toy?.effect.petXp ?? 0));
}

export function tidy(ctx: Ctx, petId: string) {
	const { pet, needs } = carePet(ctx, petId);
	if (cooldownLeft(pet.lastTidyAt, CARE.tidy.cooldownMs, ctx.now) > 0) throw new GameError('The room is already spotless');
	storeNeeds(ctx, pet, { ...needs, tidiness: needs.tidiness + CARE.tidy.tidiness }, { lastTidyAt: ctx.now });
	notify(ctx, 'pet', `You tidy ${pet.name}'s room`, '🧹');
	givePetXp(ctx, ownPet(ctx, petId), CARE.tidy.petXp);
}

/** A free snack once a day, so running out of GP never means a hungry pet. */
export function forage(ctx: Ctx) {
	const p = playerRow(ctx.tx, ctx.userId);
	if (p.lastForageDay === ctx.today) throw new GameError('You already foraged today');
	ctx.tx.update(players).set({ lastForageDay: ctx.today }).where(eq(players.userId, ctx.userId)).run();
	addItem(ctx, 'food.berry', 2);
}

export function canForage(db: DbOrTx, userId: string, today: number): boolean {
	return playerRow(db, userId).lastForageDay !== today;
}

/** Tidying the welcome-back mess lands on the companion's room. */
export function freshenRoom(ctx: Ctx, tidiness: number, joy = 0) {
	const pet = companionRow(ctx.tx, ctx.userId);
	if (!pet || pet.stage === 'egg') return;
	const p = playerRow(ctx.tx, ctx.userId);
	const needs = currentNeeds(pet, ctx.now, playerModifiers(ctx.tx, ctx.userId), p.resting);
	storeNeeds(ctx, pet, { ...needs, tidiness: needs.tidiness + tidiness, joy: needs.joy + joy });
}

export function setActive(ctx: Ctx, petId: string) {
	const pet = ownPet(ctx, petId);
	if (pet.stage === 'egg') throw new GameError('An egg cannot be your companion yet');
	ctx.tx.update(pets).set({ active: false }).where(eq(pets.userId, ctx.userId)).run();
	ctx.tx.update(pets).set({ active: true }).where(eq(pets.id, pet.id)).run();
	notify(ctx, 'pet', `${pet.name} is your companion now`, '🐾');
}

export function rename(ctx: Ctx, petId: string, name: string) {
	const pet = ownPet(ctx, petId);
	const clean = name.trim().slice(0, 24);
	if (!clean) throw new GameError('Give them a name');
	ctx.tx.update(pets).set({ name: clean }).where(eq(pets.id, pet.id)).run();
}

export function setAccessory(ctx: Ctx, petId: string, accessoryId: string | null) {
	const pet = ownPet(ctx, petId);
	if (accessoryId) {
		const acc = getPetAccessory(accessoryId);
		const level = playerRow(ctx.tx, ctx.userId).level;
		if (!acc || !owns(ctx.tx, ctx.userId, level, accessoryId)) throw new GameError('You do not have that yet');
	}
	ctx.tx.update(pets).set({ accessoryId }).where(eq(pets.id, pet.id)).run();
}

export function addEgg(ctx: Ctx, speciesId: string, source: string) {
	const species = getSpecies(speciesId);
	if (!species) throw new GameError(`Unknown species ${speciesId}`);
	ctx.tx
		.insert(pets)
		.values({
			id: randomUUID(),
			userId: ctx.userId,
			speciesId,
			name: species.name,
			stage: 'egg',
			needsAt: ctx.now,
			warmthNeeded: WARMTH_NEEDED[species.rarity],
			source,
			obtainedAt: ctx.now
		})
		.run();
	notify(ctx, 'egg', `Found a ${species.rarity} egg! Log activities to keep it warm`, '🥚');
}

export function hatch(ctx: Ctx, petId: string) {
	const pet = ownPet(ctx, petId);
	if (pet.stage !== 'egg') throw new GameError('Already hatched');
	if (pet.warmth < pet.warmthNeeded) throw new GameError('Not warm enough yet');
	const hasCompanion = !!companionRow(ctx.tx, ctx.userId);
	ctx.tx
		.update(pets)
		.set({ stage: 'baby', hatchedAt: ctx.now, needsAt: ctx.now, fullness: 80, joy: 90, tidiness: 90, active: !hasCompanion })
		.where(eq(pets.id, pet.id))
		.run();
	const species = getSpecies(pet.speciesId)!;
	notify(ctx, 'egg', `It hatched! Say hello to ${species.name}`, '🐣');
	const hero = playerRow(ctx.tx, ctx.userId).heroName;
	post(ctx, 'hatched', `${hero} hatched a ${species.name}`, '🐣');
	emit(ctx, { type: 'pet.hatched', petId: pet.id, speciesId: pet.speciesId });
}

/** For onboarding: a starter hatches the moment it is chosen. */
export function adoptStarter(ctx: Ctx, speciesId: string, name: string) {
	const species = getSpecies(speciesId);
	if (!species?.starter) throw new GameError('Pick one of the three starters');
	ctx.tx
		.insert(pets)
		.values({
			id: randomUUID(),
			userId: ctx.userId,
			speciesId,
			name: name.trim().slice(0, 24) || species.name,
			stage: 'baby',
			needsAt: ctx.now,
			fullness: 80,
			joy: 90,
			tidiness: 90,
			active: true,
			source: 'starter',
			obtainedAt: ctx.now,
			hatchedAt: ctx.now
		})
		.run();
}

interface PetEffects {
	companion?: { id: string; xp: number };
	warmth: [string, number][];
}

on('activity.logged', (ctx, e) => {
	const fx: PetEffects = { warmth: [] };
	const mods = playerModifiers(ctx.tx, ctx.userId);
	const pet = companionRow(ctx.tx, ctx.userId);
	if (pet && pet.stage !== 'egg') {
		const w = normalizeWeights(e.weights);
		const affinity = (getSpecies(pet.speciesId)?.affinity ?? []).reduce((n, s) => n + (w[s] ?? 0), 0);
		const xp = companionShare(e.reward.xp, affinity, mod(mods, 'pet.xp'));
		givePetXp(ctx, pet, xp);
		fx.companion = { id: pet.id, xp };
	}
	const warmth = Math.round(WARMTH_PER_ACTIVITY * (1 + mod(mods, 'egg.warmth')));
	const eggs = ctx.tx
		.select()
		.from(pets)
		.where(and(eq(pets.userId, ctx.userId), eq(pets.stage, 'egg')))
		.all();
	for (const egg of eggs) {
		const next = Math.min(egg.warmthNeeded, egg.warmth + warmth);
		ctx.tx.update(pets).set({ warmth: next }).where(eq(pets.id, egg.id)).run();
		fx.warmth.push([egg.id, next - egg.warmth]);
		if (next >= egg.warmthNeeded && egg.warmth < egg.warmthNeeded) notify(ctx, 'egg', 'An egg is wobbling. It is ready to hatch!', '🥚');
	}
	e.effects.pets = fx;
});

on('activity.undone', (ctx, e) => {
	const fx = e.effects.pets as PetEffects | undefined;
	if (!fx) return;
	if (fx.companion) {
		const pet = ctx.tx.select().from(pets).where(eq(pets.id, fx.companion.id)).get();
		// Pet XP comes back only within the current level; a pet never shrinks.
		if (pet) ctx.tx.update(pets).set({ xp: Math.max(0, pet.xp - fx.companion.xp) }).where(eq(pets.id, pet.id)).run();
	}
	for (const [id, amount] of fx.warmth) {
		const egg = ctx.tx.select().from(pets).where(eq(pets.id, id)).get();
		if (egg?.stage === 'egg') ctx.tx.update(pets).set({ warmth: Math.max(0, egg.warmth - amount) }).where(eq(pets.id, id)).run();
	}
});

/** Counts for the bag display, food only. */
export function foodStock(db: DbOrTx, userId: string) {
	return db
		.select()
		.from(inventory)
		.where(eq(inventory.userId, userId))
		.all()
		.filter((r) => r.qty > 0 && getConsumable(r.itemId)?.kind === 'food')
		.map((r) => ({ ...getConsumable(r.itemId)!, qty: r.qty }));
}
