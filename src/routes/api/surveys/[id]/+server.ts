import { prisma } from '$lib/db/prisma';
import { error, json } from '@sveltejs/kit';

const parseBody = async (request: Request) => {
	const data = await request.json().catch(() => ({}));
	return data as Record<string, unknown>;
};

const cleanString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

export const GET = async ({ params }) => {
	const survey = await prisma.survey.findUnique({
		where: { id: params.id },
		include: {
			mine: { select: { id: true, name: true } },
			readings: { include: { node: { select: { id: true, name: true, code: true } } } }
		}
	});
	if (!survey) throw error(404, 'Survey not found');
	return json(survey);
};

export const PATCH = async ({ request, params }) => {
	const existing = await prisma.survey.findUnique({ where: { id: params.id } });
	if (!existing) throw error(404, 'Survey not found');

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
		const updated = await prisma.survey.update({
			where: { id: params.id },
			data: {
				mineId,
				title,
				notes,
				surveyDatetime: new Date(surveyDatetime)
			}
		});
		return json(updated);
	} catch (err) {
		console.error('Failed to update survey', err);
		return json({ message: 'Could not update survey' }, { status: 400 });
	}
};

export const DELETE = async ({ params }) => {
	try {
		await prisma.$transaction(async (tx) => {
			await tx.surveyReading.deleteMany({ where: { surveyId: params.id } });
			await tx.survey.delete({ where: { id: params.id } });
		});
		return json({ ok: true });
	} catch (err) {
		console.error('Failed to delete survey', err);
		return json({ message: 'Could not delete survey' }, { status: 400 });
	}
};
