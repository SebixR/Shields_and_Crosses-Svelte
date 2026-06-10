<script lang="ts">
	import { gameService } from '$lib/services/GameService.svelte';
	import { RotateCcwIcon } from '@lucide/svelte';
	import { Button } from './ui/button';
	import { Card } from './ui/card';
	import CharactersTable from './CharactersTable.svelte';

	const onClickReset = async () => {
		gameService.playerCharacter = undefined;
		gameService.cpuCharacter = undefined;

		gameService.resetGame();
	};
</script>

<Card class="p-4">
	<div class="flex items-center justify-between">
		<span class="text-lg text-primary-foreground">Characters</span>
		<Button
			disabled={!gameService.gameView.playerCharacter && !gameService.gameView.cpuCharacter}
			onclick={() => onClickReset()}><RotateCcwIcon /> Reset</Button
		>
	</div>

	<CharactersTable />
</Card>
