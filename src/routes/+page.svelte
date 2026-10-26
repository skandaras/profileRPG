<script lang="ts">
	import { enhance } from '$app/forms';
	import { withNotices } from '$lib/act';
	import { MESS_SPRITES } from '$lib/sprites/art/icons';
	import { REFERENCE_PALETTE } from '$lib/content/palettes';
	import { MESS } from '$lib/sprites/frames';
	import Figure from '$lib/components/Figure.svelte';
	import HabitRow from '$lib/components/HabitRow.svelte';
	import Habitat from '$lib/components/Habitat.svelte';
	import { MOOD_TEXT } from '$lib/game/pet-needs';

	let { data } = $props();

	// Where the mess lands in the room, in percent, clear of the hero (left) and the
	// pet's bed (right); enough spots for the maximum.
	const SPOTS = [
		[8, 76],
		[56, 92],
		[9, 93],
		[54, 70],
		[38, 95]
	];

	const messFigures = MESS_SPRITES.map((sprite, i) => ({
		figure: {
			w: MESS.w,
			h: MESS.h,
			pivot: 0,
			layers: [
				{
					z: 0,
					art: { sprite },
					palette: {
						...REFERENCE_PALETTE,
						primary: ['#274a98', '#3f72d0', '#86a8f0'] as const,
						hair: ['#a86a1a', '#d89a3a', '#f5c87a'] as const,
						skin: ['#b07a4a', '#d8a070', '#f5cca0'] as const
					}
				}
			]
		},
		key: `mess:${i}`
	}));

	const due = $derived(data.habits.filter((h) => h.kind === 'habit' && h.due && !h.done));
	const done = $derived(data.habits.filter((h) => h.kind === 'habit' && h.due && h.done));
	const resting = $derived(data.habits.filter((h) => h.kind === 'habit' && !h.due));
	const tasks = $derived(data.habits.filter((h) => h.kind === 'task'));
	const ready = $derived(data.runs.filter((r) => r.ready || r.endsAt <= data.now));
	const petName = $derived(data.companion?.name ?? 'Your partner');
</script>

<svelte:head><title>Home · LevelUp</title></svelte:head>

<section>
	<Habitat avatar={data.avatar} heroName={data.heroName} pet={data.companion}>
		{#if data.welcome.active && data.welcome.mess > 0}
			<form method="POST" action="?/clean" use:enhance={withNotices()}>
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
				<form method="POST" action="?/greet" use:enhance={withNotices()}>
					<button class="btn wide">Give {petName} a pat 💕</button>
				</form>
			{/if}
			{#if data.welcome.returnStreak > 1}
				<p class="small soft">🔁 {data.welcome.returnStreak} days in a row</p>
			{/if}
		</div>
	{:else if data.companion && !data.companion.away}
		<p class="small soft mood">{data.companion.name} {MOOD_TEXT[data.companion.mood as keyof typeof MOOD_TEXT]}.</p>
	{/if}
</section>

{#if data.awayNote}
	<section class="box">
		<h3>While you were away</h3>
		<ul class="away">
			{#each data.awayNote.missed as m, i (i)}
				<li>
					{m.title}: missed {m.count === 1 ? 'once' : `${m.count} times`}{#if m.streakLost > 1}, ending a streak of {m.streakLost}{/if}
				</li>
			{/each}
		</ul>
		{#if data.awayNote.fined > 0}<p class="small">That cost {data.awayNote.fined} GP. No harm done, you've got this.</p>{/if}
		{#if data.awayNote.shielded > 0}<p class="small good">🛡️ Your Streak Shield saved {data.awayNote.shielded}.</p>{/if}
		<form method="POST" action="?/dismiss" use:enhance={withNotices()}>
			<button class="btn ghost small">Got it</button>
		</form>
	</section>
{/if}

{#if ready.length || data.eggsReady}
	<section class="box alerts">
		{#each ready as r (r.id)}
			<a class="btn wide" href="/missions">{r.icon} Back from {r.name}! Claim rewards</a>
		{/each}
		{#if data.eggsReady}<a class="btn wide" href="/pet">🥚 An egg is ready to hatch!</a>{/if}
	</section>
{/if}

<section class="box">
	<div class="spread">
		<h2>Today</h2>
		<a class="btn ghost small" href="/habits/new">+ Add</a>
	</div>
	{#if !data.habits.length}
		<p class="soft">No habits yet. <a href="/habits/new">Pick a few</a> to get started.</p>
	{/if}
	{#each due as h (h.id)}<HabitRow habit={h} />{/each}
	{#if due.length === 0 && done.length > 0}
		<p class="good small">Everything due is done. Wonderful work! 🌟</p>
	{/if}
	{#each done as h (h.id)}<HabitRow habit={h} />{/each}
	{#if resting.length}
		<details>
			<summary class="small soft">Not due today ({resting.length})</summary>
			{#each resting as h (h.id)}<HabitRow habit={h} />{/each}
		</details>
	{/if}
</section>

{#if tasks.length}
	<section class="box">
		<h2>To-do</h2>
		{#each tasks as h (h.id)}<HabitRow habit={h} />{/each}
	</section>
{/if}

{#if data.runs.length > ready.length}
	<section class="box small">
		{#each data.runs.filter((r) => !ready.includes(r)) as r (r.id)}
			<p>{r.icon} Out on <a href="/missions">{r.name}</a></p>
		{/each}
	</section>
{/if}

<style>
	.mess {
		position: absolute;
		transform: translate(-50%, -50%);
		background: none;
		border: 0;
		padding: 6px;
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
		text-align: center;
		margin-top: -4px;
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
</style>
