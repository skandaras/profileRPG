/** SVG fragments are trusted source art; never pass saved text into this contract. */
import { REFERENCE_PALETTE } from '$lib/content/palettes';
import type { PaletteSet } from './grid';

export const ICON_PALETTE: PaletteSet = {
	...REFERENCE_PALETTE,
	secondary: ['#b2a77e', '#e5d9ae', '#fff2d3'],
	hair: ['#426647', '#78915c', '#b2c98a'],
	skin: ['#925038', '#c7834e', '#f1bc7e']
};

export interface SvgArt {
	svg: string;
	symmetric?: boolean;
}

export function svgDocument(art: SvgArt, palette: PaletteSet): string {
	const body = art.svg.replace(/\{([a-z]+)(?:\.([012]))?\}/g, (_, channel: string, shade: string) => {
		if (channel === 'outline') return '#2b1f33';
		return palette[channel as keyof PaletteSet][Number(shade)];
	});
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="#2b1f33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}
