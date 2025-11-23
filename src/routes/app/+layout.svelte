<script lang="ts">
	let { children } = $props();
</script>

<div class="min-h-screen bg-background text-foreground transition-colors">
	<header class="border-b border-border/80 bg-card/80 backdrop-blur">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
			<div class="flex items-center gap-6">
				<a href="/app/dashboard" class="text-lg font-semibold tracking-tight text-foreground">Ventlog</a>
				<nav class="hidden gap-4 text-sm font-medium sm:flex text-muted-foreground">
					<a class="hover:text-foreground" href="/app/dashboard">Dashboard</a>
					<a class="hover:text-foreground" href="/app/mines">Mines</a>
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
			<a class="hover:text-foreground" href="/app/surveys">Surveys</a>
			<a class="hover:text-foreground" href="/app/guidance">Guidance</a>
		</div>
		{@render children()}
	</main>
</div>
