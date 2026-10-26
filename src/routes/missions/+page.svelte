<script lang="ts">
	import { enhance } from '$app/forms';
	import { withNotices } from '$lib/act';
	import { countdown, duration, ticker } from '$lib/clock.svelte';
	import { STATS } from '$lib/content/stats';
	import type { StatId } from '$lib/content/types';

	let { data } = $props();
	const clock = ticker(() => data.now);
	let bringPet = $state(true);

	const free = $derived(data.board.slots - data.board.runs.length);
	const TIER = { great: '🌟 Triumph', success: '✅ Success', partial: '🩹 Bumpy trip' } as const;
</script>

<svelte:head><title>Quests · LevelUp</title></svelte:head>

<h1>Quests</h1>
<p class="soft small">
	Send your hero off while you get on with your day. Higher stats mean better odds; even a bumpy trip brings something home.
</p>

{#if data.board.runs.length}
	<section class="box">
		<h2>On the road</h2>
		{#each data.board.runs as r (r.id)}
			{@const left = r.endsAt - clock.now}
			<div class="run">
				<span class="big" aria-hidden="true">{r.icon}</span>
				<div class="grow">
					<strong>{r.name}</strong>
					<div class="bar" role="progressbar" aria-label="Journey" aria-valuenow={Math.min(100, Math.round(((clock.now - r.startedAt) / (r.endsAt - r.startedAt)) * 100))}>
						<span style:width="{Math.min(100, ((clock.now - r.startedAt) / (r.endsAt - r.startedAt)) * 100)}%"></span>
					</div>
				</div>
				{#if left <= 0}
					<form method="POST" action="?/claim" use:enhance={withNotices()}>
						<input type="hidden" name="run" value={r.id} />
						<button class="btn small">Claim</button>
					</form>
				{:else}
					<span class="chip">⏳ {countdown(left)}</span>
				{/if}
			</div>
		{/each}
	</section>
{/if}

<section class="box">
	<div class="spread">
		<h2>Missions</h2>
		<span class="chip">{free} of {data.board.slots} free</span>
	</div>
	{#if data.board.companion}
		<label class="pick">
			<input type="checkbox" bind:checked={bringPet} />
			Bring {data.board.companion.name} along (better odds, and they grow from it)
		</label>
	{/if}
	{#each data.board.missions as m (m.id)}
		<form method="POST" action="?/start" use:enhance={withNotices()} class="mission" class:locked={m.locked}>
			<input type="hidden" name="mission" value={m.id} />
			{#if bringPet && data.board.companion}<input type="hidden" name="pet" value="on" />{/if}
			<div class="head">
				<span class="big" aria-hidden="true">{m.icon}</span>
				<div class="grow">
					<strong>{m.name}</strong>
					<div class="small soft">{m.region} · {duration(m.durationMs)}</div>
				</div>
				{#if m.locked}
					<span class="chip">🔒 Lv {m.minLevel}</span>
				{:else}
					<span class="chip" title="Chance of success">{bringPet && data.board.companion ? m.chance : m.chanceAlone}%</span>
				{/if}
			</div>
			<p class="small">{m.blurb}</p>
			<div class="row wrap small">
				{#each Object.entries(m.recommended) as [s, v] (s)}
					{@const have = data.stats[s as StatId]}
					<span class="chip" class:good={have >= v} style:border-color={STATS[s as StatId].color}>{STATS[s as StatId].short} {have}/{v}</span>
				{/each}
				<span class="chip">⭐ {m.xp}</span>
				<span class="chip">🪙 {m.gp}</span>
				{#if m.loot.some((l) => 'egg' in l)}<span class="chip">🥚 eggs</span>{/if}
			</div>
			{#if !m.locked}
				<button class="btn small go" disabled={free <= 0 || m.running}>{m.running ? 'Underway' : 'Set off'}</button>
			{/if}
		</form>
	{/each}
</section>

{#if data.recent.length}
	<section class="box">
		<h3>Recent trips</h3>
		{#each data.recent as r (r.id)}
			<p class="small">
				{r.icon} <strong>{r.name}</strong>: {r.tier ? TIER[r.tier] : ''}, {r.xp} XP, {r.gp} GP{r.finds.length ? `, found ${r.finds.join(', ')}` : ''}
			</p>
		{/each}
	</section>
{/if}

<style>
	.run,
	.head {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.run {
		padding: 6px 0;
	}

	.grow {
		flex: 1;
		min-width: 0;
	}

	.big {
		font-size: 1.8rem;
	}

	.mission {
		padding: 12px 0;
		border-bottom: 2px dashed var(--bg-3);
	}

	.mission:last-child {
		border-bottom: 0;
	}

	.mission p {
		margin: 6px 0;
	}

	.locked {
		opacity: 0.6;
	}

	.go {
		margin-top: 8px;
	}

	.pick {
		display: flex;
		gap: 8px;
		align-items: center;
		font-weight: 400;
		margin: 6px 0 10px;
	}

	.pick input {
		width: auto;
		min-height: 0;
		accent-color: var(--accent);
	}
</style>
