import React, { useState, useEffect } from 'react';
import { MOCK_ARCHETYPES } from '../data/mockData';
import { t as defaultT, translateRank, translateRiskLevel } from '../translations';
import RiskGauge from './RiskGauge';
import FactorAttribution from './FactorAttribution';

export const CALIBRATED_ARCHETYPES = MOCK_ARCHETYPES;

function getTiltTier(score, isFr) {
  if (score >= 60.0) {
    return {
      label: isFr ? 'Tilt Extrême (≥ 60 • Ragequit Imminent)' : 'Extreme Tilt (≥ 60 • Imminent Ragequit)',
      badgeClass: 'badge-rose',
      glowClass: 'glow-rose',
      action: isFr
        ? 'Action Matchmaking : Alerte critique. Isoler de toute autre file en tilt, proposer une pause de 15 min ou orienter vers le mode détente tout en conservant un MMR équitable 50/50.'
        : 'Matchmaking Action: Critical alert. Unstack from other tilted players, suggest a 15-min cooldown, or route toward low-stakes play while keeping fair 50/50 MMR.'
    };
  }
  if (score >= 30.0) {
    return {
      label: isFr ? 'Énervé (30–59.9 • Frustration Aiguë)' : 'Agitated (30–59.9 • Acute Frustration)',
      badgeClass: 'badge-high-tilt',
      glowClass: 'glow-high-tilt',
      action: isFr
        ? 'Action Matchmaking : Risque modéré/élevé. Associer à des coéquipiers à fort sang-froid (conduite exemplaire) au même MMR pour amortir la spirale émotionnelle.'
        : 'Matchmaking Action: Elevated risk. Pair with high-composure teammates at identical MMR to dampen emotional spiral transmission.'
    };
  }
  if (score >= 15.0) {
    return {
      label: isFr ? 'Vigilance (15–29.9)' : 'Vigilance (15–29.9)',
      badgeClass: 'badge-amber',
      glowClass: 'text-amber',
      action: isFr
        ? 'Action Matchmaking : Surveillance passive. Éviter les lobbys contre des escouades coordonnées sur 5+ victoires.'
        : 'Matchmaking Action: Passive monitoring. Avoid stacking opponents on 5+ win streaks.'
    };
  }
  return {
    label: isFr ? 'Serein (< 15 • Équilibre Nominal)' : 'Composed (< 15 • Nominal State)',
    badgeClass: 'badge-emerald',
    glowClass: 'glow-emerald',
    action: isFr
      ? 'Action Matchmaking : Équilibre optimal. Appariement standard pur par MMR (50/50) ; profil ancre idéal.'
      : 'Matchmaking Action: Optimal mental state. Standard 50/50 MMR queue; ideal stabilizing squad anchor.'
  };
}

function getMatchmakingRecommendation(churnProb, isFr) {
  if (churnProb >= 0.60) {
    return {
      tier: isFr ? 'Intervention Prioritaire Anti-Spirale' : 'Priority Anti-Spiral Intervention',
      color: 'var(--ml-churn)',
      action: isFr
        ? "Éviter de regrouper plusieurs joueurs solo en tilt dans la même équipe ; associer à ≥ 2 coéquipiers stables (fort soutien allié) à MMR strictement égal (50/50) et proposer une pause courte après la partie."
        : 'Avoid stacking multiple tilted solo players on one roster; pair with ≥ 2 composed teammates (high ally support) at strict 50/50 MMR and suggest a short post-match cooldown.'
    };
  }
  if (churnProb >= 0.225) {
    return {
      tier: isFr ? 'Amortissement de Fatigue Compétitive' : 'Competitive Fatigue Dampening',
      color: 'var(--ml-warning)',
      action: isFr
        ? "Session marathon / érosion mécanique détectée : protéger contre les files solo ultra-volatiles et équilibrer la présence de frontlane dans l'escouade."
        : 'Marathon fatigue or mechanical erosion detected: shield from volatile solo queues and balance frontline composition within the squad.'
    };
  }
  if (churnProb >= 0.16) {
    return {
      tier: isFr ? 'Profil Ancre Stabilisateur' : 'Stabilizing Anchor Profile',
      color: 'var(--ml-retention)',
      action: isFr
        ? "Joueur calme et orienté objectifs : excellent candidat d'escouade pour stabiliser un coéquipier sous pression sans altérer le niveau du lobby."
        : 'Calm, objective-oriented player: ideal squadmate to stabilize an agitated teammate without altering lobby skill fairness.'
    };
  }
  return {
    tier: isFr ? 'File Compétitive Standard' : 'Standard Competitive Queue',
    color: 'var(--ml-retention)',
    action: isFr
      ? 'Rétention solide, aucune friction anormale : appariement pur par MMR et latence.'
      : 'High retention resilience, zero abnormal friction: pure skill MMR and latency matching.'
  };
}

/**
 * SimulatorSection Component
 * Act 2: Matchmaking Actionability, 4 Calibrated Archetypes & 4-Slider Tilt Queue Simulator
 */
export default function SimulatorSection({
  lang = 'fr',
  t: tProp = defaultT,
  initialArchetypeId = 'tilting_trooper',
  activePlayer: activePlayerProp,
  onSelectArchetype: onSelectArchetypeProp,
  archetypes: archetypesProp
}) {
  const isFr = lang === 'fr';

  const tr = (key, fallback) => {
    if (typeof tProp === 'function') {
      const val = tProp(key, lang);
      if (val && val !== key) return val;
    }
    return fallback;
  };

  const archetypes = archetypesProp && archetypesProp.length ? archetypesProp : MOCK_ARCHETYPES;

  const [simMode, setSimMode] = useState('profiles'); // 'profiles' | 'sliders'
  const [simAbandons, setSimAbandons] = useState(1);
  const [simStreak, setSimStreak] = useState(-3);
  const [simNightOwl, setSimNightOwl] = useState(35);
  const [simAccDrop, setSimAccDrop] = useState(18);

  useEffect(() => {
    const onOpenSliders = () => setSimMode('sliders');
    if (typeof window !== 'undefined') {
      window.addEventListener('deadlock:open-tilt-sim', onOpenSliders);
      return () => window.removeEventListener('deadlock:open-tilt-sim', onOpenSliders);
    }
    return undefined;
  }, []);

  const rawTilt =
    Math.max(0, -simStreak) * 12.0 +
    (simAbandons / 20) * 40.0 +
    (simNightOwl / 100) * 15.0 +
    (simAccDrop / 100) * 33.0;
  const calculatedTilt = Math.min(100.0, Math.max(0.0, Number(rawTilt.toFixed(1))));
  const currentTier = getTiltTier(calculatedTilt, isFr);

  const [internalSelectedArchetypeId, setInternalSelectedArchetypeId] = useState(initialArchetypeId);
  const [internalActivePlayer, setInternalActivePlayer] = useState(() => {
    const found = archetypes.find((a) => a.id === initialArchetypeId || a.legacyId === initialArchetypeId);
    return found || archetypes[0];
  });

  const activePlayer = activePlayerProp || internalActivePlayer;
  const selectedArchetypeId = activePlayer?.id || internalSelectedArchetypeId;

  const handleSelectArchetype = (archetype) => {
    setInternalSelectedArchetypeId(archetype.id);
    setInternalActivePlayer(archetype);
    if (typeof onSelectArchetypeProp === 'function') {
      onSelectArchetypeProp(archetype);
    }
  };

  const riskInfo = translateRiskLevel(activePlayer.churn_probability ?? activePlayer.probability ?? 0, lang);
  const activeFeatures = activePlayer.features || {};

  return (
    <section id="archetypes" className="section" aria-labelledby="archetypes-heading">
      <div id="simulator" style={{ position: 'relative', top: '-90px' }} aria-hidden="true" />
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="badge badge-orange" style={{ marginBottom: '0.75rem' }}>
            <span className="badge-dot" />
            <span>{isFr ? 'ACTIONABILITÉ MATCHMAKING & DIAGNOSTIC' : 'MATCHMAKING ACTIONABILITY & DIAGNOSTICS'}</span>
          </div>
          <h2 id="archetypes-heading">
            {isFr
              ? '4 Profils Types & Simulateur de Matchmaking'
              : '4 Player Archetypes & Matchmaking Simulator'}
          </h2>
          <p>
            {isFr
              ? "Sélectionnez un profil réel ou manipulez les curseurs de tilt pour observer comment le matchmaking protège la rétention sans jamais truquer l'équité 50/50."
              : 'Select a calibrated player profile or tweak live tilt sliders to see how matchmaking protects retention without rigging 50/50 fairness.'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              background: 'var(--color-paper-inset)',
              padding: '0.35rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              gap: '0.5rem',
              maxWidth: '100%'
            }}
          >
            <button
              type="button"
              onClick={() => setSimMode('profiles')}
              className={`btn ${simMode === 'profiles' ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                padding: '0.55rem 1.15rem',
                fontSize: '0.86rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)'
              }}
              aria-pressed={simMode === 'profiles'}
            >
              {isFr ? '4 Profils & Décision Matchmaking' : '4 Profiles & Matchmaking Action'}
            </button>
            <button
              type="button"
              onClick={() => setSimMode('sliders')}
              className={`btn ${simMode === 'sliders' ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                padding: '0.55rem 1.15rem',
                fontSize: '0.86rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)'
              }}
              aria-pressed={simMode === 'sliders'}
            >
              {isFr ? 'Simulateur de Tilt & File (4 Curseurs)' : 'Live Tilt & Queue Simulator (4 Sliders)'}
            </button>
          </div>
        </div>

        {/* PANEL A: 4 Profiles & Active Matchmaking Decision Dashboard */}
        <div style={{ display: simMode === 'profiles' ? 'block' : 'none' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginBottom: '1.25rem',
                textAlign: 'center'
              }}
            >
              {isFr
                ? 'Sélectionnez un des 4 profils de référence calibrés :'
                : 'Select one of 4 calibrated benchmark profiles:'}
            </h3>

          <div className="grid-4" style={{ gap: '1.25rem' }}>
            {archetypes.map((arch) => {
              const isSelected =
                selectedArchetypeId === arch.id ||
                selectedArchetypeId === arch.legacyId ||
                selectedArchetypeId === arch.aliasId;
              const probNum = arch.churn_probability ?? arch.probability ?? 0;
              const probFormatted = `${(probNum * 100).toFixed(1)}%`;
              const probColor =
                probNum >= 0.6
                  ? 'var(--accent-rose)'
                  : probNum >= 0.225
                  ? 'var(--accent-amber)'
                  : 'var(--accent-emerald)';

              return (
                <div
                  key={arch.id}
                  onClick={() => handleSelectArchetype(arch)}
                  className="card archetype-preview-card"
                  style={{
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--accent-orange)' : undefined,
                    backgroundColor: isSelected ? 'var(--bg-card-hover)' : undefined,
                    transition: 'border-color 0.2s ease, background-color 0.2s ease'
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectArchetype(arch);
                    }
                  }}
                  aria-pressed={isSelected}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span
                      className={`badge ${
                        arch.badgeClass ||
                        (probNum >= 0.6 ? 'badge-rose' : probNum >= 0.225 ? 'badge-amber' : 'badge-emerald')
                      }`}
                    >
                      {tr(
                        `simulator.archetypes.${arch.id}.riskBadge`,
                        isFr
                          ? probNum >= 0.6 ? 'Critique' : probNum >= 0.225 ? 'Modéré' : 'Faible'
                          : probNum >= 0.6 ? 'Critical' : probNum >= 0.225 ? 'Moderate' : 'Low'
                      )}
                    </span>
                    {isSelected && (
                      <span
                        className="badge badge-orange"
                        style={{
                          fontSize: '0.6875rem',
                          padding: '0.2rem 0.5rem',
                          fontWeight: 700
                        }}
                      >
                        {isFr ? '✓ Actif' : '✓ Active'}
                      </span>
                    )}
                  </div>

                  <div style={{ marginTop: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '0.25rem' }}>
                      {isFr ? (arch.nameFr || arch.name_fr) : (arch.nameEn || arch.name_en)}
                    </h4>
                    <p className="archetype-desc" style={{ minHeight: '2.4em', fontSize: '0.78rem' }}>
                      {isFr ? (arch.subtitleFr || arch.subtitle_fr) : (arch.subtitleEn || arch.subtitle_en)}
                    </p>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {isFr ? 'Risque Churn' : 'Churn Risk'}
                      </span>
                      <div className="archetype-prob" style={{ color: probColor, fontSize: '1.4rem', margin: 0 }}>
                        {probFormatted}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                      <span className="archetype-rank" style={{ fontSize: '0.74rem' }}>
                        {arch.rankLabel || arch.rank_label || translateRank(arch.rankTier || arch.rank_tier, lang)}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        ID #{arch.accountId || arch.account_id}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- 3. Active Profile Analysis Dashboard --- */}
        <div
          className="glass-card"
          style={{
            marginTop: '2rem',
            padding: 'clamp(1rem, 3.5vw, 2.5rem)',
            borderColor: 'rgba(16, 185, 129, 0.25)'
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '1.75rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                  {isFr ? (activePlayer.nameFr || activePlayer.name_fr) : (activePlayer.nameEn || activePlayer.name_en)}
                </h3>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                    color: 'var(--accent-orange)',
                    background: 'var(--accent-orange-alpha)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  Steam ID: {activePlayer.accountId || activePlayer.account_id}
                </span>
                {activePlayer.personaname && (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    ({activePlayer.personaname})
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                {isFr
                  ? (activePlayer.verdictFr || activePlayer.subtitleFr || activePlayer.subtitle_fr)
                  : (activePlayer.verdictEn || activePlayer.subtitleEn || activePlayer.subtitle_en)}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div className="stat-box" style={{ padding: '0.5rem 1rem', minWidth: '110px' }}>
                <span className="stat-label">{tr('simulator.telemetry.rank', isFr ? 'Rang' : 'Rank')}</span>
                <span className="stat-value" style={{ fontSize: '1rem', color: 'var(--accent-amber)' }}>
                  {activePlayer.rankLabel || activePlayer.rank_label || translateRank(activePlayer.rankTier || activePlayer.rank_tier, lang)}
                </span>
              </div>
              <div className="stat-box" style={{ padding: '0.5rem 1rem', minWidth: '120px' }}>
                <span className="stat-label">{isFr ? 'Niveau Risque' : 'Risk Tier'}</span>
                <span className="stat-value" style={{ fontSize: '1rem', color: riskInfo.color }}>
                  {riskInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Dual Analytics Row: Matchmaking Policy + Gauge + SHAP Attribution */}
          {(() => {
            const THETA_STAR = 0.225;
            const churnProb = activePlayer.churn_probability ?? activePlayer.probability ?? 0;
            const tiltVal = activeFeatures.tilt_index ?? 0;
            const streakVal = activeFeatures.current_streak_at_cutoff ?? activeFeatures.current_streak ?? 0;
            const isCriticalTrend = churnProb >= 0.60 || tiltVal >= 60.0;
            const isWarningTrend = !isCriticalTrend && (churnProb >= THETA_STAR || streakVal < 0);
            const mmRec = getMatchmakingRecommendation(churnProb, isFr);

            // Derive realistic 10-match W/L strip dynamically from current_streak & win_rate
            const buildMatchStrip = (streak, winRate) => {
              const len = 10;
              const arr = new Array(len).fill(true);
              const absStreak = Math.min(len, Math.max(0, Math.round(Math.abs(streak || 0))));
              const targetWins = Math.min(len, Math.max(0, Math.round((winRate ?? (isCriticalTrend ? 0.3 : isWarningTrend ? 0.45 : 0.7)) * len)));

              if (streak < 0 && absStreak > 0) {
                for (let i = len - absStreak; i < len; i++) arr[i] = false;
                const prefixLen = len - absStreak;
                if (prefixLen > 0) {
                  // Boundary match right before loss streak should be a Win if targetWins > 0
                  let winsLeft = Math.min(prefixLen, Math.max(1, targetWins));
                  arr[prefixLen - 1] = true;
                  winsLeft -= 1;
                  for (let i = 0; i < prefixLen - 1; i++) {
                    const remainingSlots = prefixLen - 1 - i;
                    const takeWin = winsLeft > 0 && ((i % 2 === 0) || winsLeft >= remainingSlots);
                    arr[i] = takeWin;
                    if (takeWin) winsLeft -= 1;
                  }
                }
              } else if (streak > 0 && absStreak > 0) {
                for (let i = len - absStreak; i < len; i++) arr[i] = true;
                const prefixLen = len - absStreak;
                if (prefixLen > 0) {
                  let lossesNeeded = Math.max(1, len - targetWins);
                  arr[prefixLen - 1] = false;
                  lossesNeeded -= 1;
                  for (let i = 0; i < prefixLen - 1; i++) {
                    const remainingSlots = prefixLen - 1 - i;
                    const takeLoss = lossesNeeded > 0 && ((i % 2 === 1) || lossesNeeded >= remainingSlots);
                    arr[i] = !takeLoss;
                    if (takeLoss) lossesNeeded -= 1;
                  }
                }
              } else {
                for (let i = 0; i < len; i++) {
                  arr[i] = Math.round(((i + 1) * targetWins) / len) > Math.round((i * targetWins) / len);
                }
              }
              return arr;
            };

            const matchHistory = buildMatchStrip(streakVal, activeFeatures.win_rate);

            const hsDiffVal = activeFeatures.headshot_diff_rate;
            const greyPctVal = activeFeatures.grey_screen_ratio != null
              ? (activeFeatures.grey_screen_ratio * 100).toFixed(1)
              : (isCriticalTrend ? '19.5' : isWarningTrend ? '14.2' : '7.2');
            const parryVal = activeFeatures.parry_miss_per_match != null
              ? activeFeatures.parry_miss_per_match.toFixed(1)
              : (isCriticalTrend ? '4.8' : isWarningTrend ? '3.2' : '0.8');

            const hsDisplay = hsDiffVal != null
              ? `${hsDiffVal > 0 ? '+' : ''}${Number(hsDiffVal).toFixed(1)}% ${isFr ? 'écart headshot' : 'headshot diff'}`
              : (isCriticalTrend
                  ? (isFr ? '-28.0% précision headshot' : '-28.0% headshot accuracy')
                  : isWarningTrend
                  ? (isFr ? '-14.0% précision headshot' : '-14.0% headshot accuracy')
                  : (isFr ? '+38.0% précision chirurgicale' : '+38.0% surgical accuracy'));

            const trajectoryBadge = isCriticalTrend
              ? {
                  label: tr('simulatorTrajectory.badgeCritical', isFr ? 'Spirale de Tilt Aiguë (Effondrement)' : 'Acute Tilt Spiral (Collapse)'),
                  color: 'var(--accent-rose, #ef4444)',
                  bg: 'rgba(239, 68, 68, 0.12)',
                  border: 'rgba(239, 68, 68, 0.35)',
                  velocity: hsDisplay,
                  gap: isFr ? `${greyPctVal}% temps en écran gris` : `${greyPctVal}% grey screen time`,
                  slope: isFr ? `${parryVal} parades manquées / m` : `${parryVal} missed parries / match`,
                  insight: isFr
                    ? `Effondrement mécanique en match aigu : ${parryVal} parades manquées/match, ${greyPctVal}% d'écran gris et revente panique d'objets (Gemme #5).`
                    : `Mechanical breakdown in acute match: ${parryVal} whiffed parries/match, ${greyPctVal}% grey screen downtime, and late-game panic sells (Gem #5).`
                }
              : isWarningTrend
              ? {
                  label: tr('simulatorTrajectory.badgeWarning', isFr ? 'Fatigue Compétitive Latente' : 'Latent Competitive Fatigue'),
                  color: 'var(--accent-amber, #d8ec57)',
                  bg: 'rgba(216, 236, 87, 0.12)',
                  border: 'rgba(216, 236, 87, 0.35)',
                  velocity: hsDisplay,
                  gap: isFr ? `${greyPctVal}% temps en écran gris` : `${greyPctVal}% grey screen time`,
                  slope: isFr ? `${parryVal} parades manquées / m` : `${parryVal} missed parries / match`,
                  insight: isFr
                    ? `Signaux de fatigue latente : ${greyPctVal}% de temps mort et ${parryVal} parades manquées/match couplés à un isolement solo.`
                    : `Latent fatigue indicators: ${greyPctVal}% grey screen time and ${parryVal} missed parries/match coupled with solo queue isolation.`
                }
              : {
                  label: tr('simulatorTrajectory.badgeStable', isFr ? 'Trajectoire Stable & Rétention Forte' : 'Stable Trajectory & High Retention'),
                  color: 'var(--accent-emerald, #10b981)',
                  bg: 'rgba(16, 185, 129, 0.12)',
                  border: 'rgba(16, 185, 129, 0.35)',
                  velocity: hsDisplay,
                  gap: isFr ? `${greyPctVal}% temps en écran gris` : `${greyPctVal}% grey screen time`,
                  slope: isFr ? `${parryVal} parade manquée / m` : `${parryVal} missed parry / match`,
                  insight: isFr
                    ? `Exécution biomécanique solide : faible écran gris (${greyPctVal}%), ${parryVal} parade manquée/match et fort soutien allié.`
                    : `Solid mechanical execution: low death downtime (${greyPctVal}%), ${parryVal} missed parry/match, and strong ally support.`
                };

            return (
              <>
                {/* Matchmaking Decision Callout */}
                <div
                  style={{
                    border: '1px solid var(--color-rule-strong)',
                    background: 'var(--color-paper-inset)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.9rem 1.15rem',
                    marginBottom: '1.35rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: mmRec.color }}>
                      {isFr ? 'Recommandation Matchmaking (Équité 50/50 · 0 % EOMM) :' : 'Matchmaking Action (50/50 Fairness · 0% EOMM):'}{' '}
                      <span style={{ color: 'var(--color-ink)' }}>{mmRec.tier}</span>
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      θ* = 0.225
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {mmRec.action}
                  </p>
                </div>

                <div className="simulator-analytics-grid" style={{ marginBottom: '1.35rem' }}>
                  {/* Left: Risk Gauge & Compact Baseline Telemetry */}
                  <div className="simulator-left-column">
                    <RiskGauge
                      probability={churnProb}
                      threshold={THETA_STAR}
                      lang={lang}
                      t={tProp}
                      riskTier={activePlayer.riskLevel || activePlayer.risk_tier}
                    />

                    <div className="telemetry-panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.15rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>
                          {isFr ? 'Signaux Match T' : 'Match T Snapshot'}
                        </h4>
                        <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                          100% IN-GAME
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                          gap: '0.65rem'
                        }}
                      >
                        <div className="stat-box" style={{ padding: '0.6rem 0.5rem' }}>
                          <span className="stat-label">{isFr ? 'Série Active' : 'Active Streak'}</span>
                          <span
                            className="stat-value"
                            style={{
                              fontSize: '1.1rem',
                              color: (activeFeatures.current_streak || 0) < 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)'
                            }}
                          >
                            {(activeFeatures.current_streak || 0) > 0 ? `+${activeFeatures.current_streak}` : activeFeatures.current_streak || 0}
                          </span>
                        </div>

                        <div className="stat-box" style={{ padding: '0.6rem 0.5rem' }}>
                          <span className="stat-label">{isFr ? 'Indice Tilt' : 'Tilt Index'}</span>
                          <span
                            className="stat-value"
                            style={{
                              fontSize: '1.1rem',
                              color: (activeFeatures.tilt_index || 0) >= 30 ? 'var(--accent-rose)' : 'var(--text-heading)'
                            }}
                          >
                            {activeFeatures.tilt_index != null ? activeFeatures.tilt_index.toFixed(1) : '0.0'}
                          </span>
                        </div>

                        <div className="stat-box" style={{ padding: '0.6rem 0.5rem' }}>
                          <span className="stat-label">{isFr ? 'Rage-Sell' : 'Rage-Sell'}</span>
                          <span
                            className="stat-value"
                            style={{
                              fontSize: '1.1rem',
                              color: (activeFeatures.rage_sell_rate || 0) >= 0.40
                                ? 'var(--accent-rose)'
                                : (activeFeatures.rage_sell_rate || 0) >= 0.20
                                  ? 'var(--accent-amber)'
                                  : 'var(--accent-emerald)'
                            }}
                          >
                            {activeFeatures.rage_sell_rate != null ? `${(activeFeatures.rage_sell_rate * 100).toFixed(1)}%` : '--'}
                          </span>
                        </div>

                        <div className="stat-box" style={{ padding: '0.6rem 0.5rem' }}>
                          <span className="stat-label">{isFr ? 'Matchs Solo' : 'Solo Streak'}</span>
                          <span
                            className="stat-value"
                            style={{
                              fontSize: '1.1rem',
                              color: (activeFeatures.solo_isolation_streak ?? 0) >= 3 ? 'var(--accent-rose)' : 'var(--accent-emerald)'
                            }}
                          >
                            {activeFeatures.solo_isolation_streak != null ? activeFeatures.solo_isolation_streak : '0'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Compact Bilateral Factor Attribution */}
                  <div className="simulator-right-column">
                    <FactorAttribution
                      profile={activePlayer}
                      features={activeFeatures}
                      churnProbability={churnProb}
                      lang={lang}
                      t={tProp}
                      player={activePlayer}
                      compact={true}
                    />
                  </div>
                </div>

                {/* Compact 10-Match Timeline Strip */}
                <div
                  className="simulator-trajectory-panel"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.15rem 1.35rem',
                    marginBottom: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>
                      {isFr ? 'Historique des 10 derniers matchs avant Point T' : 'Recent 10-match sequence before Cutoff T'}
                    </h4>
                    <span
                      className="badge"
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: trajectoryBadge.color,
                        background: trajectoryBadge.bg,
                        border: `1px solid ${trajectoryBadge.border}`,
                        padding: '0.25rem 0.65rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: trajectoryBadge.color }} />
                      {trajectoryBadge.label}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(10, 1fr)',
                      gap: 'clamp(2px, 0.8vw, 6px)',
                      alignItems: 'center'
                    }}
                  >
                    {matchHistory.map((isWin, idx) => {
                      const isLast = idx === matchHistory.length - 1;
                      return (
                        <div
                          key={idx}
                          style={{
                            textAlign: 'center',
                            padding: '0.4rem 0.1rem',
                            borderRadius: 'var(--radius-sm)',
                            background: isWin ? 'rgba(16, 185, 129, 0.14)' : 'rgba(239, 68, 68, 0.16)',
                            border: isLast
                              ? '1.5px solid var(--accent-orange)'
                              : isWin
                              ? '1px solid rgba(16, 185, 129, 0.35)'
                              : '1px solid rgba(239, 68, 68, 0.35)'
                          }}
                          title={`Match ${idx - 9}: ${isWin ? (isFr ? 'Victoire' : 'Win') : (isFr ? 'Défaite' : 'Loss')}`}
                        >
                          <span
                            style={{
                              fontSize: 'clamp(0.72rem, 1.8vw, 0.82rem)',
                              fontWeight: 800,
                              fontFamily: 'var(--font-mono)',
                              color: isWin ? 'var(--ml-retention)' : 'var(--ml-churn)'
                            }}
                          >
                            {isWin ? (isFr ? 'V' : 'W') : (isFr ? 'D' : 'L')}
                          </span>
                          <span style={{ display: 'block', fontSize: '0.58rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.1rem' }}>
                            {idx === 9 ? 'T' : `-${9 - idx}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    style={{
                      marginTop: '0.8rem',
                      padding: '0.6rem 0.85rem',
                      background: 'var(--color-paper-inset)',
                      border: '1px solid var(--color-rule)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5
                    }}
                  >
                    <strong>{isFr ? 'Diagnostic en match :' : 'In-game diagnostic:'}</strong> {trajectoryBadge.insight}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
        </div>

        {/* PANEL B: Live 4-Slider Tilt & Matchmaking Policy Simulator */}
        <div style={{ display: simMode === 'sliders' ? 'block' : 'none' }}>
          <div className="tilt-simulator-wrapper">
            <div className="card tilt-simulator-card">
              <div className="simulator-header-row">
                <div>
                  <div className="badge badge-orange" style={{ marginBottom: '0.5rem' }}>
                    {isFr ? 'SIMULATEUR MATCHMAKING TEMPS RÉEL' : 'LIVE MATCHMAKING SIMULATOR'}
                  </div>
                  <h3>
                    {isFr ? 'Simulateur de Tilt & Politique de File' : 'Live Tilt Index & Queue Policy Simulator'}
                  </h3>
                  <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                    {isFr
                      ? "Ajustez ces 4 paramètres récents pour observer le score de tilt et la décision matchmaking associée."
                      : 'Adjust these 4 recent telemetry inputs to see the live tilt score and resulting matchmaking policy.'}
                  </p>
                </div>

                <div className="tilt-score-display-box">
                  <span className="tilt-score-label">
                    {isFr ? 'Score de Tilt (/100)' : 'Tilt Score (/100)'}
                  </span>
                  <span className={`tilt-score-number ${currentTier.glowClass}`}>
                    {calculatedTilt.toFixed(1)}
                  </span>
                  <span className={`badge ${currentTier.badgeClass} tilt-tier-badge`}>
                    {currentTier.label}
                  </span>
                </div>
              </div>

              {/* Slider Controls Grid */}
              <div className="tilt-controls-grid">
                <div className="tilt-slider-group">
                  <div className="slider-label-row">
                    <label htmlFor="sim-abandons">{isFr ? 'Abandons / 20 Matchs :' : 'Abandons / 20 Matches:'}</label>
                    <span className="slider-value-pill">{simAbandons} ({((simAbandons / 20) * 100).toFixed(0)}% × 40)</span>
                  </div>
                  <input
                    id="sim-abandons"
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={simAbandons}
                    onChange={(e) => setSimAbandons(Number(e.target.value))}
                    className="tilt-slider"
                  />
                  <span className="slider-hint">
                    {isFr ? 'Taux d’abandon pondéré × 40.0 pts' : 'Abandon rate weighted × 40.0 pts'}
                  </span>
                </div>

                <div className="tilt-slider-group">
                  <div className="slider-label-row">
                    <label htmlFor="sim-streak">{isFr ? 'Série de Défaites :' : 'Consecutive Loss Streak:'}</label>
                    <span className="slider-value-pill">{Math.abs(simStreak)} {isFr ? 'défaites (× 12)' : 'losses (× 12)'}</span>
                  </div>
                  <input
                    id="sim-streak"
                    type="range"
                    min="-6"
                    max="0"
                    step="1"
                    value={simStreak}
                    onChange={(e) => setSimStreak(Number(e.target.value))}
                    className="tilt-slider"
                  />
                  <span className="slider-hint">
                    {isFr ? 'Chaque défaite consécutive ajoute +12.0 pts' : 'Each consecutive loss adds +12.0 pts'}
                  </span>
                </div>

                <div className="tilt-slider-group">
                  <div className="slider-label-row">
                    <label htmlFor="sim-night-owl">{isFr ? 'Jeu Nocturne (00h–06h) :' : 'Night-Owl Share (00h–06h):'}</label>
                    <span className="slider-value-pill">{simNightOwl}% (× 15)</span>
                  </div>
                  <input
                    id="sim-night-owl"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={simNightOwl}
                    onChange={(e) => setSimNightOwl(Number(e.target.value))}
                    className="tilt-slider"
                  />
                  <span className="slider-hint">
                    {isFr ? 'Fatigue circadienne pondérée jusqu’à +15.0 pts' : 'Circadian fatigue weighted up to +15.0 pts'}
                  </span>
                </div>

                <div className="tilt-slider-group">
                  <div className="slider-label-row">
                    <label htmlFor="sim-acc-drop">{isFr ? 'Chute Précision Visée :' : 'Aim Accuracy Drop:'}</label>
                    <span className="slider-value-pill">-{simAccDrop}% (× 33)</span>
                  </div>
                  <input
                    id="sim-acc-drop"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={simAccDrop}
                    onChange={(e) => setSimAccDrop(Number(e.target.value))}
                    className="tilt-slider"
                  />
                  <span className="slider-hint">
                    {isFr ? 'Érosion de précision pondérée jusqu’à +33.0 pts' : 'Aim erosion weighted up to +33.0 pts'}
                  </span>
                </div>
              </div>

              <div className="tilt-recommendation-box" style={{ marginTop: '1.25rem' }}>
                <div className="recommendation-header">
                  <span className="recommendation-icon" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M9 18h6" />
                      <path d="M10 22h4" />
                      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
                    </svg>
                  </span>
                  <span className="recommendation-title">{isFr ? 'Politique Recommandée de Matchmaking (Équité 50/50)' : 'Recommended Matchmaking Policy (50/50 Fair)'}</span>
                </div>
                <p className="recommendation-text">{currentTier.action}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}