import { createUIController } from "./ui.js";
document.addEventListener("DOMContentLoaded", function () {
    const ui = createUIController();
    ui.startGame({
        numPairs: 6,
        isMultiplayer: false,
        playerNames: ["Spieler 1"]
    });
});
