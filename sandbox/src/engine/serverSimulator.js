// Simulateur RGS Stake Engine
// Symboles réels de Fury of Anubis (Dieux, Reliques, Gemmes, Scatter, Multiplicateurs)

export const SYMBOLS = {
  H1: { id: 'H1', name: 'Scarabée d\'Or', file: '/assets/symbols/H1_scarab.png', payout: 50, isHigh: true },
  H2: { id: 'H2', name: 'Crâne Vert d\'Anubis', file: '/assets/symbols/H2_skull.png', payout: 25, isHigh: true },
  H3: { id: 'H3', name: 'Croix Ankh Maudite', file: '/assets/symbols/H3_ankh.png', payout: 15, isHigh: true },
  H4: { id: 'H4', name: 'Parchemin Sacré', file: '/assets/symbols/H4_scroll.png', payout: 10, isHigh: true },
  L1: { id: 'L1', name: 'Rubis Rouge', file: '/assets/symbols/L1_ruby.png', payout: 8, isHigh: false },
  L2: { id: 'L2', name: 'Améthyste Violette', file: '/assets/symbols/L2_amethyst.png', payout: 5, isHigh: false },
  L3: { id: 'L3', name: 'Émeraude Verte', file: '/assets/symbols/L3_emerald.png', payout: 4, isHigh: false },
  L4: { id: 'L4', name: 'Saphir Bleu', file: '/assets/symbols/L4_sapphire.png', payout: 3, isHigh: false },
  L5: { id: 'L5', name: 'Diamant Turquoise', file: '/assets/symbols/L5_diamond.png', payout: 2, isHigh: false },
  SCATTER: { id: 'SCATTER', name: 'Anubis Scatter', file: '/assets/symbols/SCATTER.png', payout: 100, isScatter: true },
  MULT: { id: 'MULT', name: 'Bombe Multiplicateur', file: '/assets/symbols/MULT_gold.png', payout: 0, isMult: true }
};

const SYMBOL_KEYS = ['H1', 'H2', 'H3', 'H4', 'L1', 'L2', 'L3', 'L4', 'L5'];
const MULT_VALUES = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];

export class StakeEngineSimulator {
  constructor(cols = 6, rows = 5) {
    this.cols = cols;
    this.rows = rows;
  }

  generateGrid(forceBigWin = false) {
    const grid = [];
    for (let c = 0; c < this.cols; c++) {
      const col = [];
      for (let r = 0; r < this.rows; r++) {
        let symKey;
        if (forceBigWin && Math.random() < 0.40) {
          symKey = 'H1'; // Abondance de Scarabées d'or
        } else {
          const rand = Math.random();
          if (rand < 0.04) symKey = 'MULT';
          else if (rand < 0.06) symKey = 'SCATTER';
          else symKey = SYMBOL_KEYS[Math.floor(Math.random() * SYMBOL_KEYS.length)];
        }
        col.push(symKey);
      }
      grid.push(col);
    }
    return grid;
  }

  evaluate(grid, bet = 1) {
    const counts = {};
    const mults = [];

    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const sym = grid[c][r];
        if (sym === 'MULT') {
          mults.push(MULT_VALUES[Math.floor(Math.random() * MULT_VALUES.length)]);
        } else if (sym !== 'SCATTER') {
          counts[sym] = (counts[sym] || 0) + 1;
        }
      }
    }

    const winningSymbols = [];
    let baseWin = 0;

    for (const [sym, count] of Object.entries(counts)) {
      if (count >= 8) {
        const symDef = SYMBOLS[sym];
        const winAmount = symDef.payout * (count / 8) * bet;
        baseWin += winAmount;
        winningSymbols.push({ symbol: sym, count, win: winAmount });
      }
    }

    const totalMult = mults.length > 0 ? mults.reduce((a, b) => a * b, 1) : 1;
    const finalWin = baseWin * totalMult;

    return {
      grid,
      winningSymbols,
      baseWin,
      multipliers: mults,
      totalMult,
      finalWin,
      isBigWin: finalWin >= bet * 20
    };
  }
}
