import Minesweeper from "./Minesweeper";
import Database from "./Database";
import { GameMode } from "./main.constants";
import SoundLoader from "./sound/loader";
import Utils from "./utils";
import Sound from "./sound/Sound";

console.info(
  "%cMinesweeper 🙂 Made by @n1md7 in 🇪🇪/🇬🇪 2022",
  "color: #ff0000; font-size: 12px; font-weight: bold;"
);
// Disable default context menu
document.body.oncontextmenu = (event) => event.preventDefault();

SoundLoader.load()
  .then(() => Database.getInstance().connect())
  .then(() => {
    const spinner = document.getElementById("spinner");
    spinner.hidden = true;
    const mode = Utils.gameMode();
    const option = document.querySelector(`#mode-${mode}`);
    if (option) option.setAttribute("checked", "checked");
    return mode;
  })
  .then((activeMode) => {
    return [GameMode.beginner, GameMode.intermediate, GameMode.expert].forEach(
      (mode) => {
        const option = document.querySelector(`#mode-${mode}`);
        if (option)
          option.addEventListener("click", () => {
            if (activeMode === mode) return;
            window.location.href = `?mode=${mode}`;
          });
      }
    );
  })
  .then(() => {
    const mute = document.getElementById("mute");
    if (mute) {
      const text = (isMute: boolean) => (isMute ? "Unmute 🔊" : "Mute 🔇");
      mute.innerHTML = text(Sound.isMuted);
      mute.addEventListener("click", () => {
        Sound.isMuted ? Sound.unmute() : Sound.mute();
        mute.innerHTML = text(Sound.isMuted);
      });
    }
  })
  .then(() => {
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
        .then(updateHighScores)
        .catch((error) => {
          console.error(`Error adding/fetching score: ${error}`);
        });
    });
  })
  .catch((error) => {
    console.error(
      `This error should have never happened: ${error}. But here we are 🤷‍.`
    );
  });
