import { createCharacter, deleteCharacter, getAllCharacters } from '@/api/character';
import type { Character, CharacterPage } from '$lib/types/character';

let characters = $state<CharacterPage>();
let loadingCharacters = $state(false);
let charactersError = $state(false);

export const useCharacters = () => {
	const load = async (page?: number, size?: number) => {
		try {
			loadingCharacters = true;
			characters = await getAllCharacters(page, size);
			loadingCharacters = false;

			charactersError = false;
		} catch {
			loadingCharacters = false;
			charactersError = true;
		}
	};

	const add = async (payload: Character) => {
		const created = await createCharacter(payload);
		if (created) await load();
	};

	const remove = async (id: number) => {
		await deleteCharacter(id);
		await load();
	};

	return { characters, load, add, remove, loadingCharacters, charactersError };
};
