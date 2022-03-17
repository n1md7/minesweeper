import {
  APP_WIDTH,
  CONTAINER_MARGIN,
  HEADER_HEIGHT,
  TEXT_PADDING,
} from "../main.constants";
import TextBlock from "./Text.block";

export default class BombBlock extends TextBlock {
  public constructor(text = "000") {
    super(text);
    this.adjustText();
  }

  public adjustText() {
    this.x = APP_WIDTH - this.width - TEXT_PADDING - CONTAINER_MARGIN * 2;
    this.y = (HEADER_HEIGHT - this.height) / 2;

    return this;
  }
}
