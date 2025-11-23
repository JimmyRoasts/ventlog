import { json, error } from '@sveltejs/kit';
import { prisma } from '$lib/db/prisma';

const parseBody = async (request: Request) => {
	const data = await request.json().catch(() => ({}));
	return data as Record<string, unknown>;
};

const cleanString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const optionalString = (value: unknown) => {
	const v = cleanString(value);
	return v === '' ? null : v;
};
const optionalNumber = (value: unknown) => {
	if (value === null || value === undefined || value === '') return null;
	const num = typeof value === 'number' ? value : Number(value);
	return Number.isNaN(num) ? null : num;
};

export const GET = async ({ params }) => {
	const point = await prisma.node.findUnique({
		where: { id: params.id },
		include: { _count: { select: { readings: true } } }
	});
	if (!point) throw error(404, 'Survey point not found');
	return json(point);
};

export const PATCH = async ({ params, request }) => {
	const existing = await prisma.node.findUnique({ where: { id: params.id } });
	if (!existing) throw error(404, 'Survey point not found');

	const body = await parseBody(request);
	const errors: Record<string, string> = {};

	const name = cleanString(body.name);
	const code = optionalString(body.code);
	const levelName = optionalString(body.levelName);
	const levelElevationM = optionalNumber(body.levelElevationM);
	const description = optionalString(body.description);
	const isActive = body.isActive === undefined ? undefined : Boolean(body.isActive);

	if (!name) errors.name = 'Name is required';
	if (body.levelElevationM !== undefined && levelElevationM === null) {
		errors.levelElevationM = 'Must be a number';
	}

	if (Object.keys(errors).length > 0) {
		return json({ message: 'Validation failed', errors }, { status: 400 });
	}

	const updated = await prisma.node.update({
		where: { id: params.id },
		data: {
			name,
			code,
			levelName,
			levelElevationM,
			description,
			isActive
		}
	});

	return json(updated);
};

export const DELETE = async ({ params }) => {
	try {
		await prisma.node.delete({ where: { id: params.id } });
		return json({ ok: true });
	} catch (err) {
		return json({ message: 'Could not delete survey point.' }, { status: 400 });
	}
};
