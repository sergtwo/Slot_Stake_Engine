export type GameConfig = {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  startingBalance: number;
  defaultBet: number;
  betSteps: number[];
  grid: {
    cols: number;
    rows: number;
    symbolSize: number;
    spacing: number;
  };
  theme: {
    frame: number;
    glow: number;
    accent: number;
    panel: number;
    background: number;
  };
  assets: {
    background: string;
    anubis: string;
    goldArch: string;
    goldBorderTop: string;
    bgPattern: string;
    symbols: Record<string, string>;
  };
  simulator: {
    symbolKeys: string[];
    payoutTable: Record<string, number>;
    bigWinSymbol: string;
    bigWinChance: number;
    multChance: number;
    scatterChance: number;
    multValues: number[];
    symbolWeights: Record<string, number>;
    winThresholdMultiplier: number;
  };
};

const sharedAssets = {
  background: '/assets/background.jpg',
  anubis: '/assets/anubis_idle.png',
  goldArch: '/assets/gold_arch.png',
  goldBorderTop: '/assets/gold_border_top.png',
  bgPattern: '/assets/bg_reels_pattern.png',
  symbols: {
    H1: '/assets/symbols/H1_scarab.png',
    H2: '/assets/symbols/H2_skull.png',
    H3: '/assets/symbols/H3_ankh.png',
    H4: '/assets/symbols/H4_scroll.png',
    L1: '/assets/symbols/L1_ruby.png',
    L2: '/assets/symbols/L2_amethyst.png',
    L3: '/assets/symbols/L3_emerald.png',
    L4: '/assets/symbols/L4_sapphire.png',
    L5: '/assets/symbols/L5_diamond.png',
    SCATTER: '/assets/symbols/SCATTER.png',
    MULT: '/assets/symbols/MULT_gold.png'
  }
};

const sharedSimulator = {
  symbolKeys: ['H1', 'H2', 'H3', 'H4', 'L1', 'L2', 'L3', 'L4', 'L5'],
  payoutTable: {
    H1: 50,
    H2: 25,
    H3: 15,
    H4: 10,
    L1: 8,
    L2: 5,
    L3: 4,
    L4: 3,
    L5: 2
  },
  bigWinSymbol: 'H1',
  bigWinChance: 0.4,
  multChance: 0.04,
  scatterChance: 0.06,
  multValues: [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048],
  symbolWeights: {
    H1: 6,
    H2: 7,
    H3: 9,
    H4: 11,
    L1: 14,
    L2: 16,
    L3: 18,
    L4: 20,
    L5: 22
  },
  winThresholdMultiplier: 20
};

export const GAME_CATALOG: GameConfig[] = [
  {
    id: 'fury_of_anubis',
    label: 'Fury of Anubis',
    title: 'FURY OF ANUBIS',
    subtitle: 'Local Emulator',
    startingBalance: 10000,
    defaultBet: 1,
    betSteps: [0.2, 0.5, 1, 2, 5, 10, 20, 50, 100],
    grid: {
      cols: 6,
      rows: 5,
      symbolSize: 92,
      spacing: 8
    },
    theme: {
      frame: 0xd4af37,
      glow: 0xfbbf24,
      accent: 0x22c55e,
      panel: 0x0f111a,
      background: 0x050608
    },
    assets: sharedAssets,
    simulator: sharedSimulator
  },
  {
    id: 'reskin_template',
    label: 'Reskin Template',
    title: 'RESKIN TEMPLATE',
    subtitle: 'Skin Swap Ready',
    startingBalance: 10000,
    defaultBet: 1,
    betSteps: [0.2, 0.5, 1, 2, 5, 10, 20, 50, 100],
    grid: {
      cols: 6,
      rows: 5,
      symbolSize: 92,
      spacing: 8
    },
    theme: {
      frame: 0x60a5fa,
      glow: 0x93c5fd,
      accent: 0xf97316,
      panel: 0x101827,
      background: 0x04070c
    },
    assets: sharedAssets,
    simulator: sharedSimulator
  }
];

export function getGameById(gameId: string): GameConfig {
  return GAME_CATALOG.find((game) => game.id === gameId) ?? GAME_CATALOG[0];
}
