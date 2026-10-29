<script lang="ts">
	import { enhance } from '$app/forms';
	import { withNotices } from '$lib/act';
	import { getConsumable, getTheme } from '$lib/content';
	import PetSprite from '$lib/components/PetSprite.svelte';
	import PixelIcon from '$lib/components/PixelIcon.svelte';

	let { data } = $props();

	const SECTIONS = [
		{ kind: 'food', title: 'Snacks' },
		{ kind: 'toy', title: 'Toys' },
		{ kind: 'petacc', title: 'For your pet' },
		{ kind: 'theme', title: 'Themes' }
	] as const;

</script>

<svelte:head><title>Shop · LevelUp</title></svelte:head>

<a href="/me" class="back small">← Me</a>
<div class="page-heading">
	<h1>Shop</h1>
	<span class="chip"><PixelIcon name="gp" scale={1} /> {data.gp} GP</span>
</div>
<p class="soft small">Coins come from habits, missions and the morning tidy. Spend them on whatever makes you smile.</p>

{#each SECTIONS as sec (sec.kind)}
	{@const items = data.stock.filter((i) => i.kind === sec.kind)}
	{#if items.length}
		<section class="box">
			<h2>{sec.title}</h2>
			<div class="catalogue">
				{#each items as i (i.id)}
					{@const locked = data.level < i.level}
					<form method="POST" action="?/buy" use:enhance={withNotices()} class="item paper-item">
						<input type="hidden" name="item" value={i.id} />
						<div class="pic">
							{#if i.kind === 'food' || i.kind === 'toy'}
								{@const c = getConsumable(i.id)}
								{#if c}<PixelIcon art={c.icon} tint={c.tint} scale={3} />{/if}
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
						{#if locked}<span class="small soft">Unlocks at level {i.level}.</span>{:else if !i.owned && data.gp < i.price}<span class="small soft">Need {i.price - data.gp} more GP.</span>{/if}
						<button class="btn small" aria-label={`Buy ${i.name} for ${i.price} GP`} disabled={i.owned || locked || data.gp < i.price}>
							{i.owned ? 'Owned' : locked ? `Lv ${i.level}` : `${i.price} GP`}
						</button>
					</form>
				{/each}
			</div>
		</section>
	{/if}
{/each}

<style>
	.item .btn {
		margin-top: auto;
	}

	.pic {
		min-height: 80px;
		display: grid;
		place-items: center;
	}

	.theme {
		display: flex;
		gap: 4px;
		padding: 8px;
		border: 1px solid;
		border-radius: 0;
	}

	.theme i {
		width: 18px;
		height: 18px;
		border-radius: 3px;
	}
</style>
