/** Production contact sheets: SPRITE_PREVIEW=1 npx vitest run src/lib/sprites/preview */
import { it } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { OUTFITS, DEFAULT_AVATAR } from '$lib/content/cosmetics';
import { PAINT_SKIN, PAINT_HAIR } from '$lib/content/painted-palettes';
import { SPECIES } from '$lib/content/pets';
import { PAINT_AVATAR, PAINT_PET, STAGES } from './painted-figures';
import { avatarFigure, petFigure } from './layers';
import { paintPreview } from './preview-png';
import { blank, drawOver, type RgbaImage } from './compose';
import { encodePng } from './png';

function sheet(images: RgbaImage[], cols: number, cw: number, ch: number, background: number[]): RgbaImage {
	const out = blank(cols * cw, Math.ceil(images.length / cols) * ch);
	for (let i = 0; i < out.data.length; i += 4) out.data.set(background, i);
	images.forEach((img, n) => drawOver(out, img, (n % cols) * cw + 8, Math.floor(n / cols) * ch + 8));
	return out;
}

it.skipIf(!process.env.SPRITE_PREVIEW)('renders the whole cast on light and dark surfaces', () => {
	mkdirSync('test-results/sprites', { recursive: true });
	const avatars = PAINT_SKIN.flatMap((skin) => OUTFITS.flatMap((outfit) => PAINT_HAIR.map((hair) =>
		paintPreview(avatarFigure({ ...DEFAULT_AVATAR, parts: { ...DEFAULT_AVATAR.parts, top: outfit.id }, colors: { ...DEFAULT_AVATAR.colors, skin: skin.id, hair: hair.id } }))[0]
	)));
	const pets = SPECIES.flatMap((species) => STAGES.map((stage) => paintPreview(petFigure(species.id, stage))[0]));
	for (const [name, background] of [['light', [247, 238, 217, 255]], ['dark', [25, 35, 47, 255]]] as const) {
		writeFileSync(`test-results/sprites/wayfarers-${name}.png`, encodePng(sheet(avatars, 5, PAINT_AVATAR.w + 16, PAINT_AVATAR.h + 16, [...background])));
		writeFileSync(`test-results/sprites/familiars-${name}.png`, encodePng(sheet(pets, 4, PAINT_PET.w + 16, PAINT_PET.h + 16, [...background])));
	}
});
