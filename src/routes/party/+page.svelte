<script lang="ts">
	import { STAT_IDS, STATS } from '$lib/content/stats';
	import Avatar from '$lib/components/Avatar.svelte';
	import PetSprite from '$lib/components/PetSprite.svelte';

	let { data } = $props();

	function ago(at: number): string {
		const m = Math.round((data.now - at) / 60_000);
		if (m < 1) return 'just now';
		if (m < 60) return `${m}m ago`;
		const h = Math.round(m / 60);
		if (h < 24) return `${h}h ago`;
		return `${Math.round(h / 24)}d ago`;
	}
</script>

<svelte:head><title>Party · LevelUp</title></svelte:head>

<a href="/me" class="back small">← Me</a>
<h1>The party</h1>

{#each data.cards as c (c.userId)}
	<section class="box card">
		<div class="figures">
			<Avatar avatar={c.avatar} scale={3} label={c.heroName} />
			{#if c.pet}<PetSprite speciesId={c.pet.speciesId} stage={c.pet.stage} accessoryId={c.pet.accessoryId} mood={c.pet.mood} scale={2} label={c.pet.name} />{/if}
		</div>
		<div class="grow">
			<h2>{c.heroName}{#if c.userId === data.me}<span class="small soft"> (you)</span>{/if}</h2>
			<p class="small">
				Level {c.level}{#if c.pet} · with {c.pet.name} the {c.pet.speciesName}{/if}{#if c.resting} · resting <span aria-hidden="true">🛌</span>{/if}
			</p>
			<div class="row wrap">
				{#each STAT_IDS as s (s)}<span class="chip" style:color={STATS[s].color}>{STATS[s].short} {c.stats[s]}</span>{/each}
				{#if c.bestStreak > 1}<span class="chip"><span aria-hidden="true">🔥</span> Streak {c.bestStreak}</span>{/if}
				{#if c.returnStreak > 1}<span class="chip"><span aria-hidden="true">🔁</span> Back {c.returnStreak} days in a row</span>{/if}
			</div>
		</div>
	</section>
{/each}

<section class="box">
	<h2>Party news</h2>
	{#each data.feed as e (e.id)}
		<p class="news list-row"><span aria-hidden="true">{e.icon}</span> {e.text} <span class="small soft">{ago(e.at)}</span></p>
	{:else}
		<p class="soft">Nothing yet. Go make some news!</p>
	{/each}
</section>

<style>
	.card {
		display: flex;
		gap: 12px;
		align-items: center;
	}

	.figures {
		display: flex;
		align-items: flex-end;
		gap: 2px;
		flex: none;
	}

	.news {
		margin: 0;
		display: block;
	}
@media (max-width: 420px) { .card { flex-direction: column; align-items: flex-start; } }
</style>
