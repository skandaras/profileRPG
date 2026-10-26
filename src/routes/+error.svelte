<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head><title>Oops · LevelUp</title></svelte:head>

<section class="box">
	<h1>{page.status === 404 ? 'Nothing here' : 'Something went wrong'}</h1>
	<p>{page.error?.message ?? 'Unknown error'}</p>
	<a class="btn" href="/">Back home</a>
</section>
