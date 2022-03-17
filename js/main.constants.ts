export const ROWS = 9;
export const COLS = 9;
export const CELL_SIZE = 32;
export const CELL_PADDING = 1;
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
  Two = 0x00ff00,
  Three = 0xffff00,
  Four = 0xff0000,
  Five = 0x0000ff,
  Six = 0x00ff00,
  Seven = 0xffff00,
  Eight = 0xff0000,
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
