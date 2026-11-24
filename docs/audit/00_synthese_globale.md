# Synthèse Globale d'Audit Multi-Agents — Deadlock Predictor

> **Date :** Novembre 2026  
> **Périmètre :** Audit complet à 360° du projet `deadlock-predictor` (Back-End FastAPI, Pipelines ML & API Deadlock, Front-End React sur les 3 pages en FR et EN, rendu réel Chromium sur 4 résolutions).  
> **Règle d'audit :** **Aucun fichier du code source n'a été modifié.** L'intégralité des constats, extraits de code, correctifs CSS/JSX/Python et réécritures éditoriales est regroupée dans ce dossier `docs/audit/`.

---

## 1. Sommaire du Dossier d'Audit (4 Rapports Spécialisés)

| Rapport | Agent & Persona | Fichier | Volume |
| :--- | :--- | :--- | :---: |
| **Synthèse Globale** | Orchestrateur (Vision transversale & Feuille de route P0→P3) | [00_synthese_globale.md](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/docs/audit/00_synthese_globale.md) | Ce document |
| **Audit 01 — Design & DataViz** | Spécialiste Design System, UI/UX, Responsive & Data Visualization (code + inspection live Chromium `1280px / 768px / 375px / 320px`) | [01_design_dataviz_audit.md](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/docs/audit/01_design_dataviz_audit.md) | 694 lignes |
| **Audit 02 — Machine Learning & API** | Spécialiste Machine Learning, Data Engineering, Back-End FastAPI & API Deadlock (code + caches `.joblib` + `ml_results.json`) | [02_machine_learning_backend_audit.md](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/docs/audit/02_machine_learning_backend_audit.md) | 546 lignes |
| **Audit 03 — Compréhension FR** | Lecteur non-joueur de Deadlock, sensible à la Data & au ML (Audit exhaustif de tous les textes français + réécritures) | [03_comprehension_fr_audit.md](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/docs/audit/03_comprehension_fr_audit.md) | 732 lignes |
| **Audit 04 — Compréhension EN** | Lecteur anglophone non-joueur de Deadlock, sensible au ML (Audit complet EN, détection des fuites FR & réécritures EN) | [04_comprehension_en_audit.md](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/docs/audit/04_comprehension_en_audit.md) | 386 lignes |

---

## 2. Scorecard Globale du Projet

| Dimension Évaluée | Note | Verdict Synthétique |
| :--- | :---: | :--- |
| **Direction Artistique & Identité Visuelle** | **8.8 / 10** | Direction artistique *Occult Dieselpunk × Statlocker.gg* très réussie, typographie maîtrisée, zéro overflow horizontal mobile (`320px` à `1280px`). |
| **Maîtrise & Architecture Free-Tier de l'API Deadlock** | **8.5 / 10** | Collecte de 923 185 matchs (1 500 joueurs) + 5 128 métadonnées Source 2 à coût 0 $, client `httpx` asynchrone robuste avec cache LRU et fallback offline. |
| **Pertinence Conceptuelle ML (« 7 Hidden Gems »)** | **8.0 / 10** | Excellentes intuitions métier spécifiques à Deadlock (*Stun Headshots*, *Écran Gris*, *Parry Miss*, *Rage-Sell*, *Isolement Solo*, *0% Vitality*). |
| **Ergonomie & Navigation Multi-Pages** | **7.8 / 10** | Pages 2 et 3 exemplaires (architecture modulaire en 3 étages + Hub de sous-onglets). Page 1 trop longue (`>7 500px`), pas de routage URL (bouton Précédent cassé). |
| **Vulgarisation & Accessibilité (FR / EN)** | **6.2 / 10** | Bon dispositif d'accueil (*C'est quoi Deadlock ?*, *Glossaire*), mais jargon non traduit (`Valve GC`, `S2`, `Weapon/Vitality/Spirit`), 10 liens glossaire cassés et ~75 fuites FR en mode EN. |
| **Intégrité Mathématique des Data Visualizations** | **5.4 / 10** | Collisions de labels SVG (Matrice Héros), *Lie Factor* sur les barres de Biomarqueurs, contradiction ROC/PR vs Matrice de Confusion, incohérences sur la Carte 2D et la courbe Vitality. |
| **Cohérence ML & Inférence Production (Back-End)** | **3.0 / 10** | Le modèle `.pkl` entraîné n'est **jamais chargé** par FastAPI, `rebuild_and_train_debiased.py` a écrasé les artefacts des 7 Hidden Gems sur disque, et 4 à 5 jeux de métriques ML se contredisent sur le site. |

---

## 3. Ce qui est Déjà Très Bien Fait (Points Forts à Préserver)

Avant de lister les chantiers de correction, les 4 agents soulignent unanimement des bases très solides :

1. **Une identité visuelle haut de gamme et cohérente sur les Pages 2 et 3** : La séparation sémantique entre la palette de jeu (*Weapon* orange, *Vitality* vert, *Spirit* violet, *Souls* cyan) et la palette ML (*Churn* rouge, *Rétention* vert menthe, *Alerte* chartreuse), ainsi que l'architecture modulaire en 3 étages (`.dl-subtabs-hub`) des Pages 2 et 3, offrent une expérience digne d'un produit commercial.
2. **Un Data Engineering Free-Tier remarquable** : La combinaison `/v1/matches/recently-fetched` + `/v1/leaderboard/{region}` + `/v1/players/{id}/enemy-stats` (pour contrer le biais de survie) + batching de 450 `match_ids` sur `/v1/matches/metadata` + `GroupShuffleSplit` par `account_id` (0 fuite de joueur entre Train et Test) témoigne d'une vraie maturité technique.
3. **Un storytelling comportemental très efficace** : Le Module 04 sur la biomécanique du *Parry* (`ItemsSection.jsx`), la déconstruction des héros en 4 temps (*Fantasme → Piège du kit → Erreur d'achat en tilt → Impact rétention*) et la feuille de route R&D séries temporelles (*Survival*, *TFT*, *Hawkes*) sont pédagogiques, originaux et captivants, même pour un non-joueur.
4. **Une résilience hors-ligne exemplaire** : Le couple `DeadlockClient` (backoff exponentiel, `Retry-After`, cache LRU) + `api.js` (repli transparent sur `MockService` / `mockData.js`) garantit que le site reste 100 % navigable sans serveur back-end.

---

## 4. Les 5 Constats Transverses Critiques (Convergences entre les 4 Agents)

### Convergence #1 — Le « Syndrome des 5 Vérités ML » & l'Écrasement des Artefacts sur Disque
*(Confirmé indépendamment par les Agents 1, 2, 3A et 3B)*

Actuellement, le site raconte simultanément **4 à 5 histoires ML incompatibles** selon la section lue — et change même ses chiffres KPI selon que le backend FastAPI est allumé ou éteint :
- **Strate 1 (Objectif « Victoire à 10 min »)** : `AboutDeadlockModal.jsx` et `dictionaryData.js` (`roc_auc`, `shap`) affirment que le modèle *V1 XGBoost (48 features)* prédit **l'issue du match à la 10e minute avec 81.4% ROC-AUC** (et `translations.js` affiche *"Predicted Churn Probability & Win Expectancy"*).
- **Strate 2 (Vestiges Dota 2 V6)** : `ArchitectureSection.jsx` et les courbes ROC/PR + Matrice de Confusion de `MlBenchmarkSection.jsx` affichent `N = 13 584` joueurs, `49.6%` de churn, `XGBoost + SMOTE`, `ROC-AUC = 80.0%`, `PR-AUC = 79.3%`, `Recall = 85.0%`, seuil $\theta^* = 0.36$, `gpm_trend` et `avg_tower_damage`.
- **Strate 3 (Run `rebuild_and_train_debiased.py` actuellement sur disque)** : Ce script a été relancé **après** `enrich_hidden_gems.py` (9 nov. vs 8 nov.), **écrasant** `deadlock_churn_dataset.csv`, `ml_results.json`, `features_list.json` et `deadlock_churn_model.pkl` ! Sur le disque, le champion est un **`MLPClassifier` à 24 features** (`ROC-AUC = 77.12%`, `PR-AUC = 57.04%`, `Recall = 80.33%`, $\theta^* = 0.26$) où **`match_frequency_drift` (variable calendaire pourtant dite bannie) est #1**, et **aucune des 7 Hidden Gems n'est présente**. Quand le back-end FastAPI tourne, `/api/ml/metrics` lit ce fichier et fait basculer `KpiBar.jsx` sur `77.1% / 72.5%` (score Train !).
- **Strate 4 (Run `enrich_hidden_gems.py` affiché hors-ligne)** : `MOCK_METRICS` et `MODEL_BENCHMARK_ROWS` dans `mockData.js` affichent `Gradient Boosting` (106 features + 7 Hidden Gems, `ROC-AUC = 67.32%`, `PR-AUC = 50.93%`, `Recall = 79.52%`, $\theta^* = 0.25$), mais la carte 05 de `KpiBar.jsx` garde un badge codé en dur `PR-AUC 57.8% ✦` juste au-dessus de `67.3% / 50.9%`.
- **Strate 5 (Double échelle `tilt_index`)** : Le back-end (`feature_service.py`, `collect_data.py`) et les archétypes utilisent l'échelle **`[0 – 100]`**, tandis que `PsychologySection.jsx`, `HeroSection.jsx` et `ArchitectureSection.jsx` affichent l'ancienne formule **`[0 – 6]`**. Pire : `SimulatorSection.jsx:752` teste `tilt_index >= 3.5` sur des valeurs `[0 – 100]`, déclenchant l'alerte sur tous les profils.

### Convergence #2 — Le Back-End d'Inférence Live n'Utilise Pas le Modèle ML et Contient 3 Bugs Critiques
*(Audit Agent 2 — `02_machine_learning_backend_audit.md`)*

1. **Modèle `.pkl` jamais chargé** : `backend/app/services/feature_service.py` n'importe ni `deadlock_churn_model.pkl` ni `deadlock_scaler.pkl`. `/api/predict/{account_id}` évalue une formule logistique codée en dur à 8 variables et des règles `if/elif` fixes.
2. **Inversion Victoire/Défaite en live (`player.py:72`, `feature_service.py:177`)** : Le code vérifie `match_result == 1` au lieu de `int(player_team) == int(match_result)`, inversant 100 % des victoires/défaites pour l'équipe 0 (*Amber Hand*).
3. **Durée réelle ignorée (`feature_service.py:145`, `player.py:80`)** : Le code lit `m.get("duration_s", 1800)` alors que l'API Deadlock renvoie `match_duration_s` — tous les matchs live sont donc forcés à 30 minutes !
4. **Rate-limit Steam GC inutile (`deadlock_client.py:304`)** : `get_player_match_history` oublie `?only_stored_history=true` (5 req/h Steam GC au lieu de 100 req/s ClickHouse).
5. **Fuites internes de validation croisée & features synthétiques** : `collect_data.py` synthétise >20 features par heuristiques (et introduit une fuite temporelle via `/v1/players/hero-stats`), et `cross_val_predict` / `CalibratedClassifierCV` n'utilisent pas `StratifiedGroupKFold(groups=account_id)`.

### Convergence #3 — Bugs Mathématiques & Visuels dans les Data Visualizations
*(Audit Agent 1 + Agents 3A & 3B)*

- **Page 1 (`MlBenchmarkSection.jsx` & `RiskGauge.jsx`)** :
  - `ConfusionMatrixHeatmap` utilise une formule synthétique sur `N = 4 900` (50% churn) totalement déconnectée de `InteractiveCurves` juste à gauche : au même seuil $\theta = 0.36$, la courbe affiche **`Recall 86.0% / FPR 38.0%`** et la matrice à côté affiche **`Recall 73.5% / FPR 49.0%`**.
  - `RiskGauge.jsx` reçoit `threshold={0.25}` mais affiche le texte codé en dur `θ* = 36.0%`, produisant `+3.0% (θ* = 36.0%)` pour un score de `28.0%`.
  - Dans `FeatureImportanceChart`, les 7 variables `category: "hidden_gems"` n'ont **aucun bouton de filtre** (et `getCategoryColor` teste des catégories Dota 2 `behavior`/`ranked`).
  - Dans `FactorAttribution.jsx`, 3 des 4 archétypes affichent une colonne entière vide (`0 signaux`).
- **Page 2 (`ItemsSection.jsx` & `DeadlockMapHeatmap.jsx`)** :
  - **10 collisions SVG mesurées** sur la Matrice Héros (titre de zone rouge qui déborde du `viewBox`, superposition du titre vert sur `Dynamo`/`Victor`, axe Y écrasant `12% Mort`, empilement des cartouches `Abrams/Pocket/Dynamo/Kelvin/Victor` + `Seven/Bebop` en mode online).
  - **Tufte Lie Factor** sur les 5 Biomarqueurs : `17.8%` (*Écran Gris*) est dessiné à `78%` de largeur tandis que `36.8%` (*Soutien Allié*) est dessiné à `36.8%`.
  - **Carte Tactique 2D (`deadlockMapData.js`)** : Les `cause_fr`/`cause_en` sont associées aléatoirement et contredisent la zone/le héros/la minute (ex. *Yamato intercepté en vol stationnaire*, *Urne en jungle* dans la fontaine de spawn, *Rejuvenator* à 4.9 min).
  - Taux de churn incohérents entre Module 02, Module 03 et Navbar (ex. `Seven` annoncé à `29%` dans `Navbar.jsx:105` au lieu de `41.7%` ; `Infernus` à `34.5%` vs `41.7%`).
- **Page 3 (`ItemTelemetrySection.jsx`)** :
  - **Contradiction narrative critique** sur les courbes `CHURN_COST_TIMELINES` : les données montrent que les joueurs retenus montent à `26.8%` de Vitality et les churners stagnent à `1.5–4.8%`, mais le texte explicatif affirme littéralement l'inverse (*"Retained stays flat at 8–11% while Churners surge to 31%"*).
  - **Triple identité de `Hollow Point Ward`** (Tier 1 / 500 Souls / 70% HP vs Tier W2 / 1 250 Souls / 60% HP vs Tier 3 / 3 000 Souls / 60% HP, appelé `Schéma #2` dans le catalogue et `SCHÉMA #3` dans la grille).
  - Annonce **`54 Items Source 2`** alors que le catalogue n'en contient que **`21`** (en offline comme en online).
  - Le tri **`Timing Moyen d'Achat` (`time_asc`)** trie par `avg_order_rank` au lieu de parser `avg_buy_time`.
  - Les badges `#k` de la frise séquentielle contredisent le rang réel (`#6 Bullet Resilience (15e Item)`).

### Convergence #4 — ~75 Fuites Françaises en Mode Anglais (`EN`) & Bugs CSS / Responsive
*(Audit Agent 3B + Agent 1)*

- **Bilinguisme `EN` cassé sur des blocs entiers** :
  - Les **5 cartes d'archétypes** du simulateur (`SimulatorSection.jsx:287-309`) affichent `arch.name` / `arch.subtitle` / `arch.narrative` en français alors que les champs `_en` existent dans `mockData.js` !
  - Les **7 modales de détail des Hidden Gems** (`PsychologySection.jsx:480-610`) s'ouvrent **100 % en français** en mode EN.
  - Des sections entières de **`PlayerModal.jsx`** (*Trajectoire historique*, *Simulation What-If*) sont 100 % en français en mode EN.
  - Plus de 50 autres chaînes en français (`V`/`D` au lieu de `W`/`L`, `9% Mort`, `SCHÉMA #1..4`, `▶ Lancer Simulation`, `GEMME #1..7`, `✓ Match Charged!` au lieu de `Loaded!`, `HARDWARE TELEMETRY` au lieu de `ITEMIZATION TELEMETRY`).
- **Bugs CSS & Responsive** :
  - **Classes CSS fantômes** absentes de `index.css` : `.badge-cyan`, `.badge-chem`, `.badge-chem-bright`, `.btn`, `.btn-ghost`, `.btn-sm`, `.tilt-recommendation-box`, `.animate-ping`.
  - **Bug mobile `< 1023px`** : La table d'ablation (`MlBenchmarkSection.jsx:200-248`) perd son `<thead>` sur mobile mais n'a aucun attribut `data-label` sur ses `<td>`, affichant des chiffres nus sans libellé.
  - **Dissonance chromatique `--accent-orange` = Vert `#10b981`** : Dans le simulateur de Tilt, l'état *« Énervé (Frustration Aiguë) »* s'affiche en vert émeraude (même couleur que *« Serein »*).
  - **Architecture Navigation** : Absence de routage URL (`hash`/History API), clic sur *« Tester le Simulateur »* depuis `AboutDeadlockModal` inopérant sur les Pages 2 et 3, et sous-modules des Pages 2/3 absents du menu Burger mobile.

### Convergence #5 — Vulgarisation Non-Joueur, Jargon & Dictionnaire Cassé
*(Audit Agents 3A & 3B)*

- **10 identifiants `<GlossaryTerm>` cassés** (`rolling_window`, `pr_auc`, `night_owl`, `party_size`, `souls_per_min`, `rank_tier`, `stomp`, `kda`, `objective_control`, `aim_accuracy`) + bug dans `DictionaryDrawer.jsx:27` qui ne passe pas par `findDictionaryTerm()` (ignorant les alias et `DEADLOCK_GLOSSARY`) + compteur incohérent (`21 termes` annoncés dans `Navbar.jsx` vs `17` affichés).
- **Prérequis Deadlock non expliqués** : Acronymes `Valve GC` et `S2` jamais définis ; aucune phrase d'introduction expliquant les 3 familles d'objets (`Weapon`, `Vitality`, `Spirit`) avant de parler de `0% Vitality 30m` ; mélange monétaire `Souls` vs `Gold / GPM` ; ~18 termes esport non vulgarisés (*stomp*, *gank*, *dive*, *CC*, *DoT*, *hitbox*, *canalisation*, *autofill*).
- **Erreurs de rendu textuel** : LaTeX brut (`$P(\text{churn} \mid X)$`, `$\theta^* = 0.36$`) et backticks Markdown affichés tels quels dans `ArchitectureSection.jsx`, faute de casse `BIOMARQUEurs` dans `ItemsSection.jsx:256`, faux-amis mathématiques (*« taux de hasard »* au lieu de *« taux de risque instantané »*).

---

## 5. Feuille de Route Priorisée (Plan d'Action P0 → P3)

### 🔴 P0 — Urgences Bloquantes (Intégrité Technique, ML & Bilinguisme)
1. **Restaurer une source unique de vérité ML sur disque (`backend/`)** :
   - Corriger les 3 fuites de validation croisée (`StratifiedGroupKFold`, sélection OOF, protection des features primaires) dans `enrich_hidden_gems.py` et en faire le pipeline final unique générant `deadlock_churn_model.pkl`, `deadlock_scaler.pkl`, `features_list.json` et `ml_results.json`.
2. **Corriger le back-end d'inférence live (`feature_service.py`, `player.py`, `deadlock_client.py`)** :
   - Charger le vrai modèle `.pkl` + scaler dans `FeatureService.predict_churn`.
   - Corriger `is_match_won` (`player_team == match_result`), `match_duration_s` (au lieu de `duration_s`) et ajouter `only_stored_history=true` dans `DeadlockClient.get_player_match_history`.
3. **Éliminer les fuites françaises critiques en mode Anglais (`EN`)** :
   - Brancher `name_en` / `subtitle_en` / `narrative_en` dans `SimulatorSection.jsx`, ajouter les champs `_en` sur les 7 modales `HIDDEN_GEMS_DATA` (`PsychologySection.jsx`), traduire `PlayerModal.jsx`, `GlossaryTerm.jsx`, `Navbar.jsx` et les ~50 chaînes restantes (réécritures prêtes dans `04_comprehension_en_audit.md`).

### 🟠 P1 — Cohérence Scientifique & Bugs Visuels / DataViz Majeurs
4. **Synchroniser 100 % des métriques entre Back-End, `mockData.js`, `translations.js` et tous les composants** :
   - Purger les vestiges *Dota 2* (`13 584`, `49.6%`, `80.0%`, `gpm_trend`, rangs Dota 2) et la confusion *« Victoire à 10 min »* (`AboutDeadlockModal.jsx`, `dictionaryData.js`, `translations.js`).
   - Aligner `KpiBar.jsx` (supprimer le badge `57.8%` en dur), `ConfusionMatrixHeatmap` (brancher sur `interpolateAtThreshold`), `RiskGauge.jsx` (seuil dynamique), `SimulatorSection.jsx:752` (`tilt_index >= 60`), et unifier `tilt_index` sur `[0 – 100]`.
5. **Corriger les bugs visuels et DataViz des 3 pages** *(snippets complets dans `01_design_dataviz_audit.md §8`)* :
   - Ajouter les classes CSS manquantes dans `index.css` (`.badge-cyan`, `.badge-chem*`, `.btn-ghost`, `.tilt-recommendation-box`, `.animate-ping`) et corriger la couleur `--accent-orange` du simulateur de Tilt.
   - Ajouter `data-label` sur tous les `<td>` de la table d'ablation (`MlBenchmarkSection.jsx`) pour le rendu mobile.
   - Résoudre les 10 collisions SVG de la Matrice Héros (`ItemsSection.jsx`), corriger le *Lie Factor* des 5 Biomarqueurs, aligner les taux de churn entre Module 02 / Module 03 / Navbar, et fixer la contradiction de la courbe `Vitality %` + le tri `time_asc` + `Hollow Point Ward` + le badge `21 / 54 items` sur la Page 3.
   - Corriger les `cause_fr`/`cause_en` incohérentes de la Carte Tactique 2D (`deadlockMapData.js`) et les colonnes SHAP vides dans `FactorAttribution.jsx`.

### 🟡 P2 — Ergonomie, Navigation, Glossaire & Vulgarisation Non-Joueur
6. **Réparer le Glossaire & enrichir la pédagogie non-joueur** :
   - Corriger `DictionaryDrawer.jsx:27` pour utiliser `findDictionaryTerm()`, fusionner `DEADLOCK_GLOSSARY`, ajouter les 10 entrées manquantes et corriger le compteur dans `Navbar.jsx`.
   - Ajouter un encadré d'intro sur les 3 familles d'objets (*Weapon / Vitality / Spirit*), expliciter `Valve GC`, `Source 2` (au lieu de `S2`), `Souls` (purger `Gold/GPM`) et corriger le LaTeX/Markdown brut dans `ArchitectureSection.jsx`.
7. **Améliorer la navigation (« la façon de se balader »)** :
   - Synchroniser `activePage` et `activeSubTab` avec `window.location.hash` / `history.pushState` pour réparer le bouton « Précédent » et le rafraîchissement (`F5`).
   - Ajouter les chapitres des Pages 2 & 3 dans le menu Burger mobile, réparer le bouton *« Tester le Simulateur »* depuis `AboutDeadlockModal` sur les Pages 2/3, et ajouter un indicateur de progression + retour en haut sur la Page 1.

### 🟢 P3 — Polissage Éditorial & Évolutions R&D
8. **Polissage FR & EN** : Corriger `BIOMARQUEurs`, `"HARDWARE TELEMETRY"` → `"ITEMIZATION TELEMETRY"`, `"Match Charged!"` → `"Match Loaded!"`, `"taux de hasard"` → `"taux de risque instantané"`, et clarifier l'avis d'anonymisation du `Footer.jsx`.
9. **Exploitation avancée de l'API Deadlock** : Exploiter `ranked_used_demotion_protection`, `ranked_delta`, `game_mode=4` (*Street Brawl*), `/v1/players/steam-search` pour la recherche live, et envisager une tête de survie multi-horizons ($3\text{j}, 7\text{j}, 14\text{j}, 30\text{j}$) sur `time_gap_days`.

---

## 6. Les 3 Décisions d'Arbitrage à Trancher Avant d'Implémenter

1. **Quel modèle champion devient la vérité unique du site ?**
   - *Option A (Recommandée pour la cohérence du storytelling)* : Le pipeline **100 % In-Game Pure + 7 Gemmes Cachées Source 2** (`enrich_hidden_gems.py`, Gradient Boosting régularisé, zéro variable calendaire, `ROC-AUC ~67–70%`, `Recall ~79.5%`) — quitte à présenter dans le tableau de benchmark une ligne comparative montrant l'apport des variables calendaires (`77.1%`) vs le modèle pur in-game.
   - *Option B* : Le pipeline **Dé-biaisé à 24 features** (`rebuild_and_train_debiased.py`, `MLPClassifier`, `ROC-AUC 77.1%`, `Recall 80.3%`) — mais il faudra alors retirer la promesse *« Zéro variable calendaire / 7 Gemmes Cachées dans le modèle »*.
2. **Quel seuil optimal $\theta^*$ unifier partout ?**
   - Plusieurs tests E2E (`tests_e2e/test_tier2_boundaries.py` et 6 tests dans `frontend/tests/`) vérifient actuellement **`0.36`**, alors que `MOCK_METRICS` utilise **`0.25`** (et `ml_results.json` **`0.26`**). Il faudra aligner à la fois le front-end, le back-end et les tests sur une seule valeur.
3. **Renommage des archétypes anglais (`"The Burned-out Walker"`, `"The Tilting Trooper"`)** :
   - `tests_e2e/spec_oracles.py:103, 113` vérifie ces noms exacts. Si vous souhaitez renommer `"The Burned-out Walker"` en `"The Burned-Out Veteran"` pour éviter la confusion avec la tourelle *Walker*, il faudra mettre à jour `spec_oracles.py` dans le même commit.
