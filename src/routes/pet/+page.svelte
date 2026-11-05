<script lang="ts">
	import { enhance } from '$app/forms';
	import { withNotices } from '$lib/act';
	import { STATS } from '$lib/content/stats';
	import { ADULT_AT, MOOD_TEXT, nextPetGrowth, petXpToNext, TEEN_AT } from '$lib/game/pet-needs';
	import { countdown, ticker } from '$lib/clock.svelte';
	import TarotArch from '$lib/components/TarotArch.svelte';
	import Bar from '$lib/components/Bar.svelte';
	import PetSprite from '$lib/components/PetSprite.svelte';
	import PixelIcon from '$lib/components/PixelIcon.svelte';
	import Figure from '$lib/components/Figure.svelte';
	import { bed } from '$lib/sprites/room';

	let { data, form } = $props();
	const clock = ticker(() => data.now);

	const companion = $derived(data.pets.find((p) => p.active));
	const others = $derived(data.pets.filter((p) => !p.active && p.stage !== 'egg'));
	const eggs = $derived(data.pets.filter((p) => p.stage === 'egg'));
	const growth = $derived(companion ? nextPetGrowth(companion.level, companion.xp) : null);
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
<p class="small soft">Your companion grows alongside your work. Care changes their mood; the levels and forms they’ve reached stay with them.</p>
{#if form && 'error' in form && form.error}<p class="bad" role="alert">{form.error}</p>{/if}

{#if companion}
	<section class="companion">
		<div class="pet-top">
			<div class="care-room arch-card">
				<TarotArch />
				<span class="room-bed"><Figure figure={bed} key="room:painted-bed" scale={3.7} animate={false} /></span>
				<PetSprite speciesId={companion.speciesId} stage={companion.stage} accessoryId={companion.accessoryId} mood={companion.mood} scale={3.7} label={companion.name} />
				<span class="scene-label">{companion.name}’s nook</span>
			</div>
			<div class="pet-details">
				<div class="pet-summary">
					<div class="pet-info">
						<h2>{companion.name}</h2>
						<p class="small soft">{companion.speciesName} · <span class="numeral">Lv {companion.level}</span> · {companion.stage}</p>
						<button bind:this={renameButton} class="rename small soft" type="button" onclick={() => (renaming = !renaming)} aria-expanded={renaming}>Rename</button>
						<p class="pet-mood small soft">{companion.away ? `${companion.name} is away on an expedition.` : `${companion.name} ${MOOD_TEXT[companion.mood]}.`} Loves {companion.affinity.map((a) => STATS[a].name).join(' & ')}.</p>
						{#if data.companionTrip}
							<div class="trip-status small">
								<p>{data.companionTrip.name} · {data.companionTrip.endsAt <= clock.now ? 'Ready to return' : `${countdown(data.companionTrip.endsAt - clock.now)} remaining`}</p>
								<a class="btn small ghost" href="/missions#on-road">{data.companionTrip.endsAt <= clock.now ? 'Collect trip rewards' : 'View expedition'}</a>
							</div>
						{/if}
					</div>
				</div>
				{#if renaming}
					<form method="POST" action="?/rename" class="rename-form" use:enhance={withNotices({ then: (ok) => { if (ok) { renaming = false; renameButton?.focus(); } } })}>
						<input type="hidden" name="pet" value={companion.id} />
						<label class="sr-only" for="pet-name">New name</label>
						<input bind:this={renameInput} id="pet-name" name="name" maxlength="24" value={companion.name} />
						<button class="btn small">Save</button>
					</form>
				{/if}

				{#if !companion.away}
					<div class="care">
						{#each [['pat', 'Pat', companion.cooldowns.pat], ['play', 'Play', companion.cooldowns.play], ['tidy', 'Tidy', companion.cooldowns.tidy]] as const as [action, label, cd] (action)}
							{@const remaining = Math.max(0, cd - Math.max(0, clock.now - data.now))}
							<form method="POST" action="?/{action}" use:enhance={withNotices()}>
								<input type="hidden" name="pet" value={companion.id} />
								<button class="btn ghost wide" disabled={remaining > 0}><PixelIcon name={action === 'pat' ? 'joy' : action === 'play' ? 'ball' : 'broom'} scale={1} /> {label}{remaining > 0 ? ` (${wait(remaining)})` : ''}</button>
							</form>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<div class="box needs">
			<h2 class="sr-only">Daily care</h2>
			<div class="need"><PixelIcon name="food" scale={1} /><span>Fullness</span><Bar value={companion.needs.fullness} max={100} label="Fullness" showValue /></div>
			<div class="need"><PixelIcon name="joy" scale={1} /><span>Joy</span><Bar value={companion.needs.joy} max={100} label="Joy" showValue /></div>
			<div class="need"><PixelIcon name="tidy" scale={1} /><span>Tidy</span><Bar value={companion.needs.tidiness} max={100} label="Tidiness" showValue /></div>
			<div class="need"><PixelIcon name="xp" scale={1} /><span>Growth</span><Bar value={companion.xp} max={petXpToNext(companion.level)} color="var(--xp)" label="Growth to next level" showValue /></div>
		</div>

		{#if !companion.away}

			<div class="spread feed-heading"><h2>Feed</h2><span class="small soft">From your bag</span></div>
			{#if data.food.length}
				<div class="food">
					{#each data.food as f (f.id)}
						<form method="POST" action="?/feed" use:enhance={withNotices()}>
							<input type="hidden" name="pet" value={companion.id} />
							<input type="hidden" name="item" value={f.id} />
							<button class="tile" title={f.blurb} aria-label="Feed {f.name} to {companion.name}">
								<PixelIcon art={f.icon} tint={f.tint} scale={3} />
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
			<form method="POST" action="?/forage" use:enhance={withNotices()} class="forage">
				<button class="forage-button"><PixelIcon name="berry" scale={1} /> Forage for berries (free, once a day)</button>
			</form>
		{/if}
		<section class="box growth-guide" aria-labelledby="growth-heading">
			<h2 id="growth-heading">Growing together</h2>
			<p class="small">Your completed tasks and habit check-ins share some of your XP with {companion.name}. Work linked to {companion.affinity.map((a) => STATS[a].name).join(' & ')} shares more. Care and expeditions help them grow too.</p>
			<div class="stages">
				{#each ['baby', 'teen', 'adult'] as const as stage (stage)}
					<figure class:current={companion.stage === stage}>
						<PetSprite speciesId={companion.speciesId} {stage} scale={1.5} label="{companion.name}’s {stage} form" />
						<figcaption class="small">{stage}<span class="soft">{stage === 'baby' ? 'Level 1' : stage === 'teen' ? `Level ${TEEN_AT}` : `Level ${ADULT_AT}`}</span>{#if companion.stage === stage}<strong>Current form</strong>{/if}</figcaption>
					</figure>
				{/each}
			</div>
			<p class="small">{growth ? `${growth.remainingXp} growth XP to the ${growth.stage} form at level ${growth.atLevel}.` : 'Adult form reached. This appearance stays as your companion grows.'}</p>
			<a class="btn small ghost" href="/">Make progress on Today</a>
			<p class="small soft">Care can fit around your day. <a href="/settings">Rest mode</a> pauses needs when you want a break.</p>
		</section>
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

<section class="box" aria-labelledby="discoveries-heading">
	<h2 id="discoveries-heading">Discover new companions</h2>
	<p class="small soft">Expeditions can bring back eggs. Each task or habit check-in adds warmth; hatch an egg when it’s ready, then choose your companion from the nest.</p>
	<div class="discoveries">
		{#each data.discoveries as discovery (discovery.id)}
			<article class="discovery">
				<PetSprite speciesId={discovery.id} stage={discovery.stage} scale={2} label="{discovery.name}{discovery.hatched ? '' : ' egg'}" />
				<div><h3>{discovery.name}</h3><p class="small soft">{discovery.rarity} · {discovery.hatched ? 'In your nest' : discovery.owned ? 'Egg warming' : 'Not discovered'}</p></div>
				<p class="small discovery-description">{discovery.blurb}</p>
				{#if discovery.source}<p class="small soft discovery-description">Look on {discovery.source.name}{discovery.source.unlocked ? '' : ` · unlocks at level ${discovery.source.minLevel}`}. Egg finds are a chance reward.</p>{/if}
			</article>
		{/each}
	</div>
	<a class="btn small ghost" href="/missions#expeditions">Explore expeditions</a>
</section>

<style>
	.trip-status p { margin: 8px 0; }
	.trip-status .btn { width: 100%; }
	.stages { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 16px 0; }
	.stages figure { min-width: 0; margin: 0; padding: 10px 2px; border: 1px solid var(--line); display: flex; align-items: center; flex-direction: column; }
	.stages .current { border-color: var(--focus); background: var(--bg-3); }
	.stages figcaption { text-align: center; text-transform: capitalize; margin-top: 8px; }
	.stages figcaption span, .stages figcaption strong { display: block; font-size: 10px; }
	.growth-guide a:not(.btn) { display: inline-flex; min-height: 24px; align-items: center; }
	.growth-guide { margin-top: 20px; }
	.discoveries { display: grid; gap: 12px; margin: 16px 0; }
	.discovery { display: grid; grid-template-columns: 82px minmax(0, 1fr); align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--line); background: var(--bg-3); }
	.discovery h3 { font-size: 26px; margin: 0; }
	.discovery p { margin: 6px 0 0; }
	.discovery-description { grid-column: 1 / -1; }
	.page-heading {
		margin-bottom: 14px;
	}

	.companion {
		margin-bottom: 24px;
	}

	.pet-top {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.04fr);
		gap: 15px;
		align-items: start;
		margin-bottom: 16px;
	}

	.care-room {
		height: 250px;
		display: flex;
		align-items: end;
		justify-content: center;
		padding-bottom: 23px;
		border-radius: 50% 50% 4px 4px / 35% 35% 4px 4px;
	}

	.care-room :global(.pet) {
		position: relative;
		z-index: 2;
	}
	.room-bed { position: absolute; left: 50%; bottom: 25px; transform: translateX(-50%); z-index: 1; line-height: 0; }

	.pet-summary {
		margin-bottom: 6px;
		padding-top: 3px;
	}

	.pet-info h2 {
		font-size: 31px;
		line-height: 1.05;
		margin-bottom: 6px;
		overflow-wrap: anywhere;
	}

	.pet-info p {
		margin-bottom: 0;
		font-size: 11px;
		line-height: 1.4;
	}

	.pet-info .numeral {
		font-family: 'DM Sans', system-ui, sans-serif;
	}

	.rename-form {
		display: grid;
		gap: 6px;
		margin-block: 8px;
	}

	.rename {
		background: none;
		border: 0;
		padding: 4px 0;
		font-family: inherit;
		text-decoration: underline;
		cursor: pointer;
		min-height: 24px;
	}

	.pet-info .pet-mood {
		font-size: 11px;
		border-top: 1px solid var(--line);
		margin-top: 5px;
		padding-top: 8px;
	}

	.needs {
		display: grid;
		gap: 0;
		margin-bottom: 18px;
		padding: 8px 14px;
	}

	.need {
		display: grid;
		grid-template-columns: 18px 53px minmax(0, 1fr);
		align-items: center;
		gap: 8px;
		min-height: 30px;
		font-size: 12px;
	}

	.need :global(.val) {
		font: 600 12px 'DM Sans', system-ui, sans-serif;
		min-width: 46px;
		color: var(--ink);
	}

	.care {
		display: grid;
		gap: 5px;
	}

	.care .btn {
		justify-content: flex-start;
		padding: 8px 12px;
		gap: 8px;
		font-size: 13px;
		background: var(--paper);
	}

	.nest {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
		gap: 12px;
	}

	.feed-heading {
		margin: 10px 0;
	}

	.feed-heading h2 {
		margin: 0;
	}

	.food {
		display: grid;
		gap: 10px;
	}

	.food .tile {
		display: grid;
		grid-template-columns: 48px minmax(0, 1fr) auto;
		align-items: center;
		gap: 12px;
		padding: 10px 14px;
		width: 100%;
		min-height: 66px;
		background: var(--paper);
		text-align: left;
		outline: 1px solid var(--line);
		outline-offset: -5px;
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

	.food-description .small {
		font-size: 11px;
	}

	.feed-label {
		display: grid;
		place-items: center;
		min-height: 44px;
		min-width: 56px;
		padding: 8px 10px;
		background: var(--accent);
		color: var(--accent-ink);
		font: 400 14px 'DM Sans', system-ui, sans-serif;
	}

	.forage {
		text-align: center;
		margin-top: 4px;
	}

	.forage-button {
		color: var(--ink);
		border: 0;
		background: none;
		text-decoration: underline;
		text-underline-offset: 3px;
		font: inherit;
		font-size: 11px;
		min-height: 32px;
		cursor: pointer;
	}

	.egg {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 0;
	}

	@media (min-width: 600px) {
		.care-room {
			height: 290px;
			padding-bottom: 24px;
		}
		.care-room :global(.pet) {
			transform: scale(1.4);
			transform-origin: 50% 100%;
		}
		.pet-info h2 {
			font-size: 42px;
		}
		.pet-info p {
			font-size: 14px;
		}
	}

	@media (max-width: 359px) {
		.pet-top {
			gap: 10px;
		}
		.care-room :global(.pet) {
			transform: scale(0.88);
			transform-origin: 50% 100%;
		}
		.need {
			gap: 5px;
		}
	}
</style>
