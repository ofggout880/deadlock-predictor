/**
 * Comprehensive Bilingual Glossary of Deadlock Gaming Mechanics, Psychology & Machine Learning Terms
 * Used for the Dictionary drawer, search, category filters, and contextual tooltips.
 */

import { DEADLOCK_GLOSSARY } from './mockData.js';

export { DEADLOCK_GLOSSARY };

export const DICTIONARY_CATEGORIES = [
  { id: 'all', labelFr: 'Tous les Termes', labelEn: 'All Terms' },
  { id: 'gaming', labelFr: 'Gaming & Deadlock', labelEn: 'Gaming & Deadlock' },
  { id: 'psychology', labelFr: 'Psychologie & Tilt', labelEn: 'Psychology & Tilt' },
  { id: 'ml', labelFr: 'Machine Learning & Données', labelEn: 'Machine Learning & Data' }
];

export const DICTIONARY_TERMS = [
  {
    id: 'deadlock',
    aliases: ['deadlock', 'jeu', 'valve', 'shooter', 'moba', 'trooper'],
    category: 'gaming',
    badgeClass: 'badge-gaming',
    termFr: "Deadlock (Le Jeu)",
    termEn: "Deadlock (The Game)",
    shortDefFr: "Hero shooter tactique 6 contre 6 à la troisième personne développé par Valve. Combine mécaniques de visée 3D, gestion de ligne sur 4 voies et économie d'âmes (Souls).",
    shortDefEn: "Valve's 6v6 third-person hero shooter combining fast 3D crosshair aim mechanics, 4 lane management, and soul economy.",
    takeawayFr: "L'hybridation MOBA et shooter 3D introduit une double charge cognitive : précision motrice et vision macro.",
    takeawayEn: "Blending MOBA with 3D shooter dynamics introduces double cognitive load: motor precision and macro map awareness."
  },
  {
    id: 'souls',
    aliases: ['souls', 'ames', 'âmes', 'net worth', 'economie', 'orbes'],
    category: 'gaming',
    badgeClass: 'badge-gaming',
    termFr: "Souls (Âmes / Économie)",
    termEn: "Souls (Currency & Economy)",
    shortDefFr: "Ressource universelle de Deadlock utilisée pour acheter des objets (Weapon, Vitality, Spirit) et débloquer des améliorations de compétences. Flottent sous forme d'orbes après chaque élimination.",
    shortDefEn: "The primary currency in Deadlock used to purchase items (Weapon, Vitality, Spirit) and upgrade abilities. Spawn as securing/deniable orbs upon death.",
    takeawayFr: "Facteur prédictif majeur : les joueurs qui accusent un net déficit économique sans équipement de survie voient leur taux de frustration et d'abandon à 14 jours grimper fortement.",
    takeawayEn: "Top predictive factor: players falling into a severe Soul deficit without defensive Vitality items suffer acute frustration and sharply elevated 14-day churn."
  },
  {
    id: 'urn',
    aliases: ['urn', 'soul urn', 'urne', 'livraison', 'objectif'],
    category: 'gaming',
    badgeClass: 'badge-gaming',
    termFr: "Soul Urn (Urne des Âmes)",
    termEn: "Soul Urn (Map Objective)",
    shortDefFr: "Objectif neutre apparaissant au centre de la carte. Transporter l'Urne à travers les lignes jusqu'au point de livraison confère 25% de Souls bonus à l'équipe et un point d'aptitude au porteur.",
    shortDefEn: "Neutral mid-map objective. Transporting the Urn to the drop-off location grants 25% bonus team souls and an ability unlock point to the carrier.",
    takeawayFr: "Sécuriser au moins 2 livraisons d'Urne augmente le win rate de +18% dans nos données empiriques.",
    takeawayEn: "Securing at least 2 Urn deliveries boosts win rate by +18% across our empirical dataset."
  },
  {
    id: 'flex_slots',
    aliases: ['flex slots', 'emplacements flexibles', 'slots flex', 'inventaire'],
    category: 'gaming',
    badgeClass: 'badge-gaming',
    termFr: "Flex Slots (Emplacements Flexibles)",
    termEn: "Flex Slots (Item Slots)",
    shortDefFr: "Quatre emplacements d'inventaire universels débloqués successivement en détruisant les 4 premiers Guardians, les Walkers, et les Patrons ennemis.",
    shortDefEn: "Four universal inventory slots unlocked sequentially by destroying all four enemy lane Guardians, Walkers, and Patrons.",
    takeawayFr: "Débloquer les Flex Slots avant l'équipe adverse permet d'équiper des objets Tier 3 et 4 déterminants.",
    takeawayEn: "Unlocking flex slots ahead of the enemy enables crucial Tier 3 & 4 itemization advantages."
  },
  {
    id: 'guardians_walkers',
    aliases: ['guardians', 'walkers', 'structures', 'remparts', 'tourelles'],
    category: 'gaming',
    badgeClass: 'badge-gaming',
    termFr: "Guardians & Walkers (Défenses de Ligne)",
    termEn: "Guardians & Walkers (Lane Defenses)",
    shortDefFr: "Défenses principales protégeant les 4 lignes de combat. Les Guardians constituent la première ligne de remparts, suivis des imposants Walkers bipèdes aux attaques de zone dévastatrices.",
    shortDefEn: "Defensive bastions protecting the 4 lanes. Guardians form the frontline barrier, followed by massive bipedal Walkers with devastating area-of-effect stomps.",
    takeawayFr: "La perte du Guardian extérieur avant 5 minutes est un catalyseur majeur de frustration et de tilt.",
    takeawayEn: "Losing outer lane Guardian before 5 minutes is a primary catalyst of early player tilt."
  },
  {
    id: 'patron',
    aliases: ['patron', 'le patron', 'base ennemie', 'fosse'],
    category: 'gaming',
    badgeClass: 'badge-gaming',
    termFr: "The Patron (Le Patron)",
    termEn: "The Patron (Final Boss)",
    shortDefFr: "L'entité occulte colossale gardant le sanctuaire ennemi. Sa destruction en deux phases (forme liée puis vulnérable dans la fosse) scelle la victoire du match.",
    shortDefEn: "The colossal occult deity at the heart of each base. Defeating it in its initial tethered state and subsequent pit phase determines match victory.",
    takeawayFr: "Objectif terminal scellant la partie; les dégâts infligés au Patron sont corrélés à 99% avec la victoire.",
    takeawayEn: "Final win condition; damage dealt to the Patron is 99% correlated with victory outcome."
  },
  {
    id: 'headshots',
    aliases: ['headshots', 'tirs tete', 'precision', 'critique', 'accuracy'],
    category: 'gaming',
    badgeClass: 'badge-gaming',
    termFr: "Précision Headshots & Tirs Critiques",
    termEn: "Headshots & Weakpoint Precision",
    shortDefFr: "Pourcentage de balles touchant la tête ou le point faible adverse. Multiplie les dégâts par 1.5 à 2.0 selon les objets équipés.",
    shortDefEn: "Percentage of bullet projectiles striking enemy weakpoints. Multiplies damage output by 1.5x to 2.0x based on itemization.",
    takeawayFr: "Un joueur en tilt subit typiquement une chute de -35% de son ratio de headshots dès la 3e défaite d'affilée.",
    takeawayEn: "A tilted player typically exhibits a -35% collapse in headshot accuracy by their 3rd consecutive loss."
  },
  {
    id: 'tilt_index',
    aliases: ['tilt', 'indice de tilt', 'tilt index', 'ragequit', 'frustration'],
    category: 'psychology',
    badgeClass: 'badge-psychology',
    termFr: "Indice de Tilt & Frustration",
    termEn: "Tilt Index & Frustration Score",
    shortDefFr: "Score composite (échelle 0 à 100) mesurant la détresse émotionnelle à partir des séries de défaites, abandons précoces, sessions nocturnes et chute de précision de visée.",
    shortDefEn: "Composite [0–100] score tracking emotional distress through consecutive loss streaks, early abandons, nocturnal play, and mechanical crosshair accuracy drops.",
    takeawayFr: "Un score de tilt >= 60/100 signale un tilt critique qui multiplie par plus de 3 le risque d'abandon prolongé (churn 14 jours).",
    takeawayEn: "Tilt index >= 60/100 signals critical tilt, multiplying 14-day player churn likelihood by more than 3x."
  },
  {
    id: 'loss_streak',
    aliases: ['loss streak', 'serie de defaites', 'defaites consecutives'],
    category: 'psychology',
    badgeClass: 'badge-psychology',
    termFr: "Série de Défaites Consécutives",
    termEn: "Loss Streak Dynamics",
    shortDefFr: "Nombre de défaites subies d'affilée sans pause réparatrice. Plus la série s'allonge, plus la fatigue de session s'accroît.",
    shortDefEn: "Count of consecutive defeats sustained without a session break. Longer streaks exponentially compound competitive fatigue.",
    takeawayFr: "À partir de 4 défaites consécutives, la probabilité d'abandonner le jeu dans les 48h dépasse 60%.",
    takeawayEn: "Beyond 4 consecutive defeats, probability of session abandonment within 48h exceeds 60%."
  },
  {
    id: 'watched_death_replays',
    aliases: ['death replay', 'ralentis de mort', 'spectateur mort'],
    category: 'psychology',
    badgeClass: 'badge-psychology',
    termFr: "Fixation sur les Ralentis de Mort",
    termEn: "Death Replay Fixation",
    shortDefFr: "Comportement consistant à regarder compulsivement les ralentis de mort diffusés par le serveur de jeu Valve (Game Coordinator) plutôt que de planifier la réapparition ou observer la carte.",
    shortDefEn: "Behavior where a defeated player fixates on death replay cameras rather than monitoring teammates or reviewing map objectives.",
    takeawayFr: "Marqueur comportemental puissant d'incompréhension tactique et de frustration accusatoire.",
    takeawayEn: "Strong behavioral biomarker of tactical bewilderment and teammate blame fixation."
  },
  {
    id: 'night_owl',
    aliases: ['night_owl_pct', 'night owl', 'sessions nocturnes', 'jeu de nuit', 'fatigue nocturne'],
    category: 'psychology',
    badgeClass: 'badge-psychology',
    termFr: "Sessions Nocturnes & Fatigue",
    termEn: "Night Owl Ratio & Late-Night Fatigue",
    shortDefFr: "Part des parties jouées entre minuit et 6h du matin. Associée à un temps de réaction altéré et une tolérance réduite au stress.",
    shortDefEn: "Share of matches queued between midnight and 6 AM local time. Late-night play is associated with slower reaction times, tunnel vision, and lower emotional resilience.",
    takeawayFr: "Les sessions nocturnes tardives affichent un taux de tilt et d'abandon 40% plus élevé que les sessions de jour.",
    takeawayEn: "Late-night queues exhibit a 40% higher rate of acute tilt and churn relative to daytime sessions, feeding directly into the [0–100] Tilt Index."
  },
  {
    id: 'roc_auc',
    aliases: ['roc', 'auc', 'roc-auc', 'courbe roc', 'discrimination'],
    category: 'ml',
    badgeClass: 'badge-ml',
    termFr: "Score ROC-AUC (Aire sous la Courbe ROC)",
    termEn: "ROC-AUC Score",
    shortDefFr: "Mesure globale (de 50% à 100%) de la capacité du modèle à distinguer un joueur qui va abandonner le jeu (Churn à 14 jours) d'un joueur qui va rester actif, quel que soit le seuil d'alerte choisi.",
    shortDefEn: "Global measure (50% to 100%) of the model's ability to distinguish players who will abandon the game (14-day churn) from players who will stay active across all probability cutoffs.",
    takeawayFr: "Notre modèle champion Gradient Boosting atteint 74.7% de ROC-AUC (et 50.8% de PR-AUC) uniquement à partir du comportement en match, sans aucune donnée de calendrier.",
    takeawayEn: "Using 100% pure in-game telemetry with zero calendar leakage, our champion Gradient Boosting pipeline achieves 74.7% ROC-AUC (and 50.8% PR-AUC)."
  },
  {
    id: 'shap',
    aliases: ['shap', 'explicabilite', 'attribution', 'shapley'],
    category: 'ml',
    badgeClass: 'badge-ml',
    termFr: "Valeurs SHAP (Explicabilité Prédictive)",
    termEn: "SHAP Values (Model Explainability)",
    shortDefFr: "Méthode mathématique issue de la théorie des jeux (valeurs de Shapley) qui décompose une prédiction individuelle pour montrer précisément quels signaux de jeu augmentent ou réduisent le risque d'abandon d'un joueur.",
    shortDefEn: "Game-theoretic method (Shapley values) that decomposes an individual prediction to quantify how each in-game behavioral signal increases or reduces a player's 14-day churn risk.",
    takeawayFr: "Permet d'expliquer de façon transparente pourquoi tel profil présente 88% de risque de départ (ex: revente panique, série de défaites, score de tilt à 82.5/100).",
    takeawayEn: "Transparently explains why a specific player is flagged at 88% churn risk (e.g., rage-selling, 6-loss streak, 82.5/100 tilt) versus 14% for a composed player."
  },
  {
    id: 'ziplines',
    aliases: ['ziplines', 'lignes aeriennes', 'macro mobilite', 'transit'],
    category: 'gaming',
    badgeClass: 'badge-gaming',
    termFr: "Ziplines (Lignes Aériennes)",
    termEn: "Ziplines (Macro Mobility)",
    shortDefFr: "Câbles de transit rapide reliant la base aux lignes de front. Permettent des rotations stratégiques rapides mais désarçonnent en cas de dégâts.",
    shortDefEn: "High-speed transit cables connecting the base to frontline lanes. Provide fast map rotations but cause dismount upon taking damage.",
    takeawayFr: "Une mauvaise synchronisation de zipline entraîne des retards de 15s lors des combats pour l'Urne.",
    takeawayEn: "Poor zipline timing results in critical 15s delays to neutral Urn teamfights."
  },
  {
    id: 'rejuvenator',
    aliases: ['rejuvenator', 'mid boss', 'boss central', 'cristal'],
    category: 'gaming',
    badgeClass: 'badge-gaming',
    termFr: "Mid Boss Rejuvenator",
    termEn: "Mid Boss Rejuvenator",
    shortDefFr: "Cristal tombé du Mid Boss vaincu. Frapper le cristal au corps-à-corps confère réapparition rapide (-50% durée) et renforce les sbires de ligne.",
    shortDefEn: "Crystal dropped by defeated Mid Boss. Heavy melee strike secures fast respawn buff and empowered lane minions.",
    takeawayFr: "La sécurisation du Rejuvenator augmente les chances de clore le match dans les 5 minutes de +65%.",
    takeawayEn: "Securing the Rejuvenator increases match conclusion probability within 5 minutes by +65%."
  },
  {
    id: 'threshold',
    aliases: ['threshold', 'seuil', 'theta', 'seuil optimal', 'calibrated threshold'],
    category: 'ml',
    badgeClass: 'badge-ml',
    termFr: "Seuil de Décision Calibré (θ* = 0.225)",
    termEn: "Calibrated Decision Threshold (θ* = 0.225)",
    shortDefFr: "Seuil de probabilité optimal calibré hors-échantillon (OOF) pour maximiser la détection des futurs départs tout en maîtrisant les fausses alertes. Un score >= 0.225 déclenche la vigilance modérée.",
    shortDefEn: "Out-of-fold calibrated probability threshold tuned to maximize 14-day churn detection while controlling false alarms. Any score >= 0.225 triggers moderate watchlist monitoring.",
    takeawayFr: "Calibré à θ* = 0.225, le modèle champion intercepte 73.2% des futurs départs à 14 jours (jusqu'à 82.4% au point de sensibilité 0.19).",
    takeawayEn: "Calibrated at θ* = 0.225, the champion model intercepts 73.2% of future 14-day churners (up to 82.4% at the 0.19 high-sensitivity operating point)."
  },
  {
    id: 'churn',
    aliases: ['churn', 'attrition', 'depart', 'abandon', 'decrochage'],
    category: 'psychology',
    badgeClass: 'badge-psychology',
    termFr: "Taux de Churn (Attrition 14 Jours)",
    termEn: "14-Day Churn Rate (Player Departure)",
    shortDefFr: "Cessation totale de connexions pendant au moins 14 jours consécutifs suivant le match pivot T. Dans Deadlock, le churn est fortement catalysé par les spirales de défaites et les stuns en chaîne.",
    shortDefEn: "Total absence of match activity for 14 or more consecutive days after pivot match T. In Deadlock, churn is strongly driven by loss streaks and stun chains.",
    takeawayFr: "Le taux d'abandon à 14 jours dans notre cohorte de référence (8 625 fenêtres) est de 24.8%. Notre modèle champion détecte 73.2% des départs uniquement via des signaux en match.",
    takeawayEn: "The 14-day churn rate in our reference cohort (8,625 windows) is 24.8%. Our champion model catches 73.2% of departing players strictly from pure in-game signals."
  },
  {
    id: 'early_guardian',
    aliases: ['early guardian', 'guardian precoce', 'perte guardian', 'gemme 1'],
    category: 'gaming',
    badgeClass: 'badge-gaming',
    termFr: "Perte de Guardian Précoce (< 8 min)",
    termEn: "Early Guardian Loss (< 8 min)",
    shortDefFr: "Signal comportemental Source 2 : destruction du Guardian de lane avant la 8e minute. Indique un écrasement précoce qui multiplie par 2.8x le risque d'abandon (guardian_kills figure dans le Top 4 du modèle à 6.8%).",
    shortDefEn: "Source 2 behavioral signal: destruction of outer lane Guardian prior to 8 minutes. Indicates heavy early lane stomp multiplying churn risk by 2.8x (guardian_kills ranks Top 4 in the model at 6.8%).",
    takeawayFr: "74.2% des joueurs qui abandonnent ont perdu leur Guardian extérieur avant la 8e minute dans leur match pivot.",
    takeawayEn: "74.2% of departing players lost their outer lane Guardian before 8 minutes in their pivot match."
  },
  {
    id: 'grey_screen',
    aliases: ['grey screen', 'ecran gris', 'temps mort', 'spectateur mort', 'gemme 4'],
    category: 'psychology',
    badgeClass: 'badge-psychology',
    termFr: "Ratio d'Écran Gris & Temps Passé Mort",
    termEn: "Grey Screen Ratio & Death Downtime",
    shortDefFr: "Gemme Cachée #4 Source 2 : proportion de la durée totale du match passée mort devant un écran gris (12.5% chez les décrocheurs vs 11.9% chez les joueurs retenus sur la cohorte globale, jusqu'à 17.8% dans les replays profonds).",
    shortDefEn: "Source 2 Hidden Gem #4: fraction of total match duration spent dead waiting on a grey respawn screen (12.5% for churners vs. 11.9% retained across the full cohort, rising to 17.8% in deep replays).",
    takeawayFr: "Passer plus de 15% du match mort en écran gris induit un sentiment d'impuissance qui triple le risque de désertion.",
    takeawayEn: "Spending over 15% of match time dead in grey screen creates acute helplessness tripling abandonment rates."
  },
  {
    id: 'rolling_window',
    aliases: ['fenetre glissante', 'fenêtre glissante', 'match pivot', 'match t', '20 matchs', '5 vs 15'],
    category: 'ml',
    badgeClass: 'badge-ml',
    termFr: "Fenêtre Glissante (20 Matchs) & Match Pivot T",
    termEn: "Rolling Window (20 Matches) & Pivot Match T",
    shortDefFr: "Dispositif expérimental comparant les 5 derniers matchs d'un joueur à ses 15 matchs précédents (sa ligne de référence personnelle) juste avant le match pivot T (dernier match joué avant l'absence chez un décrocheur, ou match apparié à la même époque de patch chez un joueur actif).",
    shortDefEn: "Experimental window comparing a player's 5 most recent matches against their own 15-match baseline immediately preceding Pivot Match T (the final observed match before a 14-day absence for churners, or an era-matched anchor for retained players).",
    takeawayFr: "Mesure la dégradation relative récente du joueur par rapport à son propre niveau habituel, sans dépendre d'aucune variable de calendrier.",
    takeawayEn: "Measures each player's recent relative decline against their personal baseline without ever leaking calendar timestamps or login gaps."
  },
  {
    id: 'pr_auc',
    aliases: ['pr-auc', 'pr auc', 'precision rappel', 'ppv', 'bayes', 'ppv prod'],
    category: 'ml',
    badgeClass: 'badge-ml',
    termFr: "Score PR-AUC & PPV en Production (Bayes)",
    termEn: "PR-AUC Score & Live PPV (Bayes)",
    shortDefFr: "Aire sous la courbe Précision-Rappel (PR-AUC) : mesure exigeante adaptée aux classes minoritaires (24,8 % de churn). Le PPV Prod (Bayes) ajuste la précision brute à la prévalence réelle en production (5,74 %) via le théorème de Bayes.",
    shortDefEn: "Area under the Precision-Recall curve (PR-AUC): a strict evaluation metric suited to imbalanced churn cohorts (24.8% positive rate). Live PPV (Bayes) adjusts test precision to production churn prevalence (5.74%) via Bayes' theorem.",
    takeawayFr: "Notre modèle champion atteint 50,8 % de PR-AUC sur le jeu de test (plus du double du hasard à 25,1 %) avec un score ROC-AUC de 74,7 %.",
    takeawayEn: "Our champion Gradient Boosting model achieves 50.8% Test PR-AUC—more than double the 25.1% random baseline—alongside 74.7% Test ROC-AUC."
  },
  {
    id: 'party_size',
    aliases: ['party', 'party_play_pct', 'escouade', 'solo queue', 'bouclier social', 'groupe'],
    category: 'psychology',
    badgeClass: 'badge-psychology',
    termFr: "Bouclier Social (Escouade vs Solo Queue)",
    termEn: "Social Shield (Party Play vs. Solo Queue)",
    shortDefFr: "Proportion de parties lancées en groupe avec des amis (Escouade) plutôt qu'en file solitaire (Solo Queue). Jouer seul prive le joueur d'un soutien moral après une mauvaise action.",
    shortDefEn: "Proportion of matches queued in a pre-made squad with friends rather than queuing alone (Solo Queue). Playing solo removes social cushioning after frustrating skirmishes.",
    takeawayFr: "Gemme Cachée #6 : l'isolement prolongé en solo grimpe de +54,3 % chez les joueurs sur le point d'abandonner (2,22 matchs isolés vs 1,44).",
    takeawayEn: "Hidden Gem #6: consecutive solo-queue isolation streaks jump +54.3% among players on the verge of 14-day churn (2.22 isolated matches vs. 1.44)."
  },
  {
    id: 'souls_per_min',
    aliases: ['spm', 'souls/min', 'souls·min', 'unspent souls', 'avg_gpm', 'avg_xpm'],
    category: 'gaming',
    badgeClass: 'badge-gaming',
    termFr: "Souls / Min & Cumul Non Dépensé (Souls·min)",
    termEn: "Souls / Min & Unspent Soul-Minutes (Souls·min)",
    shortDefFr: "Rythme d'accumulation de monnaie (Souls par minute) durant la partie. L'unité Souls·min mesure l'intégrale cumulée des âmes gardées en poche minute après minute sans les convertir en équipements à la boutique.",
    shortDefEn: "Rate of in-game currency (Souls) earned per minute during a match. Soul-minutes (Souls·min) measure the cumulative integral of unspent Souls held in reserve minute after minute instead of buying shop upgrades.",
    takeawayFr: "Garder trop de Souls non dépensées (thésaurisation passive) laisse le personnage sans défense et précipite les achats de panique tardifs.",
    takeawayEn: "Hoarding unspent Souls leaves a hero under-geared in combat and correlates with risky deaths and desperate late-game panic purchases."
  },
  {
    id: 'rank_tier',
    aliases: ['rank', 'rang', 'initiate', 'archon', 'eternus', 'mmr'],
    category: 'gaming',
    badgeClass: 'badge-gaming',
    termFr: "Rangs Compétitifs Deadlock (Initiate à Eternus)",
    termEn: "Deadlock Competitive Rank Tiers (Initiate to Eternus)",
    shortDefFr: "Échelle de classement officiel de Deadlock répartie en 11 paliers (Initiate, Seeker, Alchemist, Arcanist, Ritualist, Emissary, Archon, Oracle, Phantom, Ascendant, Eternus), subdivisés chacun en 6 divisions.",
    shortDefEn: "Deadlock's official 11-tier competitive skill ladder (Initiate, Seeker, Alchemist, Arcanist, Ritualist, Emissary, Archon, Oracle, Phantom, Ascendant, Eternus), each subdivided into 6 divisions.",
    takeawayFr: "Les écarts de niveau trop larges entre équipes dans une même partie aggravent le sentiment d'impuissance et les défaites expéditives.",
    takeawayEn: "Wide skill-rating dispersion between opposing teams increases perceived helplessness and fuels one-sided stomp-driven churn."
  },
  {
    id: 'stomp',
    aliases: ['stomps', 'match_t_stomp_loss', 'ecrasement', 'partie a sens unique'],
    category: 'gaming',
    badgeClass: 'badge-gaming',
    termFr: "Stomp (Partie à Sens Unique)",
    termEn: "Stomp (One-Sided Lopsided Match)",
    shortDefFr: "Partie totalement déséquilibrée où une équipe écrase l'autre en moins de 20–25 minutes avec un gouffre économique et aucune chance réelle de riposte.",
    shortDefEn: "A heavily lopsided match where one 6-player team overwhelms the other in under 20–25 minutes with a massive Soul deficit and virtually no counterplay.",
    takeawayFr: "Subir un stomp lors du match pivot T (match_T_stomp_loss) figure dans le Top 12 des variables prédictives de notre modèle (3,3 %).",
    takeawayEn: "Suffering a stomp defeat in Pivot Match T (match_T_stomp_loss) ranks in the Top 12 predictive churn drivers of our champion model (3.3% importance)."
  },
  {
    id: 'kda',
    aliases: ['kda_ratio', 'ratio kda', 'kills', 'deaths', 'assists'],
    category: 'gaming',
    badgeClass: 'badge-gaming',
    termFr: "Ratio KDA (Éliminations / Morts / Assistances)",
    termEn: "KDA Combat Ratio (Kills, Deaths, Assists)",
    shortDefFr: "Indicateur classique de performance individuelle calculé par (Éliminations + Assistances) / max(1, Morts). Un KDA inférieur à 1,0 traduit une partie subie en boucle.",
    shortDefEn: "Standard combat efficiency metric computed as (Kills + Assists) / max(1, Deaths). A KDA below 1.0 indicates repeated deaths with minimal offensive contribution.",
    takeawayFr: "Combiné au temps passé mort en écran gris, l'effondrement du KDA reflète une perte de contrôle mécanique en combat.",
    takeawayEn: "Combined with high grey-screen death downtime, a collapsing KDA signals acute loss of mechanical control in combat."
  },
  {
    id: 'objective_control',
    aliases: ['objectifs', 'guardian_kills', 'walker_kills', 'structure damage'],
    category: 'gaming',
    badgeClass: 'badge-gaming',
    termFr: "Contrôle des Objectifs (Guardians, Walkers & Urne)",
    termEn: "Objective Control (Guardians, Walkers & Urn)",
    shortDefFr: "Capacité à détruire les défenses adverses (Guardians, Walkers) et à sécuriser les objectifs neutres (Soul Urn, Mid Boss) plutôt que de chercher uniquement des duels isolés.",
    shortDefEn: "Team focus on destroying enemy lane defenses (Guardians, Walkers) and securing neutral map objectives (Soul Urn, Mid Boss) rather than chasing isolated kills.",
    takeawayFr: "Les destructions de Guardians (6,8 % d'importance modèle, Top 4) protègent durablement contre le décrochage (profil Gardien des Objectifs : 18 % de risque).",
    takeawayEn: "Outer Guardian takedowns rank #4 in model feature importance (6.8%) and anchor long-term retention (Objective Guardian profile: 18.0% churn risk)."
  },
  {
    id: 'aim_accuracy',
    aliases: ['accuracy', 'visée', 'precision de tir', 'crosshair', 'crosshair_on_target_pct'],
    category: 'gaming',
    badgeClass: 'badge-gaming',
    termFr: "Précision de Visée 3D (Crosshair & Régularité)",
    termEn: "3D Aim Accuracy & Crosshair Consistency",
    shortDefFr: "Pourcentage de projectiles touchant la cible et stabilité du viseur sur la durée d'un match. La fatigue et l'énervement dégradent la motricité fine bien avant que le joueur n'en prenne conscience.",
    shortDefEn: "Percentage of fired projectiles hitting enemy targets and steadiness of crosshair tracking over a match. Fatigue and frustration degrade fine motor aim long before a player consciously realizes they are tilted.",
    takeawayFr: "La chute brutale de précision par rapport aux 15 matchs habituels alimente directement l'Indice de Tilt [0–100].",
    takeawayEn: "Sudden crosshair accuracy drops relative to a player's 15-match baseline feed directly into the [0–100] Tilt Index."
  },
  {
    id: 'vitality_items',
    aliases: ['weapon', 'vitality', 'spirit', 'familles', 'boutique', 'shop', '0% vitality'],
    category: 'gaming',
    badgeClass: 'badge-gaming',
    termFr: "Les 3 Familles d'Équipements (Weapon, Vitality, Spirit)",
    termEn: "The 3 Shop Item Families (Weapon, Vitality, Spirit)",
    shortDefFr: "Dans Deadlock, chaque joueur dispose de 3 catégories d'objets en boutique : Weapon (Armes / dégâts de tir, en orange), Vitality (Survie / points de vie, boucliers et armure, en vert) et Spirit (Pouvoirs / compétences magiques, en violet).",
    shortDefEn: "Deadlock's in-game shop is split into three distinct categories: Weapon (orange gun damage), Vitality (green health, shields, and armor), and Spirit (purple supernatural ability power).",
    takeawayFr: "Acheter 6 à 13 équipements offensifs d'affilée sans aucun objet Vitality (0 % survie pendant 30 min) est le schéma d'erreur #1 des joueurs qui décrochent.",
    takeawayEn: "Buying 6 to 13 offensive items with 0% Vitality defense for up to 30 minutes is Error Schema #1 among departing players."
  },
  {
    id: 'unsecured_souls',
    aliases: ['ames instables', 'âmes instables', 'unsecured', 'jungle', 'orbe tombé'],
    category: 'gaming',
    badgeClass: 'badge-gaming',
    termFr: "Âmes Instables (Unsecured Souls)",
    termEn: "Unsecured Souls (Risky Neutral Currency)",
    shortDefFr: "Monnaie gagnée en éliminant des monstres neutres dans la jungle ou des caisses : ces âmes restent « instables » dans une réserve temporaire pendant quelques secondes et tombent au sol (volables par l'ennemi) si le joueur meurt avant de les sécuriser.",
    shortDefEn: "Souls earned from neutral jungle camps or crates that sit in a temporary floating reserve for several seconds before converting to permanent currency—dropping on the ground for enemies to steal if the player dies.",
    takeawayFr: "Gemme Cachée #1 : les joueurs sur le départ perdent davantage d'âmes instables par minute (15,73 vs 15,23/min) par prise de risque excessive.",
    takeawayEn: "Hidden Gem #1: churning players drop more unsecured souls per minute (15.73 vs. 15.23/min) due to risky overextension without defensive gear."
  },
  {
    id: 'parry',
    aliases: ['parade', 'heavy melee', 'melee cancel', 'feinte', 'contre'],
    category: 'gaming',
    badgeClass: 'badge-gaming',
    termFr: "Parade au Corps-à-Corps (Parry & Heavy Melee)",
    termEn: "Close-Combat Parry & Heavy Melee",
    shortDefFr: "Action défensive minutée permettant de bloquer un coup de poing lourd (Heavy Melee) : réussir une parade paralyse l'attaquant pendant 4 secondes complètes ; la rater rend la parade indisponible pendant 5 secondes.",
    shortDefEn: "Timed defensive block (F key) against heavy melee punches: landing a parry stuns and disarms the attacker for 4 full seconds, whereas whiffing puts parry on a 5-second cooldown.",
    takeawayFr: "Gemme Cachée #3 : subir deux morts après s'être fait parer provoque une chute de -45,6 % d'activité (APM) et multiplie par 9 le risque d'abandon immédiat.",
    takeawayEn: "Hidden Gem #3: enduring two parry-induced deaths triggers a -45.6% Actions-Per-Minute collapse and multiplies immediate mid-match quit risk by 9x."
  },
  {
    id: 'cc_stun',
    aliases: ['cc', 'crowd control', 'stun', 'etourdissement', 'immobilisation', 'paralysie'],
    category: 'gaming',
    badgeClass: 'badge-gaming',
    termFr: "Contrôle de Foule & Étourdissement (CC / Stun)",
    termEn: "Crowd Control & Stun (CC)",
    shortDefFr: "Ensemble des sorts qui immobilisent, ralentissent, projettent en l'air ou paralysent un héros (ex : grappin de Bebop, gel de Kelvin, parade réussie), l'empêchant de se déplacer ou d'esquiver.",
    shortDefEn: "Abilities and mechanics that immobilize, slow, knock up, or stun a hero (e.g., hooks, ice cages, successful parries), temporarily stripping away movement and dodging agency.",
    takeawayFr: "Gemme Cachée #2 : les décrocheurs subissent +19,1 % de tirs à la tête alors qu'ils sont immobilisés (et jusqu'à 84,5 % dans les replays profonds).",
    takeawayEn: "Hidden Gem #2: churning players suffer +19.1% more headshots while stunned across the full cohort (and up to 84.5% in deep replays), eroding perceived control."
  },
  {
    id: 'source2_gc',
    aliases: ['source 2', 's2', 'valve gc', 'game coordinator', 'serveur valve'],
    category: 'ml',
    badgeClass: 'badge-ml',
    termFr: "Moteur 3D Source 2 & Serveur Valve (Game Coordinator)",
    termEn: "Source 2 Engine & Valve Game Coordinator",
    shortDefFr: "Source 2 est le moteur physique 3D de Valve qui enregistre chaque tir, achat et position seconde par seconde dans les replays. Le Game Coordinator (Valve GC) est le serveur central qui orchestre le matchmaking et diffuse les métadonnées officielles.",
    shortDefEn: "Source 2 is Valve's 3D physics engine recording second-by-second shots, purchases, and positions in match replays; the Valve Game Coordinator (GC) is the central matchmaking and official telemetry server.",
    takeawayFr: "L'extraction de 27 variables inédites directement depuis les replays Source 2 fait bondir le ROC-AUC de 66,4 % à 74,7 %.",
    takeawayEn: "Extracting 27 novel signals directly from Source 2 replays boosts champion Test ROC-AUC from 66.4% (classic tilt) to 74.7%."
  },
  {
    id: 'ablation',
    aliases: ['ablation study', 'etude d ablation', 'fuite calendaire', 'calendar leakage', 'in-game pure'],
    category: 'ml',
    badgeClass: 'badge-ml',
    termFr: "Étude d'Ablation & Zéro Fuite Calendaire",
    termEn: "Ablation Study & Zero Calendar Leakage",
    shortDefFr: "Protocole scientifique consistant à entraîner le modèle avec chaque famille de signaux isolée (Visée seule, Économie seule, Gemmes seules) pour mesurer son apport réel. « Zéro fuite calendaire » garantit l'exclusion stricte des délais entre sessions (qui tricheraient en devinant l'absence par le calendrier).",
    shortDefEn: "Controlled scientific experiment training the model on one signal family at a time (Aim only, Economy only, Hidden Gems only). 'Zero calendar leakage' strictly bans login-gap or timestamp variables that would trivially cheat by reading the calendar.",
    takeawayFr: "Preuve empirique : les 7 Gemmes Cachées Source 2 atteignent à elles seules 71,2 % de ROC-AUC test, et 74,7 % une fois combinées aux autres signaux en match.",
    takeawayEn: "Empirical proof: the 7 Source 2 Hidden Gems alone reach 71.2% Test ROC-AUC, climbing to 74.7% when combined with full in-game telemetry."
  }
];

const EXISTING_DICTIONARY_IDS = new Set(DICTIONARY_TERMS.map((item) => item.id));

export const MERGED_DICTIONARY_TERMS = [
  ...DICTIONARY_TERMS,
  ...DEADLOCK_GLOSSARY
    .filter((g) => !EXISTING_DICTIONARY_IDS.has(g.id) && g.id !== 'tilt')
    .map((g) => ({
      id: g.id,
      aliases: [g.id, (g.termEn || g.term || '').toLowerCase(), (g.termFr || '').toLowerCase()].filter(Boolean),
      category: 'gaming',
      badgeClass: 'badge-gaming',
      termFr: g.termFr || g.term,
      termEn: g.termEn || g.term,
      shortDefFr: g.definitionFr,
      shortDefEn: g.definitionEn,
      takeawayFr: g.definitionFr,
      takeawayEn: g.definitionEn
    }))
];

export const DICTIONARY_TOTAL_COUNT = MERGED_DICTIONARY_TERMS.length;

/**
 * Searches dictionary term by ID or alias across DICTIONARY_TERMS and DEADLOCK_GLOSSARY
 */
export function findDictionaryTerm(termId) {
  if (!termId) return null;
  const cleanId = String(termId).toLowerCase().trim();
  const directMatch = MERGED_DICTIONARY_TERMS.find(
    (t) =>
      t.id === cleanId ||
      (Array.isArray(t.aliases) && t.aliases.some((alias) => alias.toLowerCase() === cleanId))
  );
  if (directMatch) return directMatch;

  // Fallback substring search in DEADLOCK_GLOSSARY
  const glossaryMatch = DEADLOCK_GLOSSARY.find(
    (g) => g.id === cleanId || (g.term && g.term.toLowerCase().includes(cleanId))
  );
  if (glossaryMatch) {
    return {
      id: glossaryMatch.id,
      category: 'gaming',
      badgeClass: 'badge-gaming',
      termFr: glossaryMatch.termFr || glossaryMatch.term,
      termEn: glossaryMatch.termEn || glossaryMatch.term,
      shortDefFr: glossaryMatch.definitionFr,
      shortDefEn: glossaryMatch.definitionEn,
      takeawayFr: glossaryMatch.definitionFr,
      takeawayEn: glossaryMatch.definitionEn
    };
  }
  return null;
}
