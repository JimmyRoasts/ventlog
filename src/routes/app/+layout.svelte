<script lang="ts">
	import { onMount } from 'svelte';

	let isDark = false;

	onMount(() => {
		const html = document.documentElement;
		isDark = html.classList.contains('dark');
		if (!isDark) {
			html.classList.remove('dark');
		}
	});

	const toggleDarkMode = () => {
		isDark = !isDark;
		document.documentElement.classList.toggle('dark', isDark);
	};
</script>

<div class="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
	<header class="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
			<div class="flex items-center gap-6">
				<a href="/app/dashboard" class="text-lg font-semibold tracking-tight">Ventlog</a>
				<nav class="hidden gap-4 text-sm font-medium sm:flex">
					<a class="hover:text-blue-600 dark:hover:text-blue-400" href="/app/dashboard">Dashboard</a>
					<a class="hover:text-blue-600 dark:hover:text-blue-400" href="/app/mines">Mines</a>
					<a class="hover:text-blue-600 dark:hover:text-blue-400" href="/app/surveys">Surveys</a>
					<a class="hover:text-blue-600 dark:hover:text-blue-400" href="/app/guidance">Guidance</a>
				</nav>
			</div>
			<button
				type="button"
				class="rounded-md border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm font-medium shadow-sm transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
				on:click={toggleDarkMode}
				aria-pressed={isDark}
			>
				{isDark ? 'Switch to light' : 'Switch to dark'}
			</button>
		</div>
	</header>

	<main class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
		<div class="mb-4 flex gap-3 text-sm font-medium sm:hidden">
			<a class="hover:text-blue-600 dark:hover:text-blue-400" href="/app/dashboard">Dashboard</a>
			<a class="hover:text-blue-600 dark:hover:text-blue-400" href="/app/mines">Mines</a>
			<a class="hover:text-blue-600 dark:hover:text-blue-400" href="/app/surveys">Surveys</a>
			<a class="hover:text-blue-600 dark:hover:text-blue-400" href="/app/guidance">Guidance</a>
		</div>
		<slot />
	</main>
</div>
