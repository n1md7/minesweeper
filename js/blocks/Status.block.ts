import {
  APP_WIDTH,
  CONTAINER_MARGIN,
  GameState,
  HEADER_HEIGHT,
} from "../main.constants";
import TextBlock from "./Text.block";
import Utils from "../Utils";

export default class StatusBlock extends TextBlock {
  public constructor(text = GameState.Playing) {
    super(text);
    this.adjustText();
    this.buttonMode = true;
  }

  public adjustText() {
    this.y = (HEADER_HEIGHT - this.height) / 2;
    this.x = (APP_WIDTH - this.width) / 2 - CONTAINER_MARGIN;

    return this;
  }

  // @override
  public setText(text: string) {
    this.text = text;

    return this;
  }

  public setIdle() {
    this.setText(Utils.pickRandom(["🤔", "🥱", "😴", "🤤", "😪"]));

    return this;
  }

  public setGameOver() {
    const icons = ["💀", "😣", "😩", "🥺", "😢", "😭", "🤕", "🥴", "💩"];
    this.setText(Utils.pickRandom(icons));

    return this;
  }

  public setPlaying() {
    this.setText(GameState.Playing);

    return this;
  }

  public setWon() {
    this.setText(GameState.Won);

    return this;
  }

  public setWorried() {
    this.setText(GameState.Worried);

    return this;
  }

  public setFlag() {
    this.setText(GameState.Flag);

    return this;
  }
}
