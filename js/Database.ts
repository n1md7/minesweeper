import * as IndexedDBP from "@n1md7/indexeddb-promise";
import ScoresTable from "./Score.model";
import { GameMode } from "./main.constants";
import { GameChannelDto } from "./main.types";

export default class Database {
  private static instance: Database;
  private db: IndexedDBP.Database;
  private scoresTable: IndexedDBP.Model<ScoresTable>;

  private constructor() {
    this.init();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }

  private init() {
    this.db = new IndexedDBP.Database({
      version: 1,
      name: "Minesweeper",
      tables: [ScoresTable],
    });
  }

  public connect() {
    return this.db.connect().then(() => {
      this.scoresTable = this.db.useModel(ScoresTable);
    });
  }

  public addScore(payload: GameChannelDto): Promise<Partial<ScoresTable>> {
    return this.scoresTable.insert(payload);
  }

  public getHighScore(mode: GameMode) {
    return this.scoresTable
      .select({
        where: {
          mode,
        },
        orderByDESC: false,
        sortBy: "score",
        limit: 1,
      })
      .then(([maxScoreRecord]) => maxScoreRecord);
  }
}
