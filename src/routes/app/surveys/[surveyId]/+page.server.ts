import { prisma } from '$lib/db/prisma';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const parseString = (
	formData: FormData,
	key: string,
	required = false,
	errors?: Record<string, string>
) => {
	const value = formData.get(key);
	const str = typeof value === 'string' ? value.trim() : '';
	if (required && !str) {
		errors && (errors[key] = 'Required');
	}
	return str;
};

const parseNumber = (
	formData: FormData,
	key: string,
	errors: Record<string, string>,
	options?: { required?: boolean }
) => {
	const raw = parseString(formData, key);
	if (raw === '') {
		if (options?.required) errors[key] = 'Required';
		return null;
	}
	const num = Number(raw);
	if (Number.isNaN(num)) {
		errors[key] = 'Must be a number';
		return null;
	}
	return num;
};

export const load: PageServerLoad = async ({ params, parent }) => {
	const { mines } = await parent();
	const survey = await prisma.survey.findUnique({
		where: { id: params.surveyId },
		include: {
			mine: { select: { id: true, name: true } },
			readings: {
				orderBy: { readingIndex: 'asc' },
				include: { node: { select: { id: true, name: true, code: true, mineId: true } } }
			}
		}
	});

	if (!survey) {
		throw error(404, 'Survey not found');
	}

	const nodes = await prisma.node.findMany({
		select: { id: true, name: true, code: true, mineId: true, isActive: true },
		orderBy: { name: 'asc' }
	});

	return { survey, mines, nodes };
};

export const actions: Actions = {
	deleteSurvey: async ({ params }) => {
		try {
			await prisma.$transaction([
				prisma.surveyReading.deleteMany({ where: { surveyId: params.surveyId } }),
				prisma.survey.delete({ where: { id: params.surveyId } })
			]);
		} catch (err) {
			console.error('Failed to delete survey', err);
			return fail(400, { message: 'Could not delete survey. Remove readings and try again.' });
		}

		return redirect(303, '/app/surveys');
	},
	updateSurvey: async ({ request, params }) => {
		const formData = await request.formData();
		const errors: Record<string, string> = {};
		const mineId = parseString(formData, 'mineId', true, errors);
		const surveyDatetime = parseString(formData, 'surveyDatetime', true, errors);
		const title = parseString(formData, 'title') || null;
		const notes = parseString(formData, 'notes') || null;

		if (Object.keys(errors).length > 0) {
			return fail(400, { message: 'Please fix the highlighted fields.', errors });
		}

		try {
			await prisma.survey.update({
				where: { id: params.surveyId },
				data: {
					mineId,
					title,
					notes,
					surveyDatetime: new Date(surveyDatetime)
				}
			});
		} catch (err) {
			console.error('Failed to update survey', err);
			return fail(400, { message: 'Could not update survey. Please try again.' });
		}

		return { success: true };
	},
	createReading: async ({ request, params }) => {
		const formData = await request.formData();
		const errors: Record<string, string> = {};
		const nodeId = parseString(formData, 'nodeId', true, errors);
		const readingIndexInput = parseNumber(formData, 'readingIndex', errors, { required: false });
		const dryBulbC = parseNumber(formData, 'dryBulbC', errors, { required: true });
		const wetBulbC = parseNumber(formData, 'wetBulbC', errors);
		const relativeHumidityPct = parseNumber(formData, 'relativeHumidityPct', errors);
		const airVelocityMs = parseNumber(formData, 'airVelocityMs', errors);
		const staticPressurePa = parseNumber(formData, 'staticPressurePa', errors);
		const barometricPressureKpa = parseNumber(formData, 'barometricPressureKpa', errors);
		const instrumentId = parseString(formData, 'instrumentId') || null;
		const remarks = parseString(formData, 'remarks') || null;

		if (wetBulbC == null && relativeHumidityPct == null) {
			errors.relativeHumidityPct = 'Provide wet bulb or RH';
			errors.wetBulbC = errors.wetBulbC || 'Provide wet bulb or RH';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, { message: 'Please fix the highlighted fields.', errors });
		}

		let readingIndex = readingIndexInput;
		if (readingIndex === null) {
			const last = await prisma.surveyReading.findFirst({
				where: { surveyId: params.surveyId, nodeId },
				orderBy: { readingIndex: 'desc' },
				select: { readingIndex: true }
			});
			readingIndex = (last?.readingIndex ?? 0) + 1;
		}

		try {
			await prisma.surveyReading.create({
				data: {
					surveyId: params.surveyId,
					nodeId,
					readingIndex,
					dryBulbC: dryBulbC ?? 0,
					wetBulbC,
					relativeHumidityPct,
					airVelocityMs,
					staticPressurePa,
					barometricPressureKpa,
					instrumentId,
					remarks
				}
			});
		} catch (err) {
			console.error('Failed to create reading', err);
			return fail(400, { message: 'Could not create reading. Check duplicates or try again.' });
		}

		return { success: true };
	},
	updateReading: async ({ request }) => {
		const formData = await request.formData();
		const errors: Record<string, string> = {};
		const id = parseString(formData, 'id', true, errors);
		const nodeId = parseString(formData, 'nodeId', true, errors);
		const readingIndex = parseNumber(formData, 'readingIndex', errors, { required: true });
		const dryBulbC = parseNumber(formData, 'dryBulbC', errors, { required: true });
		const wetBulbC = parseNumber(formData, 'wetBulbC', errors);
		const relativeHumidityPct = parseNumber(formData, 'relativeHumidityPct', errors);
		const airVelocityMs = parseNumber(formData, 'airVelocityMs', errors);
		const staticPressurePa = parseNumber(formData, 'staticPressurePa', errors);
		const barometricPressureKpa = parseNumber(formData, 'barometricPressureKpa', errors);
		const instrumentId = parseString(formData, 'instrumentId') || null;
		const remarks = parseString(formData, 'remarks') || null;

		if (wetBulbC == null && relativeHumidityPct == null) {
			errors.relativeHumidityPct = 'Provide wet bulb or RH';
			errors.wetBulbC = errors.wetBulbC || 'Provide wet bulb or RH';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, { message: 'Please fix the highlighted fields.', errors });
		}

		try {
			await prisma.surveyReading.update({
				where: { id },
				data: {
					nodeId,
					readingIndex: readingIndex ?? undefined,
					dryBulbC: dryBulbC ?? undefined,
					wetBulbC,
					relativeHumidityPct,
					airVelocityMs,
					staticPressurePa,
					barometricPressureKpa,
					instrumentId,
					remarks
				}
			});
		} catch (err) {
			console.error('Failed to update reading', err);
			return fail(400, { message: 'Could not update reading. Check duplicates or try again.' });
		}

		return { success: true };
	},
	deleteReading: async ({ request }) => {
		const formData = await request.formData();
		const id = parseString(formData, 'id', true);

		if (!id) {
			return fail(400, { message: 'Reading ID is required.' });
		}

		try {
			await prisma.surveyReading.delete({ where: { id } });
		} catch (err) {
			console.error('Failed to delete reading', err);
			return fail(400, { message: 'Could not delete reading. Please try again.' });
		}

		return { success: true };
	},
	deleteReadings: async ({ request, params }) => {
		const formData = await request.formData();
		const ids = formData.getAll('readingIds').filter((v): v is string => typeof v === 'string');

		if (ids.length === 0) {
			return fail(400, { message: 'Select at least one reading to delete.' });
		}

		try {
			await prisma.surveyReading.deleteMany({
				where: { id: { in: ids }, surveyId: params.surveyId }
			});
		} catch (err) {
			console.error('Failed to delete readings', err);
			return fail(400, { message: 'Could not delete readings. Please try again.' });
		}

		return { success: true };
	}
};
