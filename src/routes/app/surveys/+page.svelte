<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { getContext } from 'svelte';
	import { derived, writable, type Readable, type Writable } from 'svelte/store';
	import type { ActionData, PageData } from './$types';
	import type { SubmitFunction } from '@sveltejs/kit';

	type MineContext = {
		mines: { id: string; name: string }[];
		selectedMineId: Writable<string | null>;
		selectedMine: Readable<{ id: string; name: string } | null>;
	};

	let { data, form }: { data: PageData; form: ActionData | null } = $props();

	const mineContext = getContext<MineContext>('currentMine');
	const mines = mineContext?.mines ?? data.mines ?? [];
	const selectedMineId = mineContext?.selectedMineId ?? writable<string | null>(null);
	const selectedMine = mineContext?.selectedMine ?? derived([], () => null);
	const defaultSurveyDatetime = (() => {
		const now = new Date();
		// Ensure local time renders correctly in datetime-local input
		now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
		return now.toISOString().slice(0, 16);
	})();

	const actionErrors =
		form && 'errors' in form ? (form.errors as Record<string, string> | undefined) : undefined;

	let surveyOpen = $state(false);

	const formEnhance = (onSuccess: () => void): SubmitFunction =>
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
									<label class="text-sm font-medium text-foreground" for="survey-datetime">Date & time</label>
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
									<Input id="survey-title" name="title" placeholder="Primary fans check" />
								</div>
							</div>
							<div class="space-y-2">
								<label class="text-sm font-medium text-foreground" for="survey-notes">Notes</label>
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
			{/if}
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
							<th class="px-4 py-3 text-right">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border bg-card text-sm text-foreground">
						{#if data.surveys.length === 0}
							<tr>
								<td class="px-4 py-4 text-center text-muted-foreground" colspan={5}>
									No surveys yet. Create one to start logging readings.
								</td>
							</tr>
						{:else}
							{#each data.surveys as survey}
								<tr class="hover:bg-muted/70">
									<td class="px-4 py-3 font-medium text-foreground">
										{new Date(survey.surveyDatetime).toLocaleString()}
									</td>
									<td class="px-4 py-3 text-muted-foreground">{survey.mine.name}</td>
									<td class="px-4 py-3 text-muted-foreground">{survey.title ?? '—'}</td>
									<td class="px-4 py-3 text-muted-foreground">
										{survey.createdBy?.fullName ?? '—'}
									</td>
									<td class="px-4 py-3 text-right">
										<Button href={`/app/surveys/${survey.id}`} variant="outline" size="sm">
											Open
										</Button>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</CardContent>
	</Card>
</section>
