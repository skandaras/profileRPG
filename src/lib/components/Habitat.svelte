<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { AvatarConfig } from '$lib/content/types';
	import TarotArch from './TarotArch.svelte';
	import Avatar from './Avatar.svelte';
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


</script>

<div class="room arch-card">
	<TarotArch />
	<div class="scene-label">{heroName}{pet ? ` & ${pet.name}` : ''} · {pet?.away ? 'Away' : 'At home'}</div>
	<div class="hero"><Avatar {avatar} scale={4.5} label={heroName} /></div>
	{#if pet && !pet.away}
		<div class="pet">
			<PetSprite speciesId={pet.speciesId} stage={pet.stage} accessoryId={pet.accessoryId} mood={pet.mood} scale={3.4} label={pet.name} />
		</div>
	{:else if pet?.away}
		<div class="away small">{pet.name} is out adventuring</div>
	{/if}
	{@render children?.()}
</div>

<style>
	.room {
		height: 236px;
		margin: 0 0 10px;
	}

	.hero {
		position: absolute;
		left: 22px;
		bottom: 21px;
		line-height: 0;
	}

	.pet {
		position: absolute;
		right: 16px;
		bottom: 21px;
	}

	.away {
		position: absolute;
		right: 16px;
		bottom: 64px;
		max-width: 128px;
		padding: 8px;
		background: var(--bg-2);
		border: 1px solid var(--line);
	}

	@media (min-width: 600px) {
		.room {
			height: 310px;
		}
		.hero {
			left: 16%;
			transform: scale(1.35);
			transform-origin: 50% 100%;
		}
		.pet {
			right: 14%;
			transform: scale(1.4);
			transform-origin: 50% 100%;
		}
	}

	@media (max-width: 359px) {
		.hero {
			left: 10px;
		}
		.pet {
			right: 4px;
		}
	}
</style>
