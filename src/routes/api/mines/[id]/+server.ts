import { calculateSitePressureKpa, parseMineForm } from "$lib/server/mine-validation";
import { prisma } from "$lib/db/prisma";
import { json, error } from "@sveltejs/kit";

export const GET = async ({ params }) => {
	const mine = await prisma.mine.findUnique({
		where: { id: params.id },
		include: { _count: { select: { nodes: true, surveys: true } } }
	});
	if (!mine) throw error(404, "Mine not found");
	return json(mine);
};

export const PATCH = async ({ request, params }) => {
	const mine = await prisma.mine.findUnique({ where: { id: params.id } });
	if (!mine) throw error(404, "Mine not found");

	const { errors, values } = await parseMineForm(request);
	if (!values.name) {
		errors.name = errors.name || "Name is required";
	}
	if (Object.keys(errors).length > 0) {
		return json({ message: "Validation failed", errors }, { status: 400 });
	}

	const sitePressureKpa =
		values.altitudeM === null ? null : calculateSitePressureKpa(values.altitudeM);

	const updated = await prisma.mine.update({
		where: { id: params.id },
		data: {
			name: values.name ?? "",
			location: values.location ?? null,
			hostRock: values.hostRock ?? undefined,
			mineType: values.mineType ?? undefined,
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
			hottestMonthRelativeHumidityPct: values.hottestMonthRelativeHumidityPct
		}
	});

	return json(updated);
};

export const DELETE = async ({ params }) => {
	try {
		await prisma.mine.delete({ where: { id: params.id } });
		return json({ ok: true });
	} catch (err) {
		return json(
			{ message: "Could not delete mine. Check for dependent data (nodes/surveys) first." },
			{ status: 400 }
		);
	}
};
