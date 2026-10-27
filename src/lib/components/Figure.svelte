<script lang="ts">
	import { renderFigure } from '$lib/sprites/render';
	import type { Figure } from '$lib/sprites/layers';

	let {
		figure,
		key,
		scale = 4,
		animate = true,
		label = '',
		speed = 1.1
	}: { figure: Figure; key: string; scale?: number; animate?: boolean; label?: string; speed?: number } = $props();

	let strip = $state<{ url: string; frames: number } | null>(null);

	$effect(() => {
		let live = true;
		void renderFigure(figure, key)
			.then((s) => {
				if (live) strip = s;
			})
			.catch(() => {});
		return () => {
			live = false;
		};
	});

	const frames = $derived(strip?.frames ?? 1);
</script>

<span
	class="figure pixel"
	class:animate={animate && frames > 1}
	role={label ? 'img' : undefined}
	aria-label={label || undefined}
	aria-hidden={label ? undefined : 'true'}
	style:width="{figure.w * scale}px"
	style:height="{figure.h * scale}px"
	style:background-image={strip ? `url(${strip.url})` : 'none'}
	style:background-size="{figure.w * frames * scale}px {figure.h * scale}px"
	style:--frames={frames}
	style:--shift="-{figure.w * frames * scale}px"
	style:--speed="{speed}s"
></span>

<style>
	.figure {
		display: inline-block;
		vertical-align: middle;
		flex: none;
		background-repeat: no-repeat;
		background-position: 0 0;
	}

	.animate {
		animation: idle var(--speed) steps(var(--frames)) infinite;
	}

	@keyframes idle {
		to {
			background-position: var(--shift) 0;
		}
	}
</style>
