import { db } from '../db';
import type { Character, CharacterRecord } from './types/character';

class CharacterService {
	#characters = $state<CharacterRecord[]>([]);

	get characters() {
		return this.#characters;
	}

	async init() {
		this.#characters = await getAllCharacters();
	}

	async create(character: Character) {
		await createCharacter(character);

		await this.init();
	}

	async delete(id: number) {
		await deleteCharacter(id);

		await this.init();
	}
}

export const characterService = new CharacterService();

export async function createCharacter(character: Character) {
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

export async function getAllCharacters(page?: number, size?: number): Promise<CharacterRecord[]> {
	try {
		const collection = db.characters.offset((page ?? 0) * (size ?? 0)).limit(size ?? 10);

		return await collection.toArray();
	} catch (error) {
		console.error('Failed to get all characters', error);
		throw error;
	}
}

export async function deleteCharacter(id: number) {
	try {
		await db.characters.delete(id);
	} catch (error) {
		console.error('Failed to delete character with id: ' + id, error);
		throw error;
	}
}
