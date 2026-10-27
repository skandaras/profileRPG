import { tick } from 'svelte';
import type { SubmitFunction } from '@sveltejs/kit';
import type { Notice } from './notices';
import { pushNotices } from './toasts.svelte';

/**
 * The `use:enhance` handler every game form uses: toast what the action
 * reported (or the refusal), then refresh the page's data.
 */
export function withNotices(opts: { reset?: boolean; then?: (ok: boolean) => void | Promise<void> } = {}): SubmitFunction {
	return ({ formElement, submitter }) => {
		const focused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		const fallback = submitter instanceof HTMLElement ? submitter : formElement;
		return async ({ result, update }) => {
			let ok = false;
			const notices: Notice[] = [];
			if (result.type === 'success' || result.type === 'failure') {
				const data = (result.data ?? {}) as { notices?: Notice[]; error?: string };
				if (data.notices?.length) notices.push(...data.notices);
				if (data.error) notices.push({ kind: 'warn', text: data.error, icon: '⚠️' });
				ok = result.type === 'success';
			}
			await update({ reset: opts.reset ?? false });
			if (result.type === 'success' || result.type === 'failure') {
				await tick();
				if (focused?.isConnected && focused !== document.body && !focused.matches(':disabled')) focused.focus();
				else if (fallback.isConnected && !fallback.matches(':disabled')) fallback.focus();
				else document.getElementById('main')?.focus();
				await opts.then?.(ok);
				await tick();
				pushNotices(notices);
			}
		};
	};
}
