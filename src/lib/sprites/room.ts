/** Shared room art colours keep browser and preview renders identical. */
import { MESS_SPRITES, petBed } from './art/icons';
import { REFERENCE_PALETTE } from '$lib/content/palettes';
import { MESS } from './frames';

export const bed = {
	w: 28,
	h: 10,
	pivot: 0,
	layers: [{ z: 0, art: { sprite: petBed() }, palette: { ...REFERENCE_PALETTE, primary: ['#8a3a5a', '#c05a80', '#e88aaa'] as const, secondary: ['#c8b0a0', '#f0e0d0', '#ffffff'] as const } }]
};

export const messFigures = MESS_SPRITES.map((sprite, i) => ({
	figure: {
		w: MESS.w,
		h: MESS.h,
		pivot: 0,
		layers: [
			{
				z: 0,
				art: { sprite },
				palette: {
					...REFERENCE_PALETTE,
					primary: ['#274a98', '#3f72d0', '#86a8f0'] as const,
					hair: ['#a86a1a', '#d89a3a', '#f5c87a'] as const,
					skin: ['#b07a4a', '#d8a070', '#f5cca0'] as const
				}
			}
		]
	},
	key: `mess:${i}`
}));
