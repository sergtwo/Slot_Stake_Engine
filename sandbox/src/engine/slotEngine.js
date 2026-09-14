import * as PIXI from 'pixi.js';

export class SlotEngine {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.app = null;
    this.stage = null;
    this.gridContainer = null;
    this.frameContainer = null;
    this.anubisSprite = null;
    this.textures = {};
    this.cols = 6;
    this.rows = 5;
    this.symbolSize = 92;
    this.spacing = 8;
    this.isSpinning = false;
  }

  async init() {
    this.app = new PIXI.Application();
    await this.app.init({
      resizeTo: this.container,
      backgroundColor: 0x050608,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    });

    this.container.appendChild(this.app.canvas);
    this.stage = this.app.stage;

    // Préchargement des textures
    await this.loadTextures();

    // 1. Arrière-plan Temple sombre
    this.setupBackground();

    // 2. Personnage Anubis interactif à droite
    this.setupAnubis();

    // 3. Cadre doré & Grille de rouleaux
    this.setupReelsAndFrame();

    window.addEventListener('resize', () => this.onResize());
  }

  async loadTextures() {
    const assetsToLoad = [
      { alias: 'bg', src: '/assets/background.jpg' },
      { alias: 'anubis', src: '/assets/anubis_idle.png' },
      { alias: 'gold_arch', src: '/assets/gold_arch.png' },
      { alias: 'gold_border', src: '/assets/gold_border_top.png' },
      { alias: 'bg_pattern', src: '/assets/bg_reels_pattern.png' },
      { alias: 'H1', src: '/assets/symbols/H1_scarab.png' },
      { alias: 'H2', src: '/assets/symbols/H2_skull.png' },
      { alias: 'H3', src: '/assets/symbols/H3_ankh.png' },
      { alias: 'H4', src: '/assets/symbols/H4_scroll.png' },
      { alias: 'L1', src: '/assets/symbols/L1_ruby.png' },
      { alias: 'L2', src: '/assets/symbols/L2_amethyst.png' },
      { alias: 'L3', src: '/assets/symbols/L3_emerald.png' },
      { alias: 'L4', src: '/assets/symbols/L4_sapphire.png' },
      { alias: 'L5', src: '/assets/symbols/L5_diamond.png' },
      { alias: 'SCATTER', src: '/assets/symbols/SCATTER.png' },
      { alias: 'MULT', src: '/assets/symbols/MULT_gold.png' }
    ];

    for (const a of assetsToLoad) {
      try {
        this.textures[a.alias] = await PIXI.Assets.load(a.src);
      } catch (err) {
        console.warn('Erreur chargement texture:', a.alias, err);
      }
    }
  }

  setupBackground() {
    if (this.textures.bg) {
      const bg = new PIXI.Sprite(this.textures.bg);
      bg.anchor.set(0.5);
      bg.x = this.app.screen.width / 2;
      bg.y = this.app.screen.height / 2;

      const scale = Math.max(
        this.app.screen.width / bg.width,
        this.app.screen.height / bg.height
      );
      bg.scale.set(scale * 1.02);
      this.stage.addChild(bg);
      this.bgSprite = bg;
    }
  }

  setupAnubis() {
    if (this.textures.anubis) {
      this.anubisSprite = new PIXI.Sprite(this.textures.anubis);
      this.anubisSprite.anchor.set(0.5, 1);
      this.stage.addChild(this.anubisSprite);
      this.positionAnubis();

      let time = 0;
      this.app.ticker.add((ticker) => {
        time += ticker.deltaTime * 0.03;
        const breath = Math.sin(time) * 0.015;
        if (this.anubisSprite) {
          this.anubisSprite.scale.y = this.anubisBaseScaleY * (1 + breath);
        }
      });
    }
  }

  positionAnubis() {
    if (!this.anubisSprite) return;
    const isMobile = this.app.screen.width < 900;
    if (isMobile) {
      this.anubisSprite.visible = false;
      return;
    }
    this.anubisSprite.visible = true;

    const targetH = this.app.screen.height * 0.88;
    const scale = targetH / this.anubisSprite.texture.height;
    this.anubisSprite.scale.set(scale);
    this.anubisBaseScaleY = scale;

    this.anubisSprite.x = this.app.screen.width * 0.84;
    this.anubisSprite.y = this.app.screen.height * 0.96;
  }

  setupReelsAndFrame() {
    this.frameContainer = new PIXI.Container();
    this.gridContainer = new PIXI.Container();

    this.stage.addChild(this.frameContainer);
    this.stage.addChild(this.gridContainer);

    this.centerGridAndFrame();
  }

  centerGridAndFrame() {
    const isMobile = this.app.screen.width < 900;
    const gridW = this.cols * (this.symbolSize + this.spacing) - this.spacing;
    const gridH = this.rows * (this.symbolSize + this.spacing) - this.spacing;

    const offsetX = isMobile ? (this.app.screen.width - gridW) / 2 : (this.app.screen.width * 0.44 - gridW / 2);
    const offsetY = (this.app.screen.height - gridH) / 2 + 10;

    this.gridContainer.x = offsetX;
    this.gridContainer.y = offsetY;

    this.frameContainer.removeChildren();

    const bgBox = new PIXI.Graphics();
    bgBox.roundRect(offsetX - 14, offsetY - 14, gridW + 28, gridH + 28, 16);
    bgBox.fill({ color: 0x0c0c14, alpha: 0.88 });
    bgBox.stroke({ width: 3, color: 0xd4af37, alpha: 0.9 });
    this.frameContainer.addChild(bgBox);

    if (this.textures.gold_arch) {
      const arch = new PIXI.Sprite(this.textures.gold_arch);
      arch.anchor.set(0.5, 1);
      arch.x = offsetX + gridW / 2;
      arch.y = offsetY - 6;
      arch.scale.set((gridW * 0.55) / arch.texture.width);
      this.frameContainer.addChild(arch);
    }
  }

  // Affiche la grille actuelle avec mise en surbrillance des cellules gagnantes
  renderGrid(gridData, winningCells = []) {
    this.gridContainer.removeChildren();

    const winMap = {};
    for (const pos of winningCells) {
      winMap[`${pos.c},${pos.r}`] = true;
    }

    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const symKey = gridData[c][r];
        if (!symKey) continue; // Cellule détruite en cours de tumble

        const texture = this.textures[symKey];
        const isWin = winMap[`${c},${r}`] === true;

        const symBox = new PIXI.Container();
        symBox.x = c * (this.symbolSize + this.spacing);
        symBox.y = r * (this.symbolSize + this.spacing);

        if (isWin) {
          const glow = new PIXI.Graphics();
          glow.roundRect(-4, -4, this.symbolSize + 8, this.symbolSize + 8, 14);
          glow.fill({ color: 0xffea00, alpha: 0.40 });
          glow.stroke({ width: 3, color: 0xfff000, alpha: 0.95 });
          symBox.addChild(glow);
        }

        if (texture) {
          const sprite = new PIXI.Sprite(texture);
          sprite.anchor.set(0.5);
          sprite.x = this.symbolSize / 2;
          sprite.y = this.symbolSize / 2;
          
          const maxDim = Math.max(sprite.width, sprite.height);
          const scale = (this.symbolSize * 0.94) / maxDim;
          sprite.scale.set(isWin ? scale * 1.15 : scale);

          symBox.addChild(sprite);
        }

        this.gridContainer.addChild(symBox);
      }
    }
  }

  // Animation de la séquence complète de Tumbles (chute cascade pas-à-pas)
  async playTumbleSequence(spinResult, onStepCallback) {
    if (this.isSpinning) return;
    this.isSpinning = true;

    // Réaction Anubis au début
    if (this.anubisSprite) {
      this.anubisSprite.tint = spinResult.isBigWin ? 0xffcc44 : 0x88ff88;
      setTimeout(() => {
        if (this.anubisSprite) this.anubisSprite.tint = 0xffffff;
      }, 500);
    }

    const { steps } = spinResult;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      // 1. Rendu de la grille avec les symboles gagnants illuminés
      this.renderGrid(step.grid, step.winningCells);

      if (onStepCallback) {
        onStepCallback(step, i, steps.length);
      }

      if (!step.isFinal && step.winningCells.length > 0) {
        // Pause pour voir les symboles gagnants
        await new Promise(r => setTimeout(r, 450));

        // 2. Clignotement / disparition des gagnants
        this.renderGrid(step.grid.map((col, c) => col.map((sym, r) => {
          const isWin = step.winningCells.some(p => p.c === c && p.r === r);
          return isWin ? null : sym;
        })));

        await new Promise(r => setTimeout(r, 200));
      } else {
        await new Promise(r => setTimeout(r, 250));
      }
    }

    this.isSpinning = false;
  }

  onResize() {
    if (!this.app) return;
    if (this.bgSprite && this.textures.bg) {
      this.bgSprite.x = this.app.screen.width / 2;
      this.bgSprite.y = this.app.screen.height / 2;
      const scale = Math.max(
        this.app.screen.width / this.textures.bg.width,
        this.app.screen.height / this.textures.bg.height
      );
      this.bgSprite.scale.set(scale * 1.02);
    }
    this.positionAnubis();
    this.centerGridAndFrame();
  }
}
