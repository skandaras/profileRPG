/** Rounded cloth, leaf trims and small brass fittings on the keeper landmarks. */
import { Pix } from '../grid';

const frame = () => new Pix(32, 40);
const cloth = (p: Pix) => p.rim('P', 'p').rim('C', 'c').outline().toSprite();

export function featureFreckles() {
	return frame().set(10, 22, 'p').set(12, 23, 'p').set(19, 23, 'p').set(21, 22, 'p').toSprite();
}

export function featureGlasses() {
	const p = frame();
	for (const x of [9, 18]) p.stamp(x, 18, ['.CCC.', 'C...C', 'C...C', 'C...C', '.CCC.']);
	return p.rect(14, 19, 4, 1, 'a').set(8, 19, 'a').set(23, 19, 'a')
		.rect(10, 18, 2, 1, 'd').rect(19, 18, 2, 1, 'd').toSprite();
}

export function featureStar() {
	return frame().stamp(19, 22, ['.b.', 'bAb', '.a.']).toSprite();
}

export function featureBandage() {
	return frame().stamp(10, 22, ['CCC', 'dac']).toSprite();
}

function shirt(sleeves: 'short' | 'long' | 'none') {
	const p = frame().rect(11, 27, 10, 6, 'P').rect(12, 26, 8, 1, 'P');
	if (sleeves !== 'none') {
		const h = sleeves === 'short' ? 3 : 4;
		p.rect(9, 27, 2, h, 'P').rect(21, 27, 2, h, 'P');
	}
	return p;
}

export function topHoodie() {
	const p = shirt('long').rect(12, 25, 8, 2, 'p').rect(14, 26, 4, 1, 'q');
	p.rect(13, 30, 6, 2, 'p').rect(14, 30, 4, 1, 'P');
	p.rect(13, 27, 1, 2, 'C').rect(18, 27, 1, 2, 'C').rect(10, 27, 2, 1, 'q');
	return cloth(p);
}

export function topTank() {
	const p = shirt('none').rect(13, 26, 6, 2, '.').rect(13, 28, 6, 1, 'q');
	return cloth(p.rect(12, 29, 2, 2, 'q'));
}

export function topSweater() {
	const p = shirt('long').rect(13, 26, 6, 1, 'C').rect(11, 32, 10, 1, 'p');
	p.stamp(14, 28, ['.CC.', 'CCc.', '.c..']).rect(10, 27, 2, 1, 'q');
	return cloth(p);
}

export function topSailor() {
	const p = shirt('short').rect(12, 26, 8, 2, 'C');
	p.line(12, 27, 15, 29, 'c').line(19, 27, 16, 29, 'c');
	p.stamp(14, 28, ['A..A', '.AA.', '.aa.']).rect(12, 31, 7, 1, 'q');
	return cloth(p);
}

export function topTunic() {
	const p = shirt('short').rect(11, 32, 10, 2, 'P');
	p.stamp(13, 26, ['CppC', '.CC.']).rect(11, 31, 10, 1, 'a').rect(15, 31, 2, 1, 'b');
	return cloth(p.rect(10, 27, 2, 1, 'q').rect(12, 33, 3, 1, 'q'));
}

export function topKimono() {
	const p = shirt('long').rect(8, 28, 1, 3, 'P').rect(23, 28, 1, 3, 'P');
	// The wearer's left collar crosses over the right.
	p.line(18, 26, 14, 30, 'c').line(13, 26, 17, 30, 'C');
	p.rect(11, 31, 10, 2, 'A').rect(12, 31, 7, 1, 'b').rect(10, 27, 2, 1, 'q');
	return cloth(p);
}

export function topVest() {
	const p = shirt('short').replace('P', 'C');
	p.rect(11, 27, 3, 6, 'P').rect(18, 27, 3, 6, 'P');
	p.set(14, 31, 'P').set(17, 31, 'P').rect(11, 30, 3, 1, 'p').rect(18, 30, 3, 1, 'p');
	p.rect(11, 27, 2, 1, 'q').set(13, 29, 'A').set(18, 29, 'A');
	return cloth(p);
}

export function bottomPants() {
	const p = frame().rect(11, 32, 10, 2, 'P').rect(11, 34, 4, 3, 'P').rect(17, 34, 4, 3, 'P');
	return cloth(p.rect(11, 36, 4, 1, 'p').rect(17, 36, 4, 1, 'p').rect(12, 33, 2, 2, 'q'));
}

export function bottomSkirt() {
	const p = frame().stamp(9, 32, ['..PPPPPPPP..', '.PPPPPPPPPP.', 'PPPPPPPPPPPP', 'PPPPPPPPPPPP']);
	return cloth(p.rect(12, 33, 2, 2, 'q').rect(18, 34, 2, 2, 'p'));
}

export const bottomOveralls = bottomPants;

export function bottomOverallBib() {
	// The bib sits over the shirt; the trousers keep their usual bottom depth.
	return frame().rect(12, 26, 1, 3, 'p').rect(19, 26, 1, 3, 'p')
		.rect(13, 28, 6, 5, 'p').rect(14, 28, 4, 4, 'P')
		.rect(14, 30, 4, 1, 'q').set(12, 28, 'A').set(19, 28, 'A').toSprite();
}

export function shoesBoots() {
	const p = frame();
	for (const x of [11, 17]) p.rect(x + 1, 35, 3, 3, 'P').rect(x, 37, 4, 2, 'P')
		.rect(x + 1, 35, 3, 1, 'C').rect(x, 38, 4, 1, 'p').set(x + 1, 37, 'b');
	return cloth(p);
}

export function shoesSandals() {
	const p = frame();
	for (const x of [11, 17]) {
		p.rect(x, 38, 4, 1, 'p').rect(x, 39, 4, 1, 'o')
			.set(x - 1, 38, 'o').set(x + 4, 38, 'o')
			.set(x + 1, 37, 'P').set(x + 2, 37, 'q');
	}
	return p.toSprite();
}

export function hatCap() {
	const p = frame().stamp(6, 7, [
		'......PPPPPP........', '...PPPPPPPPPPPP.....', '..PPPPPPPPPPPPPP....',
		'.PPPPPPPPPPPPPPPP...', 'PPPPPPPPPPPPPPPPPP..', 'PPPPPPPPPPPPPPPPPP..',
		'.pppppppppppppppp...', 'pppppppppp..........'
	]);
	p.rect(10, 9, 5, 2, 'q').stamp(19, 10, ['.b', 'Ab', 'a.']);
	return cloth(p);
}

export function hatBeanie() {
	const p = frame().ellipse(15.5, 11, 9, 5, 'P');
	p.rect(5, 15, 22, 5, '.').rect(7, 13, 18, 2, 'C');
	p.rect(10, 8, 5, 2, 'q').ellipse(15.5, 5, 2.5, 2, 'C').rect(19, 13, 2, 2, 'A');
	return cloth(p);
}

export function hatHeadband() {
	const p = frame().rect(7, 13, 18, 2, 'P').rect(9, 13, 12, 1, 'q');
	p.stamp(22, 13, ['PP.', 'PPq', '.Pp']).stamp(18, 12, ['.b.', 'bAb', '.a.']);
	return cloth(p);
}

export function hatFlowers() {
	const p = frame().rect(7, 13, 18, 1, 'a');
	for (const x of [8, 14, 20]) p.stamp(x, 10, ['.PP.', 'PqqP', 'PAbP', '.PP.']);
	p.stamp(6, 12, ['bb', '.a']).stamp(24, 12, ['bb', 'a.']);
	return cloth(p);
}

export function hatWizard() {
	const p = frame().stamp(8, 1, [
		'..........PP...', '........PPPPP..', '.......PPPPP...', '......PPPPP....',
		'.....PPPPPP....', '....PPPPPPPP...', '....PPPPPPPP...', '...PPPPPPPPPP..',
		'...PPPPPPPPPP..', '..PPPPPPPPPPPP.', '..AAAAAAAAAAAA.', '.PPPPPPPPPPPPPP',
		'PPPPPPPPPPPPPPP'
	]);
	p.rect(5, 13, 22, 1, 'p').rect(12, 6, 2, 3, 'q').stamp(17, 7, ['.b.', 'bAb', '.a.']);
	return cloth(p);
}

export function hatCrown() {
	const p = frame().stamp(8, 7, [
		'A......AA......A', 'AA....AAAA....AA', 'AAA..AAAAAA..AAA',
		'AAAAAAAAAAAAAAAA', '.AAAAAAAAAAAAAA.', '.AAAAAAAAAAAAAA.'
	]);
	p.rect(10, 11, 4, 1, 'b').rect(19, 11, 3, 1, 'a').rect(15, 10, 2, 2, 'P');
	return p.rim('A', 'a').outline().toSprite();
}

export function accScarf() {
	const p = frame().rect(11, 25, 10, 2, 'P').rect(18, 27, 3, 4, 'P');
	p.rect(12, 25, 6, 1, 'q').rect(18, 27, 2, 1, 'p').rect(18, 30, 3, 1, 'C');
	return cloth(p);
}

export function accCape() {
	const p = frame().stamp(4, 25, [
		'......PPPPPPPPPPPP......', '....PPPPPPPPPPPPPPPP....', '..PPPPPPPPPPPPPPPPPPPP..',
		'.PPPPPPPPPPPPPPPPPPPPPP.', 'PPPPPPPPPPPPPPPPPPPPPPPP', 'PPPPPPPPPPPPPPPPPPPPPPPP',
		'PPPPPPPPPPPPPPPPPPPPPPPP', 'PPPPPPPPPPPPPPPPPPPPPPPP', '.PPPPPPPPPPPPPPPPPPPPPP.',
		'.PPPPPPPPPPPPPPPPPPPPPP.', '..PPPPPPPPPPPPPPPPPPPP..', '...PPPPPPPPPPPPPPPPPP...'
	]);
	p.rect(5, 30, 2, 3, 'q').rect(25, 30, 2, 3, 'p').rect(8, 35, 3, 1, 'A').rect(21, 35, 3, 1, 'A');
	return cloth(p);
}

export function accWings() {
	const p = frame().stamp(1, 20, [
		'..PP.........', '.PqqPP.......', 'PqqPPPP......', 'PqPPPPPP.....',
		'PPPPPPPPP....', '.PPPPPPPPP...', '..ppPPPPPPP..', '...ppPPPPPPP.',
		'..PPPPPPPPPPP', '.PPqPPPPPPPPP', '.PPPPPPPPPPPP', '..PPPPPPPPPPP',
		'...PPPPPPPPP.', '.....PPPPP...'
	]);
	p.mirror().line(4, 24, 11, 29, 'C').line(5, 30, 10, 30, 'C')
		.line(27, 24, 20, 29, 'C').line(26, 30, 21, 30, 'C');
	return cloth(p);
}

export function accBackpack() {
	const p = frame().rect(8, 27, 16, 7, 'P').rect(9, 26, 14, 1, 'P');
	p.rect(6, 30, 3, 4, 'P').rect(23, 30, 3, 4, 'P')
		.rect(6, 30, 3, 1, 'q').rect(23, 30, 3, 1, 'p').rect(9, 33, 14, 1, 'p');
	return cloth(p);
}

export function accBackpackStraps() {
	return frame().rect(11, 26, 2, 5, 'p').rect(19, 26, 2, 5, 'p')
		.rect(11, 27, 1, 3, 'q').rect(19, 27, 1, 3, 'P')
		.set(11, 30, 'A').set(20, 30, 'A').toSprite();
}

export function accSword() {
	// A broad wooden blade stays outside the face and meets the right hand.
	const p = frame().stamp(23, 21, ['.....P', '....Pq', '...PqP', '..PqP.', '.PqP..', 'PqP...']);
	p.line(22, 27, 25, 30, 'A').line(21, 29, 23, 27, 'p').set(21, 30, 'P');
	return cloth(p);
}
