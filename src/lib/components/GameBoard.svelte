<script lang="ts">
	import { BicepsFlexedIcon, BrainIcon, CircleIcon, SportShoeIcon, XIcon } from '@lucide/svelte';
	import { Badge } from './ui/badge';
	import { gameService } from '../../GameService.svelte';
	import { Button } from './ui/button';
</script>

<div class="-ms-16 flex flex-row gap-2">
	<div class="flex flex-col justify-end gap-2">
		{#each gameService.boardStats?.rowStats as stat (stat)}
			<div class="flex h-8 items-center">
				<Badge variant="outline" class="w-14 text-sm">
					{#if stat === 'strength'}
						<BicepsFlexedIcon class="w-14" />
						<span>str</span>
					{:else if stat === 'speed'}
						<SportShoeIcon class="w-14" />
						<span>spd</span>
					{:else}
						<BrainIcon class="w-14" />
						<span>int</span>
					{/if}
				</Badge>
			</div>
		{/each}
	</div>

	<div class="flex flex-col gap-2">
		<div class="flex flex-row justify-between">
			{#each gameService.boardStats?.colStats as stat (stat)}
				<Badge variant="outline" class="w-14 text-sm">
					{#if stat === 'strength'}
						<BicepsFlexedIcon class="w-14" />
						<span>str</span>
					{:else if stat === 'speed'}
						<SportShoeIcon class="w-14" />
						<span>spd</span>
					{:else}
						<BrainIcon class="w-14" />
						<span>int</span>
					{/if}
				</Badge>
			{/each}
		</div>

		<div class="grid w-48 grid-cols-3 gap-2">
			{#each gameService.board as cell, index (index)}
				<Button
					variant={gameService.winningPattern?.includes(index) ? 'default' : 'outline'}
					onclick={() => gameService.makeMove(index)}
					disabled={!gameService.playersTurn || !gameService.playerAvailableCells.has(index)}
				>
					{#if cell === 'X'}
						<XIcon class="size-5" />
					{:else if cell === 'O'}
						<CircleIcon />
					{/if}
				</Button>
			{/each}
		</div>
	</div>
</div>
