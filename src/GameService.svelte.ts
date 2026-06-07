import {
	characterService,
	getCharacterById,
	getRandomExcludingId
} from '$lib/CharacterService.svelte';
import type { CharacterPlayer } from '$lib/types/character';
import { boundStatistics } from '$lib/types/class';
import {
	BONUS_DOUBLE,
	BONUS_WIN,
	BONUS_WIN_WITH_BOUND_STAT,
	type BoardStats,
	type BonusPointDescription,
	type Cell,
	type GameSymbol
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

class GameService {
	#playerCharacter = $state<CharacterPlayer>();
	#cpuCharacter = $state<CharacterPlayer>();

	#board = $state<Cell[]>(Array(9).fill(null));
	#boardStats = $state<BoardStats>();

	#playersTurn = $state(true);
	#playerAvailableCells = $state(new Set([...Array(9).keys()]));

	#calculatingPoints = $state(false);
	#winner = $state<CharacterPlayer | 'draw'>();
	#winningPattern = $state<[number, number, number]>();

	#pointsHistory = $state<BonusPointDescription[]>([]);

	get playerCharacter() {
		return this.#playerCharacter;
	}
	set playerCharacter(character: CharacterPlayer | undefined) {
		this.#playerCharacter = character;
	}
	get cpuCharacter() {
		return this.#cpuCharacter;
	}
	set cpuCharacter(character: CharacterPlayer | undefined) {
		this.#cpuCharacter = character;
	}
	get board() {
		return this.#board;
	}
	get boardStats() {
		return this.#boardStats;
	}
	get playersTurn() {
		return this.#playersTurn;
	}
	get playerAvailableCells() {
		return this.#playerAvailableCells;
	}
	get calculatingPoints() {
		return this.#calculatingPoints;
	}
	get winner() {
		return this.#winner;
	}
	get winningPattern() {
		return this.#winningPattern;
	}
	get pointsHistory() {
		return this.#pointsHistory;
	}

	constructor() {
		this.rollBoardStats();
	}

	async startGame() {
		try {
			await this.resetGame();

			if (!this.#playerCharacter) {
				const playerRecord = await getRandomExcludingId(-1);
				if (!playerRecord) throw new Error('Player character is undefined');
				this.#playerCharacter = { ...playerRecord, swapsLeft: TOTAL_SWAPS };
			}

			if (!this.#cpuCharacter) {
				let cpuRecord = await getRandomExcludingId(this.#playerCharacter.id);
				if (!cpuRecord) {
					cpuRecord = await getCharacterById(this.#playerCharacter.id);
					if (!cpuRecord) throw new Error('CPU character is undefined');
				}
				this.#cpuCharacter = { ...cpuRecord, swapsLeft: TOTAL_SWAPS };
			}

			this.rollBoardStats();
		} catch (error) {
			console.error('Failed to get random CPU character', error);
			throw error;
		}
	}

	rollBoardStats() {
		this.#boardStats = {
			rowStats: [...statistics].sort(() => Math.random() - 0.5),
			colStats: [...statistics].sort(() => Math.random() - 0.5)
		};
	}

	async resetGame() {
		try {
			this.#board = Array(9).fill(null);
			this.#playersTurn = true;
			this.#playerAvailableCells = new Set([...Array(9).keys()]);
			this.#winner = undefined;
			this.#calculatingPoints = false;
			this.#winningPattern = undefined;
			this.#pointsHistory = [];

			if (this.#playerCharacter) {
				const playerRecord = await getCharacterById(this.#playerCharacter.id);
				if (!playerRecord) throw new Error("Couldn't find player character");

				this.#playerCharacter.strength = playerRecord.strength;
				this.#playerCharacter.speed = playerRecord.speed;
				this.#playerCharacter.intelligence = playerRecord.intelligence;

				this.#playerCharacter.swapsLeft = TOTAL_SWAPS;
			}
			if (this.#cpuCharacter) {
				const cpuRecord = await getCharacterById(this.#cpuCharacter.id);
				if (!cpuRecord) throw new Error("Couldn't find CPU character");

				this.#cpuCharacter.strength = cpuRecord.strength;
				this.#cpuCharacter.speed = cpuRecord.speed;
				this.#cpuCharacter.intelligence = cpuRecord.intelligence;

				this.#cpuCharacter.swapsLeft = TOTAL_SWAPS;
			}
		} catch (error) {
			console.error('Failed to reset game', error);
			throw error;
		}
	}

	async makeMove(index: number) {
		try {
			if (!this.#playerCharacter || !this.#cpuCharacter) return;

			if (!this.#playerAvailableCells.has(index))
				throw new Error('The player cannot perform this move');

			// handle swapping by the player
			if (this.#board[index] === CPU_SYMBOL) {
				this.subtractStats(index, this.#cpuCharacter);
				this.#playerCharacter.swapsLeft--;
			}

			// make move
			this.#board[index] = PLAYER_SYMBOL;

			this.addStats(index, this.#playerCharacter);
			const gameEnded = this.checkWin(PLAYER_SYMBOL);
			if (gameEnded) {
				this.#playersTurn = false;
				this.#calculatingPoints = true;

				if (gameEnded.result === 'win') {
					this.#winningPattern = gameEnded.pattern;

					await this.calculateBonuses(
						this.#playerCharacter,
						this.#cpuCharacter,
						false,
						this.getWinningStat()
					);
				} else if (gameEnded.result === 'draw') {
					const random: boolean = Math.random() < 0.5;
					await this.calculateBonuses(
						random ? this.#cpuCharacter : this.#playerCharacter,
						random ? this.#playerCharacter : this.#cpuCharacter,
						true,
						null
					);
				}
				this.#calculatingPoints = false;
				const winnerId = this.decideWinner(this.#playerCharacter, this.#cpuCharacter);
				this.#winner =
					winnerId === null
						? 'draw'
						: winnerId === this.#playerCharacter.id
							? this.#playerCharacter
							: this.#cpuCharacter;

				if (winnerId !== null) {
					const loserId: number =
						winnerId === this.#playerCharacter.id
							? this.#cpuCharacter.id
							: this.#playerCharacter.id;

					const playerWon = this.#playerCharacter.id === winnerId;
					await characterService.updateWL(winnerId, loserId, playerWon);
				}

				return;
			}

			this.#playersTurn = false;
			setTimeout(
				async () => {
					if (!this.#playerCharacter || !this.#cpuCharacter) return;

					const cells = this.getAvailableCells(this.#cpuCharacter, this.#playerCharacter);
					const index = this.CPUMove(cells);
					if (index === undefined) {
						console.error('CPU has no available moves');
						return;
					}

					// handle swapping by the CPU
					if (this.#board[index] === PLAYER_SYMBOL) {
						this.subtractStats(index, this.#playerCharacter);
						this.#cpuCharacter.swapsLeft--;
					}

					// make move
					this.#board[index] = CPU_SYMBOL;

					this.addStats(index, this.#cpuCharacter);
					const finalStatus = this.checkWin(CPU_SYMBOL);
					if (finalStatus) {
						this.#playersTurn = false;
						this.#calculatingPoints = true;
						if (finalStatus.result === 'win') {
							this.#winningPattern = finalStatus.pattern;

							await this.calculateBonuses(
								this.#cpuCharacter,
								this.#playerCharacter,
								false,
								this.getWinningStat()
							);
						} else if (finalStatus.result === 'draw') {
							const random: boolean = Math.random() < 0.5;
							await this.calculateBonuses(
								random ? this.#cpuCharacter : this.#playerCharacter,
								random ? this.#playerCharacter : this.#cpuCharacter,
								true,
								null
							);
						}
						this.#calculatingPoints = false;
						const winnerId = this.decideWinner(this.#playerCharacter, this.#cpuCharacter);
						this.#winner =
							winnerId === null
								? 'draw'
								: winnerId === this.#playerCharacter.id
									? this.#playerCharacter
									: this.#cpuCharacter;

						if (winnerId !== null) {
							const loserId: number =
								winnerId === this.#playerCharacter.id
									? this.#cpuCharacter.id
									: this.#playerCharacter.id;

							const playerWon = this.#playerCharacter.id === winnerId;
							await characterService.updateWL(winnerId, loserId, playerWon);
						}
						return;
					}

					// update which cells are available to the player
					const availableCellsTemp = this.getAvailableCells(
						this.#playerCharacter,
						this.#cpuCharacter
					);
					this.#playerAvailableCells = new Set([
						...availableCellsTemp.availableCells,
						...availableCellsTemp.swappableCells
					]);

					this.#playersTurn = true;
				},
				Math.floor(Math.random() * (2000 - 500 + 1)) + 500
			);
		} catch (error) {
			console.error('Failed to make move at index: ' + index, error);
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
		for (let i = 0; i < this.#board.length; i++) {
			if (!this.#board[i]) cells.availableCells.add(i);
		}

		// handle swapping and losing cells
		let opponentSymbol;
		let symbol;
		if (opponentCharacter.id === this.#playerCharacter!.id) {
			opponentSymbol = PLAYER_SYMBOL;
			symbol = CPU_SYMBOL;
		} else {
			opponentSymbol = CPU_SYMBOL;
			symbol = PLAYER_SYMBOL;
		}
		for (const [a, b, c] of winPatterns) {
			if (
				!this.#board[a] &&
				this.#board[b] === opponentSymbol &&
				this.#board[c] === this.#board[b]
			) {
				const tempBoardB = [...this.#board];
				tempBoardB[b] = symbol;
				const bWins = this.checkWin(symbol, tempBoardB);

				const tempBoardC = [...this.#board];
				tempBoardC[c] = symbol;
				const cWins = this.checkWin(symbol, tempBoardC);

				if (!cWins) cells.swappableCells.add(c);
				if (!bWins) cells.swappableCells.add(b);
				cells.losingCells.add(a);
			}
			if (
				this.#board[a] === opponentSymbol &&
				!this.#board[b] &&
				this.#board[c] === this.#board[a]
			) {
				const tempBoardA = [...this.#board];
				tempBoardA[a] = symbol;
				const aWins = this.checkWin(symbol, tempBoardA);

				const tempBoardC = [...this.#board];
				tempBoardC[c] = symbol;
				const cWins = this.checkWin(symbol, tempBoardC);

				if (!cWins) cells.swappableCells.add(c);
				if (!aWins) cells.swappableCells.add(a);
				cells.losingCells.add(b);
			}
			if (
				this.#board[a] === opponentSymbol &&
				this.#board[b] === this.#board[a] &&
				!this.#board[c]
			) {
				const tempBoardA = [...this.#board];
				tempBoardA[a] = symbol;
				const aWins = this.checkWin(symbol, tempBoardA);

				const tempBoardB = [...this.#board];
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
		for (const [a, b, c] of winPatterns) {
			if (!this.#board[a] && this.#board[b] === CPU_SYMBOL && this.#board[c] === CPU_SYMBOL)
				return a;
			if (this.#board[a] === CPU_SYMBOL && !this.#board[b] && this.#board[c] === CPU_SYMBOL)
				return b;
			if (this.#board[a] === CPU_SYMBOL && this.#board[b] === CPU_SYMBOL && !this.#board[c])
				return c;
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
		const board = tempBoard ? tempBoard : this.#board;

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

		const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
		await delay(1000);

		// double lead in bound statistic
		if (!wasDraw) {
			// if winner won then they get to compare their bound stat first
			if (winnerCharacter[winnerBoundStat] >= loserCharacter[winnerBoundStat] * 2) {
				const lowestDiffStat = this.getLowestDiffStat(winnerCharacter, loserCharacter);
				winnerCharacter[lowestDiffStat] += 2;
				this.#pointsHistory.push({
					characterName: winnerCharacter.name,
					points: 2,
					description: BONUS_DOUBLE,
					statistic: lowestDiffStat
				});
			}

			if (loserCharacter[loserBoundStat] >= winnerCharacter[loserBoundStat] * 2) {
				const lowestDiffStat = this.getLowestDiffStat(loserCharacter, winnerCharacter);
				loserCharacter[lowestDiffStat] += 2;
				this.#pointsHistory.push({
					characterName: loserCharacter.name,
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
					this.#pointsHistory.push({
						characterName: winnerCharacter.name,
						points: 2,
						description: BONUS_DOUBLE,
						statistic: lowestDiffStat
					});
				}

				if (loserCharacter[loserBoundStat] >= winnerCharacter[loserBoundStat] * 2) {
					const lowestDiffStat = this.getLowestDiffStat(loserCharacter, winnerCharacter);
					loserCharacter[lowestDiffStat] += 2;
					this.#pointsHistory.push({
						characterName: loserCharacter.name,
						points: 2,
						description: BONUS_DOUBLE,
						statistic: lowestDiffStat
					});
				}
			} else {
				if (loserCharacter[loserBoundStat] >= winnerCharacter[winnerBoundStat] * 2) {
					const lowestDiffStat = this.getLowestDiffStat(loserCharacter, winnerCharacter);
					loserCharacter[lowestDiffStat] += 2;
					this.#pointsHistory.push({
						characterName: loserCharacter.name,
						points: 2,
						description: BONUS_DOUBLE,
						statistic: lowestDiffStat
					});
				}

				if (winnerCharacter[winnerBoundStat] >= loserCharacter[winnerBoundStat] * 2) {
					const lowestDiffStat = this.getLowestDiffStat(winnerCharacter, loserCharacter);
					winnerCharacter[lowestDiffStat] += 2;
					this.#pointsHistory.push({
						characterName: winnerCharacter.name,
						points: 2,
						description: BONUS_DOUBLE,
						statistic: lowestDiffStat
					});
				}
			}
		}

		await delay(1000);

		// for winning
		if (!wasDraw) {
			let lowestDiffStat = this.getLowestDiffStat(winnerCharacter, loserCharacter);
			winnerCharacter[lowestDiffStat] += 2;
			this.#pointsHistory.push({
				characterName: winnerCharacter.name,
				points: 2,
				description: BONUS_WIN,
				statistic: lowestDiffStat
			});

			// for winning with their column or row
			if (winnerLine === winnerBoundStat) {
				await delay(1000);
				lowestDiffStat = this.getLowestDiffStat(winnerCharacter, loserCharacter);
				winnerCharacter[lowestDiffStat] += 1;
				this.#pointsHistory.push({
					characterName: winnerCharacter.name,
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
		if (!this.#winningPattern || !this.#boardStats) return null;

		switch (this.#winningPattern.join(',')) {
			case '0,1,2':
				return this.#boardStats.rowStats[0] ?? null;
			case '3,4,5':
				return this.#boardStats.rowStats[1] ?? null;
			case '6,7,8':
				return this.#boardStats.rowStats[2] ?? null;

			case '0,3,6':
				return this.#boardStats.colStats[0] ?? null;
			case '1,4,7':
				return this.#boardStats.colStats[1] ?? null;
			case '2,5,8':
				return this.#boardStats.colStats[2] ?? null;

			default:
				return null;
		}
	}

	decideWinner(character: CharacterPlayer, otherCharacter: CharacterPlayer): number | null {
		let characterWinCount = 0;
		let otherCharacterWinCount = 0;

		for (const stat of statistics) {
			if (character[stat] > otherCharacter[stat]) characterWinCount++;
			if (character[stat] < otherCharacter[stat]) otherCharacterWinCount++;
		}

		if (characterWinCount > otherCharacterWinCount) return character.id;
		else if (otherCharacterWinCount > characterWinCount) return otherCharacter.id;
		else return null;
	}

	addStats(index: number, character: CharacterPlayer) {
		if (!this.#boardStats) return;

		const colStat: Statistic | undefined = this.#boardStats.colStats[index % 3];
		const rowStat: Statistic | undefined = this.#boardStats.rowStats[Math.floor(index / 3)];
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
		if (!this.#boardStats) return;

		const colStat: Statistic | undefined = this.#boardStats.colStats[index % 3];
		const rowStat: Statistic | undefined = this.#boardStats.rowStats[Math.floor(index / 3)];
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
}

export const gameService = new GameService();
