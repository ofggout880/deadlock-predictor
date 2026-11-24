# Charte Graphique & Design System — Deadlock Predictor

> **Référence Architecturale Permanente**  
> **Direction Artistique :** *Occult Dieselpunk × Statlocker.gg Telemetry*  
> **Portée :** Ensemble du Front-End (`Page 1 : Étude Principale`, `Page 2 : Dynamique Héros`, `Page 3 : Espace ITEM`) et toutes les futures extensions analytiques ou Machine Learning.

---

## 1. Philosophie & Direction Artistique

Le front-end de **Deadlock Predictor** poursuit un double objectif :
1. **Valoriser l'expertise Machine Learning & Data Science** : prédiction du churn à 14 jours, détection temps réel du tilt/ragequit, attribution causale des biomarqueurs Source 2 et analyse de l'équilibrage du jeu.
2. **Offrir une immersion visuelle digne de l'univers de Valve Deadlock et de Statlocker.gg** : une esthétique sombre, occulte et chirurgicale qui rejette les gabarits génériques générés par IA au profit d'un travail précis sur la typographie, les contrastes lumineux et la hiérarchie éditoriale.

### Les 4 Piliers Visuels (Hérités de la Page 1)
- **Profondeur Nocturne (Midnight Slate)** : Fonds sombres superposés (`#0b0f19` → `#111827`) éclairés par des halos radiaux subtils en arrière-plan.
- **Verre Dépoli & Lueurs Directionnelles** : Cartes en glassmorphism (`rgba(14, 18, 27, 0.78)`, `backdrop-filter: blur(20px)`) coiffées d'un faisceau lumineux supérieur (`::before` de `2px` à `3px`) dont la teinte reflète la sémantique de la donnée.
- **Contraste Typographique Éditorial** : Alternance dans les grands titres entre graisse légère (`.title-light`, `font-weight: 300`, teinte ardoise) et graisse lourde (`.title-bold`, `font-weight: 800`, blanc pur ou lueur néon `.title-glow`).
- **Zéro Scroll Infini & Zéro Superposition** : Découpage des pages analytiques denses en **Sous-Onglets Modulaires** façon dashboard Statlocker.gg, et utilisation exclusive de grilles CSS (`Grid` / `Flexbox`) interdisant toute collision d'éléments.

---

## 2. Double Palette Sémantique Stricte

Pour garantir une lecture immédiate des visualisations sans confusion cognitive, le système verrouille **deux palettes sémantiques distinctes** dans `:root` (`frontend/src/index.css`).

### 2.1. Palette A — Catégories Officielles du Jeu Deadlock (Slots & Économie)
Utilisée **exclusivement** pour qualifier les emplacements d'objets (Weapon, Vitality, Spirit) et les ressources du moteur Source 2 (Souls).

| Sémantique Jeu | Token CSS Principal | Code Hex | Token Fond Translucent | Token Bordure | Classe Badge / Lueur |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Weapon (Arme)** | `--dl-weapon` | `#e5993e` | `--dl-weapon-bg` (`rgba(229, 153, 62, 0.14)`) | `--dl-weapon-border` (`rgba(229, 153, 62, 0.42)`) | `.dl-slot-weapon`, `.glow-weapon` |
| **Vitality (Vitalité)** | `--dl-vitality` | `#10b981` | `--dl-vitality-bg` (`rgba(16, 185, 129, 0.14)`) | `--dl-vitality-border` (`rgba(16, 185, 129, 0.42)`) | `.dl-slot-vitality`, `.glow-emerald` |
| **Spirit (Esprit)** | `--dl-spirit` | `#a855f7` | `--dl-spirit-bg` (`rgba(168, 85, 247, 0.15)`) | `--dl-spirit-border` (`rgba(168, 85, 247, 0.42)`) | `.dl-slot-spirit`, `.glow-violet` |
| **Souls (Âmes / Flux S2)** | `--dl-souls` | `#38bdf8` | `--dl-souls-bg` (`rgba(56, 189, 248, 0.14)`) | `--dl-souls-border` (`rgba(56, 189, 248, 0.40)`) | `.dl-slot-souls`, `.glow-cyan` |

### 2.2. Palette B — Sémantique Machine Learning, Risque & Comportement
Utilisée **exclusivement** pour représenter les prédictions du modèle, les niveaux de risque de churn, le ragequit et la rétention.

| Sémantique ML / Data | Token CSS Principal | Code Hex | Token Fond Translucent | Token Bordure | Classe Badge / Lueur |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Churn / Ragequit / Piège de Tilt** | `--ml-churn` | `#ef4444` | `--ml-churn-bg` (`rgba(239, 68, 68, 0.14)`) | `--ml-churn-border` (`rgba(239, 68, 68, 0.42)`) | `.dl-risk-churn`, `.glow-rose` |
| **Rétention / Fidélité / Agentivité** | `--ml-retention` | `#69e799` | `--ml-retention-bg` (`rgba(105, 231, 153, 0.13)`) | `--ml-retention-border` (`rgba(105, 231, 153, 0.42)`) | `.dl-risk-retention`, `.glow-mint` |
| **Alerte / Seuil $\theta^*$ / Rush Cupide** | `--ml-warning` | `#d8ec57` | `--ml-warning-bg` (`rgba(216, 236, 87, 0.14)`) | `--ml-warning-border` (`rgba(216, 236, 87, 0.42)`) | `.dl-risk-warning`, `.glow-amber` |

### 2.3. Surfaces, Textes & Bordures
- **Fond principal (`--bg-base`)** : `#0b0f19`
- **Surface carte glassmorphique (`--bg-glass`)** : `rgba(14, 18, 27, 0.78)` avec `backdrop-filter: blur(20px)`
- **Surface interne / pod (`--bg-input`)** : `#070a10` / `rgba(7, 10, 16, 0.65)`
- **Bordure subtile (`--border-glass`)** : `rgba(255, 255, 255, 0.08)` (survol : `rgba(255, 255, 255, 0.22)`)
- **Texte principal (`--text-primary`)** : `#ffffff`
- **Texte courant analytique (`--text-secondary`)** : `#94a3b8`
- **Texte méta / légendes (`--text-muted`)** : `#64748b`

---

## 3. Typographie & Hiérarchie Éditoriale

Quatre familles complémentaires structurent l'ensemble de l'application :

1. **`--font-display` (`'Syne'`, sans-serif)**
   - **Usage** : Titres principaux de pages (`.hero-display-title`) et chiffres monumentaux des KPI (`.horizon-large-number`, `.lab-macro-large-num`, `.dl-monumental-num`).
   - **Règle** : Toujours associer `letter-spacing: -0.025em` et `line-height: 1.05` à `1.1`.
2. **`--font-heading` (`'Outfit'`, sans-serif)**
   - **Usage** : Titres de chapitres (`.lab-chapter-title`), en-têtes de cartes, noms de héros et d'items, boutons d'onglets.
3. **`--font-body` (`'Plus Jakarta Sans'`, sans-serif)**
   - **Usage** : Paragraphes d'analyse comportementale, descriptions complètes sur chaque carte.
   - **Règle** : Texte intégral toujours visible (`0.78rem` à `0.86rem` dans les cartes denses, `line-height: 1.48` à `1.6`), jamais tronqué par `text-overflow: ellipsis` sur un paragraphe explicatif.
4. **`--font-mono` (`'JetBrains Mono'`, monospace + `.tabular-nums`)**
   - **Usage** : Métriques ML, pourcentages, timestamps (`8m 14s`), coûts en âmes (`3 000 Souls`), badges techniques et en-têtes de colonnes.
   - **Règle** : Toujours activer `font-variant-numeric: tabular-nums` sur les chiffres comparatifs.

---

## 4. Architecture de l'Information : Pattern « Header Éditorial + Dashboard à Sous-Onglets »

Pour éviter l'effet « page brouillonne à scroll infini », toutes les pages secondaires (Page 2, Page 3 et futures extensions) suivent strictement l'architecture modulaire en **3 étages** :

### Étage 1 : Header Éditorial Court (Aligné sur la Page 1)
Chaque page s'ouvre exactement avec la structure de `HeroSection.jsx` :
- **Barre de sourcil (`.hero-eyebrow-row`)** : `.editorial-badge` avec étoile `✦`, sous-titre contextuel `.hero-eyebrow-sub`, et bouton de navigation retour/croisé `.hero-about-trigger-pill`.
- **Grille éditoriale 2 colonnes (`.hero-editorial-row`)** :
  - Colonne gauche (`.hero-title-column`) : `h1.hero-display-title` combinant `.title-light`, `.title-bold` et `.title-glow`.
  - Colonne droite (`.hero-desc-column`) : résumé exécutif `.hero-floating-summary` et pilules de métadonnées `.hero-tag-pills` (`.tag-pill`).

### Étage 2 : Horizon KPI Monumental & 3 Piliers Éditoriaux (`01`, `02`, `03`)
Sous le header, une rangée horizontale de cartes en verre dépoli (`.lab-horizon-grid` ou `.lab-macro-kpi-grid`) expose les 4 ou 5 chiffres clés du dossier avec leur faisceau lumineux supérieur (`--horizon-beam-color` / `--kpi-beam-color`), complétée par les **3 Piliers Éditoriaux Interactifs** (`.lab-editorial-pillars` : `01`, `02`, `03`) qui synthétisent les conclusions scientifiques majeures avant d'entrer dans les modules.

### Étage 3 : Hub Interactif Encadré de Sélection des Modules (`.dl-subtabs-hub` & `.dl-subtabs-bar`)
Pour offrir une **vue d'ensemble immédiate** et signaler clairement l'interactivité sans cacher l'information derrière des boutons microscopiques :
- Le sélecteur est entouré d'un **conteneur encadré en verre dépoli à fort contraste (`.dl-subtabs-hub`)** doté d'un en-tête explicite (`.dl-subtabs-hub-header`), d'un badge live animé (`.dl-hub-live-pill`) et d'une grille pleine largeur (`.dl-subtabs-bar`).
- Chaque bouton de module (`.dl-subtab-btn`) est une **grande carte interactive** comprenant :
  - Un **grand badge d'icône lumineux (`54px × 54px`, `.dl-subtab-icon-box`)** abritant un logo vectoriel SVG de `30px`,
  - Le numéro de module (`.dl-subtab-step`) et sa métrique clé (`.dl-subtab-pill`),
  - Un titre gras lisible (`.dl-subtab-title`, `1.08rem`) et un résumé synthétique du contenu (`.dl-subtab-desc`),
  - Une barre d'action inférieure (`.dl-subtab-cta-row` / `.dl-subtab-cta-pill`) avec point vert lumineux sur le module actif.
- **Sur la Page 2 (`Dynamique Héros` / `ItemsSection.jsx`)** :
  1. `[MODULE 01 Biomarqueurs Empiriques]` (`#lab-step-1`) — Comparatif empirique des 5 divergences comportementales ($N = 10\,000$).
  2. `[MODULE 02 Matrice & Autopsie Héros]` (`#lab-step-2`) — Matrice interactive 2D + Spotlight d'autopsie + 4 cartes des héros punitifs + Sanctuaire des 3 Ancres de Rétention.
  3. `[MODULE 03 Carte Tactique 2D]` (`#lab-step-3`) — Carte thermique tactique des morts et déconnexions avec simulation temporelle 0–10 min.
  4. `[MODULE 04 Biomécanique du Parry]` (`#lab-step-parry`) — Biomécanique de la parade (stun 4.0s), piège Spirit Strike, matrice empirique et contre-mesures.
- **Sur la Page 3 (`Espace ITEM` / `ItemTelemetrySection.jsx`)** :
  1. `[MODULE 01 Frise Séquentielle & 4 Schémas]` (`#item-step-timelines`) — Frise d'achats par phases de jeu (`Early 0–8m` / `Mid 8–18m` / `Late 18m+`) sans aucune superposition, jauge d'équilibre `Weapon / Vitality / Spirit`, inspecteur de nœud et les 4 schémas cognitifs d'erreurs d'achat.
  2. `[MODULE 02 Catalogue Compact & Inspecteur IA]` (`#item-step-catalog`) — Catalogue compact filtrable des 54 items avec inspecteur latéral détaillé au clic et recommandation système d'Assistant Boutique Anti-Tilt.

### Navigation Principale Minimaliste (`Navbar.jsx`)
- **Zéro boîte / pilule autour des onglets de navigation** (`Principal`, `Dynamique Héros & Churn`, `ITEM`) et **zéro emoji** devant les éléments du menu.
- Seule la page active affiche le **petit point vert lumineux (`.nav-tab-dot`)** à gauche de son libellé, accompagné de la flèche descendante (`.nav-tab-chevron`) ouvrant la fenêtre de survol.

> **Règle technique d'affichage des panneaux (`.dl-subtab-panel`)** :  
> Les panneaux utilisent `.dl-subtab-panel { display: none; }` et `.dl-subtab-panel.is-active { display: block; }`. Ils restent présents dans le DOM pour garantir une commutation instantanée sans perte d'état ni latence de remontage, et préserver la compatibilité avec les ancres de la `Navbar` et les suites de tests automatisés.

---

## 5. Composants Standardisés & Règles Anti-Superposition

### 5.1. Frise Séquentielle par Phases de Jeu (`.dl-phase-timeline-grid`)
- **Interdiction absolue** d'utiliser `position: absolute` avec `left: calc(pct%)` sur un axe temporel continu (source de collisions lorsque deux objets sont achetés à moins de 2 minutes d'intervalle).
- **Architecture obligatoire** :
  - Grille à 3 colonnes de phases (`.dl-phase-column`) :
    1. **Early Game / Laning (`0m – 8m`)**
    2. **Mid Game / Rotations (`8m – 18m`)**
    3. **Late Game / Patron Siege (`18m+`)**
  - Dans chaque colonne, les achats sont rendus dans un conteneur Flexbox (`.dl-phase-items-flow`) sous forme de cartes-nœuds (`.dl-seq-node-card`) numérotées séquentiellement (`#1`, `#2`, `#3`...) et reliées par des indicateurs directionnels (`→`).
  - Une **Jauge d'Équilibre de Build (`.dl-build-balance-bar`)** affiche systématiquement la répartition exacte `Weapon` (`--dl-weapon`) / `Vitality` (`--dl-vitality`) / `Spirit` (`--dl-spirit`) de la séquence active.

### 5.2. Catalogue Compact & Inspecteur Latéral (`.dl-catalog-split-layout`)
- Grille principale à cartes compactes (`.lab-item-grid-card`) associées à un **Inspecteur Latéral Collant (`.dl-catalog-inspector-card`)** sur ordinateur (et affiché au-dessus/en-dessous sur mobile).
- Cliquer sur n'importe quelle carte du catalogue met à jour l'inspecteur avec l'autopsie complète de l'objet, son timing moyen, son rang d'achat et le remède IA recommandé.

### 5.3. Discipline CSS (Zéro Style Inline Sauvage)
- Toute structure de mise en page, grille, carte, badge, bouton d'onglet ou typographie doit passer par une classe standardisée de `frontend/src/index.css`.
- L'attribut `style` inline en JSX est **strictement réservé** aux valeurs dynamiques calculées par la donnée (ex. `width: ${pct}%` d'une barre de progression ou variables CSS locales `--kpi-beam-color`).

---

## 6. Responsive Mobile & Densité Textuelle

Le site est conçu pour être **100 % compatible mobile** (`320px` à `768px`) sans sacrifier la richesse scientifique :
1. **Textes intégraux préservés** : Aucune analyse n'est cachée ou tronquée sur mobile. La taille de police s'adapte harmonieusement (`0.74rem` – `0.80rem`) avec un espacement interne optimisé.
2. **Conteneurs à Scroll Horizontal (`.dl-scroll-x-mobile`)** : Les tableaux matriciels (`.lab-parry-matrix-container`) et graphiques larges disposent d'un `overflow-x: auto` fluide (`-webkit-overflow-scrolling: touch`) et d'une largeur minimale interne pour rester parfaitement lisibles au doigt sans déformer la page.
3. **Barre de Sous-Onglets Scrollable** : Sur mobile, `.dl-subtabs-bar` bascule en défilement horizontal tactile (`overflow-x: auto`, `white-space: nowrap`) ou en grille 2×2 compacte pour permettre de changer de vue d'un seul geste.
