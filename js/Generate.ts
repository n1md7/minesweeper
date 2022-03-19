import { CellType, COLS, ROWS } from "./main.constants";
import Utils from "./Utils";
import Cell from "./blocks/Cell.block";
import { BlockKey } from "./main.types";

export default class Generate {
  public static bombs(count: number): Set<BlockKey> {
    return (function generate(generated) {
      if (generated.size >= count) return generated;

      const x = Utils.random(COLS);
      const y = Utils.random(ROWS);
      const key = Utils.toAxB([x, y]);

      if (generated.has(key)) return generate(generated);
      return generate(generated.add(key));
    })(new Set<BlockKey>());
  }

  public static map(bombs: Set<BlockKey>) {
    const matrix: Map<BlockKey, Cell> = new Map();
    const map: Map<BlockKey, number | CellType.Bomb> = new Map();

    const incrementDanger = (neighborId: BlockKey) => {
      if (!map.has(neighborId)) return map.set(neighborId, 1);

      const neighbor = map.get(neighborId);
      if (neighbor !== CellType.Bomb) {
        map.set(neighborId, neighbor + 1);
      }
    };

    for (const key of bombs) {
      map.set(key, CellType.Bomb);
      for (const neighborId of Utils.cellNeighbors(key)) {
        incrementDanger(neighborId);
      }
    }

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const cell = new Cell(x, y);
        if (map.has(cell.key)) {
          const value = map.get(cell.key);
          if (value === CellType.Bomb) {
            cell.mined = true;
          } else {
            cell.value = value;
          }
        }

        matrix.set(cell.key, cell);
      }
    }

    return matrix;
  }
}
