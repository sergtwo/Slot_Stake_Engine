// Configuration modulaire du jeu (facile à dupliquer/reskinner pour d'autres slots)
export const GAME_CONFIG = {
  id: 'vs20wraanu',
  title: 'Fury of Anubis',
  cols: 6,
  rows: 5,
  symbolSize: 92,
  spacing: 8,
  minClusterCount: 8, // Pay-anywhere : gain dès 8 symboles identiques
  symbols: {
    H1: { id: 'H1', name: 'Scarabée d\'Or', file: '/assets/symbols/H1_scarab.png', payouts: { 8: 10, 10: 25, 12: 50 }, isHigh: true },
    H2: { id: 'H2', name: 'Crâne Vert d\'Anubis', file: '/assets/symbols/H2_skull.png', payouts: { 8: 5, 10: 15, 12: 25 }, isHigh: true },
    H3: { id: 'H3', name: 'Croix Ankh Maudite', file: '/assets/symbols/H3_ankh.png', payouts: { 8: 4, 10: 10, 12: 15 }, isHigh: true },
    H4: { id: 'H4', name: 'Parchemin Sacré', file: '/assets/symbols/H4_scroll.png', payouts: { 8: 3, 10: 8, 12: 12 }, isHigh: true },
    L1: { id: 'L1', name: 'Rubis Rouge', file: '/assets/symbols/L1_ruby.png', payouts: { 8: 2, 10: 5, 12: 10 }, isHigh: false },
    L2: { id: 'L2', name: 'Améthyste Violette', file: '/assets/symbols/L2_amethyst.png', payouts: { 8: 1.5, 10: 4, 12: 8 }, isHigh: false },
    L3: { id: 'L3', name: 'Émeraude Verte', file: '/assets/symbols/L3_emerald.png', payouts: { 8: 1, 10: 3, 12: 5 }, isHigh: false },
    L4: { id: 'L4', name: 'Saphir Bleu', file: '/assets/symbols/L4_sapphire.png', payouts: { 8: 0.8, 10: 2, 12: 4 }, isHigh: false },
    L5: { id: 'L5', name: 'Diamant Turquoise', file: '/assets/symbols/L5_diamond.png', payouts: { 8: 0.5, 10: 1.5, 12: 3 }, isHigh: false },
    SCATTER: { id: 'SCATTER', name: 'Anubis Scatter', file: '/assets/symbols/SCATTER.png', payouts: { 4: 3, 5: 5, 6: 100 }, isScatter: true },
    MULT: { id: 'MULT', name: 'Orbe Multiplicateur', file: '/assets/symbols/MULT_gold.png', isMult: true }
  },
  multipliers: [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 50, 100, 250, 500]
};

const SYMBOL_KEYS = ['H1', 'H2', 'H3', 'H4', 'L1', 'L2', 'L3', 'L4', 'L5'];

export class SlotEngineMath {
  constructor(config = GAME_CONFIG) {
    this.config = config;
    this.cols = config.cols;
    this.rows = config.rows;
  }

  // Génère un symbole aléatoire ou pondéré
  getRandomSymbol(forceBigWin = false) {
    if (forceBigWin && Math.random() < 0.45) {
      return 'H1'; // Forcer abondance de symboles forts
    }
    const r = Math.random();
    if (r < 0.04) return 'MULT';
    if (r < 0.06) return 'SCATTER';
    return SYMBOL_KEYS[Math.floor(Math.random() * SYMBOL_KEYS.length)];
  }

  // Génère la grille de départ (6 cols x 5 rows)
  generateInitialGrid(forceBigWin = false) {
    const grid = [];
    for (let c = 0; c < this.cols; c++) {
      const col = [];
      for (let r = 0; r < this.rows; r++) {
        col.push(this.getRandomSymbol(forceBigWin));
      }
      grid.push(col);
    }
    return grid;
  }

  // Évalue les gains "Pay-Anywhere" de la grille
  evaluateGrid(grid, bet = 1.0) {
    const counts = {};
    const positions = {}; // symKey -> array of {c, r}
    const multValues = [];

    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const sym = grid[c][r];
        if (sym === 'MULT') {
          const mult = this.config.multipliers[Math.floor(Math.random() * this.config.multipliers.length)];
          multValues.push(mult);
        } else if (sym !== 'SCATTER') {
          counts[sym] = (counts[sym] || 0) + 1;
          if (!positions[sym]) positions[sym] = [];
          positions[sym].push({ c, r });
        }
      }
    }

    const winningClusters = [];
    const winningCells = [];
    let stepWin = 0;

    for (const [sym, count] of Object.entries(counts)) {
      if (count >= this.config.minClusterCount) {
        const symbolDef = this.config.symbols[sym];
        let payoutMult = symbolDef.payouts[8];
        if (count >= 12) payoutMult = symbolDef.payouts[12];
        else if (count >= 10) payoutMult = symbolDef.payouts[10];

        const winAmount = parseFloat((bet * payoutMult).toFixed(2));
        stepWin += winAmount;

        winningClusters.push({
          sym,
          count,
          payoutMult,
          winAmount,
          positions: positions[sym]
        });

        winningCells.push(...positions[sym]);
      }
    }

    return {
      hasWin: winningClusters.length > 0,
      winningClusters,
      winningCells,
      stepWin,
      multValues
    };
  }

  // Effectue la cascade : retire les cellules gagnantes, fait tomber les symboles, et remplit par le haut
  applyTumble(grid) {
    const nextGrid = [];
    const tumbleDetails = []; // pour guider les animations si besoin

    for (let c = 0; c < this.cols; c++) {
      const col = grid[c];
      const newCol = [];

      // Conserver les symboles qui ne sont pas détruits (null)
      for (let r = 0; r < this.rows; r++) {
        if (col[r] !== null) {
          newCol.push(col[r]);
        }
      }

      // Nombre de nouveaux symboles à faire tomber du haut
      const missing = this.rows - newCol.length;
      const incoming = [];
      for (let i = 0; i < missing; i++) {
        incoming.push(this.getRandomSymbol(false));
      }

      // Les nouveaux symboles arrivent au sommet
      const finalCol = [...incoming, ...newCol];
      nextGrid.push(finalCol);
      tumbleDetails.push({ colIndex: c, missing, incoming });
    }

    return { nextGrid, tumbleDetails };
  }

  // Simule une séquence complète de Spin avec tous ses Tumbles
  executeFullSpin(bet = 1.0, forceBigWin = false) {
    const steps = [];
    let currentGrid = this.generateInitialGrid(forceBigWin);
    let totalBaseWin = 0;
    let accumulatedMultipliers = 0;
    let tumbleCount = 0;

    while (true) {
      const evalResult = this.evaluateGrid(currentGrid, bet);

      // Accumuler les multiplicateurs apparus sur la grille
      if (evalResult.multValues.length > 0) {
        for (const m of evalResult.multValues) {
          accumulatedMultipliers += m;
        }
      }

      // Cloner la grille actuelle pour l'historique visuel
      const gridSnapshot = currentGrid.map(col => [...col]);

      if (!evalResult.hasWin) {
        // Fin de la séquence de tumbles
        steps.push({
          tumbleIndex: tumbleCount,
          grid: gridSnapshot,
          winningCells: [],
          winningClusters: [],
          stepWin: 0,
          newMults: evalResult.multValues,
          isFinal: true
        });
        break;
      }

      totalBaseWin += evalResult.stepWin;

      // Marquer les symboles gagnants comme détruits (null)
      for (const cell of evalResult.winningCells) {
        currentGrid[cell.c][cell.r] = null;
      }

      steps.push({
        tumbleIndex: tumbleCount,
        grid: gridSnapshot,
        winningCells: evalResult.winningCells,
        winningClusters: evalResult.winningClusters,
        stepWin: evalResult.stepWin,
        newMults: evalResult.multValues,
        isFinal: false
      });

      // Appliquer la cascade physique
      const { nextGrid } = this.applyTumble(currentGrid);
      currentGrid = nextGrid;
      tumbleCount++;

      // Sécurité anti-boucle infinie (max 30 tumbles)
      if (tumbleCount > 30) break;
    }

    // Calcul du gain final avec ou sans multiplicateur
    const effectiveMultiplier = Math.max(1, accumulatedMultipliers);
    const finalWin = parseFloat((totalBaseWin * (accumulatedMultipliers > 0 ? effectiveMultiplier : 1)).toFixed(2));

    return {
      bet,
      steps,
      totalBaseWin: parseFloat(totalBaseWin.toFixed(2)),
      accumulatedMultipliers,
      effectiveMultiplier,
      finalWin,
      tumbleCount,
      isBigWin: finalWin >= bet * 10
    };
  }
}
