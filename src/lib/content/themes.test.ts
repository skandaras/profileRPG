import { describe, expect, it } from 'vitest';
import { THEMES, type ThemeTokens } from './themes';

function luminance(hex: string): number {
	const n = parseInt(hex.slice(1), 16);
	const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
		const s = c / 255;
		return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
}

// Every pair the UI actually puts text on.
const TEXT_PAIRS: [keyof ThemeTokens, keyof ThemeTokens][] = [
	['ink', 'bg'],
	['ink', 'bg2'],
	['ink', 'bg3'],
	['inkSoft', 'bg2'],
	['inkSoft', 'bg'],
	['accentInk', 'accent'],
	['good', 'bg2'],
	['bad', 'bg2']
];

describe('themes', () => {
	for (const t of THEMES) {
		it(`${t.id} meets WCAG AA for text`, () => {
			for (const [fg, bg] of TEXT_PAIRS) {
				expect(contrast(t.tokens[fg], t.tokens[bg]), `${t.id}: ${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
			}
		});
	}
});
