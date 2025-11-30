export interface Node {
	id: string;
	mineId: string;
	name: string;
	code: string | null;
	levelName: string | null;
	levelElevationM: number | null;
	description: string | null;
	isActive: boolean;
	createdAt?: Date | string;
	_count?: {
		readings: number;
	};
}
