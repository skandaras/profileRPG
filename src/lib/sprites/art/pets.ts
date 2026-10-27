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

// ── Brambleback: a low, long-snouted dragon with folded leather wings ─────
export function bramblebackEgg(): PetArt {
	const p = frame().ellipse(15.5, 25, 7, 5, 'C').ellipse(15.5, 21, 5, 6, 'C');
	p.rim('C', 'c').rect(12, 18, 2, 3, 'd');
	p.stamp(17, 13, ['.A.', '.AA', 'AA.']);
	p.stamp(11, 22, ['PPP...', 'PqPP..', '.PPpp.', '..ppp.']);
	return finish(p, [16, 15], [16, 26]);
}

export function emberkit(stage: Exclude<PetStage, 'egg'>): PetArt {
	const n = stage === 'baby' ? 0 : stage === 'teen' ? 1 : 2;
	const top = [16, 12, 9][n];
	const p = frame();
	// A rising tail makes room for the ridge without crowding the face.
	p.stamp(22, 21 - n, ['.....PP', '.....PP', '....PPp', '...PPP.', '..PPPp.', 'PPPPp..', 'PPPp...']);
	p.stamp(27, 17 - n, ['.A.', 'AAA', 'bAA', '.a.']);
	for (let i = 0; i < 3; i++) p.stamp(22 + i * 2, 22 - n - i * 2, ['A.', 'AA']);
	p.ellipse(17, 26, 7 + n, 4, 'P').rect(11, top + 7, 8, 27 - top - 7, 'P');
	p.rect(9, 28, 4, 3, 'P').rect(20, 28, 4, 3, 'P').rim('P', 'p');
	p.ellipse(13, 26, 3.5, 3, 'C').rim('C', 'c');
	p.rect(11, 25, 5, 1, 'c').rect(10, 28, 6, 1, 'c').rect(11, 26, 3, 1, 'd');
	// The elbow projects beyond the shoulder; a dark folded finger reaches the tip.
	const folded = frame().stamp(19, 21 - n, [
		'.....PP.', 'PP..PqqP', 'PqPPPaaP', '.PAAAaP.', '.PAAPaP.', '..PAPaP.', '...PPaP.', '....PP..'
	]);
	p.over(folded.outline());
	// Swept horns join the skull at a narrow root, with no ear lobes.
	p.stamp(10, top - 3, ['b..', 'bA.', '.AA']);
	p.stamp(18, top - 3, ['....bA', '...AA.', '..AA..', '.AA...', 'AA....']);
	const face = frame().ellipse(13.5, top + 4, 6, 4.5, 'P');
	face.rect(9, top + 1, 4, 2, 'q').rim('P', 'p');
	// The off-centre muzzle extends left of the skull: a clear reptile profile.
	face.stamp(4, top + 6, [
		'..qqqqqqPP', '.qqqqqqqPP', 'qqpqqqqqPp', 'qqqqqqqqpp', '.PPPPPPpp.'
	]);
	face.rect(9, top + 4, 2, 2, 'k').rect(15, top + 4, 2, 2, 'k');
	face.set(9, top + 4, 'w').set(15, top + 4, 'w');
	face.set(6, top + 8, 'p').rect(7, top + 10, 5, 1, 'p');
	p.over(face.outline());
	p.stamp(8, 27, ['qP', 'qP', 'CC']);
	p.set(9, 30, 'C').set(11, 30, 'C').set(20, 30, 'C').set(22, 30, 'C');
	return finish(p, [14, top], [14, top + 13]);
}

// ── Brookbell: a river seal with a cream bib and broad swimming flippers ────

export function brookbellEgg(): PetArt {
	const p = frame().ellipse(15.5, 25, 7, 5, 'C').ellipse(15.5, 21, 5, 6, 'C');
	p.rim('C', 'c').rect(12, 18, 2, 3, 'd');
	p.stamp(12, 24, ['.PPP....', 'PPqPP.PP', '.PPPPPP.', '...PP...']);
	return finish(p, [16, 15], [16, 26]);
}

export function puddlefin(stage: Exclude<PetStage, 'egg'>): PetArt {
	const n = stage === 'baby' ? 0 : stage === 'teen' ? 1 : 2;
	const top = [16, 12, 9][n];
	const p = frame();
	// Paired rear flippers and a single broad foreflipper give a swimming profile.
	p.stamp(24, 25 - n, ['....PPP', '..PPPPp', 'PPPPpp.', 'PPPP...', '..PPP..', '...PPp.']);
	p.ellipse(18, 26, 7 + n, 4, 'P');
	p.ellipse(13, 23, 5 + n, 6, 'P');
	p.ellipse(12.5, top + 5, 6 + n / 2, 5.5, 'P').rim('P', 'p');
	p.ellipse(12, 26, 4, 4, 'C').rim('C', 'c');
	p.rect(10, 25, 3, 2, 'd');
	p.ellipse(18, 28, 4 + n / 2, 2, 'p').line(16, 28, 20, 29, 'P');
	p.ellipse(9, top + 8, 5, 2.5, 'C').rim('C', 'c');
	p.rect(6, top + 6, 2, 1, 'k').set(6, top + 7, 'k');
	p.rect(10, top + 3, 2, 2, 'k').rect(16, top + 4, 2, 2, 'k');
	p.set(10, top + 3, 'w').set(16, top + 4, 'w');
	p.rect(9, top + 9, 3, 1, 'c');
	p.rect(7, top + 10, 2, 1, 'p');
	p.rect(9, top + 1, 4, 1, 'q');
	return finish(p, [13, top], [13, top + 13]);
}

// ── Cloverruff: a floppy-eared pup with a soft moss saddle ─────────────────

export function cloverruffEgg(): PetArt {
	const p = frame().ellipse(15.5, 25, 7, 5, 'C').ellipse(15.5, 21, 5, 6, 'C');
	p.rim('C', 'c').rect(12, 18, 2, 3, 'd');
	p.stamp(12, 23, ['.PP.PP.', 'PPPPPPP', '.PPPPP.', '..ppp..']);
	return finish(p, [16, 15], [16, 26]);
}

export function mossling(stage: Exclude<PetStage, 'egg'>): PetArt {
	const n = stage === 'baby' ? 0 : stage === 'teen' ? 1 : 2;
	const top = [16, 12, 9][n];
	const p = frame();
	// The tail rises from the rump; the long hanging ears stay separate from it.
	p.stamp(24, 20 - n, ['..PP.', '.PqqP', 'PPqP.', 'PPp..', 'PP...', 'PP...']);
	p.ellipse(18, 25, 7 + n, 4, 'P');
	p.rect(10, 26, 3, 5, 'P').rect(21, 26, 3, 5, 'P');
	p.rect(13, 27, 2, 3, 'p').rect(24, 27, 2, 3, 'p');
	p.rect(10, 29, 4, 2, 'C').rect(21, 29, 4, 2, 'C');
	p.ellipse(12, 23, 4, 5, 'P').rim('P', 'p');
	p.ellipse(19, 23, 5 + n, 2.5, 'q').rim('q', 'P');
	p.ellipse(13, top + 5, 6, 5.5, 'P').rim('P', 'p');
	p.ellipse(7, top + 5, 2, 4, 'p');
	p.ellipse(18, top + 6, 2.5, 5, 'p').rect(17, top + 3, 2, 4, 'P');
	p.ellipse(8, top + 9, 4.5, 2.5, 'C').rim('C', 'c');
	p.rect(4, top + 7, 2, 2, 'k').set(4, top + 7, 'w');
	p.rect(10, top + 4, 2, 2, 'k').rect(14, top + 4, 2, 2, 'k');
	p.set(10, top + 4, 'w').set(14, top + 4, 'w');
	p.rect(8, top + 10, 3, 1, 'p').rect(10, top + 1, 4, 1, 'q');
	if (n > 0) p.stamp(20, 20, ['.qq.', 'qqqP', '.qPP']);
	return finish(p, [13, top], [13, top + 13]);
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
