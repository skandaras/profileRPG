import { describe, expect, it } from 'vitest';
import { habitFromForm, quickTaskFromForm } from './forms';
import { GameError } from './events';

const form = (due: string) => {
	const data = new FormData();
	data.set('title', 'Send the report');
	data.set('kind', 'task');
	data.set('due', due);
	return data;
};

describe('task capture dates', () => {
	it('stores calendar dates without depending on the host timezone', () => {
		const day = Date.parse('2028-02-29T00:00:00Z') / 86_400_000;
		expect(quickTaskFromForm(form('2028-02-29'))).toMatchObject({ kind: 'task', title: 'Send the report', dueDay: day });
		expect(habitFromForm(form('2028-02-29')).dueDay).toBe(day);
		expect(quickTaskFromForm(form('')).dueDay).toBeNull();
	});

	it.each(['2026-02-29', '2026-02-30', '2026-13-01', '2026-01-32', '0000-01-01', 'tomorrow', '2026-11-05T00:00:00Z'])('rejects %s instead of silently changing or removing the due date', (value) => {
		expect(() => quickTaskFromForm(form(value))).toThrow(GameError);
		expect(() => habitFromForm(form(value))).toThrow('Choose a valid due date');
	});

	it('keeps quick capture a one-off task with ordinary defaults regardless of extra fields', () => {
		const data = form('');
		data.set('kind', 'habit');
		data.set('difficulty', 'hard');
		data.set('quantity', '100');
		data.set('stats', 'str');
		expect(quickTaskFromForm(data)).toEqual({ kind: 'task', title: 'Send the report', dueDay: null, icon: '⭐', difficulty: 'medium', weights: {} });
	});
});
