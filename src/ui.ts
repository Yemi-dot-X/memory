import { createGameModel } from "./GameModel.js";
import { GameSettings, Card, Player } from "./types.js";

type GameModel = ReturnType<typeof createGameModel>;

function getElementById<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id);

    if (!element) {
        throw new Error("Element with id '" + id + "' not found");
    }

    return element as T;
}
// UI Controller - Verantwortlich für die Interaktion mit dem DOM, Benutzerinteraktionen und die Anzeige von Informationen. Es kommuniziert mit dem GameModel, um den Spielstatus zu aktualisieren und anzuzeigen.

export function createUIController() {
    let model: GameModel | null = null;
    let isLocked: boolean = false;
    let timerInterval: number | null = null;
    let seconds: number = 0;
    let moves: number = 0;
    let currentSettings: GameSettings | null = null;

    const boardElement = getElementById<HTMLDivElement>("game-board");
    const messageElement = getElementById<HTMLDivElement>("message");
    const movesElement = getElementById<HTMLDivElement>("moves");
    const timeElement = getElementById<HTMLDivElement>("time");
    const resetBtn = getElementById<HTMLButtonElement>("reset-btn");
    const scoreboardElement = getElementById<HTMLDivElement>("scoreboard");

    const pairCountElement = getElementById<HTMLSelectElement>("pair-count");
    const gameModeElement = getElementById<HTMLSelectElement>("game-mode");
    const player1Input = getElementById<HTMLInputElement>("player1-name");
    const player2Input = getElementById<HTMLInputElement>("player2-name");
    const startBtn = getElementById<HTMLButtonElement>("start-btn");

    function startGame(settings: GameSettings): void {
        stopTimer();

        currentSettings = settings;
        moves = 0;
        seconds = 0;
        isLocked = false;

        updateMovesDisplay();
        updateTimeDisplay();
        setMessage("");

        model = createGameModel(settings);
        renderBoard();
        updateScoreDisplay();
        startTimer();
    }

    function renderBoard(): void {
        boardElement.innerHTML = "";

        if (!model) {
            return;
        }

        const cards: Card[] = model.getCards();

        cards.forEach(function(card: Card): void {
            const cardElement = createCardElement(card);
            boardElement.appendChild(cardElement);
        });
    }
    // Hilfsfunktion zum Erstellen eines Karten-HTML-Elements basierend auf dem Kartenstatus
    function createCardElement(card: Card): HTMLDivElement {
        const cardElement = document.createElement("div");
        cardElement.classList.add("cards");
        cardElement.dataset.id = String(card.id);

        if (card.isMatched) {
            cardElement.classList.add("matched");
            cardElement.textContent = card.value;
        } else if (card.isFlipped) {
            cardElement.classList.add("flipped");
            cardElement.textContent = card.value;
        } else {
            cardElement.textContent = "";
        }

        cardElement.addEventListener("click", function(): void {
            handleCardClick(card.id);
        });

        return cardElement;
    }

    function handleCardClick(cardId: number): void {
        if (isLocked || !model) {
            return;
        }

        const result = model.flipCard(cardId);

        if (result.status === "invalid") {
            return;
        }

        renderBoard();

        if (result.status === "checkMatch") {
            isLocked = true;
            moves++;
            updateMovesDisplay();

            setTimeout(function(): void {
                if (!model) {
                    return;
                }

                const isMatch: boolean = model.checkMatch();

                if (isMatch) {
                    model.clearFlippedCards();
                    renderBoard();
                    updateScoreDisplay();

                    if (model.isGameOver()) {
                        handleGameOver();
                    }

                    isLocked = false;
                } else {
                    setTimeout(function(): void {
                        if (!model) {
                            return;
                        }

                        model.hideUnmatchedCards();
                        renderBoard();
                        updateScoreDisplay();

                        if (model.isGameOver()) {
                            handleGameOver();
                        }

                        isLocked = false;
                    }, 700);
                }
            }, 500);
        }
    }

    function updateMovesDisplay(): void {
        movesElement.textContent = String(moves);
    }

    function updateTimeDisplay(): void {
        timeElement.textContent = String(seconds);
    }

    function updateScoreDisplay(): void {
        if (!model) {
            return;
        }

        const players: Player[] = model.getPlayers();
        const currentPlayer: Player = model.getCurrentPlayer();

        scoreboardElement.innerHTML = "";

        players.forEach(function(player: Player): void {
            const playerRow = document.createElement("div");
            playerRow.classList.add("player-row");

            if (player.name === currentPlayer.name) {
                playerRow.classList.add("active-player");
            }

            playerRow.textContent = player.name + ": " + player.score;
            scoreboardElement.appendChild(playerRow);
        });

        setMessage(currentPlayer.name + " ist dran");
    }

    function setMessage(text: string): void {
        messageElement.textContent = text;
    }

    function startTimer(): void {
        timerInterval = window.setInterval(function(): void {
            seconds++;
            updateTimeDisplay();
        }, 1000);
    }

    function stopTimer(): void {
        if (timerInterval !== null) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function handleGameOver(): void {
        if (!model) {
            return;
        }

        stopTimer();

        const players: Player[] = model.getPlayers();

        let summary: string = "Fertig! " + moves + " Züge in " + seconds + " Sekunden. ";

        if (players.length === 1) {
            summary += players[0].name + " hat " + players[0].score + " Punkte.";
        } else {
            const sortedPlayers: Player[] = [...players].sort(function(a: Player, b: Player): number {
                return b.score - a.score;
            });

            const winner: Player = sortedPlayers[0];
            const secondPlace: Player = sortedPlayers[1];

            if (winner.score === secondPlace.score) {
                summary += "Unentschieden. ";
            } else {
                summary += "Gewinner: " + winner.name + ". ";
            }

            summary += players.map(function(player: Player): string {
                return player.name + ": " + player.score;
            }).join(" | ");
        }

        setMessage(summary);
    }

    function readSettingsFromForm(): GameSettings {
        const numPairs: number = Number(pairCountElement.value);
        const isMultiplayer: boolean = gameModeElement.value === "multi";

        // Standardnamen verwenden, wenn die Eingabefelder leer sind
        const player1Name: string = player1Input.value.trim() || "Spieler 1";
        const player2Name: string = player2Input.value.trim() || "Spieler 2";

        return {
            numPairs: numPairs,
            isMultiplayer: isMultiplayer,
            playerNames: isMultiplayer ? [player1Name, player2Name] : [player1Name]
        };
    }

    startBtn.addEventListener("click", function(): void {
        const settings: GameSettings = readSettingsFromForm();
        startGame(settings);
    });

    resetBtn.addEventListener("click", function(): void {
        if (!currentSettings) {
            currentSettings = readSettingsFromForm();
        }

        startGame(currentSettings);
    });

    return {
        startGame
    };
}