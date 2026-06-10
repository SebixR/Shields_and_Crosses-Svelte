<script lang="ts">
	import { BicepsFlexedIcon, BrainIcon, CircleIcon, SportShoeIcon, XIcon } from '@lucide/svelte';
	import { Badge } from './ui/badge';
	import { gameService } from '$lib/services/GameService.svelte';
	import { Button } from './ui/button';
</script>

<div class="-ms-16 flex flex-row gap-2">
	<div class="flex flex-col justify-end gap-1">
		{#each gameService.gameView.boardStats?.rowStats as stat (stat)}
			<div class="flex h-14 items-center">
				<Badge variant="outline" class="w-full text-sm">
					{#if stat === 'strength'}
						<BicepsFlexedIcon />
						<span>str</span>
					{:else if stat === 'speed'}
						<SportShoeIcon />
						<span>spd</span>
					{:else}
						<BrainIcon />
						<span>int</span>
					{/if}
				</Badge>
			</div>
		{/each}
	</div>

	<div class="flex flex-col gap-2">
		<div class="flex flex-row justify-between">
			{#each gameService.gameView.boardStats?.colStats as stat (stat)}
				<Badge variant="outline" class="w-14 text-sm">
					{#if stat === 'strength'}
						<BicepsFlexedIcon />
						<span>str</span>
					{:else if stat === 'speed'}
						<SportShoeIcon />
						<span>spd</span>
					{:else}
						<BrainIcon />
						<span>int</span>
					{/if}
				</Badge>
			{/each}
		</div>

		<div class="grid grid-cols-3 gap-1 bg-muted">
			{#each gameService.gameView.board as cell, index (index)}
				<div class="size-14 bg-background">
					<Button
						class="size-14 border-none"
						variant={gameService.gameView.winningPattern?.includes(index) ? 'default' : 'ghost'}
						onclick={() => gameService.makeMove(index)}
						disabled={!gameService.gameView.playersTurn ||
							!gameService.gameView.playerAvailableCells.has(index) ||
							!!gameService.gameView.winner}
					>
						{#if cell === 'X'}
							<XIcon class="size-7" />
						{:else if cell === 'O'}
							<CircleIcon class="size-6" />
						{/if}
					</Button>
				</div>
			{/each}
		</div>
	</div>
</div>
