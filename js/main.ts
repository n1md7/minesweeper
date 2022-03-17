import Minesweeper from "./Minesweeper";
import Database from "./Database";
import { GameMode } from "./main.constants";

// Disable default context menu
document.body.oncontextmenu = (event) => event.preventDefault();

const minesweeper = Minesweeper.getInstance();
const database = Database.getInstance();

const updateHighScores = (function fetchHighScores() {
  const modeSelectors = {
    [GameMode.beginner]: document.querySelector("#beginner>strong"),
    [GameMode.intermediate]: document.querySelector("#intermediate>strong"),
    [GameMode.expert]: document.querySelector("#expert>strong"),
  };

  const modes = [GameMode.beginner, GameMode.intermediate, GameMode.expert];
  modes.forEach((mode) =>
    database
      .getHighScore(mode)
      .then((record) => {
        if (record) modeSelectors[mode].innerHTML = record.score.toString();
      })
      .catch((error) => console.error(`Error getting high score: ${error}`))
  );

  return fetchHighScores;
})();

minesweeper.broadcast.subscribe((payload) => {
  database
    .addScore(payload)
    .then((result) => {
      console.info(`New score value added: ${result}`);
    })
    .then(updateHighScores)
    .catch((error) => {
      console.error(`Error adding/fetching score: ${error}`);
    });
});
