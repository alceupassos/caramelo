import * as Phaser from 'phaser';

const REEL_COUNT = 5;
const VISIBLE_ROWS = 3;
const SYMBOL_SIZE = 120;
const SYMBOL_GAP = 10;
const REEL_WIDTH = SYMBOL_SIZE + SYMBOL_GAP;
const SPIN_SPEED = 30;
const REEL_STOP_DELAY = 300;

interface SymbolDef {
  key: string;
  name: string;
  emoji: string;
  type: 'wild' | 'premium' | 'regular' | 'scatter';
  color: number;
  multiplier: { [key: number]: number };
  weight: number;
}

const SYMBOLS: SymbolDef[] = [
  { key: 'sym_tiger', name: 'Tiger', emoji: '\uD83D\uDC2F', type: 'wild', color: 0xFF8C00, multiplier: { 3: 10, 4: 25, 5: 100 }, weight: 2 },
  { key: 'sym_diamond', name: 'Diamond', emoji: '\uD83D\uDC8E', type: 'premium', color: 0x00BFFF, multiplier: { 3: 5, 4: 15, 5: 50 }, weight: 4 },
  { key: 'sym_clover', name: 'Clover', emoji: '\uD83C\uDF40', type: 'premium', color: 0x32CD32, multiplier: { 3: 4, 4: 12, 5: 40 }, weight: 5 },
  { key: 'sym_coin', name: 'Coin', emoji: '\uD83D\uDCB0', type: 'regular', color: 0xFFD700, multiplier: { 3: 3, 4: 8, 5: 25 }, weight: 8 },
  { key: 'sym_star', name: 'Star', emoji: '\u2B50', type: 'regular', color: 0xFFFF00, multiplier: { 3: 2, 4: 5, 5: 15 }, weight: 10 },
  { key: 'sym_scatter', name: 'Scatter', emoji: '\u2728', type: 'scatter', color: 0xFF00FF, multiplier: { 3: 0, 4: 0, 5: 0 }, weight: 3 },
];

// 20 paylines defined as row positions (0-2) across 5 reels
const PAYLINES: number[][] = [
  [1, 1, 1, 1, 1], // middle row
  [0, 0, 0, 0, 0], // top row
  [2, 2, 2, 2, 2], // bottom row
  [0, 1, 2, 1, 0], // V shape
  [2, 1, 0, 1, 2], // inverted V
  [0, 0, 1, 2, 2], // diagonal down
  [2, 2, 1, 0, 0], // diagonal up
  [1, 0, 0, 0, 1], // U top
  [1, 2, 2, 2, 1], // U bottom
  [0, 1, 1, 1, 0], // shallow V
  [2, 1, 1, 1, 2], // shallow inverted V
  [1, 0, 1, 0, 1], // zigzag up
  [1, 2, 1, 2, 1], // zigzag down
  [0, 1, 0, 1, 0], // small zigzag top
  [2, 1, 2, 1, 2], // small zigzag bottom
  [0, 0, 1, 0, 0], // bump down
  [2, 2, 1, 2, 2], // bump up
  [1, 0, 1, 2, 1], // W shape
  [0, 2, 0, 2, 0], // big zigzag
  [2, 0, 2, 0, 2], // big zigzag inverse
];

interface ReelSymbol {
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Rectangle;
  text: Phaser.GameObjects.Text;
  symbolIndex: number;
}

export default class TigrinhoScene extends Phaser.Scene {
  private reelContainers: Phaser.GameObjects.Container[] = [];
  private reelSymbols: ReelSymbol[][] = [];
  private grid: number[][] = []; // final result grid [reel][row]
  private spinning = false;
  private reelsStopped = 0;
  private betAmount = 100;
  private reelMasks: Phaser.Display.Masks.GeometryMask[] = [];
  private winLineGraphics!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;
  private winText!: Phaser.GameObjects.Text;
  private bgRect!: Phaser.GameObjects.Rectangle;
  private frameRect!: Phaser.GameObjects.Rectangle;
  private reelAreaX = 0;
  private reelAreaY = 0;
  private totalSymbolsPerReel = 20; // extra symbols for scrolling effect

  constructor() {
    super({ key: 'TigrinhoScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.bgRect = this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a);

    // Calculate reel area position (centered)
    const totalReelWidth = REEL_COUNT * REEL_WIDTH;
    const totalReelHeight = VISIBLE_ROWS * (SYMBOL_SIZE + SYMBOL_GAP);
    this.reelAreaX = (width - totalReelWidth) / 2;
    this.reelAreaY = (height - totalReelHeight) / 2 - 20;

    // Frame around reels
    this.frameRect = this.add.rectangle(
      width / 2,
      this.reelAreaY + totalReelHeight / 2,
      totalReelWidth + 20,
      totalReelHeight + 20,
      0x1a1a2e
    ).setStrokeStyle(3, 0xFFD700);

    // Title
    this.titleText = this.add.text(width / 2, this.reelAreaY - 50, 'TIGRINHO', {
      fontSize: '42px',
      fontFamily: 'monospace',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 6,
      shadow: { offsetX: 2, offsetY: 2, color: '#FF8C00', blur: 8, fill: true },
    }).setOrigin(0.5);

    // Win text
    this.winText = this.add.text(width / 2, this.reelAreaY + totalReelHeight + 50, '', {
      fontSize: '36px',
      fontFamily: 'monospace',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0);

    // Win line graphics
    this.winLineGraphics = this.add.graphics().setDepth(10);

    // Create reels
    for (let r = 0; r < REEL_COUNT; r++) {
      this.createReel(r);
    }

    // Set initial random symbols
    this.setRandomGrid();
    this.updateReelDisplay();

    // Resize handler
    this.scale.on('resize', () => this.handleResize());

    // Listen for spin event from React
    this.events.on('spin', () => this.spin());

    // Cleanup
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off('spin');
    });
  }

  private createReel(reelIndex: number) {
    const x = this.reelAreaX + reelIndex * REEL_WIDTH + REEL_WIDTH / 2;
    const y = this.reelAreaY;

    const container = this.add.container(x, y);
    this.reelContainers.push(container);

    const symbols: ReelSymbol[] = [];

    // Create enough symbols for scrolling (visible + extras for animation)
    for (let row = 0; row < this.totalSymbolsPerReel; row++) {
      const symY = row * (SYMBOL_SIZE + SYMBOL_GAP);
      const symIndex = Phaser.Math.Between(0, SYMBOLS.length - 1);
      const sym = SYMBOLS[symIndex];

      const bg = this.add.rectangle(0, symY, SYMBOL_SIZE, SYMBOL_SIZE, sym.color, 0.85)
        .setStrokeStyle(2, 0xFFFFFF, 0.3);
      bg.setOrigin(0.5);

      const text = this.add.text(0, symY, sym.emoji, {
        fontSize: '48px',
        fontFamily: 'sans-serif',
      }).setOrigin(0.5);

      container.add([bg, text]);
      symbols.push({ container, bg, text, symbolIndex: symIndex });
    }

    this.reelSymbols.push(symbols);

    // Create mask for reel (only show VISIBLE_ROWS symbols)
    const maskHeight = VISIBLE_ROWS * (SYMBOL_SIZE + SYMBOL_GAP);
    const maskGraphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    maskGraphics.fillStyle(0xffffff);
    maskGraphics.fillRect(
      x - REEL_WIDTH / 2,
      this.reelAreaY - (SYMBOL_SIZE + SYMBOL_GAP) / 2,
      REEL_WIDTH,
      maskHeight
    );
    const mask = maskGraphics.createGeometryMask();
    container.setMask(mask);
    this.reelMasks.push(mask);
  }

  private getWeightedRandomSymbol(): number {
    const totalWeight = SYMBOLS.reduce((sum, s) => sum + s.weight, 0);
    let rand = Phaser.Math.Between(1, totalWeight);
    for (let i = 0; i < SYMBOLS.length; i++) {
      rand -= SYMBOLS[i].weight;
      if (rand <= 0) return i;
    }
    return SYMBOLS.length - 1;
  }

  private setRandomGrid() {
    this.grid = [];
    for (let r = 0; r < REEL_COUNT; r++) {
      const reelResult: number[] = [];
      for (let row = 0; row < VISIBLE_ROWS; row++) {
        reelResult.push(this.getWeightedRandomSymbol());
      }
      this.grid.push(reelResult);
    }
  }

  private updateReelDisplay() {
    for (let r = 0; r < REEL_COUNT; r++) {
      const symbols = this.reelSymbols[r];
      for (let row = 0; row < VISIBLE_ROWS; row++) {
        const symIdx = this.grid[r][row];
        const sym = SYMBOLS[symIdx];
        const reelSym = symbols[row];
        reelSym.symbolIndex = symIdx;
        reelSym.bg.setFillStyle(sym.color, 0.85);
        reelSym.text.setText(sym.emoji);
      }
    }
  }

  public spin() {
    if (this.spinning) return;
    this.spinning = true;
    this.reelsStopped = 0;

    // Clear previous win display
    this.winLineGraphics.clear();
    this.winText.setAlpha(0);

    // Reset symbol scales/alphas from any previous win animation
    for (let r = 0; r < REEL_COUNT; r++) {
      for (let row = 0; row < VISIBLE_ROWS; row++) {
        const reelSym = this.reelSymbols[r][row];
        reelSym.bg.setAlpha(0.85);
        reelSym.text.setScale(1);
      }
    }

    // Generate the final result
    this.setRandomGrid();

    // Start each reel spinning
    for (let r = 0; r < REEL_COUNT; r++) {
      this.spinReel(r);
    }
  }

  private spinReel(reelIndex: number) {
    const container = this.reelContainers[reelIndex];
    const symbols = this.reelSymbols[reelIndex];
    const symbolHeight = SYMBOL_SIZE + SYMBOL_GAP;

    // During spin animation: rapidly cycle through random symbols
    const spinDuration = 1000 + reelIndex * REEL_STOP_DELAY;
    const cycleInterval = 60;
    let elapsed = 0;

    const spinTimer = this.time.addEvent({
      delay: cycleInterval,
      callback: () => {
        elapsed += cycleInterval;

        // Randomize visible symbols during spin
        for (let row = 0; row < VISIBLE_ROWS; row++) {
          const randIdx = this.getWeightedRandomSymbol();
          const sym = SYMBOLS[randIdx];
          symbols[row].symbolIndex = randIdx;
          symbols[row].bg.setFillStyle(sym.color, 0.85);
          symbols[row].text.setText(sym.emoji);
        }

        // Add a vertical jitter effect
        container.y = this.reelAreaY + Phaser.Math.Between(-3, 3);

        if (elapsed >= spinDuration) {
          spinTimer.destroy();
          this.stopReel(reelIndex);
        }
      },
      loop: true,
    });
  }

  private stopReel(reelIndex: number) {
    const container = this.reelContainers[reelIndex];
    const symbols = this.reelSymbols[reelIndex];

    // Set final symbols from grid
    for (let row = 0; row < VISIBLE_ROWS; row++) {
      const symIdx = this.grid[reelIndex][row];
      const sym = SYMBOLS[symIdx];
      symbols[row].symbolIndex = symIdx;
      symbols[row].bg.setFillStyle(sym.color, 0.85);
      symbols[row].text.setText(sym.emoji);
    }

    // Bounce stop effect
    this.tweens.add({
      targets: container,
      y: this.reelAreaY + 15,
      duration: 100,
      ease: 'Power2',
      yoyo: true,
      onComplete: () => {
        container.y = this.reelAreaY;
        this.reelsStopped++;

        if (this.reelsStopped >= REEL_COUNT) {
          this.onAllReelsStopped();
        }
      },
    });
  }

  private onAllReelsStopped() {
    this.spinning = false;

    // Check for wins
    const wins = this.checkWins();
    let totalWin = 0;

    // Check for scatter (free spins)
    let scatterCount = 0;
    for (let r = 0; r < REEL_COUNT; r++) {
      for (let row = 0; row < VISIBLE_ROWS; row++) {
        if (SYMBOLS[this.grid[r][row]].type === 'scatter') {
          scatterCount++;
        }
      }
    }

    if (scatterCount >= 3) {
      this.events.emit('freeSpins', 10);
    }

    if (wins.length > 0) {
      for (const win of wins) {
        totalWin += win.payout;
      }
      this.playWinAnimation(wins);

      if (totalWin >= this.betAmount * 20) {
        this.events.emit('bigWin', totalWin);
      }
      this.events.emit('win', totalWin);
    }

    this.events.emit('spinComplete', { totalWin, wins, grid: this.grid });
  }

  private checkWins(): { paylineIndex: number; symbolKey: string; count: number; payout: number; positions: { reel: number; row: number }[] }[] {
    const wins: { paylineIndex: number; symbolKey: string; count: number; payout: number; positions: { reel: number; row: number }[] }[] = [];

    for (let p = 0; p < PAYLINES.length; p++) {
      const payline = PAYLINES[p];
      const firstSymIdx = this.grid[0][payline[0]];
      const firstSym = SYMBOLS[firstSymIdx];

      // Skip scatter from payline wins (scatter has its own logic)
      if (firstSym.type === 'scatter') continue;

      let matchCount = 1;
      const positions: { reel: number; row: number }[] = [{ reel: 0, row: payline[0] }];

      for (let r = 1; r < REEL_COUNT; r++) {
        const symIdx = this.grid[r][payline[r]];
        const sym = SYMBOLS[symIdx];

        // Wild matches anything except scatter
        if (symIdx === firstSymIdx || sym.type === 'wild' || firstSym.type === 'wild') {
          matchCount++;
          positions.push({ reel: r, row: payline[r] });
        } else {
          break;
        }
      }

      if (matchCount >= 3) {
        const effectiveSym = firstSym.type === 'wild' ? firstSym : firstSym;
        const payout = (effectiveSym.multiplier[matchCount] || 0) * (this.betAmount / 20); // divide by number of paylines
        if (payout > 0) {
          wins.push({
            paylineIndex: p,
            symbolKey: effectiveSym.key,
            count: matchCount,
            payout,
            positions,
          });
        }
      }
    }

    return wins;
  }

  private playWinAnimation(wins: { paylineIndex: number; positions: { reel: number; row: number }[]; payout: number }[]) {
    const totalWin = wins.reduce((s, w) => s + w.payout, 0);

    // Show win text
    this.winText.setText(`WIN: ${Math.round(totalWin).toLocaleString()}`);
    this.winText.setAlpha(1);
    this.tweens.add({
      targets: this.winText,
      scale: { from: 0.5, to: 1.2 },
      duration: 300,
      yoyo: true,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: this.winText,
          scale: 1,
          duration: 200,
        });
      },
    });

    // Highlight winning positions
    const winPositions = new Set<string>();
    for (const win of wins) {
      for (const pos of win.positions) {
        winPositions.add(`${pos.reel}-${pos.row}`);
      }
    }

    // Dim non-winning symbols, pulse winning ones
    for (let r = 0; r < REEL_COUNT; r++) {
      for (let row = 0; row < VISIBLE_ROWS; row++) {
        const reelSym = this.reelSymbols[r][row];
        const key = `${r}-${row}`;
        if (winPositions.has(key)) {
          // Pulse winning symbols
          this.tweens.add({
            targets: reelSym.text,
            scale: { from: 1, to: 1.4 },
            duration: 400,
            yoyo: true,
            repeat: 2,
            ease: 'Sine.easeInOut',
          });
          reelSym.bg.setStrokeStyle(3, 0xFFD700, 1);
        } else {
          reelSym.bg.setAlpha(0.3);
        }
      }
    }

    // Draw payline paths
    this.winLineGraphics.clear();
    const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0xFFA500, 0xFF69B4];

    for (let w = 0; w < wins.length; w++) {
      const win = wins[w];
      const color = colors[w % colors.length];
      this.winLineGraphics.lineStyle(3, color, 0.8);
      this.winLineGraphics.beginPath();

      for (let i = 0; i < win.positions.length; i++) {
        const pos = win.positions[i];
        const x = this.reelAreaX + pos.reel * REEL_WIDTH + REEL_WIDTH / 2;
        const y = this.reelAreaY + pos.row * (SYMBOL_SIZE + SYMBOL_GAP);

        if (i === 0) {
          this.winLineGraphics.moveTo(x, y);
        } else {
          this.winLineGraphics.lineTo(x, y);
        }
      }

      this.winLineGraphics.strokePath();
    }

    // Auto-clear win display after a delay
    this.time.delayedCall(3000, () => {
      this.winLineGraphics.clear();
      this.winText.setAlpha(0);
      for (let r = 0; r < REEL_COUNT; r++) {
        for (let row = 0; row < VISIBLE_ROWS; row++) {
          const reelSym = this.reelSymbols[r][row];
          reelSym.bg.setAlpha(0.85);
          reelSym.bg.setStrokeStyle(2, 0xFFFFFF, 0.3);
          reelSym.text.setScale(1);
        }
      }
    });
  }

  public setBetAmount(amount: number) {
    this.betAmount = amount;
  }

  private handleResize() {
    const { width, height } = this.scale;

    this.bgRect.setPosition(width / 2, height / 2);
    this.bgRect.setSize(width, height);

    const totalReelWidth = REEL_COUNT * REEL_WIDTH;
    const totalReelHeight = VISIBLE_ROWS * (SYMBOL_SIZE + SYMBOL_GAP);
    this.reelAreaX = (width - totalReelWidth) / 2;
    this.reelAreaY = (height - totalReelHeight) / 2 - 20;

    this.frameRect.setPosition(width / 2, this.reelAreaY + totalReelHeight / 2);
    this.frameRect.setSize(totalReelWidth + 20, totalReelHeight + 20);

    this.titleText.setPosition(width / 2, this.reelAreaY - 50);
    this.winText.setPosition(width / 2, this.reelAreaY + totalReelHeight + 50);

    // Reposition reel containers
    for (let r = 0; r < REEL_COUNT; r++) {
      const x = this.reelAreaX + r * REEL_WIDTH + REEL_WIDTH / 2;
      this.reelContainers[r].setPosition(x, this.reelAreaY);

      // Rebuild masks
      if (this.reelMasks[r]) {
        this.reelContainers[r].clearMask(true);
      }
      const maskGraphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
      maskGraphics.fillStyle(0xffffff);
      maskGraphics.fillRect(
        x - REEL_WIDTH / 2,
        this.reelAreaY - (SYMBOL_SIZE + SYMBOL_GAP) / 2,
        REEL_WIDTH,
        VISIBLE_ROWS * (SYMBOL_SIZE + SYMBOL_GAP)
      );
      const mask = maskGraphics.createGeometryMask();
      this.reelContainers[r].setMask(mask);
      this.reelMasks[r] = mask;
    }
  }
}
