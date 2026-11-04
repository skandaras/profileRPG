/** Small accessory icons remain available as metadata for saved inventory ids. */
import { Pix, type Sprite } from '../grid';

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
