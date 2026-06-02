<script lang="ts">
	import type { Character } from '$lib/types/character';
	import { MAX_STAT_VALUE, type Statistic } from '$lib/types/stats';
	import { Alert, AlertTitle } from './ui/alert';
	import { CircleCheck, CircleAlertIcon } from '@lucide/svelte/icons';
	import { Card } from './ui/card';
	import { Input } from './ui/input';
	import * as Select from '$lib/components/ui/select/index.js';
	import { boundStatistics, classes, classLabels } from '$lib/types/class';
	import { Separator } from './ui/separator';
	import { Button } from './ui/button';
	import { Spinner } from './ui/spinner';
	import StatInput from './StatInput.svelte';
	import { characterService } from '$lib/CharacterService.svelte';

	const form = $state<Character>({
		name: '',
		strength: 0,
		speed: 0,
		intelligence: 0,
		class: 'warrior'
	});

	let availablePoints = $state<number>(MAX_STAT_VALUE);

	const onDecreaseStat = (statistic: Statistic) => {
		if (form[statistic] <= 0) {
			form[statistic] = 0;
			return;
		}
		if (form[statistic] > MAX_STAT_VALUE) {
			form[statistic] = MAX_STAT_VALUE;
			return;
		}

		form[statistic]--;
		availablePoints++;
	};

	const onIncreaseStat = (statistic: Statistic) => {
		if (form[statistic] < 0) {
			form[statistic] = 0;
			return;
		}
		if (form[statistic] >= MAX_STAT_VALUE) {
			form[statistic] = MAX_STAT_VALUE;
			return;
		}
		if (availablePoints == 0) return;

		form[statistic]++;
		availablePoints--;
	};

	const errors = $state<Record<string, string[]>>({
		name: [],
		stats: []
	});

	const validate = (): boolean => {
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
		form.name = '';
		form.class = 'warrior';
		form.strength = 0;
		form.speed = 0;
		form.intelligence = 0;

		availablePoints = MAX_STAT_VALUE;
	};

	let isLoading = $state(false);
	let isSuccess = $state(false);
	let isError = $state(false);

	const submitForm = async () => {
		if (!validate()) return;
		isLoading = true;

		try {
			await characterService.create(form);

			isLoading = false;
			isSuccess = true;

			setTimeout(() => {
				isSuccess = false;
			}, 5000);

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
	{#if isSuccess}
		<Alert variant="default">
			<CircleCheck />
			<AlertTitle>Successfully created character</AlertTitle>
		</Alert>
	{/if}

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
			<Input type="text" placeholder="Name" bind:value={form.name} />
		</div>
		{#each errors.name as msg, i (i)}
			<div class="errors">
				{msg}
			</div>
		{/each}

		<div class="field">
			<p>Class</p>

			<Select.Root type="single" bind:value={form.class}>
				<Select.Trigger class="w-full">
					{classLabels[form.class] + ' - ' + boundStatistics[form.class]}
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
			<StatInput stat="strength" {onDecreaseStat} {onIncreaseStat} {form} {availablePoints} />
		</div>

		<div class="field">
			<StatInput stat="speed" {onDecreaseStat} {onIncreaseStat} {form} {availablePoints} />
		</div>

		<div class="field">
			<StatInput stat="intelligence" {onDecreaseStat} {onIncreaseStat} {form} {availablePoints} />
		</div>

		{#each errors.stats as msg, i (i)}
			<div class="errors">
				{msg}
			</div>
		{/each}

		<Separator class="my-4" />

		<div class="flex flex-row justify-end">
			<Button class="cursor-pointer rounded-lg" type="submit" disabled={isLoading}>
				{#if isLoading}
					<Spinner class="animate-spin" />
				{/if}
				Submit
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
