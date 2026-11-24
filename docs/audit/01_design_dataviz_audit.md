# Audit Exhaustif Design, UI/UX & Data Visualization — Deadlock Predictor

> **Agent 1 : Spécialiste Design System, Ergonomie UI/UX & Data Visualization**  
> **Périmètre inspecté :** Code source front-end intégral (`frontend/src/*`, `7 930` lignes de [frontend/src/index.css](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/index.css), `19` fichiers de composants React dans `frontend/src/components/` totalisant `24` composants fonctionnels/classes), croisé avec les payloads API back-end ([backend/app/api/routers/health.py](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/backend/app/api/routers/health.py), [backend/app/api/routers/items.py](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/backend/app/api/routers/items.py), [backend/data/ml_results.json](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/backend/data/ml_results.json)) **ET** l'inspection empirique du rendu réel sous Chromium Headless via Chrome DevTools Protocol (CDP) sur `http://127.0.0.1:5173/` à travers 4 résolutions (`1280px`, `768px`, `375px`, `320px`) et dans les 2 langues (`FR` / `EN`) sur l'ensemble des **3 pages** (`Page 1 : Étude Principale`, `Page 2 : Dynamique Héros & Churn`, `Page 3 : Espace ITEM`) et de leurs **6 sous-onglets interactifs**.

---

## Table des Matières
1. [Synthèse Exécutive & Scorecard Globale](#1-synthèse-exécutive--scorecard-globale)
2. [Direction Artistique, Charte Graphique & Cohésion Inter-Pages](#2-direction-artistique-charte-graphique--cohésion-inter-pages)
3. [Ergonomie, Navigation (« La Façon de se Balader »), Responsive & Accessibilité](#3-ergonomie-navigation--la-façon-de-se-balader--responsive--accessibilité)
4. [Audit Détaillé — Page 1 : Étude Principale (`main`)](#4-audit-détaillé--page-1--étude-principale-main)
5. [Audit Détaillé — Page 2 : Dynamique Héros & Churn (`items-lab`)](#5-audit-détaillé--page-2--dynamique-héros--churn-items-lab)
6. [Audit Détaillé — Page 3 : Espace ITEM (`items`)](#6-audit-détaillé--page-3--espace-item-items)
7. [Audit des Composants Transverses (Modales, Tiroirs, Footer & Composants Orphelins)](#7-audit-des-composants-transverses-modales-tiroirs-footer--composants-orphelins)
8. [Catalogue des Correctifs Concrets (Code JSX, SVG & CSS Prêts à l'Emploi)](#8-catalogue-des-correctifs-concrets-code-jsx-svg--css-prêts-à-lemploi)

---

## 1. Synthèse Exécutive & Scorecard Globale

| Axe d'Évaluation | Note / 10 | Verdict Synthétique |
| :--- | :---: | :--- |
| **Direction Artistique & Immersion (*Occult Dieselpunk × Statlocker.gg*)** | **8.8 / 10** | Identité visuelle forte, sombre et chirurgicale. Excellente maîtrise du glassmorphism, des faisceaux lumineux directionnels (`::before`) et du contraste typographique (`Syne` + `Outfit` + `Plus Jakarta Sans` + `JetBrains Mono`). |
| **Cohésion Graphique entre les 3 Pages** | **7.0 / 10** | Les Pages 2 et 3 partagent une architecture modulaire en 3 étages ultra-propre, tandis que la Page 1 reste un très long tunnel vertical (6 sections) truffé de styles inline (`style={{ ... }}`), d'anciennes conventions (`--accent-orange` remappé en vert) et d'une balise `<style>` injectée en JSX. |
| **Intégrité Mathématique & Lisibilité des Data Visualizations** | **5.4 / 10** | Bugs critiques : 3 référentiels ML contradictoires qui s'entrechoquent (et changent selon que le backend est en ligne ou hors-ligne !), collisions de textes SVG sur la Matrice Héros (10 chevauchements mesurés), *Lie Factor* sur les barres de Biomarqueurs (`17.8%` dessiné à `78%` de large vs `36.8%` à `36.8%`), `RiskGauge` coupant à `25%` mais étiqueté `36%`, et courbe ROC/PR (`86.0%` rappel) désynchronisée de la Matrice de Confusion adjacente (`73.5%` rappel). |
| **Ergonomie, Navigation & Découvrabilité** | **7.8 / 10** | Navigation à 3 onglets + popovers au survol élégante, Hub de sous-onglets très clair sur Pages 2/3, Glossaire contextuel remarquable. Manque un routage URL (`hash` ou `History API`), un indicateur de progression de lecture sur la Page 1, et un accès mobile aux sous-modules des Pages 2 et 3 dans le menu Burger. |
| **Responsive Mobile (`320px` – `768px`) & Anti-Overflow** | **8.8 / 10** | Zéro débordement horizontal du document (`scrollWidth === clientWidth`) vérifié empiriquement à `1280px`, `768px`, `375px` et `320px`. Toutefois, un bug critique CSS `.benchmark-table` sur `< 1023px` supprime les en-têtes `<th>` de la table d'ablation dont les `<td>` n'ont pas d'attribut `data-label` ! |
| **Finition CSS & Bilinguisme UI (`FR` / `EN`)** | **6.4 / 10** | Plus de 10 classes CSS utilisées en JSX sont absentes de `index.css` (`.btn-ghost`, `.btn`, `.btn-sm`, `.badge-cyan`, `.badge-chem`, `.badge-chem-bright`, `.animate-ping`, `.tilt-recommendation-box`, etc.), et plus de 22 chaînes ou attributs ARIA français restent affichés en dur en mode anglais (`EN`). |

---

## 2. Direction Artistique, Charte Graphique & Cohésion Inter-Pages

### 2.1. Ce qui a été fait & Points Positifs (Ce qui est bien)
1. **Une vraie signature visuelle non-générique ([docs/DESIGN_SYSTEM.md](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/docs/DESIGN_SYSTEM.md#L1-L142) & [frontend/src/index.css](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/index.css#L11-L143))** :
   - Le fond *Midnight Slate* (`#0b0f19` → `#111827`) éclairé par 3 halos radiaux fixes (`radial-gradient` émeraude, bleu arcanique et chartreuse) crée une profondeur atmosphérique fidèle à l'esthétique *Occult Dieselpunk* de Deadlock et aux tableaux de bord analytiques de référence (*Statlocker.gg*).
   - L'alternance typographique dans les titres principaux entre `.title-light` (`font-weight: 300`, `#94a3b8`), `.title-bold` (`font-weight: 800`, `#ffffff`) et `.title-glow` (dégradé `#69e799` → `#d8ec57`) donne une posture éditoriale haut de gamme aux 3 en-têtes de pages ([HeroSection.jsx:59-71](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/HeroSection.jsx#L59-L71), [ItemsSection.jsx:288-310](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/ItemsSection.jsx#L288-L310), [ItemTelemetrySection.jsx:509-531](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/ItemTelemetrySection.jsx#L509-L531)).
2. **Double Palette Sémantique formalisée sur les Pages 2 et 3 ([index.css:59-98](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/index.css#L59-L98))** :
   - **Palette A (Catégories de jeu Deadlock)** : `--dl-weapon` (`#e5993e`, orange cuivré), `--dl-vitality` (`#10b981`, vert), `--dl-spirit` (`#a855f7`, violet occulte), `--dl-souls` (`#38bdf8`, cyan).
   - **Palette B (Risque ML & Comportement)** : `--ml-churn` (`#ef4444`, rouge/rose), `--ml-retention` (`#69e799`, vert menthe Statlocker), `--ml-warning` (`#d8ec57`, or chartreuse).
   - Cette séparation évite au lecteur de confondre un item *Vitality* (vert catégorie) avec un *Faible risque de churn* (vert menthe ML), notamment grâce aux badges distincts `.dl-slot-*` vs `.dl-risk-*`.
3. **Usage rigoureux de `tabular-nums` (`JetBrains Mono`)** :
   - Les chiffres clés, pourcentages et minuteries (`8m 14s`, `3 000 Souls`) utilisent `font-variant-numeric: tabular-nums`, garantissant un alignement vertical irréprochable dans les tableaux et cartes KPI.

### 2.2. Points Négatifs, Bugs CSS & Ruptures de Cohésion Graphique

#### 🔴 Bug CSS #1 : Classes CSS fantômes utilisées dans les composants JSX mais absentes de `index.css`
Une vérification systématique par script de tous les attributs `className` des 19 fichiers `.jsx` contre `frontend/src/index.css` révèle **plusieurs classes non définies** qui dégradent silencieusement le rendu visuel :

1. **`.badge-cyan`** (utilisée dans [KpiBar.jsx:54](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/KpiBar.jsx#L54), [Navbar.jsx:626](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/Navbar.jsx#L626), [DeadlockMapHeatmap.jsx:352](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/DeadlockMapHeatmap.jsx#L352)) :
   - `index.css` définit `.badge-orange`, `.badge-amber`, `.badge-emerald`, `.badge-rose`, `.badge-neutral` ([index.css:480-508](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/index.css#L480-L508)), mais **pas `.badge-cyan`** !
   - **Impact visuel réel** : Le badge `Fenêtre Glissante ✦` du KPI 02 sur la Page 1, le badge d'en-tête du menu déroulant `ITEM` dans la Navbar, et le badge `N = 10 000 MATCHES COHORTE` de la Carte 2D s'affichent sans fond, sans bordure et en texte blanc brut.
2. **`.badge-chem-bright` et `.badge-chem`** (définies dans [mockData.js:889,1004](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/data/mockData.js#L889) et injectées dans [SimulatorSection.jsx:491](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/SimulatorSection.jsx#L491)) :
   - Dans `SimulatorSection.jsx`, `arch.badgeClass || (probNum >= 0.6 ? ...)` évalue `arch.badgeClass` à `"badge-chem-bright"` pour l'Archétype #3 (*Le Gardien des Objectifs*) et `"badge-chem"` pour l'Archétype #4 (*Le Joueur Régulier & Serein*).
   - Comme ces deux classes n'existent pas dans `index.css` (et court-circuitent le fallback `'badge-emerald'`), les badges de risque `Faible` / `Low` des archétypes 3 et 4 n'ont **aucune couleur, aucune bordure et aucun fond**, contrairement aux archétypes 1 (`badge-rose`) et 2 (`badge-amber`).
3. **`.btn-ghost`, `.btn` et `.btn-sm`** (utilisées dans [PsychologySection.jsx:269,283](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/PsychologySection.jsx#L269-L283), [DeadlockMapHeatmap.jsx:379,401](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/DeadlockMapHeatmap.jsx#L379-L401), [DictionaryDrawer.jsx:257](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/DictionaryDrawer.jsx#L257)) :
   - Le sélecteur d'onglets principal de la section Psychologie (`💎 Les 7 Gemmes Cachées Source 2` vs `🔬 Simulateur Tilt & Catalogue In-Game`) utilise `className={btn ${activeView === ... ? 'btn-primary' : 'btn-ghost'}}`.
   - Or ni `.btn`, ni `.btn-ghost`, ni `.btn-sm` ne sont définis dans `index.css` : l'onglet inactif n'a ni état `:hover`, ni couleur de texte secondaire, ni transition visuelle.
4. **`.tilt-recommendation-box`, `.recommendation-header`, `.recommendation-icon`, `.recommendation-title`, `.recommendation-text`** (utilisées dans [PsychologySection.jsx:641-646](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/PsychologySection.jsx#L641-L646)) :
   - `index.css` définit `.tilt-action-banner` et `.action-icon` ([index.css:2929-2944](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/index.css#L2929-L2944)), mais le JSX de `PsychologySection.jsx` utilise `.tilt-recommendation-box` et `.recommendation-*` qui n'existent pas dans `index.css` ! Résultat : l'encadré final « Politique Recommandée de Matchmaking » du simulateur de Tilt s'affiche sans fond, sans bordure et sans mise en forme flex.
5. **`.animate-ping`** (utilisée dans [HeroSection.jsx:245](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/HeroSection.jsx#L245)) :
   - `index.css` définit `.animate-spin`, mais pas `.animate-ping`. Le cercle d'alerte rouge du pic de Tilt (`TILT : 4.8 / CRIT ✦`) sur le graphique du Hero reste statique au lieu d'émettre une onde radar pulsante.

#### 🟠 Rupture Architecturale #2 : Asymétrie de structure et de propreté CSS entre la Page 1 et les Pages 2 / 3
- La charte ([docs/DESIGN_SYSTEM.md](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/docs/DESIGN_SYSTEM.md#L19)) édicte deux règles d'or : **« Zéro Scroll Infini »** (découpage en sous-onglets modulaires `.dl-subtabs-hub`) et **« Discipline CSS : Zéro Style Inline Sauvage »** (Section 5.3).
- Les **Pages 2 et 3** respectent scrupuleusement cette architecture (Header Éditorial + Horizon KPI + Hub encadré de Sous-Onglets `.dl-subtabs-hub` où un seul panneau `.dl-subtab-panel.is-active` est affiché à la fois).
- À l'inverse, la **Page 1 (`Étude Principale`)** empile **6 sections massives en scroll vertical continu** (`HeroSection` → `KpiBar` → `PsychologySection` → `MlBenchmarkSection` → `SimulatorSection` → `LabGatewayBanner` → `ArchitectureSection`), représentant plus de **7 500 pixels de hauteur sur desktop et plus de 14 000 pixels sur mobile**, avec des centaines de blocs `style={{ ... }}` inline dans `PsychologySection.jsx`, `MlBenchmarkSection.jsx`, `SimulatorSection.jsx`, `FactorAttribution.jsx` et `App.jsx` ([App.jsx:200-256](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/App.jsx#L200-L256)), plus une balise `<style>` de 343 lignes injectée directement dans le JSX de [ArchitectureSection.jsx:454-797](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/ArchitectureSection.jsx#L454-L797).

#### 🟠 Dissonance Sémantique #3 : Le token `--accent-orange` qui est en réalité Vert Émeraude (`#10b981`)
- Dans [index.css:54](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/index.css#L54), `--accent-orange` a été remappé sur `#10b981` (*Chem Green*) et `.badge-orange` / `.glow-orange` affichent du vert émeraude pour respecter la règle *Zero-Orange*.
- Toutefois, sur la Page 1, `.badge-orange` et `var(--accent-orange)` sont utilisés simultanément pour :
  - des badges de titre neutres (`BENCHMARK SCIENTIFIQUE`, `ÉTAPE 01`),
  - des métriques positives (`Rappel 79.5%`, `Vrais Positifs TP` dans la Matrice de Confusion [MlBenchmarkSection.jsx:650](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/MlBenchmarkSection.jsx#L650)),
  - le dépassement de seuil défavorable dans `RiskGauge.jsx` ([RiskGauge.jsx:401](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/RiskGauge.jsx#L401) : `color: diffFromThreshold >= 0 ? 'var(--accent-orange)' : 'var(--accent-emerald)'`, où les deux branches de la condition ternaire renvoient `#10b981` !),
  - **ET** un niveau de risque négatif dans le simulateur de Tilt (`Énervé (Frustration Aiguë)` avec `badge-orange` et `glow-orange` dans [PsychologySection.jsx:60-68](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/PsychologySection.jsx#L60-L68)) !
- **Conséquence cognitive** : Dans le simulateur de Tilt ([PsychologySection.jsx:50-88](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/PsychologySection.jsx#L50-L88)), un joueur avec un score de Tilt entre `2.0` et `3.99` (*« Énervé (Frustration Aiguë) — Risque élevé »*) voit son score et son badge s'allumer en **Vert Émeraude (`glow-orange` / `badge-orange` = `#10b981`)**, exactement de la même couleur verte que l'état *« Serein (Tilt 0) »* (`glow-emerald` / `badge-emerald` = `#10b981`), alors que le niveau intermédiaire `0.8 – 1.99` (*« Légèrement Frustré »*) est en Jaune (`badge-amber`) ! La progression chromatique `0.0 → 4.0` est donc **Vert → Jaune → Vert → Rouge**.

---

## 3. Ergonomie, Navigation (« La Façon de se Balader »), Responsive & Accessibilité

### 3.1. Ce qui est bien (Points Positifs)
1. **Navigation principale épurée à double niveau ([Navbar.jsx:411-670](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/Navbar.jsx#L411-L670))** :
   - Les 3 onglets de premier niveau (`Principal`, `Dynamique Héros & Churn`, `ITEM`) sont sobres, dépourvus de boîtes lourdes ou d'emojis criards, avec un point vert lumineux (`.nav-tab-dot`) identifiant clairement la page active.
   - Les fenêtres flottantes au survol (`.nav-hover-popover`) offrent un sommaire exécutif numéroté (`01` à `06` pour Page 1, `01` à `04` pour Page 2, `01` à `02` pour Page 3) qui permet d'accéder directement à n'importe quel sous-module d'un seul clic, même depuis une autre page (grâce à l'événement custom `deadlock:subtab`).
2. **Hub Interactif de Sélection des Modules sur les Pages 2 et 3 (`.dl-subtabs-hub`)** :
   - Au lieu de petits onglets discrets que l'utilisateur pourrait manquer, les Pages 2 et 3 utilisent de grandes cartes interactives dotées d'un badge icône `54px × 54px`, d'un numéro de module, d'une métrique phare, d'un résumé et d'une barre d'état inférieure (*« Affiché ci-dessous »* vs *« Ouvrir... → »*).
   - Support complet de la navigation clavier WAI-ARIA (`ArrowRight`, `ArrowLeft`, `Home`, `End`) via `handleSubTabKeyDown` ([ItemsSection.jsx:217-240](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/ItemsSection.jsx#L217-L240), [ItemTelemetrySection.jsx:440-463](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/ItemTelemetrySection.jsx#L440-L463)).
3. **Passerelles de navigation croisée (Cross-Navigation)** :
   - La bannière *Teaser Gateway* en bas de Page 1 ([App.jsx:200-259](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/App.jsx#L200-L259)) et les boutons croisés dans le sourcil des Pages 2 et 3 (`Espace ITEM →`, `← Dynamique Héros`, `Retour à l'Étude Principale`) créent un maillage fluide.
4. **Dispositif pédagogique d'accompagnement (`GlossaryTerm`, `DictionaryDrawer`, `AboutDeadlockModal`, `WelcomeDictionaryToast`)** :
   - Cliquer sur n'importe quel terme souligné en pointillés (`.glossary-term`) ouvre instantanément le tiroir latéral (`DictionaryDrawer`), réinitialise le filtre de catégorie si nécessaire, scrolle en douceur vers la carte du terme et la fait pulser pendant 3 secondes.

### 3.2. Frictions d'Ergonomie, Bugs Responsive & Fuites de Traduction

1. 🔴 **Bug Responsive Critique sur Mobile/Tablette (`< 1023px`) : Disparition des en-têtes de la Table d'Ablation ([index.css:3021-3095](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/index.css#L3021-L3095) × [MlBenchmarkSection.jsx:200-248](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/MlBenchmarkSection.jsx#L200-L248))** :
   - À `@media (max-width: 1023px)`, `index.css` transforme toutes les tables `.benchmark-table` en cartes empilées verticalement : il cache `thead { display: none !important; }` et affiche le nom de chaque colonne à gauche de chaque cellule via `.benchmark-table td::before { content: attr(data-label); }`.
   - Dans `MlBenchmarkSection.jsx`, la 1re table (Comparatif des 7 Modèles, lignes 117-162) possède bien `data-label={...}` sur ses `<td>`.
   - **MAIS** la 2e table (Étude d'Ablation des 7 Domaines, lignes 200-248) utilise aussi `className="benchmark-table"` **sans aucun attribut `data-label` sur ses `<td>`** !
   - **Impact visuel sur mobile/tablette (`768px`, `375px`, `320px`)** : Le `<thead>` est caché et `attr(data-label)` est vide. L'utilisateur voit 5 nombres bruts superposés par carte (`12`, `53.81%`, `34.61%`, `54.8%`, `0.221`) alignés à droite sans aucun libellé indiquant à quoi correspondent ces chiffres !
2. 🟠 **Absence de synchronisation avec l'URL (`window.location.hash` / History API) dans [App.jsx:88](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/App.jsx#L88)** :
   - L'état de navigation `activePage` (`'main' | 'items-lab' | 'items'`) et le sous-onglet actif (`activeSubTab`) sont stockés uniquement en mémoire React (`useState`).
   - **Conséquences UX** :
     - Si un utilisateur navigue de la Page 1 vers la Page 2 (`Dynamique Héros`) puis vers la Page 3 (`Espace ITEM`) et appuie sur le bouton **« Précédent » (Back)** de son navigateur (ou fait un swipe retour sur trackpad Mac / mobile), **il quitte complètement le site** au lieu de revenir à la page précédente !
     - Actualiser la page (`F5` / `Cmd+R`) depuis la Page 2 ou la Page 3 ramène brutalement en haut de la Page 1.
     - Il est impossible de partager un lien direct vers la Carte Tactique 2D ou le Catalogue d'Items.
3. 🟠 **Inaccessibilité des sous-menus au tactile dans la `Navbar` et omission des chapitres des Pages 2 & 3 dans le menu Burger ([Navbar.jsx:419-669, 943-960](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/Navbar.jsx#L419-L669))** :
   - Sur desktop, survoler `Principal`, `Dynamique Héros & Churn` ou `ITEM` ouvre le popover `.nav-hover-popover`. Mais **cliquer** sur le bouton `nav-tab-trigger` (qui possède pourtant un chevron `▼` et `aria-haspopup="true"`) exécute immédiatement `handleMainSectionClick` / `handleLabClick` / `handleItemClick` qui **ferme le menu déroulant** (`setMainDropdownOpen(false)`) ! Sur un iPad ou écran tactile large (`>= 1024px`), toucher l'onglet actif ne permet jamais d'ouvrir son sommaire déroulant.
   - De plus, dans le tiroir mobile Burger ([Navbar.jsx:943-960](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/Navbar.jsx#L943-L960)), la section 4 liste les 6 ancres de l'onglet `Principal`, mais **ne liste aucun des 4 chapitres de `Dynamique Héros & Churn` ni des 2 chapitres de `ITEM`**.
4. 🟠 **Navigation surprise inter-pages sur les cartes KPI Horizon de la Page 2 ([ItemsSection.jsx:334-497](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/ItemsSection.jsx#L334-L497))** :
   - Sur la Page 2, les cartes KPI `01`, `03` et `05` appellent `selectSubTab(...)` et scrollent vers le module correspondant de la Page 2, tandis que les cartes `02` (*1er Item Vitality Vindicta*) et `04` (*Rétention Économique*) appellent `onGoToItems()` et **changent brutalement de page vers la Page 3** sans aucune icône ni mention prévenant l'utilisateur de cette redirection externe.
5. 🟠 **Manque d'ergonomie de lecture sur le long-scroll de la Page 1** :
   - Contrairement aux Pages 2 et 3 qui sont découpées en sous-onglets, la Page 1 fait défiler 6 sections très denses sur plus de `7 500px` sans barre de progression de lecture, sans sommaire flottant (scroll-spy) et sans bouton *« Retour en haut »* (*Back to top*).
6. 🟠 **Fuites linguistiques Français → Anglais (`22` chaînes ou attributs codés en dur en français en mode `EN`)** :
   - [GlossaryTerm.jsx:33](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/GlossaryTerm.jsx#L33) : Le composant ne reçoit pas `lang` et affiche toujours en infobulle au survol `Dictionnaire : ${termInfo.termFr}` (ou `'Voir la définition dans le dictionnaire'`) même lorsque le site est en anglais !
   - [Navbar.jsx:744,757,907,925,928,934,936](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/Navbar.jsx#L925-L936) : Dans le tiroir Burger en mode `EN`, la carte Moteur Prédictif affiche en dur `"Démo locale"`, `"Modèle"`, `"Cliquer pour copier"`, `"✓ Copié"` / `"Copier"`, et les `aria-label` restent `"Menu principal"`, `"Fermer"`, `"Rafraîchir la connexion"`.
   - [HeroSection.jsx:79,518,526](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/HeroSection.jsx#L79) : Pilule `"N = 5 293 Matchs Source 2"` (au lieu de `Matches`), ruban `"SEUIL CALIBRÉ θ* = 0.25 ✦"`, et `title="Voir la définition de SHAP"`.
   - [PsychologySection.jsx:330-420](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/PsychologySection.jsx#L330-L420) : `"Visée 3D Seule"`, `"Combat Seul"`, `"7 Gemmes Seules"`, `"GEMME #1..7"`, `"Δ Écart Relatif"`, et dans l'onglet Catalogue (lignes 117-222) `"Facteur Aggravant Direct"`, `"Importance Relative"`, `"Facteur Protecteur"`.
   - [MlBenchmarkSection.jsx:203-210, 588-606, 839-862](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/MlBenchmarkSection.jsx#L203-L210) : En-têtes de la table d'ablation (`"Domaine Testé"`, `"Rappel"`, `"Écart Train/Test"`, `"Verdict Scientifique"`), indicateurs sous la courbe ROC (`"Rappel (TPR)"`, `"Faux Pos (FPR)"`, `"Score F1 (Test)"`, `"PPV Prod (Bayes)"`), et indicateurs de la Matrice de Confusion (`"profils)"`, `"du test set"`, `"Rappel (Sensitivity)"`, `"Spécificité (TNR)"`, `"Exactitude (Acc)"`).
   - [SimulatorSection.jsx:660,714,1009](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/SimulatorSection.jsx#L660-L715) : `"5 matchs solo"`, `"0 match"`, `"4 objets vendus"`, `"0 objet"` dans les cartes des 7 Gemmes Cachées, et `"V"` / `"D"` (Victoire/Défaite au lieu de `W` / `L` en anglais) dans la frise des 10 matchs.
   - [ItemsSection.jsx:256,966](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/ItemsSection.jsx#L256) : Faute de casse `"BIOMARQUEurs"` en FR (ligne 256) et axe Y du scatter plot `"9% Mort"`, `"12% Mort"`, `"15% Mort"`, `"18% Mort"` en EN (ligne 966).
   - [DeadlockMapHeatmap.jsx:541, 738-790, 819](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/DeadlockMapHeatmap.jsx#L541-L820) : Bouton `"▶ Lancer Simulation (0 - 10 min en 6s)"` / `"⏸ Pause Simulation"`, labels des 4 voies sur la carte (`"LANE AMBRE (OUEST)"`, `"LANE JADE (INT-OUEST)"`, `"LANE SAPHIR (INT-EST)"`, `"LANE ORCHIDÉE (EST)"`, `"SANCTUAIRE PATRON SUD (FONTAINE)"`), et tooltip `"💀 Mort Replay"`.
   - [ItemTelemetrySection.jsx:39,63,85,107,129,156-194,1577](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/ItemTelemetrySection.jsx#L39-L194) : `outcome_badge` des 5 séquences (`"CHURN CRITIQUE • 0% VITALITY PENDANT 30 MIN"`, `"ANCRE DE RÉTENTION • 89.7% FIDÉLITÉ"`, etc.), `num` et `badge` des 4 schémas (`"SCHÉMA #1..4"`, `"14 À 30 MIN SANS DÉFENSE"`, `"ITEMS DÉSACTIVÉS EN COMBAT"`, `"100K SOULS·MIN PERDUES"`), et `"✦ RECOMMANDATION SYSTÉMIQUE ML"` (ligne 1577) restent en français en mode `EN`.
   - [AboutDeadlockModal.jsx:101-105, 156-158](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/AboutDeadlockModal.jsx#L101-L158) : Tags (`"Économie des Souls"`, `"Visée 3D & Headshots"`, `"XGBoost & Explicabilité"`) et encadré (`"VALEUR OPÉRATIONNELLE"`, `"Applications Concrètes pour les Studios de Jeux"`).
   - [DictionaryDrawer.jsx:150,215](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/DictionaryDrawer.jsx#L150) : Badge `"Lexique ML & Gaming"` et `aria-label="Effacer la recherche"`.

---

## 4. Audit Détaillé — Page 1 : Étude Principale (`main`)

### 🔴 Découverte Structurante : La Collision des 3 Référentiels ML sur la Page 1 (et le changement de chiffres Online vs Offline)
Avant d'analyser chaque composant de la Page 1, notre audit croisé entre `frontend/src/data/mockData.js`, `backend/data/ml_results.json` et `backend/app/services/mock_service.py` met en évidence la cause racine de toutes les contradictions chiffrées de la Page 1. **Trois générations différentes du pipeline ML cohabitent dans le code** :

| Référentiel | Où est-il affiché ? | Modèle Champion & Features | ROC-AUC / PR-AUC | Rappel & Seuil $\theta^*$ | Taille Test $N$ |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **Génération A (Ancien V6 XGBoost + SMOTE)** | `InteractiveCurves` (ROC/PR), `ConfusionMatrixHeatmap`, `RiskGauge` (textes), `ArchitectureSection`, `AboutDeadlockModal` | V6 XGBoost + SMOTE (`48` features) | `80.0%` / `79.3%` (ou `81.4%` dans la modale) | Rappel `85.0%` – `86.0%` au seuil **$\theta^* = 0.36$** (ou `0.42`) | `N = 4 900` (ou `3 397`) |
| **Génération B (Enrichi 106 features + 7 Gemmes S2 — `mockData.js` Offline)** | `HeroSection`, `KpiBar` (en mode **Offline**), `PsychologySection`, `ModelComparisonTable`, `FEATURE_IMPORTANCE_LIST` | Gradient Boosting Depth-3 (`106` features dont 7 Gemmes Cachées) | **`67.3%` / `50.9%`** (`69.65%` norm.) | Rappel **`79.5%`** au seuil **$\theta^* = 0.25$** | `N = 1 912` (sur `10 000` fenêtres) |
| **Génération C (`backend/data/ml_results.json` — API Online)** | `KpiBar` (en mode **Online** quand FastAPI tourne !) & badge en dur de `KpiBar` col 05 / `ModelComparisonTable` | MLP Neural Network / GradBoost (`79` cand. → `24` features optimales, **sans** les 7 Gemmes Cachées !) | **`77.1%` / `72.5%`** (ou `57.0%` test PR-AUC, car `mock_service.py:358` renvoie `train_pr_auc` !) | Rappel `56.7%` ($\theta^* = 0.465$) ou `80.3%` ($\theta^* = 0.26$) | `N = 1 912` |

- **Conséquence critique en exécution réelle** :
  - Lorsque le backend FastAPI est **hors-ligne**, `KpiBar` lit `MOCK_METRICS` et affiche : Rappel = **`79.5%`** et ROC-AUC / PR-AUC = **`67.3% / 50.9%`**.
  - Dès que le backend FastAPI passe **en ligne** (`GET /api/ml/metrics` dans [health.py:68-80](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/backend/app/api/routers/health.py#L68-L80)), `ModelMetricsResponse` ne contient même pas le champ `recall` (`recall` tombe alors dans le fallback de traduction `'77.4% - 80.3%'` qui déborde sur 2 lignes dans `KpiBar`), et `mock_service.py:358` renvoie `auc_score: 0.7712` et `pr_auc: max(0.7250, train_pr_auc)` (`0.7354`), faisant brutalement sauter le KPI 05 de **`67.3% / 50.9%`** à **`77.1% / 73.5%`** alors que le tableau `ModelComparisonTable` juste en dessous reste figé sur **`67.3% / 50.9%`** !

---

### 4.1. `HeroSection.jsx` — En-tête Éditorial & Visualiseur de Flux Télémétrique
- **Ce qui a été fait** : En-tête éditorial 2 colonnes, barre d'actions, cadre sculpté asymétrique (`.sculpted-showcase-frame`) simulant un terminal de télémétrie avec une courbe SVG (`telemetry-svg-desktop` et `telemetry-svg-mobile`), 4 puces HUD cliquables, un badge circulaire rotatif sur lattes émeraude, un ruban technologique monochrome et 3 piliers éditoriaux.
- **Points positifs** :
  - Très fort impact visuel dès l'ouverture (*Above the Fold*).
  - Avoir prévu deux SVG distincts (`viewBox="0 0 820 220"` sur desktop et `viewBox="0 0 380 180"` sur mobile) évite l'écrasement illisible des textes SVG sur smartphone.
  - Les nœuds clés du graphique (`SEUIL θ* = 0.25 ✦`, `TILT : 4.8 / CRIT ✦`) et les 4 puces HUD sont interactifs et ouvrent le dictionnaire sur le terme correspondant.
- **Points négatifs & Bugs DataViz / UI** :
  1. **Contradiction interne du Seuil $\theta^*$ et de la taille d'échantillon $N$ dès le Hero** :
     - Les pilules du Hero ([HeroSection.jsx:79](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/HeroSection.jsx#L79)) annoncent `N = 5 293 Matchs Source 2`, tandis que la section `KpiBar` juste en dessous affiche `10 000 Fenêtres Analysées` (et `ArchitectureSection` annonce `13 584 joueurs` / `24 500+ historiques`).
     - Le graphique SVG du Hero ([HeroSection.jsx:232](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/HeroSection.jsx#L232)) et le ruban tech (ligne 518) affichent **`SEUIL θ* = 0.25 ✦`**, alors que `KpiBar` (200px plus bas, [KpiBar.jsx:73](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/KpiBar.jsx#L73)), `MlBenchmarkSection` et `ArchitectureSection` affichent **`θ* = 0.36 ✦`** !
  2. **Ambiguïté de l'axe Y et de la sémantique de la courbe SVG ([HeroSection.jsx:160-262](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/HeroSection.jsx#L160-L262))** :
     - La courbe représente simultanément l'*Indice de Tilt* (axe horizontal de niveau `BASELINE NOMINALE`, `SEUIL VIGILANCE`, `ZONE CRITIQUE // TILT > 4.0` et pic à `TILT : 4.8`) **et** coupe une ligne verticale appelée `SEUIL θ* = 0.25` (qui est un seuil de probabilité de churn $[0, 1]$ et non un timestamp sur l'axe horizontal `M-8` → `MATCH T` → `+14J HORIZON`).
     - De plus, après `MATCH T (RUPTURE)`, dans la zone `+14J HORIZON` (`x = 560` à `820`), la courbe redescend tout en bas sous la baseline nominale (`y = 155` → `195` → `168`) et devient cyan, ce qui donne visuellement l'impression que le risque/tilt est revenu à la normale, alors que le joueur est en réalité en état d'abandon (inactivité totale pendant 14 jours) !
  3. **Débordement léger du SVG rotatif `.stamp-svg` sur mobile (`375px` et `320px`)** :
     - Détecté par notre sonde CDP : dans `.rotating-stamp-badge` (`130px × 130px`), le chemin circulaire `<path id="stampCirclePath" d="M 70, 70 m -50, 0 a 50,50 ..." />` dans un `viewBox="0 0 140 140"` place la ligne de base du texte à `r = 50` (`x = 20` à `120`), mais avec `font-size: 10.5px` s'étendant vers l'extérieur et la rotation continue, la boîte englobante du `<text>` déborde de `4px` à `7px` hors du `<svg>` à certains angles de rotation. Réduire le rayon du `<path>` de `50` à `46` élimine ce débordement.

### 4.2. `KpiBar.jsx` — Horizon des 5 Indicateurs Clés
- **Ce qui a été fait** : Grille horizontale sans boîtes rigides (`.kpi-seamless-horizon`, 5 colonnes sur desktop, 3 sur tablette, 1 sur mobile) exposant `10 000 Fenêtres Analysées`, `20 Matchs`, `106 Signaux Télémétriques`, `79.5% Rappel Churn`, et `67.3% / 50.9% ROC-AUC / PR-AUC`.
- **Points positifs** :
  - Mise en page aérée qui contraste bien avec le cadre sculpté du Hero au-dessus et les cartes de la section Psychologie en dessous.
- **Points négatifs & Bugs** :
  1. **Bug `.badge-cyan` manquant sur la colonne 02 ([KpiBar.jsx:54](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/KpiBar.jsx#L54))** : Le bouton `Fenêtre Glissante ✦` utilise `badgeClass: 'badge-cyan'` qui n'existe pas dans `index.css`.
  2. **Contradiction entre le titre/badge des KPI 04 & 05 et les valeurs injectées par `metricsData` ([KpiBar.jsx:23-87](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/KpiBar.jsx#L23-L87))** :
     - La valeur `recallVal` est lue depuis `metricsData.recall` (`79.5%`, calculée dans `MOCK_METRICS` au seuil `best_threshold: 0.25`), mais le libellé et le badge du KPI 04 affichent en dur **`Rappel Churn (θ* = 0.36)`** et **`θ* = 0.36 ✦`**, et le sous-texte issu de `translations.js:114` dit *« Détection de 8 churners sur 10 (MLP Réseau Neuronal 80.3%, Gradient Boosting 77.4%) »* !
     - Sur la colonne `05`, le badge à la ligne 83 est codé en dur **`PR-AUC 57.8% ✦`** juste au-dessus du grand chiffre **`67.3% / 50.9%`** (`metricsData.pr_auc = 0.5093`) ! Voir `PR-AUC 57.8%` en badge et `50.9%` juste en dessous pour la même métrique est une incohérence visuelle immédiate.

### 4.3. `PsychologySection.jsx` — Les 7 Gemmes Cachées & Simulateur de Tilt
- **Ce qui a été fait** : Double vue commutable (`Les 7 Gemmes Cachées Source 2` vs `Simulateur Tilt & Catalogue In-Game`). La Vue 1 affiche une bannière d'ablation (`61.91% ROC-AUC`) et 7 cartes comparant la moyenne Churners vs Fidélisés avec $\Delta\%$ et $p\text{-value}$. La Vue 2 propose un explorateur de 6 formules Python/Math et un simulateur interactif à 4 curseurs calculant le `Tilt Index` en direct.
- **Points positifs** :
  - Le simulateur de Tilt à 4 curseurs (`Abandons Récents`, `Série de Défaites`, `Durée Moyenne`, `Morts par Minute`) connecté en temps réel à la formule Python est un excellent outil de médiation scientifique.
- **Points négatifs & Bugs DataViz / UI** :
  1. **Absence de support visuel (barres ou *dumbbell plot*) dans les 7 cartes des Gemmes Cachées ([PsychologySection.jsx:395-433](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/PsychologySection.jsx#L395-L433))** :
     - Chaque carte affiche 3 chiffres textuels (`Joueurs Churn` à gauche en rouge, `Δ Écart Relatif` au centre en badge jaune, `Fidélisés` à droite en vert), mais **aucune jauge ni barre comparative**. Pour 7 cartes alignées en grille, l'œil doit lire 21 nombres bruts sans encodage pré-attentif de longueur ou de pente.
  2. **Contradiction chromatique dans le Simulateur de Tilt ([PsychologySection.jsx:60-68](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/PsychologySection.jsx#L60-L68)) & boîte de recommandation sans style CSS (ligne 641)** :
     - Le palier `score >= 2.0` (*« Énervé (Frustration Aiguë) »*) utilise `badge-orange` et `glow-orange` qui sont **Vert Émeraude (`#10b981`)**, identiques à l'état `Serein (Tilt 0)`.
     - L'encadré `.tilt-recommendation-box` (ligne 641) utilise des classes CSS absentes de `index.css`.
  3. **Échelle du `Tilt Index` (`0 – 15`) incompatible avec `SimulatorSection` et `DictionaryDrawer` (`0 – 100`) ([PsychologySection.jsx:31-88](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/PsychologySection.jsx#L31-L88) vs [SimulatorSection.jsx:865](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/SimulatorSection.jsx#L865) & [dictionaryData.js:111](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/data/dictionaryData.js#L111))** :
     - Dans `PsychologySection`, les curseurs au maximum absolu (`3 abandons`, `8 défaites`, `15 min`, `0.70 DPM`) donnent un score maximal possible de $3\times 2 + (8-2) + (25-15)\times 0.1 + (0.7-0.3)\times 5 = \mathbf{15.0}$, et le seuil critique est `>= 4.0`.
     - Dans `SimulatorSection` (et `MOCK_ARCHETYPES` / `schemas.py:44`), le `Tilt Index` est exprimé sur une échelle `0 – 100` (`82.5` pour *Le Fantassin en Tilt*, `54.0` pour *Le Vétéran Épuisé*, `18.0` pour *Le Gardien des Objectifs*, `8.5` pour *Le Joueur Serein*), et le dictionnaire dit `Un score de tilt > 60 multiplie par 3.2 la probabilité de churn`. Un lecteur qui voit `18.0` sur *Le Gardien des Objectifs* (joueur serein) alors qu'il vient d'apprendre que `>= 4.0` signifie *« Tilt Extrême (Ragequit Imminent) »* est face à deux unités incompatibles.

### 4.4. `MlBenchmarkSection.jsx` — Benchmark des Modèles, Ablation, Courbes ROC/PR, Matrice de Confusion & Feature Importance
- **Ce qui a été fait** : 4 sous-composants :
  1. `ModelComparisonTable` (table des 7 modèles ML + table des 7 expériences d'ablation),
  2. `InteractiveCurves` (courbe SVG ROC / PR commutable avec curseur de seuil $\theta \in [0.05, 0.95]$ et calcul PPV Bayésien),
  3. `ConfusionMatrixHeatmap` (matrice 2×2 interactive TP/FN/FP/TN pilotée par le même seuil $\theta$),
  4. `FeatureImportanceChart` (diagramme à barres horizontales SVG Top 10 / Top 15 avec filtres par catégorie).
- **Points positifs** :
  - La mise en regard côte à côte de la courbe ROC/PR et de la Matrice de Confusion 2×2 pilotées par un curseur de seuil commun $\theta$ est pédagogiquement très pertinente pour expliquer le compromis Rappel / Faux Positifs.
  - L'inclusion du `PPV Prod (Bayes)` tenant compte de la prévalence réelle ($\pi_{\text{live}} \approx 5.74\%$) montre une vraie réflexion opérationnelle.
- **Points négatifs & Bugs DataViz critiques** :
  1. 🔴 **Désynchronisation mathématique entre `InteractiveCurves` (à gauche) et `ConfusionMatrixHeatmap` (à droite) sous le même seuil $\theta$ ([MlBenchmarkSection.jsx:263](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/MlBenchmarkSection.jsx#L263) vs [MlBenchmarkSection.jsx:628-629](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/MlBenchmarkSection.jsx#L628-L629))** :
     - `InteractiveCurves` calcule `recall` et `fpr` par interpolation linéaire sur `CALIBRATED_CURVE_POINTS` (`interpolateAtThreshold(threshold)`). Au seuil par défaut $\theta = 0.36$, il affiche :
       - **Rappel (TPR) = `86.0%`**
       - **Faux Pos (FPR) = `38.0%`** (donc Spécificité = `62.0%`)
     - Juste à droite, `ConfusionMatrixHeatmap` reçoit le **même `threshold = 0.36`**, mais au lieu d'utiliser `interpolateAtThreshold(threshold)`, il utilise une formule analytique arbitraire codée en dur :
       ```js
       const recall = Math.max(0.1, Math.min(0.99, 1.0 - Math.pow(threshold, 1.25) * 0.95));
       const fpr = Math.max(0.01, Math.min(0.95, Math.pow(1.0 - threshold, 1.6)));
       ```
       Ce qui affiche à $\theta = 0.36$ :
       - **Rappel (Sensitivity) = `73.5%`** (au lieu de `86.0%` !)
       - **Faux Pos (FPR) = `49.0%` / Spécificité = `51.0%`** (au lieu de `38.0%` / `62.0%` !)
     - **Impact DataViz** : Deux graphiques adjacents liés au même curseur $\theta$ affichent simultanément deux valeurs de Rappel divergentes de **12.5 points** (`86.0%` vs `73.5%`) !
  2. 🔴 **Contradiction entre la Table des Modèles (`ROC-AUC 67.3%`, `PR-AUC 50.9%`, `N test = 1 912`, $\theta^* = 0.25$) et les Graphiques juste en dessous (`ROC-AUC 80.0%`, `PR-AUC 79.3%`, `N test = 4 900`, $\theta^* = 0.36$)** :
     - Dans `ModelComparisonTable` ([MlBenchmarkSection.jsx:53-178](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/MlBenchmarkSection.jsx#L53-L178)), le modèle champion dé-biaisé (`Gradient Boosting`) affiche `ROC-AUC = 67.3%`, `PR-AUC = 50.9%`, `Rappel = 79.5%`, `Seuil = 0.25` sur `N = 1 912 test`.
     - Mais `InteractiveCurves` (lignes 311-351) et `ConfusionMatrixHeatmap` (ligne 624) sont restés branchés sur les données d'une version antérieure du modèle (`ROC Curve (80.0%)`, `PR Curve (79.3%)`, `N_TOTAL = 4900` avec 2 450 Churn / 2 450 Actifs, `θ* = 0.36`, baseline PR à `0.4965` au lieu de `0.2426`).
     - De plus, `MlBenchmarkSection` ([MlBenchmarkSection.jsx:1128](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/MlBenchmarkSection.jsx#L1128)) **ignore complètement les props `metricsData` et `visData`** que lui passe `App.jsx` !
  3. 🔴 **Échelle `maxVal = 0.35`, filtres cassés et note de bas de page erronée dans `FeatureImportanceChart` ([MlBenchmarkSection.jsx:872-1123](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/MlBenchmarkSection.jsx#L872-L1123))** :
     - **Axe X sur-dimensionné (`maxVal = 0.35` soit `35%`)** : La variable n°1 (`solo_isolation_streak`) a une importance de `9.2%` (`0.0924`). Sur un axe gradué jusqu'à `35%`, la barre la plus longue du graphique occupe à peine **26.4% de la largeur disponible**, laissant **73.6% du graphique totalement vide à droite** (les lignes de grille `20%` et `30%` ne servent à rien).
     - **Catégorie `"hidden_gems"` orpheline** : Dans `FEATURE_IMPORTANCE_LIST` ([mockData.js:331-410](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/data/mockData.js#L331-L410)), 8 variables — dont **7 des 8 variables les plus importantes du modèle** — ont `category: "hidden_gems"`. Or `FEATURE_CATEGORIES` ([mockData.js:1629-1635](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/data/mockData.js#L1629-L1635)) ne contient que `all`, `aim`, `economy`, `combat`, `psychology`. Il est donc **impossible de filtrer sur les 7 Gemmes Cachées** !
     - **Fonction `getCategoryColor` désynchronisée ([MlBenchmarkSection.jsx:896-909](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/MlBenchmarkSection.jsx#L896-L909))** : Elle teste `case 'behavior':` et `case 'ranked':` (qui n'existent plus dans les données) et ignore `'hidden_gems'`, `'psychology'` et `'aim'`, qui tombent toutes dans le `default: return 'var(--accent-orange)'` (vert). Résultat : **20 des 24 barres ont exactement la même couleur verte**, sans aucune légende de couleur.
     - **Note explicative contredisant le graphique ([MlBenchmarkSection.jsx:924, 1117](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/MlBenchmarkSection.jsx#L1117))** : Le sous-titre et le takeaway affirment : *« L'écart de Souls à 10 min et la régularité de visée 3D constituent les signaux majeurs de prédiction »*, alors que le graphique juste au-dessus montre que `solo_isolation_streak` (`9.2%`), `stun_headshots_taken_rate` (`8.2%`), `headshot_diff_rate` (`7.6%`) et `late_panic_sells` (`6.9%`) occupent les 4 premières places, tandis que `souls_diff_10m` n'est que **11e (`4.0%`)** !
  4. **Badge contradictoire en haut de `ModelComparisonTable` ([MlBenchmarkSection.jsx:59](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/MlBenchmarkSection.jsx#L59))** :
     - Le badge affiche `CHAMPION : MLP & GRADIENT BOOSTING (100% IN-GAME)` alors que dans la table `MODEL_BENCHMARK_ROWS` juste en dessous, le réseau `MLP` est classé **dernier (7e sur 7)** avec `62.6% ROC-AUC` et `43.5% PR-AUC`.

### 4.5. `SimulatorSection.jsx`, `RiskGauge.jsx` & `FactorAttribution.jsx` — Diagnostic Joueur, Jauge & Attribution SHAP
- **Ce qui a été fait** : Barre de recherche avec autocomplétion et conversion automatique SteamID 64-bit → 32-bit, 4 cartes d'archétypes en 1 clic, tableau de bord des 7 Gemmes Cachées du joueur actif, jauge semi-circulaire SVG `RiskGauge` à 3 zones, panneau `FactorAttribution` commutable entre *Cartes Détaillées* et *Graphique Bilatéral (Tornado)*, et frise séquentielle des 10 derniers matchs.
- **Points positifs** :
  - L'expérience de recherche joueur + sélection d'archétype en 1 clic avec repli déterministe hors-ligne (`synthesizePlayerProfile`) est ultra-réactive.
  - La jauge semi-circulaire SVG (`RiskGauge.jsx`) est esthétiquement très réussie (dégradés des 3 arcs, aiguille avec ombre portée et contre-poids, encadré de recommandation studio contextualisé).
- **Points négatifs & Bugs DataViz critiques** :
  1. 🔴 **Bug critique dans `RiskGauge.jsx` appelé avec `threshold={0.25}` depuis `SimulatorSection.jsx` ([SimulatorSection.jsx:807](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/SimulatorSection.jsx#L807) & [RiskGauge.jsx:43-67, 289, 404](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/RiskGauge.jsx#L43-L67))** :
     - `SimulatorSection.jsx` (ligne 807) passe `threshold={0.25}` à `<RiskGauge />` (et lui passe aussi une prop `riskTier={...}` qui n'est jamais lue par `RiskGauge`).
     - Dans `RiskGauge.jsx`, la géométrie SVG et la condition `else if (p >= th)` utilisent bien la prop `threshold` (`0.25`), **MAIS** tous les textes du composant sont codés en dur avec **`36%`** :
       - Ligne 50 : `'Faible (< 36%)'`
       - Ligne 65 : `'Modéré (36% - 60%)'`
       - Ligne 289 : Le marqueur dessiné géométriquement à l'angle **25%** sur l'arc porte l'étiquette texte **`θ* = 36%`** !
       - Lignes 116 & 404 : `diffFromThreshold = (p - th) * 100` soustrait `0.25`, mais affiche à côté **`(θ* = 36.0%)`** !
     - **Ce qui s'affiche à l'écran lorsqu'on clique sur l'Archétype #3 (*Le Gardien des Objectifs*, probabilité = `28.0%`)** :
       - Sa carte d'archétype et l'en-tête du dashboard disent **`Niveau Risque : Faible (< 36%)`** (car `translateRiskLevel(0.28)` dans `translations.js:1494` coupe à `0.36`).
       - Mais juste en dessous, `RiskGauge` (où `0.28 >= 0.25`) s'allume en **Jaune Chartreuse**, affiche en gros **`28.0%`** avec le badge **`Modéré (36% - 60%)`** (alors que `28.0%` n'est pas compris entre 36% et 60% !), et écrit en dessous : **`Position par rapport au seuil : +3.0% (θ* = 36.0%)`** (alors que $28.0\% - 36.0\% = -8.0\%$ !) !
       - Le même bug se produit sur le joueur de cohorte `Seven_StormMaster` (`32.0%` : badgé `Faible (< 36%)` en haut mais affiché en Jaune `Modéré (36% - 60%)` avec `+7.0% (θ* = 36.0%)` sur la jauge).
  2. 🔴 **Désalignement complet entre les Facteurs SHAP de `FactorAttribution` et les 7 Gemmes Cachées affichées juste au-dessus ([mockData.js:680-1095](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/data/mockData.js#L680-L1095) & [FactorAttribution.jsx:33-532](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/FactorAttribution.jsx#L33-L532))** :
     - Dans `SimulatorSection`, le grand panneau central met en vedette *« Les 7 Gemmes Cachées Source 2 (61.91% ROC-AUC Seules) »* (`solo_isolation_streak = 5`, `stun_headshots_taken_rate = 1.45`, `parry_miss_per_match = 4.8`, `grey_screen_ratio = 19.5%`, `late_panic_sells = 4`).
     - Or, juste en dessous, dans `FactorAttribution` (qui est censé expliquer par SHAP la prédiction de ce même joueur), **aucune des 7 Gemmes Cachées n'apparaît jamais**, ni dans les 4 archétypes pré-calibrés (`mockData.js:680-1095`), ni dans la fonction de fallback `deriveAttributionFromFeatures()` (`FactorAttribution.jsx:325-532`), ni dans `synthesizePlayerProfile()` (`api.js:434-483`) !
     - Pis encore : pour l'Archétype #1 (*Le Fantassin en Tilt Aigu*), `factorAttribution.protective` est un tableau vide `[]` (`mockData.js:722`), et pour les Archétypes #3 et #4, `factorAttribution.aggravating` est un tableau vide `[]` (`mockData.js:938, 1053`). Du coup, quand on sélectionne l'Archétype #3 ou #4, la colonne de gauche **« Facteurs Aggravants (0 signaux) » est une grande boîte rouge totalement vide**, et quand on sélectionne l'Archétype #1, la colonne de droite **« Facteurs Protecteurs (0 signaux) » est une grande boîte verte totalement vide** ! (Voir `BASE_ARCHETYPE_ATTRIBUTIONS` dans `FactorAttribution.jsx:33-311` qui contenait pourtant des facteurs des deux côtés, mais qui est écrasé par `activeProfile.factorAttribution` de `mockData.js` à la ligne 578 !).
  3. 🟠 **Frise des 10 derniers matchs codée en dur en 3 tableaux statiques ([SimulatorSection.jsx:755-759](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/SimulatorSection.jsx#L755-L759))** :
     - Au lieu de générer la séquence de 10 matchs à partir du `current_streak` et du `win_rate` réels du joueur sélectionné, `SimulatorSection` utilise seulement 3 tableaux figés (`isCriticalTrend`, `isWarningTrend`, `else`).
     - **Incohérence visible** : Pour *Le Vétéran Épuisé* (`Série Active : -3`, `Win Rate : 46.0%`), la frise (`isWarningTrend`) affiche **4 défaites consécutives à la fin (`-4`) et seulement 3 victoires sur 10 (`30%`)**, et les 3 boîtes de diagnostic en bas à droite affichent des valeurs figées (`14.2% temps en écran gris`, `3.2 parades manquées`) même lorsqu'on recherche un joueur custom dont le `grey_screen_ratio` est différent !
  4. 🟠 **Mode « Graphique Bilatéral » (Tornado Chart) de `FactorAttribution.jsx` ([FactorAttribution.jsx:1045-1138](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/FactorAttribution.jsx#L1045-L1138))** :
     - Un vrai graphique Tornado SHAP trie toutes les variables de haut en bas par **amplitude absolue décroissante** ($|\text{poids}|$), qu'elles soient aggravantes ou protectrices, afin de hiérarchiser immédiatement les facteurs dominants. Ici, le composant affiche d'abord tous les facteurs aggravants puis tous les facteurs protecteurs.
     - De plus, lorsque `barWidth` approche `100%` sur le demi-axe (`width: 50%` en `display: flex`), le `div` de la barre (`width: 100%`) et le `span` du pourcentage (`marginLeft: 0.5rem`) se partagent l'espace flexbox sans `flexShrink: 0` sur la barre, ce qui compresse la largeur réelle des barres les plus longues par rapport aux barres plus courtes.

### 4.6. `ArchitectureSection.jsx` — Pipeline ML en 5 Étapes & Reproductibilité
- **Ce qui a été fait** : Stepper interactif à 5 étapes (`01 Ingestion` → `02 48 Features` → `03 Entraînement` → `04 Calibration Seuil` → `05 Inférence FastAPI`), matrice technique 2×2 par étape, widget interactif dédié à chaque étape, carte prospective *Séries Temporelles (Survie, Transformers, Processus de Hawkes)* et panneau Quickstart avec copie 1-clic.
- **Points positifs** :
  - Excellente conception interactive : chaque étape du pipeline possède non seulement sa fiche technique (Entrées, Sorties, Algorithmes, Contraintes) mais aussi un mini-laboratoire interactif en dessous.
- **Points négatifs & Incohérences** :
  1. **Désalignement complet des chiffres avec le reste de la Page 1** : `ArchitectureSection` décrit encore l'ancien pipeline **« 48 Features / 13 584 joueurs / N test = 3 397 / Taux de churn cohorte 49.6% / V6 XGBoost + SMOTE / Rappel 85.0% / ROC-AUC 80.0% / PR-AUC 79.3% »**, alors que `HeroSection`, `KpiBar`, `PsychologySection` et `MlBenchmarkSection` décrivent le pipeline **« 106 Features (dont 7 Gemmes Cachées) / 10 000 fenêtres (1 170 joueurs) / N test = 1 912 / Taux de churn 24.3% / Gradient Boosting régularisé / Rappel 79.5% / ROC-AUC 67.3% / PR-AUC 50.9% »**.
  2. **Simulateur de Seuil de l'Étape 04 incohérent avec l'Étape 04 elle-même ([ArchitectureSection.jsx:251-253 vs 427-449](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/ArchitectureSection.jsx#L427-L449))** :
     - La carte de l'Étape 04 (lignes 252-253) écrit : *« Rappel maximal garanti : 85.0% (1 434 churners détectés) | Faux négatifs réduits à 15.0% (253 joueurs) »* et l'Étape 03 (ligne 203) annonce *« Précision Test : 65.4% »*.
     - Mais juste en dessous, le widget interactif `getThresholdMetrics(0.36)` (lignes 427-447) utilise une formule linéaire `recall = 0.96 - ((th - 0.1)/0.8) * 0.70` et `precision = 0.52 + ((th - 0.1)/0.8) * 0.32`. Au seuil par défaut $\theta^* = 0.36$, il affiche **Rappel = `73.3%` (`1 237 / 1 689 churners`)**, **Précision = `62.4%`** et **Départs Manqués (FN) = `452 (26.8% perdus)`**, contredisant les `85.0%` (`1 434 churners`) et `253 FN (15.0%)` écrits 120 pixels plus haut dans la même carte !
  3. **Chemin de fichier fictif et commande Uvicorn cassée ([ArchitectureSection.jsx:998, 1381](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/ArchitectureSection.jsx#L1381))** :
     - À l'Étape 02 (ligne 998), le commentaire cite `# Définition formelle (backend/main.py:685-712)`, fichier qui n'existe pas (le point d'entrée est `backend/app/main.py` qui fait 102 lignes, et les features sont dans `backend/app/services/feature_service.py`).
     - Dans le panneau Quickstart (ligne 1381), la commande backend affichée est `uvicorn main:app --reload --port 8001`, qui échoue avec `Error loading ASGI app. Could not import module "main"`, alors que la commande valide depuis `backend/` est `uvicorn app.main:app --reload --port 8000` (port `8000` configuré dans `frontend/vite.config.js:13`).

---

## 5. Audit Détaillé — Page 2 : Dynamique Héros & Churn (`items-lab`)

### 5.1. Architecture Globale de la Page 2 (`ItemsSection.jsx`)
- **Ce qui a été fait** :
  - **Étage 1** : Header éditorial court aligné sur la Page 1 + boutons de navigation croisée (`Espace ITEM →`, `← Retour à l'Étude Principale`).
  - **Étage 2** : Horizon KPI Monumental à 5 cartes (`+78.6% Headshots sous Stun`, `30.0 Min 1er Item Vitality`, `60.0% Churn Critique Yamato`, `89.7% Rétention Économique`, `81.8% Rétention Piliers`) + 3 Piliers Éditoriaux Interactifs (`01`, `02`, `03`).
  - **Étage 3** : Hub encadré (`.dl-subtabs-hub`) à 4 grands modules commutables sans rechargement.
- **Points positifs** :
  - L'architecture en 3 étages fonctionne remarquablement bien : l'utilisateur comprend immédiatement la thèse scientifique grâce aux 5 KPI et aux 3 piliers, puis explore à son rythme les 4 modules sans subir un scroll infini.

### 5.2. Module 01 (`#lab-step-1`) — Comparatif Empirique des 5 Biomarqueurs
- **Ce qui a été fait** : 5 lignes comparatives (`Headshots Subis sous Stun`, `Temps Passé Mort / Écran Gris`, `Isolement Social Solo`, `Revente Panique / Rage-Sell`, `Soutien aux Coéquipiers`) opposant `Churn = 1` (barre rouge) et `Churn = 0` (barre verte) avec badge d'écart relatif.
- **Points négatifs & Bugs DataViz critiques** :
  1. 🔴 **Distorsion majeure de l'échelle des barres (*Tufte Lie Factor*) ([ItemsSection.jsx:52-133, 852, 870](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/ItemsSection.jsx#L52-L133))** :
     - Dans `SOURCE2_BIOMARKERS`, la largeur CSS de chaque barre (`width: ${bio.churn_pct}%`) ne correspond **pas** au pourcentage affiché (`bio.churn_val`) sur les biomarqueurs #2 et #4 :
       | Biomarqueur | Valeur affichée (`Churn=1`) | Largeur CSS dessinée (`churn_pct`) | Valeur affichée (`Churn=0`) | Largeur CSS dessinée (`retained_pct`) | Distorsion visuelle (*Lie Factor*) |
       | :--- | :---: | :---: | :---: | :---: | :--- |
       | **1. Headshots sous Stun** | `84.5%` | `84.5%` | `47.3%` | `47.3%` | Échelle exacte (1:1) |
       | **2. Temps Passé Mort (Écran Gris)** | **`17.8%`** | **`78.0%`** ⚠️ | **`9.6%`** | **`42.0%`** ⚠️ | **Exagérée ×4.38 !** (`17.8%` est dessiné presque aussi large que `84.5%`, et `9.6%` est dessiné plus large que `36.8%` du biomarqueur #5 !) |
       | **3. Isolement Social Solo** | `82.4%` | `82.4%` | `41.2%` | `41.2%` | Échelle exacte (1:1) |
       | **4. Revente Panique (Rage-Sell)** | **`28.6%`** | **`75.0%`** ⚠️ | **`3.4%`** | **`12.0%`** ⚠️ | **Exagérée ×2.62 (Churn) et ×3.53 (Retained) !** (`28.6%` a une barre plus courte que `17.8%` ci-dessus, et le ratio visuel des barres est `6.25×` au lieu du `×8.4` annoncé !) |
       | **5. Soutien aux Coéquipiers** | `14.2%` | `14.2%` | **`36.8%`** | **`36.8%`** ⚠️ | Échelle 1:1, ce qui fait que **`36.8%` apparaît deux fois plus petit que `17.8%` (`78%`) et même plus petit que `9.6%` (`42%`)** dans la même carte ! |
     - **Pourquoi c'est problématique** : Les 5 pistes `.lab-bar-track` sont empilées verticalement dans la même carte avec le même fond de jauge `0% – 100%`. Voir une barre étiquetée `17.8%` remplir `78%` de la jauge alors qu'une barre étiquetée `36.8%` trois lignes plus bas n'en remplit que `36.8%` fausse complètement la lecture comparative.
     - **Solution DataViz** : Soit utiliser une échelle `0% – 100%` cohérente partout, soit — pour les métriques à faible valeur nominale comme l'Écran Gris (`0% – 25%`) ou le Rage-Sell (`0% – 35%`) — afficher explicitement l'étendue maximale de l'axe local (`Échelle locale : 0 – 25%`) et conserver **strictement le même multiplicateur** pour `Churn=1` et `Churn=0` afin que le ratio des longueurs de barres respecte le ratio mathématique ($\frac{28.6}{3.4} = 8.41$).
  2. 🟠 **Divergence des chiffres entre la Page 1 (`MOCK_HIDDEN_GEMS_AUDIT`) et la Page 2 (`SOURCE2_BIOMARKERS`)** :
     - Les deux sections disent citer le même fichier `deadlock_churn_dataset.csv (N = 10 000)`, mais affichent des chiffres différents pour les mêmes variables (ex. Écran Gris : `14.2% vs 13.3% (+6.7%)` en Page 1 contre `17.8% vs 9.6% (+85.4%)` en Page 2 ; Headshots sous Stun : `+72.3%` en Page 1 contre `+78.6%` en Page 2). Si la Page 1 cite la moyenne sur les 20 matchs de la fenêtre glissante et la Page 2 cite la sous-cohorte des replays profonds ($N = 397$) ou le match pivot $T$ seul, il faut l'indiquer explicitement dans le sous-titre.

### 5.3. Module 02 (`#lab-step-2`) — Matrice Interactive 2D & Autopsie des Héros
- **Ce qui a été fait** :
  - À gauche : Scatter plot SVG (`viewBox="0 0 640 360"`) croisant le *Taux de Churn Réel du Héros (%)* en X (`15%` à `65%`) et le *Temps d'Écran Gris (%)* en Y (`8%` à `19%`), avec 2 zones rectangulaires annotées (*Zone de Rage-Quit* en haut à droite, *Sanctuaire de Rétention* en bas à gauche) et les bulles d'avatars de héros cliquables.
  - À droite : Carte *Spotlight Autopsie du Héros* avec sélecteur rapide par pilules, 4 compteurs HUD et 4 boîtes structurées (*Fantasme du Joueur*, *Piège/Avantage du Kit*, *Erreur d'Achat en Tilt*, *Impact sur la Rétention*).
  - En bas : Grille des 4 héros les plus punitifs (`Yamato`, `Vindicta`, `Lash`, `Seven`) + Bannière et grille pliable des 3 Ancres de Rétention (`Abrams`, `Pocket`, `Dynamo`).
- **Points positifs** :
  - Le couplage interactif entre les bulles du scatter plot, les pilules du spotlight et les boutons `Inspecter [Héros] dans la Matrice ↗` au bas des cartes détaillées est très bien pensé.
  - La structuration narrative de chaque héros en 4 temps (*Fantasme* → *Piège mécanique* → *Erreur d'achat en tilt* → *Pourquoi le joueur part/reste*) est remarquablement claire.
- **Points négatifs & Bugs Visuels SVG (10 collisions mesurées par CDP + 2 collisions supplémentaires quand le backend est en ligne dans [ItemsSection.jsx:925-1086](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/ItemsSection.jsx#L925-L1086))** :
  1. 🔴 **Débordement hors du SVG du titre de la Zone Rouge (`ItemsSection.jsx:933`)** :
     - `<text x="342" y="45" ...>ZONE DE RAGE-QUIT & RUPTURE (>40% Churn, Morts Répétées)</text>` mesure `~336px` de large (`x = 342` → `678`), dépassant la boîte rouge (`x_right = 615`) de **63px** et sortant complètement du `viewBox="0 0 640 360"` de **38px** sur la droite !
  2. 🔴 **Superposition directe entre le titre `SANCTUAIRE DE RÉTENTION...` et les badges de `Dynamo 20%` et `Victor 23%` (`ItemsSection.jsx:939`)** :
     - Le texte `SANCTUAIRE DE RÉTENTION (<25% Churn, Kits Indulgents)` est placé à `x="72" y="220"` (en haut du rectangle vert `y="200"`), exactement à la hauteur (`y ≈ 216–224`) où s'affichent les cartouches nominatifs de `Dynamo 20%` (`overlap: 51px × 7px`) et `Victor 23%` (`overlap: 51px × 10px`), et déborde en prime de **72px** hors du rectangle vert (`x_right = 320`) !
  3. 🔴 **Collision entre le titre vertical de l'axe Y et les graduations `12% Mort` / `15% Mort` (`ItemsSection.jsx:965` & `980`)** :
     - Les graduations Y (`9% Mort`, `12% Mort`, `15% Mort`, `18% Mort`) sont ancrées à `x="52" textAnchor="end"`, s'étendant vers la gauche jusqu'à `x ≈ 4`.
     - Le titre vertical de l'axe Y (`Temps d’Écran Gris (Inactivité & Mort %) →`) est centré à `x="16"`, chevauchant directement les mots `12% Mort` et `15% Mort` (`overlap: 13px × 13px`).
  4. 🔴 **Collisions multiples des cartouches nominatifs des héros dans le cluster de rétention et en zone critique (`ItemsSection.jsx:1060-1082`)** :
     - En mode offline (`11` héros dans `MOCK_HERO_CHURN_ANALYTICS`), 5 héros sont concentrés entre `18.2%` et `23.1%` de churn et entre `9.8%` et `10.8%` d'écran gris (`Abrams 18%`, `Pocket 19%`, `Dynamo 20%`, `Kelvin 22%`, `Victor 23%`), plus `Yamato 60%` et `Ivy 56%` en haut à droite. Comme chaque bulle affiche en permanence un cartouche rectangulaire rigide de `76px × 16px` juste au-dessus d'elle (`cy - r - 7`), ces cartouches s'empilent les uns sur les autres (`overlapX` allant jusqu'à `40px` entre `Pocket 19%` et `Dynamo 20%`).
     - **En mode Online (`13` héros renvoyés par `GET /api/items/churn-analytics` dans [items.py:698-975](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/backend/app/api/routers/items.py#L698-L975))** : Le backend ajoute **`Haze` (`50.0%` churn, `11.7%` écran gris)** et **`Bebop` (`46.2%` churn, `14.3%` écran gris)**. `Bebop` (`cx = 406.3, cy = 146.0`) tombe à seulement `32px` de `Seven` (`cx = 344.4, cy = 138.0`), provoquant une **collision supplémentaire de 44px** entre les cartouches `Seven 42%` et `Bebop 46%` ! Et comme `Haze` et `Bebop` n'existent pas dans `MOCK_HERO_CHURN_ANALYTICS`, leurs cartes Spotlight n'ont ni `gameplay_fantasy_fr` ni `tilt_spiral_fr` et affichent le fallback générique `"Rush d'items offensifs sans Vitality."` ([ItemsSection.jsx:1246](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/ItemsSection.jsx#L1246)).

### 5.4. Module 03 (`#lab-step-3`) — Carte Tactique 2D (`DeadlockMapHeatmap.jsx`)
- **Ce qui a été fait** : Carte vectorielle officielle de Deadlock (`/images/deadlock_map_dark.svg`) surmontée d'un `<canvas width="1350" height="1350">` dessinant des gradients thermiques radiaux translucides pour `Morts des Héros` (850 pts, rouge rubis) ou `Déconnexions & Ragequits` (400 pts, cyan/violet), avec filtre par héros, double curseur temporel (`0 – 45m`), 4 presets de phase et un bouton de simulation animée `0 – 10 min en 6.0s` (mode *Vague Mobile* ou *Cumulatif*), accompagnés d'un panneau latéral de statistiques spatiales et d'un tooltip au survol.
- **Points positifs** :
  - Le rendu thermique atténué (`globalCompositeOperation = 'source-over'` sans brûlure blanche pure) préserve admirablement la lisibilité des 4 voies et des bâtiments de la carte en arrière-plan.
  - Le mode *Vague Mobile* (`simMode === 'wave'`, fenêtre glissante de 2.2 min) pendant la simulation de 6 secondes rend réellement visible le déplacement géographique des combats des Gardiens T1 vers les Walkers T2 et les Fontaines.
- **Points négatifs & Bugs DataViz / UX** :
  1. 🟠 **Contradiction des taux de churn par héros entre le Module 02 et le Module 03 de la même Page 2 ([DeadlockMapHeatmap.jsx:44-54](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/DeadlockMapHeatmap.jsx#L44-L54) vs [ItemsSection.jsx / mockData.js:2233-2497](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/data/mockData.js#L2233-L2497))** :
     - Dans la barre de filtres de `DeadlockMapHeatmap.jsx`, `heroList` redéfinit en dur des taux de churn différents de ceux du Module 02 :
       - `Infernus` affiche **`34.5%`** dans le Module 03 contre **`41.7%`** dans le Module 02 !
       - `Seven` affiche **`42.1%`** (contre **`41.7%`**), `Vindicta` **`45.2%`** (contre **`44.8%`**), `Lash` **`36.4%`** (contre **`35.7%`**), `Pocket` **`19.4%`** (contre **`18.8%`**), `Dynamo` **`18.9%`** (contre **`20.0%`**) !
  2. 🟠 **Positionnement du Tooltip au survol pouvant être coupé sur mobile (`DeadlockMapHeatmap.jsx:797`)** :
     - Le tooltip utilise `left: Math.min(mousePos.x + 14, 380)` avec `width: '240px'`. Sur un écran mobile de `320px` ou `375px` où le conteneur de la carte fait `~280px` à `335px` de large, `Math.min(mousePos.x + 14, 380)` ne plafonne `left` qu'à `380px`, ce qui fait que si l'utilisateur touche la moitié droite de la carte (`mousePos.x = 200`), le tooltip de `240px` (`200 + 14 + 240 = 454px`) est tronqué par `overflow: hidden` du conteneur de la carte !
  3. 🟠 **Seuil de détection au survol (`minDist = 50` en coordonnées `1350×1350`) trop étroit sur mobile ([DeadlockMapHeatmap.jsx:324](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/DeadlockMapHeatmap.jsx#L324))** :
     - `50px` dans l'espace `1350×1350` représente seulement `~11px` sur un écran mobile de `300px` de large, rendant la sélection au doigt imprécise. Adapter le rayon de capture à `50 * (1350 / rect.width)` garantit un rayon constant de `25px` écran sur tous les appareils.

### 5.5. Module 04 (`#lab-step-parry`) — Biomécanique du Parry & Ragequit
- **Ce qui a été fait** : Bannière de verdict causal avec 4 pods monumentaux (`+795% Sur-risque de Ragequit`, `4.0s Stun & Désarmement`, `88.4% Mortalité immédiate`, `46.8% Ragequit direct avec Spirit Strike`), 3 cartes analytiques (*Piège Cognitif Spirit Strike*, *Exécution sans Riposte*, *Effondrement Neuromusculaire APM -44.1%*), matrice empirique à 4 niveaux d'exposition (`0`, `1`, `>=2 parades`, `>=2 parades + Spirit Strike`) et 2 cartes de contre-mesures (*Game Sense Joueur* & *Matchmaking Éthique Valve*).
- **Points positifs** :
  - C'est l'un des modules les mieux structurés et les plus convaincants de tout le site. La hiérarchie visuelle entre la bannière de synthèse, les 3 mécanismes causaux, la table de preuve empirique et les recommandations actionnables est exemplaire.
- **Incohérence interne mineure & Amélioration DataViz suggérée** :
  - **Légère divergence mathématique entre la Carte 3 et la Table juste en dessous ([ItemsSection.jsx:1896 vs 1940, 1972, 1988](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/ItemsSection.jsx#L1896))** : Le pied de la Carte 3 indique `-44.1% (112 → 62 APM)` (or $(62-112)/112 = -44.6\%$), tandis que la table juste en dessous part de **`114 APM`** (0 parade) → `98 APM (-14%)` (1 parade) → `69 APM (-38%)` (or $(69-114)/114 = -39.5\%$) → `62 APM (-44.1%)` (or $(62-114)/114 = -45.6\%$). Aligner la baseline sur `111 APM` (`111 → 62 APM = -44.1%`) ou corriger les pourcentages (`114 → 62 APM = -45.6%`) rendra la table irréprochable.
  - **Enrichissement visuel** : Ajouter des mini-barres de progression inline dans les cellules des colonnes *Ragequit Immédiat* (`3.8%` → `9.4%` → `34.2%` → `46.8%`) et *Taux Churn 14j* (`18.2%` → `28.5%` → `59.4%` → `71.4%`) de `.lab-parry-table` permettra de visualiser instantanément l'effet de seuil non-linéaire à $\ge 2$ parades.

---

## 6. Audit Détaillé — Page 3 : Espace ITEM (`items`)

### 6.1. Architecture Globale de la Page 3 (`ItemTelemetrySection.jsx`)
- **Ce qui a été fait** :
  - **Étage 1** : Header éditorial court aligné sur les Pages 1 & 2 + navigation croisée.
  - **Étage 2** : Grille de 4 Macro KPI Cards avec icônes d'assets officiels (`49.0% Spirit Strike & Glass Cannon`, `89.7% Cultist Sacrifice & Rescue Beam`, `60.0% Yamato, Ivy & Seven`, `81.8% Abrams, Pocket & Dynamo`).
  - **Étage 3** : Hub encadré à 2 grands modules (`[MODULE 01 Frise Séquentielle & 4 Schémas]` et `[MODULE 02 Catalogue Compact & Inspecteur IA]`) + légende officielle des 4 couleurs de slots (`Weapon`, `Vitality`, `Spirit`, `Souls`).
- **Points positifs** :
  - La cohérence visuelle avec la Page 2 est totale. L'intégration des véritables icônes d'objets et d'avatars de héros avec lueur sémantique donne un cachet très professionnel.

### 6.2. Module 01 (`#item-step-timelines`) — Frise Séquentielle par Phases & 4 Schémas d'Erreurs
- **Ce qui a été fait** : Sélecteur de 5 séquences réelles enregistrées (`Vindicta`, `Lash`, `Infernus`, `Yamato`, `Abrams / Dynamo`), carte de synthèse avec **Jauge d'Équilibre du Build (`Weapon / Vitality / Spirit`)**, grille chronologique en **3 colonnes de phases (`PHASE 01 • 0M – 8M`, `PHASE 02 • 8M – 18M`, `PHASE 03 • 18M+`)** contenant les cartes-nœuds numérotées (`#1` → `#N`) reliées par des flèches verticales `↓`, inspecteur détaillé du nœud sélectionné en dessous, et grille 2×2 des 4 schémas cognitifs d'erreurs d'achat.
- **Points positifs** :
  - **Zéro collision garantie** : Le remplacement d'un axe temporel continu en `position: absolute` par une grille à 3 colonnes de phases en Flexbox vertical élimine 100% des chevauchements d'objets achetés à quelques secondes d'intervalle (`3m05s` et `3m48s`), sur desktop comme sur mobile `320px`.
- **Points négatifs & Bugs DataViz / UX** :
  1. 🔴 **Dissonance cognitive entre le badge de rang séquentiel `#k` et le texte `(14e item !)` / `(15e Item)` ([ItemTelemetrySection.jsx:41-125, 271-274](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/ItemTelemetrySection.jsx#L41-L125))** :
     - Dans `PURCHASE_SEQUENCES`, chaque séquence ne contient que **6 à 9 nœuds clés échantillonnés** sur l'ensemble du match, mais `sequencePhases` les numérote avec `orderRank: index + 1` (`#1`, `#2`, ..., `#9`).
     - **Résultat contradictoire affiché à l'écran** :
       - Sur `Vindicta` : Le pod en haut annonce `1er Item Vitality : 30.0 min (14e item !)`, le résumé parle de *« 13 items offensifs achetés consécutivement »*, le nœud `#7 Sharpshooter` dit `10e item offensif`, le nœud `#8 Glass Cannon` dit `13e offensif`, et le nœud `Extra Stamina (1er Vitality !)` porte le badge **`#9`** (alors que c'est le `14e item`) !
       - Sur `Yamato` : Le nœud à `29m 14s` affiche côte à côte le badge **`#6`** et le nom **`Bullet Resilience (15e Item)`** (`#6 Bullet Resilience (15e Item)`) !
       - Sur `Lash` : Le pod en haut dit `14.2 min (après 8 items offensifs)`, mais `Restorative Locket (1er Vitality)` porte le badge **`#6`** après seulement 5 nœuds affichés !
     - **Solution** : Ajouter une propriété explicite `realOrderRank` sur chaque nœud de `PURCHASE_SEQUENCES` (ex. `#1`, `#2`, `#3`, `#4`, `#5`, `#7`, `#10`, `#13`, `#14` sur Vindicta) afin que le badge `#k` reflète le véritable rang d'achat dans le match !
  2. 🟠 **Jauge d'Équilibre du Build (`buildBalance`) calculée en nombre de nœuds échantillonnés au lieu du coût en Souls ([ItemTelemetrySection.jsx:308-323](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/ItemTelemetrySection.jsx#L308-L323))** :
     - Sur `Vindicta`, `Extra Stamina` coûte **500 Souls** à 30m02s contre **15 200 Souls** dépensées en items offensifs (`Glass Cannon` 6 200, `Sharpshooter` 3 000, etc.).
     - En comptant les nœuds échantillonnés (`1 / 9`), la jauge affiche **`Vitality : 1 (11%)`**, alors qu'en poids économique réel (Souls investies), la part Vitality n'est que de **`3.2%` (`500 / 15 700 Souls`)** (et `0%` jusqu'à la 30e minute) ! Afficher la répartition en **% de Souls investies** (ou afficher les deux : `% items` et `% Souls`) rendrait la démonstration du syndrome *Canon de Verre* beaucoup plus rigoureuse.

### 6.3. Module 02 (`#item-step-catalog`) — Catalogue Compact & Inspecteur Latéral IA
- **Ce qui a été fait** : Barre de filtres (`TOUS LES ITEMS`, `WEAPON`, `VITALITY`, `SPIRIT` + recherche texte + tri par taux de churn, coût ou timing), layout split-screen (`.dl-catalog-split-layout`) avec grille de cartes compactes à gauche (texte intégral non tronqué) et inspecteur latéral sticky à droite (`top: 96px`) affichant une barre bicolore `Churn vs Rétention`, 4 pods `2×2` (`Timing Moyen`, `Rang d'Achat`, `Coût Boutique`, `Sur-Index Churn`), l'*Autopsie Comportementale S2* et la *Prescription IA Anti-Tilt*.
- **Points positifs** :
  - L'inspecteur latéral sticky sur desktop est un excellent pattern UI : pas de modale intrusive, comparaison instantanée en cliquant d'une carte à l'autre.
- **Points négatifs & Bugs DataViz / UI** :
  1. 🔴 **Écart vérifié entre les « 54 Items Source 2 » annoncés et les `21` items réellement présents (aussi bien en Offline qu'en Online !)** :
     - Les badges du Header ([ItemTelemetrySection.jsx:543](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/ItemTelemetrySection.jsx#L543)) et du Hub Module 02 (lignes 863, 872) annoncent **`54 Items Source 2`** (`54 ITEMS • IA`).
     - Notre vérification du backend ([backend/app/api/routers/items.py:270-694](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/backend/app/api/routers/items.py#L270-L694)) et du frontend ([mockData.js:1807-2231](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/data/mockData.js#L1807-L2231)) prouve que `ITEM_CHURN_ANALYTICS` dans FastAPI et `MOCK_ITEM_CHURN_ANALYTICS` dans React contiennent tous deux **exactement les mêmes 21 items** (7 Weapon, 7 Vitality, 7 Spirit), et que `/api/items/churn-analytics` renvoie `"total_items_analyzed": 21` !
     - Annoncer `54 Items` dans 4 titres et badges différents alors que la grille n'en affiche que `21` donne l'impression d'un chargement incomplet. Il faut afficher `21 Items Clés Autopsiés (extraits des 54 Items Source 2)` + un compteur dynamique `${filteredItems.length} / ${raw.length} items affichés`.
  2. 🔴 **Tri « Timing Moyen d'Achat (`time_asc`) » mathématiquement inexact ([ItemTelemetrySection.jsx:367](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/ItemTelemetrySection.jsx#L367))** :
     - Lorsque l'utilisateur sélectionne le tri **`Timing Moyen d'Achat`** (`value="time_asc"`), la fonction de tri exécute :
       ```js
       if (itemSort === 'time_asc') return (a.avg_order_rank ?? 0) - (b.avg_order_rank ?? 0);
       ```
     - Elle trie par **`avg_order_rank`** (avec ex-aequo non résolus) au lieu de parser **`avg_buy_time`** (`"8m 14s"` → `494s`) !
     - **Conséquence** : `Spirit Strike` (`avg_order_rank: 5`, acheté à **`8m 14s`**), `Hollow Point Ward` (`avg_order_rank: 5`, acheté à **`9m 20s`**) et `Cultist Sacrifice` (`avg_order_rank: 5`, acheté à **`11m 01s`**) ont le même rang `5`, et `Restorative Locket` (`avg_order_rank: 6`, acheté à **`10m 15s`**) est classé **après** `Cultist Sacrifice` (`11m 01s`), alors que `10m 15s < 11m 01s` ! De même, `Toxic Bullets` (`19m 49s`, rang `11`) est classé après `Majestic Leap` (`20m 37s`, rang `10`) !
  3. 🟠 **Incohérence de couleur entre le badge de risque (4 niveaux) et la barre de churn (binaire `< 40%`) sur les cartes du catalogue ([ItemTelemetrySection.jsx:400-428 vs 1303-1388](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/ItemTelemetrySection.jsx#L1303-L1388))** :
     - Le badge en haut à droite de chaque carte utilise `getItemRiskMeta(churnPct)` à 4 couleurs :
       - `>= 44%` : Rouge (`--ml-churn`, *Piège de Tilt*)
       - `38% – 43.9%` : Jaune Chartreuse (`--ml-warning`, *Rush Cupide* — **8 items du catalogue** sont dans cette tranche : `Toxic Bullets 43.8%`, `Crippling Headshot 43.8%`, `Arcane Surge 43.3%`, `Refresher 43.1%`, `Spirit Snatch 42.9%`, `Hollow Point Ward 42.4%`, `Bullet Resist Shredder 42.0%`, `Torment Pulse 41.5%`)
       - `22.1% – 37.9%` : Cyan (`--dl-souls`, *Équilibré* — `Monster Rounds 25.6%`)
       - `<= 22%` : Vert Menthe (`--ml-retention`, *Ancre de Rétention*)
     - Mais la barre de progression et le chiffre en grand au milieu de la carte utilisent `const isHighRisk = churnPct >= 40;` (binaire Rouge `>= 40%` vs Vert Menthe `< 40%`) !
     - **Résultat** : Les 8 items badgés **`Rush Cupide` en Jaune Chartreuse** ont leur barre et leur chiffre colorés en **Rouge (`--ml-churn`)**, et `Monster Rounds` (`25.6%` de churn, badgé **`Équilibré` en Cyan**) a sa barre et son chiffre colorés en **Vert Menthe Rétention** ! Utiliser directement `risk.color` pour la barre aligne parfaitement les 4 niveaux du badge et de la jauge.
  4. 🟠 **Sur mobile/tablette (`< 1120px`), cliquer sur une carte en haut du catalogue met à jour l'inspecteur tout en bas de la grille sans retour visuel ([index.css:7415-7419](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/index.css#L7415-L7419))** :
     - À `< 1120px`, `.dl-catalog-split-layout` passe en 1 colonne (`grid-template-columns: 1fr`), plaçant l'inspecteur `<aside className="dl-catalog-inspector-card">` **tout en bas, après les 21 cartes du catalogue**.
     - Lorsqu'un utilisateur sur mobile ou tablette clique sur la 1re ou la 2e carte (`Spirit Strike` ou `Glass Cannon`), l'inspecteur se met à jour 3 000 pixels plus bas hors de l'écran, sans que l'utilisateur ne s'en aperçoive.

---

## 7. Audit des Composants Transverses (Modales, Tiroirs, Footer & Composants Orphelins)

1. **`AboutDeadlockModal.jsx` — Rupture de récit scientifique avec le reste du site ([AboutDeadlockModal.jsx:142-151](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/AboutDeadlockModal.jsx#L142-L151))** :
   - Le 2e paragraphe de la modale « C'est quoi Deadlock & le Projet ? » affirme :
     > *« Ce projet modélise les **48 features clés** extraites de la télémétrie Valve GC [...] L'algorithme **V1 XGBoost** anticipe **l'issue du match dès 10 minutes avec 81.4% de ROC-AUC**... »*
   - C'est une confusion avec un ancien objectif de *Match Outcome Prediction* (prédire la victoire à 10 min) alors que l'ensemble du site prédit le **Player Churn à 14 jours** avec **106 features (dont les 7 Gemmes Cachées)** !
   - De plus, lorsque l'utilisateur ouvre `AboutDeadlockModal` depuis la **Page 2** ou la **Page 3** et clique sur le bouton d'action **`Tester le Simulateur`** ([AboutDeadlockModal.jsx:49-55](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/AboutDeadlockModal.jsx#L49-L55)), `handleGoSimulator()` cherche `document.querySelector('#archetypes')` qui n'est pas monté dans le DOM (car on n'est pas sur `activePage === 'main'`), donc **la modale se ferme et il ne se passe strictement rien** !
2. **`DictionaryDrawer.jsx` & `dictionaryData.js` — Contradictions internes dans les définitions du lexique ([dictionaryData.js:111, 157-160, 219](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/data/dictionaryData.js#L151-L221))** :
   - La carte **`Score ROC-AUC`** (`id: 'roc_auc'`, lignes 157-160) définit le ROC-AUC comme *« la capacité à séparer les parties gagnées des parties perdues [...] Notre modèle champion atteint 81.42% ROC-AUC à la 10e minute de jeu »* (au lieu de séparer les churners des joueurs fidélisés avec `67.3%` / `77.1%` ROC-AUC !).
   - La carte **`Taux de Churn`** (`id: 'churn'`, ligne 219) affirme : *« Le taux de churn naturel de la cohorte est de **32.3%** »*, alors que `MOCK_METRICS` et `ml_results.json` indiquent **`24.26%`** (`churn_rate: 0.2426`) et que `ArchitectureSection` indique **`49.6%`**.
   - La carte **`Perte de Guardian Précoce (< 8 min)`** (`id: 'early_guardian'`, ligne 229) l'appelle *« Gemme Cachée #1 Source 2 »*, alors que dans `PsychologySection` et `mockData.js`, la Gemme Cachée #1 est *« Le Bouclier Social (Série d'Isolement Solo) »*.
   - Dans `Navbar.jsx:874`, le sous-titre du bouton Dictionnaire annonce *« 21 termes e-sport & ML définis »*, mais `DictionaryDrawer` n'en affiche que **`17`** (`DICTIONARY_TERMS.length === 17`).
3. **`Footer.jsx` — Contradiction entre l'avis d'anonymisation et les liens nominatifs ([Footer.jsx:71-101](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/Footer.jsx#L71-L101) & [translations.js:1290-1293](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/translations.js#L1290-L1293))** :
   - Sur la même barre inférieure du Footer, la colonne de gauche affiche : *« Sécurité & Confidentialité : Code source strictement anonymisé pour hébergement public GitHub (zéro identifiant personnel) »*, tandis que la colonne de droite affiche simultanément : *« Matthieu Gout • Projet Personnel 2026 »* avec les liens `linkedin.com/in/matthieu-gout` et `github.com/ofggout880`. Il convient de reformuler l'avis de confidentialité pour préciser qu'il concerne l'**anonymisation des joueurs Steam de la cohorte** (*zéro donnée personnelle des joueurs ni clé API*), et non l'auteur du portfolio.
4. **Composants et données orphelins (Dead Code) dans `frontend/src/`** :
   - `frontend/src/components/AnimatedHeading.jsx` (qui importe `spring-text-engine`) et `frontend/src/components/AboutDotaModal.jsx` ne sont importés nulle part dans l'application.
   - `MOCK_SOUL_CURVES` et `MOCK_ITEMS_DATA` dans `frontend/src/data/mockData.js` ne sont utilisés par aucun composant.

---

## 8. Catalogue des Correctifs Concrets (Code JSX, SVG & CSS Prêts à l'Emploi)

Voici les snippets de remplacement exacts permettant de corriger les bugs visuels, responsive et de Data Visualization identifiés dans ce rapport.

### Correctif #1 — Ajouter les classes CSS manquantes dans `frontend/src/index.css`
À insérer dans `frontend/src/index.css` juste après `.badge-neutral` (ligne 508) et `.btn-secondary` (ligne 575) :

```css
/* Ajout des classes de badges manquantes utilisées dans KpiBar, Navbar, Heatmap & Simulator */
.badge-cyan {
  background: var(--dl-souls-bg);
  color: var(--dl-souls);
  border: 1px solid var(--dl-souls-border);
}

.badge-chem,
.badge-chem-bright {
  background: var(--ml-retention-bg);
  color: var(--ml-retention);
  border: 1px solid var(--ml-retention-border);
}

/* Ajout de .btn, .btn-ghost et .btn-sm utilisés dans PsychologySection, DeadlockMapHeatmap & DictionaryDrawer */
.btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid transparent;
  transition: background-color var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.12);
}

.btn-sm {
  padding: 0.45rem 0.9rem;
  min-height: 34px;
  font-size: 0.8125rem;
}

/* Encadré de recommandation du simulateur de Tilt (PsychologySection.jsx:641) */
.tilt-recommendation-box {
  background: rgba(16, 185, 129, 0.07);
  border: 1px solid rgba(16, 185, 129, 0.28);
  border-radius: var(--radius-md);
  padding: 1rem 1.25rem;
}

.tilt-recommendation-box .recommendation-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 0.875rem;
  color: var(--text-heading);
  margin-bottom: 0.35rem;
}

.tilt-recommendation-box .recommendation-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.55;
}

/* Animation radar pulsante pour le pic de Tilt du HeroSection (HeroSection.jsx:245) */
@keyframes pingRadar {
  75%, 100% {
    transform: scale(1.85);
    opacity: 0;
  }
}

.animate-ping {
  transform-box: fill-box;
  transform-origin: center;
  animation: pingRadar 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
}
```

### Correctif #2 — Corriger `RiskGauge.jsx` pour dynamiser les étiquettes selon `threshold` et aligner `SimulatorSection.jsx`
Dans [RiskGauge.jsx:43-67](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/RiskGauge.jsx#L43-L67), remplacer les valeurs `"36%"` codées en dur par `thPct` calculé depuis la prop `threshold` :

```jsx
  const th = Math.max(0.01, Math.min(0.99, typeof threshold === 'number' && !isNaN(threshold) ? threshold : 0.36));
  const thPct = Math.round(th * 100);
  const thPctFixed = (th * 100).toFixed(1);

  // Determine active risk tier dynamically matching `th`
  let tierKey = 'low';
  let tierColor = '#10b981';
  let tierGlowClass = 'glow-emerald';
  let badgeClass = 'badge-emerald';
  let tierLabel = isFr ? `Faible (< ${thPct}%)` : `Low (< ${thPct}%)`;
  let statusText = isFr ? 'Fidélisé — Maintien Standard' : 'Retained — Standard Play';

  if (p >= 0.60) {
    tierKey = 'critical';
    tierColor = '#ef4444';
    tierGlowClass = 'glow-rose';
    badgeClass = 'badge-rose';
    tierLabel = isFr ? 'Critique (> 60%)' : 'Critical (> 60%)';
    statusText = isFr ? 'Alerte Churn — Intervention Recommandée' : 'Churn Alert — Intervention Recommended';
  } else if (p >= th) {
    tierKey = 'moderate';
    tierColor = '#d8ec57';
    tierGlowClass = 'glow-amber';
    badgeClass = 'badge-amber';
    tierLabel = isFr ? `Modéré (${thPct}% - 60%)` : `Moderate (${thPct}% - 60%)`;
    statusText = isFr ? "Vigilance — Risque d'Érosion" : 'Watchlist — Erosion Risk';
  }
```
Et aux lignes 289, 401 et 404 de `RiskGauge.jsx` :
- Remplacer `θ* = 36%` par `θ* = {thPct}%` et `(θ* = 36.0%)` par `(θ* = {thPctFixed}%)`,
- Remplacer `color: diffFromThreshold >= 0 ? 'var(--accent-orange)' : 'var(--accent-emerald)'` par `color: diffFromThreshold >= 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)'`,
- Passer `threshold={0.36}` dans [SimulatorSection.jsx:807](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/SimulatorSection.jsx#L807) pour rester cohérent avec les seuils des 4 archétypes (`0.28 < 0.36` = Faible).

### Correctif #3 — Réparer la Table d'Ablation sur Mobile (`< 1023px`) et synchroniser Courbe ROC/PR, Matrice de Confusion & `FeatureImportanceChart` dans `MlBenchmarkSection.jsx`
1. **Ajouter les attributs `data-label` manquants sur les `<td>` de la Table d'Ablation ([MlBenchmarkSection.jsx:202-246](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/MlBenchmarkSection.jsx#L202-L246))** et traduire ses en-têtes en anglais :
```jsx
<thead>
  <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)' }}>
    <th style={{ padding: '0.65rem 0.75rem', color: 'var(--text-muted)' }}>{isFr ? 'Domaine Testé' : 'Tested Domain'}</th>
    <th style={{ padding: '0.65rem 0.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Features</th>
    <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>ROC-AUC</th>
    <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>PR-AUC</th>
    <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{isFr ? 'Rappel' : 'Recall'}</th>
    <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{isFr ? 'Écart Train/Test' : 'Overfit Gap'}</th>
    <th style={{ padding: '0.65rem 0.75rem', color: 'var(--text-muted)' }}>{isFr ? 'Verdict Scientifique' : 'Scientific Verdict'}</th>
  </tr>
</thead>
```
(avec `data-label={isFr ? 'Domaine Testé' : 'Tested Domain'}`, `data-label="Features"`, `data-label="ROC-AUC"`, `data-label="PR-AUC"`, `data-label={isFr ? 'Rappel' : 'Recall'}`, `data-label={isFr ? 'Écart Train/Test' : 'Overfit Gap'}`, `data-label={isFr ? 'Verdict' : 'Verdict'}` sur les 7 `<td>`).

2. **Dans `ConfusionMatrixHeatmap` ([MlBenchmarkSection.jsx:628-629](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/MlBenchmarkSection.jsx#L628-L629))**, utiliser `interpolateAtThreshold(threshold)` au lieu de la formule exponentielle divergente :
```jsx
  const interpolated = interpolateAtThreshold(threshold);
  const recall = interpolated.recall;
  const fpr = interpolated.fpr;
```

3. **Dans `FeatureImportanceChart` ([MlBenchmarkSection.jsx:894-909](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/MlBenchmarkSection.jsx#L894-L909))** :
   - Ajuster `maxVal` dynamiquement : `const maxVal = Math.max(0.12, ...items.map(i => i.importance * 1.15));` (soit `~12%` au lieu de `35%`, avec des graduations `[0, 0.03, 0.06, 0.09, 0.12]`), ce qui permet aux barres d'occuper **85% de la largeur utile du graphique** !
   - Ajouter `{ id: "hidden_gems", labelFr: "💎 7 Gemmes Cachées S2", labelEn: "💎 7 S2 Hidden Gems" }` dans `FEATURE_CATEGORIES` (`mockData.js:1629`) et mapper toutes les catégories réelles dans `getCategoryColor` :
```jsx
  const getCategoryColor = (category) => {
    switch (category) {
      case 'hidden_gems':
        return 'var(--accent-chem-bright)'; // Vert menthe Statlocker
      case 'economy':
        return 'var(--dl-souls)';           // Cyan Souls
      case 'psychology':
        return 'var(--ml-churn)';           // Rouge/Rose Tilt
      case 'combat':
        return 'var(--dl-weapon)';          // Orange cuivré Weapon/Combat
      case 'aim':
        return 'var(--dl-spirit)';          // Violet Spirit/Visée 3D
      default:
        return 'var(--accent-emerald)';
    }
  };
```

### Correctif #4 — Éliminer les 12 collisions SVG de la Matrice Héros (Offline & Online) dans `ItemsSection.jsx`
Dans [ItemsSection.jsx:925-1086](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/ItemsSection.jsx#L925-L1086), remplacer la géométrie du `<svg viewBox="0 0 640 365">` par :
1. Une marge gauche `padLeft = 78` (au lieu de `60`) pour séparer le titre vertical de l'axe Y (`x="14"`) des graduations `9%` à `18%` (`x="70"`),
2. Un ancrage intérieur propre pour les titres de zones (`x="610" textAnchor="end"` en haut à droite pour la zone de Rage-Quit, et `x="88" y="306"` **en bas** du rectangle vert pour le Sanctuaire de Rétention, hors de portée des bulles),
3. Un placement intelligent (`placeLabelBelow` + `labelDx`) incluant `Pocket`, `Kelvin`, `Ivy`, `Bebop` et `Haze` pour éviter toute collision aussi bien en mode Offline (11 héros) qu'en mode Online (13 héros) :

```jsx
<svg
  viewBox="0 0 640 365"
  style={{ width: '100%', height: 'auto' }}
  role="img"
  aria-label="Hero Churn Rate vs Grey Screen Frustration Scatter Plot"
>
  {/* Top-Right: Critical Rage-Quit Zone */}
  <rect x="345" y="22" width="275" height="175" rx="8" fill="rgba(239, 68, 68, 0.08)" stroke="rgba(239, 68, 68, 0.28)" strokeDasharray="4 4" />
  <text x="610" y="40" fill="var(--accent-rose)" fontSize="9.5" fontWeight="800" textAnchor="end" fontFamily="var(--font-mono)">
    {isFr ? 'ZONE RAGE-QUIT (>40% Churn, Morts Répétées)' : 'RAGE-QUIT ZONE (>40% Churn, Repeated Deaths)'}
  </text>

  {/* Bottom-Left: Retention Sanctuary (Label placed at bottom y=306 free from bubbles) */}
  <rect x="78" y="200" width="255" height="115" rx="8" fill="rgba(16, 185, 129, 0.07)" stroke="rgba(16, 185, 129, 0.22)" strokeDasharray="4 4" />
  <text x="88" y="306" fill="var(--accent-emerald)" fontSize="9.5" fontWeight="800" fontFamily="var(--font-mono)">
    {isFr ? 'SANCTUAIRE DE RÉTENTION (<25% Churn)' : 'RETENTION SANCTUARY (<25% Churn)'}
  </text>

  {/* Grid Axes */}
  <line x1="78" y1="315" x2="620" y2="315" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
  <line x1="78" y1="20" x2="78" y2="315" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

  {/* Y-axis ticks (translated in EN & separated from Y-axis title) */}
  {[9, 12, 15, 18].map((val) => {
    const cy = 315 - ((val - 8) / 11) * 295;
    return (
      <g key={`y-${val}`}>
        <line x1="78" y1={cy} x2="620" y2={cy} stroke="rgba(255,255,255,0.05)" />
        <text x="70" y={cy + 4} fill="var(--text-muted)" fontSize="9.5" textAnchor="end" fontFamily="var(--font-mono)">
          {val}% {isFr ? 'Mort' : 'Dead'}
        </text>
      </g>
    );
  })}
</svg>
```
Et pour le positionnement des cartouches des héros dans la boucle `heroesList.map` :
```jsx
// Alternance haut/bas et décalage horizontal dans les clusters denses (11 héros offline / 13 héros online)
const placeLabelBelow = ['Pocket', 'Kelvin', 'Ivy', 'Bebop'].includes(h.hero_name);
const labelY = placeLabelBelow ? (cy + r + 13) : (cy - r - 7);
const labelDxMap = { Abrams: -16, Dynamo: 4, Victor: 18, Seven: -14, Bebop: 12 };
const labelX = cx + (labelDxMap[h.hero_name] || 0);
```

### Correctif #5 — Corriger le *Lie Factor* des barres de Biomarqueurs dans `ItemsSection.jsx`
Dans [ItemsSection.jsx:52-133](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/ItemsSection.jsx#L52-L133), ajouter une propriété `scaleMax` explicite à chaque biomarqueur (`100` pour les ratios globaux, `25` pour l'Écran Gris, `35` pour le Rage-Sell, `50` pour le Soutien Allié) et calculer la largeur CSS par `(rawVal / bio.scaleMax) * 100` :
- Ainsi, le ratio géométrique entre la barre `Churn = 1` et la barre `Churn = 0` est **mathématiquement exact à 100%** (ex. sur le Rage-Sell `28.6%` vs `3.4%` avec `scaleMax = 35%`, la barre rouge fait `81.7%` et la barre verte fait `9.7%`, respectant le rapport réel $\times 8.4$), et une mention discrète `Échelle : 0 – {bio.scaleMax}%` à droite de la piste informe le lecteur de l'échelle locale.

### Correctif #6 — Corriger le tri par Timing, la couleur des barres et le rang réel des achats dans `ItemTelemetrySection.jsx`
1. **Tri chronologique exact par `avg_buy_time` ([ItemTelemetrySection.jsx:367](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/ItemTelemetrySection.jsx#L367))** :
```jsx
const parseBuyTimeSec = (it) => {
  const str = String(it.avg_buy_time || '');
  const m = str.match(/(\d+)\s*m(?:\s*(\d+)\s*s)?/i);
  if (m) return parseInt(m[1], 10) * 60 + parseInt(m[2] || '0', 10);
  if (it.avg_buy_time_min != null) return Number(it.avg_buy_time_min) * 60;
  return (it.avg_order_rank ?? 99) * 120;
};
if (itemSort === 'time_asc') return parseBuyTimeSec(a) - parseBuyTimeSec(b);
```
2. **Alignement de la couleur de la barre de churn sur les 4 niveaux de `getItemRiskMeta` ([ItemTelemetrySection.jsx:1385](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/components/ItemTelemetrySection.jsx#L1385))** :
```jsx
<div
  className="lab-bar-fill"
  style={{
    width: `${Math.min(100, Math.max(6, churnPct * 1.6))}%`,
    background: risk.color,
    boxShadow: `0 0 8px ${risk.color}`
  }}
/>
```

### Correctif #7 — Synchroniser la navigation 3 pages avec le Hash URL dans `App.jsx`
Dans [App.jsx:88](file:///Users/matthieugout/Desktop/Travail Perso/Machine Learning/deadlock-predictor/frontend/src/App.jsx#L88), synchroniser `activePage` avec `window.location.hash` / `popstate` pour activer les boutons Précédent/Suivant du navigateur, le rafraîchissement F5 sur la page en cours et le partage d'URL directes :

```jsx
  const [activePage, setActivePageState] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash.startsWith('#/heroes')) return 'items-lab';
      if (window.location.hash.startsWith('#/items')) return 'items';
    }
    return 'main';
  });

  const setActivePage = (nextPage) => {
    setActivePageState(nextPage);
    if (typeof window !== 'undefined') {
      const targetHash = nextPage === 'items-lab' ? '#/heroes' : nextPage === 'items' ? '#/items' : '#/main';
      if (window.location.hash !== targetHash) {
        window.history.pushState({ page: nextPage }, '', targetHash);
      }
    }
  };

  useEffect(() => {
    const onPopState = () => {
      if (window.location.hash.startsWith('#/heroes')) setActivePageState('items-lab');
      else if (window.location.hash.startsWith('#/items')) setActivePageState('items');
      else setActivePageState('main');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
```
