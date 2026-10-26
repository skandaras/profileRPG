<script lang="ts">
	import { enhance } from '$app/forms';
	import { withNotices } from '$lib/act';
	import { getConsumable, getCosmetic, getTheme } from '$lib/content';
	import PetSprite from '$lib/components/PetSprite.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import PixelIcon from '$lib/components/PixelIcon.svelte';
	import { DEFAULT_AVATAR } from '$lib/content/cosmetics';
	import { getDye } from '$lib/content/palettes';

	let { data } = $props();

	const SECTIONS = [
		{ kind: 'food', title: 'Snacks' },
		{ kind: 'toy', title: 'Toys' },
		{ kind: 'cosmetic', title: 'Clothes' },
		{ kind: 'petacc', title: 'For your pet' },
		{ kind: 'dye', title: 'Dyes' },
		{ kind: 'theme', title: 'Themes' }
	] as const;

	const tryOn = (id: string) => {
		const c = getCosmetic(id);
		return c ? { ...DEFAULT_AVATAR, parts: { ...DEFAULT_AVATAR.parts, [c.slot]: id } } : DEFAULT_AVATAR;
	};
</script>

<svelte:head><title>Shop · LevelUp</title></svelte:head>

<div class="spread">
	<h1>Shop</h1>
	<span class="chip"><PixelIcon name="gp" scale={1} /> {data.gp} GP</span>
</div>
<p class="soft small">Coins come from habits, missions and the morning tidy. Spend them on whatever makes you smile.</p>

{#each SECTIONS as sec (sec.kind)}
	{@const items = data.stock.filter((i) => i.kind === sec.kind)}
	{#if items.length}
		<section class="box">
			<h2>{sec.title}</h2>
			<div class="items">
				{#each items as i (i.id)}
					{@const locked = data.level < i.level}
					<form method="POST" action="?/buy" use:enhance={withNotices()} class="item">
						<input type="hidden" name="item" value={i.id} />
						<div class="pic">
							{#if i.kind === 'food' || i.kind === 'toy'}
								{@const c = getConsumable(i.id)}
								{#if c}<PixelIcon art={c.icon} tint={c.tint} scale={3} />{/if}
							{:else if i.kind === 'cosmetic'}
								<Avatar avatar={tryOn(i.id)} scale={2} animate={false} label="" />
							{:else if i.kind === 'dye'}
								{@const d = getDye(i.id.slice(4))}
								<span class="dye" style:background={d?.ramp[1]}></span>
							{:else if i.kind === 'theme'}
								{@const t = getTheme(i.id.slice(6))}
								{#if t}
									<span class="theme" aria-hidden="true" style:background={t.tokens.bg2} style:border-color={t.tokens.ink}>
										<i style:background={t.tokens.bg}></i><i style:background={t.tokens.accent}></i><i style:background={t.tokens.ink}></i>
									</span>
								{/if}
							{:else}
								<PetSprite speciesId={data.pet?.speciesId ?? 'emberkit'} stage={data.pet?.stage ?? 'baby'} accessoryId={i.id} scale={2} />
							{/if}
						</div>
						<strong class="small">{i.name}</strong>
						{#if i.blurb}<span class="small soft">{i.blurb}</span>{/if}
						{#if i.stackable && i.have}<span class="small soft">You have {i.have}</span>{/if}
						<button class="btn small" disabled={i.owned || locked || data.gp < i.price}>
							{i.owned ? 'Owned' : locked ? `Lv ${i.level}` : `${i.price} GP`}
						</button>
					</form>
				{/each}
			</div>
		</section>
	{/if}
{/each}

<style>
	.items {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 10px;
	}

	.item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		text-align: center;
		background: var(--bg-3);
		border: 2px solid var(--line);
		border-radius: 6px;
		padding: 10px 8px;
	}

	.item .btn {
		margin-top: auto;
	}

	.pic {
		min-height: 80px;
		display: grid;
		place-items: center;
	}

	.dye {
		width: 44px;
		height: 44px;
		border: 3px solid var(--line);
		border-radius: 50%;
	}

	.theme {
		display: flex;
		gap: 4px;
		padding: 8px;
		border: 3px solid;
		border-radius: 6px;
	}

	.theme i {
		width: 18px;
		height: 18px;
		border-radius: 3px;
	}
</style>
