<script lang="ts">
	import '../app.css';
	import { ModeWatcher, toggleMode } from 'mode-watcher';
	import favicon from '$lib/assets/favicon.svg';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import UserIcon from '@lucide/svelte/icons/user';
	import { Button } from '$lib/components/ui/button';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
<div class="min-h-screen bg-background text-foreground transition-colors">
	<header class="border-b border-border/80 bg-card/80 backdrop-blur">
		<div class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
			<a href="/app/dashboard" class="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
				<span aria-hidden="true">⛑️</span>
				<span>Ventlog</span>
			</a>
			<div class="flex items-center gap-2">
				<Button variant="outline" size="icon" aria-label="Toggle theme" onclick={toggleMode}>
					<SunIcon class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<MoonIcon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					<span class="sr-only">Toggle theme</span>
				</Button>
				<Button variant="outline" size="icon" aria-label="Account">
					<UserIcon class="h-[1.2rem] w-[1.2rem]" />
				</Button>
			</div>
		</div>
	</header>
	<main class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
		{@render children()}
	</main>
</div>
