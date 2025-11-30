<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Table from '$lib/components/ui/table';
	import { FlexRender, createSvelteTable, renderSnippet } from '$lib/components/ui/data-table';
	import { getContext } from 'svelte';
	import {
		type ColumnDef,
		type FilterFn,
		type Row,
		type RowSelectionState,
		type Table as TanTable,
		type VisibilityState,
		getCoreRowModel,
		getFilteredRowModel
	} from '@tanstack/table-core';
	import { derived, writable, type Readable, type Writable } from 'svelte/store';
	import type { ActionData, PageData } from './$types';
	import type { SubmitFunction } from '@sveltejs/kit';

	type MineContext = {
		mines: { id: string; name: string }[];
		selectedMineId: Writable<string | null>;
		selectedMine: Readable<{ id: string; name: string } | null>;
	};

	type SurveyRow = {
		id: string;
		surveyDatetime: string;
		mineName: string;
		title: string | null;
		createdBy: string | null;
	};

	let { data, form }: { data: PageData; form: ActionData | null } = $props();

	const mineContext = getContext<MineContext>('currentMine');
	const mines = mineContext?.mines ?? data.mines ?? [];
	const selectedMineId = mineContext?.selectedMineId ?? writable<string | null>(null);
	const selectedMine = mineContext?.selectedMine ?? derived([], () => null);

	const defaultSurveyDatetime = (() => {
		const now = new Date();
		now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
		return now.toISOString().slice(0, 16);
	})();

	const actionErrors =
		form && 'errors' in form ? (form.errors as Record<string, string> | undefined) : undefined;

	let surveyOpen = $state(false);
	let deleteSelectedOpen = $state(false);
	let rowSelection = $state<RowSelectionState>({});
	let columnVisibility = $state<VisibilityState>({
		surveyDatetime: true,
		mineName: true,
		title: true,
		createdBy: true
	});
	let globalFilter = $state('');

	const tableData: SurveyRow[] = data.surveys.map((s) => ({
		id: s.id,
		surveyDatetime: new Date(s.surveyDatetime).toISOString(),
		mineName: s.mine.name,
		title: s.title,
		createdBy: s.createdBy?.fullName ?? null
	}));

	const globalFilterFn: FilterFn<SurveyRow> = (row, _columnId, value) => {
		const query = String(value ?? '')
			.trim()
			.toLowerCase();
		if (!query) return true;
		const { mineName, title, createdBy, surveyDatetime } = row.original;
		return (
			mineName.toLowerCase().includes(query) ||
			(title ?? '').toLowerCase().includes(query) ||
			(createdBy ?? '').toLowerCase().includes(query) ||
			new Date(surveyDatetime).toLocaleString().toLowerCase().includes(query)
		);
	};

	const columns: ColumnDef<SurveyRow>[] = [
		{
			id: 'select',
			header: ({ table }) => renderSnippet(selectAllHeader, { table }),
			cell: ({ row }) => renderSnippet(rowSelectCell, { row }),
			enableSorting: false,
			enableHiding: false,
			size: 48
		},
		{
			accessorKey: 'surveyDatetime',
			header: 'Date and time',
			cell: ({ getValue }) => new Date(getValue<string>()).toLocaleString()
		},
		{
			accessorKey: 'mineName',
			header: 'Mine'
		},
		{
			accessorKey: 'title',
			header: 'Title',
			cell: ({ getValue }) => getValue<string | null>() ?? '—'
		},
		{
			accessorKey: 'createdBy',
			header: 'Created by',
			cell: ({ getValue }) => getValue<string | null>() ?? '—'
		},
		{
			id: 'actions',
			header: '',
			cell: ({ row }) => renderSnippet(actionCell, { id: row.original.id }),
			enableSorting: false,
			enableHiding: false
		}
	];

	const table = createSvelteTable({
		data: tableData,
		columns,
		getRowId: (row) => row.id,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		enableRowSelection: true,
		globalFilterFn,
		state: {
			get rowSelection() {
				return rowSelection;
			},
			get columnVisibility() {
				return columnVisibility;
			},
			get globalFilter() {
				return globalFilter;
			}
		},
		onRowSelectionChange: (updater) => {
			rowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
		},
		onColumnVisibilityChange: (updater) => {
			columnVisibility =
				typeof updater === 'function' ? updater(columnVisibility) : (updater ?? columnVisibility);
		},
		onGlobalFilterChange: (updater) => {
			globalFilter = typeof updater === 'function' ? updater(globalFilter) : String(updater ?? '');
		}
	});

	const selectedSurveyIds = $derived(
		table.getSelectedRowModel().rows.map((row) => row.original.id)
	);

	const formEnhance =
		(onSuccess: () => void): SubmitFunction =>
		() =>
		async ({ result, update }) => {
			await update();
			if (result.type === 'success') {
				onSuccess();
			}
		};
</script>

<section class="space-y-4">
	<Card>
		<CardHeader class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
			<div>
				<p class="text-sm font-medium text-foreground">Current mine</p>
				<p class="text-xs text-muted-foreground">Surveys will default to this mine.</p>
			</div>
			{#if mines.length === 0}
				<p class="text-sm text-muted-foreground">No mines available.</p>
			{:else if mines.length === 1}
				<p class="text-sm font-medium text-foreground">{mines[0].name}</p>
			{:else if selectedMineId}
				<select
					class="border-input bg-background selection:bg-primary selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground shadow-xs h-9 rounded-md border px-3 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
					bind:value={$selectedMineId}
					aria-label="Select current mine"
				>
					{#each mines as mine}
						<option value={mine.id}>{mine.name}</option>
					{/each}
				</select>
			{:else}
				<p class="text-sm text-muted-foreground">Select a mine to start surveying.</p>
			{/if}
		</CardHeader>
	</Card>

	<Card>
		<CardHeader class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
			<div>
				<CardTitle class="text-2xl">Surveys</CardTitle>
				<p class="mt-2 text-muted-foreground">
					This will list surveys and allow creating new ones with guided measurement steps.
				</p>
			</div>
			{#if mines.length > 0}
				<div class="flex flex-wrap items-center gap-2">
					{#if selectedSurveyIds.length > 0}
						<Dialog.Root bind:open={deleteSelectedOpen}>
							<Dialog.Trigger>
								{#snippet child({ props })}
									<Button variant="destructive" {...props}>
										{selectedSurveyIds.length > 1
											? `Delete selected (${selectedSurveyIds.length})`
											: 'Delete'}
									</Button>
								{/snippet}
							</Dialog.Trigger>
							<Dialog.Content>
								<Dialog.Header>
									<Dialog.Title>Delete selected surveys?</Dialog.Title>
									<Dialog.Description>
										This removes the chosen surveys and all of their readings. This cannot be
										undone.
									</Dialog.Description>
								</Dialog.Header>
								<form
									method="POST"
									action="?/deleteSelected"
									class="mt-4 flex justify-end gap-2"
									use:enhance={formEnhance(() => {
										rowSelection = {};
										deleteSelectedOpen = false;
									})}
								>
									{#each selectedSurveyIds as id}
										<input type="hidden" name="surveyIds" value={id} />
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
					<Dialog.Root bind:open={surveyOpen}>
						<Dialog.Trigger>
							{#snippet child({ props })}
								<Button variant="default" {...props}>New survey</Button>
							{/snippet}
						</Dialog.Trigger>
						<Dialog.Content>
							<Dialog.Header>
								<Dialog.Title>New survey</Dialog.Title>
								<Dialog.Description>
									Surveys will default to the current mine. Add notes to describe the run.
								</Dialog.Description>
							</Dialog.Header>
							<form
								class="space-y-4"
								method="POST"
								action="?/create"
								use:enhance={formEnhance(() => (surveyOpen = false))}
							>
								<div class="space-y-2">
									<label class="text-sm font-medium text-foreground" for="survey-mine">Mine</label>
									<select
										id="survey-mine"
										name="mineId"
										class="border-input bg-background selection:bg-primary selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground shadow-xs h-9 w-full rounded-md border px-3 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
										bind:value={$selectedMineId}
										aria-invalid={Boolean(actionErrors?.mineId)}
									>
										{#each mines as mine}
											<option value={mine.id}>{mine.name}</option>
										{/each}
									</select>
									{#if actionErrors?.mineId}
										<p class="text-xs text-destructive">{actionErrors.mineId}</p>
									{/if}
								</div>
								<div class="grid gap-4 sm:grid-cols-2">
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
										<label class="text-sm font-medium text-foreground" for="survey-title"
											>Title</label
										>
										<Input id="survey-title" name="title" placeholder="Primary fans check" />
									</div>
								</div>
								<div class="space-y-2">
									<label class="text-sm font-medium text-foreground" for="survey-notes">Notes</label
									>
									<Textarea
										id="survey-notes"
										name="notes"
										placeholder="Any context, weather, shift notes..."
										rows={4}
									/>
								</div>
								<div class="flex justify-end gap-2">
									<Dialog.Close>
										{#snippet child({ props })}
											<Button type="button" variant="outline" {...props}>Cancel</Button>
										{/snippet}
									</Dialog.Close>
									<Button type="submit">Create survey</Button>
								</div>
							</form>
						</Dialog.Content>
					</Dialog.Root>
				</div>
			{/if}
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="flex flex-wrap items-center gap-3">
				<Input
					placeholder="Filter surveys..."
					value={globalFilter}
					oninput={(event) => table.setGlobalFilter(event.currentTarget.value)}
					class="w-full max-w-sm"
				/>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button variant="outline" size="sm" {...props}>Columns</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-48">
						{#each table.getAllLeafColumns().filter((column) => column.getCanHide()) as column}
							<DropdownMenu.CheckboxItem
								checked={column.getIsVisible()}
								onCheckedChange={(value) => column.toggleVisibility(Boolean(value))}
							>
								{String(column.columnDef.header)}
							</DropdownMenu.CheckboxItem>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>

			<div class="overflow-hidden rounded-lg border border-border shadow-sm">
				<Table.Root class="min-w-full">
					<Table.Header>
						{#each table.getHeaderGroups() as headerGroup}
							<Table.Row class="bg-muted text-left text-sm font-semibold text-foreground/90">
								{#each headerGroup.headers as header}
									<Table.Head class="px-4 py-3" colspan={header.colSpan}>
										{#if !header.isPlaceholder}
											<FlexRender
												content={header.column.columnDef.header}
												context={header.getContext()}
											/>
										{/if}
									</Table.Head>
								{/each}
							</Table.Row>
						{/each}
					</Table.Header>
					<Table.Body class="divide-y divide-border bg-card text-sm text-foreground">
						{#if table.getRowModel().rows.length === 0}
							<Table.Row>
								<Table.Cell
									colspan={table.getAllLeafColumns().length}
									class="px-4 py-6 text-center"
								>
									<p class="text-sm text-muted-foreground">
										No surveys yet. Create one to start logging readings.
									</p>
								</Table.Cell>
							</Table.Row>
						{:else}
							{#each table.getRowModel().rows as row}
								<Table.Row
									class="hover:bg-muted/70"
									data-state={row.getIsSelected() ? 'selected' : undefined}
								>
									{#each row.getVisibleCells() as cell}
										<Table.Cell class="px-4 py-3 align-middle">
											<FlexRender
												content={cell.column.columnDef.cell}
												context={cell.getContext()}
											/>
										</Table.Cell>
									{/each}
								</Table.Row>
							{/each}
						{/if}
					</Table.Body>
				</Table.Root>
			</div>
		</CardContent>
	</Card>
</section>

{#snippet selectAllHeader({ table }: { table: TanTable<SurveyRow> })}
	<div class="flex items-center">
		<Checkbox
			checked={table.getIsAllPageRowsSelected()}
			indeterminate={table.getIsSomePageRowsSelected()}
			onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
			aria-label="Select all surveys"
			class="h-4 w-4"
		/>
	</div>
{/snippet}

{#snippet rowSelectCell({ row }: { row: Row<SurveyRow> })}
	<Checkbox
		checked={row.getIsSelected()}
		indeterminate={row.getIsSomeSelected()}
		onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
		aria-label={`Select survey ${row.original.title ?? row.original.id}`}
		class="h-4 w-4"
	/>
{/snippet}

{#snippet actionCell({ id }: { id: string })}
	<div class="flex justify-end">
		<Button href={`/app/surveys/${id}`} variant="outline" size="sm">Open</Button>
	</div>
{/snippet}
