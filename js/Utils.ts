import * as Lo from "lodash";
import { BlockKey, NumberFormat } from "./main.types";
import { COLS, ROWS } from "./main.constants";

export default class Utils {
  static random(max: number): number {
    return Lo.random(0, max - 1);
  }

  static toAxB([a, b]: [number, number]): BlockKey {
    return `${a}x${b}`;
  }

  static fromAxB(AxB: BlockKey): [number, number] {
    const [a, b] = AxB.split("x");

    return [+a, +b];
  }

  static inBoundCells([col, row]: [number, number]): boolean {
    if (row < 0 || col < 0) return false;

    return !(row >= ROWS || col >= COLS);
  }

  static pickRandom(listOfItems: string[]): string {
    return listOfItems[Utils.random(listOfItems.length)];
  }

  static cellNeighbors(key: BlockKey): BlockKey[] {
    const [col, row] = Utils.fromAxB(key);

    const neighborBlocks = [
      [col - 1, row - 1],
      [col - 1, row],
      [col - 1, row + 1],
      [col, row - 1],
      [col, row + 1],
      [col + 1, row - 1],
      [col + 1, row],
      [col + 1, row + 1],
    ];

    return neighborBlocks.filter(Utils.inBoundCells).map(Utils.toAxB);
  }

  static gameMode() {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode") || "9x9";
    const [ROWS, COLS] = mode.split("x", 2);
    const rows = parseInt(ROWS) || 6;
    const cols = parseInt(COLS) || 6;

    return [
      rows >= 6 && rows <= 24 ? rows : 9,
      cols >= 6 && cols <= 32 ? cols : 9,
    ];
  }

  static scoreFormat(score: number): NumberFormat {
    return score.toString().padStart(3, "0") as NumberFormat;
  }
}
