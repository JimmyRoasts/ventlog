export interface Mine {
	id: string;
	name: string;
	location: string | null;
	maxDepthM: number | null;
	hostRock: string | null;
	mineType: string | null;
	altitudeM: number | null;
	sitePressureKpa: number | null;
	dailyMaxDryBulbC: number | null;
	dailyMinDryBulbC: number | null;
	dailyMaxWetBulbC: number | null;
	dailyMinWetBulbC: number | null;
	dailyRelativeHumidityPct: number | null;
	hottestMonth: string | null;
	hottestMonthMaxDryBulbC: number | null;
	hottestMonthMinDryBulbC: number | null;
	hottestMonthMaxWetBulbC: number | null;
	hottestMonthMinWetBulbC: number | null;
	hottestMonthRelativeHumidityPct: number | null;
	companyId: string;
	createdAt: Date | string; // DateTime from Prisma maps to string in TypeScript by default
	_count?: {
		// Add this property
		nodes: number;
		surveys: number;
	};
}
