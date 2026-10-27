/** Broad cloth shapes and a single defining detail on the keeper landmarks. */
import { Pix } from '../grid';

const frame = () => new Pix(32, 40);
const cloth = (p: Pix) => p.outline().toSprite();

export function featureFreckles() {
	return frame().set(10, 22, 'p').set(12, 23, 'p').set(19, 23, 'p').set(21, 22, 'p').toSprite();
}

export function featureGlasses() {
	// The lower rims sit below the eyes and the top edge clears every fringe.
	return frame().rect(9, 18, 5, 1, 'C').rect(9, 19, 1, 3, 'C').rect(13, 19, 1, 3, 'C')
		.rect(10, 22, 3, 1, 'C').rect(14, 18, 2, 1, 'C').mirror().toSprite();
}

export function featureStar() {
	return frame().stamp(19, 22, ['.b.', 'bbb', '.b.']).toSprite();
}

export function featureBandage() {
	return frame().rect(10, 22, 4, 2, 'C').rect(11, 22, 2, 2, 'c').toSprite();
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
	const p = shirt('long').rect(12, 25, 8, 2, 'P').rect(14, 26, 4, 1, 'p');
	return cloth(p.rect(13, 30, 6, 1, 'C'));
}

export function topTank() {
	return cloth(shirt('none').rect(13, 26, 6, 2, '.'));
}

export function topSweater() {
	const p = shirt('long').rect(13, 26, 6, 1, 'C');
	return cloth(p.stamp(14, 28, ['.CC.', 'CCCC', '.CC.']));
}

export function topSailor() {
	const p = shirt('short').stamp(12, 26, ['CCC..CCC', '.CC..CC.', '..CCCC..']);
	return cloth(p.rect(15, 29, 2, 2, 'A'));
}

export function topTunic() {
	const p = shirt('short').rect(11, 32, 10, 2, 'P');
	p.stamp(13, 26, ['CCppCC', '.CCCC.']).rect(11, 31, 10, 1, 'A');
	return cloth(p);
}

export function topKimono() {
	const p = shirt('long').rect(8, 28, 1, 3, 'P').rect(23, 28, 1, 3, 'P');
	// The wearer's left collar crosses over the right.
	p.line(18, 26, 14, 30, 'c').line(13, 26, 17, 30, 'C');
	return cloth(p.rect(11, 31, 10, 2, 'A'));
}

export function topVest() {
	const p = shirt('short').replace('P', 'C');
	return cloth(p.rect(11, 27, 3, 6, 'P').rect(18, 27, 3, 6, 'P'));
}

export function bottomPants() {
	return cloth(frame().rect(11, 32, 10, 2, 'P').rect(11, 34, 4, 3, 'P').rect(17, 34, 4, 3, 'P'));
}

export function bottomSkirt() {
	return cloth(frame().stamp(10, 32, ['..PPPPPPPP..', '.PPPPPPPPPP.', 'PPPPPPPPPPPP', 'PPPPPPPPPPPP']));
}

export const bottomOveralls = bottomPants;

export function bottomOverallBib() {
	// The bib sits over the shirt; the trousers keep their usual bottom depth.
	return frame().rect(12, 26, 2, 4, 'P').rect(18, 26, 2, 4, 'P')
		.rect(13, 28, 6, 5, 'P').rect(14, 30, 4, 1, 'p').toSprite();
}

export function shoesBoots() {
	return cloth(frame().rect(12, 35, 3, 3, 'P').rect(11, 37, 4, 2, 'P')
		.rect(12, 35, 3, 1, 'C').rect(11, 38, 4, 1, 'p').mirror());
}

export function shoesSandals() {
	// Dark soles and a broad strap remain separate from the bare skin.
	return cloth(frame().rect(11, 38, 4, 1, 'p').rect(12, 37, 2, 1, 'p').mirror());
}

export function hatCap() {
	const p = frame().ellipse(15.5, 11, 9, 4, 'P');
	p.rect(5, 14, 22, 5, '.').rect(5, 14, 13, 1, 'P').rect(10, 9, 5, 2, 'q');
	return cloth(p);
}

export function hatBeanie() {
	const p = frame().ellipse(15.5, 11, 9, 5, 'P');
	p.rect(5, 15, 22, 5, '.').rect(7, 13, 18, 2, 'C');
	return cloth(p.ellipse(15.5, 5, 2.5, 2, 'C'));
}

export function hatHeadband() {
	const p = frame().rect(7, 13, 18, 2, 'P');
	return cloth(p.stamp(22, 12, ['PP..', 'PPPP', '.PPP', '..PP']));
}

export function hatFlowers() {
	const p = frame().rect(7, 15, 18, 1, 'A');
	// Broad petals and pale centres distinguish the three blooms from the band.
	for (const x of [6, 22]) p.stamp(x, 10, ['.PP.', 'PPPP', 'PCCP', 'PPPP', '.PP.']);
	p.stamp(13, 9, ['..PP..', 'PPPPPP', 'PPCCPP', 'PPCCPP', 'PPPPPP', '..PP..']);
	return cloth(p);
}

export function hatWizard() {
	const p = frame().stamp(8, 1, [
		'..........PP...', '........PPPPP..', '.......PPPPP...', '......PPPPP....',
		'.....PPPPPP....', '....PPPPPPPP...', '....PPPPPPPP...', '...PPPPPPPPPP..',
		'...PPPPPPPPPP..', '..PPPPPPPPPPPP.', '..AAAAAAAAAAAA.', '.PPPPPPPPPPPPPP',
		'PPPPPPPPPPPPPPP'
	]);
	return cloth(p.rect(5, 13, 22, 1, 'P').rect(13, 6, 2, 4, 'q'));
}

export function hatCrown() {
	const p = frame().stamp(8, 7, [
		'AA.....AA.....AA', 'AAA...AAAA...AAA', 'AAAA.AAAAAA.AAAA',
		'AAAAAAAAAAAAAAAA', '.AAAAAAAAAAAAAA.', '.AAAAAAAAAAAAAA.'
	]);
	return cloth(p.rect(15, 10, 2, 2, 'P'));
}

export function accScarf() {
	return cloth(frame().rect(11, 25, 10, 2, 'P').rect(18, 27, 3, 4, 'P'));
}

export function accCape() {
	const p = frame().stamp(4, 25, [
		'......PPPPPPPPPPPP......', '....PPPPPPPPPPPPPPPP....', '..PPPPPPPPPPPPPPPPPPPP..',
		'.PPPPPPPPPPPPPPPPPPPPPP.', 'PPPPPPPPPPPPPPPPPPPPPPPP', 'PPPPPPPPPPPPPPPPPPPPPPPP',
		'PPPPPPPPPPPPPPPPPPPPPPPP', 'PPPPPPPPPPPPPPPPPPPPPPPP', '.PPPPPPPPPPPPPPPPPPPPPP.',
		'..PPPPPPPPPPPPPPPPPPPP..', '....PPPPPPPPPPPPPPPP....', '......PPPPPPPPPPPP......'
	]);
	return cloth(p.rect(5, 29, 2, 4, 'q'));
}

export function accWings() {
	const p = frame().stamp(1, 20, [
		'..PPPP.......', '.PPPPPP......', 'PPPPPPPP.....', 'PPPPPPPPP....',
		'PPPPPPPPPP...', '.PPPPPPPPPP..', '..PPPPPPPPPP.', '...PPPPPPPPPP',
		'..PPPPPPPPPPP', '.PPPPPPPPPPPP', '.PPPPPPPPPPPP', '..PPPPPPPPPPP',
		'...PPPPPPPPP.', '.....PPPPP...'
	]);
	return cloth(p.line(4, 24, 11, 29, 'C').mirror());
}

export function accBackpack() {
	const p = frame().rect(8, 27, 16, 7, 'P').rect(9, 26, 14, 1, 'P');
	// Low pockets protrude beyond the hair and stay below the hands.
	return cloth(p.rect(5, 33, 4, 3, 'P').rect(23, 33, 4, 3, 'P')
		.rect(5, 33, 22, 1, 'p'));
}

export function accBackpackStraps() {
	return frame().rect(11, 26, 2, 5, 'P').rect(19, 26, 2, 5, 'P').toSprite();
}

export function accSword() {
	// The blade clears long hair; its guard sits above the hand on the same diagonal.
	const p = frame().stamp(26, 19, ['...PP', '...PP', '..PPP', '..PPP', '.PPP.', '.PPP.', 'PPP..', 'PPP..']);
	p.line(29, 21, 27, 25, 'q').line(24, 26, 29, 29, 'A').line(24, 27, 29, 30, 'A');
	return cloth(p.line(23, 32, 26, 29, 'p').line(24, 32, 27, 29, 'p'));
}
