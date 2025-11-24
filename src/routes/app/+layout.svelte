<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { ModeWatcher, toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import UserIcon from '@lucide/svelte/icons/user';
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
	const selectedMine = derived(
		selectedMineId,
		($id) => data.mines.find((mine: MineSummary) => mine.id === $id) ?? null
	);
	const navItems = [
		{ name: 'Dashboard', href: '/app/dashboard' },
		{ name: 'Mines', href: '/app/mines' },
		{ name: 'Survey points', href: '/app/survey-points' },
		{ name: 'Surveys', href: '/app/surveys' },
		{ name: 'Guidance', href: '/app/guidance' }
	];

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
				: (data.mines[0]?.id ?? null);
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

<ModeWatcher />
<div class="min-h-screen flex flex-col bg-background text-foreground transition-colors">
	<header class="border-b border-border/70 bg-card/80 backdrop-blur">
		<div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
			<a
				href="/app/dashboard"
				class="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground"
			>
				<span aria-hidden="true" class="text-primary">◆</span>
				<span>Ventlog</span>
			</a>
			<nav
				class="hidden items-center gap-2 rounded-full bg-muted/60 px-2 py-1 text-sm font-medium text-muted-foreground sm:flex"
			>
				{#each navItems as item}
					{@const active = $page.url.pathname.startsWith(item.href)}
					<a
						class={`rounded-full px-3 py-1 transition-colors ${active ? 'bg-primary/15 text-foreground ring-1 ring-primary/40' : 'hover:text-foreground'}`}
						href={item.href}
					>
						{item.name}
						{#if active}
							<span class="sr-only">(current)</span>
						{/if}
					</a>
				{/each}
			</nav>
			<div class="flex items-center gap-2">
				<Button variant="outline" size="icon" aria-label="Toggle theme" onclick={toggleMode}>
					<SunIcon
						class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
					/>
					<MoonIcon
						class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
					/>
					<span class="sr-only">Toggle theme</span>
				</Button>
				<Button variant="outline" size="icon" aria-label="Account">
					<UserIcon class="h-[1.2rem] w-[1.2rem]" />
					<span class="sr-only">Account</span>
				</Button>
			</div>
		</div>
	</header>

	<main class="flex-1 mx-auto max-w-6xl w-full px-4 py-10 sm:px-6">
		<div class="mb-4 flex gap-3 text-sm font-medium text-muted-foreground sm:hidden">
			{#each navItems as item}
				{@const active = $page.url.pathname.startsWith(item.href)}
				<a
					class={`rounded-md px-2 py-1 ${active ? 'bg-primary/15 text-foreground' : 'hover:text-foreground'}`}
					href={item.href}
				>
					{item.name}
				</a>
			{/each}
		</div>
		{@render children()}
	</main>

	<footer class="border-t border-border/60 bg-card/80 text-xs text-muted-foreground">
		<div
			class="mx-auto flex max-w-6xl w-full flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6"
		>
			<span>Ventlog · Underground ventilation survey toolkit</span>
			<div class="flex items-center gap-3">
				<span>v0.1.0</span>
				<a class="hover:text-foreground" href="/api/docs">API docs</a>
			</div>
		</div>
	</footer>
</div>
