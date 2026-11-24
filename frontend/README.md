# 🔮 Deadlock Match & Churn Prediction — Public Showcase

[![React 19](https://img.shields.io/badge/React-19.2-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Vite 8](https://img.shields.io/badge/Vite-8.0-646cff?style=flat-square&logo=vite)](https://vite.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![ML](https://img.shields.io/badge/ML-XGBoost%20v1%20%2B%2048%20Features-10b981?style=flat-square)](https://xgboost.readthedocs.io/)
[![Zero Secrets](https://img.shields.io/badge/Security-0%20Secrets%20%7C%20Sanitized-10b981?style=flat-square)](https://github.com)
[![Offline Fallback](https://img.shields.io/badge/Mode-100%25%20Offline%20Ready-38bdf8?style=flat-square)](https://github.com)
[![Bilingual](https://img.shields.io/badge/Language-Bilingual%20FR%20%2F%20EN-e2e8f0?style=flat-square)](https://github.com)

An industry-grade **Machine Learning & Data Science showcase application** analyzing competitive player retention, mental fatigue (*tilt*), 3D shooter combat telemetry, and 14-day inactivity churn in **Valve's Deadlock** (6v6 occult dieselpunk hero shooter).

Designed both as an **interactive portfolio showcase** and an **engineering blueprint for competitive gaming studios**, this application demonstrates end-to-end data science: from asynchronous match telemetry ingestion via the Deadlock API (`api.deadlock-api.com`) to behavioral and shooter feature engineering (48 variables), ensemble classification (XGBoost), real-time FastAPI serving, and dynamic matchmaking balancing policy design.

---

## 📑 Table of Contents / Sommaire

1. [English Documentation 🇬🇧](#-english-documentation-)
   - [Project Highlights & Key Performance](#project-highlights--key-performance)
   - [Quickstart (2 Commands)](#quickstart-2-commands)
   - [Dual Execution Modes](#dual-execution-modes)
   - [System Architecture & Tech Stack](#system-architecture--tech-stack)
   - [Security & Public GitHub Guarantees](#security--public-github-guarantees)
   - [Interactive Player Archetypes & Simulator](#interactive-player-archetypes--simulator)
   - [Matchmaking Ethics & Anti-EOMM Commitment](#matchmaking-ethics--anti-eomm-commitment)
2. [Documentation en Français 🇫🇷](#-documentation-en-français-)
   - [Présentation & Métriques Clés](#présentation--métriques-clés)
   - [Démarrage Rapide (2 Commandes)](#démarrage-rapide-2-commandes)
   - [Modes d'Exécution Doubles](#modes-dexécution-doubles)
   - [Architecture Technique](#architecture-technique)
   - [Sécurité & Confidentialité GitHub Public](#sécurité--confidentialité-github-public)
   - [Simulateur Interactif & Archétypes](#simulateur-interactif--archétypes)
   - [Éthique du Matchmaking & Engagement Anti-EOMM](#éthique-du-matchmaking--engagement-anti-eomm)
3. [NPM Scripts Reference](#-npm-scripts-reference)
4. [Author & Research Attribution](#-author--research-attribution)
5. [Legal & Trademarks](#-legal--trademarks)

---

# 🇬🇧 English Documentation

## Project Highlights & Key Performance

Player churn in competitive third-person shooters is heavily correlated with cumulative negative emotional states (**tilt**, loss streaks, toxic interactions, role fatigue) compounded by mechanical frustration (aim deterioration, lane collapses, soul deficit). Rather than predicting churn too late with basic vanity metrics, our model processes a **100-match rolling telemetry window** per player to detect pre-churn distress signals.

| Metric | Value | Production Significance |
| :--- | :--- | :--- |
| **Analyzed Cohort** | **24,500 Matches** | High-volume empirical dataset with strictly leak-free temporal split (19.6k train / 4.9k test) |
| **Observation Window** | **100 Matches** | Rolling temporal analysis capturing player fatigue, soul economy, and aim mechanics |
| **Engineered Features** | **48 Telemetry Variables** | In-depth indicators (`tilt_index`, `headshot_pct`, `souls_diff_10m`, `guardian_diff_10m`, `urn_deliveries`, etc.) |
| **Optimal Churn Recall** | **81.4%** | Calibrated on decision cutoff $\theta^* = 0.42$ to prevent missed churn risks |
| **ROC-AUC Score** | **81.4%** | Strong discrimination power across broad player archetypes |
| **PR-AUC Score** | **80.7%** | Precision-Recall trade-off resilient to class distribution |

---

## Quickstart (2 Commands)

Launch the interactive showcase in under 10 seconds:

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Start the development server
npm run dev
```

Open your browser at **`http://localhost:5173`** (or `http://127.0.0.1:5173`).

> 💡 **Zero Setup Required**: The application runs immediately in **Standalone Showcase Mode** with zero external dependencies, no database setup, and no Python requirement.

---

## Dual Execution Modes

The showcase features an intelligent, resilient network layer that seamlessly adapts to the execution environment:

```
                      ┌──────────────────────────────────────┐
                      │    Showcase App Launched (5173)      │
                      └──────────────────┬───────────────────┘
                                         │
                          GET /api/status (Timeout: 1500ms)
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
            [Backend Responding]                     [Backend Unreachable]
                    │                                         │
          MODE 2: Full-Stack Mode                   MODE 1: Standalone Showcase
      🟢 Badge: "API Connectée / Online"        🟠 Badge: "Mode Démo / Demo Mode"
      • Live FastAPI inference (:8000)          • 100% Offline fallback
      • Resilient DeadlockClient                • 4 Calibrated player archetypes
      • Real-time 48-feature extraction         • Deterministic player synthesizer
```

### Mode 1: Standalone Showcase (Zero Setup, 100% Offline Fallback)
- **Target Audience**: Recruiters, portfolio reviewers, GitHub visitors, offline presentations.
- **Prerequisites**: Node.js 18+ only.
- **Behavior**:
  - The client attempts a health ping to `/api/status` with a **1500ms abort controller timeout**.
  - When the backend is offline, the status indicator displays an amber **"Mode Démo / Demo Mode"** badge.
  - All benchmarks, ROC/PR curves, and confusion matrices load high-fidelity calibrated production results (`mockData.js`).
  - The **Interactive Simulator** provides 4 pre-calibrated studio archetypes with complete SHAP-style factor attributions.
  - Any arbitrary Steam Account ID entered is processed by an offline **deterministic synthesizer** (`synthesizePlayerProfile`), guaranteeing zero crashes and instant visual feedback.

### Mode 2: Full-Stack Mode (Local FastAPI Server & Live Telemetry)
- **Target Audience**: Data scientists and backend engineers testing live match inference.
- **Prerequisites**: Python 3.11+, virtualenv, local backend dependencies.
- **How to run**:
  1. In a separate terminal, start the Python FastAPI service:
     ```bash
     cd backend
     pip install -r requirements.txt
     python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
     ```
  2. Verify backend status:
     ```bash
     curl http://127.0.0.1:8000/api/status
     # Output: {"status":"ok","version":"1.0.0","upstream_healthy":true,"mock_mode":false}
     ```
  3. Start the frontend showcase:
     ```bash
     cd frontend
     npm run dev
     ```
  4. The status indicator immediately switches to an emerald **"API Connectée / Online"** badge. The Vite development proxy forwards all `/api/*` requests directly to `http://127.0.0.1:8000`.
  5. Looking up a valid Steam Account ID triggers live Deadlock API telemetry ingestion (`api.deadlock-api.com`), real-time 48-feature extraction, and live XGBoost model evaluation.

---

## System Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                          SYSTEM ARCHITECTURE                           │
└────────────────────────────────────────────────────────────────────────┘

  [Deadlock Public API (api.deadlock-api.com)] ──(Async httpx / sliding-window rate limit)──┐
                                                                                            │
  [Data Pipeline & DeadlockClient] ◄────────────────────────────────────────────────────────┘
         │
         ├── 100-match rolling window per player
         ├── 48 engineered features (combat, mechanics/aim, economy/souls, psychology/tilt)
         └── Temporal cut-off (14-day inactivity label)
         │
  [Model Training]
         │
         ├── Deadlock V1 XGBoost Champion (`deadlock_xgboost_v1.pkl`)
         ├── Model confrontation: LogReg vs RF vs LightGBM vs XGBoost
         └── Threshold optimization: Decision boundary shifted to θ = 0.42
         │
  [FastAPI Microservice (Port 8000)]
         │
         ├── GET  /api/status               (Healthcheck & upstream status)
         ├── GET  /api/heroes               (Hero metadata & assets)
         ├── GET  /api/ml/metrics           (Benchmark performance stats)
         └── POST /api/predict/{account_id} (Live profile inference & factors)
         │
  [Vite Dev Proxy (Port 5173)] ◄──── Local forward: /api/* ──► :8000
         │
  [React 19 Frontend Showcase (Port 5173)]
         │
         ├── Occult Dieselpunk Dark UI design system (Pure CSS tokens)
         ├── Pure SVG interactive graphics (ROC, PR, Gauge, Heatmap)
         ├── 100% Bilingual dictionary (FR/EN) with instant toggle
         └── Resilient offline fallback layer (zero-crash guarantee)
```

### Technology Highlights
- **Frontend Framework**: **React 19** (Functional components, hooks, error boundaries).
- **Build Tool**: **Vite 8** (Sub-150ms builds, ultra-fast Hot Module Replacement).
- **Styling**: **Pure CSS3 with custom properties** (`src/index.css`). Occult Dieselpunk palette: Midnight Slate (`#0b0f19`), Chem Green (`#10b981`), Electric Blue (`#2563eb`), Steampunk Amber (`#d97706`).
- **Data Visualizations**: **100% Pure SVG & Math** (mathematically calculated SVG paths for ROC & PR curves, confusion matrices, and semicircular gauges with zero external chart dependencies).
- **Internationalization (i18n)**: Dedicated bidirectional translation store (`src/translations.js`) with 100% key parity between English and French.

---

## Security & Public GitHub Guarantees

This repository is strictly configured and audited for public distribution:

1. **ZERO API Keys Required for Frontend**:
   - The showcase requires no private keys, client tokens, or third-party credentials.
   - Live telemetry ingestion is handled server-side through Deadlock API's public endpoints.
2. **ZERO Hardcoded Machine Paths**:
   - No absolute paths (`/Users/...`, `/home/...`, `C:\...`) are embedded in code or build outputs.
   - All assets and internal modules use strictly relative paths.
3. **ZERO Personal Identifiable Information (PII)**:
   - Data is restricted to publicly accessible 32-bit Steam Account IDs and anonymized match metrics.
   - No personal names, emails, IPs, or location telemetry are collected or stored.
4. **Environment Isolation**:
   - `.env.example` provides clean reference variables without exposing internal configuration.
   - `.gitignore` explicitly prevents accidental commits of `.env`, `.env.local`, and build artifacts.

---

## Interactive Player Archetypes & Simulator

The showcase embeds 4 calibrated behavioral archetypes representing classic Deadlock competitive personas:

1. **🔥 The Tilting Trooper / Le Fantassin en Tilt Aigu** (Hero: Abrams)
   - **Churn Probability**: `88.0%` (Critical Risk)
   - **Signature**: High `tilt_index` (82.5), active 6-loss streak, recent lane collapses, severe soul deficit (-3.9k).
   - **Studio Action**: Immediate match cooldown recommendation; pair with calm, high-composure teammates.
2. **⏳ The Burned-Out Veteran / Le Vétéran Épuisé** (Hero: Vindicta)
   - **Churn Probability**: `54.0%` (Moderate Risk)
   - **Signature**: Decreased session frequency, late-night play (`night_owl_pct` = 55%), soul deficit (-1.8k), 3-loss streak.
   - **Studio Action**: Restorative casual game mode nudge; non-ranked queue incentives.
3. **🛡️ The Objective Guardian / Le Gardien des Objectifs** (Hero: Seven)
   - **Churn Probability**: `28.0%` (Low Risk)
   - **Signature**: High objective focus (2 early Guardians breached, Urn secured), strong role consistency (85%), low tilt.
   - **Studio Action**: Standard matchmaking queue; priority team leadership weighting.
4. **⚖️ The Balanced Carry / Le Joueur Régulier & Serein** (Hero: Infernus)
   - **Churn Probability**: `14.0%` (Low Risk)
   - **Signature**: Massive soul lead (+4.2k), surgical aim precision (38% headshots), zero tilt, exemplary composure.
   - **Studio Action**: Natural social retention; benchmark control profile.

---

## Matchmaking Ethics & Anti-EOMM Commitment

Unlike predatory retention mechanics (such as EA's *Engagement-Optimized Matchmaking* / EOMM) that manipulate match outcomes to create artificial addiction loops, this research adheres to **Valve's 50/50 sportsmanship principle**:

- **Strict Fairness Guarantee**: Matchmaking never rigs match outcomes or feeds artificial bot matches to manipulate players.
- **Non-Punitive Interventions**: Detected churn risk triggers protective interventions (pairing tilted players with calm, high-composure teammates; encouraging breaks; offering restorative casual game modes).
- **Transparency**: Clear factor attribution highlights *why* a player is considered at risk.

---

# 🇫🇷 Documentation en Français

## Présentation & Métriques Clés

Le départ d'un joueur (*churn*) dans les jeux de tir compétitifs à la troisième personne est étroitement lié à l'accumulation d'états émotionnels négatifs (**tilt**, séries de défaites, effondrement de lane, fatigue) aggravés par la frustration mécanique (baisse de précision, déficit d'âmes). Plutôt que de constater le churn a posteriori, notre modèle analyse une **fenêtre glissante de 100 parties** pour identifier les signaux précurseurs de décrochage.

| Indicateur | Valeur | Rôle dans l'Étude |
| :--- | :--- | :--- |
| **Cohorte Analysée** | **24 500 Matchs** | Dataset empirique à grande échelle avec découpage temporel sans fuite (19,6k entraînement / 4,9k test) |
| **Fenêtre d'Observation** | **100 Matchs** | Analyse glissante capturant la fatigue, l'économie d'âmes et les mécaniques de tir |
| **Variables Télémétriques** | **48 Features** | Indices avancés (`tilt_index`, `headshot_pct`, `souls_diff_10m`, `guardian_diff_10m`, `urn_deliveries`, etc.) |
| **Rappel Churn Optimal** | **81.4%** | Seuil de décision calibré à $\theta^* = 0.42$ pour minimiser les faux négatifs |
| **Score ROC-AUC** | **81.4%** | Forte capacité de discrimination sur l'ensemble des profils |
| **Score PR-AUC** | **80.7%** | Précision-Rappel robuste face à la distribution des classes |

---

## Démarrage Rapide (2 Commandes)

Lancez l'application showcase en moins de 10 secondes :

```bash
# 1. Installation des dépendances
cd frontend
npm install

# 2. Lancement du serveur de développement
npm run dev
```

Rendez-vous sur **`http://localhost:5173`** dans votre navigateur.

> 💡 **Zéro Configuration Requise** : L'application démarre immédiatement en **Mode Démo Autonome** sans backend Python, sans base de données et sans clé d'API.

---

## Modes d'Exécution Doubles

### Mode 1 : Vitrine Autonome (Zéro Configuration, Fallback Hors-Ligne 100%)
- **Public visé** : Recruteurs, relecteurs techniques, visiteurs GitHub, démonstrations hors-ligne.
- **Prérequis** : Node.js 18+ uniquement.
- **Fonctionnement** :
  - Le frontend effectue un test de santé sur `/api/status` avec un délai d'expiration rapide de **1500 ms**.
  - Si le serveur est éteint, un badge ambre **"Mode Démo / Demo Mode"** s'affiche dans la barre de navigation.
  - L'application charge des métriques et courbes calibrées issues des résultats réels de production (`mockData.js`).
  - Le simulateur propose 4 archétypes types avec décomposition des facteurs d'influence (SHAP).
  - La saisie de n'importe quel Account ID Steam génère un profil déterministe (`synthesizePlayerProfile`), éliminant tout risque de plantage.

### Mode 2 : Mode Full-Stack (Microservice FastAPI & Télémétrie en Direct)
- **Public visé** : Data scientists et ingénieurs ML testant l'inférence en direct.
- **Prérequis** : Python 3.11+, environnement virtuel, dépendances backend.
- **Procédure** :
  1. Lancez le serveur FastAPI sur le port 8000 :
     ```bash
     cd backend
     pip install -r requirements.txt
     python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
     ```
  2. Lancez le frontend showcase :
     ```bash
     cd frontend
     npm run dev
     ```
  3. Le badge passe instantanément au vert émeraude **"API Connectée / Online"**. Le proxy Vite redirige automatiquement les appels `/api/*` vers `http://127.0.0.1:8000`.
  4. L'interrogation d'un compte Steam extrait en temps réel l'historique Deadlock API (`api.deadlock-api.com`), calcule les 48 features et exécute l'inférence XGBoost en direct.

---

## Architecture Technique

- **Frontend** : React 19, Vite 8, Tokens CSS personnalisés (thème Occult Dieselpunk : Ardoise Minuit `#0b0f19`, Vert Chimique `#10b981`, Bleu Électrique `#2563eb`, Ambre Steampunk `#d97706`), graphiques 100% SVG natifs.
- **Backend** : FastAPI, Python 3.11, Pydantic v2, XGBoost, DeadlockClient asynchrone (httpx).
- **Pipeline de Données** :
  1. Ingestion asynchrone Deadlock API (`api.deadlock-api.com`).
  2. Calcul des 48 features comportementales et de tir (précision, dégâts aux Guardians, livraisons d'Urnes, Souls/min, tilt).
  3. Classification XGBoost Deadlock V1 (`deadlock_xgboost_v1.pkl`).
  4. Calibration du seuil de décision à 0.42 pour 81.4% de rappel.
  5. Exposition via microservice FastAPI et rendu React haute fidélité.

---

## Sécurité & Confidentialité GitHub Public

- **Zéro clé d'API requise** côté frontend showcase.
- **Zéro chemin local de machine** (`/Users/...`) présent dans le code source ou les livrables.
- **Zéro donnée personnelle sensible (PII)** : identifiants Steam 32-bit publics et télémétrie agrégée uniquement.
- **Fichiers de configuration sains** : `.env.example` documenté et `.gitignore` protégeant tout secret local.

---

## Simulateur Interactif & Archétypes

1. **Le Fantassin en Tilt Aigu** (Abrams) : Risque 88.0% — Tilt index critique (82.5), série de 6 défaites, effondrement des Guardians, déficit de Souls (-3.9k).
2. **Le Vétéran Épuisé** (Vindicta) : Risque 54.0% — Sessions nocturnes tardives (55%), retard de Souls (-1.8k), série de 3 défaites.
3. **Le Gardien des Objectifs** (Seven) : Risque 28.0% — Forte pression sur les objectifs (2 Guardians détruits, Urne sécurisée), cohérence de rôle (85%), faible tilt.
4. **Le Joueur Régulier & Serein** (Infernus) : Risque 14.0% — Avance massive de Souls (+4.2k), précision chirurgicale (38% headshots), sang-froid et résilience.

---

## Éthique du Matchmaking & Engagement Anti-EOMM

Conformément à la philosophie sportive de Valve et aux principes d'équité :
- **Refus de l'EOMM** : Aucun trucage de partie ni recours à des matchs artificiels pour manipuler la rétention.
- **Équité 50/50** : L'espérance de victoire sportive reste strictement préservée entre The Amber Hand et The Sapphire Flame.
- **Mesures Protectrices** : Détection du tilt pour encourager des pauses, associer le joueur à des coéquipiers calmes ou proposer des modes non-classés reposants.

---

# 🛠️ NPM Scripts Reference

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Vite development server at `http://localhost:5173` |
| `npm run build` | Builds optimized production bundle into `dist/` |
| `npm run preview` | Previews production build locally |
| `node tests/stress_test_translations.js` | Runs bilingual dictionary stress tests (fallback, unicode, symmetry, 50k ops/sec) |

---

# 👤 Author & Research Attribution

- **Researcher / Author** : **Matthieu Gout** • Personal Project 2026 / Projet personnel 2026
- **LinkedIn** : [linkedin.com/in/matthieu-gout](https://www.linkedin.com/in/matthieu-gout)
- **GitHub** : [github.com/ofggout880](https://github.com/ofggout880)

---

# ⚖️ Legal & Trademarks

- **Valve Corporation** : *Deadlock* and *Dota 2* are registered trademarks of Valve Corporation. This project is an independent academic research initiative and engineering portfolio showcase, with no commercial endorsement or affiliation with Valve.
- **Deadlock API** : Match telemetry and game assets are sourced via the public community Deadlock API (`api.deadlock-api.com`) in compliance with its fair-use guidelines and terms of service.
