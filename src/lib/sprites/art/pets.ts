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

function finish(p: Pix, head: [number, number], neck: [number, number]): PetArt {
	return { sprite: p.outline().toSprite(), anchors: { head, neck } };
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
	// A level eye pair stays inside the brow and two rows above the snout.
	p.rect(10, top + 4, 2, 2, 'k').rect(15, top + 4, 2, 2, 'k');
	p.set(10, top + 4, 'w').set(15, top + 4, 'w');
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

// ── Cairnback: a stone tortoise carrying a little cluster of jade ───────────

function missionEgg(): Pix {
	return frame().ellipse(15.5, 25, 7, 5, 'C').ellipse(15.5, 21, 5, 6, 'C')
		.rim('C', 'c').rect(12, 18, 2, 3, 'd');
}

export function cairnbackEgg(): PetArt {
	const p = missionEgg();
	p.stamp(12, 23, ['..PPPP..', '.PqqPPP.', 'PPPPppPP', '.pppppp.']);
	p.stamp(17, 14, ['.b.', 'bAA', 'bAa', '.aa']);
	return finish(p, [16, 15], [16, 26]);
}

export function pebblet(stage: Exclude<PetStage, 'egg'>): PetArt {
	const n = stage === 'baby' ? 0 : stage === 'teen' ? 1 : 2;
	const top = [18, 15, 12][n];
	const p = frame();
	p.stamp(26, 26, ['PP.', 'PPP', 'Pp.']);
	p.rect(10, 27, 4, 4, 'P').rect(22, 27, 4, 4, 'P').rim('P', 'p');
	p.rect(10, 29, 3, 1, 'q').rect(22, 29, 3, 1, 'q');
	// A separate dome keeps the shell's edge readable behind the long neck.
	const shell = frame().ellipse(20, 24 - n, 7 + n, 5 + n, 'P');
	shell.rim('P', 'p').ellipse(18, 21 - n, 4, 2, 'q', true);
	shell.stamp(16, 24 - n, ['ppPPPPp', 'pPPPPPp', 'pPPPPpp']);
	shell.rect(14, 27, 13, 1, 'c');
	p.over(shell.outline());
	p.stamp(21, 15 - n * 3, ['..b..', '.bbA.', '.bAA.', 'bbAAa', '.AAaa', '.aaa.']);
	if (n > 0) p.stamp(26, 18 - n * 2, ['.b.', 'bAA', 'bAa', '.aa']);
	p.ellipse(11, 25, 3, 4, 'P').rect(9, top + 6, 4, 25 - top - 6, 'P').rim('P', 'p');
	p.rect(9, top + 9, 2, 27 - top - 9, 'C').rim('C', 'c');
	const face = frame().ellipse(10, top + 4, 5, 4, 'P');
	face.ellipse(6.5, top + 7, 3.5, 2, 'C').rim('P', 'p').rim('C', 'c');
	face.rect(7, top + 1, 4, 1, 'q');
	face.rect(7, top + 4, 2, 2, 'k').rect(12, top + 4, 2, 2, 'k');
	face.set(7, top + 4, 'w').set(12, top + 4, 'w');
	face.rect(5, top + 8, 3, 1, 'c');
	p.over(face.outline());
	return finish(p, [10, top], [10, top + 11]);
}

// ── Cloudwool: a cream-fleeced lamb with round amber horns ─────────────────

export function cloudwoolEgg(): PetArt {
	const p = missionEgg();
	p.stamp(11, 23, ['.PP.PP...', 'PqqPPPP..', 'PPPPPPPp.', '.ppp.pp..']);
	p.stamp(18, 15, ['.AAA', 'Ab.A', 'AAa.']);
	return finish(p, [16, 15], [16, 26]);
}

export function fluffle(stage: Exclude<PetStage, 'egg'>): PetArt {
	const n = stage === 'baby' ? 0 : stage === 'teen' ? 1 : 2;
	const top = [16, 12, 9][n];
	const p = frame();
	p.ellipse(27, 23, 2, 2, 'C');
	p.rect(11, 26, 3, 5, 'P').rect(22, 26, 3, 5, 'P');
	p.rect(14, 27, 2, 3, 'p').rect(25, 27, 2, 3, 'p');
	p.rect(11, 30, 3, 1, 'p').rect(22, 30, 3, 1, 'p');
	const fleece = frame().ellipse(19, 24, 7 + n, 5, 'C');
	fleece.ellipse(15, 21, 3, 3, 'C').ellipse(21, 20, 4, 3, 'C').ellipse(25, 23, 3, 3, 'C');
	fleece.rim('C', 'c').rect(15, 20, 4, 2, 'd').rect(21, 19, 3, 1, 'd');
	p.over(fleece.outline());
	p.ellipse(12, 23, 4, 5, 'P').rim('P', 'p');
	const face = frame().ellipse(12, top + 5, 5.5, 5, 'P');
	face.ellipse(7, top + 8, 4, 2.5, 'P').rim('P', 'p');
	face.rect(4, top + 7, 2, 1, 'p').rect(5, top + 9, 4, 1, 'p');
	face.rect(8, top + 4, 2, 2, 'k').rect(13, top + 4, 2, 2, 'k');
	face.set(8, top + 4, 'w').set(13, top + 4, 'w');
	face.ellipse(10, top + 1, 4, 2, 'C').rim('C', 'c').rect(8, top, 3, 1, 'd');
	p.over(face.outline());
	// The horn curls around a dark centre; the horizontal ear rules out cat ears.
	p.over(frame().stamp(16, top + 2, ['.AAAA.', 'AbbAAa', 'AbppAa', 'AApAAa', '.AAaa.']).outline());
	p.stamp(17, top + 7, ['qqP', '.Pp']);
	return finish(p, [11, top], [12, top + 13]);
}

// ── Lamplume: a dusk moth, its folded wings like warm paper lanterns ────────

export function lamplumeEgg(): PetArt {
	const p = missionEgg();
	p.stamp(11, 23, ['.PP...PP.', 'PqPP.PPqP', 'PPAPAPAPP', '.ppPAPpp.', '...pAp...']);
	return finish(p, [16, 15], [16, 26]);
}

export function glimmerwing(stage: Exclude<PetStage, 'egg'>): PetArt {
	const n = stage === 'baby' ? 0 : stage === 'teen' ? 1 : 2;
	const top = [16, 12, 9][n];
	const p = frame();
	// Two bent feet and a rear pair ground the moth beside the walking cast.
	p.stamp(9, 27, ['pP...pP....pP', 'pP...pP....pP', 'pPP..pPP...pP', '.pp...pp...pp']);
	p.ellipse(18, 26, 7 + n, 3, 'P').rim('P', 'p');
	p.ellipse(12, 23, 4, 5, 'C').rim('C', 'c');
	// The near wing folds diagonally over the far wing, leaving the head clear.
	const far = frame().ellipse(23, 26, 5 + n, 3, 'P').rim('P', 'p');
	far.rect(22, 26, 4, 1, 'q');
	p.over(far.outline());
	const wing = frame();
	const folds = [
		['.CCC...', 'CCddC..', 'CCdCCC.', 'CCCAACC', 'CCAAbAC', 'CCAAAaC', '.CCCaCc', '..Cccc.'],
		['.CCCC...', 'CCdddC..', 'CCdddCC.', 'CCdCCCCC', 'CCCCAAAC', 'CCCAAbAC', 'CCCAAAAC', '.CCAAaCC', '.CCCCaCc', '..CCCCcc', '...Cccc.', '...ccc..'],
		['.CCCCC....', 'CCdddCC...', 'CCdddCCC..', 'CCddCCCCC.', 'CCdCCCCCCC', 'CCCCAAAACC', 'CCCAAAbbAC', 'CCCAAAAAAC', 'CCCAAAAAaC', '.CCCAAAaCC', '.CCCCCaCCc', '..CCCCCCcc', '..CCCCCcc.', '...CCccc..', '....ccc...']
	];
	wing.stamp(17, top + 5, folds[n]);
	wing.rim('C', 'c');
	p.over(wing.outline());
	const face = frame().ellipse(11, top + 5, 5.5, 4.5, 'P');
	face.ellipse(7, top + 8, 3, 2, 'C').rim('P', 'p').rim('C', 'c');
	face.rect(7, top + 1, 4, 2, 'q');
	face.rect(7, top + 4, 2, 2, 'k').rect(12, top + 4, 2, 2, 'k');
	face.set(7, top + 4, 'w').set(12, top + 4, 'w');
	face.rect(6, top + 9, 3, 1, 'c');
	p.over(face.outline());
	p.stamp(5, top - 4, ['bA...', '.aAA.', '..pA.', '...p.']);
	p.stamp(15, top - 4, ['...Ab', '.AAa.', '.Ap..', '.p...']);
	return finish(p, [11, top], [12, top + 13]);
}

// ── Pet accessories (12×8) ──────────────────────────────────────────────────
// Head pieces sit on the bottom row, drawn with their bottom-centre on the head
// anchor; neck pieces are centred on the neck anchor.

export const PET_ACC = { w: 12, h: 8 } as const;

function acc() {
	return new Pix(PET_ACC.w, PET_ACC.h);
}

export function petBow(): Sprite {
	return acc().stamp(2, 2, ['qP....Pq', 'qPP..PPq', 'PPPAAPPP', '.ppAApp.', '..P..P..'])
		.outline().toSprite();
}

export function petTopHat(): Sprite {
	return acc().stamp(2, 1, ['..PPPP..', '.PqqPPP.', '.PPPPpp.', '.AAAAAA.', 'PqPPPPPP', '.pppppp.'])
		.outline().toSprite();
}

export function petFlower(): Sprite {
	return acc().stamp(3, 1, ['..qq..', '.qPPq.', 'qPAbPq', 'qPAAPq', '.pPPp.', '..pp..'])
		.outline().toSprite();
}

export function petCrown(): Sprite {
	return acc().stamp(2, 2, ['b..bb..b', 'AA.AA.AA', 'AbAAAAbA', '.AAAAAA.', '.aaaaaa.'])
		.outline().toSprite();
}

export function petBandana(): Sprite {
	return acc().stamp(2, 1, ['qqPPPPPP', 'PPPPPPpp', '.PPPPpp.', '..PPpp..', '...Pp...'])
		.outline().toSprite();
}

export function petBell(): Sprite {
	return acc().stamp(2, 1, ['qqPPPPPP', 'PPPPPPpp', '...AA...', '..AbbA..', '..aAAa..'])
		.outline().toSprite();
}
