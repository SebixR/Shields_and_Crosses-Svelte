import { db } from '../db';
import { globalWLService } from './GlobalWLService.svelte';
import { BASE_CHARACTER, type Character, type CharacterRecord } from './types/character';

type FormCharacter = Character | CharacterRecord;

class CharacterService {
	#characters = $state<CharacterRecord[]>([]);
	#formCharacter = $state<FormCharacter>(BASE_CHARACTER);

	get characters() {
		return this.#characters;
	}
	get formCharacter() {
		return this.#formCharacter;
	}
	set formCharacter(character: FormCharacter) {
		this.#formCharacter = character;
	}

	async init() {
		this.#characters = await getAllCharacters();
	}

	async create() {
		await createCharacter(this.#formCharacter);

		await this.init();
	}

	async delete(id: number) {
		await deleteCharacter(id);

		await this.init();
	}

	async edit() {
		try {
			if (!this.#formCharacter || !('id' in this.#formCharacter))
				throw new Error('Character id is null');

			await db.characters.update(this.#formCharacter.id, {
				name: this.#formCharacter.name,
				class: this.#formCharacter.class,
				strength: this.#formCharacter.strength,
				speed: this.#formCharacter.speed,
				intelligence: this.#formCharacter.intelligence
			});

			await this.init();
		} catch (error) {
			console.error('Failed to edit character: ' + this.#formCharacter.name, error);
			throw error;
		}
	}

	async updateWL(winnerId: number, loserId: number, playerWon: boolean) {
		await updateWinLoseRatio(winnerId, loserId, playerWon);
		globalWLService.updateGlobalWL(playerWon);

		await this.init();
	}
}

export const characterService = new CharacterService();

async function createCharacter(character: Character) {
	try {
		await db.characters.add({
			...character,
			playerWL: { wins: 0, losses: 0 },
			cpuWL: { wins: 0, losses: 0 }
		});
	} catch (error) {
		console.error('Failed to create the character ' + character.name, error);
		throw error;
	}
}

async function getAllCharacters(page?: number, size?: number): Promise<CharacterRecord[]> {
	try {
		const collection = db.characters.offset((page ?? 0) * (size ?? 0)).limit(size ?? 10);

		return await collection.toArray();
	} catch (error) {
		console.error('Failed to get all characters', error);
		throw error;
	}
}

async function deleteCharacter(id: number) {
	try {
		await db.characters.delete(id);
	} catch (error) {
		console.error('Failed to delete character with id: ' + id, error);
		throw error;
	}
}

export async function getRandomExcludingId(playerId: number): Promise<CharacterRecord | undefined> {
	try {
		const allIds = await db.characters.toCollection().primaryKeys();
		const validIds = allIds.filter((id) => id !== playerId);
		if (validIds.length === 0) return undefined;

		const randomId = validIds[Math.floor(Math.random() * validIds.length)];
		const character = await db.characters.get(randomId);
		return character;
	} catch (error) {
		console.error('Failed to get random character', error);
		throw error;
	}
}

async function updateWinLoseRatio(winnerId: number, loserId: number, playerWon: boolean) {
	try {
		const winnerRecord = await getCharacterById(winnerId);
		const loserRecord = await getCharacterById(loserId);

		if (playerWon) {
			await db.characters.update(winnerId, {
				playerWL: { ...winnerRecord.playerWL, wins: winnerRecord.playerWL.wins + 1 }
			});

			await db.characters.update(loserId, {
				cpuWL: { ...loserRecord.cpuWL, losses: loserRecord.cpuWL.losses + 1 }
			});
		} else {
			await db.characters.update(winnerId, {
				cpuWL: { ...winnerRecord.cpuWL, wins: winnerRecord.cpuWL.wins + 1 }
			});

			await db.characters.update(loserId, {
				playerWL: { ...loserRecord.playerWL, losses: loserRecord.playerWL.losses + 1 }
			});
		}
	} catch (error) {
		console.error(
			'Failed to update win lose ratio for characters with ids: ' + winnerId + ' and ' + loserId,
			error
		);
		throw error;
	}
}

export async function getCharacterById(id: number): Promise<CharacterRecord> {
	try {
		const character = await db.characters.get(id);
		if (!character) throw new Error('Character is undefined');

		return character;
	} catch (error) {
		console.error('Failed to get character with id: ' + id, error);
		throw error;
	}
}
