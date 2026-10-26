<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { pushNotices } from '$lib/toasts.svelte';
	import Bar from '$lib/components/Bar.svelte';
	import PixelIcon from '$lib/components/PixelIcon.svelte';
	import Toasts from '$lib/components/Toasts.svelte';

	let { data, children } = $props();

	$effect(() => {
		if (data.notices?.length) pushNotices(data.notices);
	});

	// The server sets the theme on first load; this keeps it right after a change.
	$effect(() => {
		if (data.hero) document.documentElement.dataset.theme = data.hero.themeId;
	});

	const TABS = [
		{ href: '/', label: 'Home', icon: '🏡' },
		{ href: '/habits', label: 'Habits', icon: '📋' },
		{ href: '/pet', label: 'Pet', icon: '🐾' },
		{ href: '/missions', label: 'Quests', icon: '🗺️' },
		{ href: '/me', label: 'Me', icon: '⭐' }
	];

	const isActive = (href: string) => (href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href));
</script>

<svelte:head>
	<title>LevelUp</title>
</svelte:head>

{#if data.hero}
	<header class="top">
		<div class="inner">
			<a class="who" href="/me">
				<span class="name title">{data.hero.heroName}</span>
				<span class="chip">Lv {data.hero.level}</span>
				{#if data.hero.points > 0}<span class="chip pts" title="Points to spend">+{data.hero.points}</span>{/if}
			</a>
			<div class="xp">
				<Bar value={data.hero.xp} max={data.hero.xpNext} label="Experience to next level" />
			</div>
			<a class="gp" href="/shop" aria-label="{data.hero.gp} GP, open shop">
				<PixelIcon name="gp" scale={1.5} />
				<span>{data.hero.gp}</span>
			</a>
		</div>
		{#if data.hero.resting}
			<div class="resting small">🛌 Rest mode is on. Nothing is lost while you recover. <a href="/settings">Change</a></div>
		{/if}
	</header>
{/if}

<main class:onboarding={!data.hero}>
	{@render children()}
</main>

{#if data.hero}
	<nav class="tabbar" aria-label="Main">
		{#each TABS as t (t.href)}
			<a href={t.href} aria-current={isActive(t.href) ? 'page' : undefined}>
				<span class="ico" aria-hidden="true">{t.icon}</span>
				<span class="lbl">{t.label}</span>
			</a>
		{/each}
	</nav>
{/if}

<Toasts />

<style>
	.top {
		position: sticky;
		top: 0;
		z-index: 20;
		background: var(--bg-2);
		border-bottom: 3px solid var(--line);
		padding-top: env(safe-area-inset-top);
	}

	.inner {
		max-width: 560px;
		margin: 0 auto;
		padding: 8px 16px;
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.who {
		display: flex;
		align-items: center;
		gap: 6px;
		text-decoration: none;
		min-width: 0;
	}

	.name {
		margin: 0;
		font-size: 1.05rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 8em;
	}

	.pts {
		background: var(--accent);
		color: var(--accent-ink);
	}

	.xp {
		flex: 1;
		min-width: 40px;
	}

	.gp {
		display: flex;
		align-items: center;
		gap: 4px;
		text-decoration: none;
		font-weight: 700;
		font-family: 'Pixelify Sans', system-ui, sans-serif;
	}

	.resting {
		max-width: 560px;
		margin: 0 auto;
		padding: 4px 16px 8px;
	}

	main {
		max-width: 560px;
		margin: 0 auto;
		padding: 16px 16px calc(96px + env(safe-area-inset-bottom));
	}

	main.onboarding {
		padding-bottom: 32px;
	}

	.tabbar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 20;
		display: flex;
		justify-content: center;
		background: var(--bg-2);
		border-top: 3px solid var(--line);
		padding-bottom: env(safe-area-inset-bottom);
	}

	.tabbar a {
		flex: 1;
		max-width: 112px;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 6px 0 8px;
		text-decoration: none;
		color: var(--ink-soft);
		min-height: 56px;
	}

	.tabbar a[aria-current='page'] {
		color: var(--ink);
		background: var(--bg-3);
		box-shadow: inset 0 3px 0 var(--accent);
	}

	.ico {
		font-size: 1.35rem;
		line-height: 1.2;
	}

	.lbl {
		font-family: 'Pixelify Sans', system-ui, sans-serif;
		font-size: 0.8rem;
		font-weight: 700;
	}
</style>
