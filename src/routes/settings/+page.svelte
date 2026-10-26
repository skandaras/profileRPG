<script lang="ts">
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

<p><a href="/me" class="small">← Me</a></p>
<h1>Settings</h1>

<section class="box">
	<h2>Rest mode</h2>
	<p class="small">
		Sick, travelling, or just need a break? Rest mode stops missed habits costing streaks or GP, and your pets won't get hungry.
		Turn it off when you're ready.
	</p>
	<form method="POST" action="?/rest" use:enhance={withNotices()}>
		<input type="hidden" name="resting" value={data.resting ? 'off' : 'on'} />
		<button class="btn" class:ghost={data.resting}>{data.resting ? '☀️ I’m back. Turn rest mode off' : '🛌 Turn rest mode on'}</button>
	</form>
</section>

<section class="box">
	<h2>Theme</h2>
	<form method="POST" action="?/theme" use:enhance={withNotices()} class="themes">
		{#each data.themes as t (t.id)}
			<button
				class="theme"
				name="theme"
				value={t.id}
				disabled={!t.owned}
				aria-pressed={data.themeId === t.id}
				style:--tb={t.tokens.bg}
				style:--tb2={t.tokens.bg2}
				style:--ti={t.tokens.ink}
				style:--ta={t.tokens.accent}
			>
				<span class="swatch" aria-hidden="true"><i></i><i></i><i></i></span>
				<strong>{t.name}</strong>
				<span class="small">{t.owned ? t.blurb : `🔒 ${t.hint}`}</span>
			</button>
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
			<select id="dsh" name="dayStartHour" value={String(data.dayStartHour)}>
				{#each [0, 1, 2, 3, 4, 5, 6] as h (h)}<option value={String(h)}>{h === 0 ? 'midnight' : `${h}am`}</option>{/each}
			</select>
			<p class="small soft">Anything you tick off before then counts for the day before, for the night owls.</p>
		</div>
		<button class="btn">Save</button>
	</form>
</section>

<style>
	.themes {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 10px;
	}

	.theme {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 4px;
		text-align: left;
		font: inherit;
		padding: 10px;
		background: var(--tb2);
		color: var(--ti);
		border: 3px solid var(--line);
		border-radius: 8px;
		cursor: pointer;
	}

	.theme[aria-pressed='true'] {
		outline: 3px solid var(--accent);
		outline-offset: 2px;
	}

	.theme:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.swatch {
		display: flex;
		gap: 3px;
	}

	.swatch i {
		width: 18px;
		height: 18px;
		border: 2px solid var(--ti);
		border-radius: 3px;
		background: var(--tb);
	}

	.swatch i:nth-child(2) {
		background: var(--ta);
	}

	.swatch i:nth-child(3) {
		background: var(--ti);
	}
</style>
