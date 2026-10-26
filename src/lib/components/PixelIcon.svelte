<script lang="ts">
	import type { PaletteSet, Ramp, Sprite } from '$lib/sprites/grid';
	import { REFERENCE_PALETTE } from '$lib/content/palettes';
	import { ICON } from '$lib/sprites/frames';
	import { UI_ICONS, type UiIconName } from '$lib/sprites/ui-icons';
	import type { Art } from '$lib/content/types';
	import Figure from './Figure.svelte';

	let {
		name,
		art,
		tint,
		scale = 2,
		label = ''
	}: { name?: UiIconName; art?: Art; tint?: Ramp; scale?: number; label?: string } = $props();

	const spec = $derived.by((): { art: Art; palette: PaletteSet; key: string } => {
		if (name) {
			const ui = UI_ICONS[name] as { sprite: Sprite; palette: PaletteSet };
			return { art: { sprite: ui.sprite }, palette: ui.palette, key: `ui:${name}` };
		}
		return {
			art: art!,
			palette: { ...REFERENCE_PALETTE, ...(tint ? { primary: tint } : {}) },
			key: `icon:${'png' in art! ? art!.png : art!.sprite.rows.join('')}:${tint?.join() ?? ''}`
		};
	});
	const figure = $derived({ w: ICON.w, h: ICON.h, pivot: 0, layers: [{ z: 0, art: spec.art, palette: spec.palette }] });
</script>

<Figure {figure} key={spec.key} {scale} animate={false} {label} />
