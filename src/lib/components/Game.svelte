<script lang="ts">
	import { DicesIcon, RepeatIcon, RotateCcwIcon } from '@lucide/svelte';
	import { gameService } from '$lib/services/GameService.svelte';
	import { Button } from './ui/button';
	import { Card } from './ui/card';
	import GameBoard from './GameBoard.svelte';
	import GameCharacterCard from './GameCharacterCard.svelte';
	import PointsHistory from './PointsHistory.svelte';
	import { db } from '../../db';
	import { Alert } from './ui/alert';

	let noCharactersError = $state(false);

	const onClickPlay = async () => {
		gameService.startGame().catch(async () => {
			if ((await db.characters.count()) === 0) {
				noCharactersError = true;
				setTimeout(() => (noCharactersError = false), 4000);
			}
		});
	};
</script>

{#if noCharactersError}
	<Alert class="absolute top-4 w-fit py-3" variant="destructive">Create a character first!</Alert>
{/if}

<div class="flex flex-row gap-2">
	<Button onclick={() => onClickPlay()}
		>{#if !gameService.gameView.playerCharacter || !gameService.gameView.cpuCharacter}
			<DicesIcon /> Play
		{:else}
			<RotateCcwIcon /> Restart
		{/if}
	</Button>
</div>

{#if gameService.gameView.playerCharacter && gameService.gameView.cpuCharacter}
	<Card class="relative flex flex-col items-center gap-4 p-4">
		<div class="flex flex-row items-center gap-4">
			<GameCharacterCard character={gameService.gameView.playerCharacter} owner="player" />
			VS
			<GameCharacterCard character={gameService.gameView.cpuCharacter} owner="CPU" />
		</div>

		{#if gameService.gameView.playerCharacter && gameService.gameView.cpuCharacter}
			<GameBoard />
		{/if}

		{#if gameService.gameView.calculatingPoints}
			<span>Calculating points...</span>
		{/if}

		{#if gameService.gameView.winner}
			<div class="flex w-full flex-col items-center gap-2">
				<PointsHistory />

				{#if gameService.gameView.winner === 'draw'}
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
