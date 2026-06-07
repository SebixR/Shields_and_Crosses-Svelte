<script lang="ts">
	import { characterService } from '$lib/CharacterService.svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import { classLabels } from '$lib/types/class';
	import { Button, buttonVariants } from './ui/button';
	import {
		BicepsFlexed,
		Brain,
		CpuIcon,
		PenIcon,
		SportShoe,
		Trash2Icon,
		UserIcon
	} from '@lucide/svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { gameService, TOTAL_SWAPS } from '../../GameService.svelte';
	import { Checkbox } from './ui/checkbox';
</script>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head class="w-6"><UserIcon class="m-auto" size="20" /></Table.Head>
			<Table.Head class="w-6"><CpuIcon class="m-auto" size="20" /></Table.Head>
			<Table.Head class="w-36">Name</Table.Head>
			<Table.Head>Class</Table.Head>
			<Table.Head><BicepsFlexed class="m-auto" size="20" /></Table.Head>
			<Table.Head><SportShoe class="m-auto" size="20" /></Table.Head>
			<Table.Head><Brain class="m-auto" size="20" /></Table.Head>
			<Table.Head>
				<div class="flex flex-row items-center gap-2">
					<UserIcon size="20" />
					<span>W/L</span>
				</div>
			</Table.Head>

			<Table.Head>
				<div class="flex flex-row items-center gap-2">
					<CpuIcon size="20" />
					<span>W/L</span>
				</div>
			</Table.Head>
		</Table.Row>
	</Table.Header>
	{#key characterService.characters}
		<Table.Body>
			{#each characterService.characters as character (character.id)}
				<Table.Row>
					<Table.Cell
						><Checkbox
							onCheckedChange={(checked) => {
								if (checked) gameService.playerCharacter = { ...character, swapsLeft: TOTAL_SWAPS };
								else gameService.playerCharacter = undefined;

								gameService.resetGame();
							}}
							checked={gameService.playerCharacter?.id === character.id}
						/></Table.Cell
					>
					<Table.Cell
						><Checkbox
							onCheckedChange={(checked) => {
								if (checked) gameService.cpuCharacter = { ...character, swapsLeft: TOTAL_SWAPS };
								else gameService.cpuCharacter = undefined;

								gameService.resetGame();
							}}
							checked={gameService.cpuCharacter?.id === character.id}
						/>
					</Table.Cell>
					<Table.Cell class="font-medium">{character.name}</Table.Cell>
					<Table.Cell>{classLabels[character.class]}</Table.Cell>
					<Table.Cell class="text-center">{character.strength}</Table.Cell>
					<Table.Cell class="text-center">{character.speed}</Table.Cell>
					<Table.Cell class="text-center">{character.intelligence}</Table.Cell>
					<Table.Cell class="text-center"
						>{character.playerWL.wins}/{character.playerWL.losses}</Table.Cell
					>
					<Table.Cell class="text-center"
						>{character.cpuWL.wins}/{character.cpuWL.losses}</Table.Cell
					>
					<Table.Cell class="text-end">
						<Dialog.Root>
							<Dialog.Trigger
								type="button"
								class={buttonVariants({ variant: 'destructive', size: 'icon' })}
							>
								<Trash2Icon />
							</Dialog.Trigger>
							<Dialog.Content>
								<Dialog.Header>
									<Dialog.Title>Delete character</Dialog.Title>
									<Dialog.Description
										>Are you sure you want to delete {character.name}?</Dialog.Description
									>
								</Dialog.Header>
								<div class="flex flex-row justify-between">
									<Dialog.Close>
										<Button
											onclick={() => characterService.delete(character.id)}
											variant="destructive">Delete {character.name}</Button
										>
									</Dialog.Close>

									<Dialog.Close>
										<Button variant="outline">Cancel</Button>
									</Dialog.Close>
								</div>
							</Dialog.Content>
						</Dialog.Root>

						<Button
							onclick={() => (characterService.formCharacter = { ...character })}
							class="me-1"
							variant="outline"
							size="icon"
						>
							<PenIcon />
						</Button>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	{/key}
</Table.Root>
