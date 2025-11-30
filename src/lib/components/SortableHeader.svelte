<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { Readable } from 'svelte/store';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import type { SortDirection } from '$lib/stores/createSortableCollection';

	type SortState = { by: string | null; direction: SortDirection };

	const { label, sortKey, sortState, onSort } = $props<{
		label: string;
		sortKey: string;
		sortState: Readable<SortState>;
		onSort: (key: string) => void;
	}>();

  const currentSortState = $derived(sortState);
  const isActive = $derived(currentSortState.by === sortKey);
  const icon = $derived(
    isActive ? (currentSortState.direction === 'asc' ? ChevronUp : ChevronDown) : null
  );

	const handleClick = () => onSort(sortKey);
</script>

<Button variant="ghost" size="sm" onclick={handleClick} class="gap-1">
	<span>{label}</span>
{#if icon}
	<icon class="h-4 w-4"></icon>
{/if}
</Button>
