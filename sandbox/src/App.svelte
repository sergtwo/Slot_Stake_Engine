<script>
  import { onMount } from 'svelte';
  import HUD from './components/HUD.svelte';
  import { SlotEngine } from './engine/slotEngine.js';
  import { StakeEngineSimulator } from './engine/serverSimulator.js';

  let canvasContainer;
  let engine;
  let simulator;

  let balance = 1000.00;
  let bet = 1.00;
  let lastWin = 0.00;
  let multiplier = 1;
  let isSpinning = false;
  let forceBigWin = false;

  onMount(async () => {
    simulator = new StakeEngineSimulator(6, 5);
    engine = new SlotEngine(canvasContainer);
    await engine.init();

    // Premier tirage d'accueil
    const initialGrid = simulator.generateGrid(false);
    engine.renderGrid(initialGrid);
  });

  async function handleSpin() {
    if (isSpinning || balance < bet) return;

    isSpinning = true;
    balance -= bet;

    // Simulation de la réponse RGS Stake Engine
    const grid = simulator.generateGrid(forceBigWin);
    const result = simulator.evaluate(grid, bet);

    const winningKeys = result.winningSymbols.map(w => w.symbol);

    // Animation PixiJS
    await engine.animateSpin(grid, winningKeys);

    // Mise à jour de l'UI
    lastWin = result.finalWin;
    multiplier = result.totalMult;
    balance += result.finalWin;
    isSpinning = false;
  }

  function handleToggleBigWin(e) {
    forceBigWin = e.target.checked;
  }
</script>

<main class="app-viewport">
  <div class="canvas-host" bind:this={canvasContainer}></div>
  <HUD
    {balance}
    {bet}
    {lastWin}
    {multiplier}
    {isSpinning}
    {forceBigWin}
    onSpin={handleSpin}
    onToggleBigWin={handleToggleBigWin}
  />
</main>

<style>
  :global(body, html) {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #000;
  }

  .app-viewport {
    position: relative;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .canvas-host {
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
  }
</style>
