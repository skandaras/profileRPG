<script lang="ts">
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import { DEFAULT_AVATAR } from '$lib/content/cosmetics';
	import { HABIT_TEMPLATES } from '$lib/content/habits';
	import { STARTERS } from '$lib/content/pets';
	import { STATS } from '$lib/content/stats';
	import type { AvatarConfig } from '$lib/content/types';
	import { describeSchedule } from '$lib/game/schedule';
	import { withNotices } from '$lib/act';
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

	async function moveStep(next: number) {
		step = next;
		await tick();
		document.querySelector<HTMLHeadingElement>('h1')?.focus();
	}

	function toggle(id: string) {
		picked = picked.includes(id) ? picked.filter((p) => p !== id) : [...picked, id].slice(-8);
	}
</script>

<svelte:head><title>Begin your adventure · LevelUp</title></svelte:head>

<ol class="steps" aria-label="Progress">
	{#each STEPS as s, i (s)}
		<li class:done={i < step} class:now={i === step} aria-current={i === step ? 'step' : undefined}><span aria-hidden="true">{i < step ? '✓' : i + 1}</span> {s}<span class="sr-only">{i < step ? ', complete' : i === step ? ', current' : ''}</span></li>
	{/each}
</ol>

{#if step === 0}
	<section class="box intro">
		<h1 tabindex="-1">Welcome to LevelUp!</h1>
		<p>
			Every walk, every chapter, every glass of water makes your hero a little stronger. Log what you do, level up, raise a
			partner, and send them off on adventures.
		</p>
		<p>Missed a day? That happens. You'll lose a streak and a few coins, never your progress.</p>
		<div class="field">
			<label for="name">What should we call your hero?</label>
			<input id="name" bind:value={heroName} onkeydown={(event) => { if (event.key === 'Enter' && canNext) { event.preventDefault(); void moveStep(1); } }} maxlength="24" autocomplete="nickname" placeholder="Hero name" />
		</div>
	</section>
{:else if step === 1}
	<section class="box">
		<h1 tabindex="-1">Create your look</h1>
		<p class="soft small">More outfits, hats and colours unlock as you level up and explore.</p>
		<AvatarEditor bind:avatar starterOnly />
	</section>
{:else if step === 2}
	<section class="box">
		<h1 tabindex="-1">Choose your partner</h1>
		<p class="soft small">Your partner grows as you do. Feed it, play with it, and it'll come on missions with you.</p>
		<fieldset><legend class="sr-only">Partner species</legend><div class="starters">
			{#each STARTERS as s (s.id)}
				<button type="button" class="tile starter" class:selection={starter === s.id} aria-pressed={starter === s.id} onclick={() => (starter = s.id)}>
					<PetSprite speciesId={s.id} stage="baby" scale={3} label={s.name} />
					<span class="title">{s.name}</span>
					<span class="small soft">{s.blurb}</span>
					<span class="small">Loves {s.affinity.map((a) => STATS[a].name).join(' & ')}</span>
				</button>
			{/each}
		</div>
		</fieldset>
		{#if starterSpecies}
			<div class="field mt">
				<label for="petname">Name your {starterSpecies.name}</label>
				<input id="petname" bind:value={petName} maxlength="24" placeholder={starterSpecies.name} />
			</div>
		{/if}
	</section>
{:else if step === 3}
	<section class="box">
		<h1 tabindex="-1">Pick a few habits to start</h1>
		<p class="soft small">Start small: three is plenty. You can add, change or make your own any time.</p>
		<fieldset><legend class="sr-only">Starting habits</legend><div class="templates">
			{#each HABIT_TEMPLATES as t (t.id)}
				<button type="button" class="tile tpl" class:selection={picked.includes(t.id)} aria-pressed={picked.includes(t.id)} onclick={() => toggle(t.id)}>
					<span class="emoji" aria-hidden="true">{t.icon}</span>
					<span class="tpl-text">
						<span class="title">{t.title}</span>
						<span class="small soft">{describeSchedule(t.schedule)}{t.quantity ? ` · ${t.quantity} ${t.unit}` : ''}</span>
					</span>
				</button>
			{/each}
		</div></fieldset>
	</section>
{:else}
	<section class="box ready">
		<h1 tabindex="-1">Ready, {heroName}?</h1>
		<div class="row center gap-wide">
			<Avatar {avatar} scale={4} label={heroName} />
			{#if starter}<PetSprite speciesId={starter} stage="baby" scale={4} mood="happy" label={petName || starterSpecies?.name} />{/if}
		</div>
		<p>
			You and {petName || starterSpecies?.name} are setting out with {picked.length} habit{picked.length === 1 ? '' : 's'} and
			20 GP in your pocket.
		</p>
		{#if form?.error}<p class="bad" role="alert">{form.error}</p>{/if}
		<form
			method="POST"
			use:enhance={(input) => {
				busy = true;
				return withNotices({ then: () => { busy = false; } })(input);
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
	{#if step > 0}<button type="button" class="btn ghost" onclick={() => moveStep(step - 1)}>Back</button>{:else}<span></span>{/if}
	{#if step < STEPS.length - 1}
		<button type="button" class="btn" disabled={!canNext} aria-describedby={!canNext ? 'next-hint' : undefined} onclick={() => moveStep(step + 1)}>Next</button>
	{/if}
</div>

{#if !canNext}<p id="next-hint" class="small soft hint">{step === 0 ? 'Enter a hero name to continue.' : step === 2 ? 'Choose a partner to continue.' : 'Choose at least one habit to continue.'}</p>{/if}

<style>
	.steps {
		display: flex;
		gap: 8px;
		list-style: none;
		padding: 0;
		margin: 0 0 16px;
	}

	.steps li {
		flex: 1;
		text-align: center;
		font-size: 13px;
		line-height: 20px;
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
		font-weight: 600;
	}

	.starters {
		display: grid;
		gap: 16px;
		grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
	}

	.starter {
		padding: 12px;
		gap: 8px;
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

	.ready {
		text-align: center;
	}

	.nav {
		display: flex;
		justify-content: space-between;
	}
</style>
