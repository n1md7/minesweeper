import * as PIXI from "pixi.js";
import { HEADER_HEIGHT } from "../main.constants";

export default class BodyBlock extends PIXI.Container {
  public constructor() {
    super();
    this.x = 0;
    this.y = HEADER_HEIGHT;
  }
}
