<script lang="ts">
	import { characterService } from '$lib/services/CharacterService.svelte';
	import Form from '$lib/components/Form.svelte';
	import Game from '$lib/components/Game.svelte';
	import RulesDrawer from '$lib/components/RulesDrawer.svelte';
	import { globalWLService } from '$lib/services/GlobalWLService.svelte';
	import { CircleIcon, XIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import CharactersTableWrapper from '$lib/components/CharactersTableWrapper.svelte';

	onMount(async () => {
		await characterService.init();
		globalWLService.init();
	});
</script>

<div class="flex w-full flex-col items-center gap-4">
	<div class="mt-4 inline-flex items-center gap-2">
		<CircleIcon />
		<h1 class="text-2xl text-primary-foreground">Shields & Crosses</h1>
		<XIcon />
	</div>

	<Form />

	<CharactersTableWrapper />

	<Game />

	<div class="h-[50svh]"></div>

	<RulesDrawer />
</div>
