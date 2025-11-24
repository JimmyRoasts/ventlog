<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
</script>

<Card class="space-y-4">
	<CardHeader>
		<CardTitle class="text-2xl">Dashboard</CardTitle>
	</CardHeader>
	<CardContent class="space-y-3">
		<p class="text-muted-foreground">
			This will surface recent surveys, key mines, and quick links so the team can jump straight
			into current ventilation work.
		</p>
		<div class="flex flex-wrap gap-3">
			<Button href="/app/surveys" variant="default">View surveys</Button>
			<Button href="/app/mines" variant="outline">View mines</Button>
		</div>
	</CardContent>
</Card>
