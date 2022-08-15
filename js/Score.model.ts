import { Table, PrimaryKey, Indexed } from "@n1md7/indexeddb-promise";
import { GameMode } from "./main.constants";

@Table({ name: "Scores", timestamps: true })
export default class ScoresTable {
  @PrimaryKey({ autoIncrement: true, unique: true })
  id: number;

  @Indexed()
  score: number;

  @Indexed()
  mode: GameMode;
}
