import { APP_HEIGHT, APP_WIDTH, COLS, ROWS } from "./main.constants";

import HeaderBlock from "./blocks/Header.block";
import BodyBlock from "./blocks/Body.block";
import StatusBlock from "./blocks/Status.block";
import BombBlock from "./blocks/Bomb.block";
import TimerBlock from "./blocks/Timer.block";
import Cell from "./blocks/Cell.block";

import Generate from "./Generate";
import Utils from "./Utils";

import ms from "ms";
import * as PIXI from "pixi.js";
import Sound from "./sound/Sound";
import { Observable, ReplaySubject } from "rxjs";
import { Modal } from "bootstrap/dist/js/bootstrap.esm";

import type { BlockKey, GameChannelDto } from "./main.types";

export default class Minesweeper {
  private static instance: Minesweeper;
  private crazySDK: any;
  private adModal: Modal;
  private adAlert: Modal;
  private subject: ReplaySubject<GameChannelDto>;
  private observer: Observable<GameChannelDto>;
  private touchSubject: ReplaySubject<unknown>;
  private touchObserver: Observable<unknown>;
  private app: PIXI.Application;
  private header: HeaderBlock;
  private body: BodyBlock;
  private gameStartedAt = Date.now();
  private lastActivityAt = Date.now();
  private touchStartedAt = Date.now();
  private touchSensitivity = 196; // ms
  private adSuggestionAt = 0.51; // 51%
  private remainingUndos = 2;
  private map: Map<BlockKey, Cell> = new Map();
  private revealed: Set<BlockKey> = new Set();
  private flagged: Set<BlockKey> = new Set();
  private finished = false;
  private started = false;
  private lastRevealedCell: Cell | null = null;
  private adsEnabled = false;
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

  private get isLongPress(): boolean {
    const now = Date.now();
    const delta = now - this.touchStartedAt;

    return delta > this.touchSensitivity;
  }

  private get isRevealedEnoughToSuggestAd(): boolean {
    const revealedSize = this.revealed.size + this.flagged.size;
    return revealedSize / (ROWS * COLS) >= this.adSuggestionAt;
  }

  public static getInstance(): Minesweeper {
    if (!Minesweeper.instance) {
      Minesweeper.instance = new Minesweeper();
    }

    return Minesweeper.instance;
  }

  private render(): void {
    const container = document.querySelector(".container .body");
    if (container) {
      container.appendChild(this.app.view);
    }
  }

  private init(): void {
    // @ts-ignore
    this.crazySDK = window.CrazyGames?.CrazySDK?.getInstance();
    this.subject = new ReplaySubject<GameChannelDto>(0, 0);
    this.observer = this.subject.asObservable();
    this.crazySDK?.init();
    this.conditionalInitForMobile();
    this.createPixiApplication();
    this.attachHeader();
    this.attachBody();
    this.generateBombs();
    this.generateMap();
    this.subscribeEvents();
    this.subscribeAdEvents();
    this.subscribeAdModal();
    this.registerTicker();
    this.render();
  }

  private conditionalInitForMobile(): void {
    if (Utils.isMobile) {
      this.touchSubject = new ReplaySubject<unknown>(0, 0);
      this.touchObserver = this.touchSubject.asObservable();
    }
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
    const coefficient = ROWS * COLS * 0.129;
    const amount = Math.floor(coefficient);
    const blocks = Generate.bombs(amount);
    this.bomb = {
      amount,
      blocks,
    };
    this.header.updateBombCounter(amount - this.flagged.size);
  }

  private generateMap(): void {
    this.map = Generate.map(this.bomb.blocks);
    this.map.forEach((cell) => cell.canvasRender());
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

  private propagateOpen(cell: Cell, visited: Set<BlockKey>) {
    cell.open();
    this.revealed.add(cell.key);
    this.lastRevealedCell = cell;
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
    Sound.playWin();
    this.finished = true;
    this.started = false;
    this.header.status.setWon();
    this.crazySDK?.gameplayStop();
    this.subject.next({
      mode: Utils.gameMode(),
      score: this.calculateTime(),
    });
  }

  private revealRemainingBombs(): void {
    for (const bomb of this.bomb.blocks) {
      this.map.get(bomb).open();
    }
  }

  private hideRevealedBombs(): void {
    for (const bomb of this.bomb.blocks) {
      this.map.get(bomb).undoOpen();
    }
  }

  private gameOver(cell: Cell) {
    Sound.playLose();
    cell.detonate();
    this.revealed.add(cell.key);
    this.lastRevealedCell = cell;
    this.finished = true;
    this.started = false;
    this.revealRemainingBombs();
    this.header.status.setGameOver();
    this.crazySDK?.gameplayStop();
    if (this.isRevealedEnoughToSuggestAd && this.remainingUndos > 0) {
      this.adModal.show();
    }
  }

  private undoLastMove() {
    if (!this.lastRevealedCell) return false;

    this.crazySDK?.gameplayStart();
    this.revealed.delete(this.lastRevealedCell.key);
    this.lastRevealedCell.undoDetonate();
    this.finished = false;
    this.started = true;
    this.hideRevealedBombs();
    this.header.status.setPlaying();

    return true;
  }

  private subscribeAdModal() {
    const modal = document.getElementById("watchAd");
    const confirm = document.getElementById("adModalConfirm");
    const alert = document.getElementById("noAdAvailable");
    if (modal) this.adModal = new Modal(modal);
    if (alert) this.adAlert = new Modal(alert);
    if (confirm) {
      confirm.addEventListener("click", () => {
        this.adModal.hide();
        if (this.adsEnabled) this.crazySDK?.requestAd("rewarded");
        else this.adFinished();
      });
    }
  }

  private restartGame() {
    this.gameStartedAt = Date.now();
    this.lastActivityAt = Date.now();
    this.revealed.clear();
    this.flagged.clear();
    this.unsubscribeEvents();
    this.unsubscribeAdEvents();
    this.generateBombs();
    this.generateMap();
    this.subscribeEvents();
    this.subscribeAdEvents();
    this.header.updateTimer(0);
    this.header.status.setPlaying();
    this.finished = false;
    this.started = false;
    this.lastRevealedCell = null;
    this.remainingUndos = 2;
  }

  private subscribeEvents(): void {
    this.map.forEach((cell) => {
      if (Utils.isMobile) {
        cell.on("touchstart", this.cellTouchStart, this);
        cell.on("touchend", this.cellTouchEnd, this);
      } else {
        cell.on("mousedown", this.cellPress, this);
        cell.on("mouseup", this.cellRelease, this);
        cell.on("rightclick", this.cellContextMenuPress, this);
      }
    });
    this.header.status.interactive = true;
    if (Utils.isMobile) {
      this.header.status.on("pointertap", this.statusPress, this);
    } else {
      this.header.status.on("click", this.statusPress, this);
    }
    this.body.addChild(...this.map.values());
  }

  private unsubscribeEvents(): void {
    this.map.forEach((cell) => {
      cell.off("touchstart", this.cellTouchStart, this);
      cell.off("touchend", this.cellTouchEnd, this);
      cell.off("mousedown", this.cellPress, this);
      cell.off("mouseup", this.cellRelease, this);
      cell.off("pointertap", this.cellRelease, this);
      cell.off("rightclick", this.cellContextMenuPress, this);
    });
    this.header.status.interactive = false;
    this.header.status.off("click", this.statusPress, this);
    this.header.status.off("pointertap", this.statusPress, this);
    this.body.removeChildren();
  }

  private subscribeAdEvents() {
    if (!this.adsEnabled) return;
    this.crazySDK?.addEventListener("adStarted", this.adStarted);
    this.crazySDK?.addEventListener("adError", this.adError);
    this.crazySDK?.addEventListener("adFinished", this.adFinished);
  }

  private unsubscribeAdEvents() {
    if (!this.adsEnabled) return;
    this.crazySDK?.removeEventListener("adStarted", this.adStarted);
    this.crazySDK?.removeEventListener("adError", this.adError);
    this.crazySDK?.removeEventListener("adFinished", this.adFinished);
  }

  private adStarted = () => {};

  private adError = () => {
    this.adAlert.show();
  };

  private adFinished = () => {
    this.remainingUndos--;
    this.undoLastMove();
  };

  private statusPress() {
    this.restartGame();
  }

  private cellTouchStart(event) {
    if (this.finished) return;
    this.touchStartedAt = Date.now();
    this.cellPress(event);
    const scheduledTimer = setTimeout(() => {
      this.header.status.setFlag();
    }, this.touchSensitivity);
    this.touchObserver.subscribe(() => {
      clearInterval(scheduledTimer);
      this.header.status.setPlaying();
    });
  }

  private cellTouchEnd({ target: cell }) {
    if (this.finished) return;
    this.touchSubject.next("Display playing status");
    if (this.isLongPress) {
      return this.cellContextMenuPress({ target: cell });
    }
    // Just a regular click
    return this.cellRelease({ target: cell });
  }

  private cellPress({ target: cell }) {
    if (this.finished) return;
    if (cell.isDisabled) return;
    this.header.status.setWorried();
  }

  // This is actual click event
  private cellRelease({ target: cell }, recursiveCall = false) {
    if (this.finished) return;
    if (!recursiveCall) Sound.playClick();
    if (!this.started) {
      this.started = true;
      this.gameStartedAt = Date.now();
      this.crazySDK?.gameplayStart();
    }

    if (cell.flagged) return;
    if (cell.opened) {
      if (cell.value) {
        const dangerousNeighbors = new Set();
        const flaggedNeighbors = new Set();
        for (const neighbor of Utils.cellNeighbors(cell.key)) {
          const neighborCell = this.map.get(neighbor);
          if (!neighborCell.opened && !neighborCell.flagged) {
            dangerousNeighbors.add(neighborCell);
          }
          if (neighborCell.flagged) {
            flaggedNeighbors.add(neighborCell);
          }
        }
        if (flaggedNeighbors.size === cell.value) {
          for (const neighbor of dangerousNeighbors) {
            this.cellRelease({ target: neighbor }, true);
          }
        }
      }
      return;
    }
    if (cell.mined) return this.gameOver(cell);

    this.updateActivityStamp();
    this.header.status.setPlaying();

    this.propagateOpen(cell, new Set());
    return this.assertWin();
  }

  private cellContextMenuPress({ target: cell }) {
    if (this.finished) return;
    if (cell.opened) return;
    cell.flagged = !cell.flagged;
    cell.rerender();
    cell.flagged ? this.flagged.add(cell.key) : this.flagged.delete(cell.key);
    const bombs = this.bomb.amount - this.flagged.size;
    this.header.updateBombCounter(bombs >= 0 ? bombs : 0);
    this.updateActivityStamp();
    Sound.playFlag();
  }

  private registerTicker(): void {
    this.app.ticker.add(() => {
      if (this.finished) return;
      if (this.started) {
        this.assertActivity();
        this.header.updateTimer(this.calculateTime());
      }
    });
  }
}
