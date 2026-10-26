/** Garden keeper, aligned to the shared wardrobe landmarks. */
import { Pix } from '../grid';

const frame = () => new Pix(32, 40);

export function body() {
	const p = frame();
	p.ellipse(15.5, 18, 7.5, 7, 'S').rect(14, 24, 4, 4, 'S');
	p.rect(11, 27, 10, 6, 'S').rect(9, 28, 2, 5, 'S').rect(21, 28, 2, 5, 'S');
	p.rect(12, 33, 3, 4, 'S').rect(17, 33, 3, 4, 'S');
	p.rect(11, 37, 4, 2, 'S').rect(17, 37, 4, 2, 'S');
	p.rect(7, 18, 2, 3, 'S').rect(23, 18, 2, 3, 's');
	return p.rim('S', 's').rect(9, 17, 2, 2, 't').outline().toSprite();
}

export function face() {
	return frame().stamp(10, 19, ['kkk', 'kwE', 'eEf']).stamp(19, 19, ['kkk', 'Ewk', 'fEe'])
		.rect(15, 23, 2, 1, 'o').set(9, 22, 'r').set(22, 22, 'r').toSprite();
}

export function hairBack() {
	return frame().ellipse(15.5, 20, 10, 9, 'H').rect(6, 19, 4, 7, 'H').rect(22, 19, 4, 7, 'H')
		.rim('H', 'h').outline().toSprite();
}

export function hair() {
	const p = frame().ellipse(15.5, 13, 9, 5, 'H');
	for (const [x, y] of [[8, 13], [7, 17], [8, 21], [23, 13], [24, 17], [23, 21]]) p.ellipse(x, y, 2, 2, 'H');
	p.ellipse(12, 15, 4, 2, 'H').rect(8, 12, 2, 3, 'j').rect(11, 10, 5, 2, 'j').rim('H', 'h');
	// The fringe ends above the eyes, including its outline.
	return p.rect(10, 18, 12, 6, '.').outline().toSprite();
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
