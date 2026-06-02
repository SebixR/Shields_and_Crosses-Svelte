import type { Character, CharacterRecord } from '$lib/types/character';
import { db } from '../../db';

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

// export async function deleteCharacter(id: number) {
// 	try {
// 		await api.delete('/character/delete', {
// 			params: { id: id }
// 		});
// 	} catch (error) {
// 		throw new Error('Failed to delete character: ' + error);
// 	}
// }

// export async function getCharacterById(id: number): Promise<CharacterRecord | undefined> {
// 	try {
// 		const response = await api.get('character/' + id);

// 		return { ...response.data, class: response.data.class.toLocaleLowerCase() };
// 	} catch (error) {
// 		throw new Error('Failed to get character with id: ' + id + ': ' + error);
// 	}
// }

// export async function getRandomExcludingId(id: number): Promise<CharacterRecord | undefined> {
// 	try {
// 		const response = await api.get('character/random/' + id);

// 		return { ...response.data, class: response.data.class.toLocaleLowerCase() };
// 	} catch (error) {
// 		throw new Error('Failed to get character with id: ' + id + ': ' + error);
// 	}
// }

// export async function updateWinLoseRatio(id: number, win: boolean) {
// 	try {
// 		await api.patch('character/wl', null, { params: { id, win } });
// 	} catch (error) {
// 		throw new Error('Failed to update ratio for character with id: ' + id + ': ' + error);
// 	}
// }
