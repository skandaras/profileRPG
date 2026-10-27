<script lang="ts">
	import { enhance } from '$app/forms';
	import { withNotices } from '$lib/act';
	import { HABIT_TEMPLATES } from '$lib/content/habits';
	import { STATS } from '$lib/content/stats';
	import type { StatId } from '$lib/content/types';
	import { describeSchedule } from '$lib/game/schedule';
	import HabitForm from '$lib/components/HabitForm.svelte';

	let { data, form } = $props();
	let custom = $state(false);
</script>

<svelte:head><title>New habit · LevelUp</title></svelte:head>

<a href="/habits" class="back small">← Habits</a>
<h1>Add a habit</h1>

<div class="tabs">
	<button type="button" class="btn small" class:ghost={custom} class:selection={!custom} aria-pressed={!custom} onclick={() => (custom = false)}>Templates</button>
	<button type="button" class="btn small" class:ghost={!custom} class:selection={custom} aria-pressed={custom} onclick={() => (custom = true)}>Build your own</button>
</div>

{#if !custom}
	<section class="box">
		<p class="small soft">Tap one to add it. You can change any detail afterwards.</p>
		{#each HABIT_TEMPLATES as t (t.id)}
			<form method="POST" action="?/template" use:enhance={withNotices()} class="tpl list-row">
				<input type="hidden" name="template" value={t.id} />
				<span class="emoji" aria-hidden="true">{t.icon}</span>
				<div class="grow">
					<strong>{t.title}</strong>
					<div class="small soft">
						{describeSchedule(t.schedule)}{t.quantity ? ` · ${t.quantity} ${t.unit}` : ''}
						{#each Object.keys(t.weights) as StatId[] as s (s)}<span class="stat" style:color={STATS[s].color}>{STATS[s].short}</span>{/each}
					</div>
					<div class="small">{t.blurb}</div>
				</div>
				<button class="btn small" aria-label={data.have.includes(t.id) ? `${t.title}, already added` : `Add ${t.title}`} disabled={data.have.includes(t.id)}>{data.have.includes(t.id) ? 'Added' : 'Add'}</button>
			</form>
		{/each}
	</section>
{:else}
	<section class="box">
		{#if form?.error}<p class="bad" role="alert">{form.error}</p>{/if}
		<form method="POST" action="?/create" use:enhance={withNotices()}>
			<HabitForm
				initial={{ kind: 'habit', title: '', icon: '⭐', notes: null, difficulty: 'medium', weights: {}, schedule: { type: 'daily', target: 1 }, quantity: null, unit: null, dueDay: null }}
				submitLabel="Create"
			/>
		</form>
	</section>
{/if}

<style>
	.stat {
		margin-left: 8px;
		font-weight: 700;
	}
</style>
