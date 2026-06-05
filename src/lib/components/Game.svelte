<script lang="ts">
	import { MedalIcon, PlayIcon, RepeatIcon, RotateCcwIcon } from '@lucide/svelte';
	import { gameService } from '../../GameService.svelte';
	import { Button } from './ui/button';
	import { Card } from './ui/card';
	import GameBoard from './GameBoard.svelte';
	import GameCharacterCard from './GameCharacterCard.svelte';

	let pressedPlay = $state(false);
</script>

<div class="flex flex-row gap-2">
	<Button
		onclick={() => {
			pressedPlay = true;
			gameService.startGame();
		}}><PlayIcon /> Play</Button
	>
	<Button
		disabled={!gameService.playerCharacter && !gameService.cpuCharacter}
		onclick={() => {
			gameService.playerCharacter = undefined;
			gameService.cpuCharacter = undefined;
		}}><RotateCcwIcon /> Reset</Button
	>
</div>

{#if gameService.playerCharacter && gameService.cpuCharacter}
	<Card class="mb-32 flex flex-col items-center gap-4 p-4">
		<div class="flex flex-row items-center gap-4">
			<GameCharacterCard character={gameService.playerCharacter} />VS<GameCharacterCard
				character={gameService.cpuCharacter}
			/>
		</div>

		{#if pressedPlay}
			<GameBoard />
		{/if}

		{#if gameService.calculatingPoints}
			<span>Calculating points...</span>
		{/if}

		{#if gameService.winner}
			<Card class="border-primary">
				{#if gameService.winner === 'draw'}
					<div class="flex flex-row items-center gap-3">
						<RepeatIcon />
						<span> Draw!</span>
					</div>
				{:else}
					<div class="flex flex-row items-center gap-3">
						<span>Winner: {gameService.winner.name}</span>
						<MedalIcon />
					</div>
				{/if}
			</Card>
		{/if}
	</Card>
{/if}
