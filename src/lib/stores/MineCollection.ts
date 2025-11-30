import { get } from 'svelte/store';
import { createSortableCollection } from '$lib/stores/createSortableCollection';
import type { Mine } from '$lib/types/Mine';
import * as api from '$lib/api'; // Import the API client

export function createMineCollection(initialMines: Mine[] = []) {
	const collection = createSortableCollection<Mine>(initialMines, {
		initialSort: { by: 'name', direction: 'asc' }
	});

	return {
		subscribe: collection.subscribe,
		mines: collection.source,
		sortState: collection.sortState,
		setMines: (newMines: Mine[]) => collection.setItems(newMines),
		setSort: (newSortBy: keyof Mine) => collection.setSort(newSortBy),

		loadMinesFromApi: async () => {
			try {
				const response = await api.get('api/mines');
				collection.setItems(response.mines);
			} catch (error) {
				console.error('Failed to load mines:', error);
				throw error;
			}
		},

		createMine: async (mineData: Omit<Mine, 'id' | 'createdAt' | 'companyId' | '_count'>) => {
			try {
				const newMine = await api.post('api/mines', mineData);
				collection.setItems([...getCurrentItems(), newMine]);
				return newMine;
			} catch (error) {
				console.error('Failed to create mine:', error);
				throw error;
			}
		},

		updateMine: async (mineId: string, mineData: Partial<Mine>) => {
			try {
				const updatedMine = await api.put(`api/mines/${mineId}`, mineData);
				const items = getCurrentItems();
				collection.setItems(items.map((mine) => (mine.id === updatedMine.id ? updatedMine : mine)));
				return updatedMine;
			} catch (error) {
				console.error('Failed to update mine:', error);
				throw error;
			}
		},

		deleteMine: async (mineId: string) => {
			try {
				await api.del(`api/mines/${mineId}`);
				const items = getCurrentItems();
				collection.setItems(items.filter((m) => m.id !== mineId));
			} catch (error) {
				console.error('Failed to delete mine:', error);
				throw error;
			}
		}
	};

	function getCurrentItems() {
		return get(collection.source);
	}
}
