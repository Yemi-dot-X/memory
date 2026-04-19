import { createGameModel } from "./GameModel.js";
function getElementById(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error("Element with id '" + id + "' not found");
    }
    return element;
}
// UI Controller - Verantwortlich für die Interaktion mit dem DOM, Benutzerinteraktionen und die Anzeige von Informationen. Es kommuniziert mit dem GameModel, um den Spielstatus zu aktualisieren und anzuzeigen.
export function createUIController() {
    let model = null;
    let isLocked = false;
    let timerInterval = null;
    let seconds = 0;
    let moves = 0;
    let currentSettings = null;
    const boardElement = getElementById("game-board");
    const messageElement = getElementById("message");
    const movesElement = getElementById("moves");
    const timeElement = getElementById("time");
    const resetBtn = getElementById("reset-btn");
    const scoreboardElement = getElementById("scoreboard");
    const pairCountElement = getElementById("pair-count");
    const gameModeElement = getElementById("game-mode");
    const player1Input = getElementById("player1-name");
    const player2Input = getElementById("player2-name");
    const startBtn = getElementById("start-btn");
    function startGame(settings) {
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
    function renderBoard() {
        boardElement.innerHTML = "";
        if (!model) {
            return;
        }
        const cards = model.getCards();
        cards.forEach(function (card) {
            const cardElement = createCardElement(card);
            boardElement.appendChild(cardElement);
        });
    }
    // Hilfsfunktion zum Erstellen eines Karten-HTML-Elements basierend auf dem Kartenstatus
    function createCardElement(card) {
        const cardElement = document.createElement("div");
        cardElement.classList.add("cards");
        cardElement.dataset.id = String(card.id);
        if (card.isMatched) {
            cardElement.classList.add("matched");
            cardElement.textContent = card.value;
        }
        else if (card.isFlipped) {
            cardElement.classList.add("flipped");
            cardElement.textContent = card.value;
        }
        else {
            cardElement.textContent = "";
        }
        cardElement.addEventListener("click", function () {
            handleCardClick(card.id);
        });
        return cardElement;
    }
    function handleCardClick(cardId) {
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
            setTimeout(function () {
                if (!model) {
                    return;
                }
                const isMatch = model.checkMatch();
                if (isMatch) {
                    model.clearFlippedCards();
                    renderBoard();
                    updateScoreDisplay();
                    if (model.isGameOver()) {
                        handleGameOver();
                    }
                    isLocked = false;
                }
                else {
                    setTimeout(function () {
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
    function updateMovesDisplay() {
        movesElement.textContent = String(moves);
    }
    function updateTimeDisplay() {
        timeElement.textContent = String(seconds);
    }
    function updateScoreDisplay() {
        if (!model) {
            return;
        }
        const players = model.getPlayers();
        const currentPlayer = model.getCurrentPlayer();
        scoreboardElement.innerHTML = "";
        players.forEach(function (player) {
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
    function setMessage(text) {
        messageElement.textContent = text;
    }
    function startTimer() {
        timerInterval = window.setInterval(function () {
            seconds++;
            updateTimeDisplay();
        }, 1000);
    }
    function stopTimer() {
        if (timerInterval !== null) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }
    function handleGameOver() {
        if (!model) {
            return;
        }
        stopTimer();
        const players = model.getPlayers();
        let summary = "Fertig! " + moves + " Züge in " + seconds + " Sekunden. ";
        if (players.length === 1) {
            summary += players[0].name + " hat " + players[0].score + " Punkte.";
        }
        else {
            const sortedPlayers = [...players].sort(function (a, b) {
                return b.score - a.score;
            });
            const winner = sortedPlayers[0];
            const secondPlace = sortedPlayers[1];
            if (winner.score === secondPlace.score) {
                summary += "Unentschieden. ";
            }
            else {
                summary += "Gewinner: " + winner.name + ". ";
            }
            summary += players.map(function (player) {
                return player.name + ": " + player.score;
            }).join(" | ");
        }
        setMessage(summary);
    }
    function readSettingsFromForm() {
        const numPairs = Number(pairCountElement.value);
        const isMultiplayer = gameModeElement.value === "multi";
        // Standardnamen verwenden, wenn die Eingabefelder leer sind
        const player1Name = player1Input.value.trim() || "Spieler 1";
        const player2Name = player2Input.value.trim() || "Spieler 2";
        return {
            numPairs: numPairs,
            isMultiplayer: isMultiplayer,
            playerNames: isMultiplayer ? [player1Name, player2Name] : [player1Name]
        };
    }
    startBtn.addEventListener("click", function () {
        const settings = readSettingsFromForm();
        startGame(settings);
    });
    resetBtn.addEventListener("click", function () {
        if (!currentSettings) {
            currentSettings = readSettingsFromForm();
        }
        startGame(currentSettings);
    });
    return {
        startGame
    };
}
