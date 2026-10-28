<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { pushNotices } from '$lib/toasts.svelte';
	import { DEFAULT_THEME, THEMES } from '$lib/content/themes';
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

	const activeTheme = $derived(THEMES.find((t) => t.id === data.hero?.themeId) ?? THEMES.find((t) => t.id === DEFAULT_THEME)!);
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
				<span class="level">Lv {data.hero.level}</span>
				{#if data.hero.points > 0}<span class="chip pts">+{data.hero.points}<span class="sr-only"> points to spend</span></span>{/if}
			</a>
			<p class="tagline small soft">A little progress, every day.</p>
			<div class="xp">
				<Bar value={data.hero.xp} max={data.hero.xpNext} label="Experience to next level" />
				<span class="numeral">{data.hero.xp} / {data.hero.xpNext} XP</span>
			</div>
			<a class="gp" href="/shop" aria-label="{data.hero.gp} GP, open shop">
				<PixelIcon name="gp" scale={1.5} />
				<span class="coins">{data.hero.gp}</span><span class="gp-label">GP</span>
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
				<PixelIcon name={t.icon} scale={1.5} />
				<span class="lbl">{t.label}</span>
			</a>
		{/each}
	</nav>
{/if}

<Toasts />

<style>
	.top {
		padding-top: env(safe-area-inset-top);
	}

	.inner {
		max-width: 720px;
		margin: auto;
		padding: 8px 0;
		border-bottom: 1px solid var(--line);
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 0 12px;
		align-items: center;
	}

	.who {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		min-width: 0;
		min-height: 44px;
	}

	.name {
		margin: 0;
		font-size: 28px;
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.level {
		border-left: 1px solid var(--line);
		padding-left: 10px;
		white-space: nowrap;
		font-size: 13px;
	}

	.tagline {
		grid-row: 2;
		grid-column: 1 / -1;
		margin: -2px 0 7px;
		font-size: 11px;
		color: var(--ink);
	}

	.xp {
		grid-row: 3;
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: 12px;
	}

	.xp .numeral {
		font: 600 11px 'DM Sans', system-ui, sans-serif;
	}

	.gp {
		grid-row: 1;
		grid-column: 2;
		display: flex;
		align-items: center;
		gap: 4px;
		min-height: 44px;
		text-decoration: none;
	}

	.coins {
		font: 600 28px/1 'Cormorant Garamond', Georgia, serif;
	}

	.gp-label {
		font-size: 12px;
	}

	.resting {
		max-width: 720px;
		margin: auto;
		padding: 8px 0;
	}

	main {
		max-width: 756px;
		margin: auto;
		padding: 17px 18px calc(96px + env(safe-area-inset-bottom));
	}

	main.onboarding {
		max-width: 636px;
		padding-top: 28px;
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
		background: var(--bg);
		border-top: 3px double var(--line);
		padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
	}

	.tabbar a {
		flex-direction: column;
		gap: 5px;
		flex: 1;
		max-width: 140px;
		display: flex;
		align-items: center;
		justify-content: center;
		text-decoration: none;
		color: var(--ink);
		min-height: 54px;
		border: 1px solid transparent;
	}

	.tabbar a[aria-current='page'] {
		background: var(--paper);
		border-color: var(--line);
		border-radius: 25px 25px 3px 3px;
	}

	.lbl {
		font-size: 11px;
		font-weight: 600;
		padding: 0;
		margin: 0;
	}

	@media (max-width: 755px) {
		.inner, .resting {
			margin-inline: 18px;
		}
	}

	@media (max-width: 359px) {
		.who {
			gap: 6px;
		}
		.name {
			font-size: 24px;
		}
		.level {
			padding-left: 6px;
		}
	}
</style>
