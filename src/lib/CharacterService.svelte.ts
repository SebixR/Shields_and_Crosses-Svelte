import { db } from '../db';
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

	async updateWL(id: number, win: boolean) {
		await updateWinLoseRatio(id, win);

		await this.init();
	}
}

export const characterService = new CharacterService();

async function createCharacter(character: Character) {
	try {
		await db.characters.add({
			...character,
			wins: 0,
			losses: 0
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

async function updateWinLoseRatio(id: number, win: boolean) {
	try {
		const characterRecord = await db.characters.get(id);
		if (!characterRecord) throw new Error("Couldn't find character with id: " + id);

		if (win) await db.characters.update(id, { wins: characterRecord.wins + 1 });
		else await db.characters.update(id, { losses: characterRecord.losses + 1 });
	} catch (error) {
		console.error('Failed to update win lose ratio for character with id: ' + id, error);
		throw error;
	}
}

export async function getCharacterById(id: number): Promise<CharacterRecord | undefined> {
	try {
		return db.characters.get(id);
	} catch (error) {
		console.error('Failed to get character with id: ' + id, error);
		throw error;
	}
}
