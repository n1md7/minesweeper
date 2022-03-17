import { GameMode } from "./main.constants";

export type BlockKey = `${number}x${number}`;
export type NumberFormat = `${number}${number}${number}`;
export type GameChannelDto = {
  score: number;
  mode: GameMode;
};
