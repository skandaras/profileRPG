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

	const wait = (ms: number) => {
		const m = Math.ceil(ms / 60_000);
		return m >= 60 ? `${Math.ceil(m / 60)}h` : `${m}m`;
	};
</script>

<svelte:head><title>Pet · LevelUp</title></svelte:head>

{#if companion}
	<section class="box companion">
		<div class="spread">
			<div>
				<h1>{companion.name}</h1>
				<p class="small soft">
					Level {companion.level} {companion.speciesName} · {companion.stage} · loves {companion.affinity.map((a) => STATS[a].name).join(' & ')}
				</p>
			</div>
			<button class="btn ghost small" type="button" onclick={() => (renaming = !renaming)} aria-expanded={renaming}>Rename</button>
		</div>
		{#if renaming}
			<form method="POST" action="?/rename" class="row" use:enhance={withNotices({ then: () => (renaming = false) })}>
				<input type="hidden" name="pet" value={companion.id} />
				<label class="sr-only" for="pet-name">New name</label>
				<input id="pet-name" name="name" maxlength="24" value={companion.name} />
				<button class="btn small">Save</button>
			</form>
		{/if}

		<div class="stage">
			<PetSprite
				speciesId={companion.speciesId}
				stage={companion.stage}
				accessoryId={companion.accessoryId}
				mood={companion.mood}
				scale={6}
				label={companion.name}
			/>
		</div>
		<p class="center">{companion.away ? `${companion.name} is away on a mission.` : `${companion.name} ${MOOD_TEXT[companion.mood]}.`}</p>

		<div class="needs">
			<div class="need"><PixelIcon name="food" /><span>Full</span><Bar value={companion.needs.fullness} max={100} color="var(--stat-str)" label="Fullness" /></div>
			<div class="need"><PixelIcon name="joy" /><span>Joy</span><Bar value={companion.needs.joy} max={100} color="var(--stat-kno)" label="Joy" /></div>
			<div class="need"><PixelIcon name="tidy" /><span>Tidy</span><Bar value={companion.needs.tidiness} max={100} color="var(--stat-int)" label="Tidiness" /></div>
			<div class="need"><PixelIcon name="xp" /><span>Grow</span><Bar value={companion.xp} max={petXpToNext(companion.level)} color="var(--xp)" label="Growth to next level" /></div>
		</div>

		{#if !companion.away}
			<div class="care">
				{#each [['pat', '💕 Pat', companion.cooldowns.pat], ['play', '🎾 Play', companion.cooldowns.play], ['tidy', '🧹 Tidy', companion.cooldowns.tidy]] as const as [action, label, cd] (action)}
					<form method="POST" action="?/{action}" use:enhance={withNotices()}>
						<input type="hidden" name="pet" value={companion.id} />
						<button class="btn wide" disabled={cd > 0}>{label}{cd > 0 ? ` (${wait(cd)})` : ''}</button>
					</form>
				{/each}
			</div>

			<h3>Feed</h3>
			{#if data.food.length}
				<div class="food">
					{#each data.food as f (f.id)}
						<form method="POST" action="?/feed" use:enhance={withNotices()}>
							<input type="hidden" name="pet" value={companion.id} />
							<input type="hidden" name="item" value={f.id} />
							<button class="tile" title={f.blurb}>
								<PixelIcon art={f.icon} tint={f.tint} scale={2} />
								<span class="small">{f.name}</span>
								<span class="chip">×{f.qty}</span>
							</button>
						</form>
					{/each}
				</div>
			{:else}
				<p class="small soft">The cupboard is bare. Forage below, or buy food in the <a href="/shop">shop</a>.</p>
			{/if}
		{/if}
		{#if data.canForage}
			<form method="POST" action="?/forage" use:enhance={withNotices()} style="margin-top:10px">
				<button class="btn ghost wide">🫐 Forage for berries (free, once a day)</button>
			</form>
		{/if}
	</section>

	{#if data.accessories.length}
		<section class="box">
			<h3>Dress up {companion.name}</h3>
			<form method="POST" action="?/accessory" use:enhance={withNotices()} class="row wrap">
				<input type="hidden" name="pet" value={companion.id} />
				<button class="btn small" class:ghost={!!companion.accessoryId} name="accessory" value="">Nothing</button>
				{#each data.accessories as a (a.id)}
					<button class="btn small" class:ghost={companion.accessoryId !== a.id} name="accessory" value={a.id}>{a.name}</button>
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
				<PetSprite speciesId={e.speciesId} stage="egg" scale={2} {ready} label="An egg" />
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
	.stage {
		display: flex;
		justify-content: center;
		padding: 12px;
		background: linear-gradient(var(--sky) 0 70%, var(--floor) 70%);
		border: 3px solid var(--line);
		border-radius: 8px;
		margin: 10px 0;
	}

	.center {
		text-align: center;
	}

	.needs {
		display: grid;
		gap: 6px;
		margin-bottom: 14px;
	}

	.need {
		display: grid;
		grid-template-columns: 32px 3.5em 1fr;
		align-items: center;
		gap: 6px;
	}

	.care {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		margin-bottom: 14px;
	}

	.food,
	.nest {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		gap: 8px;
	}

	.food .tile {
		width: 100%;
	}

	.egg {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 6px 0;
	}

	.grow {
		flex: 1;
	}
</style>
