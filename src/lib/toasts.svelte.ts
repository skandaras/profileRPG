import type { Notice } from './notices';

export interface Toast extends Notice {
	id: number;
}

let next = 1;
export const toasts = $state<Toast[]>([]);
/** Set when a notice reports a level-up; the layout shows a celebration. */
export const celebration = $state<{ level: number | null }>({ level: null });

const LIFETIME = 3800;

export function pushNotices(list: Notice[]) {
	// XP and GP from one action read better as one line each than as a burst.
	for (const n of list) {
		if (n.kind === 'level') {
			const m = n.text.match(/level (\d+)/);
			if (m) celebration.level = Number(m[1]);
		}
		const toast = { ...n, id: next++ };
		toasts.push(toast);
		setTimeout(() => {
			const i = toasts.findIndex((t) => t.id === toast.id);
			if (i >= 0) toasts.splice(i, 1);
		}, LIFETIME);
	}
	while (toasts.length > 6) toasts.shift();
}
