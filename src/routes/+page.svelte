<script lang="ts">
	import DisplayIcon from '$lib/components/DisplayIcon.svelte';
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import { withNotices } from '$lib/act';
	import { messFigures } from '$lib/sprites/room';
	import PixelIcon from '$lib/components/PixelIcon.svelte';
	import Figure from '$lib/components/Figure.svelte';
	import HabitRow from '$lib/components/HabitRow.svelte';
	import Habitat from '$lib/components/Habitat.svelte';
	import { MOOD_TEXT } from '$lib/game/pet-needs';

	let { data } = $props();

	// Where the mess lands in the room, in percent, clear of the hero (left) and the
	// pet's bed (right); enough spots for the maximum.
	const focusWelcome = () => {
		void tick().then(() => (document.querySelector<HTMLElement>('.mess, .welcome button') ?? document.querySelector<HTMLElement>('h1'))?.focus());
	};
	const SPOTS = [
		[12, 29],
		[50, 29],
		[86, 29],
		[52, 65],
		[52, 88]
	];

	const due = $derived(data.habits.filter((h) => h.kind === 'habit' && h.due && !h.done));
	const done = $derived(data.habits.filter((h) => h.kind === 'habit' && h.due && h.done));
	const resting = $derived(data.habits.filter((h) => h.kind === 'habit' && !h.due));
	const tasks = $derived(data.habits.filter((h) => h.kind === 'task'));
	const ready = $derived(data.runs.filter((r) => r.ready || r.endsAt <= data.now));
	const petName = $derived(data.companion?.name ?? 'Your partner');
</script>

<svelte:head><title>Home · LevelUp</title></svelte:head>

<div class="page-heading"><h1 tabindex="-1">Home</h1><span class="small soft home-date">{new Intl.DateTimeFormat('en', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(data.today * 86_400_000)}</span></div>

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

{#if ready.length || data.eggsReady}
	<section class="box alerts">
		{#each ready as r (r.id)}
			<a class="btn wide" href="/missions"><DisplayIcon value={r.icon} scale={2} /> Back from {r.name}! Claim rewards</a>
		{/each}
		{#if data.eggsReady}<a class="btn wide" href="/pet"><PixelIcon name="egg" scale={1} /> An egg is ready to hatch!</a>{/if}
	</section>
{/if}

<section class="today">
	<div class="spread today-heading">
		<h2>Today</h2>
		<span class="soft">{done.length} of {due.length + done.length} done</span>
	</div>
	{#if !data.habits.length}
		<p class="soft">No habits yet. <a href="/habits/new">Pick a few</a> to get started.</p>
	{/if}
	{#each data.habits.filter((h) => h.kind === 'habit' && h.due) as h (h.id)}<HabitRow habit={h} />{/each}
	{#if due.length === 0 && done.length > 0}
		<p class="good small">Everything due is done. A good day’s work.</p>
	{/if}
	{#if resting.length}
		<details>
			<summary class="small soft">Not due today ({resting.length})</summary>
			{#each resting as h (h.id)}<HabitRow habit={h} />{/each}
		</details>
	{/if}
	<a class="add-habit soft small" href="/habits/new">+ Add a habit</a>
</section>
<p class="small soft gentle-note">Small steps count. You’re doing enough.</p>

{#if tasks.length}
	<section class="box">
		<h2>To-do</h2>
		{#each tasks as h (h.id)}<HabitRow habit={h} />{/each}
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
