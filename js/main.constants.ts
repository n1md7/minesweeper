import Utils from "./Utils";

export const [ROWS, COLS] = Utils.gameMode();
export const CELL_SIZE = 48;
export const CELL_PADDING = 0;
export const CONTAINER_MARGIN = 14;
export const CELL_BORDER_RADIUS = 0;
export const HEADER_HEIGHT = CELL_SIZE * 2;
export const TEXT_PADDING = 4;
export const APP_WIDTH = CELL_SIZE * COLS + CONTAINER_MARGIN * 2;
export const APP_HEIGHT =
  ROWS * CELL_SIZE + HEADER_HEIGHT + CONTAINER_MARGIN * 2;

export enum CellType {
  Bomb = "💣",
  Flag = "🚩",
  Question = "❓",
  Empty = "",
}

export enum GameState {
  Playing = "🙂",
  Won = "😎",
  Worried = "😮",
  Flag = "🚩",
}

export enum Colors {
  Default = 0xffffff,
  Line = 0x000000,
  Bomb = 0xff0000,
  Opened = 0xcccccc,
  Flag = 0x0000ff,
  Question = 0xffff00,
  Empty = 0xcccccc,
  One = 0x0000ff,
  Two = 0x72ffa5,
  Three = 0xff0000,
  Four = 0xcc00ff,
  Five = 0xff00cc,
  Six = 0xcccccc,
  Seven = 0x000000,
  Eight = 0x111111,
}

export const ColorsList = [
  Colors.One,
  Colors.Two,
  Colors.Three,
  Colors.Four,
  Colors.Five,
  Colors.Six,
  Colors.Seven,
  Colors.Eight,
];

export enum GameMode {
  beginner = "9x9",
  intermediate = "16x16",
  expert = "24x24",
}

export enum SoundType {
  Click = "click",
  Flag = "flag",
  Win = "win",
  Lose = "lose",
}
