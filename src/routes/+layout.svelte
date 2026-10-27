<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { pushNotices } from '$lib/toasts.svelte';
	import { THEMES } from '$lib/content/themes';
	import Bar from '$lib/components/Bar.svelte';
	import PixelIcon from '$lib/components/PixelIcon.svelte';
	import Toasts from '$lib/components/Toasts.svelte';

	let { data, children } = $props();

	$effect(() => {
		if (data.notices?.length) pushNotices(data.notices);
	});

	// The server sets the theme on first load; this keeps it right after a change.
	$effect(() => {
		document.documentElement.dataset.theme = activeTheme.id;
		document.querySelector('meta[name="theme-color"]')?.setAttribute('content', activeTheme.tokens.bg);
	});

	const TABS = [
		{ href: '/', label: 'Home', icon: 'house' },
		{ href: '/habits', label: 'Habits', icon: 'clipboard' },
		{ href: '/pet', label: 'Pet', icon: 'paw' },
		{ href: '/missions', label: 'Quests', icon: 'map' },
		{ href: '/me', label: 'Me', icon: 'xp' }
	] as const;

	const activeTheme = $derived(THEMES.find((t) => t.id === data.hero?.themeId) ?? THEMES[0]);
	const isActive = (href: string) => {
		const path = page.url.pathname;
		if (href === '/me') return ['/me', '/wardrobe', '/shop', '/party', '/settings'].some((p) => path.startsWith(p));
		return href === '/' ? path === '/' : path.startsWith(href);
	};
</script>

<svelte:head>
	<title>LevelUp</title>
</svelte:head>

<a class="skip-link" href="#main">Skip to content</a>

{#if data.hero}
	<header class="top">
		<div class="inner">
			<a class="who" href="/me">
				<span class="name title">{data.hero.heroName}</span>
				<span class="chip">Lv {data.hero.level}</span>
				{#if data.hero.points > 0}<span class="chip pts">+{data.hero.points}<span class="sr-only"> points to spend</span></span>{/if}
			</a>
			<div class="xp">
				<Bar value={data.hero.xp} max={data.hero.xpNext} label="Experience to next level" />
				<span class="numeral">{data.hero.xp} / {data.hero.xpNext} XP</span>
			</div>
			<a class="gp" href="/shop" aria-label="{data.hero.gp} GP, open shop">
				<PixelIcon name="gp" scale={2} />
				<span>{data.hero.gp}</span>
			</a>
		</div>
		{#if data.hero.resting}
			<div class="resting small"><PixelIcon name="rest" scale={1} /> Rest mode is on. Nothing is lost while you recover. <a href="/settings">Change</a></div>
		{/if}
	</header>
{/if}

<main id="main" tabindex="-1" class:onboarding={!data.hero}>
	{@render children()}
</main>

{#if data.hero}
	<nav class="tabbar" aria-label="Main">
		{#each TABS as t (t.href)}
			<a href={t.href} aria-current={isActive(t.href) ? 'page' : undefined}>
				<PixelIcon name={t.icon} scale={1} />
				<span class="lbl">{t.label}</span>
			</a>
		{/each}
	</nav>
{/if}

<Toasts />

<style>
	.top {
		background: var(--bg-2);
		border-bottom: 1px solid var(--line);
		padding-top: env(safe-area-inset-top);
	}

	.inner {
		max-width: 560px;
		margin: auto;
		padding: 16px 20px 20px;
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 12px;
		min-height: 100px;
		align-items: center;
	}

	.who {
		display: flex;
		align-items: center;
		gap: 8px;
		text-decoration: none;
		min-width: 0;
		min-height: 44px;
	}

	.name {
		margin: 0;
		font-size: 24px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 8em;
	}

	.xp {
		grid-row: 2;
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: 12px;
	}

	.gp {
		grid-row: 1;
		grid-column: 2;
		display: flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		text-decoration: none;
		font: 500 20px 'Pixelify Sans', system-ui, sans-serif;
	}

	.resting {
		max-width: 560px;
		margin: auto;
		padding: 4px 20px 12px;
	}

	main {
		max-width: 560px;
		margin: auto;
		padding: 24px 20px calc(96px + env(safe-area-inset-bottom));
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
		border-top: 1px solid var(--trim);
		padding: 8px 12px calc(8px + env(safe-area-inset-bottom));
	}

	.tabbar a {
		flex-direction: column;
		gap: 4px;
		flex: 1;
		max-width: 112px;
		display: flex;
		align-items: center;
		justify-content: center;
		text-decoration: none;
		color: var(--ink);
		min-height: 55px;
	}

	.tabbar a[aria-current='page'] {
		color: var(--accent);
		background: var(--bg-3);
		box-shadow: inset 0 -3px var(--accent);
	}

	.lbl {
		font-family: 'Pixelify Sans', system-ui, sans-serif;
		font-size: 16px;
		font-weight: 500;
	}

</style>
