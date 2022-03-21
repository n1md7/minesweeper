import { sound } from "@pixi/sound";
import { SoundType } from "../main.constants";

export default class Sound {
  private static _mute = !!localStorage.getItem("mute");
  private static volume = 0.25;

  public static get isMuted() {
    return this._mute;
  }

  public static mute() {
    this._mute = true;
    localStorage.setItem("mute", "mute");
  }

  public static unmute() {
    this._mute = false;
    localStorage.removeItem("mute");
  }

  public static playClick() {
    Sound._mute || sound.play(SoundType.Click, { volume: this.volume });
  }

  public static playWin() {
    Sound._mute || sound.play(SoundType.Win, { volume: this.volume });
  }

  public static playFlag() {
    Sound._mute || sound.play(SoundType.Flag, { volume: this.volume });
  }

  public static playLose() {
    Sound._mute || sound.play(SoundType.Lose, { volume: this.volume - 0.23 });
  }
}
