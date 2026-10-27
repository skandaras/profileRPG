import { expect, it } from 'vitest';
import { COSMETICS } from '$lib/content/cosmetics';
import { CHANNEL_CHARS } from './grid';
import { reflectedMismatches, regions } from './cleanup-guards';

const layers = COSMETICS.flatMap((part) => part.layers.map((layer, i) => {
	if (!('sprite' in layer.art)) throw Error(`Expected an avatar grid: ${part.id}`);
	return { id: `${part.id}/${i}`, part, sprite: layer.art.sprite };
}));

it('mirrors front-facing avatar structure about x=15.5, including material boundaries', () => {
	const directional = new Set(['acc.scarf', 'acc.sword', 'feature.bandage', 'feature.star', 'hat.cap', 'hat.headband', 'hat.wizard', 'hair.ponytail', 'top.kimono']);
	for (const { id, part, sprite } of layers) {
		if (directional.has(part.id) || id === 'body.cat/0') continue;
		expect.soft(reflectedMismatches(sprite, true), id).toEqual([]);
		if (part.slot === 'face' || ['bottom.skirt', 'shoes.boots', 'top.tunic'].includes(part.id)) {
			expect.soft(reflectedMismatches(sprite), id).toEqual([]);
		}
	}
});

it('keeps every avatar layer free of detached pixels and speckled shade patches', () => {
	for (const { id, part, sprite } of layers) {
		expect.soft([sprite.w, sprite.h, sprite.frames], id).toEqual([32, 40, 1]);
		const isolated = regions(sprite, (c) => c !== '.').filter((r) => r.size === 1);
		// Freckles are four deliberate ink dots; eye glints and pupils may also be one pixel.
		const dots = part.id === 'feature.freckles' ? [22 * 32 + 10, 23 * 32 + 12, 23 * 32 + 19, 22 * 32 + 21] : [];
		expect.soft(isolated.flatMap((r) => [...r]).filter((at) => !dots.includes(at)), id).toEqual([]);
		for (const char of new Set(sprite.rows.join(''))) {
			if (['.', 'o', 'k', 'w'].includes(char) || part.id === 'feature.freckles') continue;
			expect.soft(regions(sprite, (c) => c === char).filter((r) => r.size < 2).map((r) => [...r]), `${id}: ${char} patches`).toEqual([]);
		}
	}
});

it('uses two shades for tiny materials, a dominant base, and one shadow per connected piece', () => {
	for (const { id, part, sprite } of layers) {
		for (const channel of ['skin', 'hair', 'eye', 'primary', 'secondary', 'accent']) {
			const material = regions(sprite, (c) => CHANNEL_CHARS[c]?.[0] === channel);
			for (const region of material) {
				const shades = [...region].map((at) => CHANNEL_CHARS[sprite.rows[Math.floor(at / 32)][at % 32]][1]);
				expect.soft(new Set(shades).size, `${id}: ${channel} shades`).toBeLessThanOrEqual(region.size < 32 ? 2 : 3);
				if (new Set(shades).size > 1) expect.soft(shades.filter((s) => s === 1).length, `${id}: ${channel} base`).toBeGreaterThanOrEqual(region.size / 2);
				const shadows = regions(sprite, (c) => CHANNEL_CHARS[c]?.[0] === channel && CHANNEL_CHARS[c]?.[1] === 0, region);
				expect.soft(shadows.length, `${id}: ${channel} shadows`).toBeLessThanOrEqual(1);
				// Facial ink and the small eye glints are intentional marks, not surface shading.
				if (part.slot !== 'face' && part.slot !== 'feature') {
					const highlights = regions(sprite, (c) => CHANNEL_CHARS[c]?.[0] === channel && CHANNEL_CHARS[c]?.[1] === 2, region);
					expect.soft(highlights.every((r) => r.size >= 2), `${id}: ${channel} highlights`).toBe(true);
				}
			}
		}
	}
});

it('detects a shifted skirt, a stray pixel, and an extra material shade', () => {
	const skirt = layers.find((l) => l.part.id === 'bottom.skirt')!.sprite;
	const shifted = { ...skirt, rows: skirt.rows.map((r) => r.slice(1) + '.') };
	expect.soft(reflectedMismatches(shifted, true).length).toBeGreaterThan(0);
	const noisy = { w: 6, h: 3, frames: 1, rows: ['PPpq..', '......', '.....P'] };
	expect.soft(regions(noisy, (c) => c !== '.').filter((r) => r.size === 1)).toHaveLength(1);
	expect.soft(regions(noisy, (c) => c === 'q')[0].size).toBe(1);
	expect.soft(new Set(noisy.rows.join('').split('').filter((c) => CHANNEL_CHARS[c]?.[0] === 'primary')).size).toBeGreaterThan(2);
	const splitShadow = { w: 4, h: 2, frames: 1, rows: ['pPPp', 'PPPP'] };
	expect.soft(regions(splitShadow, (c) => c === 'p')).toHaveLength(2);
});
