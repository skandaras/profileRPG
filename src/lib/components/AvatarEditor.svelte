<script lang="ts">
	import PixelIcon from '$lib/components/PixelIcon.svelte';
	import { OUTFITS } from '$lib/content/cosmetics';
	import { keeperLook } from '$lib/content/keeper';
	import { PAINT_HAIR, PAINT_SKIN, paintSwatch } from '$lib/content/painted-palettes';
	import type { AvatarConfig } from '$lib/content/types';
	import Avatar from './Avatar.svelte';

	let { avatar = $bindable() }: { avatar: AvatarConfig } = $props();
	const look = $derived(keeperLook(avatar));
	const groups = [{ slot: 'skin', name: 'Skin tone', swatches: PAINT_SKIN }, { slot: 'hair', name: 'Hair colour', swatches: PAINT_HAIR }] as const;

	function tint(slot: 'skin' | 'hair', id: string) {
		avatar = { ...avatar, colors: { ...avatar.colors, [slot]: id } };
	}
	function wear(id: string) {
		avatar = { ...avatar, parts: { ...avatar.parts, top: id } };
	}
</script>

<div class="editor">
	<div class="stage"><Avatar {avatar} scale={4} label="Your hero" /></div>
	{#each groups as group (group.slot)}
		<fieldset class="mt"><legend>{group.name}</legend>
			<div class="swatches" role="group" aria-label={group.name}>
				{#each group.swatches as s (s.id)}
					{@const selected = paintSwatch(group.slot, avatar.colors[group.slot]).id === s.id}
					<button type="button" class="swatch" aria-pressed={selected} aria-label={s.name} title={s.name}
						style:--c0={s.ramp[0]} style:--c1={s.ramp[1]} style:--c2={s.ramp[2]}
						onclick={() => tint(group.slot, s.id)}>
						{#if selected}<span class="swatch-mark"><PixelIcon name="check" scale={1} /></span>{/if}
					</button>
				{/each}
			</div>
		</fieldset>
	{/each}
	<fieldset class="mt"><legend>Outfit</legend>
		<div class="grid parts" role="group" aria-label="Outfit">
			{#each OUTFITS as o (o.id)}
				<button type="button" class="tile" aria-pressed={look.parts.top === o.id} onclick={() => wear(o.id)}>
					<Avatar avatar={{ ...avatar, parts: { ...avatar.parts, top: o.id } }} scale={2} animate={false} label="" />
					<span class="small">{o.name}{#if look.parts.top === o.id} <PixelIcon name="check" scale={1} />{/if}</span>
				</button>
			{/each}
		</div>
	</fieldset>
</div>

<style>
	.stage {
		display: flex;
		justify-content: center;
		padding: 12px 0 16px;
		background: var(--window);
		border: 1px solid var(--line);
		border-radius: 50% 50% 2px 2px / 65px 65px 2px 2px;
		margin: 0 auto 12px;
		max-width: 260px;
	}

	.parts {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		padding: 8px;
	}

	.swatches {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.swatch {
		width: 44px;
		height: 44px;
		border: 1px solid var(--line);
		background: linear-gradient(135deg, var(--c2) 0 30%, var(--c1) 30% 70%, var(--c0) 70%);
		cursor: pointer;
		display: grid;
		place-items: center;
		font-size: 14px;
	}

	.swatch[aria-pressed='true'] {
		outline: 3px solid var(--accent);
		outline-offset: 2px;
	}

	.swatch:disabled {
		cursor: not-allowed;
	}
	.swatch-mark {
		background: var(--bg-2);
		color: var(--ink);
		padding: 0 3px;
		font-size: 16px;
	}
	.swatch[aria-pressed='true']:focus-visible {
		outline: 3px solid var(--focus);
		outline-offset: 3px;
	}
</style>
