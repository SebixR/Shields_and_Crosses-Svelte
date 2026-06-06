<script lang="ts">
	import { DicesIcon, MedalIcon, PlayIcon, RepeatIcon, RotateCcwIcon } from '@lucide/svelte';
	import { gameService } from '../../GameService.svelte';
	import { Button } from './ui/button';
	import { Card } from './ui/card';
	import GameBoard from './GameBoard.svelte';
	import GameCharacterCard from './GameCharacterCard.svelte';
	import PointsHistory from './PointsHistory.svelte';
</script>

<div class="flex flex-row gap-2">
	<Button disabled={gameService.calculatingPoints} onclick={() => gameService.startGame()}
		>{#if !gameService.playerCharacter || !gameService.cpuCharacter}
			<DicesIcon />
		{:else}
			<PlayIcon />
		{/if}
		Play</Button
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

		{#if gameService.playerCharacter && gameService.cpuCharacter}
			<GameBoard />
		{/if}

		{#if gameService.calculatingPoints}
			<span>Calculating points...</span>
		{/if}

		{#if gameService.winner}
			<div class="flex w-full flex-col items-center gap-2">
				<PointsHistory />

				<Card class="w-fit border-primary p-3">
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
			</div>
		{/if}
	</Card>
{/if}
