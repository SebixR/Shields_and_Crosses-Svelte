import {
	characterService,
	getCharacterById,
	getRandomExcludingId
} from './CharacterService.svelte';
import type { CharacterPlayer } from '$lib/types/character';
import { boundStatistics } from '$lib/types/class';
import {
	BONUS_DOUBLE,
	BONUS_WIN,
	BONUS_WIN_WITH_BOUND_STAT,
	type Cell,
	type GameState,
	type GameSymbol,
	type Winner
} from '$lib/types/game';
import { statistics, type Statistic } from '$lib/types/stats';

export const TOTAL_SWAPS = 1;

export const PLAYER_SYMBOL: GameSymbol = 'X';
export const CPU_SYMBOL: GameSymbol = 'O';

export const winPatterns: [number, number, number][] = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6]
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class GameService {
	#gameState: GameState = {
		board: [],
		playersTurn: false,
		playerAvailableCells: new Set([...Array(9).keys()]),
		calculatingPoints: false,
		pointsHistory: []
	};
	// Svelte only creates Proxies for existing fields, so these 'undefined' values have to be here
	#gameView = $state<GameState>({
		playerCharacter: undefined,
		cpuCharacter: undefined,
		board: [],
		boardStats: undefined,
		playersTurn: false,
		playerAvailableCells: new Set([...Array(9).keys()]),
		winner: undefined,
		winningPattern: undefined,
		calculatingPoints: false,
		pointsHistory: []
	});

	get gameView() {
		return this.#gameView;
	}
	set playerCharacter(character: CharacterPlayer | undefined) {
		this.#gameState.playerCharacter = character;
		this.#gameView.playerCharacter = character;
	}
	set cpuCharacter(character: CharacterPlayer | undefined) {
		this.#gameState.cpuCharacter = character;
		this.#gameView.cpuCharacter = character;
	}

	constructor() {
		this.rollBoardStats();
	}

	updateGameView(skipUpdatingCharacters?: boolean) {
		if (!skipUpdatingCharacters) {
			this.#gameView = {
				...this.#gameState,
				board: [...this.#gameState.board],
				boardStats: this.#gameState.boardStats ? { ...this.#gameState.boardStats } : undefined,
				playerAvailableCells: new Set(this.#gameState.playerAvailableCells),
				winningPattern: this.#gameState.winningPattern
					? [...this.#gameState.winningPattern]
					: undefined,
				pointsHistory: [...this.#gameState.pointsHistory]
			};
		} else {
			this.#gameView.board = [...this.#gameState.board];
			this.#gameView.boardStats = this.#gameState.boardStats
				? { ...this.#gameState.boardStats }
				: undefined;
			this.#gameView.playersTurn = this.#gameState.playersTurn;
			this.#gameView.playerAvailableCells = new Set(this.#gameState.playerAvailableCells);
			this.#gameView.winner = this.#gameState.winner;
			this.#gameView.winningPattern = this.#gameState.winningPattern
				? [...this.#gameState.winningPattern]
				: undefined;
			this.#gameView.calculatingPoints = this.#gameState.calculatingPoints;
			this.#gameView.pointsHistory = [...this.#gameState.pointsHistory];
		}
	}
	updatePlayerCharacter() {
		if (this.#gameState.playerCharacter)
			this.#gameView.playerCharacter = { ...this.#gameState.playerCharacter };
	}
	updateCpuCharacter() {
		if (this.#gameState.cpuCharacter)
			this.#gameView.cpuCharacter = { ...this.#gameState.cpuCharacter };
	}

	async startGame() {
		try {
			await this.resetGame();

			if (!this.#gameState.playerCharacter) {
				const playerRecord = await getRandomExcludingId(-1);
				if (!playerRecord) throw new Error('Player character is undefined');
				this.#gameState.playerCharacter = { ...playerRecord, swapsLeft: TOTAL_SWAPS };
			}

			if (!this.#gameState.cpuCharacter) {
				let cpuRecord = await getRandomExcludingId(this.#gameState.playerCharacter.id);
				if (!cpuRecord) {
					cpuRecord = await getCharacterById(this.#gameState.playerCharacter.id);
					if (!cpuRecord) throw new Error('CPU character is undefined');
				}
				this.#gameState.cpuCharacter = { ...cpuRecord, swapsLeft: TOTAL_SWAPS };
			}

			this.rollBoardStats();

			this.updateGameView();
		} catch (error) {
			console.error('Failed to get random CPU character', error);
			throw error;
		}
	}

	rollBoardStats() {
		this.#gameState.boardStats = {
			rowStats: [...statistics].sort(() => Math.random() - 0.5),
			colStats: [...statistics].sort(() => Math.random() - 0.5)
		};
	}

	async resetGame() {
		try {
			this.#gameState.board = Array(9).fill(null);
			this.#gameState.playersTurn = true;
			this.#gameState.playerAvailableCells = new Set([...Array(9).keys()]);
			this.#gameState.winner = undefined;
			this.#gameState.calculatingPoints = false;
			this.#gameState.winningPattern = undefined;
			this.#gameState.pointsHistory = [];

			if (this.#gameState.playerCharacter) {
				const playerRecord = await getCharacterById(this.#gameState.playerCharacter.id);
				if (!playerRecord) throw new Error("Couldn't find player character");

				this.#gameState.playerCharacter.strength = playerRecord.strength;
				this.#gameState.playerCharacter.speed = playerRecord.speed;
				this.#gameState.playerCharacter.intelligence = playerRecord.intelligence;

				this.#gameState.playerCharacter.swapsLeft = TOTAL_SWAPS;
			}
			if (this.#gameState.cpuCharacter) {
				const cpuRecord = await getCharacterById(this.#gameState.cpuCharacter.id);
				if (!cpuRecord) throw new Error("Couldn't find CPU character");

				this.#gameState.cpuCharacter.strength = cpuRecord.strength;
				this.#gameState.cpuCharacter.speed = cpuRecord.speed;
				this.#gameState.cpuCharacter.intelligence = cpuRecord.intelligence;

				this.#gameState.cpuCharacter.swapsLeft = TOTAL_SWAPS;
			}

			this.updateGameView();
		} catch (error) {
			console.error('Failed to reset game', error);
			throw error;
		}
	}

	async makeMove(index: number) {
		try {
			if (!this.#gameState.playerCharacter || !this.#gameState.cpuCharacter) return;

			if (!this.#gameState.playerAvailableCells.has(index))
				throw new Error('The player has no available moves');

			await this.handleMakeMove(index, this.#gameState.playerCharacter, true);
			this.#gameState.playersTurn = false;
			this.updateGameView(true);
			this.updatePlayerCharacter();
			if (this.#gameState.winner) return;

			// CPU move
			const cells = this.getAvailableCells(
				this.#gameState.cpuCharacter,
				this.#gameState.playerCharacter
			);
			const cpuIndex = this.CPUMove(cells);
			if (cpuIndex === undefined) {
				console.error('CPU has no available moves');
				return;
			}

			await this.handleMakeMove(cpuIndex, this.#gameState.cpuCharacter, false);
			if (!this.#gameState.winner) await this.waitRandomDelay();

			// update which cells are available to the player
			const availableCellsTemp = this.getAvailableCells(
				this.#gameState.playerCharacter,
				this.#gameState.cpuCharacter
			);
			this.#gameState.playerAvailableCells = new Set([
				...availableCellsTemp.availableCells,
				...availableCellsTemp.swappableCells
			]);

			this.#gameState.playersTurn = true;

			this.updateGameView(true);
			this.updateCpuCharacter();
		} catch (error) {
			console.error('Failed to make move at index: ' + index, error);
			throw error;
		}
	}

	// character - the character that is making a move
	async handleMakeMove(index: number, character: CharacterPlayer, isPlayer: boolean) {
		try {
			if (!this.#gameState.playerCharacter || !this.#gameState.cpuCharacter)
				throw new Error("Player's character or CPU's character is undefined");

			const symbol = isPlayer ? PLAYER_SYMBOL : CPU_SYMBOL;
			const opponentSymbol = isPlayer ? CPU_SYMBOL : PLAYER_SYMBOL;
			const opponentCharacter = isPlayer
				? this.#gameState.cpuCharacter
				: this.#gameState.playerCharacter;

			// handle swapping
			if (this.#gameState.board[index] === opponentSymbol) {
				this.subtractStats(index, opponentCharacter);
				character.swapsLeft--;
			}

			// make move
			this.#gameState.board[index] = symbol;

			this.addStats(index, character);
			const gameEnded = this.checkWin(symbol);
			if (gameEnded) {
				this.#gameState.playersTurn = false;
				this.#gameState.calculatingPoints = true;

				if (gameEnded.result === 'win') {
					this.#gameState.winningPattern = gameEnded.pattern;

					if (!isPlayer) await this.waitRandomDelay();
					this.updateGameView();

					await this.calculateBonuses(character, opponentCharacter, false, this.getWinningStat());
				} else if (gameEnded.result === 'draw') {
					if (!isPlayer) await this.waitRandomDelay();
					this.updateGameView();

					const random: boolean = Math.random() < 0.5;
					await this.calculateBonuses(
						random ? character : opponentCharacter,
						random ? opponentCharacter : character,
						true,
						null
					);
				}
				this.#gameState.calculatingPoints = false;

				this.#gameState.winner = this.decideWinner() ?? undefined;
				if (this.#gameState.winner && this.#gameState.winner !== 'draw') {
					const winnerId =
						this.#gameState.winner === 'player'
							? this.#gameState.playerCharacter.id
							: this.#gameState.cpuCharacter.id;
					const loserId =
						this.#gameState.winner === 'player'
							? this.#gameState.cpuCharacter.id
							: this.#gameState.playerCharacter.id;

					await characterService.updateWL(winnerId, loserId, this.#gameState.winner === 'player');
				}

				return;
			}
		} catch (error) {
			console.error('Failed to handle move to: ' + index, error);
			throw error;
		}
	}

	getAvailableCells(
		character: CharacterPlayer,
		opponentCharacter: CharacterPlayer
	): {
		losingCells: Set<number>;
		availableCells: Set<number>;
		swappableCells: Set<number>;
	} {
		const cells: {
			losingCells: Set<number>;
			availableCells: Set<number>;
			swappableCells: Set<number>;
		} = {
			losingCells: new Set(),
			availableCells: new Set(),
			swappableCells: new Set()
		};

		// add empty cells
		for (let i = 0; i < this.#gameState.board.length; i++) {
			if (!this.#gameState.board[i]) cells.availableCells.add(i);
		}

		// handle swapping and losing cells
		let opponentSymbol;
		let symbol;
		if (opponentCharacter === this.#gameState.playerCharacter) {
			opponentSymbol = PLAYER_SYMBOL;
			symbol = CPU_SYMBOL;
		} else {
			opponentSymbol = CPU_SYMBOL;
			symbol = PLAYER_SYMBOL;
		}
		for (const [a, b, c] of winPatterns) {
			if (
				!this.#gameState.board[a] &&
				this.#gameState.board[b] === opponentSymbol &&
				this.#gameState.board[c] === this.#gameState.board[b]
			) {
				const tempBoardB = [...this.#gameState.board];
				tempBoardB[b] = symbol;
				const bWins = this.checkWin(symbol, tempBoardB);

				const tempBoardC = [...this.#gameState.board];
				tempBoardC[c] = symbol;
				const cWins = this.checkWin(symbol, tempBoardC);

				if (!cWins) cells.swappableCells.add(c);
				if (!bWins) cells.swappableCells.add(b);
				cells.losingCells.add(a);
			}
			if (
				this.#gameState.board[a] === opponentSymbol &&
				!this.#gameState.board[b] &&
				this.#gameState.board[c] === this.#gameState.board[a]
			) {
				const tempBoardA = [...this.#gameState.board];
				tempBoardA[a] = symbol;
				const aWins = this.checkWin(symbol, tempBoardA);

				const tempBoardC = [...this.#gameState.board];
				tempBoardC[c] = symbol;
				const cWins = this.checkWin(symbol, tempBoardC);

				if (!cWins) cells.swappableCells.add(c);
				if (!aWins) cells.swappableCells.add(a);
				cells.losingCells.add(b);
			}
			if (
				this.#gameState.board[a] === opponentSymbol &&
				this.#gameState.board[b] === this.#gameState.board[a] &&
				!this.#gameState.board[c]
			) {
				const tempBoardA = [...this.#gameState.board];
				tempBoardA[a] = symbol;
				const aWins = this.checkWin(symbol, tempBoardA);

				const tempBoardB = [...this.#gameState.board];
				tempBoardB[b] = symbol;
				const bWins = this.checkWin(symbol, tempBoardB);

				if (!bWins) cells.swappableCells.add(b);
				if (!aWins) cells.swappableCells.add(a);
				cells.losingCells.add(c);
			}
		}

		// check swaps left
		if (character.swapsLeft <= 0) cells.swappableCells = new Set<number>();
		else {
			// check statistics
			const boundStatistic: Statistic = boundStatistics[character.class];
			for (const stat of statistics) {
				if (stat === boundStatistic && character[stat] <= opponentCharacter[stat]) {
					cells.swappableCells = new Set<number>();
				}
				if (stat !== boundStatistic && character[stat] >= opponentCharacter[stat])
					cells.swappableCells = new Set<number>();
			}
		}

		return cells;
	}

	// returns the index of the cell chosen by the CPU
	// returns undefined if there are no free cells (game should have ended already)
	CPUMove(cells: {
		losingCells: Set<number>;
		availableCells: Set<number>;
		swappableCells: Set<number>;
	}): number | undefined {
		// check if can win, and if yes do so
		const board = this.#gameState.board;
		for (const [a, b, c] of winPatterns) {
			if (!board[a] && board[b] === CPU_SYMBOL && board[c] === CPU_SYMBOL) return a;
			if (board[a] === CPU_SYMBOL && !board[b] && board[c] === CPU_SYMBOL) return b;
			if (board[a] === CPU_SYMBOL && board[b] === CPU_SYMBOL && !board[c]) return c;
		}

		// check if opponent can win
		if (cells.losingCells.size > 0) {
			// swap if possible
			if (cells.swappableCells.size > 0) {
				return [...cells.swappableCells][Math.floor(Math.random() * cells.swappableCells.size)];
			}

			// if not stop them normally
			return [...cells.losingCells][Math.floor(Math.random() * cells.losingCells.size)];
		}

		// take up a random empty cell
		if (cells.availableCells.size > 0)
			return [...cells.availableCells][Math.floor(Math.random() * cells.availableCells.size)];
	}

	checkWin(
		symbol: GameSymbol,
		tempBoard?: Cell[]
	): { result: 'win' | 'draw'; pattern?: [number, number, number] } | null {
		const board = tempBoard ? tempBoard : this.#gameState.board;

		for (const [a, b, c] of winPatterns) {
			const value = board[a];

			if (value && value === board[b] && value === board[c]) {
				if (value === symbol) return { result: 'win', pattern: [a, b, c] };
			}
		}

		if (board.every((cell) => cell)) {
			return { result: 'draw' };
		}

		return null;
	}

	async calculateBonuses(
		winnerCharacter: CharacterPlayer,
		loserCharacter: CharacterPlayer,
		wasDraw: boolean,
		winnerLine: Statistic | null
	) {
		const winnerBoundStat: Statistic = boundStatistics[winnerCharacter.class];
		const loserBoundStat: Statistic = boundStatistics[loserCharacter.class];

		await delay(500);

		// double lead in bound statistic
		if (!wasDraw) {
			// if winner won then they get to compare their bound stat first
			if (winnerCharacter[winnerBoundStat] >= loserCharacter[winnerBoundStat] * 2) {
				const lowestDiffStat = this.getLowestDiffStat(winnerCharacter, loserCharacter);
				winnerCharacter[lowestDiffStat] += 2;
				this.#gameState.pointsHistory.push({
					character: winnerCharacter,
					points: 2,
					description: BONUS_DOUBLE,
					statistic: lowestDiffStat
				});
			}

			if (loserCharacter[loserBoundStat] >= winnerCharacter[loserBoundStat] * 2) {
				const lowestDiffStat = this.getLowestDiffStat(loserCharacter, winnerCharacter);
				loserCharacter[lowestDiffStat] += 2;
				this.#gameState.pointsHistory.push({
					character: loserCharacter,
					points: 2,
					description: BONUS_DOUBLE,
					statistic: lowestDiffStat
				});
			}
		} else {
			// if there was a draw, then whoever has the higher bound stat goes first
			if (winnerCharacter[winnerBoundStat] >= loserCharacter[loserBoundStat]) {
				if (winnerCharacter[winnerBoundStat] >= loserCharacter[winnerBoundStat] * 2) {
					const lowestDiffStat = this.getLowestDiffStat(winnerCharacter, loserCharacter);
					winnerCharacter[lowestDiffStat] += 2;
					this.#gameState.pointsHistory.push({
						character: winnerCharacter,
						points: 2,
						description: BONUS_DOUBLE,
						statistic: lowestDiffStat
					});
				}

				if (loserCharacter[loserBoundStat] >= winnerCharacter[loserBoundStat] * 2) {
					const lowestDiffStat = this.getLowestDiffStat(loserCharacter, winnerCharacter);
					loserCharacter[lowestDiffStat] += 2;
					this.#gameState.pointsHistory.push({
						character: loserCharacter,
						points: 2,
						description: BONUS_DOUBLE,
						statistic: lowestDiffStat
					});
				}
			} else {
				if (loserCharacter[loserBoundStat] >= winnerCharacter[winnerBoundStat] * 2) {
					const lowestDiffStat = this.getLowestDiffStat(loserCharacter, winnerCharacter);
					loserCharacter[lowestDiffStat] += 2;
					this.#gameState.pointsHistory.push({
						character: loserCharacter,
						points: 2,
						description: BONUS_DOUBLE,
						statistic: lowestDiffStat
					});
				}

				if (winnerCharacter[winnerBoundStat] >= loserCharacter[winnerBoundStat] * 2) {
					const lowestDiffStat = this.getLowestDiffStat(winnerCharacter, loserCharacter);
					winnerCharacter[lowestDiffStat] += 2;
					this.#gameState.pointsHistory.push({
						character: winnerCharacter,
						points: 2,
						description: BONUS_DOUBLE,
						statistic: lowestDiffStat
					});
				}
			}
		}

		await delay(500);

		// for winning
		if (!wasDraw) {
			let lowestDiffStat = this.getLowestDiffStat(winnerCharacter, loserCharacter);
			winnerCharacter[lowestDiffStat] += 2;
			this.#gameState.pointsHistory.push({
				character: winnerCharacter,
				points: 2,
				description: BONUS_WIN,
				statistic: lowestDiffStat
			});

			// for winning with their column or row
			if (winnerLine === winnerBoundStat) {
				await delay(1000);
				lowestDiffStat = this.getLowestDiffStat(winnerCharacter, loserCharacter);
				winnerCharacter[lowestDiffStat] += 1;
				this.#gameState.pointsHistory.push({
					character: winnerCharacter,
					points: 1,
					description: BONUS_WIN_WITH_BOUND_STAT,
					statistic: lowestDiffStat
				});
			}
		}

		await delay(500);
	}

	getLowestDiffStat(
		receiverCharacter: CharacterPlayer,
		otherCharacter: CharacterPlayer
	): Statistic {
		if (receiverCharacter.strength === otherCharacter.strength) return 'strength';
		if (receiverCharacter.speed === otherCharacter.speed) return 'speed';
		if (receiverCharacter.intelligence === otherCharacter.intelligence) return 'intelligence';

		const strDiff: number =
			receiverCharacter.strength < otherCharacter.strength
				? otherCharacter.strength - receiverCharacter.strength
				: Infinity;
		const spdDiff: number =
			receiverCharacter.speed < otherCharacter.speed
				? otherCharacter.speed - receiverCharacter.speed
				: Infinity;
		const intDiff: number =
			receiverCharacter.intelligence < otherCharacter.intelligence
				? otherCharacter.intelligence - receiverCharacter.intelligence
				: Infinity;

		if (strDiff <= spdDiff && strDiff <= intDiff) return 'strength';
		else if (spdDiff <= strDiff && spdDiff <= intDiff) return 'speed';
		else return 'intelligence';
	}

	getWinningStat(): Statistic | null {
		if (!this.#gameState.winningPattern || !this.#gameState.boardStats) return null;

		const boardStats = this.#gameState.boardStats;

		switch (this.#gameState.winningPattern.join(',')) {
			case '0,1,2':
				return boardStats.rowStats[0] ?? null;
			case '3,4,5':
				return boardStats.rowStats[1] ?? null;
			case '6,7,8':
				return boardStats.rowStats[2] ?? null;

			case '0,3,6':
				return boardStats.colStats[0] ?? null;
			case '1,4,7':
				return boardStats.colStats[1] ?? null;
			case '2,5,8':
				return boardStats.colStats[2] ?? null;

			default:
				return null;
		}
	}

	decideWinner(): Winner | null {
		if (!this.#gameState.playerCharacter || !this.#gameState.cpuCharacter) return null;

		const playerCharacter = this.#gameState.playerCharacter;
		const cpuCharacter = this.#gameState.cpuCharacter;

		let playerWinCount = 0;
		let cpuWinCount = 0;

		for (const stat of statistics) {
			if (playerCharacter[stat] > cpuCharacter[stat]) playerWinCount++;
			if (playerCharacter[stat] < cpuCharacter[stat]) cpuWinCount++;
		}

		if (playerWinCount > cpuWinCount) return 'player';
		else if (cpuWinCount > playerWinCount) return 'CPU';
		else return null;
	}

	addStats(index: number, character: CharacterPlayer) {
		if (!this.#gameState.boardStats) return;

		const colStat: Statistic | undefined = this.#gameState.boardStats.colStats[index % 3];
		const rowStat: Statistic | undefined =
			this.#gameState.boardStats.rowStats[Math.floor(index / 3)];
		if (colStat && rowStat) {
			if (rowStat === colStat) {
				if (boundStatistics[character.class] === rowStat) character[rowStat] += 3;
				else character[rowStat] += 2;
			} else {
				character[colStat]++;
				character[rowStat]++;
			}
		}
	}

	subtractStats(index: number, character: CharacterPlayer) {
		if (!this.#gameState.boardStats) return;

		const colStat: Statistic | undefined = this.#gameState.boardStats.colStats[index % 3];
		const rowStat: Statistic | undefined =
			this.#gameState.boardStats.rowStats[Math.floor(index / 3)];
		if (colStat && rowStat) {
			if (rowStat === colStat) {
				if (boundStatistics[character.class] === rowStat) character[rowStat] -= 2;
				else character[rowStat] -= 1;
			} else {
				character[colStat]--;
				character[rowStat]--;
			}
		}
	}

	async waitRandomDelay() {
		await delay(Math.floor(Math.random() * (2000 - 500 + 1)) + 500);
	}
}

export const gameService = new GameService();
