<script lang="ts">
	import { HOST_ROCK_OPTIONS, MINE_TYPE_OPTIONS, MONTH_OPTIONS } from '$lib/config/mine-fields';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Input } from '$lib/components/ui/input';
	import FormField from '$lib/components/FormField.svelte';
	import SortableHeader from '$lib/components/SortableHeader.svelte';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import { formatNumber, optionLabel } from '$lib/utils/format';
	import type { ActionData, PageData } from './$types';
	import { createMineCollection } from '$lib/stores/MineCollection';
	import type { Mine } from '$lib/types/Mine';

	let { data, form }: { data: PageData; form: ActionData | null } = $props();

	// Initialize the custom store
	const mineCollection = createMineCollection(data.mines);

	// Auto-subscribe to the sorted mines
	const sortedMines = mineCollection;
	const sortState = mineCollection.sortState;

	// Function to handle sorting clicks
	function handleSort(key: keyof Mine) {
		mineCollection.setSort(key); // The store now handles toggling direction
	}

	const SELECT_CLASS =
		'border-input bg-background selection:bg-primary selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground shadow-xs flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm';

	const PLACEHOLDERS = {
		name: 'Pioneer Underground',
		location: 'Kambalda, WA',
		maxDepth: '600',
		hostRock: 'Select host rock',
		mineType: 'Select method',
		altitude: '1100',
		dailyMaxDb: '32',
		dailyMinDb: '8',
		dailyMaxWb: '25',
		dailyMinWb: '4',
		annualRain: '320',
		highestWetBulb: '27',
		primaryFan: 'Centac B32',
		secondaries: 'Axial, staged',
		notes: 'Any special controls, remote fans, constraints...'
	} as const;
</script>

{#snippet mineForm({
	mine = null as Mine | null, // Changed from MineRow to Mine
	action = '?/create',
	submitLabel = 'Save mine'
})}
	{@const idSuffix = mine?.id ?? 'new'}
	{@const showErrors = !mine}
	{#if form?.message && showErrors}
		<p
			class="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
		>
			{form.message}
		</p>
	{/if}
	<form class="space-y-6" method="POST" {action}>
		{#if mine}
			<input type="hidden" name="mineId" value={mine.id} />
		{/if}
		<div class="grid gap-4 sm:grid-cols-2">
			<FormField
				label="Name"
				forId={`mine-name-${idSuffix}`}
				error={showErrors ? form?.errors?.name : undefined}
			>
				<Input
					id={`mine-name-${idSuffix}`}
					name="name"
					placeholder={PLACEHOLDERS.name}
					required
					value={mine?.name ?? ''}
					aria-invalid={Boolean(form?.errors?.name && showErrors)}
				/>
			</FormField>
			<FormField
				label="Address / location"
				forId={`mine-location-${idSuffix}`}
				error={showErrors ? form?.errors?.location : undefined}
			>
				<Input
					id={`mine-location-${idSuffix}`}
					name="location"
					placeholder={PLACEHOLDERS.location}
					value={mine?.location ?? ''}
					aria-invalid={Boolean(form?.errors?.location && showErrors)}
				/>
			</FormField>
			<FormField
				label="Max depth (m)"
				forId={`mine-max-depth-${idSuffix}`}
				error={showErrors ? form?.errors?.maxDepthM : undefined}
			>
				<Input
					id={`mine-max-depth-${idSuffix}`}
					name="maxDepthM"
					type="number"
					min="0"
					step="1"
					placeholder={PLACEHOLDERS.maxDepth}
					value={mine?.maxDepthM ?? ''}
					aria-invalid={Boolean(form?.errors?.maxDepthM && showErrors)}
				/>
			</FormField>
			<FormField
				label="Host rock"
				forId={`mine-host-rock-${idSuffix}`}
				error={showErrors ? form?.errors?.hostRock : undefined}
			>
				<select
					id={`mine-host-rock-${idSuffix}`}
					name="hostRock"
					class={SELECT_CLASS}
					aria-invalid={Boolean(form?.errors?.hostRock && showErrors)}
					value={mine?.hostRock ?? ''}
				>
					<option value="">{PLACEHOLDERS.hostRock}</option>
					{#each HOST_ROCK_OPTIONS as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</FormField>
			<FormField
				label="Mine type"
				forId={`mine-type-${idSuffix}`}
				error={showErrors ? form?.errors?.mineType : undefined}
			>
				<select
					id={`mine-type-${idSuffix}`}
					name="mineType"
					class={SELECT_CLASS}
					aria-invalid={Boolean(form?.errors?.mineType && showErrors)}
					value={mine?.mineType ?? ''}
				>
					<option value="">{PLACEHOLDERS.mineType}</option>
					{#each MINE_TYPE_OPTIONS as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</FormField>
			<FormField
				label="Altitude (m)"
				forId={`mine-altitude-${idSuffix}`}
				error={showErrors ? form?.errors?.altitudeM : undefined}
			>
				<Input
					id={`mine-altitude-${idSuffix}`}
					name="altitudeM"
					type="number"
					step="1"
					placeholder={PLACEHOLDERS.altitude}
					value={mine?.altitudeM ?? ''}
					aria-invalid={Boolean(form?.errors?.altitudeM && showErrors)}
				/>
			</FormField>
		</div>

		<div class="rounded-lg border border-border/70 bg-muted/40 p-4">
			<p class="mb-3 text-sm font-semibold text-foreground">Typical daily weather</p>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<FormField
					label="Daily max dry bulb (°C)"
					forId={`daily-max-db-${idSuffix}`}
					error={showErrors ? form?.errors?.dailyMaxDryBulbC : undefined}
				>
					<Input
						id={`daily-max-db-${idSuffix}`}
						name="dailyMaxDryBulbC"
						type="number"
						step="0.1"
						placeholder={PLACEHOLDERS.dailyMaxDb}
						value={mine?.dailyMaxDryBulbC ?? ''}
						aria-invalid={Boolean(form?.errors?.dailyMaxDryBulbC && showErrors)}
					/>
				</FormField>
				<FormField
					label="Daily min dry bulb (°C)"
					forId={`daily-min-db-${idSuffix}`}
					error={showErrors ? form?.errors?.dailyMinDryBulbC : undefined}
				>
					<Input
						id={`daily-min-db-${idSuffix}`}
						name="dailyMinDryBulbC"
						type="number"
						step="0.1"
						placeholder={PLACEHOLDERS.dailyMinDb}
						value={mine?.dailyMinDryBulbC ?? ''}
						aria-invalid={Boolean(form?.errors?.dailyMinDryBulbC && showErrors)}
					/>
				</FormField>
				<FormField
					label="Daily max wet bulb (°C)"
					forId={`daily-max-wb-${idSuffix}`}
					error={showErrors ? form?.errors?.dailyMaxWetBulbC : undefined}
				>
					<Input
						id={`daily-max-wb-${idSuffix}`}
						name="dailyMaxWetBulbC"
						type="number"
						step="0.1"
						placeholder={PLACEHOLDERS.dailyMaxWb}
						value={mine?.dailyMaxWetBulbC ?? ''}
						aria-invalid={Boolean(form?.errors?.dailyMaxWetBulbC && showErrors)}
					/>
				</FormField>
				<FormField
					label="Daily min wet bulb (°C)"
					forId={`daily-min-wb-${idSuffix}`}
					error={showErrors ? form?.errors?.dailyMinWetBulbC : undefined}
				>
					<Input
						id={`daily-min-wb-${idSuffix}`}
						name="dailyMinWetBulbC"
						type="number"
						step="0.1"
						placeholder={PLACEHOLDERS.dailyMinWb}
						value={mine?.dailyMinWetBulbC ?? ''}
						aria-invalid={Boolean(form?.errors?.dailyMinWetBulbC && showErrors)}
					/>
				</FormField>
				<FormField
					label="Daily relative humidity (%)"
					forId={`daily-rh-${idSuffix}`}
					error={showErrors ? form?.errors?.dailyRelativeHumidityPct : undefined}
				>
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
				</FormField>
			</div>
		</div>

		<div class="rounded-lg border border-border/70 bg-muted/40 p-4">
			<p class="mb-3 text-sm font-semibold text-foreground">Hottest month extremes</p>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<FormField
					label="Month"
					forId={`hottest-month-${idSuffix}`}
					error={showErrors ? form?.errors?.hottestMonth : undefined}
				>
					<select
						id={`hottest-month-${idSuffix}`}
						name="hottestMonth"
						class={SELECT_CLASS}
						aria-invalid={Boolean(form?.errors?.hottestMonth && showErrors)}
						value={mine?.hottestMonth ?? ''}
					>
						<option value="">Select month</option>
						{#each MONTH_OPTIONS as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</FormField>
				<FormField
					label="Max dry bulb (°C)"
					forId={`hottest-max-db-${idSuffix}`}
					error={showErrors ? form?.errors?.hottestMonthMaxDryBulbC : undefined}
				>
					<Input
						id={`hottest-max-db-${idSuffix}`}
						name="hottestMonthMaxDryBulbC"
						type="number"
						step="0.1"
						placeholder="38"
						value={mine?.hottestMonthMaxDryBulbC ?? ''}
						aria-invalid={Boolean(form?.errors?.hottestMonthMaxDryBulbC && showErrors)}
					/>
				</FormField>
				<FormField
					label="Min dry bulb (°C)"
					forId={`hottest-min-db-${idSuffix}`}
					error={showErrors ? form?.errors?.hottestMonthMinDryBulbC : undefined}
				>
					<Input
						id={`hottest-min-db-${idSuffix}`}
						name="hottestMonthMinDryBulbC"
						type="number"
						step="0.1"
						placeholder="18"
						value={mine?.hottestMonthMinDryBulbC ?? ''}
						aria-invalid={Boolean(form?.errors?.hottestMonthMinDryBulbC && showErrors)}
					/>
				</FormField>
				<FormField
					label="Max wet bulb (°C)"
					forId={`hottest-max-wb-${idSuffix}`}
					error={showErrors ? form?.errors?.hottestMonthMaxWetBulbC : undefined}
				>
					<Input
						id={`hottest-max-wb-${idSuffix}`}
						name="hottestMonthMaxWetBulbC"
						type="number"
						step="0.1"
						placeholder="28"
						value={mine?.hottestMonthMaxWetBulbC ?? ''}
						aria-invalid={Boolean(form?.errors?.hottestMonthMaxWetBulbC && showErrors)}
					/>
				</FormField>
				<FormField
					label="Min wet bulb (°C)"
					forId={`hottest-min-wb-${idSuffix}`}
					error={showErrors ? form?.errors?.hottestMonthMinWetBulbC : undefined}
				>
					<Input
						id={`hottest-min-wb-${idSuffix}`}
						name="hottestMonthMinWetBulbC"
						type="number"
						step="0.1"
						placeholder="10"
						value={mine?.hottestMonthMinWetBulbC ?? ''}
						aria-invalid={Boolean(form?.errors?.hottestMonthMinWetBulbC && showErrors)}
					/>
				</FormField>
				<FormField
					label="Relative humidity (%)"
					forId={`hottest-rh-${idSuffix}`}
					error={showErrors ? form?.errors?.hottestMonthRelativeHumidityPct : undefined}
				>
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
				</FormField>
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
		{#if $sortedMines.length === 0}
			<CardContent class="border border-dashed border-border bg-card text-sm text-muted-foreground">
				No mines yet. Create one to start tagging nodes and surveys.
			</CardContent>
		{:else}
			<CardContent class="p-0">
				<div class="overflow-hidden rounded-lg border border-border shadow-sm">
					<table class="min-w-full divide-y divide-border">
						<thead
							class="bg-muted/70 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
						>
							<tr>
								<th class="px-4 py-3 text-center">
									<SortableHeader
										label="Name"
										sortKey="name"
										{sortState}
										onSort={(key) => handleSort(key as keyof Mine)}
									/>
								</th>

								<th class="px-4 py-3 text-center">
									<SortableHeader
										label="Location"
										sortKey="location"
										{sortState}
										onSort={(key) => handleSort(key as keyof Mine)}
									/>
								</th>

								<th class="px-4 py-3 text-center">
									<SortableHeader
										label="Host rock"
										sortKey="hostRock"
										{sortState}
										onSort={(key) => handleSort(key as keyof Mine)}
									/>
								</th>

								<th class="px-4 py-3 text-center">
									<SortableHeader
										label="Mine type"
										sortKey="mineType"
										{sortState}
										onSort={(key) => handleSort(key as keyof Mine)}
									/>
								</th>

								<th class="px-4 py-3 text-center">Max depth (m)</th>

								<th class="px-4 py-3 text-center">Altitude (m)</th>

								<th class="px-4 py-3 text-center">Site pressure (kPa)</th>

								<th class="px-4 py-3 text-center">Weather</th>

								<th class="px-4 py-3 text-center">Actions</th>

								<th class="px-4 py-3 text-center">Survey points</th>

								<th class="px-4 py-3 text-center">Surveys</th>
							</tr>
						</thead>

						<tbody class="divide-y divide-border bg-card text-sm text-foreground">
							{#each $sortedMines as mine}
								<tr class="hover:bg-muted/70 align-top">
									<td class="px-4 py-3 font-medium text-foreground text-left">
										<div class="flex items-center gap-2">
											<span>{mine.name}</span>
											<span
												class="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
											>
												Active
											</span>
										</div>
									</td>
									<td class="px-4 py-3 text-muted-foreground">
										{mine.location ?? '—'}
									</td>
									<td class="px-4 py-3 text-muted-foreground">
										{optionLabel(mine.hostRock, HOST_ROCK_OPTIONS)}
									</td>
									<td class="px-4 py-3 text-muted-foreground">
										{optionLabel(mine.mineType, MINE_TYPE_OPTIONS)}
									</td>
									<td class="px-4 py-3 text-right text-muted-foreground font-numeric">
										{formatNumber(mine.maxDepthM)}
									</td>
									<td class="px-4 py-3 text-right text-muted-foreground font-numeric">
										{formatNumber(mine.altitudeM)}
									</td>
									<td class="px-4 py-3 text-right text-muted-foreground font-numeric">
										{formatNumber(mine.sitePressureKpa, 1)}
									</td>
									<td class="px-4 py-3 text-muted-foreground">
										{#if mine.dailyMaxDryBulbC ?? mine.hottestMonthMaxDryBulbC}
											<div class="space-y-1 text-xs leading-relaxed">
												<div class="text-foreground whitespace-normal">
													Daily: <span class="font-numeric"
														>{formatNumber(mine.dailyMinDryBulbC, 1)}</span
													>
													/
													<span class="font-numeric">{formatNumber(mine.dailyMaxDryBulbC, 1)}</span>
													°C DB · WB
													<span class="font-numeric">{formatNumber(mine.dailyMinWetBulbC, 1)}</span>
													/
													<span class="font-numeric">{formatNumber(mine.dailyMaxWetBulbC, 1)}</span>
													°C{#if mine.dailyRelativeHumidityPct}
														· RH <span class="font-numeric"
															>{formatNumber(mine.dailyRelativeHumidityPct, 0)}</span
														>%{/if}
												</div>
												{#if mine.hottestMonth}
													<div class="text-muted-foreground whitespace-normal">
														Hottest {optionLabel(mine.hottestMonth, MONTH_OPTIONS)}: DB
														<span class="font-numeric"
															>{formatNumber(mine.hottestMonthMinDryBulbC, 1)}</span
														>
														/
														<span class="font-numeric"
															>{formatNumber(mine.hottestMonthMaxDryBulbC, 1)}</span
														>
														°C · WB
														<span class="font-numeric"
															>{formatNumber(mine.hottestMonthMinWetBulbC, 1)}</span
														>
														/
														<span class="font-numeric"
															>{formatNumber(mine.hottestMonthMaxWetBulbC, 1)}</span
														>
														°C{#if mine.hottestMonthRelativeHumidityPct}
															· RH <span class="font-numeric"
																>{formatNumber(mine.hottestMonthRelativeHumidityPct, 0)}</span
															>%{/if}
													</div>
												{/if}
											</div>
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
														<Button
															size="icon"
															variant="outline"
															aria-label="Delete mine"
															{...props}
														>
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
																	<Button type="submit" variant="destructive" {...props}
																		>Delete</Button
																	>
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
