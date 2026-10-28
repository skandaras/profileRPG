/**
 * The hero: creating one (onboarding), their look, and their settings.
 */
import { eq } from 'drizzle-orm';
import { dyeItemId, getCosmetic, getTheme, themeItemId } from '$lib/content';
import { DEFAULT_AVATAR, OPTIONAL_SLOTS, SLOT_ORDER } from '$lib/content/cosmetics';
import { getDye, isEye, isHair, isSkin } from '$lib/content/palettes';
import { DEFAULT_THEME } from '$lib/content/themes';
import { zeroStats } from '$lib/content/stats';
import type { AvatarConfig, AvatarSlot, ColorSlot } from '$lib/content/types';
import { gameDay, isValidTimeZone } from '$lib/game/schedule';
import type { DbOrTx } from '../db';
import { pets, players } from '../db/schema';
import { GameError, notify, type Ctx } from '../events';
import { post } from './feed';
import { createFromTemplate } from './habits';
import { owns } from './inventory';
import { adoptStarter, currentNeeds } from './pets';
import { playerModifiers, playerRow } from './progression';

export function findPlayer(db: DbOrTx, userId: string) {
	return db.select().from(players).where(eq(players.userId, userId)).get();
}

const CLOTH_COLORS: ColorSlot[] = ['top', 'bottom', 'shoes', 'headwear', 'accessory'];

/**
 * Accept only parts and colours the player actually has. Anything else falls
 * back to the default rather than failing, so a stale form never loses a save.
 */
export function sanitizeAvatar(db: DbOrTx, userId: string | null, level: number, input: AvatarConfig): AvatarConfig {
	const has = (id: string) => (userId ? owns(db, userId, level, id) : getCosmetic(id)?.unlock.kind === 'starter');
	const parts: AvatarConfig['parts'] = {};
	for (const slot of SLOT_ORDER) {
		const id = input.parts?.[slot];
		const c = id ? getCosmetic(id) : undefined;
		if (c && c.slot === slot && has(c.id)) parts[slot] = c.id;
		else if (!OPTIONAL_SLOTS.includes(slot)) parts[slot] = DEFAULT_AVATAR.parts[slot as AvatarSlot];
	}
	const colors: AvatarConfig['colors'] = { ...DEFAULT_AVATAR.colors };
	const c = input.colors ?? {};
	if (c.skin && isSkin(c.skin)) colors.skin = c.skin;
	if (c.hair && isHair(c.hair)) colors.hair = c.hair;
	if (c.eyes && isEye(c.eyes)) colors.eyes = c.eyes;
	for (const slot of CLOTH_COLORS) {
		const dye = c[slot] ? getDye(c[slot]!) : undefined;
		if (!dye) continue;
		const ok = dye.unlock.kind === 'starter' || (userId ? owns(db, userId, level, dyeItemId(dye.id)) : false);
		if (ok) colors[slot] = dye.id;
	}
	return { parts, colors };
}

export interface Onboarding {
	heroName: string;
	avatar: AvatarConfig;
	starter: string;
	petName: string;
	timezone: string;
	templates: string[];
}

export function createPlayer(ctx: Ctx, input: Onboarding) {
	if (findPlayer(ctx.tx, ctx.userId)) throw new GameError('You already have a hero');
	const heroName = input.heroName.trim().slice(0, 24);
	if (!heroName) throw new GameError('Your hero needs a name');
	const timezone = isValidTimeZone(input.timezone) ? input.timezone : 'UTC';
	const today = gameDay(ctx.now, timezone, 4);
	ctx.today = today;
	ctx.tx
		.insert(players)
		.values({
			userId: ctx.userId,
			heroName,
			avatar: sanitizeAvatar(ctx.tx, null, 1, input.avatar),
			allocated: zeroStats(),
			statXp: zeroStats(),
			timezone,
			gp: 20,
			themeId: DEFAULT_THEME,
			lastVisitDay: today,
			returnStreak: 1,
			welcomeDay: today,
			welcomeDone: true,
			createdAt: ctx.now
		})
		.run();
	adoptStarter(ctx, input.starter, input.petName);
	for (const t of [...new Set(input.templates)].slice(0, 8)) createFromTemplate(ctx, t);
	post(ctx, 'joined', `${heroName} joined the party`, '🎒');
	notify(ctx, 'info', `Welcome, ${heroName}! Your adventure starts now`, '🎒');
}

export function saveAvatar(ctx: Ctx, avatar: AvatarConfig) {
	const p = playerRow(ctx.tx, ctx.userId);
	ctx.tx
		.update(players)
		.set({ avatar: sanitizeAvatar(ctx.tx, ctx.userId, p.level, avatar) })
		.where(eq(players.userId, ctx.userId))
		.run();
	notify(ctx, 'info', 'Looking good!', '✨');
}

export function saveSettings(ctx: Ctx, s: { heroName?: string; timezone?: string; dayStartHour?: number; themeId?: string }) {
	const p = playerRow(ctx.tx, ctx.userId);
	const set: Partial<typeof players.$inferInsert> = {};
	if (s.heroName !== undefined) {
		const n = s.heroName.trim().slice(0, 24);
		if (!n) throw new GameError('Your hero needs a name');
		set.heroName = n;
	}
	if (s.timezone && isValidTimeZone(s.timezone)) set.timezone = s.timezone;
	if (s.dayStartHour !== undefined && Number.isInteger(s.dayStartHour)) set.dayStartHour = Math.min(8, Math.max(0, s.dayStartHour));
	if (s.themeId !== undefined) {
		const t = getTheme(s.themeId);
		if (!t || !owns(ctx.tx, ctx.userId, p.level, themeItemId(t.id))) throw new GameError('You have not unlocked that theme');
		set.themeId = t.id;
	}
	if (Object.keys(set).length) ctx.tx.update(players).set(set).where(eq(players.userId, ctx.userId)).run();
}

/**
 * Rest mode pauses fines and streak breaks and freezes pet needs. Switching it
 * either way snapshots every pet's needs at this moment, so neither the rest
 * nor the time before it is counted twice.
 */
export function setResting(ctx: Ctx, resting: boolean) {
	const p = playerRow(ctx.tx, ctx.userId);
	if (p.resting === resting) return;
	const mods = playerModifiers(ctx.tx, ctx.userId);
	for (const pet of ctx.tx.select().from(pets).where(eq(pets.userId, ctx.userId)).all()) {
		const n = currentNeeds(pet, ctx.now, mods, p.resting);
		ctx.tx.update(pets).set({ ...n, needsAt: ctx.now }).where(eq(pets.id, pet.id)).run();
	}
	ctx.tx.update(players).set({ resting }).where(eq(players.userId, ctx.userId)).run();
	notify(ctx, 'info', resting ? 'Rest mode on. Nothing is lost while you recover' : 'Welcome back! Rest mode off', resting ? '🛌' : '☀️');
}
