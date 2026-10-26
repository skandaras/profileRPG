/**
 * Frame sizes and draw order, shared by the code-drawn art, the PNG loader and
 * docs/ART.md. Every avatar layer is a full AVATAR frame, so parts line up by
 * construction and a PNG replacement needs no offsets.
 */
export const AVATAR = { w: 32, h: 40, pivot: 33 } as const;
export const PET = { w: 32, h: 32, pivot: 24 } as const;
export const ICON = { w: 16, h: 16 } as const;
export const MESS = { w: 12, h: 12 } as const;

/** Lower draws first. A part can contribute several layers at different depths. */
export const Z = {
	back: 0,
	tail: 2,
	body: 10,
	bottom: 20,
	shoes: 25,
	top: 30,
	neck: 35,
	face: 40,
	feature: 45,
	hair: 50,
	ears: 55,
	headwear: 60,
	held: 70
} as const;
