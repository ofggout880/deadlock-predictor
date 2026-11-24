/**
 * Bilingual Translation Dictionary & Localization Utilities for Deadlock Predictor
 * English (en) and French (fr) with 100% Key Parity
 * Fully sanitized: Zero PII, zero private machine paths
 */

export const translations = {
  fr: {
    // Navigation & Header Shell
    nav: {
      brandTitle: "DEADLOCK PREDICTOR",
      brandSubtitle: "SHOWCASE ML & TÉLÉMÉTRIE",
      brandBadge: "GRADIENT BOOSTING",
      links: {
        hero: "Vue d'ensemble",
        kpis: "Indicateurs Clés",
        psychology: "Psychologie & Aim",
        benchmark: "Benchmark ML",
        simulator: "Archétypes & Recherche",
        items: "Dynamique Héros & Churn",
        architecture: "Architecture",
        dictionary: "Dictionnaire"
      },
      tabs: {
        main: "Principal",
        mainSub: "Étude ML, Psychologie, Benchmark & Simulateur",
        itemsLab: "Dynamique Héros & Churn",
        itemsLabBadge: "NOUVEAU",
        itemsLabSub: "Psychologie des kits punitifs, autopsie des héros & biomécanique",
        itemTab: "Équipements & Achats",
        itemTabBadge: "NOUVEAU",
        itemTabSub: "Chronologie d'achats 0–35 min, 4 erreurs types & catalogue complet",
        heroDesc: "Introduction, enjeux de l'abandon à 14 jours & méthode sans biais calendaire",
        kpisDesc: "8 625 fenêtres, 106 signaux en match (36 opt.) & scores ROC/PR",
        psychologyDesc: "Simulateur d'indice de tilt, visée 3D & caméras de mort",
        benchmarkDesc: "Comparatif des 7 domaines, étude d'ablation, courbes ROC/PR & importance SHAP",
        simulatorDesc: "4 archétypes calibrés & recherche de joueur Steam en direct",
        architectureDesc: "Pipeline du serveur de jeu Valve (Game Coordinator) vers FastAPI & React 19"
      },
      status: {
        online: "API Connectée (En Ligne)",
        offline: "Mode Démo Autonome",
        checking: "Connexion..."
      },
      langToggle: {
        label: "Langue",
        ariaLabel: "Basculer la langue vers l'Anglais"
      },
      linkedin: {
        label: "Profil LinkedIn"
      },
      github: {
        label: "Dépôt GitHub"
      },
      menu: {
        open: "Ouvrir le menu",
        close: "Fermer le menu"
      }
    },

    // Hero Section
    hero: {
      badge: "Rétention Joueur, Psychologie du Tilt & Télémétrie 3D",
      titleMain: "Prédire le Churn & le Tilt dans Deadlock",
      titleHighlight: "par le Machine Learning",
      subtitle: "Étude comportementale et prédiction de l'abandon des joueurs à 14 jours (Churn) sur Deadlock, le jeu de tir tactique 6v6 de Valve. Modélisation des spirales de défaites, de la fatigue nocturne, de la chute de précision au tir 3D et des signaux de frustration directement en cours de partie.",
      ctaExplore: "Explorer l'Étude",
      ctaSimulator: "Simulateur & 4 Archétypes",
      ctaBenchmark: "Benchmark ML & Modèles",
      pillars: {
        churn: {
          title: "Enjeu Économique du Churn à 14 Jours",
          desc: "Dans un jeu compétitif en ligne, 14 jours consécutifs sans connexion marquent le point de rupture où un joueur quitte définitivement le jeu. Détecter cette détresse dès la fin d'un match permet d'agir à chaud pour préserver la fidélité des joueurs et l'équilibre des parties classées."
        },
        tilt: {
          title: "Psychologie du Tilt & Dégradation de Visée 3D",
          desc: "L'abandon dans Deadlock n'est jamais un hasard : il naît d'une accumulation de frustrations en partie (séries de défaites, parties à sens unique, sessions nocturnes épuisantes, chute de précision au tir et fixation sur les ralentis de sa propre mort)."
        },
        intervention: {
          title: "Matchmaking Préventif & Bienveillant",
          desc: "Détecter les spirales de défaite pour suggérer un temps de repos, éviter d'apparier plusieurs joueurs en plein tilt ensemble et préserver l'intégrité compétitive sans tricherie de matchmaking."
        }
      },
      highlights: {
        dataset: "8 625 Fenêtres Source 2",
        recall: "73.2% Rappel (θ* = 0.225)",
        leakage: "100% In-Game Pure (0% fuite)"
      }
    },

    // Executive KPIs
    kpis: {
      sectionTitle: "Indicateurs Clés de l'Étude",
      sectionSubtitle: "Métriques macroscopiques extraites du pipeline Source 2 Deadlock et du modèle champion Machine Learning 100% In-Game Pure.",
      cards: {
        datasetSize: {
          value: "8 625",
          label: "Fenêtres Analysées",
          desc: "8 625 séquences Source 2 enrichies sans biais (1 094 joueurs uniques, 9 811 matchs pivots ; 923 185 matchs bruts)"
        },
        windowSize: {
          value: "20 Matchs",
          label: "Fenêtre d'Observation",
          desc: "Historique glissant (5 derniers matchs vs 15 matchs de référence) avant le match pivot T"
        },
        featuresCount: {
          value: "106",
          label: "Signaux In-Game Purs",
          desc: "106 indicateurs dont les 7 Gemmes Cachées (36 sélectionnés, 0% biais de calendrier)"
        },
        recall: {
          value: "73.2%",
          label: "Rappel Churn (14 Jours)",
          desc: "73,2% des joueurs sur le départ interceptés au seuil θ* = 0.225 (jusqu'à 82,4% au point d'alerte 0.19)"
        },
        prAuc: {
          value: "50.8%",
          label: "PR-AUC Test",
          desc: "Score de précision-rappel sur le jeu de test indépendant (vs 24,8% au hasard)"
        },
        rocAuc: {
          value: "74.7%",
          label: "ROC-AUC In-Game Pure",
          desc: "Capacité de discrimination 100% issue de la télémétrie en match (74,5% hors-échantillon OOF)"
        },
        rocPrAuc: {
          value: "74.7% / 50.8%",
          label: "ROC-AUC / PR-AUC",
          desc: "Pouvoir discriminant et précision-rappel sur partition test indépendante (N = 1 695)"
        }
      }
    },

    // Psychological & Behavioral Features
    psychology: {
      sectionTitle: "Psychologie du Joueur & Télémétrie 3D Shooter",
      sectionSubtitle: "Transformation de la télémétrie in-game brute en signaux précurseurs de détresse compétitive et de tilt.",
      calculatorTitle: "Simulateur Interactif de l'Indice de Tilt",
      calculatorDesc: "Ajustez les variables comportementales pour observer en direct l'impact sur le score de tilt et la recommandation studio.",
      cards: {
        tiltIndex: {
          name: "Indice de Tilt (Tilt Index [0–100])",
          subtitle: "Mesure composite de l'accumulation de frustration et de nervosité",
          formula: "tilt_index = min(100, 12×loss_streak + 40×abandon_rate + 15×night_owl_pct + 33×accuracy_drop)",
          meaning: "Combine les séries de défaites, les abandons en partie, les sessions nocturnes tardives et la chute brutale de précision au tir.",
          impact: "Un score >= 60/100 signale un tilt critique multipliant fortement le risque d'abandon à 14 jours."
        }
      },
      features: {
        tilt_index: "Indice de Tilt Global",
        headshot_ratio: "Ratio de Headshots",
        aim_consistency: "Régularité de Visée 3D",
        watched_death_replays: "Fixation Ralentis de Mort",
        recent_loss_streak: "Série de Défaites Récente",
        night_owl_pct: "Sessions Nocturnes (0h - 6h)"
      }
    },

    // Machine Learning Benchmarks & Explainability
    mlBenchmark: {
      sectionTitle: "Benchmark Machine Learning & Explicabilité",
      sectionSubtitle: "Comparaison rigoureuse des modèles, courbes ROC/PR, matrice de confusion et attribution SHAP.",
      table: {
        title: "Comparatif des Modèles Prédictifs Deadlock",
        headers: {
          model: "Modèle & Pipeline",
          accuracy: "Accuracy",
          precision: "Précision",
          recall: "Rappel",
          f1Score: "F1-Score",
          rocAuc: "ROC-AUC",
          prAuc: "PR-AUC",
          threshold: "Seuil θ*",
          status: "Statut"
        },
        rows: {
          xgbSmote: {
            name: "Gradient Boosting Régularisé (Champion)",
            accuracy: "66.7%",
            precision: "40.8%",
            recall: "73.2%",
            f1Score: "52.4%",
            rocAuc: "74.7%",
            prAuc: "50.8%",
            threshold: "0.225",
            status: "Modèle Champion",
            comment: "Meilleure capture du désengagement à 14 jours via les 36 signaux in-game purs et les 7 Gemmes Cachées."
          },
          deadlockXgb: {
            name: "Gradient Boosting + 7 Gemmes Cachées (Champion)",
            status: "Modèle Champion",
            comment: "Pipeline champion intégrant 36 variables optimales (issues de 106 signaux in-game purs)."
          },
          xgbSpw: {
            name: "HistGradientBoosting + Calibration Sigmoïde",
            accuracy: "68.3%",
            precision: "41.5%",
            recall: "65.2%",
            f1Score: "50.7%",
            rocAuc: "73.3%",
            prAuc: "49.9%",
            threshold: "0.245",
            status: "Alternatif Valide",
            comment: "Calibration probabiliste sigmoïde stricte avec faible erreur de Brier (0.1616)."
          },
          deadlockLightgbm: {
            name: "HistGradientBoosting + In-Fold SMOTE",
            status: "Alternatif Valide",
            comment: "Rééquilibrage synthétique sans fuite de groupe (ROC-AUC 73.3%, PR-AUC 50.0%)."
          },
          rfBaseline: {
            name: "Random Forest (Profondeur Élaguée)",
            accuracy: "60.8%",
            precision: "36.2%",
            recall: "74.4%",
            f1Score: "48.7%",
            rocAuc: "72.1%",
            prAuc: "48.3%",
            threshold: "0.430",
            status: "Baseline Ensembliste",
            comment: "Ensemble d'arbres robuste mais moins discriminant sur l'espace PR-AUC que le Gradient Boosting."
          },
          lrBaseline: {
            name: "Régression Logistique L2 (Linéaire)",
            accuracy: "44.9%",
            precision: "28.5%",
            recall: "79.1%",
            f1Score: "41.8%",
            rocAuc: "63.9%",
            prAuc: "37.6%",
            threshold: "0.415",
            status: "Baseline Linéaire",
            comment: "Modèle linéaire simple incapable de capturer les interactions non linéaires de tilt."
          }
        }
      },
      curves: {
        title: "Courbes ROC et Précision-Rappel"
      },
      rocPrCurve: {
        title: "Courbes ROC et Précision-Rappel",
        subtitle: "Évaluation du compromis sensibilité / spécificité sur les 1 695 fenêtres du jeu de test indépendant."
      },
      threshold: {
        title: "Calibrage Dynamique du Seuil de Décision",
        subtitle: "Optimisation du seuil d'alerte à θ* = 0.225 pour maximiser le rappel tout en maîtrisant les fausses alertes."
      },
      importance: {
        title: "Importance des Variables (Modèle Champion)",
        subtitle: "Poids relatif des 36 variables optimales issues des 106 signaux comportementaux Deadlock."
      },
      featureImportance: {
        title: "Importance des Variables (Modèle Champion)",
        takeaway: "La revente panique d'objets (14,1 %), la fatigue marathon (13,6 %), le rythme de déblocage des sorts (9,8 %), les destructions de Guardians (6,8 %) et l'isolement en solo (6,7 %) dominent la prédiction du décrochage."
      },
      confusion: {
        title: "Matrice de Confusion au Seuil Optimal",
        subtitle: "Répartition des Vrais Positifs, Faux Positifs, Vrais Négatifs et Faux Négatifs."
      },
      confusionMatrix: {
        title: "Matrice de Confusion au Seuil Optimal",
        subtitle: "Répartition des Vrais Positifs, Faux Positifs, Vrais Négatifs et Faux Négatifs sur le jeu de test indépendant (N = 1 695).",
        tp: {
          label: "Vrais Positifs (TP)"
        },
        fn: {
          label: "Faux Négatifs (FN)"
        },
        fp: {
          label: "Faux Positifs (FP)"
        },
        tn: {
          label: "Vrais Négatifs (TN)"
        }
      }
    },

    // Interactive Simulator & Archetypes
    simulator: {
      sectionTitle: "4 Archétypes Calibrés & Match Predictor",
      sectionSubtitle: "Diagnostic prédictif, télémétrie approfondie et explicabilité sur les 4 profils types de Deadlock.",
      query: {
        label: "Interrogation par Account ID Steam / Deadlock (32-bit)",
        placeholder: "Ex: 80128751, 80128752, 80128753, 80128754...",
        btnSubmit: "Analyser le Joueur",
        btnLoading: "Calcul de l'Inférence...",
        clear: "Effacer",
        quickFillLabel: "Suggestions 1-Clic :"
      },
      archetypesTitle: "Sélectionnez un profil pour explorer son diagnostic complet :",
      archetypes: {
        tilting_trooper: {
          name: "Le Fantassin en Tilt Aigu",
          subtitle: "Engagements téméraires, morts en boucle & effondrement de lane",
          riskBadge: "Critique",
          probability: "88.0%",
          rank: "Initiate IV",
          verdict: "Série de 6 défaites consécutives et effondrement des Guardians. Risque critique d'abandon (88%)."
        },
        burned_out_walker: {
          name: "Le Vétéran Épuisé",
          subtitle: "Burst élevé mais retard critique d'âmes & fatigue de session",
          riskBadge: "Modéré",
          probability: "54.0%",
          rank: "Ritualist I",
          verdict: "Déficit de Souls (-1.8k) et 3 défaites d'affilée. Risque modéré nécessitant une pause."
        },
        objective_guardian: {
          name: "Le Gardien des Objectifs",
          subtitle: "Pression constante sur les Guardians & Urnes sécurisées",
          riskBadge: "Faible",
          probability: "18.0%",
          rank: "Archon III",
          verdict: "Pression constante sur les objectifs et 2 Guardians pris. Joueur engagé à faible risque (18%)."
        },
        balanced_carry: {
          name: "Le Joueur Régulier & Serein",
          subtitle: "Avance massive de Souls, précision chirurgicale & sang-froid",
          riskBadge: "Très Faible",
          probability: "14.0%",
          rank: "Eternus II (Haut Rang)",
          verdict: "Excellente précision (38% headshots) et économie dominante (+4.2k Souls). Fidélisation maximale."
        },
        // Legacy aliases
        tilting_player: {
          name: "Le Fantassin en Tilt Aigu",
          subtitle: "Engagements téméraires, morts en boucle & effondrement de lane",
          riskBadge: "Critique",
          probability: "88.0%",
          rank: "Initiate IV",
          verdict: "Série de 6 défaites consécutives et effondrement des Guardians."
        },
        burned_out_veteran: {
          name: "Le Vétéran Épuisé",
          subtitle: "Burst élevé mais retard critique d'âmes & fatigue de session",
          riskBadge: "Modéré",
          probability: "54.0%",
          rank: "Ritualist I",
          verdict: "Déficit de Souls (-1.8k) et 3 défaites d'affilée."
        },
        consistent_support: {
          name: "Le Gardien des Objectifs",
          subtitle: "Pression constante sur les Guardians & Urnes sécurisées",
          riskBadge: "Faible",
          probability: "18.0%",
          rank: "Archon III",
          verdict: "Pression constante sur les objectifs et 2 Guardians pris."
        },
        balanced_player: {
          name: "Le Joueur Régulier & Serein",
          subtitle: "Avance massive de Souls, précision chirurgicale & sang-froid",
          riskBadge: "Très Faible",
          probability: "14.0%",
          rank: "Eternus II (Haut Rang)",
          verdict: "Excellente précision et économie dominante."
        }
      },
      gauge: {
        title: "Probabilité Prédite d'Abandon (Churn à 14 Jours)",
        subtitle: "Estimation en temps réel par le modèle champion Gradient Boosting (100% signaux en match)",
        thresholdMarker: "Seuil d'Alerte θ* = 22.5%",
        optimalLabel: "Seuil Optimal θ* = 0.225",
        needleAriaLabel: "Jauge de probabilité d'abandon du joueur à 14 jours",
        tiers: {
          low: "Faible (< 22.5%)",
          moderate: "Modéré (22.5% - 60%)",
          critical: "Critique (> 60%)"
        },
        status: {
          retained: "Joueur Fidélisé — Engagement Sain",
          watchlist: "Fatigue Latente — Vigilance Recommandée",
          danger: "Risque Critique — Décrochage Imminent"
        },
        actions: {
          low: "Engagement optimal. Aucune intervention requise. Poursuivre le matchmaking standard.",
          moderate: "Vigilance requise. Suggérer une pause ou privilégier des coéquipiers stables aux rôles complémentaires.",
          critical: "Intervention urgente requise. Proposer un cooldown bienveillant et éviter l'appariement avec d'autres joueurs en tilt."
        }
      },
      attribution: {
        title: "Décomposition des Facteurs Décisionnels",
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
      factorAttribution: {
        title: "Décomposition des Facteurs Décisionnels",
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
      telemetry: {
        title: "Indicateurs Télémétriques Clés du Profil",
        rank: "Rang Deadlock",
        winRate: "Win Rate Récent",
        kda: "Ratio KDA",
        gpm: "Souls / Min",
        xpm: "Dégâts / Min",
        sessionDuration: "Durée Moyenne Session",
        currentStreak: "Série Active",
        tiltIndex: "Indice de Tilt",
        recentAbandons: "Abandons Récents",
        nightOwl: "Sessions Nocturnes",
        partyPlay: "Parties en Groupe",
        roleConsistency: "Stabilité de Rôle",
        recentDuration: "Durée Récente",
        wins: "victoires",
        losses: "défaites",
        soloQueue: "100% Solo Queue",
        offlineNotice: "Mode Démo Calibré",
        synthesizedNotice: "Profil synthétisé déterministe (mode hors-ligne)"
      }
    },

    // Temporal Dynamics in Simulator
    simulatorTrajectory: {
      title: "Dynamique Temporelle & Trajectoire",
      subtitle: "Trajectoire de l'écart d'âmes et de précision sur les 20 derniers matchs (5 récents vs 15 baseline).",
      badges: {
        lead: "Avance Dominante (+4.2k Souls)",
        contested: "Match Serré (±1k Souls)",
        deficit: "Retard Critique (-3.9k Souls)"
      }
    },

    // Backend Connectivity & Status
    backendStatus: {
      popover: {
        title: "Statut de l'API & Pipeline Deadlock",
        statusOnline: "Backend FastAPI connecté et opérationnel sur http://127.0.0.1:8000.",
        statusOffline: "Mode Démo Autonome actif. Les données proviennent du jeu d'artefacts haute fidélité mockData.js.",
        onlineDesc: "Backend FastAPI connecté et opérationnel sur http://127.0.0.1:8000.",
        offlineDesc: "Mode Démo Autonome actif. Les données proviennent du jeu d'artefacts haute fidélité mockData.js.",
        portLabel: "Port / Service",
        statusChecking: "Vérification des candidats de connexion en cours...",
        refreshButton: "Rafraîchir la connexion",
        quickstartCmd: "cd backend && uvicorn app.main:app --reload --port 8000"
      }
    },

    // Architecture & Pipeline
    architecture: {
      sectionTitle: "Architecture du Pipeline & Reproductibilité",
      sectionSubtitle: "Pipeline complet depuis le serveur de jeu Valve (Game Coordinator) jusqu'à l'interface vitrine React 19.",
      stages: {
        stage1: {
          title: "Ingestion Deadlock API",
          desc: "Collecte asynchrone des historiques de matchs et métadonnées via api.deadlock-api.com."
        },
        stage2: {
          title: "Ingénierie des 106 Signaux (36 Opt.)",
          desc: "Extraction de la précision au tir 3D, ratio de headshots, deltas de Souls et des 7 Gemmes Cachées."
        },
        stage3: {
          title: "Entraînement Gradient Boosting",
          desc: "Pipeline de classification supervisée sans fuite calendaire avec calibration des probabilités."
        },
        stage4: {
          title: "Calibrage du Seuil & Politiques",
          desc: "Optimisation au seuil θ* = 0.225 pour un compromis idéal entre rappel et fausses alertes."
        },
        stage5: {
          title: "Microservice FastAPI & Showcase",
          desc: "API REST asynchrone avec mise en cache, repli autonome hors-ligne et visualisations interactives."
        }
      },
      quickstart: {
        title: "Démarrage Rapide & Reproductibilité",
        subtitle: "Lancer le projet complet en local en deux commandes.",
        commandInstall: "npm install",
        commandRun: "npm run dev",
        localNotice: "Le serveur de développement répond instantanément sur http://localhost:5173",
        offlineNotice: "Mode démo autonome intégré : l'application fonctionne immédiatement sans dépendance serveur externe."
      }
    },

    // Items & Heroes Churn Analytics
    items: {
      sectionTitle: "Dynamique des Héros & Équipements : Pourquoi les Joueurs Abandonnent",
      sectionSubtitle: "Analyse approfondie des héros à plus fort churn (Yamato, Vindicta, Lash, Seven) : déconstruction des kits punitifs, de la psychologie du tilt et des séquences d'achats désespérées.",
      badge: "DYNAMIQUE DES HÉROS & PSYCHOLOGIE DU CHURN",
      tabs: {
        items: "Achats des Churners (Items)",
        heroes: "Héros & Découragement Mécanique",
        crossAnalysis: "Le Piège Croisé Héros × Items"
      },
      itemFilters: {
        all: "Tous les Items Étudiés",
        tiltTraps: "Pièges de Tilt & Désespoir",
        greedyDps: "Rush Cupide (0 Défense)",
        protectiveSustain: "Soutien & Survie (Rétention)"
      },
      heroFilters: {
        all: "Tous les Héros",
        critical: "Risque Critique (>40% Churn)",
        moderate: "Risque Modéré (30-40% Churn)",
        retention: "Piliers de Rétention (<25% Churn)"
      },
      kpiCards: {
        topChurnItem: {
          label: "Item Churn #1",
          value: "Glass Cannon",
          sub: "48,2 % de churn (acheté 2,2× plus souvent par les décrocheurs, +118,7 %)"
        },
        topRetentionItem: {
          label: "Item Rétention #1",
          value: "Rescue Beam",
          sub: "14,2 % de churn (-72,3 % chez les joueurs qui décrochent)"
        },
        topChurnHero: {
          label: "Héros Churn #1",
          value: "Vindicta",
          sub: "44.8% de churn (4.2 défaites consécutives de moyenne)"
        },
        topRetentionHero: {
          label: "Héros Rétention #1",
          value: "Dynamo",
          sub: "19.2% de churn (Soutien d'équipe & 9.4% d'écran gris)"
        }
      },
      tableHeaders: {
        item: "Objet / Équipement",
        category: "Comportement Associé",
        churnRate: "Taux de Churn",
        churnerBuy: "Achat Churners",
        retainedBuy: "Achat Fidèles",
        overindex: "Sur-indexation",
        insight: "Analyse Comportementale"
      },
      heroHeaders: {
        hero: "Héros",
        role: "Rôle / Style de Jeu",
        churnRate: "Taux de Churn",
        lossStreak: "Défaites d'Affilée Moy.",
        greyScreen: "Temps Écran Gris",
        favoredItems: "Items Favoris en Tilt",
        whyTheyChurn: "Facteur de Découragement"
      },
      crossInsightTitle: "La Spirale Toxique : Héros Fragile + Rush Sans Défense",
      crossInsightDesc: "Les joueurs qui finissent par abandonner s'enferment dans un double piège comportemental : ils sélectionnent des héros fragiles à haute exigence mécanique (Vindicta, Yamato, Lash) et réagissent aux déficits économiques en achetant en priorité des équipements 100 % offensifs (Glass Cannon, Ricochet) sans aucune survie (Vitality). Ils subissent alors un temps d'écran gris élevé (>17 %) et finissent par brader leur inventaire (Revente Panique) avant de déserter le jeu.",
      crossRetentionTitle: "Le Bouclier de la Rétention : Soutien et Cohésion d'Équipe",
      crossRetentionDesc: "À l'inverse, les joueurs fidélisés s'ancrent sur des héros d'impact collectif (Dynamo, Kelvin, McGinnis) et investissent dans des items d'altruisme (Rescue Beam, Restorative Locket, Divine Barrier). Même en cas de défaite, le sentiment d'utilité collective préserve l'engagement émotionnel."
    },

    // Player Search & Autocomplete
    playerSearch: {
      title: "Recherche Joueur & Diagnostic de Tilt",
      subtitle: "Recherchez un joueur par son nom Steam ou son identifiant 32-bit / 64-bit pour inspecter ses statistiques et son risque de churn.",
      placeholder: "Nom de joueur ou Steam ID (ex: TiltedTrooper, 80128751, 878840461)...",
      searchBtn: "Analyser",
      clearBtn: "Effacer",
      suggestionsTitle: "Profils & Joueurs Recommandés :",
      searching: "Analyse du profil en cours...",
      noResults: "Aucun profil trouvé pour cette recherche. Un profil synthétisé réaliste sera généré.",
      archetypeBadge: "ARCHÉTYPE TYPE",
      cohortBadge: "JOUEUR COHORTE RÉELLE",
      customBadge: "ID PERSONNALISÉ"
    },

    // Footer Shell & Compliance
    footer: {
      projectTitle: "DEADLOCK PREDICTOR — Showcase Machine Learning",
      projectTagline: "Plateforme prédictive de Machine Learning & Télémétrie 3D Shooter pour Deadlock.",
      desc: "Étude et vitrine interactive de Machine Learning sur l'économie des Souls, la visée 3D et le tilt dans Deadlock.",
      disclaimer: "Deadlock et le logo Deadlock sont des marques déposées de Valve Corporation. Projet de recherche indépendant sans affiliation officielle avec Valve.",
      disclaimers: {
        valve: "Deadlock et le logo Deadlock sont des marques déposées de Valve Corporation. Ce projet est un travail de recherche indépendant et une vitrine technologique sans lien commercial ni affiliation avec Valve.",
        opendota: "Les données de télémétrie sont extraites via l'API Deadlock (api.deadlock-api.com) conformément à ses conditions d'utilisation.",
        deadlockApi: "Les données de télémétrie sont extraites via l'API Deadlock (api.deadlock-api.com) conformément à ses conditions d'utilisation.",
        ethics: "Engagement Éthique : Matchmaking respectueux de l'équité sportive (probabilité de victoire 50/50). Refus formel de toute manipulation de résultat ou de rétention artificielle prédatrice (anti-EOMM).",
        anonymization: "Sécurité & Confidentialité : Identifiants Steam des joueurs et clés d'API strictement anonymisés et exclus du dépôt public GitHub (aucun secret, aucune donnée personnelle ni chemin machine local ; distinct des liens de portfolio de l'auteur)."
      },
      rights: "Tous droits réservés.",
      license: "Matthieu Gout • Projet personnel 2026",
      links: {
        github: "Dépôt GitHub",
        apiDocs: "Documentation API Deadlock",
        mlAudit: "Revue Algorithmique"
      }
    },

    // Deadlock Ranks
    ranks: {
      unranked: "Non classé",
      Initiate: "Initiate (Initié)",
      Seeker: "Seeker (Chercheur)",
      Alchemist: "Alchemist (Alchimiste)",
      Arcanist: "Arcanist (Arcaniste)",
      Ritualist: "Ritualist (Ritualiste)",
      Emissary: "Emissary (Émissaire)",
      Archon: "Archon (Archonte)",
      Oracle: "Oracle",
      Phantom: "Phantom (Fantôme)",
      Ascendant: "Ascendant",
      Eternus: "Eternus (Éternus)",
      Herald: "Herald",
      Guardian: "Guardian",
      Crusader: "Crusader",
      Legend: "Legend",
      Ancient: "Ancient",
      Divine: "Divine",
      Immortal: "Immortal"
    },

    // Engineered Feature Names
    features: {
      guardian_diff_10m: "Différentiel de Guardians abattus",
      urn_deliveries_team: "Livraisons d'Urne d'Équipe",
      team_avg_headshot_pct: "Précision Headshots moyenne (%)",
      headshot_ratio: "Ratio de Headshots",
      headshot_pct: "Pourcentage de Headshots (%)",
      shots_hit: "Balles Touchées",
      shots_missed: "Balles Manquées",
      accuracy_pct: "Précision de Visée (%)",
      watched_death_replays: "Ralentis de Mort Visionnés",
      tilt_index: "Indice de Tilt",
      recent_loss_streak: "Série de Défaites Récente",
      loss_streak: "Série de Défaites",
      current_streak_at_cutoff: "Série Active",
      flex_slots_unlocked: "Slots Flex Débloqués",
      walker_damage_rate: "Dégâts aux Walkers",
      spirit_damage_share: "Part de Dégâts Spirit",
      spirit_vs_weapon_ratio: "Ratio Spirit / Arme",
      mid_boss_rejuvenator: "Sécurisation du Rejuvenator",
      zipline_transit_time: "Temps de Transit Zipline",
      night_owl_pct: "Part de Sessions Nocturnes",
      party_play_pct: "Parties en Escouade (%)",
      role_consistency: "Stabilité de Rôle",
      ranked_play_pct: "Part de Parties Classées (%)",
      abandon_rate: "Taux d'Abandon Prématuré",
      win_rate: "Taux de Victoire Récent",
      avg_kda: "Ratio KDA Moyen",
      avg_gpm: "Souls Moyennes / Min",
      avg_xpm: "XP / Dégâts / Min",
      session_duration_per_game: "Durée Moyenne de Match",
      avg_hero_damage: "Dégâts Moyens aux Héros",
      avg_tower_damage: "Dégâts aux Bâtiments",
      avg_hero_healing: "Soins Apportés aux Alliés",
      rage_sell_rate: "Taux de Revente Panique (Rage-Sell)",
      ix_session_marathon_fatigue: "Fatigue de Session Marathon",
      ability_unlock_pace: "Rythme de Déblocage des Sorts",
      guardian_kills: "Destructions de Guardians",
      match_T_is_solo: "Partie en Solo (Match Pivot T)",
      ix_ragequit_propensity: "Propension au Ragequit",
      net_worth_end: "Valeur Nette Finale (Souls)",
      melee_kill_rate: "Taux d'Éliminations au Corps-à-Corps",
      solo_isolation_streak: "Série d'Isolement en Solo",
      match_T_stomp_loss: "Défaite Écrasante (Stomp)",
      early_quit_rate: "Taux d'Abandon Précoce",
      stun_headshots_taken_rate: "Tirs à la Tête Subis sous Stun",
      grey_screen_ratio: "Ratio d'Écran Gris (Temps Mort)",
      late_panic_sells: "Reventes Paniques Tardives",
      teammate_support_per_min: "Soutien & Soins aux Alliés / Min",
      parry_miss_per_match: "Parades Manquées par Match",
      unsecured_souls_lost_per_min: "Âmes Instables Perdues / Min"
    },

    // User Feedback & Error Messages
    errors: {
      invalidId: "Format d'Account ID invalide (doit comporter entre 3 et 10 chiffres ou un SteamID64 de 17 chiffres).",
      networkError: "Erreur de communication réseau avec le serveur. Bascule automatique sur les données de démonstration.",
      timeout: "Délai d'attente dépassé lors de la requête API. Utilisation du profil de démonstration calibré."
    },

    // Interactive Dictionary
    dictionary: {
      title: "Dictionnaire des Termes Deadlock & ML",
      subtitle: "Comprendre les termes gaming, visée 3D, psychologie et machine learning en un coup d'œil.",
      searchPlaceholder: "Rechercher un terme (ex: Souls, Urn, Headshots, Tilt, ROC-AUC)...",
      close: "Fermer le lexique",
      noResults: "Aucun terme ne correspond à votre recherche.",
      termCount: "{count} termes répertoriés",
      keyTakeaway: "Impact dans l'étude",
      badgeGaming: "Gaming",
      badgePsychology: "Psychologie",
      badgeMl: "Machine Learning",
      categories: {
        all: "Tous les Termes",
        gaming: "Gaming & Deadlock",
        psychology: "Psychologie & Tilt",
        ml: "Machine Learning & Données"
      }
    },

    // About Deadlock Modal
    aboutModal: {
      eyebrow: "DÉCOUVERTE & OBJECTIF DU PROJET",
      titleLight: "Comprendre",
      titleBold: "Deadlock & l'Objectif de cette Étude",
      lead: "Deadlock est le hero shooter tactique 6v6 de Valve combinant arène de combat multi-voies et visée 3D. Cette étude applique le Machine Learning pour décoder les facteurs économiques, biomécaniques et psychologiques menant à l'abandon du jeu (Churn à 14 jours).",
      triggerNav: "Deadlock & Projet",
      triggerHero: "C'est quoi Deadlock ?",
      triggerBurger: "Nouveau sur Deadlock ? C'est quoi ce projet ?",
      triggerBurgerSub: "Comprendre le jeu, la visée 3D et le rôle de l'IA en 1 minute",
      triggerDrawer: "Nouveau sur Deadlock ?",
      triggerDrawerSub: "Comprendre le jeu, la visée 3D et la valeur métier de l'étude",
      triggerDrawerBtn: "Lire la présentation →",
      triggerToast: "Comprendre Deadlock & la finalité du projet →",
      closeAria: "Fermer la modale"
    },

    // Welcome Toast
    welcomeToast: {
      title: "Bienvenue sur le Showcase Deadlock !",
      message: "Découvrez notre analyse prédictive sur l'économie des Souls, la visée 3D et la détection du tilt. Tous les termes soulignés sont interactifs.",
      cta: "Explorer le Lexique",
      dismiss: "Compris"
    }
  },

  en: {
    // Navigation & Header Shell
    nav: {
      brandTitle: "DEADLOCK PREDICTOR",
      brandSubtitle: "ML & TELEMETRY SHOWCASE",
      brandBadge: "GRADIENT BOOSTING",
      links: {
        hero: "Overview",
        kpis: "Key Metrics",
        psychology: "Psychology & Aim",
        benchmark: "ML Benchmark",
        simulator: "Archetypes & Search",
        items: "Hero Dynamics & Churn",
        architecture: "Architecture",
        dictionary: "Dictionary"
      },
      tabs: {
        main: "Main Study",
        mainSub: "ML Study, Psychology, Benchmark & Simulator",
        itemsLab: "Hero Dynamics & Churn",
        itemsLabBadge: "NEW",
        itemsLabSub: "Punishing Hero Kits, Churn Psychology & Biomechanics",
        itemTab: "Item & Build Telemetry",
        itemTabBadge: "NEW",
        itemTabSub: "0–35m chronological purchase sequences, 4 error schemas & full catalog",
        heroDesc: "Introduction, 14-day churn dynamics & Source 2 methodology",
        kpisDesc: "8,625 Source 2 cohorts, 36 selected pure in-game features & ROC/PR scores",
        psychologyDesc: "Interactive tilt index simulator, 3D aim & death replays",
        benchmarkDesc: "7-domain ablation benchmark, ROC/PR curves & SHAP weights",
        simulatorDesc: "4 calibrated archetypes & live Steam player search",
        architectureDesc: "Valve Game Coordinator ingestion pipeline to FastAPI & React 19"
      },
      status: {
        online: "Live Backend API",
        offline: "Offline Showcase Demo",
        checking: "Connecting..."
      },
      langToggle: {
        label: "Language",
        ariaLabel: "Switch language to French"
      },
      linkedin: {
        label: "LinkedIn Profile"
      },
      github: {
        label: "GitHub Repository"
      },
      menu: {
        open: "Open menu",
        close: "Close menu"
      }
    },

    // Hero Section
    hero: {
      badge: "Player Retention, Tilt Psychology & 3D Telemetry",
      titleMain: "Predicting Player Churn & Tilt in Deadlock",
      titleHighlight: "via Machine Learning",
      subtitle: "Behavioral analytics and 14-day player churn prediction in Valve’s 6v6 hero shooter Deadlock. Modeling how loss spirals, late-night fatigue, 3D aim degradation (headshots), and post-death replay fixation (Valve Game Coordinator telemetry) drive disengagement with zero calendar leakage.",
      ctaExplore: "Explore Study",
      ctaSimulator: "Simulator & 4 Archetypes",
      ctaBenchmark: "ML Models & Benchmark",
      pillars: {
        churn: {
          title: "14-Day Churn Retention Dynamics",
          desc: "In competitive live-service games, 14 consecutive days of inactivity mark the critical threshold of player departure. Detecting disengagement early preserves long-term retention and ranked matchmaking health with zero temporal leakage."
        },
        tilt: {
          title: "Tilt Psychology & 3D Aim Degradation",
          desc: "Churn in Deadlock is rarely random: it stems from compounded competitive friction (loss streaks, one-sided lane stomps, late-night marathon sessions, headshot accuracy collapse, and compulsive post-death replay viewing via Valve Game Coordinator telemetry)."
        },
        intervention: {
          title: "Preventive & Ethical Matchmaking",
          desc: "Detecting loss streaks and fatigue to nudge friendly session cooldowns, avoiding pairing tilted teammates together, and preserving genuine 50/50 competitive integrity without rigging games."
        }
      },
      highlights: {
        dataset: "8,625 Source 2 Windows",
        recall: "73.2% - 81.4% Recall",
        leakage: "100% In-Game Pure (0% leakage)"
      }
    },

    // Executive KPIs
    kpis: {
      sectionTitle: "Key Study Performance Indicators",
      sectionSubtitle: "Macroscopic telemetry extracted from the Valve Source 2 pipeline and the 100% In-Game Pure Machine Learning champion.",
      cards: {
        datasetSize: {
          value: "8,625",
          label: "Analyzed Windows",
          desc: "1,094 unique players across 8,625 Source-2-enriched observation windows (from 923,185 raw matches)"
        },
        windowSize: {
          value: "20 Matches",
          label: "Observation Window",
          desc: "Rolling behavioral window (5 recent vs 15 baseline) prior to pivot match T"
        },
        featuresCount: {
          value: "106 → 36",
          label: "In-Game Pure Features",
          desc: "106 candidate signals (incl. 7 Hidden Gems) distilled to 36 optimal features, zero calendar leakage"
        },
        recall: {
          value: "73.2%",
          label: "14-Day Churn Recall",
          desc: "Capturing 73.2% of departing players at θ* = 0.225 (up to 81.4% MLP / 82.4% at θ = 0.19)"
        },
        prAuc: {
          value: "50.8%",
          label: "PR-AUC Test (50.0% OOF)",
          desc: "Test Precision-Recall AUC (vs 25.1% test positive baseline) with zero calendar leakage"
        },
        rocAuc: {
          value: "74.7%",
          label: "In-Game Pure ROC-AUC",
          desc: "Pure in-game mechanical and emotional discriminative capacity (OOF 74.5%, gap +0.075)"
        },
        rocPrAuc: {
          value: "74.7% / 50.8%",
          label: "ROC-AUC / PR-AUC",
          desc: "Discriminative power and precision-recall on independent holdout partition (N = 1,695)"
        }
      }
    },

    // Psychological & Behavioral Features
    psychology: {
      sectionTitle: "Player Psychology & 3D Shooter Telemetry",
      sectionSubtitle: "Transforming raw in-game telemetry into early biomarkers of competitive distress and mechanical tilt.",
      calculatorTitle: "Interactive Tilt Index Simulator",
      calculatorDesc: "Adjust behavioral sliders to observe real-time impact on tilt index and studio matchmaking actions.",
      cards: {
        tiltIndex: {
          name: "Tilt Index (Acute Frustration Metric)",
          subtitle: "Quantifying frustration accumulation and mechanical degradation on [0–100]",
          formula: "tilt_index = min(100, 12·loss_streak + 40·abandon_rate + 15·night_owl_pct + 33·max(0, (old_acc - rec_acc)/100))",
          meaning: "Composite [0–100] score combining consecutive defeats, early abandons, nocturnal fatigue, and 3D aim accuracy drop.",
          impact: "Exponentially amplifies churn probability: players with tilt_index >= 60 face critical 14-day disengagement."
        }
      },
      features: {
        tilt_index: "Composite Tilt Index",
        headshot_ratio: "Headshot Accuracy Ratio",
        aim_consistency: "3D Aim Consistency",
        watched_death_replays: "Watched Death Replays",
        recent_loss_streak: "Recent Loss Streak",
        night_owl_pct: "Nocturnal Play (Midnight - 6 AM)"
      }
    },

    // Machine Learning Benchmarks & Explainability
    mlBenchmark: {
      sectionTitle: "Machine Learning Benchmarks & Explainability",
      sectionSubtitle: "Rigorous model comparisons, ROC/PR curves, confusion matrix, and SHAP factor attribution.",
      table: {
        title: "Deadlock Predictive Model Benchmark",
        headers: {
          model: "Model & Pipeline",
          accuracy: "Accuracy",
          precision: "Precision",
          recall: "Recall",
          f1Score: "F1-Score",
          rocAuc: "ROC-AUC",
          prAuc: "PR-AUC",
          threshold: "Threshold θ*",
          status: "Status"
        },
        rows: {
          xgbSmote: {
            name: "Gradient Boosting (Depth-3, Champion)",
            accuracy: "66.7%",
            precision: "40.8%",
            recall: "73.2%",
            f1Score: "52.4%",
            rocAuc: "74.7%",
            prAuc: "50.8%",
            threshold: "0.225",
            status: "Production Champion",
            comment: "Highest OOF composite score across 36 pure in-game features including the 7 Source 2 Hidden Gems."
          },
          deadlockXgb: {
            name: "Calibrated HistGradientBoosting",
            status: "Strong Contender",
            comment: "Sigmoid-calibrated histogram boosting across 36 pure in-game signals (73.3% ROC-AUC)."
          },
          xgbSpw: {
            name: "HistGradientBoosting + In-Fold SMOTE",
            accuracy: "65.5%",
            precision: "39.2%",
            recall: "68.0%",
            f1Score: "49.7%",
            rocAuc: "73.3%",
            prAuc: "50.0%",
            threshold: "0.395",
            status: "Robust Alternative",
            comment: "In-fold synthetic minority oversampling avoiding manifold leakage across player groups."
          },
          deadlockLightgbm: {
            name: "Extra Trees (Pruned Depth-7)",
            status: "Fast Ensemble",
            comment: "Pruned randomized trees with 70.7% ROC-AUC and low inference latency."
          },
          rfBaseline: {
            name: "Random Forest (Pruned Depth-6)",
            accuracy: "60.8%",
            precision: "36.2%",
            recall: "74.4%",
            f1Score: "48.7%",
            rocAuc: "72.1%",
            prAuc: "48.3%",
            threshold: "0.430",
            status: "Ensemble Baseline",
            comment: "Depth-pruned random forest baseline on pure in-game telemetry."
          },
          lrBaseline: {
            name: "Logistic Regression (L2 Baseline)",
            accuracy: "44.9%",
            precision: "28.5%",
            recall: "79.1%",
            f1Score: "41.8%",
            rocAuc: "63.9%",
            prAuc: "37.6%",
            threshold: "0.415",
            status: "Linear Baseline",
            comment: "Simple linear model unable to capture non-linear tilt and item-sell interactions."
          }
        }
      },
      curves: {
        title: "ROC and Precision-Recall Curves"
      },
      rocPrCurve: {
        title: "ROC and Precision-Recall Curves",
        subtitle: "Evaluating sensitivity and specificity trade-offs across 1,695 independent test windows."
      },
      threshold: {
        title: "Dynamic Operating Threshold Calibration",
        subtitle: "Fine-tuning alert cutoff (θ* = 0.225) to maximize recall while keeping interventions non-punitive."
      },
      importance: {
        title: "Feature Importance Rankings (Permutation Test)",
        subtitle: "Relative weights of the 36 selected pure in-game Deadlock telemetry signals."
      },
      featureImportance: {
        title: "Feature Importance Rankings (Permutation Test)",
        takeaway: "Late-game inventory rage-selling (14.1%), marathon session fatigue (13.6%), ability unlock pace (9.8%), and solo-queue isolation dominate the model's predictive power—confirming that social and emotional fractures outweigh raw shooting accuracy."
      },
      confusion: {
        title: "Confusion Matrix at Optimal Operating Point",
        subtitle: "Distribution of True Positives, False Positives, True Negatives, and False Negatives."
      },
      confusionMatrix: {
        title: "Confusion Matrix at Optimal Operating Point",
        subtitle: "Distribution of True Positives, False Positives, True Negatives, and False Negatives across Deadlock holdout test cohort (N = 1,695).",
        tp: {
          label: "True Positives (TP)"
        },
        fn: {
          label: "False Negatives (FN)"
        },
        fp: {
          label: "False Positives (FP)"
        },
        tn: {
          label: "True Negatives (TN)"
        }
      }
    },

    // Interactive Simulator & Archetypes
    simulator: {
      sectionTitle: "4 Calibrated Archetypes & 14-Day Churn Predictor",
      sectionSubtitle: "Predictive diagnostics, deep telemetry indicators, and explainability across 4 calibrated Deadlock archetypes.",
      query: {
        label: "Query by Steam / Deadlock Account ID (32-bit)",
        placeholder: "E.g. 80128751, 80128752, 80128753, 80128754...",
        btnSubmit: "Analyze Player",
        btnLoading: "Computing Inference...",
        clear: "Clear",
        quickFillLabel: "1-Click Presets:"
      },
      archetypesTitle: "Select a player archetype to explore full diagnostics:",
      archetypes: {
        tilting_trooper: {
          name: "The Tilting Trooper",
          subtitle: "Reckless dives, death streaks & collapsed lane",
          riskBadge: "Critical",
          probability: "88.0%",
          rank: "Initiate IV",
          verdict: "6 consecutive defeats with collapsed outer Guardians. Critical churn risk (88%)."
        },
        burned_out_walker: {
          name: "The Burned-Out Veteran",
          subtitle: "High burst damage but critical soul deficit & session fatigue",
          riskBadge: "Moderate",
          probability: "54.0%",
          rank: "Ritualist I",
          verdict: "Soul deficit (-1.8k) with 3 losses in a row. Moderate churn risk requiring a rest."
        },
        objective_guardian: {
          name: "The Objective Guardian",
          subtitle: "Consistent Guardian pressure & secure Urn deliveries",
          riskBadge: "Low",
          probability: "18.0%",
          rank: "Archon III",
          verdict: "High objective pressure with 2 Guardians destroyed. Engaged player with low churn risk (18%)."
        },
        balanced_carry: {
          name: "The Balanced Carry",
          subtitle: "Massive soul lead, surgical aim precision & composure",
          riskBadge: "Very Low",
          probability: "14.0%",
          rank: "Eternus II (High Rank)",
          verdict: "Superb headshot accuracy (38%) and dominant soul lead (+4.2k). Peak player retention."
        },
        // Legacy aliases
        tilting_player: {
          name: "The Tilting Trooper",
          subtitle: "Reckless dives, death streaks & collapsed lane",
          riskBadge: "Critical",
          probability: "88.0%",
          rank: "Initiate IV",
          verdict: "6 consecutive defeats with collapsed outer Guardians."
        },
        burned_out_veteran: {
          name: "The Burned-Out Veteran",
          subtitle: "High burst damage but critical soul deficit & session fatigue",
          riskBadge: "Moderate",
          probability: "54.0%",
          rank: "Ritualist I",
          verdict: "Soul deficit (-1.8k) with 3 losses in a row."
        },
        consistent_support: {
          name: "The Objective Guardian",
          subtitle: "Consistent Guardian pressure & secure Urn deliveries",
          riskBadge: "Low",
          probability: "18.0%",
          rank: "Archon III",
          verdict: "High objective pressure with 2 Guardians destroyed."
        },
        balanced_player: {
          name: "The Balanced Carry",
          subtitle: "Massive soul lead, surgical aim precision & composure",
          riskBadge: "Very Low",
          probability: "14.0%",
          rank: "Eternus II (High Rank)",
          verdict: "Superb headshot accuracy and dominant soul lead."
        }
      },
      gauge: {
        title: "Predicted 14-Day Churn Probability",
        subtitle: "Real-time inference computed by the champion Gradient Boosting (Depth-3) model",
        thresholdMarker: "Intervention Threshold θ* = 22.5%",
        optimalLabel: "Optimal Operating Point θ* = 0.225",
        needleAriaLabel: "Predicted 14-day player churn probability gauge",
        tiers: {
          low: "Low (< 22.5%)",
          moderate: "Moderate (22.5% - 60%)",
          critical: "Critical (> 60%)"
        },
        status: {
          retained: "Low Risk — Healthy Player Retention",
          watchlist: "Moderate Risk — Fatigue Watchlist",
          danger: "Critical Risk — Imminent 14-Day Churn"
        },
        actions: {
          low: "Optimal engagement. No intervention needed. Continue standard matchmaking rotations.",
          moderate: "Watchlist monitoring. Suggest a session pause or pair with calm, high-composure teammates.",
          critical: "Urgent intervention needed. Offer friendly cooldown and avoid matching with other tilted players."
        }
      },
      attribution: {
        title: "Attribution of Contributing Decision Factors",
        subtitle: "Relative weight of each telemetry feature on the final 14-day churn prediction.",
        aggravatingHeader: "Aggravating Factors (Increasing Churn Risk)",
        protectiveHeader: "Protective Factors (Reinforcing Player Retention)",
        aggravatingBadge: "Increased Risk",
        protectiveBadge: "Active Protection",
        impactLabel: "Impact",
        neutralText: "Telemetry indicators for this profile are well balanced with no critical anomalies.",
        legend: {
          aggravating: "Aggravating signal (increases 14-day churn likelihood)",
          protective: "Protective signal (reinforces player retention)"
        }
      },
      factorAttribution: {
        title: "Attribution of Contributing Decision Factors",
        subtitle: "Relative weight of each telemetry feature on the final 14-day churn prediction.",
        aggravatingHeader: "Aggravating Factors (Increasing Churn Risk)",
        protectiveHeader: "Protective Factors (Reinforcing Player Retention)",
        aggravatingBadge: "Increased Risk",
        protectiveBadge: "Active Protection",
        impactLabel: "Impact",
        neutralText: "Telemetry indicators for this profile are well balanced with no critical anomalies.",
        legend: {
          aggravating: "Aggravating signal (increases 14-day churn likelihood)",
          protective: "Protective signal (reinforces player retention)"
        }
      },
      telemetry: {
        title: "Key Profile Telemetry Indicators",
        rank: "Deadlock Rank Tier",
        winRate: "Recent Win Rate",
        kda: "KDA Combat Ratio",
        gpm: "Souls / Min",
        xpm: "Damage / Min",
        sessionDuration: "Average Match Duration",
        currentStreak: "Active Streak",
        tiltIndex: "Tilt Index",
        recentAbandons: "Recent Abandons",
        nightOwl: "Late Night Matches",
        partyPlay: "Party Play Ratio",
        roleConsistency: "Role Stability",
        recentDuration: "Recent Duration",
        wins: "wins",
        losses: "losses",
        soloQueue: "100% Solo Queue",
        offlineNotice: "Calibrated Demo Mode",
        synthesizedNotice: "Deterministic synthesized profile (offline mode)"
      }
    },

    // Temporal Dynamics in Simulator
    simulatorTrajectory: {
      title: "Temporal Dynamics & Trajectory",
      subtitle: "Soul delta and aim precision trajectory across the last 10 minutes of gameplay.",
      badges: {
        lead: "Dominant Lead (+4.2k Souls)",
        contested: "Contested Match (±1k Souls)",
        deficit: "Severe Deficit (-3.9k Souls)"
      }
    },

    // Backend Connectivity & Status
    backendStatus: {
      popover: {
        title: "Deadlock API & Pipeline Status",
        statusOnline: "FastAPI backend connected and operating normally on http://127.0.0.1:8000.",
        statusOffline: "Autonomous Demo Mode active. Data served seamlessly from high-fidelity mockData.js.",
        onlineDesc: "FastAPI backend connected and operating normally on http://127.0.0.1:8000.",
        offlineDesc: "Autonomous Demo Mode active. Data served seamlessly from high-fidelity mockData.js.",
        portLabel: "Port / Service",
        statusChecking: "Probing backend connection candidates...",
        refreshButton: "Refresh Connection",
        quickstartCmd: "cd backend && uvicorn app.main:app --reload --port 8000"
      }
    },

    // Architecture & Pipeline
    architecture: {
      sectionTitle: "Pipeline Architecture & Reproducibility",
      sectionSubtitle: "End-to-end telemetry pipeline from Valve Source 2 to the interactive React 19 showcase.",
      stages: {
        stage1: {
          title: "Deadlock API Ingestion",
          desc: "Asynchronous match history and telemetry collection via api.deadlock-api.com."
        },
        stage2: {
          title: "106 → 36 In-Game Feature Engineering",
          desc: "Extracting 3D aim precision, headshot ratios, soul curves, and the 7 Source 2 Hidden Gems."
        },
        stage3: {
          title: "ML Training & Gradient Boosting",
          desc: "Group-aware supervised pipeline calibrated with zero calendar leakage."
        },
        stage4: {
          title: "Threshold & Policy Calibration",
          desc: "Operating point optimization at θ* = 0.225 balancing high recall (73.2%) with non-punitive studio actions."
        },
        stage5: {
          title: "FastAPI Microservice & Showcase",
          desc: "Async REST API with caching, seamless offline fallback, and responsive client visualizations."
        }
      },
      quickstart: {
        title: "Quickstart & Reproducibility",
        subtitle: "Launch the full project locally with just two simple terminal commands.",
        commandInstall: "npm install",
        commandRun: "npm run dev",
        localNotice: "The development server launches immediately at http://localhost:5173",
        offlineNotice: "Autonomous demo mode included: the app functions out of the box with zero external dependencies."
      }
    },

    // Items & Heroes Churn Analytics
    items: {
      sectionTitle: "Hero Dynamics & Equipment: Why Players Quit Deadlock",
      sectionSubtitle: "Deep-dive into the highest churn heroes (Yamato, Vindicta, Lash, Seven): deconstructing punishing kits, tilt psychology, and desperate purchase spirals.",
      badge: "HERO DYNAMICS & CHURN PSYCHOLOGY",
      tabs: {
        items: "Churner Item Purchases",
        heroes: "Hero Mechanical Frustration",
        crossAnalysis: "Hero × Item Churn Trap"
      },
      itemFilters: {
        all: "All Tracked Items",
        tiltTraps: "Tilt Traps & Desperation",
        greedyDps: "Greedy DPS (Zero Defense)",
        protectiveSustain: "Sustain & Teamplay (Retention)"
      },
      heroFilters: {
        all: "All Heroes",
        critical: "Critical Risk (>40% Churn)",
        moderate: "Moderate Risk (30-40% Churn)",
        retention: "Retention Anchors (<25% Churn)"
      },
      kpiCards: {
        topChurnItem: {
          label: "Top Churn Item",
          value: "Spirit Strike & Glass Cannon",
          sub: "49.0% / 48.2% churn rate (bought 2.2x more often by churners, +118.7%)"
        },
        topRetentionItem: {
          label: "Top Retention Item",
          value: "Cultist Sacrifice & Rescue Beam",
          sub: "89.7% retention rate (10.3% churn • safe neutral economy)"
        },
        topChurnHero: {
          label: "Top Churn Hero",
          value: "Yamato, Ivy & Seven",
          sub: "60.0% peak churn (Seven 28.7% incoming headshots)"
        },
        topRetentionHero: {
          label: "Top Retention Hero",
          value: "Abrams, Pocket & Dynamo",
          sub: "81.8% retention rate (18.2% churn • 9.6% incoming headshots)"
        }
      },
      tableHeaders: {
        item: "Item / Upgrade",
        category: "Associated Behavior",
        churnRate: "Churn Rate",
        churnerBuy: "Churner Buy %",
        retainedBuy: "Retained Buy %",
        overindex: "Over-Index",
        insight: "Behavioral Insight"
      },
      heroHeaders: {
        hero: "Hero",
        role: "Role / Playstyle",
        churnRate: "Churn Rate",
        lossStreak: "Avg Loss Streak",
        greyScreen: "Grey Screen Time",
        favoredItems: "Tilt Rush Items",
        whyTheyChurn: "Frustration Driver"
      },
      crossInsightTitle: "The Toxic Spiral: Fragile (Low-HP) Hero + Zero-Defense Rush",
      crossInsightDesc: "Departing players fall into a compounding behavioral trap: they select fragile, low-HP heroes with exacting mechanical requirements (Vindicta, Yamato, Lash) and respond to early deficits by rushing 100% offensive upgrades (skipping green Vitality armor and health items). With zero defensive buffers, they suffer extended grey screen downtime (>17%) and end up panic-selling their inventory before quitting.",
      crossRetentionTitle: "The Retention Shield: Team Altruism & Mutual Sustain",
      crossRetentionDesc: "Conversely, retained players anchor on collective-impact heroes (Dynamo, Kelvin, McGinnis) and invest into squad survivability (Rescue Beam, Restorative Locket, Divine Barrier). Even during lost matches, feeling useful to the squad cushions emotional fatigue."
    },

    // Player Search & Autocomplete
    playerSearch: {
      title: "Player Search & Real-Time Tilt Diagnostic",
      subtitle: "Search by player persona name or Steam ID (32-bit / 64-bit) to inspect in-game statistics, tilt score, and 14-day churn risk.",
      placeholder: "Player name or Steam ID (e.g. TiltedTrooper, 80128751, 878840461)...",
      searchBtn: "Analyze",
      clearBtn: "Clear",
      suggestionsTitle: "Recommended Profiles & Players:",
      searching: "Analyzing player profile...",
      noResults: "No matching player found. A realistic synthesized profile will be generated.",
      archetypeBadge: "ARCHETYPE PRESET",
      cohortBadge: "REAL COHORT PLAYER",
      customBadge: "CUSTOM ID"
    },

    // Footer Shell & Compliance
    footer: {
      projectTitle: "DEADLOCK PREDICTOR — Machine Learning Showcase",
      projectTagline: "Predictive Machine Learning & 3D Shooter Telemetry platform for Deadlock.",
      desc: "Interactive Machine Learning research showcase on Deadlock soul economy, 3D aim mechanics and player tilt.",
      disclaimer: "Deadlock and the Deadlock logo are trademarks of Valve Corporation. Independent research showcase with no official Valve affiliation.",
      disclaimers: {
        valve: "Deadlock and the Deadlock logo are registered trademarks of Valve Corporation. This project is an independent research showcase and portfolio demonstration with no commercial affiliation to Valve.",
        opendota: "Match telemetry is ingested via the Deadlock API (api.deadlock-api.com) in compliance with terms of service.",
        deadlockApi: "Match telemetry is ingested via the Deadlock API (api.deadlock-api.com) in compliance with terms of service.",
        ethics: "Ethical Standard: Matchmaking honoring competitive integrity (50/50 win expectation). Complete rejection of outcome manipulation or predatory retention mechanisms (anti-EOMM).",
        anonymization: "Security & Cohort Privacy: Steam player IDs and API keys are strictly anonymized and excluded from this public GitHub repository (zero secrets, zero personal player data, zero local machine paths; distinct from the portfolio author's attribution links)."
      },
      rights: "All rights reserved.",
      license: "Matthieu Gout • Personal Project 2026",
      links: {
        github: "GitHub Repository",
        apiDocs: "Deadlock API Documentation",
        mlAudit: "Algorithm Review"
      }
    },

    // Deadlock Ranks
    ranks: {
      unranked: "Unranked",
      Initiate: "Initiate",
      Seeker: "Seeker",
      Alchemist: "Alchemist",
      Arcanist: "Arcanist",
      Ritualist: "Ritualist",
      Emissary: "Emissary",
      Archon: "Archon",
      Oracle: "Oracle",
      Phantom: "Phantom",
      Ascendant: "Ascendant",
      Eternus: "Eternus",
      Herald: "Herald",
      Guardian: "Guardian",
      Crusader: "Crusader",
      Legend: "Legend",
      Ancient: "Ancient",
      Divine: "Divine",
      Immortal: "Immortal"
    },

    // Engineered Feature Names
    features: {
      guardian_diff_10m: "Guardian Takedown Advantage",
      urn_deliveries_team: "Team Urn Deliveries",
      team_avg_headshot_pct: "Team Headshot Accuracy (%)",
      headshot_ratio: "Headshot Ratio",
      headshot_pct: "Headshot Percentage (%)",
      shots_hit: "Shots Hit",
      shots_missed: "Shots Missed",
      accuracy_pct: "Crosshair Accuracy (%)",
      watched_death_replays: "Watched Death Replays",
      tilt_index: "Tilt Index",
      recent_loss_streak: "Recent Loss Streak",
      loss_streak: "Loss Streak",
      current_streak_at_cutoff: "Active Streak",
      flex_slots_unlocked: "Flex Slots Unlocked",
      walker_damage_rate: "Walker Siege DPS",
      spirit_damage_share: "Spirit Damage Share",
      spirit_vs_weapon_ratio: "Spirit to Weapon Ratio",
      mid_boss_rejuvenator: "Rejuvenator Objective Secure",
      zipline_transit_time: "Zipline Transit Time",
      night_owl_pct: "Late Night Matches (%)",
      party_play_pct: "Party Matches (%)",
      role_consistency: "Role Consistency",
      ranked_play_pct: "Ranked Queue Ratio (%)",
      abandon_rate: "Early Abandon Rate",
      win_rate: "Recent Win Rate",
      avg_kda: "Average KDA Ratio",
      avg_gpm: "Average Souls / Min",
      avg_xpm: "XP / Damage / Min",
      session_duration_per_game: "Average Match Duration",
      avg_hero_damage: "Average Hero Damage",
      avg_tower_damage: "Structure Damage",
      avg_hero_healing: "Allied Healing Provided",
      rage_sell_rate: "Late Inventory Rage-Sell Rate",
      ix_session_marathon_fatigue: "Marathon Session Fatigue Index",
      ability_unlock_pace: "Ability Unlock Pace",
      guardian_kills: "Outer Guardians Destroyed",
      match_T_is_solo: "Pivot Match Solo Queue",
      ix_ragequit_propensity: "Acute Ragequit Propensity",
      net_worth_end: "Final Match Net Worth (Souls)",
      melee_kill_rate: "Melee Kill Rate",
      solo_isolation_streak: "Solo Isolation Streak",
      match_T_stomp_loss: "Pivot Match Heavy Stomp Loss",
      early_quit_rate: "Early Match Abandon Rate",
      stun_headshots_taken_rate: "Stun Headshots Taken Rate",
      grey_screen_ratio: "Grey Screen Ratio (Time Dead)",
      late_panic_sells: "Late-Game Panic Sells",
      teammate_support_per_min: "Teammate Support / min",
      parry_miss_per_match: "Missed Parries / Match",
      unsecured_souls_lost_per_min: "Unsecured Souls Lost / min"
    },

    // User Feedback & Error Messages
    errors: {
      invalidId: "Invalid Account ID format (must be 3-10 digits or a 17-digit SteamID64).",
      networkError: "Network connection error with backend. Seamlessly switched to offline demo mode.",
      timeout: "Request timeout reached. Serving calibrated offline demo profile."
    },

    // Interactive Dictionary
    dictionary: {
      title: "Deadlock & ML Terms Dictionary",
      subtitle: "Understand gameplay, 3D shooter aim, psychological, and machine learning terms at a glance.",
      searchPlaceholder: "Search for a term (e.g. Souls, Urn, Headshots, Tilt, ROC-AUC)...",
      close: "Close glossary",
      noResults: "No terms match your search criteria.",
      termCount: "{count} terms indexed",
      keyTakeaway: "Key Takeaway",
      badgeGaming: "Gaming",
      badgePsychology: "Psychology",
      badgeMl: "Machine Learning",
      categories: {
        all: "All Terms",
        gaming: "Gaming & Deadlock",
        psychology: "Psychology & Tilt",
        ml: "Machine Learning & Data"
      }
    },

    // About Deadlock Modal
    aboutModal: {
      eyebrow: "DISCOVERY & PROJECT OBJECTIVE",
      titleLight: "Understanding",
      titleBold: "Deadlock & the Purpose of this Study",
      lead: "Deadlock is Valve's tactical 6v6 hero shooter merging multi-lane map strategy with 3D shooter precision. This study employs Machine Learning to decode the economic, mechanical, and psychological triggers driving victory or churn.",
      triggerNav: "Deadlock & Project",
      triggerHero: "What is Deadlock?",
      triggerBurger: "New to Deadlock? What is this project?",
      triggerBurgerSub: "Understand the game, 3D gunplay, and AI's role in 1 minute",
      triggerDrawer: "New to Deadlock?",
      triggerDrawerSub: "Understand the game mechanics, 3D aim, and business impact",
      triggerDrawerBtn: "Read overview →",
      triggerToast: "Understand Deadlock & project goals →",
      closeAria: "Close modal"
    },

    // Welcome Toast
    welcomeToast: {
      title: "Welcome to the Deadlock Showcase!",
      message: "Discover our predictive analysis on soul economy, 3D aim precision, and tilt detection. All underlined terms are interactive.",
      cta: "Explore Glossary",
      dismiss: "Got It"
    }
  }
};

/**
 * Universal translation resolver function
 */
export function t(path, lang = 'fr', params = null) {
  if (typeof path !== 'string') return '';
  if (!path) return '';
  const currentLang = (lang === 'fr' || lang === 'en') ? lang : 'fr';
  const fallbackLang = currentLang === 'fr' ? 'en' : 'fr';

  const resolve = (dictionary) => {
    if (!dictionary || typeof dictionary !== 'object') return undefined;
    const parts = path.split('.');
    let curr = dictionary;
    for (const part of parts) {
      if (curr == null || typeof curr !== 'object') return undefined;
      if (!Object.prototype.hasOwnProperty.call(curr, part)) return undefined;
      curr = curr[part];
    }
    if (typeof curr === 'function') return undefined;
    return curr;
  };

  let val = resolve(translations[currentLang]);
  if (val === undefined) {
    val = resolve(translations[fallbackLang]);
  }
  if (val === undefined) {
    return path;
  }

  if (typeof val === 'string' && params && typeof params === 'object' && Object.keys(params).length > 0) {
    return val.replace(/\{(\w+)\}/g, (match, paramName) => {
      return params[paramName] !== undefined ? String(params[paramName]) : match;
    });
  }

  return val;
}

/**
 * Translates an engineered feature key (e.g. 'rage_sell_rate')
 */
export function translateFeature(featureKey, lang = 'fr') {
  if (featureKey === undefined || featureKey === null) return '';
  const activeLang = (lang === 'fr' || lang === 'en') ? lang : 'fr';
  const dict = translations[activeLang]?.features;
  const fallbackDict = translations.en?.features;

  if (dict && Object.prototype.hasOwnProperty.call(dict, featureKey) && typeof dict[featureKey] === 'string') {
    return dict[featureKey];
  }
  if (fallbackDict && Object.prototype.hasOwnProperty.call(fallbackDict, featureKey) && typeof fallbackDict[featureKey] === 'string') {
    return fallbackDict[featureKey];
  }
  return String(featureKey);
}

/**
 * Translates a Deadlock Rank Tier
 */
export function translateRank(rankTier, lang = 'fr') {
  if (!rankTier) return t('ranks.unranked', lang);
  if (typeof rankTier === 'string') return rankTier;

  const deadlockRanks = ['Initiate', 'Seeker', 'Alchemist', 'Arcanist', 'Ritualist', 'Emissary', 'Archon', 'Oracle', 'Phantom', 'Ascendant', 'Eternus'];
  const rankIndex = Math.floor(rankTier / 10) - 1;
  const stars = rankTier % 10;

  if (rankIndex >= 0 && rankIndex < deadlockRanks.length) {
    const key = deadlockRanks[rankIndex];
    const name = t(`ranks.${key}`, lang) || key;
    return `${name} ${stars > 0 ? stars : ''}`.trim();
  }
  return t('ranks.unranked', lang);
}

/**
 * Returns localized risk badge based on probability
 */
export function translateRiskLevel(probability, lang = 'fr') {
  if (probability >= 0.60) {
    return {
      level: 'critical',
      label: t('simulator.gauge.tiers.critical', lang),
      status: t('simulator.gauge.status.danger', lang),
      color: 'var(--accent-rose, #ef4444)'
    };
  }
  if (probability >= 0.225) {
    return {
      level: 'moderate',
      label: t('simulator.gauge.tiers.moderate', lang),
      status: t('simulator.gauge.status.watchlist', lang),
      color: 'var(--accent-amber, #d8ec57)'
    };
  }
  return {
    level: 'low',
    label: t('simulator.gauge.tiers.low', lang),
    status: t('simulator.gauge.status.retained', lang),
    color: 'var(--accent-chem-green, #10b981)'
  };
}
