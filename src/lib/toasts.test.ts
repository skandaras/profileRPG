import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { celebration, dismissToast, pushNotices, toasts } from './toasts.svelte';
import type { Notice } from './notices';

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
	for (const toast of [...toasts]) dismissToast(toast.id);
	celebration.level = null;
	vi.useRealTimers();
});

describe('reward notices', () => {
	it('combines an action’s XP and GP without changing its server notices', () => {
		const notices: Notice[] = [
			{ kind: 'xp', text: '+20 XP', icon: '⭐' },
			{ kind: 'gp', text: '+4 GP', icon: '🪙' }
		];
		const original = structuredClone(notices);
		pushNotices(notices);
		expect(toasts.map((t) => t.text)).toEqual(['+20 XP · +4 GP']);
		expect(notices).toEqual(original);
		vi.advanceTimersByTime(12000);
		expect(toasts).toHaveLength(0);
	});

	it('keeps separate actions separate', () => {
		for (let i = 0; i < 2; i++) {
			pushNotices([{ kind: 'xp', text: '+20 XP' }, { kind: 'gp', text: '+4 GP' }]);
		}
		expect(toasts.map((t) => t.text)).toEqual(['+20 XP · +4 GP', '+20 XP · +4 GP']);
		expect(toasts[0].id).not.toBe(toasts[1].id);
	});

	it('preserves celebrations and other notices between rewards', () => {
		pushNotices([
			{ kind: 'xp', text: '+20 XP' },
			{ kind: 'level', text: 'Reached level 2!', icon: '🎉' },
			{ kind: 'gp', text: '+4 GP' },
			{ kind: 'item', text: 'Found a berry', icon: '🫐' }
		]);
		expect(toasts.map(({ kind, text }) => ({ kind, text }))).toEqual([
			{ kind: 'xp', text: '+20 XP · +4 GP' },
			{ kind: 'level', text: 'Reached level 2!' },
			{ kind: 'item', text: 'Found a berry' }
		]);
		expect(celebration.level).toBe(2);
	});

	it('keeps single rewards and persistent refusals intact', () => {
		pushNotices([{ kind: 'gp', text: '+4 GP' }, { kind: 'warn', text: 'Choose a habit first' }]);
		expect(toasts.map((t) => t.text)).toEqual(['+4 GP', 'Choose a habit first']);
		vi.advanceTimersByTime(12000);
		expect(toasts.map((t) => t.text)).toEqual(['Choose a habit first']);
	});
});
