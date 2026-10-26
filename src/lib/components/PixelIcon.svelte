<script lang="ts">
	import type { PaletteSet, Ramp } from '$lib/sprites/grid';
	import { REFERENCE_PALETTE } from '$lib/content/palettes';
	import { ICON } from '$lib/sprites/frames';
	import { UI_ICONS, type UiIcon, type UiIconName } from '$lib/sprites/ui-icons';
	import type { Art } from '$lib/content/types';
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
			palette: { ...REFERENCE_PALETTE, ...(tint ? { primary: tint } : {}) },
			key: `icon:${'png' in art! ? art!.png : art!.sprite.rows.join('')}:${tint?.join() ?? ''}`
		};
	});
	const figure = $derived({ w: ICON.w, h: ICON.h, pivot: 0, layers: [{ z: 0, art: spec.art, palette: spec.palette, fixedColors: spec.fixedColors }] });
</script>

<Figure {figure} key={spec.key} {scale} animate={false} {label} />
