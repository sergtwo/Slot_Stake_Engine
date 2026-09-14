import './style.css';
import { SlotEngine } from './engine/slotEngine.js';
import { StakeEngineSimulator } from './engine/serverSimulator.js';

const appEl = document.querySelector<HTMLDivElement>('#app')!;

appEl.innerHTML = `
  <div class="slot-app">
    <div id="canvas-container"></div>
    
    <div class="hud-overlay">
      <!-- Barre Supérieure : Multiplicateurs & Débogage -->
      <div class="top-bar">
        <div class="side-badges">
          <div class="badge-tag">STAKE ENGINE SANDBOX</div>
          <div class="debug-box">
            <label><input type="checkbox" id="force-bigwin-toggle" /> Force Big Win</label>
          </div>
        </div>

        <!-- Bandeau Multiplicateurs façon Gates of Olympus / Fury of Anubis -->
        <div class="multiplier-bar">
          <div class="mult-pill">x256</div>
          <div class="mult-pill highlight" id="active-mult">x1024</div>
          <div class="mult-pill">x2048</div>
        </div>

        <!-- Titre / Logo du jeu -->
        <div class="game-logo-badge">
          <span>FURY OF</span>
          <strong>ANUBIS</strong>
        </div>
      </div>

      <!-- Bandeau Latéral Gauche : Options Bonus Stake -->
      <div class="side-controls">
        <div class="side-btn buy-feature">
          <span class="btn-sub">FONCTION</span>
          <span class="btn-main">ACHETER</span>
          <span class="btn-tag">OPTIONS</span>
        </div>
        <div class="side-btn super-spin">
          <span class="btn-sub">SUPER SPIN</span>
          <span class="btn-main">ACTIF</span>
        </div>
      </div>

      <!-- HUD Inférieur Style Pragmatic / Stake -->
      <div class="bottom-bar">
        <div class="hud-group credit-group">
          <span class="hud-label">CRÉDIT</span>
          <span class="hud-value balance" id="balance-val">10 000,00 $</span>
        </div>

        <div class="hud-group bet-group">
          <span class="hud-label">MISE</span>
          <div class="bet-stepper">
            <button class="btn-step" id="btn-minus">-</button>
            <span class="hud-value" id="bet-val">1,00 $</span>
            <button class="btn-step" id="btn-plus">+</button>
          </div>
        </div>

        <!-- Compteur Central de Gains Démesuré -->
        <div class="hud-group win-group">
          <span class="hud-label">GAINS</span>
          <span class="hud-value win" id="win-val">0,00 $</span>
        </div>

        <!-- Bouton Spin Circulaire avec Halo Doré -->
        <div class="spin-wrapper">
          <button class="btn-spin-round" id="btn-spin">
            <div class="spin-arrows" id="spin-icon">↻</div>
          </button>
          <span class="auto-label">AUTO</span>
        </div>
      </div>
    </div>
  </div>
`;

let balance = 10000.00;
let bet = 1.00;
let isSpinning = false;
let forceBigWin = false;
const betSteps = [0.20, 0.50, 1.00, 2.00, 5.00, 10.00, 20.00, 50.00, 100.00];

const canvasContainer = document.getElementById('canvas-container')!;
const balanceEl = document.getElementById('balance-val')!;
const betEl = document.getElementById('bet-val')!;
const winEl = document.getElementById('win-val')!;
const activeMultEl = document.getElementById('active-mult')!;
const btnSpin = document.getElementById('btn-spin') as HTMLButtonElement;
const spinIcon = document.getElementById('spin-icon')!;
const btnMinus = document.getElementById('btn-minus') as HTMLButtonElement;
const btnPlus = document.getElementById('btn-plus') as HTMLButtonElement;
const bigWinToggle = document.getElementById('force-bigwin-toggle') as HTMLInputElement;

const simulator = new StakeEngineSimulator(6, 5);
const engine = new SlotEngine(canvasContainer);

await engine.init();
const initialGrid = simulator.generateGrid(false);
engine.renderGrid(initialGrid);

function updateUI() {
  balanceEl.textContent = `${balance.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
  betEl.textContent = `${bet.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
}

btnMinus.addEventListener('click', () => {
  if (isSpinning) return;
  const idx = betSteps.indexOf(bet);
  if (idx > 0) {
    bet = betSteps[idx - 1];
    updateUI();
  }
});

btnPlus.addEventListener('click', () => {
  if (isSpinning) return;
  const idx = betSteps.indexOf(bet);
  if (idx < betSteps.length - 1) {
    bet = betSteps[idx + 1];
    updateUI();
  }
});

bigWinToggle.addEventListener('change', (e) => {
  forceBigWin = (e.target as HTMLInputElement).checked;
});

btnSpin.addEventListener('click', async () => {
  if (isSpinning || balance < bet) return;

  isSpinning = true;
  btnSpin.disabled = true;
  spinIcon.classList.add('rotating');
  winEl.classList.remove('highlight');
  winEl.textContent = '0,00 $';

  balance -= bet;
  updateUI();

  const grid = simulator.generateGrid(forceBigWin);
  const result = simulator.evaluate(grid, bet);
  const winningKeys = result.winningSymbols.map((w: any) => w.symbol);

  await engine.animateSpin(grid, winningKeys);

  balance += result.finalWin;
  winEl.textContent = `${result.finalWin.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
  
  if (result.finalWin > 0) {
    winEl.classList.add('highlight');
  }

  if (result.totalMult > 1) {
    activeMultEl.textContent = `x${result.totalMult}`;
    activeMultEl.classList.add('pulse');
    setTimeout(() => activeMultEl.classList.remove('pulse'), 1500);
  }

  updateUI();
  isSpinning = false;
  btnSpin.disabled = false;
  spinIcon.classList.remove('rotating');
});
