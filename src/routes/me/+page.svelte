<script lang="ts">
	import DisplayIcon from '$lib/components/DisplayIcon.svelte';
	import { enhance } from '$app/forms';
	import { withNotices } from '$lib/act';
	import { STAT_IDS, STATS } from '$lib/content/stats';
	import Avatar from '$lib/components/Avatar.svelte';
	import Bar from '$lib/components/Bar.svelte';
	import PixelIcon from '$lib/components/PixelIcon.svelte';

	let { data } = $props();
</script>

<svelte:head><title>{data.hero.heroName} · LevelUp</title></svelte:head>

<section class="box hero">
	<Avatar avatar={data.hero.avatar} scale={4} label={data.hero.heroName} />
	<div class="grow">
		<h1>{data.hero.heroName}</h1>
		<p class="small">Level {data.hero.level} · {data.hero.totalXp} XP earned</p>
		<Bar value={data.hero.xp} max={data.hero.xpNext} label="Experience" showValue />
		<div class="links row wrap">
			<a class="btn small" href="/wardrobe"><PixelIcon name="shirt" scale={1} /> Wardrobe</a>
			<a class="btn small ghost" href="/shop"><PixelIcon name="bag" scale={1} /> Shop</a>
			<a class="btn small ghost" href="/party"><PixelIcon name="confetti" scale={1} /> Party</a>
			<a class="btn small ghost" href="/settings"><PixelIcon name="gear" scale={1} /> Settings</a>
		</div>
	</div>
</section>

<section class="box">
	<div class="spread">
		<h2>Stats</h2>
		{#if data.hero.attrPoints}<span class="chip pts">{data.hero.attrPoints} point{data.hero.attrPoints > 1 ? 's' : ''} to spend</span>{/if}
	</div>
	<p class="small soft">Stats train as you log activities, and level-ups give you points to add wherever you like.</p>
	{#each STAT_IDS as s (s)}
		{@const t = data.training[s]}
		<div class="stat list-row">
			<PixelIcon name={s} scale={2} />
			<div class="grow">
				<div class="spread">
					<strong>{STATS[s].name}</strong>
					<span class="title num">{data.stats[s]}</span>
				</div>
				<Bar value={t.into} max={t.next} color={STATS[s].color} label="{STATS[s].name} training" />
				<div class="small soft">{STATS[s].blurb} Trained +{t.level}, points +{data.allocated[s]}.</div>
			</div>
			{#if data.hero.attrPoints > 0}
				<form method="POST" action="?/allocate" use:enhance={withNotices()}>
					<input type="hidden" name="stat" value={s} />
					<input type="hidden" name="points" value="1" />
					<button class="btn small" aria-label="Add a point to {STATS[s].name}">+1</button>
				</form>
			{/if}
		</div>
	{/each}
</section>

<section class="box">
	<div class="spread">
		<h2>Abilities</h2>
		{#if data.hero.abilityPoints}<span class="chip pts">{data.hero.abilityPoints} to learn</span>{/if}
	</div>
	<p class="small soft">You earn an ability point every level. Abilities are permanent.</p>
	{#if data.hero.abilityPoints < 1}<p class="small soft">Reach your next level to earn a point to learn an ability.</p>{/if}
	{#each data.abilities as a (a.id)}
		<div class="ability list-row" class:learned={a.learned}>
			<span class="ability-icon"><DisplayIcon value={a.icon} scale={2} /></span>
			<div class="grow">
				<strong>{a.name}</strong>
				<div class="small">{a.blurb}</div>
				{#if !a.learned && !a.ready}<div class="small soft">Needs level {a.minLevel}{a.requires?.length ? ' and the ability before it' : ''}</div>{/if}
			</div>
			{#if a.learned}
				<span class="chip good">Learned</span>
			{:else}
				<form method="POST" action="?/learn" use:enhance={withNotices()}>
					<input type="hidden" name="ability" value={a.id} />
					<button class="btn small" disabled={!a.ready || data.hero.abilityPoints < 1}>Learn</button>
				</form>
			{/if}
		</div>
	{/each}
</section>

<style>
	.hero {
		display: flex;
		gap: 16px;
		align-items: center;
		border-radius: 70px 70px 0 0;
		padding-top: 30px;
	}

	.links {
		margin-top: 12px;
	}

	.num {
		font-size: 20px;
		margin: 0;
	}

	.ability:not(.learned) .ability-icon {
		filter: grayscale(0.4);
	}

	@media (max-width: 480px) {
		.hero {
			flex-direction: column;
			text-align: center;
		}
	}
</style>
