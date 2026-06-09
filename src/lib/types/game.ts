import type { CharacterPlayer } from './character';
import type { Statistic } from './stats';

export type GameSymbol = 'O' | 'X';

export type BoardStats = { rowStats: Statistic[]; colStats: Statistic[] };

export type Cell = GameSymbol | null;

export type Winner = 'draw' | 'player' | 'CPU';

export interface GameState {
	playerCharacter?: CharacterPlayer;
	cpuCharacter?: CharacterPlayer;
	board: Cell[];
	boardStats?: BoardStats;
	playersTurn: boolean;
	playerAvailableCells: Set<number>;
	calculatingPoints: boolean;
	winner?: Winner;
	winningPattern?: [number, number, number];
	pointsHistory: BonusPointDescription[];
}

export interface BonusPointDescription {
	points: number;
	description: string;
	characterName: string;
	playerOrCpu: 'player' | 'CPU';
	statistic: Statistic;
}
export const BONUS_DOUBLE = 'secured a double advantage in their primary statistic';
export const BONUS_WIN = 'won in Tic-Tac-Toe';
export const BONUS_WIN_WITH_BOUND_STAT =
	'won via a row/column corresponding to their primary statistic';
