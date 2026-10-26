<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { AvatarConfig } from '$lib/content/types';
	import { bed } from '$lib/sprites/room';
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


</script>

<div class="room">
	<div class="room-label small soft"><span>{heroName}{pet ? ` & ${pet.name}` : ''}</span><span>{pet?.away ? 'Away' : 'At home'}</span></div>
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
		height: 224px;
		background: var(--bg-3);
		margin: 0 4px 12px;
		box-shadow: 0 2px 0 var(--trim);
		isolation: isolate;
	}

	.room::before {
		content: '';
		position: absolute;
		inset: 4px -4px;
		background: inherit;
		z-index: -1;
	}

	.room-label {
		position: absolute;
		top: 16px;
		left: 16px;
		right: 16px;
		display: flex;
		justify-content: space-between;
		gap: 8px;
	}

	.bed {
		position: absolute;
		right: 16px;
		bottom: 16px;
	}

	.hero {
		position: absolute;
		left: 16px;
		bottom: 20px;
	}

	.pet {
		position: absolute;
		right: 8px;
		bottom: 28px;
	}

	.away {
		position: absolute;
		right: 16px;
		bottom: 64px;
		max-width: 128px;
		padding: 8px;
		background: var(--bg-2);
	}

</style>
