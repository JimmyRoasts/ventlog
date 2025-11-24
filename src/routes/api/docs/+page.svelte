<script lang="ts">
	import { onMount } from 'svelte';

	// This will be our mount point
	let container: HTMLElement | null = null;

	onMount(async () => {
		console.log('docs onMount, container =', container);
		if (!container) return;

		try {
			// Dynamically import swagger-ui-dist *only* in the browser to avoid SSR issues
			const [{ SwaggerUIBundle }] = await Promise.all([
				import('swagger-ui-dist'),
				import('swagger-ui-dist/swagger-ui.css')
			]);

			const ui = SwaggerUIBundle({
				domNode: container,
				url: '/openapi.json'
			});

			console.log('Swagger UI initialised', ui);
		} catch (err) {
			console.error('Swagger UI init failed', err);
		}
	});
</script>

<svelte:head>
	<title>API documentation | Ventlog</title>
</svelte:head>

<section class="space-y-4">
	<h1 class="text-2xl font-semibold tracking-tight">API documentation</h1>
	<p class="text-sm text-muted-foreground">
		Interactive OpenAPI / Swagger documentation for the Ventlog API.
	</p>

	<div class="mt-6">
		<!-- Swagger UI mounts here -->
		<div bind:this={container}></div>
	</div>
</section>

<style>
	:global(.swagger-ui) {
		font-size: 14px;
	}
</style>
