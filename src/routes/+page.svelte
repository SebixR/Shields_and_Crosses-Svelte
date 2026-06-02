<script lang="ts">
	import Form from '$lib/components/Form.svelte';
	import { CircleIcon, XIcon } from '@lucide/svelte';
</script>

<div class="flex w-full flex-col items-center gap-4">
	<div class="mt-4 inline-flex items-center gap-2">
		<CircleIcon />
		<h1 class="text-2xl text-primary-foreground">Shields & Crosses</h1>
		<XIcon />
	</div>

	<Form />
</div>
