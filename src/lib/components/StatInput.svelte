<script lang="ts">
	import type { Character } from '$lib/types/character';
	import { MAX_STAT_VALUE, statLabels, type Statistic } from '$lib/types/stats';
	import { MinusIcon, PlusIcon } from '@lucide/svelte';
	import { Button } from './ui/button';

	let {
		stat,
		onDecreaseStat,
		onIncreaseStat,
		form,
		availablePoints
	}: {
		stat: Statistic;
		onDecreaseStat: (stat: Statistic) => void;
		onIncreaseStat: (stat: Statistic) => void;
		form: Character;
		availablePoints: number;
	} = $props();
</script>

<p>{statLabels[stat]}</p>
<div class="flex flex-row items-center gap-1">
	<Button size="icon" type="button" onclick={() => onDecreaseStat(stat)} disabled={form[stat] <= 0}
		><MinusIcon /></Button
	>
	<span class="mx-2 w-2 select-none">{form[stat]}</span>
	<Button
		size="icon"
		type="button"
		onclick={() => onIncreaseStat(stat)}
		disabled={form[stat] >= MAX_STAT_VALUE || availablePoints == 0}><PlusIcon /></Button
	>
</div>
