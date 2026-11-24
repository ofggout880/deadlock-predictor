import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MOCK_ITEM_CHURN_ANALYTICS, MOCK_HERO_CHURN_ANALYTICS } from '../data/mockData';
import { getItemHeroChurnAnalytics } from '../services/api';
import { getHeroIcon, getItemIcon } from '../data/deadlockAssetIcons';
import GlossaryTerm from './GlossaryTerm';

/**
 * Clean SVG Vector Icons for ITEM Telemetry Section
 */
const IconTimeline = ({ size = 14, strokeWidth = 2, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconCatalog = ({ size = 14, strokeWidth = 2, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const IconHeroDynamics = ({ size = 14, strokeWidth = 2, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polygon points="12 8 8 12 12 16 16 12 12 8" />
  </svg>
);

/**
 * Real Recorded Chronological Item Purchase Sequences from /v1/matches/metadata (players[].items[])
 */
const PURCHASE_SEQUENCES = [
  {
    id: 'vindicta_30m',
    hero: 'Vindicta',
    outcome_badge: 'CHURN CRITIQUE • 0% VITALITY PENDANT 30 MIN',
    outcome_badge_en: 'CRITICAL CHURN • 0% VITALITY FOR 30 MIN',
    is_churner: true,
    unspent_gold: '91 360 Souls·min',
    unspent_gold_en: '91,360 Souls·min',
    first_vitality_min: '30.0 min (14e item !)',
    first_vitality_min_en: '30.0 min (14th item!)',
    incoming_hs: '21.7%',
    incoming_hs_en: '21.7%',
    summary_fr:
      "Cas d'école du Syndrome Canon de Verre (Schéma #1) : 13 items offensifs (Weapon & Spirit) achetés consécutivement entre 1m et 26m. Le tout premier item Vitality n'est acheté qu'à 30.0 minutes, après avoir subi des morts instantanées en vol stationnaire (Flight).",
    summary_en:
      'Textbook Glass Cannon Syndrome (Schema #1): 13 consecutive offensive items (Weapon & Spirit) bought between 1m and 26m. The very first Vitality item is bought at 30.0 minutes, after enduring repeated instant deaths while hovering in Flight.',
    nodes: [
      { realOrderRank: 1, time: '1m 12s', minute: 1.2, name: 'High-Velocity Rounds', slot: 'weapon', tier: 'W1', cost: 500, note_fr: 'Départ 100% offensif', note_en: '100% offensive start' },
      { realOrderRank: 2, time: '3m 05s', minute: 3.1, name: 'Opening Rounds', slot: 'weapon', tier: 'W2', cost: 1250, is_trap: true, note_fr: 'Actif seulement >50% PV', note_en: 'Active only >50% HP' },
      { realOrderRank: 3, time: '3m 48s', minute: 3.8, name: 'Extra Charge', slot: 'spirit', tier: 'S1', cost: 500, note_fr: '0 régénération en lane', note_en: 'Zero lane regen' },
      { realOrderRank: 4, time: '5m 20s', minute: 5.3, name: 'Quicksilver Reload', slot: 'spirit', tier: 'S2', cost: 1250, note_fr: '44.7% churn cohorte', note_en: '44.7% cohort churn' },
      { realOrderRank: 5, time: '7m 15s', minute: 7.25, name: 'Long Range', slot: 'weapon', tier: 'W2', cost: 1250, note_fr: '5e item offensif de suite', note_en: '5th offensive item in a row' },
      { realOrderRank: 7, time: '11m 40s', minute: 11.7, name: 'Mystic Shot', slot: 'weapon', tier: 'W2', cost: 1250, note_fr: 'Aucun bouclier à 12 min', note_en: 'Zero shields at 12 min' },
      { realOrderRank: 10, time: '16m 10s', minute: 16.2, name: 'Sharpshooter', slot: 'weapon', tier: 'W3', cost: 3000, note_fr: '10e item offensif (0% Vitality)', note_en: '10th offensive item (0% Vitality)' },
      { realOrderRank: 13, time: '24m 50s', minute: 24.8, name: 'Glass Cannon', slot: 'weapon', tier: 'W4', cost: 6200, is_trap: true, note_fr: '-15% PV Max ! (13e offensif)', note_en: '-15% Max HP! (13th offensive)' },
      { realOrderRank: 14, time: '30m 02s', minute: 30.0, name: 'Extra Stamina (1er Vitality !)', name_en: 'Extra Stamina (1st Vitality!)', slot: 'vitality', tier: 'V1', cost: 500, is_panic: true, note_fr: 'Acheté à 30m02s trop tard', note_en: 'Bought at 30m02s way too late' }
    ]
  },
  {
    id: 'lash_hollow_trap',
    hero: 'Lash',
    outcome_badge: 'CHURN • PIÈGE CONDITIONNEL HOLLOW POINT (>60% PV)',
    outcome_badge_en: 'CHURN • CONDITIONAL HOLLOW POINT TRAP (>60% HP)',
    is_churner: true,
    unspent_gold: '102 450 Souls·min',
    unspent_gold_en: '102,450 Souls·min',
    first_vitality_min: '14.2 min (après 8 items offensifs)',
    first_vitality_min_en: '14.2 min (after 8 offensive items)',
    incoming_hs: '11.1% (Air) / 13.3% Écran Gris',
    incoming_hs_en: '11.1% (Air) / 13.3% Grey Screen',
    summary_fr:
      "Combinaison des Schémas #1 et #3 : ce joueur de Lash rushe Hollow Point Ward dès 2m10s alors qu'il perd sa lane, et enchaîne les items offensifs jusqu'à 14.2m. Sans aucun bouclier, il tombe sous 60% de PV dès la première seconde de son dive Ground Strike, désactivant son item.",
    summary_en:
      'Combines Schemas #1 and #3: this Lash player rushes Hollow Point Ward at 2m10s while losing lane and chains offensive items until 14.2m. With zero armor, he drops below 60% HP within 1 second of diving, deactivating his conditional passive.',
    nodes: [
      { realOrderRank: 1, time: '0m 45s', minute: 0.75, name: 'Headshot Booster', slot: 'weapon', tier: 'W1', cost: 500, note_fr: 'Départ arme agressive', note_en: 'Aggressive weapon start' },
      { realOrderRank: 2, time: '2m 10s', minute: 2.17, name: 'Hollow Point Ward', slot: 'weapon', tier: 'W1', cost: 500, is_trap: true, note_fr: 'Désactivé sous 60% PV !', note_en: 'Turns off below 60% HP!' },
      { realOrderRank: 4, time: '4m 30s', minute: 4.5, name: 'Extra Charge', slot: 'spirit', tier: 'S1', cost: 500, note_fr: 'Mobilité sans régén', note_en: 'Mobility with zero regen' },
      { realOrderRank: 6, time: '6m 55s', minute: 6.9, name: 'Kinetic Dash', slot: 'weapon', tier: 'W2', cost: 1250, note_fr: 'Dash agressif sans armure', note_en: 'Aggressive unarmored dash' },
      { realOrderRank: 8, time: '9m 12s', minute: 9.2, name: 'Mystic Burst', slot: 'spirit', tier: 'S1', cost: 500, note_fr: 'Burst solo', note_en: 'Solo burst' },
      { realOrderRank: 9, time: '14m 12s', minute: 14.2, name: 'Restorative Locket (1er Vitality)', name_en: 'Restorative Locket (1st Vitality)', slot: 'vitality', tier: 'V2', cost: 1250, note_fr: 'Premier item survie à 14 min', note_en: 'First survival item at 14m' },
      { realOrderRank: 12, time: '18m 40s', minute: 18.67, name: 'Torment Pulse', slot: 'spirit', tier: 'S3', cost: 3000, note_fr: 'DPS contact (meurt en l’air)', note_en: 'Contact DPS (melts in air)' },
      { realOrderRank: 14, time: '22m 15s', minute: 22.25, name: 'Crippling Headshot', slot: 'weapon', tier: 'W4', cost: 6200, is_trap: true, note_fr: 'Achat de dépit @ 22m', note_en: 'Frustration purchase @ 22m' }
    ]
  },
  {
    id: 'infernus_rush',
    hero: 'Infernus',
    outcome_badge: 'CHURN • RUSH TOXIC BULLETS (3 000 SOULS À 8 MIN SANS BOTTES)',
    outcome_badge_en: 'CHURN • TOXIC BULLETS RUSH (3,000 SOULS @ 8 MIN, NO BOOTS)',
    is_churner: true,
    unspent_gold: '115 200 Souls·min',
    unspent_gold_en: '115,200 Souls·min',
    first_vitality_min: '12m 50s',
    first_vitality_min_en: '12m 50s',
    incoming_hs: '14.8%',
    incoming_hs_en: '14.8%',
    summary_fr:
      "Schéma #2 (Achat Cupide) : Infernus économise compulsivement ses âmes pour acheter Toxic Bullets (3 000) dès 8m05s sans acheter ni Sprint Boots ni Healing Rite. Vulnérable aux embuscades adverses, il meurt 4 fois d'affilée en perdant ses âmes instables (Unsecured Souls).",
    summary_en:
      'Schema #2 (Greedy Rush): Infernus hoards Souls to rush Toxic Bullets (3,000) by 8m05s with zero Sprint Boots or Healing Rite. Vulnerable to roams, he feeds 4 deaths in a row dropping unsecured Souls.',
    nodes: [
      { realOrderRank: 1, time: '1m 30s', minute: 1.5, name: 'Extra Spirit', slot: 'spirit', tier: 'S1', cost: 500, note_fr: 'Dégâts de brûlure', note_en: 'Burn DPS' },
      { realOrderRank: 2, time: '3m 15s', minute: 3.25, name: 'Mystic Burst', slot: 'spirit', tier: 'S1', cost: 500, note_fr: 'Poke sans fuite', note_en: 'Poke with no escape' },
      { realOrderRank: 4, time: '8m 05s', minute: 8.08, name: 'Toxic Bullets', slot: 'weapon', tier: 'W3', cost: 3000, is_trap: true, note_fr: 'Rush 3 000 sans bottes ! (43.8% churn)', note_en: '3,000 rush no boots! (43.8% churn)' },
      { realOrderRank: 6, time: '12m 50s', minute: 12.83, name: 'Sprint Boots', slot: 'vitality', tier: 'V1', cost: 500, note_fr: 'Bottes achetées trop tard à 12m50s', note_en: 'Boots purchased too late at 12m50s' },
      { realOrderRank: 9, time: '17m 30s', minute: 17.5, name: 'Surge of Power', slot: 'spirit', tier: 'S3', cost: 3000, note_fr: '42.9% churn cohorte', note_en: '42.9% cohort churn' },
      { realOrderRank: 12, time: '21m 40s', minute: 21.67, name: 'Ricochet', slot: 'weapon', tier: 'W4', cost: 6200, is_trap: true, note_fr: '0 bouclier à 21 minutes', note_en: 'Zero barriers at 21 minutes' }
    ]
  },
  {
    id: 'yamato_panic_buy',
    hero: 'Yamato',
    outcome_badge: 'CHURN 60.0% (#1) • SPIRIT STRIKE RUSH & BULLET RESILIENCE PANIC @ 29m14s',
    outcome_badge_en: '60.0% CHURN (#1) • SPIRIT STRIKE RUSH & BULLET RESILIENCE PANIC @ 29m14s',
    is_churner: true,
    unspent_gold: '100 103 Souls·min (+7.6%)',
    unspent_gold_en: '100,103 Souls·min (+7.6%)',
    first_vitality_min: '29m 14s (Bullet Resilience 15e item !)',
    first_vitality_min_en: '29m 14s (Bullet Resilience 15th item!)',
    incoming_hs: '16.1% – 18.1%',
    incoming_hs_en: '16.1% – 18.1%',
    summary_fr:
      "Schémas #3 et #4 : le joueur enchaîne Spirit Strike (8m14s, 49.0% churn), Quicksilver Reload (12m43s) et Toxic Bullets (19m49s), thésaurise ses âmes pendant 7 minutes en perdant ses âmes non sécurisées, puis achète Bullet Resilience en panique à 29m14s (15e item) quand le Patron tombe déjà.",
    summary_en:
      'Schemas #3 and #4: the player chains Spirit Strike (8m14s, 49.0% churn), Quicksilver Reload (12m43s), and Toxic Bullets (19m49s), hoards Souls for 7 minutes while dropping Unsecured Souls, and panic-buys Bullet Resilience at 29m14s (15th item) as the Patron falls.',
    nodes: [
      { realOrderRank: 1, time: '2m 20s', minute: 2.3, name: 'Close Quarters', slot: 'weapon', tier: 'W1', cost: 500, note_fr: 'Engagement mêlée', note_en: 'Melee skirmish start' },
      { realOrderRank: 5, time: '8m 14s', minute: 8.2, name: 'Spirit Strike', slot: 'spirit', tier: 'S1', cost: 500, is_trap: true, note_fr: '#1 Item Churn Cohorte (49.0%)', note_en: '#1 Cohort Churn Item (49.0%)' },
      { realOrderRank: 7, time: '12m 43s', minute: 12.7, name: 'Quicksilver Reload', slot: 'spirit', tier: 'S2', cost: 1250, note_fr: '44.7% de taux de churn', note_en: '44.7% churn rate' },
      { realOrderRank: 10, time: '16m 50s', minute: 16.8, name: 'Torment Pulse', slot: 'spirit', tier: 'S3', cost: 3000, note_fr: '41.5% churn (mêlée sans armure)', note_en: '41.5% churn (unarmored melee)' },
      { realOrderRank: 12, time: '19m 49s', minute: 19.8, name: 'Toxic Bullets', slot: 'weapon', tier: 'W3', cost: 3000, note_fr: '43.8% churn @ 19m49s', note_en: '43.8% churn @ 19m49s' },
      { realOrderRank: 15, time: '29m 14s', minute: 29.2, name: 'Bullet Resilience (15e Item)', name_en: 'Bullet Resilience (15th Item)', slot: 'vitality', tier: 'V3', cost: 3000, is_panic: true, note_fr: 'PANIC BUY @ 29m14s (45.8% churn)', note_en: 'PANIC BUY @ 29m14s (45.8% churn)' },
      { realOrderRank: 17, time: '33m 09s', minute: 33.1, name: 'Crippling Headshot', slot: 'weapon', tier: 'W4', cost: 6200, is_trap: true, note_fr: '43.8% churn @ 33m09s', note_en: '43.8% churn @ 33m09s' }
    ]
  },
  {
    id: 'retained_anchor',
    hero: 'Abrams / Dynamo',
    outcome_badge: 'ANCRE DE RÉTENTION • 89.7% FIDÉLITÉ',
    outcome_badge_en: 'RETENTION ANCHOR • 89.7% RETAINED',
    is_churner: false,
    unspent_gold: '93 025 Souls·min (Flux régulier)',
    unspent_gold_en: '93,025 Souls·min (Steady Spend)',
    first_vitality_min: '3m 45s (1er item !)',
    first_vitality_min_en: '3m 45s (1st item!)',
    incoming_hs: '9.6% – 10.5%',
    incoming_hs_en: '9.6% – 10.5%',
    summary_fr:
      "La trajectoire optimale d'un joueur fidélisé : stabilisation immédiate de la lane à 3m45s (Healing Rite) et 4m03s (Monster Rounds, 25.6% churn), sécurisation économique sans suicide via Cultist Sacrifice à 11m01s (10.3% churn !), puis immunité aux stuns via Counterspell (26m02s) et Vampiric Burst (28m18s).",
    summary_en:
      'The blueprint of a retained player: immediate lane stabilization at 3m45s (Healing Rite) and 4m03s (Monster Rounds, 25.6% churn), safe neutral economy via Cultist Sacrifice at 11m01s (10.3% churn!), followed by stun immunity via Counterspell (26m02s) and Vampiric Burst (28m18s).',
    nodes: [
      { realOrderRank: 1, time: '3m 45s', minute: 3.75, name: 'Healing Rite', slot: 'vitality', tier: 'V1', cost: 500, note_fr: 'Maintien PV en lane (18.2% churn)', note_en: 'Early lane sustain (18.2% churn)' },
      { realOrderRank: 2, time: '4m 03s', minute: 4.05, name: 'Monster Rounds', slot: 'weapon', tier: 'W1', cost: 500, note_fr: 'Protège le Guardian (25.6% churn)', note_en: 'Saves Guardian (25.6% churn)' },
      { realOrderRank: 5, time: '10m 15s', minute: 10.25, name: 'Restorative Locket', slot: 'vitality', tier: 'V2', cost: 1250, note_fr: 'Soin d’escouade (16.5% churn)', note_en: 'Squad burst heal (16.5% churn)' },
      { realOrderRank: 6, time: '11m 01s', minute: 11.0, name: 'Cultist Sacrifice', slot: 'weapon', tier: 'W3', cost: 3000, note_fr: '#1 Rétention : 10.3% churn !', note_en: '#1 Retention: 10.3% churn!' },
      { realOrderRank: 10, time: '20m 37s', minute: 20.6, name: 'Majestic Leap', slot: 'vitality', tier: 'V3', cost: 3000, note_fr: 'Rotation + Bouclier (15.4% churn)', note_en: 'Rotation + Barrier (15.4% churn)' },
      { realOrderRank: 13, time: '26m 02s', minute: 26.0, name: 'Counterspell', slot: 'vitality', tier: 'V3', cost: 3000, note_fr: 'Bloque les Stuns (21.4% churn)', note_en: 'Blocks Stun chains (21.4% churn)' },
      { realOrderRank: 15, time: '28m 18s', minute: 28.3, name: 'Vampiric Burst', slot: 'vitality', tier: 'V4', cost: 6200, note_fr: 'Vol de vie actif (13.6% churn)', note_en: 'Active lifesteal (13.6% churn)' }
    ]
  }
];

/**
 * The 4 Behavioral Purchase Schemas discovered in the Replay Parser Cohort
 */
const PURCHASE_SCHEMAS = [
  {
    id: 'schema_1',
    num: 'SCHÉMA #1',
    num_en: 'SCHEMA #1',
    badge: '14 À 30 MIN SANS DÉFENSE',
    badge_en: '14 TO 30 MIN WITH ZERO DEFENSE',
    color: 'var(--ml-churn)',
    title_fr: 'Le Syndrome "Zéro-Vitality" (6 à 13 Items Offensifs d’Affilée)',
    title_en: 'The "Zero-Vitality" Syndrome (6 to 13 Consecutive Offensive Items)',
    desc_fr:
      "L'horodatage précis de chaque achat révèle que les joueurs qui décrochent sur Vindicta, Haze et Lash achètent entre 6 et 13 items d'attaque consécutifs (Weapon & Spirit) sans dépenser 500 Souls en survie (Vitality). Leur premier équipement défensif vert n'arrive qu'entre 14.1m et 30.0m, après une longue série de morts évitables.",
    desc_en:
      'Purchase timestamp telemetry reveals departing Vindicta, Haze, and Lash players buy 6 to 13 straight offensive items without spending 500 Souls on Vitality. Their first green survival item arrives between 14.1m and 30.0m, long after recurring fatalities.'
  },
  {
    id: 'schema_2',
    num: 'SCHÉMA #2',
    num_en: 'SCHEMA #2',
    badge: 'RUSH 3 000 SOULS @ 8 MIN',
    badge_en: '3,000-SOUL RUSH @ 8 MIN',
    color: 'var(--ml-warning)',
    title_fr: 'Le Biais du "Tout-Offensif Cupide" (Greedy DPS Rush)',
    title_en: 'The "Greedy DPS Rush" Trap (Early Tier 3 Rush with Zero Boots)',
    desc_fr:
      "Économiser compulsivement pour rusher Toxic Bullets (3 000) ou Glass Cannon (6 200) sans Sprint Boots ni Healing Rite. Le joueur accumule des âmes non sécurisées en zone neutre, se fait surprendre par une embuscade ennemie, et perd ses âmes sans avoir bénéficié de stats intermédiaires.",
    desc_en:
      'Compulsively hoarding Souls to rush Toxic Bullets (3,000) or Glass Cannon (6,200) without Sprint Boots or Healing Rite. The player hoards Unsecured Souls, gets caught out of position, and drops Souls without gaining intermediate stats.'
  },
  {
    id: 'schema_3',
    num: 'SCHÉMA #3',
    num_en: 'SCHEMA #3',
    badge: 'ITEMS DÉSACTIVÉS EN COMBAT',
    badge_en: 'ITEMS DEACTIVATED IN COMBAT',
    color: 'var(--ml-churn)',
    title_fr: 'Le Piège des Items Conditionnels Défaillants (Hollow Point Ward & Opening Rounds)',
    title_en: 'The Conditional Item Failure Trap (Hollow Point Ward & Opening Rounds)',
    desc_fr:
      "Acheter des items dont le passif s'éteint sous pression : Hollow Point Ward (+dégâts actif uniquement si PV > 60%) ou Opening Rounds (actif uniquement > 50% PV). Dès que le joueur subit des dégâts d'embuscade, son équipement cesse littéralement de fonctionner.",
    desc_en:
      'Purchasing upgrades whose passives turn off under fire: Hollow Point Ward (active only while HP > 60%) or Opening Rounds (active only while HP > 50%). As soon as the player is ambushed, their investment yields zero DPS when needed most.'
  },
  {
    id: 'schema_4',
    num: 'SCHÉMA #4',
    num_en: 'SCHEMA #4',
    badge: '100K SOULS·MIN PERDUES',
    badge_en: '100K SOULS·MIN WASTED',
    color: 'var(--dl-spirit)',
    title_fr: 'Thésaurisation d’Âmes & Panic Buy Tardif (Achats de Panique)',
    title_en: 'Soul Hoarding & Late Panic Purchases',
    desc_fr:
      "Conserver plus de 100 000 Souls·min cumulées sans passer en boutique. Quand la base est menacée, le churner achète en panique un item défensif tier 3 (Bullet Resilience @ 29m14s) alors que l'écart économique est devenu irrécupérable.",
    desc_en:
      'Holding over 100,000 cumulative Souls·min without shopping. When base shrines fall, the player panic-buys Tier 3 armor (Bullet Resilience @ 29m14s) when the economic deficit is mathematically irreversible.'
  }
];

export default function ItemTelemetrySection({ lang, t, onBackToMain, onGoToHeroes, activeSubTab: controlledSubTab, onSubTabChange }) {
  const isFr = lang === 'fr';

  // Active Modular Sub-Tab ('timelines' | 'catalog')
  const [activeSubTab, setActiveSubTab] = useState(controlledSubTab || 'timelines');
  const catalogInspectorRef = useRef(null);
  const catalogGridRef = useRef(null);
  const pulseTimerRef = useRef(null);
  const [inspectorPulse, setInspectorPulse] = useState(false);

  // Sync controlled sub-tab from URL hash / browser Back-Forward navigation
  useEffect(() => {
    if (controlledSubTab && controlledSubTab !== activeSubTab) {
      setActiveSubTab(controlledSubTab);
    }
  }, [controlledSubTab]);

  // API State for Catalog
  const [apiData, setApiData] = useState({
    items: MOCK_ITEM_CHURN_ANALYTICS,
    heroes: MOCK_HERO_CHURN_ANALYTICS,
    summary: {
      total_items_analyzed: MOCK_ITEM_CHURN_ANALYTICS.length,
      total_items_source2: 54,
      total_heroes_analyzed: 28,
      highest_churn_item: 'Spirit Strike',
      lowest_churn_item: 'Cultist Sacrifice',
      highest_churn_hero: 'Yamato',
      lowest_churn_hero: 'Abrams'
    }
  });

  // Filters and Interactive State
  const [activeItemCategory, setActiveItemCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [itemSort, setItemSort] = useState('churn_desc');
  const [selectedSequenceId, setSelectedSequenceId] = useState('vindicta_30m');
  const [selectedNode, setSelectedNode] = useState(null);
  const [inspectedCatalogItem, setInspectedCatalogItem] = useState(null);

  // Listen for Navbar anchor events to activate the requested sub-tab
  useEffect(() => {
    const handleSubtabEvent = (e) => {
      const anchor = e.detail?.anchor;
      let nextTab = null;
      if (anchor === '#item-step-catalog') {
        nextTab = 'catalog';
      } else if (anchor === '#item-step-timelines') {
        nextTab = 'timelines';
      }
      if (nextTab) {
        setActiveSubTab(nextTab);
        onSubTabChange?.(nextTab);
      }
    };
    window.addEventListener('deadlock:subtab', handleSubtabEvent);
    return () => window.removeEventListener('deadlock:subtab', handleSubtabEvent);
  }, [onSubTabChange]);

  // Load backend analytics if online (safely merge flat API payloads without overwriting summary/items)
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await getItemHeroChurnAnalytics();
        if (isMounted && res) {
          setApiData((prev) => ({
            items:
              Array.isArray(res.items) && res.items.length > 0
                ? res.items
                : Array.isArray(res.item_churn_rates) && res.item_churn_rates.length > 0
                ? res.item_churn_rates
                : prev.items,
            heroes:
              Array.isArray(res.heroes) && res.heroes.length > 0
                ? res.heroes
                : Array.isArray(res.hero_churn_rates) && res.hero_churn_rates.length > 0
                ? res.hero_churn_rates
                : prev.heroes,
            summary: res.summary || {
              ...prev.summary,
              total_items_analyzed: res.total_items_analyzed ?? prev.summary.total_items_analyzed
            }
          }));
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

  const selectedSequence = useMemo(() => {
    return PURCHASE_SEQUENCES.find((s) => s.id === selectedSequenceId) || PURCHASE_SEQUENCES[0];
  }, [selectedSequenceId]);

  // Enrich nodes with real match purchase order rank and partition into 3 game phases
  const sequencePhases = useMemo(() => {
    const numberedNodes = (selectedSequence.nodes || []).map((node, index) => ({
      ...node,
      orderRank: node.realOrderRank ?? (index + 1)
    }));

    const early = numberedNodes.filter((n) => n.minute <= 8.0);
    const mid = numberedNodes.filter((n) => n.minute > 8.0 && n.minute <= 18.0);
    const late = numberedNodes.filter((n) => n.minute > 18.0);

    const sumSouls = (arr) => arr.reduce((acc, n) => acc + (n.cost || 0), 0);

    return [
      {
        id: 'early',
        eyebrow: 'PHASE 01 • 0M – 8M',
        title: isFr ? 'Early Game & Laning' : 'Early Game & Laning',
        souls: sumSouls(early),
        nodes: early
      },
      {
        id: 'mid',
        eyebrow: 'PHASE 02 • 8M – 18M',
        title: isFr ? 'Mid-Game, Urne & Rotations' : 'Mid-Game, Urn & Rotations',
        souls: sumSouls(mid),
        nodes: mid
      },
      {
        id: 'late',
        eyebrow: 'PHASE 03 • 18M+',
        title: isFr ? 'Late Game & Siège Patron' : 'Late Game & Patron Siege',
        souls: sumSouls(late),
        nodes: late
      }
    ];
  }, [selectedSequence, isFr]);

  // Compute Weapon / Vitality / Spirit Balance Gauge weighted by Souls invested
  const buildBalance = useMemo(() => {
    const nodes = selectedSequence.nodes || [];
    const weaponNodes = nodes.filter((n) => n.slot === 'weapon');
    const vitalityNodes = nodes.filter((n) => n.slot === 'vitality');
    const spiritNodes = nodes.filter((n) => n.slot === 'spirit');

    const weaponCount = weaponNodes.length;
    const vitalityCount = vitalityNodes.length;
    const spiritCount = spiritNodes.length;

    const sumCost = (arr) => arr.reduce((acc, n) => acc + (Number(n.cost) || 0), 0);
    const weaponSouls = sumCost(weaponNodes);
    const vitalitySouls = sumCost(vitalityNodes);
    const spiritSouls = sumCost(spiritNodes);
    const totalSouls = Math.max(1, weaponSouls + vitalitySouls + spiritSouls);

    const weaponPct = Number(((weaponSouls / totalSouls) * 100).toFixed(1));
    const vitalityPct = Number(((vitalitySouls / totalSouls) * 100).toFixed(1));
    const spiritPct = Number(Math.max(0, 100 - weaponPct - vitalityPct).toFixed(1));

    return {
      weaponCount,
      vitalityCount,
      spiritCount,
      weaponSouls,
      vitalitySouls,
      spiritSouls,
      totalSouls,
      weaponPct,
      vitalityPct,
      spiritPct
    };
  }, [selectedSequence]);

  // Set default node when sequence changes
  useEffect(() => {
    if (selectedSequence && selectedSequence.nodes.length > 0) {
      const numbered = selectedSequence.nodes.map((n, i) => ({ ...n, orderRank: n.realOrderRank ?? (i + 1) }));
      const trapNode = numbered.find((n) => n.is_trap || n.is_panic);
      setSelectedNode(trapNode || numbered[numbered.length - 1]);
    }
  }, [selectedSequenceId, selectedSequence]);

  const rawItems = useMemo(
    () => apiData?.items || apiData?.item_churn_rates || MOCK_ITEM_CHURN_ANALYTICS,
    [apiData]
  );

  // Filtered & Sorted Items
  const filteredItems = useMemo(() => {
    let list = [...rawItems];

    if (activeItemCategory !== 'all') {
      list = list.filter((it) => {
        const cat = (it.slot_type || it.category || '').toLowerCase();
        return cat === activeItemCategory.toLowerCase();
      });
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (it) =>
          it.name_fr?.toLowerCase().includes(q) ||
          it.name_en?.toLowerCase().includes(q) ||
          (it.slot_type || it.category || '').toLowerCase().includes(q) ||
          String(it.tier || '').toLowerCase().includes(q)
      );
    }

    const parseBuyTimeSec = (it) => {
      const str = String(it.avg_buy_time || '');
      const m = str.match(/(\d+)\s*m(?:\s*(\d+)\s*s)?/i);
      if (m) return parseInt(m[1], 10) * 60 + parseInt(m[2] || '0', 10);
      if (it.avg_buy_time_min != null) return Number(it.avg_buy_time_min) * 60;
      if (it.avg_purchase_minute != null) return Number(it.avg_purchase_minute) * 60;
      return (it.avg_order_rank ?? 99) * 120;
    };

    list.sort((a, b) => {
      const rateA = a.churn_rate != null ? (a.churn_rate <= 1 ? a.churn_rate * 100 : a.churn_rate) : 0;
      const rateB = b.churn_rate != null ? (b.churn_rate <= 1 ? b.churn_rate * 100 : b.churn_rate) : 0;
      const costA = a.cost ?? a.soul_cost ?? 0;
      const costB = b.cost ?? b.soul_cost ?? 0;

      if (itemSort === 'churn_desc') return rateB - rateA;
      if (itemSort === 'churn_asc') return rateA - rateB;
      if (itemSort === 'cost_asc') return costA - costB;
      if (itemSort === 'cost_desc') return costB - costA;
      if (itemSort === 'time_asc') return parseBuyTimeSec(a) - parseBuyTimeSec(b);
      return 0;
    });

    return list;
  }, [rawItems, activeItemCategory, searchTerm, itemSort]);

  // Ensure an item is always selected in the Lateral Catalog Inspector
  const activeCatalogItem = useMemo(() => {
    if (inspectedCatalogItem) {
      const found = filteredItems.find((it) => (it.id || it.name_en) === (inspectedCatalogItem.id || inspectedCatalogItem.name_en));
      if (found) return found;
    }
    return filteredItems[0] || MOCK_ITEM_CHURN_ANALYTICS[0];
  }, [inspectedCatalogItem, filteredItems]);

  // Strict Dual Semantic Palette Helpers (Official Deadlock Slot Colors vs ML Risk Colors)
  const getSlotClass = (slot) => {
    const c = (slot || '').toLowerCase();
    if (c === 'weapon') return 'dl-slot-weapon';
    if (c === 'vitality') return 'dl-slot-vitality';
    if (c === 'spirit') return 'dl-slot-spirit';
    return 'dl-slot-souls';
  };

  const getSlotColorToken = (slot) => {
    const c = (slot || '').toLowerCase();
    if (c === 'weapon') return 'var(--dl-weapon)';
    if (c === 'vitality') return 'var(--dl-vitality)';
    if (c === 'spirit') return 'var(--dl-spirit)';
    return 'var(--dl-souls)';
  };

  const getItemRiskMeta = (rate) => {
    const churnPct = rate != null ? (rate <= 1 ? rate * 100 : rate) : 0;
    if (churnPct >= 44) {
      return {
        label: isFr ? 'Piège de Tilt' : 'Tilt Trap',
        className: 'dl-risk-churn',
        color: 'var(--ml-churn)'
      };
    }
    if (churnPct >= 38) {
      return {
        label: isFr ? 'Rush Cupide' : 'Greedy Rush',
        className: 'dl-risk-warning',
        color: 'var(--ml-warning)'
      };
    }
    if (churnPct <= 22) {
      return {
        label: isFr ? 'Ancre de Rétention' : 'Retention Anchor',
        className: 'dl-risk-retention',
        color: 'var(--ml-retention)'
      };
    }
    return {
      label: isFr ? 'Équilibré' : 'Balanced',
      className: 'dl-risk-neutral',
      color: 'var(--dl-souls)'
    };
  };

  const ITEM_SUB_TABS = ['timelines', 'catalog'];

  const selectSubTab = (tabId) => {
    setActiveSubTab(tabId);
    onSubTabChange?.(tabId);
    const el = document.getElementById('item-subtabs-anchor');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectCatalogItem = (item) => {
    setInspectedCatalogItem(item);
    setInspectorPulse(true);
    if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    pulseTimerRef.current = setTimeout(() => setInspectorPulse(false), 900);

    if (typeof window !== 'undefined' && window.innerWidth < 1120 && catalogInspectorRef.current) {
      setTimeout(() => {
        catalogInspectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 45);
    }
  };

  const handleSubTabKeyDown = (e) => {
    const currentIndex = ITEM_SUB_TABS.indexOf(activeSubTab);
    if (currentIndex === -1) return;
    let nextIndex = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % ITEM_SUB_TABS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + ITEM_SUB_TABS.length) % ITEM_SUB_TABS.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = ITEM_SUB_TABS.length - 1;
    }
    if (nextIndex !== -1) {
      e.preventDefault();
      const nextTab = ITEM_SUB_TABS[nextIndex];
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
    <section className="section hero-section lab-page-section" aria-labelledby="item-telemetry-heading">
      <div className="container">
        
        {/* ===================================================================== */}
        {/* STAGE 1: EDITORIAL HEADER ALIGNED WITH PAGE 1                         */}
        {/* ===================================================================== */}
        <div className="hero-editorial-row">
          <div className="hero-title-column">
            <h1 id="item-telemetry-heading" className="hero-display-title lab-hero-title">
              {isFr ? (
                <>
                  <span className="title-light">Chronologie d’Achats &</span>{' '}
                  <span className="title-bold">
                    <GlossaryTerm termId="churn">Catalogue Items</GlossaryTerm>
                  </span>
                  <br />
                  <span className="title-light title-light-sub">dans Deadlock via</span>{' '}
                  <span className="title-bold title-glow">Télémétrie Source 2</span>
                </>
              ) : (
                <>
                  <span className="title-light">Purchase Timelines &</span>{' '}
                  <span className="title-bold">
                    <GlossaryTerm termId="churn">Item Churn Catalog</GlossaryTerm>
                  </span>
                  <br />
                  <span className="title-light title-light-sub">in Deadlock via</span>{' '}
                  <span className="title-bold title-glow">Source 2 Telemetry</span>
                </>
              )}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem', marginTop: '0.85rem' }}>
              <span className="nav-popover-sublabel" style={{ color: 'var(--ml-retention)' }}>
                {isFr
                  ? 'Volet Complémentaire #2 · Focus Items : morts en chaîne, ragequit & churn'
                  : 'Complementary Dossier #2 · Item Focus: death spirals, ragequits & churn'}
              </span>
              <div className="dl-eyebrow-actions">
                {typeof onGoToHeroes === 'function' && (
                  <button
                    type="button"
                    className="dl-cross-nav-link"
                    onClick={onGoToHeroes}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                    <IconHeroDynamics size={14} />
                    <span>{isFr ? 'Dynamique Héros' : 'Hero Dynamics'}</span>
                  </button>
                )}
                {typeof onBackToMain === 'function' && (
                  <button
                    type="button"
                    className="hero-about-trigger-pill"
                    onClick={onBackToMain}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                    <span>{isFr ? 'Étude Principale' : 'Main Study'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="hero-desc-column">
            <p className="hero-floating-summary">
              {isFr ? (
                <>
                  Dans Deadlock, chaque joueur équipe son héros selon <GlossaryTerm termId="vitality_items">3 familles</GlossaryTerm> : <strong style={{ color: 'var(--dl-weapon)' }}>Armes (Weapon)</strong>, <strong style={{ color: 'var(--dl-vitality-bright)' }}>Survie (Vitality)</strong> et <strong style={{ color: 'var(--dl-spirit-bright)' }}>Pouvoirs (Spirit)</strong>, achetés en <GlossaryTerm termId="souls">Souls (Âmes)</GlossaryTerm>. Pourquoi un joueur qui néglige totalement la Survie pendant 30 minutes est-il condamné à la frustration et à l&apos;abandon ? Découvrez notre autopsie chronologique, les 4 biais en boutique et le catalogue interactif.
                </>
              ) : (
                <>
                  In Deadlock, every hero builds across <GlossaryTerm termId="vitality_items">3 shop families</GlossaryTerm> (<strong style={{ color: 'var(--dl-weapon)' }}>Weapon</strong> for gun damage, <strong style={{ color: 'var(--dl-vitality-bright)' }}>Vitality</strong> for armor &amp; HP, and <strong style={{ color: 'var(--dl-spirit-bright)' }}>Spirit</strong> for ability power) using <GlossaryTerm termId="souls">Souls</GlossaryTerm>. Why does building zero Vitality for 30 minutes condemn a player to disengage? Explore our phase-by-phase purchase autopsy, 4 equipment error schemas, and interactive catalog of 54 Source 2 items.
                </>
              )}
            </p>
            <div className="hero-tag-pills" role="list">
              <span className="tag-pill" role="listitem">{isFr ? 'Frise 3 Phases (Début/Milieu/Fin)' : '3-Phase Sequential Timeline'}</span>
              <span className="tag-pill" role="listitem">{isFr ? '4 Schémas Cognitifs' : '4 Cognitive Error Schemas'}</span>
              <span className="tag-pill" role="listitem">{isFr ? `${rawItems.length} Items Clés (sur 54 Source 2)` : `${rawItems.length} Key Items (of 54 Source 2)`}</span>
              <span className="tag-pill" role="listitem">{isFr ? 'Inspecteur IA Anti-Tilt' : 'Anti-Tilt AI Inspector'}</span>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* STAGE 2: MACRO KPI STRIP (4 CALM KEY METRICS)                         */}
        {/* ===================================================================== */}
        <div className="lab-macro-kpi-grid">
          {/* 01: Top Churn Item */}
          <div className="lab-macro-kpi-card">
            <div>
              <div className="lab-macro-top-meta">
                <span className="lab-macro-label">
                  {t('items.kpiCards.topChurnItem.label', lang)}
                </span>
                <span className="dl-risk-text dl-risk-churn">
                  +118.7%
                </span>
              </div>

              <div className="lab-macro-num-row">
                <span className="lab-macro-large-num glow-rose tabular-nums">
                  49.0%
                </span>
                <span className="dl-risk-text dl-risk-churn">
                  {isFr ? 'pic churn' : 'peak churn'}
                </span>
              </div>

              <div className="lab-macro-asset-row">
                <div className="lab-macro-asset-icons">
                  {getItemIcon('Spirit Strike') && (
                    <img
                      src={getItemIcon('Spirit Strike')}
                      alt="Spirit Strike"
                      className="dl-seq-icon-img"
                    />
                  )}
                  {getItemIcon('Glass Cannon') && (
                    <img
                      src={getItemIcon('Glass Cannon')}
                      alt="Glass Cannon"
                      className="dl-seq-icon-img"
                    />
                  )}
                </div>
                <h4 className="lab-macro-asset-name">
                  Spirit Strike &amp; Glass Cannon
                </h4>
              </div>
            </div>
            <p className="lab-macro-commentary">
              {isFr ? 'Achetés @ 8m14s (5e item) & @ 26m40s sans défense Vitality' : 'Bought @ 8m14s (5th item) & @ 26m40s with 0 Vitality armor'}
            </p>
          </div>

          {/* 02: Top Retention Item */}
          <div className="lab-macro-kpi-card">
            <div>
              <div className="lab-macro-top-meta">
                <span className="lab-macro-label">
                  {t('items.kpiCards.topRetentionItem.label', lang)}
                </span>
                <span className="dl-risk-text dl-risk-retention">
                  10.3% churn
                </span>
              </div>

              <div className="lab-macro-num-row">
                <span className="lab-macro-large-num glow-mint tabular-nums">
                  89.7%
                </span>
                <span className="dl-risk-text dl-risk-retention">
                  {isFr ? 'rétention' : 'retention'}
                </span>
              </div>

              <div className="lab-macro-asset-row">
                <div className="lab-macro-asset-icons">
                  {getItemIcon('Cultist Sacrifice') && (
                    <img
                      src={getItemIcon('Cultist Sacrifice')}
                      alt="Cultist Sacrifice"
                      className="dl-seq-icon-img"
                    />
                  )}
                  {getItemIcon('Rescue Beam') && (
                    <img
                      src={getItemIcon('Rescue Beam')}
                      alt="Rescue Beam"
                      className="dl-seq-icon-img"
                    />
                  )}
                </div>
                <h4 className="lab-macro-asset-name">
                  Cultist Sacrifice &amp; Rescue Beam
                </h4>
              </div>
            </div>
            <p className="lab-macro-commentary">
              {isFr ? '89.7% rétention (@ 11m01s, sécurisation économique neutre)' : '89.7% retained (100% − 10.3% churn • @ 11m01s, safe neutral economy)'}
            </p>
          </div>

          {/* 03: Top Churn Hero Build */}
          <div className="lab-macro-kpi-card">
            <div>
              <div className="lab-macro-top-meta">
                <span className="lab-macro-label">
                  {t('items.kpiCards.topChurnHero.label', lang)}
                </span>
                <span className="dl-risk-text dl-risk-churn">
                  28.7% HS
                </span>
              </div>

              <div className="lab-macro-num-row">
                <span className="lab-macro-large-num glow-rose tabular-nums">
                  60.0%
                </span>
                <span className="dl-risk-text dl-risk-churn">
                  {isFr ? 'churn max' : 'max churn'}
                </span>
              </div>

              <div className="lab-macro-asset-row">
                <div className="lab-macro-asset-icons">
                  {['Yamato', 'Ivy', 'Seven'].map((hName) =>
                    getHeroIcon(hName) ? (
                      <img
                        key={hName}
                        src={getHeroIcon(hName)}
                        alt={hName}
                        className="lab-hero-avatar-glow"
                      />
                    ) : null
                  )}
                </div>
                <h4 className="lab-macro-asset-name">
                  Yamato, Ivy &amp; Seven
                </h4>
              </div>
            </div>
            <p className="lab-macro-commentary">
              {isFr ? 'Seven #1 Headshots subis (28.7%) • Vindicta 22.4% Vitality' : 'Seven #1 Incoming HS (28.7%) • Vindicta 22.4% Vitality'}
            </p>
          </div>

          {/* 04: Top Retention Hero Build */}
          <div className="lab-macro-kpi-card">
            <div>
              <div className="lab-macro-top-meta">
                <span className="lab-macro-label">
                  {t('items.kpiCards.topRetentionHero.label', lang)}
                </span>
                <span className="dl-risk-text dl-risk-retention">
                  18.2% churn
                </span>
              </div>

              <div className="lab-macro-num-row">
                <span className="lab-macro-large-num glow-mint tabular-nums">
                  81.8%
                </span>
                <span className="dl-risk-text dl-risk-retention">
                  {isFr ? 'rétention' : 'retention'}
                </span>
              </div>

              <div className="lab-macro-asset-row">
                <div className="lab-macro-asset-icons">
                  {['Abrams', 'Pocket', 'Dynamo'].map((hName) =>
                    getHeroIcon(hName) ? (
                      <img
                        key={hName}
                        src={getHeroIcon(hName)}
                        alt={hName}
                        className="lab-hero-avatar-glow"
                      />
                    ) : null
                  )}
                </div>
                <h4 className="lab-macro-asset-name">
                  Abrams, Pocket &amp; Dynamo
                </h4>
              </div>
            </div>
            <p className="lab-macro-commentary">
              {isFr ? 'Abrams : 9.6% headshots subis (#1 bas) & 49.1% Vitality' : '81.8% retained (100% − 18.2% churn) • Abrams 9.6% HS & 49.1% Vitality'}
            </p>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* STAGE 3: MINIMALIST UNDERLINE TAB BAR + MICRO-DOT LEGEND              */}
        {/* ===================================================================== */}
        <div id="item-subtabs-anchor" className="dl-subtabs-shell">
          <div className="dl-subtabs-header-bar">
            <div
              className="dl-subtabs-bar dl-subtabs-bar-2col"
              role="tablist"
              aria-label={isFr ? 'Sous-onglets Télémétrie Items' : 'Item Telemetry Sub-Tabs'}
              onKeyDown={handleSubTabKeyDown}
            >
              <button
                type="button"
                role="tab"
                tabIndex={activeSubTab === 'timelines' ? 0 : -1}
                aria-selected={activeSubTab === 'timelines'}
                aria-controls="item-step-timelines"
                className={`dl-subtab-btn ${activeSubTab === 'timelines' ? 'is-active' : ''}`}
                style={{ '--subtab-accent': 'var(--dl-souls)' }}
                onClick={() => selectSubTab('timelines')}
              >
                <span className="dl-subtab-num">01</span>
                <span className="dl-subtab-title">
                  {isFr ? 'Frise Séquentielle & 4 Schémas' : 'Sequential Timeline & 4 Schemas'}
                </span>
              </button>

              <button
                type="button"
                role="tab"
                tabIndex={activeSubTab === 'catalog' ? 0 : -1}
                aria-selected={activeSubTab === 'catalog'}
                aria-controls="item-step-catalog"
                className={`dl-subtab-btn ${activeSubTab === 'catalog' ? 'is-active' : ''}`}
                style={{ '--subtab-accent': 'var(--ml-retention)' }}
                onClick={() => selectSubTab('catalog')}
              >
                <span className="dl-subtab-num">02</span>
                <span className="dl-subtab-title">
                  {isFr ? `Catalogue des ${rawItems.length} Items & Inspecteur` : `Catalog (${rawItems.length} Items) & Inspector`}
                </span>
              </button>
            </div>

            <div className="dl-micro-legend" aria-label={isFr ? 'Légende des catégories Deadlock' : 'Deadlock Slot Palette Legend'}>
              <span className="dl-micro-legend-item" title={isFr ? 'Dégâts d’armes et tirs 3D' : 'Weapon Tiers 1–4 (500 to 6,200 Souls): Gun DPS'}>
                <span className="dl-cat-dot is-weapon" aria-hidden="true" />
                <span>{isFr ? 'Weapon' : 'Weapon (W1–W4)'}</span>
              </span>
              <span className="dl-micro-legend-item" title={isFr ? 'Points de vie, armure et survie' : 'Vitality Tiers 1–4 (500 to 6,200 Souls): Armor & HP'}>
                <span className="dl-cat-dot is-vitality" aria-hidden="true" />
                <span>{isFr ? 'Vitality' : 'Vitality (V1–V4)'}</span>
              </span>
              <span className="dl-micro-legend-item" title={isFr ? 'Pouvoirs magiques et compétences' : 'Spirit Tiers 1–4 (500 to 6,200 Souls): Ability Power'}>
                <span className="dl-cat-dot is-spirit" aria-hidden="true" />
                <span>{isFr ? 'Spirit' : 'Spirit (S1–S4)'}</span>
              </span>
              <span className="dl-micro-legend-item" title={isFr ? 'Monnaie universelle du jeu' : 'Universal in-game match currency'}>
                <span className="dl-cat-dot is-souls" aria-hidden="true" />
                <span>Souls</span>
              </span>
            </div>
          </div>

          {/* =================================================================== */}
          {/* SUB-TAB PANEL 01: SEQUENTIAL PHASE TIMELINE & 4 ERROR SCHEMAS       */}
          {/* =================================================================== */}
          <div
            id="item-step-timelines"
            role="tabpanel"
            className={`dl-subtab-panel ${activeSubTab === 'timelines' ? 'is-active' : ''}`}
          >
            <div className="lab-chapter-header">
              <h2 className="lab-chapter-title">
                {isFr
                  ? 'Frise Séquentielle des Achats : Early (0–8m), Mid (8–18m), Late (18m+)'
                  : 'Sequential Purchase Timeline: Early (0–8m), Mid (8–18m), Late (18m+)'}
              </h2>
              <p className="lab-chapter-subtitle">
                {isFr
                  ? "Les séquences d'achats extraites des replays du moteur Source 2 sont découpées selon les 3 phases canoniques d'une partie de Deadlock avec leur ordre exact d'achat (#1 → #15+) et leur jauge d'équilibre Weapon / Vitality / Spirit."
                  : 'Purchase sequences extracted from Source 2 replays (game_time_s) are partitioned into the 3 canonical Deadlock match phases with exact purchase order (#1 → #9) and Weapon / Vitality / Spirit balance gauge.'}
              </p>
            </div>

            {/* Interactive Trace Selector Buttons */}
            <div className="lab-sequence-selector">
              {PURCHASE_SEQUENCES.map((seq) => {
                const isSelected = seq.id === selectedSequenceId;
                return (
                  <button
                    key={seq.id}
                    type="button"
                    onClick={() => setSelectedSequenceId(seq.id)}
                    className={`lab-seq-tab-btn ${isSelected ? 'is-selected' : ''} ${seq.is_churner ? 'is-churn' : 'is-retained'}`}
                  >
                    {getHeroIcon(seq.hero.split(' ')[0]) && (
                      <img
                        src={getHeroIcon(seq.hero.split(' ')[0])}
                        alt={seq.hero}
                        className="lab-hero-avatar-glow dl-avatar-22"
                        style={{
                          '--hero-accent-color': seq.is_churner ? 'var(--ml-churn)' : 'var(--ml-retention)'
                        }}
                      />
                    )}
                    <span>{seq.hero}</span>
                    <span className={`dl-risk-badge ${seq.is_churner ? 'dl-risk-churn' : 'dl-risk-retention'}`}>
                      {seq.is_churner ? 'CHURNER' : (isFr ? 'RÉTENTION' : 'RETAINED')}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Trace Overview + Weapon/Vitality/Spirit Build Balance Gauge */}
            <div className={`dl-trace-overview-card ${selectedSequence.is_churner ? 'is-churn-trace' : 'is-retained-trace'}`}>
              <div className="dl-trace-top-row">
                <div>
                  <h3 className="dl-card-title" style={{ marginTop: 0 }}>
                    {isFr ? `Trajectoire Séquentielle : ${selectedSequence.hero}` : `Sequential Build Path: ${selectedSequence.hero}`}
                  </h3>
                  <span className={`dl-risk-badge ${selectedSequence.is_churner ? 'dl-risk-churn' : 'dl-risk-retention'}`} style={{ marginTop: '0.35rem', display: 'inline-block' }}>
                    {isFr ? selectedSequence.outcome_badge : (selectedSequence.outcome_badge_en || selectedSequence.outcome_badge)}
                  </span>
                </div>

                <div className="dl-trace-stat-pods">
                  <div className="dl-trace-stat-pod">
                    <span className="dl-trace-stat-label">{isFr ? '1er Item Vitality' : '1st Vitality Item'}</span>
                    <span className={`dl-trace-stat-val ${selectedSequence.is_churner ? 'glow-rose' : 'glow-mint'}`}>
                      {isFr ? selectedSequence.first_vitality_min : (selectedSequence.first_vitality_min_en || selectedSequence.first_vitality_min)}
                    </span>
                  </div>
                  <div className="dl-trace-stat-pod">
                    <span className="dl-trace-stat-label">{isFr ? 'Headshots Subis' : 'Incoming Headshots'}</span>
                    <span className={`dl-trace-stat-val ${selectedSequence.is_churner ? 'glow-rose' : 'glow-mint'}`}>
                      {isFr ? selectedSequence.incoming_hs : (selectedSequence.incoming_hs_en || selectedSequence.incoming_hs)}
                    </span>
                  </div>
                  <div className="dl-trace-stat-pod" title={isFr ? 'Cumul minute par minute des âmes gardées en réserve sans être investies en boutique' : 'Cumulative minute-by-minute unspent Souls held in reserve'}>
                    <span className="dl-trace-stat-label">{isFr ? 'Âmes Non Dépensées (Cumul)' : 'Hoarded Unspent Souls'}</span>
                    <span className="dl-trace-stat-val glow-cyan">
                      {isFr ? selectedSequence.unspent_gold : (selectedSequence.unspent_gold_en || selectedSequence.unspent_gold)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="dl-card-body-text">
                {isFr ? selectedSequence.summary_fr : selectedSequence.summary_en}
              </p>

              {/* Weapon / Vitality / Spirit Balance Gauge */}
              <div className="dl-build-balance-box">
                <div className="dl-build-balance-header">
                  <span className="dl-build-balance-title">
                    {isFr ? 'Jauge d’Équilibre du Build (% Souls investies • Weapon / Vitality / Spirit)' : 'Build Balance Gauge (% Souls Invested • Weapon / Vitality / Spirit)'}
                  </span>
                  <div className="dl-build-balance-legend">
                    <span style={{ color: 'var(--dl-weapon)' }}>
                      <span className="dl-legend-dot" style={{ background: 'var(--dl-weapon)' }} />
                      Weapon : {buildBalance.weaponPct}% ({buildBalance.weaponSouls.toLocaleString()} Souls, {buildBalance.weaponCount})
                    </span>
                    <span style={{ color: 'var(--dl-vitality-bright)' }}>
                      <span className="dl-legend-dot" style={{ background: 'var(--dl-vitality)' }} />
                      Vitality : {buildBalance.vitalityPct}% ({buildBalance.vitalitySouls.toLocaleString()} Souls, {buildBalance.vitalityCount})
                    </span>
                    <span style={{ color: 'var(--dl-spirit-bright)' }}>
                      <span className="dl-legend-dot" style={{ background: 'var(--dl-spirit)' }} />
                      Spirit : {buildBalance.spiritPct}% ({buildBalance.spiritSouls.toLocaleString()} Souls, {buildBalance.spiritCount})
                    </span>
                  </div>
                </div>

                <div className="dl-build-balance-bar" role="img" aria-label="Weapon Vitality Spirit Balance Bar">
                  {buildBalance.weaponPct > 0 && (
                    <div
                      className="dl-balance-seg dl-balance-seg-weapon"
                      style={{ width: `${buildBalance.weaponPct}%` }}
                      title={`Weapon: ${buildBalance.weaponPct}%`}
                    />
                  )}
                  {buildBalance.vitalityPct > 0 && (
                    <div
                      className="dl-balance-seg dl-balance-seg-vitality"
                      style={{ width: `${buildBalance.vitalityPct}%` }}
                      title={`Vitality: ${buildBalance.vitalityPct}%`}
                    />
                  )}
                  {buildBalance.spiritPct > 0 && (
                    <div
                      className="dl-balance-seg dl-balance-seg-spirit"
                      style={{ width: `${buildBalance.spiritPct}%` }}
                      title={`Spirit: ${buildBalance.spiritPct}%`}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 3-Phase Sequential Timeline Grid (Zero Overlap Flexbox/Grid) */}
            <div className="dl-phase-timeline-card">
              <div className="dl-card-header-flex">
                <div>
                  <span className="dl-slot-badge dl-slot-souls">
                    {isFr ? 'CHRONOLOGIE SÉQUENTIELLE PAR PHASES (ORDRE 1 → N)' : 'PHASE-BY-PHASE SEQUENTIAL ORDER (1 → N)'}
                  </span>
                  <span className="dl-card-subtitle">
                    {isFr
                      ? 'Cliquez sur n’importe quelle étape d’achat (#1, #2, #3...) pour inspecter son autopsie télémétrique ci-dessous'
                      : 'Click any numbered purchase step (#1, #2, #3...) to inspect its telemetry autopsy • Tiers: W1–W4 (Weapon), V1–V4 (Vitality), S1–S4 (Spirit) from 500 to 6,200 Souls'}
                  </span>
                </div>
              </div>

              <div className="dl-phase-timeline-grid">
                {sequencePhases.map((phase) => (
                  <div key={phase.id} className="dl-phase-column">
                    <div className="dl-phase-col-header">
                      <div className="dl-phase-title-group">
                        <span className="dl-phase-eyebrow">{phase.eyebrow}</span>
                        <h4 className="dl-phase-title">{phase.title}</h4>
                      </div>
                      <span className="dl-phase-souls-tag tabular-nums">
                        {phase.souls.toLocaleString()} Souls
                      </span>
                    </div>

                    <div className="dl-phase-items-flow">
                      {phase.nodes.map((node, nodeIdx) => {
                        const isSelected =
                          selectedNode?.name === node.name && selectedNode?.time === node.time;
                        const isTrapOrPanic = Boolean(node.is_trap || node.is_panic);

                        return (
                          <div key={`${node.name}-${node.time}`} className="dl-seq-node-step">
                            {nodeIdx > 0 && (
                              <div className="dl-seq-arrow-connector" aria-hidden="true">
                                <span>↓</span>
                                <span>#{phase.nodes[nodeIdx - 1]?.orderRank ?? (node.orderRank - 1)} → #{node.orderRank}</span>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => setSelectedNode(node)}
                              className={`dl-seq-node-btn slot-${node.slot} ${isTrapOrPanic ? 'is-trap-node' : ''} ${isSelected ? 'is-selected' : ''}`}
                            >
                              <span className="dl-seq-order-badge tabular-nums">
                                #{node.orderRank}
                              </span>

                              <div className="dl-seq-icon-frame">
                                {getItemIcon(node.name) ? (
                                  <img
                                    src={getItemIcon(node.name)}
                                    alt={node.name}
                                    className="dl-seq-icon-img"
                                  />
                                ) : (
                                  <span className={`dl-slot-badge ${getSlotClass(node.slot)}`}>
                                    {node.tier}
                                  </span>
                                )}
                              </div>

                              <div className="dl-seq-item-main">
                                <span className="dl-seq-item-name">{isFr ? node.name : (node.name_en || node.name)}</span>
                                <span className="dl-seq-item-note">
                                  {isFr ? node.note_fr : node.note_en}
                                </span>
                              </div>

                              <div className="dl-seq-item-meta">
                                <span className="dl-seq-time-pill tabular-nums">{node.time}</span>
                                <span className={`dl-slot-badge ${getSlotClass(node.slot)}`}>
                                  {node.tier}
                                </span>
                                <span className="dl-seq-cost-pill tabular-nums">
                                  {node.cost} Souls
                                </span>
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Node Detailed Inspector */}
              {selectedNode && (
                <div className="dl-node-inspector">
                  <div className="dl-node-inspector-top">
                    <div className="dl-node-inspector-id">
                      <div className="dl-seq-icon-frame dl-seq-icon-frame-48" style={{ borderColor: getSlotColorToken(selectedNode.slot) }}>
                        {getItemIcon(selectedNode.name) ? (
                          <img
                            src={getItemIcon(selectedNode.name)}
                            alt={selectedNode.name}
                            className="dl-seq-icon-img-40"
                          />
                        ) : (
                          <span className={`dl-slot-badge ${getSlotClass(selectedNode.slot)}`}>
                            {selectedNode.tier || 'S2'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="dl-biomarker-title-row">
                          {selectedNode.orderRank && (
                            <span className="dl-seq-order-badge">
                              {isFr ? `ACHAT #${selectedNode.orderRank}` : `PURCHASE #${selectedNode.orderRank}`}
                            </span>
                          )}
                          <span className={`dl-slot-badge ${getSlotClass(selectedNode.slot)}`}>
                            {selectedNode.slot} • {selectedNode.tier}
                          </span>
                          {selectedNode.is_trap && (
                            <span className="dl-risk-badge dl-risk-churn">
                              ✦ {isFr ? 'PIÈGE DE TILT' : 'TILT TRAP'}
                            </span>
                          )}
                          {selectedNode.is_panic && (
                            <span className="dl-risk-badge dl-risk-churn">
                              ✦ {isFr ? 'PANIC BUY TARDIF' : 'LATE PANIC BUY'}
                            </span>
                          )}
                        </div>
                        <h4 className="dl-card-title">{isFr ? selectedNode.name : (selectedNode.name_en || selectedNode.name)}</h4>
                      </div>
                    </div>

                    <div className="dl-node-inspector-metrics">
                      <div className="dl-trace-stat-pod">
                        <span className="dl-trace-stat-label">{isFr ? 'Timestamp Achat' : 'Purchase Timestamp'}</span>
                        <span className="dl-trace-stat-val tabular-nums">{selectedNode.time}</span>
                      </div>
                      <div className="dl-trace-stat-pod">
                        <span className="dl-trace-stat-label">{isFr ? 'Coût en Âmes' : 'Soul Cost'}</span>
                        <span className="dl-trace-stat-val glow-cyan tabular-nums">{selectedNode.cost} Souls</span>
                      </div>
                    </div>
                  </div>

                  <div className="dl-node-inspector-finding">
                    <strong style={{ color: selectedNode.is_trap || selectedNode.is_panic ? 'var(--ml-churn)' : 'var(--ml-retention)' }}>
                      ✦ {isFr ? 'Diagnostic Télémétrique Replay : ' : 'Replay Telemetry Finding: '}
                    </strong>
                    <span>{isFr ? selectedNode.note_fr : selectedNode.note_en}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 4 Behavioral Purchase Schemas Cards Grid */}
            <div className="lab-chapter-header dl-section-mt-lg">
              <h3 className="lab-chapter-title">
                {isFr
                  ? 'Les 4 Schémas d’Erreurs d’Équipement Identifiés par le Modèle ML'
                  : 'The 4 Equipment Error Schemas Identified by the ML Pipeline'}
              </h3>
            </div>

            <div className="lab-schemas-grid">
              {PURCHASE_SCHEMAS.map((sch) => (
                <div
                  key={sch.id}
                  className="card lab-schema-card dl-schema-card"
                  style={{ '--schema-accent': sch.color }}
                >
                  <div className="dl-schema-card-top">
                    <span className="dl-schema-num">
                      {isFr ? sch.num : (sch.num_en || sch.num)}
                    </span>
                    <span className="dl-slot-badge dl-schema-badge">
                      {isFr ? sch.badge : (sch.badge_en || sch.badge)}
                    </span>
                  </div>
                  <h4 className="dl-card-title dl-card-title-md">
                    {isFr ? sch.title_fr : sch.title_en}
                  </h4>
                  <p className="dl-card-body-text">
                    {isFr ? sch.desc_fr : sch.desc_en}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* =================================================================== */}
          {/* SUB-TAB PANEL 02: CALM ANALYTICAL ITEM CATALOG & LATERAL INSPECTOR  */}
          {/* =================================================================== */}
          <div
            id="item-step-catalog"
            role="tabpanel"
            className={`dl-subtab-panel ${activeSubTab === 'catalog' ? 'is-active' : ''}`}
          >
            <div className="lab-chapter-header">
              <h2 className="lab-chapter-title">
                {isFr
                  ? 'Catalogue des Items Source 2 & Inspecteur Télémétrique'
                  : 'Source 2 Item Churn Catalog & Lateral Telemetry Inspector'}
              </h2>
              <p className="lab-chapter-subtitle">
                {isFr
                  ? "Cliquez sur un item dans la liste analytique pour afficher son profil complet et sa recommandation anti-tilt dans l'inspecteur latéral."
                  : 'Click any item in the analytical list to view its telemetry breakdown and AI anti-tilt counter-recommendation in the lateral inspector.'}
              </p>
            </div>

            {/* Interactive Filters Bar */}
            <div className="dl-catalog-controls-card">
              <div className="dl-cat-filter-pills">
                {[
                  { id: 'all', label: isFr ? 'Tous les items' : 'All items', cls: 'cat-all', dot: null },
                  { id: 'weapon', label: isFr ? 'Weapon (Armes)' : 'Weapon (Offense)', cls: 'cat-weapon', dot: 'is-weapon' },
                  { id: 'vitality', label: isFr ? 'Vitality (Survie)' : 'Vitality (Survival)', cls: 'cat-vitality', dot: 'is-vitality' },
                  { id: 'spirit', label: isFr ? 'Spirit (Pouvoirs)' : 'Spirit (Ability)', cls: 'cat-spirit', dot: 'is-spirit' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveItemCategory(cat.id)}
                    className={`dl-cat-filter-btn ${cat.cls} ${activeItemCategory === cat.id ? 'is-active' : ''}`}
                  >
                    {cat.dot && <span className={`dl-cat-dot ${cat.dot}`} aria-hidden="true" />}
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              <div className="dl-catalog-search-group">
                <input
                  type="text"
                  className="dl-catalog-input"
                  placeholder={isFr ? 'Filtrer par nom ou palier...' : 'Search item name or tier...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                  className="dl-catalog-select"
                  value={itemSort}
                  onChange={(e) => setItemSort(e.target.value)}
                >
                  <option value="churn_desc">{isFr ? 'Taux de Churn (Décroissant)' : 'Churn Rate (Highest)'}</option>
                  <option value="churn_asc">{isFr ? 'Taux de Churn (Croissant)' : 'Churn Rate (Lowest)'}</option>
                  <option value="cost_asc">{isFr ? 'Coût en Âmes (Croissant)' : 'Soul Cost (Lowest)'}</option>
                  <option value="cost_desc">{isFr ? 'Coût en Âmes (Décroissant)' : 'Soul Cost (Highest)'}</option>
                  <option value="time_asc">{isFr ? 'Timing Moyen d’Achat' : 'Average Purchase Time'}</option>
                </select>
                <span className="font-mono tabular-nums" style={{ fontSize: '0.82rem', color: 'var(--color-ink-2)', whiteSpace: 'nowrap' }}>
                  {filteredItems.length} / {rawItems.length} {isFr ? 'items' : 'items'}
                </span>
              </div>
            </div>

            {/* Split Layout: Calm Analytical Rows (Left) + Sticky Lateral Inspector (Right) */}
            <div className="dl-catalog-split-layout">
              {/* Left: Calm vertical row list (zero rainbow cards) */}
              <div ref={catalogGridRef} className="dl-catalog-grid">
                {filteredItems.map((item) => {
                  const churnPct = item.churn_rate != null ? (item.churn_rate <= 1 ? item.churn_rate * 100 : item.churn_rate) : 0;
                  const risk = getItemRiskMeta(churnPct);
                  const categoryName = item.slot_type || item.category || 'weapon';
                  const slotCls = getSlotClass(categoryName);
                  const dotCls = categoryName.toLowerCase().includes('vital')
                    ? 'is-vitality'
                    : categoryName.toLowerCase().includes('spirit')
                    ? 'is-spirit'
                    : 'is-weapon';
                  const costVal = item.cost ?? item.soul_cost ?? 500;
                  const buyTimeStr =
                    item.avg_buy_time ||
                    (item.avg_purchase_minute != null
                      ? `~${Number(item.avg_purchase_minute).toFixed(1)}m`
                      : item.avg_buy_time_min != null
                      ? `~${Number(item.avg_buy_time_min).toFixed(1)}m`
                      : 'N/A');
                  const overindexDisplay =
                    item.overindex_pct ||
                    (item.churner_overindex_pct != null
                      ? `${item.churner_overindex_pct > 0 ? '+' : ''}${item.churner_overindex_pct}%`
                      : null);
                  const isInspected =
                    activeCatalogItem &&
                    (activeCatalogItem.id || activeCatalogItem.name_en) === (item.id || item.name_en);
                  const itemIconUrl = getItemIcon(item.name_en || item.name_fr);

                  return (
                    <div
                      key={item.id || item.name_en}
                      className={`lab-item-grid-card dl-item-card-layout ${isInspected ? 'is-inspected' : ''}`}
                      onClick={() => handleSelectCatalogItem(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectCatalogItem(item);
                        }
                      }}
                    >
                      <div className="dl-item-row-top">
                        <div className="dl-item-row-identity">
                          <div className="dl-seq-icon-frame" style={{ width: 32, height: 32 }}>
                            {itemIconUrl ? (
                              <img
                                src={itemIconUrl}
                                alt={item.name_en}
                                className="dl-seq-icon-img"
                                style={{ width: 24, height: 24 }}
                              />
                            ) : (
                              <span className={`dl-slot-badge ${slotCls}`}>
                                T{item.tier ?? 1}
                              </span>
                            )}
                          </div>
                          <div className="dl-item-row-title-block">
                            <h4 className="dl-seq-item-name" style={{ fontSize: '0.95rem', margin: 0 }}>
                              {isFr ? item.name_fr || item.name_en : item.name_en}
                            </h4>
                            <span className="dl-item-row-meta-inline">
                              <span className={`dl-cat-dot ${dotCls}`} aria-hidden="true" />
                              <span>{categoryName} · Tier {item.tier ?? 1}</span>
                            </span>
                          </div>
                        </div>

                        <div className="dl-item-row-metrics">
                          <div className="dl-item-row-churn-wrap">
                            <div className="dl-item-micro-track" aria-hidden="true">
                              <div
                                className="dl-item-micro-fill"
                                style={{
                                  width: `${Math.min(100, Math.max(6, churnPct * 1.6))}%`,
                                  background: risk.color
                                }}
                              />
                            </div>
                            <span
                              className="font-mono tabular-nums"
                              style={{ color: risk.color, fontWeight: 700, fontSize: '0.9rem' }}
                            >
                              {churnPct.toFixed(1)}%
                            </span>
                          </div>
                          <span className={`dl-risk-text ${risk.className}`}>
                            {risk.label}
                          </span>
                        </div>
                      </div>

                      <p className="dl-item-row-desc">
                        {isFr
                          ? item.behavioral_insight_fr || item.behavioral_insight_en
                          : item.behavioral_insight_en || item.behavioral_insight_fr}
                      </p>

                      <div className="dl-item-row-footer font-mono tabular-nums">
                        <span>{isFr ? 'Timing ' : 'Timing '}{buyTimeStr}</span>
                        <span style={{ color: 'var(--color-ink-2)' }}>{costVal} Souls</span>
                        {overindexDisplay && (
                          <span style={{ color: overindexDisplay.startsWith('+') ? 'var(--ml-churn)' : 'var(--ml-retention)' }}>
                            {overindexDisplay} churn
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right: Sticky Lateral Item Telemetry Inspector */}
              {activeCatalogItem && (() => {
                const iChurn = activeCatalogItem.churn_rate != null
                  ? (activeCatalogItem.churn_rate <= 1 ? activeCatalogItem.churn_rate * 100 : activeCatalogItem.churn_rate)
                  : 30;
                const iRetain = Math.max(0, 100 - iChurn);
                const iCat = activeCatalogItem.slot_type || activeCatalogItem.category || 'weapon';
                const iRisk = getItemRiskMeta(iChurn);
                const iCost = activeCatalogItem.cost ?? activeCatalogItem.soul_cost ?? 500;
                const iTime =
                  activeCatalogItem.avg_buy_time ||
                  (activeCatalogItem.avg_purchase_minute != null
                    ? `~${Number(activeCatalogItem.avg_purchase_minute).toFixed(1)} min`
                    : activeCatalogItem.avg_buy_time_min != null
                    ? `~${Number(activeCatalogItem.avg_buy_time_min).toFixed(1)} min`
                    : '11.0 min');
                const iOrderRank = activeCatalogItem.avg_order_rank != null
                  ? `#${activeCatalogItem.avg_order_rank}`
                  : '#5';
                const iOverindex =
                  activeCatalogItem.overindex_pct ||
                  (activeCatalogItem.churner_overindex_pct != null
                    ? `${activeCatalogItem.churner_overindex_pct > 0 ? '+' : ''}${activeCatalogItem.churner_overindex_pct}%`
                    : iChurn >= 38 ? '+65.0%' : '-35.0%');
                const inspectorIconUrl = getItemIcon(activeCatalogItem.name_en || activeCatalogItem.name_fr);

                return (
                  <aside
                    id="dl-catalog-inspector"
                    ref={catalogInspectorRef}
                    className={`dl-catalog-inspector-card ${inspectorPulse ? 'is-just-updated' : ''}`}
                    style={{ '--inspector-beam': getSlotColorToken(iCat) }}
                    aria-label={isFr ? 'Inspecteur Détaillé Item' : 'Detailed Item Inspector'}
                  >
                    <div className="dl-inspector-top-row">
                      <span className="dl-slot-badge dl-slot-souls">
                        ✦ {isFr ? 'INSPECTEUR TÉLÉMÉTRIQUE' : 'TELEMETRY INSPECTOR'}
                      </span>
                      <span className={`dl-risk-badge ${iRisk.className}`}>
                        {iRisk.label}
                      </span>
                    </div>

                    <div className="dl-inspector-id-row">
                      <div className="dl-seq-icon-frame dl-seq-icon-frame-54" style={{ borderColor: getSlotColorToken(iCat) }}>
                        {inspectorIconUrl ? (
                          <img
                            src={inspectorIconUrl}
                            alt={activeCatalogItem.name_en}
                            className="dl-seq-icon-img-44"
                          />
                        ) : (
                          <span className={`dl-slot-badge ${getSlotClass(iCat)}`}>
                            T{activeCatalogItem.tier ?? 1}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="dl-card-title dl-card-title-lg">
                          {isFr ? activeCatalogItem.name_fr || activeCatalogItem.name_en : activeCatalogItem.name_en}
                        </h3>
                        <div className="dl-inspector-badges-row">
                          <span className={`dl-slot-badge ${getSlotClass(iCat)}`}>
                            {iCat} • Tier {activeCatalogItem.tier ?? 1}
                          </span>
                          <span className="dl-slot-badge dl-slot-souls">
                            {iCost} Souls
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Churn vs Retention Dual Split Bar */}
                    <div className="dl-inspector-split-box">
                      <div className="dl-inspector-split-labels">
                        <span style={{ color: 'var(--ml-churn)' }}>
                          CHURN : {iChurn.toFixed(1)}%
                        </span>
                        <span style={{ color: 'var(--ml-retention)' }}>
                          {isFr ? 'RÉTENTION' : 'RETENTION'} : {iRetain.toFixed(1)}%
                        </span>
                      </div>
                      <div className="dl-build-balance-bar">
                        <div
                          className="dl-balance-seg"
                          style={{ width: `${iChurn}%`, background: 'var(--ml-churn)' }}
                        />
                        <div
                          className="dl-balance-seg"
                          style={{ width: `${iRetain}%`, background: 'var(--ml-retention)' }}
                        />
                      </div>
                    </div>

                    {/* Complete 2x2 Telemetry Pods (Timing, Order Rank, Cost, Churn Over-Index) */}
                    <div className="lab-spotlight-hud-grid dl-inspector-pods-2x2">
                      <div className="lab-spotlight-hud-pod">
                        <span className="lab-spotlight-hud-label">{isFr ? 'Timing Moyen' : 'Avg Timing'}</span>
                        <span className="lab-spotlight-hud-val glow-cyan tabular-nums dl-inspector-pod-val">
                          {iTime}
                        </span>
                      </div>
                      <div className="lab-spotlight-hud-pod">
                        <span className="lab-spotlight-hud-label">{isFr ? 'Rang d’Achat' : 'Purchase Rank'}</span>
                        <span className="lab-spotlight-hud-val glow-cyan tabular-nums dl-inspector-pod-val">
                          {iOrderRank}
                        </span>
                      </div>
                      <div className="lab-spotlight-hud-pod">
                        <span className="lab-spotlight-hud-label">{isFr ? 'Coût Boutique' : 'Shop Cost'}</span>
                        <span className="lab-spotlight-hud-val glow-cyan tabular-nums dl-inspector-pod-val">
                          {iCost} Souls
                        </span>
                      </div>
                      <div className="lab-spotlight-hud-pod" title={isFr ? "Écart relatif de fréquence d'achat entre les joueurs qui abandonnent et les joueurs fidélisés" : "Relative purchase frequency difference between churned and retained players"}>
                        <span className="lab-spotlight-hud-label">{isFr ? 'Sur-Représentation Churn' : 'Churn Over-Index'}</span>
                        <span className={`lab-spotlight-hud-val tabular-nums dl-inspector-pod-val ${iOverindex.startsWith('+') ? 'glow-rose' : 'glow-mint'}`}>
                          {iOverindex}
                        </span>
                      </div>
                    </div>

                    {/* Full Behavioral Insight Box */}
                    <div className="dl-inspector-autopsy-box">
                      <div className="dl-inspector-box-eyebrow">
                        {isFr ? 'Autopsie Comportementale Source 2' : 'Source 2 Behavioral Autopsy'}
                      </div>
                      <p className="dl-card-body-text">
                        {isFr
                          ? activeCatalogItem.behavioral_insight_fr || activeCatalogItem.behavioral_insight_en
                          : activeCatalogItem.behavioral_insight_en || activeCatalogItem.behavioral_insight_fr}
                      </p>
                    </div>

                    {/* AI Remedy Box */}
                    <div className="dl-inspector-remedy-box">
                      <div className="dl-inspector-remedy-eyebrow">
                        {isFr ? 'Prescription IA Anti-Tilt' : 'AI Anti-Tilt Prescription'}
                      </div>
                      <p className="dl-card-body-text" style={{ color: 'var(--color-ink)' }}>
                        {iChurn >= 38
                          ? isFr
                            ? "Équipement acheté beaucoup plus souvent par les joueurs sur le départ : l'assistant recommande d'intercaler Healing Rite (500 Souls), Restorative Locket (1 250) ou Cultist Sacrifice (3 000) avant de finaliser cet achat offensif."
                            : 'Heavily over-indexed among churners: the ML assistant recommends slotting Healing Rite (500 Souls), Restorative Locket (1,250), or Cultist Sacrifice (3,000) prior to this purchase.'
                          : isFr
                          ? "Ancre de stabilisation validée : cet équipement amortit les pics de dégâts sous étourdissement et réduit significativement la probabilité de déconnexion à 14 jours."
                          : 'Validated stabilization anchor: this item absorbs crowd-control burst spikes and significantly lowers 14-day churn probability.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="dl-mobile-inspector-back-btn"
                      onClick={() => catalogGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    >
                      <span>{isFr ? 'Retour au Catalogue' : 'Back to Catalog Grid'}</span>
                    </button>
                  </aside>
                );
              })()}
            </div>

            {/* Systemic AI Shop Assistant Banner */}
            <div className="dl-glass-card dl-assistant-banner">
              <div>
                <div className="dl-assistant-banner-head">
                  <span className="dl-risk-text dl-risk-balanced">
                    {isFr ? 'Recommandation systémique ML' : 'Systemic ML recommendation'}
                  </span>
                  <h4 className="dl-card-title">
                    {isFr ? 'Assistant Boutique Dynamique Anti-Tilt en Partie' : 'Real-Time Anti-Tilt Shop Assistant'}
                  </h4>
                </div>
                <p className="dl-card-body-text">
                  {isFr
                    ? "Lorsqu'un joueur sur Vindicta, Seven ou Ivy dépasse 12 minutes avec 0% d'items Vitality et subit >20% de headshots entrants, l'interface de boutique peut surligner proactivement Monster Rounds (4m), Cultist Sacrifice (11m) ou Counterspell avant le point de rupture émotionnel."
                    : 'When a player on Vindicta, Seven, or Ivy passes 12 minutes with 0% Vitality items while taking >20% incoming headshots, the in-game shop can proactively highlight Monster Rounds, Cultist Sacrifice, or Counterspell before emotional burnout hits.'}
                </p>
              </div>
              <span className="dl-risk-text dl-risk-retention">
                {isFr ? 'Design de rétention actionnable' : 'Actionable retention design'}
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
