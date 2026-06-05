<script lang="ts">
	import type { CharacterPlayer } from '$lib/types/character';
	import { boundStatistics, classLabels } from '$lib/types/class';
	import StatisticBadge from './StatisticBadge.svelte';
	import { Card } from './ui/card';

	const { character }: { character: CharacterPlayer } = $props();
</script>

<Card class="flex w-68 flex-col gap-3 p-4">
	<span class="w-full text-center">{character.name} ({classLabels[character.class]})</span>
	<div class="flex w-full flex-row items-center justify-between">
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
