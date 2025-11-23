import { prisma } from '$lib/db/prisma';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const mines = await prisma.mine.findMany({
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
