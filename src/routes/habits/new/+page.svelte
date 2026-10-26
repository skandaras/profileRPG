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

<h1>Add a habit</h1>

<div class="tabs">
	<button type="button" class="btn small" class:ghost={custom} onclick={() => (custom = false)}>Pick from the list</button>
	<button type="button" class="btn small" class:ghost={!custom} onclick={() => (custom = true)}>Build your own</button>
</div>

{#if !custom}
	<section class="box">
		<p class="small soft">Tap one to add it. You can change any detail afterwards.</p>
		{#each HABIT_TEMPLATES as t (t.id)}
			<form method="POST" action="?/template" use:enhance={withNotices()} class="tpl">
				<input type="hidden" name="template" value={t.id} />
				<span class="emoji" aria-hidden="true">{t.icon}</span>
				<div class="body">
					<strong>{t.title}</strong>
					<div class="small soft">
						{describeSchedule(t.schedule)}{t.quantity ? ` · ${t.quantity} ${t.unit}` : ''}
						{#each Object.keys(t.weights) as StatId[] as s (s)}<span class="stat" style:color={STATS[s].color}>{STATS[s].short}</span>{/each}
					</div>
					<div class="small">{t.blurb}</div>
				</div>
				<button class="btn small" disabled={data.have.includes(t.id)}>{data.have.includes(t.id) ? 'Added' : 'Add'}</button>
			</form>
		{/each}
	</section>
{:else}
	<section class="box">
		{#if form?.error}<p class="bad">{form.error}</p>{/if}
		<form method="POST" action="?/create" use:enhance={withNotices()}>
			<HabitForm
				initial={{ kind: 'habit', title: '', icon: '⭐', notes: null, difficulty: 'medium', weights: {}, schedule: { type: 'daily', target: 1 }, quantity: null, unit: null, dueDay: null }}
				submitLabel="Create"
			/>
		</form>
	</section>
{/if}

<style>
	.tpl {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 0;
		border-bottom: 2px dashed var(--bg-3);
	}

	.tpl:last-child {
		border-bottom: 0;
	}

	.emoji {
		font-size: 1.6rem;
	}

	.body {
		flex: 1;
	}

	.stat {
		margin-left: 6px;
		font-weight: 700;
	}
</style>
