import { HOST_ROCK_OPTIONS, MINE_TYPE_OPTIONS, MONTH_OPTIONS } from '$lib/config/mine-fields';

const hostRockValues = new Set(HOST_ROCK_OPTIONS.map((option) => option.value));
const mineTypeValues = new Set(MINE_TYPE_OPTIONS.map((option) => option.value));
const monthValues = new Set(MONTH_OPTIONS.map((option) => option.value));

export type MineFormValues = {
	name: string | null;
	location: string | null;
	hostRock: string | null;
	mineType: string | null;
	altitudeM: number | null;
	maxDepthM: number | null;
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
};

export type MineValidationResult = {
	errors: Record<string, string>;
	values: MineFormValues;
	raw: FormData;
};

export const calculateSitePressureKpa = (altitudeM: number) => {
	const seaLevelKpa = 101.325;
	const pressure = seaLevelKpa * Math.pow(1 - 2.25577e-5 * altitudeM, 5.25588);
	return Math.round(pressure * 1000) / 1000;
};

const parseNumber = (
	formData: FormData,
	name: string,
	{
		min,
		max
	}: {
		min?: number;
		max?: number;
	} = {},
	errors: Record<string, string>
) => {
	const raw = formData.get(name);
	if (raw === null || raw === '') {
		return null;
	}

	const value = Number(raw);
	if (Number.isNaN(value)) {
		errors[name] = 'Enter a valid number';
		return null;
	}
	if (min !== undefined && value < min) {
		errors[name] = `Must be at least ${min}`;
		return null;
	}
	if (max !== undefined && value > max) {
		errors[name] = `Must be ${max} or less`;
		return null;
	}
	return value;
};

export const parseString = (
	formData: FormData,
	name: string,
	{
		required = false,
		allowed
	}: {
		required?: boolean;
		allowed?: Set<string>;
	} = {},
	errors: Record<string, string>
) => {
	const raw = formData.get(name);
	if (raw === null) {
		if (required) errors[name] = 'Required';
		return null;
	}
	const value = String(raw).trim();
	if (!value) {
		if (required) errors[name] = 'Required';
		return null;
	}
	if (allowed && !allowed.has(value)) {
		errors[name] = 'Select a valid option';
		return null;
	}
	return value;
};

export const parseMineForm = async (request: Request): Promise<MineValidationResult> => {
	const formData = await request.formData();
	const errors: Record<string, string> = {};

	const name = parseString(formData, 'name', { required: true }, errors);
	const location = parseString(formData, 'location', {}, errors);
	const hostRock = parseString(formData, 'hostRock', { allowed: hostRockValues }, errors);
	const mineType = parseString(formData, 'mineType', { allowed: mineTypeValues }, errors);
	const altitudeM = parseNumber(formData, 'altitudeM', { min: -500, max: 6500 }, errors);
	const maxDepthM = parseNumber(formData, 'maxDepthM', { min: 0 }, errors);

	const dailyMaxDryBulbC = parseNumber(formData, 'dailyMaxDryBulbC', { min: -60, max: 80 }, errors);
	const dailyMinDryBulbC = parseNumber(formData, 'dailyMinDryBulbC', { min: -80, max: 60 }, errors);
	const dailyMaxWetBulbC = parseNumber(formData, 'dailyMaxWetBulbC', { min: -60, max: 60 }, errors);
	const dailyMinWetBulbC = parseNumber(formData, 'dailyMinWetBulbC', { min: -80, max: 40 }, errors);
	const dailyRelativeHumidityPct = parseNumber(
		formData,
		'dailyRelativeHumidityPct',
		{ min: 0, max: 100 },
		errors
	);

	const hottestMonth = parseString(formData, 'hottestMonth', { allowed: monthValues }, errors);
	const hottestMonthMaxDryBulbC = parseNumber(
		formData,
		'hottestMonthMaxDryBulbC',
		{ min: -60, max: 80 },
		errors
	);
	const hottestMonthMinDryBulbC = parseNumber(
		formData,
		'hottestMonthMinDryBulbC',
		{ min: -80, max: 60 },
		errors
	);
	const hottestMonthMaxWetBulbC = parseNumber(
		formData,
		'hottestMonthMaxWetBulbC',
		{ min: -60, max: 60 },
		errors
	);
	const hottestMonthMinWetBulbC = parseNumber(
		formData,
		'hottestMonthMinWetBulbC',
		{ min: -80, max: 40 },
		errors
	);
	const hottestMonthRelativeHumidityPct = parseNumber(
		formData,
		'hottestMonthRelativeHumidityPct',
		{ min: 0, max: 100 },
		errors
	);

	return {
		raw: formData,
		errors,
		values: {
			name,
			location,
			hostRock,
			mineType,
			altitudeM,
			maxDepthM,
			dailyMaxDryBulbC,
			dailyMinDryBulbC,
			dailyMaxWetBulbC,
			dailyMinWetBulbC,
			dailyRelativeHumidityPct,
			hottestMonth,
			hottestMonthMaxDryBulbC,
			hottestMonthMinDryBulbC,
			hottestMonthMaxWetBulbC,
			hottestMonthMinWetBulbC,
			hottestMonthRelativeHumidityPct
		}
	};
};
