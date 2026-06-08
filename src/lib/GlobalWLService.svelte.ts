import type { WinLose } from './types/character';

// these are the player's wins and losses - every player loss is a CPU win
const GLOBAL_WINS_KEY = 'globalWins';
const GLOBAL_LOSSES_KEY = 'globalLosses';

class GlobalWLService {
	#globalWL = $state<WinLose>({ wins: 0, losses: 0 });

	get globalWL() {
		return this.#globalWL;
	}

	init() {
		this.#globalWL = this.getGlobalWL();
	}

	getGlobalWL(): WinLose {
		let globalWins = localStorage.getItem(GLOBAL_WINS_KEY);
		let globalLosses = localStorage.getItem(GLOBAL_LOSSES_KEY);

		if (!globalWins || Number.isNaN(Number(globalWins))) {
			localStorage.setItem(GLOBAL_WINS_KEY, '0');
			globalWins = '0';
		}
		if (!globalLosses || Number.isNaN(Number(globalLosses))) {
			localStorage.setItem(GLOBAL_LOSSES_KEY, '0');
			globalLosses = '0';
		}

		return { wins: Number(globalWins), losses: Number(globalLosses) };
	}

	updateGlobalWL(playerWon: boolean) {
		try {
			const currentWL = this.getGlobalWL();

			if (playerWon) localStorage.setItem(GLOBAL_WINS_KEY, (Number(currentWL.wins) + 1).toString());
			else localStorage.setItem(GLOBAL_LOSSES_KEY, (Number(currentWL.losses) + 1).toString());

			this.init();
		} catch (error) {
			console.error('Failed to update global WL', error);
			throw error;
		}
	}
}

export const globalWLService = new GlobalWLService();
