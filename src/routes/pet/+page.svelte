<script lang="ts">
	import { enhance } from '$app/forms';
	import { withNotices } from '$lib/act';
	import { STATS } from '$lib/content/stats';
	import { MOOD_TEXT, petXpToNext } from '$lib/game/pet-needs';
	import Bar from '$lib/components/Bar.svelte';
	import PetSprite from '$lib/components/PetSprite.svelte';
	import PixelIcon from '$lib/components/PixelIcon.svelte';

	let { data } = $props();

	const companion = $derived(data.pets.find((p) => p.active));
	const others = $derived(data.pets.filter((p) => !p.active && p.stage !== 'egg'));
	const eggs = $derived(data.pets.filter((p) => p.stage === 'egg'));
	let renaming = $state(false);
	let renameInput: HTMLInputElement | undefined = $state();
	let renameButton: HTMLButtonElement | undefined = $state();
	$effect(() => {
		if (renaming) renameInput?.focus();
	});

	const wait = (ms: number) => {
		const m = Math.ceil(ms / 60_000);
		return m >= 60 ? `${Math.ceil(m / 60)}h` : `${m}m`;
	};
</script>

<svelte:head><title>Pet · LevelUp</title></svelte:head>

<div class="page-heading"><h1>Pet care</h1><span class="small soft">Your companion</span></div>

{#if companion}
	<section class="companion">
		<div class="box pet-summary">
			<div class="pet-info">
				<h2>{companion.name}</h2>
				<p class="small soft">{companion.speciesName} · <span class="numeral">Lv {companion.level}</span><br />{companion.stage} · loves {companion.affinity.map((a) => STATS[a].name).join(' & ')}</p>
				<p class="pet-mood small soft">{companion.away ? `${companion.name} is away on a mission.` : `${companion.name} ${MOOD_TEXT[companion.mood]}.`}</p>
				<button bind:this={renameButton} class="rename small soft" type="button" onclick={() => (renaming = !renaming)} aria-expanded={renaming}>Rename</button>
			</div>
			<PetSprite speciesId={companion.speciesId} stage={companion.stage} accessoryId={companion.accessoryId} mood={companion.mood} scale={4} label={companion.name} />
		</div>
		{#if renaming}
			<form method="POST" action="?/rename" class="row" use:enhance={withNotices({ then: (ok) => { if (ok) { renaming = false; renameButton?.focus(); } } })}>
				<input type="hidden" name="pet" value={companion.id} />
				<label class="sr-only" for="pet-name">New name</label>
				<input bind:this={renameInput} id="pet-name" name="name" maxlength="24" value={companion.name} />
				<button class="btn small">Save</button>
			</form>
		{/if}

		<div class="box needs">
			<h2 class="sr-only">Daily care</h2>
			<div class="need"><PixelIcon name="food" scale={1} /><span>Fullness</span><Bar value={companion.needs.fullness} max={100} label="Fullness" showValue /></div>
			<div class="need"><PixelIcon name="joy" scale={1} /><span>Joy</span><Bar value={companion.needs.joy} max={100} label="Joy" showValue /></div>
			<div class="need"><PixelIcon name="tidy" scale={1} /><span>Tidy</span><Bar value={companion.needs.tidiness} max={100} label="Tidiness" showValue /></div>
			<div class="need"><PixelIcon name="xp" scale={1} /><span>Growth</span><Bar value={companion.xp} max={petXpToNext(companion.level)} color="var(--xp)" label="Growth to next level" showValue /></div>
		</div>

		{#if !companion.away}
			<div class="care">
				{#each [['pat', 'Pat', companion.cooldowns.pat], ['play', 'Play', companion.cooldowns.play], ['tidy', 'Tidy', companion.cooldowns.tidy]] as const as [action, label, cd] (action)}
					<form method="POST" action="?/{action}" use:enhance={withNotices()}>
						<input type="hidden" name="pet" value={companion.id} />
						<button class="btn ghost wide" disabled={cd > 0}><PixelIcon name={action === 'pat' ? 'joy' : action === 'play' ? 'ball' : 'broom'} scale={1} /> {label}{cd > 0 ? ` (${wait(cd)})` : ''}</button>
					</form>
				{/each}
			</div>

			<div class="spread feed-heading"><h2>Feed</h2><span class="small soft">From your bag</span></div>
			{#if data.food.length}
				<div class="food">
					{#each data.food as f (f.id)}
						<form method="POST" action="?/feed" use:enhance={withNotices()}>
							<input type="hidden" name="pet" value={companion.id} />
							<input type="hidden" name="item" value={f.id} />
							<button class="tile" title={f.blurb} aria-label="Feed {f.name} to {companion.name}">
								<PixelIcon art={f.icon} tint={f.tint} scale={2} />
								<span class="food-description"><strong>{f.name}</strong><span class="small soft">{f.qty} in your bag{f.effect.fullness ? ` · +${f.effect.fullness} Full` : ''}{f.effect.joy ? ` · +${f.effect.joy} Joy` : ''}</span></span>
								<span class="feed-label numeral">Feed</span>
							</button>
						</form>
					{/each}
				</div>
			{:else}
				<p class="small soft">The cupboard is bare. Forage below, or buy food in the <a href="/shop">shop</a>.</p>
			{/if}
		{/if}
		{#if data.canForage}
			<form method="POST" action="?/forage" use:enhance={withNotices()} class="mt">
				<button class="btn ghost wide"><PixelIcon name="berry" scale={1} /> Forage for berries (free, once a day)</button>
			</form>
		{/if}
	</section>

	{#if data.accessories.length}
		<section class="box">
			<h2>Dress up {companion.name}</h2>
			<form method="POST" action="?/accessory" use:enhance={withNotices()} class="row wrap">
				<input type="hidden" name="pet" value={companion.id} />
				<button class="btn small" class:ghost={!!companion.accessoryId} aria-pressed={!companion.accessoryId} name="accessory" value="">Nothing{#if !companion.accessoryId}<PixelIcon name="check" scale={1} />{/if}</button>
				{#each data.accessories as a (a.id)}
					<button class="btn small" class:ghost={companion.accessoryId !== a.id} aria-pressed={companion.accessoryId === a.id} name="accessory" value={a.id}>{a.name}{#if companion.accessoryId === a.id}<PixelIcon name="check" scale={1} />{/if}</button>
				{/each}
			</form>
		</section>
	{/if}
{/if}

{#if eggs.length}
	<section class="box">
		<h2>Eggs</h2>
		<p class="small soft">Every activity you log keeps your eggs warm.</p>
		{#each eggs as e (e.id)}
			{@const ready = e.warmth >= e.warmthNeeded}
			<div class="egg">
				<PetSprite speciesId={e.speciesId} stage="egg" scale={2} {ready} label={`${e.speciesName} egg, ${ready ? 'ready to hatch' : 'warming'}`} />
				<div class="grow">
					<Bar value={e.warmth} max={e.warmthNeeded} color="var(--gp)" label="Warmth" showValue />
				</div>
				{#if ready}
					<form method="POST" action="?/hatch" use:enhance={withNotices()}>
						<input type="hidden" name="pet" value={e.id} />
						<button class="btn small">Hatch!</button>
					</form>
				{/if}
			</div>
		{/each}
	</section>
{/if}

{#if others.length}
	<section class="box">
		<h2>The nest</h2>
		<div class="nest">
			{#each others as p (p.id)}
				<div class="tile">
					<PetSprite speciesId={p.speciesId} stage={p.stage} accessoryId={p.accessoryId} mood={p.mood} scale={2} label={p.name} />
					<strong class="small">{p.name}</strong>
					<span class="small soft">Lv {p.level} {p.speciesName}</span>
					<form method="POST" action="?/active" use:enhance={withNotices()}>
						<input type="hidden" name="pet" value={p.id} />
						<button class="btn small" disabled={p.away}>{p.away ? 'Away' : 'Companion'}</button>
					</form>
				</div>
			{/each}
		</div>
	</section>
{/if}

<style>
	.companion {
		margin-bottom: 24px;
	}

	.pet-summary {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 128px;
		align-items: center;
		gap: 8px;
		min-height: 152px;
		margin-bottom: 20px;
		padding: 12px 16px;
	}

	.pet-info h2 {
		font-size: 24px;
		line-height: 28px;
	}

	.pet-info p {
		margin-bottom: 0;
	}

	.rename {
		background: none;
		border: 0;
		padding: 0;
		font-family: inherit;
		text-decoration: underline;
		cursor: pointer;
		min-height: 24px;
	}

	.needs {
		display: grid;
		gap: 4px;
		margin-bottom: 20px;
	}

	.need {
		display: grid;
		grid-template-columns: 24px 48px 1fr;
		align-items: center;
		gap: 8px;
		min-height: 32px;
		font-size: 13px;
	}

	.care {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		margin-bottom: 24px;
	}

	.care .btn {
		padding: 8px 4px;
		gap: 4px;
		font-size: 16px;
	}

	.nest {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
		gap: 12px;
	}

	.feed-heading {
		margin-bottom: 16px;
	}

	.feed-heading h2 {
		margin: 0;
	}

	.food {
		display: grid;
		gap: 12px;
	}

	.food .tile {
		display: grid;
		grid-template-columns: 32px 1fr auto;
		align-items: center;
		gap: 12px;
		padding: 16px;
		width: 100%;
		min-height: 88px;
		background: var(--bg-2);
		text-align: left;
	}

	.food-description {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.food-description strong {
		font-size: 15px;
		font-weight: 600;
	}

	.feed-label {
		padding: 12px 12px;
		background: var(--accent);
		color: var(--accent-ink);
		font-size: 18px;
	}

	.egg {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 0;
	}

</style>
