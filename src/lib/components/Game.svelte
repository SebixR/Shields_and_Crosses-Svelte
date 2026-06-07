<script lang="ts">
	import { DicesIcon, PlayIcon, RepeatIcon, RotateCcwIcon } from '@lucide/svelte';
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
	<Card class="relative mb-32 flex flex-col items-center gap-4 p-4">
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

				{#if gameService.winner === 'draw'}
					<Card
						class="absolute top-2 w-fit border-primary px-4 py-3 shadow-[0_0_10px_2px_var(--primary)]"
					>
						<div class="flex flex-row items-center gap-3">
							<RepeatIcon />
							<span> Draw!</span>
						</div>
					</Card>
				{/if}
			</div>
		{/if}
	</Card>
{/if}
