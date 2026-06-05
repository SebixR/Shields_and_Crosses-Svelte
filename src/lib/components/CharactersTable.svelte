<script lang="ts">
	import { characterService } from '$lib/CharacterService.svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import { classLabels } from '$lib/types/class';
	import { Button } from './ui/button';
	import { BicepsFlexed, Brain, PenIcon, SportShoe, Trash2Icon } from '@lucide/svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
</script>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head class="w-36">Name</Table.Head>
			<Table.Head>Class</Table.Head>
			<Table.Head><BicepsFlexed class="m-auto" size="20" /></Table.Head>
			<Table.Head><SportShoe class="m-auto" size="20" /></Table.Head>
			<Table.Head><Brain class="m-auto" size="20" /></Table.Head>
			<Table.Head><span class="block w-full text-center">W/L</span></Table.Head>
		</Table.Row>
	</Table.Header>
	{#key characterService.characters}
		<Table.Body>
			{#each characterService.characters as character (character.id)}
				<Table.Row>
					<Table.Cell class="font-medium">{character.name}</Table.Cell>
					<Table.Cell>{classLabels[character.class]}</Table.Cell>
					<Table.Cell class="text-center">{character.strength}</Table.Cell>
					<Table.Cell class="text-center">{character.speed}</Table.Cell>
					<Table.Cell class="text-center">{character.intelligence}</Table.Cell>
					<Table.Cell class="text-center">{character.wins}/{character.losses}</Table.Cell>
					<Table.Cell class="text-end">
						<Dialog.Root>
							<Dialog.Trigger>
								<Button variant="destructive" size="icon">
									<Trash2Icon />
								</Button>
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
