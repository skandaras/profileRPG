<script lang="ts">
	import PixelIcon from '$lib/components/PixelIcon.svelte';
	import DisplayIcon from '$lib/components/DisplayIcon.svelte';
	import { enhance } from '$app/forms';
	import { withNotices } from '$lib/act';
	import { countdown, duration, ticker } from '$lib/clock.svelte';
	import { STATS } from '$lib/content/stats';
	import type { StatId } from '$lib/content/types';

	let { data, form } = $props();
	const clock = ticker(() => data.now);
	let bringPet = $state(true);

	const free = $derived(data.board.slots - data.board.runs.length);
	const TIER = { great: 'Triumph', success: 'Success', partial: 'Bumpy trip' } as const;
</script>

<svelte:head><title>Quests · LevelUp</title></svelte:head>

<h1>Quests</h1>
<p class="soft small">
	Set a small goal for your real work. Optional expeditions bring home supplies and new companions while you get on with your day.
</p>

{#if form && 'error' in form && form.error}<p class="bad" role="alert">{form.error}</p>{/if}

<section class="box" aria-labelledby="work-goals-heading">
	<div class="spread"><h2 id="work-goals-heading">Your week</h2><span class="small soft">{data.weekly.week.label}</span></div>
	<p class="small soft">Choose targets that fit this week. Work you’ve already logged counts, and corrections update your progress.</p>
	<div class="work-goals">
		{#each data.weekly.goals as goal (goal.kind)}
			{@const unit = goal.count === 1 ? goal.singular : goal.unit}
			<article class="work-goal" class:complete={goal.complete}>
				<div class="goal-title"><PixelIcon name={goal.icon} scale={1.5} /><h3 id="goal-{goal.kind}" tabindex="-1">{goal.name}</h3></div>
				{#if goal.target !== null}
					<p class="goal-count"><strong>{goal.count}</strong> / {goal.target} <span class="small">{unit}</span></p>
					<div class="bar" role="progressbar" aria-label={goal.name} aria-valuemin={0} aria-valuemax={goal.target} aria-valuenow={Math.min(goal.count, goal.target)} aria-valuetext={`${goal.count} of ${goal.target} ${goal.unit}`}><span style:width="{Math.min(100, goal.count / goal.target * 100)}%"></span></div>
					<p class="small goal-status">{#if goal.complete}<PixelIcon name="check" scale={1} /> Target reached{:else}{goal.target - goal.count} more to your target{/if}</p>
				{:else}
					<p class="small soft">{goal.count} {unit} so far. Set a target if it helps you focus.</p>
				{/if}
				<form method="POST" action="?/setGoal" use:enhance={withNotices()} class="target-form">
					<input type="hidden" name="kind" value={goal.kind} />
					<label for="target-{goal.kind}">Weekly target</label>
					<div class="target-controls"><input id="target-{goal.kind}" name="target" type="number" min="1" max={goal.max} step="1" value={goal.target ?? goal.defaultTarget} required aria-label="Weekly target: {goal.name}" /><button class="btn small" aria-label="{goal.target === null ? 'Set' : 'Update'} target: {goal.name}">{goal.target === null ? 'Set target' : 'Update'}</button></div>
				</form>
				{#if goal.target !== null}
					<form method="POST" action="?/removeGoal" use:enhance={withNotices({ then: (ok) => { if (ok) document.getElementById(`goal-${goal.kind}`)?.focus(); } })}>
						<input type="hidden" name="kind" value={goal.kind} /><button class="remove-goal small soft" aria-label="Remove target: {goal.name}">Remove target</button>
					</form>
				{/if}
			</article>
		{/each}
	</div>
	<p class="small soft goal-note">Targets run Monday to Sunday in your calendar. Choose fresh targets next week; there’s no penalty for leaving one unfinished. Your usual task and habit rewards arrive when you log the work.</p>
	<div class="row wrap goal-links"><a class="btn small ghost" href="/">Go to Today</a><a class="btn small ghost" href="/history">Review completed work</a></div>
</section>

{#if data.board.runs.length}
	<section class="box" id="on-road">
		<h2>On the road</h2>
		{#each data.board.runs as r (r.id)}
			{@const left = r.endsAt - clock.now}
			{@const progress = Math.min(100, Math.max(0, ((clock.now - r.startedAt) / (r.endsAt - r.startedAt)) * 100))}
			<div class="run">
				<DisplayIcon value={r.icon} scale={2} />
				<div class="grow">
					<strong>{r.name}</strong>
					<div class="bar" role="progressbar" aria-label={`${r.name} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuetext={left <= 0 ? 'Ready to claim' : `${countdown(left)} remaining`} aria-valuenow={Math.round(progress)}>
						<span style:width="{progress}%"></span>
					</div>
				</div>
				{#if left <= 0}
					<form method="POST" action="?/claim" use:enhance={withNotices()}>
						<input type="hidden" name="run" value={r.id} />
						<button class="btn small" aria-label="Claim {r.name} rewards">Claim rewards</button>
					</form>
				{:else}
					<span class="chip"><PixelIcon name="hourglass" scale={1} /> {countdown(left)}</span>
				{/if}
			</div>
		{/each}
	</section>
{/if}

<section class="box">
	<div class="spread">
		<h2 id="expeditions">Expeditions</h2>
		<span class="chip">{free} of {data.board.slots} free</span>
	</div>
	<p class="small soft">Choose a trip, then return when it’s ready. Higher stats improve the odds; every trip brings something home. Taking your companion gives them growth XP, and eggs from trips warm as you complete tasks and habits.</p>
	{#if data.board.companion}
		<label class="pick">
			<input type="checkbox" bind:checked={bringPet} />
			Bring {data.board.companion.name} along (better odds, and they grow from it)
		</label>
	{/if}
	{#each data.board.missions as m (m.id)}
		<form method="POST" action="?/start" use:enhance={withNotices()} class="mission">
			<input type="hidden" name="mission" value={m.id} />
			{#if bringPet && data.board.companion}<input type="hidden" name="pet" value="on" />{/if}
			<div class="head">
				<DisplayIcon value={m.icon} scale={2} />
				<div class="grow">
					<strong>{m.name}</strong>
					<div class="small soft">{m.region} · {duration(m.durationMs)}</div>
				</div>
				{#if m.locked}
					<span class="chip"><PixelIcon name="lock" scale={1} /> Lv {m.minLevel}</span>
				{:else}
					<span class="chip" aria-label={`Success chance ${bringPet && data.board.companion ? m.chance : m.chanceAlone}%`}>{bringPet && data.board.companion ? m.chance : m.chanceAlone}%</span>
				{/if}
			</div>
			<p class="small">{m.blurb}</p>
			<div class="row wrap small">
				{#each Object.entries(m.recommended) as [s, v] (s)}
					{@const have = data.stats[s as StatId]}
					<span class="chip" class:good={have >= v} style:border-color={STATS[s as StatId].color}>{STATS[s as StatId].short} {have}/{v} {#if have >= v}<PixelIcon name="check" scale={1} /><span class="sr-only">recommended stat met</span>{:else}(below){/if}</span>
				{/each}
				<span class="chip"><PixelIcon name="xp" scale={1} /> {m.xp} XP</span>
				<span class="chip"><PixelIcon name="gp" scale={1} /> {m.gp} GP</span>
				{#each m.eggs as egg (egg.id)}<span class="chip"><PixelIcon name="egg" scale={1} /> {egg.name} egg</span>{/each}
			</div>
			{#if free <= 0 && !m.running && !m.locked}<p class="small soft">Claim a finished trip to free a slot.</p>{/if}
			{#if !m.locked}
				<button class="btn small go" disabled={free <= 0 || m.running}>{m.running ? 'Underway' : 'Set off'}</button>
			{/if}
		</form>
	{/each}
</section>

{#if data.recent.length}
	<section class="box">
		<h2>Recent trips</h2>
		{#each data.recent as r (r.id)}
			<p class="small">
				<DisplayIcon value={r.icon} scale={2} /> <strong>{r.name}</strong>: {r.tier ? TIER[r.tier] : ''}, {r.xp} XP, {r.gp} GP{r.finds.length ? `, found ${r.finds.join(', ')}` : ''}
			</p>
		{/each}
	</section>
{/if}

<style>
	.work-goals { display: grid; gap: 12px; margin-top: 16px; }
	.work-goal { border: 1px solid var(--line); padding: 14px; background: var(--bg-3); min-width: 0; }
	.goal-title { display: flex; gap: 10px; align-items: center; }
	.goal-title h3 { font-size: 24px; margin: 0; }
	.goal-count { font-size: 22px; margin: 12px 0; }
	.goal-count .small { display: block; }
	.goal-status { display: flex; align-items: center; gap: 6px; min-height: 24px; }
	.complete .goal-status { color: var(--good); }
	.target-form label { font-size: 11px; }
	.target-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
	.target-controls input { width: 80px; }
	.remove-goal { min-height: 44px; font: inherit; font-size: 12px; text-decoration: underline; cursor: pointer; background: none; border: 0; padding: 0; }
	.goal-note { margin: 16px 0; }
	.goal-links { gap: 10px; }
	@media (min-width: 680px) { .work-goals { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
	.run,
	.head {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.run {
		padding: 8px 0;
	}

	.mission {
		padding: 14px;
		margin-top: 14px;
		border: 1px solid var(--line);
		background: var(--bg-3);
	}

	.mission p {
		margin: 8px 0;
	}

	.go {
		margin-top: 8px;
	}

</style>
