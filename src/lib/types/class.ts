import type { Statistic } from './stats';

export const classes = ['warrior', 'rogue', 'mage'] as const;
export const classLabels: Record<Class, string> = {
	warrior: 'Warrior',
	rogue: 'Rogue',
	mage: 'Mage'
};

export type Class = (typeof classes)[number];

export const boundStatistics: Record<Class, Statistic> = {
	warrior: 'strength',
	rogue: 'speed',
	mage: 'intelligence'
};
