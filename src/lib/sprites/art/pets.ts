/**
 * Code-drawn pets, 32×32, standing on row 30 (row 31 is left for the outline).
 *
 * Each stage reports where its head and neck are, so pet accessories (drawn
 * once, at their own small size) land in the right place on every stage and
 * species. A PNG replacement supplies the same two anchors. See docs/ART.md.
 */
import { Pix, type Sprite } from '../grid';
import { PET } from '../frames';

export type PetStage = 'egg' | 'baby' | 'teen' | 'adult';
export interface PetArt {
	sprite: Sprite;
	/** Bottom-centre of a head accessory, and centre of a neck accessory. */
	anchors: { head: [number, number]; neck: [number, number] };
}

const frame = () => new Pix(PET.w, PET.h);

function shade(p: Pix) {
	p.rim('P', 'p', 1, 0);
	p.rim('P', 'p', 0, 1);
	p.rim('C', 'c', 1, 0);
	p.rim('C', 'c', 0, 1);
	return p;
}

/** Big glossy eyes, the single biggest factor in "cute" at this size. */
function eyes(p: Pix, cx: number, y: number, gap: number, tall = 3) {
	const rows = tall === 3 ? ['kk', 'kw', 'kk'] : ['kk', 'kw'];
	p.stamp(Math.round(cx - gap / 2) - 2, y, rows);
	p.stamp(Math.round(cx + gap / 2), y, rows);
}

function cheeks(p: Pix, cx: number, y: number, gap: number) {
	p.set(Math.round(cx - gap / 2) - 3, y, 'r');
	p.set(Math.round(cx + gap / 2) + 2, y, 'r');
}

function finish(p: Pix, head: [number, number], neck: [number, number]): PetArt {
	return { sprite: p.outline().toSprite(), anchors: { head, neck } };
}

// ── Egg (shared shape, species colours) ─────────────────────────────────────

export function egg(): PetArt {
	const p = frame();
	p.ellipse(15.5, 22, 6.5, 8, 'C');
	p.ellipse(15.5, 25, 6.5, 5, 'C');
	shade(p);
	for (const [x, y] of [
		[12, 18],
		[18, 21],
		[13, 25],
		[19, 27],
		[16, 15]
	])
		p.ellipse(x, y, 1.2, 1.2, 'P', true);
	p.paint(12, 16, 'd').paint(11, 17, 'd').paint(12, 17, 'd');
	return finish(p, [15.5, 14], [15.5, 20]);
}

// ── Cindlet: a round garden dragon with a warm belly and small wings ────────

export function cindletEgg(): PetArt {
	const p = frame().ellipse(15.5, 24, 7.5, 6, 'C').ellipse(15.5, 20, 5, 5, 'C');
	p.rim('C', 'c').rect(11, 18, 2, 3, 'd');
	p.stamp(12, 22, ['.AA.', 'AAAA', '.aa.']).rect(18, 26, 3, 2, 'P');
	return finish(p, [16, 15], [16, 26]);
}

export function emberkit(stage: Exclude<PetStage, 'egg'>): PetArt {
	const n = stage === 'baby' ? 0 : stage === 'teen' ? 1 : 2;
	const y = [20, 16, 13][n];
	const p = frame();
	// A long hooked tail and folded wings distinguish even the hatchling.
	p.stamp(22, 25 - n, ['.....PP', '....PPP', '...PPp.', 'PPPPp..', 'PPpp...']);
	p.stamp(25, 22 - n, ['.AA', 'AAA', '.a.']);
	const wingY = 19 - n;
	p.stamp(2, wingY, ['A......', 'AA.....', 'APA....', 'APPAA..', 'APPPPA.', 'APPPPAA', '.AppAA.', '..AA...']);
	p.stamp(23, wingY, ['......A', '.....AA', '....APA', '..AAPPA', '.APPPPA', 'AAPPPPA', '.AAppA.', '...AA..']);
	p.ellipse(15.5, 26, 6.5 + n, 4, 'P');
	p.rect(12, y + 4, 8, 22 - y, 'P');
	p.rect(10 - n, 29, 4, 2, 'P').rect(18, 29, 4 + n, 2, 'P');
	p.ellipse(15.5, y, 6.5 + n, 6, 'P');
	p.rim('P', 'p');
	p.ellipse(15.5, 27, 3.5 + n, 3, 'C').rim('C', 'c');
	// Golden horns turn outward; the centre crown stays clear for hats.
	p.stamp(8 - n, y - 7, ['AA.', 'aA.', '.AA']);
	p.stamp(21 + n, y - 7, ['.AA', '.Aa', 'AA.']);
	p.rect(11 - n, y - 4, 4, 2, 'q');
	p.ellipse(15.5, y + 3, 5.5, 2, 'q');
	p.rect(11, y, 2, 2, 'k').rect(19, y, 2, 2, 'k');
	p.set(14, y + 2, 'p').set(17, y + 2, 'p').rect(15, y + 4, 2, 1, 'p');
	if (n > 0) p.rect(9, 25, 2, 3, 'q').rect(21, 25, 2, 3, 'p');
	return finish(p, [16, y - 6], [16, y + 7]);
}

// ── Puddlefin: an axolotl-ish water sprite with frilly gills ────────────────

function gills(p: Pix, cx: number, y: number, spread: number, n: number) {
	for (let i = 0; i < n; i++) {
		const yy = y + i * 2 - n;
		p.line(Math.round(cx - spread), yy + 1, Math.round(cx - spread) - 2 - (i % 2), yy, 'A');
		p.line(Math.round(cx + spread) - 1, yy + 1, Math.round(cx + spread) + 1 + (i % 2), yy, 'A');
	}
}

export function puddlefin(stage: Exclude<PetStage, 'egg'>): PetArt {
	const p = frame();
	if (stage === 'baby') {
		p.ellipse(22, 26, 4, 2, 'P');
		p.ellipse(15.5, 25, 6, 4.5, 'P');
		p.ellipse(15.5, 18, 7, 6, 'P');
		gills(p, 15.5, 18, 7, 3);
		p.ellipse(15.5, 26, 3.5, 2.5, 'C', true);
		p.rect(11, 29, 2, 2, 'P').rect(19, 29, 2, 2, 'P');
		shade(p);
		eyes(p, 15.5, 17, 6);
		cheeks(p, 15.5, 20, 6);
		p.stamp(14, 21, ['k..k', '.kk.']);
		return finish(p, [15.5, 12], [15.5, 23]);
	}
	if (stage === 'teen') {
		p.ellipse(25, 22, 4, 4, 'P');
		p.ellipse(27, 18, 2, 3, 'C');
		p.ellipse(17, 23, 8, 5, 'P');
		p.ellipse(12, 15, 6.5, 5.5, 'P');
		gills(p, 12, 15, 6.5, 3);
		p.ellipse(16, 25, 5, 2.5, 'C', true);
		p.rect(10, 27, 2, 4, 'P').rect(21, 27, 2, 4, 'P');
		shade(p);
		eyes(p, 12, 14, 5);
		cheeks(p, 12, 17, 5);
		p.stamp(11, 18, ['k..k', '.kk.']);
		return finish(p, [12, 9], [13, 20]);
	}
	p.ellipse(25, 16, 5, 7, 'C');
	p.ellipse(25, 19, 4, 4, 'P');
	p.ellipse(16, 22, 9, 6, 'P');
	p.ellipse(11, 12, 7, 6, 'P');
	gills(p, 11, 12, 7, 4);
	p.stamp(14, 15, ['..CC', '.CCC', 'CCC.']);
	p.ellipse(15, 24, 6, 3, 'C', true);
	p.rect(9, 26, 3, 5, 'P').rect(21, 26, 3, 5, 'P');
	shade(p);
	eyes(p, 11, 11, 5);
	cheeks(p, 11, 14, 5);
	p.stamp(10, 15, ['k..k', '.kk.']);
	return finish(p, [11, 7], [12, 18]);
}

// ── Mossling: a round sprout that grows a flower ────────────────────────────

function leaf(p: Pix, x: number, y: number, len: number, dir: -1 | 1) {
	for (let i = 0; i < len; i++) {
		const w = Math.round(Math.sin((i / len) * Math.PI) * (len / 3));
		for (let j = -w; j <= w; j++) p.set(x + dir * i, y - Math.round(i / 2) + j, 'C');
	}
	p.line(x, y, x + dir * (len - 1), y - Math.round((len - 1) / 2), 'c');
}

export function mossling(stage: Exclude<PetStage, 'egg'>): PetArt {
	const p = frame();
	if (stage === 'baby') {
		p.line(15, 13, 15, 10, 'c');
		leaf(p, 15, 10, 5, -1);
		leaf(p, 16, 10, 4, 1);
		p.ellipse(15.5, 22, 7.5, 7, 'P');
		p.ellipse(15.5, 25, 4, 3, 'd', true);
		p.rect(11, 28, 3, 2, 'P').rect(18, 28, 3, 2, 'P');
		shade(p);
		eyes(p, 15.5, 19, 5);
		cheeks(p, 15.5, 22, 5);
		p.set(15, 23, 'k').set(16, 23, 'k');
		return finish(p, [15.5, 14], [15.5, 25]);
	}
	if (stage === 'teen') {
		p.line(15, 9, 15, 6, 'c');
		leaf(p, 15, 6, 7, -1);
		leaf(p, 16, 6, 6, 1);
		p.ellipse(15.5, 20, 9, 8, 'P');
		p.ellipse(15.5, 24, 5, 4, 'd', true);
		p.rect(9, 27, 3, 4, 'P').rect(20, 27, 3, 4, 'P');
		p.rect(5, 19, 2, 3, 'P').rect(25, 19, 2, 3, 'P');
		shade(p);
		eyes(p, 15.5, 17, 6);
		cheeks(p, 15.5, 20, 6);
		p.stamp(14, 21, ['k..k', '.kk.']);
		return finish(p, [15.5, 11], [15.5, 24]);
	}
	p.ellipse(15.5, 5, 3, 2, 'A');
	p.ellipse(12.5, 7, 2, 2, 'A');
	p.ellipse(18.5, 7, 2, 2, 'A');
	p.ellipse(15.5, 7, 1.5, 1.5, 'b');
	leaf(p, 14, 11, 8, -1);
	leaf(p, 17, 11, 8, 1);
	p.ellipse(15.5, 19, 10, 9, 'P');
	p.ellipse(15.5, 23, 6, 5, 'd', true);
	p.rect(8, 26, 4, 5, 'P').rect(20, 26, 4, 5, 'P');
	p.rect(3, 17, 3, 4, 'P').rect(26, 17, 3, 4, 'P');
	shade(p);
	eyes(p, 15.5, 16, 7);
	cheeks(p, 15.5, 19, 7);
	p.stamp(14, 20, ['k..k', '.kk.']);
	return finish(p, [15.5, 9], [15.5, 24]);
}

// ── Pebblet: a pebble with a crystal growing out of its back ────────────────

function crystal(p: Pix, x: number, y: number, h: number) {
	for (let i = 0; i < h; i++) {
		const w = i < 2 ? i : Math.min(2, Math.floor(h / 3));
		for (let dx = -w; dx <= w; dx++) p.set(x + dx, y + i, dx < 0 ? 'b' : 'A');
	}
}

export function pebblet(stage: Exclude<PetStage, 'egg'>): PetArt {
	const p = frame();
	const s = stage === 'baby' ? 0 : stage === 'teen' ? 1 : 2;
	const rx = 6 + s * 2.5;
	const ry = 5 + s * 2;
	const cy = 30 - ry;
	crystal(p, 20 + s, Math.round(cy - ry - 3 - s * 2), 6 + s * 3);
	if (s === 2) crystal(p, 11, Math.round(cy - ry - 1), 6);
	p.ellipse(15.5, cy, rx, ry, 'P');
	p.ellipse(15.5, cy + ry * 0.4, rx * 0.6, ry * 0.4, 'C', true);
	shade(p);
	p.paint(Math.round(15.5 - rx / 2), Math.round(cy - ry / 2), 'q');
	const ey = Math.round(cy - 1);
	eyes(p, 15.5, ey, 4 + s, 2);
	cheeks(p, 15.5, ey + 2, 4 + s);
	p.set(15, ey + 3, 'k').set(16, ey + 3, 'k');
	return finish(p, [15.5, Math.round(cy - ry)], [15.5, Math.round(cy + 2)]);
}

// ── Fluffle: a cloud lamb with little curled horns ──────────────────────────

export function fluffle(stage: Exclude<PetStage, 'egg'>): PetArt {
	const p = frame();
	const s = stage === 'baby' ? 0 : stage === 'teen' ? 1 : 2;
	const r = 5 + s * 1.5;
	const cy = 28 - r;
	for (const [dx, dy] of [
		[-r * 0.8, 0],
		[r * 0.8, 0],
		[0, -r * 0.6],
		[-r * 0.4, r * 0.3],
		[r * 0.4, r * 0.3],
		[0, 0]
	])
		p.ellipse(15.5 + dx, cy + dy, r * 0.7, r * 0.7, 'C');
	p.rect(Math.round(15.5 - r * 0.6), Math.round(cy + r * 0.5), 2, 4 - (s === 0 ? 1 : 0), 'n');
	p.rect(Math.round(15.5 + r * 0.6) - 1, Math.round(cy + r * 0.5), 2, 4 - (s === 0 ? 1 : 0), 'n');
	p.ellipse(15.5, cy + 1, r * 0.55, r * 0.5, 'P');
	p.rim('C', 'c', 1, 0);
	p.rim('C', 'c', 0, 1);
	const hy = Math.round(cy - r * 0.6);
	p.stamp(Math.round(15.5 - r * 0.6) - 2, hy, ['AA', 'A.', 'AA']);
	p.stamp(Math.round(15.5 + r * 0.6), hy, ['AA', '.A', 'AA']);
	const ey = Math.round(cy);
	eyes(p, 15.5, ey, 3 + s, 2);
	cheeks(p, 15.5, ey + 2, 3 + s);
	return finish(p, [15.5, Math.round(cy - r * 1.2)], [15.5, Math.round(cy + r * 0.5)]);
}

// ── Glimmerwing: a moth with lantern-bright wings ───────────────────────────

export function glimmerwing(stage: Exclude<PetStage, 'egg'>): PetArt {
	const p = frame();
	const s = stage === 'baby' ? 0 : stage === 'teen' ? 1 : 2;
	const wing = 4 + s * 2.5;
	const cy = 22 - s;
	p.ellipse(15.5 - wing * 0.8, cy - 2, wing * 0.75, wing, 'C');
	p.ellipse(15.5 + wing * 0.8, cy - 2, wing * 0.75, wing, 'C');
	p.ellipse(15.5 - wing * 0.8, cy - 2, wing * 0.3, wing * 0.35, 'A', true);
	p.ellipse(15.5 + wing * 0.8, cy - 2, wing * 0.3, wing * 0.35, 'A', true);
	p.ellipse(15.5, cy + 2, 3 + s * 0.5, 5 + s, 'P');
	p.ellipse(15.5, cy - 4 - s, 4 + s * 0.5, 3.5 + s * 0.5, 'P');
	p.line(13, cy - 7 - s, 11 - s, cy - 10 - s * 2, 'n').line(18, cy - 7 - s, 20 + s, cy - 10 - s * 2, 'n');
	p.set(11 - s, cy - 11 - s * 2, 'A').set(20 + s, cy - 11 - s * 2, 'A');
	for (let y = cy; y < cy + 5 + s; y += 2) p.paint(15, y, 'p').paint(16, y, 'p');
	p.rim('C', 'c', 0, 1);
	p.rim('P', 'p', 1, 0);
	eyes(p, 15.5, cy - 5 - s, 3, 2);
	return finish(p, [15.5, cy - 8 - s], [15.5, cy - 1]);
}

// ── Pet accessories (12×8) ──────────────────────────────────────────────────
// Head pieces sit on the bottom row, drawn with their bottom-centre on the head
// anchor; neck pieces are centred on the neck anchor.

export const PET_ACC = { w: 12, h: 8 } as const;

function acc() {
	return new Pix(PET_ACC.w, PET_ACC.h);
}

export function petBow(): Sprite {
	return acc().stamp(3, 4, ['PP.PP', 'PPAPP', 'PP.PP']).outline().toSprite();
}

export function petTopHat(): Sprite {
	return acc().stamp(3, 2, ['.PPPP.', '.PPPP.', '.AAAA.', 'PPPPPP']).outline().toSprite();
}

export function petFlower(): Sprite {
	return acc().stamp(4, 4, ['.P.', 'PAP', '.P.']).outline().toSprite();
}

export function petCrown(): Sprite {
	return acc().stamp(3, 4, ['A.A.A.', 'AAAAAA', 'AbArAA']).outline().toSprite();
}

export function petBandana(): Sprite {
	return acc().stamp(2, 2, ['PPPPPPPP', '.PPPPPP.', '..PPPP..', '...PP...']).outline().toSprite();
}

export function petBell(): Sprite {
	return acc().stamp(2, 2, ['PPPPPPPP', '...AA...', '...Ab...']).outline().toSprite();
}
