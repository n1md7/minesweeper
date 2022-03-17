import * as PIXI from "pixi.js";
import BombBlock from "./Bomb.block";
import TimerBlock from "./Timer.block";
import StatusBlock from "./Status.block";
import { GameState } from "../main.constants";

export default class HeaderBlock extends PIXI.Container {
  public constructor(
    private readonly timerBlock: TimerBlock,
    private readonly statusBlock: StatusBlock,
    private readonly bombBlock: BombBlock
  ) {
    super();
    this.appendChildren();
  }

  public get status(): StatusBlock {
    return this.statusBlock;
  }

  private appendChildren() {
    this.addChild(this.bombBlock);
    this.addChild(this.timerBlock);
    this.addChild(this.statusBlock);
  }

  public updateTimer(time: number) {
    this.timerBlock.setText(time.toString()).adjustText();
  }

  public updateStatus(status: GameState) {
    this.statusBlock.setText(status).adjustText();
  }

  public updateBombCounter(bomb: number) {
    this.bombBlock.setText(bomb.toString()).adjustText();
  }
}
