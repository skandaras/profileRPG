<script lang="ts">
	import PixelIcon from './PixelIcon.svelte';
	import DisplayIcon from './DisplayIcon.svelte';
	import { celebration, toasts, dismissToast, pauseToast, resumeToast } from '$lib/toasts.svelte';

	let dialog: HTMLDialogElement | undefined = $state();
	let returnTo: HTMLElement | null = null;
	$effect(() => {
		if (celebration.level && dialog && !dialog.open) {
			returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
			dialog.showModal();
			dialog.querySelector<HTMLButtonElement>('button')?.focus();
		}
	});
	function trapFocus(event: KeyboardEvent) {
		if (event.key !== 'Tab' || !dialog) return;
		const controls = [...dialog.querySelectorAll<HTMLElement>('a[href], button:not(:disabled)')];
		const first = controls[0];
		const last = controls.at(-1);
		// Keep Tab at the prompt's edges instead of entering the browser's chrome.
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last?.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first?.focus();
		}
	}
	function close() {
		dialog?.close();
		celebration.level = null;
		if (returnTo?.isConnected && returnTo !== document.body) returnTo.focus();
		else document.getElementById('main')?.focus();
	}
	function dismiss(id: number, event: MouseEvent) {
		const button = event.currentTarget as HTMLButtonElement;
		const next = button.closest('.toast')?.nextElementSibling?.querySelector<HTMLButtonElement>('button');
		const previous = button.closest('.toast')?.previousElementSibling?.querySelector<HTMLButtonElement>('button');
		dismissToast(id);
		(next ?? previous ?? document.getElementById('main'))?.focus();
	}
</script>

<div class="toasts" role="region" aria-label="Notices" aria-live="polite" aria-relevant="additions">
	{#each toasts as t (t.id)}
		<div role="group" class="toast box" class:warn={t.kind === 'warn'} onpointerenter={() => pauseToast(t.id)} onpointerleave={() => resumeToast(t.id)} onfocusin={() => pauseToast(t.id)} onfocusout={() => resumeToast(t.id)}>
			<div class="notice" aria-atomic="true" role={t.kind === 'warn' ? 'alert' : undefined}>
				{#if t.icon}
					<DisplayIcon value={t.icon} />
				{/if}
				<span>{t.text}</span>
			</div>
			<button type="button" class="dismiss" aria-label={`Dismiss notice: ${t.text}`} onclick={(event) => dismiss(t.id, event)}><span aria-hidden="true">×</span></button>
		</div>
	{/each}
</div>

<dialog bind:this={dialog} class="box celebrate" onkeydown={trapFocus} aria-modal="true" aria-labelledby="lvl-title" aria-describedby="lvl-description" oncancel={(event) => { event.preventDefault(); close(); }} onclose={() => { if (celebration.level) close(); }}>
	<div class="burst" aria-hidden="true"><PixelIcon name="tidy" scale={2} /><PixelIcon name="confetti" scale={2} /><PixelIcon name="tidy" scale={2} /></div>
	<h2 id="lvl-title">Level {celebration.level ?? ''}!</h2>
	<p id="lvl-description">You have new points to spend on stats and abilities.</p>
	<div class="row wrap center">
		<a class="btn" href="/me" onclick={close}>Spend points</a>
		<button class="btn ghost" onclick={close}>Later</button>
	</div>
</dialog>

<style>
	.toasts {
		position: fixed;
		bottom: calc(env(safe-area-inset-bottom) + 80px);
		left: 50%;
		transform: translateX(-50%);
		width: min(420px, calc(100% - 32px));
		z-index: 50;
		pointer-events: none;
		display: flex;
		flex-direction: column;
		max-height: calc(60dvh - 24px);
		overflow-y: auto;
		padding: 4px;
		gap: 8px;
	}

	.toast {
		margin: 0;
		padding: 8px 12px;
		border: 1px solid var(--line);
		pointer-events: auto;
		justify-content: space-between;
		display: flex;
		gap: 8px;
		align-items: center;
		animation: pop 180ms ease-out;
	}


	.toast.warn {
		color: var(--bad);
	}

	@keyframes pop {
		from {
			transform: translateY(-8px);
			opacity: 0;
		}
	}

	.notice {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.dismiss {
		flex: none;
		width: 44px;
		height: 44px;
		border: 0;
		background: var(--bg-3);
		color: var(--ink);
		font-size: 24px;
		cursor: pointer;
	}
	dialog::backdrop {
		background: color-mix(in srgb, var(--shadow) 75%, transparent);
	}
	dialog.celebrate {
		position: fixed;
		inset: 0;
		height: fit-content;
		max-height: calc(100dvh - 48px);
		margin: auto;
		color: var(--ink);
		width: calc(100% - 40px);
		border: 1px solid var(--line);
		padding: 38px 20px 26px;
		border-radius: 70px 70px 2px 2px;
	}
	dialog:not([open]) {
		display: none;
	}

	.celebrate {
		text-align: center;
		max-width: 360px;
		animation: pop 240ms ease-out;
	}

	.burst {
		display: flex;
		justify-content: center;
		gap: 12px;
	}
</style>
