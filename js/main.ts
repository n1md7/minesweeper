import Minesweeper from "./Minesweeper";

// Disable default context menu
document.body.oncontextmenu = (event) => event.preventDefault();

Minesweeper.getInstance();
