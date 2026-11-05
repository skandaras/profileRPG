<script lang="ts">
	import DisplayIcon from '$lib/components/DisplayIcon.svelte';
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { withNotices } from '$lib/act';
	import { planToday } from '$lib/planning';
	import { dayLabel } from '$lib/game/schedule';
	import { messFigures } from '$lib/sprites/room';
	import PixelIcon from '$lib/components/PixelIcon.svelte';
	import Figure from '$lib/components/Figure.svelte';
	import HabitRow from '$lib/components/HabitRow.svelte';
	import Habitat from '$lib/components/Habitat.svelte';
	import { MOOD_TEXT } from '$lib/game/pet-needs';

	let { data, form } = $props();
	let taskTitle = $state<string | undefined>();
	let taskDate = $state<string | undefined>();
	let taskInput: HTMLInputElement | undefined = $state();
	let adding = $state(false);
	const capture = $derived(form && 'capture' in form ? form.capture : null);
	const addedTask = $derived(form && 'addedTask' in form ? form.addedTask : '');
	const plan = $derived(planToday(data.habits, data.today));
	const doneHabits = $derived(plan.dueHabits.filter((item) => item.done).length);
	const ready = $derived(data.runs.filter((r) => r.ready || r.endsAt <= data.now));
	const petName = $derived(data.companion?.name ?? 'Your partner');

	const enhanceCapture: SubmitFunction = (input) => {
		if (adding) { input.cancel(); return; }
		const submittedTitle = input.formData.get('title');
		adding = true;
		return withNotices({
			then: async (ok) => {
				adding = false;
				if (ok) {
					// Someone may already be drafting their next task while this saves.
					if (taskInput?.value === submittedTitle) taskTitle = '';
					await tick();
					taskInput?.focus();
				}
			}
		})(input);
	};

	const focusWelcome = () => {
		void tick().then(() => (document.querySelector<HTMLElement>('.mess, .welcome button') ?? document.querySelector<HTMLElement>('h1'))?.focus());
	};
	const SPOTS = [[12, 29], [50, 29], [86, 29], [52, 65], [52, 88]];
</script>

<svelte:head><title>Today · LevelUp</title></svelte:head>

<div class="page-heading"><h1 tabindex="-1">Today</h1><span class="small soft home-date">{new Intl.DateTimeFormat('en', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(data.today * 86_400_000)}</span></div>
<div class="day-progress">
	<p class="small soft">{#if plan.total}{plan.completed} of {plan.total} planned items done{:else}Start with one thing you want to get done.{/if}</p>
	{#if plan.total}<progress value={plan.completed} max={plan.total} aria-label="Today's planned work"></progress>{/if}
</div>

<section class="box capture" aria-labelledby="capture-heading">
	<h2 id="capture-heading">Quick add</h2>
	<form method="POST" action="?/quickTask" use:enhance={enhanceCapture} aria-label="Quick task" aria-busy={adding}>
		<label class="capture-name" for="quick-title">Task name
			<input bind:this={taskInput} id="quick-title" name="title" required maxlength="60" placeholder="What needs doing?" value={taskTitle ?? capture?.title ?? ''} oninput={(event) => (taskTitle = event.currentTarget.value)} />
		</label>
		<label class="capture-date" for="quick-due">Due date (optional)
			<input id="quick-due" name="due" type="date" value={taskDate ?? capture?.due ?? dayLabel(data.today)} oninput={(event) => (taskDate = event.currentTarget.value)} />
		</label>
		<button class="btn" disabled={adding}>{adding ? 'Adding…' : 'Add task'}</button>
	</form>
	<p class="capture-status small soft" role="status">{#if addedTask}Added “{addedTask}”.{/if}</p>
	{#if form && 'error' in form && form.error}<p class="bad small" role="alert">{form.error}</p>{/if}
</section>

<section class="today" aria-labelledby="tasks-heading">
	<div class="spread today-heading"><h2 id="tasks-heading">Tasks</h2><a class="small" href="/habits">Manage tasks & habits</a></div>
	{#each plan.todayTasks as item (item.id)}
		<HabitRow habit={item} today={data.today} />
	{:else}
		<p class="soft small">No tasks for today. Add one above, or focus on your habits.</p>
	{/each}
	{#if plan.upcomingTasks.length}
		<details class="upcoming">
			<summary class="small soft">Upcoming tasks ({plan.upcomingTasks.length})</summary>
			{#each plan.upcomingTasks as item (item.id)}<HabitRow habit={item} today={data.today} />{/each}
		</details>
	{/if}
</section>

<section class="today" aria-labelledby="habits-heading">
	<div class="spread today-heading"><h2 id="habits-heading">Habits</h2><span class="soft small">{doneHabits} of {plan.dueHabits.length} done</span></div>
	{#each plan.dueHabits as item (item.id)}<HabitRow habit={item} />{:else}
		<p class="soft small">No habits due today.</p>
	{/each}
	{#if plan.dueHabits.length > 0 && doneHabits === plan.dueHabits.length}<p class="good small">Your habits for today are done.</p>{/if}
	{#if plan.offDayHabits.length}
		<details>
			<summary class="small soft">Not due today ({plan.offDayHabits.length})</summary>
			{#each plan.offDayHabits as item (item.id)}<HabitRow habit={item} />{/each}
		</details>
	{/if}
	<a class="add-habit soft small" href="/habits/new">+ Add a habit</a>
</section>
<p class="small soft gentle-note">Small steps count. You’re doing enough.</p>

{#if data.awayNote}
	<section class="box">
		<h2>While you were away</h2>
		<ul class="away">
			{#each data.awayNote.missed as m, i (i)}
				<li>
					{m.title}: missed {m.count === 1 ? 'once' : `${m.count} times`}{#if m.streakLost > 1}, ending a streak of {m.streakLost}{/if}
				</li>
			{/each}
		</ul>
		{#if data.awayNote.fined > 0}<p class="small">That cost {data.awayNote.fined} GP. No harm done, you've got this.</p>{/if}
		{#if data.awayNote.shielded > 0}<p class="small good"><PixelIcon name="shield" scale={1} /> Your Streak Shield saved {data.awayNote.shielded}.</p>{/if}
		<form method="POST" action="?/dismiss" use:enhance={withNotices()}>
			<button class="btn ghost small">Got it</button>
		</form>
	</section>
{/if}

<div class="page-heading companion-heading"><h2>Your companion</h2><a class="small" href="/pet">Pet care</a></div>
<section>
	<Habitat avatar={data.avatar} heroName={data.heroName} pet={data.companion}>
		{#if data.welcome.active && data.welcome.mess > 0}
			<form method="POST" action="?/clean" use:enhance={withNotices({ then: focusWelcome })}>
				{#each Array(data.welcome.mess) as _, i (i)}
					<button class="mess" style:left="{SPOTS[i][0]}%" style:top="{SPOTS[i][1]}%" aria-label="Tidy up mess {i + 1}">
						<Figure figure={messFigures[i % messFigures.length].figure} key={messFigures[i % messFigures.length].key} scale={3} animate={false} />
					</button>
				{/each}
			</form>
		{/if}
	</Habitat>

	{#if data.welcome.active}
		<div class="box welcome">
			<span class="eyebrow">Welcome back{#if data.welcome.returnStreak > 1}<span class="return-streak"> · {data.welcome.returnStreak} days in a row</span>{/if}</span>
			{#if data.welcome.mess > 0}
				<p>
					{#if data.welcome.missedYou}
						<strong>You're back!</strong> {petName} kept your spot warm, but things got a bit messy while you were away.
					{:else}
						<strong>Good to see you!</strong> {petName} made a little mess overnight.
					{/if}
					Tap the mess to tidy it up.
				</p>
			{:else}
				<p>All tidy! {petName} is looking at you expectantly…</p>
				<form method="POST" action="?/greet" use:enhance={withNotices({ then: focusWelcome })}>
					<button class="btn wide"><PixelIcon name="joy" scale={1} /> Give {petName} a pat</button>
				</form>
			{/if}
		</div>
	{:else if data.companion && !data.companion.away}
		<p class="box mood"><PixelIcon name="joy" scale={1} /> {data.companion.name} {MOOD_TEXT[data.companion.mood as keyof typeof MOOD_TEXT]}.</p>
	{/if}
</section>

{#if ready.length || data.eggsReady}
	<section class="box alerts">
		{#each ready as r (r.id)}
			<a class="btn wide" href="/missions"><DisplayIcon value={r.icon} scale={2} /> Back from {r.name}! Claim rewards</a>
		{/each}
		{#if data.eggsReady}<a class="btn wide" href="/pet"><PixelIcon name="egg" scale={1} /> An egg is ready to hatch!</a>{/if}
	</section>
{/if}

{#if data.runs.length > ready.length}
	<section class="box small">
		{#each data.runs.filter((r) => !ready.includes(r)) as r (r.id)}
			<p><DisplayIcon value={r.icon} scale={2} /> Out on <a href="/missions">{r.name}</a></p>
		{/each}
	</section>
{/if}

<style>
	.day-progress { margin: -4px 0 18px; }
	.day-progress p { margin: 0 0 8px; }
	progress { display: block; width: 100%; height: 5px; border: 0; background: var(--bg-3); accent-color: var(--accent); }
	progress::-webkit-progress-bar { background: var(--bg-3); }
	progress::-webkit-progress-value { background: var(--accent); }
	progress::-moz-progress-bar { background: var(--accent); }
	.capture { padding: 14px; }
	.capture h2 { font-size: 25px; margin: 0 0 10px; }
	.capture form { display: grid; grid-template-columns: minmax(0, 1fr) 164px auto; align-items: end; gap: 10px; }
	.capture label { display: grid; gap: 6px; margin: 0; min-width: 0; font-size: 11px; }
	.capture input { width: 100%; min-width: 0; }
	.capture .btn { min-height: 44px; white-space: nowrap; }
	.capture-status { min-height: 18px; margin: 8px 0 0; overflow-wrap: anywhere; }
	.companion-heading { margin-top: 28px; }
	.companion-heading h2 { margin: 0; }
	.today-heading a, .companion-heading a { display: inline-flex; align-items: center; min-height: 44px; }
	.upcoming { margin-top: 8px; }
	@media (max-width: 599px) {
		.capture form { grid-template-columns: minmax(0, 1fr) auto; }
		.capture-name { grid-column: 1 / -1; }
		.capture-date { grid-column: 1; }
	}

	.page-heading {
		margin-bottom: 14px;
	}

	.home-date {
		font-size: 10px;
	}

	.mess {
		position: absolute;
		transform: translate(-50%, -50%);
		background: none;
		border: 0;
		padding: 8px;
		cursor: pointer;
		animation: jiggle 1.4s steps(2) infinite;
	}

	@keyframes jiggle {
		50% {
			transform: translate(-50%, -54%);
		}
	}

	.welcome p:last-child {
		margin-bottom: 0;
	}

	.mood {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 8px;
		min-height: 54px;
		margin-bottom: 14px;
		font-size: 12px;
		text-align: center;
	}

	.gentle-note {
		text-align: center;
		margin: 0;
		font-size: 11px;
	}

	.today {
		margin-top: 12px;
	}

	.today-heading {
		margin-bottom: 8px;
	}

	.today-heading h2 {
		margin: 0;
	}

	.add-habit {
		display: inline-flex;
		align-items: center;
		min-height: 33px;
		margin-top: 0;
	}

	.away {
		margin: 0 0 8px;
		padding-left: 1.2em;
	}

	.alerts {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	summary {
		cursor: pointer;
		padding: 8px 0;
	}

	.welcome {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 3px 12px;
		padding: 10px 14px;
		margin-bottom: 14px;
	}

	.return-streak {
		text-transform: none;
		letter-spacing: 0;
		font-weight: 400;
	}

	.welcome .eyebrow {
		grid-column: 1 / -1;
		margin: 0;
		color: var(--ink);
		letter-spacing: 1px;
	}

	.welcome p {
		grid-column: 1;
		font-size: 11px;
		margin: 0;
	}

	.welcome form {
		grid-column: 2;
		grid-row: 2;
		align-self: center;
		max-width: 150px;
	}

	.welcome .btn {
		border-radius: 16px 16px 3px 3px;
		font-size: 12px;
		gap: 6px;
		padding: 9px 10px;
	}
</style>
