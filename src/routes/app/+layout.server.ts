import { prisma } from '$lib/db/prisma';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	const mines = await prisma.mine.findMany({
		select: { id: true, name: true },
		orderBy: { name: 'asc' }
	});

	return { user: null, mines };
};
