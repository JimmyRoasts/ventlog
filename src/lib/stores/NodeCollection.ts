import { get } from 'svelte/store';
import { createSortableCollection } from '$lib/stores/createSortableCollection';
import type { Node } from '$lib/types/Node';
import * as api from '$lib/api';

export function createNodeCollection(initialNodes: Node[] = []) {
	const collection = createSortableCollection<Node>(initialNodes, {
		initialSort: { by: 'name', direction: 'asc' }
	});

	return {
		subscribe: collection.subscribe,
		nodes: collection.source,
		sortState: collection.sortState,
		setNodes: (next: Node[]) => collection.setItems(next),
		setSort: (key: keyof Node) => collection.setSort(key),

		async loadNodes(mineId?: string) {
			const qs = mineId ? `?mineId=${encodeURIComponent(mineId)}` : '';
			const response = await api.get(`api/survey-points${qs}`);
			collection.setItems(response);
			return response as Node[];
		},

		async createNode(payload: Omit<Node, 'id' | 'createdAt' | '_count'>) {
			const created = await api.post('api/survey-points', payload);
			collection.setItems([...get(collection.source), created]);
			return created as Node;
		},

		async updateNode(id: string, payload: Partial<Node>) {
			const updated = await api.patch(`api/survey-points/${id}`, payload);
			const items = get(collection.source);
			collection.setItems(items.map((node) => (node.id === id ? updated : node)));
			return updated as Node;
		},

		async deleteNode(id: string) {
			await api.del(`api/survey-points/${id}`);
			collection.setItems(get(collection.source).filter((node) => node.id !== id));
		}
	};
}
