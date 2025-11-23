import { prisma } from '$lib/db/prisma';
import { error, json, redirect } from '@sveltejs/kit';

const parseBody = async (request: Request) => {
	const data = await request.json().catch(() => ({}));
	return data as Record<string, unknown>;
};

const cleanString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

export const GET = async () => {
	const surveys = await prisma.survey.findMany({
		orderBy: { surveyDatetime: 'desc' },
		include: { mine: { select: { id: true, name: true } }, _count: { select: { readings: true } } }
	});
	return json(surveys);
};

export const POST = async ({ request }) => {
	const body = await parseBody(request);
	const errors: Record<string, string> = {};

	const mineId = cleanString(body.mineId);
	const surveyDatetime = cleanString(body.surveyDatetime);
	const title = cleanString(body.title) || null;
	const notes = cleanString(body.notes) || null;

	if (!mineId) errors.mineId = 'Mine is required';
	if (!surveyDatetime) errors.surveyDatetime = 'Date/time is required';

	if (Object.keys(errors).length > 0) {
		return json({ message: 'Validation failed', errors }, { status: 400 });
	}

	try {
		const created = await prisma.survey.create({
			data: {
				mineId,
				title,
				notes,
				surveyDatetime: new Date(surveyDatetime)
			},
			select: { id: true }
		});
		return json({ id: created.id }, { status: 201 });
	} catch (err) {
		console.error('Failed to create survey', err);
		return json({ message: 'Could not create survey' }, { status: 400 });
	}
};
