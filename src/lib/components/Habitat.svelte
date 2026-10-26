<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { AvatarConfig } from '$lib/content/types';
	import { petBed } from '$lib/sprites/art/icons';
	import { REFERENCE_PALETTE } from '$lib/content/palettes';
	import Avatar from './Avatar.svelte';
	import Figure from './Figure.svelte';
	import PetSprite from './PetSprite.svelte';

	let {
		avatar,
		heroName,
		pet,
		children
	}: {
		avatar: AvatarConfig;
		heroName: string;
		pet: { name: string; speciesId: string; stage: 'baby' | 'teen' | 'adult' | 'egg'; accessoryId: string | null; mood: string; away: boolean } | null;
		children?: Snippet;
	} = $props();

	const bed = {
		w: 28,
		h: 10,
		pivot: 0,
		layers: [{ z: 0, art: { sprite: petBed() }, palette: { ...REFERENCE_PALETTE, primary: ['#8a3a5a', '#c05a80', '#e88aaa'] as const, secondary: ['#c8b0a0', '#f0e0d0', '#ffffff'] as const } }]
	};
</script>

<div class="room">
	<div class="window" aria-hidden="true"></div>
	<div class="bed"><Figure figure={bed} key="bed" scale={4} animate={false} /></div>
	<div class="hero"><Avatar {avatar} scale={4} label={heroName} /></div>
	{#if pet && !pet.away}
		<div class="pet">
			<PetSprite speciesId={pet.speciesId} stage={pet.stage} accessoryId={pet.accessoryId} mood={pet.mood} scale={4} label={pet.name} />
		</div>
	{:else if pet?.away}
		<div class="away small">{pet.name} is out adventuring</div>
	{/if}
	{@render children?.()}
</div>

<style>
	.room {
		position: relative;
		height: 240px;
		border: 3px solid var(--line);
		border-radius: 8px;
		overflow: hidden;
		background:
			repeating-linear-gradient(90deg, transparent 0 46px, color-mix(in srgb, var(--line) 10%, transparent) 46px 48px) 0 0 / 100% 62%
				no-repeat,
			linear-gradient(var(--sky) 0 62%, var(--line) 62% calc(62% + 3px), var(--floor) calc(62% + 3px));
		margin-bottom: 12px;
	}

	.window {
		position: absolute;
		top: 18px;
		left: 50%;
		transform: translateX(-50%);
		width: 72px;
		height: 56px;
		border: 3px solid var(--line);
		border-radius: 4px;
		background:
			linear-gradient(90deg, transparent 47%, var(--line) 47% 53%, transparent 53%),
			linear-gradient(transparent 47%, var(--line) 47% 53%, transparent 53%),
			linear-gradient(#bfe6ff, #e8f6ff);
	}

	.bed {
		position: absolute;
		right: 14px;
		bottom: 26px;
	}

	.hero {
		position: absolute;
		left: 16%;
		bottom: 18px;
	}

	.pet {
		position: absolute;
		right: 24px;
		bottom: 36px;
	}

	.away {
		position: absolute;
		right: 12px;
		bottom: 70px;
		background: var(--bg-2);
		border: 2px solid var(--line);
		border-radius: 6px;
		padding: 2px 8px;
	}
</style>
