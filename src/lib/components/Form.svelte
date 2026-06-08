<script lang="ts">
	import { MAX_STAT_VALUE, type Statistic } from '$lib/types/stats';
	import { Alert, AlertTitle } from './ui/alert';
	import { CircleAlertIcon } from '@lucide/svelte/icons';
	import { Card } from './ui/card';
	import { Input } from './ui/input';
	import * as Select from '$lib/components/ui/select/index.js';
	import { boundStatistics, classes, classLabels } from '$lib/types/class';
	import { Separator } from './ui/separator';
	import { Button } from './ui/button';
	import { Spinner } from './ui/spinner';
	import StatInput from './StatInput.svelte';
	import { characterService } from '$lib/services/CharacterService.svelte';
	import { BASE_CHARACTER } from '$lib/types/character';

	let availablePoints = $derived<number>(
		MAX_STAT_VALUE -
			(characterService.formCharacter.strength +
				characterService.formCharacter.speed +
				characterService.formCharacter.intelligence)
	);

	const onDecreaseStat = (statistic: Statistic) => {
		const form = characterService.formCharacter;
		const currentVal = form[statistic];

		if (currentVal <= 0) {
			form[statistic] = 0;
			return;
		}
		if (currentVal > MAX_STAT_VALUE) {
			form[statistic] = MAX_STAT_VALUE;
			return;
		}

		form[statistic]--;
	};

	const onIncreaseStat = (statistic: Statistic) => {
		const form = characterService.formCharacter;
		const currentVal = form[statistic];

		if (currentVal < 0) {
			form[statistic] = 0;
			return;
		}
		if (currentVal >= MAX_STAT_VALUE) {
			form[statistic] = MAX_STAT_VALUE;
			return;
		}
		if (availablePoints == 0) return;

		form[statistic]++;
	};

	const errors = $state<Record<string, string[]>>({
		name: [],
		stats: []
	});

	const validate = (): boolean => {
		const form = characterService.formCharacter;

		errors.name = [];
		errors.stats = [];

		let isValid = true;

		if (form.name === '') {
			errors.name.push("Name can't be empty");
			isValid = false;
		}

		let statSum = form.strength + form.speed + form.intelligence;
		if (statSum > 5) {
			errors.stats.push('Sum of statistics must be < 6 (currently is ' + statSum + ')');
			isValid = false;
		}

		return isValid;
	};

	const resetForm = () => {
		characterService.formCharacter = BASE_CHARACTER;
	};

	let isLoading = $state(false);
	let isError = $state(false);

	const submitForm = async () => {
		if (!validate()) return;
		isLoading = true;

		try {
			if ('id' in characterService.formCharacter) await characterService.edit();
			else await characterService.create();

			isLoading = false;

			resetForm();
		} catch {
			isError = true;
			isLoading = false;

			setTimeout(() => {
				isError = false;
			}, 5000);
		}
	};
</script>

<div class="absolute top-4">
	{#if isError}
		<Alert variant="destructive">
			<CircleAlertIcon />
			<AlertTitle>Something went wrong</AlertTitle>
		</Alert>
	{/if}
</div>

<Card class="w-90 px-4">
	<form onsubmit={submitForm} class="form">
		<span class="pb-2 text-primary-foreground">Create a character</span>

		<div class="field">
			<p>Name</p>
			<Input type="text" placeholder="Name" bind:value={characterService.formCharacter.name} />
		</div>
		{#each errors.name as msg, i (i)}
			<div class="errors">
				{msg}
			</div>
		{/each}

		<div class="field">
			<p>Class</p>

			<Select.Root type="single" bind:value={characterService.formCharacter.class}>
				<Select.Trigger class="w-full">
					{classLabels[characterService.formCharacter.class] +
						' - ' +
						boundStatistics[characterService.formCharacter.class]}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						{#each classes as cls, i (i)}
							<Select.Item value={cls}
								>{classLabels[cls] + ' - ' + boundStatistics[cls]}</Select.Item
							>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>
		</div>

		<Separator class="my-4" />
		<span>Available points: {availablePoints}</span>

		<div class="field">
			<StatInput
				stat="strength"
				{onDecreaseStat}
				{onIncreaseStat}
				form={characterService.formCharacter}
				{availablePoints}
			/>
		</div>

		<div class="field">
			<StatInput
				stat="speed"
				{onDecreaseStat}
				{onIncreaseStat}
				form={characterService.formCharacter}
				{availablePoints}
			/>
		</div>

		<div class="field">
			<StatInput
				stat="intelligence"
				{onDecreaseStat}
				{onIncreaseStat}
				form={characterService.formCharacter}
				{availablePoints}
			/>
		</div>

		{#each errors.stats as msg, i (i)}
			<div class="errors">
				{msg}
			</div>
		{/each}

		<Separator class="my-4" />

		<div class="flex flex-row justify-end gap-2">
			{#if 'id' in characterService.formCharacter}
				<Button onclick={resetForm} class="cursor-pointer">Cancel</Button>
			{/if}
			<Button class="cursor-pointer" type="submit" disabled={isLoading}>
				{#if isLoading}
					<Spinner class="animate-spin" />
				{/if}

				{#if 'id' in characterService.formCharacter}
					Edit
				{:else}
					Create
				{/if}
			</Button>
		</div>
	</form>
</Card>

<style scoped>
	.errors {
		font-size: var(--text-sm);
		color: var(--destructive);
	}

	.field {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 16px;
		margin-top: 12px;
		margin-bottom: 12px;
	}

	span {
		user-select: none;
	}
</style>
