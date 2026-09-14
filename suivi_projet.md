# Journal de Suivi de Projet - Slot Stake Engine

## [2026-09-13]

### 1. Prise de contexte et cadrage
- Consultation du document de cadrage [Cadrage_Projet_Slot_Engine.pdf](file:///d:/Slot%20Stake%20Engine/Cadrage_Projet_Slot_Engine.pdf) : projet Front-End PixiJS / Svelte pour Stake Engine, thème Anubis / Dark Fantasy, référence visuelle *Gates of Olympus*.
- Intégration des règles opérationnelles de [role_agent.md](file:///d:/Slot%20Stake%20Engine/role_agent.md).

### 2. Extraction des Assets de Référence (Fury of Anubis / Pragmatic Play - Stake)
- Fichier source analysé : `stake.bet.har` (150 Mo).
- Extraction réalisée dans [extracted_fury_of_anubis/](file:///d:/Slot%20Stake%20Engine/extracted_fury_of_anubis) :
  - 158 textures et spritesheets (PNG / JPG).
  - 23 configurations JSON (dont l'arbre de scène UI et HUD `game.json`).

### 3. Création et Déploiement du Sandbox Émulateur Local
- Projet créé dans [sandbox/](file:///d:/Slot%20Stake%20Engine/sandbox) avec la stack cible : **Vite + PixiJS v8**.
- Découpage et intégration des assets HD réels de *Fury of Anubis* :
  - **Symboles du jeu** découpés avec canal alpha : Scarabée d'or (`H1_scarab`), Crâne vert (`H2_skull`), Croix Ankh maudite (`H3_ankh`), Parchemin (`H4_scroll`), Rubis (`L1_ruby`), Améthyste (`L2_amethyst`), Émeraude (`L3_emerald`), Saphir (`L4_sapphire`), Diamant turquoise (`L5_diamond`), Anubis Scatter officiel (`SCATTER`) et Bombes Multiplicateurs dorées (`MULT_gold`).
  - **Personnage interactif Anubis** : Découpage haute définition et intégration à droite de l'écran avec animation idle de respiration et réaction d'attaque verte aux gains.
  - **Cadre du temple** : Arche dorée sommitale et contour or du temple d'Anubis.
  - **HUD complet fidèle à Pragmatic Play & Stake** :
    - Bandeau supérieur des multiplicateurs style *Gates of Olympus* (`x256`, `x1024`, `x2048`).
    - Boutons latéraux d'achat de bonus (*"FONCTION ACHETER"* et *"SUPER SPIN ACTIF"*).
    - Compteur géant doré de gains au centre avec effet pulsé et glow.
    - Bouton Spin rond vert & or avec flèches de rotation Pragmatic et bouton AUTO.
    - Sélecteur de mise et solde en bas.
- Serveur de développement actif sur `http://localhost:3000/`.
