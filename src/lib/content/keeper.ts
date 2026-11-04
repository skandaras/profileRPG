import { DEFAULT_AVATAR } from './cosmetics';
import { paintSwatch } from './painted-palettes';
import type { AvatarConfig } from './types';

/** A whole outfit occupies the existing top slot. Bottoms, shoes and decoration are ignored. */
export const OUTFIT_MAPPING: Record<string, string> = {
	'top.tee': 'top.tee', 'top.tank': 'top.tee', 'top.sailor': 'top.tee',
	'top.sweater': 'top.sweater', 'top.hoodie': 'top.hoodie', 'top.kimono': 'top.hoodie',
	'top.vest': 'top.hoodie', 'top.tunic': 'top.tunic'
};

export function keeperLook(avatar: AvatarConfig): AvatarConfig {
	return {
		parts: { ...DEFAULT_AVATAR.parts, top: OUTFIT_MAPPING[avatar.parts.top ?? ''] ?? 'top.tee' },
		colors: {
			...DEFAULT_AVATAR.colors,
			skin: paintSwatch('skin', avatar.colors.skin).id,
			hair: paintSwatch('hair', avatar.colors.hair).id
		}
	};
}
