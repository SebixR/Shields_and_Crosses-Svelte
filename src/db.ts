import type { CharacterRecord } from '$lib/types/character';
import { Dexie, type EntityTable } from 'dexie';

const db = new Dexie('CharactersDatabase') as Dexie & {
	characters: EntityTable<CharacterRecord, 'id'>;
};

db.version(1).stores({
	characters: '++id' // primary key "id"
});

export { db };
