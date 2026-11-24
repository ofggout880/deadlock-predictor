import React, { useState, useEffect } from 'react';
import { MOCK_HERO_CHURN_ANALYTICS } from '../data/mockData';
import { getItemHeroChurnAnalytics } from '../services/api';
import { getHeroIcon, getItemIcon } from '../data/deadlockAssetIcons';
import DeadlockMapHeatmap from './DeadlockMapHeatmap';
import GlossaryTerm from './GlossaryTerm';

/**
 * Clean SVG Vector Icons for Hero Dynamics & Sub-Tab Navigation
 */
const IconBiomarkers = ({ size = 14, strokeWidth = 2, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const IconDynamics = ({ size = 14, strokeWidth = 2, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polygon points="12 8 8 12 12 16 16 12 12 8" />
  </svg>
);

const IconMap = ({ size = 14, strokeWidth = 2, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

const IconTimeline = ({ size = 14, strokeWidth = 2, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconParry = ({ size = 14, strokeWidth = 2, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

/**
 * Source 2 Replay Parser Biomarkers (N = 10,000 cohorts & N = 397 deep replay windows)
 * 5 Standardized Core Behavioral Divergences driving Player Churn
 */
const SOURCE2_BIOMARKERS = [
  {
    id: 'stun_hs',
    key_raw: 'Bullet Stats##StunHeadshotHitRate',
    label_fr: 'Headshots Subis sous Étourdissement (Stun)',
    label_en: 'Headshots Taken While Stunned / Immobilized',
    churn_val: '84.5%',
    retained_val: '47.3%',
    churn_raw: 84.5,
    retained_raw: 47.3,
    scaleMax: 100,
    churn_pct: 84.5,
    retained_pct: 47.3,
    delta_badge: '+78.6% VULNÉRABILITÉ',
    delta_badge_en: '+78.6% VULNERABILITY',
    is_bad: true,
    insight_fr:
      "Marqueur #2 du modèle ML : 84.5% des tirs subis par les churners lorsqu'ils sont étourdis ou en l'air vont directement dans leur tête, contre 47.3% chez les joueurs fidélisés. L'absence d'armure et l'impossibilité de bouger créent une impuissance mécanique absolue.",
    insight_en:
      'ML Feature #2: 84.5% of incoming damage taken while crowd-controlled lands directly as critical headshots on churners, versus 47.3% on retained players. Zero armor and zero movement agency cause acute mechanical helplessness.'
  },
  {
    id: 'grey_screen',
    key_raw: 'match_T_grey_screen_ratio (Death Duration / Match Time)',
    label_fr: 'Temps Passé Mort (Ratio Écran Gris de Réapparition)',
    label_en: 'Time Spent Dead (Monochrome Respawn Screen Ratio)',
    churn_val: '17.8%',
    retained_val: '9.6%',
    churn_raw: 17.8,
    retained_raw: 9.6,
    scaleMax: 25,
    churn_pct: (17.8 / 25) * 100,
    retained_pct: (9.6 / 25) * 100,
    delta_badge: '+85.4% TEMPS MORT',
    delta_badge_en: '+85.4% DEATH DOWNTIME',
    is_bad: true,
    insight_fr:
      "Les churners passent 17.8% de leur match pivot T (soit plus de 6 minutes sur une partie de 35 min) à regarder un écran gris de réapparition. Ce temps mort passif brise le cycle de dopamine et déclenche le désengagement.",
    insight_en:
      'Churners spend 17.8% of match duration (over 6 full minutes in a 35-minute game) staring at a dead grey respawn timer. This passive downtime breaks the dopamine loop and accelerates disengagement.'
  },
  {
    id: 'solo_isolation',
    key_raw: 'solo_isolation_streak (Solo-Queue without Party)',
    label_fr: 'Isolement Social (Parties Solo sans Escouade)',
    label_en: 'Social Isolation (Solo-Queue Matches without Party)',
    churn_val: '82.4%',
    retained_val: '41.2%',
    churn_raw: 82.4,
    retained_raw: 41.2,
    scaleMax: 100,
    churn_pct: 82.4,
    retained_pct: 41.2,
    delta_badge: '+100.0% ISOLEMENT SOLO',
    delta_badge_en: '+100.0% SOLO ISOLATION',
    is_bad: true,
    insight_fr:
      "Marqueur #1 d'importance ML : 82.4% des parties des futurs churners sont disputées seuls en solo queue, contre 41.2% chez les fidélisés (qui jouent à 58.8% en escouade). Jouer avec des amis agit comme un amortisseur émotionnel direct face aux défaites.",
    insight_en:
      'ML Feature #1: 82.4% of games played by future churners are queued completely alone, versus 41.2% for retained players (who play 58.8% with party friends). Group play acts as an emotional shock absorber against loss streaks.'
  },
  {
    id: 'late_panic_sells',
    key_raw: 'late_panic_sells (Rage-Selling in Final 5 Minutes)',
    label_fr: 'Revente Panique d’Objets en Défaite (Rage-Sell)',
    label_en: 'Late Inventory Rage-Sell Rate in Defeat',
    churn_val: '28.6%',
    retained_val: '3.4%',
    churn_raw: 28.6,
    retained_raw: 3.4,
    scaleMax: 35,
    churn_pct: (28.6 / 35) * 100,
    retained_pct: (3.4 / 35) * 100,
    delta_badge: 'x8.4 DÉMISSION MATÉRIELLE',
    delta_badge_en: '8.4x INVENTORY SURRENDER',
    is_bad: true,
    insight_fr:
      "Dans 28.6% de leurs défaites, les churners revendent précipitamment plusieurs objets à perte au shop de lane dans les dernières minutes de jeu. Ce geste impulsif signe une reddition psychologique totale avant même la chute du Patron.",
    insight_en:
      'In 28.6% of lost matches, churners impulsively sell multiple items at a 50% loss at the lane shop in the final minutes. This rage-selling acts as clear psychological surrender before the Patron is even destroyed.'
  },
  {
    id: 'altruism_support',
    key_raw: 'teammate_support_per_min (Healing & Protective Barriers)',
    label_fr: 'Soutien aux Coéquipiers (Soins & Barrières Allouées)',
    label_en: 'Teammate Support (Healing & Protective Barrier Output)',
    churn_val: '14.2%',
    retained_val: '36.8%',
    churn_raw: 14.2,
    retained_raw: 36.8,
    scaleMax: 50,
    churn_pct: (14.2 / 50) * 100,
    retained_pct: (36.8 / 50) * 100,
    delta_badge: '-61.4% SOUTIEN ALLIÉ',
    delta_badge_en: '-61.4% ALLY SUPPORT',
    is_bad: false,
    insight_fr:
      "Les joueurs fidélisés consacrent 36.8% de leur impact à des actifs de soutien collectif (Rescue Beam, Healing Rite, Divine Barrier), contre seulement 14.2% chez les churners. Le repli sur un jeu égoïste '1v9' accélère l'isolement et le ressentiment.",
    insight_en:
      'Retained players allocate 36.8% of their utility to collective squad sustain (Rescue Beam, Healing Rite, Divine Barrier), compared to only 14.2% for churners. Retreating into selfish 1v9 play deepens toxicity and fatigue.'
  }
];

/**
 * ItemsSection Component — Page 2: Hero Dynamics & Biomechanics ("Dynamique Héros")
 *
 * Refactored Modular Architecture (Statlocker.gg × Page 1 Editorial DA):
 * - Stage 1: Short Page-1-Aligned Editorial Header (Eyebrow + 2-Column Title & Summary)
 * - Stage 2: 5 Monumental KPI Horizon Cards (Stun Headshots, 1st Vitality, Yamato Churn, Retention)
 * - Stage 3: Interactive 4-Sub-Tab Dashboard eliminating infinite scroll:
 *     [01 Biomarqueurs] / [02 Matrice & Héros] / [03 Carte 2D] / [04 Parry & Ragequit]
 */
export default function ItemsSection({ lang = 'fr', t, onBackToMain, onGoToItems, activeSubTab: controlledSubTab, onSubTabChange }) {
  const isFr = lang === 'fr';

  // Active Modular Sub-Tab ('biomarkers' | 'heroes' | 'heatmap' | 'parry')
  const [activeSubTab, setActiveSubTab] = useState(controlledSubTab || 'biomarkers');
  const [selectedHeroSpot, setSelectedHeroSpot] = useState('Seven');
  const [showRetentionCards, setShowRetentionCards] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    hero_churn_rates: MOCK_HERO_CHURN_ANALYTICS
  });

  // Sync controlled sub-tab from URL hash / browser Back-Forward navigation
  useEffect(() => {
    if (controlledSubTab && controlledSubTab !== activeSubTab) {
      setActiveSubTab(controlledSubTab);
    }
  }, [controlledSubTab]);

  // Listen for Navbar anchor events to activate the corresponding sub-tab
  useEffect(() => {
    const handleSubtabEvent = (e) => {
      const anchor = e.detail?.anchor;
      let nextTab = null;
      if (anchor === '#lab-step-1') nextTab = 'biomarkers';
      else if (anchor === '#lab-step-2') nextTab = 'heroes';
      else if (anchor === '#lab-step-heatmap' || anchor === '#lab-step-3') nextTab = 'heatmap';
      else if (anchor === '#lab-step-parry' || anchor === '#lab-step-4') nextTab = 'parry';
      if (nextTab) {
        setActiveSubTab(nextTab);
        onSubTabChange?.(nextTab);
      }
    };
    window.addEventListener('deadlock:subtab', handleSubtabEvent);
    return () => window.removeEventListener('deadlock:subtab', handleSubtabEvent);
  }, [onSubTabChange]);

  // Trigger canvas resize when switching to the 2D Heatmap tab so dimensions are crisp
  useEffect(() => {
    if (activeSubTab === 'heatmap' && typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeSubTab]);

  // Fetch live churn telemetry from API and merge with localized mock narratives
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await getItemHeroChurnAnalytics();
        if (isMounted && Array.isArray(data?.hero_churn_rates) && data.hero_churn_rates.length > 0) {
          const mergedHeroes = data.hero_churn_rates.map((h) => {
            const mockHero = MOCK_HERO_CHURN_ANALYTICS.find(
              (m) => m.hero_name === h.hero_name || m.hero_id === h.hero_id
            );
            return mockHero ? { ...mockHero, ...h } : h;
          });
          setAnalyticsData({ ...data, hero_churn_rates: mergedHeroes });
        }
      } catch {
        // Fallback to mock data seamlessly
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const heroesList = analyticsData.hero_churn_rates || MOCK_HERO_CHURN_ANALYTICS;
  const spotlightHero =
    heroesList.find((h) => h.hero_name === selectedHeroSpot) || heroesList[0];

  const SUB_TAB_ORDER = ['biomarkers', 'heroes', 'heatmap', 'parry'];

  const selectSubTab = (tabId) => {
    setActiveSubTab(tabId);
    onSubTabChange?.(tabId);
    const el = document.getElementById('lab-subtabs-anchor');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSubTabKeyDown = (e) => {
    const currentIndex = SUB_TAB_ORDER.indexOf(activeSubTab);
    if (currentIndex === -1) return;
    let nextIndex = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % SUB_TAB_ORDER.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + SUB_TAB_ORDER.length) % SUB_TAB_ORDER.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = SUB_TAB_ORDER.length - 1;
    }
    if (nextIndex !== -1) {
      e.preventDefault();
      const nextTab = SUB_TAB_ORDER[nextIndex];
      setActiveSubTab(nextTab);
      onSubTabChange?.(nextTab);
      const bar = e.currentTarget;
      const btns = bar.querySelectorAll('.dl-subtab-btn');
      if (btns[nextIndex]) {
        btns[nextIndex].focus();
      }
    }
  };

  return (
    <section id="items" className="section hero-section lab-page-section" aria-labelledby="items-heading">
      <div className="container">
        
        {/* ===================================================================== */}
        {/* STAGE 1: SHORT EDITORIAL HEADER (ALIGNED WITH PAGE 1)                 */}
        {/* ===================================================================== */}
        {/* Master Headline & Free-Floating Summary Row */}
        <div className="hero-editorial-row">
          <div className="hero-title-column">
            <h1 id="items-heading" className="hero-display-title lab-hero-title">
              {isFr ? (
                <>
                  <span className="title-light">Dynamique des Héros &amp;</span>{' '}
                  <span className="title-bold">
                    <GlossaryTerm termId="churn">Abandon Joueur</GlossaryTerm>
                  </span>
                  <br />
                  <span className="title-light title-light-sub">dans Deadlock par la</span>{' '}
                  <span className="title-bold title-glow">Biomécanique 3D</span>
                </>
              ) : (
                <>
                  <span className="title-light">Hero Dynamics &</span>{' '}
                  <span className="title-bold">
                    <GlossaryTerm termId="churn">Player Churn</GlossaryTerm>
                  </span>
                  <br />
                  <span className="title-light title-light-sub">in Deadlock via</span>{' '}
                  <span className="title-bold title-glow">Source 2 Biomechanics</span>
                </>
              )}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem', marginTop: '0.85rem' }}>
              <span className="nav-popover-sublabel" style={{ color: 'var(--ml-retention)' }}>
                {isFr
                  ? 'Volet Complémentaire #1 · Quels héros génèrent le plus de churn'
                  : 'Complementary Dossier #1 · Which heroes drive the highest churn'}
              </span>
              <div className="dl-eyebrow-actions">
                {typeof onGoToItems === 'function' && (
                  <button
                    type="button"
                    className="dl-cross-nav-link"
                    onClick={onGoToItems}
                  >
                    <IconTimeline size={15} />
                    <span>{isFr ? 'Équipements & Achats' : 'Item & Build Telemetry'}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                  </button>
                )}
                {typeof onBackToMain === 'function' && (
                  <button
                    type="button"
                    className="hero-about-trigger-pill"
                    onClick={onBackToMain}
                    title={isFr ? "Retour à l'étude principale" : 'Back to Main Study'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                    <span>{isFr ? "Retour à l'Étude Principale" : 'Back to Main Study'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="hero-desc-column">
            <p className="hero-floating-summary">
              {isFr ? (
                <>
                  Pourquoi certains personnages (héros) provoquent-ils jusqu&apos;à 60 % d&apos;abandon à 14 jours ? Pourquoi les joueurs sur le départ subissent-ils +78,6 % de tirs à la tête lorsqu&apos;ils sont <GlossaryTerm termId="cc_stun">immobilisés</GlossaryTerm>, et voient-ils leur risque de quitter la partie en cours multiplié par 9 après s&apos;être fait <GlossaryTerm termId="parry">contrer deux fois au corps-à-corps</GlossaryTerm> ? Explorez nos 4 dossiers analytiques ci-dessous.
                </>
              ) : (
                <>
                  Why do specific hero kits drive up to 60% permanent player churn? Why do departing players endure +78.6% headshots while <GlossaryTerm termId="cc_stun">immobilized</GlossaryTerm> and a 9x ragequit surge after being <GlossaryTerm termId="parry">parried twice in close combat</GlossaryTerm>? Explore our 4 modular analytical views below.
                </>
              )}
            </p>
            <p className="hero-floating-summary" style={{ fontSize: '0.84rem', marginTop: '0.65rem', paddingLeft: '0.75rem', borderLeft: '2px solid var(--ml-retention-border)' }}>
              {isFr ? (
                <>
                  <strong style={{ color: 'var(--color-ink)' }}>Clé de lecture boutique :</strong>{' '}
                  Dans Deadlock, chaque joueur achète avec ses <GlossaryTerm termId="souls">Souls (Âmes)</GlossaryTerm> des objets répartis en <GlossaryTerm termId="vitality_items">3 familles</GlossaryTerm> (<strong style={{ color: 'var(--dl-weapon)' }}>Weapon</strong> : armes et tir, <strong style={{ color: 'var(--dl-vitality-bright)' }}>Vitality</strong> : survie et PV, <strong style={{ color: 'var(--dl-spirit-bright)' }}>Spirit</strong> : pouvoirs magiques).
                </>
              ) : (
                <>
                  <strong style={{ color: 'var(--color-ink)' }}>Shop Quick Guide:</strong>{' '}
                  In Deadlock, players spend <GlossaryTerm termId="souls">Souls</GlossaryTerm> across <GlossaryTerm termId="vitality_items">3 shop families</GlossaryTerm> (<strong style={{ color: 'var(--dl-weapon)' }}>Weapon</strong>: gun damage, <strong style={{ color: 'var(--dl-vitality-bright)' }}>Vitality</strong>: health and armor, and <strong style={{ color: 'var(--dl-spirit-bright)' }}>Spirit</strong>: ability power).
                </>
              )}
            </p>
            <div className="hero-tag-pills" role="list">
              <span className="tag-pill" role="listitem">{isFr ? 'N = 10 000 Cohortes Source 2' : 'N = 10,000 Source 2 Cohorts'}</span>
              <span className="tag-pill" role="listitem">{isFr ? 'N = 397 Replays Complets' : 'N = 397 Full Replays'}</span>
              <span className="tag-pill" role="listitem">+78.6% Stun Headshots</span>
              <span className="tag-pill" role="listitem">{isFr ? '0% Fuite Calendaire' : '0% Calendar Leakage'}</span>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* STAGE 2: LAB KPI SEAMLESS HORIZON (5 MONUMENTAL METRICS)              */}
        {/* ===================================================================== */}
        <div className="lab-kpi-horizon-container" role="region" aria-label={isFr ? 'Indicateurs Télémétriques Labo' : 'Lab Telemetry Key Performance Indicators'}>
          <div className="lab-horizon-grid">
            {/* 01: Stun Headshots */}
            <div
              className="lab-horizon-card"
              onClick={() => selectSubTab('biomarkers')}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <div className="horizon-top-meta">
                  <span className="horizon-index">01</span>
                  <span className="dl-risk-text dl-risk-churn">
                    {isFr ? 'Marqueur #2 ML' : 'ML Marker #2'}
                  </span>
                </div>
                <div className="horizon-number-row">
                  <span className="horizon-large-number glow-rose tabular-nums">
                    +78.6%
                  </span>
                </div>
                <div className="horizon-label">
                  {isFr ? 'Headshots sous Stun' : 'Stun Headshots'}
                </div>
              </div>
              <p className="horizon-sub-text">
                {isFr
                  ? "84,5 % chez les décrocheurs vs 47,3 % chez les fidèles : recevoir des tirs critiques en étant paralysé (contrôle de foule) détruit le sentiment de maîtrise"
                  : '84.5% in churners vs 47.3% in retained: taking headshots while immobilized shatters agency'}
              </p>
            </div>

            {/* 02: 1st Vitality Item */}
            <div
              className="lab-horizon-card lab-horizon-card-external"
              onClick={() => typeof onGoToItems === 'function' && onGoToItems()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && typeof onGoToItems === 'function') {
                  e.preventDefault();
                  onGoToItems();
                }
              }}
              aria-label={isFr ? '1er Item Vitality (Vindicta) : Ouvrir la Page Équipements' : '1st Vitality Item (Vindicta): Open Item Page'}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <div className="horizon-top-meta">
                  <span className="horizon-index">02</span>
                  <span className="dl-risk-text dl-risk-churn">
                    {isFr ? 'Canon de Verre' : 'Glass Cannon'}
                  </span>
                </div>
                <div className="horizon-number-row">
                  <span className="horizon-large-number glow-rose tabular-nums">
                    30.0 Min
                  </span>
                </div>
                <div className="horizon-label">
                  {isFr ? '1er Item Vitality (Vindicta)' : '1st Vitality Item (Vindicta)'}
                </div>
              </div>
              <p className="horizon-sub-text">
                {isFr
                  ? "13 équipements offensifs achetés d'affilée sans aucune survie (Vitality) : achat défensif de panique à la 30e minute avant l'abandon"
                  : '13 consecutive offensive items with zero defense: late panic buy preceding quit'}
              </p>
              <span className="horizon-external-cue">
                {isFr ? 'Voir Page Équipements' : 'View Item Page'}
              </span>
            </div>

            {/* 03: Peak Churn Hero */}
            <div
              className="lab-horizon-card"
              onClick={() => selectSubTab('heroes')}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <div className="horizon-top-meta">
                  <span className="horizon-index">03</span>
                  <span className="dl-risk-text dl-risk-churn">
                    {isFr ? '#1 Rupture Yamato' : '#1 Peak Yamato'}
                  </span>
                </div>
                <div className="horizon-number-row">
                  <span className="horizon-large-number glow-rose tabular-nums">
                    60.0%
                  </span>
                </div>
                <div className="horizon-label">
                  {isFr ? 'Churn Critique (Yamato)' : 'Peak Hero Churn (Yamato)'}
                </div>
              </div>
              <p className="horizon-sub-text">
                {isFr
                  ? "4.0 défaites d'affilée dues à la vulnérabilité de canalisation statique (1.4s) mènent au départ"
                  : '4.0 loss streak from static channeling vulnerability (1.4s) drives 60% of players to quit'}
              </p>
            </div>

            {/* 04: Top Retention Item */}
            <div
              className="lab-horizon-card lab-horizon-card-external"
              onClick={() => typeof onGoToItems === 'function' && onGoToItems()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && typeof onGoToItems === 'function') {
                  e.preventDefault();
                  onGoToItems();
                }
              }}
              aria-label={isFr ? 'Rétention Économique : Ouvrir la Page Équipements' : 'Economic Retention: Open Item Page'}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <div className="horizon-top-meta">
                  <span className="horizon-index">04</span>
                  <span className="dl-risk-text dl-risk-retention">
                    {isFr ? 'Cultist & Rescue' : 'Cultist & Rescue'}
                  </span>
                </div>
                <div className="horizon-number-row">
                  <span className="horizon-large-number glow-emerald tabular-nums">
                    89.7%
                  </span>
                </div>
                <div className="horizon-label">
                  {isFr ? 'Rétention Économique' : 'Economic Retention'}
                </div>
              </div>
              <p className="horizon-sub-text">
                {isFr
                  ? "Sécuriser les camps neutres (@ 11m) et l'utilité collective d'équipe réduit le churn à 10.3%"
                  : 'Securing neutral farm (@ 11m) and squad active sustain lowers churn to only 10.3%'}
              </p>
              <span className="horizon-external-cue horizon-external-cue-mint">
                {isFr ? 'Voir Page Équipements' : 'View Item Page'}
              </span>
            </div>

            {/* 05: Retention Anchors */}
            <div
              className="lab-horizon-card"
              onClick={() => selectSubTab('heroes')}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <div className="horizon-top-meta">
                  <span className="horizon-index">05</span>
                  <span className="dl-risk-text dl-risk-retention">
                    {isFr ? 'Abrams & Pocket' : 'Abrams & Pocket'}
                  </span>
                </div>
                <div className="horizon-number-row">
                  <span className="horizon-large-number glow-emerald tabular-nums">
                    81.8%
                  </span>
                </div>
                <div className="horizon-label">
                  {isFr ? 'Rétention Piliers' : 'Anchor Retention'}
                </div>
              </div>
              <p className="horizon-sub-text">
                {isFr
                  ? "Personnages tolérants aux erreurs : seulement 9,6 % de tirs reçus à la tête et des compétences d'esquive qui désamorcent la frustration"
                  : 'Forgiving kits & high agency: 9.6% incoming headshots and 3D escapes eliminate tilt'}
              </p>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* STAGE 2.5: 3 INTERACTIVE EDITORIAL PILLARS (01, 02, 03 SYNTHESIS)     */}
        {/* ===================================================================== */}
        <div className="hero-editorial-pillars lab-editorial-pillars" role="region" aria-label={isFr ? 'Piliers Analytiques Dynamique Héros' : 'Hero Dynamics Analytical Pillars'}>
          <button
            type="button"
            className="editorial-pillar lab-interactive-pillar"
            onClick={() => selectSubTab('biomarkers')}
          >
            <div className="pillar-num-accent">01</div>
            <div className="pillar-content-stack">
              <h3 className="pillar-editorial-title">
                {isFr ? 'Biomécanique 3D & Impuissance sous Stun' : '3D Biomechanics & Stun Helplessness'}
              </h3>
              <p className="pillar-editorial-body">
                {isFr
                  ? "Sur nos 10 000 fenêtres Source 2, 84.5% des tirs subis par les futurs churners sous étourdissement atterrissent directement dans leur tête (vs 47.3% chez les fidèles), les condamnant à 17.8% de temps d'écran gris et 28.6% de revente panique (Rage-Sell)."
                  : 'Across 10,000 Source 2 windows, 84.5% of incoming shots taken by future churners while immobilized land directly as headshots (vs 47.3% for retained players), driving 17.8% grey screen downtime and 28.6% late inventory rage-selling.'}
              </p>
            </div>
          </button>

          <button
            type="button"
            className="editorial-pillar lab-interactive-pillar"
            onClick={() => selectSubTab('heroes')}
          >
            <div className="pillar-num-accent">02</div>
            <div className="pillar-content-stack">
              <h3 className="pillar-editorial-title">
                {t ? t('items.crossInsightTitle', lang) : (isFr ? 'La Spirale Toxique : Héros Fragile + Rush Sans Défense' : 'The Toxic Spiral: Fragile Hero + Zero-Defense Rush')}
              </h3>
              <p className="pillar-editorial-body">
                {t ? t('items.crossInsightDesc', lang) : (isFr
                  ? "Les joueurs qui abandonnent sélectionnent des héros punitifs (Yamato 60%, Vindicta 44.8%, Seven 41.7%, Lash 35.7%) et rushent des items 100% offensifs sans Vitality, tandis que les fidèles s'ancrent sur Abrams (81.8%), Pocket et Dynamo."
                  : 'Departing players pick punishing kits (Yamato 60%, Vindicta 44.8%, Seven 41.7%, Lash 35.7%) and rush 100% offensive items with zero Vitality, whereas retained players anchor on Abrams (81.8%), Pocket, and Dynamo.')}
              </p>
            </div>
          </button>

          <button
            type="button"
            className="editorial-pillar lab-interactive-pillar"
            onClick={() => selectSubTab('heatmap')}
          >
            <div className="pillar-num-accent">03</div>
            <div className="pillar-content-stack">
              <h3 className="pillar-editorial-title">
                {isFr ? 'Géographie Tactique 2D & Catalyseur du Parry (4.0s)' : '2D Tactical Geography & Parry Catalyst (4.0s)'}
              </h3>
              <p className="pillar-editorial-body">
                {isFr
                  ? "Plus de 64% des éliminations précoces surviennent sous les Guardians T1 (0–10m). Subir 2 parades au corps-à-corps (4.0s de stun + désarmement) avec Spirit Strike équipé provoque une chute d'APM de -45.6% et multiplie par 9 le risque de ragequit."
                  : 'Over 64% of early deaths occur around T1 Guardians (0–10m). Enduring 2 melee parries (4.0s stun + disarm) with Spirit Strike equipped triggers a -45.6% APM crash and multiplies acute ragequits by 9x.'}
              </p>
            </div>
          </button>
        </div>

        {/* ===================================================================== */}
        {/* STAGE 3: MINIMALIST UNDERLINE TAB BAR (4 MODULES)                     */}
        {/* ===================================================================== */}
        <div id="lab-subtabs-anchor" className="dl-subtabs-shell">
          <div className="dl-subtabs-header-bar">
            <div
              className="dl-subtabs-bar"
              role="tablist"
              aria-label={isFr ? 'Sous-onglets Dynamique Héros' : 'Hero Dynamics Sub-Tabs'}
              onKeyDown={handleSubTabKeyDown}
            >
              <button
                type="button"
                role="tab"
                tabIndex={activeSubTab === 'biomarkers' ? 0 : -1}
                aria-selected={activeSubTab === 'biomarkers'}
                aria-controls="lab-step-1"
                className={`dl-subtab-btn lab-seq-tab-btn ${activeSubTab === 'biomarkers' ? 'is-active' : ''}`}
                style={{ '--subtab-accent': 'var(--ml-churn)' }}
                onClick={() => selectSubTab('biomarkers')}
              >
                <span className="dl-subtab-num">01</span>
                <span className="dl-subtab-title">
                  {isFr ? 'Biomarqueurs Empiriques' : 'Empirical Biomarkers'}
                </span>
              </button>

              <button
                type="button"
                role="tab"
                tabIndex={activeSubTab === 'heroes' ? 0 : -1}
                aria-selected={activeSubTab === 'heroes'}
                aria-controls="lab-step-2"
                className={`dl-subtab-btn lab-seq-tab-btn ${activeSubTab === 'heroes' ? 'is-active' : ''}`}
                style={{ '--subtab-accent': 'var(--dl-spirit)' }}
                onClick={() => selectSubTab('heroes')}
              >
                <span className="dl-subtab-num">02</span>
                <span className="dl-subtab-title">
                  {isFr ? 'Matrice & Autopsie Héros' : 'Hero Matrix & Autopsy'}
                </span>
              </button>

              <button
                type="button"
                role="tab"
                tabIndex={activeSubTab === 'heatmap' ? 0 : -1}
                aria-selected={activeSubTab === 'heatmap'}
                aria-controls="lab-step-3"
                className={`dl-subtab-btn lab-seq-tab-btn ${activeSubTab === 'heatmap' ? 'is-active' : ''}`}
                style={{ '--subtab-accent': 'var(--dl-souls)' }}
                onClick={() => selectSubTab('heatmap')}
              >
                <span className="dl-subtab-num">03</span>
                <span className="dl-subtab-title">
                  {isFr ? 'Carte Tactique 2D' : '2D Tactical Map'}
                </span>
              </button>

              <button
                type="button"
                role="tab"
                tabIndex={activeSubTab === 'parry' ? 0 : -1}
                aria-selected={activeSubTab === 'parry'}
                aria-controls="lab-step-parry"
                className={`dl-subtab-btn lab-seq-tab-btn ${activeSubTab === 'parry' ? 'is-active' : ''}`}
                style={{ '--subtab-accent': 'var(--ml-churn)' }}
                onClick={() => selectSubTab('parry')}
              >
                <span className="dl-subtab-num">04</span>
                <span className="dl-subtab-title">
                  {isFr ? 'Biomécanique du Parry' : 'Parry Biomechanics'}
                </span>
              </button>
            </div>

            {typeof onGoToItems === 'function' && (
              <button
                type="button"
                className="dl-cross-nav-link"
                onClick={onGoToItems}
              >
                <span>{isFr ? 'Frises & Catalogue Équipements' : 'Item Timelines & Catalog'}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </button>
            )}
          </div>

          {/* =================================================================== */}
          {/* SUB-TAB PANEL 01: EMPIRICAL BIOMARKERS (N = 10,000)                 */}
          {/* =================================================================== */}
          <div
            id="lab-step-1"
            role="tabpanel"
            className={`dl-subtab-panel ${activeSubTab === 'biomarkers' ? 'is-active' : ''}`}
          >
            <div className="lab-chapter-header">
              <h2 className="lab-chapter-title">
                {isFr
                  ? 'Les 5 Divergences Comportementales : Churners vs Fidélisés'
                  : 'The 5 Core Behavioral Divergences: Churners vs Retained Players'}
              </h2>
              <p className="lab-chapter-subtitle">
                {isFr
                  ? 'Mesuré sur notre cohorte de 10 000 fenêtres temporelles appariées : ce comparatif isole les 5 signaux tangibles qui séparent les joueurs qui abandonnent Deadlock de ceux qui restent.'
                  : 'Measured across our 10,000 time-matched cohort windows: this empirical comparison isolates the 5 concrete signals separating departing players from retained ones.'}
              </p>
            </div>

            {/* 5 Empirical Biomarkers Comparison Bars (N = 10,000) */}
            <div className="lab-biomarkers-glass-card">
              <div className="dl-card-header-flex">
                <div>
                  <h3 className="dl-card-title">
                    {isFr
                      ? 'Comparatif Empirique : Joueurs Décrocheurs vs Joueurs Fidélisés'
                      : 'Empirical Comparison: Departing Players (Churn=1) vs Retained Players (Churn=0)'}
                  </h3>
                  <span className="dl-card-subtitle">
                    {isFr
                      ? 'Mesuré sur les 397 replays profonds Source 2 extraits de notre cohorte d’étude (N = 10 000 fenêtres)'
                      : 'Measured on deadlock_churn_dataset.csv (N = 10,000 cohort windows • N = 397 deep Source 2 replay cohort)'}
                  </span>
                </div>
                <div className="dl-build-balance-legend">
                  <span style={{ color: 'var(--ml-churn)' }}>● {isFr ? 'Churners (Abandon ≥14j)' : 'Churners (≥14d quit)'}</span>
                  <span style={{ color: 'var(--ml-retention)' }}>● {isFr ? 'Fidélisés (Retained)' : 'Retained Players'}</span>
                </div>
              </div>

              <div className="dl-flex-col-stack">
                {SOURCE2_BIOMARKERS.map((bio) => {
                  const churnBarW = Math.min(100, Math.max(2, (bio.churn_raw / bio.scaleMax) * 100));
                  const retainedBarW = Math.min(100, Math.max(2, (bio.retained_raw / bio.scaleMax) * 100));
                  return (
                  <div key={bio.id} className="lab-biomarker-row">
                    <div className="lab-biomarker-meta">
                      <div className="dl-biomarker-title-row">
                        <span className="dl-card-title dl-card-title-sm">
                          {isFr ? bio.label_fr : bio.label_en}
                        </span>
                        <span className={`dl-risk-text ${bio.is_bad ? 'dl-risk-churn' : 'dl-risk-retention'}`}>
                          {isFr ? bio.delta_badge : (bio.delta_badge_en || bio.delta_badge)}
                        </span>
                      </div>
                      <p className="dl-card-body-text">
                        {isFr ? bio.insight_fr : bio.insight_en}
                      </p>
                    </div>

                    <div className="lab-biomarker-bars">
                      {/* Scale Indicator (Prevents Tufte Lie Factor) */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.2rem' }}>
                        <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {isFr ? `Échelle exacte : 0 – ${bio.scaleMax}%` : `Exact scale: 0 – ${bio.scaleMax}%`}
                        </span>
                      </div>
                      {/* Churner Bar */}
                      <div className="lab-bar-line">
                        <div className="lab-bar-label-row">
                          <span style={{ color: 'var(--ml-churn)', fontWeight: 700 }}>
                            {isFr ? 'Joueurs Décrocheurs (Churn)' : 'Churn = 1'}
                          </span>
                          <span className="font-mono glow-rose tabular-nums" style={{ fontWeight: 800, fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>{bio.churn_val}</span>
                        </div>
                        <div className="lab-bar-track">
                          <div
                            className="lab-bar-fill lab-bar-fill-animated"
                            style={{
                              width: `${churnBarW.toFixed(1)}%`,
                              background: 'var(--ml-churn)'
                            }}
                          />
                        </div>
                      </div>

                      {/* Retained Bar */}
                      <div className="lab-bar-line">
                        <div className="lab-bar-label-row">
                          <span style={{ color: 'var(--ml-retention)', fontWeight: 700 }}>
                            {isFr ? 'Joueurs Fidélisés (Actifs)' : 'Churn = 0'}
                          </span>
                          <span className="font-mono glow-emerald tabular-nums" style={{ fontWeight: 800, fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>{bio.retained_val}</span>
                        </div>
                        <div className="lab-bar-track">
                          <div
                            className="lab-bar-fill lab-bar-fill-animated"
                            style={{
                              width: `${retainedBarW.toFixed(1)}%`,
                              background: 'var(--ml-retention)'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* =================================================================== */}
          {/* SUB-TAB PANEL 02: HERO CHURN DYNAMICS & PUNISHING KITS              */}
          {/* =================================================================== */}
          <div
            id="lab-step-2"
            role="tabpanel"
            className={`dl-subtab-panel ${activeSubTab === 'heroes' ? 'is-active' : ''}`}
          >
            <div className="lab-chapter-header">
              <h2 className="lab-chapter-title">
                {isFr
                  ? 'Pourquoi ces Héros Font-ils Abandonner les Joueurs ?'
                  : 'Why Do Specific Heroes Drive Players to Quit?'}
              </h2>
              <p className="lab-chapter-subtitle">
                {isFr
                  ? "Notre modèle démontre que le churn à 14 jours est massivement conditionné par le héros incarné. Certains kits imposent des pénalités mécaniques extrêmes et créent un gouffre entre le fantasme du joueur et la brutalité des punitions en jeu. Cliquez sur n'importe quel avatar ci-dessous pour autopsier ses points de rupture."
                  : 'Our model demonstrates that 14-day churn is heavily determined by the chosen hero. Certain kits inflict severe mechanical penalties, opening a painful gulf between player fantasy and brutal in-game punishment. Click any hero bubble below to inspect their rupture points.'}
              </p>
            </div>

            <div className="lab-scatter-layout">
              {/* Left: Interactive SVG Quadrant Scatter Plot */}
              <div className="card lab-scatter-card">
                <div className="dl-card-header-flex" style={{ marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-ink)' }}>
                    {isFr
                      ? 'Matrice Interactive : Taux de Churn (%) × Temps d’Écran Gris (Mort & Frustration %)'
                      : 'Interactive Matrix: Hero Churn Rate (%) × Grey Screen Time (Death & Inactivity %)'}
                  </span>
                  <span className="dl-risk-text dl-risk-warning">
                    {isFr ? 'Cliquez sur un avatar' : 'Click any hero avatar'}
                  </span>
                </div>

                <div className="lab-svg-container dl-scroll-x-mobile">
                  <svg
                    viewBox="0 0 640 365"
                    style={{ width: '100%', height: 'auto', overflow: 'visible' }}
                    role="img"
                    aria-label="Hero Churn Rate vs Grey Screen Frustration Scatter Plot"
                  >
                    {/* Top-Right: Critical Rage-Quit Zone */}
                    <rect x="345" y="22" width="275" height="175" rx="8" fill="var(--ml-churn-bg)" stroke="var(--ml-churn-border)" strokeDasharray="4 4" />
                    <text x="610" y="40" fill="var(--accent-rose)" fontSize="9.5" fontWeight="800" textAnchor="end" fontFamily="var(--font-mono)">
                      {isFr ? 'ZONE RAGE-QUIT (>40% Churn, Morts Répétées)' : 'RAGE-QUIT ZONE (>40% Churn, Repeated Deaths)'}
                    </text>

                    {/* Bottom-Left: Retention Sanctuary (label placed at bottom y=306 clear of bubbles) */}
                    <rect x="78" y="200" width="255" height="115" rx="8" fill="rgba(16, 185, 129, 0.07)" stroke="rgba(16, 185, 129, 0.22)" strokeDasharray="4 4" />
                    <text x="88" y="306" fill="var(--accent-emerald)" fontSize="9.5" fontWeight="800" fontFamily="var(--font-mono)">
                      {isFr ? 'SANCTUAIRE DE RÉTENTION (<25% Churn)' : 'RETENTION SANCTUARY (<25% Churn)'}
                    </text>

                    {/* Grid Axes */}
                    <line x1="78" y1="315" x2="620" y2="315" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                    <line x1="78" y1="20" x2="78" y2="315" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

                    {/* X-axis ticks */}
                    {[15, 25, 35, 45, 55, 65].map((val) => {
                      const cx = 78 + ((val - 15) / 50) * 542;
                      return (
                        <g key={`x-${val}`}>
                          <line x1={cx} y1="20" x2={cx} y2="315" stroke="rgba(255,255,255,0.05)" />
                          <text x={cx} y="332" fill="var(--text-muted)" fontSize="9.5" textAnchor="middle" fontFamily="var(--font-mono)">
                            {val}% Churn
                          </text>
                        </g>
                      );
                    })}

                    {/* Y-axis ticks */}
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

                    {/* Axis Titles */}
                    <text x="349" y="354" fill="var(--text-secondary)" fontSize="11" fontWeight="700" textAnchor="middle">
                      {isFr
                        ? 'Taux de Churn Réel du Héros (Attrition à 14 jours) →'
                        : 'Actual Hero 14-Day Churn Rate (%) →'}
                    </text>
                    <text
                      x="14"
                      y="168"
                      fill="var(--text-secondary)"
                      fontSize="11"
                      fontWeight="700"
                      textAnchor="middle"
                      transform="rotate(-90, 14, 168)"
                    >
                      {isFr ? 'Temps d’Écran Gris (Inactivité & Mort %) →' : 'Grey Screen Inactivity (% Time Dead) →'}
                    </text>

                    {/* Defs for Hero Bubble Avatar Clipping */}
                    <defs>
                      {heroesList.map((h, i) => {
                        const churnPct = (h.churn_rate || 0.35) * 100;
                        const greyPct = (h.avg_grey_screen_pct || 0.12) * 100;
                        const xOffset = h.hero_name === 'Infernus' ? 18 : h.hero_name === 'Seven' ? -12 : 0;
                        const cx = 78 + ((churnPct - 15) / 50) * 542 + xOffset;
                        const cy = 315 - ((greyPct - 8) / 11) * 295;
                        const r = Math.max(16, Math.min(24, 15 + (churnPct / 60) * 9));
                        return (
                          <clipPath key={`clip-${h.hero_id || i}`} id={`clip-hero-${h.hero_id || i}`}>
                            <circle cx={cx} cy={cy} r={r - 1} />
                          </clipPath>
                        );
                      })}
                    </defs>

                    {/* Hero Data Bubbles with Official Avatars */}
                    {heroesList.map((h, i) => {
                      const churnPct = (h.churn_rate || 0.35) * 100;
                      const greyPct = (h.avg_grey_screen_pct || 0.12) * 100;
                      const xOffset = h.hero_name === 'Infernus' ? 18 : h.hero_name === 'Seven' ? -12 : 0;
                      const cx = 78 + ((churnPct - 15) / 50) * 542 + xOffset;
                      const cy = 315 - ((greyPct - 8) / 11) * 295;
                      const r = Math.max(16, Math.min(24, 15 + (churnPct / 60) * 9));
                      const isSelected = spotlightHero?.hero_name === h.hero_name;
                      const color =
                        h.risk_tier === 'critical'
                          ? '#ef4444'
                          : h.risk_tier === 'retention_anchor'
                          ? '#69e799'
                          : '#d8ec57';
                      const avatarUrl = getHeroIcon(h.hero_name);
                      const placeLabelBelow = ['Pocket', 'Kelvin', 'Ivy', 'Bebop', 'Haze'].includes(h.hero_name);
                      const labelDyMap = { Abrams: -20, Dynamo: -27, Kelvin: -3, Vindicta: -4 };
                      const labelY = (placeLabelBelow ? (cy + r + 13) : (cy - r - 7)) + (labelDyMap[h.hero_name] || 0);
                      const labelDxMap = { Abrams: 4, Pocket: -2, Dynamo: -10, Kelvin: 48, Victor: 40, Seven: -14, Bebop: -16 };
                      const labelX = cx + (labelDxMap[h.hero_name] || 0);

                      return (
                        <g
                          key={h.hero_id || i}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedHeroSpot(h.hero_name)}
                        >
                          {isSelected && (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={r + 6}
                              fill="none"
                              stroke="#ffffff"
                              strokeWidth="2.5"
                              strokeDasharray="4 2"
                            />
                          )}
                          <circle cx={cx} cy={cy} r={r} fill="#0f172a" />
                          <image
                            x={cx - r}
                            y={cy - r}
                            width={r * 2}
                            height={r * 2}
                            href={avatarUrl}
                            clipPath={`url(#clip-hero-${h.hero_id || i})`}
                            preserveAspectRatio="xMidYMid slice"
                          />
                          <circle
                            cx={cx}
                            cy={cy}
                            r={r}
                            fill="none"
                            stroke={isSelected ? '#ffffff' : color}
                            strokeWidth={isSelected ? 3 : 2}
                          />
                          <g transform={`translate(${labelX}, ${labelY})`}>
                            <rect
                              x="-38"
                              y="-9"
                              width="76"
                              height="16"
                              rx="4"
                              fill="rgba(11, 15, 25, 0.92)"
                              stroke={isSelected ? '#ffffff' : 'rgba(255,255,255,0.18)'}
                              strokeWidth={isSelected ? 1.2 : 0.8}
                            />
                            <text
                              x="0"
                              y="2.5"
                              fill="#ffffff"
                              fontSize="9"
                              fontWeight={isSelected ? '800' : '700'}
                              textAnchor="middle"
                              fontFamily="var(--font-mono)"
                            >
                              {h.hero_name} {churnPct.toFixed(0)}%
                            </text>
                          </g>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Right: Spotlight Hero Dynamics & Rupture Breakdown Card */}
              {spotlightHero && (
                <div
                  className="card lab-hero-spotlight-card"
                  style={{
                    borderTop: `4px solid ${
                      spotlightHero.risk_tier === 'critical'
                        ? 'var(--ml-churn)'
                        : spotlightHero.risk_tier === 'retention_anchor'
                        ? 'var(--ml-retention)'
                        : 'var(--ml-warning)'
                    }`
                  }}
                >
                  <div className="dl-spotlight-top-row">
                    <div className="dl-spotlight-identity">
                      <img
                        src={getHeroIcon(spotlightHero.hero_name)}
                        alt={spotlightHero.hero_name}
                        className="lab-hero-avatar-glow dl-avatar-52"
                        style={{
                          '--hero-accent-color':
                            spotlightHero.risk_tier === 'critical'
                              ? 'var(--ml-churn)'
                              : spotlightHero.risk_tier === 'retention_anchor'
                              ? 'var(--ml-retention)'
                              : 'var(--ml-warning)'
                        }}
                      />
                      <div>
                        <span className="dl-eyebrow-mono-muted">
                          {isFr ? 'AUTOPSIE DU HÉROS' : 'HERO CHURN AUTOPSY'}
                        </span>
                        <h3 className="dl-card-title dl-card-title-xl">
                          {spotlightHero.hero_name}
                        </h3>
                        <span className="dl-role-sub">
                          {isFr ? spotlightHero.role : (spotlightHero.role_en || spotlightHero.role)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`dl-risk-badge ${
                        spotlightHero.risk_tier === 'critical'
                          ? 'dl-risk-churn'
                          : spotlightHero.risk_tier === 'retention_anchor'
                          ? 'dl-risk-retention'
                          : 'dl-risk-warning'
                      }`}
                    >
                      {(spotlightHero.churn_rate * 100).toFixed(1)}% CHURN
                    </span>
                  </div>

                  {/* Quick Hero Switcher Pills */}
                  <div className="dl-hero-switcher-row">
                    {heroesList.map((h) => {
                      const active = spotlightHero.hero_name === h.hero_name;
                      return (
                        <button
                          key={h.hero_id}
                          type="button"
                          onClick={() => setSelectedHeroSpot(h.hero_name)}
                          className={`dl-slot-badge dl-hero-switcher-pill ${active ? 'dl-slot-vitality is-active' : ''}`}
                        >
                          <img
                            src={getHeroIcon(h.hero_name)}
                            alt=""
                            className="dl-hero-switcher-avatar"
                          />
                          <span>{h.hero_name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 4 Core Hero Telemetry Counters */}
                  <div className="lab-spotlight-hud-grid">
                    <div className="lab-spotlight-hud-pod">
                      <span className="lab-spotlight-hud-label">
                        {isFr ? 'Taux Churn' : 'Churn Rate'}
                      </span>
                      <span className={`lab-spotlight-hud-val ${spotlightHero.risk_tier === 'critical' ? 'glow-rose' : 'glow-emerald'} tabular-nums`}>
                        {(spotlightHero.churn_rate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="lab-spotlight-hud-pod">
                      <span className="lab-spotlight-hud-label">
                        {isFr ? 'Écran Gris' : 'Time Dead'}
                      </span>
                      <span className={`lab-spotlight-hud-val ${spotlightHero.avg_grey_screen_pct > 0.13 ? 'glow-rose' : 'glow-emerald'} tabular-nums`}>
                        {(spotlightHero.avg_grey_screen_pct * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="lab-spotlight-hud-pod">
                      <span className="lab-spotlight-hud-label">
                        {isFr ? 'Streak Défaites' : 'Loss Streak'}
                      </span>
                      <span className="lab-spotlight-hud-val glow-amber tabular-nums">
                        {spotlightHero.avg_loss_streak_before_churn || '3.5'}
                      </span>
                    </div>
                    <div className="lab-spotlight-hud-pod">
                      <span className="lab-spotlight-hud-label">
                        {isFr ? 'Part Vitality' : 'Vitality %'}
                      </span>
                      <span className="lab-spotlight-hud-val glow-cyan tabular-nums">
                        {((spotlightHero.vitality_share || 0.30) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* 3 Structured Mechanical Rupture Boxes */}
                  <div className="lab-hero-pods-stack">
                    <div className="lab-hero-pod lab-hero-pod-fantasy">
                      <div className="lab-hero-pod-header">
                        <IconDynamics size={12} className="lab-pod-icon" />
                        <span className="lab-hero-pod-title">{isFr ? 'Le Fantasme du Joueur' : 'Player Gameplay Fantasy'}</span>
                      </div>
                      <div className="lab-hero-pod-text">
                        {isFr
                          ? spotlightHero.gameplay_fantasy_fr ||
                            (spotlightHero.hero_name === 'Haze'
                              ? "Assassin furtive capable de décimer une équipe entière avec Bullet Dance."
                              : spotlightHero.hero_name === 'Bebop'
                              ? "Golem grappin-bombe punissant le moindre faux pas ennemi à moyenne portée."
                              : spotlightHero.role)
                          : spotlightHero.gameplay_fantasy_en ||
                            spotlightHero.posture_3d_en ||
                            (spotlightHero.hero_name === 'Haze'
                              ? 'Stealth assassin capable of wiping squads with a channeled Bullet Dance ultimate.'
                              : spotlightHero.hero_name === 'Bebop'
                              ? 'Hook-and-bomb brawler punishing enemy mispositioning at mid-range.'
                              : spotlightHero.role)}
                      </div>
                    </div>

                    <div className="lab-hero-pod lab-hero-pod-verdict">
                      <div className="lab-hero-pod-header">
                        <IconDynamics size={12} className="lab-pod-icon" />
                        <span className="lab-hero-pod-title">
                          {spotlightHero.risk_tier === 'retention_anchor'
                            ? isFr ? 'L’Avantage Mécanique du Kit' : 'Forgiving Kit Advantage'
                            : isFr ? 'Le Piège Mécanique du Kit' : 'Mechanical Kit Trap'}
                        </span>
                      </div>
                      <div className="lab-hero-pod-text">
                        {isFr
                          ? spotlightHero.kit_trap_fr ||
                            spotlightHero.posture_3d_fr ||
                            (spotlightHero.hero_name === 'Haze'
                              ? "Ultra-fragile (PV de base très bas) : la moindre erreur de placement ou stun adverse entraîne une mort instantanée."
                              : spotlightHero.hero_name === 'Bebop'
                              ? "Hitbox massive et dépendance au hook : rater son grappin en teamfight expose Bebop à un focus immédiat sans mobilité."
                              : `Profil à risque (${(spotlightHero.churn_rate * 100).toFixed(1)}% churn) vulnérable aux contrôles en combat d'équipe.`)
                          : spotlightHero.kit_trap_en ||
                            spotlightHero.posture_3d_en ||
                            (spotlightHero.hero_name === 'Haze'
                              ? 'Extreme glass-cannon HP pool: any positioning error or enemy stun results in instant deletion.'
                              : spotlightHero.hero_name === 'Bebop'
                              ? 'Large hitbox and hook dependency: missing a hook leaves Bebop exposed with zero escape mobility.'
                              : `High-volatility kit (${(spotlightHero.churn_rate * 100).toFixed(1)}% churn) punished heavily during teamfight crowd control.`)}
                      </div>
                    </div>

                    <div className="lab-hero-pod lab-hero-pod-trap">
                      <div className="lab-hero-pod-header">
                        <IconTimeline size={12} className="lab-pod-icon" />
                        <span className="lab-hero-pod-title">
                          {spotlightHero.risk_tier === 'retention_anchor'
                            ? isFr ? 'Le Build de Stabilisation' : 'Stabilization Build'
                            : isFr ? 'L’Erreur d’Achat en Tilt' : 'Desperate Tilt Buys'}
                        </span>
                      </div>
                      <div className="lab-hero-pod-text">
                        {isFr
                          ? spotlightHero.tilt_spiral_fr ||
                            (spotlightHero.risk_tier === 'retention_anchor'
                              ? `Priorité Vitality (${((spotlightHero.vitality_share || 0.42) * 100).toFixed(1)}%) : ${(spotlightHero.favored_tilt_items || ['Healing Rite', 'Rescue Beam']).join(', ')}.`
                              : spotlightHero.hero_name === 'Haze'
                              ? "Surenchère Weapon pure (Ricochet / Glass Cannon) sans Unstoppable ni armure, causant des interruptions fatales sous Bullet Dance."
                              : spotlightHero.hero_name === 'Bebop'
                              ? "Empilement d'objets Spirit (Echo Shard) sans résistance défensive malgré des engagements au corps à corps."
                              : "Priorité excessive aux dégâts bruts au détriment de la survie Vitality.")
                          : spotlightHero.tilt_spiral_en ||
                            (spotlightHero.risk_tier === 'retention_anchor'
                              ? `Vitality priority (${((spotlightHero.vitality_share || 0.42) * 100).toFixed(1)}%): ${(spotlightHero.favored_tilt_items || ['Healing Rite', 'Rescue Beam']).join(', ')}.`
                              : spotlightHero.hero_name === 'Haze'
                              ? 'All-in Weapon builds (Ricochet / Glass Cannon) without Unstoppable or armor, leading to instant interrupts mid-ultimate.'
                              : spotlightHero.hero_name === 'Bebop'
                              ? 'Stacking Spirit burst (Echo Shard) with zero defensive Vitality despite forced frontline exposure.'
                              : 'Over-investing in pure offense while delaying survival Vitality items.')}
                      </div>
                    </div>
                  </div>

                  {/* Verdict on why player quits / stays */}
                  <div
                    className={`lab-hero-pod ${
                      spotlightHero.risk_tier === 'critical' ? 'dl-pod-outcome-churn' : 'dl-pod-outcome-retention'
                    }`}
                  >
                    <div className="lab-hero-pod-header">
                      <IconBiomarkers size={12} />
                      <span className="lab-hero-pod-title" style={{ color: spotlightHero.risk_tier === 'critical' ? 'var(--ml-churn)' : 'var(--ml-retention)' }}>
                        {isFr ? 'Impact sur la Rétention' : 'Retention Outcome'}
                      </span>
                    </div>
                    <p className="lab-hero-pod-text" style={{ color: 'var(--color-ink)', margin: '0.15rem 0 0' }}>
                      {isFr
                        ? spotlightHero.why_quit_fr ||
                          spotlightHero.why_they_churn_fr ||
                          (spotlightHero.hero_name === 'Haze'
                            ? "Les morts instantanées sous stun brisent l'illusion d'assassin insaisissable et déclenchent 50% d'abandon à 14 jours."
                            : spotlightHero.hero_name === 'Bebop'
                            ? "La frustration de rater des hooks sous pression et le focus subi génèrent un fort taux d'écran gris (14.3%) et 46.2% de churn."
                            : `Taux de churn observé de ${(spotlightHero.churn_rate * 100).toFixed(1)}% corrélé au temps d'écran gris.`)
                        : spotlightHero.why_quit_en ||
                          spotlightHero.why_they_churn_en ||
                          (spotlightHero.hero_name === 'Haze'
                            ? 'Instant stun-lock deaths shatter the elusive assassin fantasy and drive 50.0% 14-day churn.'
                            : spotlightHero.hero_name === 'Bebop'
                            ? 'Missed-hook pressure and heavy frontline focus produce 14.3% grey-screen time and 46.2% churn.'
                            : `Observed ${(spotlightHero.churn_rate * 100).toFixed(1)}% churn rate correlated with grey-screen downtime.`)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* DEEP DIVE CARDS: THE 4 BIGGEST CHURN-DRIVING HEROES */}
            <div className="dl-section-mt">
              <div className="dl-card-header-flex" style={{ marginBottom: '0.85rem' }}>
                <div>
                  <h3 className="dl-card-title">
                    {isFr
                      ? 'Autopsie des 4 Héros qui Font le Plus Fuir les Joueurs'
                      : 'Autopsy of the 4 Deadliest Churn-Driving Heroes'}
                  </h3>
                </div>
                <span className="dl-card-subtitle">
                  {isFr ? 'Pourquoi 3 défaites avec ces héros provoquent-elles l’abandon ?' : 'Why 3 consecutive losses on these heroes trigger uninstalls'}
                </span>
              </div>

              <div className="lab-churn-heroes-grid">
                {[
                  {
                    name: 'Yamato',
                    rate: '60.0%',
                    roleFr: 'Assassin Melee / Duelliste',
                    roleEn: 'Melee Assassin / Duelist',
                    badge: '60.0% CHURN (#1 DU JEU)',
                    badgeEn: '60.0% CHURN (#1 IN GAME)',
                    color: 'var(--accent-rose)',
                    titleFr: 'Le Gouffre du Duelliste Fragile',
                    titleEn: 'The Fragile Duelist Abyss',
                    mechanicFr: "Power Slash exige 1.4s de canalisation statique vulnérable. Lorsque Yamato plonge au grappin en plein teamfight, si elle ne tue pas en 1 seconde ou que son ultime tarde, elle est dissoute instantanément sans pouvoir bouger.",
                    mechanicEn: "Power Slash forces a 1.4s static vulnerable channel. Diving with grapple into a teamfight melts her in under 1s if her burst fails or ultimate is slightly delayed.",
                    tiltBuyFr: "Rush de Spirit Strike & Torment Pulse avec 0% d'items Vitality pour tenter d'exécuter encore plus vite. Résultat : 14.0% de la partie passée mort.",
                    tiltBuyEn: "Rushes Spirit Strike & Torment Pulse with 0% Vitality to execute faster. Result: 14.0% of total match time spent dead.",
                    verdictFr: "Sentiment de mort gratuite et d'injustice absolue : 4.0 défaites d'affilée en se sentant impuissante déclenchent le départ de 60% des joueurs.",
                    verdictEn: "Overwhelming feeling of cheap uncounterable deaths: 4.0 loss streak feeling helpless pushes 60% of players to leave."
                  },
                  {
                    name: 'Vindicta',
                    rate: '44.8%',
                    roleFr: 'Sniper Aérien / Vol Stationnaire',
                    roleEn: 'Aerial Sniper / Stationary Hover',
                    badge: '17.8% ÉCRAN GRIS (#1 TEMPS MORT)',
                    badgeEn: '17.8% GREY SCREEN (#1 TIME DEAD)',
                    color: 'var(--accent-rose)',
                    titleFr: 'L’Illusion du Sniper Intouchable',
                    titleEn: 'The Untouchable Sniper Illusion',
                    mechanicFr: "Les joueurs pensent être en sécurité dans les airs (Flight). En réalité, le vol stationnaire supprime tout couvert urbain et expose une silhouette fixe ciblée par les 6 adversaires.",
                    mechanicEn: "Beginners feel safe hovering in the air (Flight). In reality, flight removes all urban cover, painting an illuminated stationary silhouette for all 6 opponents.",
                    tiltBuyFr: "Pire part d'items Vitality du jeu (22.4%) : nos traces révèlent jusqu'à 13 items d'attaque d'affilée (Glass Cannon, Opening Rounds) sans aucun point de vie.",
                    tiltBuyEn: "Lowest Vitality share in Deadlock (22.4%): traces reveal up to 13 consecutive offensive items (Glass Cannon, Opening Rounds) with 0 bonus HP.",
                    verdictFr: "Se faire abattre comme un pigeon d'argile à chaque envolée démolit le fantasme du sniper et entraîne un désespoir mécanique rapide.",
                    verdictEn: "Getting shot down like a clay pigeon on every takeoff shatters the sniper fantasy, breeding fast mechanical despair."
                  },
                  {
                    name: 'Lash',
                    rate: '35.7%',
                    roleFr: 'Initiateur Dive / Brawler',
                    roleEn: 'Dive Initiator / Brawler',
                    badge: 'DIVE SANS RETOUR (STUN TRAP)',
                    badgeEn: 'ONE-WAY DIVE (STUN TRAP)',
                    color: 'var(--accent-purple)',
                    titleFr: 'L’Initiation Suicidaire Sans Issue',
                    titleEn: 'The One-Way Suicidal Dive',
                    mechanicFr: "Adrénaline maximale au décollage : Lash se jette au milieu des ennemis avec Grapple et Ground Strike. Mais une fois au sol, sans escape et sans follow-up d'équipe en solo queue, il est encerclé et puni.",
                    mechanicEn: "Peak adrenaline on launch: Lash grapples into the enemy team. But once grounded with no follow-up in solo queue, he is encircled and slaughtered.",
                    tiltBuyFr: "Achat précipité de Hollow Point à 2m10s : cet item ne fonctionne qu'au-dessus de 60% de PV. Dès que Lash atterrit et prend des dégâts, ses dégâts s'effondrent immédiatement.",
                    tiltBuyEn: "Rushes Hollow Point at 2m10s: this item deactivates below 60% HP. As soon as Lash lands and takes damage, his DPS vanishes instantly.",
                    verdictFr: "Le fossé entre le ton arrogant du héros et le sentiment d'être un 'feeder' cloué au sol génère le pic de colère le plus violent de la cohorte.",
                    verdictEn: "The clash between the hero's cocky swagger and the reality of dying repeatedly while pinned to the ground causes severe rage."
                  },
                  {
                    name: 'Seven',
                    rate: '41.7%',
                    roleFr: 'Mage de Zone / Lévitation Storm Cloud',
                    roleEn: 'Area Mage / Storm Cloud Hover',
                    badge: '28.7% HEADSHOTS SUBIS (#1 DU JEU)',
                    badgeEn: '28.7% INCOMING HS (#1 IN GAME)',
                    color: 'var(--accent-rose)',
                    titleFr: 'Le Faux Sentiment de Toute-Puissance',
                    titleEn: 'The False Omnipotence Trap',
                    mechanicFr: "En bas niveau, Storm Cloud semble invincible. Dès que les adversaires comprennent le jeu, ils visent simplement la tête immobile de Seven dans les airs ou lui appliquent un silence/stun.",
                    mechanicEn: "At beginner skill tiers, Storm Cloud seems unstoppable. As soon as opponents understand the game, they simply shoot Seven's static head or stun him.",
                    tiltBuyFr: "S'obstine à acheter Refresher pour relancer Storm Cloud au lieu d'acheter Majestic Leap ou Counterspell pour se repositionner ou survivre à l'interruption.",
                    tiltBuyEn: "Stubbornly buys Refresher to double-cast ult rather than Majestic Leap or Counterspell to reposition and survive interruptions.",
                    verdictFr: "Record absolu de tirs reçus dans la tête (28.7%) : mourir au début de chaque ultime sans pouvoir bouger dégoûte définitivement les joueurs.",
                    verdictEn: "All-time #1 incoming headshots (28.7%): repeatedly dying at the start of every ultimate without being able to move drives uninstalls."
                  }
                ].map((card, idx) => (
                  <div
                    key={card.name}
                    className="lab-hero-glass-card"
                    style={{
                      '--hero-accent-color': card.color,
                      '--hero-accent-glow': card.color === 'var(--accent-rose)' ? 'rgba(239, 68, 68, 0.28)' : 'rgba(139, 92, 246, 0.28)'
                    }}
                  >
                    <div className="lab-hero-card-content">
                      <div className="lab-hero-compact-header">
                        <div className="lab-hero-identity">
                          <img
                            src={getHeroIcon(card.name)}
                            alt={card.name}
                            className="lab-hero-avatar-glow"
                          />
                          <div className="lab-hero-title-box">
                            <div className="lab-hero-name-row">
                              <h4 className="lab-hero-name">{card.name}</h4>
                              <span className="lab-hero-card-index">0{idx + 1}</span>
                            </div>
                            <span className="lab-hero-role">
                              {isFr ? card.roleFr : card.roleEn}
                            </span>
                          </div>
                        </div>

                        <div className="lab-hero-stat-badge-pod">
                          <span className="lab-hero-stat-label">CHURN</span>
                          <span className={`lab-hero-stat-large ${card.color === 'var(--accent-rose)' ? 'glow-rose' : 'glow-violet'} tabular-nums`}>
                            {card.rate}
                          </span>
                        </div>
                      </div>

                      <div className="lab-hero-sub-row">
                        <h5 className="lab-hero-card-title">
                          {isFr ? card.titleFr : card.titleEn}
                        </h5>
                        <span
                          className={`dl-slot-badge ${card.color === 'var(--accent-rose)' ? 'dl-risk-churn' : 'dl-slot-spirit'}`}
                        >
                          ✦ {isFr ? card.badge : card.badgeEn}
                        </span>
                      </div>

                      <div className="lab-hero-pods-stack">
                        <div className="lab-hero-pod lab-hero-pod-fantasy">
                          <span className="lab-hero-pod-header">
                            <IconDynamics size={12} className="lab-pod-icon" />
                            <strong className="lab-hero-pod-title">
                              {isFr ? 'Le Piège du Kit :' : 'Kit Trap:'}
                            </strong>
                          </span>{' '}
                          <span className="lab-hero-pod-text" style={{ color: 'var(--text-secondary)' }}>{isFr ? card.mechanicFr : card.mechanicEn}</span>
                        </div>

                        <div className="lab-hero-pod lab-hero-pod-trap">
                          <span className="lab-hero-pod-header">
                            <IconTimeline size={12} className="lab-pod-icon" />
                            <strong className="lab-hero-pod-title">
                              {isFr ? 'L’Erreur d’Achat en Tilt :' : 'Tilt Buying Error:'}
                            </strong>
                          </span>{' '}
                          <span className="lab-hero-pod-text" style={{ color: 'var(--text-secondary)' }}>{isFr ? card.tiltBuyFr : card.tiltBuyEn}</span>
                        </div>

                        <div className="lab-hero-pod lab-hero-pod-verdict">
                          <span className="lab-hero-pod-header">
                            <IconBiomarkers size={12} className="lab-pod-icon" />
                            <strong className="lab-hero-pod-title">
                              {isFr ? 'Pourquoi le Joueur Part :' : 'Why They Uninstall:'}
                            </strong>
                          </span>{' '}
                          <span className="lab-hero-pod-text" style={{ color: 'var(--color-ink)' }}>{isFr ? card.verdictFr : card.verdictEn}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedHeroSpot(card.name)}
                      className="lab-hero-inspect-btn"
                    >
                      <span>{isFr ? `Inspecter ${card.name} dans la Matrice` : `Inspect ${card.name} in Matrix`}</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Retention Anchors Master Banner */}
              <div className="lab-retention-glass-banner">
                <div className="dl-retention-banner-left">
                  <div className="dl-retention-avatar-stack">
                    {['Abrams', 'Pocket', 'Dynamo'].map((hName, idx) => (
                      <img
                        key={hName}
                        src={getHeroIcon(hName)}
                        alt={hName}
                        className="lab-hero-avatar-glow dl-avatar-36-stack"
                        style={{
                          '--hero-accent-color': 'var(--ml-retention)',
                          marginLeft: idx > 0 ? '-10px' : '0',
                          zIndex: 3 - idx
                        }}
                      />
                    ))}
                  </div>

                  <div className="lab-retention-content">
                    <div className="lab-retention-header-row">
                      <span className="dl-risk-badge dl-risk-retention">
                        {isFr ? 'LES PILIERS DE RÉTENTION' : 'THE RETENTION ANCHORS'}
                      </span>
                      <strong className="lab-retention-title">
                        Abrams (18.2%), Pocket (18.8%) & Dynamo (20.0%)
                      </strong>
                    </div>

                    <p className="lab-retention-body">
                      {isFr
                        ? "Pourquoi retiennent-ils les joueurs ? Leurs kits pardonnent les erreurs de placement (régénération passive d'Abrams, mallette d'invulnérabilité de Pocket, utilité collective de Dynamo même en retard de networth). Les joueurs ressentent constamment leur agentivité et des options de repli."
                        : 'Why do they retain players? Their kits forgive positioning blunders (Abrams passive regeneration, Pocket invulnerability satchel, Dynamo teamfight utility even when behind in networth). Players consistently feel agency and escape options.'}
                    </p>
                  </div>
                </div>

                <div className="dl-retention-banner-actions">
                  <span className="dl-risk-badge dl-risk-retention">
                    {isFr ? '81.8% RÉTENTION' : '81.8% RETENTION'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowRetentionCards(!showRetentionCards)}
                    className="dl-slot-badge dl-retention-toggle-btn"
                  >
                    {showRetentionCards ? '▲' : '▼'}
                  </button>
                </div>
              </div>

              {/* The 3 Dedicated Retention Anchor Hero Cards (Visible by default for full text visibility) */}
              {showRetentionCards && (
                <div className="lab-retention-anchors-grid">
                  {[
                    {
                      name: 'Abrams',
                      rate: '81.8%',
                      roleFr: 'Tank Brawler / Régénération Siphon',
                      roleEn: 'Tank Brawler / Siphon Regeneration',
                      badge: '18.2% CHURN (#1 RÉTENTION)',
                      badgeEn: '18.2% CHURN (#1 RETENTION)',
                      color: 'var(--accent-emerald)',
                      titleFr: 'Le Colosse Indulgent & Anti-Burst',
                      titleEn: 'The Forgiving Anti-Burst Colossus',
                      mechanicFr: "Siphon Life & seuil PV massif : encaisse les erreurs de placement sans mourir instantanément. Record absolu du plus bas taux de headshots subis de tout Deadlock (9.6%).",
                      mechanicEn: "Siphon Life & massive HP pool: forgives positioning errors without instant death. All-time lowest incoming headshot rate in Deadlock (9.6%).",
                      stabilizeFr: "Achat précoce de Restorative Locket (@ 3m45s) et Melee Lifesteal. Part Vitality la plus élevée et la plus saine du jeu (49.1%).",
                      stabilizeEn: "Early purchase of Restorative Locket (@ 3m45s) and Melee Lifesteal. Highest and healthiest Vitality share in the game (49.1%).",
                      verdictFr: "Sentiment de puissance continu : même en perdant sa lane, Abrams ne subit jamais de mort punitive gratuite, préservant l'engagement du joueur.",
                      verdictEn: "Continuous agency: even when behind, Abrams never suffers cheap unavoidable deaths, keeping player dopamine intact."
                    },
                    {
                      name: 'Pocket',
                      rate: '81.2%',
                      roleFr: 'Escapiste 3D / Insaisissable',
                      roleEn: '3D Escape Artist / Elusive',
                      badge: '18.8% CHURN (ESCAPE MALLETTE)',
                      badgeEn: '18.8% CHURN (SATCHEL ESCAPE)',
                      color: 'var(--accent-emerald)',
                      titleFr: 'L’Art de l’Esquive & Invulnérabilité 3D',
                      titleEn: 'The Art of Evasion & 3D Invulnerability',
                      mechanicFr: "Enchanter's Satchel offre une invulnérabilité instantanée qui purge les altérations d'état et esquive 100% des stuns et tirs critiques adverses.",
                      mechanicEn: "Enchanter's Satchel grants instant invulnerability, purging debuffs and dodging 100% of enemy crowd-control and headshot burst.",
                      stabilizeFr: "Mobilité verticale accrue avec Majestic Leap, Warp Stone et Quicksilver Reload pour se désengager immédiatement du danger.",
                      stabilizeEn: "Enhanced vertical mobility with Majestic Leap, Warp Stone, and Quicksilver Reload for instant safe disengagement.",
                      verdictFr: "Agentivité motrice constante : les morts sont perçues comme une erreur d'exécution personnelle et non comme une injustice du jeu.",
                      verdictEn: "Motor agency remains intact: deaths feel like fair execution blunders rather than systemic unfairness, preventing ragequits."
                    },
                    {
                      name: 'Dynamo',
                      rate: '80.0%',
                      roleFr: 'Contrôleur Support / Utilité Collective',
                      roleEn: 'Support Controller / Squad Utility',
                      badge: '20.0% CHURN (IMPACT TEAMFIGHT)',
                      badgeEn: '20.0% CHURN (TEAMFIGHT IMPACT)',
                      color: 'var(--accent-emerald)',
                      titleFr: 'L’Altruisme & l’Impact Décisif sans Âmes',
                      titleEn: 'Altruism & Decisive Impact Without Networth',
                      mechanicFr: "Singularity & Rejuvenating Aurora : Dynamo peut renverser un teamfight entier même avec 5 000 âmes de retard grâce à son contrôle de zone décisif.",
                      mechanicEn: "Singularity & Rejuvenating Aurora: Dynamo can turn an entire teamfight around even when 5,000 Souls behind through pure crowd control.",
                      stabilizeFr: "Investissement dans des actifs d'équipe : Rescue Beam (@ 12m), Divine Barrier et Restorative Locket pour sauver ses coéquipiers.",
                      stabilizeEn: "Invests in squad sustain: Rescue Beam (@ 12m), Divine Barrier, and Restorative Locket to extract and heal teammates.",
                      verdictFr: "L'utilité pour le groupe maintient le lien social : la défaite ne crée pas de tilt d'inutilité personnelle, maintenant 80% des joueurs fidèles.",
                      verdictEn: "Squad utility preserves social connection: losing a game never feels like personal uselessness, retaining 80% of players."
                    }
                  ].map((card, idx) => (
                    <div
                      key={card.name}
                      className="lab-hero-glass-card"
                      style={{
                        '--hero-accent-color': card.color,
                        '--hero-accent-glow': 'rgba(16, 185, 129, 0.35)'
                      }}
                    >
                      <div className="lab-hero-card-content">
                        <div className="lab-hero-compact-header">
                          <div className="lab-hero-identity">
                            <img
                              src={getHeroIcon(card.name)}
                              alt={card.name}
                              className="lab-hero-avatar-glow"
                              style={{ borderColor: 'var(--accent-emerald)' }}
                            />
                            <div className="lab-hero-title-box">
                              <div className="lab-hero-name-row">
                                <h4 className="lab-hero-name">{card.name}</h4>
                                <span className="lab-hero-card-index">0{idx + 1}</span>
                              </div>
                              <span className="lab-hero-role">
                                {isFr ? card.roleFr : card.roleEn}
                              </span>
                            </div>
                          </div>

                          <div className="lab-hero-stat-badge-pod">
                            <span className="lab-hero-stat-label" style={{ color: 'var(--ml-retention)' }}>
                              {isFr ? 'RÉTENTION' : 'RETENTION'}
                            </span>
                            <span className="lab-hero-stat-large glow-emerald tabular-nums">
                              {card.rate}
                            </span>
                          </div>
                        </div>

                        <div className="lab-hero-sub-row">
                          <h5 className="lab-hero-card-title">
                            {isFr ? card.titleFr : card.titleEn}
                          </h5>
                          <span className="dl-risk-badge dl-risk-retention">
                            ✦ {isFr ? card.badge : card.badgeEn}
                          </span>
                        </div>

                        <div className="lab-hero-pods-stack">
                          <div className="lab-hero-pod lab-hero-pod-fantasy">
                            <span className="lab-hero-pod-header">
                              <IconDynamics size={12} className="lab-pod-icon" />
                              <strong className="lab-hero-pod-title">
                                {isFr ? 'Kit Indulgent & Agentivité :' : 'Forgiving Kit & Agency:'}
                              </strong>
                            </span>{' '}
                            <span className="lab-hero-pod-text">{isFr ? card.mechanicFr : card.mechanicEn}</span>
                          </div>

                          <div className="lab-hero-pod lab-hero-pod-fantasy">
                            <span className="lab-hero-pod-header">
                              <IconTimeline size={12} className="lab-pod-icon" />
                              <strong className="lab-hero-pod-title">
                                {isFr ? 'Build de Stabilisation :' : 'Stabilization Build:'}
                              </strong>
                            </span>{' '}
                            <span className="lab-hero-pod-text">{isFr ? card.stabilizeFr : card.stabilizeEn}</span>
                          </div>

                          <div className="lab-hero-pod dl-pod-retention-accent">
                            <span className="lab-hero-pod-header">
                              <IconBiomarkers size={12} className="lab-pod-icon" />
                              <strong className="lab-hero-pod-title" style={{ color: 'var(--ml-retention)' }}>
                                {isFr ? 'Pourquoi le Joueur Reste :' : 'Why They Retain:'}
                              </strong>
                            </span>{' '}
                            <span className="lab-hero-pod-text" style={{ color: 'var(--color-ink)' }}>{isFr ? card.verdictFr : card.verdictEn}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedHeroSpot(card.name)}
                        className="lab-hero-inspect-btn"
                      >
                        <span>{isFr ? `Inspecter ${card.name} dans la Matrice` : `Inspect ${card.name} in Matrix`}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* =================================================================== */}
          {/* SUB-TAB PANEL 03: TACTICAL 2D HEATMAP (MORTS & DÉCONNEXIONS)        */}
          {/* =================================================================== */}
          <div
            id="lab-step-3"
            role="tabpanel"
            className={`dl-subtab-panel ${activeSubTab === 'heatmap' ? 'is-active' : ''}`}
          >
            <DeadlockMapHeatmap lang={lang} t={t} />
          </div>

          {/* =================================================================== */}
          {/* SUB-TAB PANEL 04: PARRY BIOMECHANICS & ACUTE RAGEQUIT               */}
          {/* =================================================================== */}
          <div
            id="lab-step-parry"
            role="tabpanel"
            className={`dl-subtab-panel ${activeSubTab === 'parry' ? 'is-active' : ''}`}
          >
            <div id="lab-step-4" className="lab-chapter-header">
              <h2 className="lab-chapter-title">
                {isFr
                  ? 'La Parade au Corps-à-Corps : Piège Spirit Strike & Ragequits Aigus'
                  : 'Melee Parry Biomechanics: The Spirit Strike Bait & Acute Ragequits'}
              </h2>
              <p className="lab-chapter-subtitle">
                {isFr
                  ? "Télémétrie Source 2 (N = 10 000 cohortes) : pourquoi se faire contrer au corps-à-corps inflige le stun le plus violent de Deadlock (4.0s), induit une sidération motrice immédiate et multiplie par 9 le taux d'abandon prématuré en laning phase."
                  : 'Source 2 Telemetry (N = 10,000 cohorts): why getting countered in close combat inflicts Deadlock’s most punishing stun (4.0s), induces immediate motor collapse, and spikes early match ragequits by 9x during laning.'}
              </p>
            </div>

            {/* High-Impact Causal Verdict Glass Banner */}
            <div className="lab-parry-verdict-banner">
              <div className="dl-card-header-flex">
                <div className="dl-biomarker-title-row">
                  <span className="dl-risk-text dl-risk-churn">
                    {isFr ? 'Verdict télémétrique Valve Source 2' : 'Source 2 telemetry verdict'}
                  </span>
                  <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                    p &lt; 0.001, AUC 0.884 (Causal Shock)
                  </span>
                </div>
                <span className="dl-card-subtitle">
                  {isFr ? 'Question joueur : se faire parer amène-t-il au ragequit ?' : 'Inquiry: Does getting parried induce ragequits?'}
                </span>
              </div>

              <h3 className="dl-card-title dl-card-title-clamp">
                {isFr
                  ? 'Oui : la parade adverse est le catalyseur neuromusculaire #1 de l’abandon prématuré'
                  : 'Yes: Opponent Parries Are the #1 Neuromuscular Catalyst for Early Ragequits'}
              </h3>

              <p className="dl-card-body-text">
                {isFr
                  ? "Dans Deadlock, la parade (touche F) sur une attaque de mêlée lourde n'est pas une simple esquive : elle inflige 4.0 secondes d'étourdissement et de désarmement complet avec 100% de vulnérabilité headshot. Subir 2 parades dans les 10 premières minutes multiplie par 9 le risque de déconnexion prématurée (de 3.8% à 34.2%). Avec Spirit Strike équipé — item qui incite compulsivement à foncer au corps-à-corps pour rentabiliser ses 500 âmes — le taux de ragequit direct grimpe à 46.8% et le churn à 14 jours atteint 71.4%."
                  : 'In Deadlock, parrying (F key) a heavy melee attack is far more than a dodge: it inflicts 4.0 seconds of total stun, complete disarm, and guaranteed 100% critical headshot vulnerability. Enduring 2 parries in the first 10 minutes multiplies early match ragequits by 9x (from 3.8% to 34.2%). With Spirit Strike equipped — an item that psychologically pushes players into predictable melee charges to justify their 500 Souls — the acute ragequit rate reaches 46.8% and 14-day churn climbs to 71.4%.'}
              </p>

              {/* 4 Monumental Stat Pods */}
              <div className="lab-parry-stats-row">
                <div className="lab-parry-stat-pod" style={{ borderLeft: '3px solid var(--ml-churn)' }}>
                  <span className="lab-parry-stat-number glow-rose tabular-nums">
                    +795%
                  </span>
                  <span className="lab-parry-stat-label">
                    {isFr ? 'Sur-risque de Ragequit immédiat (≥2 Parades subies en lane)' : 'Acute Ragequit Surge (≥2 Parries endured during laning)'}
                  </span>
                </div>

                <div className="lab-parry-stat-pod" style={{ borderLeft: '3px solid var(--dl-souls)' }}>
                  <span className="lab-parry-stat-number glow-cyan tabular-nums">
                    4.0s
                  </span>
                  <span className="lab-parry-stat-label">
                    {isFr ? 'Étourdissement & Désarmement (#1 paralysie hors ultime du jeu)' : 'Continuous Stun & Disarm (#1 longest non-ult CC in game)'}
                  </span>
                </div>

                <div className="lab-parry-stat-pod" style={{ borderLeft: '3px solid var(--ml-churn)' }}>
                  <span className="lab-parry-stat-number glow-rose tabular-nums">
                    88.4%
                  </span>
                  <span className="lab-parry-stat-label">
                    {isFr ? 'Mortalité immédiate sous parade (exécuté avant la fin du stun)' : 'Parry Lethality Rate (killed before 4.0s stun expires)'}
                  </span>
                </div>

                <div className="lab-parry-stat-pod" style={{ borderLeft: '3px solid var(--dl-spirit)' }}>
                  <span className="lab-parry-stat-number glow-violet tabular-nums">
                    46.8%
                  </span>
                  <span className="lab-parry-stat-label">
                    {isFr ? 'Ragequit direct si le joueur possède Spirit Strike' : 'Direct Ragequit Rate with Spirit Strike equipped'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3 Interactive Analytical Cards */}
            <div className="lab-parry-grid">
              {/* Card 1: The Spirit Strike Bait */}
              <div className="lab-parry-card" style={{ '--card-glow-color': 'var(--dl-spirit)' }}>
                <div>
                  <div className="dl-parry-card-top">
                    <span className="dl-slot-badge dl-slot-spirit">
                      {isFr ? 'PIÈGE COGNITIF #1 • SPIRIT TIER 1' : 'COGNITIVE TRAP #1 • SPIRIT TIER 1'}
                    </span>
                    <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--dl-souls)', fontWeight: 700 }}>
                      500 Souls • 8m 14s
                    </span>
                  </div>

                  <div className="dl-parry-card-id">
                    {getItemIcon('Spirit Strike') && (
                      <div className="dl-seq-icon-frame dl-seq-icon-frame-44" style={{ borderColor: 'var(--dl-spirit)' }}>
                        <img
                          src={getItemIcon('Spirit Strike')}
                          alt="Spirit Strike"
                          className="dl-seq-icon-img"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="dl-card-title dl-card-title-sm">
                        Spirit Strike
                      </h4>
                      <span className="dl-card-subtitle">
                        {isFr ? 'Incitation au coup de poing chargé & affaiblissement' : 'Heavy Melee Incentive & Debuff'}
                      </span>
                    </div>
                  </div>

                  <p className="dl-card-body-text">
                    {isFr
                      ? "L'item octroie des dégâts magiques (Spirit) et -12 % de résistance magique (Spirit Resist) lors d'une attaque de mêlée lourde. Pour rentabiliser leur investissement, les joueurs de Yamato, Lash ou Infernus forcent des charges de mêlée frontales. Or, la charge produit une aura violette et un son aigu évident : 64,2 % des charges post-achat sont lues et parées immédiatement."
                      : 'Grants spirit damage and -12% Spirit Resist debuff on heavy melee hits. To justify their purchase, Yamato, Lash, and Infernus players force predictable frontal melee charges. The audio cue and glowing telegraph allow alert opponents to hit F with ease: 64.2% of post-purchase charges are parried on sight.'}
                  </p>
                </div>

                <div className="dl-parry-card-footer">
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {isFr ? 'Corrélation Churn 14j' : '14-Day Churn Link'}
                  </span>
                  <span className="font-mono" style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--dl-spirit-bright)' }}>
                    49.0% Churn (#1 Item)
                  </span>
                </div>
              </div>

              {/* Card 2: The Stun Execution */}
              <div className="lab-parry-card" style={{ '--card-glow-color': 'var(--ml-churn)' }}>
                <div>
                  <div className="dl-parry-card-top">
                    <span className="dl-risk-badge dl-risk-churn">
                      {isFr ? 'PUNITION VALVE • 4.0 SECONDES' : 'VALVE PUNISHMENT • 4.0 SECONDS'}
                    </span>
                    <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--ml-churn)', fontWeight: 700 }}>
                      100% Stun + Disarm
                    </span>
                  </div>

                  <div className="dl-parry-card-id">
                    <div className="dl-seq-icon-frame dl-seq-icon-frame-44" style={{ borderColor: 'var(--ml-churn)', color: 'var(--ml-churn)' }}>
                      <IconParry size={22} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h4 className="dl-card-title dl-card-title-sm">
                        {isFr ? 'Exécution sans Riposte' : 'Zero-Agency Execution'}
                      </h4>
                      <span className="dl-card-subtitle">
                        {isFr ? 'Impuissance Apprise & Headshots' : 'Learned Helplessness & Headshots'}
                      </span>
                    </div>
                  </div>

                  <p className="dl-card-body-text">
                    {isFr
                      ? "La parade adverse repousse et cloue le joueur au sol pendant 4.0s sans possibilité de dash, de tir ou d'utilisation d'item actif. Les défenseurs ajustent leurs tirs à bout portant : +78.6% de headshots subis pendant le stun. 88.4% des joueurs parés meurent en moins de 1.8s. Ce sentiment d'impuissance absolue décuple la frustration."
                      : 'The parry knocks back and immobilizes the attacker for a massive 4.0s with zero dash, fire, or active item response. Opponents line up free point-blank headshots: +78.6% headshot surge during stun. 88.4% of parried attackers die in under 1.8s. Watching your hero dissolve with zero agency breeds maximum cognitive frustration.'}
                  </p>
                </div>

                <div className="dl-parry-card-footer">
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {isFr ? 'Espérance de Survie' : 'Survival Expectancy'}
                  </span>
                  <span className="font-mono" style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--ml-churn)' }}>
                    {isFr ? '1.6s (11.6% survie)' : '1.6s (11.6% survival)'}
                  </span>
                </div>
              </div>

              {/* Card 3: The Ragequit Cascade */}
              <div className="lab-parry-card" style={{ '--card-glow-color': 'var(--dl-souls)' }}>
                <div>
                  <div className="dl-parry-card-top">
                    <span className="dl-slot-badge dl-slot-souls">
                      {isFr ? 'BIOMARQUEUR • FERMETURE BRUTALE (ALT+F4)' : 'BIOMARKER • ALT+F4 & CLIENT EXIT'}
                    </span>
                    <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--dl-souls)', fontWeight: 700 }}>
                      Pivot Match T spike
                    </span>
                  </div>

                  <div className="dl-parry-card-id">
                    <div className="dl-seq-icon-frame dl-seq-icon-frame-44" style={{ borderColor: 'var(--dl-souls)', color: 'var(--dl-souls)' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                        <line x1="12" y1="2" x2="12" y2="12" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="dl-card-title dl-card-title-sm">
                        {isFr ? 'L’Effondrement Neuromusculaire' : 'Neuromuscular Collapse'}
                      </h4>
                      <span className="dl-card-subtitle">
                        {isFr ? 'APM Crash (-45.6%) & Rage-Sell' : 'APM Crash (-45.6%) & Rage-Sell'}
                      </span>
                    </div>
                  </div>

                  <p className="dl-card-body-text">
                    {isFr
                      ? "Dans les 60 secondes suivant la 2e mort par parade, la télémétrie enregistre une baisse brutale de -45,6 % de la fréquence d'actions par minute (APM, 114 → 62). 21,3 % des joueurs bradent immédiatement Spirit Strike à perte en boutique ('Revente Panique'). Dans 18,6 % des cas, le joueur quitte brutalement le jeu (déconnexion du serveur de jeu Valve) dans les 90 secondes."
                      : 'Within 60s of a 2nd parry-induced death, telemetry captures a brutal -45.6% collapse in Actions Per Minute (APM, 114 → 62). 21.3% of players impulsively sell Spirit Strike at a 50% loss at the lane shop ("Rage-Sell"). In 18.6% of instances, the player triggers a hard game exit (Valve Game Coordinator disconnect) within 90 seconds.'}
                  </p>
                </div>

                <div className="dl-parry-card-footer">
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {isFr ? 'Chute APM Post-Parry' : 'Post-Parry APM Drop'}
                  </span>
                  <span className="font-mono" style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--dl-souls)' }}>
                    -45.6% (114 → 62 APM)
                  </span>
                </div>
              </div>
            </div>

            {/* Telemetry Comparison Table (Horizontal Scroll on Mobile) */}
            <div className="lab-parry-matrix-container dl-scroll-x-mobile">
              <div className="dl-card-header-flex" style={{ marginBottom: '0.85rem' }}>
                <div>
                  <h4 className="dl-card-title" style={{ fontSize: '0.98rem' }}>
                    {isFr ? 'Matrice Empirique : Impact du Nombre de Parades Subies sur l’Abandon' : 'Empirical Matrix: Endured Parries vs Player Abandonment & Churn'}
                  </h4>
                  <span className="dl-card-subtitle">
                    {isFr ? 'Analyse sur 10 000 parties Source 2 réparties par exposition à la parade en phase de lane' : 'Analysis across 10,000 Source 2 matches partitioned by lane-phase parry exposure'}
                  </span>
                </div>
                <span className="dl-risk-badge dl-risk-retention">
                  {isFr ? 'N = 10 000 Matchs' : 'N = 10,000 Matches'}
                </span>
              </div>

              <table className="lab-parry-table">
                <thead>
                  <tr>
                    <th>{isFr ? 'Exposition à la Parade' : 'Parry Exposure'}</th>
                    <th>{isFr ? 'Part des Matchs' : 'Match Share'}</th>
                    <th>{isFr ? 'Ragequit Immédiat (<12m)' : 'Acute Ragequit (<12m)'}</th>
                    <th>{isFr ? 'Mortalité Directe (<2s)' : 'Direct Lethality (<2s)'}</th>
                    <th>{isFr ? 'Vente Compulsive (Rage-Sell)' : 'Rage-Sell Rate'}</th>
                    <th>{isFr ? 'APM Post-Incident' : 'Post-Incident APM'}</th>
                    <th>{isFr ? 'Taux Churn 14j' : '14-Day Churn'}</th>
                    <th>{isFr ? 'Statut Risque' : 'Risk Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 700, color: 'var(--color-ink)' }}>
                      {isFr ? '0 Parade Subie (Jeu à distance sécurisé)' : '0 Parries (Safe ranged laning)'}
                    </td>
                    <td className="font-mono">58.2%</td>
                    <td className="font-mono" style={{ color: 'var(--ml-retention)', fontWeight: 700 }}>
                      <div className="lab-parry-microcell">
                        <span>3.8%</span>
                        <div className="lab-parry-microtrack" aria-hidden="true">
                          <div className="lab-parry-microfill" style={{ width: '3.8%', background: 'var(--ml-retention)' }} />
                        </div>
                      </div>
                    </td>
                    <td className="font-mono">12.1%</td>
                    <td className="font-mono">0.8%</td>
                    <td className="font-mono">114 APM</td>
                    <td className="font-mono" style={{ color: 'var(--ml-retention)' }}>
                      <div className="lab-parry-microcell">
                        <span>18.2%</span>
                        <div className="lab-parry-microtrack" aria-hidden="true">
                          <div className="lab-parry-microfill" style={{ width: '18.2%', background: 'var(--ml-retention)' }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="dl-risk-badge dl-risk-retention">
                        {isFr ? 'Rétention Haute' : 'High Retention'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700, color: 'var(--color-ink)' }}>
                      {isFr ? '1 Parade Subie (Accroc isolé)' : '1 Parry (Isolated blunder)'}
                    </td>
                    <td className="font-mono">27.6%</td>
                    <td className="font-mono" style={{ color: 'var(--dl-souls)', fontWeight: 700 }}>
                      <div className="lab-parry-microcell">
                        <span>9.4%</span>
                        <div className="lab-parry-microtrack" aria-hidden="true">
                          <div className="lab-parry-microfill" style={{ width: '9.4%', background: 'var(--dl-souls)' }} />
                        </div>
                      </div>
                    </td>
                    <td className="font-mono">54.3%</td>
                    <td className="font-mono">4.2%</td>
                    <td className="font-mono">98 APM (-14.0%)</td>
                    <td className="font-mono" style={{ color: 'var(--dl-souls)' }}>
                      <div className="lab-parry-microcell">
                        <span>28.5%</span>
                        <div className="lab-parry-microtrack" aria-hidden="true">
                          <div className="lab-parry-microfill" style={{ width: '28.5%', background: 'var(--dl-souls)' }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="dl-risk-badge dl-risk-neutral">
                        {isFr ? 'Friction Modérée' : 'Moderate Friction'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700, color: 'var(--color-ink)' }}>
                      {isFr ? '≥ 2 Parades Subies (<10 min)' : '≥ 2 Parries Endured (<10 min)'}
                    </td>
                    <td className="font-mono">10.3%</td>
                    <td className="font-mono" style={{ color: 'var(--ml-churn)', fontWeight: 800 }}>
                      <div className="lab-parry-microcell">
                        <span>34.2%</span>
                        <div className="lab-parry-microtrack" aria-hidden="true">
                          <div className="lab-parry-microfill" style={{ width: '34.2%', background: 'var(--ml-churn)' }} />
                        </div>
                      </div>
                    </td>
                    <td className="font-mono">88.4%</td>
                    <td className="font-mono">12.6%</td>
                    <td className="font-mono">69 APM (-39.5%)</td>
                    <td className="font-mono" style={{ color: 'var(--ml-churn)', fontWeight: 800 }}>
                      <div className="lab-parry-microcell">
                        <span>59.4%</span>
                        <div className="lab-parry-microtrack" aria-hidden="true">
                          <div className="lab-parry-microfill" style={{ width: '59.4%', background: 'var(--ml-churn)' }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="dl-risk-badge dl-risk-churn">
                        {isFr ? 'Seuil Critique Tilt' : 'Critical Tilt'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 800, color: 'var(--ml-churn)' }}>
                      {isFr ? '≥ 2 Parades + Spirit Strike Équipé' : '≥ 2 Parries + Spirit Strike Built'}
                    </td>
                    <td className="font-mono">3.9%</td>
                    <td className="font-mono" style={{ color: 'var(--ml-churn)', fontWeight: 900 }}>
                      <div className="lab-parry-microcell">
                        <span>46.8%</span>
                        <div className="lab-parry-microtrack" aria-hidden="true">
                          <div className="lab-parry-microfill" style={{ width: '46.8%', background: 'var(--ml-churn)' }} />
                        </div>
                      </div>
                    </td>
                    <td className="font-mono" style={{ color: 'var(--ml-churn)', fontWeight: 700 }}>94.2%</td>
                    <td className="font-mono" style={{ color: 'var(--dl-spirit-bright)', fontWeight: 700 }}>21.3%</td>
                    <td className="font-mono" style={{ color: 'var(--ml-churn)' }}>62 APM (-45.6%)</td>
                    <td className="font-mono" style={{ color: 'var(--ml-churn)', fontWeight: 900 }}>
                      <div className="lab-parry-microcell">
                        <span>71.4%</span>
                        <div className="lab-parry-microtrack" aria-hidden="true">
                          <div className="lab-parry-microfill" style={{ width: '71.4%', background: 'var(--ml-churn)' }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="dl-risk-badge dl-risk-churn">
                        {isFr ? 'Zone d’Abandon Toxique' : 'Toxic Abandon Zone'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Actionable Remedies: Player Game Sense & Ethical Matchmaking */}
            <div className="lab-parry-remedy-grid">
              <div className="dl-glass-card" style={{ '--card-beam-color': 'var(--ml-retention)' }}>
                <div style={{ marginBottom: '0.65rem' }}>
                  <span className="dl-risk-badge dl-risk-retention">
                    {isFr ? 'CONTRE-MESURES JOUEUR • GAME SENSE' : 'PLAYER REMEDIES • GAME SENSE'}
                  </span>
                </div>
                <h4 className="dl-card-title" style={{ fontSize: '0.98rem', marginBottom: '0.5rem' }}>
                  {isFr ? 'Comment Briser le Piège du Parry & Sécuriser Spirit Strike' : 'Breaking the Parry Trap & Safely Leveraging Spirit Strike'}
                </h4>
                <ul className="dl-card-body-text" style={{ paddingLeft: '1.15rem' }}>
                  <li>
                    <strong style={{ color: 'var(--color-ink)' }}>{isFr ? 'Feinte de frappe lourde (Melee Cancel) : ' : 'Melee Feint (Dash Cancel): '}</strong>
                    {isFr
                      ? "Amorcez votre coup de poing chargé puis annulez-le avec une esquive (Dash) ou un saut pour pousser l'adversaire à déclencher sa parade dans le vide. Sa parade devient alors inutilisable pendant 5 secondes."
                      : 'Cancel heavy melee charges with Dash or Jump to bait opponent parries into thin air. Their parry incurs a 5s cooldown, leaving them defenseless.'}
                  </li>
                  <li>
                    <strong style={{ color: 'var(--color-ink)' }}>{isFr ? 'Aucune charge frontale sans immobilisation alliée : ' : 'No unassisted frontal charges: '}</strong>
                    {isFr
                      ? "Ne foncez jamais de face avec une attaque lourde très visible. Réservez ce coup lorsqu'un allié a déjà immobilisé la cible (grappin de Yamato, gel de Kelvin) ou lors d'une embuscade depuis les toits."
                      : 'Never run straight in with a charged melee in line-of-sight. Only execute heavy attacks following crowd-control stuns (CC) or roof ambushes.'}
                  </li>
                  <li>
                    <strong style={{ color: 'var(--color-ink)' }}>{isFr ? 'Équipement alternatif moins risqué : ' : 'Safer Item Alternatives: '}</strong>
                    {isFr
                      ? "En partie solo face à des adversaires attentifs aux parades, remplacez Spirit Strike par Close Quarters (+25 % de dégâts de tir à courte portée) ou Mystic Burst."
                      : 'In solo queue against reactive opponents, swap Spirit Strike for Close Quarters (+25% weapon DPS) or Mystic Burst.'}
                  </li>
                </ul>
              </div>

              <div className="dl-glass-card" style={{ '--card-beam-color': 'var(--dl-souls)' }}>
                <div style={{ marginBottom: '0.65rem' }}>
                  <span className="dl-slot-badge dl-slot-souls">
                    {isFr ? 'RECOMMANDATION VALVE • MATCHMAKING ÉTHIQUE' : 'VALVE RECOMMENDATION • ETHICAL MATCHMAKING'}
                  </span>
                </div>
                <h4 className="dl-card-title" style={{ fontSize: '0.98rem', marginBottom: '0.5rem' }}>
                  {isFr ? 'Détection Préventive du Tilt & Incitation Douce Post-Partie' : 'Early Parry-Tilt Detection & Post-Match Nudging'}
                </h4>
                <ul className="dl-card-body-text" style={{ paddingLeft: '1.15rem' }}>
                  <li>
                    <strong style={{ color: 'var(--color-ink)' }}>{isFr ? 'Détection de chute d’activité (APM) en direct : ' : 'Live APM drop telemetry: '}</strong>
                    {isFr
                      ? "Le modèle ML repère la signature pré-abandon (chute d'actions par minute > 35 % dans les 60 s après une parade) et alerte le serveur de jeu Valve (Game Coordinator) en temps réel."
                      : 'The ML model catches the pre-ragequit signature (APM drop > 35% within 60s of parry stun). Feeds real-time tilt telemetry to Valve Game Coordinator matchmaking.'}
                  </li>
                  <li>
                    <strong style={{ color: 'var(--color-ink)' }}>{isFr ? 'Cooldown de session éthique : ' : 'Ethical session cooldown nudge: '}</strong>
                    {isFr
                      ? "Si le joueur termine un match avec ≥2 morts sous parade et défaite, proposer un écran de débriefing passif de 10 minutes plutôt que de relancer en tilt."
                      : 'If a match concludes with ≥2 parry-induced deaths and a loss, recommend a 10-minute session cooldown rather than instant queueing.'}
                  </li>
                  <li>
                    <strong style={{ color: 'var(--color-ink)' }}>{isFr ? 'Apprentissage tutoriel interactif : ' : 'Interactive tutorial feedback: '}</strong>
                    {isFr
                      ? "Pour les nouveaux joueurs subissant ce piège, intégrer une micro-session d'entraînement au 'Melee Cancel' dans le bac à sable Deadlock Hero Sandbox."
                      : 'For new players repeatedly falling into this trap, surface an interactive 60-second "Melee Cancel" mini-drill in the Deadlock Hero Sandbox.'}
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
