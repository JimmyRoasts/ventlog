import { prisma } from '$lib/db/prisma';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { mines } = await parent();

	const surveys = await prisma.survey.findMany({
		orderBy: { surveyDatetime: 'desc' },
		include: {
			mine: { select: { name: true, id: true } },
			createdBy: { select: { fullName: true } }
		}
	});

	const nodes = await prisma.node.findMany({
		select: { id: true, name: true, mineId: true, isActive: true, code: true },
		orderBy: { name: 'asc' }
	});

	return { mines, surveys, nodes };
};

const parseString = (formData: FormData, key: string) => {
	const value = formData.get(key);
	return typeof value === 'string' ? value.trim() : '';
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const errors: Record<string, string> = {};
		const mineId = parseString(formData, 'mineId');
		const surveyDatetime = parseString(formData, 'surveyDatetime');
		const title = parseString(formData, 'title') || null;
		const notes = parseString(formData, 'notes') || null;

		if (!mineId) errors.mineId = 'Mine is required';
		if (!surveyDatetime) errors.surveyDatetime = 'Date/time is required';

		if (Object.keys(errors).length > 0) {
			return fail(400, { message: 'Please fix the highlighted fields.', errors });
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
			throw redirect(303, `/app/surveys/${created.id}`);
		} catch (err) {
			console.error('Failed to create survey', err);
			return fail(400, { message: 'Could not create survey. Please try again.' });
		}
	}
};
