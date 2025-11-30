import { get } from 'svelte/store';
import { createSortableCollection } from '$lib/stores/createSortableCollection';
import type { Survey } from '$lib/types/Survey';
import * as api from '$lib/api';

const comparator = (a: Survey, b: Survey, sortBy: keyof Survey, direction: 'asc' | 'desc') => {
	if (sortBy === 'surveyDatetime') {
		const aDate = new Date(a.surveyDatetime as unknown as string).getTime();
		const bDate = new Date(b.surveyDatetime as unknown as string).getTime();
		return direction === 'asc' ? aDate - bDate : bDate - aDate;
	}

	// Fall back to default behavior provided by createSortableCollection
	const aValue = a[sortBy];
	const bValue = b[sortBy];

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

export function createSurveyCollection(initialSurveys: Survey[] = []) {
	const collection = createSortableCollection<Survey>(initialSurveys, {
		initialSort: { by: 'surveyDatetime', direction: 'desc' },
		comparator
	});

	return {
		subscribe: collection.subscribe,
		surveys: collection.source,
		sortState: collection.sortState,
		setSurveys: (next: Survey[]) => collection.setItems(next),
		setSort: (key: keyof Survey) => collection.setSort(key),

		async loadSurveys() {
			const response = await api.get('api/surveys');
			collection.setItems(response);
			return response as Survey[];
		},

		async createSurvey(payload: Omit<Survey, 'id' | 'createdAt' | '_count' | 'mine'>) {
			const created = await api.post('api/surveys', payload);
			collection.setItems([...get(collection.source), created]);
			return created as Survey;
		},

		async updateSurvey(id: string, payload: Partial<Survey>) {
			const updated = await api.patch(`api/surveys/${id}`, payload);
			const items = get(collection.source);
			collection.setItems(items.map((survey) => (survey.id === id ? updated : survey)));
			return updated as Survey;
		},

		async deleteSurvey(id: string) {
			await api.del(`api/surveys/${id}`);
			collection.setItems(get(collection.source).filter((survey) => survey.id !== id));
		}
	};
}
