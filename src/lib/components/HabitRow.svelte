<script lang="ts">
	import DisplayIcon from './DisplayIcon.svelte';
	import PixelIcon from './PixelIcon.svelte';
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import { withNotices } from '$lib/act';
	import { STATS } from '$lib/content/stats';
	import type { StatId } from '$lib/content/types';
	import type { HabitView } from '$lib/server/modules/habits';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { habit, action = '?/tick', undoAction = '?/undo', link = true }: { habit: HabitView; action?: string; undoAction?: string; link?: boolean } =
		$props();

	let showAmount = $state(false);
	let tickButton: HTMLButtonElement | undefined = $state();
	let amountInput: HTMLInputElement | undefined = $state();
	async function toggleAmount() {
		showAmount = !showAmount;
		await tick();
		if (showAmount) amountInput?.focus();
	}
	let busy = $state(false);
	const canUndo = $derived(habit.done && habit.completedToday && habit.target === 1);
	const stats = $derived(Object.keys(habit.weights) as StatId[]);
	const enhanceTick: SubmitFunction = (input) => {
		busy = true;
		return withNotices({
			then: async () => {
				busy = false;
				showAmount = false;
				await tick();
				tickButton?.focus();
			}
		})(input);
	};
</script>

<div class="habit" class:done={habit.done}>
	<div class="body">
		{#if link}
			<a class="name" href="/habits/{habit.id}"><DisplayIcon value={habit.icon} /> {habit.title}</a>
		{:else}
			<span class="name"><DisplayIcon value={habit.icon} /> {habit.title}</span>
		{/if}
		<div class="meta small soft">
			{#if habit.quantity}
				{#if !habit.done}<button class="quantity soft" type="button" aria-label="Change amount for {habit.title}" aria-expanded={showAmount} onclick={toggleAmount}><span class="numeral">{habit.quantity}</span> {habit.unit}</button>
				{:else}<span><span class="numeral">{habit.quantity}</span> {habit.unit}</span>{/if}
			{:else}<span>{habit.kind === 'habit' ? habit.scheduleText : 'Task'}</span>{/if}
			<span aria-hidden="true">·</span>
			{#each stats as s, i (s)}<span class="stat" style:color={STATS[s].color}>{STATS[s].short}</span>{#if i < stats.length - 1}<span>+</span>{/if}{/each}
			{#if habit.target > 1}<span class="numeral">{habit.count}/{habit.target}</span>{/if}
			{#if habit.daysLeft && habit.daysLeft > 1 && !habit.done}<span>· {habit.daysLeft} days left</span>{/if}
		</div>
		{#if habit.streak > 1}<span class="small soft">{habit.streak} in a row</span>{/if}
	</div>

	<form method="POST" action={canUndo ? undoAction : action} use:enhance={enhanceTick} class="tick-form">
		<input type="hidden" name="id" value={habit.id} />
		<button bind:this={tickButton} class="tick" disabled={busy || (habit.kind === 'task' && habit.done && !canUndo)}
			aria-label={canUndo ? `Undo the last tick of ${habit.title}` : habit.done ? `${habit.title}, done. Log again` : `Tick off ${habit.title}`}>
			{#if habit.done}<PixelIcon name={canUndo ? 'undo' : 'check'} scale={1} />
			{:else}<span aria-hidden="true">+</span>{/if}
			{#if canUndo}<span class="undo-label small">Undo</span>{/if}
		</button>
		{#if showAmount && habit.quantity}
			<label class="sr-only" for="amt-{habit.id}">How many {habit.unit}</label>
			<input bind:this={amountInput} id="amt-{habit.id}" class="amount" type="number" name="amount" min="1" value={habit.quantity} inputmode="numeric" />
		{/if}
	</form>
	{#if habit.completedToday && !canUndo}
		<div class="extras">
			{#if habit.completedToday && !canUndo}
				<form method="POST" action={undoAction} use:enhance={withNotices()}>
					<input type="hidden" name="id" value={habit.id} />
					<button class="amount-toggle small soft" aria-label="Undo the last tick of {habit.title}"><PixelIcon name="undo" scale={1} /> Undo last tick</button>
				</form>
			{/if}
		</div>
	{/if}
</div>

<style>
	.habit {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		column-gap: 16px;
		padding: 20px 16px;
		min-height: 84px;
		border-bottom: 1px solid var(--trim);
	}

	.habit:last-child {
		border-bottom: 0;
	}

	.body {
		min-width: 0;
	}

	.name {
		gap: 8px;
		display: flex;
		align-items: center;
		min-height: 24px;
		font-size: 15px;
		line-height: 24px;
		font-weight: 600;
		text-decoration: none;
		margin: 0 0 2px;
		overflow-wrap: anywhere;
	}

	.meta {
		min-height: 24px;
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		align-items: center;
		line-height: 20px;
	}

	.stat {
		font-size: 12px;
	}

	.tick-form {
		position: relative;
		display: flex;
		gap: 8px;
		align-items: center;
		flex-wrap: wrap;
		max-width: 120px;
		justify-content: flex-end;
	}

	.tick {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		padding: 0;
		flex: none;
		font: 500 28px 'Pixelify Sans', system-ui, sans-serif;
		border: 1px solid var(--line);
		background: var(--bg-2);
		color: var(--ink);
		cursor: pointer;
	}

	.done .tick {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--accent-ink);
	}

	.tick:disabled {
		cursor: wait;
	}

	.undo-label {
		position: absolute;
		top: 46px;
		right: 0;
		width: 44px;
		text-align: center;
		color: var(--ink-soft);
		font-size: 12px;
	}

	.quantity {
		font: inherit;
		border: 0;
		border-bottom: 1px dotted var(--line);
		padding: 0;
		background: none;
		cursor: pointer;
		min-height: 24px;
	}

	.amount {
		width: 5em;
	}

	.extras {
		grid-column: 1 / -1;
		display: flex;
		gap: 8px;
		margin-top: 4px;
	}

	.amount-toggle {
		border: 0;
		background: none;
		padding: 4px 0;
		min-height: 24px;
		font-family: inherit;
		text-decoration: underline;
		cursor: pointer;
	}

</style>
