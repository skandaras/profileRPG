import type { Unlock } from './content/types';

/** How to get something you do not have yet, in words. */
export function unlockHint(u: Unlock): string {
	switch (u.kind) {
		case 'starter':
			return '';
		case 'level':
			return `Unlocks at level ${u.level}`;
		case 'shop':
			return u.level ? `Shop, ${u.price} GP (level ${u.level})` : `Shop, ${u.price} GP`;
		case 'drop':
			return 'Found on missions';
	}
}
