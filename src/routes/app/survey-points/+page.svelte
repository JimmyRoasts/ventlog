<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import FormField from '$lib/components/FormField.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Table from '$lib/components/ui/table';
	import SortableHeader from '$lib/components/SortableHeader.svelte';
	import EditIcon from '@lucide/svelte/icons/pencil';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { getContext } from 'svelte';
	import type { Readable, Writable } from 'svelte/store';
	import { formatNumber } from '$lib/utils/format';
	import type { PageData } from './$types';
	import { createNodeCollection } from '$lib/stores/NodeCollection';
	import type { Node } from '$lib/types/Node';

	type MineContext = {
		mines: { id: string; name: string }[];
		selectedMineId: Writable<string | null>;
		selectedMine: Readable<{ id: string; name: string } | null>;
	};

	let { data }: { data: PageData } = $props();

	const mineContext = getContext<MineContext>('currentMine');
	const contextSelectedMineId = mineContext?.selectedMineId;

	let selectedMineId = $state<string | null>(data.mineId);
	let createOpen = $state(false);
	let activeEditId = $state<string | null>(null);
	let activeDeleteId = $state<string | null>(null);

	const nodeCollection = createNodeCollection(data.mine?.nodes ?? []);
	const sortedNodes = nodeCollection;
	const sortState = nodeCollection.sortState;

	$effect(() => {
		if (contextSelectedMineId && selectedMineId !== $contextSelectedMineId) {
			contextSelectedMineId.set(selectedMineId);
		}
	});

	const NODE_PLACEHOLDERS = {
		name: 'Return airway 22',
		code: 'RA-22',
		levelName: '1200 level',
		elevation: '1185.5',
		description: 'Near vent door, west of shaft...'
	} as const;

	const formEnhance =
		(onSuccess: () => void): SubmitFunction =>
		() =>
		async ({ result, update }) => {
			await update();
			if (result.type === 'success') {
				onSuccess();
			}
		};

	const handleMineChange = async (mineId: string) => {
		selectedMineId = mineId;
		if (contextSelectedMineId) contextSelectedMineId.set(mineId);
		const url = browser
			? new URL(window.location.href)
			: new URL(`/app/survey-points`, 'http://localhost');
		url.searchParams.set('mineId', mineId);
		await goto(url.toString(), { replaceState: true, keepFocus: true, noScroll: true });
	};
</script>

<section class="space-y-6">
	<div class="flex flex-col gap-2">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div>
				<h1 class="text-2xl font-semibold text-foreground">Survey points</h1>
				<p class="text-sm text-muted-foreground">Quickly switch mines and manage survey points.</p>
			</div>
			<div class="flex flex-wrap items-center gap-2">
				{#if data.mines.length > 0}
					<select
						class="border-input bg-background selection:bg-primary selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground shadow-xs h-9 rounded-md border px-2.5 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
						bind:value={selectedMineId}
						onchange={(event) => handleMineChange((event.target as HTMLSelectElement).value)}
						aria-label="Select mine"
					>
						{#each data.mines as mine}
							<option value={mine.id}>{mine.name}</option>
						{/each}
					</select>
				{/if}
				<Button href="/app/mines" variant="outline">Back to mines</Button>
				{#if data.mine}
					<Dialog.Root bind:open={createOpen}>
						<Dialog.Trigger>
							{#snippet child({ props })}
								<Button {...props} class="inline-flex items-center gap-2">
									<PlusIcon class="h-4 w-4" />
									Add survey point
								</Button>
							{/snippet}
						</Dialog.Trigger>
						<Dialog.Content>
							<Dialog.Header>
								<Dialog.Title>Add survey point</Dialog.Title>
								<Dialog.Description>
									Name the survey point and capture its level or elevation for context.
								</Dialog.Description>
							</Dialog.Header>
							<form
								class="space-y-4"
								method="POST"
								action="?/create"
								use:enhance={formEnhance(() => (createOpen = false))}
							>
								<input type="hidden" name="mineId" value={data.mine.id} />
								<div class="grid gap-4 sm:grid-cols-2">
									<FormField label="Name" forId="node-name">
										<Input
											id="node-name"
											name="name"
											placeholder={NODE_PLACEHOLDERS.name}
											required
										/>
									</FormField>
									<FormField label="Code" forId="node-code">
										<Input id="node-code" name="code" placeholder={NODE_PLACEHOLDERS.code} />
									</FormField>
									<FormField label="Level name" forId="node-level">
										<Input
											id="node-level"
											name="levelName"
											placeholder={NODE_PLACEHOLDERS.levelName}
										/>
									</FormField>
									<FormField label="Elevation (mRL)" forId="node-elevation">
										<Input
											id="node-elevation"
											name="levelElevationM"
											type="number"
											step="0.1"
											placeholder={NODE_PLACEHOLDERS.elevation}
										/>
									</FormField>
								</div>
								<FormField label="Description" forId="node-description">
									<Textarea
										id="node-description"
										name="description"
										placeholder={NODE_PLACEHOLDERS.description}
										rows={3}
									/>
								</FormField>
								<label class="flex items-center gap-2 text-sm font-medium text-foreground">
									<Checkbox name="isActive" checked />
									<span>Active</span>
								</label>
								<div class="flex justify-end gap-2">
									<Dialog.Close>
										{#snippet child({ props })}
											<Button type="button" variant="outline" {...props}>Cancel</Button>
										{/snippet}
									</Dialog.Close>
									<Button type="submit">Save survey point</Button>
								</div>
							</form>
						</Dialog.Content>
					</Dialog.Root>
				{/if}
			</div>
		</div>
	</div>

	{#if !data.mine}
		<div
			class="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground"
		>
			{#if data.mines.length === 0}
				No mines available. Create a mine first to manage survey points.
			{:else}
				Select a mine to view its survey points.
			{/if}
		</div>
	{:else}
		<div class="rounded-2xl border bg-card text-card-foreground shadow-sm">
			<div class="border-b border-border/80 px-4 py-3">
				<p class="text-sm font-semibold text-foreground">Survey points for {data.mine.name}</p>
				<p class="text-xs text-muted-foreground">
					{data.mine._count?.nodes ?? 0} survey points in this mine
				</p>
			</div>
			<div class="overflow-auto">
				<Table.Root class="min-w-full text-sm">
					<Table.Header
						class="bg-muted/60 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
					>
						<Table.Row>
							<Table.Head class="px-4 py-2">
								<SortableHeader
									label="Name"
									sortKey="name"
									{sortState}
									onSort={(key) => nodeCollection.setSort(key as keyof Node)}
								/>
							</Table.Head>
							<Table.Head class="px-4 py-2">
								<SortableHeader
									label="Code"
									sortKey="code"
									{sortState}
									onSort={(key) => nodeCollection.setSort(key as keyof Node)}
								/>
							</Table.Head>
							<Table.Head class="px-4 py-2">
								<SortableHeader
									label="Level"
									sortKey="levelName"
									{sortState}
									onSort={(key) => nodeCollection.setSort(key as keyof Node)}
								/>
							</Table.Head>
							<Table.Head class="px-4 py-2 text-right">
								<SortableHeader
									label="Elevation (mRL)"
									sortKey="levelElevationM"
									{sortState}
									onSort={(key) => nodeCollection.setSort(key as keyof Node)}
								/>
							</Table.Head>
							<Table.Head class="px-4 py-2">Description</Table.Head>
							<Table.Head class="px-4 py-2 text-center">Active</Table.Head>
							<Table.Head class="px-4 py-2 text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body class="divide-y divide-border bg-card">
						{#if $sortedNodes.length === 0}
							<Table.Row>
								<Table.Cell class="px-4 py-6 text-center text-muted-foreground" colspan={7}>
									No survey points defined yet.
								</Table.Cell>
							</Table.Row>
						{:else}
							{#each $sortedNodes as node}
								<Table.Row class="align-top hover:bg-muted/50">
									<Table.Cell class="px-4 py-3 font-medium text-foreground">{node.name}</Table.Cell>
									<Table.Cell class="px-4 py-3 text-muted-foreground">{node.code ?? '—'}</Table.Cell
									>
									<Table.Cell class="px-4 py-3 text-muted-foreground">
										{node.levelName ?? '—'}
									</Table.Cell>
									<Table.Cell class="px-4 py-3 text-right text-muted-foreground font-numeric">
										{formatNumber(node.levelElevationM, 1)}
									</Table.Cell>
									<Table.Cell class="px-4 py-3 max-w-xs text-muted-foreground">
										{node.description ?? '—'}
									</Table.Cell>
									<Table.Cell class="px-4 py-3 text-center">
										<span
											class={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${node.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100' : 'bg-muted text-muted-foreground'}`}
										>
											{node.isActive ? 'Yes' : 'No'}
										</span>
									</Table.Cell>
									<Table.Cell class="px-4 py-3 text-right">
										<div class="flex justify-end gap-2">
											<Dialog.Root
												open={activeEditId === node.id}
												onOpenChange={(open) =>
													(activeEditId = open
														? node.id
														: activeEditId === node.id
															? null
															: activeEditId)}
											>
												<Dialog.Trigger>
													{#snippet child({ props })}
														<Button
															size="icon"
															variant="outline"
															aria-label="Edit survey point"
															{...props}
														>
															<EditIcon class="h-4 w-4" />
														</Button>
													{/snippet}
												</Dialog.Trigger>
												<Dialog.Content>
													<Dialog.Header>
														<Dialog.Title>Edit survey point</Dialog.Title>
														<Dialog.Description>
															Update the survey point name, code, or level details.
														</Dialog.Description>
													</Dialog.Header>
													<form
														class="space-y-4"
														method="POST"
														action="?/update"
														use:enhance={formEnhance(() => (activeEditId = null))}
													>
														<input type="hidden" name="id" value={node.id} />
														<div class="grid gap-4 sm:grid-cols-2">
															<FormField label="Name" forId={`name-${node.id}`}>
																<Input
																	id={`name-${node.id}`}
																	name="name"
																	required
																	value={node.name}
																/>
															</FormField>
															<FormField label="Code" forId={`code-${node.id}`}>
																<Input id={`code-${node.id}`} name="code" value={node.code ?? ''} />
															</FormField>
															<FormField label="Level name" forId={`level-${node.id}`}>
																<Input
																	id={`level-${node.id}`}
																	name="levelName"
																	value={node.levelName ?? ''}
																/>
															</FormField>
															<FormField label="Elevation (mRL)" forId={`elevation-${node.id}`}>
																<Input
																	id={`elevation-${node.id}`}
																	name="levelElevationM"
																	type="number"
																	step="0.1"
																	value={node.levelElevationM ?? ''}
																/>
															</FormField>
														</div>
														<FormField label="Description" forId={`desc-${node.id}`}>
															<Textarea
																id={`desc-${node.id}`}
																name="description"
																rows={3}
																value={node.description ?? ''}
															/>
														</FormField>
														<label
															class="flex items-center gap-2 text-sm font-medium text-foreground"
														>
															<Checkbox name="isActive" checked={node.isActive} />
															<span>Active</span>
														</label>
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
												open={activeDeleteId === node.id}
												onOpenChange={(open) =>
													(activeDeleteId = open
														? node.id
														: activeDeleteId === node.id
															? null
															: activeDeleteId)}
											>
												<Dialog.Trigger>
													{#snippet child({ props })}
														<Button
															size="icon"
															variant="outline"
															aria-label="Delete survey point"
															{...props}
														>
															<TrashIcon class="h-4 w-4" />
														</Button>
													{/snippet}
												</Dialog.Trigger>
												<Dialog.Content>
													<Dialog.Header>
														<Dialog.Title>Delete survey point</Dialog.Title>
														<Dialog.Description>
															This will remove the survey point and any associated readings.
														</Dialog.Description>
													</Dialog.Header>
													<form
														method="POST"
														action="?/delete"
														class="space-y-4"
														use:enhance={formEnhance(() => (activeDeleteId = null))}
													>
														<input type="hidden" name="id" value={node.id} />
														<p class="text-sm text-muted-foreground">
															Are you sure you want to delete "{node.name}"?
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
									</Table.Cell>
								</Table.Row>
							{/each}
						{/if}
					</Table.Body>
				</Table.Root>
			</div>
		</div>
	{/if}
</section>
