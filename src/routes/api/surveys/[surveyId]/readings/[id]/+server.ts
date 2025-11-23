import { prisma } from '$lib/db/prisma';
import { error, json } from '@sveltejs/kit';

const parseBody = async (request: Request) => {
	const data = await request.json().catch(() => ({}));
	return data as Record<string, unknown>;
};

const cleanString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const optionalNumber = (value: unknown) => {
	if (value === null || value === undefined || value === '') return null;
	const num = typeof value === 'number' ? value : Number(value);
	return Number.isNaN(num) ? null : num;
};

export const PATCH = async ({ params, request }) => {
	const reading = await prisma.surveyReading.findUnique({ where: { id: params.id } });
	if (!reading || reading.surveyId !== params.surveyId) {
		throw error(404, 'Reading not found');
	}

	const body = await parseBody(request);
	const errors: Record<string, string> = {};

	const nodeId = cleanString(body.nodeId);
	const readingIndex = optionalNumber(body.readingIndex);
	const dryBulbC = optionalNumber(body.dryBulbC);
	const wetBulbC = optionalNumber(body.wetBulbC);
	const relativeHumidityPct = optionalNumber(body.relativeHumidityPct);
	const airVelocityMs = optionalNumber(body.airVelocityMs);
	const staticPressurePa = optionalNumber(body.staticPressurePa);
	const barometricPressureKpa = optionalNumber(body.barometricPressureKpa);
	const instrumentId = cleanString(body.instrumentId) || null;
	const remarks = cleanString(body.remarks) || null;

	if (!nodeId) errors.nodeId = 'Node is required';
	if (dryBulbC === null) errors.dryBulbC = 'Dry bulb is required';
	if (wetBulbC === null && relativeHumidityPct === null) {
		errors.wetBulbC = 'Provide wet bulb or RH';
		errors.relativeHumidityPct = 'Provide wet bulb or RH';
	}

	if (Object.keys(errors).length > 0) {
		return json({ message: 'Validation failed', errors }, { status: 400 });
	}

	try {
		const updated = await prisma.surveyReading.update({
			where: { id: params.id },
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
		return json(updated);
	} catch (err) {
		console.error('Failed to update reading', err);
		return json({ message: 'Could not update reading' }, { status: 400 });
	}
};

export const DELETE = async ({ params }) => {
	try {
		await prisma.surveyReading.delete({ where: { id: params.id } });
		return json({ ok: true });
	} catch (err) {
		console.error('Failed to delete reading', err);
		return json({ message: 'Could not delete reading' }, { status: 400 });
	}
};
