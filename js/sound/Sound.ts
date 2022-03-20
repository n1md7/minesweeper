import { sound } from "@pixi/sound";
import { SoundType } from "../main.constants";

export default class Sound {
  private static volume = 0.25;

  public static playClick() {
    sound.play(SoundType.Click, { volume: this.volume });
  }

  public static playWin() {
    sound.play(SoundType.Win, { volume: this.volume });
  }

  public static playFlag() {
    sound.play(SoundType.Flag, { volume: this.volume });
  }

  public static playLose() {
    sound.play(SoundType.Lose, { volume: this.volume - 0.23 });
  }
}
