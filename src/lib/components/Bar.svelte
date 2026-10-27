<script lang="ts">
	let {
		value,
		max,
		color = 'var(--xp)',
		label,
		showValue = false
	}: { value: number; max: number; color?: string; label: string; showValue?: boolean } = $props();

	const pct = $derived(max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0);
</script>

<div class="wrap">
	<div class="bar" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.round(value)} aria-valuetext={`${Math.round(value)} of ${max}`}>
		<span style:width="{pct}%" style:--fill={color}></span>
	</div>
	{#if showValue}<span class="val small soft numeral">{Math.round(value)}/{max}</span>{/if}
</div>

<style>
	.wrap {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.bar {
		flex: 1;
	}

	.val {
		min-width: 4.5em;
		text-align: right;
	}
</style>
