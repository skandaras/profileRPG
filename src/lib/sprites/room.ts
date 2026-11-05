/** Physical room objects share the cast's painted material and alpha-aware renderer. */
import { REFERENCE_PALETTE } from '$lib/content/palettes';
import { ROOM_PROP_NAMES, roomPropArt } from './painted-props';
import type { Figure } from './layers';

function roomFigure(index: number, displayHeight: number): Figure {
	const art = roomPropArt(index);
	return { w: art.w, h: art.h, pivot: 0, painted: true, displayHeight, layers: [{ z: 0, art, palette: REFERENCE_PALETTE }] };
}

export const bed = roomFigure(0, 20);
export const messFigures = ROOM_PROP_NAMES.slice(1).map((name, index) => ({
	figure: roomFigure(index + 1, 12), name, key: `room:painted-mess:${index}`
}));
