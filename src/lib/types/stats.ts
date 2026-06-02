export const MAX_STAT_VALUE = 5;

export const statistics = ['strength', 'speed', 'intelligence'] as const;
export const statLabels: Record<Statistic, string> = {
	strength: 'Strength',
	speed: 'Speed',
	intelligence: 'Intelligence'
};

export type Statistic = (typeof statistics)[number];
