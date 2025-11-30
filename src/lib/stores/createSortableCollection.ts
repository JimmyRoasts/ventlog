import { derived, writable } from 'svelte/store';

export type SortDirection = 'asc' | 'desc';

type SortKey<T> = keyof T | null;

type SortConfig<T> = {
	initialSort?: {
		by: SortKey<T>;
		direction?: SortDirection;
	};
	comparator?: (a: T, b: T, sortBy: keyof T, direction: SortDirection) => number;
};

const defaultComparator = <T>(a: T, b: T, sortBy: keyof T, direction: SortDirection) => {
	const aValue = a[sortBy];
	const bValue = b[sortBy];

	// Place missing values last
	if (aValue === null || aValue === undefined) return direction === 'asc' ? 1 : -1;
	if (bValue === null || bValue === undefined) return direction === 'asc' ? -1 : 1;

	if (typeof aValue === 'string' && typeof bValue === 'string') {
		return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
	}

	if (typeof aValue === 'number' && typeof bValue === 'number') {
		return direction === 'asc' ? aValue - bValue : bValue - aValue;
	}

	return 0;
};

export function createSortableCollection<T>(items: T[] = [], config: SortConfig<T> = {}) {
	const sortBy = writable<SortKey<T>>(config.initialSort?.by ?? null);
	const sortDirection = writable<SortDirection>(config.initialSort?.direction ?? 'asc');
	const source = writable<T[]>(items);

	const sortState = derived([sortBy, sortDirection], ([$sortBy, $sortDirection]) => ({
		by: $sortBy,
		direction: $sortDirection
	}));

	const sorted = derived([source, sortState], ([$items, $sortState]) => {
		if (!$sortState.by) return $items;
		const comparator = config.comparator ?? defaultComparator<T>;
		return [...$items].sort((a, b) =>
			comparator(a, b, $sortState.by as keyof T, $sortState.direction)
		);
	});

	return {
		subscribe: sorted.subscribe,
		source,
		sortState,
		setItems: (next: T[]) => source.set(next),
		setSort: (key: SortKey<T>) => {
			sortBy.update((current) => {
				if (!key) return current;
				if (current === key) {
					sortDirection.update((dir) => (dir === 'asc' ? 'desc' : 'asc'));
				} else {
					sortDirection.set('asc');
				}
				return key;
			});
		}
	};
}
