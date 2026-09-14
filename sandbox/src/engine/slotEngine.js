import * as PIXI from 'pixi.js';
import { SYMBOLS } from './serverSimulator.js';

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

      // Légère respiration (idle animation)
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

    // Placé à droite de l'écran, majestueux
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

    // Décentré légèrement vers la gauche sur Desktop pour laisser la place à Anubis
    const offsetX = isMobile ? (this.app.screen.width - gridW) / 2 : (this.app.screen.width * 0.44 - gridW / 2);
    const offsetY = (this.app.screen.height - gridH) / 2 + 10;

    this.gridContainer.x = offsetX;
    this.gridContainer.y = offsetY;

    // Rendu du Cadre Doré & Fronton
    this.frameContainer.removeChildren();

    // Fond obscurci de la grille
    const bgBox = new PIXI.Graphics();
    bgBox.roundRect(offsetX - 14, offsetY - 14, gridW + 28, gridH + 28, 16);
    bgBox.fill({ color: 0x0c0c14, alpha: 0.88 });
    bgBox.stroke({ width: 3, color: 0xd4af37, alpha: 0.9 });
    this.frameContainer.addChild(bgBox);

    // Fronton Arche Dorée au sommet
    if (this.textures.gold_arch) {
      const arch = new PIXI.Sprite(this.textures.gold_arch);
      arch.anchor.set(0.5, 1);
      arch.x = offsetX + gridW / 2;
      arch.y = offsetY - 6;
      arch.scale.set((gridW * 0.55) / arch.texture.width);
      this.frameContainer.addChild(arch);
    }
  }

  renderGrid(gridData, winningKeys = []) {
    this.gridContainer.removeChildren();

    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const symKey = gridData[c][r];
        const texture = this.textures[symKey];
        const isWin = winningKeys.includes(symKey);

        const symBox = new PIXI.Container();
        symBox.x = c * (this.symbolSize + this.spacing);
        symBox.y = r * (this.symbolSize + this.spacing);

        // Halo gagnant si victoire
        if (isWin) {
          const glow = new PIXI.Graphics();
          glow.roundRect(-4, -4, this.symbolSize + 8, this.symbolSize + 8, 14);
          glow.fill({ color: 0xffea00, alpha: 0.35 });
          glow.stroke({ width: 3, color: 0xfff000, alpha: 0.9 });
          symBox.addChild(glow);
        }

        // Texture réelle HD du symbole
        if (texture) {
          const sprite = new PIXI.Sprite(texture);
          sprite.anchor.set(0.5);
          sprite.x = this.symbolSize / 2;
          sprite.y = this.symbolSize / 2;
          
          const maxDim = Math.max(sprite.width, sprite.height);
          const scale = (this.symbolSize * 0.94) / maxDim;
          sprite.scale.set(scale);

          if (isWin) {
            sprite.scale.set(scale * 1.12);
          }

          symBox.addChild(sprite);
        }

        this.gridContainer.addChild(symBox);
      }
    }
  }

  async animateSpin(newGrid, winningKeys = []) {
    if (this.isSpinning) return;
    this.isSpinning = true;

    // Déclenchement réaction Anubis
    if (this.anubisSprite) {
      this.anubisSprite.tint = 0x88ff88;
      setTimeout(() => {
        if (this.anubisSprite) this.anubisSprite.tint = 0xffffff;
      }, 400);
    }

    const duration = 240;
    const startTime = performance.now();

    return new Promise((resolve) => {
      const dropStep = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        this.gridContainer.alpha = 1 - progress;

        if (progress < 1) {
          requestAnimationFrame(dropStep);
        } else {
          this.renderGrid(newGrid, winningKeys);
          this.gridContainer.y -= 45;
          this.gridContainer.alpha = 0;

          const bounceStart = performance.now();
          const bounceStep = (bNow) => {
            const bProgress = Math.min((bNow - bounceStart) / 180, 1);
            this.gridContainer.alpha = bProgress;
            this.centerGridAndFrame();

            if (bProgress < 1) {
              requestAnimationFrame(bounceStep);
            } else {
              this.isSpinning = false;
              resolve();
            }
          };
          requestAnimationFrame(bounceStep);
        }
      };
      requestAnimationFrame(dropStep);
    });
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
