<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';

	const surveys = [
		{ datetime: '2025-02-12 09:15', mine: 'Pioneer Underground', title: 'Main intake north', createdBy: 'A. Kelly' },
		{ datetime: '2025-02-10 14:40', mine: 'Redback Decline', title: 'Return airway checks', createdBy: 'M. Singh' },
		{ datetime: '2025-02-08 11:05', mine: 'Coastline Nickel', title: 'Primary fans verification', createdBy: 'S. Taylor' }
	];
</script>

<section class="space-y-4">
	<Card>
		<CardHeader class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
			<div>
				<CardTitle class="text-2xl">Surveys</CardTitle>
				<p class="mt-2 text-slate-600 dark:text-slate-300">
					This will list surveys and allow creating new ones with guided measurement steps.
				</p>
			</div>
			<Button variant="default">New survey</Button>
		</CardHeader>
	</Card>

	<Card>
		<CardContent class="p-0">
			<div class="overflow-hidden rounded-lg border border-slate-200 shadow-sm dark:border-slate-800">
				<table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
					<thead class="bg-slate-100 text-left text-sm font-semibold text-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
						<tr>
							<th class="px-4 py-3">Date and time</th>
							<th class="px-4 py-3">Mine</th>
							<th class="px-4 py-3">Title</th>
							<th class="px-4 py-3">Created by</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-200 bg-white text-sm dark:divide-slate-800 dark:bg-slate-900">
						{#each surveys as survey}
							<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/70">
								<td class="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{survey.datetime}</td>
								<td class="px-4 py-3 text-slate-700 dark:text-slate-300">{survey.mine}</td>
								<td class="px-4 py-3 text-slate-700 dark:text-slate-300">{survey.title}</td>
								<td class="px-4 py-3 text-slate-700 dark:text-slate-300">{survey.createdBy}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</CardContent>
	</Card>
</section>
