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
		p.stamp(3, 15, ['SSS..', '.SSSS', '..sSS', '...SS']);
		p.stamp(24, 15, ['..SSS', 'SSSS.', 'SSs..', 'SS...']);
	} else if (kind === 'human') {
		p.rect(7, 18, 2, 3, 'S').rect(23, 18, 2, 3, 'S');
	}
	p.rim('S', 's').rect(10, 16, 2, 3, 't').rect(14, 25, 4, 1, 's');
	return p.outline().toSprite();
}

export function catEars() {
	const p = frame().stamp(7, 6, ['.HH....', '.HHH...', 'HHrrH..', 'HHrrHH.', 'HHHHHHH']);
	p.mirror().rim('H', 'h').rect(8, 7, 2, 2, 'j');
	return p.outline().toSprite();
}

export function catTail() {
	return frame().stamp(21, 22, [
		'....HHH.', '...HjjHH', '...HH.HH', '......HH', '......HH', '.....HHH',
		'....HHH.', '..HHHH..', 'HHHHH...', 'HHH.....'
	]).rim('H', 'h').outline().toSprite();
}

export function bunnyEars() {
	const p = frame().stamp(8, 1, ['.HH.', 'HjjH', 'HrrH', 'HrrH', 'HrrH', 'HHrH', '.HHH', '.HHH', '..HH', '..HH']);
	p.mirror().rim('H', 'h');
	return p.outline().toSprite();
}

export type Face = 'bright' | 'cheery' | 'calm' | 'determined' | 'sleepy' | 'sparkle';

export function face(style: Face = 'bright') {
	const p = frame();
	const eye = (left: string[], right = left) => p.stamp(10, 19, left).stamp(19, 19, right);
	if (style === 'bright') {
		eye(['kkk', 'kwE', 'eEf'], ['kkk', 'Ewk', 'fEe']);
		p.rect(15, 23, 2, 1, 'o');
	} else if (style === 'cheery') {
		eye(['.kk', 'k..'], ['kk.', '..k']);
		p.stamp(14, 23, ['owwo', '.oo.']);
	} else if (style === 'calm') {
		eye(['kkk', 'wEE', '.ef'], ['kkk', 'EEw', 'fe.']);
		p.rect(15, 23, 2, 1, 'o');
	} else if (style === 'determined') {
		p.stamp(10, 18, ['oo.']).stamp(19, 18, ['.oo']);
		eye(['.kk', 'kwE', 'eEf'], ['kk.', 'Ewk', 'fEe']);
		p.rect(14, 23, 4, 1, 'o');
	} else if (style === 'sleepy') {
		eye(['...', 'ooo', 'o..'], ['...', 'ooo', '..o']);
		p.stamp(15, 23, ['oo', 'oo']);
	} else {
		eye(['kwk', 'wEw', 'ewf'], ['kwk', 'wEw', 'fwe']);
		p.stamp(14, 23, ['o..o', '.oo.']);
	}
	// Face ink uses the primary ramp so darker skin can keep these small strokes clear.
	p.replace('o', 'p');
	if (style === 'cheery') p.replace('k', 'P');
	return p.set(9, 22, 'r').set(22, 22, 'r').toSprite();
}

export type Hair = 'short' | 'spiky' | 'bob' | 'long' | 'twintails' | 'ponytail' | 'bun' | 'curly';

function shadeHair(p: Pix) {
	p.rim('H', 'h');
	return p.outline().toSprite();
}

export function hairBack(style: Hair = 'bob') {
	const p = frame();
	p.ellipse(15.5, 16, 9, 7, 'H');
	if (style === 'bob') {
		p.rect(6, 17, 4, 8, 'H').rect(22, 17, 4, 8, 'H');
		p.ellipse(8, 24, 2, 2, 'H').ellipse(23, 24, 2, 2, 'H');
	} else if (style === 'long') {
		p.rect(6, 17, 20, 13, 'H');
		p.ellipse(9, 30, 3, 3, 'H').ellipse(22, 30, 3, 3, 'H');
		p.rect(7, 20, 2, 9, 'j').rect(23, 20, 2, 10, 'h');
	} else if (style === 'twintails') {
		for (const x of [4, 27]) {
			p.ellipse(x, 23, 3, 6, 'H').ellipse(x, 29, 2, 4, 'H');
		}
		p.rect(3, 20, 2, 5, 'j').rect(26, 20, 2, 5, 'j');
		p.rect(4, 17, 4, 2, 'A').rect(24, 17, 4, 2, 'A');
	} else if (style === 'ponytail') {
		p.ellipse(25, 21, 4, 6, 'H').ellipse(26, 27, 3, 4, 'H').ellipse(24, 31, 2, 2, 'H');
		p.rect(24, 18, 2, 6, 'j').rect(23, 14, 4, 2, 'A');
	} else if (style === 'bun') {
		p.ellipse(15.5, 6, 4.5, 3, 'H').rect(12, 8, 8, 2, 'A').rect(13, 4, 4, 1, 'j');
	} else if (style === 'curly') {
		for (const x of [6, 25]) for (const y of [16, 21, 25]) p.ellipse(x, y, 2.5, 3, 'H');
		p.rect(4, 17, 2, 3, 'j').rect(23, 22, 2, 2, 'j');
	}
	return shadeHair(p);
}

export function hair(style: Hair = 'bob') {
	const p = frame().ellipse(15.5, 12, 9, 5, 'H');
	p.rect(7, 13, 17, 3, 'H');
	if (style === 'short') {
		p.ellipse(11, 14, 4, 2, 'H').rect(7, 15, 2, 5, 'H').rect(23, 14, 1, 5, 'H');
	} else if (style === 'spiky') {
		p.stamp(7, 6, ['...HH...HH....', '..HHHH.HHHH...', '.HHHHHHHHHHHH.', 'HHHHHHHHHHHHHH']);
		p.stamp(5, 12, ['.HHH', 'HHHH', '.HHH', '..HH']);
		p.stamp(23, 12, ['HHH.', 'HHHH', 'HHH.', 'HH..']);
	} else if (style === 'bob') {
		for (const x of [7, 24]) for (const y of [14, 19, 23]) p.ellipse(x, y, 2, 2, 'H');
		p.ellipse(11, 14, 4, 2, 'H');
	} else if (style === 'long') {
		p.rect(7, 14, 2, 15, 'H').rect(23, 14, 2, 15, 'H');
		p.ellipse(11, 13, 4, 3, 'H').ellipse(20, 13, 4, 3, 'H');
		p.rect(7, 18, 1, 8, 'j');
	} else if (style === 'twintails') {
		p.ellipse(11, 13, 4, 3, 'H').ellipse(20, 13, 4, 3, 'H');
		p.rect(15, 10, 2, 3, 'h').rect(7, 14, 2, 6, 'H').rect(23, 14, 2, 6, 'H');
	} else if (style === 'ponytail') {
		p.ellipse(18, 13, 6, 3, 'H').rect(7, 14, 2, 5, 'H').rect(23, 14, 2, 6, 'H');
		p.rect(10, 13, 2, 2, 'h');
	} else if (style === 'bun') {
		p.rect(7, 14, 2, 5, 'H').rect(23, 14, 2, 5, 'H');
		p.ellipse(11, 13, 4, 3, 'H').ellipse(20, 13, 4, 3, 'H');
	} else {
		for (const [x, y] of [[9, 10], [14, 8], [20, 9], [24, 12], [6, 14], [6, 19], [7, 24], [25, 18], [24, 24]]) {
			p.ellipse(x, y, 2.5, 2.5, 'H');
		}
		p.ellipse(12, 14, 4, 2, 'H').ellipse(20, 14, 3, 2, 'H');
	}
	// The outline ends on row 17, leaving the brows and eyes below it.
	p.rect(9, 17, 14, 9, '.');
	p.rect(10, 10, 5, 2, 'j').rect(8, 12, 2, 2, 'j');
	return shadeHair(p);
}

export function top() {
	const p = frame().rect(11, 26, 10, 7, 'P').rect(9, 27, 2, 3, 'P').rect(21, 27, 2, 3, 'P').rim('P', 'p');
	p.rect(10, 32, 12, 2, 'P').rect(13, 28, 6, 5, 'C').rect(13, 26, 1, 3, 'C').rect(18, 26, 1, 3, 'C');
	return p.rect(14, 30, 4, 2, 'c').set(13, 28, 'A').set(18, 28, 'A').rect(10, 27, 2, 1, 'q').outline().toSprite();
}

export function bottom() {
	return frame().rect(11, 32, 4, 4, 'p').rect(17, 32, 4, 4, 'p')
		.rect(11, 33, 3, 2, 'P').rect(17, 33, 3, 2, 'P').outline().toSprite();
}

export function shoes() {
	return frame().rect(11, 37, 4, 2, 'P').rect(17, 37, 4, 2, 'P')
		.rect(10, 38, 5, 1, 'w').rect(17, 38, 5, 1, 'w').outline().toSprite();
}
