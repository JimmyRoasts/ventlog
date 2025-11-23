<script lang="ts">
	import { browser } from '$app/environment';
	import { setContext } from 'svelte';
	import { derived, writable, type Readable, type Writable } from 'svelte/store';
	import type { LayoutData } from './$types';

	type MineSummary = LayoutData['mines'][number];
	type MineContext = {
		mines: LayoutData['mines'];
		selectedMineId: Writable<string | null>;
		selectedMine: Readable<{ id: string; name: string } | null>;
	};

	const { children, data }: { children: any; data: LayoutData } = $props();

	const selectedMineId = writable<string | null>(null);
	const selectedMine = derived(selectedMineId, ($id) => data.mines.find((mine: MineSummary) => mine.id === $id) ?? null);

	setContext<MineContext>('currentMine', {
		mines: data.mines,
		selectedMineId,
		selectedMine
	});

	if (browser) {
		const storedMineId = localStorage.getItem('ventlog:currentMineId');
		const initialMineId =
			storedMineId && data.mines.some((mine: MineSummary) => mine.id === storedMineId)
				? storedMineId
				: data.mines[0]?.id ?? null;
		selectedMineId.set(initialMineId);

		selectedMineId.subscribe((value) => {
			if (value) {
				localStorage.setItem('ventlog:currentMineId', value);
			} else {
				localStorage.removeItem('ventlog:currentMineId');
			}
		});
	}
</script>

<div class="min-h-screen bg-background text-foreground transition-colors">
	<header class="border-b border-border/80 bg-card/80 backdrop-blur">
		<div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
			<div class="flex items-center gap-6">
				<a href="/app/dashboard" class="text-lg font-semibold tracking-tight text-foreground">Ventlog</a>
				<nav class="hidden gap-4 text-sm font-medium sm:flex text-muted-foreground">
					<a class="hover:text-foreground" href="/app/dashboard">Dashboard</a>
					<a class="hover:text-foreground" href="/app/mines">Mines</a>
					<a class="hover:text-foreground" href="/app/nodes">Survey points</a>
					<a class="hover:text-foreground" href="/app/surveys">Surveys</a>
					<a class="hover:text-foreground" href="/app/guidance">Guidance</a>
				</nav>
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
		<div class="mb-4 flex gap-3 text-sm font-medium text-muted-foreground sm:hidden">
			<a class="hover:text-foreground" href="/app/dashboard">Dashboard</a>
			<a class="hover:text-foreground" href="/app/mines">Mines</a>
			<a class="hover:text-foreground" href="/app/nodes">Survey points</a>
			<a class="hover:text-foreground" href="/app/surveys">Surveys</a>
			<a class="hover:text-foreground" href="/app/guidance">Guidance</a>
		</div>
		{@render children()}
	</main>
</div>
