import {
  CONTAINER_MARGIN,
  HEADER_HEIGHT,
  TEXT_PADDING,
} from "../main.constants";
import TextBlock from "./Text.block";

export default class TimerBlock extends TextBlock {
  public constructor(text = "000") {
    super(text);
    this.adjustText();
  }

  public adjustText() {
    this.x = TEXT_PADDING;
    this.y = (HEADER_HEIGHT - this.height) / 2;

    return this;
  }
}
