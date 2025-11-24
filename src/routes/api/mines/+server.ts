import { calculateSitePressureKpa, parseMineForm } from '$lib/server/mine-validation';
import { prisma } from '$lib/db/prisma';
import { json, error } from '@sveltejs/kit';

export const GET = async () => {
	const mines = await prisma.mine.findMany({
		orderBy: { createdAt: 'desc' },
		include: { _count: { select: { nodes: true, surveys: true } } }
	});
	return json(mines);
};

export const POST = async ({ request }) => {
	const { errors, values } = await parseMineForm(request);
	if (!values.name) {
		errors.name = errors.name || 'Name is required';
	}
	if (Object.keys(errors).length > 0) {
		return json({ message: 'Validation failed', errors }, { status: 400 });
	}

	const sitePressureKpa =
		values.altitudeM === null ? null : calculateSitePressureKpa(values.altitudeM);

	const companyId =
		(
			await prisma.company.findFirst({
				select: { id: true }
			})
		)?.id ??
		(
			await prisma.company.create({
				data: {
					name: 'Default Company',
					primaryDomain: 'ventlog.local'
				},
				select: { id: true }
			})
		).id;

	const created = await prisma.mine.create({
		data: {
			name: values.name ?? '',
			location: values.location ?? null,
			hostRock: values.hostRock,
			mineType: values.mineType,
			altitudeM: values.altitudeM,
			sitePressureKpa,
			maxDepthM: values.maxDepthM,
			dailyMaxDryBulbC: values.dailyMaxDryBulbC,
			dailyMinDryBulbC: values.dailyMinDryBulbC,
			dailyMaxWetBulbC: values.dailyMaxWetBulbC,
			dailyMinWetBulbC: values.dailyMinWetBulbC,
			dailyRelativeHumidityPct: values.dailyRelativeHumidityPct,
			hottestMonth: values.hottestMonth,
			hottestMonthMaxDryBulbC: values.hottestMonthMaxDryBulbC,
			hottestMonthMinDryBulbC: values.hottestMonthMinDryBulbC,
			hottestMonthMaxWetBulbC: values.hottestMonthMaxWetBulbC,
			hottestMonthMinWetBulbC: values.hottestMonthMinWetBulbC,
			hottestMonthRelativeHumidityPct: values.hottestMonthRelativeHumidityPct,
			companyId
		}
	});

	return json(created, { status: 201 });
};
