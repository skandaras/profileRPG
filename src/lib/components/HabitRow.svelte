<script lang="ts">
	import { enhance } from '$app/forms';
	import { withNotices } from '$lib/act';
	import { STATS } from '$lib/content/stats';
	import type { StatId } from '$lib/content/types';
	import type { HabitView } from '$lib/server/modules/habits';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { habit, action = '?/tick', undoAction = '?/undo', link = true }: { habit: HabitView; action?: string; undoAction?: string; link?: boolean } =
		$props();

	let showAmount = $state(false);
	let busy = $state(false);
	const stats = $derived(Object.keys(habit.weights) as StatId[]);
	const enhanceTick: SubmitFunction = (input) => {
		busy = true;
		return withNotices({
			then: () => {
				busy = false;
				showAmount = false;
			}
		})(input);
	};
</script>

<div class="habit" class:done={habit.done}>
	<form method="POST" action={action} use:enhance={enhanceTick} class="tick-form">
		<input type="hidden" name="id" value={habit.id} />
		<button
			class="tick"
			disabled={busy || (habit.kind === 'task' && habit.done)}
			aria-label={habit.done && habit.target === 1 ? `${habit.title}, done. Log again` : `Tick off ${habit.title}`}
		>
			{#if habit.done}✓{:else}<span aria-hidden="true">{habit.icon}</span>{/if}
		</button>
		{#if showAmount && habit.quantity}
			<label class="sr-only" for="amt-{habit.id}">How many {habit.unit}</label>
			<input id="amt-{habit.id}" class="amount" type="number" name="amount" min="1" value={habit.quantity} inputmode="numeric" />
		{/if}
	</form>

	<div class="body">
		{#if link}
			<a class="title name" href="/habits/{habit.id}">{habit.title}</a>
		{:else}
			<span class="title name">{habit.title}</span>
		{/if}
		<div class="meta small soft">
			{#if habit.kind === 'habit'}
				<span>{habit.scheduleText}</span>
				{#if habit.target > 1}<span class="chip">{habit.count}/{habit.target}</span>{/if}
				{#if habit.daysLeft && habit.daysLeft > 1 && !habit.done}<span>· {habit.daysLeft} days left</span>{/if}
			{:else}
				<span>Task</span>
			{/if}
			{#if habit.quantity}<span>· {habit.quantity} {habit.unit}</span>{/if}
			{#each stats as s (s)}<span class="stat" style:color={STATS[s].color}>{STATS[s].short}</span>{/each}
		</div>
	</div>

	<div class="side">
		{#if habit.streak > 1}<span class="chip streak" title="{habit.streak} in a row">🔥 {habit.streak}</span>{/if}
		{#if habit.quantity && !habit.done}
			<button class="btn ghost small" type="button" aria-expanded={showAmount} onclick={() => (showAmount = !showAmount)} title="Log a different amount">±</button>
		{/if}
		{#if habit.completedToday}
			<form method="POST" action={undoAction} use:enhance={withNotices()}>
				<input type="hidden" name="id" value={habit.id} />
				<button class="btn ghost small" aria-label="Undo the last tick of {habit.title}">↩</button>
			</form>
		{/if}
	</div>
</div>

<style>
	.habit {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 0;
		border-bottom: 2px dashed var(--bg-3);
	}

	.habit:last-child {
		border-bottom: 0;
	}

	.tick-form {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.tick {
		width: 48px;
		height: 48px;
		flex: none;
		font-size: 1.4rem;
		border: 3px solid var(--line);
		border-radius: 8px;
		background: var(--bg-3);
		color: var(--ink);
		cursor: pointer;
		box-shadow: 0 3px 0 var(--line);
	}

	.tick:active:not(:disabled) {
		transform: translateY(2px);
		box-shadow: 0 1px 0 var(--line);
	}

	.done .tick {
		background: var(--good);
		color: var(--bg-2);
		font-weight: 700;
	}

	.amount {
		width: 4.5em;
		min-height: 40px;
	}

	.body {
		flex: 1;
		min-width: 0;
	}

	.name {
		display: block;
		font-size: 1rem;
		text-decoration: none;
		margin: 0;
	}

	.done .name {
		color: var(--ink-soft);
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 6px;
		align-items: center;
	}

	.stat {
		font-weight: 700;
		font-size: 0.75rem;
		filter: saturate(1.2);
	}

	.side {
		display: flex;
		gap: 6px;
		align-items: center;
	}
</style>
