import type { PaintedArt } from './painted';

const PROVISIONS = ['food.berry', 'food.kibble', 'food.fish', 'treat.cake', 'treat.star', 'toy.ball', 'toy.yarn', 'toy.plush'] as const;

/** Saved item ids select stable cells; colours are painted into the source. */
export function provisionArt(id: typeof PROVISIONS[number]): PaintedArt {
	const index = PROVISIONS.indexOf(id);
	return { painted: '/painted/provisions.png', w: 144, h: 144, cell: [index % 4, Math.floor(index / 4), 4, 2], height: 128, ground: 136 };
}

export const ROOM_PROP_NAMES = ['Pet bed', 'Dust and fallen leaf', 'Biscuit crumbs', 'Banana peel', 'Muddy bootprint', 'Wool sock'] as const;
// The basket crosses a nominal cell edge; measured gutters keep it out of the dust cutout.
const ROOM_REGIONS = [[26, 106, 500, 339], [587, 134, 381, 263], [1112, 147, 319, 233], [34, 600, 467, 323], [600, 568, 345, 378], [1042, 567, 440, 383]] as const;

export function roomPropArt(index: number): PaintedArt {
	if (!Number.isInteger(index) || index < 0 || index >= ROOM_PROP_NAMES.length) throw new Error('Unknown room prop');
	return {
		painted: '/painted/room-props.png', region: ROOM_REGIONS[index],
		...(index === 0 ? { w: 256, h: 192, height: 160, ground: 176 } : { w: 144, h: 144, height: 128, ground: 136 })
	};
}
