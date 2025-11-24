<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import EditIcon from '@lucide/svelte/icons/pencil';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import type { ActionData, PageData } from './$types';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { data, form }: { data: PageData; form: ActionData | null } = $props();

	const actionErrors =
		form && 'errors' in form ? (form.errors as Record<string, string> | undefined) : undefined;

	let selectedMineId = $state<string>(data.survey.mine.id);
	let createReadingOpen = $state(false);
	let activeEditReadingId = $state<string | null>(null);
	let activeDeleteReadingId = $state<string | null>(null);
	let bulkDeleteReadingsOpen = $state(false);
	let selectedReadingIds = $state<string[]>([]);
	let selectAllReadingsChecked = $state(false);
	let indeterminateState = $state(false);

	const indeterminate = (node: HTMLInputElement, value: boolean) => {
		node.indeterminate = value;
		return {
			update(next: boolean) {
				node.indeterminate = next;
			}
		};
	};
	let createNodeId = $state<string>(data.nodes.find((n) => n.mineId === selectedMineId)?.id ?? '');
	let createReadingIndexInput = $state<string>('');

	const nodesForMine = $derived(
		data.nodes.filter((node) => node.mineId === selectedMineId && node.isActive)
	);

	const defaultSurveyDatetime = (() => {
		const d = new Date(data.survey.surveyDatetime);
		d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
		return d.toISOString().slice(0, 16);
	})();

	const formatNumber = (value: number | null | undefined, digits = 1) =>
		value == null ? '—' : Number(value).toLocaleString('en-US', { maximumFractionDigits: digits });

	const nextReadingIndex = (nodeId: string) => {
		const readings = data.survey.readings.filter((r) => r.nodeId === nodeId);
		if (readings.length === 0) return 1;
		return Math.max(...readings.map((r) => r.readingIndex)) + 1;
	};

	$effect(() => {
		createReadingIndexInput = createNodeId ? String(nextReadingIndex(createNodeId)) : '';
	});

	const formEnhance =
		(onSuccess: () => void): SubmitFunction =>
		() =>
		async ({ result, update }) => {
			await update();
			if (result.type === 'success') {
				onSuccess();
			}
		};

	const toggleReading = (id: string, checked: boolean) => {
		selectedReadingIds = checked
			? Array.from(new Set([...selectedReadingIds, id]))
			: selectedReadingIds.filter((r) => r !== id);
	};

	const toggleAllReadings = (checked: boolean) => {
		selectedReadingIds = checked ? data.survey.readings.map((r) => r.id) : [];
	};

	$effect(() => {
		const valid = new Set(data.survey.readings.map((r) => r.id));
		selectedReadingIds = selectedReadingIds.filter((id) => valid.has(id));
		selectAllReadingsChecked =
			data.survey.readings.length > 0 &&
			selectedReadingIds.length === data.survey.readings.length;

		indeterminateState =
			selectedReadingIds.length > 0 &&
			selectedReadingIds.length < data.survey.readings.length;
	});
</script>

<section class="space-y-6">
	<div class="flex items-center justify-between gap-3">
		<div>
			<h1 class="text-2xl font-semibold text-foreground">Survey details</h1>
			<p class="text-sm text-muted-foreground">Manage survey metadata and ventilation readings.</p>
		</div>
		<div class="flex items-center gap-2">
			<Dialog.Root>
				<Dialog.Trigger>
					{#snippet child({ props })}
						<Button type="button" variant="destructive" class="h-9 px-3" {...props}>
							<TrashIcon class="mr-2 h-4 w-4" />
							Delete survey
						</Button>
					{/snippet}
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>Delete this survey?</Dialog.Title>
						<Dialog.Description>
							This will remove the survey and all of its readings. This cannot be undone.
						</Dialog.Description>
					</Dialog.Header>
					<form method="POST" action="?/deleteSurvey" class="mt-4 flex justify-end gap-2">
						<Dialog.Close>
							{#snippet child({ props })}
								<Button type="button" variant="outline" {...props}>Cancel</Button>
							{/snippet}
						</Dialog.Close>
						<Button type="submit" variant="destructive">Delete survey</Button>
					</form>
				</Dialog.Content>
			</Dialog.Root>
			<Button
				href="/app/surveys"
				variant="outline"
				class="h-9 px-3"
				data-sveltekit-reload
				aria-label="Back to surveys"
			>
				Back to surveys
			</Button>
		</div>
	</div>

	<div class="rounded-lg border bg-card text-card-foreground shadow-sm">
		<div class="border-b border-border/70 px-4 py-3">
			<p class="text-sm font-semibold text-foreground">Survey info</p>
		</div>
		<div class="p-4">
			<form
				class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
				method="POST"
				action="?/updateSurvey"
				use:enhance={formEnhance(() => {})}
			>
				<div class="space-y-2">
					<label class="text-sm font-medium text-foreground" for="survey-mine">Mine</label>
					<select
						id="survey-mine"
						name="mineId"
						class="border-input bg-background selection:bg-primary selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground shadow-xs h-9 w-full rounded-md border px-3 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
						bind:value={selectedMineId}
						aria-invalid={Boolean(actionErrors?.mineId)}
					>
						{#each data.mines as mine}
							<option value={mine.id}>{mine.name}</option>
						{/each}
					</select>
					{#if actionErrors?.mineId}
						<p class="text-xs text-destructive">{actionErrors.mineId}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<label class="text-sm font-medium text-foreground" for="survey-datetime"
						>Date & time</label
					>
					<Input
						id="survey-datetime"
						name="surveyDatetime"
						type="datetime-local"
						value={defaultSurveyDatetime}
						required
						aria-invalid={Boolean(actionErrors?.surveyDatetime)}
					/>
					{#if actionErrors?.surveyDatetime}
						<p class="text-xs text-destructive">{actionErrors.surveyDatetime}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<label class="text-sm font-medium text-foreground" for="survey-title">Title</label>
					<Input
						id="survey-title"
						name="title"
						placeholder="Primary fans check"
						value={data.survey.title ?? ''}
					/>
				</div>
				<div class="space-y-2 sm:col-span-2 lg:col-span-3">
					<label class="text-sm font-medium text-foreground" for="survey-notes">Notes</label>
					<Textarea
						id="survey-notes"
						name="notes"
						placeholder="Any context, weather, shift notes..."
						rows={3}
						value={data.survey.notes ?? ''}
					/>
				</div>
				<div class="space-y-2 sm:col-span-2 lg:col-span-3">
					<label class="text-sm font-medium text-foreground" for="survey-surveyors">
						Surveyor(s) <span class="text-muted-foreground">(optional, not saved)</span>
					</label>
					<Input id="survey-surveyors" placeholder="A. Kelly, M. Singh" />
				</div>
				<div class="sm:col-span-2 lg:col-span-3">
					<Button type="submit">Save survey</Button>
				</div>
			</form>
		</div>
	</div>

	<div class="rounded-2xl border bg-card text-card-foreground shadow-sm">
		<div
			class="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-3"
		>
			<div>
				<p class="text-sm font-semibold text-foreground">Readings</p>
				<p class="text-xs text-muted-foreground">Logged points for this survey.</p>
			</div>
			{#if selectedReadingIds.length > 0}
				<Dialog.Root bind:open={bulkDeleteReadingsOpen}>
					<Dialog.Trigger>
						{#snippet child({ props })}
							<Button variant="destructive" {...props}>
								Delete selected ({selectedReadingIds.length})
							</Button>
						{/snippet}
					</Dialog.Trigger>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>Delete selected readings?</Dialog.Title>
							<Dialog.Description>
								This will remove the selected readings from this survey. This cannot be undone.
							</Dialog.Description>
						</Dialog.Header>
					<form
						method="POST"
						action="?/deleteReadings"
						class="mt-4 flex justify-end gap-2"
						use:enhance={formEnhance(() => {
							selectedReadingIds = [];
							selectAllReadingsChecked = false;
							bulkDeleteReadingsOpen = false;
						})}
					>
							{#each selectedReadingIds as id}
								<input type="hidden" name="readingIds" value={id} />
							{/each}
							<Dialog.Close>
								{#snippet child({ props })}
									<Button type="button" variant="outline" {...props}>Cancel</Button>
								{/snippet}
							</Dialog.Close>
							<Button type="submit" variant="destructive">Delete</Button>
						</form>
					</Dialog.Content>
				</Dialog.Root>
			{/if}
			{#if nodesForMine.length > 0}
				<Dialog.Root bind:open={createReadingOpen}>
					<Dialog.Trigger>
						{#snippet child({ props })}
							<Button {...props} class="inline-flex items-center gap-2">
								<PlusIcon class="h-4 w-4" />
								Add reading
							</Button>
						{/snippet}
					</Dialog.Trigger>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>Add reading</Dialog.Title>
						</Dialog.Header>
						<form
							class="space-y-4"
							method="POST"
							action="?/createReading"
							use:enhance={formEnhance(() => (createReadingOpen = false))}
						>
							<div class="grid gap-4 sm:grid-cols-2">
								<div class="space-y-2">
									<label class="text-sm font-medium text-foreground" for="reading-node">
										Node
									</label>
									<select
										id="reading-node"
										name="nodeId"
										class="border-input bg-background selection:bg-primary selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground shadow-xs h-9 w-full rounded-md border px-3 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
										required
										bind:value={createNodeId}
									>
										{#each nodesForMine as node}
											<option value={node.id}>
												{node.name}
												{node.code ? `(${node.code})` : ''}
											</option>
										{/each}
									</select>
								</div>
								<div class="space-y-2">
									<label class="text-sm font-medium text-foreground" for="reading-index">
										Reading #
									</label>
									<Input
										id="reading-index"
										name="readingIndex"
										type="number"
										min="1"
										step="1"
										bind:value={createReadingIndexInput}
									/>
									<p class="text-xs text-muted-foreground">
										Defaults to next per node when left blank.
									</p>
								</div>
							</div>
							<div class="grid gap-4 sm:grid-cols-2">
								<div class="space-y-2">
									<label class="text-sm font-medium text-foreground" for="reading-dry"
										>Dry bulb (°C)</label
									>
									<Input id="reading-dry" name="dryBulbC" type="number" step="0.1" required />
								</div>
								<div class="space-y-2">
									<label class="text-sm font-medium text-foreground" for="reading-wet"
										>Wet bulb (°C)</label
									>
									<Input id="reading-wet" name="wetBulbC" type="number" step="0.1" />
								</div>
								<div class="space-y-2">
									<label class="text-sm font-medium text-foreground" for="reading-rh">RH (%)</label>
									<Input id="reading-rh" name="relativeHumidityPct" type="number" step="0.1" />
									<p class="text-xs text-muted-foreground">Provide wet bulb or RH.</p>
								</div>
								<div class="space-y-2">
									<label class="text-sm font-medium text-foreground" for="reading-vel"
										>Air velocity (m/s)</label
									>
									<Input id="reading-vel" name="airVelocityMs" type="number" step="0.1" />
								</div>
								<div class="space-y-2">
									<label class="text-sm font-medium text-foreground" for="reading-static"
										>Static pressure (Pa)</label
									>
									<Input id="reading-static" name="staticPressurePa" type="number" step="0.1" />
								</div>
								<div class="space-y-2">
									<label class="text-sm font-medium text-foreground" for="reading-barometric">
										Barometric pressure (kPa)
									</label>
									<Input
										id="reading-barometric"
										name="barometricPressureKpa"
										type="number"
										step="0.01"
									/>
								</div>
								<div class="space-y-2">
									<label class="text-sm font-medium text-foreground" for="reading-instrument">
										Instrument ID
									</label>
									<Input id="reading-instrument" name="instrumentId" placeholder="Anemometer 102" />
								</div>
								<div class="space-y-2 sm:col-span-2">
									<label class="text-sm font-medium text-foreground" for="reading-remarks"
										>Remarks</label
									>
									<Textarea id="reading-remarks" name="remarks" rows={3} />
								</div>
							</div>
							<div class="flex justify-end gap-2">
								<Dialog.Close>
									{#snippet child({ props })}
										<Button type="button" variant="outline" {...props}>Cancel</Button>
									{/snippet}
								</Dialog.Close>
								<Button type="submit">Save reading</Button>
							</div>
						</form>
					</Dialog.Content>
				</Dialog.Root>
			{:else}
				<p class="text-sm text-muted-foreground">No active nodes in this mine.</p>
			{/if}
		</div>

		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-border text-sm">
				<thead
					class="bg-muted/60 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
				>
					<tr class="[&>th]:px-4 [&>th]:py-2">
						<th class="w-10">
							<input
								type="checkbox"
								aria-label="Select all readings"
								checked={selectAllReadingsChecked}
								use:indeterminate={indeterminateState}
								onchange={(event) => toggleAllReadings(event.currentTarget.checked)}
								class="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/60"
							/>
						</th>
						<th>Node</th>
						<th class="text-right">#</th>
						<th class="text-right">Dry bulb (°C)</th>
						<th class="text-right">Wet bulb (°C)</th>
						<th class="text-right">RH (%)</th>
						<th class="text-right">Air vel (m/s)</th>
						<th class="text-right">Static (Pa)</th>
						<th class="text-right">Barometric (kPa)</th>
						<th class="text-right">Humidity ratio</th>
						<th class="text-right">Vapour P (kPa)</th>
						<th class="text-right">Enthalpy (kJ/kg)</th>
						<th class="text-right">Vol. flow (m³/s)</th>
						<th>Instrument</th>
						<th>Remarks</th>
						<th class="text-right">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border bg-card">
					{#if data.survey.readings.length === 0}
						<tr>
							<td class="px-4 py-6 text-center text-muted-foreground" colspan={15}>
								No readings yet. Add the first one.
							</td>
						</tr>
					{:else}
						{#each data.survey.readings as reading}
							<tr class="align-top hover:bg-muted/50 [&>td]:px-4 [&>td]:py-3">
								<td class="align-middle">
									<input
										type="checkbox"
										aria-label={`Select reading #${reading.readingIndex}`}
										checked={selectedReadingIds.includes(reading.id)}
										onchange={(event) => toggleReading(reading.id, event.currentTarget.checked)}
										class="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/60"
									/>
								</td>
								<td class="font-medium text-foreground">
									{reading.node?.name ?? 'Unknown'}
									{#if reading.node?.code}
										<span class="text-muted-foreground">({reading.node.code})</span>
									{/if}
								</td>
								<td class="text-right text-muted-foreground">{reading.readingIndex}</td>
								<td class="text-right text-muted-foreground">{formatNumber(reading.dryBulbC, 1)}</td
								>
								<td class="text-right text-muted-foreground">{formatNumber(reading.wetBulbC, 1)}</td
								>
								<td class="text-right text-muted-foreground">
									{formatNumber(reading.relativeHumidityPct, 1)}
								</td>
								<td class="text-right text-muted-foreground"
									>{formatNumber(reading.airVelocityMs, 1)}</td
								>
								<td class="text-right text-muted-foreground"
									>{formatNumber(reading.staticPressurePa, 1)}</td
								>
								<td class="text-right text-muted-foreground">
									{formatNumber(reading.barometricPressureKpa, 2)}
								</td>
								<td class="text-right text-muted-foreground">
									{formatNumber(reading.humidityRatioKgPerKgDa, 4)}
								</td>
								<td class="text-right text-muted-foreground">
									{formatNumber(reading.vapourPressureKpa, 3)}
								</td>
								<td class="text-right text-muted-foreground">
									{formatNumber(reading.airEnthalpyKjPerKgDa, 2)}
								</td>
								<td class="text-right text-muted-foreground">
									{formatNumber(reading.volumetricFlowM3s, 2)}
								</td>
								<td class="text-muted-foreground">{reading.instrumentId ?? '—'}</td>
								<td class="text-muted-foreground">{reading.remarks ?? '—'}</td>
								<td class="text-right">
									<div class="flex justify-end gap-2">
										<Dialog.Root
											open={activeEditReadingId === reading.id}
											onOpenChange={(open) =>
												(activeEditReadingId = open
													? reading.id
													: activeEditReadingId === reading.id
														? null
														: activeEditReadingId)}
										>
											<Dialog.Trigger>
												{#snippet child({ props })}
													<Button
														size="icon"
														variant="outline"
														aria-label="Edit reading"
														{...props}
													>
														<EditIcon class="h-4 w-4" />
													</Button>
												{/snippet}
											</Dialog.Trigger>
											<Dialog.Content>
												<Dialog.Header>
													<Dialog.Title>Edit reading</Dialog.Title>
												</Dialog.Header>
												<form
													class="space-y-4"
													method="POST"
													action="?/updateReading"
													use:enhance={formEnhance(() => (activeEditReadingId = null))}
												>
													<input type="hidden" name="id" value={reading.id} />
													<div class="grid gap-4 sm:grid-cols-2">
														<div class="space-y-2">
															<label
																class="text-sm font-medium text-foreground"
																for={`node-${reading.id}`}
															>
																Node
															</label>
															<select
																id={`node-${reading.id}`}
																name="nodeId"
																class="border-input bg-background selection:bg-primary selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground shadow-xs h-9 w-full rounded-md border px-3 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
																required
															>
																{#each nodesForMine as node}
																	<option value={node.id} selected={reading.nodeId === node.id}>
																		{node.name}
																		{node.code ? `(${node.code})` : ''}
																	</option>
																{/each}
															</select>
														</div>
														<div class="space-y-2">
															<label
																class="text-sm font-medium text-foreground"
																for={`idx-${reading.id}`}
															>
																Reading #
															</label>
															<Input
																id={`idx-${reading.id}`}
																name="readingIndex"
																type="number"
																min="1"
																step="1"
																value={reading.readingIndex}
																required
															/>
														</div>
													</div>
													<div class="grid gap-4 sm:grid-cols-2">
														<div class="space-y-2">
															<label
																class="text-sm font-medium text-foreground"
																for={`dry-${reading.id}`}
															>
																Dry bulb (°C)
															</label>
															<Input
																id={`dry-${reading.id}`}
																name="dryBulbC"
																type="number"
																step="0.1"
																required
																value={reading.dryBulbC ?? ''}
															/>
														</div>
														<div class="space-y-2">
															<label
																class="text-sm font-medium text-foreground"
																for={`wet-${reading.id}`}
															>
																Wet bulb (°C)
															</label>
															<Input
																id={`wet-${reading.id}`}
																name="wetBulbC"
																type="number"
																step="0.1"
																value={reading.wetBulbC ?? ''}
															/>
														</div>
														<div class="space-y-2">
															<label
																class="text-sm font-medium text-foreground"
																for={`rh-${reading.id}`}
															>
																RH (%)
															</label>
															<Input
																id={`rh-${reading.id}`}
																name="relativeHumidityPct"
																type="number"
																step="0.1"
																value={reading.relativeHumidityPct ?? ''}
															/>
														</div>
														<div class="space-y-2">
															<label
																class="text-sm font-medium text-foreground"
																for={`vel-${reading.id}`}
															>
																Air velocity (m/s)
															</label>
															<Input
																id={`vel-${reading.id}`}
																name="airVelocityMs"
																type="number"
																step="0.1"
																value={reading.airVelocityMs ?? ''}
															/>
														</div>
														<div class="space-y-2">
															<label
																class="text-sm font-medium text-foreground"
																for={`static-${reading.id}`}
															>
																Static pressure (Pa)
															</label>
															<Input
																id={`static-${reading.id}`}
																name="staticPressurePa"
																type="number"
																step="0.1"
																value={reading.staticPressurePa ?? ''}
															/>
														</div>
														<div class="space-y-2">
															<label
																class="text-sm font-medium text-foreground"
																for={`baro-${reading.id}`}
															>
																Barometric pressure (kPa)
															</label>
															<Input
																id={`baro-${reading.id}`}
																name="barometricPressureKpa"
																type="number"
																step="0.01"
																value={reading.barometricPressureKpa ?? ''}
															/>
														</div>
														<div class="space-y-2">
															<label
																class="text-sm font-medium text-foreground"
																for={`inst-${reading.id}`}
															>
																Instrument ID
															</label>
															<Input
																id={`inst-${reading.id}`}
																name="instrumentId"
																placeholder="Anemometer 102"
																value={reading.instrumentId ?? ''}
															/>
														</div>
														<div class="space-y-2 sm:col-span-2">
															<label
																class="text-sm font-medium text-foreground"
																for={`remarks-${reading.id}`}
															>
																Remarks
															</label>
															<Textarea
																id={`remarks-${reading.id}`}
																name="remarks"
																rows={3}
																value={reading.remarks ?? ''}
															/>
														</div>
													</div>
													<div class="flex justify-end gap-2">
														<Dialog.Close>
															{#snippet child({ props })}
																<Button type="button" variant="outline" {...props}>Cancel</Button>
															{/snippet}
														</Dialog.Close>
														<Button type="submit">Save changes</Button>
													</div>
												</form>
											</Dialog.Content>
										</Dialog.Root>
										<Dialog.Root
											open={activeDeleteReadingId === reading.id}
											onOpenChange={(open) =>
												(activeDeleteReadingId = open
													? reading.id
													: activeDeleteReadingId === reading.id
														? null
														: activeDeleteReadingId)}
										>
											<Dialog.Trigger>
												{#snippet child({ props })}
													<Button
														size="icon"
														variant="outline"
														aria-label="Delete reading"
														{...props}
													>
														<TrashIcon class="h-4 w-4" />
													</Button>
												{/snippet}
											</Dialog.Trigger>
											<Dialog.Content>
												<Dialog.Header>
													<Dialog.Title>Delete reading</Dialog.Title>
													<Dialog.Description>
														This will remove the reading from this survey.
													</Dialog.Description>
												</Dialog.Header>
												<form
													method="POST"
													action="?/deleteReading"
													class="space-y-4"
													use:enhance={formEnhance(() => (activeDeleteReadingId = null))}
												>
													<input type="hidden" name="id" value={reading.id} />
													<p class="text-sm text-muted-foreground">
														Are you sure you want to delete reading #{reading.readingIndex} at
														{reading.node?.name ?? 'this node'}?
													</p>
													<div class="flex justify-end gap-2">
														<Dialog.Close>
															{#snippet child({ props })}
																<Button type="button" variant="outline" {...props}>Cancel</Button>
															{/snippet}
														</Dialog.Close>
														<Button type="submit" variant="destructive">Delete</Button>
													</div>
												</form>
											</Dialog.Content>
										</Dialog.Root>
									</div>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</section>
