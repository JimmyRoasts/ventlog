export interface Survey {
	id: string;
	mineId: string;
	surveyDatetime: string | Date;
	title: string | null;
	notes: string | null;
	createdAt?: Date | string;
	mine?: {
		id: string;
		name: string;
	};
	_count?: {
		readings: number;
	};
}
