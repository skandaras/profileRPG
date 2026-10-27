/** Garden keeper, aligned to the shared wardrobe landmarks. */
import { Pix } from '../grid';

const frame = () => new Pix(32, 40);

export function body(kind: 'human' | 'elf' | 'beast' = 'human') {
	const p = frame();
	p.ellipse(15.5, 18, 7.5, 7, 'S').rect(14, 24, 4, 4, 'S');
	p.rect(11, 27, 10, 6, 'S').rect(9, 28, 2, 5, 'S').rect(21, 28, 2, 5, 'S');
	p.rect(12, 33, 3, 4, 'S').rect(17, 33, 3, 4, 'S');
	p.rect(11, 37, 4, 2, 'S').rect(17, 37, 4, 2, 'S');
	if (kind === 'elf') {
		// Low, broad ears leave a gap below the hair's side lobes.
		p.stamp(2, 19, ['SS.....', 'SSSSS..', '.SSSSSS', '...SSSS']).mirror();
	} else if (kind === 'human') {
		p.rect(7, 18, 2, 3, 'S').rect(23, 18, 2, 3, 'S');
	}
	p.rect(13, 24, 6, 1, 's').rect(14, 25, 4, 1, 's');
	return p.outline().toSprite();
}

export function catEars() {
	return frame().stamp(7, 6, ['.HH....', '.HHH...', 'HHrrH..', 'HHrrHH.', 'HHHHHHH'])
		.mirror().outline().toSprite();
}

export function catTail() {
	// One unbroken curl, with no dark seam across its bend.
	return frame().stamp(21, 22, [
		'....HHHH', '...HHHHH', '...HH.HH', '......HH', '......HH', '.....HHH',
		'....HHHH', '..HHHHH.', 'HHHHHH..', 'HHHH....'
	]).outline().toSprite();
}

export function bunnyEars() {
	return frame().stamp(8, 1, ['.HH.', 'HHHH', 'HrrH', 'HrrH', 'HrrH', 'HrrH', '.HHH', '.HHH', '..HH', '..HH'])
		.mirror().outline().toSprite();
}

export type Face = 'bright' | 'cheery' | 'calm' | 'determined' | 'sleepy' | 'sparkle';

export function face(style: Face = 'bright') {
	const p = frame();
	const eye = (rows: string[], y = 19) => p.stamp(10, y, rows).mirror();
	if (style === 'bright') {
		eye(['kkk', 'kwE', 'kEE']);
		p.rect(15, 23, 2, 1, 'p');
	} else if (style === 'cheery') {
		eye(['.PP', 'P..']);
		p.stamp(14, 23, ['pwwp', '.pp.']);
	} else if (style === 'calm') {
		eye(['ppp', 'kwE', '.EE']);
		p.rect(15, 23, 2, 1, 'p');
	} else if (style === 'determined') {
		// The empty row beneath each brow keeps the determined gaze open.
		p.rect(10, 18, 2, 1, 'p');
		eye(['kwE', 'kEE'], 20);
		p.rect(14, 23, 4, 1, 'p');
	} else if (style === 'sleepy') {
		eye(['ppp'], 20);
		p.rect(15, 23, 2, 2, 'p');
	} else {
		// A joined white corner reads as one sparkle instead of a checkerboard.
		eye(['kww', 'kwE', 'kEE']);
		p.stamp(14, 23, ['p..p', '.pp.']);
	}
	// Reference primary ink becomes warm light ink on Umber and Deep.
	return p.toSprite();
}

export type Hair = 'short' | 'spiky' | 'bob' | 'long' | 'twintails' | 'ponytail' | 'bun' | 'curly';

export function hairBack(style: Hair = 'bob') {
	const p = frame().ellipse(15.5, 16, 9, 7, 'H');
	if (style === 'bob') {
		p.ellipse(7.5, 21, 2.5, 5, 'H').mirror();
	} else if (style === 'long') {
		p.rect(6, 17, 20, 12, 'H').ellipse(15.5, 28, 9.5, 5, 'H');
	} else if (style === 'twintails') {
		p.ellipse(4.5, 24, 3.5, 7, 'H').rect(4, 17, 4, 2, 'A').mirror();
	} else if (style === 'ponytail') {
		p.ellipse(25, 22, 4, 7, 'H').ellipse(24, 28, 3, 4, 'H');
		p.rect(23, 15, 4, 2, 'A');
	} else if (style === 'bun') {
		p.ellipse(15.5, 6, 4.5, 3, 'H').rect(12, 8, 8, 1, 'h');
	} else if (style === 'curly') {
		p.ellipse(6.5, 17, 3.5, 5, 'H').ellipse(6.5, 23, 3.5, 5, 'H').mirror();
	}
	return p.outline().toSprite();
}

export function hair(style: Hair = 'bob') {
	const p = frame().ellipse(15.5, 12, 9, 5, 'H').rect(7, 13, 18, 4, 'H');
	if (style === 'short') {
		p.rect(7, 14, 2, 4, 'H').mirror();
	} else if (style === 'spiky') {
		p.stamp(6, 6, [
			'.........HH.........', '........HHHH........', '...HH..HHHHHH..HH...',
			'..HHHHHHHHHHHHHHHH..', '.HHHHHHHHHHHHHHHHHH.', 'HHHHHHHHHHHHHHHHHHHH'
		]);
	} else if (style === 'bob') {
		p.stamp(4, 14, ['..HHHH', '.HHHHH', 'HHHHHH', 'HHHHHH', '.HHHHH', '..HHHH', '..HHHH', '.HHHHH', 'HHHHHH', 'HHHHHH', '.HHHHH', '..HHHH']).mirror();
	} else if (style === 'long') {
		p.rect(7, 14, 2, 14, 'H').ellipse(8, 28, 1, 2, 'H').mirror();
	} else if (style === 'twintails' || style === 'bun') {
		p.rect(7, 14, 2, 5, 'H').mirror();
	} else if (style === 'ponytail') {
		p.rect(7, 14, 2, 4, 'H').rect(23, 14, 2, 5, 'H');
	} else {
		p.ellipse(10, 10, 4, 3, 'H').ellipse(15.5, 8, 4.5, 3, 'H');
		p.ellipse(6.5, 16, 2.5, 4, 'H').ellipse(6.5, 23, 2.5, 4, 'H').mirror();
	}
	// The fringe ends on row 17 so every brow and glasses rim stays clear.
	p.rect(9, 17, 14, 15, '.');
	p.rect(10, 10, 5, 2, 'j').rect(9, 11, 2, 2, 'j');
	for (let y = 15; y < 32; y++) for (let x = 12; x < 28; x++) {
		if ((y === 16 || (y === 15 && x >= 19) || x >= 23) && p.get(x, y) === 'H') p.set(x, y, 'h');
	}
	return p.outline().toSprite();
}

export function top() {
	const p = frame().rect(11, 26, 10, 7, 'P').rect(9, 27, 2, 3, 'P').rect(21, 27, 2, 3, 'P');
	p.rect(13, 28, 6, 5, 'C').rect(13, 26, 1, 2, 'C').rect(18, 26, 1, 2, 'C');
	// A single pocket edge is enough at this size.
	return p.rect(14, 31, 4, 1, 'c').outline().toSprite();
}

export function bottom() {
	return frame().rect(11, 32, 10, 2, 'P').rect(11, 34, 4, 2, 'P').rect(17, 34, 4, 2, 'P')
		.outline().toSprite();
}

export function shoes() {
	return frame().rect(11, 37, 4, 2, 'P').rect(17, 37, 4, 2, 'P')
		.rect(10, 38, 5, 1, 'w').rect(17, 38, 5, 1, 'w').outline().toSprite();
}
