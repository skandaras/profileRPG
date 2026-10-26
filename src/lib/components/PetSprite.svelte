<script lang="ts">
	import type { PetStage } from '$lib/sprites/art/pets';
	import { petFigure } from '$lib/sprites/layers';
	import Figure from './Figure.svelte';

	let {
		speciesId,
		stage,
		accessoryId = null,
		scale = 4,
		mood = 'okay',
		ready = false,
		label = ''
	}: {
		speciesId: string;
		stage: PetStage;
		accessoryId?: string | null;
		scale?: number;
		mood?: string;
		ready?: boolean;
		label?: string;
	} = $props();

	const figure = $derived(petFigure(speciesId, stage, accessoryId));
	const key = $derived(`pet:${speciesId}:${stage}:${accessoryId ?? ''}`);
	// Happy pets bounce quicker; a sulking one barely moves.
	const speed = $derived(mood === 'happy' ? 0.7 : mood === 'sulking' ? 2.4 : 1.1);
</script>

<div class="pet" class:sulking={mood === 'sulking'} class:wobble={stage === 'egg' && ready}>
	<Figure {figure} {key} {scale} {speed} animate={stage !== 'egg'} {label} />
</div>

<style>
	.pet {
		display: inline-block;
		line-height: 0;
	}

	.sulking {
		filter: saturate(0.5) brightness(0.92);
	}

	.wobble {
		animation: wobble 0.9s steps(4) infinite;
		transform-origin: 50% 90%;
	}

	@keyframes wobble {
		0%,
		100% {
			transform: rotate(0);
		}
		25% {
			transform: rotate(-6deg);
		}
		75% {
			transform: rotate(6deg);
		}
	}
</style>
