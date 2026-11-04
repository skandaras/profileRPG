import { describe, expect, it } from 'vitest';
import { ABILITIES } from '$lib/content/abilities';
import { MISSIONS } from '$lib/content/missions';
import { HABIT_ICONS, HABIT_TEMPLATES } from '$lib/content/habits';
import { UI_ICONS } from '$lib/sprites/ui-icons';
import { displayIcon } from './display-icon';

describe('saved icon display', () => {
	it('covers every offered habit, ability and mission', () => {
		const values = [...HABIT_ICONS, ...[...HABIT_TEMPLATES, ...ABILITIES, ...MISSIONS].map((c) => c.icon)];
		for (const value of values) {
			const name = displayIcon(value);
			expect(name, value).toBeDefined();
			expect(UI_ICONS[name!], value).toBeDefined();
		}
	});

	it('covers navigation, care, statuses, old notices and persisted feed events', () => {
		for (const value of ['🏡', '📋', '🐾', '🗺️', '👕', '🛍️', '🎉', '⚙️', '💕', '🫐', '🔥', '🏆', '🔁', '🔒', '⏳', '🛡️', '🌟', '✅', '🩹', '🛌', '☀️', '⚠️', '✨', '🎁', '🎒', '😋', '🥚', '🐣', '💝', '↩️']) {
			expect(UI_ICONS[displayIcon(value)!], value).toBeDefined();
		}
	});

	it('shares one symbol per idea and accepts either emoji presentation', () => {
		for (const [a, b] of [['⭐', '🌟'], ['💪', '🏋️'], ['📖', '📚'], ['😴', '🛌'], ['🌸', '🌼'], ['🎁', '💝'], ['✅', '✓']]) {
			expect(displayIcon(a)).toBe(displayIcon(b));
		}
		for (const value of ['🗺', '🛍', '⚙', '🛡', '☀', '⚠', '↩']) {
			expect(displayIcon(value)).toBe(displayIcon(value + '\uFE0F'));
			expect(displayIcon(value)).toBe(displayIcon(value + '\uFE0E'));
		}
	});

	it('leaves custom text, mixed symbols and unknown emoji for the text fallback', () => {
		for (const value of ['', 'A', '猫', '🦄', '⭐🏃', '🏃🏽', 'custom', '__proto__', 'constructor']) {
			expect(displayIcon(value), value).toBeUndefined();
		}
	});
});
