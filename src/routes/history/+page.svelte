<script lang="ts">
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import { withNotices } from '$lib/act';
	import DisplayIcon from '$lib/components/DisplayIcon.svelte';
	import { HISTORY_PAGE_SIZE, historyDayLabel, historyUrl } from '$lib/work-history';

	let { data, form } = $props();
	const filtered = $derived(data.filters.q || data.filters.kind !== 'all' || data.filters.range !== 'all');
	const reopenAction = $derived(historyUrl(data.filters) + (historyUrl(data.filters).includes('?') ? '&' : '?') + '/reopen');
	const focusHistory = async (ok: boolean) => {
		if (ok) { await tick(); document.querySelector<HTMLElement>('h1')?.focus(); }
	};
</script>

<svelte:head><title>History · LevelUp</title></svelte:head>

<div class="page-heading"><h1 tabindex="-1">History</h1><a class="small" href="/">Back to Today</a></div>
<p class="soft small intro">A record of the work you’ve completed, in your own calendar.</p>

<section class="box" aria-labelledby="summary-heading">
	<h2 id="summary-heading">Last seven days</h2>
	<p class="small soft">Across all your tasks and habits.</p>
	<dl class="summary">
		<div><dt>Tasks finished</dt><dd>{data.summary.tasks}</dd></div>
		<div><dt>Habit check-ins</dt><dd>{data.summary.checkIns}</dd></div>
		<div><dt>Active days</dt><dd>{data.summary.activeDays}<span class="small soft"> / 7</span></dd></div>
	</dl>
</section>

<form method="GET" action="/history" class="box filters" aria-label="History filters">
	<div class="field query"><label for="history-query">Search completed work</label>
		<input id="history-query" type="search" name="q" maxlength="120" value={data.filters.q} placeholder="Task or habit name" />
	</div>
	<div class="field"><label for="history-kind">Work type</label>
		<select id="history-kind" name="kind" value={data.filters.kind}>
			<option value="all">All work</option><option value="task">Tasks only</option><option value="habit">Habits only</option>
		</select>
	</div>
	<div class="field"><label for="history-range">When</label>
		<select id="history-range" name="range" value={data.filters.range}>
			<option value="all">All time</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option>
		</select>
	</div>
	<div class="filter-actions"><button class="btn">Apply filters</button>{#if filtered}<a href="/history" class="small">Clear filters</a>{/if}</div>
</form>

{#if form && 'error' in form && form.error}<p class="bad" role="alert">{form.error}</p>{/if}
{#if form?.ok}<p class="small" role="status">Task reopened. It’s back in your task list.</p>{/if}

<section aria-labelledby="history-heading">
	<div class="spread history-heading"><h2 id="history-heading">Completed work</h2><span class="small soft" role="status">{data.total} {data.total === 1 ? 'entry' : 'entries'}</span></div>
	{#each data.entries as entry, i (entry.habitId + ':' + entry.day)}
		{#if i === 0 || entry.day !== data.entries[i - 1].day}<h3 class="day">{historyDayLabel(entry.day, data.today)}</h3>{/if}
		<article class="history-row">
			<span class="work-icon"><DisplayIcon value={entry.icon} scale={1.5} /></span>
			<div class="work">
				<a class="work-title" href="/habits/{entry.habitId}">{entry.title}</a>
				<p class="small soft">{entry.kind === 'task' ? 'Task completed' : entry.count === 1 ? '1 habit check-in' : `${entry.count} habit check-ins`}{#if entry.archivedAt !== null} · Archived{/if}</p>
			</div>
			{#if entry.kind === 'task' && entry.completedAt !== null}
				<form method="POST" action={reopenAction} use:enhance={withNotices({ then: focusHistory })}>
					<input type="hidden" name="id" value={entry.habitId} />
					<button class="btn ghost small" aria-label="Reopen {entry.title}">Reopen</button>
				</form>
			{/if}
		</article>
	{:else}
		<p class="box soft">{filtered ? 'No completed work matches these filters.' : 'Completed tasks and habit check-ins will appear here. They stay available after the day ends.'}</p>
	{/each}
	{#if data.total > 0}
		<nav class="pagination" aria-label="History pages">
			{#if data.page > 1}<a class="btn ghost small" href={historyUrl(data.filters, data.page - 1)}>Previous page</a>{:else}<span></span>{/if}
			<span class="small soft">Page {data.page} of {data.pages}</span>
			{#if data.page < data.pages}<a class="btn ghost small" href={historyUrl(data.filters, data.page + 1)}>Next page</a>{:else}<span></span>{/if}
		</nav>
		<p class="small soft">Showing {(data.page - 1) * HISTORY_PAGE_SIZE + 1}–{Math.min(data.page * HISTORY_PAGE_SIZE, data.total)} of {data.total} entries.</p>
	{/if}
	<p class="small soft correction-note">Reopening a task returns it to your list and corrects its completion record. XP progress follows the corrected total; unlocked levels and purchases stay.</p>
</section>

<style>
	.page-heading a, .filter-actions a { display: inline-flex; align-items: center; min-height: 44px; }
	.intro { margin-top: -4px; }
	h2 { margin-bottom: 8px; }
	.summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 14px 0 0; }
	.summary div { border-left: 1px solid var(--line); padding-left: 10px; }
	dt { font-size: 11px; }
	dd { margin: 4px 0 0; font: 600 32px 'Cormorant Garamond', Georgia, serif; }
	.filters { display: grid; grid-template-columns: minmax(0, 1fr) minmax(120px, 150px) minmax(120px, 150px); gap: 12px; align-items: end; }
	.field { display: grid; gap: 6px; min-width: 0; margin: 0; }
	.filters label { margin: 0; font-size: 11px; }
	.filters input, .filters select { width: 100%; min-width: 0; }
	.filter-actions { grid-column: 1 / -1; display: flex; flex-wrap: wrap; align-items: center; gap: 14px; }
	.history-heading h2 { margin: 0; }
	.day { font-size: 23px; margin: 20px 0 8px; }
	.history-row { display: grid; grid-template-columns: 28px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 12px; border: 1px solid var(--line); background: var(--paper); margin-bottom: 8px; }
	.work { min-width: 0; }
	.work-title { display: inline-block; min-height: 24px; font: 600 23px/1.1 'Cormorant Garamond', Georgia, serif; overflow-wrap: anywhere; }
	.work p { margin: 5px 0 0; }
	.pagination { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-top: 16px; }
	.correction-note { border-top: 1px solid var(--line); padding-top: 14px; }
	@media (max-width: 599px) { .filters { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } .query { grid-column: 1 / -1; } }
	@media (max-width: 359px) { .filters { grid-template-columns: minmax(0, 1fr); } }
</style>
