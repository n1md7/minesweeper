import * as PIXI from "pixi.js";
import { NumberFormat } from "../main.types";

export default abstract class TextBlock extends PIXI.Text {
  protected constructor(text = "Default") {
    super(text);

    this.style = new PIXI.TextStyle({
      fontFamily: "monospace",
      fontSize: 24,
      fill: "red",
      fontWeight: "bold",
    });
  }

  protected static format(text: number | string): NumberFormat {
    return text.toString().padStart(3, "0") as NumberFormat;
  }

  public setText(text: number | string) {
    this.text = TextBlock.format(text);

    return this;
  }
}
