import * as PIXI from "pixi.js";
import { CONTAINER_MARGIN, HEADER_HEIGHT } from "../main.constants";

export default class BodyBlock extends PIXI.Container {
  public constructor() {
    super();
    this.x = CONTAINER_MARGIN;
    this.y = HEADER_HEIGHT + CONTAINER_MARGIN;
    this.interactive = true;
  }
}
