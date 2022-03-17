import { APP_HEIGHT, APP_WIDTH, COLS, GameMode, ROWS } from "./main.constants";
import HeaderBlock from "./blocks/Header.block";
import BodyBlock from "./blocks/Body.block";
import StatusBlock from "./blocks/Status.block";
import BombBlock from "./blocks/Bomb.block";
import TimerBlock from "./blocks/Timer.block";
import Generate from "./Generate";
import { BlockKey, GameChannelDto } from "./main.types";
import Cell from "./blocks/Cell.block";
import Utils from "./Utils";
import * as PIXI from "pixi.js";
import ms from "ms";
import { Observable, ReplaySubject } from "rxjs";

export default class Minesweeper {
  private static instance: Minesweeper;
  private subject: ReplaySubject<GameChannelDto>;
  private observer: Observable<GameChannelDto>;
  private app: PIXI.Application;
  private header: HeaderBlock;
  private body: BodyBlock;
  private gameStartedAt = Date.now();
  private lastActivityAt = Date.now();
  private map: Map<BlockKey, Cell> = new Map();
  private revealed: Set<BlockKey> = new Set();
  private flagged: Set<BlockKey> = new Set();
  private finished = false;
  private bomb = {
    amount: 0,
    blocks: null,
  };

  private constructor() {
    this.init();
  }

  public get broadcast(): Observable<GameChannelDto> {
    return this.observer;
  }

  public static getInstance(): Minesweeper {
    if (!Minesweeper.instance) {
      Minesweeper.instance = new Minesweeper();
    }

    return Minesweeper.instance;
  }

  public render(): void {
    const container = document.querySelector(".container .body");
    if (container) {
      container.appendChild(this.app.view);
    }
  }

  private init(): void {
    this.subject = new ReplaySubject<GameChannelDto>(0, 0);
    this.observer = this.subject.asObservable();
    this.createPixiApplication();
    this.attachHeader();
    this.attachBody();
    this.generateBombs();
    this.generateMap();
    this.subscribeEvents();
    this.registerTicker();
    this.render();
  }

  private createPixiApplication(): void {
    this.app = new PIXI.Application({
      width: APP_WIDTH,
      height: APP_HEIGHT,
      backgroundColor: 0xeeeeee,
      resolution: window.devicePixelRatio || 1,
    });
  }

  private attachHeader(): void {
    const status = new StatusBlock();
    const bomb = new BombBlock();
    const timer = new TimerBlock();

    this.header = new HeaderBlock(timer, status, bomb);
    this.app.stage.addChild(this.header);
  }

  private attachBody(): void {
    this.body = new BodyBlock();
    this.app.stage.addChild(this.body);
  }

  private generateBombs(): void {
    const sqrt = ROWS * COLS * 0.113;
    const amount = Math.round(sqrt);
    const blocks = Generate.bombs(amount);
    this.bomb = {
      amount,
      blocks,
    };
    this.header.updateBombCounter(amount - this.flagged.size);
  }

  private generateMap(): void {
    this.map = Generate.map(this.bomb.blocks);
  }

  private updateActivityStamp(): void {
    this.lastActivityAt = Date.now();
    this.header.status.setPlaying();
  }

  private calculateTime() {
    const now = Date.now();
    const delta = now - this.gameStartedAt;
    return Math.ceil(delta / 1000);
  }

  private assertActivity(): void {
    const now = Date.now();
    const delta = now - this.lastActivityAt;
    if (delta > ms("7s")) {
      this.updateActivityStamp();
      this.header.status.setIdle();
    }
  }

  private openCell(cell: Cell) {
    if (this.finished) return;

    if (cell.opened) return;
    if (cell.flagged) return;
    if (cell.mined) return this.gameOver(cell);

    this.updateActivityStamp();
    this.header.status.setPlaying();

    this.propagateOpen(cell, new Set());
    return this.assertWin();
  }

  private propagateOpen(cell: Cell, visited: Set<BlockKey>) {
    cell.open();
    this.revealed.add(cell.key);
    visited.add(cell.key);
    const neighbors = Utils.cellNeighbors(cell.key);
    for (const neighborId of neighbors) {
      const neighbor = this.map.get(neighborId);
      if (cell.isEmpty && !visited.has(neighborId)) {
        this.propagateOpen(neighbor, visited);
      }
    }
  }

  private assertWin(): void {
    const remaining = this.map.size - this.revealed.size;
    if (remaining === this.bomb.amount) {
      this.gameWin();
    }
  }

  private gameWin(): void {
    this.finished = true;
    this.header.status.setWon();
    const [ROWS, COLS] = Utils.gameMode();
    this.subject.next({
      mode: `${ROWS}x${COLS}` as GameMode,
      score: this.calculateTime(),
    });
  }

  private revealRemainingBombs(): void {
    for (const bomb of this.bomb.blocks) {
      this.map.get(bomb).open();
    }
  }

  private gameOver(cell: Cell) {
    cell.detonate();
    this.revealed.add(cell.key);
    this.finished = true;
    this.revealRemainingBombs();
    return this.header.status.setGameOver();
  }

  private restartGame() {
    this.gameStartedAt = Date.now();
    this.lastActivityAt = Date.now();
    this.revealed.clear();
    this.flagged.clear();
    this.unsubscribeEvents();
    this.generateBombs();
    this.generateMap();
    this.subscribeEvents();
    this.header.status.setPlaying();
    this.finished = false;
  }

  private subscribeEvents(): void {
    this.map.forEach((cell) => {
      cell.on("mousedown", ({ target: cell }) => {
        if (this.finished) return;
        if (cell.isDisabled) return;
        this.header.status.setWorried();
      });
      cell.on("mouseup", ({ target: cell }) => {
        this.openCell(cell);
      });
      cell.on("rightclick", ({ target: cell }) => {
        if (this.finished) return;
        if (cell.opened) return;
        cell.flagged = !cell.flagged;
        cell.updateVisual();
        cell.flagged
          ? this.flagged.add(cell.key)
          : this.flagged.delete(cell.key);
        this.header.updateBombCounter(this.bomb.amount - this.flagged.size);
        this.updateActivityStamp();
      });
    });
    this.header.status.interactive = true;
    this.header.status.on("click", () => {
      this.restartGame();
    });
    this.body.addChild(...this.map.values());
  }

  private unsubscribeEvents(): void {
    this.map.forEach((cell) => {
      cell.off("mousedown");
      cell.off("mouseup");
      cell.off("rightclick");
    });
    this.header.status.interactive = false;
    this.header.status.off("click");
    this.body.removeChildren();
  }

  private registerTicker(): void {
    this.app.ticker.add(() => {
      if (this.finished) return;

      this.assertActivity();
      this.header.updateTimer(this.calculateTime());
    });
  }
}
