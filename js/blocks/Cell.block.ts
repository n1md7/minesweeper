import * as PIXI from "pixi.js";
import {
  CELL_BORDER_RADIUS,
  CELL_PADDING,
  CELL_SIZE,
  CellType,
  Colors,
  ColorsList,
} from "../main.constants";
import Utils from "../Utils";
import { BlockKey } from "../main.types";

export default class Cell extends PIXI.Container {
  public key: BlockKey;
  public mined = false;
  public opened = false;
  public flagged = false;
  public value = 0;
  private detonated = false;

  constructor(x: number, y: number) {
    super();

    this.key = Utils.toAxB([x, y]);
    this.interactive = true;
    this.position.set(
      x * CELL_SIZE + CELL_PADDING,
      y * CELL_SIZE + CELL_PADDING
    );
    this.updateVisual();
  }

  public get isDisabled(): boolean {
    return this.flagged || this.opened;
  }

  public get isEmpty(): boolean {
    return this.value === 0 && !this.mined;
  }

  public get hasValue(): boolean {
    return this.value > 0;
  }

  public updateVisual(): void {
    this.addChild(this.createBlock());
  }

  public open(): void {
    this.opened = true;
    this.updateVisual();
  }

  public detonate(): void {
    this.opened = true;
    this.detonated = true;
    this.updateVisual();
  }

  private createBlock() {
    const cellBlock = new PIXI.Graphics();
    const cellText = new PIXI.Text("");
    cellText.style = new PIXI.TextStyle({
      fontFamily: "monospace",
      fontWeight: "bold",
    });
    cellText.x = (CELL_SIZE * 0.25) / 2;
    cellText.y = (CELL_SIZE * 0.25) / 2;
    cellText.width = (CELL_SIZE - CELL_PADDING) * 0.75;
    cellText.height = (CELL_SIZE - CELL_PADDING) * 0.75;
    cellBlock.lineStyle(1, Colors.Line);

    switch (true) {
      case this.opened:
        cellText.text = "";
        if (this.value) {
          cellText.text = this.value.toString();
          cellText.style.fill = ColorsList[this.value - 1];
        }
        cellBlock.beginFill(Colors.Empty);
        if (this.mined) {
          cellText.text = CellType.Bomb;
          cellBlock.beginFill(this.detonated ? Colors.Bomb : Colors.Default);
        }
        break;
      case this.flagged:
        cellText.text = CellType.Flag;
        cellBlock.beginFill(Colors.Default);
        break;
      default:
        cellText.text = CellType.Empty;
        cellBlock.beginFill(Colors.Default);
        break;
    }

    cellBlock.drawRoundedRect(
      0,
      0,
      CELL_SIZE - CELL_PADDING * 2,
      CELL_SIZE - CELL_PADDING * 2,
      CELL_BORDER_RADIUS
    );
    cellBlock.endFill();
    cellBlock.addChild(cellText);

    return cellBlock;
  }
}
