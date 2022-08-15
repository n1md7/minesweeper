import * as Lo from "lodash";
import { BlockKey, NumberFormat } from "./main.types";
import { COLS, GameMode, ROWS } from "./main.constants";
import isMobile from "is-mobile";

export default class Utils {
  private static mode: GameMode = null;

  static get isMobile() {
    return isMobile();
  }

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

  static scoreFormat(score: number): NumberFormat {
    return score.toString().padStart(3, "0") as NumberFormat;
  }

  static calculatedBlocks() {
    const width = Utils.reduceBy(window.innerWidth, 0);
    const height = Utils.reduceBy(window.innerHeight, 24);
    const coefficient = width / height;
    const mode = Utils.gameMode();
    const blocks = { count: 9 ** 2 };
    switch (mode) {
      case GameMode.beginner:
        blocks.count = 9 ** 2;
        break;
      case GameMode.intermediate:
        blocks.count = 16 ** 2;
        break;
      case GameMode.expert:
        blocks.count = 24 ** 2;
        break;
      default:
        blocks.count = 9 ** 2;
        break;
    }

    const cols = Math.floor(Math.sqrt(blocks.count * coefficient));
    const rows = Math.floor(blocks.count / cols);

    return [rows, cols];
  }

  static reduceBy(target: number, percent: number) {
    return target - (target * percent) / 100;
  }

  public static gameMode(): GameMode {
    if (Utils.mode) return Utils.mode;

    const whitelist = [
      GameMode.beginner,
      GameMode.intermediate,
      GameMode.expert,
    ];
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode") as GameMode.beginner;
    Utils.mode = whitelist.includes(mode) ? mode : GameMode.beginner;

    return Utils.mode;
  }
}
