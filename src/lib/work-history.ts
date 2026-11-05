export const HISTORY_PAGE_SIZE = 20;
export type HistoryKind = 'all' | 'task' | 'habit';
export type HistoryRange = 'all' | '7' | '30';

export interface HistoryFilters {
	q: string;
	kind: HistoryKind;
	range: HistoryRange;
	page: number;
}

export function historyFilters(params: URLSearchParams): HistoryFilters {
	const kind = params.get('kind'), range = params.get('range'), page = Number(params.get('page'));
	return {
		q: (params.get('q') ?? '').trim().slice(0, 120),
		kind: kind === 'task' || kind === 'habit' ? kind : 'all',
		range: range === '7' || range === '30' ? range : 'all',
		page: Number.isSafeInteger(page) && page >= 1 ? page : 1
	};
}

export function historyUrl(filters: HistoryFilters, page = filters.page): string {
	const params = new URLSearchParams();
	if (filters.q) params.set('q', filters.q);
	if (filters.kind !== 'all') params.set('kind', filters.kind);
	if (filters.range !== 'all') params.set('range', filters.range);
	if (page > 1) params.set('page', String(page));
	return '/history' + (params.size ? '?' + params.toString() : '');
}

export function historyDayLabel(day: number, today: number): string {
	if (day === today) return 'Today';
	if (day === today - 1) return 'Yesterday';
	return new Intl.DateTimeFormat('en', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(day * 86_400_000);
}
