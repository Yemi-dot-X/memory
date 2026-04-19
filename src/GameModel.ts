import { GameSettings, Player, Card, FlipResult } from "./types.js";

const ALPHABET: string[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function createGameModel(settings: GameSettings) {
    let cards: Card[] = [];
    let players: Player[] = [];
    let currentPlayerIndex: number = 0;
    let flippedCards: Card[] = [];

    function generatePairValues(numPairs: number): string[] {
        if (numPairs < 1 || numPairs > ALPHABET.length) {
            throw new Error(`numPairs must be between 1 and ${ALPHABET.length}`);
        }

        return ALPHABET.slice(0, numPairs);
    }

    function shuffle<T>(array: T[]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j: number = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function init(): void {
        players = settings.playerNames.map(function(name: string): Player {
            return {
                name: name,
                score: 0
            };
        });

        cards = [];
        flippedCards = [];
        currentPlayerIndex = 0;

        const pairValues: string[] = generatePairValues(settings.numPairs);

        for (let i = 0; i < pairValues.length; i++) {
            const value: string = pairValues[i];

            cards.push({
                id: i * 2,
                value: value,
                isFlipped: false,
                isMatched: false
            });

            cards.push({
                id: i * 2 + 1,
                value: value,
                isFlipped: false,
                isMatched: false
            });
        }

        shuffle<Card>(cards);
    }

    function flipCard(id: number): FlipResult {
        const card: Card | undefined = cards.find(function(currentCard: Card) {
            return currentCard.id === id;
        });

        if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) {
            return { status: "invalid" };
        }

        card.isFlipped = true;
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            return { status: "checkMatch", card: card };
        }

        return { status: "flipped", card: card };
    }

    function checkMatch(): boolean {
        if (flippedCards.length !== 2) {
            return false;
        }

        const currentCard1: Card = flippedCards[0];
        const currentCard2: Card = flippedCards[1];

        const isMatch: boolean = currentCard1.value === currentCard2.value;

        if (isMatch) {
            currentCard1.isMatched = true;
            currentCard2.isMatched = true;
            players[currentPlayerIndex].score++;
        }

        return isMatch;
    }

    function hideUnmatchedCards(): void {
        if (flippedCards.length !== 2) {
            return;
        }

        const currentCard1: Card = flippedCards[0];
        const currentCard2: Card = flippedCards[1];

        currentCard1.isFlipped = false;
        currentCard2.isFlipped = false;

        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        flippedCards = [];
    }

    function clearFlippedCards(): void {
        flippedCards = [];
    }

    function getCards(): Card[] {
        return cards;
    }

    function getPlayers(): Player[] {
        return players;
    }

    function getCurrentPlayer(): Player {
        return players[currentPlayerIndex];
    }

    function isGameOver(): boolean {
        return cards.every(function(card: Card): boolean {
            return card.isMatched;
        });
    }

    init();

    return {
        flipCard,
        checkMatch,
        hideUnmatchedCards,
        clearFlippedCards,
        getCards,
        getPlayers,
        getCurrentPlayer,
        isGameOver
    };
}