import React, { useState, useEffect } from 'react';
import GlossaryTerm from './GlossaryTerm';

/**
 * ArchitectureSection Component
 * Act 5: Collapsed Technical Appendix (5-Stage Pipeline & Sequential R&D Roadmap)
 */
export default function ArchitectureSection({ lang = 'fr', t }) {
  const isFr = lang === 'fr';

  const [isExpanded, setIsExpanded] = useState(false);

  // Active stage selector (1 to 5)
  const [activeStageId, setActiveStageId] = useState(1);

  // Stage 4: Interactive Threshold Simulation state
  const [simThreshold, setSimThreshold] = useState(0.225);

  // Stage 2: Active behavioral feature formula inspector
  const [activeFeatureKey, setActiveFeatureKey] = useState('tilt_index');

  // Stage 3: Active model comparison view
  const [activeModelKey, setActiveModelKey] = useState('xgboost_smote');

  useEffect(() => {
    const onExpand = () => setIsExpanded(true);
    if (typeof window !== 'undefined') {
      window.addEventListener('deadlock:expand-architecture', onExpand);
      return () => window.removeEventListener('deadlock:expand-architecture', onExpand);
    }
    return undefined;
  }, []);

  // Translation helper with default fallback
  const tr = (key, fallback) => {
    if (typeof t === 'function') {
      const val = t(key, lang);
      if (val && val !== key) return val;
    }
    return fallback;
  };

  // Pipeline Stages Data Definition
  const STAGES = [
    {
      id: 1,
      num: '01',
      title: isFr ? 'Ingestion & Télémétrie' : 'Data Ingestion & Telemetry',
      subtitle: isFr ? 'Deadlock API / 3D Telemetry (api.deadlock-api.com)' : 'Deadlock API / 3D Telemetry (api.deadlock-api.com)',
      badge: isFr ? 'Collecte Asynchrone' : 'Async Collection',
      latency: '< 50ms / req',
      status: isFr ? 'Rate-Limit 20 req/s' : '20 req/s Rate-Limited',
      summary: isFr
        ? 'Extraction batch asynchrone via DeadlockClient de 8 625 fenêtres Source 2 enrichies (1 094 joueurs, 9 811 matchs pivots ; 923 185 matchs bruts collectés).'
        : 'Batch asynchronous extraction via DeadlockClient of 8,625 Source-2-enriched windows (1,094 players, 9,811 Source-2-enriched pivot matches; 923,185 raw matches collected).',
      inputs: {
        title: isFr ? 'Données d’Entrée' : 'Inputs & Data Source',
        items: [
          isFr ? <>Account ID Steam 32-bit (<code>account_id</code>)</> : <>32-bit Steam Account ID (<code>account_id</code>)</>,
          isFr ? <>API Publique Deadlock (<code>api.deadlock-api.com/v1/players/{'{id}'}/match-history</code>)</> : <>Public Deadlock API (<code>api.deadlock-api.com/v1/players/{'{id}'}/match-history</code>)</>,
          isFr ? 'Filtre d’intégrité : validation des matchs 6v6 & exclusion des abandons précoces' : 'Integrity filter: standard 6v6 match validation & early abandon pruning',
          isFr ? '8 625 fenêtres de 20 matchs (5 récents vs 15 baseline) enrichies via /v1/matches/metadata' : '8,625 rolling 20-match windows (5 recent vs 15 baseline) enriched via /v1/matches/metadata'
        ]
      },
      outputs: {
        title: isFr ? 'Données Produites' : 'Outputs & Schemas',
        items: [
          isFr ? 'Payloads JSON bruts standardisés par joueur' : 'Standardized raw JSON match records per player',
          isFr ? 'Horodatages Unix, durées de match, équipes (Amber / Sapphire) et victoires' : 'Unix timestamps, durations, teams (Amber / Sapphire) & match outcomes',
          isFr ? 'Métriques de combat & tir 3D : K/D/A, Souls/min, précision de visée, headshots' : 'Combat & 3D shooter metrics: K/D/A, Souls/min, aim accuracy, headshots, structure damage',
          isFr ? 'Télémétrie d’objectifs (Guardians, Walkers, Urnes, Mid-Boss) & statut d’abandon' : 'Objective telemetry (Guardians, Walkers, Urns, Mid-Boss) & abandon tracking'
        ]
      },
      algorithms: {
        title: isFr ? 'Outils & Protocoles' : 'Stack & Algorithms',
        items: [
          <>Python 3.11 <code>asyncio</code> &amp; <code>httpx</code> (<code>DeadlockClient</code>)</>,
          isFr ? 'Rate-Limiter adaptatif par fenêtre glissante (20 req/s, délai 0.05s)' : 'Sliding-window adaptive rate limiter (20 req/s, 0.05s delay)',
          isFr ? <>Retry exponentiel avec parsing de l’en-tête <code>Retry-After</code> sur 429/503/504</> : <>Exponential backoff retry with <code>Retry-After</code> header parsing on 429/503/504</>,
          isFr ? <>Cache mémoire LRU borné (<code>OrderedDict maxsize=1000</code>) &amp; repli mock hors-ligne</> : <>Bounded LRU in-memory cache (<code>OrderedDict maxsize=1000</code>) &amp; offline mock fallback</>
        ]
      },
      telemetry: {
        title: isFr ? 'Télémétrie & Contraintes Studio' : 'Operational Constraints',
        items: [
          isFr ? 'Débit : 20 requêtes / s (cluster ClickHouse 451M+ records Deadlock API)' : 'Throughput: 20 req/s (Deadlock API ClickHouse cluster with 451M+ records)',
          isFr ? 'Tolérance aux pannes : bascule transparente sur MockService en cas d’indisponibilité upstream' : 'Fault tolerance: transparent switch to MockService during upstream outage',
          isFr ? 'Cold start : nécessite au minimum 5 matchs récents valides' : 'Cold start: requires at least 5 recent valid matches',
          isFr ? 'Anonymisation totale : aucune IP ni donnée privée stockée' : 'Full anonymization: zero IP addresses or PII stored'
        ]
      }
    },
    {
      id: 2,
      num: '02',
      title: isFr ? 'Ingénierie des 106 Signaux (36 Opt.)' : '106 In-Game Features (36 Optimal)',
      subtitle: isFr ? 'Psychométrie & 7 Gemmes Cachées Source 2' : 'Psychometrics & 7 Source 2 Hidden Gems',
      badge: isFr ? '106 Signaux → 36 Opt.' : '106 Signals → 36 Opt.',
      latency: '< 15ms / joueur',
      status: isFr ? 'Vectorisation NumPy' : 'NumPy Vectorized',
      summary: isFr
        ? 'Transformation des séries de 20 matchs et de la télémétrie Source 2 en 106 indicateurs purs (36 sélectionnés), sans aucune fuite calendaire.'
        : 'Transformation of 20-match series and Source 2 telemetry into 106 pure in-game signals (36 selected), with zero calendar leakage.',
      inputs: {
        title: isFr ? 'Données d’Entrée' : 'Inputs & Raw Series',
        items: [
          isFr ? 'Fenêtre glissante de 20 matchs (5 récents vs 15 baseline)' : '20-match rolling window (5 recent vs 15 baseline)',
          isFr ? 'Contexte immédiat du Match pivot T et métadonnées Source 2' : 'Immediate context of pivot Match T and Source 2 metadata',
          isFr ? 'Horodatages de début de partie (détection nuit/jour)' : 'Match start timestamps (night/day detection)',
          isFr ? <>Répartition des lanes et rôles (<code>lane_role</code>)</> : <>Lane and role assignments (<code>lane_role</code>)</>
        ]
      },
      outputs: {
        title: isFr ? 'Données Produites' : 'Outputs & Feature Vector',
        items: [
          isFr ? 'Vecteur de 106 signaux candidats filtrés à 36 variables optimales (0 fuite calendaire)' : '106 candidate signals pruned to 36 optimal features (0 calendar leakage)',
          isFr ? <>Index de Tilt composite (<code>tilt_index</code> [0–100])</> : <>Composite Tilt Index (<code>tilt_index</code> [0–100])</>,
          isFr ? <>7 Gemmes Cachées : <code>rage_sell_rate</code>, <code>stun_headshots_taken_rate</code>, <code>solo_isolation_streak</code>, <code>grey_screen_ratio</code></> : <>7 Hidden Gems: <code>rage_sell_rate</code>, <code>stun_headshots_taken_rate</code>, <code>solo_isolation_streak</code>, <code>grey_screen_ratio</code></>,
          isFr ? <>Dynamique de Souls &amp; combat : <code>souls_per_min</code>, <code>guardian_kills</code>, <code>walker_kills</code>, <code>ability_unlock_pace</code></> : <>Soul dynamics &amp; combat: <code>souls_per_min</code>, <code>guardian_kills</code>, <code>walker_kills</code>, <code>ability_unlock_pace</code></>
        ]
      },
      algorithms: {
        title: isFr ? 'Outils & Protocoles' : 'Stack & Algorithms',
        items: [
          'NumPy & Pandas Matrix Vectorization',
          isFr ? 'Fenêtres glissantes sans fuite (5 récents vs 15 référence)' : 'Leak-free split windows (5 recent vs 15 baseline)',
          isFr ? 'Filtrage colinéarité protégé (|r| > 0.90) & standardisation par ère de patch' : 'Protected collinearity pruning (|r| > 0.90) & patch-era standardization',
          isFr ? <>StandardScaler sérialisé (<code>deadlock_scaler.pkl</code>)</> : <>Serialized StandardScaler (<code>deadlock_scaler.pkl</code>)</>
        ]
      },
      telemetry: {
        title: isFr ? 'Télémétrie & Contraintes Studio' : 'Operational Constraints',
        items: [
          isFr ? 'Complexité temporelle : O(N) où N = 20 matchs (< 15ms)' : 'Time complexity: O(N) where N = 20 matches (< 15ms total)',
          isFr ? 'Zéro fuite calendaire : aucune variable de fréquence/écart en jours' : 'Zero calendar leakage: session gap & frequency drift banned',
          isFr ? 'Imputation déterministe pour nouveaux comptes' : 'Deterministic imputation for sparse accounts',
          isFr ? 'Cohérence cross-plateforme Python / Node' : 'Cross-platform feature consistency between Python & Node'
        ]
      }
    },
    {
      id: 3,
      num: '03',
      title: isFr ? 'Validation Groupée & Entraînement ML' : 'Group CV & Model Training',
      subtitle: isFr ? 'Gradient Boosting Régularisé (Champion)' : 'Regularized Gradient Boosting (Champion)',
      badge: isFr ? 'Champion In-Game Pure' : 'Pure In-Game Champion',
      latency: '~45s (Train 8 vCPU)',
      status: isFr ? '5-Fold StratifiedGroupKFold' : '5-Fold StratifiedGroupKFold',
      summary: isFr
        ? 'Entraînement supervisé sur 8 625 fenêtres (1 094 joueurs) avec GroupShuffleSplit et StratifiedGroupKFold (zéro chevauchement de joueur entre Train et Test).'
        : 'Supervised training on 8,625 windows (1,094 players) using GroupShuffleSplit and StratifiedGroupKFold (zero player overlap between Train and Test).',
      inputs: {
        title: isFr ? 'Données d’Entrée' : 'Inputs & Train Split',
        items: [
          isFr ? 'Matrice X complète (8 625 fenêtres × 36 variables optimales)' : 'Feature matrix X (8,625 windows × 36 optimal features)',
          isFr ? <>Vecteur cible binaire y (<code>is_churn</code> à 14 jours)</> : <>Binary target vector y (<code>is_churn</code> at 14 days)</>,
          isFr ? 'Split groupé par account_id : 6 930 Train / 1 695 Test (0 joueur en commun)' : 'Group split by account_id: 6,930 Train / 1,695 Test (0 shared players)',
          isFr ? 'Taux de churn empirique dans la cohorte : 24.8% (2 138 / 8 625)' : 'Cohort empirical churn rate: 24.8% (2,138 / 8,625)'
        ]
      },
      outputs: {
        title: isFr ? 'Données Produites' : 'Outputs & Model Artifacts',
        items: [
          isFr ? <>Classifieur sérialisé (<code>deadlock_churn_model.pkl</code>)</> : <>Serialized classifier artifact (<code>deadlock_churn_model.pkl</code>)</>,
          isFr ? 'Rappel Test : 73.2% | Précision Test : 40.8% (F1 : 52.4%)' : 'Test Recall: 73.2% | Test Precision: 40.8% (F1: 52.4%)',
          isFr ? 'ROC-AUC : 74.7% | PR-AUC : 50.8% | Brier : 0.1604' : 'ROC-AUC: 74.7% | PR-AUC: 50.8% | Brier: 0.1604',
          isFr ? <>Schéma ordonné des 36 variables (<code>features_list.json</code>)</> : <>Ordered 36-feature registry (<code>features_list.json</code>)</>
        ]
      },
      algorithms: {
        title: isFr ? 'Outils & Protocoles' : 'Stack & Algorithms',
        items: [
          'GradientBoostingClassifier (Depth-3, Colsample=0.50, Subsample=0.75)',
          'StratifiedGroupKFold (n_splits=5, groups=account_id)',
          'OOF Composite Selection (0.5·ROC-AUC + 0.5·PR-AUC)',
          isFr ? 'Permutation Feature Importance sur jeu de test indépendant' : 'Permutation Feature Importance on independent test split'
        ]
      },
      telemetry: {
        title: isFr ? 'Télémétrie & Contraintes Studio' : 'Operational Constraints',
        items: [
          isFr ? 'Validation croisée 5-Fold groupée par joueur (zéro fuite intra-compte)' : '5-Fold player-grouped cross-validation (zero intra-account leakage)',
          isFr ? 'Surclasse les 6 autres modèles et l’ablation sans Gemmes Cachées (+3.1 pts ROC)' : 'Outperforms all 6 challengers & no-gems baseline (+3.1 pts ROC)',
          isFr ? 'Calibration des probabilités sans biais (Brier = 0.1604)' : 'Well-calibrated probability output (Brier = 0.1604)',
          isFr ? 'Poids du modèle sur disque : < 1.5 Mo' : 'Model artifact memory footprint: < 1.5 MB'
        ]
      }
    },
    {
      id: 4,
      num: '04',
      title: isFr ? 'Calibration du Seuil de Décision' : 'Decision Threshold Calibration',
      subtitle: isFr ? 'Optimisation Asymétrique θ* = 0.225' : 'Asymmetric Optimization θ* = 0.225',
      badge: isFr ? 'Seuil Calibré θ* = 0.225' : 'Calibrated Cutoff θ* = 0.225',
      latency: '< 0.1ms / coupure',
      status: isFr ? 'OOF F-Beta (β=1.15)' : 'OOF F-Beta (β=1.15)',
      summary: isFr
        ? 'Ajustement du point de coupure hors-échantillon à θ* = 0.225 pour garantir 73.2% de rappel préventif, adapté aux interventions douces du studio.'
        : 'Out-of-fold cutoff tuning to θ* = 0.225 to guarantee 73.2% proactive recall, aligned with non-punitive studio game balancing.',
      inputs: {
        title: isFr ? 'Données d’Entrée' : 'Inputs & Probabilities',
        items: [
          isFr ? 'Probabilités continues prédites P(churn | X) ∈ [0, 1]' : 'Continuous predicted probabilities P(churn | X) ∈ [0, 1]',
          isFr ? 'Balayage Out-of-Fold groupé sur la grille de seuils' : 'Grouped Out-of-Fold threshold sweep across candidate cutoffs',
          isFr ? 'Matrice de coût asymétrique du studio esport' : 'Esports studio asymmetric cost matrix',
          isFr ? 'Vérité terrain des 1 695 fenêtres du jeu de test (425 churners)' : 'Ground truth across 1,695 test windows (425 churners)'
        ]
      },
      outputs: {
        title: isFr ? 'Données Produites' : 'Outputs & Calibrated Tiers',
        items: [
          isFr ? 'Seuil optimal retenu : θ* = 0.225' : 'Optimal calibrated threshold: θ* = 0.225',
          isFr ? 'Rappel test : 73.2% (311 / 425 départs interceptés)' : 'Test recall: 73.2% (311 / 425 churners caught)',
          isFr ? 'Spécificité : 64.5% (819 joueurs fidélisés correctement ignorés)' : 'Specificity: 64.5% (819 retained players correctly cleared)',
          isFr ? 'Tri-partition du risque : Faible (<22.5%), Modéré (22.5%–60%), Critique (>60%)' : 'Tri-tier risk classification: Low (<22.5%), Moderate (22.5%–60%), Critical (>60%)'
        ]
      },
      algorithms: {
        title: isFr ? 'Outils & Protocoles' : 'Stack & Algorithms',
        items: [
          'Argmax F-Beta (β=1.15) Out-of-Fold Sweep',
          'Precision-Recall AUC Optimization',
          isFr ? 'Théorie de la Décision Bayésienne Asymétrique' : 'Asymmetric Bayesian Decision Theory',
          isFr ? 'Fonction d’utilité de rétention joueur non-punitive' : 'Non-punitive player retention utility function'
        ]
      },
      telemetry: {
        title: isFr ? 'Télémétrie & Contraintes Studio' : 'Operational Constraints',
        items: [
          isFr ? 'Pourquoi 0.225 plutôt que 0.50 ? À 0.50, le rappel chute à 17.7%' : 'Why 0.225 over 0.50? Default 0.50 drops recall to 17.7%',
          isFr ? 'Coût d’un faux positif : quasi-nul (on offre juste des alliés sereins)' : 'False positive cost: negligible (just pairs with calm teammates)',
          isFr ? 'Coût d’un faux négatif : critique (perte définitive du joueur)' : 'False negative cost: critical (permanent player departure)',
          isFr ? 'Éthique anti-EOMM : respect absolu de l’équité 50/50 des parties' : 'Anti-EOMM ethics: zero rigging of match outcomes'
        ]
      }
    },
    {
      id: 5,
      num: '05',
      title: isFr ? 'Inférence & Attribution Temps Réel' : 'Real-time Serving & Attribution',
      subtitle: isFr ? 'Microservice FastAPI & Explicabilité SHAP' : 'FastAPI Microservice & SHAP Explainability',
      badge: isFr ? 'FastAPI Inférence <50ms' : 'FastAPI Inference <50ms',
      latency: isFr ? '< 50ms (Inférence)' : '< 50ms (Inference)',
      status: isFr ? 'Microservice REST' : 'REST Microservice',
      summary: isFr
        ? 'Microservice haute performance exposant les prédictions en direct avec attribution factorielle bilatérale et repli déterministe.'
        : 'High-performance microservice serving live predictions with bilateral factor attribution and deterministic fallback.',
      inputs: {
        title: isFr ? 'Données d’Entrée' : 'Inputs & API Requests',
        items: [
          isFr ? <>Requête HTTP <code>GET /api/predict/{'{account_id}'}</code></> : <>HTTP <code>GET /api/predict/{'{account_id}'}</code> request</>,
          isFr ? <>Requête <code>GET /api/ml/metrics</code> &amp; <code>/api/ml/visualizations</code></> : <><code>GET /api/ml/metrics</code> &amp; <code>/api/ml/visualizations</code> routes</>,
          isFr ? <>Requête <code>GET /api/status</code> pour la sonde de santé</> : <><code>GET /api/status</code> healthcheck probe</>,
          isFr ? 'Vecteur normalisé des variables calculées' : 'Normalized feature vector'
        ]
      },
      outputs: {
        title: isFr ? 'Données Produites' : 'Outputs & REST Payloads',
        items: [
          isFr ? 'Probabilité continue de churn arrondie à 3 décimales' : 'Continuous churn probability rounded to 3 decimals',
          isFr ? 'Niveau de risque textuel et classe binaire calibrée' : 'Categorical risk tier and calibrated binary prediction',
          isFr ? 'Attribution des facteurs aggravants vs protecteurs' : 'Bilateral positive/negative factor attribution breakdown',
          isFr ? 'En-têtes CORS permissifs pour intégration SPA frontend' : 'Permissive CORS headers for frontend SPA integration'
        ]
      },
      algorithms: {
        title: isFr ? 'Outils & Protocoles' : 'Stack & Algorithms',
        items: [
          'FastAPI 0.100+ & Uvicorn ASGI Server',
          'TreeSHAP / Model Permutation Importance',
          isFr ? 'Génération de profils déterministes par hachage pseudo-aléatoire' : 'Deterministic pseudo-random hashing for fallback profiles',
          'StandardScaler transform pipeline'
        ]
      },
      telemetry: {
        title: isFr ? 'Télémétrie & Contraintes Studio' : 'Operational Constraints',
        items: [
          isFr ? 'Temps d’inférence pur : < 50ms par joueur en production' : 'Inference time: < 50ms per player in production',
          isFr ? 'Temps total avec fetch Deadlock API : ~1.2s' : 'Total time including live Deadlock API fetch: ~1.2s',
          isFr ? 'Mode Démo Autonome : repli transparent sans backend actif' : 'Autonomous Demo Mode: seamless fallback if backend is offline',
          isFr ? 'Sécurité stricte : zéro token, zéro clé privée exposée' : 'Hardened security: zero tokens or private secrets exposed'
        ]
      }
    }
  ];

  // Active Stage Object
  const currentStage = STAGES.find((s) => s.id === activeStageId) || STAGES[0];

  // Feature formula catalog for Stage 2 interactive widget
  const FEATURE_FORMULAS = {
    tilt_index: {
      name: 'tilt_index',
      title: isFr ? 'Index de Frustration & Tilt [0–100]' : 'Composite Tilt Index [0–100]',
      formula: 'tilt_index = min(100, 12*loss_streak + 40*abandon_rate + 15*night_owl_pct + 33*accuracy_drop)',
      desc: isFr
        ? 'Score unifié sur [0–100] combinant séries de défaites, abandons, sessions nocturnes et chute brutale de précision au tir.'
        : 'Unified [0–100] score combining recent loss streaks, abandons, nocturnal sessions, and sudden shooting accuracy drops.',
      importance: isFr ? 'Composite Psychométrique (Critique ≥ 60)' : 'Psychometric Composite (Critical ≥ 60)',
      unit: 'Score [0 - 100]'
    },
    night_owl_pct: {
      name: 'night_owl_pct',
      title: isFr ? 'Ratio Nocturne (00h - 06h)' : 'Night Owl Ratio (00h - 06h)',
      formula: 'night_owl_pct = count(matches where 0 <= start_hour < 6) / total_matches',
      desc: isFr
        ? 'Proportion des parties disputées en période de sommeil circadien, marqueur clinique de fatigue et de désinhibition émotionnelle.'
        : 'Fraction of matches played during late-night circadian hours, a clinical marker of fatigue and emotional disinhibition.',
      importance: isFr ? '0.0052 (Significatif)' : '0.0052 (Significant)',
      unit: isFr ? 'Pourcentage [0% - 100%]' : 'Percentage [0% - 100%]'
    },
    objective_focus: {
      name: 'objective_focus',
      title: isFr ? 'Focalisation sur les Objectifs' : 'Objective Focus Ratio',
      formula: 'objective_focus = avg_structure_damage / (avg_hero_damage + 1.0)',
      desc: isFr
        ? 'Ratio mesurant l’investissement dans la destruction des Guardians/Walkers vs le combat de mêlée. Un ratio bas signale un jeu dispersé.'
        : 'Ratio of Guardian/Walker siege damage to hero combat damage. Low values signify aimless brawling and high churn vulnerability.',
      importance: '0.0115 (Top 15)',
      unit: isFr ? 'Ratio continu [0.0 - 0.5+]' : 'Continuous ratio [0.0 - 0.5+]'
    },
    role_consistency: {
      name: 'role_consistency',
      title: isFr ? 'Stabilité de Rôle & Lane' : 'Role Consistency Index',
      formula: 'role_consistency = max(count_per_lane_role.values()) / total_matches',
      desc: isFr
        ? 'Fréquence de jeu dans la lane et le rôle principal du joueur. La dispersion chaotique traduit un malaise dans la partie.'
        : 'Frequency of play in the dominant lane role. Erratic switching across lanes signals disengagement.',
      importance: '0.0712 (Top 4)',
      unit: isFr ? 'Pourcentage [0% - 100%]' : 'Percentage [0% - 100%]'
    },
    spm_trend: {
      name: 'spm_trend',
      title: isFr ? 'Tendance Économique (SPM Delta)' : 'Economic Momentum (SPM Delta)',
      formula: 'spm_trend = mean(souls_per_min[last_5]) - mean(souls_per_min[prior_15])',
      desc: isFr
        ? 'Différentiel glissant entre les 5 parties les plus récentes et les 15 parties de référence. Une chute brutale de Souls/min annonce un abandon imminent.'
        : 'Rolling difference between the last 5 matches and the 15-match baseline. Sharp Souls/min drops precede imminent churn.',
      importance: '0.0102 (Top 16)',
      unit: isFr ? 'Souls/min [-250 à +250]' : 'Souls/min [-250 to +250]'
    }
  };

  // Model comparison catalog for Stage 3 interactive widget
  const MODELS_DATA = {
    xgboost_smote: {
      name: isFr ? 'Gradient Boosting (Champion)' : 'Gradient Boosting (Champion)',
      status: isFr ? 'Modèle en Production' : 'Production Model',
      badgeClass: 'badge-orange',
      recall: '73.2%',
      precision: '40.8%',
      prAuc: '50.8%',
      rocAuc: '74.7%',
      cutoff: '0.225',
      notes: isFr
        ? 'Champion sélectionné sur critère OOF composite (0.5·ROC + 0.5·PR) : meilleure discrimination in-game pure (74.7% ROC, 50.8% PR, Brier 0.1604) sur les 36 variables optimales.'
        : 'Champion selected by OOF composite score (0.5·ROC + 0.5·PR): top pure in-game discrimination (74.7% ROC, 50.8% PR, Brier 0.1604) on 36 optimal features.'
    },
    xgboost_scale_pos: {
      name: isFr ? 'HistGradient + Calibration Sigmoïde' : 'Calibrated HistGradient (Sigmoid)',
      status: isFr ? 'Alternative Validée' : 'Valid Alternative',
      badgeClass: 'badge-amber',
      recall: '65.2%',
      precision: '41.5%',
      prAuc: '49.9%',
      rocAuc: '73.3%',
      cutoff: '0.245',
      notes: isFr
        ? 'Calibration probabiliste sigmoïde stricte avec excellente fiabilité des probabilités (Brier 0.1616) mais rappel inférieur au Gradient Boosting.'
        : 'Strict sigmoid probability calibration with strong reliability (Brier 0.1616) but lower recall than Gradient Boosting.'
    },
    baseline_random_forest: {
      name: isFr ? 'Random Forest (Profondeur 6)' : 'Random Forest (Pruned Depth-6)',
      status: isFr ? 'Baseline Ensembliste' : 'Ensemble Baseline',
      badgeClass: 'badge-neutral',
      recall: '74.4%',
      precision: '36.2%',
      prAuc: '48.3%',
      rocAuc: '72.1%',
      cutoff: '0.430',
      notes: isFr
        ? 'Ensemble d’arbres élagué : bon rappel mais précision et PR-AUC (48.3%) inférieurs au Gradient Boosting.'
        : 'Pruned tree ensemble: solid recall but lower precision and PR-AUC (48.3%) than Gradient Boosting.'
    }
  };

  // Stage 4: Threshold metrics calculator anchored to ML_CONTRACT.md test-set curve (N=1695, Churners=425)
  const getThresholdMetrics = (th) => {
    const pts = [
      { th: 0.05, recall: 1.0000, precision: 0.2507 },
      { th: 0.10, recall: 0.9976, precision: 0.2571 },
      { th: 0.15, recall: 0.9318, precision: 0.2982 },
      { th: 0.19, recall: 0.8235, precision: 0.3425 },
      { th: 0.20, recall: 0.7906, precision: 0.3590 },
      { th: 0.225, recall: 0.7318, precision: 0.4081 },
      { th: 0.25, recall: 0.6659, precision: 0.4492 },
      { th: 0.30, recall: 0.5224, precision: 0.4978 },
      { th: 0.35, recall: 0.4047, precision: 0.5409 },
      { th: 0.40, recall: 0.3271, precision: 0.5890 },
      { th: 0.45, recall: 0.2447, precision: 0.6380 },
      { th: 0.50, recall: 0.1765, precision: 0.6466 },
      { th: 0.55, recall: 0.1271, precision: 0.6750 },
      { th: 0.60, recall: 0.0753, precision: 0.6667 },
      { th: 0.65, recall: 0.0541, precision: 0.6765 },
      { th: 0.70, recall: 0.0376, precision: 0.7619 },
      { th: 0.75, recall: 0.0165, precision: 0.7778 },
      { th: 0.80, recall: 0.0047, precision: 1.0000 },
      { th: 0.90, recall: 0.0000, precision: 0.0000 }
    ];
    let recall = 0.7318;
    let precision = 0.4081;
    if (th <= pts[0].th) {
      recall = pts[0].recall;
      precision = pts[0].precision;
    } else if (th >= pts[pts.length - 1].th) {
      recall = pts[pts.length - 1].recall;
      precision = pts[pts.length - 1].precision;
    } else {
      for (let i = 0; i < pts.length - 1; i++) {
        if (th >= pts[i].th && th <= pts[i + 1].th) {
          const r = (th - pts[i].th) / (pts[i + 1].th - pts[i].th);
          recall = pts[i].recall + r * (pts[i + 1].recall - pts[i].recall);
          precision = pts[i].precision + r * (pts[i + 1].precision - pts[i].precision);
          break;
        }
      }
    }
    const f1 = recall + precision > 0 ? (2 * recall * precision) / (recall + precision) : 0;
    const tp = Math.round(425 * recall);
    const fn = 425 - tp;
    const fp = precision > 0 ? Math.round(tp * ((1 - precision) / precision)) : 0;

    return {
      recallPct: (recall * 100).toFixed(1) + '%',
      precisionPct: (precision * 100).toFixed(1) + '%',
      f1Score: f1.toFixed(3),
      tpCount: tp,
      fnCount: fn,
      fpCount: fp
    };
  };

  const simMetrics = getThresholdMetrics(simThreshold);

  return (
    <section id="architecture" className="section section-alt architecture-section-container">
      <div className="container">
        {/* Compact Technical Appendix Header Card (Collapsed by default) */}
        <div
          style={{
            border: '1px solid var(--color-rule)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.35rem 1.5rem',
            background: 'var(--color-paper-2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="badge badge-orange" style={{ marginBottom: '0.6rem' }}>
                {isFr ? 'ANNEXE TECHNIQUE & PIPELINE ML' : 'TECHNICAL APPENDIX & ML PIPELINE'}
              </div>
              <h2 style={{ margin: '0 0 0.35rem 0', fontSize: 'clamp(1.25rem, 2.5vw, 1.7rem)' }}>
                {isFr ? 'Architecture Temps Réel (< 50 ms) & Modèles Séquentiels' : 'Real-Time Pipeline (< 50ms) & Sequential Roadmap'}
              </h2>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '72ch' }}>
                {isFr
                  ? "Ingestion Source 2 asynchrone, vectorisation de 106→36 signaux, calibrage du seuil matchmaking θ* = 0.225 et pistes R&D (Survie, LSTM, Hawkes)."
                  : 'Async Source 2 ingestion, 106→36 signal vectorization, matchmaking cutoff θ* = 0.225 calibration, and sequential R&D roadmap (Survival, LSTM, Hawkes).'}
              </p>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsExpanded((prev) => !prev)}
              aria-expanded={isExpanded}
              style={{ fontSize: '0.84rem', padding: '0.6rem 1.15rem', whiteSpace: 'normal', textAlign: 'left' }}
            >
              {isExpanded
                ? (isFr ? "Replier l'annexe technique ↑" : 'Collapse technical appendix ↑')
                : (isFr ? "Déplier le pipeline détaillé & pistes R&D (Survie, LSTM, Hawkes) ↓" : 'Expand full 5-stage pipeline & R&D roadmap (Survival, LSTM, Hawkes) ↓')}
            </button>
          </div>

          {/* Inline 5-Stage Pipeline Summary Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {[
              isFr ? '01 API Source 2' : '01 Source 2 API',
              isFr ? '02 106→36 Signaux' : '02 106→36 Signals',
              '03 Gradient Boosting',
              isFr ? '04 Seuil θ*=0.225' : '04 Cutoff θ*=0.225',
              '05 FastAPI <50ms'
            ].map((pillLabel) => (
              <span
                key={pillLabel}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.74rem',
                  color: 'var(--text-secondary)',
                  background: 'var(--color-paper-inset)',
                  border: '1px solid var(--color-rule)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.28rem 0.65rem'
                }}
              >
                {pillLabel}
              </span>
            ))}
          </div>
        </div>

        {/* Expandable 5-Stage Pipeline Inspector & Sequential R&D Roadmap */}
        {isExpanded && (
          <div style={{ marginTop: '1.75rem' }}>
            {/* 1. Interactive 5-Stage Stepper Navigation */}
            <nav className="pipeline-stepper" aria-label={isFr ? 'Étapes du pipeline ML' : 'ML Pipeline Stages'}>
          {STAGES.map((stage) => {
            const isActive = stage.id === activeStageId;
            return (
              <button
                key={stage.id}
                type="button"
                className={`stage-node-card arch-stage-card ${isActive ? 'active' : ''}`}
                onClick={() => setActiveStageId(stage.id)}
                aria-pressed={isActive}
              >
                <div className="node-top-row">
                  <span className="node-num">{stage.num}</span>
                  <span className="node-latency-pill">{stage.latency}</span>
                </div>
                <div className="node-title">{stage.title}</div>
                <div className="node-subtitle">{stage.badge}</div>
              </button>
            );
          })}
        </nav>

        {/* 2. Deep-Dive Stage Inspector */}
        <article className="stage-inspector-card" aria-live="polite">
          {/* Header of Active Stage */}
          <header className="inspector-header">
            <div className="inspector-title-group">
              <div className="badge badge-orange" style={{ marginBottom: '0.5rem' }}>
                {isFr ? `ÉTAPE ${currentStage.num}` : `STAGE ${currentStage.num}`}
              </div>
              <h3>{currentStage.title}</h3>
              <p style={{ margin: 0, fontSize: '0.9375rem' }}>{currentStage.summary}</p>
            </div>
            <div className="inspector-badges">
              <span className="badge badge-neutral">
                <span className="badge-dot" />
                {currentStage.status}
              </span>
              <span className="badge badge-amber">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 3 }} aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {currentStage.latency}
              </span>
            </div>
          </header>

          {/* 4-Column Technical Matrix */}
          <div className="inspector-grid">
            {/* Panel 1: Inputs */}
            <div className="inspector-col-panel">
              <h4>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {currentStage.inputs.title}
              </h4>
              <ul className="inspector-list">
                {currentStage.inputs.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Panel 2: Outputs */}
            <div className="inspector-col-panel">
              <h4>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {currentStage.outputs.title}
              </h4>
              <ul className="inspector-list">
                {currentStage.outputs.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Panel 3: Stack & Algorithms */}
            <div className="inspector-col-panel">
              <h4>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                {currentStage.algorithms.title}
              </h4>
              <ul className="inspector-list">
                {currentStage.algorithms.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Panel 4: Operational Telemetry */}
            <div className="inspector-col-panel">
              <h4>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                {currentStage.telemetry.title}
              </h4>
              <ul className="inspector-list">
                {currentStage.telemetry.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. Stage-Specific Interactive Exploration Widget */}
          <div className="interactive-widget-box">
            {/* Widget for Stage 1: Data Ingestion Payload Explorer */}
            {activeStageId === 1 && (
              <div>
                <div className="widget-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-orange">{isFr ? 'Extrait Télémétrie' : 'Telemetry Snippet'}</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      Deadlock Async Client (<code>backend/app/client/deadlock_client.py</code>)
                    </span>
                  </div>
                  <span className="badge badge-neutral">{isFr ? 'Rate-limit : 20 req/s (0.05s)' : 'Rate-limit: 20 req/s (0.05s)'}</span>
                </div>
                <pre className="code-snippet-pre">
{isFr
  ? `# Client asynchrone Deadlock API (https://api.deadlock-api.com)
class DeadlockClient:
    def __init__(self, base_url: str = "https://api.deadlock-api.com"):
        self.base_url = base_url
        self._client = httpx.AsyncClient(base_url=self.base_url, timeout=15.0)
        self._rate_lock = asyncio.Lock()
        self.rate_limit_delay = 0.05  # Fenêtre glissante 20 req/s

    async def get_player_match_history(self, account_id: int) -> List[Dict[str, Any]]:
        """Extrait l'historique des 100 matchs récents avec contrôle de débit & cache LRU."""
        async with self._rate_lock:
            await self._throttle()
        # Ingestion de l'historique et des métadonnées de tir 3D
        endpoint = f"/v1/players/{account_id}/match-history"
        return await self.request("GET", endpoint, params={"only_stored_history": "true"}, ttl_seconds=300)`
  : `# Async Deadlock API Client (https://api.deadlock-api.com)
class DeadlockClient:
    def __init__(self, base_url: str = "https://api.deadlock-api.com"):
        self.base_url = base_url
        self._client = httpx.AsyncClient(base_url=self.base_url, timeout=15.0)
        self._rate_lock = asyncio.Lock()
        self.rate_limit_delay = 0.05  # 20 req/s sliding window

    async def get_player_match_history(self, account_id: int) -> List[Dict[str, Any]]:
        """Fetches recent match history with rate-limiting & LRU caching."""
        async with self._rate_lock:
            await self._throttle()
        # Ingest match history and 3D gunplay metadata
        endpoint = f"/v1/players/{account_id}/match-history"
        return await self.request("GET", endpoint, params={"only_stored_history": "true"}, ttl_seconds=300)`}
                </pre>
              </div>
            )}

            {/* Widget for Stage 2: Feature Formula Calculator */}
            {activeStageId === 2 && (
              <div>
                <div className="widget-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-orange">{isFr ? 'Formules Psycho-Comportementales' : 'Psychometric Formulas'}</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {isFr ? 'Sélectionnez une variable clé :' : 'Select a key behavioral feature:'}
                    </span>
                  </div>
                  <div className="widget-tabs">
                    {Object.keys(FEATURE_FORMULAS).map((key) => (
                      <button
                        key={key}
                        type="button"
                        className={`widget-tab-btn ${activeFeatureKey === key ? 'active' : ''}`}
                        onClick={() => setActiveFeatureKey(key)}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {FEATURE_FORMULAS[activeFeatureKey].title}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {FEATURE_FORMULAS[activeFeatureKey].desc}
                  </p>
                </div>
                <pre className="code-snippet-pre">{`# ${isFr ? 'Définition formelle (backend/app/services/feature_service.py)' : 'Formal definition (backend/app/services/feature_service.py)'}:\n${FEATURE_FORMULAS[activeFeatureKey].formula}\n\n# ${isFr ? 'Unité' : 'Unit'}: ${FEATURE_FORMULAS[activeFeatureKey].unit} | ${isFr ? 'Importance modèle' : 'Model importance'}: ${FEATURE_FORMULAS[activeFeatureKey].importance}`}</pre>
              </div>
            )}

            {/* Widget for Stage 3: Model Benchmark Matrix */}
            {activeStageId === 3 && (
              <div>
                <div className="widget-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-orange">{isFr ? 'Confrontation des Architectures' : 'Model Architecture Showdown'}</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {isFr ? 'Jeu de test groupé sans fuite (N = 1 695)' : 'Leak-free grouped test set (N = 1,695)'}
                    </span>
                  </div>
                  <div className="widget-tabs">
                    {Object.keys(MODELS_DATA).map((key) => (
                      <button
                        key={key}
                        type="button"
                        className={`widget-tab-btn ${activeModelKey === key ? 'active' : ''}`}
                        onClick={() => setActiveModelKey(key)}
                      >
                        {MODELS_DATA[key].name}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{isFr ? 'Rappel (Recall)' : 'Recall'}</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-orange)' }}>
                      {MODELS_DATA[activeModelKey].recall}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{isFr ? 'Précision' : 'Precision'}</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ink)' }}>
                      {MODELS_DATA[activeModelKey].precision}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      <GlossaryTerm termId="pr_auc">PR-AUC</GlossaryTerm>
                    </div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                      {MODELS_DATA[activeModelKey].prAuc}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      <GlossaryTerm termId="roc_auc">ROC-AUC</GlossaryTerm>
                    </div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                      {MODELS_DATA[activeModelKey].rocAuc}
                    </div>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <strong>{isFr ? 'Analyse industrielle : ' : 'Industrial audit: '}</strong>
                  {MODELS_DATA[activeModelKey].notes}
                </p>
              </div>
            )}

            {/* Widget for Stage 4: Threshold Calibration Simulator */}
            {activeStageId === 4 && (
              <div>
                <div className="widget-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-orange">{isFr ? 'Simulateur de Seuil Asymétrique' : 'Asymmetric Cutoff Simulator'}</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {isFr ? (
                        <GlossaryTerm termId="threshold">Seuil optimal θ* = 0.225</GlossaryTerm>
                      ) : (
                        'Optimal cutoff θ* = 0.225'
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="widget-tab-btn active"
                    onClick={() => setSimThreshold(0.225)}
                  >
                    {isFr ? 'Réinitialiser θ* = 0.225' : 'Reset θ* = 0.225'}
                  </button>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label htmlFor="threshold-slider" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {isFr ? 'Seuil de décision P(churn) :' : 'Decision Threshold P(churn):'}
                    </label>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-orange)' }}>
                      {simThreshold.toFixed(3)}
                    </span>
                  </div>
                  <input
                    id="threshold-slider"
                    type="range"
                    min="0.05"
                    max="0.90"
                    step="0.005"
                    value={simThreshold}
                    onChange={(e) => setSimThreshold(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent-orange)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    <span>0.05 ({isFr ? 'Hyper-sensible' : 'Hyper-sensitive'})</span>
                    <span style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>0.225 ({isFr ? 'Optimum Studio' : 'Studio Optimum'})</span>
                    <span>0.50 ({isFr ? 'Défaut Naïf' : 'Default Naive'})</span>
                    <span>0.90 ({isFr ? 'Sous-sensible' : 'Under-sensitive'})</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '0.875rem' }}>
                  <div style={{ background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{isFr ? 'Rappel (Joueurs Sauvés)' : 'Recall (Players Saved)'}</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-orange)' }}>
                      {simMetrics.recallPct}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{simMetrics.tpCount} / 425 churners</div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{isFr ? 'Précision Studio' : 'Studio Precision'}</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ink)' }}>
                      {simMetrics.precisionPct}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{simMetrics.fpCount} {isFr ? 'faux positifs' : 'false positives'}</div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{isFr ? 'Départs Manqués (FN)' : 'Missed Departures (FN)'}</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: simMetrics.fnCount > 150 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                      {simMetrics.fnCount}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{((simMetrics.fnCount / 425) * 100).toFixed(1)}% {isFr ? 'perdus' : 'lost'}</div>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {isFr
                    ? 'Note Game Design : Comme les interventions (alliés calmes, quêtes douces) ne pénalisent pas le joueur, tolérer des faux positifs à θ* = 0.225 est 5× plus rentable que de subir un faux négatif (perte définitive du client).'
                    : 'Game Design Rationale: Since studio interventions (calm teammates, casual nudges) are non-punitive, tolerating false alarms at θ* = 0.225 is 5× more profitable than suffering a false negative (permanent player churn).'}
                </p>
              </div>
            )}

            {/* Widget for Stage 5: Live API Endpoint & Serving Schema */}
            {activeStageId === 5 && (
              <div>
                <div className="widget-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-emerald">FastAPI microservice</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      <code>GET /api/predict/{'{account_id}'}</code>
                    </span>
                  </div>
                  <span className="badge badge-neutral">{isFr ? 'Inférence <50ms' : 'Inference <50ms'}</span>
                </div>
                <pre className="code-snippet-pre">
{`// ${isFr ? 'Exemple de réponse JSON de production (/api/predict/80128751)' : 'Production JSON response example (/api/predict/80128751)'}
{
  "account_id": 80128751,
  "churn_probability": 0.88,
  "risk_level": "CRITICAL",
  "win_expectancy": 0.185,
  "tilt_index": 82.5,
  "features": {
    "win_rate": 0.25,
    "avg_kda": 1.15,
    "souls_per_min": 1610.0,
    "current_streak": -6,
    "tilt_index": 82.5,
    "accuracy_pct": 12.0
  },
  "key_contributing_factors": [
    { "feature": "rage_sell_rate", "impact": 0.32, "direction": "aggravating" },
    { "feature": "tilt_index", "impact": 0.28, "direction": "aggravating" },
    { "feature": "solo_isolation_streak", "impact": 0.21, "direction": "aggravating" }
  ],
  "is_mock": false
}`}
                </pre>
              </div>
            )}
          </div>
        </article>

        {/* 3b. Advanced Time-Series Dynamics & Sequential Modeling Card */}
        <section
          className="glass-card arch-temporal-card"
          style={{
            marginBottom: '2.5rem',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.08), transparent 75%), var(--bg-card)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem 1.75rem'
          }}
          aria-labelledby="arch-temporal-title"
        >
          <h3 id="arch-temporal-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 0.35rem 0' }}>
            {tr('archTemporal.title', isFr ? 'Au-delà du Snapshot : Dynamique Temporelle & Modèles Séquentiels' : 'Beyond the Snapshot: Temporal Dynamics & Sequential Architectures')}
          </h3>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, maxWidth: '850px', margin: '0 0 1.75rem 0' }}>
            <span style={{ color: 'var(--ml-retention)', fontWeight: 600, fontSize: '0.82rem', display: 'block', marginBottom: '0.25rem' }}>
              {tr('archTemporal.badge', isFr ? 'Perspective séries temporelles & R&D' : 'Time-series modeling & R&D roadmap')}
            </span>
            {tr('archTemporal.subtitle', isFr ? "Comment dépasser la prédiction ponctuelle au Match T pour modéliser la vélocité et l'accélération du désengagement." : 'How to move beyond point predictions at Match T toward modeling velocity and acceleration of player disengagement.')}
          </p>

          {/* 3 Pillar Cards for Time-Series Modeling */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.15rem',
              marginBottom: '1.75rem'
            }}
          >
            {/* Pillar 1: Dynamic Survival Analysis */}
            <div
              style={{
                background: 'var(--color-paper-2)',
                border: '1px solid var(--color-rule)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span aria-hidden="true" style={{ color: 'var(--ml-retention)', display: 'inline-flex' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </span>
                <span className="badge badge-neutral" style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>
                  {tr('archTemporal.pillar1Badge', isFr ? 'Analyse de Survie & Risque Instantané' : 'Survival & Hazard')}
                </span>
              </div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
                {tr('archTemporal.pillar1Title', isFr ? '1. Analyse de Survie Dynamique' : '1. Dynamic Time-to-Event Survival')}
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
                {tr('archTemporal.pillar1Desc', isFr ? "Plutôt qu'une décision binaire (churn oui/non à 14 jours), estimer la courbe de survie conditionnelle S(t | H_t) et le taux de risque instantané h(t). Cela permet de quantifier avec précision dans combien de jours la rupture aura lieu pour calibrer l'urgence d'intervention." : 'Rather than a binary decision (churn yes/no at 14 days), continuously estimate the conditional survival curve S(t | H_t) and hazard rate h(t). This quantifies exactly in how many days breakdown will occur to calibrate intervention urgency.')}
              </p>
            </div>

            {/* Pillar 2: Transformers & LSTMs */}
            <div
              style={{
                background: 'var(--color-paper-2)',
                border: '1px solid var(--color-rule)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span aria-hidden="true" style={{ color: 'var(--accent-cyan)', display: 'inline-flex' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="5" r="2.5" />
                    <circle cx="5" cy="18" r="2.5" />
                    <circle cx="19" cy="18" r="2.5" />
                    <line x1="12" y1="7.5" x2="6.2" y2="15.8" />
                    <line x1="12" y1="7.5" x2="17.8" y2="15.8" />
                    <line x1="7.5" y1="18" x2="16.5" y2="18" />
                  </svg>
                </span>
                <span className="badge badge-neutral" style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>
                  {tr('archTemporal.pillar2Badge', isFr ? 'Deep Learning Séquentiel' : 'Sequential Deep Learning')}
                </span>
              </div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
                {tr('archTemporal.pillar2Title', isFr ? '2. Transformers Temporels & LSTM' : '2. Temporal Fusion Transformers & LSTMs')}
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
                {tr('archTemporal.pillar2Desc', isFr ? "Remplacer l'agrégation statique de variables (moyennes glissantes) par des architectures avec attention temporelle (Temporal Fusion Transformers). Le réseau ingère chaque partie séquentiellement, capturant les chocs émotionnels immédiats et la fatigue de fond." : 'Replace static summary aggregation (rolling averages) with temporal attention mechanisms (Temporal Fusion Transformers). The network ingests each match chronologically, capturing both sudden emotional shocks and baseline fatigue.')}
              </p>
            </div>

            {/* Pillar 3: Hawkes Processes */}
            <div
              style={{
                background: 'var(--color-paper-2)',
                border: '1px solid var(--color-rule)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span aria-hidden="true" style={{ color: 'var(--ml-warning)', display: 'inline-flex' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </span>
                <span className="badge badge-neutral" style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>
                  {tr('archTemporal.pillar3Badge', isFr ? 'Processus Auto-Excitants' : 'Self-Exciting Processes')}
                </span>
              </div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
                {tr('archTemporal.pillar3Title', isFr ? '3. Processus Ponctuels (Hawkes)' : '3. Temporal Point Processes (Hawkes)')}
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
                {tr('archTemporal.pillar3Desc', isFr ? "Modéliser les rafales de parties (bursts) et l'effet de contagion des défaites. Une défaite frustrante génère un pic immédiat de risque de ragequit qui décroît exponentiellement dans le temps si le joueur fait une pause salutaire." : 'Model match clustering (bursts) and the contagion dynamics of defeats. A frustrating loss produces an immediate spike in ragequit risk that decays exponentially over time if the player takes a healthy cooldown break.')}
              </p>
            </div>
          </div>

          {/* Mathematical Formula Banner */}
          <div
            style={{
              padding: '1rem 1.25rem',
              background: 'var(--color-paper-inset)',
              border: '1px solid var(--color-rule-strong)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {tr('archTemporal.formulaNote', isFr ? "Formulation mathématique de la fonction de risque instantané intégrant l'amortissement temporel des chocs de tilt :" : 'Mathematical formulation of the instantaneous hazard rate incorporating time-decayed tilt shock responses:')}
            </span>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.88rem',
                color: 'var(--accent-orange)',
                letterSpacing: '0.01em',
                overflowX: 'auto',
                padding: '0.35rem 0'
              }}
            >
              h(t | x(t)) = h₀(t) × exp( βᵀx(t) + Σ αₖ × exp(-δ(t - tₖ)) )
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem 1.25rem', fontSize: '0.76rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--color-rule)', paddingTop: '0.55rem' }}>
              <span>
                <strong style={{ color: 'var(--accent-orange)', fontFamily: 'var(--font-mono)' }}>h₀(t)</strong>{' '}
                {isFr ? ': Risque de base au fil du temps' : ': Baseline hazard over time'}
              </span>
              <span>
                <strong style={{ color: 'var(--accent-orange)', fontFamily: 'var(--font-mono)' }}>αₖ</strong>{' '}
                {isFr ? ': Choc émotionnel provoqué par la défaite k' : ': Emotional shock triggered by defeat k'}
              </span>
              <span>
                <strong style={{ color: 'var(--accent-orange)', fontFamily: 'var(--font-mono)' }}>δ</strong>{' '}
                {isFr ? ': Vitesse d’apaisement pendant une pause' : ': Cooling-off decay rate during a break'}
              </span>
            </div>
          </div>
        </section>
          </div>
        )}
      </div>
    </section>
  );
}
