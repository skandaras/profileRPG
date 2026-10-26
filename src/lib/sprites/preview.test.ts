/**
 * Contact sheets of every piece of art, for whoever is drawing replacements.
 * Off by default; run `SPRITE_PREVIEW=1 npx vitest run src/lib/sprites/preview`
 * and open test-results/sprites/*.png.
 */
import { it } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { COSMETICS, DEFAULT_AVATAR, PET_ACCESSORIES } from '$lib/content/cosmetics';
import { CONSUMABLES } from '$lib/content/items';
import { SPECIES } from '$lib/content/pets';
import { REFERENCE_PALETTE } from '$lib/content/palettes';
import * as I from './art/icons';
import { blank, drawOver, renderSprite, type RgbaImage } from './compose';
import { avatarFigure, paintFigure, petFigure } from './layers';
import { encodePng } from './png';

function sheet(images: RgbaImage[], cols: number, cw: number, ch: number): RgbaImage {
	const out = blank(cols * cw, Math.ceil(images.length / cols) * ch);
	for (let i = 0; i < out.data.length; i += 4) out.data.set([214, 236, 214, 255], i);
	images.forEach((img, n) => drawOver(out, img, (n % cols) * cw + 1, Math.floor(n / cols) * ch + 1));
	return out;
}

it.skipIf(!process.env.SPRITE_PREVIEW)('renders contact sheets', () => {
	mkdirSync('test-results/sprites', { recursive: true });
	const avatars = COSMETICS.map((c) => {
		const parts = { ...DEFAULT_AVATAR.parts, [c.slot]: c.id };
		return paintFigure(avatarFigure({ ...DEFAULT_AVATAR, parts }))[0];
	});
	writeFileSync('test-results/sprites/avatar-parts.png', encodePng(sheet(avatars, 10, 34, 42), 3));

	const pets = SPECIES.flatMap((s) =>
		(['egg', 'baby', 'teen', 'adult'] as const).map((st) => paintFigure(petFigure(s.id, st))[0])
	);
	const dressed = PET_ACCESSORIES.map((a) => paintFigure(petFigure('mossling', 'teen', a.id))[0]);
	writeFileSync('test-results/sprites/pets.png', encodePng(sheet([...pets, ...dressed], 4, 34, 34), 3));

	const icons = [
		...Object.values(I)
			.filter((f): f is () => import('./grid').Sprite => typeof f === 'function' && f.length === 0 && f !== I.petBed)
			.map((f) => renderSprite(f(), REFERENCE_PALETTE)),
		...CONSUMABLES.map((c) => ('sprite' in c.icon ? renderSprite(c.icon.sprite, { ...REFERENCE_PALETTE, primary: c.tint }) : blank(16, 16))),
		...I.MESS_SPRITES.map((s) => renderSprite(s, REFERENCE_PALETTE))
	];
	writeFileSync('test-results/sprites/icons.png', encodePng(sheet(icons, 10, 18, 18), 4));
});
