<script lang="ts">
	import PixelIcon from '$lib/components/PixelIcon.svelte';
	import DisplayIcon from '$lib/components/DisplayIcon.svelte';
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import { withNotices } from '$lib/act';
	import HabitForm from '$lib/components/HabitForm.svelte';

	let { data } = $props();
	let confirmDelete = $state(false);
	async function setDelete(value: boolean) {
		confirmDelete = value;
		await tick();
		document.getElementById(value ? 'delete-confirm' : 'delete-start')?.focus();
	}
</script>

<svelte:head><title>{data.habit.title} · LevelUp</title></svelte:head>

<a href="/habits" class="back small">← Habits</a>
<h1><DisplayIcon value={data.habit.icon} /> {data.habit.title}</h1>

{#if data.habit.kind === 'habit'}
	<section class="box">
		<div class="row wrap">
			<span class="chip"><PixelIcon name="flame" scale={1} /> Streak {data.habit.streak}</span>
			<span class="chip"><PixelIcon name="trophy" scale={1} /> Best {data.habit.bestStreak}</span>
		</div>
		<h2 class="mt">Last four weeks</h2>
		<p class="small soft">Numbers show ticks; a dot means none.</p>
		<div class="cal" role="list" aria-label="Ticks per day over the last 28 days">
			{#each data.history as d (d.day)}
				<span role="listitem" class="cell" class:on={d.count > 0} title="{d.label}: {d.count}" aria-label="{d.label}: {d.count}"
					>{d.count > 0 ? d.count : '·'}</span
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
	<h2>Put it away</h2>
	<p class="small soft">Archiving keeps its history and stops it counting. Deleting removes it and its history for good.</p>
	<div class="row wrap">
		<form method="POST" action="?/archive" use:enhance={withNotices()}>
			<button class="btn ghost">Archive</button>
		</form>
		{#if !confirmDelete}
			<button class="btn ghost" type="button" id="delete-start" onclick={() => setDelete(true)}>Delete…</button>
		{:else}
			<form method="POST" action="?/delete" use:enhance={withNotices()}>
				<button id="delete-confirm" class="btn danger">Yes, delete it forever</button>
			</form>
			<button class="btn ghost" type="button" onclick={() => setDelete(false)}>Keep it</button>
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
		border: 1px solid var(--line);
		background: var(--bg-3);
		display: grid;
		place-items: center;
		font-size: 14px;
		font-weight: 600;
	}

	.cell.on {
		background: var(--bg-3);
		color: var(--good);
		border-bottom: 4px solid var(--good);
	}
</style>
