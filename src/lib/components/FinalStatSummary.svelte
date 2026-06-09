<script lang="ts">
	import { statistics } from '$lib/types/stats';
	import { ChevronDownIcon, ChevronUpIcon, EqualIcon } from '@lucide/svelte';
	import { gameService } from '$lib/services/GameService.svelte';
	import StatisticBadge from './StatisticBadge.svelte';
	import { boundStatistics } from '$lib/types/class';
	import Separator from './ui/separator/separator.svelte';
</script>

{#if gameService.gameView.playerCharacter && gameService.gameView.cpuCharacter}
	<Separator />
	<div class="flex flex-row justify-between gap-2">
		<span><strong>{gameService.gameView.playerCharacter.name}</strong> (player):</span>
		<div>
			<StatisticBadge
				statisticName="strength"
				statisticValue={gameService.gameView.playerCharacter.strength}
				isBound={boundStatistics[gameService.gameView.playerCharacter.class] === 'strength'}
			/>
			<StatisticBadge
				statisticName="speed"
				statisticValue={gameService.gameView.playerCharacter.speed}
				isBound={boundStatistics[gameService.gameView.playerCharacter.class] === 'speed'}
			/>
			<StatisticBadge
				statisticName="intelligence"
				statisticValue={gameService.gameView.playerCharacter.intelligence}
				isBound={boundStatistics[gameService.gameView.playerCharacter.class] === 'intelligence'}
			/>
		</div>
	</div>

	<div class="flex flex-row justify-end gap-1">
		{#each statistics as stat (stat)}
			<div class="w-18">
				{#if gameService.gameView.playerCharacter[stat] > gameService.gameView.cpuCharacter[stat]}
					<ChevronDownIcon class="m-auto" />
				{:else if gameService.gameView.playerCharacter[stat] === gameService.gameView.cpuCharacter[stat]}
					<EqualIcon class="m-auto rotate-90" />
				{:else}
					<ChevronUpIcon class="m-auto" />
				{/if}
			</div>
		{/each}
	</div>

	<div class="flex flex-row justify-between gap-2">
		<span><strong>{gameService.gameView.cpuCharacter.name}</strong> (CPU):</span>
		<div>
			<StatisticBadge
				statisticName="strength"
				statisticValue={gameService.gameView.cpuCharacter.strength}
				isBound={boundStatistics[gameService.gameView.cpuCharacter.class] === 'strength'}
			/>
			<StatisticBadge
				statisticName="speed"
				statisticValue={gameService.gameView.cpuCharacter.speed}
				isBound={boundStatistics[gameService.gameView.cpuCharacter.class] === 'speed'}
			/>
			<StatisticBadge
				statisticName="intelligence"
				statisticValue={gameService.gameView.cpuCharacter.intelligence}
				isBound={boundStatistics[gameService.gameView.cpuCharacter.class] === 'intelligence'}
			/>
		</div>
	</div>
{/if}
