<script lang="ts">
	import { BicepsFlexedIcon, BrainIcon, SportShoeIcon } from '@lucide/svelte';
	import { Badge } from './ui/badge';
	import type { Statistic } from '$lib/types/stats';

	const {
		statisticName,
		statisticValue,
		isBound
	}: { statisticName: Statistic; statisticValue: number; isBound: boolean } = $props();

	let isAnimating = $state(false);
	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const current = statisticValue;

		isAnimating = false;

		requestAnimationFrame(() => {
			isAnimating = true;

			setTimeout(() => {
				isAnimating = false;
			}, 200);
		});
	});

	const statisticShortName = $derived(
		statisticName === 'strength' ? 'str' : statisticName === 'speed' ? 'spd' : 'int'
	);
</script>

<Badge
	variant={isBound ? 'default' : 'secondary'}
	class="w-18 text-sm {isAnimating ? 'pulse' : ''}"
>
	{#if statisticName === 'strength'}
		<BicepsFlexedIcon />
	{:else if statisticName === 'speed'}
		<SportShoeIcon />
	{:else if statisticName === 'intelligence'}
		<BrainIcon />
	{/if}
	{statisticShortName}
	<span>
		{statisticValue}
	</span>
</Badge>

<style>
	:global(.pulse) {
		animation: pulse 0.3s ease-in-out;
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1);
		}
		100% {
			transform: scale(1);
		}
	}
</style>
