<script lang="ts">
	import type { CharacterPlayer } from '$lib/types/character';
	import { boundStatistics, classLabels } from '$lib/types/class';
	import { MedalIcon } from '@lucide/svelte';
	import StatisticBadge from './StatisticBadge.svelte';
	import { Card } from './ui/card';
	import { gameService } from '$lib/services/GameService.svelte';

	const { character, owner }: { character: CharacterPlayer; owner: 'player' | 'CPU' } = $props();
</script>

<div
	class={`relative ${gameService.gameView.winner === owner ? 'shadow-[0_0_10px_2px_var(--primary)]' : ''}`}
>
	{#if gameService.gameView.winner === owner}
		<MedalIcon class="absolute -top-2 -right-2 z-1" />
	{/if}
	<Card class=" flex flex-col gap-3 p-4">
		<span class="w-full text-center">{character.name} ({classLabels[character.class]})</span>
		<div class="flex w-full flex-row items-center justify-between gap-2">
			<StatisticBadge
				statisticName="strength"
				statisticValue={character.strength}
				isBound={boundStatistics[character.class] === 'strength'}
			/>
			<StatisticBadge
				statisticName="speed"
				statisticValue={character.speed}
				isBound={boundStatistics[character.class] === 'speed'}
			/>
			<StatisticBadge
				statisticName="intelligence"
				statisticValue={character.intelligence}
				isBound={boundStatistics[character.class] === 'intelligence'}
			/>
		</div>
		<span class={`${character.swapsLeft === 0 ? 'text-border' : ''}`}
			>Swaps left: {character.swapsLeft}</span
		></Card
	>
</div>
