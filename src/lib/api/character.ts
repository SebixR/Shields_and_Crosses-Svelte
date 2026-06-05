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
