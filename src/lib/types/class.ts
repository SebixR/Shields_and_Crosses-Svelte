import type { Statistic } from './stats';

export const classes = ['warrior', 'rogue', 'mage'] as const;

export type Class = (typeof classes)[number];

export const boundStatistics: Record<Class, Statistic> = {
	warrior: 'strength',
	rogue: 'speed',
	mage: 'intelligence'
};
