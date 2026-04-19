const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export function createGameModel(settings) {
    let cards = [];
    let players = [];
    let currentPlayerIndex = 0;
    let flippedCards = [];
    function generatePairValues(numPairs) {
        if (numPairs < 1 || numPairs > ALPHABET.length) {
            throw new Error(`numPairs must be between 1 and ${ALPHABET.length}`);
        }
        return ALPHABET.slice(0, numPairs);
    }
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    function init() {
        players = settings.playerNames.map(function (name) {
            return {
                name: name,
                score: 0
            };
        });
        cards = [];
        flippedCards = [];
        currentPlayerIndex = 0;
        const pairValues = generatePairValues(settings.numPairs);
        for (let i = 0; i < pairValues.length; i++) {
            const value = pairValues[i];
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
        shuffle(cards);
    }
    function flipCard(id) {
        const card = cards.find(function (currentCard) {
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
    function checkMatch() {
        if (flippedCards.length !== 2) {
            return false;
        }
        const currentCard1 = flippedCards[0];
        const currentCard2 = flippedCards[1];
        const isMatch = currentCard1.value === currentCard2.value;
        if (isMatch) {
            currentCard1.isMatched = true;
            currentCard2.isMatched = true;
            players[currentPlayerIndex].score++;
        }
        return isMatch;
    }
    function hideUnmatchedCards() {
        if (flippedCards.length !== 2) {
            return;
        }
        const currentCard1 = flippedCards[0];
        const currentCard2 = flippedCards[1];
        currentCard1.isFlipped = false;
        currentCard2.isFlipped = false;
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        flippedCards = [];
    }
    function clearFlippedCards() {
        flippedCards = [];
    }
    function getCards() {
        return cards;
    }
    function getPlayers() {
        return players;
    }
    function getCurrentPlayer() {
        return players[currentPlayerIndex];
    }
    function isGameOver() {
        return cards.every(function (card) {
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
