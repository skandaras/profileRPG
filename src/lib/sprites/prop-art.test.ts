import { expect, it } from 'vitest';
import { PET_ACCESSORIES } from '$lib/content/cosmetics';
import { MESS_SPRITES, petBed } from './art/icons';
import { CHANNEL_CHARS, type Sprite } from './grid';
import { reflectedMismatches, regions } from './cleanup-guards';

const accessories = PET_ACCESSORIES.map((a) => {
	if (!('sprite' in a.art)) throw Error(`Expected an accessory grid: ${a.id}`);
	return { id: a.id, sprite: a.art.sprite };
});
const props = [...MESS_SPRITES.map((sprite, i) => ({ id: `mess/${i}`, sprite })), { id: 'bed', sprite: petBed() }];
const drawings = [...accessories, ...props];

function shadeProblems(sprite: Sprite) {
	const problems: string[] = [];
	for (const char of new Set(sprite.rows.join(''))) {
		// Pupils, nose ink and eye glints are intentional single pixels.
		if (['.', 'o', 'k', 'w'].includes(char)) continue;
		const specks = regions(sprite, (c) => c === char).filter((r) => r.size < 2);
		if (specks.length) problems.push(`${char}: single pixels at ${specks.flatMap((r) => [...r]).join(',')}`);
	}
	for (const channel of ['skin', 'hair', 'eye', 'primary', 'secondary', 'accent']) {
		for (const region of regions(sprite, (c) => CHANNEL_CHARS[c]?.[0] === channel)) {
			const shades = [...region].map((at) => CHANNEL_CHARS[sprite.rows[Math.floor(at / sprite.w)][at % sprite.w]][1]);
			if (new Set(shades).size > (region.size < 32 ? 2 : 3)) problems.push(`${channel}: too many shades`);
			if (new Set(shades).size > 1 && shades.filter((s) => s === 1).length < region.size / 2) problems.push(`${channel}: base below half`);
			if (regions(sprite, (c) => CHANNEL_CHARS[c]?.[0] === channel && CHANNEL_CHARS[c]?.[1] === 0, region).length > 1) problems.push(`${channel}: split shadow`);
		}
	}
	return problems;
}

it('mirrors every saved accessory icon and the bed', () => {
	for (const { id, sprite } of [...accessories, props.at(-1)!]) expect(reflectedMismatches(sprite), id).toEqual([]);
});

it('keeps accessory icons and room props free of stray pixels and speckled materials', () => {
	for (const { id, sprite } of drawings) {
		expect.soft(regions(sprite, (c) => c !== '.').filter((r) => r.size === 1), `${id}: stray pixels`).toEqual([]);
		expect.soft(shadeProblems(sprite), id).toEqual([]);
	}
});

it('keeps the shipped sizes for accessory icons and props', () => {
	for (const { id, sprite } of [...accessories, ...props]) {
		expect.soft([sprite.w, sprite.h, sprite.frames], id).toEqual(id === 'bed' ? [28, 10, 1] : id.startsWith('mess') ? [12, 12, 1] : [12, 8, 1]);
	}
});

it('detects shifted symmetry, stray pixels, excess shades and split shadows in small props', () => {
	const noisy = { w: 6, h: 3, frames: 1, rows: ['PPpq..', '......', '.....P'] };
	expect(reflectedMismatches(noisy).length).toBeGreaterThan(0);
	expect(regions(noisy, (c) => c !== '.').filter((r) => r.size === 1)).toHaveLength(1);
	expect(shadeProblems(noisy)).toContain('primary: too many shades');
	const split = { w: 4, h: 2, frames: 1, rows: ['pPPp', 'PPPP'] };
	expect(shadeProblems(split)).toContain('primary: split shadow');
});
