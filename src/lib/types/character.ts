export interface Character {
	name: string;
	strength: number;
	speed: number;
	intelligence: number;
	class: 'warrior' | 'mage' | 'rogue';
}

export interface CharacterRecord extends Character {
	id: number;
	wins: number;
	losses: number;
}

export interface CharacterPage {
	content: CharacterRecord[];
	totalElements: number;
	totalPages: number;
	number: number;
	size: number;
}

export interface CharacterPlayer extends CharacterRecord {
	swapsLeft: number;
}

export const BASE_CHARACTER: Character = {
	name: '',
	strength: 0,
	speed: 0,
	intelligence: 0,
	class: 'warrior'
};
