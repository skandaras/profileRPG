<script lang="ts">
	import type { PaletteSet, Ramp } from '$lib/sprites/grid';
	import { ICON_PALETTE } from '$lib/sprites/svg';
	import { UI_ICONS, uiIconFigure, type UiIcon, type UiIconName } from '$lib/sprites/ui-icons';
	import type { Art } from '$lib/content/types';
	import { svgDocument } from '$lib/sprites/svg';
	import Figure from './Figure.svelte';

	let {
		name,
		art,
		tint,
		scale = 2,
		label = ''
	}: { name?: UiIconName; art?: Art; tint?: Ramp; scale?: number; label?: string } = $props();

	const spec = $derived.by((): { art: Art; palette: PaletteSet; fixedColors?: boolean; key: string } => {
		if (name) {
			const ui = UI_ICONS[name] as UiIcon;
			return { ...ui, key: `ui:${name}` };
		}
		return {
			art: art!,
			palette: { ...ICON_PALETTE, ...(tint ? { primary: tint } : {}) },
			key: `icon:${'svg' in art! ? art!.svg : 'png' in art! ? art!.png : 'painted' in art! ? art!.painted : art!.sprite.rows.join('')}:${tint?.join() ?? ''}`
		};
	});
	const figure = $derived(uiIconFigure(spec));
</script>

{#if 'svg' in spec.art}
	<span class="svg-icon" role={label ? 'img' : undefined} aria-label={label || undefined} aria-hidden={label ? undefined : 'true'} style:width="{16 * Math.max(1, scale)}px" style:height="{16 * Math.max(1, scale)}px">
		<!-- Only source-owned SVG fragments reach this renderer. -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html svgDocument(spec.art, spec.palette)}
	</span>
{:else}
	<Figure {figure} key={spec.key} scale={Math.max(1, Math.floor(scale))} animate={false} {label} />
{/if}

<style>
	.svg-icon { display: inline-flex; vertical-align: middle; flex: none; }
	.svg-icon :global(svg) { width: 100%; height: 100%; }
</style>
