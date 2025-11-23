import { prisma } from '$lib/db/prisma';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const parseString = (formData: FormData, key: string) => {
	const value = formData.get(key);
	return typeof value === 'string' ? value.trim() : '';
};

const parseOptionalString = (formData: FormData, key: string) => {
	const value = parseString(formData, key);
	return value === '' ? null : value;
};

const parseOptionalNumber = (formData: FormData, key: string, errors: Record<string, string>) => {
	const raw = parseString(formData, key);
	if (raw === '') return null;
	const parsed = Number(raw);
	if (Number.isNaN(parsed)) {
		errors[key] = 'Must be a number';
		return null;
	}
	return parsed;
};

export const load: PageServerLoad = async ({ params }) => {
	const mineId = params.mineId;
	const mine = await prisma.mine.findUnique({
		where: { id: mineId },
		include: {
			nodes: {
				orderBy: { name: 'asc' }
			},
			_count: { select: { nodes: true } }
		}
	});

	if (!mine) {
		throw error(404, 'Mine not found');
	}

	return { mine };
};

export const actions: Actions = {
	create: async ({ request, params }) => {
		const formData = await request.formData();
		const errors: Record<string, string> = {};
		const name = parseString(formData, 'name');

		if (!name) {
			errors.name = 'Name is required';
			return fail(400, { message: 'Name is required', errors });
		}

		const code = parseOptionalString(formData, 'code');
		const levelName = parseOptionalString(formData, 'levelName');
		const levelElevationM = parseOptionalNumber(formData, 'levelElevationM', errors);
		const description = parseOptionalString(formData, 'description');
		const isActive = formData.get('isActive') === 'on';

		if (Object.keys(errors).length > 0) {
			return fail(400, { message: 'Please fix the highlighted fields.', errors });
		}

		try {
			await prisma.node.create({
				data: {
					name,
					code,
					levelName,
					levelElevationM,
					description,
					isActive,
					mineId: params.mineId
				}
			});
		} catch (err) {
			console.error('Failed to create node', err);
			return fail(400, { message: 'Could not create node. Please try again.' });
		}

		return { success: true };
	},
	update: async ({ request }) => {
		const formData = await request.formData();
		const errors: Record<string, string> = {};
		const id = parseString(formData, 'id');
		const name = parseString(formData, 'name');

		if (!id) {
			errors.id = 'Missing node ID';
		}
		if (!name) {
			errors.name = 'Name is required';
		}

		const code = parseOptionalString(formData, 'code');
		const levelName = parseOptionalString(formData, 'levelName');
		const levelElevationM = parseOptionalNumber(formData, 'levelElevationM', errors);
		const description = parseOptionalString(formData, 'description');
		const isActive = formData.get('isActive') === 'on';

		if (Object.keys(errors).length > 0) {
			return fail(400, { message: 'Please fix the highlighted fields.', errors });
		}

		try {
			await prisma.node.update({
				where: { id },
				data: {
					name,
					code,
					levelName,
					levelElevationM,
					description,
					isActive
				}
			});
		} catch (err) {
			console.error('Failed to update node', err);
			return fail(400, { message: 'Could not update node. Please try again.', errors });
		}

		return { success: true };
	},
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = parseString(formData, 'id');

		if (!id) {
			return fail(400, { message: 'Missing node ID.' });
		}

		try {
			await prisma.node.delete({ where: { id } });
		} catch (err) {
			console.error('Failed to delete node', err);
			return fail(400, { message: 'Could not delete node. Please try again.' });
		}

		return { success: true };
	}
};
