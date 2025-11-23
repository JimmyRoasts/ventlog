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
				<p class="mt-2 text-muted-foreground">
					This will list surveys and allow creating new ones with guided measurement steps.
				</p>
			</div>
			<Button variant="default">New survey</Button>
		</CardHeader>
	</Card>

	<Card>
		<CardContent class="p-0">
			<div class="overflow-hidden rounded-lg border border-border shadow-sm">
				<table class="min-w-full divide-y divide-border">
					<thead class="bg-muted text-left text-sm font-semibold text-foreground/90">
						<tr>
							<th class="px-4 py-3">Date and time</th>
							<th class="px-4 py-3">Mine</th>
							<th class="px-4 py-3">Title</th>
							<th class="px-4 py-3">Created by</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border bg-card text-sm text-foreground">
						{#each surveys as survey}
							<tr class="hover:bg-muted/70">
								<td class="px-4 py-3 font-medium text-foreground">{survey.datetime}</td>
								<td class="px-4 py-3 text-muted-foreground">{survey.mine}</td>
								<td class="px-4 py-3 text-muted-foreground">{survey.title}</td>
								<td class="px-4 py-3 text-muted-foreground">{survey.createdBy}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</CardContent>
	</Card>
</section>
