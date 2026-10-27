import { expect, it } from 'vitest';
import { PET_ACCESSORIES } from '$lib/content/cosmetics';
import { SPECIES } from '$lib/content/pets';
import { MESS_SPRITES, petBed } from './art/icons';
import { CHANNEL_CHARS, type Sprite } from './grid';
import { reflectedMismatches, regions } from './cleanup-guards';

const stages = ['egg', 'baby', 'teen', 'adult'] as const;
const pets = SPECIES.flatMap((species) => stages.map((stage) => {
	const art = species.art[stage];
	if (!('sprite' in art)) throw Error(`Expected a pet grid: ${species.id}/${stage}`);
	return { id: `${species.id}/${stage}`, sprite: art.sprite, anchors: art.anchors };
}));
const accessories = PET_ACCESSORIES.map((a) => {
	if (!('sprite' in a.art)) throw Error(`Expected an accessory grid: ${a.id}`);
	return { id: a.id, sprite: a.art.sprite };
});
const props = [...MESS_SPRITES.map((sprite, i) => ({ id: `mess/${i}`, sprite })), { id: 'bed', sprite: petBed() }];
const drawings = [...pets, ...accessories, ...props];

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

it('mirrors every finished egg, accessory and bed about its frame centre', () => {
	for (const { id, sprite } of [...pets.filter((p) => p.id.endsWith('/egg')), ...accessories, props.at(-1)!]) {
		expect.soft(reflectedMismatches(sprite), id).toEqual([]);
	}
	const eggs = pets.filter((p) => p.id.endsWith('/egg'));
	const silhouette = (sprite: Sprite) => sprite.rows.map((r) => r.replace(/[^.]/g, '#'));
	for (const { id, sprite } of eggs) {
		expect.soft(silhouette(sprite), `${id}: shared shell`).toEqual(silhouette(eggs[0].sprite));
		for (let y = 0; y < sprite.h; y++) for (let x = 0; x < sprite.w; x++) {
			if (!['primary', 'accent'].includes(CHANNEL_CHARS[sprite.rows[y][x]]?.[0])) continue;
			for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
				expect.soft(['.', 'o'].includes(sprite.rows[y + dy]?.[x + dx] ?? '.'), `${id}: emblem inside shell`).toBe(false);
			}
		}
	}
});

it('keeps pets, accessories and room props free of stray pixels and speckled materials', () => {
	for (const { id, sprite } of drawings) {
		expect.soft(regions(sprite, (c) => c !== '.').filter((r) => r.size === 1), `${id}: stray pixels`).toEqual([]);
		expect.soft(shadeProblems(sprite), id).toEqual([]);
	}
});

it('keeps the shipped sizes and anchors for every pet stage and prop', () => {
	for (const { id, sprite, anchors } of pets) {
		expect.soft([sprite.w, sprite.h, sprite.frames], id).toEqual([32, 32, 1]);
		const [species, stage] = id.split('/');
		const n = ['baby', 'teen', 'adult'].indexOf(stage);
		const top = species === 'pebblet' ? [18, 15, 12][n] : [16, 12, 9][n];
		const headX = species === 'emberkit' ? 14 : ['mossling', 'puddlefin'].includes(species) ? 13 : species === 'pebblet' ? 10 : 11;
		const neckX = ['fluffle', 'glimmerwing'].includes(species) ? 12 : headX;
		expect.soft(anchors, id).toEqual(stage === 'egg' ? { head: [16, 15], neck: [16, 26] } : { head: [headX, top], neck: [neckX, top + (species === 'pebblet' ? 11 : 13)] });
	}
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
