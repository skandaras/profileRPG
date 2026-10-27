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
// A shared shell keeps every crest inside the same centred contour.
function egg(mark: string[]): PetArt {
	const p = frame().ellipse(15.5, 25, 7, 5, 'C').ellipse(15.5, 21, 5, 6, 'C');
	p.rect(12, 28, 8, 2, 'c').rect(14, 17, 4, 2, 'd');
	p.stamp((32 - mark[0].length) / 2, 22, mark);
	return finish(p, [16, 15], [16, 26]);
}

export function bramblebackEgg(): PetArt {
	return egg(['P....P', 'PP..PP', '.PPPP.', '..PP..']);
}

export function emberkit(stage: Exclude<PetStage, 'egg'>): PetArt {
	const n = stage === 'baby' ? 0 : stage === 'teen' ? 1 : 2;
	const top = [16, 12, 9][n];
	const p = frame();
	// A rising tail makes room for the ridge without crowding the face.
	p.stamp(22, 21 - n, ['.....PP', '.....PP', '....PPP', '...PPP.', '..PPPP.', 'PPPPP..', 'PPPP...']);
	p.stamp(27, 17 - n, ['.AA', 'AAA', 'AAA', '.AA']);
	for (let i = 0; i < 3; i++) p.stamp(22 + i * 2, 22 - n - i * 2, ['A.', 'AA']);
	p.ellipse(17, 26, 7 + n, 4, 'P').rect(11, top + 7, 8, 25 - top - 7, 'P');
	p.ellipse(15, 24, 4, 5, 'P');
	p.rect(9, 28, 4, 3, 'P').rect(20, 28, 4, 3, 'P');
	p.ellipse(13, 26, 4, 3, 'C');
	p.rect(11, 25, 3, 2, 'd');
	// The elbow projects beyond the shoulder; a dark folded finger reaches the tip.
	const folded = frame().stamp(19, 21 - n, [
		'.....PP.', 'PP..PPPP', 'PPPPPAAP', '.PAAAAP.', '.PAAAAP.', '..PAAAP.', '...PPPP.', '....PP..'
	]);
	p.over(folded.outline());
	// Swept horns join the skull at a narrow root, with no ear lobes.
	p.stamp(10, top - 3, ['A..', 'AA.', '.AA']);
	p.stamp(18, top - 3, ['....AA', '...AA.', '..AA..', '.AA...', 'AA....']);
	const face = frame().ellipse(13.5, top + 4, 6, 4.5, 'P');
	face.rect(9, top + 1, 4, 2, 'q');
	// The off-centre muzzle extends left of the skull: a clear reptile profile.
	face.stamp(4, top + 6, [
		'..PPPPPPPP', '.PPPPPPPPP', 'PPPPPPPPPP', 'PPPPPPPPPP', '.PPPPPPPP.'
	]);
	face.rect(9, top + 4, 2, 2, 'k').rect(15, top + 4, 2, 2, 'k');
	face.set(9, top + 4, 'w').set(15, top + 4, 'w');
	face.rect(7, top + 10, 5, 1, 'p');
	p.over(face.outline());

	return finish(p, [14, top], [14, top + 13]);
}

// ── Brookbell: a river seal with a cream bib and broad swimming flippers ────

export function brookbellEgg(): PetArt {
	return egg(['..PP..', '.PPPP.', 'PPPPPP', '.PPPP.', '..PP..', '.P..P.']);
}

export function puddlefin(stage: Exclude<PetStage, 'egg'>): PetArt {
	const n = stage === 'baby' ? 0 : stage === 'teen' ? 1 : 2;
	const top = [16, 12, 9][n];
	const p = frame();
	// Paired rear flippers and a single broad foreflipper give a swimming profile.
	p.stamp(24, 25 - n, ['....PPP', '..PPPPP', 'PPPPPP.', 'PPPP...', '..PPP..', '...PPP.']);
	p.ellipse(18, 26, 7 + n, 4, 'P');
	p.ellipse(13, 23, 5 + n, 6, 'P');
	p.ellipse(12.5, top + 5, 6 + n / 2, 5.5, 'P');
	p.ellipse(12, 26, 4, 4, 'C');
	p.rect(10, 27, 3, 2, 'd');
	p.over(frame().ellipse(19, 28, 4 + n / 2, 2, 'P').outline());
	p.ellipse(9, top + 8, 5, 2, 'C').rect(7, top + 10, 5, 1, 'c');
	p.rect(6, top + 6, 2, 1, 'k').set(6, top + 7, 'k');
	// A level eye pair stays inside the brow and two rows above the snout.
	p.rect(10, top + 4, 2, 2, 'k').rect(15, top + 4, 2, 2, 'k');
	p.set(10, top + 4, 'w').set(15, top + 4, 'w');

	p.rect(9, top + 1, 4, 1, 'q');
	return finish(p, [13, top], [13, top + 13]);
}

// ── Cloverruff: a floppy-eared pup with a soft moss saddle ─────────────────

export function cloverruffEgg(): PetArt {
	return egg(['PP..PP', 'PPPPPP', '.PPPP.', '..PP..']);
}

export function mossling(stage: Exclude<PetStage, 'egg'>): PetArt {
	const n = stage === 'baby' ? 0 : stage === 'teen' ? 1 : 2;
	const top = [16, 12, 9][n];
	const p = frame();
	// The tail rises from the rump; the long hanging ears stay separate from it.
	p.stamp(24, 20 - n, ['..PP.', '.PPPP', 'PPPP.', 'PPP..', 'PP...', 'PP...']);
	p.ellipse(18, 25, 7 + n, 4, 'P');
	p.rect(10, 26, 3, 5, 'P').rect(21, 26, 3, 5, 'P');
	p.rect(13, 28, 2, 3, 'P').rect(24, 28, 2, 3, 'P');
	p.rect(10, 29, 4, 2, 'C').rect(21, 29, 4, 2, 'C');
	p.ellipse(12, 23, 4, 5, 'P');
	p.ellipse(20, 23, 4 + n, 2.5, 'q');
	p.ellipse(13, top + 5, 6, 5.5, 'P');
	p.ellipse(7, top + 5, 2, 4, 'P');
	p.over(frame().ellipse(18, top + 6, 2.5, 4, 'p').outline());
	p.ellipse(8, top + 9, 4.5, 2, 'C');
	p.rect(4, top + 7, 2, 2, 'k').set(4, top + 7, 'w');
	p.rect(10, top + 4, 2, 2, 'k').rect(14, top + 4, 2, 2, 'k');
	p.set(10, top + 4, 'w').set(14, top + 4, 'w');
	p.rect(10, top + 1, 4, 1, 'q');
	return finish(p, [13, top], [13, top + 13]);
}

// ── Cairnback: a stone tortoise carrying a single jade crystal ───────────

export function cairnbackEgg(): PetArt {
	return egg(['..AA..', '.AAAA.', 'AAAAAA', '.AAAA.', '..AA..']);
}

export function pebblet(stage: Exclude<PetStage, 'egg'>): PetArt {
	const n = stage === 'baby' ? 0 : stage === 'teen' ? 1 : 2;
	const top = [18, 15, 12][n];
	const p = frame();
	p.stamp(26, 26, ['PP.', 'PPP', 'PP.']);
	p.rect(10, 28, 4, 3, 'P').rect(22, 28, 4, 3, 'P');
	// A separate dome keeps the shell's edge readable behind the long neck.
	const shell = frame().ellipse(20, 24 - n, 7 + n, 5 + n, 'P');
	shell.ellipse(18, 21 - n, 3, 2, 'q', true);
	for (let x = 14; x <= 27; x++) shell.paint(x, 27, 'p');
	p.over(shell.outline());
	p.stamp(21, 15 - n * 3, ['..AA..', '.bbAA.', '.bbAA.', 'AAAAAA', '.AAAA.', '..AA..']);

	p.ellipse(11, 25, 2.5, 4, 'P').rect(9, top + 6, 4, 25 - top - 6, 'P');
	p.rect(9, top + 9, 2, 27 - top - 9, 'C');
	const face = frame().ellipse(10, top + 4, 5, 4, 'P');
	face.ellipse(6.5, top + 7, 3.5, 2, 'C');
	face.rect(7, top + 1, 4, 1, 'q');
	face.rect(7, top + 4, 2, 2, 'k').rect(12, top + 4, 2, 2, 'k');
	face.set(7, top + 4, 'w').set(12, top + 4, 'w');

	p.over(face.outline());
	return finish(p, [10, top], [10, top + 11]);
}

// ── Cloudwool: a cream-fleeced lamb with round amber horns ─────────────────

export function cloudwoolEgg(): PetArt {
	return egg(['.AAAA.', 'AA..AA', 'A.AA.A', 'AAAAAA', '.AAAA.']);
}

export function fluffle(stage: Exclude<PetStage, 'egg'>): PetArt {
	const n = stage === 'baby' ? 0 : stage === 'teen' ? 1 : 2;
	const top = [16, 12, 9][n];
	const p = frame();
	p.ellipse(27, 23, 2, 2, 'C');
	p.rect(11, 26, 3, 5, 'P').rect(22, 26, 3, 5, 'P');
	p.rect(14, 28, 2, 3, 'P').rect(25, 28, 2, 3, 'P');
	const fleece = frame().ellipse(19, 24, 7 + n, 5, 'C');
	fleece.ellipse(16, 21, 4, 3, 'C').ellipse(22, 21, 4, 3, 'C').ellipse(25, 24, 3, 3, 'C');
	fleece.ellipse(18, 21, 4, 2, 'd', true);
	p.over(fleece.outline());
	p.ellipse(12, 23, 4, 5, 'P');
	const face = frame().ellipse(12, top + 5, 5.5, 5, 'P');
	face.ellipse(7, top + 8, 4, 1.5, 'P');
	face.rect(5, top + 9, 4, 1, 'p');
	face.rect(8, top + 4, 2, 2, 'k').rect(13, top + 4, 2, 2, 'k');
	face.set(8, top + 4, 'w').set(13, top + 4, 'w');
	face.ellipse(10, top + 1, 4, 2, 'C');
	p.over(face.outline());
	// A broad inset keeps the curled horn readable beside the horizontal ear.
	p.over(frame().stamp(16, top + 2, ['.AAAA.', 'AAAAAA', 'AAaaAA', 'AAaaAA', '.AAAA.']).outline());
	p.stamp(17, top + 7, ['PPP', '.PP']);
	return finish(p, [11, top], [12, top + 13]);
}

// ── Lamplume: a dusk moth, its folded wings like warm paper lanterns ────────

export function lamplumeEgg(): PetArt {
	return egg(['PP....PP', 'PPP..PPP', '.PPPPPP.', '..PPPP..']);
}

export function glimmerwing(stage: Exclude<PetStage, 'egg'>): PetArt {
	const n = stage === 'baby' ? 0 : stage === 'teen' ? 1 : 2;
	const top = [16, 12, 9][n];
	const p = frame();
	// Short feet leave the folded wing clear.
	p.rect(10, 27, 3, 4, 'P').rect(21, 27, 3, 4, 'P');
	p.ellipse(18, 26, 7 + n, 3, 'P');
	p.ellipse(12, 23, 5, 5, 'C');
	// The near wing folds diagonally over the far wing, leaving the head clear.
	const far = frame().ellipse(23, 26, 5 + n, 3, 'P');
	p.over(far.outline());
	const wing = frame();
	const folds = [
		['.CCCC..', 'CCCCCC.', 'CCCCCCC', 'CCCAACC', 'CCAAAAC', 'CCAAAAC', '.CCCCCC', '..CCCC.'],
		['.CCCC...', 'CCCCCC..', 'CCCCCCC.', 'CCCCCCCC', 'CCCCCCCC', 'CCCAAACC', 'CCAAAACC', 'CCAAAACC', '.CCAACCC', '.CCCCCCC', '..CCCCC.', '...CCC..'],
		['.CCCCC....', 'CCCCCCC...', 'CCCCCCCC..', 'CCCCCCCCC.', 'CCCCCCCCCC', 'CCCCAAACCC', 'CCCAAAAACC', 'CCAAAAAACC', 'CCAAAAAACC', '.CCAAAACCC', '.CCCAACCCC', '..CCCCCCC.', '..CCCCCC..', '...CCCC...', '....CC....']
	];
	wing.stamp(17, top + 5, folds[n]);
	p.over(wing.outline());
	const face = frame().ellipse(11, top + 5, 5.5, 4.5, 'P');
	face.ellipse(7, top + 8, 3, 2, 'C');
	face.rect(7, top + 1, 4, 2, 'q');
	face.rect(7, top + 4, 2, 2, 'k').rect(12, top + 4, 2, 2, 'k');
	face.set(7, top + 4, 'w').set(12, top + 4, 'w');

	p.over(face.outline());
	p.stamp(5, top - 4, ['AA...', 'AAAA.', '..PP.', '...P.']);
	p.stamp(15, top - 4, ['...AA', '.AAAA', '.PP..', '.P...']);
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
	// Low, wide loops spread beside the knot, above the short tails.
	return acc().stamp(0, 0, [
		'............', '............', '.oooo..oooo.', 'oPPPPooPPPPo',
		'oP.PPAAPP.Po', '.oPPPAAPPPo.', '..ooPAAPoo..', '...oPooPo...'
	]).toSprite();
}

export function petTopHat(): Sprite {
	return acc().stamp(2, 1, ['..PPPP..', '..PPPP..', '..PPPP..', '..AAAA..', 'PPPPPPPP'])
		.outline().toSprite();
}

export function petFlower(): Sprite {
	return acc().stamp(3, 1, ['..PP..', '..PP..', 'PPAAPP', 'PPAAPP', '..PP..', '..PP..'])
		.outline().toSprite();
}

export function petCrown(): Sprite {
	return acc().stamp(2, 2, ['A..AA..A', 'AA.AA.AA', 'AAAAAAAA', '.AAAAAA.'])
		.outline().toSprite();
}

export function petBandana(): Sprite {
	return acc().stamp(3, 1, ['PPPPPP', '.PPPP.', '..PP..'])
		.outline().toSprite();
}

export function petBell(): Sprite {
	return acc().stamp(2, 1, ['PPPPPPPP', '...AA...', '..AbbA..', '..AAAA..'])
		.outline().toSprite();
}
