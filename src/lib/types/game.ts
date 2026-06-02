import type { Statistic } from './stats';

export type GameSymbol = 'O' | 'X';

export type BoardStats = { rowStats: Statistic[]; colStats: Statistic[] };

export type Cell = GameSymbol | null;
