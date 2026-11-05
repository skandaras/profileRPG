import { expect, it } from 'vitest';
import { historyDayLabel, historyFilters, historyUrl } from './work-history';

it('normalises filters and preserves literal search text through pagination links', () => {
	const filters = historyFilters(new URLSearchParams('q=%20100%25_%20ready%20&kind=task&range=7&page=2'));
	expect(filters).toEqual({ q: '100%_ ready', kind: 'task', range: '7', page: 2 });
	const link = new URL(historyUrl(filters, 3), 'http://localhost');
	expect(historyFilters(link.searchParams)).toEqual({ ...filters, page: 3 });
	expect(historyUrl(historyFilters(new URLSearchParams()))).toBe('/history');
	expect(historyFilters(new URLSearchParams('page=Infinity&kind=unknown&range=-4'))).toEqual({ q: '', kind: 'all', range: 'all', page: 1 });
	expect(historyFilters(new URLSearchParams('page=-2')).page).toBe(1);
	expect(historyFilters(new URLSearchParams('page=1.5')).page).toBe(1);
	expect(historyFilters(new URLSearchParams({ q: 'x'.repeat(200) })).q).toHaveLength(120);
});

it('labels the stored completion day without using the wall clock', () => {
	const today = Date.parse('2026-11-05T00:00:00Z') / 86_400_000;
	expect(historyDayLabel(today, today)).toBe('Today');
	expect(historyDayLabel(today - 1, today)).toBe('Yesterday');
	expect(historyDayLabel(today - 8, today)).toContain('2026');
});
