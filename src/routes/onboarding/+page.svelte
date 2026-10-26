<script lang="ts">
	import { enhance } from '$app/forms';
	import { DEFAULT_AVATAR } from '$lib/content/cosmetics';
	import { HABIT_TEMPLATES } from '$lib/content/habits';
	import { STARTERS } from '$lib/content/pets';
	import { STATS } from '$lib/content/stats';
	import type { AvatarConfig } from '$lib/content/types';
	import { describeSchedule } from '$lib/game/schedule';
	import Avatar from '$lib/components/Avatar.svelte';
	import AvatarEditor from '$lib/components/AvatarEditor.svelte';
	import PetSprite from '$lib/components/PetSprite.svelte';

	let { form } = $props();

	const STEPS = ['Hello', 'Look', 'Partner', 'Habits', 'Ready'];
	let step = $state(0);
	let heroName = $state('');
	let avatar = $state<AvatarConfig>(structuredClone(DEFAULT_AVATAR));
	let starter = $state<string | null>(null);
	let petName = $state('');
	let picked = $state<string[]>(['walk', 'read', 'water']);
	let timezone = $state('UTC');
	let busy = $state(false);

	$effect(() => {
		try {
			timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
		} catch {
			timezone = 'UTC';
		}
	});

	const starterSpecies = $derived(STARTERS.find((s) => s.id === starter));
	const canNext = $derived(
		step === 0 ? heroName.trim().length > 0 : step === 2 ? !!starter : step === 3 ? picked.length > 0 : true
	);

	function toggle(id: string) {
		picked = picked.includes(id) ? picked.filter((p) => p !== id) : [...picked, id].slice(-8);
	}
</script>

<svelte:head><title>Begin your adventure · LevelUp</title></svelte:head>

<ol class="steps" aria-label="Progress">
	{#each STEPS as s, i (s)}
		<li class:done={i < step} class:now={i === step} aria-current={i === step ? 'step' : undefined}>{s}</li>
	{/each}
</ol>

{#if step === 0}
	<section class="box intro">
		<h1>Welcome to LevelUp!</h1>
		<p>
			Every walk, every chapter, every glass of water makes your hero a little stronger. Log what you do, level up, raise a
			partner, and send them off on adventures.
		</p>
		<p>Missed a day? That happens. You'll lose a streak and a few coins, never your progress.</p>
		<div class="field">
			<label for="name">What should we call your hero?</label>
			<input id="name" bind:value={heroName} maxlength="24" autocomplete="nickname" placeholder="Hero name" />
		</div>
	</section>
{:else if step === 1}
	<section class="box">
		<h2>Create your look</h2>
		<p class="soft small">More outfits, hats and colours unlock as you level up and explore.</p>
		<AvatarEditor bind:avatar starterOnly />
	</section>
{:else if step === 2}
	<section class="box">
		<h2>Choose your partner</h2>
		<p class="soft small">Your partner grows as you do. Feed it, play with it, and it'll come on missions with you.</p>
		<div class="starters">
			{#each STARTERS as s (s.id)}
				<button type="button" class="tile starter" aria-pressed={starter === s.id} onclick={() => (starter = s.id)}>
					<PetSprite speciesId={s.id} stage="baby" scale={3} label={s.name} />
					<span class="title">{s.name}</span>
					<span class="small soft">{s.blurb}</span>
					<span class="small">Loves {s.affinity.map((a) => STATS[a].name).join(' & ')}</span>
				</button>
			{/each}
		</div>
		{#if starterSpecies}
			<div class="field" style="margin-top:14px">
				<label for="petname">Name your {starterSpecies.name}</label>
				<input id="petname" bind:value={petName} maxlength="24" placeholder={starterSpecies.name} />
			</div>
		{/if}
	</section>
{:else if step === 3}
	<section class="box">
		<h2>Pick a few habits to start</h2>
		<p class="soft small">Start small: three is plenty. You can add, change or make your own any time.</p>
		<div class="templates">
			{#each HABIT_TEMPLATES as t (t.id)}
				<button type="button" class="tile tpl" aria-pressed={picked.includes(t.id)} onclick={() => toggle(t.id)}>
					<span class="emoji" aria-hidden="true">{t.icon}</span>
					<span class="tpl-text">
						<span class="title">{t.title}</span>
						<span class="small soft">{describeSchedule(t.schedule)}{t.quantity ? ` · ${t.quantity} ${t.unit}` : ''}</span>
					</span>
				</button>
			{/each}
		</div>
	</section>
{:else}
	<section class="box ready">
		<h2>Ready, {heroName}?</h2>
		<div class="row" style="justify-content:center;gap:24px">
			<Avatar {avatar} scale={4} label={heroName} />
			{#if starter}<PetSprite speciesId={starter} stage="baby" scale={4} mood="happy" label={petName || starterSpecies?.name} />{/if}
		</div>
		<p>
			You and {petName || starterSpecies?.name} are setting out with {picked.length} habit{picked.length === 1 ? '' : 's'} and
			20 GP in your pocket.
		</p>
		{#if form?.error}<p class="bad">{form.error}</p>{/if}
		<form
			method="POST"
			use:enhance={() => {
				busy = true;
				return async ({ update }) => {
					await update();
					busy = false;
				};
			}}
		>
			<input type="hidden" name="heroName" value={heroName} />
			<input type="hidden" name="avatar" value={JSON.stringify(avatar)} />
			<input type="hidden" name="starter" value={starter} />
			<input type="hidden" name="petName" value={petName} />
			<input type="hidden" name="timezone" value={timezone} />
			{#each picked as t (t)}<input type="hidden" name="templates" value={t} />{/each}
			<button class="btn wide" disabled={busy}>{busy ? 'Packing…' : 'Begin the adventure!'}</button>
		</form>
	</section>
{/if}

<div class="nav">
	{#if step > 0}<button type="button" class="btn ghost" onclick={() => step--}>Back</button>{:else}<span></span>{/if}
	{#if step < STEPS.length - 1}
		<button type="button" class="btn" disabled={!canNext} onclick={() => step++}>Next</button>
	{/if}
</div>

<style>
	.steps {
		display: flex;
		gap: 6px;
		list-style: none;
		padding: 0;
		margin: 0 0 16px;
	}

	.steps li {
		flex: 1;
		text-align: center;
		font-size: 0.75rem;
		padding: 4px 0;
		border-bottom: 4px solid var(--bg-3);
		color: var(--ink-soft);
	}

	.steps li.done {
		border-color: var(--good);
	}

	.steps li.now {
		border-color: var(--accent);
		color: var(--ink);
		font-weight: 700;
	}

	.starters {
		display: grid;
		gap: 10px;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
	}

	.starter {
		padding: 12px;
		gap: 6px;
	}

	.templates {
		display: grid;
		gap: 8px;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
	}

	.tpl {
		flex-direction: row;
		justify-content: flex-start;
		text-align: left;
	}

	.tpl-text {
		display: flex;
		flex-direction: column;
	}

	.emoji {
		font-size: 1.6rem;
	}

	.ready {
		text-align: center;
	}

	.nav {
		display: flex;
		justify-content: space-between;
	}
</style>
