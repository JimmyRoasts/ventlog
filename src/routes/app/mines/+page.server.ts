import { calculateSitePressureKpa, parseMineForm } from '$lib/server/mine-validation';
import { prisma } from '$lib/db/prisma';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const mines = await prisma.mine.findMany({
		orderBy: { createdAt: 'desc' },
		include: {
			_count: {
				select: {
					nodes: true,
					surveys: true
				}
			}
		}
	});

	return { mines };
};

const coerceCompanyId = async () => {
	const existing = await prisma.company.findFirst({ select: { id: true } });
	if (existing?.id) return existing.id;

	const created = await prisma.company.create({
		data: {
			name: 'Default Company',
			primaryDomain: 'ventlog.local'
		},
		select: { id: true }
	});
	return created.id;
};

export const actions: Actions = {
	create: async ({ request }) => {
		const { errors, values: parsed } = await parseMineForm(request);
		const { name, location, hostRock, mineType, altitudeM, maxDepthM } = parsed;

		if (!name) {
			errors.name = errors.name || 'Name is required';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, { message: 'Please fix the highlighted fields.', errors });
		}

		const sitePressureKpa = altitudeM === null ? null : calculateSitePressureKpa(altitudeM);
		const companyId = await coerceCompanyId();

		await prisma.mine.create({
			data: {
				name: name ?? '',
				location: location ?? null,
				hostRock,
				mineType,
				altitudeM,
				sitePressureKpa,
				maxDepthM,
				dailyMaxDryBulbC: parsed.dailyMaxDryBulbC,
				dailyMinDryBulbC: parsed.dailyMinDryBulbC,
				dailyMaxWetBulbC: parsed.dailyMaxWetBulbC,
				dailyMinWetBulbC: parsed.dailyMinWetBulbC,
				dailyRelativeHumidityPct: parsed.dailyRelativeHumidityPct,
				hottestMonth: parsed.hottestMonth,
				hottestMonthMaxDryBulbC: parsed.hottestMonthMaxDryBulbC,
				hottestMonthMinDryBulbC: parsed.hottestMonthMinDryBulbC,
				hottestMonthMaxWetBulbC: parsed.hottestMonthMaxWetBulbC,
				hottestMonthMinWetBulbC: parsed.hottestMonthMinWetBulbC,
				hottestMonthRelativeHumidityPct: parsed.hottestMonthRelativeHumidityPct,
				companyId
			}
		});

		throw redirect(303, '/app/mines');
	},
	update: async ({ request }) => {
		const { raw: formData, errors, values: parsed } = await parseMineForm(request);
		const mineId = parseString(formData, 'mineId', { required: true }, errors);

		if (!mineId) {
			errors.mineId = 'Missing mine ID';
		}
		if (!parsed.name) {
			errors.name = errors.name || 'Name is required';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, { message: 'Please fix the highlighted fields.', errors });
		}

		const sitePressureKpa =
			parsed.altitudeM === null ? null : calculateSitePressureKpa(parsed.altitudeM);
		const id = mineId as string;

		await prisma.mine.update({
			where: { id },
			data: {
				name: parsed.name ?? '',
				location: parsed.location ?? null,
				hostRock: parsed.hostRock ?? undefined,
				mineType: parsed.mineType ?? undefined,
				altitudeM: parsed.altitudeM,
				sitePressureKpa,
				maxDepthM: parsed.maxDepthM,
				dailyMaxDryBulbC: parsed.dailyMaxDryBulbC,
				dailyMinDryBulbC: parsed.dailyMinDryBulbC,
				dailyMaxWetBulbC: parsed.dailyMaxWetBulbC,
				dailyMinWetBulbC: parsed.dailyMinWetBulbC,
				dailyRelativeHumidityPct: parsed.dailyRelativeHumidityPct,
				hottestMonth: parsed.hottestMonth,
				hottestMonthMaxDryBulbC: parsed.hottestMonthMaxDryBulbC,
				hottestMonthMinDryBulbC: parsed.hottestMonthMinDryBulbC,
				hottestMonthMaxWetBulbC: parsed.hottestMonthMaxWetBulbC,
				hottestMonthMinWetBulbC: parsed.hottestMonthMinWetBulbC,
				hottestMonthRelativeHumidityPct: parsed.hottestMonthRelativeHumidityPct
			}
		});

		throw redirect(303, '/app/mines');
	},
	delete: async ({ request }) => {
		const formData = await request.formData();
		const errors: Record<string, string> = {};
		const mineId = parseString(formData, 'mineId', { required: true }, errors);

		if (!mineId) {
			return fail(400, { message: 'Mine ID is required.', errors });
		}

		try {
			await prisma.mine.delete({ where: { id: mineId } });
		} catch (error) {
			return fail(400, {
				message: 'Could not delete mine. Check for dependent data (nodes/surveys) first.',
				errors
			});
		}

		throw redirect(303, '/app/mines');
	}
};
