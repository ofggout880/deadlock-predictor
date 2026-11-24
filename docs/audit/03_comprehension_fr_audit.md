# Audit Exhaustif de Compréhension, Vulgarisation & Qualité Éditoriale (Version Française)

**Date de l'audit** : 21 Novembre 2026 (Version Révisée & Vérifiée de bout en bout Front-End / Back-End)  
**Auditeur** : Agent 3A — *Persona : Lecteur francophone cultivé, sensible aux enjeux de la Data Science et du Machine Learning, mais novice complet sur le jeu vidéo Deadlock (et non-spécialiste du jargon MOBA/Hero Shooter).*  
**Périmètre analysé** : Intégralité des textes français du front-end (`translations.js`, `dictionaryData.js`, `mockData.js`, `deadlockMapData.js`, et l'ensemble des composants React : `App.jsx`, `Navbar.jsx`, `HeroSection.jsx`, `KpiBar.jsx`, `PsychologySection.jsx`, `MlBenchmarkSection.jsx`, `SimulatorSection.jsx`, `RiskGauge.jsx`, `FactorAttribution.jsx`, `ArchitectureSection.jsx`, `ItemsSection.jsx`, `ItemTelemetrySection.jsx`, `DeadlockMapHeatmap.jsx`, `DictionaryDrawer.jsx`, `AboutDeadlockModal.jsx`, `WelcomeDictionaryToast.jsx`, `Footer.jsx`, `GlossaryTerm.jsx`) croisés avec les artefacts back-end (`backend/data/ml_results.json`, `backend/app/services/feature_service.py`, `backend/app/services/mock_service.py`, `backend/app/api/routers/items.py`, `backend/collect_data.py`, `backend/rebuild_and_train_debiased.py`, `backend/enrich_hidden_gems.py`).

---

## Table des Matières

1. [Synthèse Générale & Verdict de l'Auditeur](#1-synthèse-générale--verdict-de-lauditeur)
2. [Alerte Critique N°1 : La Crise de Schizophrénie Narrative et Chiffrée (Le "Syndrome des 5 Vérités")](#2-alerte-critique-n1--la-crise-de-schizophrénie-narrative-et-chiffrée-le-syndrome-des-5-vérités)
3. [Axe 1 : Audit du Jargon Deadlock & Jeux Vidéo pour un Non-Initié](#3-axe-1--audit-du-jargon-deadlock--jeux-vidéo-pour-un-non-initié)
4. [Axe 2 : Audit de la Vulgarisation Machine Learning & Data Science](#4-axe-2--audit-de-la-vulgarisation-machine-learning--data-science)
5. [Axe 3 : Clarté du Storytelling, Qualité du Français, Anglicismes & Bugs d'Affichage Textuel](#5-axe-3--clarté-du-storytelling-qualité-du-français-anglicismes--bugs-daffichage-textuel)
6. [Axe 4 : Audit Détaillé Page par Page & Section par Section (avec Réécritures Prêtes à Copier-Coller)](#6-axe-4--audit-détaillé-page-par-page--section-par-section-avec-réécritures-prêtes-à-copier-coller)
   - [6.1. Navigation Globale, Toast de Bienvenue, Modale "Deadlock & Projet" & Dictionnaire](#61-navigation-globale-toast-de-bienvenue-modale-deadlock--projet--dictionnaire)
   - [6.2. Page 1 ("Principal") — Hero Section & Barre de KPIs](#62-page-1-principal--hero-section--barre-de-kpis)
   - [6.3. Page 1 ("Principal") — Psychologie du Joueur & Les 7 Gemmes Cachées](#63-page-1-principal--psychologie-du-joueur--les-7-gemmes-cachées)
   - [6.4. Page 1 ("Principal") — Benchmark Machine Learning & Explicabilité](#64-page-1-principal--benchmark-machine-learning--explicabilité)
   - [6.5. Page 1 ("Principal") — Simulateur, 4 Archétypes, Jauge de Risque & Attribution SHAP](#65-page-1-principal--simulateur-4-archétypes-jauge-de-risque--attribution-shap)
   - [6.6. Page 1 ("Principal") — Bannière Passerelle, Architecture du Pipeline & Footer](#66-page-1-principal--bannière-passerelle-architecture-du-pipeline--footer)
   - [6.7. Page 2 ("Dynamique Héros & Churn") — Biomarqueurs, Matrice Héros, Carte 2D & Biomécanique du Parry](#67-page-2-dynamique-héros--churn--biomarqueurs-matrice-héros-carte-2d--biomécanique-du-parry)
   - [6.8. Page 3 ("ITEM") — Frise Chronologique 3 Phases, 4 Schémas Cognitifs & Catalogue d'Équipements](#68-page-3-item--frise-chronologique-3-phases-4-schémas-cognitifs--catalogue-déquipements)
7. [Remaining Questions & Gaps (Questions Ouvertes & Pistes pour la Suite)](#7-remaining-questions--gaps-questions-ouvertes--pistes-pour-la-suite)

---

## 1. Synthèse Générale & Verdict de l'Auditeur

En parcourant l'intégralité du site avec l'œil d'un visiteur curieux de Data Science mais **totalement étranger à Deadlock**, l'impression initiale est celle d'un travail d'une richesse et d'une ambition rares. Le site ne se contente pas d'afficher des scores de modèles : il raconte une véritable **enquête psychologique et biomécanique** sur la frustration humaine dans un environnement compétitif.

### Ce qui fonctionne remarquablement bien (Points Forts Majeurs)
1. **L'effort proactif d'onboarding des néophytes** : La présence du bouton `C'est quoi Deadlock ?` dès l'en-tête ([`HeroSection.jsx:45-53`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/HeroSection.jsx#L45-L53)), du bouton `Deadlock & Projet` dans la barre de navigation ([`Navbar.jsx:676-696`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/Navbar.jsx#L676-L696)), du toast d'accueil ([`WelcomeDictionaryToast.jsx`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/WelcomeDictionaryToast.jsx)) et du tiroir-lexique latéral ([`DictionaryDrawer.jsx`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/DictionaryDrawer.jsx)) montre une vraie conscience du lecteur non-joueur.
2. **Des concepts comportementaux très parlants** : Même sans connaître le jeu, des trouvailles comme le **« Bouclier Social »** (jouer avec des amis amortit la frustration), le **« Ratio d'Écran Gris »** (passer 17,8 % de sa partie mort devant un écran monochrome) ou la **« Revente Panique / Rage-Sell »** (brader tout son inventaire 90 secondes avant la fin par dépit) sont immédiatement compréhensibles et passionnantes.
3. **Le positionnement éthique fort ("Anti-EOMM")** : Expliquer que le modèle sert à protéger la santé mentale du joueur (suggérer une pause, éviter de grouper 6 joueurs énervés ensemble) plutôt qu'à truquer les parties (matchmaking prédateur) donne une vraie hauteur de vue au projet.
4. **La narration des "Pièges Cognitifs" en Page 2 et Page 3** : Le contraste entre le *« Fantasme du Joueur »* (ex: voler dans les airs comme un sniper intouchable avec Vindicta) et la *« Réalité Biomécanique »* (devenir un pigeon d'argile sans abri avec 0 équipement de survie pendant 30 minutes) est un modèle de storytelling analytique.

### Ce qui bloque ou déroute fortement le lecteur (Points Négatifs Majeurs)
1. **Une incohérence critique des chiffres et de l'objectif même du modèle d'une section à l'autre (et même selon que le backend est en ligne ou hors-ligne)** : C'est le défaut numéro 1 du site. Un lecteur attentif aux données perd totalement confiance lorsqu'il voit **5 versions contradictoires des métriques, de la taille du dataset, du modèle champion, du seuil optimal $\theta^*$ et même de la cible prédite** (tantôt "le churn à 14 jours après 20 matchs", tantôt "l'issue victoire/défaite du match à la 10e minute"). Voir Section 2 ci-dessous.
2. **Un mur de jargon technique et gaming non traduit dès la première phrase** : Dès le sous-titre du Hero ([`translations.js:66`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/translations.js#L66)), on heurte *« ralentis de mort Valve GC »*, *« Fenêtres S2 »*, *« stomps en lane »*, *« rushant des items »*, *« CC »*, *« DoT »*, *« ganks »*, *« roam »*, *« autofill »*, *« Unsecured Souls »*, *« Souls·min »*. Pour un non-joueur, *« Valve GC »* (Game Coordinator) ou *« S2 »* (Source 2) ressemblent à des acronymes obscurs jamais définis.
3. **Une sous-utilisation dramatique du composant `<GlossaryTerm>` et 10 liens de glossaire cassés** : Alors que le toast de bienvenue promet que *« tous les mots soulignés en pointillés dans l'étude sont cliquables »* ([`WelcomeDictionaryToast.jsx:56`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/WelcomeDictionaryToast.jsx#L56)), le composant `<GlossaryTerm>` n'est utilisé qu'une douzaine de fois sur tout le site, et presque uniquement sur les mots `Churn`, `Tilt Index` et `Loss Streak` ! Pire : **10 identifiants** appelés par `<GlossaryTerm>` ou `openDictionary` (`rolling_window`, `pr_auc`, `night_owl`, `party_size`, `souls_per_min`, `rank_tier`, `stomp`, `kda`, `objective_control`, `aim_accuracy`) ne correspondent à aucun `id` de `DICTIONARY_TERMS`, ouvrant un tiroir dictionnaire qui ne cible ni ne surligne rien !
4. **Des formules, échelles et infobulles qui se contredisent sous les yeux du lecteur** :
   - Le `Tilt Index` est défini avec 3 formules différentes (`translations.js:144`, `PsychologySection.jsx:100-110`, et `backend/app/services/feature_service.py:60-76`), varie de `0 à 4.8` dans le simulateur de la section Psychologie mais grimpe à `82.5 / 100` dans le simulateur d'Archétypes deux écrans plus bas !
   - Sur la Carte Tactique 2D ([`DeadlockMapHeatmap.jsx`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/DeadlockMapHeatmap.jsx) / [`deadlockMapData.js`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/data/deadlockMapData.js)), les infobulles au survol affichent des causes de mort tirées au hasard qui contredisent le lieu, le héros et la minute affichés dans la même infobulle (ex: Yamato abattue « en vol stationnaire », ou un joueur tué « en portant l'Urne dans la jungle » alors que le point est dans le « Sanctuaire de Spawn Nord » !).
   - En Page 3 (`ITEM`), l'objet phare `Hollow Point Ward` change 3 fois de palier, de prix et de seuil de points de vie sur la même page (`Tier 1 à 500 Souls >70% PV`, `Tier 2 à 1 250 Souls >60% PV`, et `Tier 3 à 3 000 Souls >60% PV`).

---

## 2. Alerte Critique N°1 : La Crise de Schizophrénie Narrative et Chiffrée (Le "Syndrome des 5 Vérités")

Pour un lecteur sensible au Machine Learning (recruteur Data, ingénieur ML, chef de produit), la rigueur et la cohérence des chiffres sont le premier critère de crédibilité. Or, l'inspection croisée du front-end et du back-end révèle que le site superpose **5 strates historiques contradictoires du projet** :

1. **Strate 1 (Ancien projet Dota 2 / Prédiction de victoire à 10 min)** : Encore présente dans la modale d'introduction ([`AboutDeadlockModal.jsx:144-146`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/AboutDeadlockModal.jsx#L144-L146)), le dictionnaire ([`dictionaryData.js:157-172`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/data/dictionaryData.js#L157-L172)), les titres de la jauge et des colonnes SHAP ([`translations.js:359, 370-371, 383-384, 391`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/translations.js#L359)), et les formules de `ArchitectureSection.jsx:354, 374` (`avg_tower_damage`, `gold_per_min`).
2. **Strate 2 (Ancien modèle V6 XGBoost + SMOTE sur N = 13 584 / Test N = 3 397 ou 4 900)** : Encore présente dans [`ArchitectureSection.jsx:184-255`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/ArchitectureSection.jsx#L184-L255), [`InteractiveCurves`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/MlBenchmarkSection.jsx#L311-L352), [`ConfusionMatrixHeatmap`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/MlBenchmarkSection.jsx#L620-L639) et [`RiskGauge.jsx:130`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/RiskGauge.jsx#L130) (`ROC-AUC = 80.0%`, `PR-AUC = 79.3%`, `Recall = 85.0%`, `θ* = 0.36` ou `0.42`).
3. **Strate 3 (Run `rebuild_and_train_debiased.py` sauvegardé dans `backend/data/ml_results.json`)** : Modèle à **79 features candidates (24 optimales)** incluant encore `match_frequency_drift` (classée #1 à 13,24 %), où le champion est **`MLP Neural Network (64x32 ReLU, L2 alpha=0.5)`** avec **`ROC-AUC = 77.12%`**, **`PR-AUC = 57.04%`** (`57.81%` pour Gradient Boosting, `67.93%` Train PR-AUC) et **`Rappel = 80.33%`** (au seuil `0.26`) / **`77.43%`** (pour Gradient Boosting). C'est de ce fichier `ml_results.json` que viennent les textes de [`translations.js:86, 112-129`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/translations.js#L112-L129) et le badge `CHAMPION : MLP & GRADIENT BOOSTING` de [`MlBenchmarkSection.jsx:59`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/MlBenchmarkSection.jsx#L59) !
4. **Strate 4 (Run `enrich_hidden_gems.py` codé en dur dans `MOCK_METRICS` / `MODEL_BENCHMARK_ROWS` de `mockData.js`)** : Modèle **100 % In-Game Pure à 106 features** (après bannissement de `match_frequency_drift` et ajout des 27 variables des 7 Gemmes Cachées sur `3 244` fenêtres enrichies, `Test N = 514` dans `confusion_matrix` mais affiché `N = 10 000 / 1 912 test`), où le champion est **`Gradient Boosting (Depth-3, Colsample=0.50, Subsample=0.75)`** avec **`ROC-AUC = 67.32%`**, **`PR-AUC = 50.93%`**, **`Rappel = 79.52%`**, **`Seuil θ* = 0.25`**, et où le **`Réseau MLP` est 7e et dernier (`62.6% ROC-AUC`)** !
5. **Strate 5 (Comportement dynamique de `KpiBar.jsx` quand le Backend FastAPI est en ligne vs hors-ligne)** :
   - **En mode hors-ligne (Démo)**, `KpiBar.jsx` lit `MOCK_METRICS` et affiche `79.5%` de Rappel et `67.3% / 50.9%` de ROC/PR-AUC (avec un badge codé en dur `PR-AUC 57.8% ✦` juste au-dessus !).
   - **En mode en ligne (API connectée)**, `/api/ml/metrics` ([`backend/app/services/mock_service.py:340-361`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/services/mock_service.py#L340-L361)) lit `backend/data/ml_results.json`, omet `recall` et `dataset_size`, et renvoie `auc_score: 0.7712` et `pr_auc: 0.7250` (le score Train !). `KpiBar.jsx` change alors brusquement ses chiffres pour afficher **`77.4% - 80.3%`** de Rappel et **`77.1% / 72.5%`** de ROC/PR-AUC !

Voici le tableau récapitulatif des contradictions visibles par l'utilisateur sur la **même page** :

| Concept / Métrique | Version A (Hero & Modale & Dictionnaire) | Version B (KpiBar & `translations.js` & `ml_results.json`) | Version C (`MOCK_METRICS` & Table Benchmark) | Version D (Courbes SVG & Matrice de Confusion) | Version E (`ArchitectureSection.jsx` & `RiskGauge`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Que prédit le modèle ?** | Modale (`AboutDeadlockModal.jsx:145`) & Dictionnaire (`dictionaryData.js:157`) : **L'issue du match (Victoire/Défaite) à la 10e minute** | `HeroSection` & `KpiBar` : **Le Churn (abandon du jeu pendant 14 jours) après un match pivot T** | `MlBenchmarkSection` : **Le Churn à 14 jours** | `SimulatorSection` & `FactorAttribution` (`translations.js:359, 383-384`) : **« Probabilité Prédite de Churn & Espérance de Victoire »** / **« Poussant à la Défaite / Churn »** | `ArchitectureSection` : **Le Churn à 14 jours** |
| **Modèle Champion** | `Navbar.jsx:13` & Modale : **V1 XGBoost** | `translations.js:114` : **MLP Réseau Neuronal (80.3%) & Gradient Boosting (77.4%)** / Badge table (`MlBenchmarkSection.jsx:59`) : **MLP & GRADIENT BOOSTING** | `MOCK_METRICS:27` & Table ligne 1 : **Gradient Boosting (Depth-3, Colsample=0.50)** (et MLP est 7e et dernier du tableau avec 62.6% !) | `translations.js:178` : **Deadlock V1 XGBoost + SMOTE** | `ArchitectureSection.jsx:184` & `RiskGauge.jsx:130` : **V6 XGBoost Ensembliste + SMOTE** |
| **Seuil de Décision Optimal ($\theta^*$)** | `HeroSection.jsx:232` & `dictionaryData.js:203` : **$\theta^* = 0.25$** | `KpiBar.jsx:71, 73` : **$\theta^* = 0.36$** (et `ml_results.json:502` : **$0.26$ / $0.465$**) | `MOCK_METRICS:29` & Table ligne 1 : **$\theta^* = 0.25$** | `translations.js:185, 361` & `ConfusionMatrix:620` : **$\theta^* = 0.42$** (mais le curseur `InteractiveCurves:567` affiche **$\theta^* = 0.36$**) | `ArchitectureSection.jsx:232` & `RiskGauge.jsx:289` : **$\theta^* = 0.36$** (alors que `SimulatorSection:807` passe `threshold={0.25}` à `RiskGauge` !) |
| **Score ROC-AUC** | Modale & Dictionnaire : **81.4% (81.42%)** | `KpiBar.jsx:29` (et API en ligne) : **77.1%** | `MOCK_METRICS:36` & Table (et KpiBar hors-ligne) : **67.3% (67.32%)** | `InteractiveCurves.jsx:311` : **80.0%** | `ArchitectureSection.jsx:205` : **80.0%** |
| **Score PR-AUC** | `translations.js:184` : **80.6%** | Badge `KpiBar.jsx:83` : **57.8% (67.9% Train)** (et API en ligne : **72.5%**) | `MOCK_METRICS:38` & Table (et chiffre KpiBar hors-ligne) : **50.9% (50.93%)** | `InteractiveCurves.jsx:312` : **79.3%** | `ArchitectureSection.jsx:205` : **79.3%** |
| **Rappel (Recall)** | `HeroSection.jsx:80` : **79.5% - 88.6%** | `translations.js:86, 112` (et KpiBar en ligne) : **77.4% - 80.3%** | `MOCK_METRICS:32` (et KpiBar hors-ligne) : **79.5% (Record 88.6% Extra Trees)** | `translations.js:181` : **81.4%** | `ArchitectureSection.jsx:204` : **85.0%** |
| **Taille du Dataset & Test Set** | `HeroSection.jsx:79` : **N = 5 293 Matchs Source 2** | `KpiBar` (`translations.js:99`) : **10 000 fenêtres, 1 500 joueurs, 923 185 matchs, Test N = 1 912** | `MOCK_METRICS:17-23` : **10 000 fenêtres, 1 170 joueurs, 5 293 matchs, Test N = 1 912 (mais 514 dans `confusion_matrix` !)** | `ConfusionMatrixHeatmap.jsx:624` : **N = 4 900 (2 450 Churn / 2 450 Actifs)** | `ArchitectureSection.jsx:189-197` : **24 500+ historiques, 13 584 joueurs train, Test N = 3 397 (1 689 churners)** |
| **Nombre de Variables (Features)** | Modale (`AboutDeadlockModal.jsx:144`) : **48 features** (4 groupes de 12) | `KpiBar.jsx:60` : **106 features** (mais `ml_results.json:17-18` a **79 candidates / 24 optimales**) | `MOCK_ABLATION_STUDY:262` : **106 features** (et `FEATURE_CATEGORIES:1630` dit **48**) | `translations.js:250` : **48 features** | `ArchitectureSection.jsx:135` : **48 features** (et `Navbar.jsx:929` dit **106f**) |
| **Fenêtre d'observation** | — | `KpiBar.jsx:50` : **20 Matchs (5 récents vs 15 baseline)** | — | `SimulatorSection.jsx:934` : **10 matchs précédant T** (ou *« 10 dernières minutes de jeu »* dans `translations.js:434`) | `ArchitectureSection.jsx:93, 165` : **100 matchs (10 récents vs 90 passés)** |

**Recommandation impérative** : Aligner à la fois `backend/data/ml_results.json`, `backend/app/services/mock_service.py` et 100 % des textes statiques du front-end sur **une seule vérité terrain** (celle du modèle final 100 % In-Game Pure à 106 features : *Gradient Boosting Champion, Seuil $\theta^* = 0.25$ [ou $0.36$], ROC-AUC = 67.3% [69.7% normalisé], PR-AUC = 50.9%, Rappel = 79.5%*).

---

## 3. Axe 1 : Audit du Jargon Deadlock & Jeux Vidéo pour un Non-Initié

Voici l'inventaire complet des termes liés à Deadlock et à la culture gaming présents en français sur le site, avec le diagnostic précis de ce qu'éprouve un lecteur qui n'a jamais lancé le jeu :

### 3.1. Termes du moteur et de l'infrastructure Valve (Très bloquants car omniprésents)
* **« Valve GC » / « caméras de mort Valve GC » / « déconnexion Valve GC »** ([`HeroSection.jsx:482`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/HeroSection.jsx#L482), [`translations.js:38, 66, 77, 460`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/translations.js#L66), [`dictionaryData.js:133`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/data/dictionaryData.js#L133), [`ItemsSection.jsx:1886`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/ItemsSection.jsx#L1886))
  * *Pourquoi ça bloque* : « GC » (*Game Coordinator*, le serveur central d'orchestration des parties de Valve) n'est expliqué **nulle part** sur le site, pas même dans le dictionnaire ! Pour un lecteur francophone, « GC » évoque « Génie Civil » ou « Grand Compte ».
  * *Solution* : Remplacer par **« serveur de jeu Valve »** ou **« télémétrie officielle Valve »**, ou expliciter `(Game Coordinator, le serveur maître de Valve)` à la première occurrence.
* **« Source 2 » / « Fenêtres S2 » / « Biomécanique S2 » / « Gradient Boosting S2 »** ([`translations.js:33, 85`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/translations.js#L85), [`HeroSection.jsx:150, 503`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/HeroSection.jsx#L503), [`Navbar.jsx:929`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/Navbar.jsx#L929), [`ItemsSection.jsx:297, 320`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/ItemsSection.jsx#L297))
  * *Pourquoi ça bloque* : « Source 2 » est le moteur physique 3D de Valve, mais abrégé en « S2 », un lecteur Data/Business lit **« Semestre 2 »** ou **« Saison 2 »** (*« 10 000 Fenêtres S2 »* ressemble à des fenêtres du 2e semestre !). De plus, *« Gradient Boosting S2 »* ou *« GradientBoost S2 (106f) »* laisse croire que « S2 » est une variante mathématique de l'algorithme Gradient Boosting !
  * *Solution* : Ne jamais abréger en « S2 » dans les titres ou noms d'algorithmes. Écrire **« moteur 3D Source 2 »** et supprimer « S2 » après « Gradient Boosting ».

### 3.2. Termes d'économie et de carte Deadlock (Partiellement expliqués mais souvent parachutés)
* **« Souls » / « Âmes » / « Unsecured Souls » / « Âmes instables » / « Net Worth » / « Souls·min » / « Unspent Gold Minutes »** ([`mockData.js:166, 387, 466, 1906`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/data/mockData.js#L166), [`ItemTelemetrySection.jsx:41, 113, 195, 971`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/ItemTelemetrySection.jsx#L971))
  * *Pourquoi ça bloque* :
    1. Le site alterne entre *« Souls »*, *« Âmes »* et parfois **« Or / Gold »** (*« Or Non Dépensé »*, *« Thésaurisation d'Or »*, *« Gold/min »* dans [`ArchitectureSection.jsx:374-379`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/ArchitectureSection.jsx#L374-L379) — vestige de Dota 2 et du nom de champ interne `gold_death_loss` du moteur Source 2 !). Pour un non-joueur, on ne sait plus s'il y a deux monnaies (les Âmes et l'Or) ou une seule.
    2. Le concept d'**« Âmes instables (Unsecured Souls) »** est cité dans la Gemme #7 (`mockData.js:159, 387`), le simulateur (`SimulatorSection.jsx:737`) et la Page 3 (`ItemTelemetrySection.jsx:92, 113, 174`) sans jamais expliquer **d'où elles viennent** (dans Deadlock, tuer des monstres neutres dans la jungle donne des âmes "non sécurisées" qui flottent dans une réserve temporaire et tombent au sol sous forme de globe récupérable par l'ennemi si le joueur meurt avant qu'elles ne soient sécurisées progressivement).
    3. L'unité **`Souls·min` (ex: `91 360 Souls·min`)** (`ItemTelemetrySection.jsx:41, 65, 88, 109, 131, 198`) est incompréhensible sans explication : c'est l'intégrale (le cumul minute par minute) de la monnaie gardée en poche sans être dépensée à la boutique.
* **« Lanes » / « Voies » / « Lignes » (Ambre, Jade, Saphir, Orchidée) & « Laning »** ([`DeadlockMapHeatmap.jsx:58, 739-753`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/DeadlockMapHeatmap.jsx#L739-L753), [`ItemTelemetrySection.jsx:286`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/ItemTelemetrySection.jsx#L286))
  * *Pourquoi ça bloque* : Le site utilise simultanément *« lane »*, *« ligne »* et *« voie »*. Surtout, un non-joueur de MOBA ne sait pas ce qu'est la *« phase de laning (0–10m) »* (le face-à-face initial en 1 contre 1 ou 2 contre 2 sur les 4 grandes avenues de la carte pour protéger sa première tour).
* **« Guardians (T1) », « Walkers (T2) », « Patron », « Sanctuaire / Fontaine de Spawn », « Shrines »** ([`dictionaryData.js:67-89`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/data/dictionaryData.js#L67-L89), [`DeadlockMapHeatmap.jsx:88, 788, 898`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/DeadlockMapHeatmap.jsx#L88), [`ItemTelemetrySection.jsx:200`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/ItemTelemetrySection.jsx#L200))
  * *Pourquoi ça bloque* : Le dictionnaire définit bien *Guardians*, *Walkers* et *Patron*, mais sur la Carte 2D (`DeadlockMapHeatmap.jsx`), on voit surgir **« Gardien T1 »**, **« Walker T2 »**, **« Camp Dur T3 »**, **« Fontaine de Spawn »** sans que « T1 / T2 / T3 » (Tier 1 = 1er rideau défensif, Tier 2 = 2e rideau défensif, Tier 3 = camp de monstres neutres très difficiles) ni « Fontaine de Spawn » (zone de départ et de réapparition sécurisée de l'équipe) ne soient explicités.
* **« Flex Slots » (Emplacements Flexibles) & les 3 catégories d'équipement (`Weapon`, `Vitality`, `Spirit`)** ([`dictionaryData.js:59`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/data/dictionaryData.js#L59), [`ItemTelemetrySection.jsx:45, 792, 987`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/ItemTelemetrySection.jsx#L792))
  * *Pourquoi ça bloque* : En Page 1 (bannière), Page 2 et Page 3, toute la démonstration repose sur le fait que les joueurs qui abandonnent n'achètent **« 0% d'items Vitality »** et n'achètent que du **« Weapon & Spirit »**. Or, il n'est jamais expliqué en introduction de la Page 2 ou de la Page 3 comment fonctionne l'inventaire de Deadlock : chaque joueur dispose de 3 familles d'emplacements dans sa boutique — **Weapon (Armes / Dégâts de tir, en orange)**, **Vitality (Vitalité / Points de vie, armure et survie, en vert)** et **Spirit (Esprit / Pouvoirs magiques et compétences, en violet)** — plus 4 emplacements universels (**Flex Slots**) débloqués en détruisant les tours ennemies. Sans cette clé de lecture d'une phrase, *« 0% Vitality 30m »* (affiché dès la bannière de la Page 1 dans `App.jsx:209` !) ressemble à un indicateur médical de fatigue physique du joueur !

### 3.3. Jargon de combat MOBA / Shooter non expliqué (Le "Franglais Esport")
Un lecteur non-gamer trébuche systématiquement sur ces 18 termes employés comme des évidences :
1. **« Stomp » / « Stomps en lane » / « Stomps expéditifs »** (`translations.js:77, 145`, `PsychologySection.jsx:615`, `DeadlockMapHeatmap.jsx:874`) : Signifie une partie à sens unique où une équipe écrase l'autre rapidement. Le mot n'est pas dans `DICTIONARY_TERMS` (bien qu'un identifiant orphelin `stomp` soit appelé dans `FactorAttribution.jsx:17`).
2. **« Gank » / « Ganké » / « Roam » / « Roamer »** (`mockData.js:166`, `deadlockMapData.js:514, 667`, `ItemTelemetrySection.jsx:92, 174`, `DeadlockMapHeatmap.jsx:139`) : Une embuscade surprise menée par un ennemi qui a quitté son couloir (*roamer*) pour venir créer un surnombre.
3. **« Dive » / « Dives sous Walker » / « Initiateur Dive »** (`deadlockMapData.js:531`, `mockData.js:2296`, `DeadlockMapHeatmap.jsx:133, 874`) : Plonger témérairement au cœur des défenses ennemies (souvent sous le feu d'une tour) pour tenter d'achever un adversaire.
4. **« CC » (Crowd Control)** (`ItemsSection.jsx:361, 1737, 2019`) : *« subir des headshots sous CC »*, *« #1 CC non-ultime »*, *« sans CC allié »*. Acronyme obscur pour un non-joueur (signifie *Contrôle de foule* : tout sort qui immobilise, étourdit ou paralyse).
5. **« APM » (Actions Par Minute)** (`Navbar.jsx:125`, `ItemsSection.jsx:555, 1879, 1886, 1896`) : Utilisé dès le menu de navigation (*« chute APM de -44% »*) avant toute explication. Il faut attendre la carte 3 du module 4 (`ItemsSection.jsx:1886`) pour lire *« fréquence d'actions (APM) »*.
6. **« DPS » / « Burst » / « One-shot » / « DoT » / « Poke »** (`translations.js:302`, `mockData.js:848, 1846, 2257, 2383`, `ItemTelemetrySection.jsx:77, 97`) : *DPS* (dégâts par seconde / puissance offensive), *Burst* (dégâts explosifs infligés en une fraction de seconde), *One-shot* (tuer d'un seul coup), *DoT* (Damage over Time : dégâts continus comme une brûlure ou un poison), *Poke* (harceler à distance à petits coups).
7. **« Solo Queue » vs « Party » / « Escouade »** (`translations.js:425`, `SimulatorSection.jsx:663`, `ItemsSection.jsx:97`) : *Solo Queue* signifie lancer la recherche de partie tout seul (sans amis pré-invités).
8. **« Feeder » / « Feeding »** (`ItemsSection.jsx:1345`) : *« le sentiment d'être un 'feeder' cloué au sol »*. Terme péjoratif désignant un joueur qui meurt en boucle et "nourrit" ainsi l'équipe adverse en monnaie.
9. **« Kit » / « Kits punitifs » / « Kits indulgents »** (`Navbar.jsx:29`, `ItemsSection.jsx:315, 493, 903`) : Désigne la panoplie des 4 compétences propres à un personnage (un héros). Pour un non-joueur, « kit » évoque un kit d'objets achetés en magasin, ce qui crée une confusion avec les *Items*.
10. **« Hitbox » / « Hitbox crânienne »** (`App.jsx:214`, `mockData.js:2354, 2371`) : L'enveloppe géométrique 3D invisible d'un personnage qui détecte si une balle le touche.
11. **« Canalisation (Channeling) »** (`mockData.js:2238, 2255, 2325`, `ItemsSection.jsx:427`) : Action de maintenir un sort pendant laquelle le personnage est obligé de rester figé ou ralenti pendant quelques secondes.
12. **« Frames d'invulnérabilité »** (`mockData.js:2453`) : Fractions de seconde (images d'animation) pendant lesquelles un personnage ne peut subir aucun dégât.
13. **« Singularité 5-man »** (`mockData.js:2487`) : Jargon pur (*attraper 5 joueurs ennemis d'un coup dans le trou noir de l'ultime Singularité*).
14. **« Contest du Rejuvenator »** (`deadlockMapData.js:463, 599`) : *« lors du contest du Rejuvenator »* (anglicisme pour *la dispute / la bataille pour la capture du cristal Rejuvenator*).
15. **« Rush » / « Rusher » / « Rushant »** (`translations.js:556`, `mockData.js:1886, 1906, 2261`, `ItemTelemetrySection.jsx:69, 92`) : Économiser pour acheter en priorité absolue un objet coûteux en sautant les étapes intermédiaires.
16. **« Build »** (`mockData.js:438, 1078`, `ItemTelemetrySection.jsx:537, 987`) : La combinaison d'équipements achetés par un joueur au fil de la partie.
17. **« KDA » / « GPM » / « XPM » / « SPM »** (`translations.js:412-414`, `FactorAttribution.jsx:91`) : *KDA* (ratio Éliminations + Assistances / Morts) n'est jamais développé. *SPM* (`1 610 SPM` dans `FactorAttribution.jsx:91`) signifie *Souls Par Minute*, mais est affiché sans légende. Quant à *GPM* (Gold Per Minute) et *XPM* (XP Per Minute), ce sont des variables internes héritées de Dota 2 qui apparaissent dans `ArchitectureSection.jsx:373` (*« GPM Delta »*, *« gold_per_min »*).
18. **« Autofill »** (`RiskGauge.jsx:478`, `FactorAttribution.jsx:448`) : Être assigné automatiquement par le jeu à un rôle ou une voie qu'on n'avait pas choisi.

---

## 4. Axe 2 : Audit de la Vulgarisation Machine Learning & Data Science

En tant que lecteur sensible aux enjeux Data/ML mais non-expert pointu, voici mon retour sur la façon dont la démarche scientifique et les modèles sont expliqués :

### 4.1. Ce qui est très bien vulgarisé
* **Le concept de Churn à 14 jours** : Très bien défini dès le Hero (`translations.js:73`) et dans le dictionnaire (`dictionaryData.js:217`). On comprend pourquoi 14 jours sans connexion est le seuil standard de l'industrie pour déclarer un joueur "perdu".
* **Le compromis Précision / Rappel et le rôle du Seuil $\theta^*$** : L'explication métier dans `ArchitectureSection.jsx:269-271` et `1128-1130` est excellente :
  > *« Comme les interventions (alliés calmes, quêtes douces) ne pénalisent pas le joueur, tolérer des faux positifs est 5× plus rentable que de subir un faux négatif (perte définitive du client). »*
  C'est exactement ce qu'un lecteur non-expert a besoin de lire pour comprendre pourquoi on abaisse le seuil de décision sous 0.50 afin de maximiser le Rappel (attraper 80 % des joueurs en détresse) même si la Précision baisse (fausses alertes inoffensives).
* **Le principe visuel de l'Attribution des Facteurs (SHAP)** : Le découpage visuel en deux colonnes **« Facteurs Aggravants »** vs **« Facteurs Protecteurs »** avec pour chaque variable la valeur observée comparée à la valeur de référence (`FactorAttribution.jsx:894-898`) rend les valeurs de Shapley intuitives (sous réserve de corriger les titres de colonnes issus de `translations.js:383-384` et les colonnes vides signalées en 6.5 !).
* **L'Étude d'Ablation (Section Psychologie & Benchmark)** : L'idée de tester chaque famille de données isolément (Visée seule = 53,8 % ROC-AUC, Économie seule = 64,5 %, les 7 Gemmes seules = 61,9 %, Tout combiné = 67,9 %) est un superbe outil pédagogique pour prouver l'apport de chaque source de données.

### 4.2. Ce qui manque d'explication ou induit le lecteur en erreur
1. **« Sans fuite temporelle » / « Zéro fuite calendaire (0% Calendar Leakage) » / « 100% In-Game Pure »** (`HeroSection.jsx:81, 547`, `KpiBar.jsx:109`, `MlBenchmarkSection.jsx:53`)
   * *Le problème* : C'est l'argument scientifique majeur du site, répété plus de 15 fois, mais **jamais expliqué simplement** ! Un non-expert ne comprend pas ce qu'est une « fuite calendaire » ni pourquoi un modèle « 100% In-Game Pure » a un ROC-AUC de 67,3 % au lieu de 95 %.
   * *Ce qu'il faut expliquer en 2 phrases* : Si l'on cherche à prédire si un joueur va arrêter de jouer pendant 14 jours après son match $T$, utiliser des variables calendaires comme « l'espacement en jours entre ses parties » (`avg_session_gap_days`) ou « le ralentissement de cadence » (`match_frequency_drift`) crée une triche statistique (si un joueur espace déjà ses parties de 10 jours, prédire qu'il va s'absenter 14 jours est trivial). En s'interdisant toute donnée de calendrier pour ne garder que ce qui se passe **à l'intérieur même de la partie** (sa visée, ses achats, ses morts), le problème est beaucoup plus difficile mais détecte la frustration **à la seconde où la partie se termine**, avant même que le joueur ne commence à espacer ses connexions.
2. **Le "Match Pivot $T$" et la "Fenêtre Glissante (5 récents vs 15 baseline)"** (`KpiBar.jsx:52`, `HeroSection.jsx:259`, `SimulatorSection.jsx:934`)
   * *Le problème* : On parle du « Match T (Rupture) » et de « 20 matchs (5 récents vs 15 baseline) » sans expliquer le dispositif expérimental. Le lecteur se demande : est-ce que le Match $T$ est le tout dernier match du joueur avant qu'il ne disparaisse ? Oui chez les churners, et un match tiré à la même époque de patch pour les joueurs fidèles. Et pourquoi comparer les 5 derniers matchs aux 15 précédents ? Pour mesurer **une dégradation récente par rapport au niveau habituel du joueur** (sa *baseline*), plutôt que son niveau absolu.
3. **Des métriques et hyperparamètres bruts parachutés dans les tableaux** :
   * Dans `MlBenchmarkSection.jsx:100-132`, les noms des modèles affichent : `Gradient Boosting (Depth-3, Colsample=0.50, Subsample=0.75)`, `Extra Trees (Pruned Depth-7, Colsample=0.50)`, `Random Forest (Pruned Depth-6, MinLeaf=40)`, `Calibrated HistGradient (Sigmoid Calibration)`, `HistGradientBoosting + In-Fold SMOTE`, `Réseau MLP (64x32 ReLU, L2 alpha=0.6)`.
   * *Le problème* : Pour un non-expert ML, `Colsample=0.50`, `Subsample=0.75`, `Pruned Depth-6, MinLeaf=40`, `In-Fold SMOTE`, `64x32 ReLU, L2 alpha=0.6` ou `Brier Score de 0.2016` sont du chinois.
   * De même, dans `InteractiveCurves.jsx:606`, un encadré affiche **`PPV Prod (Bayes) : 14.8%`** sans aucune infobulle ni explication de ce que signifie « PPV Prod (Bayes) » (Valeur Prédictive Positive en production corrigée par le théorème de Bayes selon la prévalence réelle du churn).
4. **La définition erronée du ROC-AUC et de SHAP dans le Dictionnaire !** (`dictionaryData.js:157-172`)
   * Dans le dictionnaire censé aider le lecteur, la définition de **ROC-AUC** dit :
     > *« Capacité discriminante globale du modèle à séparer les parties gagnées des parties perdues, indépendamment du seuil de décision choisi. Impact dans l'étude : Notre modèle champion atteint 81.42% ROC-AUC à la 10e minute de jeu. »*
   * Et la définition de **SHAP** dit :
     > *« Permet d'expliquer à chaque joueur pourquoi le modèle estime ses chances de victoire à 84% ou 18%. »*
   * *Le problème* : Le dictionnaire explique un modèle de **prédiction de victoire de match à la 10e minute**, alors que tout le site présente un modèle de **prédiction d'abandon du jeu (churn) à 14 jours** ! Un lecteur qui clique sur ROC-AUC ou SHAP pour comprendre le site se retrouve complètement perdu.
5. **La section "Au-delà du Snapshot : Dynamique Temporelle & Modèles Séquentiels"** (`ArchitectureSection.jsx:1177-1317`)
   * Elle introduit coup sur coup la *courbe de survie conditionnelle $S(t \mid H_t)$*, le *taux de hasard $h(t)$* (attention : anglicisme mathématique, en français statistique *hazard rate* se traduit par **« taux de risque instantané »**, car « Survie & Hasard » fait penser au hasard/chance aléatoire !), les *Temporal Fusion Transformers*, et les *Processus Ponctuels Auto-Excitants de Hawkes* avec la formule $h(t \mid x(t)) = h_0(t) \cdot \exp(\beta^T x(t) + \sum \alpha_k \cdot \exp(-\delta \cdot (t - t_k)))$.
   * Si l'ouverture R&D est très valorisante, la formule mathématique est posée sans légender ses termes ($h_0(t)$ = risque de base, $\alpha_k$ = choc émotionnel de la défaite $k$, $\delta$ = vitesse d'apaisement pendant une pause).

---

## 5. Axe 3 : Clarté du Storytelling, Qualité du Français, Anglicismes & Bugs d'Affichage Textuel

### 5.1. Bugs techniques d'affichage de texte, d'infobulles et de traduction en français
Au cours de l'inspection ligne par ligne du code React et des données JSON/JS, j'ai relevé **9 bugs concrets** qui dégradent le texte français affiché à l'écran :

1. **Bug de casse typographique en Page 2 (`ItemsSection.jsx:256`)** :
   * Texte actuel : `'BIOMARQUEurs • MATRICE HÉROS • CARTE 2D • PARRY • 2026'`
   * Même avec `text-transform: uppercase` en CSS, la chaîne source contient une faute de frappe manifeste (`BIOMARQUEurs`).
2. **Formules LaTeX brutes non rendues dans l'Étape 04 de l'Architecture (`ArchitectureSection.jsx:242, 251`)** :
   * Texte actuel : `'Probabilités continues prédites $P(\\text{churn} \\mid X) \\in [0, 1]$'` et `'Seuil optimal retenu : $\\theta^* = 0.36$'`.
   * *Problème* : Le projet n'utilise ni KaTeX ni MathJax. Le navigateur affiche donc littéralement à l'écran les dollars et antislashs bruts : `$P(\text{churn} \mid X) \in [0, 1]$` et `$\theta^* = 0.36$` !
3. **Backticks Markdown bruts non rendus dans `ArchitectureSection.jsx` (`lignes 98, 99, 116, 118, 119, 149, 156, 157, 158, 167, 195, 202, 206, 290, 291, 292, 942, 1142`)** :
   * Texte actuel : `` 'Account ID Steam 32-bit (`account_id`)' ``, `` 'Requête HTTP GET `/api/predict/{account_id}`' ``.
   * *Problème* : Rendu dans un `<li>` ou `<span>` React sans parseur Markdown, l'utilisateur voit les apostrophes inversées `` `account_id` `` s'afficher telles quelles au lieu d'une balise `<code>`.
4. **10 identifiants `<GlossaryTerm>` / `openDictionary` cassés (et bug de recherche par alias dans `DictionaryDrawer.jsx:27, 34`)** :
   * Dans `KpiBar.jsx:56` : `termId: 'rolling_window'` (absent du dictionnaire).
   * Dans `KpiBar.jsx:86` : `termId: 'pr_auc'` (absent du dictionnaire, seul `roc_auc` existe).
   * Dans `FactorAttribution.jsx:10-26` : la table `FEATURE_DICT_MAP` associe des variables aux 8 identifiants `'night_owl'`, `'party_size'`, `'souls_per_min'`, `'rank_tier'`, `'stomp'`, `'kda'`, `'objective_control'`, `'aim_accuracy'`.
   * **Aucun de ces 10 identifiants ne correspond à un `id` de `DICTIONARY_TERMS`** ! Même pour `'night_owl'`, qui existe comme *alias* de `id: 'night_owl_pct'` dans `dictionaryData.js:140`, `DictionaryDrawer.jsx:27, 34` cherche strictement `item.id === activeTermId` et `document.getElementById('dict-card-' + activeTermId)` sans résoudre l'alias via `findDictionaryTerm()`. De plus, `DictionaryDrawer.jsx` n'affiche jamais les termes de `DEADLOCK_GLOSSARY`.
5. **Infobulles incohérentes sur la Carte Tactique 2D (`deadlockMapData.js:450-1200` & `DeadlockMapHeatmap.jsx:840-845`)** :
   * Dans `DEADLOCK_TELEMETRY_EVENTS`, la phrase `cause_fr` a été générée aléatoirement sans respecter la zone (`zone_fr`), le héros (`hero`) ni la minute (`time_min`) du point survolé !
   * Résultat au survol de la carte par l'utilisateur :
     * Point `d_2` (`deadlockMapData.js:469-483`) : `📍 Sanctuaire de Spawn Nord` (la base de départ !) + `Interception fatale en portant l'Urne à travers la jungle sans escorte`.
     * Point `d_5` (`deadlockMapData.js:519-534`) : `⏱ 0.9m` + `📍 Lane Saphir • Gardien T1 Sud` + `Dive sous Walker ennemi sans item de Vitalité` (à 54 secondes de jeu sur un Gardien T1 !).
     * Point `d_14` (`deadlockMapData.js:672-687`) : `Yamato` + `📍 Lane Ambre • Walker T2 Nord` + `Interception en vol stationnaire par tirs nourris` (Yamato est une épéiste au sol qui ne vole pas !).
     * Point `d_15` (`deadlockMapData.js:689-704`) : `⏱ 4.9m` + `📍 Jungle Est • Autel de l'Urne & Chokepoint` + `Embuscade dans la fosse lors du contest du Rejuvenator` (le Mid-Boss n'apparaît qu'à 10 minutes et se trouve au centre de la carte, pas dans la jungle Est !).
6. **Contradiction interne sur l'objet `Hollow Point Ward` en Page 3 (`ItemTelemetrySection.jsx` vs `mockData.js`)** :
   * Sur la même Page 3 (`ITEM`), `Hollow Point Ward` est décrit à 3 endroits avec **3 paliers, 3 prix et 2 seuils de PV différents** :
     * Dans `MOCK_ITEMS_DATA` (`mockData.js:1356-1367`) : **Tier 1, 500 Souls, actif au-dessus de 70 % de PV**.
     * Dans la frise `PURCHASE_SEQUENCES` (`ItemTelemetrySection.jsx:74`) : **Tier W2, 1 250 Souls, désactivé sous 60 % de PV**.
     * Dans le catalogue `MOCK_ITEM_CHURN_ANALYTICS` (`mockData.js:1970-1987`) : **Tier 3, 3 000 Souls, désactivé sous 60 % de PV**, et son texte explicatif l'appelle **`Schéma #2`** alors que la grille des schémas juste à côté (`ItemTelemetrySection.jsx:179-189`) le classe en **`SCHÉMA #3`** !
7. **Confusion entre taux de Headshots (28,7 %) et taux de Churn (41,7 %) de Seven dans la barre de navigation (`Navbar.jsx:105`) + écarts sur les taux de churn des héros** :
   * Dans `Navbar.jsx:105`, le menu déroulant dit : *« Pourquoi Yamato (60%), Vindicta (45%), Lash (36%) et **Seven (29%)** font fuir les joueurs »*. Or, **28,7 % (~29 %) est le taux de headshots subis par Seven**, pas son taux de churn qui est de **41,7 %** (`ItemsSection.jsx:536, 1350`) ou **42,1 %** (`DeadlockMapHeatmap.jsx:48`) !
   * De même, le taux de churn de `Dynamo` varie entre `19.2%` (`translations.js:534`), `18.9%` (`DeadlockMapHeatmap.jsx:53`) et `20.0%` (`ItemsSection.jsx:1481`), et celui de `Pocket` entre `18.8%` (`ItemsSection.jsx:1481`) et `19.4%` (`DeadlockMapHeatmap.jsx:52`).
8. **Textes restés en anglais dans la version française** :
   * `HeroSection.jsx:42` : `<span className="hero-eyebrow-sub">ACADEMIC & INDUSTRY SHOWCASE • 2026</span>` (non traduit en français).
   * `HeroSection.jsx:148` : `<span>telemetry_stream // match_T_prediction // cutoff_horizon_14d</span>` et `150` : `Source 2 ML • 100% In-Game Pure`.
   * `HeroSection.jsx:380` : `<span className="hud-value glow-rose">-4.2 Games</span>` (« Games » au lieu de « Matchs »).
   * `HeroSection.jsx:496, 533` : `FASTAPI ENGINE`, `TREESHAP EXPLAINABILITY ✦`.
   * `App.jsx:209` : `+78.6% STUN HEADSHOTS • 0% VITALITY 30M`.
   * `MlBenchmarkSection.jsx:333, 351` : Les boutons d'onglets des courbes sont codés en dur en anglais : `ROC Curve (80.0%)` et `PR Curve (79.3%)`.
   * `MlBenchmarkSection.jsx:741, 767, 798, 824` : Les cellules de la matrice de confusion sont codées en dur en anglais : `True Pos (TP)`, `False Neg (FN)`, `False Pos (FP)`, `True Neg (TN)`, `25.0% total (79.5% rec)`, `(20.5% miss)`, `(70.0% spec)`.
   * `ItemsSection.jsx:293` : Le titre H1 français affiche `Dynamique Héros & Player Churn` (« Player Churn » en anglais au lieu de « Abandon Joueur (Churn) »).
   * `ItemsSection.jsx:1478` : Le badge en français affiche `THE RETENTION ANCHORS` (non traduit).
   * `ItemTelemetrySection.jsx:1590` : Le badge en bas de page affiche `✓ ACTIONABLE RETENTION DESIGN` (non traduit).
9. **Le filtre de catégories du graphique d'Importance des Variables est cassé (`MlBenchmarkSection.jsx:896-909` et `mockData.js:1630-1635`)** :
   * Les boutons de filtre proposent : `Toutes les Variables`, `Précision de Tir 3D` (`id: "aim"`), `Économie des Souls` (`id: "economy"`), `Combat & Objectifs` (`id: "combat"`), `Psychologie & Tilt` (`id: "psychology"`).
   * Or, dans `FEATURE_IMPORTANCE_LIST` (`mockData.js:330-410`), **7 des 8 variables les plus importantes du modèle** ont pour catégorie `category: "hidden_gems"` ! Il n'y a **aucun bouton de filtre pour "Les 7 Gemmes Cachées"** (alors qu'elles représentent le top 5 du graphique !), et la fonction de couleur `getCategoryColor` (`MlBenchmarkSection.jsx:896`) teste `case 'behavior':` et `case 'ranked':` qui n'existent même pas dans les données !

### 5.2. Anglicismes maladroits et tournures à améliorer
* **« haute composure morale » / « Coéquipier Haute Composure »** (`PsychologySection.jsx:66`, `RiskGauge.jsx:463, 466`) : *Composure* est un mot anglais. En français, on dit **« sang-froid »**, **« calme »** ou **« maîtrise de soi »** (*« coéquipiers au sang-froid exemplaire »*).
* **« Proposer un nudge vers un mode détente » / « Nudge Post-Partie »** (`RiskGauge.jsx:455`, `ItemsSection.jsx:2040`) : Anglicisme comportemental. Préférer **« incitation douce »** ou **« suggestion bienveillante »**.
* **« les joueurs qui churnent » / « les churners »** (`mockData.js:2551`, `ItemsSection.jsx:809`) : Le verbe « churner » est très jargonneux en français. Varier avec **« les joueurs en partance »**, **« les joueurs qui décrochent »**, **« les joueurs sur le départ »**.
* **« sur-indexé par les churners » / « Sur-Index Churn »** (`translations.js:519`, `ItemTelemetrySection.jsx:1528`) : Calque de l'anglais marketing *over-indexed*. En français clair : **« sur-représenté chez les décrocheurs (+118,7 %) »** ou **« acheté 2,2× plus souvent par les joueurs qui abandonnent »**.
* **« lors du contest du Rejuvenator »** (`deadlockMapData.js:463, 599, 701, 735, 786`) : Anglicisme pour **« lors de la bataille pour le Rejuvenator »** ou **« en disputant le Rejuvenator »**.
* **« l'onglet ITEM » / « Ouvrir Espace ITEM »** (`Navbar.jsx:30`, `App.jsx:253`) : Pourquoi « ITEM » en majuscules, au singulier et en anglais, alors que le deuxième onglet s'appelle « Dynamique Héros & Churn » ? En français, **« Équipements & Achats »** ou **« Achats & Objets (Items) »** serait infiniment plus élégant et compréhensible.

---

## 6. Axe 4 : Audit Détaillé Page par Page & Section par Section (avec Réécritures Prêtes à Copier-Coller)

---

### 6.1. Navigation Globale, Toast de Bienvenue, Modale "Deadlock & Projet" & Dictionnaire

#### A. Barre de Navigation (`Navbar.jsx` & `translations.js:10-59`)
* **Points positifs** :
  * Architecture à 3 onglets avec menus déroulants au survol très informative (chaque sous-section a un numéro et un sous-titre).
  * Présence bien visible du bouton `Deadlock & Projet` à droite.
* **Points négatifs & Textes problématiques** :
  1. Le nom du 3e onglet **`ITEM`** (`translations.js:30`) est sec, en anglais, au singulier et tout en majuscules, ce qui détonne avec `Principal` et `Dynamique Héros & Churn`.
  2. Dans `Navbar.jsx:105`, la description du chapitre 02 affiche **`Seven (29%)`** au lieu de **`Seven (42%)`** (confondant son taux de headshots subis de 28,7 % avec son taux de churn de 41,7 %).
  3. Dans les descriptions de survol (`translations.js:33-38`, `Navbar.jsx:125, 139`), le jargon est trop dense pour un menu de navigation :
     * *« Introduction, enjeux du churn à 14j & méthodologie Source 2 »* (`translations.js:33`)
     * *« Pipeline d'ingestion Valve GC vers FastAPI & React 19 »* (`translations.js:38`)
     * *« Pourquoi se faire parer inflige 4.0s de stun, induit une chute APM de -44% et provoque le ragequit »* (`Navbar.jsx:125`)
     * *« Autopsie minute par minute : 13 items sans Vitality, piège Hollow Point & 4 schémas »* (`Navbar.jsx:139`)
  4. Dans le menu Burger (`Navbar.jsx:874`), il est écrit : *« 21 termes e-sport & ML définis »*, mais `DICTIONARY_TERMS` dans `dictionaryData.js` en compte en réalité **19**.
* **Propositions de réécriture prêtes à copier-coller** :
  * **`translations.js:30-38`** :
    ```javascript
    itemTab: "Équipements & Achats",
    itemTabBadge: "NOUVEAU",
    itemTabSub: "Chronologie d'achats 0–35 min, 4 erreurs types & catalogue complet",
    heroDesc: "Introduction, enjeux de l'abandon à 14 jours & méthode sans biais",
    kpisDesc: "10 000 séquences analysées, 106 signaux en match & performances ML",
    psychologyDesc: "Simulateur de frustration (Tilt), dégradation de visée 3D & 7 Gemmes Cachées",
    benchmarkDesc: "Comparatif des modèles, étude d'ablation, courbes ROC/PR & poids SHAP",
    simulatorDesc: "4 profils de joueurs types & diagnostic par identifiant Steam en direct",
    architectureDesc: "Architecture complète : de l'API Deadlock au microservice FastAPI & React 19"
    ```
  * **`Navbar.jsx:105`** :
    ```javascript
    ? 'Pourquoi Yamato (60%), Vindicta (45%), Seven (42%) et Lash (36%) font fuir les joueurs'
    ```
  * **`Navbar.jsx:125-126`** :
    ```javascript
    ? "Pourquoi subir un contre au corps-à-corps (4s de paralysie) fait chuter l'activité de -44% et déclenche l'abandon immédiat"
    ```
  * **`Navbar.jsx:139-140`** :
    ```javascript
    ? "Autopsie minute par minute : 13 achats offensifs sans aucune défense, objets pièges & 4 erreurs types"
    ```

#### B. Modale "Comprendre Deadlock & l'Objectif de cette Étude" (`AboutDeadlockModal.jsx`)
* **Points positifs** :
  * Le premier paragraphe (`lignes 110-112`) résume très bien le concept hybride de Deadlock (6 contre 6, 4 lignes, tir 3D, Guardians, Walkers, Soul Urn, Patron) avec des liens `<GlossaryTerm>`.
  * La frise causale en 4 étapes (`01 Perte Guardian & Retard Souls → 02 Chute de Précision → 03 Spirale de Morts & Tilt Aigu → 04 Décrochage & Churn Joueur`) est limpide.
  * La citation de fin (*« Dans un hero shooter 3D, la frustration se lit d'abord dans le réticule de visée avant de se traduire par la désinstallation du jeu »*) est percutante.
* **Points négatifs & Textes problématiques** :
  * **Le chapeau (`translations.js:690`) et le 2e paragraphe (`AboutDeadlockModal.jsx:144-146`) racontent une étude différente du reste du site !**
    > *Citation exacte (`AboutDeadlockModal.jsx:144-146`)* : « Ce projet modélise les 48 features clés extraites de la télémétrie Valve GC : visée 3D (ratio de tirs critiques et régularité), dynamique de collecte d'âmes, sécurisation des objectifs neutres et fixation sur les ralentis de mort. L'algorithme V1 XGBoost anticipe l'issue du match dès 10 minutes avec 81.4% de ROC-AUC, permettant d'alimenter des politiques de matchmaking bienveillantes pour réduire le tilt sans fausser l'équité sportive. »
  * *Pourquoi ça bloque* : Le lecteur ouvre cette modale pour comprendre le site, et on lui dit que le modèle prédit **l'issue du match (qui va gagner la partie) dès la 10e minute avec 48 features et 81,4 % de ROC-AUC**, alors que la page derrière la modale prédit **l'abandon du jeu à 14 jours (Churn) avec 106 features et 79,5 % de rappel** !
* **Proposition de réécriture prête à copier-coller (`AboutDeadlockModal.jsx:144-146`)** :
  ```jsx
  <p>
    Ce projet modélise <strong className="editorial-orange">106 signaux comportementaux purs</strong> extraits des parties : dégradation de la visée 3D, vulnérabilité aux tirs à la tête sous étourdissement (<em>Stun</em>), erreurs d&apos;achats en boutique, isolement en solo et temps passé mort devant un écran gris. Notre modèle champion (<strong className="editorial-white">Gradient Boosting régularisé</strong>) identifie dès la fin d&apos;une partie <strong className="editorial-orange">79,5 % des joueurs qui risquent de quitter le jeu pendant 14 jours</strong>, permettant au studio de déclencher des mesures préventives bienveillantes (suggestion de pause, coéquipiers apaisants) sans jamais truquer l&apos;équité sportive.
  </p>
  ```

#### C. Dictionnaire Interactif (`dictionaryData.js` & `DictionaryDrawer.jsx`)
* **Points positifs** :
  * Excellente ergonomie (recherche instantanée, filtres Gaming / Psychologie / ML, encadré « Impact dans l'étude » sur chaque carte).
* **Points négatifs & Textes problématiques** :
  1. **Contradictions internes dans les définitions** :
     * `roc_auc` (`dictionaryData.js:157-160`) et `shap` (`lignes 169-172`) parlent de prédire la victoire du match à la 10e minute (81,42 % ROC-AUC).
     * `churn` (`ligne 219`) affirme : *« Le taux de churn naturel de la cohorte est de 32.3%. »*, alors que `KpiBar.jsx:119` et `MOCK_METRICS:25` affichent **24,3 % (24.26%)** et `ArchitectureSection.jsx:197` affiche **49,6 %** !
  2. **Termes indispensables manquants dans `DICTIONARY_TERMS` (et non-résolution des alias dans `DictionaryDrawer.jsx`)** :
     * Il manque les définitions des 3 catégories d'objets (**Weapon / Vitality / Spirit**), des **Âmes instables (Unsecured Souls)**, du **Stomp**, du **PR-AUC**, de la **Fenêtre Glissante (Rolling Window)** et de la **Fuite Temporelle / Étude d'Ablation**.
     * De plus, dans `DictionaryDrawer.jsx:27`, remplacer `DICTIONARY_TERMS.find((item) => item.id === activeTermId)` par `findDictionaryTerm(activeTermId)` permettra de résoudre les alias (comme `'night_owl'` → `'night_owl_pct'`).
* **Propositions de réécriture prêtes à copier-coller (`dictionaryData.js:155-173` & `219`)** :
  ```javascript
  // roc_auc (lignes 155-160)
  termFr: "Score ROC-AUC (Aire sous la Courbe ROC)",
  shortDefFr: "Mesure globale (de 50% à 100%) de la capacité du modèle à distinguer un joueur qui va abandonner le jeu (Churn) d'un joueur qui va rester actif, quel que soit le seuil d'alerte choisi.",
  takeawayFr: "Notre modèle 100% In-Game atteint 67,3% de ROC-AUC (69,7% normalisé) uniquement à partir du comportement en match, sans aucune donnée de calendrier.",

  // shap (lignes 167-172)
  termFr: "Valeurs SHAP (Explicabilité Prédictive)",
  shortDefFr: "Méthode mathématique issue de la théorie des jeux (valeurs de Shapley) qui décompose une prédiction individuelle pour montrer précisément quels facteurs augmentent ou réduisent le risque de départ d'un joueur.",
  takeawayFr: "Permet d'expliquer de façon transparente pourquoi tel joueur présente 88% de risque d'abandon (ex: +32% liés à sa série de défaites, +28% liés à son score de tilt).",

  // churn (ligne 219)
  takeawayFr: "Le taux d'abandon à 14 jours dans notre cohorte de référence est de 24,3%. Notre modèle intercepte près de 8 départs sur 10 uniquement via les signaux de jeu."
  ```

---

### 6.2. Page 1 ("Principal") — Hero Section & Barre de KPIs

#### A. Hero Section (`HeroSection.jsx` & `translations.js:62-89`)
* **Points positifs** :
  * Titre principal percutant, visuel de télémétrie animé très immersif avec des puces cliquables ouvrant le dictionnaire (`SEUIL θ* = 0.25 ✦`, `TILT : 4.8 / CRIT ✦`, `SÉRIE DÉFAITES ✦`, `GUARDIAN < 8M ✦`, `ÉCRAN GRIS ✦`, `PROBA CHURN ✦`).
  * Les 3 piliers éditoriaux en bas du Hero (`01 Enjeu Économique`, `02 Psychologie du Tilt`, `03 Matchmaking Préventif`) posent très bien le cadre métier.
* **Points négatifs & Textes problématiques** :
  1. **Sous-titre du Hero (`translations.js:66`)** :
     > *Citation exacte* : « Analyse comportementale et prédiction du désengagement à 14 jours (Churn) sur Deadlock. Modélisation des spirales de défaites, de la fatigue nocturne, de la dégradation de visée 3D (headshots) et des ralentis de mort Valve GC sans fuite temporelle. »
     * *Problème* : « ralentis de mort Valve GC sans fuite temporelle » en fin de première phrase d'accueil combine un acronyme inconnu (« Valve GC ») et un concept ML (« sans fuite temporelle ») qui semble rattaché grammaticalement aux ralentis de mort !
  2. **Pilier 01 (`translations.js:73`)** :
     > *Citation exacte* : « Identifier ce décrochage en amont préserve la rétention des joueurs et la santé du matchmaking classé sans fuite temporelle. »
     * *Problème* : La fin de phrase *« sans fuite temporelle »* dans un paragraphe qui parle d'économie du jeu vidéo tombe comme un cheveu sur la soupe.
  3. **Bandeau technologique et badges en anglais** : `ACADEMIC & INDUSTRY SHOWCASE • 2026` (`ligne 42`), `-4.2 Games` (`ligne 380`), `GRADIENT BOOSTING S2` (`ligne 503`), `TREESHAP EXPLAINABILITY ✦` (`ligne 533`).
* **Propositions de réécriture prêtes à copier-coller** :
  * **`translations.js:66` (Sous-titre Hero)** :
    ```javascript
    subtitle: "Étude comportementale et prédiction de l'abandon des joueurs à 14 jours (Churn) sur Deadlock, le jeu de tir tactique 6v6 de Valve. Modélisation des spirales de défaites, de la fatigue nocturne, de la chute de précision au tir 3D et des signaux de frustration directement en cours de partie.",
    ```
  * **`translations.js:73` (Pilier 01)** :
    ```javascript
    desc: "Dans un jeu compétitif en ligne, 14 jours consécutifs sans connexion marquent le point de rupture où un joueur quitte définitivement le jeu. Détecter cette détresse dès la fin d'un match permet d'agir à chaud pour préserver la fidélité des joueurs et l'équilibre des parties classées."
    ```
  * **`translations.js:77` (Pilier 02)** :
    ```javascript
    desc: "L'abandon dans Deadlock n'est jamais un hasard : il naît d'une accumulation de frustrations en partie (séries de défaites, perte rapide des premières tours de défense, sessions nocturnes épuisantes, chute de précision au tir et fixation sur les ralentis de sa propre mort)."
    ```

#### B. Barre de KPIs (`KpiBar.jsx` & `translations.js:91-131`)
* **Points positifs** :
  * Présentation horizontale monumentale en 5 colonnes numérotées (`01` à `05`) très lisible.
* **Points négatifs & Textes problématiques** :
  1. **Conflit entre les valeurs dynamiques (`MOCK_METRICS` hors-ligne vs `/api/ml/metrics` en ligne) et les textes des cartes (`translations.js:96-130`)** :
     * La carte `01` affiche `10 000 Fenêtres Analysées`, mais son sous-texte (`translations.js:99`) dit : *« 1 500 joueurs uniques, 923 185 matchs Source 2 et 10 000 fenêtres temporelles dé-biaisées »*, alors que le Hero juste au-dessus affiche `N = 5 293 Matchs Source 2` (`HeroSection.jsx:79`) !
     * La carte `04` affiche `79.5%` hors-ligne (issue de `MOCK_METRICS.recall = 0.7952`) et `77.4% - 80.3%` en ligne (car `/api/ml/metrics` ne renvoie pas `recall`), son badge affiche `θ* = 0.36 ✦` (`KpiBar.jsx:73`, qui contredit `θ* = 0.25` du Hero), et son sous-texte (`translations.js:114`) dit : *« Détection de 8 churners sur 10 (MLP Réseau Neuronal 80.3%, Gradient Boosting 77.4%) »* — deux chiffres qui contredisent le tableau du Benchmark !
     * La carte `05` affiche **`67.3% / 50.9%`** hors-ligne (et **`77.1% / 72.5%`** en ligne), mais son badge juste au-dessus est codé en dur avec **`PR-AUC 57.8% ✦`** (`KpiBar.jsx:83`) ! Voir `50.9%` en gros chiffre orange et `PR-AUC 57.8%` dans le badge de la même colonne à 2 centimètres d'écart donne l'impression d'un bug manifeste.
  2. **Liens dictionnaire muets** : Cliquer sur `Fenêtre Glissante ✦` (`termId: 'rolling_window'`) ou `PR-AUC 57.8% ✦` (`termId: 'pr_auc'`) n'aboutit à aucun terme du dictionnaire.
* **Propositions de réécriture prêtes à copier-coller (`translations.js:96-130` & `KpiBar.jsx:73, 83`)** :
  ```javascript
  // translations.js:96-130
  cards: {
    datasetSize: {
      value: "10 000",
      label: "Séquences Analysées",
      desc: "10 000 séquences de jeu dé-biaisées extraites via l'API Deadlock (1 170 joueurs uniques, 5 293 matchs complets)"
    },
    windowSize: {
      value: "20 Matchs",
      label: "Fenêtre d'Observation",
      desc: "Comparaison entre les 5 derniers matchs du joueur et ses 15 matchs précédents (niveau habituel) avant le match pivot T"
    },
    featuresCount: {
      value: "106",
      label: "Signaux En Match Purs",
      desc: "Indicateurs de visée 3D, économie d'âmes, survie et psychologie (dont les 7 Gemmes Cachées, 0% biais de calendrier)"
    },
    recall: {
      value: "79.5%",
      label: "Rappel Churn (14 Jours)",
      desc: "Près de 8 joueurs sur 10 sur le point d'abandonner le jeu sont détectés dès la fin de leur match (record à 88,6% via Extra Trees)"
    },
    rocPrAuc: {
      value: "67.3% / 50.9%",
      label: "ROC-AUC / PR-AUC",
      desc: "Pouvoir discriminant et précision-rappel sur l'échantillon de test indépendant (contre 24,3% au hasard)"
    }
  }
  ```
  *(Et dans `KpiBar.jsx:73` et `83`, remplacer les badges codés en dur par `badge: 'θ* = 0.25 ✦'` et `badge: \`PR-AUC ${prAucVal} ✦\``).*

---

### 6.3. Page 1 ("Principal") — Psychologie du Joueur & Les 7 Gemmes Cachées

#### Analyse de `PsychologySection.jsx` & `mockData.js:84-169`
* **Points positifs** :
  * L'organisation en 2 vues commutables (`💎 Les 7 Gemmes Cachées Source 2` vs `🔬 Simulateur Tilt & Catalogue In-Game`) est très claire.
  * Les 7 cartes des Gemmes Cachées avec la comparaison directe `Joueurs Churn` (en rouge) vs `Fidélisés` (en vert), l'écart relatif `Δ` et la `p-value` sont un modèle de communication scientifique.
  * Le simulateur interactif de l'Indice de Tilt avec ses 4 curseurs et la recommandation studio qui s'adapte dynamiquement (`Serein`, `Légèrement Frustré`, `Énervé`, `Tilt Extrême`) est ludique et très pédagogique.
* **Points négatifs & Textes problématiques** :
  1. **Numérotation incohérente des 7 Gemmes Cachées entre les cartes et le reste du site** :
     * Dans `MOCK_HIDDEN_GEMS_AUDIT` (`mockData.js:84-169`), l'ordre des 7 gemmes est :
       * **Gemme #1** : Le Bouclier Social (`solo_isolation_streak`)
       * **Gemme #2** : Déficit Headshot & Humiliation sous Stun (`stun_headshots_taken_rate`)
       * **Gemme #3** : Parades Manquées (`parry_miss_per_match`)
       * **Gemme #4** : Ratio d'Écran Gris (`grey_screen_ratio`)
       * **Gemme #5** : Revente Panique d'Objets (`late_panic_sells`)
       * **Gemme #6** : Altruisme & Soutien d'Équipe (`teammate_support_per_min`)
       * **Gemme #7** : Refuge Street Brawl & Perte d'Âmes Instables (`street_brawl_affinity`)
     * Mais dans `enrich_hidden_gems.py:10-16` et `FEATURE_IMPORTANCE_LIST` (`mockData.js:336, 396`), **Gemme #1 est `Unsecured Souls Lost`**, **le Bouclier Social est appelé « Gemme #6 »**, **l'Altruisme est appelé « Gemme #7 »**, et dans le Dictionnaire (`dictionaryData.js:227-230`), **« Gemme Cachée #1 » est la « Perte de Guardian Précoce (< 8 min) »** ! Le lecteur voit donc 3 numérotations différentes pour les "7 Gemmes Cachées".
  2. **Le "Refuge Street Brawl" (Gemme #7, `mockData.js:159-167`) n'est jamais expliqué** :
     > *Citation exacte* : « Les joueurs en tilt fuient vers le mode condensé Street Brawl (+39.2%) après des défaites frustrantes et perdent +18.4% d'âmes instables par minute lors de ganks de lane. »
     * *Pourquoi ça bloque* : Qu'est-ce que « Street Brawl » ? Un non-joueur ne sait pas s'il s'agit d'un autre jeu vidéo (comme Brawl Stars ou Street Fighter), d'un quartier de la carte ou d'un mode de jeu rapide (c'est le mode de jeu condensé en 14 minutes `game_mode=4` de Deadlock, comme l'indique `enrich_hidden_gems.py:17`). Et la phrase mélange deux choses sans rapport : fuir vers un mode de jeu rapide ET perdre des âmes instables lors de « ganks de lane ».
  3. **Dans l'onglet 2 (`Simulateur Tilt & Catalogue In-Game`, `PsychologySection.jsx:447-463`), les boutons des 6 onglets affichent les noms de variables informatiques bruts en anglais avec underscores** :
     * L'utilisateur voit des boutons intitulés : `tilt_index`, `stun_headshots`, `solo_isolation`, `late_panic_sells`, `grey_screen`, `teammate_support` au lieu de leurs noms en français !
  4. **L'échelle et la formule du `Tilt Index` dans `PsychologySection.jsx` contredisent `backend/app/services/feature_service.py` et `SimulatorSection.jsx`** :
     * Dans `PsychologySection.jsx:31-44, 100-110`, le code affiche un extrait étiqueté `# backend/app/services/feature_service.py` où le score de tilt va de **`0.00` à `~6.00`** (avec le seuil de « Tilt Extrême » à **`>= 4.0`**).
     * Or, dans le vrai fichier [`backend/app/services/feature_service.py:60-76`](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/services/feature_service.py#L60-L76) (ainsi que dans `backend/collect_data.py:426-436` et dans `SimulatorSection.jsx:868`), l'Indice de Tilt est calculé sur une **échelle de `0.0` à `100.0`** (`82.5` pour le Fantassin en Tilt Aigu, `54.0` pour le Vétéran Épuisé, `18.0` pour le Gardien des Objectifs, `8.5` pour le Joueur Serein) !
     * Le lecteur qui vient de manipuler le curseur où `4.0 = Tilt Extrême (Ragequit Imminent)` ne comprend pas pourquoi, deux écrans plus bas, un joueur « Serein » a un score de `8.5` et un joueur en tilt a `82.5` !
* **Propositions de réécriture prêtes à copier-coller** :
  * **Gemme #2 (`mockData.js:106`)** :
    ```javascript
    insight_fr: "Les joueurs qui décrochent subissent +72,3 % de tirs à la tête lorsqu'ils sont immobilisés par un sort (étourdis ou projetés en l'air), et affichent un bilan de tirs à la tête très déficitaire face à leurs adversaires. C'est le marqueur ultime de sentiment d'impuissance mécanique."
    ```
  * **Gemme #3 (`mockData.js:118`)** :
    ```javascript
    insight_fr: "Lors du dernier match avant l'abandon, les parades au corps-à-corps ratées augmentent nettement (+6,6 %). Dans Deadlock, rater une parade ou se faire contrer paralyse le joueur pendant 4 secondes complètes, précipitant la colère et la déconnexion."
    ```
  * **Gemme #7 (`mockData.js:166`)** :
    ```javascript
    insight_fr: "Épuisés par de lourdes défaites en partie standard (30–35 min), les joueurs frustrés cherchent refuge dans le mode de jeu rapide 'Street Brawl' en 14 minutes (+39,2 %) et perdent +18,4 % d'âmes non sécurisées par minute en se faisant surprendre isolés sur la carte."
    ```

---

### 6.4. Page 1 ("Principal") — Benchmark Machine Learning & Explicabilité

#### Analyse de `MlBenchmarkSection.jsx` & `mockData.js:175-571, 1099-1331`
* **Points positifs** :
  * La présence conjointe d'un tableau comparatif de 7 algorithmes, d'une étude d'ablation de 7 domaines, de courbes ROC/PR interactives avec curseur de seuil $\theta$, d'une matrice de confusion cliquable 2×2 et d'un graphique d'importance des variables offre un panorama ML ultra-complet.
* **Points négatifs & Textes problématiques (Section la plus touchée par les contradictions de données)** :
  1. **Le badge en haut à droite du tableau comparatif contredit le tableau lui-même (`MlBenchmarkSection.jsx:59`)** :
     * Le badge doré affiche : `CHAMPION : MLP & GRADIENT BOOSTING (100% IN-GAME)`.
     * Or, dans le tableau juste en dessous (`mockData.js:1299-1330`), le **Réseau MLP (`mlp_neural`) est classé 7e et dernier** avec le pire ROC-AUC (`62.6%`) et le pire PR-AUC (`43.5%`), et son commentaire dit : *« Réseau de neurones dense; pénalisé par le volume d'échantillons Source 2 tabulaires. »* !
  2. **Les courbes ROC/PR et la Matrice de Confusion juste sous le tableau n'affichent pas les données du tableau (et `MlBenchmarkSection` ignore ses props `metricsData` et `visData`) !**
     * Dans le tableau (`MlBenchmarkSection.jsx:97-170`), le modèle champion (`Gradient Boosting`) a : **ROC-AUC = 67.3%**, **PR-AUC = 50.9%**, **Seuil $\theta^* = 0.25$**, testé sur **N = 1 912** (ou `N = 514` dans `MOCK_METRICS.confusion_matrix`).
     * Dix pixels plus bas, la carte de gauche (`InteractiveCurves.jsx:311-352`) affiche : **ROC-AUC : 80.0%**, **PR-AUC : 79.3%**, **Seuil Optimal $\theta^* = 0.36$** !
     * Et la carte de droite (`ConfusionMatrixHeatmap.jsx:624` & `translations.js:262`) affiche une matrice de confusion calculée sur **N = 4 900** (avec exactement 2 450 Churn et 2 450 Actifs, soit 50/50 au lieu de 24,3 % de churn !) via une formule mathématique synthétique (`recall = 1.0 - Math.pow(threshold, 1.25) * 0.95`) qui ne correspond ni à `N = 1 912`, ni à la vraie matrice de confusion de `MOCK_METRICS.confusion_matrix` (`tp: 132, fp: 206, tn: 142, fn: 34`) !
  3. **La phrase de synthèse sous le graphique d'Importance des Variables contredit les barres affichées au-dessus (`MlBenchmarkSection.jsx:924, 1117` & `translations.js:254`)** :
     * Le graphique affiche en Top 5 :
       1. `Série d'isolement en solo (Gemme #6)` : **9.2%**
       2. `Headshots subis sous Stun (Gemme #2)` : **8.2%**
       3. `Différentiel de Headshot infligé/subi` : **7.6%**
       4. `Revente Panique d'Objets (Gemme #5)` : **6.9%**
       5. `Ratio d'Écran Gris / Mort (Gemme #4)` : **6.4%**
     * Mais le sous-titre et l'encadré « 💡 Interprétation Comportementale » en bas du graphique disent (`translations.js:254`) :
       > *Citation exacte* : « L'écart de Souls à 10 min et la régularité de visée 3D constituent les signaux majeurs de prédiction. »
     * Or, `Différentiel de Souls (10 min)` n'est qu'en **11e position (4.0%)** et `Régularité de visée 3D` n'est même pas dans le graphique !
* **Propositions de réécriture prêtes à copier-coller** :
  * **`MlBenchmarkSection.jsx:59` (Badge du tableau)** :
    ```jsx
    <span>{isFr ? 'CHAMPION : GRADIENT BOOSTING RÉGULARISÉ (100% IN-GAME)' : 'CHAMPION: REGULARIZED GRADIENT BOOSTING (100% IN-GAME)'}</span>
    ```
  * **`translations.js:249-255` (Titres et conclusion de l'Importance des Variables)** :
    ```javascript
    importance: {
      title: "Importance Relative des Variables (Top Signaux Prédictifs)",
      subtitle: "Poids décisionnel des 106 signaux comportementaux extraits des parties Deadlock."
    },
    featureImportance: {
      title: "Importance Relative des Variables (Modèle Champion)",
      takeaway: "L'isolement social en solo (9,2 %), les tirs à la tête subis sous étourdissement (8,2 %), la revente panique d'objets (6,9 %) et le temps passé mort en écran gris (6,4 %) dominent largement la prédiction du décrochage."
    },
    ```

---

### 6.5. Page 1 ("Principal") — Simulateur, 4 Archétypes, Jauge de Risque & Attribution SHAP

#### Analyse de `SimulatorSection.jsx`, `RiskGauge.jsx` & `FactorAttribution.jsx`
* **Points positifs** :
  * L'expérience utilisateur est excellente : pouvoir chercher un joueur ou cliquer en 1 clic sur 4 profils archétypaux très parlants (*Le Fantassin en Tilt Aigu*, *Le Vétéran Épuisé*, *Le Gardien des Objectifs*, *Le Joueur Régulier & Serein*) rend le modèle concret.
  * La grille des 7 Gemmes Cachées propre au joueur sélectionné, la jauge semi-circulaire, les recommandations studio en 3 points et la frise séquentielle des 10 derniers matchs (`V` / `D`) racontent une histoire très cohérente.
* **Points négatifs & Textes problématiques** :
  1. **Le titre de la Jauge ET les en-têtes de colonnes SHAP mélangent Churn et Victoire/Défaite de match (`translations.js:359, 370-372, 383-384, 391`)** :
     > *Citations exactes* :
     > - Titre de la jauge (`translations.js:359`) : « Probabilité Prédite de Churn & Espérance de Victoire ».
     > - En-têtes des colonnes de `FactorAttribution` (`translations.js:383-384`) : « Facteurs Aggravants (Poussant à la Défaite / Churn) » et « Facteurs Protecteurs (Favorisant la Victoire / Rétention) ».
     * *Pourquoi c'est très confus* : Une jauge affiche un seul pourcentage (ex: `88.0%`). Si le titre dit *« Probabilité de Churn & Espérance de Victoire »*, un lecteur ne sait plus si `88.0%` signifie 88 % de risque de quitter le jeu OU 88 % de chances de gagner la partie (les deux étant exactement opposés !).
  2. **La Jauge (`RiskGauge.jsx`) reçoit `threshold={0.25}` de `SimulatorSection.jsx:807`, mais affiche en dur `θ* = 36%` (`RiskGauge.jsx:289, 404`) et `θ* = 42%` dans `translations.js:361-362` !**
     * Conséquence visuelle absurde : sur la jauge SVG, la ligne jaune du seuil est dessinée géométriquement à l'angle **25 %** (car `th = 0.25`), mais l'étiquette texte accrochée à cette même ligne à 25 % affiche **`θ* = 36%`** (`RiskGauge.jsx:289`), et le calcul d'écart sous la jauge (`RiskGauge.jsx:116, 404`) calcule la différence avec 25 % (ex: pour *Le Gardien des Objectifs* à 28 %, `28% - 25% = +3.0%`) tout en affichant à côté **`+3.0% (θ* = 36.0%)`** (et en le classant en risque « Modéré (36% - 60%) » alors qu'il est à 28 % !) ! N'importe quel lecteur qui voit qu'à 28 % on est à `+3.0% au-dessus de 36.0%` dans la tranche `36% - 60%` pense que le site ne sait pas faire une soustraction !
  3. **Colonnes SHAP vides sur 3 des 4 archétypes (`mockData.js:722, 938, 1053` écrase `BASE_ARCHETYPE_ATTRIBUTIONS` de `FactorAttribution.jsx:34-311`)** :
     * Dans `FactorAttribution.jsx:578`, l'expression `activeProfile?.factorAttribution || ARCHETYPE_ATTRIBUTIONS[profileId]` donne la priorité à l'objet `factorAttribution` minimaliste de `mockData.js`, rendant **totalement inactif** le dictionnaire complet `BASE_ARCHETYPE_ATTRIBUTIONS` pourtant écrit aux lignes 34-311 de `FactorAttribution.jsx` !
     * Conséquence : pour *Le Fantassin en Tilt Aigu*, la colonne de droite **« ▼ Facteurs Protecteurs (0 signaux) » est entièrement vide** ; et pour *Le Gardien des Objectifs* et *Le Joueur Régulier & Serein*, la colonne de gauche **« ▲ Facteurs Aggravants (0 signaux) » est entièrement vide** !
  4. **Le sous-titre de `RiskGauge.jsx:130` dit « modèle champion V6 XGBoost » alors que `translations.js:360` dit « modèle champion V1 XGBoost »**.
  5. **Dans `FactorAttribution.jsx:844, 980`**, chaque carte de facteur affiche à côté du nom français le nom de code informatique brut (`recent_loss_streak`, `souls_diff_10m`, `current_streak_at_cutoff`), ce qui alourdit visuellement la lecture pour un non-développeur.
  6. **Anglicismes dans les recommandations de `RiskGauge.jsx:450-493`** :
     * *« Proposer un nudge vers un mode détente »*, *« Coéquipier Haute Composure : Attribuer prioritairement au moins un coéquipier à composure maximale »*, *« désactiver l'autofill »*, *« Surveillance Anti-Streak »*.
* **Propositions de réécriture prêtes à copier-coller** :
  * **`translations.js:358-406` (Textes de la Jauge de Risque & de l'Attribution SHAP)** :
    ```javascript
    gauge: {
      title: "Probabilité Prédite d'Abandon (Churn à 14 Jours)",
      subtitle: "Estimation en temps réel par le modèle champion (100% signaux en match)",
      thresholdMarker: "Seuil d'Alerte θ* = 36%",
      optimalLabel: "Seuil Optimal θ* = 0.36",
      needleAriaLabel: "Jauge de probabilité d'abandon du joueur à 14 jours",
      tiers: {
        low: "Faible (< 36%)",
        moderate: "Modéré (36% - 60%)",
        critical: "Critique (> 60%)"
      },
      status: {
        retained: "Joueur Fidélisé — Engagement Sain",
        watchlist: "Fatigue Latente — Vigilance Recommandée",
        danger: "Risque Critique — Décrochage Imminent"
      },
      actions: {
        low: "Engagement optimal. Aucune intervention requise : maintenir le matchmaking compétitif standard.",
        moderate: "Vigilance requise. Garantir son rôle favori et l'entourer de coéquipiers stables et coopératifs.",
        critical: "Intervention préventive urgente. Suggérer une pause bienveillante et éviter de le grouper avec d'autres joueurs frustrés."
      }
    },
    attribution: {
      title: "Décomposition des Facteurs Décisionnels (Valeurs SHAP)",
      subtitle: "Poids relatif de chaque signal de télémétrie sur la prédiction finale du modèle.",
      aggravatingHeader: "Facteurs Aggravants (Poussant à l'Abandon / Churn)",
      protectiveHeader: "Facteurs Protecteurs (Favorisant la Fidélisation)",
      aggravatingBadge: "Risque Accru",
      protectiveBadge: "Protection Active",
      impactLabel: "Impact",
      neutralText: "Les indicateurs de ce profil sont globalement équilibrés sans anomalie critique.",
      legend: {
        aggravating: "Indicateur aggravant (augmente le risque d'abandon à 14 jours)",
        protective: "Indicateur protecteur (renforce le plaisir de jeu et la fidélisation)"
      }
    },
    ```
  * **`RiskGauge.jsx:453-492` (Recommandations Studio en bon français)** :
    ```jsx
    // Niveau Critique :
    1. Pause Bienveillante (Cooldown) : Suggérer une courte pause de 15 minutes ou une partie détente (contre bots) sans aucune pénalité de classement.
    2. Isolation de la Frustration : Ne jamais placer ce joueur dans la même équipe que d'autres joueurs en pleine série de défaites.
    3. Coéquipier au Sang-Froid Exemplaire : L'associer prioritairement à au moins un allié reconnu pour son calme et son esprit d'équipe (score de conduite exemplaire).

    // Niveau Modéré :
    1. Garantie du Rôle Favori : Assurer au joueur son poste et son couloir de prédilection sur la prochaine partie (aucun placement forcé sur un rôle secondaire).
    2. Écart de Niveau Resserré : Réduire l'écart maximal de classement entre les participants de la partie pour éviter un match déséquilibré.
    3. Amortisseur de Série Noire : En cas de nouvelle défaite, déclencher un objectif bonus (récompense cosmétique ou contrat d'âmes) pour préserver la motivation.
    ```

---

### 6.6. Page 1 ("Principal") — Bannière Passerelle, Architecture du Pipeline & Footer

#### A. Bannière Passerelle vers les Onglets 2 et 3 (`App.jsx:200-259`)
* **Points positifs** :
  * Excellente transition éditoriale qui donne envie d'aller explorer les deux autres espaces du site avec des questions d'accroche concrètes (*« Pourquoi Seven subit-il 28.7% de headshots en vol ? »*).
* **Points négatifs & Textes problématiques** :
  * Le badge rose (`App.jsx:209`) affiche en anglais : `+78.6% STUN HEADSHOTS • 0% VITALITY 30M`.
  * Le texte (`App.jsx:219`) dit : *« Pourquoi Vindicta achète-t-elle 13 items offensifs pendant 30 minutes sans défense avant de quitter le jeu ? »* (laisse croire que c'est le personnage IA Vindicta qui décide de ses achats, alors qu'il s'agit des joueurs qui incarnent Vindicta).
  * Le bouton secondaire (`App.jsx:253`) dit : `Ouvrir Espace ITEM`.
* **Proposition de réécriture prête à copier-coller (`App.jsx:208-255`)** :
  ```jsx
  <span className="badge badge-rose">
    {isFr ? '+78,6 % TIRS TÊTE SOUS STUN • 0 DÉFENSE EN 30 MIN' : '+78.6% STUN HEADSHOTS • 0% VITALITY 30M'}
  </span>
  <h3 style={{ fontSize: 'clamp(1.25rem, 2.4vw, 1.65rem)', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
    {isFr
      ? "Explorez le Labo : Dynamique des Héros, Séquences d'Achats & Vulnérabilité 3D"
      : 'Explore the Lab: Item Purchase Sequences, Stun Headshots & 3D Hero Hitboxes'}
  </h3>
  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '760px', margin: 0 }}>
    {isFr
      ? "Pourquoi le héros Seven reçoit-il 28,7 % de tirs dans la tête lorsqu'il lévite ? Pourquoi les joueurs de Vindicta en détresse achètent-ils 13 équipements offensifs d'affilée pendant 30 minutes sans aucune protection avant d'abandonner le jeu ? Découvrez nos deux dossiers interactifs dédiés."
      : 'Why does Seven take 28.7% headshots while airborne? Why do Vindicta churners buy 13 offensive items over 30 minutes with zero defense before quitting? Dive into our interactive timelines in the dedicated tab.'}
  </p>
  ```

#### B. Section Architecture du Pipeline (`ArchitectureSection.jsx`)
* **Points positifs** :
  * Le découpage en 5 étapes interactives (`01 Ingestion`, `02 Ingénierie Features`, `03 Entraînement ML`, `04 Calibration Seuil`, `05 Inférence FastAPI`) avec à chaque fois une matrice 4 blocs (`Données d'Entrée`, `Données Produites`, `Outils & Protocoles`, `Télémétrie & Contraintes Studio`) et un widget interactif en bas est d'une clarté structurelle remarquable.
* **Points négatifs & Textes problématiques** :
  1. **Cette section décrit une ancienne version du pipeline (V6 XGBoost + SMOTE, 48 features, 13 584 joueurs, 100 matchs par joueur, 49.6% de churn, variables `gold_per_min` et `avg_tower_damage` de Dota 2 !)** :
     * Regardez le widget de l'Étape 02 (`ArchitectureSection.jsx:372-380`) : la variable `gpm_trend` est définie par `mean(gold_per_min[last_10]) - mean(gold_per_min[prior_90])` avec pour unité **`Gold/min [-250 à +250]`** ! Or dans Deadlock il n'y a pas d'or (*Gold*), il y a des âmes (*Souls*).
     * De même, les étapes parlent de `24 500+ historiques`, `13 584 lignes × 48 colonnes`, `Test N = 3 397`, `Rappel Test : 85.0% | Précision Test : 65.4%`, `PR-AUC : 79.3% | ROC-AUC : 80.0%`, `V6 XGBoost + SMOTE`. Tout cela contredit frontalement le reste de la Page 1 (`10 000 fenêtres`, `106 features`, `Test N = 1 912`, `Gradient Boosting`).
  2. **Bugs de rendu LaTeX (`$P(\text{churn} \mid X)$`, `$\theta^* = 0.36$`) et de backticks Markdown (`` `account_id` ``)** déjà signalés en Section 5.1.
  3. **Incohérence de port et de chemin module dans le Quickstart** : La commande backend de `Navbar.jsx:379` (`translations.js:453`) dit `cd backend && uvicorn app.main:app --reload --port 8000`, tandis que `ArchitectureSection.jsx:1381` dit `uvicorn main:app --reload --port 8001` (qui échoue d'ailleurs si l'on n'indique pas `app.main:app` depuis `backend/` !).
  4. **Traduction mathématique trompeuse dans le bloc Séries Temporelles (`ArchitectureSection.jsx:1225, 1232`)** :
     * Le badge dit `Survie & Hasard` et le texte dit `le taux de hasard h(t)`. En français, « hasard » signifie l'aléatoire ou la chance. Pour traduire l'anglais *hazard rate* en analyse de survie, il faut écrire **« taux de risque instantané $h(t)$ »** (et sur le badge : **`Analyse de Survie & Risque Instantané`**).

---

### 6.7. Page 2 ("Dynamique Héros & Churn") — Biomarqueurs, Matrice Héros, Carte 2D & Biomécanique du Parry

#### Analyse globale de `ItemsSection.jsx`, `DeadlockMapHeatmap.jsx` & `deadlockMapData.js`
* **Points positifs** :
  * L'organisation modulaire en 4 grands chapitres cliquables (`MODULE 01 Biomarqueurs Empiriques`, `MODULE 02 Matrice & Autopsie Héros`, `MODULE 03 Carte Tactique 2D`, `MODULE 04 Biomécanique du Parry`) évite l'effet "mur de texte infini" et structure parfaitement la lecture.
  * Dans le Module 02 (`Autopsie du Héros`), la décomposition en 4 encadrés : **1. Le Fantasme du Joueur**, **2. Le Piège Mécanique du Kit**, **3. L'Erreur d'Achat en Tilt**, **4. Pourquoi le Joueur Part** (`ItemsSection.jsx:1203-1272` et `1412-1443`) est un chef-d'œuvre de vulgarisation. Même quelqu'un qui n'a jamais vu une image de Deadlock comprend immédiatement pourquoi un joueur choisit Yamato, Vindicta, Lash ou Seven, ce qu'il espérait vivre, et pourquoi la mécanique du personnage se retourne contre lui !
  * La Carte Tactique 2D (`DeadlockMapHeatmap.jsx`) avec sa simulation animée de 0 à 10 minutes en 6 secondes et son bandeau narratif qui décrit ce qui se passe minute par minute (`00:00 - 02:30`, `02:30 - 05:30`, `05:30 - 08:00`, `08:00 - 10:00`) est extrêmement parlante.

* **Points négatifs & Textes problématiques en Page 2** :
  1. **En-tête & Titre H1 (`ItemsSection.jsx:256, 293, 297`)** :
     * `BIOMARQUEurs` (faute de casse ligne 256).
     * `Dynamique Héros & Player Churn dans Deadlock via Biomécanique S2` : pourquoi laisser « Player Churn » en anglais et « S2 » abrégé dans le grand titre français ?
  2. **Les 5 cartes KPI de l'horizon (`ItemsSection.jsx:356-495`) condensent trop de jargon abrégé** :
     * Carte 01 (`ligne 361`) : *« 84.5% chez churners vs 47.3% chez fidèles : subir des headshots sous CC détruit l'agentivité »* (« sous CC » n'est pas compris par un non-joueur).
     * Carte 02 (`ligne 389, 394`) : *« 1er Item Vitality (Vindicta) — 13 items offensifs achetés d'affilée sans défense : panic buy tardif précédant le churn »* (le lecteur ne sait pas encore que « Vitality » = la catégorie des objets de survie/santé).
     * Carte 05 (`ligne 493`) : *« Kits indulgents & haute agentivité : 9.6% de headshots subis et escapes 3D éliminent le tilt »* (« escapes 3D » = compétences de fuite/esquive).
  3. **Dans le Module 01 (`Comparatif Empirique`, `ItemsSection.jsx:809-878`), les étiquettes des barres affichent un jargon binaire de data scientist (`Churn = 1` et `Churn = 0`)** :
     * Alors que la légende en haut parle de « Joueurs qui Churnent » vs « Joueurs Fidélisés », chaque barre répète `Churn = 1` et `Churn = 0` (`lignes 845, 863`). De plus, le sous-titre cite le nom d'un fichier interne : `Mesuré sur deadlock_churn_dataset.csv`.
  4. **Incohérence des chiffres entre les 5 Biomarqueurs de la Page 2 (`SOURCE2_BIOMARKERS`, `ItemsSection.jsx:52-133`) et les 7 Gemmes Cachées de la Page 1 (`MOCK_HIDDEN_GEMS_AUDIT`, `mockData.js:84-169`)** :
     * En Page 1, le ratio d'écran gris (`grey_screen_ratio`) est de **14,2 % chez les churners vs 13,3 % chez les fidélisés (+6,7 %)**.
     * En Page 2 (`ItemsSection.jsx:58-82`), le ratio d'écran gris devient **17,8 % chez les churners vs 9,6 % chez les fidélisés (+85,4 %)** !
     * De même, en Page 1, la revente panique (`late_panic_sells`) est à `0.38 vs 0.12 (+216.7%)`, et en Page 2 elle est à `28.6% vs 3.4% (x8.4)`. Comme l'indique le commentaire de `ItemsSection.jsx:49` (`N = 10,000 cohorts & N = 397 deep replay windows`), les chiffres de `SOURCE2_BIOMARKERS` correspondent au sous-échantillon des **397 replays complets (`N = 397`)** : il faut donc l'indiquer explicitement dans le sous-titre (`ItemsSection.jsx:814`) au lieu d'écrire `Mesuré sur deadlock_churn_dataset.csv (N = 10 000)`.
  5. **Dans le Module 03 (`Carte Tactique 2D`, `deadlockMapData.js:450-1200`), les infobulles au survol (`cause_fr`) contredisent la zone (`zone_fr`), le héros et le minutage (`time_min`)** :
     * Il faut réconcilier `cause_fr` avec `zone_id` dans `deadlockMapData.js` pour qu'un événement situé à `fountain_north` n'affiche plus `"Interception fatale en portant l'Urne à travers la jungle"`, qu'un événement à `0.9m` sur `sapphire_t1_south` n'affiche plus `"Dive sous Walker ennemi"`, et que `Yamato` n'affiche plus `"Interception en vol stationnaire"` !
  6. **Dans le Module 04 (`Biomécanique du Parry`, `ItemsSection.jsx:1670-2065`)** :
     * L'explication du mécanisme de la parade (`ligne 1717`) est excellente, mais plusieurs termes techniques restent obscurs pour un non-joueur :
       * *« #1 CC non-ultime du jeu »* (`ligne 1737`) -> « Plus longue paralysie (hors compétence ultime) du jeu ».
       * *« Incentive Mêlée Lourde & Debuff »* et *« -12% Spirit Resist »* (`lignes 1790, 1797`) -> « Incitation au coup de poing chargé & affaiblissement » et « -12 % de résistance magique ».
       * *« Zéro charge de face sans CC allié : Ne chargez jamais un Heavy Melee de face à découvert. Réservez l'attaque après un stun (Yamato grapple stun, Kelvin freeze) »* (`lignes 2019-2021`).

* **Propositions de réécriture prêtes à copier-coller pour la Page 2 (`ItemsSection.jsx`)** :
  * **Titre H1 & Résumé (`ItemsSection.jsx:256, 290-318`)** :
    ```jsx
    // Ligne 256 :
    {isFr ? 'BIOMARQUEURS • MATRICE HÉROS • CARTE 2D • PARADE AU CORPS-À-CORPS • 2026' : 'BIOMARKERS • HERO MATRIX • 2D MAP • PARRY • 2026'}

    // Lignes 290-298 (Titre H1) :
    <span className="title-light">Dynamique des Héros &</span>{' '}
    <span className="title-bold">
      <GlossaryTerm termId="churn">Abandon Joueur</GlossaryTerm>
    </span>
    <br />
    <span className="title-light title-light-sub">dans Deadlock par la</span>{' '}
    <span className="title-bold title-glow">Biomécanique 3D</span>

    // Lignes 315-317 (Résumé) :
    ? "Pourquoi certains personnages (héros) provoquent-ils jusqu'à 60 % d'abandon à 14 jours ? Pourquoi les joueurs sur le départ subissent-ils +78,6 % de tirs à la tête lorsqu'ils sont immobilisés, et voient-ils leur risque de quitter la partie en cours multiplié par 9 après s'être fait contrer deux fois au corps-à-corps ? Explorez nos 4 dossiers analytiques ci-dessous."
    ```
  * **Sous-textes des Cartes KPI 01, 02 et 05 (`ItemsSection.jsx:360-363, 393-395, 492-494`)** :
    ```javascript
    // Carte 01 :
    "84,5 % chez les décrocheurs vs 47,3 % chez les fidèles : recevoir des tirs critiques en étant paralysé détruit le sentiment de contrôle"
    // Carte 02 :
    "13 équipements offensifs achetés d'affilée sans aucune survie (Vitalité) : achat défensif de panique à la 30e minute avant l'abandon"
    // Carte 05 :
    "Personnages tolérants aux erreurs : seulement 9,6 % de tirs reçus à la tête et des compétences d'esquive qui désamorcent la frustration"
    ```
  * **Étiquettes des barres de Biomarqueurs (`ItemsSection.jsx:845, 863`)** :
    * Remplacer `Churn = 1` par **`Joueurs Décrocheurs (Churn)`** et `Churn = 0` par **`Joueurs Fidélisés (Actifs)`**.
  * **Module 04 — Contre-mesures Joueur (`ItemsSection.jsx:2013-2029`)** :
    ```jsx
    <li>
      <strong style={{ color: '#ffffff' }}>Feinte de frappe lourde (Melee Cancel) : </strong>
      Amorcez votre coup de poing chargé puis annulez-le avec une esquive (Dash) ou un saut pour pousser l&apos;adversaire à déclencher sa parade dans le vide. Sa parade devient alors inutilisable pendant 5 secondes.
    </li>
    <li>
      <strong style={{ color: '#ffffff' }}>Aucune charge frontale sans immobilisation préalable : </strong>
      Ne foncez jamais de face avec une attaque lourde très visible. Réservez ce coup lorsqu&apos;un allié a déjà immobilisé la cible ou lors d&apos;une attaque surprise depuis les hauteurs.
    </li>
    <li>
      <strong style={{ color: '#ffffff' }}>Équipement alternatif moins risqué : </strong>
      En partie solo face à des adversaires attentifs aux parades, remplacez <em>Spirit Strike</em> par <em>Close Quarters</em> (+25 % de dégâts de tir à courte portée) ou <em>Mystic Burst</em>.
    </li>
    ```

---

### 6.8. Page 3 ("ITEM") — Frise Chronologique 3 Phases, 4 Schémas Cognitifs & Catalogue d'Équipements

#### Analyse globale de `ItemTelemetrySection.jsx` & `mockData.js:1807-2231`
* **Points positifs** :
  * Le découpage des séquences d'achats en **3 colonnes chronologiques** (`PHASE 01 • 0M – 8M`, `PHASE 02 • 8M – 18M`, `PHASE 03 • 18M+`) avec des flèches `#1 → #2 → #3`, le coût en âmes et la **Jauge d'Équilibre du Build (Weapon / Vitality / Spirit)** est visuellement limpide.
  * La taxonomie des **4 Schémas d'Erreurs d'Équipement** (`Schéma #1 : Le Syndrome Zéro-Vitality`, `Schéma #2 : Le Biais du Tout-Offensif Cupide`, `Schéma #3 : Le Piège des Items Conditionnels Défaillants`, `Schéma #4 : Thésaurisation d'Or & Panic Buy Tardif`) explique admirablement la psychologie du joueur qui perd pied.
  * L'inspecteur latéral du catalogue avec la **« Prescription IA Anti-Tilt »** (`ItemTelemetrySection.jsx:1548-1561`) et la bannière finale **« Assistant Boutique Dynamique Anti-Tilt en Partie »** montrent une application produit concrète et intelligente du Machine Learning.

* **Points négatifs & Textes problématiques en Page 3** :
  1. **Il manque une phrase d'introduction expliquant le système des 3 couleurs d'équipement de Deadlock (`Weapon`, `Vitality`, `Spirit`)** :
     * En haut de la Page 3 (`ItemTelemetrySection.jsx:792-797`), on affiche 4 pastilles : `● Weapon`, `● Vitality`, `● Spirit`, `● Souls`, mais sans traduire ni expliquer leur rôle ! Pour un non-joueur, ajouter une ligne explicative (*« Dans Deadlock, la boutique est divisée en 3 familles : Armes/Tir (Weapon, orange), Survie/Santé (Vitality, vert) et Pouvoirs Magiques (Spirit, violet), achetés grâce à la monnaie du jeu (Souls, cyan) »*) éclairerait instantanément toute la page !
  2. **Mélange permanent entre « Or (Gold) » et « Âmes (Souls) »** :
     * `ItemTelemetrySection.jsx:195` : *« Thésaurisation d'Or & Panic Buy Tardif »*
     * `ItemTelemetrySection.jsx:971` : *« Or Non Dépensé : 91 360 Souls·min »* (le titre dit « Or » et la valeur dit « Souls·min » !).
     * `mockData.js:1906` : *« générant +7.6% d'Unspent Gold Minutes : le joueur économise 6 minutes sans acheter de stats et perd ses Unsecured Souls en mourant. »*
     * *Pourquoi ça bloque* : Un non-joueur se demande quelle est la différence entre l'Or et les Souls, et ne comprend pas ce que signifie `91 360 Souls·min` (comment peut-on avoir 91 360 âmes non dépensées alors que les objets coûtent entre 500 et 6 200 âmes ? Parce que ce sont des *Souls × Minutes* cumulées au fil du match !).
  3. **Incohérence interne sur `Hollow Point Ward` (Tier W2 à 1 250 Souls dans la frise vs Tier 3 à 3 000 Souls dans le catalogue vs Tier 1 à 500 Souls dans `MOCK_ITEMS_DATA`, et Schéma #2 vs Schéma #3)** :
     * Dans `ItemTelemetrySection.jsx:74`, `Hollow Point Ward` est affiché à **`1 250 Souls (W2)`**, tandis que dans le catalogue de la même page (`mockData.js:1974-1975` et `backend/app/api/routers/items.py:437-438`), il est affiché à **`3 000 Souls (Tier 3)`** et son commentaire dit **`"Schéma #2"`** au lieu de **`"Schéma #3"`** (`ItemTelemetrySection.jsx:184`). Il faut harmoniser `tier: 2, cost: 1250` et `"Schéma #3"` partout.
  4. **Mélange entre « 50+ items », « 54 items » et les « 21 items » réellement affichés dans le catalogue** :
     * Le menu (`Navbar.jsx:145`) dit `50+ ITEMS`.
     * Les badges et sous-titres de la Page 3 (`ItemTelemetrySection.jsx:543, 786, 863, 872`) disent **`54 Items Source 2`** (*« Classement complet des 54 items Source 2 »*).
     * Mais `MOCK_ITEM_CHURN_ANALYTICS` (`mockData.js:1807-2231` et `backend/app/api/routers/items.py:270-694`) ne contient que **21 items** ! Un lecteur qui compte 21 cartes dans la grille alors que le titre au-dessus annonce « Classement complet des 54 items » pense que la moitié du catalogue n'a pas chargé. (Il suffit d'écrire *« Les 21 équipements les plus polarisants sélectionnés parmi les 54 items Source 2 analysés »*).
  5. **Jargon technique brut dans les descriptions des séquences (`ItemTelemetrySection.jsx:62, 162, 164, 174`)** :
     * *« En inspectant game_time_s sur chaque achat »* (`ligne 162`) : citer le nom du champ JSON `game_time_s` dans un texte d'explication grand public est inutilement aride.
     * *« Le joueur accumule des Unsecured Souls en zone neutre, se fait sanctionner par un roam adverse, et perd son or sans avoir bénéficié de stats intermédiaires. »* (`ligne 174`).

* **Propositions de réécriture prêtes à copier-coller pour la Page 3 (`ItemTelemetrySection.jsx`)** :
  * **Résumé d'en-tête (`ItemTelemetrySection.jsx:536-538`)** :
    ```javascript
    ? "Dans Deadlock, chaque joueur équipe son héros selon 3 familles : Armes (Weapon), Survie (Vitality) et Pouvoirs (Spirit). Pourquoi un joueur qui néglige totalement la Survie pendant 30 minutes est-il condamné à la frustration et à l'abandon ? Découvrez notre autopsie chronologique par phase de jeu (Début / Milieu / Fin), les 4 biais psychologiques en boutique et le catalogue interactif des équipements."
    ```
  * **Indicateur `Or Non Dépensé` (`ItemTelemetrySection.jsx:971`)** :
    * Remplacer `Or Non Dépensé` par **`Âmes Non Dépensées (Cumul)`** (et ajouter un `title="Cumul minute par minute des âmes gardées en réserve sans être investies en boutique"`).
  * **Les 4 Schémas d'Erreurs d'Équipement (`ItemTelemetrySection.jsx:159-201`)** :
    ```javascript
    // Schéma #1 :
    title_fr: 'Le Syndrome « Zéro Survie » (6 à 13 Achats Offensifs d’Affilée)',
    desc_fr: "L'horodatage précis des achats révèle que les joueurs qui décrochent sur Vindicta, Haze ou Lash achètent entre 6 et 13 objets d'attaque consécutifs (Arme & Esprit) sans dépenser la moindre âme en Survie (Vitality). Leur tout premier équipement défensif n'est acheté qu'entre la 14e et la 30e minute, après une longue série de morts évitables.",

    // Schéma #2 :
    title_fr: 'Le Piège de l’Épargne Cupide (Rush d’Objets Coûteux sans Bottes ni Soin)',
    desc_fr: "Économiser compulsivement pour acheter d'un coup un objet très cher (Toxic Bullets à 3 000 âmes ou Glass Cannon à 6 200) en faisant l'impasse sur les bottes de vitesse et les soins de base (500 âmes). Le joueur accumule des âmes non sécurisées dans les camps neutres, se fait surprendre par une embuscade ennemie et perd son butin sans avoir renforcé son personnage.",

    // Schéma #3 :
    title_fr: 'Le Piège des Bonus Conditionnels (Hollow Point & Opening Rounds)',
    desc_fr: "Acheter dès le début de partie des équipements dont le bonus offensif ne fonctionne que si le joueur a sa barre de vie presque pleine (ex: Hollow Point se désactive sous 60 % de vie). Sans armure ni bouclier, le joueur perd ce bonus dès la première seconde du combat : son équipement devient littéralement inerte.",

    // Schéma #4 :
    title_fr: 'Thésaurisation Passive & Achat Défensif de Panique (@ 29 min)',
    desc_fr: "Garder d'importantes réserves d'âmes en poche pendant plusieurs minutes sans passer à la boutique (+7,6 % d'âmes immobilisées). Lorsque sa base est sur le point de tomber, le joueur achète en panique une armure lourde (Bullet Resilience à 29m14s en 15e achat !) alors que le retard accumulé est déjà irrattrapable."
    ```

---

## 7. Remaining Questions & Gaps (Questions Ouvertes & Pistes pour la Suite)

Suite à la vérification croisée intégrale entre le front-end et le back-end, plusieurs zones d'incertitude initiales ont pu être résolues, tandis que des choix d'arbitrage éditorial et technique restent à valider par l'auteur du projet :

1. **Arbitrage entre les deux runs ML du Back-End (`ml_results.json` à 79 features vs `enrich_hidden_gems.py` / `mockData.js` à 106 features)** :
   * Contrairement à ce qu'une lecture superficielle pourrait laisser croire, `backend/data/ml_results.json` et `frontend/src/data/mockData.js` **ne contiennent pas le même run ML** :
     * `backend/data/ml_results.json` (généré par `rebuild_and_train_debiased.py`) contient le run à **79 features (24 optimales)** incluant `match_frequency_drift`, où le champion est `MLP Neural Network` (`ROC-AUC = 77.12%`, `PR-AUC = 57.04%`, `Recall = 80.33%`) suivi de `Gradient Boosting` (`PR-AUC = 57.81%`, `Recall = 77.43%`).
     * `MOCK_METRICS` et `MODEL_BENCHMARK_ROWS` dans `mockData.js` (issus de `enrich_hidden_gems.py`) contiennent le run **100 % In-Game Pure à 106 features** (sans `match_frequency_drift` et avec les 7 Gemmes Cachées sur `3 244` fenêtres enrichies / `514` en test), où le champion est `Gradient Boosting` (`ROC-AUC = 67.32%`, `PR-AUC = 50.93%`, `Recall = 79.52%`, `Seuil θ* = 0.25`) et où `MLP` tombe dernier (`62.6%`).
   * *Décision à prendre avec l'Agent 2 (ML)* : Choisir officiellement lequel de ces deux runs est la vérité terrain (ou présenter explicitement dans le Benchmark les deux régimes : *"Régime A : 100 % In-Game Pure (67,3 % ROC-AUC)"* vs *"Régime B : Hybride In-Game + Rythme de Session (77,1 % ROC-AUC)"*), et synchroniser `/api/ml/metrics` (`mock_service.py`) avec `KpiBar.jsx` pour que les chiffres ne changent plus selon que le backend FastAPI est allumé ou éteint.
2. **Harmonisation de l'échelle et de la formule du `Tilt Index` sur `[0 - 100]`** :
   * L'inspection du back-end prouve que `backend/app/services/feature_service.py:60-76`, `backend/collect_data.py:426-436`, `backend/app/services/mock_service.py:39-160` et `mockData.js` utilisent tous l'échelle **`[0.0 - 100.0]`**.
   * C'est uniquement `PsychologySection.jsx:31-119`, `HeroSection.jsx:201, 250`, `FactorAttribution.jsx:49` et `ArchitectureSection.jsx:334` qui affichent une ancienne formule sur `[0.0 - 6.0]` (faussement attribuée à `# backend/app/services/feature_service.py` dans `PsychologySection.jsx:100`).
   * *Action recommandée* : Mettre à jour le simulateur de `PsychologySection.jsx` et le badge de `HeroSection.jsx` pour utiliser la vraie formule `[0 - 100]` de `feature_service.py` (ou `collect_data.py`), ce qui rendra le score de tilt immédiatement cohérent avec les 4 archétypes (`82.5`, `54.0`, `18.0`, `8.5`).
3. **Clarification des tailles d'échantillons entre Cohorte Globale (`N = 10 000`), Fenêtres Enrichies Metadata (`N = 3 244` / Test `N = 514`) et Replays Profonds (`N = 397`)** :
   * En Page 1 (`MOCK_HIDDEN_GEMS_AUDIT`), les moyennes (`14.2% vs 13.3%` d'écran gris) proviennent des `3 244` fenêtres enrichies via `/v1/matches/metadata`, tandis qu'en Page 2 (`SOURCE2_BIOMARKERS`), les pourcentages contrastés (`17.8% vs 9.6%` d'écran gris, `84.5% vs 47.3%` de stun headshots) proviennent de la sous-cohorte des **397 replays profonds (`N = 397`)**. Préciser clairement l'échantillon (`N = 397 replays complets` vs `N = 10 000 fenêtres`) dans le sous-titre de `ItemsSection.jsx:814` lèvera toute ambiguïté statistique.
4. **Ordre de priorité pour une phase de correction** :
   * **Priorité 1** : Unifier les chiffres ML, le seuil $\theta^*$, l'échelle `[0 - 100]` du `Tilt Index`, le nom du modèle champion et la cible prédite (Churn à 14 jours) sur toutes les pages, la modale, le dictionnaire et les en-têtes SHAP.
   * **Priorité 2** : Corriger les 9 bugs techniques de texte et de données (`BIOMARQUEurs`, LaTeX brut `$P(\text{churn})$`, backticks bruts, `threshold={0.25}` vs `θ* = 36%` dans `RiskGauge`, colonnes SHAP vides dans `FactorAttribution`, filtre `hidden_gems` manquant dans `FeatureImportanceChart`, les 10 `termId` de `<GlossaryTerm>` orphelins, les infobulles incohérentes de `deadlockMapData.js`, et le triple prix/palier de `Hollow Point Ward`).
   * **Priorité 3** : Déployer les réécritures pédagogiques prêtes à copier-coller ci-dessus et entourer systématiquement la première apparition de chaque terme technique (`Souls`, `Guardians`, `Walkers`, `Patron`, `Flex Slots`, `Urne`, `Parry`, `ROC-AUC`, `SHAP`, `Seuil θ*`) avec le composant `<GlossaryTerm>`.
