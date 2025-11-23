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

export const GET = async ({ url }) => {
	const mineId = url.searchParams.get('mineId') || undefined;
	const points = await prisma.node.findMany({
		where: mineId ? { mineId } : undefined,
		orderBy: { name: 'asc' },
		include: { _count: { select: { readings: true } } }
	});
	return json(points);
};

export const POST = async ({ request }) => {
	const body = await parseBody(request);
	const errors: Record<string, string> = {};

	const mineId = cleanString(body.mineId);
	const name = cleanString(body.name);
	const code = optionalString(body.code);
	const levelName = optionalString(body.levelName);
	const levelElevationM = optionalNumber(body.levelElevationM);
	const description = optionalString(body.description);
	const isActive = Boolean(body.isActive ?? true);

	if (!mineId) errors.mineId = 'Mine is required';
	if (!name) errors.name = 'Name is required';
	if (body.levelElevationM !== undefined && levelElevationM === null) {
		errors.levelElevationM = 'Must be a number';
	}

	if (Object.keys(errors).length > 0) {
		return json({ message: 'Validation failed', errors }, { status: 400 });
	}

	const created = await prisma.node.create({
		data: {
			mineId,
			name,
			code,
			levelName,
			levelElevationM,
			description,
			isActive
		}
	});

	return json(created, { status: 201 });
};
