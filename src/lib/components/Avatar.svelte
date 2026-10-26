<script lang="ts">
	import type { AvatarConfig } from '$lib/content/types';
	import { avatarFigure } from '$lib/sprites/layers';
	import Figure from './Figure.svelte';

	let { avatar, scale = 4, animate = true, label = 'Hero' }: { avatar: AvatarConfig; scale?: number; animate?: boolean; label?: string } =
		$props();

	const figure = $derived(avatarFigure(avatar));
	const key = $derived('avatar:' + JSON.stringify(avatar));
</script>

<Figure {figure} {key} {scale} {animate} {label} />
