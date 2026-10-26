<script lang="ts">
	import { enhance } from '$app/forms';
	import { withNotices } from '$lib/act';
	import type { AvatarConfig } from '$lib/content/types';
	import AvatarEditor from '$lib/components/AvatarEditor.svelte';

	let { data } = $props();
	// svelte-ignore state_referenced_locally
	let avatar = $state<AvatarConfig>(structuredClone(data.avatar));
	const changed = $derived(JSON.stringify(avatar) !== JSON.stringify(data.avatar));
</script>

<svelte:head><title>Wardrobe · LevelUp</title></svelte:head>

<p><a href="/me" class="small">← Me</a></p>
<h1>Wardrobe</h1>

<section class="box">
	<AvatarEditor bind:avatar level={data.level} owned={data.owned} />
	<form method="POST" action="?/save" use:enhance={withNotices()} class="save">
		<input type="hidden" name="avatar" value={JSON.stringify(avatar)} />
		<button class="btn wide" disabled={!changed}>{changed ? 'Save this look' : 'Saved'}</button>
	</form>
</section>

<style>
	.save {
		margin-top: 16px;
	}
</style>
