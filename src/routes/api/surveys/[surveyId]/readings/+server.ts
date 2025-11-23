import { prisma } from '$lib/db/prisma';
import { json } from '@sveltejs/kit';

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

export const GET = async ({ params }) => {
	const readings = await prisma.surveyReading.findMany({
		where: { surveyId: params.surveyId },
		orderBy: { readingIndex: 'asc' },
		include: { node: { select: { id: true, name: true, code: true } } }
	});
	return json(readings);
};

export const POST = async ({ request, params }) => {
	const body = await parseBody(request);
	const errors: Record<string, string> = {};

	const nodeId = cleanString(body.nodeId);
	const readingIndexInput = optionalNumber(body.readingIndex);
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
		const created = await prisma.surveyReading.create({
			data: {
				surveyId: params.surveyId,
				nodeId,
				readingIndex,
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
		return json(created, { status: 201 });
	} catch (err) {
		console.error('Failed to create reading', err);
		return json({ message: 'Could not create reading' }, { status: 400 });
	}
};
