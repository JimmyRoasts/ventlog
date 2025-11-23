<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<section class="space-y-4">
	<Card>
		<CardHeader>
			<CardTitle class="text-2xl">Mines</CardTitle>
		</CardHeader>
		<CardContent class="text-slate-600 dark:text-slate-300">
			This will list mines for the current company and allow managing nodes, intake/return splits, and
			survey assignments.
		</CardContent>
	</Card>

	<Card>
		{#if data.mines.length === 0}
			<CardContent class="border border-dashed border-slate-300 bg-white text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
				No mines yet. Create one to start tagging nodes and surveys.
			</CardContent>
		{:else}
			<CardContent class="p-0">
				<div class="overflow-hidden rounded-lg border border-slate-200 shadow-sm dark:border-slate-800">
					<table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
						<thead class="bg-slate-100 text-left text-sm font-semibold text-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
							<tr>
								<th class="px-4 py-3">Name</th>
								<th class="px-4 py-3">Code</th>
								<th class="px-4 py-3">Location</th>
								<th class="px-4 py-3">Nodes</th>
								<th class="px-4 py-3">Surveys</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-200 bg-white text-sm dark:divide-slate-800 dark:bg-slate-900">
							{#each data.mines as mine}
								<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/70">
									<td class="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{mine.name}</td>
									<td class="px-4 py-3 text-slate-700 dark:text-slate-300">{mine.code ?? '—'}</td>
									<td class="px-4 py-3 text-slate-700 dark:text-slate-300">{mine.location ?? '—'}</td>
									<td class="px-4 py-3 text-slate-700 dark:text-slate-300">{mine._count?.nodes ?? 0}</td>
									<td class="px-4 py-3 text-slate-700 dark:text-slate-300">{mine._count?.surveys ?? 0}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</CardContent>
		{/if}
	</Card>
</section>
