export interface Character {
	name: string;
	strength: number;
	speed: number;
	intelligence: number;
	class: 'warrior' | 'mage' | 'rogue';
	allowCPU: boolean;
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
