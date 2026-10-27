<script lang="ts">
	import PixelIcon from '$lib/components/PixelIcon.svelte';
	import { enhance } from '$app/forms';
	import { withNotices } from '$lib/act';

	let { data } = $props();

	// Chrome's list leaves out "UTC" itself, which is what a fresh hero may have.
	const zones = $derived.by(() => {
		let list: string[] = [];
		try {
			list = Intl.supportedValuesOf('timeZone');
		} catch {
			return [];
		}
		return list.includes(data.timezone) ? list : [data.timezone, ...list];
	});
</script>

<svelte:head><title>Settings · LevelUp</title></svelte:head>

<a href="/me" class="back small">← Me</a>
<h1>Settings</h1>

<section class="box">
	<h2>Rest mode</h2>
	<p class="small">
		Sick, travelling, or just need a break? Rest mode stops missed habits costing streaks or GP, and your pets won't get hungry.
		Turn it off when you're ready.
	</p>
	<form method="POST" action="?/rest" use:enhance={withNotices()}>
		<input type="hidden" name="resting" value={data.resting ? 'off' : 'on'} />
		<p class="small soft">Rest mode is {data.resting ? 'on' : 'off'}.</p>
		<button class="btn" aria-pressed={data.resting} class:ghost={data.resting}><PixelIcon name={data.resting ? 'sun' : 'rest'} scale={1} />{data.resting ? 'I’m back. Turn rest mode off' : 'Turn rest mode on'}</button>
	</form>
</section>

<section class="box">
	<h2>Theme</h2>
	<form method="POST" action="?/theme" use:enhance={withNotices()} class="catalogue">
		{#each data.themes as t (t.id)}
			<button
				class="theme tile"
				name="theme"
				value={t.id}
				disabled={!t.owned}
				aria-pressed={data.themeId === t.id}
				style:--tb={t.tokens.bg}
				style:--ti={t.tokens.ink}
				style:--ta={t.tokens.accent}
			>
				<span class="swatch" aria-hidden="true"><i></i><i></i><i></i></span>
				<strong>{t.name}</strong>
				<span class="small soft">{t.owned ? t.blurb : `Locked: ${t.hint}`}</span>
			{#if data.themeId === t.id}<PixelIcon name="check" scale={1} />{/if}</button>
		{/each}
	</form>
</section>

<section class="box">
	<h2>You</h2>
	<form method="POST" action="?/profile" use:enhance={withNotices()}>
		<div class="field">
			<label for="hn">Hero name</label>
			<input id="hn" name="heroName" value={data.heroName} maxlength="24" />
		</div>
		<div class="field">
			<label for="tz">Time zone</label>
			{#if zones.length}
				<select id="tz" name="timezone" value={data.timezone}>
					{#each zones as z (z)}<option value={z}>{z}</option>{/each}
				</select>
			{:else}
				<input id="tz" name="timezone" value={data.timezone} />
			{/if}
		</div>
		<div class="field">
			<label for="dsh">A new day starts at</label>
			<select id="dsh" name="dayStartHour" value={String(data.dayStartHour)} aria-describedby="day-start-hint">
				{#each [0, 1, 2, 3, 4, 5, 6] as h (h)}<option value={String(h)}>{h === 0 ? 'midnight' : `${h}am`}</option>{/each}
			</select>
			<p id="day-start-hint" class="small soft hint">Anything you tick off before then counts for the day before, for the night owls.</p>
		</div>
		<button class="btn">Save</button>
	</form>
</section>

<style>
	.theme {
		align-items: flex-start;
		text-align: left;
		padding: 12px;
		gap: 8px;
	}

	.swatch {
		display: flex;
		gap: 3px;
	}

	.swatch i {
		width: 18px;
		height: 18px;
		border: 1px solid var(--ti);
		border-radius: 0;
		background: var(--tb);
	}

	.swatch i:nth-child(2) {
		background: var(--ta);
	}

	.swatch i:nth-child(3) {
		background: var(--ti);
	}
</style>
