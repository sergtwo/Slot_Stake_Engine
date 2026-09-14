<script>
  export let balance = 1000.00;
  export let bet = 1.00;
  export let lastWin = 0.00;
  export let multiplier = 1;
  export let isSpinning = false;
  export let onSpin;
  export let onToggleBigWin;
  export let forceBigWin = false;

  const betSteps = [0.20, 0.40, 0.80, 1.00, 2.00, 5.00, 10.00, 20.00, 50.00];

  function decreaseBet() {
    const idx = betSteps.indexOf(bet);
    if (idx > 0) bet = betSteps[idx - 1];
  }

  function increaseBet() {
    const idx = betSteps.indexOf(bet);
    if (idx < betSteps.length - 1) bet = betSteps[idx + 1];
  }
</script>

<div class="hud-container">
  <!-- Panneau Supérieur : Statut & Multiplicateur Anubis -->
  <div class="top-bar">
    <div class="badge-tag">STAKE ENGINE EMULATOR</div>
    {#if multiplier > 1}
      <div class="mult-badge">⚡ MULTIPLICATEUR X{multiplier}</div>
    {/if}
    <div class="debug-controls">
      <label class="debug-label">
        <input type="checkbox" bind:checked={forceBigWin} on:change={onToggleBigWin} />
        Force Big Win
      </label>
    </div>
  </div>

  <!-- Panneau Inférieur : Commandes & Compteurs -->
  <div class="bottom-bar">
    <div class="hud-group">
      <span class="hud-label">SOLDE</span>
      <span class="hud-value balance">${balance.toFixed(2)}</span>
    </div>

    <div class="hud-group bet-control">
      <span class="hud-label">MISE</span>
      <div class="bet-stepper">
        <button class="btn-step" on:click={decreaseBet} disabled={isSpinning}>-</button>
        <span class="hud-value">${bet.toFixed(2)}</span>
        <button class="btn-step" on:click={increaseBet} disabled={isSpinning}>+</button>
      </div>
    </div>

    <div class="hud-group win-group">
      <span class="hud-label">GAIN</span>
      <span class="hud-value win ${lastWin > 0 ? 'highlight' : ''}">${lastWin.toFixed(2)}</span>
    </div>

    <!-- Bouton Spin -->
    <button class="btn-spin" on:click={onSpin} disabled={isSpinning}>
      {#if isSpinning}
        <span class="spin-loader"></span>
      {:else}
        SPIN
      {/if}
    </button>
  </div>
</div>

<style>
  .hud-container {
    position: absolute;
    inset: 0;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 18px 24px;
    font-family: 'Inter', -apple-system, sans-serif;
    color: #ffffff;
  }

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    pointer-events: auto;
  }

  .badge-tag {
    background: rgba(18, 20, 29, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: #94a3b8;
    backdrop-filter: blur(8px);
  }

  .mult-badge {
    background: linear-gradient(135deg, #ff9800, #ff5722);
    color: #fff;
    padding: 6px 18px;
    border-radius: 999px;
    font-weight: 900;
    font-size: 14px;
    letter-spacing: 1px;
    box-shadow: 0 0 20px rgba(255, 87, 34, 0.6);
    animation: pulse 1.2s infinite alternate;
  }

  @keyframes pulse {
    from { transform: scale(1); }
    to { transform: scale(1.08); }
  }

  .debug-controls {
    background: rgba(18, 20, 29, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 12px;
    backdrop-filter: blur(8px);
  }

  .debug-label {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    user-select: none;
  }

  .bottom-bar {
    pointer-events: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(180deg, rgba(15, 17, 26, 0.88), rgba(9, 10, 15, 0.96));
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 12px 28px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(16px);
  }

  .hud-group {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .hud-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    color: #64748b;
  }

  .hud-value {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 0.5px;
  }

  .hud-value.balance {
    color: #38bdf8;
  }

  .hud-value.win {
    color: #a3e635;
  }

  .hud-value.win.highlight {
    animation: glowWin 0.6s infinite alternate;
  }

  @keyframes glowWin {
    from { text-shadow: 0 0 6px rgba(163, 230, 53, 0.4); }
    to { text-shadow: 0 0 16px rgba(163, 230, 53, 1); }
  }

  .bet-stepper {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-step {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: white;
    width: 26px;
    height: 26px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 14px;
    font-weight: 700;
    transition: all 0.15s ease;
  }

  .btn-step:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .btn-spin {
    background: linear-gradient(135deg, #10b981, #059669);
    border: none;
    color: white;
    font-size: 18px;
    font-weight: 900;
    letter-spacing: 2px;
    padding: 14px 44px;
    border-radius: 14px;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .btn-spin:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(16, 185, 129, 0.6);
  }

  .btn-spin:active:not(:disabled) {
    transform: translateY(1px);
  }

  .btn-spin:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spin-loader {
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spinRotate 0.6s linear infinite;
  }

  @keyframes spinRotate {
    to { transform: rotate(360deg); }
  }
</style>
