<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import EditIcon from '@lucide/svelte/icons/pencil';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { getContext } from 'svelte';
	import type { Readable, Writable } from 'svelte/store';
	import type { PageData } from './$types';

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

	$effect(() => {
		if (contextSelectedMineId && selectedMineId !== $contextSelectedMineId) {
			contextSelectedMineId.set(selectedMineId);
		}
	});

	const formatNumber = (value: number | null | undefined, digits = 1) =>
		value == null ? '—' : Number(value).toLocaleString('en-US', { maximumFractionDigits: digits });

	const formEnhance = (onSuccess: () => void): SubmitFunction =>
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
		const url = browser ? new URL(window.location.href) : new URL(`/app/nodes`, 'http://localhost');
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
									<div class="space-y-2">
										<label class="text-sm font-medium text-foreground" for="node-name">
											Name
										</label>
										<Input id="node-name" name="name" placeholder="Return airway 22" required />
									</div>
									<div class="space-y-2">
										<label class="text-sm font-medium text-foreground" for="node-code">
											Code
										</label>
										<Input id="node-code" name="code" placeholder="RA-22" />
									</div>
									<div class="space-y-2">
										<label class="text-sm font-medium text-foreground" for="node-level">
											Level name
										</label>
										<Input id="node-level" name="levelName" placeholder="1200 level" />
									</div>
									<div class="space-y-2">
										<label class="text-sm font-medium text-foreground" for="node-elevation">
											Elevation (mRL)
										</label>
										<Input
											id="node-elevation"
											name="levelElevationM"
											type="number"
											step="0.1"
											placeholder="1185.5"
										/>
									</div>
								</div>
								<div class="space-y-2">
									<label class="text-sm font-medium text-foreground" for="node-description">
										Description
									</label>
									<Textarea
										id="node-description"
										name="description"
										placeholder="Near vent door, west of shaft..."
										rows={3}
									/>
								</div>
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
									<Button type="submit">Save node</Button>
								</div>
							</form>
						</Dialog.Content>
					</Dialog.Root>
				{/if}
			</div>
		</div>
	</div>

	{#if !data.mine}
		<div class="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
			{#if data.mines.length === 0}
				No mines available. Create a mine first to manage survey points.
			{:else}
				Select a mine to view its survey points.
			{/if}
		</div>
	{:else}
		<div class="rounded-lg border bg-card text-card-foreground shadow-sm">
			<div class="border-b border-border/80 px-4 py-3">
				<p class="text-sm font-semibold text-foreground">Survey points for {data.mine.name}</p>
				<p class="text-xs text-muted-foreground">
					{data.mine._count?.nodes ?? 0} survey points in this mine
				</p>
			</div>
			<div class="overflow-auto">
				<table class="min-w-full divide-y divide-border text-sm">
					<thead class="bg-muted/60 text-left font-medium text-foreground">
						<tr class="[&>th]:px-4 [&>th]:py-2">
							<th>Name</th>
							<th>Code</th>
							<th>Level</th>
							<th class="text-right">Elevation (mRL)</th>
							<th>Description</th>
							<th class="text-center">Active</th>
							<th class="text-right">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border bg-card">
						{#if data.mine.nodes.length === 0}
							<tr>
								<td class="px-4 py-6 text-center text-muted-foreground" colspan={7}>
									No survey points defined yet.
								</td>
							</tr>
						{:else}
							{#each data.mine.nodes as node}
								<tr class="align-top hover:bg-muted/50 [&>td]:px-4 [&>td]:py-3">
									<td class="font-medium text-foreground">{node.name}</td>
									<td class="text-muted-foreground">{node.code ?? '—'}</td>
									<td class="text-muted-foreground">{node.levelName ?? '—'}</td>
									<td class="text-right text-muted-foreground">
										{formatNumber(node.levelElevationM, 1)}
									</td>
									<td class="max-w-xs text-muted-foreground">
										{node.description ?? '—'}
									</td>
									<td class="text-center">
										<span
											class="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-medium text-foreground"
										>
											{node.isActive ? 'Yes' : 'No'}
										</span>
									</td>
									<td class="text-right">
										<div class="flex justify-end gap-2">
											<Dialog.Root
												open={activeEditId === node.id}
												onOpenChange={(open) =>
													(activeEditId =
														open ? node.id : activeEditId === node.id ? null : activeEditId)}
											>
												<Dialog.Trigger>
													{#snippet child({ props })}
														<Button size="icon" variant="outline" aria-label="Edit survey point" {...props}>
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
															<div class="space-y-2">
																<label class="text-sm font-medium text-foreground" for={`name-${node.id}`}>
																	Name
																</label>
																<Input
																	id={`name-${node.id}`}
																	name="name"
																	required
																	value={node.name}
																/>
															</div>
															<div class="space-y-2">
																<label class="text-sm font-medium text-foreground" for={`code-${node.id}`}>
																	Code
																</label>
																<Input id={`code-${node.id}`} name="code" value={node.code ?? ''} />
															</div>
															<div class="space-y-2">
																<label class="text-sm font-medium text-foreground" for={`level-${node.id}`}>
																	Level name
																</label>
																<Input
																	id={`level-${node.id}`}
																	name="levelName"
																	value={node.levelName ?? ''}
																/>
															</div>
															<div class="space-y-2">
																<label
																	class="text-sm font-medium text-foreground"
																	for={`elevation-${node.id}`}
																>
																	Elevation (mRL)
																</label>
																<Input
																	id={`elevation-${node.id}`}
																	name="levelElevationM"
																	type="number"
																	step="0.1"
																	value={node.levelElevationM ?? ''}
																/>
															</div>
														</div>
														<div class="space-y-2">
															<label class="text-sm font-medium text-foreground" for={`desc-${node.id}`}>
																Description
															</label>
															<Textarea
																id={`desc-${node.id}`}
																name="description"
																rows={3}
																value={node.description ?? ''}
															/>
														</div>
														<label class="flex items-center gap-2 text-sm font-medium text-foreground">
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
													(activeDeleteId =
														open ? node.id : activeDeleteId === node.id ? null : activeDeleteId)}
											>
												<Dialog.Trigger>
													{#snippet child({ props })}
														<Button size="icon" variant="outline" aria-label="Delete survey point" {...props}>
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
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</section>
