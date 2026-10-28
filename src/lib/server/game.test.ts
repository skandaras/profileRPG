import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { load as petPage } from '../../routes/pet/+page.server';
import { load as shopPage } from '../../routes/shop/+page.server';
import { DEFAULT_AVATAR } from '$lib/content/cosmetics';
import { advanceClock, setClock } from './clock';
import { db, runMigrations } from './db';
import { inventory, pets, players } from './db/schema';
import { GameError, NotFound } from './events';
import { play } from './game';
import { complete, createHabit, listHabits, undo } from './modules/habits';
import { buy, inventoryOf } from './modules/inventory';
import { claimMission, missionBoard, startMission } from './modules/missions';
import { partyCards } from './modules/party';
import { feed, hatch, listPets, addEgg } from './modules/pets';
import { createPlayer, saveAvatar, saveSettings } from './modules/player';
import { learnAbility, playerRow } from './modules/progression';
import { cleanMess, greet, welcomeState } from './modules/welcome';
import { provisionUser } from './users';

const H = 3_600_000;
// Noon UTC on a Monday, so "today" is unambiguous in UTC.
const START = Date.parse('2026-10-26T12:00:00Z');

let seq = 0;
function newHero(templates: string[] = []) {
	const u = provisionUser({ username: `hero${++seq}-${Date.now()}`, email: null, displayName: null, groups: [] });
	play(u.id, (ctx) =>
		createPlayer(ctx, { heroName: 'Robin', avatar: DEFAULT_AVATAR, starter: 'mossling', petName: 'Sprout', timezone: 'UTC', templates })
	);
	return u.id;
}

beforeAll(() => runMigrations());
beforeEach(() => setClock(START));

describe('onboarding', () => {
	it('creates the hero, a hatched companion and the chosen habits', () => {
		const id = newHero(['exercise', 'read']);
		const { result } = play(id, (ctx) => ({ habits: listHabits(ctx.tx, id, ctx.today), pets: listPets(ctx.tx, id, ctx.now) }));
		expect(result.habits.map((h) => h.title)).toEqual(['Exercise', 'Read a book']);
		expect(result.pets).toHaveLength(1);
		expect(result.pets[0]).toMatchObject({ name: 'Sprout', stage: 'baby', active: true });
		expect(playerRow(db, id).gp).toBe(20);
		expect(playerRow(db, id).themeId).toBe('night');
	});

	it('keeps a saved dawn theme through play and new player creation', () => {
		const id = newHero();
		play(id, (ctx) => saveSettings(ctx, { themeId: 'meadow' }));
		newHero();
		advanceClock(24 * H);
		play(id, () => null);
		expect(playerRow(db, id).themeId).toBe('meadow');
	});

	it('will not make a second hero', () => {
		const id = newHero();
		expect(() =>
			play(id, (ctx) => createPlayer(ctx, { heroName: 'X', avatar: DEFAULT_AVATAR, starter: 'emberkit', petName: '', timezone: 'UTC', templates: [] }))
		).toThrow(GameError);
	});

	it('quietly drops cosmetics nobody has unlocked', () => {
		const id = newHero();
		play(id, (ctx) => saveAvatar(ctx, { ...DEFAULT_AVATAR, parts: { ...DEFAULT_AVATAR.parts, headwear: 'hat.crown', top: 'top.hoodie' } }));
		const a = playerRow(db, id).avatar;
		expect(a.parts.headwear).toBeUndefined();
		expect(a.parts.top).toBe('top.hoodie');
	});
});

describe('ticking off a habit', () => {
	it('pays XP, GP and training, feeds the companion, and undoes cleanly', () => {
		const id = newHero(['read']);
		const habit = play(id, (ctx) => listHabits(ctx.tx, id, ctx.today)).result[0];
		const before = playerRow(db, id);
		const { notices } = play(id, (ctx) => complete(ctx, habit.id));
		const after = playerRow(db, id);
		expect(after.totalXp).toBeGreaterThan(before.totalXp);
		expect(after.gp).toBeGreaterThan(before.gp);
		expect(after.statXp.int + after.statXp.kno).toBeGreaterThan(0);
		expect(notices.some((n) => n.kind === 'xp')).toBe(true);
		const pet = db.select().from(pets).where(eq(pets.userId, id)).get()!;
		expect(pet.xp).toBeGreaterThan(0);

		const view = play(id, (ctx) => listHabits(ctx.tx, id, ctx.today)).result[0];
		expect(view).toMatchObject({ done: true, streak: 1, count: 1 });

		play(id, (ctx) => undo(ctx, habit.id));
		const undone = playerRow(db, id);
		expect(undone.totalXp).toBe(before.totalXp);
		expect(undone.gp).toBe(before.gp);
		expect(play(id, (ctx) => listHabits(ctx.tx, id, ctx.today)).result[0]).toMatchObject({ done: false, streak: 0 });
	});

	it('keeps other people out', () => {
		const a = newHero(['read']);
		const b = newHero();
		const habit = play(a, (ctx) => listHabits(ctx.tx, a, ctx.today)).result[0];
		expect(() => play(b, (ctx) => complete(ctx, habit.id))).toThrow(NotFound);
	});

	it('finishes a one-off task once', () => {
		const id = newHero();
		const taskId = play(id, (ctx) => createHabit(ctx, { kind: 'task', title: 'Book dentist', icon: '🦷', difficulty: 'easy', weights: {} })).result;
		play(id, (ctx) => complete(ctx, taskId));
		expect(() => play(id, (ctx) => complete(ctx, taskId))).toThrow(GameError);
	});
});

describe('days passing', () => {
	it('breaks a streak and fines a missed day, and says so', () => {
		const id = newHero(['news']);
		const habit = play(id, (ctx) => listHabits(ctx.tx, id, ctx.today)).result[0];
		play(id, (ctx) => complete(ctx, habit.id));
		advanceClock(24 * H);
		play(id, (ctx) => complete(ctx, habit.id));
		expect(play(id, (ctx) => listHabits(ctx.tx, id, ctx.today)).result[0].streak).toBe(2);
		const gp = playerRow(db, id).gp;
		advanceClock(48 * H);
		play(id, () => null);
		const p = playerRow(db, id);
		expect(p.gp).toBe(gp - 1);
		expect(p.awayNote?.missed[0]).toMatchObject({ title: 'Catch up on the news', count: 1, streakLost: 2 });
		expect(play(id, (ctx) => listHabits(ctx.tx, id, ctx.today)).result[0].streak).toBe(0);
	});

	it('owes nothing on the day a habit was created', () => {
		const id = newHero(['exercise']);
		advanceClock(24 * H);
		play(id, () => null);
		expect(playerRow(db, id).awayNote).toBeNull();
	});

	it('forgives everything in rest mode', async () => {
		const { setResting } = await import('./modules/player');
		const id = newHero(['exercise']);
		advanceClock(24 * H);
		play(id, (ctx) => setResting(ctx, true));
		advanceClock(5 * 24 * H);
		const gp = playerRow(db, id).gp;
		play(id, () => null);
		expect(playerRow(db, id).gp).toBe(gp);
		expect(playerRow(db, id).awayNote).toBeNull();
	});
});

describe('the welcome-back ritual', () => {
	it('leaves mess on a new day and rewards tidying it', () => {
		const id = newHero();
		advanceClock(24 * H);
		const state = play(id, (ctx) => welcomeState(ctx.tx, id, ctx.today)).result;
		expect(state).toMatchObject({ active: true, mess: 1, returnStreak: 2 });
		expect(() => play(id, (ctx) => greet(ctx))).toThrow('Tidy up first');
		const gp = playerRow(db, id).gp;
		play(id, (ctx) => cleanMess(ctx));
		play(id, (ctx) => greet(ctx));
		expect(playerRow(db, id).gp).toBeGreaterThan(gp);
		expect(play(id, (ctx) => welcomeState(ctx.tx, id, ctx.today)).result.active).toBe(false);
		expect(() => play(id, (ctx) => greet(ctx))).toThrow(GameError);
	});

	it('greets a long absence with more mess and a gift', () => {
		const id = newHero();
		advanceClock(5 * 24 * H);
		const state = play(id, (ctx) => welcomeState(ctx.tx, id, ctx.today)).result;
		expect(state).toMatchObject({ mess: 5, missedYou: true, returnStreak: 1 });
	});
});

describe('missions', () => {
	it('sends the party out and brings rewards home', () => {
		const id = newHero();
		play(id, (ctx) => startMission(ctx, 'meadow-stroll', true));
		const board = play(id, (ctx) => missionBoard(ctx.tx, id, ctx.now)).result;
		expect(board.runs).toHaveLength(1);
		expect(() => play(id, (ctx) => startMission(ctx, 'library-errand', true))).toThrow('already out');
		expect(() => play(id, (ctx) => claimMission(ctx, board.runs[0].id))).toThrow('Still on the road');
		const pet = listPets(db, id, START)[0];
		expect(pet.away).toBe(true);
		advanceClock(16 * 60_000);
		const xp = playerRow(db, id).totalXp;
		const outcome = play(id, (ctx) => claimMission(ctx, board.runs[0].id)).result;
		expect(outcome.xp).toBeGreaterThan(0);
		expect(playerRow(db, id).totalXp).toBe(xp + outcome.xp);
		expect(() => play(id, (ctx) => claimMission(ctx, board.runs[0].id))).toThrow('Already claimed');
	});

	it('locks missions above your level', () => {
		const id = newHero();
		expect(() => play(id, (ctx) => startMission(ctx, 'dragons-hearth', false))).toThrow('Reach level');
	});
});

describe('eggs and the shop', () => {
	it('keeps saved accessories and ownership while pet care and shop offer none', () => {
		const id = newHero();
		const pet = listPets(db, id, START)[0];
		db.update(pets).set({ accessoryId: 'petacc.bow' }).where(eq(pets.id, pet.id)).run();
		db.insert(inventory).values({ userId: id, itemId: 'petacc.bow', qty: 1, acquiredAt: START }).run();
		const event = { locals: { user: { id, username: 'test', email: null, displayName: null, groups: [] } } };
		const care = petPage(event as unknown as Parameters<typeof petPage>[0]);
		expect(care.accessories).toEqual([]);
		expect(care.pets.find((p) => p.id === pet.id)?.accessoryId).toBe('petacc.bow');
		expect(shopPage(event as unknown as Parameters<typeof shopPage>[0]).stock.some((i) => i.kind === 'petacc')).toBe(false);
		expect(inventoryOf(db, id).get('petacc.bow')).toBe(1);
		db.update(players).set({ gp: 500 }).where(eq(players.userId, id)).run();
		expect(() => play(id, (ctx) => buy(ctx, 'petacc.bandana'))).toThrow('That is not in the shop');
		expect(inventoryOf(db, id).get('petacc.bandana')).toBeUndefined();
	});

	it('warms an egg with activity until it hatches', () => {
		const id = newHero(['read']);
		play(id, (ctx) => addEgg(ctx, 'pebblet', 'test'));
		const egg = listPets(db, id, START).find((p) => p.stage === 'egg')!;
		expect(() => play(id, (ctx) => hatch(ctx, egg.id))).toThrow('Not warm enough');
		db.update(pets).set({ warmth: egg.warmthNeeded - 5 }).where(eq(pets.id, egg.id)).run();
		const habit = play(id, (ctx) => listHabits(ctx.tx, id, ctx.today)).result[0];
		play(id, (ctx) => complete(ctx, habit.id));
		play(id, (ctx) => hatch(ctx, egg.id));
		expect(listPets(db, id, START).find((p) => p.id === egg.id)?.stage).toBe('baby');
	});

	it('sells food for GP and feeds it to the companion', () => {
		const id = newHero();
		play(id, (ctx) => buy(ctx, 'food.kibble', 2));
		expect(playerRow(db, id).gp).toBe(10);
		expect(inventoryOf(db, id).get('food.kibble')).toBe(2);
		const pet = listPets(db, id, START)[0];
		play(id, (ctx) => feed(ctx, pet.id, 'food.kibble'));
		expect(inventoryOf(db, id).get('food.kibble')).toBe(1);
		expect(() => play(id, (ctx) => buy(ctx, 'toy.ball'))).toThrow('Not enough GP');
		expect(() => play(id, (ctx) => buy(ctx, 'hat.crown'))).toThrow('Not for sale');
		db.delete(inventory).where(eq(inventory.userId, id)).run();
		expect(() => play(id, (ctx) => feed(ctx, pet.id, 'food.kibble'))).toThrow('no Crunchy kibble');
	});
});

describe('progression', () => {
	it('spends ability points only when the level allows', () => {
		const id = newHero();
		expect(() => play(id, (ctx) => learnAbility(ctx, 'bookworm'))).toThrow('No ability points');
		db.update(players).set({ level: 2, abilityPoints: 1 }).where(eq(players.userId, id)).run();
		expect(() => play(id, (ctx) => learnAbility(ctx, 'second-party'))).toThrow('Reach level 8');
		play(id, (ctx) => learnAbility(ctx, 'bookworm'));
		expect(playerRow(db, id).abilityPoints).toBe(0);
	});

	it('shows everyone on the party page', () => {
		newHero();
		const cards = partyCards(db, START);
		expect(cards.length).toBeGreaterThan(0);
		expect(cards[0].pet).not.toBeNull();
	});
});
