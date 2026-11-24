# Audit Technique Approfondi — Machine Learning, Data Engineering & Intégration de l'API Deadlock

**Date de l'audit :** Novembre 2026  
**Auteur :** Agent 2 — Spécialiste Machine Learning, Data Engineering & API Deadlock  
**Périmètre audité :**
- Documentation d'architecture & spécifications ([docs/DEADLOCK_API_ASSESSMENT.md](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/docs/DEADLOCK_API_ASSESSMENT.md), [tests_e2e/spec_oracles.py](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/tests_e2e/spec_oracles.py))
- Pipelines de collecte, d'enrichissement et d'entraînement ML ([backend/collect_data.py](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/collect_data.py), [backend/rebuild_and_train_debiased.py](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/rebuild_and_train_debiased.py), [backend/enrich_hidden_gems.py](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/enrich_hidden_gems.py), [backend/train.py](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/train.py))
- Artefacts de données et modèles sérialisés ([backend/data/deadlock_churn_dataset.csv](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/data/deadlock_churn_dataset.csv), [backend/data/ml_results.json](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/data/ml_results.json), [backend/data/features_list.json](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/data/features_list.json), `deadlock_churn_model.pkl`, `deadlock_scaler.pkl`, `raw_histories_cache.joblib`, `mate_stats_cache.joblib`, `match_gems_cache.joblib`, `match_gems_v2_cache.joblib`)
- Back-end de production FastAPI ([backend/app/main.py](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/main.py), [backend/app/client/deadlock_client.py](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/client/deadlock_client.py), [backend/app/services/feature_service.py](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/services/feature_service.py), [backend/app/services/mock_service.py](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/services/mock_service.py), [backend/app/api/routers/](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/api/routers/))
- Synchronisation Front-end / Back-end ([frontend/src/services/api.js](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/services/api.js), [frontend/src/data/mockData.js](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/data/mockData.js), [frontend/src/components/MlBenchmarkSection.jsx](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/MlBenchmarkSection.jsx), [frontend/src/components/PsychologySection.jsx](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/PsychologySection.jsx), [frontend/src/components/ItemsSection.jsx](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/ItemsSection.jsx), [frontend/src/components/ItemTelemetrySection.jsx](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/ItemTelemetrySection.jsx), [frontend/src/components/ArchitectureSection.jsx](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/ArchitectureSection.jsx))

---

## Table des Matières

1. [Synthèse Exécutive de l'Audit](#1-synthèse-exécutive-de-laudit)
2. [Axe 1 : Audit de l'Utilisation de l'API Deadlock & Collecte de Données](#2-axe-1--audit-de-lutilisation-de-lapi-deadlock--collecte-de-données)
   - [2.1 Endpoints effectivement exploités vs Surface disponible (122 endpoints)](#21-endpoints-effectivement-exploités-vs-surface-disponible-122-endpoints)
   - [2.2 Champs de l'API sous-exploités ou ignorés à tort](#22-champs-de-lapi-sous-exploités-ou-ignorés-à-tort)
   - [2.3 Analyse des biais de collecte (Échantillonnage, Survie, Rangs, Patchs, Modes de jeu)](#23-analyse-des-biais-de-collecte-échantillonnage-survie-rangs-patchs-modes-de-jeu)
   - [2.4 Gestion des Rate Limits, Résilience Réseau & Caching](#24-gestion-des-rate-limits-résilience-réseau--caching)
   - [2.5 Bugs techniques dans le parsing live (`player.py`) et dans l'alignement des caches de métadonnées (`match_gems_v2_cache.joblib`)](#25-bugs-techniques-dans-le-parsing-live-playerpy-et-dans-lalignement-des-caches-de-métadonnées-match_gems_v2_cachejoblib)
3. [Axe 2 : Pertinence des Features, Feature Engineering & Risques de Data Leakage](#3-axe-2--pertinence-des-features-feature-engineering--risques-de-data-leakage)
   - [3.1 Pertinence du domaine métier : Adaptation Dota 2 vers Deadlock (3D Shooter + MOBA)](#31-pertinence-du-domaine-métier--adaptation-dota-2-vers-deadlock-3d-shooter--moba)
   - [3.2 Analyse critique #1 : La synthèse artificielle (Proxy Formulaire) dans `collect_data.py` et les constantes / formules cassées dans `feature_service.py`](#32-analyse-critique-1--la-synthèse-artificielle-proxy-formulaire-dans-collect_datapy-et-les-constantes--formules-cassées-dans-feature_servicepy)
   - [3.3 Analyse critique #2 : Risques de Data Leakage (Fuite Temporelle, Fuite de Patch-Era, Fuite d'Agrégats Career)](#33-analyse-critique-2--risques-de-data-leakage-fuite-temporelle-fuite-de-patch-era-fuite-dagrégats-career)
   - [3.4 Analyse critique #3 : Les « 7 Gemmes Cachées Source 2 » (`enrich_hidden_gems.py`) — Excellente trouvaille mais écrasée sur le disque](#34-analyse-critique-3--les--7-gemmes-cachées-source-2--enrich_hidden_gemspy--excellente-trouvaille-mais-écrasée-sur-le-disque)
   - [3.5 Analyse critique #4 : Quatre formules divergentes pour le `tilt_index` à travers le projet](#35-analyse-critique-4--quatre-formules-divergentes-pour-le-tilt_index-à-travers-le-projet)
4. [Axe 3 : Méthodologie Machine Learning & Intégration Back-End / Front-End](#4-axe-3--méthodologie-machine-learning--intégration-back-end--front-end)
   - [4.1 Formulation de la cible ($Y_{14}$) : Classification binaire vs Analyse de Survie](#41-formulation-de-la-cible-y_14--classification-binaire-vs-analyse-de-survie)
   - [4.2 Stratégie de Validation, Group Splitting & Trois Fuites Internes de Validation Croisée](#42-stratégie-de-validation-group-splitting--trois-fuites-internes-de-validation-croisée)
   - [4.3 Sélection de Variables, Multicolinéarité & Pertinence de `StandardScaler` + `SMOTE`](#43-sélection-de-variables-multicolinéarité--pertinence-de-standardscaler--smote)
   - [4.4 Choix des Modèles, Hyperparamètres, Calibration & Seuil de Décision](#44-choix-des-modèles-hyperparamètres-calibration--seuil-de-décision)
   - [4.5 Audit Critique du Back-End d'Inférence : Le modèle `.pkl` entraîné n'est JAMAIS chargé en production !](#45-audit-critique-du-back-end-dinférence--le-modèle-pkl-entraîné-nest-jamais-chargé-en-production-)
   - [4.6 Désynchronisation des Chiffres & Métriques entre Back-End et Front-End (et features fantômes dans `mockData.js`)](#46-désynchronisation-des-chiffres--métriques-entre-back-end-et-front-end-et-features-fantômes-dans-mockdatajs)
   - [4.7 Audit des pages « Dynamique Héros » (`ItemsSection.jsx`) et « Télémétrie ITEM » (`ItemTelemetrySection.jsx`)](#47-audit-des-pages--dynamique-héros--itemssectionjsx-et--télémétrie-item--itemtelemetrysectionjsx)
5. [Axe 4 : Bilan Global (Points Positifs, Points Négatifs) & Plan d'Amélioration Concret](#5-axe-4--bilan-global-points-positifs-points-négatifs--plan-damélioration-concret)
   - [5.1 Ce qui est très bien fait (Points Positifs)](#51-ce-qui-est-très-bien-fait-points-positifs)
   - [5.2 Ce qui ne va pas (Points Négatifs Critiques classés par sévérité)](#52-ce-qui-ne-va-pas-points-négatifs-critiques-classés-par-sévérité)
   - [5.3 Feuille de Route & Propositions Concrètes d'Amélioration (avec Code)](#53-feuille-de-route--propositions-concrètes-damélioration-avec-code)
6. [Questions Restantes & Pistes d'Investigation Complémentaires](#6-questions-restantes--pistes-dinvestigation-complémentaires)

---

## 1. Synthèse Exécutive de l'Audit

Le projet **`deadlock-predictor`** présente une ambition technique remarquable : transposer une méthodologie académique de prédiction d'attrition (*player churn* à 14 jours) et de détection du *tilt* issue de *Dota 2* vers le nouveau titre hybride *Deadlock* (MOBA 6v6 + Third-Person Shooter 3D sur moteur Source 2).

L'inspection intégrale du code, des caches de données (`184 Mo` d'historiques bruts couvrant `1 500` joueurs et `923 185` matchs dans `raw_histories_cache.joblib`, `1 046` graphes sociaux dans `mate_stats_cache.joblib`, et `6 898` enregistrements de métadonnées Source 2 sur `5 128` matchs parsés dans `match_gems_v2_cache.joblib`) et des pipelines ML révèle un **contraste fort entre une ingénierie de données très créative et plusieurs ruptures architecturales majeures entre les scripts d'entraînement, le serveur FastAPI et le front-end React** :

| Domaine Évalué | Note / Statut | Constat Principal |
|---|---|---|
| **Documentation & Maîtrise API Deadlock** | **Excellent (9/10)** | Le document [DEADLOCK_API_ASSESSMENT.md](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/docs/DEADLOCK_API_ASSESSMENT.md) est d'une qualité industrielle rare. L'utilisation des endpoints *Free Tier* (`/match-history?only_stored_history=true`, `/enemy-stats`, `/mate-stats`, `/matches/metadata` en batch de 450) est ingénieuse. |
| **Feature Engineering & Idées Métier (« 7 Hidden Gems »)** | **Très Bon sur le concept (8/10), Moyen sur l'exécution (5/10)** | L'extraction des **7 Gemmes Cachées Source 2** dans [enrich_hidden_gems.py](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/enrich_hidden_gems.py) (`stun_headshots_taken_rate`, `grey_screen_ratio`, `late_panic_sells`, `solo_isolation_streak`, `parry_miss`, `unsecured_souls_lost`, `teammate_support`) est brillante. **Mais** dans [collect_data.py](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/collect_data.py#L308-L366), plus de 20 features sur 48 sont **simulées par des formules heuristiques** à partir du KDA et du Net Worth. |
| **Intégrité des Artefacts sur Disque (`backend/data/`)** | **Critique (3/10)** | [rebuild_and_train_debiased.py](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/rebuild_and_train_debiased.py) a été exécuté **après** [enrich_hidden_gems.py](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/enrich_hidden_gems.py) (le 9 nov. à 12h56 contre le 8 nov. à 09h20), **écrasant** `deadlock_churn_dataset.csv`, `ml_results.json` et `deadlock_churn_model.pkl` avec la version *sans* les 7 Hidden Gems, et désalignant `match_gems_v2_cache.joblib` qui ne couvre plus que `1 395` des `10 000` nouvelles fenêtres ! |
| **Inférence ML en Production (`feature_service.py`)** | **Critique (2/10)** | Le back-end FastAPI ([feature_service.py](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/services/feature_service.py#L290-L385)) **ne charge jamais** `deadlock_churn_model.pkl` ni `deadlock_scaler.pkl`. Il utilise une équation logistique codée en dur à 8 variables, ignore `match_duration_s` (`m.get("duration_s", 1800)`), et n'appelle jamais `/v1/matches/metadata` lors d'une prédiction live. |
| **Cohérence Back-End / Front-End** | **Critique (3/10)** | Quatre générations d'expériences ML cohabitent dans le front-end : l'étude *Dota 2 V6* (`N=13 584`, ROC `80.0%`), le *Plan 3 De-Biased* (`N=10 000`, ROC `77.12%`, MLP), l'étude *7 Hidden Gems* (`N=3 244 / Test=514`, ROC `67.32%`), et l'étude *Items/Héros* (`N=2 696 / 397 replays`, codée en dur dans `items.py`). |

---

## 2. Axe 1 : Audit de l'Utilisation de l'API Deadlock & Collecte de Données

### 2.1 Endpoints effectivement exploités vs Surface disponible (122 endpoints)

L'API Deadlock (`https://api.deadlock-api.com`) expose 122 endpoints documentés dans [docs/DEADLOCK_API_ASSESSMENT.md](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/docs/DEADLOCK_API_ASSESSMENT.md#L621-L704). Voici la cartographie exacte de ce qui est réellement appelé dans le code :

| Endpoint Deadlock API | Utilisé dans les scripts offline (`collect_data.py` / `enrich_hidden_gems.py`) | Utilisé dans le Back-End Live (`deadlock_client.py` / Routers) | Analyse Technique |
|---|---|---|---|
| `GET /v1/matches/recently-fetched` | **Oui** ([collect_data.py:612](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/collect_data.py#L612)) | Non | Excellente source pour découvrir des joueurs actifs de tous niveaux. |
| `GET /v1/leaderboard/{region}` | **Oui** (`Europe`, `NAmerica`, `Asia` — [collect_data.py:626](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/collect_data.py#L626)) | Non | Utilisé pour amorcer la découverte de joueurs classés (top 120 par région). |
| `GET /v1/players/{id}/enemy-stats` | **Oui** ([collect_data.py:641](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/collect_data.py#L641)) | Non | **Très bonne idée** : permet de récupérer d'anciens adversaires ayant potentiellement arrêté de jouer, réduisant le biais de survie (*survivorship bias*). |
| `GET /v1/players/hero-stats` | **Oui** (batchs de 50 IDs — [collect_data.py:682](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/collect_data.py#L682)) | Non | Récupère les statistiques agrégées en carrière par héros (`accuracy`, `crit_shot_rate`, `damage_per_soul`). **Attention : source de data leakage temporel** (voir §3.3). |
| `GET /v1/players/{id}/match-history` | **Oui** (`?only_stored_history=true` — [collect_data.py:742](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/collect_data.py#L742)) | **Oui** (sans `only_stored_history=true` — [deadlock_client.py:304](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/client/deadlock_client.py#L304)) | Pilier de la collecte : interroge ClickHouse à 100 req/s gratuitement. **Bug live** : l'absence de `only_stored_history=true` dans `deadlock_client.py` expose le back-end à la limite stricte de refetch Steam GC (5 req/h). |
| `GET /v1/players/{id}/mate-stats` | **Oui** ([enrich_hidden_gems.py:109](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/enrich_hidden_gems.py#L109)) | Non | Permet de reconstruire le graphe social (`party_play_pct`, `solo_isolation_streak`). Mis en cache dans `mate_stats_cache.joblib` (1 046 joueurs). |
| `GET /v1/matches/metadata` (Bulk) | **Oui** (batchs de 450 `match_ids` — [enrich_hidden_gems.py:295](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/enrich_hidden_gems.py#L295)) | Non (`get_match_metadata` unitaire existe dans [deadlock_client.py:306](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/client/deadlock_client.py#L306) mais n'est **jamais appelé** par les routers !) | Utilisation exemplaire dans `enrich_hidden_gems.py` avec `extra_player_columns=death_details.time_to_kill_s,death_details.death_duration_s,items.sold_time_s`. Totalement absent de l'inférence live. |
| `GET /v1/info/health` & `/v1/assets/heroes` | Non | **Oui** ([health.py:28, 60](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/api/routers/health.py#L28)) | Utilisés pour le healthcheck `/api/status` et le catalogue `/api/heroes`. |
| `GET /v1/players/steam` & `/v1/players/steam-search` | **Non** | **Non** ([player.py:26](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/api/routers/player.py#L26) utilise uniquement `MockService.search_players`) | **Sous-exploitation critique** : la barre de recherche du site ne cherche que parmi 8 profils codés en dur dans `MockService` au lieu d'interroger `/v1/players/steam-search` et `/v1/players/steam` ! |
| `GET /v1/assets/items` & `/v1/analytics/item-stats` | **Non** | **Non** ([items.py:13, 270](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/api/routers/items.py#L13) est 100% statique) | Les statistiques d'items et de héros dans `items.py` sont des constantes Python statiques, sans script reproductible visible dans `backend/`. |

### 2.2 Champs de l'API sous-exploités ou ignorés à tort

L'inspection directe d'un enregistrement réel de `raw_histories_cache.joblib` (923 185 matchs stockés) montre que chaque objet retourné par `/v1/players/{id}/match-history` contient **28 champs natifs** :

```python
# Schéma réel observé dans backend/data/raw_histories_cache.joblib :
{
  'account_id': 389373960, 'match_id': 133079692, 'hero_id': 84, 'hero_level': 33,
  'start_time': 1794073478, 'game_mode': 1, 'match_mode': 1, 'player_team': 0,
  'player_kills': 5, 'player_deaths': 6, 'player_assists': 19, 'denies': 2,
  'net_worth': 39284, 'last_hits': 182, 'abandoned_time_s': 0, 'match_duration_s': 2154,
  'match_result': 1, 'objectives_mask_team0': 8260, 'objectives_mask_team1': 32325,
  'brawl_score_team0': None, 'brawl_score_team1': None, 'brawl_avg_round_time_s': None,
  'player_match_outcome': 2, 'ranked_display_badge': None, 'ranked_delta': None,
  'ranked_calibration_match': 0, 'ranked_used_demotion_protection': None, 'low_pri_pool': False
}
```

Or, plusieurs champs directement présents dans `match-history` ont été **ignorés et remplacés par des approximations artificielles** :
1. **`ranked_used_demotion_protection`, `ranked_delta`, `ranked_display_badge` et `ranked_calibration_match`** :
   - Dans [collect_data.py:416-419](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/collect_data.py#L416-L419), la variable `demotion_risk_pct` est fabriquée artificiellement par :
     ```python
     demotion_risk_pct = min(100.0, max(0.0, (0.5 - win_rate) * 150.0 + recent_loss_streak * 9.5))
     ```
   - Pourtant, l'API Deadlock fournit nativement `ranked_used_demotion_protection` (booléen indiquant que le joueur est exactement sur le seuil de rétrogradation de division), `ranked_delta` (variation de rang) et `ranked_display_badge` ! Ne pas utiliser ces champs alors qu'ils sont déjà téléchargés dans `raw_histories_cache.joblib` est une occasion manquée majeure.
2. **`game_mode` et `match_mode` (`brawl_score_team0`, `brawl_avg_round_time_s`)** :
   - Dans [collect_data.py:748-754](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/collect_data.py#L748-L754), tous les matchs de plus de 300 secondes sont mélangés sans filtrer `game_mode` ni `match_mode`.
   - Or, Deadlock comporte le mode *Street Brawl* (`game_mode=4`, parties condensées d'environ 12–14 minutes) en plus du mode 6v6 standard (`game_mode=1`). Mélanger des matchs Street Brawl de 12 minutes avec des matchs 6v6 de 35 minutes fausse la variable `recent_stomp_losses` (définie par `wins[i] == 0 and durations_min[i] < 24.0` dans [collect_data.py:463](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/collect_data.py#L463)) : une défaite normale en Street Brawl est comptabilisée à tort comme un « stomp humiliant » en 6v6 !
   - De plus, le docstring de [enrich_hidden_gems.py:17](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/enrich_hidden_gems.py#L17) affirme : *« 4. Normalizes 14-minute Street Brawl (`game_mode=4`) matches so match mode duration does not confound 6v6 economy variables »*, et le front-end ([mockData.js:63, 159](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/data/mockData.js#L63)) met en avant la feature `street_brawl_affinity` comme Gemme #7 (`18.8%` vs `13.5%`). **Pourtant, le code de `enrich_hidden_gems.py` ne contient aucune référence à `game_mode` ni à `street_brawl_affinity` !**
3. **Les snapshots temporels à 180 secondes (`players[].stats[]`) et les coordonnées spatiales (`death_details.killer_pos`, `victim_pos`) de `/v1/matches/metadata`** :
   - Bien que `enrich_hidden_gems.py` récupère `final_stats` et 3 colonnes supplémentaires (`time_to_kill_s`, `death_duration_s`, `items.sold_time_s`), le tableau temporel par tranches de 180 secondes (qui donne le **vrai** `net_worth` à 10 min et 20 min, les achats d'items exacts pour `tier3_item_timing` et `tier4_item_timing`, ainsi que `watched_death_replays` et `pings`) n'est jamais extrait.

### 2.3 Analyse des biais de collecte (Échantillonnage, Survie, Rangs, Patchs, Modes de jeu)

1. **Atténuation intelligente du biais de survie (*Survivorship Bias*), mais biais d'activité minimale ($\ge 22$ matchs)** :
   - **Point fort** : Combiner `/v1/matches/recently-fetched` (joueurs actifs), `/v1/leaderboard/{region}` (joueurs classés) et `/v1/players/{id}/enemy-stats` (anciens adversaires rencontrés par les seeds — [collect_data.py:638-658](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/collect_data.py#L638-L658)) permet de capturer des joueurs qui ont cessé de jouer il y a plusieurs semaines ou mois.
   - **Biais résiduel (Cold-Start Exclusion)** : La condition `len(valid_m) >= 22` ([collect_data.py:747-755](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/collect_data.py#L747-L755)) exclut tous les nouveaux joueurs qui quittent le jeu durant leurs 21 premières parties (*early onboarding churn*). Le modèle est donc strictement un modèle de **rétention de joueurs établis (veteran/mid-lifecycle churn)** et non d'onboarding.
   - **Biais de sélection vers le haut du classement (High-MMR Bias)** : L'ajout des 360 comptes issus du Top 120 des leaderboards Europe, Amérique du Nord et Asie ([collect_data.py:625-635](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/collect_data.py#L625-L635)) sur-représente les joueurs *Eternus / Ascendant* (~20% de la cohorte initiale) par rapport à la pyramide réelle des rangs.
2. **Biais d'échantillonnage intra-joueur (Jusqu'à 35–40 fenêtres par joueur)** :
   - Dans [rebuild_and_train_debiased.py:317-359](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/rebuild_and_train_debiased.py#L317-L359), le script extrait jusqu'à **40 fenêtres glissantes $W=20$ par joueur** (espacées de seulement 5 matchs : `abs(idx - u) >= 5`).
   - Deux fenêtres espacées de 5 matchs sur une taille de fenêtre de 20 matchs **partagent 15 matchs identiques (75% de recouvrement)** !
   - De plus, un joueur très actif ayant 800 matchs génère 40 lignes dans le dataset (majoritairement avec $Y_{14}=0$, ou des pauses temporaires de 14 jours suivies d'un retour), tandis qu'un joueur qui a définitivement quitté le jeu après 25 matchs ne génère qu'**une seule ligne** ($Y_{14}=1$). Ainsi, la majorité des cas positifs ($Y_{14}=1$) dans les 10 000 fenêtres sont en réalité des **pauses temporaires (*hiatus* de 14+ jours au milieu d'une carrière active)** et non des abandons définitifs (*permanent churn*).
3. **Biais de Patch-Era (Dérive temporelle 2024–2026)** :
   - Deadlock a connu des refontes profondes de son économie de Souls et de sa carte (passage de 4 lanes à 3 lanes / modification des Walkers et Flex Slots).
   - L'audit intégré dans [ml_results.json:5-6](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/data/ml_results.json#L5-L6) montre un résultat révélateur :
     ```json
     "patch_era_leakage_roc_auc_before": 0.9224,
     "patch_era_leakage_roc_auc_after": 0.9304
     ```
   - **Pourquoi la standardisation par ère (`standardize_within_patch_era`) a-t-elle échoué à réduire le ROC-AUC de prédiction de l'ère (qui est même monté à 0.9304) ?**
     Parce que dans [rebuild_and_train_debiased.py:477-479](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/rebuild_and_train_debiased.py#L477-L479), seules 22 colonnes (`PATCH_SENSITIVE_COLS`) sont standardisées sur les 79 candidates, et les variables de comptage discrètes (`guardian_kills`, `walker_kills`, `flex_slot_unlock_time`) conservent des distributions multimodales propres à chaque patch que les arbres de décision identifient immédiatement. Heureusement, l'appariement par strates temporelles (*Time-Stratified Propensity Matching* sur 12 quantiles dans [rebuild_and_train_debiased.py:366-400](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/rebuild_and_train_debiased.py#L366-L400)) a ramené la corrélation `corr(match_T_start_time, is_churn)` à `-0.0916`, ce qui atténue fortement l'impact direct sur la cible.

### 2.4 Gestion des Rate Limits, Résilience Réseau & Caching

- **Dans `DeadlockClient` ([backend/app/client/deadlock_client.py](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/client/deadlock_client.py))** :
  - L'implémentation asynchrone avec `httpx.AsyncClient`, verrou `asyncio.Lock()` espaçant les requêtes de `0.05s` (20 req/s), lecture de l'en-tête `Retry-After` sur `429/503/504` avec plafond à `30.0s`, backoff exponentiel sur `500/502`, et cache LRU borné (`OrderedDict`, `maxsize=1000`) avec bascule transparente vers `MockService` est **exemplaire**.
  - **Défaut technique sur le client live** : Dans [deadlock_client.py:304](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/client/deadlock_client.py#L304), `get_player_match_history` appelle `/v1/players/{account_id}/match-history` **sans** le paramètre `params={"only_stored_history": "true"}`. Sans ce paramètre, l'API Deadlock tente de rafraîchir l'historique auprès du Game Coordinator Steam, ce qui est limité à **5 requêtes par heure** et provoque des erreurs `429/503` inutiles alors que ClickHouse (`only_stored_history=true`) autorise **100 requêtes par seconde**.
- **Dans `enrich_hidden_gems.py` ([backend/enrich_hidden_gems.py:256-346](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/enrich_hidden_gems.py#L256-L346))** :
  - Le regroupement de 450 `match_ids` par appel sur `/v1/matches/metadata?match_ids=...&limit=450` avec sauvegarde incrémentale tous les 5 batchs dans `match_gems_v2_cache.joblib` est une excellente pratique de Data Engineering qui respecte la limite de 30 req/min du Free Tier.

### 2.5 Bugs techniques dans le parsing live (`player.py`) et dans l'alignement des caches de métadonnées (`match_gems_v2_cache.joblib`)

Une inspection approfondie du code back-end et des fichiers `.joblib` sur le disque met en évidence **trois bugs silencieux mais très impactants** :

1. **Bug d'inversion Victoire / Défaite pour l'Équipe 1 (`Sapphire Flame`) dans `player.py` et `feature_service.py`** :
   - Dans l'API Deadlock (`/v1/players/{id}/match-history`), le champ `match_result` indique **l'équipe gagnante (`0` ou `1`)**, tandis que `player_team` indique l'équipe du joueur (`0` ou `1`). Le script [collect_data.py:182-195](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/collect_data.py#L182-L195) le gère parfaitement via `is_match_won(m)` (`int(p_team) == int(m_res)`).
   - **En revanche**, dans le back-end de production ([player.py:72](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/api/routers/player.py#L72) et [feature_service.py:177, 190, 196](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/services/feature_service.py#L177)), le code suppose que `match_result == 1` signifie « Victoire du joueur » et `match_result == 0` signifie « Défaite du joueur » :
     ```python
     # backend/app/services/feature_service.py (lignes 177 et 190) :
     wins = sum(1 for m in matches if m.get("match_result", 0) == 1)
     ...
     if m.get("match_result", 0) == 0:
         recent_loss_streak += 1
     ```
   - **Conséquence** : Lorsqu'un vrai joueur est requêté en direct via l'API Deadlock, toutes ses victoires avec l'équipe 0 (`match_result == 0, player_team == 0`) sont comptées comme des **défaites**, et toutes ses défaites avec l'équipe 0 (`match_result == 1, player_team == 0`) sont comptées comme des **victoires** ! Son `lane_win_rate`, son `recent_loss_streak` et son `current_streak` sont donc totalement faussés (aléatoires à 50%) !
2. **Incohérence de clé `match_duration_s` (API Deadlock) vs `duration_s` (`feature_service.py` et `player.py`)** :
   - L'API Deadlock `/v1/players/{id}/match-history` nomme la durée du match **`match_duration_s`** (comme vérifié dans `raw_histories_cache.joblib` et [collect_data.py:259](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/collect_data.py#L259)).
   - Or, [feature_service.py:145](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/services/feature_service.py#L145) et [player.py:80](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/api/routers/player.py#L80) lisent **`m.get("duration_s", 1800)`** !
   - **Conséquence** : Pour 100% des vrais matchs provenant de l'API Deadlock en direct, la durée réelle est ignorée et remplacée par la valeur par défaut de **1800 secondes (30m00s)** ! Cela fausse `souls_per_min`, `last_hits_per_min`, `denies_per_min`, `kills_per_min`, `deaths_per_min` et `assists_per_min` lors de l'inférence live.
3. **Désalignement des fenêtres entre `deadlock_churn_dataset.csv` et `match_gems_v2_cache.joblib`** :
   - Dans `match_gems_v2_cache.joblib`, `fetched_match_ids` contient `6 364` IDs de matchs (dont `5 128` matchs modernes ayant retourné des métadonnées Source 2 valides, soit `6 898` paires `(match_id, account_id)`). Les `1 236` matchs restants ont des `match_id < 152129` (très anciens matchs de 2024 purgés par Valve pour lesquels `/v1/matches/metadata` renvoie une liste vide).
   - Ce cache avait été construit pour un jeu de fenêtres précédent (`3 244` fenêtres dont `2 696` enrichies). Mais lorsque `rebuild_and_train_debiased.py` a ré-échantillonné aléatoirement `10 000` nouvelles fenêtres le 9 novembre à 12h55 (`matched_candidates.sample(...)`), les ancres `match_T_id` ont changé : **aujourd'hui, seules `1 395` fenêtres sur les `10 000` de `deadlock_churn_dataset.csv` correspondent aux matchs présents dans `match_gems_v2_cache.joblib` !**

---

## 3. Axe 2 : Pertinence des Features, Feature Engineering & Risques de Data Leakage

### 3.1 Pertinence du domaine métier : Adaptation Dota 2 vers Deadlock (3D Shooter + MOBA)

La structuration conceptuelle en **4 domaines équilibrés de 12 features (48 features canoniques)** plus les variables de contexte du Match $T$ et les **7 Gemmes Cachées Source 2** est très pertinente d'un point de vue métier :
- **Domaine I (Visée 3D & Mécaniques Shooter)** : Capture la dimension FPS/TPS absente de Dota 2 (`accuracy_pct`, `headshot_ratio`, `accuracy_trend_last5`, `aim_consistency`).
- **Domaine II (Économie des Souls & Progression)** : Adapte le farming MOBA aux mécaniques spécifiques de Deadlock (sécurisation/denies des orbes flottants, déblocage des Flex Slots liés aux objectifs).
- **Domaine III (Combat & Dynamique d'Objectifs)** : Suit la chaîne structurelle `Guardians -> Walkers -> Urn -> Mid-Boss -> Patron`.
- **Domaine IV (Psychologie, Tilt & Rétention)** : Modélise l'épuisement compétitif (`recent_loss_streak`, `night_owl_pct`, `abandon_rate`, `session_fatigue_index`).

### 3.2 Analyse critique #1 : La synthèse artificielle (Proxy Formulaire) dans `collect_data.py` et les constantes / formules cassées dans `feature_service.py`

C'est **le point faible méthodologique le plus important du pipeline de base ([collect_data.py:306-366](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/collect_data.py#L306-L366))**.  
Parce que l'endpoint `/v1/players/{id}/match-history` ne retourne que les statistiques macroscopiques de fin de match (K/D/A, `net_worth`, `last_hits`, `denies`, `match_duration_s`, `objectives_mask`), `collect_data.py` **simule mathématiquement** plus de 20 variables micro-télémétriques à partir de formules déterministes basées sur `k`, `d`, `a`, `nw`, `lh`, `dn` et `won` :

```python
# Extrait de backend/collect_data.py (lignes 308-365) :
perf_mod = max(0.72, min(1.28, 0.88 + 0.04 * min(kda_m, 6.0) + (0.04 if won else -0.04) - 0.012 * max(0.0, d - 6.0)))
eff_acc = max(0.12, min(0.78, base_acc * perf_mod))
sh_hit = max(30.0, lh * 3.8 + k * 26.0 + a * 11.0 + dur_m * 14.0)
...
dr_rate = min(0.95, max(0.05, 0.24 + (0.14 if not won else 0.0) + 0.025 * max(0.0, d - 4.0) + (0.15 if is_ab else 0.0)))
death_replays_v.append(d * dr_rate)
crosshair_v.append(min(68.0, max(12.0, acc_pct * 0.76 + (dn / dur_m) * 6.5)))
nw_10m_v.append(min(nw, spm_m * 10.0 * (0.94 if won else 0.84)))
nw_20m_v.append(min(nw, spm_m * 20.0 * (0.98 if won else 0.90)))
t3_time_v.append(max(420.0, min(dur_s * 0.68, (9500.0 / spm_safe) * 60.0)))
```

**Conséquences directes de cette synthèse formulaire :**
1. **Colinéarité artificielle massive** : Comme `net_worth_10m`, `net_worth_20m`, `tier3_item_timing` et `tier4_item_timing` sont tous calculés comme de simples fonctions algébriques de `souls_per_min` (`spm_m`), leur corrélation avec `souls_per_min` dépasse **0.95** ! De même, `watched_death_replays` n'est pas le vrai compteur Valve de ralentis de mort dans `collect_data.py`, mais une fonction linéaire de `deaths` et `won` ! C'est exactement pour cela que le filtre de colinéarité (`|r| > 0.90` dans [ml_results.json:156-247](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/data/ml_results.json#L156-L247)) élimine 18 features d'un coup (`net_worth_10m` $r=0.968$, `net_worth_20m` $r=0.949$, `crosshair_on_target_pct` $r=0.993$, `headshot_ratio` $r=0.995$, `pause_tilt_frequency` $r=0.979$, etc.).
2. **Perte du signal réel de dégradation mécanique (`accuracy_trend_last5`)** : Puisque `eff_acc` est modulé par `perf_mod` (qui dépend du KDA et de la victoire), `accuracy_trend_last5` dans `collect_data.py` mesure en réalité **la variation du KDA et du Win Rate sur les 5 derniers matchs**, et non une véritable fatigue motrice de la souris en 3D !
3. **Divergence totale et constantes figées dans `feature_service.py` (Back-end live)** :
   - Dans [feature_service.py:114-184](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/services/feature_service.py#L114-L184), lorsque le back-end reçoit les matchs de `/v1/players/{id}/match-history`, les champs `shots_hit`, `shots_missed`, `watched_death_replays`, `guardian_kills`, `walker_kills`, `urn_deliveries`, `mid_boss_participations` ne sont **pas présents** dans la réponse de cet endpoint. Le code utilise donc les valeurs par défaut `m.get("shots_hit", 350)`, `m.get("shots_missed", 650)`, `m.get("watched_death_replays", 1)`, `m.get("guardian_kills", 2)` ! Résultat : **pour n'importe quel vrai joueur analysé en direct via l'API Deadlock, `accuracy_pct` vaut systématiquement `35.0%`, `accuracy_trend_last5` vaut `0.0`, et `watched_death_replays` vaut `1.0` !**
   - Plus grave encore, [feature_service.py:228](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/services/feature_service.py#L228) définit **`match_frequency_drift` (la feature #1 du modèle entraîné !)** par :
     ```python
     match_frequency_drift = round(max(-1.0, min(1.0, (old_acc - rec_acc) / 50.0)), 2)
     ```
     Au lieu de calculer la dérive temporelle entre les timestamps `start_time` des matchs (comme dans [collect_data.py:391-401](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/collect_data.py#L391-L401)), `feature_service.py` calcule `match_frequency_drift` à partir de la différence de précision de tir `(old_acc - rec_acc) / 50.0` (qui vaut toujours `0.0` en live) ! De même, `tier3_item_timing`, `tier4_item_timing` et `flex_slot_unlock_time` sont exprimés **en minutes** (`10.0` à `28.0`) dans [feature_service.py:162-164](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/services/feature_service.py#L162-L164), alors qu'ils sont exprimés **en secondes** (`420.0` à `1650.0`) dans [collect_data.py:349-355](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/collect_data.py#L349-L355) et dans `deadlock_scaler.pkl` !

### 3.3 Analyse critique #2 : Risques de Data Leakage (Fuite Temporelle, Fuite de Patch-Era, Fuite d'Agrégats Career)

L'audit de fuite de données (*data leakage*) révèle un bilan contrasté :

1. **Zéro fuite sur la cible $Y_{14}$ (Très bien exécuté)** :
   - Dans [collect_data.py:802-811](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/collect_data.py#L802-L811) et [rebuild_and_train_debiased.py:294-309](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/rebuild_and_train_debiased.py#L294-L309), la fenêtre d'observation $W$ utilise strictement les 20 matchs antérieurs ou égaux à $m_T$ (`matches[idx : idx + 20]`), tandis que le label `is_churn` est calculé uniquement à partir de l'écart temporel avec le match suivant `matches[idx - 1]` (ou `max_observed_ts` si `idx == 0` et `start_time <= max_observed_ts - 14d`). Aucune variable post-$m_T$ de `match-history` n'entre dans $W$.
2. **Fuite temporelle (*Lookahead Leakage*) via `/v1/players/hero-stats` dans `collect_data.py` et `rebuild_and_train_debiased.py`** :
   - Dans [collect_data.py:299-305](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/collect_data.py#L299-L305), les variables de tir et de dégâts d'une fenêtre historique $W$ (par exemple en janvier 2025) utilisent `base_acc`, `base_crit` et `dmg_per_soul` provenant de `/v1/players/hero-stats`. Or, cet endpoint retourne les statistiques **cumulées sur toute la carrière du joueur jusqu'à aujourd'hui (novembre 2026)**, incluant donc les matchs futurs postérieurs à $m_T$ !
   - *Note positive* : Ce problème a été explicitement identifié et corrigé dans [enrich_hidden_gems.py:409-446](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/enrich_hidden_gems.py#L409-L446) en remplaçant les multiplicateurs `/hero-stats` par les vraies valeurs de `/v1/matches/metadata` (`real_sh_hit`, `real_sh_miss`, `damage_mitigated`). Mais comme `rebuild_and_train_debiased.py` a écrasé le dataset final, la fuite `/hero-stats` est revenue dans le CSV actuellement sur le disque.
3. **Fuite temporelle dans la reconstruction du graphe social (`/v1/players/{id}/mate-stats`)** :
   - Dans [enrich_hidden_gems.py:114-118](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/enrich_hidden_gems.py#L114-L118), un match $m \in W$ est étiqueté comme « joué en groupe (`is_party = 1`) » si le joueur a joué au moins 2 matchs **sur l'ensemble de sa carrière (`matches_played >= 2`)** avec un coéquipier présent dans $m$. Si deux joueurs solo-queue se rencontrent pour la première fois au match $m_T$, puis rejouent ensemble 3 mois plus tard (après $m_T$), le compteur global `matches_played` vaut 2 et `m_T` est rétroactivement marqué comme un match de groupe. Pour éliminer totalement ce *lookahead* et les coïncidences de matchmaking à haut MMR, il faudrait soit compter uniquement les co-occurrences antérieures ou égales à $m_T$ (`mid <= match_T_id`), soit extraire le champ natif `party` directement depuis `/v1/matches/metadata`.
4. **Gestion de la tautologie calendaire (`avg_session_gap_days` et `match_frequency_drift`)** :
   - Prédire qu'un joueur va faire une pause de $\ge 14$ jours à partir du fait qu'il fait déjà des pauses de 10 jours entre ses sessions (`avg_session_gap_days`) ou que son rythme ralentit (`match_frequency_drift`) relève de la **quasi-tautologie calendaire** (le modèle prédit l'espacement futur par l'espacement récent, sans comprendre ce qui s'est passé *dans le jeu*).
   - Dans [rebuild_and_train_debiased.py:136-138](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/rebuild_and_train_debiased.py#L136-L138), `avg_session_gap_days` a été retiré, mais **`match_frequency_drift` et `ix_drift_x_tilt` ont été conservés**. Résultat dans [ml_results.json:306-312](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/data/ml_results.json#L306-L312) : `match_frequency_drift` arrive **#1 des features** (13.24% d'importance, MI = 0.0617, soit 5 fois plus que n'importe quelle variable de gameplay !).
   - Dans [enrich_hidden_gems.py:735](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/enrich_hidden_gems.py#L735), `BANNED_CALENDAR_FEATURES = {"avg_session_gap_days", "match_frequency_drift"}` bannit courageusement les deux variables calendaires pour forcer un apprentissage **100% In-Game Pure**. Le ROC-AUC passe alors légitimement de `0.7712` (avec dérive calendaire) à `0.6732` (100% gameplay pur). C'est une démarche scientifiquement honnête et rigoureuse, mais dont les artefacts ont malheureusement été écrasés.

### 3.4 Analyse critique #3 : Les « 7 Gemmes Cachées Source 2 » (`enrich_hidden_gems.py`) — Excellente trouvaille mais écrasée sur le disque

L'analyse du script [backend/enrich_hidden_gems.py](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/enrich_hidden_gems.py#L142-L253) et du cache `backend/data/match_gems_v2_cache.joblib` (`6 898` enregistrements joueurs-matchs riches : `6 896` avec `custom_user_stats`, `6 704` avec `shots_hit > 0`, `6 711` avec `death_duration_s` et `6 667` avec `items_sold_time_s`) démontre une **exploitation exceptionnelle de la télémétrie profonde Source 2** :

1. **Gemme #1 (`gold_death_loss` / `unsecured_souls_lost_per_min`)** : Mesure les âmes non sécurisées perdues au sol lors d'une mort (mécanique unique à Deadlock issue des camps neutres et des caisses).
2. **Gemme #2 (`Bullet Stats##StunHeadshotHitRate` & `headshot_diff_rate`)** : Exploite le dictionnaire `custom_user_stats` du moteur Source 2 pour comparer les headshots infligés vs subis (`Bullet Stats - Incoming##HeadshotRate`) et les headshots reçus sous contrôle de foule (stun/immobilisation).
3. **Gemme #3 (`Parry Miss`)** : Compteur natif Source 2 des parades de mêlée ratées (exposant le joueur à une punition critique).
4. **Gemme #4 (`death_details_death_duration_s` & `time_to_kill_s` $\to$ `grey_screen_ratio`, `instant_burst_death_rate`)** : Calcule la fraction exacte du match passée mort devant un écran gris et le taux de morts instantanées ($TTK \le 2.5\text{s}$).
5. **Gemme #5 (`items_sold_time_s` $\to$ `late_panic_sells`, `rage_sell_rate`)** : Détecte la liquidation impulsive d'objets dans les 120 dernières secondes du match.
6. **Gemme #6 (`/v1/players/{id}/mate-stats` $\to$ `solo_isolation_streak`, `party_play_pct`, `party_abandonment_drift`)** : Quantifie l'effet protecteur du jeu en groupe (*Social Shield*).
7. **Gemme #7 (`teammate_healing` + `teammate_barriering` & `Comeback Gold`)** : Mesure l'altruisme envers l'escouade et les défaites crève-cœur après une longue partie (`dur_m >= 33.0` avec `kda_m >= 1.45`).

**Deux réserves techniques sur `enrich_hidden_gems.py` :**
- **Couverture sur 2 matchs aigus seulement (`acute_matches = obs_w[:2]`)** : Les gemmes Source 2 ne sont extraites que sur $m_T$ et $m_{T-1}$ ([enrich_hidden_gems.py:378](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/enrich_hidden_gems.py#L378)) au lieu des 20 matchs de la fenêtre, ce qui empêche de calculer la *tendance* intra-fenêtre de ces gemmes (et laisse `accuracy_trend_last5` et `aim_consistency` sur leurs valeurs synthétiques issues de `collect_data.py` même après enrichissement !).
- **Écrasement sur le disque par `rebuild_and_train_debiased.py`** : Parce que `rebuild_and_train_debiased.py` a été relancé le 9 novembre à 12h55, il a écrasé `deadlock_churn_dataset.csv` (revenu à 76 colonnes au lieu de 103), `ml_results.json`, `features_list.json` et `deadlock_churn_model.pkl`.

### 3.5 Analyse critique #4 : Quatre formules divergentes pour le `tilt_index` à travers le projet

L'audit du code révèle que la variable phare du projet, **`tilt_index`**, est calculée selon **4 formules mathématiques incompatibles** selon le fichier consulté :

| Fichier / Composant | Échelle | Formule Implémentée | Problème Identifié |
|---|---|---|---|
| **1. Spécification & Back-end Live** ([docs/DEADLOCK_API_ASSESSMENT.md:988](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/docs/DEADLOCK_API_ASSESSMENT.md#L988), [feature_service.py:60-76](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/services/feature_service.py#L60-L76)) | $[0, 100]$ | $12 \cdot L_{\text{streak}} + 40 \cdot \text{abandon\_rate} + 15 \cdot \text{night\_owl} + 33 \cdot \max(0, \frac{\text{old\_acc} - \text{rec\_acc}}{100})$ | Formule officielle conforme à `spec_oracles.py`. |
| **2. Pipeline Dataset CSV** ([collect_data.py:426-436](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/collect_data.py#L426-L436)) | $[0, 100]$ | $11.5 \cdot L_{\text{streak}} + 42 \cdot \text{abandon\_rate} + 16 \cdot \text{night\_owl} + 1.4 \cdot \max(0, -\Delta_{\text{acc}}) + 45 \cdot \max(0, \text{dpm} - 0.25)$ | Poids différents ($1.4 \times \Delta_{\text{acc}}$ non divisé par 100, soit $4.2\times$ plus fort que la spec) + ajout d'un terme `deaths_per_min`. |
| **3. Front-End Simulateur Tilt** ([PsychologySection.jsx:31-44](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/PsychologySection.jsx#L31-L44), [ArchitectureSection.jsx:334](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/ArchitectureSection.jsx#L334)) | $[0, 10+]$ | $2.0 \cdot N_{\text{abandons}} + \max(0, |\text{streak}| - 2) + \max(0, (25 - d_{\text{avg}}) \times 0.1) + \max(0, (\text{dpm} - 0.3) \times 5)$ | **Ancienne formule héritée de Dota 2 !** Affichée comme étant le code de `feature_service.py` alors qu'elle n'existe pas dans le back-end Deadlock. |
| **4. Seuil de Détection dans `SimulatorSection.jsx`** ([SimulatorSection.jsx:752](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/SimulatorSection.jsx#L752)) | Hybride | `const isCriticalTrend = churnProb >= 0.60 \|\| (activePlayer.features?.tilt_index \|\| 0) >= 3.5;` | Compare un `tilt_index` sur $[0, 100]$ (ex: `54.0` pour *Burned-out Walker*, `18.0` pour *Objective Guardian*, `8.5` pour *Balanced Carry*) au seuil `>= 3.5` de l'échelle Dota 2 $[0, 10]$ ! Résultat : dès qu'un profil ou archétype est chargé via le back-end FastAPI (qui peuple `activePlayer.features.tilt_index`), **`isCriticalTrend` est `true` pour 100% des joueurs ayant `tilt_index >= 3.5` (y compris les profils sains à 14% de churn !)** |

---

## 4. Axe 3 : Méthodologie Machine Learning & Intégration Back-End / Front-End

### 4.1 Formulation de la cible ($Y_{14}$) : Classification binaire vs Analyse de Survie

La section 9.4 de [docs/DEADLOCK_API_ASSESSMENT.md](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/docs/DEADLOCK_API_ASSESSMENT.md#L1024-L1109) contient une discussion théorique brillante sur la supériorité de l'**Analyse de Survie** (Kaplan-Meier, Cox Proportional Hazards, DeepSurv) face au seuil binaire arbitraire de 14 jours ($Y_{14}$), notamment pour gérer la censure à droite (*right-censoring*) et estimer le risque instantané $\lambda(t \mid X)$.

Pourtant, **aucun modèle de survie n'a été implémenté dans le code (`train.py`, `rebuild_and_train_debiased.py`, `enrich_hidden_gems.py`)**, alors que la colonne continue `time_gap_days` (temps exact avant le prochain match ou la date de censure) est **déjà calculée et présente dans `deadlock_churn_dataset.csv`** ! Implémenter un modèle de Cox ou une tête de survie multi-horizons ($t \in \{3\text{j}, 7\text{j}, 14\text{j}, 30\text{j}\}$) sur `(is_churn, time_gap_days)` réconcilierait directement la théorie exposée dans la documentation avec le code du projet.

### 4.2 Stratégie de Validation, Group Splitting & Trois Fuites Internes de Validation Croisée

1. **Séparation Train / Test par joueur (`GroupShuffleSplit` sur `account_id`) — Très bien fait** :
   - Les trois scripts d'entraînement utilisent `GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=42)` avec `groups=account_id`. Aucun joueur du jeu d'entraînement n'apparaît dans le jeu de test (`Player Overlap = 0`), garantissant zéro fuite d'identité entre Train et Test.
2. **Trois fuites internes de validation/calibration à l'intérieur du jeu d'entraînement** :
   - **Fuite #1 — `StratifiedKFold` au lieu de `StratifiedGroupKFold` dans `cross_val_predict`** ([train.py:644-651](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/train.py#L644-L651), [rebuild_and_train_debiased.py:854-860](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/rebuild_and_train_debiased.py#L854-L860), [enrich_hidden_gems.py:1084-1090](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/enrich_hidden_gems.py#L1084-L1090)) :
     ```python
     cv_oof = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
     oof_proba = cross_val_predict(pipe, X_train_opt, y_train, cv=cv_oof, method="predict_proba", n_jobs=-1)[:, 1]
     ```
     Alors que le balayage Top-K utilise correctement `StratifiedGroupKFold(n_splits=4)` avec `groups=groups_train`, l'étape de calibration Out-of-Fold utilise `StratifiedKFold` sans `groups` ! Comme chaque joueur possède en moyenne $8088 / 936 \approx 8.6$ fenêtres chevauchantes dans `X_train_opt`, `StratifiedKFold` répartit les fenêtres quasi-identiques d'un même joueur à la fois dans les folds d'entraînement et de validation, gonflant artificiellement `oof_roc_auc` et faussant le calibrage du seuil $\theta^*$.
   - **Fuite #2 — `CalibratedClassifierCV(..., cv=3)` sans groupes** ([enrich_hidden_gems.py:986-1000](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/enrich_hidden_gems.py#L986-L1000)) :
     Le modèle `xgb_calibrated` utilise `CalibratedClassifierCV(..., method="sigmoid", cv=3)`, qui effectue par défaut un `StratifiedKFold(n_splits=3)` interne sans `groups=groups_train`. Les paramètres sigmoïdes de Platt $(A, B)$ sont donc ajustés sur des folds qui partagent les mêmes joueurs que les folds d'entraînement.
   - **Fuite #3 — Calibration du seuil sur les prédictions *In-Sample* dans l'étude d'ablation** ([train.py:358](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/train.py#L358), [rebuild_and_train_debiased.py:600](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/rebuild_and_train_debiased.py#L600), [enrich_hidden_gems.py:823](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/enrich_hidden_gems.py#L823)) :
     Dans l'étude d'ablation des domaines (`ablation_results`), le seuil optimal `th_f1` est calculé directement sur **`proba_tr` (les probabilités prédites sur le jeu d'entraînement lui-même après `clf.fit`)** au lieu de prédictions Out-of-Fold :
     ```python
     proba_tr = clf.predict_proba(df_train[valid_cols])[:, 1]
     th_f1, _ = find_optimal_thresholds(y_train, proba_tr)
     ```
     Sur un arbre sur-appris, `proba_tr` est polarisé vers 0 et 1, ce qui décale `th_f1` vers le haut (~0.46–0.50) et dégrade le rappel sur `df_test`.
   - **Fuite #4 — Standardisation par ère non sauvegardée pour l'inférence (`standardize_within_patch_era`)** :
     Dans [rebuild_and_train_debiased.py:544-546](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/rebuild_and_train_debiased.py#L544-L546) et [enrich_hidden_gems.py:746-748](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/enrich_hidden_gems.py#L746-L748), `standardize_within_patch_era` est appliqué à `df_train_raw` et `df_test_raw` **une seule fois avant la validation croisée**, et ses paramètres par bin temporel `(bin_edges, b_mu, b_sd)` ne sont jamais sauvegardés dans un artefact `.pkl` ou `.json`.

### 4.3 Sélection de Variables, Multicolinéarité & Pertinence de `StandardScaler` + `SMOTE`

1. **Un filtre de colinéarité en chaîne qui supprime `tilt_index`, `recent_loss_streak` et `accuracy_pct` !**
   - Dans [rebuild_and_train_debiased.py:617-638](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/rebuild_and_train_debiased.py#L617-L638), l'algorithme parcourt les paires de variables avec $|r| > 0.90$ et conserve celle ayant la plus grande Information Mutuelle (MI) sur le train set.
   - Or, à cause des formules synthétiques de `collect_data.py` (§3.2), une réaction en chaîne se produit dans [ml_results.json:156-247](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/data/ml_results.json#L156-L247) :
     - `tilt_index` est supprimé au profit de `recent_loss_streak` ($r=0.954$),
     - puis `recent_loss_streak` est lui-même supprimé au profit de `pause_tilt_frequency` ($r=0.979$),
     - puis `pause_tilt_frequency` n'est même pas retenu dans le Top-24 final !
     - De même, `accuracy_pct` est supprimé au profit de `crosshair_on_target_pct` ($r=0.993$), qui est supprimé au profit de `hero_rel_accuracy_zscore` ($r=0.928$), qui est éliminé au Top-24 !
     - `abandon_rate` et `early_quit_rate` sont supprimés au profit de `rejoin_latency_s` ($r=0.942$), lui aussi éliminé au Top-24 !
   - **Conséquence** : Le modèle final sauvegardé dans `deadlock_churn_model.pkl` ([features_list.json](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/data/features_list.json)) **ne contient ni `tilt_index`, ni `recent_loss_streak`, ni `accuracy_pct`, ni `headshot_ratio`, ni `abandon_rate`, ni `watched_death_replays`** ! Il a éliminé les vraies variables primaires interprétables au profit de variables dérivées synthétiques.
2. **Sélection du modèle champion sur le jeu de test (`test_f1_optimal.roc_auc`) et victoire trompeuse de `MLPClassifier`** :
   - Dans [rebuild_and_train_debiased.py:894](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/rebuild_and_train_debiased.py#L894) et [enrich_hidden_gems.py:1124](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/enrich_hidden_gems.py#L1124), le modèle champion est sélectionné en prenant `max(benchmark_results, key=lambda k: benchmark_results[k]["test_f1_optimal"]["roc_auc"])`, c'est-à-dire **sur le score du jeu de test** au lieu du score Out-of-Fold (`oof_roc_auc` / `oof_pr_auc`) sur le jeu d'entraînement !
   - Dans `ml_results.json`, `mlp_neural` bat `grad_boost` de seulement `0.0011` en Test ROC-AUC (`0.7712` vs `0.7701`), alors qu'en validation croisée Out-of-Fold `mlp_neural` était le **moins bon** des modèles non-linéaires (`oof_roc_auc = 0.7583` contre `0.7706` pour `xgb_balanced` et `0.7669` pour `grad_boost`), et que `grad_boost` surpasse `mlp_neural` sur toutes les autres métriques Test :
     - **PR-AUC Test** : `0.5781` (`grad_boost`) vs `0.5704` (`mlp_neural`)
     - **F1-Score Test** : `0.5500` (`grad_boost`) vs `0.5341` (`mlp_neural`)
     - **Brier Score Test (Calibration)** : `0.1513` (`grad_boost`) vs `0.1674` (`mlp_neural`)
     - **Overfit Gap (Train - Test ROC)** : `+0.0405` (`grad_boost`) vs `+0.0619` (`mlp_neural`, et `+0.1089` en PR-AUC !)
   - De plus, `mlp_neural` inclut `SMOTE(sampling_strategy=0.75)` dans son pipeline sans recalibration sigmoïde a posteriori, ce qui déforme la distribution des probabilités prédites. Choisir le champion sur le critère composite Out-of-Fold $(0.5 \times \text{OOF\_ROC} + 0.5 \times \text{OOF\_PR})$ élirait `xgb_balanced` ou `grad_boost` sans utiliser le jeu de test pour la sélection.

### 4.4 Choix des Modèles, Hyperparamètres, Calibration & Seuil de Décision

- **Régularisation des arbres** : Le passage de `max_depth=5, min_samples_leaf=25, l2=2.0` (`train.py`) à `max_depth=3, min_samples_leaf=45..55, colsample/max_features=0.50, subsample=0.75, l2=10.0` (`rebuild_and_train_debiased.py` et `enrich_hidden_gems.py`) est **très pertinent**. Sur des données tabulaires comportementales bruitées (~3 200 à 10 000 lignes), des arbres peu profonds (`max_depth=3`) avec sous-échantillonnage de colonnes (`max_features=0.50`) réduisent drastiquement la variance et maintiennent l'écart Train-Test sous 4 à 8%.
- **Optimisation du seuil $\theta^*$ avec $F_{\beta=1.15}$** : Favoriser légèrement le rappel ($\beta = 1.15$) tout en offrant un second point de fonctionnement à $\text{Rappel} \ge 80\%$ (`test_recall80_optimal`) répond parfaitement au besoin opérationnel d'un studio de jeu vidéo où manquer un joueur en détresse coûte plus cher qu'une intervention douce non punitive.

### 4.5 Audit Critique du Back-End d'Inférence : Le modèle `.pkl` entraîné n'est JAMAIS chargé en production !

L'inspection de [backend/app/services/feature_service.py](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/services/feature_service.py#L290-L492) et [backend/app/api/routers/prediction.py](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/api/routers/prediction.py) révèle une déconnexion totale entre l'entraînement ML et l'API d'inférence :

1. **Aucun chargement de `deadlock_churn_model.pkl`, `deadlock_scaler.pkl` ni `features_list.json`** :
   - Le mot-clé `joblib` ou `pickle` n'apparaît nulle part dans `backend/app/`.
   - À la place, `FeatureService.predict_churn` ([feature_service.py:356-381](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/services/feature_service.py#L356-L381)) calcule une fonction sigmoïde codée à la main sur 8 variables :
     ```python
     logit = (
         base_logit
         + (loss_streak * 0.45)
         + ((tilt / 100.0) * 1.6)
         + (abandon_rate * 3.2)
         + (night_owl * 0.8)
         - ((kda - 2.5) * 0.35)
         - (((accuracy - 40.0) / 100.0) * 1.2)
         - (acc_trend * 0.03)
         - (((spm - 500.0) / 500.0) * 0.5)
     )
     raw_prob = 1.0 / (1.0 + math.exp(-logit))
     ```
2. **Fausses attributions SHAP (`key_contributing_factors`)** :
   - Au lieu de calculer les contributions locales du modèle (TreeSHAP ou contributions linéaires exactes sur les variables standardisées), [feature_service.py:389-456](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/services/feature_service.py#L389-L456) utilise une série de `if / elif` avec des constantes fixes (`impact=-0.14`, `impact=-0.18`, `impact=-0.20`, `impact=-0.22`).
3. **Les 7 Hidden Gems sont simulées à partir de `deaths_per_min` et `tilt` lors de l'inférence live** :
   - Dans [feature_service.py:459-479](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/services/feature_service.py#L459-L479), le dictionnaire `hidden_gems` retourné par `/api/predict/{account_id}` n'est pas extrait de `/v1/matches/metadata` ni de `/v1/players/{id}/mate-stats`, mais inventé par des formules comme `late_panic_sells = 2 if tilt > 70 else (1 if tilt > 40 else 0)`, `parry_miss_per_match = round(max(0.2, (features["deaths_per_min"] * 8.0) ...))`, et `if m.get("party_size", 1) == 1: solo_isolation_streak += 1` (alors que `party_size` n'existe pas dans `/match-history`, ce qui donne `solo_isolation_streak = 20` et `party_play_pct = 0.0` pour 100% des joueurs !).
4. **Bug de gonflement du PR-AUC dans `MockService.get_mock_ml_metrics()`** :
   - Dans [mock_service.py:358-359](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/services/mock_service.py#L358-L359), l'endpoint `/api/ml/metrics` exécute :
     ```python
     "pr_auc": max(0.7250, champ.get("train_pr_auc", 0.7354)),
     "test_pr_auc": f1_res.get("pr_auc", 0.5704),
     ```
   - Pour satisfaire une assertion héritée de Dota 2 dans [backend/tests/test_tier4_api.py:69](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/tests/test_tier4_api.py#L69) (`self.assertGreater(data["pr_auc"], 0.70)`), l'endpoint renvoie un plancher forcé de `0.7250` (ou le **Train PR-AUC**) dans le champ `pr_auc`, tout en mettant le vrai Test PR-AUC (`0.5704`) dans un champ `test_pr_auc` qui est **supprimé par le schéma Pydantic `ModelMetricsResponse`** ([health.py:75-80](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/api/routers/health.py#L75-L80)) ! C'est une distorsion de métrique qu'il faut absolument corriger en alignant le test unitaire sur la vraie performance du jeu de test Deadlock.

### 4.6 Désynchronisation des Chiffres & Métriques entre Back-End et Front-End (et features fantômes dans `mockData.js`)

Le front-end affiche simultanément des métriques provenant de **quatre expériences différentes**, et `MlBenchmarkSection.jsx` **n'appelle jamais les endpoints `/api/ml/metrics` ni `/api/ml/visualizations`** (il importe uniquement les constantes statiques de `mockData.js` aux lignes 2–8 !) :

| Composant Front-End | Chiffres Affichés | Origine Réelle des Chiffres | Contradiction / Incohérence |
|---|---|---|---|
| **Tableau Benchmark & Ablation** ([MlBenchmarkSection.jsx:53, 177](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/MlBenchmarkSection.jsx#L53), [mockData.js:17-53](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/data/mockData.js#L17-L53)) | Champion : `Gradient Boosting (Depth-3, Colsample=0.50)` \| Test ROC-AUC = `67.32%` (`69.65%` norm) \| PR-AUC = `50.93%` \| Rappel = `79.52%` \| Seuil $\theta^* = 0.25$ \| Matrice de confusion : `TP=132, FP=206, TN=142, FN=34` (`Total=514`). | Exécution de `enrich_hidden_gems.py` (100% In-Game Pure avec les 7 Hidden Gems sur les fenêtres enrichies). | L'en-tête dit `N = 10 000 / 1 912 test`, mais la matrice de confusion totalise `514` fenêtres de test (soit 20% du sous-ensemble enrichi de `2 696` fenêtres), tandis que `backend/data/ml_results.json` sur le disque contient l'exécution `rebuild_and_train_debiased.py` (Champion `MLP`, ROC-AUC = `77.12%`, `N_test = 1 912`). |
| **Features Fantômes dans `MOCK_METRICS.top_features`** ([mockData.js:63, 159, 412, 432](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/data/mockData.js#L63)) | #9 `street_brawl_affinity` (`4.52%`) et #11 `souls_diff_10m` (`3.95%`). | **Features inexistantes dans le code Python !** | Ni `street_brawl_affinity` ni `souls_diff_10m` n'existent dans `collect_data.py`, `rebuild_and_train_debiased.py`, `enrich_hidden_gems.py` ou `feature_service.py`. |
| **Courbes Interactives ROC & PR** ([MlBenchmarkSection.jsx:311-351](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/MlBenchmarkSection.jsx#L311-L351)) | Onglets : `ROC Curve (80.0%)` et `PR Curve (79.3%)` \| Bouton : `Seuil Optimal θ* = 0.36` \| Ligne de base PR : `y = 0.4965` (49.65% de churn). | **Anciens chiffres du projet Dota 2 Final !** | Juste au-dessus, dans la même page, le tableau indique ROC-AUC = `67.3%`, PR-AUC = `50.9%`, $\theta^* = 0.25$ et un taux de churn de `24.26%` ! |
| **Matrice de Confusion Interactive** ([MlBenchmarkSection.jsx:624-626](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/MlBenchmarkSection.jsx#L624-L626)) | `N_TOTAL = 4900`, `N_CHURN = 2450`, `N_RETAINED = 2450` (équilibre 50/50 exact). | Approximation synthétique codée en dur (`recall = 1.0 - Math.pow(threshold, 1.25) * 0.95`). | Contredit à la fois `N_test = 1 912` (churn 24.26%) et la matrice réelle `Total = 514` (`TP=132, FP=206, TN=142, FN=34`) stockée dans `MOCK_METRICS.confusion_matrix` ! |
| **Section Architecture 5 Étapes** ([ArchitectureSection.jsx:93, 189-255, 330-424](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/ArchitectureSection.jsx#L189-L255)) | Étape 1 : `24 500+ historiques`, `100 matchs/joueur` \| Étape 2 : `gpm_trend`, `objective_focus = avg_tower_damage / avg_hero_damage`, `role_consistency` \| Étape 3 : `13 584 joueurs (Test N = 3 397)`, `churn = 49.6%`, `V6 XGBoost + SMOTE`, `Rappel 85.0%, ROC 80.0%` \| Étape 4 : `θ* = 0.36`, `1 689 churners`. | **Copie quasi-intégrale des textes et formules du projet Dota 2 V6 !** | Mentionne encore `gold_per_min` (au lieu de `souls_per_min`), `avg_tower_damage` (au lieu des Guardians/Walkers), `13 584` joueurs (au lieu de `1 500` joueurs / `10 000` fenêtres) et un taux de churn de `49.6%` (au lieu de `24.26%`). |

### 4.7 Audit des pages « Dynamique Héros » (`ItemsSection.jsx`) et « Télémétrie ITEM » (`ItemTelemetrySection.jsx`)

Les pages 2 et 3 du site ([ItemsSection.jsx](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/ItemsSection.jsx) et [ItemTelemetrySection.jsx](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/ItemTelemetrySection.jsx)), alimentées par [backend/app/api/routers/items.py](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/api/routers/items.py#L270-L997), présentent des analyses métier passionnantes :
- Le **Syndrome « Zéro-Vitality » (Schéma #1)** : enchaîner 6 à 13 items offensifs (Weapon/Spirit) pendant 14 à 30 minutes sans acheter un seul item vert (Vitality).
- Le **Piège des items conditionnels (Schéma #3)** : acheter *Hollow Point Ward* (>60% PV) ou *Opening Rounds* (>50% PV) sans armure alors qu'on perd sa lane.
- Le **Paradoxe de l'achat défensif de panique (Schéma #4)** : *Bullet Resilience* affiche `45.8%` de churn parce qu'il est acheté en 15e item à `29m14s` quand la partie est déjà perdue (biais de causalité inverse / *reverse causality* très bien expliqué !).
- L'**Exposition 3D des Hitboxes et Canalisations Statiques** : *Seven* (`28.7%` de headshots subis en lévitation *Storm Cloud*), *Ivy* (`22.9%`), *Vindicta* (`21.7%` en *Flight* avec seulement `22.4%` d'items Vitality) et *Yamato* (`60.0%` de churn sur la cohorte replay à cause de l'immobilité de `1.4s` sur *Power Slash*), opposés aux ancres de rétention *Abrams* (`18.2%` de churn, `9.6%` de headshots subis, `49.1%` d'items Vitality) et *Dynamo* (`20.0%` de churn).

**Quatre faiblesses méthodologiques et bugs d'intégration doivent toutefois être soulignés sur ces deux pages :**
1. **Absence du script d'extraction dans le dépôt (`N = 2 696` cohortes / `N = 397` replays)** : Toutes les valeurs de `ITEM_CHURN_ANALYTICS` et `HERO_CHURN_ANALYTICS` sont codées en dur sous forme de listes Python statiques dans [backend/app/api/routers/items.py:270-976](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/api/routers/items.py#L270-L976), et `items_sold_time_s` est la seule colonne d'item extraite dans `enrich_hidden_gems.py` (les IDs d'items `items.item_id` et timestamps d'achat `items.game_time_s` ne sont pas stockés dans `match_gems_v2_cache.joblib`). Il manque le script Python reproductible qui génère ces tables à partir de `/v1/matches/metadata`.
2. **Bug d'écrasement d'état React dans `ItemTelemetrySection.jsx` (`apiData.summary` devient `undefined` quand le back-end est en ligne !)** :
   - Dans [ItemTelemetrySection.jsx:211-222](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/ItemTelemetrySection.jsx#L211-L222), l'état initial `apiData` possède la structure `{ items: [...], heroes: [...], summary: { total_items_analyzed: 54, ... } }`.
   - Mais lorsque `getItemHeroChurnAnalytics()` réussit ([ItemTelemetrySection.jsx:251-254](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/ItemTelemetrySection.jsx#L251-L254)), `setApiData(res)` remplace tout l'objet par la réponse de `/api/items/churn-analytics` ([items.py:984-997](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/api/routers/items.py#L984-L997)), qui utilise des clés à plat (`item_churn_rates`, `hero_churn_rates`, `total_items_analyzed: 21`) **sans sous-objet `summary`** !
3. **Incohérence de `hero_id` dans `HERO_CHURN_ANALYTICS`** : Dans [items.py:722, 848, 892](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/api/routers/items.py#L722), *Ivy* a `hero_id: 14`, *Lash* a `hero_id: 15`, et *Pocket* a `hero_id: 13`, alors que dans [mock_service.py:27-32](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/services/mock_service.py#L27-L32), `10 = Ivy`, `13 = Mo & Krill`, `14 = Paradox`, `15 = Pocket`.
4. **Incohérence des moyennes et unités des biomarqueurs entre Page 1 et Page 2** :
   - Dans `enrich_hidden_gems.py:473`, `stun_headshots_taken_rate` est un score composite (`stun_hs_rate + immobile_hs_per_min * 5.0`, variant de `0.15` à `9.87`).
   - Sur la Page 1 ([mockData.js:102-104](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/data/mockData.js#L102-L104) et [SimulatorSection.jsx:674](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/SimulatorSection.jsx#L674)), il est affiché comme un nombre par match : `0.78 / match` (Churners) vs `0.45 / match` (Fidélisés, `+72.3%`), et `grey_screen_ratio` vaut `14.2%` vs `13.3%` (`+6.7%`).
   - Sur la Page 2 ([ItemsSection.jsx:58-80](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/ItemsSection.jsx#L58-L80)), `stun_headshots_taken_rate` est présenté comme un pourcentage de tirs (`84.5%` vs `47.3%`, `+78.6%`), `grey_screen_ratio` vaut `17.8%` vs `9.6%` (`+85.4%`), et `teammate_support_per_min` est affiché en pourcentage (`14.2%` vs `36.8%`) au lieu de PV soignés par minute (`29.7 / min` vs `33.5 / min` sur la Page 1).

---

## 5. Axe 4 : Bilan Global (Points Positifs, Points Négatifs) & Plan d'Amélioration Concret

### 5.1 Ce qui est très bien fait (Points Positifs)

1. **Architecture de collecte 100% Free-Tier intelligente et sobre (`collect_data.py` & `enrich_hidden_gems.py`)** :
   - Avoir réussi à collecter **923 185 matchs** sur **1 500 joueurs** et à enrichir **5 128 matchs modernes** (`6 898` enregistrements joueurs) avec les métadonnées profondes Source 2 et le graphe social `mate-stats` (`1 046` joueurs) en moins de 4 minutes et pour **0,00 $** (sans clé API payante) grâce à `only_stored_history=true` et au batching de 450 `match_ids` sur `/v1/matches/metadata` est une prouesse de Data Engineering.
2. **Découverte des « 7 Gemmes Cachées Source 2 » (`enrich_hidden_gems.py`)** :
   - L'idée d'extraire `Bullet Stats##StunHeadshotHitRate`, `Bullet Stats - Incoming##HeadshotRate`, `Parry Miss`, `gold_death_loss`, `death_details.death_duration_s`, `death_details.time_to_kill_s` et `items.sold_time_s` avec ban complet des variables calendaires (`avg_session_gap_days`, `match_frequency_drift`) donne au projet une véritable valeur ajoutée scientifique spécifique à Deadlock.
3. **Rigueur de l'isolation temporelle de la cible $Y_{14}$ et du `GroupShuffleSplit` par `account_id`** :
   - La séparation stricte entre la fenêtre d'observation $W$ et l'horizon futur de 14 jours après $m_T$, combinée à un split Train/Test sans aucun recouvrement de joueur (`Overlap = 0`) et à un appariement temporel par strates (`Time-Stratified Matching`), évite les pièges classiques des projets ML étudiants.
4. **Qualité industrielle du client HTTP asynchrone (`DeadlockClient`) et de la résilience Offline** :
   - Le client `httpx.AsyncClient` avec rate-limiting par verrou asynchrone, respect de `Retry-After`, cache LRU borné et repli automatique sur `MockService` (doublé côté front-end par `api.js` qui sonde plusieurs ports avec `AbortController` 1500ms) garantit une application **100% fonctionnelle même hors-ligne ou en cas de panne de l'API Deadlock**.
5. **Analyse causale fine de la télémétrie d'achats d'items et de la biomécanique 3D des héros** :
   - L'identification du paradoxe de *Bullet Resilience* (acheté en panique à 29m14s), du piège des passifs conditionnels (*Hollow Point Ward* >60% PV), du syndrome *Zéro-Vitality* sur *Vindicta/Haze* et de la vulnérabilité aux headshots pendant les canalisations statiques (*Seven*, *Yamato*) apporte une profondeur métier remarquable.

### 5.2 Ce qui ne va pas (Points Négatifs Critiques classés par sévérité)

| Sévérité | ID | Problème Critique Identifié | Fichier(s) & Lignes Concernés |
|---|---|---|---|
| **P0 (Bloquant)** | **C1** | **Le modèle ML entraîné (`deadlock_churn_model.pkl` / `deadlock_scaler.pkl`) n'est jamais chargé ni utilisé par le back-end FastAPI.** L'endpoint `/api/predict/{account_id}` utilise une formule logistique codée en dur à 8 variables et des règles `if/elif` fixes pour l'attribution des facteurs et les 7 Hidden Gems. | [backend/app/services/feature_service.py:356-480](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/services/feature_service.py#L356-L480) |
| **P0 (Bloquant)** | **C2** | **Écrasement des artefacts des « 7 Hidden Gems » sur le disque et désalignement du cache `match_gems_v2_cache.joblib`.** `rebuild_and_train_debiased.py` a été lancé après `enrich_hidden_gems.py`, écrasant `deadlock_churn_dataset.csv`, `ml_results.json`, `features_list.json` et `deadlock_churn_model.pkl` avec un modèle `MLPClassifier` où **`match_frequency_drift` (variable calendaire) est #1**, où **aucune des 7 Hidden Gems n'est présente**, et où seules `1 395` fenêtres sur `10 000` matchent le cache Source 2. | [backend/data/ml_results.json:278-485](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/data/ml_results.json#L278-L485), [backend/data/features_list.json](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/data/features_list.json) |
| **P0 (Bloquant)** | **C3** | **Bugs d'extraction live dans `feature_service.py` et `player.py` : inversion Victoire/Défaite pour l'équipe 1 (`match_result == player_team` ignoré), clé `match_duration_s` ignorée (`m.get("duration_s", 1800)`), constantes fixes (`35%` d'accuracy) et formule de `match_frequency_drift` cassée.** | [backend/app/services/feature_service.py:114-232](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/services/feature_service.py#L114-L232), [backend/app/api/routers/player.py:72-80](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/api/routers/player.py#L72-L80) |
| **P1 (Majeur)** | **C4** | **Plus de 20 features sur 48 sont synthétisées par des formules heuristiques dans `collect_data.py` (+ fuite temporelle via `/v1/players/hero-stats`), provoquant l'élimination de `tilt_index`, `recent_loss_streak` et `accuracy_pct` par le filtre de colinéarité (`|r| > 0.90`).** | [backend/collect_data.py:299-365](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/collect_data.py#L299-L365), [backend/data/ml_results.json:156-247](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/data/ml_results.json#L156-L247) |
| **P1 (Majeur)** | **C5** | **Quatre formules contradictoires pour `tilt_index` et bug de seuil dans `SimulatorSection.jsx`.** Le front-end affiche l'ancienne formule Dota 2 sur $[0, 10]$ dans `PsychologySection.jsx` et `ArchitectureSection.jsx`, tandis que `SimulatorSection.jsx:752` teste `tilt_index >= 3.5` sur des scores calibrés sur $[0, 100]$, déclenchant l'alerte critique sur tous les profils. | [PsychologySection.jsx:31-44](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/PsychologySection.jsx#L31-L44), [SimulatorSection.jsx:752](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/SimulatorSection.jsx#L752), [collect_data.py:426](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/collect_data.py#L426), [feature_service.py:60](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/services/feature_service.py#L60) |
| **P1 (Majeur)** | **C6** | **Désynchronisation des métriques ML dans le Front-End (vestiges Dota 2 V6 vs Deadlock Plan 3 vs Hidden Gems + features fantômes `street_brawl_affinity` et `souls_diff_10m`).** `ArchitectureSection.jsx` et les courbes ROC/PR de `MlBenchmarkSection.jsx` affichent encore les chiffres de Dota 2 (`13 584` joueurs, `49.6%` churn, `ROC 80.0%`, `PR 79.3%`, `θ* = 0.36`, `gpm_trend`, `avg_tower_damage`). | [ArchitectureSection.jsx:189-424](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/ArchitectureSection.jsx#L189-L424), [MlBenchmarkSection.jsx:311-351, 624](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/MlBenchmarkSection.jsx#L311-L351), [mockData.js:63, 412, 432](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/data/mockData.js#L63) |
| **P1 (Majeur)** | **C7** | **Trois fuites internes de validation croisée (`StratifiedKFold` sans `groups=groups_train` dans `cross_val_predict`, `CalibratedClassifierCV(cv=3)` sans groupes, et seuils d'ablation calibrés in-sample sur `proba_tr`) + sélection du champion sur le Test Set.** | [rebuild_and_train_debiased.py:600, 854-860, 894](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/rebuild_and_train_debiased.py#L854-L860), [enrich_hidden_gems.py:823, 986, 1084, 1124](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/enrich_hidden_gems.py#L1084-L1090) |
| **P2 (Modéré)** | **C8** | **Recherche joueur (`/api/players/search`) et profil (`/api/players/{id}`) 100% statiques/mocks, et oubli de `only_stored_history=true` dans `DeadlockClient.get_player_match_history`.** | [backend/app/api/routers/player.py:25-34, 95-108](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/api/routers/player.py#L25-L34), [deadlock_client.py:304](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/client/deadlock_client.py#L304) |
| **P2 (Modéré)** | **C9** | **Champs natifs de `match-history` ignorés (`ranked_used_demotion_protection`, `ranked_delta`, `game_mode=4` Street Brawl).** | [backend/collect_data.py:416-419, 463, 748](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/collect_data.py#L416-L419) |

---

### 5.3 Feuille de Route & Propositions Concrètes d'Amélioration (avec Code)

#### Amélioration 1 : Connecter le vrai modèle ML entraîné, corriger le parsing live (`is_match_won`, `match_duration_s`) et enrichir avec Source 2 dans `FeatureService` (Correction P0 — C1, C3 & C8)

Au lieu d'évaluer une formule logistique codée en dur sur des constantes par défaut, `FeatureService` et `DeadlockClient` doivent :
1. Passer systématiquement `params={"only_stored_history": "true"}` dans `DeadlockClient.get_player_match_history`.
2. Corriger la détection de victoire (`int(m.get("player_team", 0)) == int(m.get("match_result", -1))`) et la lecture de la durée (`m.get("match_duration_s") or m.get("duration_s") or 1800`) dans `feature_service.py` et `player.py`.
3. Charger au démarrage (`lifespan` ou singleton de classe) le pipeline champion (`deadlock_scaler.pkl`, `deadlock_churn_model.pkl`, `features_list.json`).
4. Lors d'un appel à `/api/predict/{account_id}`, récupérer en parallèle via `asyncio.gather` :
   - `client.get_player_match_history(account_id)` (avec `only_stored_history=true`),
   - `client.request("GET", f"/v1/players/{account_id}/mate-stats", ttl_seconds=600)` pour calculer le vrai `solo_isolation_streak` et `party_play_pct`,
   - `client.request("GET", "/v1/matches/metadata", params={"match_ids": f"{m_T},{m_T1}", "include_player_final_stats": "true", "extra_player_columns": "death_details.time_to_kill_s,death_details.death_duration_s,items.sold_time_s"}, ttl_seconds=3600)` pour extraire les **vraies** statistiques de tir 3D et les **7 Hidden Gems Source 2** en moins de 120 ms !

```python
# Proposition d'architecture pour backend/app/services/feature_service.py :
import json
from pathlib import Path
import joblib
import numpy as np

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"

def is_live_match_won(m: Dict[str, Any]) -> bool:
    """Corrige le bug d'inversion victoire/défaite pour l'équipe 0 (Amber Hand) et l'équipe 1 (Sapphire Flame)."""
    p_team = m.get("player_team")
    m_res = m.get("match_result")
    if p_team is not None and m_res is not None:
        return int(p_team) == int(m_res)
    pmo = m.get("player_match_outcome")
    if pmo is not None and int(pmo) in (1, 2):
        return int(pmo) == 1
    return bool(m_res == 1)

class ModelArtifactRegistry:
    """Charge et met en cache les artefacts ML entraînés pour l'inférence temps réel."""
    _model = None
    _scaler = None
    _features: List[str] = []

    @classmethod
    def load(cls) -> bool:
        if cls._model is not None:
            return True
        model_path = DATA_DIR / "deadlock_churn_model.pkl"
        scaler_path = DATA_DIR / "deadlock_scaler.pkl"
        feat_path = DATA_DIR / "features_list.json"
        if model_path.exists() and scaler_path.exists() and feat_path.exists():
            cls._model = joblib.load(model_path)
            cls._scaler = joblib.load(scaler_path)
            cls._features = json.loads(feat_path.read_text(encoding="utf-8"))
            return True
        return False

    @classmethod
    def predict_proba_and_attributions(cls, feature_dict: Dict[str, float]) -> Tuple[float, List[FactorAttribution]]:
        if not cls.load():
            raise RuntimeError("ML artifacts not found")
        x_vec = np.array([[float(feature_dict.get(f, 0.0)) for f in cls._features]], dtype=np.float64)
        x_scaled = cls._scaler.transform(x_vec)
        prob = float(cls._model.predict_proba(x_scaled)[0, 1])

        # Attribution locale basée sur l'écart standardisé (z-score) x importance du modèle
        importances = getattr(cls._model, "feature_importances_", np.ones(len(cls._features)) / len(cls._features))
        contribs = x_scaled[0] * importances
        top_indices = np.argsort(np.abs(contribs))[::-1][:4]
        factors = [
            FactorAttribution(
                feature=cls._features[idx],
                impact=round(float(np.clip(contribs[idx], -1.0, 1.0)), 3),
                direction="churn" if x_scaled[0, idx] > 0 else "retention",
            )
            for idx in top_indices
        ]
        return round(prob, 4), factors
```

#### Amélioration 2 : Unifier le Pipeline d'Entraînement (`enrich_hidden_gems.py` comme source unique de vérité) et Corriger les 3 Fuites de Validation Croisée (Correction P0/P1 — C2, C4 & C7)

1. **Faire de `enrich_hidden_gems.py` l'unique pipeline de génération des artefacts finaux** (`deadlock_churn_dataset.csv`, `ml_results.json`, `features_list.json`, `deadlock_churn_model.pkl`, `deadlock_scaler.pkl`) en priorisant lors de l'extraction de fenêtres les matchs modernes (`match_id >= 152129`) disposant des métadonnées Source 2 dans `match_gems_v2_cache.joblib`, afin que les **7 Hidden Gems Source 2** et le bannissement des variables calendaires (`avg_session_gap_days`, `match_frequency_drift`) soient réellement reflétés sur le disque.
2. **Protéger les features primaires interprétables dans le filtre de colinéarité** :
   - Définir un ensemble `PROTECTED_CORE_FEATURES = {"tilt_index", "recent_loss_streak", "accuracy_pct", "headshot_ratio", "souls_per_min", "kda_ratio", "abandon_rate", "solo_isolation_streak", "stun_headshots_taken_rate", "grey_screen_ratio", "late_panic_sells"}` : lorsqu'une paire $(f_1, f_2)$ présente $|r| > 0.90$, si l'une des deux appartient à `PROTECTED_CORE_FEATURES` et l'autre est un proxy dérivé (ex: `rejoin_latency_s` ou `pause_tilt_frequency`), **supprimer systématiquement le proxy dérivé** plutôt que la variable métier primaire.
3. **Corriger la validation croisée Out-of-Fold (`StratifiedGroupKFold`) et sélectionner le champion sur le score Out-of-Fold (et non sur le Test Set)** :
   ```python
   # Dans enrich_hidden_gems.py (lignes 1084-1125) :
   cv_oof = StratifiedGroupKFold(n_splits=5)
   oof_proba = cross_val_predict(
       pipe, X_train_opt, y_train,
       cv=cv_oof, groups=groups_train,
       method="predict_proba", n_jobs=-1
   )[:, 1]
   ...
   # Sélection du champion strictement sur le score composite Out-of-Fold (Train CV) :
   champion_key = max(
       benchmark_results,
       key=lambda k: 0.5 * benchmark_results[k]["oof_roc_auc"] + 0.5 * benchmark_results[k]["oof_pr_auc"]
   )
   ```

#### Amélioration 3 : Exploiter les vrais champs de Rang et de Mode de Jeu de `match-history` (Correction P2 — C9)

Dans [backend/collect_data.py](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/collect_data.py) et [backend/enrich_hidden_gems.py](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/enrich_hidden_gems.py), remplacer les approximations heuristiques par les champs réellement présents dans `raw_histories_cache.joblib` :
```python
# 1. Calculer réellement `street_brawl_affinity` (game_mode == 4) et adapter le seuil de stomp
brawl_flags = [1 if int(m.get("game_mode") or 1) == 4 else 0 for m in chron]
street_brawl_affinity = sum(brawl_flags) / max(1, len(brawl_flags))

is_brawl = int(m.get("game_mode") or 1) == 4
stomp_threshold_min = 10.0 if is_brawl else 23.0
is_stomp_loss = (not won) and (dur_m < stomp_threshold_min)

# 2. Calculer le vrai risque de rétrogradation à partir des champs natifs du Game Coordinator
used_demotion_prot = sum(1 for m in chron if bool(m.get("ranked_used_demotion_protection")))
neg_ranked_deltas = sum(1 for m in chron if (m.get("ranked_delta") or 0) < 0)
demotion_risk_pct = min(
    100.0,
    max(0.0, used_demotion_prot * 35.0 + neg_ranked_deltas * 8.0 + (0.5 - win_rate) * 120.0 + recent_loss_streak * 9.0)
)
```

#### Amélioration 4 : Harmoniser la Formule du `tilt_index` et les Métriques Front-End / Back-End (Correction P1 — C5 & C6)

1. **Unifier `tilt_index` sur l'échelle $[0, 100]$** partout :
   - Mettre à jour le simulateur interactif de [PsychologySection.jsx:31-44](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/PsychologySection.jsx#L31-L44) et la formule de [ArchitectureSection.jsx:334](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/ArchitectureSection.jsx#L334) pour utiliser la vraie formule Deadlock de `feature_service.py` sur $[0, 100]$ (incluant la chute de précision 3D `accuracy_drop` et le jeu nocturne `night_owl_pct`).
   - Dans [SimulatorSection.jsx:752](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/frontend/src/components/SimulatorSection.jsx#L752), remplacer `(activePlayer.features?.tilt_index || 0) >= 3.5` par `(activePlayer.features?.tilt_index || 0) >= 60.0`.
2. **Purger les vestiges Dota 2 de `ArchitectureSection.jsx` et `MlBenchmarkSection.jsx`** :
   - Remplacer `13 584 joueurs / 49.6% churn / ROC 80.0% / PR 79.3% / θ* = 0.36 / gpm_trend / avg_tower_damage` par les métriques réelles issues de `/api/ml/visualizations` (`ml_results.json`).
   - Connecter `MlBenchmarkSection.jsx` aux données dynamiques retournées par `getMlVisualizations()` au lieu d'utiliser uniquement les constantes statiques importées de `mockData.js`.

#### Amélioration 5 : Ajouter un Modèle de Survie (Cox PH / Multi-Horizons) sur `time_gap_days`

Puisque `time_gap_days` et `is_churn` sont tous deux présents dans `deadlock_churn_dataset.csv`, ajouter une tête d'estimation de survie $S(t \mid X)$ pour prédire la probabilité de rétention à $t \in \{3\text{j}, 7\text{j}, 14\text{j}, 30\text{j}\}$ concrétiserait immédiatement la section 9.4 de `DEADLOCK_API_ASSESSMENT.md` sans nécessiter aucune nouvelle collecte API.

---

## 6. Questions Restantes & Pistes d'Investigation Complémentaires

1. **Origine du script d'analyse des 397 replays profonds (`ITEM_CHURN_ANALYTICS` & `HERO_CHURN_ANALYTICS`)** :
   - Les chiffres très précis présents dans [backend/app/api/routers/items.py:270-997](file:///Users/matthieugout/Desktop/Travail%20Perso/Machine%20Learning/deadlock-predictor/backend/app/api/routers/items.py#L270-L997) (temps moyens d'achat à la seconde près comme `8m 14s`, `29m 14s`, `Unspent Gold Minutes = 100 103 Souls·min`, `N = 2 696` fenêtres et `N = 397` replays) ne sont générés par aucun des 4 scripts Python présents dans `backend/`. Si un notebook ou script externe a servi à les calculer, il devrait être intégré au dépôt (par exemple `backend/analyze_items_and_heroes.py`) pour garantir une reproductibilité à 100%.
2. **Arbitrage entre le dataset global (`N = 10 000` fenêtres incluant de vieux matchs 2024 sans métadonnées) et le dataset enrichi Source 2 (`N = 2 696` à `5 000` fenêtres modernes avec vraies métadonnées `/v1/matches/metadata`)** :
   - Notre vérification du cache `match_gems_v2_cache.joblib` montre que sur les `6 364` `match_ids` interrogés, les `5 128` matchs modernes (`match_id >= 152129`) retournent 100% des métadonnées Source 2 (`custom_user_stats`, `shots_hit`, `death_duration_s`, `items_sold_time_s`), tandis que les `1 236` très vieux matchs (`match_id < 152129`) ont été purgés par Valve. En restreignant l'échantillonnage de fenêtres de `rebuild_and_train_debiased.py` aux ancres `match_T_id >= 152129` et en effectuant ~15 appels batch supplémentaires (`limit=450`), 100% du dataset d'entraînement disposera de la vraie télémétrie Source 2 sans aucune formule proxy.
3. **Priorité pour l'équipe de développement** :
   - **Priorité #1** : Relancer `enrich_hidden_gems.py` (après correction de `StratifiedGroupKFold`, de la sélection OOF et du filtre de colinéarité) pour restaurer le modèle *100% In-Game Pure + 7 Hidden Gems* sur le disque.
   - **Priorité #2** : Charger `deadlock_churn_model.pkl` et `deadlock_scaler.pkl` dans `FeatureService.predict_churn`, corriger les bugs `is_match_won` / `match_duration_s` / `match_frequency_drift`, et ajouter `only_stored_history=true` dans `DeadlockClient.get_player_match_history`.
   - **Priorité #3** : Synchroniser `ArchitectureSection.jsx`, `MlBenchmarkSection.jsx`, `PsychologySection.jsx`, `ItemTelemetrySection.jsx` et `SimulatorSection.jsx:752` pour éliminer tous les vestiges chiffrés de *Dota 2 Final*.
