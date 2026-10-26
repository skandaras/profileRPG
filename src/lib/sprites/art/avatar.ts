/**
 * The code-drawn avatar parts, all on one 32×40 frame (see frames.ts).
 *
 * Landmarks every part is drawn against:
 *   head   ellipse centred (15.5, 18), rows 11–24
 *   eyes   rows 18–21, x 10–12 and 19–21
 *   torso  rows 26–32, x 11–20; arms x 9–10 / 21–22
 *   legs   rows 33–36; feet rows 37–38
 * Shapes are drawn on the left and mirrored where the part is symmetric.
 */
import { Pix, type Sprite } from '../grid';
import * as Garden from './garden-avatar';
import { AVATAR } from '../frames';

const frame = () => new Pix(AVATAR.w, AVATAR.h);

// ── Bodies ──────────────────────────────────────────────────────────────────

function baseBody(ears: 'pointed' | 'none'): Pix {
	const p = frame();
	p.ellipse(15.5, 18, 7.5, 7, 'S');
	p.rect(14, 25, 2, 2, 's');
	// torso and limbs, left side then mirrored
	p.rect(11, 26, 5, 7, 'S');
	p.set(10, 26, 'S');
	p.rect(9, 27, 2, 5, 'S');
	p.rect(9, 32, 2, 1, 't');
	p.rect(12, 33, 3, 4, 'S');
	p.rect(11, 37, 4, 2, 'S');
	if (ears === 'pointed') {
		p.set(4, 15, 'S').rect(4, 16, 2, 1, 'S').rect(5, 17, 3, 1, 'S').rect(6, 18, 2, 1, 'S').set(7, 19, 'S');
		p.set(6, 17, 's').set(7, 18, 's');
	}
	p.mirror();
	// light from the upper left: shade the right-hand rim, catch a highlight on the left cheek
	p.rim('S', 's', 1, 0);
	p.rim('S', 's', 0, 1);
	p.set(10, 16, 't').set(11, 15, 't').set(10, 17, 't');
	p.rect(14, 25, 4, 1, 's');
	return p.outline();
}

export const bodyHuman = Garden.body;
export const bodyElf = (): Sprite => baseBody('pointed').toSprite();
export const bodyBeast = (): Sprite => baseBody('none').toSprite();

/** Cat ears in the hair colour, drawn above the hair layer. */
export function catEars(): Sprite {
	const p = frame();
	p.stamp(8, 7, ['H.....', 'HH....', 'HrH...', 'HrrH..', 'HHHHH.']);
	p.mirror();
	p.rim('H', 'h', 1, 0);
	return p.outline().toSprite();
}

export function catTail(): Sprite {
	const p = frame();
	p.line(21, 31, 24, 30, 'H').line(24, 30, 26, 27, 'H').line(26, 27, 26, 23, 'H').line(26, 23, 25, 21, 'H');
	p.line(22, 31, 25, 30, 'H').line(25, 30, 27, 27, 'H').line(27, 27, 27, 23, 'H');
	p.set(25, 20, 'j').set(26, 21, 'j');
	return p.outline().toSprite();
}

export function bunnyEars(): Sprite {
	const p = frame();
	p.stamp(9, 1, ['.HH.', 'HHHH', 'HrrH', 'HrrH', 'HrrH', 'HrrH', 'HrrH', 'HrrH', '.HrH', '..HH']);
	p.mirror();
	p.rim('H', 'h', 1, 0);
	return p.outline().toSprite();
}

// ── Faces ───────────────────────────────────────────────────────────────────

/** Draw an eye at (x, 18) from a 3-wide stamp; the right eye reuses the same stamp. */
function eyes(p: Pix, rows: string[], y = 18) {
	p.stamp(10, y, rows);
	p.stamp(19, y, rows);
}

function mouth(p: Pix, rows: string[], y = 23) {
	p.stamp(16 - Math.ceil(rows[0].length / 2), y, rows);
}

function blush(p: Pix) {
	p.set(10, 22, 'r').set(11, 22, 'r').set(20, 22, 'r').set(21, 22, 'r');
}

export const faceBright = Garden.face;

export function faceCheery(): Sprite {
	const p = frame();
	eyes(p, ['.k.', 'k.k'], 19);
	mouth(p, ['mmmm', '.mm.'], 22);
	blush(p);
	return p.toSprite();
}

export function faceCalm(): Sprite {
	const p = frame();
	eyes(p, ['kkk', 'kEE', 'eff'], 19);
	mouth(p, ['m.', '.m'].map((r) => r), 23);
	return p.toSprite();
}

export function faceDetermined(): Sprite {
	const p = frame();
	p.stamp(10, 16, ['kk.']).stamp(19, 16, ['.kk']);
	eyes(p, ['kkk', 'kwE', 'eEf']);
	mouth(p, ['kkk'], 23);
	return p.toSprite();
}

export function faceSleepy(): Sprite {
	const p = frame();
	eyes(p, ['...', 'kkk', '.k.'], 18);
	mouth(p, ['mm', 'mm'], 22);
	blush(p);
	return p.toSprite();
}

export function faceSparkle(): Sprite {
	const p = frame();
	eyes(p, ['kkk', 'kwE', 'Ewf', 'eEf']);
	mouth(p, ['m..m', '.mm.'], 22);
	blush(p);
	return p.toSprite();
}

// ── Features ────────────────────────────────────────────────────────────────

export function featureFreckles(): Sprite {
	const p = frame();
	p.set(10, 21, 's').set(12, 22, 's').set(11, 23, 's');
	p.set(21, 21, 's').set(19, 22, 's').set(20, 23, 's');
	return p.toSprite();
}

export function featureGlasses(): Sprite {
	const p = frame();
	p.stamp(9, 17, ['kkkkk', 'k...k', 'k...k', 'k...k', 'kkkkk']);
	p.stamp(18, 17, ['kkkkk', 'k...k', 'k...k', 'k...k', 'kkkkk']);
	p.rect(14, 18, 4, 1, 'k');
	p.set(8, 18, 'k').set(23, 18, 'k');
	return p.toSprite();
}

export function featureStar(): Sprite {
	const p = frame();
	p.stamp(19, 21, ['.A.', 'AbA', '.A.']);
	return p.toSprite();
}

export function featureBandage(): Sprite {
	const p = frame();
	p.stamp(9, 21, ['wGw', 'GwG']);
	return p.toSprite();
}

// ── Hair ────────────────────────────────────────────────────────────────────

/**
 * The crown every front style starts from: a dome a little wider than the
 * head, cut away where the face shows. Styles then add a fringe and sides.
 */
function crown(p: Pix, top = 9.5) {
	p.ellipse(15.5, 18, 8.5, 18 - top, 'H');
	for (let y = 17; y < AVATAR.h; y++) for (let x = 0; x < AVATAR.w; x++) p.set(x, y, '.');
}

function shadeHair(p: Pix) {
	p.rim('H', 'h', 0, 1);
	p.rim('H', 'h', 1, 0);
	// a shine band across the crown
	for (const [x, y] of [
		[10, 11],
		[11, 11],
		[12, 10],
		[13, 10],
		[14, 10],
		[9, 12]
	])
		p.paint(x, y, 'j');
	return p.outline();
}

export function hairShort(): Sprite {
	const p = frame();
	crown(p, 9.5);
	p.stamp(8, 17, ['HHH', 'HH.', 'H..']);
	p.stamp(12, 17, ['HHH.H', 'HH...']);
	p.mirror();
	return shadeHair(p).toSprite();
}

export function hairSpiky(): Sprite {
	const p = frame();
	crown(p, 10);
	// spikes leaning outward from the crown, tallest in the middle
	const spikes: [number, number, number][] = [
		[7, 4, -1],
		[10.5, 6, -1],
		[14.5, 7, 0],
		[18.5, 6, 1],
		[22, 5, 1],
		[24.5, 3, 1]
	];
	for (const [cx, height, lean] of spikes) {
		for (let i = 0; i <= height; i++) {
			const half = ((height - i) / height) * 2;
			const x0 = cx + (lean * i) / 2;
			for (let x = Math.round(x0 - half); x <= Math.round(x0 + half); x++) p.set(x, 12 - i, 'H');
		}
	}
	p.stamp(8, 17, ['HHHH.HHH', 'HH...H..', 'H.......']);
	p.stamp(16, 17, ['HHH.HHHH', '..H...HH', '.......H']);
	return shadeHair(p).toSprite();
}

export const hairBob = Garden.hair;

export function hairLongFront(): Sprite {
	const p = frame();
	crown(p, 9.5);
	p.rect(7, 17, 2, 13, 'H').set(9, 17, 'H').set(9, 18, 'H');
	p.stamp(10, 17, ['HHHHHH', 'H.HH.H', '..H...']);
	p.mirror();
	return shadeHair(p).toSprite();
}

/** Long hair falls behind the shoulders, under the body layer. */
export function hairLongBack(): Sprite {
	const p = frame();
	p.ellipse(15.5, 19, 9, 9, 'H');
	p.rect(6, 19, 20, 14, 'H');
	p.stamp(6, 33, ['HHH....', '.H.....']);
	p.mirror();
	p.rim('H', 'h', 0, 1);
	p.rim('H', 'h', 1, 0);
	return p.outline().toSprite();
}

export function hairTwinTailsBack(): Sprite {
	const p = frame();
	p.ellipse(4.5, 25, 3, 7, 'H');
	p.ellipse(4, 33, 2, 3, 'H');
	p.mirror();
	p.rim('H', 'h', 1, 0);
	p.rim('H', 'h', 0, 1);
	p.outline();
	// hair ties sit on top of the tails, in the accent colour
	p.rect(5, 17, 3, 2, 'A').set(5, 17, 'b');
	p.rect(24, 17, 3, 2, 'A').set(24, 17, 'b');
	return p.toSprite();
}

export function hairPonytailBack(): Sprite {
	const p = frame();
	p.ellipse(25, 22, 3, 8, 'H');
	p.ellipse(26, 30, 2, 3, 'H');
	p.rim('H', 'h', 1, 0);
	p.rim('H', 'h', 0, 1);
	p.outline();
	p.rect(22, 14, 3, 2, 'A');
	return p.toSprite();
}

export function hairBun(): Sprite {
	const p = frame();
	crown(p, 9.5);
	p.ellipse(15.5, 7, 4, 3.5, 'H');
	p.rect(8, 17, 2, 4, 'H');
	p.stamp(10, 17, ['HHHHHH', 'HH..H.']);
	p.mirror();
	shadeHair(p);
	p.paint(13, 5, 'j').paint(14, 4, 'j');
	return p.toSprite();
}

export function hairCurly(): Sprite {
	const p = frame();
	crown(p, 9);
	for (const [x, y] of [
		[7, 12],
		[6, 16],
		[7, 20],
		[7, 24],
		[11, 9],
		[15.5, 8]
	])
		p.ellipse(x, y, 2.5, 2.5, 'H');
	p.stamp(9, 17, ['HHHHHH', 'H.HH.H']);
	p.mirror();
	for (let x = 0; x < AVATAR.w; x++) for (let y = 17; y < 24; y++) if (x > 9 && x < 22 && y > 18) p.set(x, y, '.');
	return shadeHair(p).toSprite();
}

// ── Tops ────────────────────────────────────────────────────────────────────

function torso(p: Pix, sleeves: 'short' | 'long' | 'none', length = 33) {
	p.rect(11, 26, 5, length - 26, 'P');
	if (sleeves !== 'none') p.set(10, 26, 'P');
	if (sleeves === 'short') p.rect(9, 27, 2, 2, 'P');
	if (sleeves === 'long') p.rect(9, 27, 2, 5, 'P');
}

function shadeCloth(p: Pix) {
	p.rim('P', 'p', 1, 0);
	p.rim('P', 'p', 0, 1);
	p.rim('C', 'c', 1, 0);
	return p.outline();
}

export const topTee = Garden.top;

export function topHoodie(): Sprite {
	const p = frame();
	torso(p, 'long');
	p.rect(12, 30, 4, 2, 'p');
	p.mirror();
	p.stamp(13, 26, ['pqqp', '.ww.', '.w..'].map((r, i) => (i === 2 ? '.w.w' : r)));
	p.set(12, 27, 'q');
	return shadeCloth(p).toSprite();
}

export function topSailor(): Sprite {
	const p = frame();
	p.rect(11, 26, 5, 7, 'C');
	p.set(10, 26, 'C').rect(9, 27, 2, 2, 'C');
	p.stamp(9, 26, ['.PPPPP.', 'PP.....', 'P......']);
	p.rect(11, 32, 5, 1, 'P');
	p.mirror();
	p.stamp(14, 27, ['AA', 'aa']).set(13, 28, 'A').set(18, 28, 'A');
	p.rect(14, 26, 4, 1, 'P');
	return shadeCloth(p).toSprite();
}

export function topTunic(): Sprite {
	const p = frame();
	torso(p, 'short', 35);
	p.rect(10, 33, 1, 2, 'P');
	p.mirror();
	p.rect(11, 31, 10, 1, 'A');
	p.set(15, 31, 'b');
	p.stamp(14, 26, ['pCCp', '.pp.']);
	return shadeCloth(p).toSprite();
}

export function topTank(): Sprite {
	const p = frame();
	torso(p, 'none');
	p.rect(14, 26, 2, 1, '.');
	p.mirror();
	p.rect(13, 26, 6, 1, '.');
	p.set(12, 28, 'q');
	return shadeCloth(p).toSprite();
}

export function topKimono(): Sprite {
	const p = frame();
	torso(p, 'long', 34);
	p.rect(8, 28, 1, 4, 'P');
	p.mirror();
	// the crossed collar, left over right
	p.line(13, 26, 17, 30, 'C').line(14, 26, 17, 29, 'C').line(18, 26, 15, 29, 'C');
	p.rect(11, 31, 10, 2, 'A').set(16, 31, 'b');
	return shadeCloth(p).toSprite();
}

export function topVest(): Sprite {
	const p = frame();
	p.rect(11, 26, 5, 7, 'C');
	p.set(10, 26, 'C').rect(9, 27, 2, 3, 'C');
	p.rect(11, 26, 3, 7, 'P').set(14, 30, 'P').set(14, 31, 'P');
	p.mirror();
	p.set(13, 29, 'A').set(18, 29, 'A');
	return shadeCloth(p).toSprite();
}

export function topSweater(): Sprite {
	const p = frame();
	torso(p, 'long');
	p.mirror();
	for (let x = 11; x <= 20; x += 2) p.set(x, 32, 'p');
	p.set(9, 31, 'p').set(22, 31, 'p');
	p.rect(14, 26, 4, 1, 'q');
	p.set(13, 28, 'q').set(15, 29, 'q').set(17, 28, 'q').set(19, 29, 'q');
	return shadeCloth(p).toSprite();
}

// ── Bottoms ─────────────────────────────────────────────────────────────────

export const bottomShorts = Garden.bottom;

export function bottomPants(): Sprite {
	const p = frame();
	p.rect(11, 32, 5, 2, 'P');
	p.rect(11, 34, 4, 3, 'P');
	p.mirror();
	p.rect(15, 34, 2, 3, '.');
	return shadeCloth(p).toSprite();
}

export function bottomSkirt(): Sprite {
	const p = frame();
	p.stamp(9, 32, ['..PPPPP', '.PPPPPP', 'PPPPPPP', 'PqPqPqP']);
	p.mirror();
	return shadeCloth(p).toSprite();
}

export function bottomOveralls(): Sprite {
	const p = frame();
	p.rect(12, 28, 4, 4, 'P').rect(12, 26, 1, 2, 'P');
	p.rect(11, 32, 5, 2, 'P');
	p.rect(11, 34, 4, 3, 'P');
	p.mirror();
	p.rect(15, 34, 2, 3, '.');
	p.set(12, 28, 'A').set(19, 28, 'A');
	return shadeCloth(p).toSprite();
}

// ── Shoes ───────────────────────────────────────────────────────────────────

export const shoesSneakers = Garden.shoes;

export function shoesBoots(): Sprite {
	const p = frame();
	p.rect(12, 35, 3, 2, 'P').rect(11, 37, 4, 2, 'P').rect(11, 35, 4, 1, 'p');
	p.mirror();
	p.rim('P', 'p', 0, 1);
	return p.outline().toSprite();
}

export function shoesSandals(): Sprite {
	const p = frame();
	p.rect(11, 38, 4, 1, 'P').set(13, 37, 'P');
	p.mirror();
	return p.outline().toSprite();
}

// ── Headwear ────────────────────────────────────────────────────────────────

export function hatCap(): Sprite {
	const p = frame();
	p.ellipse(15.5, 13, 8, 5, 'P');
	for (let y = 13; y < AVATAR.h; y++) for (let x = 0; x < AVATAR.w; x++) p.set(x, y, '.');
	p.rect(7, 13, 18, 1, 'P').rect(3, 14, 13, 1, 'p');
	p.set(15, 8, 'C').set(16, 8, 'C');
	p.rim('P', 'p', 1, 0);
	p.set(11, 10, 'q').set(12, 9, 'q');
	return p.outline().toSprite();
}

export function hatBeanie(): Sprite {
	const p = frame();
	p.ellipse(15.5, 14, 8.5, 6.5, 'P');
	for (let y = 14; y < AVATAR.h; y++) for (let x = 0; x < AVATAR.w; x++) p.set(x, y, '.');
	p.rect(7, 13, 18, 2, 'C');
	for (let x = 8; x < 24; x += 2) p.set(x, 14, 'c');
	p.ellipse(15.5, 6, 2, 2, 'C');
	p.rim('P', 'p', 1, 0);
	return p.outline().toSprite();
}

export function hatFlowers(): Sprite {
	const p = frame();
	p.line(8, 14, 23, 14, 'c').line(9, 13, 22, 13, 'c');
	for (const [x, ch] of [
		[8, 'P'],
		[12, 'A'],
		[16, 'P'],
		[20, 'A']
	] as const)
		p.stamp(x, 11, ['.' + ch + '.', ch + 'b' + ch, '.' + ch + '.']);
	return p.outline().toSprite();
}

export function hatWizard(): Sprite {
	const p = frame();
	p.stamp(13, 0, ['....PP', '...PPP', '...PPP', '..PPPP', '..PPPP', '.PPPPP', '.PPPPP', 'PPPPPP', 'PPPPPP', 'PPPPPP', 'PPPPPP', 'PPPPPP']);
	p.mirror();
	for (let x = 0; x < 6; x++) p.set(13 + x, 0, '.').set(13 + x, 1, '.');
	p.stamp(17, 0, ['.PP', 'PPP']);
	p.rect(5, 12, 22, 2, 'P');
	p.rect(10, 10, 12, 1, 'A');
	p.stamp(14, 4, ['.b.', 'bAb', '.b.']);
	p.rim('P', 'p', 1, 0);
	return p.outline().toSprite();
}

export function hatCrown(): Sprite {
	const p = frame();
	p.stamp(10, 6, ['A..A..A', 'AA.A.AA', 'AAAAAAA', 'AbARAbA', 'AAAAAAA']);
	p.mirror();
	p.stamp(12, 9, ['bA', 'AA']).stamp(18, 9, ['Ab', 'AA']);
	p.replace('R', 'r');
	p.rim('A', 'a', 0, 1);
	return p.outline().toSprite();
}

export function hatHeadband(): Sprite {
	const p = frame();
	p.rect(8, 14, 16, 2, 'P');
	p.stamp(22, 15, ['PP.', '.PP', '..P']);
	p.rect(14, 14, 4, 2, 'A');
	return p.outline().toSprite();
}

// ── Accessories ─────────────────────────────────────────────────────────────

export function accScarf(): Sprite {
	const p = frame();
	p.rect(11, 25, 10, 2, 'P');
	p.rect(17, 27, 3, 4, 'P');
	for (let x = 11; x < 21; x += 3) p.set(x, 26, 'q');
	p.set(17, 31, 'p').set(19, 31, 'p');
	p.rim('P', 'p', 0, 1);
	return p.outline().toSprite();
}

export function accCape(): Sprite {
	const p = frame();
	p.stamp(7, 25, ['...PPPPP', '..PPPPPP', '.PPPPPPP', '.PPPPPPP', 'PPPPPPPP', 'PPPPPPPP', 'PPPPPPPP', 'PPPPPPPP', 'PPPPPPPP', 'PPPPPPPP', 'PPPPPPPP', 'PPPPPPPP', 'pPpPpPpP']);
	p.mirror();
	p.rim('P', 'p', 1, 0);
	return p.outline().toSprite();
}

export function accWings(): Sprite {
	const p = frame();
	p.stamp(0, 18, ['......CC', '...CCCCC', '.CCCCCCC', 'CCCCdCCC', 'CCCdCCCC', '.CCCCCCC', '..CCCCCC', '...CdCCC', '....CCCC', '......CC']);
	p.mirror();
	p.rim('C', 'c', 0, 1);
	return p.outline().toSprite();
}

export function accBackpack(): Sprite {
	const p = frame();
	p.rect(8, 26, 16, 8, 'P');
	p.rect(8, 26, 16, 1, 'p');
	p.rim('P', 'p', 1, 0);
	return p.outline().toSprite();
}

export function accBackpackStraps(): Sprite {
	const p = frame();
	p.rect(11, 26, 1, 6, 'p');
	p.rect(20, 26, 1, 6, 'p');
	return p.toSprite();
}

export function accSword(): Sprite {
	const p = frame();
	p.stamp(22, 22, ['....w', '...wG', '..wG.', '.wG..', 'aG...', '.a...', 'A.A..']);
	p.set(21, 30, 'A');
	return p.outline().toSprite();
}

export const hairBobBack = Garden.hairBack;
