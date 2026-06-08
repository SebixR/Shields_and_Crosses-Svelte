<script lang="ts">
	import { statistics } from '$lib/types/stats';
	import { ChevronDownIcon, ChevronUpIcon, EqualIcon } from '@lucide/svelte';
	import { gameService } from '$lib/services/GameService.svelte';
	import StatisticBadge from './StatisticBadge.svelte';
	import { boundStatistics } from '$lib/types/class';
	import Separator from './ui/separator/separator.svelte';
</script>

{#if gameService.playerCharacter && gameService.cpuCharacter}
	<Separator />
	<div class="flex flex-row justify-between gap-2">
		<strong>{gameService.playerCharacter.name}:</strong>
		<div>
			<StatisticBadge
				statisticName="strength"
				statisticValue={gameService.playerCharacter.strength}
				isBound={boundStatistics[gameService.playerCharacter.class] === 'strength'}
			/>
			<StatisticBadge
				statisticName="speed"
				statisticValue={gameService.playerCharacter.speed}
				isBound={boundStatistics[gameService.playerCharacter.class] === 'speed'}
			/>
			<StatisticBadge
				statisticName="intelligence"
				statisticValue={gameService.playerCharacter.intelligence}
				isBound={boundStatistics[gameService.playerCharacter.class] === 'intelligence'}
			/>
		</div>
	</div>

	<div class="flex flex-row justify-end gap-1">
		{#each statistics as stat (stat)}
			<div class="w-18">
				{#if gameService.playerCharacter[stat] > gameService.cpuCharacter[stat]}
					<ChevronDownIcon class="m-auto" />
				{:else if gameService.playerCharacter[stat] === gameService.cpuCharacter[stat]}
					<EqualIcon class="m-auto rotate-90" />
				{:else}
					<ChevronUpIcon class="m-auto" />
				{/if}
			</div>
		{/each}
	</div>

	<div class="flex flex-row justify-between gap-2">
		<strong>{gameService.cpuCharacter.name}:</strong>
		<div>
			<StatisticBadge
				statisticName="strength"
				statisticValue={gameService.cpuCharacter.strength}
				isBound={boundStatistics[gameService.cpuCharacter.class] === 'strength'}
			/>
			<StatisticBadge
				statisticName="speed"
				statisticValue={gameService.cpuCharacter.speed}
				isBound={boundStatistics[gameService.cpuCharacter.class] === 'speed'}
			/>
			<StatisticBadge
				statisticName="intelligence"
				statisticValue={gameService.cpuCharacter.intelligence}
				isBound={boundStatistics[gameService.cpuCharacter.class] === 'intelligence'}
			/>
		</div>
	</div>
{/if}
