<script lang="ts">
	import { COSMETICS, OPTIONAL_SLOTS, SLOT_NAMES, SLOT_ORDER } from '$lib/content/cosmetics';
	import { DYES, EYE_COLORS, HAIR_COLORS, SKIN_TONES, type Swatch } from '$lib/content/palettes';
	import { dyeItemId } from '$lib/content';
	import type { AvatarConfig, AvatarSlot, ColorSlot } from '$lib/content/types';
	import { isUnlocked } from '$lib/game/ownership';
	import { unlockHint } from '$lib/unlocks';
	import Avatar from './Avatar.svelte';

	let {
		avatar = $bindable(),
		level = 1,
		owned = [],
		starterOnly = false
	}: { avatar: AvatarConfig; level?: number; owned?: string[]; starterOnly?: boolean } = $props();

	const ownedSet = $derived(new Set(owned));
	const has = (id: string, unlock: (typeof COSMETICS)[number]['unlock']) =>
		starterOnly ? unlock.kind === 'starter' : isUnlocked(unlock, level, ownedSet.has(id));

	let slot = $state<AvatarSlot>('body');

	const COLOR_FOR: Partial<Record<AvatarSlot, ColorSlot>> = {
		body: 'skin',
		face: 'eyes',
		hair: 'hair',
		top: 'top',
		bottom: 'bottom',
		shoes: 'shoes',
		headwear: 'headwear',
		accessory: 'accessory'
	};
	const COLOR_LABEL: Record<ColorSlot, string> = {
		skin: 'Skin tone',
		eyes: 'Eye colour',
		hair: 'Hair colour',
		top: 'Dye',
		bottom: 'Dye',
		shoes: 'Dye',
		headwear: 'Dye',
		accessory: 'Dye'
	};

	const options = $derived(COSMETICS.filter((c) => c.slot === slot));
	const colorSlot = $derived(COLOR_FOR[slot]);
	const swatches = $derived.by((): (Swatch & { locked: boolean; hint: string })[] => {
		const free = (s: Swatch) => ({ ...s, locked: false, hint: '' });
		if (colorSlot === 'skin') return SKIN_TONES.map(free);
		if (colorSlot === 'hair') return HAIR_COLORS.map(free);
		if (colorSlot === 'eyes') return EYE_COLORS.map(free);
		if (!colorSlot) return [];
		return DYES.map((d) => {
			const locked = starterOnly ? d.unlock.kind !== 'starter' : !isUnlocked(d.unlock, level, ownedSet.has(dyeItemId(d.id)));
			return { ...d, locked, hint: unlockHint(d.unlock) };
		}).filter((d) => !(starterOnly && d.locked));
	});

	function wear(id: string | null) {
		const parts = { ...avatar.parts };
		if (id) parts[slot] = id;
		else delete parts[slot];
		avatar = { ...avatar, parts };
	}

	function tint(id: string) {
		if (!colorSlot) return;
		avatar = { ...avatar, colors: { ...avatar.colors, [colorSlot]: id } };
	}

	const preview = (id: string | null): AvatarConfig => {
		const parts = { ...avatar.parts };
		if (id) parts[slot] = id;
		else delete parts[slot];
		return { ...avatar, parts };
	};
</script>

<div class="editor">
	<div class="stage">
		<Avatar {avatar} scale={5} label="Your hero" />
	</div>

	<div class="tabs" role="tablist" aria-label="Avatar parts">
		{#each SLOT_ORDER as s (s)}
			<button
				type="button"
				role="tab"
				class="btn small"
				class:ghost={slot !== s}
				aria-selected={slot === s}
				onclick={() => (slot = s)}>{SLOT_NAMES[s]}</button
			>
		{/each}
	</div>

	<div class="grid parts" role="group" aria-label={SLOT_NAMES[slot]}>
		{#if OPTIONAL_SLOTS.includes(slot)}
			<button type="button" class="tile" aria-pressed={!avatar.parts[slot]} onclick={() => wear(null)}>
				<Avatar avatar={preview(null)} scale={2} animate={false} label="" />
				<span class="small">None</span>
			</button>
		{/if}
		{#each options as o (o.id)}
			{@const ok = has(o.id, o.unlock)}
			{#if ok || !starterOnly}
				<button
					type="button"
					class="tile"
					aria-pressed={avatar.parts[slot] === o.id}
					disabled={!ok}
					title={ok ? o.name : unlockHint(o.unlock)}
					onclick={() => wear(o.id)}
				>
					<Avatar avatar={preview(o.id)} scale={2} animate={false} label="" />
					<span class="small">{o.name}</span>
					{#if !ok}<span class="lock small soft">🔒 {unlockHint(o.unlock)}</span>{/if}
				</button>
			{/if}
		{/each}
	</div>

	{#if colorSlot}
		<h3 class="sw-title">{COLOR_LABEL[colorSlot]}</h3>
		<div class="swatches" role="group" aria-label={COLOR_LABEL[colorSlot]}>
			{#each swatches as s (s.id)}
				<button
					type="button"
					class="swatch"
					aria-pressed={avatar.colors[colorSlot] === s.id}
					aria-label={s.locked ? `${s.name} (locked: ${s.hint})` : s.name}
					title={s.locked ? `${s.name}: ${s.hint}` : s.name}
					disabled={s.locked}
					style:--c0={s.ramp[0]}
					style:--c1={s.ramp[1]}
					style:--c2={s.ramp[2]}
					onclick={() => tint(s.id)}
				>
					{#if s.locked}<span aria-hidden="true">🔒</span>{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.stage {
		display: flex;
		justify-content: center;
		padding: 12px 0 16px;
		background: linear-gradient(var(--sky) 0 72%, var(--floor) 72%);
		border: 3px solid var(--line);
		border-radius: 8px;
		margin-bottom: 12px;
	}

	.parts {
		grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
		max-height: 340px;
		overflow-y: auto;
		padding: 4px;
	}

	.lock {
		font-size: 0.7rem;
		line-height: 1.2;
	}

	.sw-title {
		margin-top: 14px;
	}

	.swatches {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.swatch {
		width: 44px;
		height: 44px;
		border: 3px solid var(--line);
		border-radius: 6px;
		background: linear-gradient(135deg, var(--c2) 0 30%, var(--c1) 30% 70%, var(--c0) 70%);
		cursor: pointer;
		display: grid;
		place-items: center;
		font-size: 0.9rem;
	}

	.swatch[aria-pressed='true'] {
		outline: 3px solid var(--accent);
		outline-offset: 2px;
	}

	.swatch:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
</style>
