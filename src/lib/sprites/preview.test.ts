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
import { ICON_PALETTE } from '$lib/sprites/svg';
import { UI_ICONS, uiIconFigure } from './ui-icons';
import { bed, messFigures } from './room';
import { paintPreview } from './preview-png';
import { blank, drawOver, type RgbaImage } from './compose';
import { pixelAvatarFigure as avatarFigure, pixelPetFigure as petFigure, avatarFigure as paintedAvatarFigure, petFigure as paintedPetFigure } from './layers';
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
		return paintPreview(avatarFigure({ ...DEFAULT_AVATAR, parts }))[0];
	});
	writeFileSync('test-results/sprites/avatar-parts.png', encodePng(sheet(avatars, 10, 34, 42), 3));

	const pets = SPECIES.flatMap((s) =>
		(['egg', 'baby', 'teen', 'adult'] as const).map((st) => paintPreview(petFigure(s.id, st))[0])
	);
	const dressed = SPECIES.flatMap((s) => PET_ACCESSORIES.flatMap((a) =>
		(['egg', 'baby', 'teen', 'adult'] as const).map((stage) => paintPreview(petFigure(s.id, stage, a.id))[0])
	));
	writeFileSync('test-results/sprites/pets.png', encodePng(sheet([...pets, ...dressed], 4, 34, 34), 3));
	const bramblebacks = [undefined, ...PET_ACCESSORIES.map((a) => a.id)].flatMap((accessory) =>
		(['egg', 'baby', 'teen', 'adult'] as const).map((stage) => paintPreview(petFigure('emberkit', stage, accessory))[0])
	);
	writeFileSync('test-results/sprites/brambleback.png', encodePng(sheet(bramblebacks, 4, 34, 34), 4));
	const keeper = [DEFAULT_AVATAR, { ...DEFAULT_AVATAR, colors: { ...DEFAULT_AVATAR.colors, skin: 'deep', hair: 'silver', top: 'teal' } }];
	writeFileSync('test-results/sprites/keeper.png', encodePng(sheet(keeper.map((a) => paintPreview(avatarFigure(a))[0]), 2, 34, 42), 4));

	const icons = [
		...Object.values(UI_ICONS).map((icon) => paintPreview(uiIconFigure(icon))[0]),
		...CONSUMABLES.map((c) => paintPreview(uiIconFigure({ art: c.icon, palette: { ...ICON_PALETTE, primary: c.tint } }))[0]),
		...messFigures.map((m) => paintPreview(m.figure)[0])
	];
	writeFileSync('test-results/sprites/icons.png', encodePng(sheet(icons, 10, 18, 18), 4));
	writeFileSync('test-results/sprites/bed.png', encodePng(paintPreview(bed)[0], 4));
	const paintedKeepers = ['body.human', 'body.elf', 'body.cat', 'body.bunny'].map((body) => paintPreview(paintedAvatarFigure({ ...DEFAULT_AVATAR, parts: { ...DEFAULT_AVATAR.parts, body } }))[0]);
	writeFileSync('test-results/sprites/painted-keeper.png', encodePng(sheet(paintedKeepers, 4, 402, 514)));
	const paintedPets = [undefined, 'petacc.bandana', 'petacc.bow'].flatMap((acc) => (['egg', 'baby', 'teen', 'adult'] as const).map((stage) => paintPreview(paintedPetFigure('emberkit', stage, acc))[0]));
	writeFileSync('test-results/sprites/painted-brambleback.png', encodePng(sheet(paintedPets, 4, 514, 386)));
});
