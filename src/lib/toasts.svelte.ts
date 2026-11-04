import type { Notice } from './notices';

export interface Toast extends Notice {
	id: number;
}

let next = 1;
export const toasts = $state<Toast[]>([]);
/** Set when a notice reports a level-up; the layout shows a celebration. */
export const celebration = $state<{ level: number | null }>({ level: null });

const LIFETIME = 12000;
const timers = new Map<number, ReturnType<typeof setTimeout>>();

export function pauseToast(id: number) {
	clearTimeout(timers.get(id));
	timers.delete(id);
}

export function dismissToast(id: number) {
	pauseToast(id);
	const i = toasts.findIndex((t) => t.id === id);
	if (i >= 0) toasts.splice(i, 1);
}

export function resumeToast(id: number) {
	pauseToast(id);
	// Refusals stay until dismissed, so a player has time to act on them.
	if (toasts.some((t) => t.id === id && t.kind !== 'warn')) {
		timers.set(id, setTimeout(() => dismissToast(id), LIFETIME));
	}
}

export function pushNotices(list: Notice[]) {
	// Each call is one action; keep its rewards together without merging later actions.
	const rewards = list.filter((n) => n.kind === 'xp' || n.kind === 'gp');
	for (const n of list) {
		const isReward = n.kind === 'xp' || n.kind === 'gp';
		if (isReward && n !== rewards[0]) continue;
		if (n.kind === 'level') {
			const m = n.text.match(/level (\d+)/);
			if (m) celebration.level = Number(m[1]);
		}
		const toast = { ...n, text: isReward ? rewards.map((r) => r.text).join(' · ') : n.text, id: next++ };
		toasts.push(toast);
		resumeToast(toast.id);
	}
	while (toasts.length > 6) dismissToast(toasts[0].id);
}
