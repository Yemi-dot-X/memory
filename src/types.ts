export interface GameSettings {
    numPairs: number;
    isMultiplayer: boolean;
    playerNames: string[];
}

export interface Player {
    name: string;
    score: number;
}

export interface Card {
    id: number;
    value: string;
    isFlipped: boolean;
    isMatched: boolean;
}

export interface FlipResult {
    status: "invalid" | "flipped" | "checkMatch";
    card?: Card;
}