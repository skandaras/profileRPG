<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { AvatarConfig } from '$lib/content/types';
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

<div class="room">
	<div class="room-label small soft"><span>{heroName}{pet ? ` & ${pet.name}` : ''}</span><span>{pet?.away ? 'Away' : 'At home'}</span></div>
	<div class="window" aria-hidden="true"><i></i></div>
	<div class="plant" aria-hidden="true"><i></i><b></b></div>
	<div class="rug" aria-hidden="true"></div>
	<div class="hero"><Avatar {avatar} scale={3.6} label={heroName} /></div>
	{#if pet && !pet.away}
		<div class="pet">
			<PetSprite speciesId={pet.speciesId} stage={pet.stage} accessoryId={pet.accessoryId} mood={pet.mood} scale={3.5} label={pet.name} />
		</div>
	{:else if pet?.away}
		<div class="away small">{pet.name} is out adventuring</div>
	{/if}
	{@render children?.()}
</div>

<style>
	.room {
		position: relative;
		height: 228px;
		background: radial-gradient(ellipse at 25% 20%, var(--window), transparent 65%), var(--wash);
		border: 1px solid color-mix(in srgb, var(--trim) 45%, transparent);
		border-radius: 56px 56px 22px 22px;
		margin: 0 0 12px;
		box-shadow: inset 0 -33px 24px var(--floor);
		isolation: isolate;
	}
	.room-label { position: absolute; top: 17px; left: 20px; right: 20px; display: flex; justify-content: space-between; gap: 8px; font-size: 10px; z-index: 1; }
	.window { position: absolute; top: 46px; left: 40%; width: 69px; height: 93px; border-radius: 40px 40px 4px 4px; border: 5px solid var(--paper); background: var(--window); box-shadow: 0 2px 0 var(--trim); }
	.window::before, .window::after { content: ''; position: absolute; background: var(--paper); }
	.window::before { width: 4px; height: 100%; left: 28px; }
	.window::after { height: 4px; left: 0; right: 0; top: 47px; }
	.window i { position: absolute; inset: 40px 4px 0; background: var(--plant); opacity: 0.24; border-radius: 50% 50% 0 0; }
	.plant { position: absolute; bottom: 35px; right: 26px; height: 68px; width: 27px; }
	.plant::before, .plant::after, .plant i { content: ''; position: absolute; background: var(--plant); width: 15px; height: 29px; border-radius: 100% 0 100% 0; transform: rotate(-30deg); top: 2px; left: 1px; }
	.plant::after { left: 15px; top: 10px; transform: rotate(15deg); }
	.plant i { top: 23px; transform: rotate(-55deg); }
	.plant b { position: absolute; bottom: 0; width: 29px; height: 24px; border-radius: 4px 4px 10px 10px; background: var(--trim); }
	.rug { position: absolute; left: 33px; right: 31px; bottom: 17px; height: 38px; border-radius: 50%; background: var(--bg-3); border: 2px solid color-mix(in srgb, var(--plant) 35%, transparent); }
	.hero { position: absolute; left: 30px; bottom: 27px; }
	.pet { position: absolute; right: 16px; bottom: 26px; }
	.away { position: absolute; right: 16px; bottom: 64px; max-width: 128px; padding: 8px; background: var(--bg-2); border-radius: 16px; }
</style>
