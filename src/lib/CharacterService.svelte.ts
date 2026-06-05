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

			await db.characters.update(this.#formCharacter.id, this.#formCharacter);

			await this.init();
		} catch (error) {
			console.error('Failed to edit character: ' + this.#formCharacter.name, error);
			throw error;
		}
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
