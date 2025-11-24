<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let {
		label,
		forId,
		error,
		class: className,
		children
	}: { label: string; forId: string; error?: string; class?: string; children?: Snippet } = $props();
</script>

<div class={cn('space-y-2', className)}>
	<label class="text-sm font-medium text-foreground" for={forId}>{label}</label>
	{@render children?.()}
	{#if error}
		<p class="text-xs text-destructive">{error}</p>
	{/if}
</div>
