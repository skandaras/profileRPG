<script lang="ts">
	import { enhance } from '$app/forms';
	import { withNotices } from '$lib/act';
	import HabitForm from '$lib/components/HabitForm.svelte';

	let { data } = $props();
	let confirmDelete = $state(false);
</script>

<svelte:head><title>{data.habit.title} · LevelUp</title></svelte:head>

<p><a href="/habits" class="small">← Habits</a></p>
<h1>{data.habit.icon} {data.habit.title}</h1>

{#if data.habit.kind === 'habit'}
	<section class="box">
		<div class="row wrap">
			<span class="chip">🔥 Streak {data.habit.streak}</span>
			<span class="chip">🏆 Best {data.habit.bestStreak}</span>
		</div>
		<h3 style="margin-top:12px">Last four weeks</h3>
		<div class="cal" role="list" aria-label="Ticks per day over the last 28 days">
			{#each data.history as d (d.day)}
				<span role="listitem" class="cell" class:on={d.count > 0} title="{d.label}: {d.count}" aria-label="{d.label}: {d.count}"
					>{d.count > 1 ? d.count : ''}</span
				>
			{/each}
		</div>
	</section>
{/if}

<section class="box">
	<h2>Edit</h2>
	{#key data.habit}
		<form method="POST" action="?/save" use:enhance={withNotices()}>
			<HabitForm initial={data.habit} allowKind={false} />
		</form>
	{/key}
</section>

<section class="box">
	<h3>Put it away</h3>
	<p class="small soft">Archiving keeps its history and stops it counting. Deleting removes it and its history for good.</p>
	<div class="row wrap">
		<form method="POST" action="?/archive" use:enhance={withNotices()}>
			<button class="btn ghost">Archive</button>
		</form>
		{#if !confirmDelete}
			<button class="btn ghost" type="button" onclick={() => (confirmDelete = true)}>Delete…</button>
		{:else}
			<form method="POST" action="?/delete" use:enhance={withNotices()}>
				<button class="btn" style="background:var(--bad)">Yes, delete it forever</button>
			</form>
			<button class="btn ghost" type="button" onclick={() => (confirmDelete = false)}>Keep it</button>
		{/if}
	</div>
</section>

<style>
	.cal {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 4px;
	}

	.cell {
		aspect-ratio: 1;
		border: 2px solid var(--line);
		border-radius: 4px;
		background: var(--bg-3);
		display: grid;
		place-items: center;
		font-size: 0.75rem;
	}

	.cell.on {
		background: var(--good);
		color: var(--bg-2);
	}
</style>
