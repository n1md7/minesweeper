import * as PIXI from "pixi.js";
// @ts-ignore
import win from "../../sound/chime.mp3";
// @ts-ignore
import click from "../../sound/click.mp3";
// @ts-ignore
import flag from "../../sound/flag.mp3";
// @ts-ignore
import lose from "../../sound/bomb.mp3";

export default class SoundLoader {
  static load(): Promise<unknown> {
    const manifest = {
      win,
      click,
      flag,
      lose,
    };

    return new Promise((resolve, reject) => {
      // Add to the PIXI loader
      for (const name in manifest) PIXI.Loader.shared.add(name, manifest[name]);
      PIXI.Loader.shared.onError.add(reject);
      PIXI.Loader.shared.load(resolve);
    });
  }
}
