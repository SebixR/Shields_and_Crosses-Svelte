<script lang="ts">
	import type { CharacterPlayer } from '$lib/types/character';
	import { boundStatistics, classLabels } from '$lib/types/class';
	import { MedalIcon } from '@lucide/svelte';
	import StatisticBadge from './StatisticBadge.svelte';
	import { Card } from './ui/card';
	import { gameService } from '../../GameService.svelte';

	const { character }: { character: CharacterPlayer } = $props();
	let isWinner = $derived.by(() => {
		const currentWinner = gameService.winner;
		const currentCharacter = character;

		return currentWinner && currentWinner !== 'draw' && currentWinner === currentCharacter;
	});
</script>

<div class={`relative ${isWinner ? 'shadow-[0_0_10px_2px_var(--primary)]' : ''}`}>
	{#if isWinner}
		<MedalIcon class="absolute -top-2 -right-2 z-1" />
	{/if}
	<Card class=" flex w-68 flex-col gap-3 p-4">
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
</div>
