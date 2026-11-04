<script lang="ts">
	import DisplayIcon from './DisplayIcon.svelte';
	import PixelIcon from './PixelIcon.svelte';
	import { displayIcon } from '$lib/display-icon';
	import { HABIT_ICONS } from '$lib/content/habits';
	import { STAT_IDS, STATS } from '$lib/content/stats';
	import type { Difficulty, StatId } from '$lib/content/types';
	import { dayLabel, type Schedule } from '$lib/game/schedule';
	import { BASE_XP } from '$lib/game/rewards';

	interface Initial {
		kind: 'habit' | 'task';
		title: string;
		icon: string;
		notes: string | null;
		difficulty: Difficulty;
		weights: Partial<Record<StatId, number>>;
		schedule: Schedule | null;
		quantity: number | null;
		unit: string | null;
		dueDay: number | null;
	}

	let { initial, allowKind = true, submitLabel = 'Save' }: { initial: Initial; allowKind?: boolean; submitLabel?: string } = $props();

	// The form owns its state from here; `initial` only seeds it.
	// svelte-ignore state_referenced_locally
	const seed = initial;
	let kind = $state(seed.kind);
	let icon = $state(seed.icon);
	let difficulty = $state<Difficulty>(seed.difficulty);
	let stats = $state<StatId[]>(Object.keys(seed.weights) as StatId[]);
	let type = $state<Schedule['type']>(seed.schedule?.type ?? 'daily');
	let days = $state<number[]>(seed.schedule?.type === 'daily' ? (seed.schedule.days ?? []) : []);

	const WEEK = [
		[1, 'M'],
		[2, 'T'],
		[3, 'W'],
		[4, 'T'],
		[5, 'F'],
		[6, 'S'],
		[0, 'S']
	] as const;
	const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	const ICON_NAMES = ['Star', 'Running', 'Strength training', 'Walking', 'Yoga', 'Tennis', 'Cycling', 'Swimming', 'Reading', 'Computer', 'Puzzle', 'News', 'Art', 'Guitar', 'Speaking', 'Water', 'Sleep', 'Salad', 'Flower', 'Tidying', 'Plant', 'Writing', 'Phone', 'Medicine', 'Tooth care', 'Dog', 'Target', 'Brain'];
	const toggleStat = (s: StatId) => (stats = stats.includes(s) ? stats.filter((x) => x !== s) : [...stats, s]);
	const toggleDay = (d: number) => (days = days.includes(d) ? days.filter((x) => x !== d) : [...days, d]);
</script>

{#if allowKind}
	<fieldset class="field">
		<legend>This is a…</legend>
		<div class="row">
			<label class="pick"><input type="radio" name="kind" value="habit" bind:group={kind} /> Habit (repeats)</label>
			<label class="pick"><input type="radio" name="kind" value="task" bind:group={kind} /> One-off task</label>
		</div>
	</fieldset>
{:else}
	<input type="hidden" name="kind" value={kind} />
{/if}

<div class="field">
	<label for="title">Name</label>
	<input id="title" name="title" required maxlength="60" value={seed.title} placeholder="e.g. Morning stretch" />
</div>

<div class="field">
	<label for="custom-icon">Icon</label>
	<div class="row wrap">
		<input type="hidden" name="icon" value={icon} />
		<DisplayIcon value={icon} scale={2} />
		<input id="custom-icon" value={displayIcon(icon) ? '' : icon} oninput={(event) => (icon = event.currentTarget.value)} maxlength="4" placeholder="Custom symbol" aria-label="Custom icon or emoji" class="icon-input" />
		<div class="icons" role="group" aria-label="Quick icons">
			{#each HABIT_ICONS as e, i (e)}
				<button type="button" class="ic" aria-label={ICON_NAMES[i]} aria-pressed={icon === e} onclick={() => (icon = e)}><DisplayIcon value={e} scale={2} />{#if icon === e}<span class="chosen" aria-hidden="true"><PixelIcon name="check" scale={1} /></span>{/if}</button>
			{/each}
		</div>
	</div>
</div>

<fieldset class="field">
	<legend>How hard is it?</legend>
	<div class="row seg">
		{#each ['easy', 'medium', 'hard'] as const as d (d)}
			<label class="pick">
				<input type="radio" name="difficulty" value={d} bind:group={difficulty} />
				{d[0].toUpperCase() + d.slice(1)} <span class="soft small">{BASE_XP[d]} XP</span>
			</label>
		{/each}
	</div>
</fieldset>

<fieldset class="field">
	<legend>What does it train?</legend>
	<div class="statgrid">
		{#each STAT_IDS as s (s)}
			<label class="pick stat" style:--c={STATS[s].color}>
				<input type="checkbox" name="stats" value={s} checked={stats.includes(s)} onchange={() => toggleStat(s)} />
				<span><strong>{STATS[s].name}</strong><br /><span class="small soft">{STATS[s].blurb}</span></span>
			</label>
		{/each}
	</div>
</fieldset>

{#if kind === 'habit'}
	<fieldset class="field">
		<legend class="lbl">How often?</legend>
		<div class="row wrap">
			<select name="scheduleType" bind:value={type} aria-label="Frequency">
				<option value="daily">Daily</option>
				<option value="weekly">Per week</option>
				<option value="interval">Every few days</option>
			</select>
			<label class="inline">
				<input
					type="number"
					name="target"
					min="1"
					max="20"
					value={seed.schedule?.target ?? 1}
					aria-label="Times per period"
				/>
				<span>{type === 'daily' ? 'time(s) a day' : type === 'weekly' ? 'time(s) a week' : 'time(s) every'}</span>
			</label>
			{#if type === 'interval'}
				<label class="inline">
					<input type="number" name="every" min="2" max="30" value={seed.schedule?.type === 'interval' ? seed.schedule.every : 2} aria-label="Days per period" />
					<span>days</span>
				</label>
			{/if}
		</div>
		{#if type === 'daily'}
			<div class="week" role="group" aria-label="Only on these days" aria-describedby="days-hint">
				{#each WEEK as [d, l] (d)}
					<label class="day" title={DAY_NAMES[d]}>
						<input type="checkbox" name="days" value={d} checked={days.includes(d)} onchange={() => toggleDay(d)} />
						<span aria-hidden="true">{l}{#if days.includes(d)}<PixelIcon name="check" scale={1} />{/if}</span><span class="sr-only">{DAY_NAMES[d]}</span>
					</label>
				{/each}
			</div>
			<p id="days-hint" class="small soft">Leave the days empty for every day.</p>
		{/if}
	</fieldset>
{:else}
	<div class="field">
		<label for="due">Due date (optional)</label>
		<input id="due" type="date" name="due" value={seed.dueDay !== null ? dayLabel(seed.dueDay) : ''} />
	</div>
{/if}

<fieldset class="field">
	<legend>Amount (optional)</legend>
	<div class="row">
		<input type="number" name="quantity" min="1" value={seed.quantity ?? ''} placeholder="20" aria-label="Amount" aria-describedby="amount-hint" />
		<input name="unit" maxlength="20" value={seed.unit ?? ''} placeholder="minutes" aria-label="Unit" aria-describedby="amount-hint" />
	</div>
	<p id="amount-hint" class="small soft">Logging more than this earns more, up to double.</p>
</fieldset>

<div class="field">
	<label for="notes">Notes (optional)</label>
	<textarea id="notes" name="notes" rows="2" maxlength="280">{seed.notes ?? ''}</textarea>
</div>

<button class="btn wide">{submitLabel}</button>

<style>
	.seg {
		flex-wrap: wrap;
	}

	.statgrid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 8px;
	}

	.stat {
		align-items: flex-start;
		border-left: 6px solid var(--c);
	}

	.stat input {
		margin-top: 4px;
	}

	.icon-input {
		width: 160px;
		font-size: 16px;
		flex: none;
	}

	.icons {
		display: grid;
		grid-template-columns: repeat(auto-fit, 44px);
		gap: 8px;
		width: 100%;
		padding: 8px;
	}

	.ic {
		position: relative;
		display: grid;
		place-items: center;
		padding: 0;
		color: var(--ink);
		flex: none;
		width: 44px;
		height: 44px;
		font-size: 24px;
		background: var(--bg-3);
		border: 1px solid var(--line);
		border-radius: 0;
		cursor: pointer;
	}

	.ic[aria-pressed='true'] {
		border-color: var(--accent);
	}

	.inline {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: 400;
		margin: 0;
	}

	.inline input {
		width: 4.5em;
	}

	select {
		width: auto;
	}

	.week {
		display: grid;
		grid-template-columns: repeat(7, minmax(24px, 1fr));
		gap: 4px;
		margin-top: 12px;
	}

	.day {
		position: relative;
		margin: 0;
	}

	.day input {
		position: absolute;
		opacity: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		cursor: pointer;
	}

	.day span[aria-hidden] {
		display: grid;
		place-items: center;
		width: 100%;
		height: 44px;
		border: 1px solid var(--line);
		border-radius: 0;
		background: var(--bg-3);
	}

	.day input:checked + span {
		background: var(--accent);
		color: var(--accent-ink);
	}

	.day input:focus-visible + span {
		outline: 3px solid var(--focus);
		outline-offset: 3px;
	}

	.chosen {
		position: absolute;
		right: 0;
		bottom: 0;
		background: var(--bg-2);
		color: var(--ink);
		font-size: 13px;
		line-height: 16px;
	}
</style>
