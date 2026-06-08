<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { ChevronsUpDownIcon } from '@lucide/svelte';
	import { Card } from './ui/card';
	import FinalStatSummary from './FinalStatSummary.svelte';
	import { buttonVariants } from './ui/button';
	import { gameService } from '$lib/services/GameService.svelte';
	import { statLabels } from '$lib/types/stats';
</script>

<Card class="w-full border-primary p-3">
	<Collapsible.Root>
		<div class="flex items-center justify-between px-2">
			<Collapsible.Trigger class={buttonVariants({ variant: 'ghost', class: 'w-full' })}>
				Points
				<ChevronsUpDownIcon class="ms-auto" />
			</Collapsible.Trigger>
		</div>

		<Collapsible.Content class="flex flex-col gap-2 px-2 pt-2">
			{#each gameService.pointsHistory as hist, i (i)}
				<div class="max-w-130" style="overflow-wrap: anywhere;">
					<strong>{hist.character.name} </strong>

					{#if gameService.playerCharacter!.name === gameService.cpuCharacter!.name}
						{#if gameService.cpuCharacter === hist.character}
							(CPU)
						{:else}
							(player)
						{/if}
					{/if}

					{hist.description}:
					<i><b>+{hist.points}</b></i>
					points to <i><b>{statLabels[hist.statistic]}</b></i>
				</div>
			{/each}
			<FinalStatSummary />
		</Collapsible.Content>
	</Collapsible.Root>
</Card>
