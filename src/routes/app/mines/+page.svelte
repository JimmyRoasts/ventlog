<script lang="ts">
	import { HOST_ROCK_OPTIONS, MINE_TYPE_OPTIONS, MONTH_OPTIONS } from '$lib/config/mine-fields';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData | null } = $props();
	type MineRow = PageData['mines'][number];

	const formatNumber = (value: number | null | undefined, digits = 0) =>
		value == null ? '—' : Number(value).toLocaleString('en-US', { maximumFractionDigits: digits });
	const optionLabel = (value: string | null | undefined, options: { value: string; label: string }[]) =>
		value ? options.find((option) => option.value === value)?.label ?? value : '—';
</script>

{#snippet mineForm({ mine = null as MineRow | null, action = '?/create', submitLabel = 'Save mine' })}
	{@const idSuffix = mine?.id ?? 'new'}
	{@const showErrors = !mine}
	{#if form?.message && showErrors}
		<p class="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
			{form.message}
		</p>
	{/if}
	<form class="space-y-6" method="POST" action={action}>
		{#if mine}
			<input type="hidden" name="mineId" value={mine.id} />
		{/if}
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="space-y-2">
				<Label for={`mine-name-${idSuffix}`}>Name</Label>
				<Input
					id={`mine-name-${idSuffix}`}
					name="name"
					placeholder="Pioneer Underground"
					required
					value={mine?.name ?? ''}
					aria-invalid={Boolean(form?.errors?.name && showErrors)}
				/>
				{#if form?.errors?.name && showErrors}
					<p class="text-xs text-destructive">{form.errors.name}</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label for={`mine-location-${idSuffix}`}>Address / location</Label>
				<Input
					id={`mine-location-${idSuffix}`}
					name="location"
					placeholder="Kambalda, WA"
					value={mine?.location ?? ''}
					aria-invalid={Boolean(form?.errors?.location && showErrors)}
				/>
				{#if form?.errors?.location && showErrors}
					<p class="text-xs text-destructive">{form.errors.location}</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label for={`mine-max-depth-${idSuffix}`}>Max depth (m)</Label>
				<Input
					id={`mine-max-depth-${idSuffix}`}
					name="maxDepthM"
					type="number"
					min="0"
					step="1"
					placeholder="600"
					value={mine?.maxDepthM ?? ''}
					aria-invalid={Boolean(form?.errors?.maxDepthM && showErrors)}
				/>
				{#if form?.errors?.maxDepthM && showErrors}
					<p class="text-xs text-destructive">{form.errors.maxDepthM}</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label for={`mine-host-rock-${idSuffix}`}>Host rock</Label>
				<select
					id={`mine-host-rock-${idSuffix}`}
					name="hostRock"
					class="border-input bg-background selection:bg-primary selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground shadow-xs flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
					aria-invalid={Boolean(form?.errors?.hostRock && showErrors)}
					value={mine?.hostRock ?? ''}
				>
					<option value="">Select host rock</option>
					{#each HOST_ROCK_OPTIONS as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
				{#if form?.errors?.hostRock && showErrors}
					<p class="text-xs text-destructive">{form.errors.hostRock}</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label for={`mine-type-${idSuffix}`}>Mine type</Label>
				<select
					id={`mine-type-${idSuffix}`}
					name="mineType"
					class="border-input bg-background selection:bg-primary selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground shadow-xs flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
					aria-invalid={Boolean(form?.errors?.mineType && showErrors)}
					value={mine?.mineType ?? ''}
				>
					<option value="">Select method</option>
					{#each MINE_TYPE_OPTIONS as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
				{#if form?.errors?.mineType && showErrors}
					<p class="text-xs text-destructive">{form.errors.mineType}</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label for={`mine-altitude-${idSuffix}`}>Altitude (m)</Label>
				<Input
					id={`mine-altitude-${idSuffix}`}
					name="altitudeM"
					type="number"
					step="1"
					placeholder="1100"
					value={mine?.altitudeM ?? ''}
					aria-invalid={Boolean(form?.errors?.altitudeM && showErrors)}
				/>
				{#if form?.errors?.altitudeM && showErrors}
					<p class="text-xs text-destructive">{form.errors.altitudeM}</p>
				{/if}
			</div>
		</div>

		<div class="rounded-lg border border-border/70 bg-muted/40 p-4">
			<p class="mb-3 text-sm font-semibold text-foreground">Typical daily weather</p>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<div class="space-y-2">
					<Label for={`daily-max-db-${idSuffix}`}>Daily max dry bulb (°C)</Label>
					<Input
						id={`daily-max-db-${idSuffix}`}
						name="dailyMaxDryBulbC"
						type="number"
						step="0.1"
						placeholder="32"
						value={mine?.dailyMaxDryBulbC ?? ''}
						aria-invalid={Boolean(form?.errors?.dailyMaxDryBulbC && showErrors)}
					/>
					{#if form?.errors?.dailyMaxDryBulbC && showErrors}
						<p class="text-xs text-destructive">{form.errors.dailyMaxDryBulbC}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for={`daily-min-db-${idSuffix}`}>Daily min dry bulb (°C)</Label>
					<Input
						id={`daily-min-db-${idSuffix}`}
						name="dailyMinDryBulbC"
						type="number"
						step="0.1"
						placeholder="8"
						value={mine?.dailyMinDryBulbC ?? ''}
						aria-invalid={Boolean(form?.errors?.dailyMinDryBulbC && showErrors)}
					/>
					{#if form?.errors?.dailyMinDryBulbC && showErrors}
						<p class="text-xs text-destructive">{form.errors.dailyMinDryBulbC}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for={`daily-max-wb-${idSuffix}`}>Daily max wet bulb (°C)</Label>
					<Input
						id={`daily-max-wb-${idSuffix}`}
						name="dailyMaxWetBulbC"
						type="number"
						step="0.1"
						placeholder="25"
						value={mine?.dailyMaxWetBulbC ?? ''}
						aria-invalid={Boolean(form?.errors?.dailyMaxWetBulbC && showErrors)}
					/>
					{#if form?.errors?.dailyMaxWetBulbC && showErrors}
						<p class="text-xs text-destructive">{form.errors.dailyMaxWetBulbC}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for={`daily-min-wb-${idSuffix}`}>Daily min wet bulb (°C)</Label>
					<Input
						id={`daily-min-wb-${idSuffix}`}
						name="dailyMinWetBulbC"
						type="number"
						step="0.1"
						placeholder="4"
						value={mine?.dailyMinWetBulbC ?? ''}
						aria-invalid={Boolean(form?.errors?.dailyMinWetBulbC && showErrors)}
					/>
					{#if form?.errors?.dailyMinWetBulbC && showErrors}
						<p class="text-xs text-destructive">{form.errors.dailyMinWetBulbC}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for={`daily-rh-${idSuffix}`}>Daily relative humidity (%)</Label>
					<Input
						id={`daily-rh-${idSuffix}`}
						name="dailyRelativeHumidityPct"
						type="number"
						step="1"
						min="0"
						max="100"
						placeholder="55"
						value={mine?.dailyRelativeHumidityPct ?? ''}
						aria-invalid={Boolean(form?.errors?.dailyRelativeHumidityPct && showErrors)}
					/>
					{#if form?.errors?.dailyRelativeHumidityPct && showErrors}
						<p class="text-xs text-destructive">{form.errors.dailyRelativeHumidityPct}</p>
					{/if}
				</div>
			</div>
		</div>

		<div class="rounded-lg border border-border/70 bg-muted/40 p-4">
			<p class="mb-3 text-sm font-semibold text-foreground">Hottest month extremes</p>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<div class="space-y-2">
					<Label for={`hottest-month-${idSuffix}`}>Month</Label>
					<select
						id={`hottest-month-${idSuffix}`}
						name="hottestMonth"
						class="border-input bg-background selection:bg-primary selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground shadow-xs flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
						aria-invalid={Boolean(form?.errors?.hottestMonth && showErrors)}
						value={mine?.hottestMonth ?? ''}
					>
						<option value="">Select month</option>
						{#each MONTH_OPTIONS as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
					{#if form?.errors?.hottestMonth && showErrors}
						<p class="text-xs text-destructive">{form.errors.hottestMonth}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for={`hottest-max-db-${idSuffix}`}>Max dry bulb (°C)</Label>
					<Input
						id={`hottest-max-db-${idSuffix}`}
						name="hottestMonthMaxDryBulbC"
						type="number"
						step="0.1"
						placeholder="40"
						value={mine?.hottestMonthMaxDryBulbC ?? ''}
						aria-invalid={Boolean(form?.errors?.hottestMonthMaxDryBulbC && showErrors)}
					/>
					{#if form?.errors?.hottestMonthMaxDryBulbC && showErrors}
						<p class="text-xs text-destructive">{form.errors.hottestMonthMaxDryBulbC}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for={`hottest-min-db-${idSuffix}`}>Min dry bulb (°C)</Label>
					<Input
						id={`hottest-min-db-${idSuffix}`}
						name="hottestMonthMinDryBulbC"
						type="number"
						step="0.1"
						placeholder="22"
						value={mine?.hottestMonthMinDryBulbC ?? ''}
						aria-invalid={Boolean(form?.errors?.hottestMonthMinDryBulbC && showErrors)}
					/>
					{#if form?.errors?.hottestMonthMinDryBulbC && showErrors}
						<p class="text-xs text-destructive">{form.errors.hottestMonthMinDryBulbC}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for={`hottest-max-wb-${idSuffix}`}>Max wet bulb (°C)</Label>
					<Input
						id={`hottest-max-wb-${idSuffix}`}
						name="hottestMonthMaxWetBulbC"
						type="number"
						step="0.1"
						placeholder="28"
						value={mine?.hottestMonthMaxWetBulbC ?? ''}
						aria-invalid={Boolean(form?.errors?.hottestMonthMaxWetBulbC && showErrors)}
					/>
					{#if form?.errors?.hottestMonthMaxWetBulbC && showErrors}
						<p class="text-xs text-destructive">{form.errors.hottestMonthMaxWetBulbC}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for={`hottest-min-wb-${idSuffix}`}>Min wet bulb (°C)</Label>
					<Input
						id={`hottest-min-wb-${idSuffix}`}
						name="hottestMonthMinWetBulbC"
						type="number"
						step="0.1"
						placeholder="18"
						value={mine?.hottestMonthMinWetBulbC ?? ''}
						aria-invalid={Boolean(form?.errors?.hottestMonthMinWetBulbC && showErrors)}
					/>
					{#if form?.errors?.hottestMonthMinWetBulbC && showErrors}
						<p class="text-xs text-destructive">{form.errors.hottestMonthMinWetBulbC}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for={`hottest-rh-${idSuffix}`}>Relative humidity (%)</Label>
					<Input
						id={`hottest-rh-${idSuffix}`}
						name="hottestMonthRelativeHumidityPct"
						type="number"
						step="1"
						min="0"
						max="100"
						placeholder="45"
						value={mine?.hottestMonthRelativeHumidityPct ?? ''}
						aria-invalid={Boolean(form?.errors?.hottestMonthRelativeHumidityPct && showErrors)}
					/>
					{#if form?.errors?.hottestMonthRelativeHumidityPct && showErrors}
						<p class="text-xs text-destructive">{form.errors.hottestMonthRelativeHumidityPct}</p>
					{/if}
				</div>
			</div>
		</div>

		<Dialog.Footer>
			<Dialog.Close>
				{#snippet child({ props })}
					<Button type="button" variant="outline" {...props}>Cancel</Button>
				{/snippet}
			</Dialog.Close>
			<Button type="submit">{submitLabel}</Button>
		</Dialog.Footer>
	</form>
{/snippet}

<section class="space-y-4">
	<Card>
		<CardHeader class="gap-3">
			<div class="flex items-center justify-between gap-3">
				<CardTitle class="text-2xl">Mines</CardTitle>
				<Dialog.Root>
					<Dialog.Trigger>
						{#snippet child({ props })}
							<Button class="gap-2" {...props}>
								<PlusIcon class="h-4 w-4" />
								<span>Add mine</span>
							</Button>
						{/snippet}
					</Dialog.Trigger>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>Add mine</Dialog.Title>
							<Dialog.Description>
								Capture the basics now; you can refine the climate and geology later.
							</Dialog.Description>
						</Dialog.Header>
						{@render mineForm({ submitLabel: 'Save mine' })}
					</Dialog.Content>
				</Dialog.Root>
			</div>
		</CardHeader>
		<CardContent class="text-muted-foreground">
			Capture mine metadata, geology, and weather to pre-fill survey context.
		</CardContent>
	</Card>

	<Card>
		{#if data.mines.length === 0}
			<CardContent class="border border-dashed border-border bg-card text-sm text-muted-foreground">
				No mines yet. Create one to start tagging nodes and surveys.
			</CardContent>
		{:else}
			<CardContent class="p-0">
				<div class="overflow-hidden rounded-lg border border-border shadow-sm">
					<table class="min-w-full divide-y divide-border">
						<thead class="bg-muted text-left text-sm font-semibold text-foreground/90">
							<tr>
								<th class="px-4 py-3">Name</th>
								<th class="px-4 py-3">Location</th>
								<th class="px-4 py-3">Host rock</th>
								<th class="px-4 py-3">Mine type</th>
								<th class="px-4 py-3">Max depth (m)</th>
								<th class="px-4 py-3">Altitude (m)</th>
								<th class="px-4 py-3">Site pressure (kPa)</th>
								<th class="px-4 py-3">Weather</th>
								<th class="px-4 py-3 text-right">Actions</th>
								<th class="px-4 py-3 text-right">Survey points</th>
								<th class="px-4 py-3 text-right">Surveys</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border bg-card text-sm text-foreground">
							{#each data.mines as mine}
								<tr class="hover:bg-muted/70 align-top">
									<td class="px-4 py-3 font-medium text-foreground">{mine.name}</td>
									<td class="px-4 py-3 text-muted-foreground">
										{mine.location ?? '—'}
									</td>
									<td class="px-4 py-3 text-muted-foreground">
										{optionLabel(mine.hostRock, HOST_ROCK_OPTIONS)}
									</td>
									<td class="px-4 py-3 text-muted-foreground">
										{optionLabel(mine.mineType, MINE_TYPE_OPTIONS)}
									</td>
									<td class="px-4 py-3 text-muted-foreground">
										{formatNumber(mine.maxDepthM)}
									</td>
									<td class="px-4 py-3 text-muted-foreground">
										{formatNumber(mine.altitudeM)}
									</td>
									<td class="px-4 py-3 text-muted-foreground">
										{formatNumber(mine.sitePressureKpa, 1)}
									</td>
									<td class="px-4 py-3 text-muted-foreground">
										{#if mine.dailyMaxDryBulbC ?? mine.hottestMonthMaxDryBulbC}
											<div class="text-xs text-foreground">
												Daily: {formatNumber(mine.dailyMinDryBulbC, 1)} / {formatNumber(mine.dailyMaxDryBulbC, 1)} °C DB
											</div>
											<div class="text-xs">
												Wet bulb: {formatNumber(mine.dailyMinWetBulbC, 1)} / {formatNumber(mine.dailyMaxWetBulbC, 1)} °C
											</div>
											{#if mine.dailyRelativeHumidityPct}
												<div class="text-xs">RH: {formatNumber(mine.dailyRelativeHumidityPct, 0)}%</div>
											{/if}
											{#if mine.hottestMonth}
												<div class="mt-1 text-xs text-foreground">
													Hottest month ({optionLabel(mine.hottestMonth, MONTH_OPTIONS)}):
												</div>
												<div class="text-xs">
													DB {formatNumber(mine.hottestMonthMinDryBulbC, 1)} / {formatNumber(mine.hottestMonthMaxDryBulbC, 1)} °C
												</div>
												<div class="text-xs">
													WB {formatNumber(mine.hottestMonthMinWetBulbC, 1)} / {formatNumber(mine.hottestMonthMaxWetBulbC, 1)} °C
												</div>
												{#if mine.hottestMonthRelativeHumidityPct}
													<div class="text-xs">RH {formatNumber(mine.hottestMonthRelativeHumidityPct, 0)}%</div>
												{/if}
											{/if}
										{:else}
											<span>—</span>
										{/if}
									</td>
									<td class="px-4 py-3">
										<div class="flex justify-end gap-2">
											<Button
												href={`/app/mines/${mine.id}/nodes`}
												variant="ghost"
												size="sm"
												class="px-3"
											>
												Manage survey points
											</Button>
											<Dialog.Root>
												<Dialog.Trigger>
													{#snippet child({ props })}
														<Button size="icon" variant="outline" aria-label="Edit mine" {...props}>
															<PencilIcon class="h-4 w-4" />
														</Button>
													{/snippet}
												</Dialog.Trigger>
												<Dialog.Content>
													<Dialog.Header>
														<Dialog.Title>Edit mine</Dialog.Title>
														<Dialog.Description>
															Update geology, weather, or depth as operations change.
														</Dialog.Description>
													</Dialog.Header>
													{@render mineForm({
														mine,
														action: '?/update',
														submitLabel: 'Update mine'
													})}
												</Dialog.Content>
											</Dialog.Root>

											<AlertDialog.Root>
												<AlertDialog.Trigger>
													{#snippet child({ props })}
														<Button size="icon" variant="outline" aria-label="Delete mine" {...props}>
															<TrashIcon class="h-4 w-4" />
														</Button>
													{/snippet}
												</AlertDialog.Trigger>
												<AlertDialog.Content>
													<AlertDialog.Header>
														<AlertDialog.Title>Delete mine</AlertDialog.Title>
														<AlertDialog.Description>
															This will remove the mine and related data. This cannot be undone.
														</AlertDialog.Description>
													</AlertDialog.Header>
													<form method="POST" action="?/delete" class="flex flex-col gap-3">
														<input type="hidden" name="mineId" value={mine.id} />
														<AlertDialog.Footer>
															<AlertDialog.Cancel>
																{#snippet child({ props })}
																	<Button type="button" variant="outline" {...props}>Cancel</Button>
																{/snippet}
															</AlertDialog.Cancel>
															<AlertDialog.Action>
																{#snippet child({ props })}
																	<Button type="submit" variant="destructive" {...props}>Delete</Button>
																{/snippet}
															</AlertDialog.Action>
														</AlertDialog.Footer>
													</form>
												</AlertDialog.Content>
											</AlertDialog.Root>
										</div>
									</td>
									<td class="px-4 py-3 text-right text-muted-foreground">
										<a
											class="text-xs font-medium text-primary underline-offset-2 hover:underline"
											href={`/app/mines/${mine.id}/nodes`}
										>
											{mine._count?.nodes ?? 0}
										</a>
									</td>
									<td class="px-4 py-3 text-right text-muted-foreground">
										{mine._count?.surveys ?? 0}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</CardContent>
		{/if}
	</Card>
</section>
