import type { SubmitFunction } from '@sveltejs/kit';
import type { Notice } from './notices';
import { pushNotices } from './toasts.svelte';

/**
 * The `use:enhance` handler every game form uses: toast what the action
 * reported (or the refusal), then refresh the page's data.
 */
export function withNotices(opts: { reset?: boolean; then?: (ok: boolean) => void } = {}): SubmitFunction {
	return () =>
		async ({ result, update }) => {
			let ok = false;
			if (result.type === 'success' || result.type === 'failure') {
				const data = (result.data ?? {}) as { notices?: Notice[]; error?: string };
				if (data.notices?.length) pushNotices(data.notices);
				if (data.error) pushNotices([{ kind: 'warn', text: data.error, icon: '⚠️' }]);
				ok = result.type === 'success';
			}
			await update({ reset: opts.reset ?? false });
			opts.then?.(ok);
		};
}
