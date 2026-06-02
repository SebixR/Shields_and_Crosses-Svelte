import { createCharacter, getAllCharacters } from './api/character';
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
}

export const characterService = new CharacterService();
