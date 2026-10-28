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
	<span class="habit-icon"><DisplayIcon value={habit.icon} scale={1.5} /></span>
	<div class="body">
		{#if link}
			<a class="name" href="/habits/{habit.id}">{habit.title}</a>
		{:else}
			<span class="name">{habit.title}</span>
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
		{#if habit.done}<span class="done-label small"><PixelIcon name="check" scale={1} /> Done{habit.completedToday ? ' today' : ' this period'}</span>{/if}
		{#if habit.streak > 1}<span class="small soft">{habit.streak} in a row</span>{/if}
	</div>

	<form method="POST" action={canUndo ? undoAction : action} use:enhance={enhanceTick} class="tick-form">
		<input type="hidden" name="id" value={habit.id} />
		<button bind:this={tickButton} class="tick" disabled={busy || (habit.kind === 'task' && habit.done && !canUndo)}
			aria-label={canUndo ? `Undo the last tick of ${habit.title}` : habit.done ? `${habit.title}, done. Log again` : `Tick off ${habit.title}`}>
			{#if canUndo}<span class="undo-label small">Undo</span>
			{:else}<PixelIcon name="check" scale={1.5} />{/if}
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
		grid-template-columns: 33px minmax(0, 1fr) auto;
		align-items: center;
		gap: 12px;
		padding: 10px 13px;
		min-height: 75px;
		background: var(--paper);
		border: 1px solid var(--line);
		outline: 1px solid var(--line);
		outline-offset: -5px;
		margin-bottom: 8px;
	}

	.habit-icon {
		align-self: stretch;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--line);
		border-radius: 22px 22px 2px 2px;
		min-height: 52px;
	}

	.body {
		min-width: 0;
	}

	.name {
		display: block;
		min-height: 24px;
		font: 600 23px/1.05 'Cormorant Garamond', Georgia, serif;
		text-decoration: none;
		margin: 0 0 4px;
		overflow-wrap: anywhere;
	}

	.meta {
		min-height: 20px;
		display: flex;
		flex-wrap: wrap;
		gap: 3px;
		align-items: center;
		font-size: 11px;
		line-height: 18px;
	}

	.stat {
		font-size: 10px;
	}

	.meta .numeral {
		font-family: 'DM Sans', system-ui, sans-serif;
		font-weight: 400;
	}

	.done-label {
		display: flex;
		align-items: center;
		gap: 4px;
		color: var(--ink);
		font-size: 11px;
	}

	.tick-form {
		position: relative;
		display: flex;
		gap: 8px;
		align-items: center;
		flex-wrap: wrap;
		max-width: 74px;
		justify-content: flex-end;
	}

	.tick {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		padding: 0;
		flex: none;
		border: 1px solid var(--accent);
		border-radius: 0;
		background: var(--accent);
		color: var(--accent-ink);
		cursor: pointer;
	}

	.tick:disabled {
		cursor: wait;
	}

	.undo-label {
		font: 400 12px 'DM Sans', system-ui, sans-serif;
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
		grid-column: 2 / -1;
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

	@media (max-width: 359px) {
		.habit {
			gap: 8px;
			padding: 10px;
		}
		.name {
			font-size: 21px;
		}
	}
</style>
