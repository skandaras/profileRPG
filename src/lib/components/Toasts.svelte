<script lang="ts">
	import { celebration, toasts } from '$lib/toasts.svelte';
</script>

<div class="toasts" aria-live="polite">
	{#each toasts as t (t.id)}
		<div class="toast box" class:warn={t.kind === 'warn'} class:level={t.kind === 'level'}>
			{#if t.icon}<span aria-hidden="true">{t.icon}</span>{/if}
			<span>{t.text}</span>
		</div>
	{/each}
</div>

{#if celebration.level}
	<div class="overlay" role="dialog" aria-modal="true" aria-labelledby="lvl-title">
		<div class="box celebrate">
			<div class="burst" aria-hidden="true">✦ ✧ ✦</div>
			<h2 id="lvl-title">Level {celebration.level}!</h2>
			<p>You have new points to spend on stats and abilities.</p>
			<div class="row" style="justify-content:center">
				<a class="btn" href="/me" onclick={() => (celebration.level = null)}>Spend points</a>
				<button class="btn ghost" onclick={() => (celebration.level = null)}>Later</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.toasts {
		position: fixed;
		top: calc(env(safe-area-inset-top) + 64px);
		left: 50%;
		transform: translateX(-50%);
		width: min(420px, calc(100% - 32px));
		z-index: 50;
		pointer-events: none;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.toast {
		margin: 0;
		padding: 8px 12px;
		display: flex;
		gap: 8px;
		align-items: center;
		animation: pop 180ms steps(3);
	}

	.toast.warn {
		color: var(--bad);
	}

	.toast.level {
		font-weight: 700;
	}

	@keyframes pop {
		from {
			transform: translateY(-8px);
			opacity: 0;
		}
	}

	.overlay {
		position: fixed;
		inset: 0;
		z-index: 60;
		display: grid;
		place-items: center;
		padding: 16px;
		background: color-mix(in srgb, var(--line) 55%, transparent);
	}

	.celebrate {
		text-align: center;
		max-width: 360px;
		animation: pop 240ms steps(4);
	}

	.burst {
		font-size: 1.6rem;
		color: var(--gp);
		letter-spacing: 0.4em;
	}
</style>
