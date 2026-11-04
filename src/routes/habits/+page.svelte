<script lang="ts">
	import DisplayIcon from '$lib/components/DisplayIcon.svelte';
	import { enhance } from '$app/forms';
	import { withNotices } from '$lib/act';
	import HabitRow from '$lib/components/HabitRow.svelte';

	let { data } = $props();
	const habits = $derived(data.habits.filter((h) => h.kind === 'habit'));
	const tasks = $derived(data.habits.filter((h) => h.kind === 'task'));
</script>

<svelte:head><title>Habits · LevelUp</title></svelte:head>

<div class="page-heading">
	<h1>Habits</h1>
	<a class="btn" href="/habits/new">+ New</a>
</div>

<section class="box">
	<h2>Habits</h2>
	{#each habits as h (h.id)}<HabitRow habit={h} />{:else}<p class="soft">None yet.</p>{/each}
</section>

<section class="box">
	<h2>Tasks</h2>
	{#each tasks as h (h.id)}<HabitRow habit={h} />{:else}<p class="soft">No to-dos. <a href="/habits/new">Add one</a> for anything you want to get done once.</p>{/each}
</section>

{#if data.archived.length}
	<section class="box">
		<h2>Archived</h2>
		{#each data.archived as h (h.id)}
			<div class="spread arch">
				<span><DisplayIcon value={h.icon} /> {h.title}</span>
				<form method="POST" action="?/restore" use:enhance={withNotices()}>
					<input type="hidden" name="id" value={h.id} />
					<button class="btn ghost small">Restore</button>
				</form>
			</div>
		{/each}
	</section>
{/if}

<style>
	.arch {
		padding: 8px 0;
	}
</style>
