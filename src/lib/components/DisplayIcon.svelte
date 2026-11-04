<script lang="ts">
	import { displayIcon } from '$lib/display-icon';
	import PixelIcon from './PixelIcon.svelte';

	let { value, scale = 1 }: { value: string; scale?: number } = $props();
	const name = $derived(displayIcon(value));
</script>

<span class="display-icon" aria-hidden="true">
	{#if name}<PixelIcon {name} {scale} />{:else}{value}{/if}
</span>

<style>
	.display-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		vertical-align: middle;
		flex: none;
	}
</style>
