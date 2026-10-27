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

export const bodyHuman = () => Garden.body('human');
export const bodyElf = () => Garden.body('elf');
export const bodyBeast = () => Garden.body('beast');
export const catEars = Garden.catEars;
export const catTail = Garden.catTail;
export const bunnyEars = Garden.bunnyEars;

// ── Faces ───────────────────────────────────────────────────────────────────

export const faceBright = () => Garden.face('bright');
export const faceCheery = () => Garden.face('cheery');
export const faceCalm = () => Garden.face('calm');
export const faceDetermined = () => Garden.face('determined');
export const faceSleepy = () => Garden.face('sleepy');
export const faceSparkle = () => Garden.face('sparkle');

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

export const hairShort = () => Garden.hair('short');
export const hairShortBack = () => Garden.hairBack('short');
export const hairSpiky = () => Garden.hair('spiky');
export const hairSpikyBack = () => Garden.hairBack('spiky');
export const hairBob = () => Garden.hair('bob');
export const hairBobBack = () => Garden.hairBack('bob');
export const hairLongFront = () => Garden.hair('long');
export const hairLongBack = () => Garden.hairBack('long');
export const hairTwinTails = () => Garden.hair('twintails');
export const hairTwinTailsBack = () => Garden.hairBack('twintails');
export const hairPonytail = () => Garden.hair('ponytail');
export const hairPonytailBack = () => Garden.hairBack('ponytail');
export const hairBun = () => Garden.hair('bun');
export const hairBunBack = () => Garden.hairBack('bun');
export const hairCurly = () => Garden.hair('curly');
export const hairCurlyBack = () => Garden.hairBack('curly');

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
