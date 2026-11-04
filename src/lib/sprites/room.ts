/** Shared room art colours keep browser and preview renders identical. */
import { MESS_SPRITES, petBed } from './art/icons';
import { REFERENCE_PALETTE } from '$lib/content/palettes';
import { MESS } from './frames';

export const bed = {
	w: 28,
	h: 10,
	pivot: 0,
	layers: [{ z: 0, art: { sprite: petBed() }, palette: { ...REFERENCE_PALETTE, primary: ['#426647', '#78915c', '#b2c98a'] as const, secondary: ['#b2a77e', '#e5d9ae', '#fff2d3'] as const } }]
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
					secondary: ['#8b8777', '#b9b5a0', '#e2ddc7'] as const,
					primary: ['#526970', '#829f9c', '#bed3bb'] as const,
					hair: ['#9b652d', '#d9a84e', '#f7d998'] as const,
					skin: ['#925c40', '#bb8b62', '#e3bc89'] as const
				}
			}
		]
	},
	key: `mess:${i}`
}));
