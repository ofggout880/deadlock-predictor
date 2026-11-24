import React, { useState } from 'react';
import { MOCK_HIDDEN_GEMS_AUDIT } from '../data/mockData';

const FLAGSHIP_GEM_ORDER = [
  'rage_sell_rate',
  'solo_isolation_streak',
  'stun_headshots_taken_rate'
];

/**
 * PsychologySection Component
 * Act 3: Top 3 Behavioral Signals Alerting Matchmaking + Progressive Disclosure
 */
export default function PsychologySection({ lang }) {
  const isFr = lang === 'fr';

  const [activeView, setActiveView] = useState('hidden_gems'); // 'hidden_gems' | 'tilt_lab'
  const [showAllGems, setShowAllGems] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState('tilt_index');

  const orderedGems = [
    ...FLAGSHIP_GEM_ORDER.map((fKey) => MOCK_HIDDEN_GEMS_AUDIT.find((g) => g.feature === fKey)).filter(Boolean),
    ...MOCK_HIDDEN_GEMS_AUDIT.filter((g) => !FLAGSHIP_GEM_ORDER.includes(g.feature))
  ];
  const visibleGems = showAllGems ? orderedGems : orderedGems.slice(0, 3);

  // 6 Behavioral Features Catalog
  const featuresList = [
    {
      id: 'tilt_index',
      shortTitle: isFr ? 'Indice de Tilt' : 'Tilt Index',
      name: isFr ? "Indice de Tilt [0–100]" : "Tilt Frustration Index (tilt_index)",
      subtitle: isFr ? "Mesure de l'accumulation de frustration et de nervosité" : "Cumulative frustration & acute toxicity metric",
      category: isFr ? 'CRITIQUE' : 'CRITICAL',
      categoryBadge: 'badge-rose',
      pythonFormula: `# backend/app/services/feature_service.py (Échelle unifiée [0 - 100])
raw_tilt = (
    (max(0, recent_loss_streak) * 12.0)
    + (abandon_rate * 40.0)
    + (night_owl_pct * 15.0)
    + (max(0.0, accuracy_drop) * 33.0)
)
tilt_index = min(100.0, max(0.0, round(raw_tilt, 1)))`,
      mathFormula: "tilt_index = min(100, 12·loss_streak + 40·abandon_rate + 15·night_owl_pct + 33·acc_drop)",
      meaning: isFr
        ? "Capture la spirale infernale sur une échelle normalisée [0–100] : l'enchaînement de défaites consécutives (×12), les abandons prématurés (×40), la fatigue nocturne 00h–06h (×15) et l'effondrement de précision (×33)."
        : "Captures the acute tilt spiral on a unified [0–100] scale: consecutive loss streaks (×12), early match abandons (×40), late-night fatigue 00h–06h (×15), and aim accuracy collapse (×33).",
      impact: isFr
        ? "Multiplie par 3.2x le risque de churn immédiat. Les joueurs avec un tilt_index >= 60.0 entrent en zone rouge critique d'abandon à 14 jours."
        : "Multiplies immediate churn risk by 3.2x. Players with tilt_index >= 60.0 enter the critical red zone for 14-day disengagement.",
      correlation: isFr ? "+0.042 (Facteur Aggravant Direct)" : "+0.042 (Direct Aggravating Driver)",
      importance: isFr ? "Score Composite [0–100] (Critique ≥ 60)" : "Composite [0–100] Score (Critical ≥ 60)"
    },
    {
      id: 'stun_headshots',
      shortTitle: isFr ? 'Headshots sous Stun' : 'Stun Headshots',
      name: isFr ? "Headshots subis sous Stun (Gemme #2)" : "Stun Headshots Taken Rate (Gem #2)",
      subtitle: isFr ? "Humiliation biomécanique en situation d'impuissance" : "Biomechanical helplessness & stun humiliation",
      category: isFr ? 'GEMME #2' : 'GEM #2',
      categoryBadge: 'badge-rose',
      pythonFormula: `# backend/app/services/feature_service.py
stun_headshots = acute_match.get("headshots_taken_while_stunned", 0)
stun_hs_rate = stun_headshots / max(1, acute_match.get("deaths", 1))
headshot_diff = player_headshots_pct - enemy_headshots_pct`,
      mathFormula: "stun_headshot_rate = HS_taken_while_stunned / deaths",
      meaning: isFr
        ? "Mesure les tirs à la tête subis alors que le joueur est étourdi ou immobilisé (0.815 vs 0.684 chez les fidélisés, soit +19.1% sur N = 8 625, et jusqu'à +78.6% dans les replays profonds)."
        : "Measures headshots taken while immobilized or airborne. Departing players suffer +19.1% higher rate (0.815 vs 0.684) on N=8,625 windows (+78.6% in deep replays).",
      impact: isFr
        ? "Point de rupture mécanique majeur : le sentiment d'injustice face aux combos de stun précipite la décision d'abandonner la session."
        : "Primary mechanical tipping point: perceived lack of counterplay during stun chains precipitates ragequit.",
      correlation: isFr ? "MI = 0.0379 (Gemme Cachée #2)" : "MI = 0.0379 (Hidden Gem #2)",
      importance: isFr ? "1.07% Importance Test (Gemme #2)" : "1.07% Test Importance (Gem #2)"
    },
    {
      id: 'solo_isolation',
      shortTitle: isFr ? 'Isolement Solo' : 'Solo Isolation',
      name: isFr ? "Série d'Isolement Solo (Gemme #6)" : "Solo Isolation Streak (Gem #6)",
      subtitle: isFr ? "Rupture du bouclier social et vulnérabilité émotionnelle" : "Social shield breakdown & emotional exposure",
      category: isFr ? 'GEMME #6' : 'GEM #6',
      categoryBadge: 'badge-amber',
      pythonFormula: `# backend/app/services/feature_service.py
solo_streak = 0
for m in reversed(recent_matches):
    if m.get("party_size", 1) == 1:
        solo_streak += 1
    else:
        break`,
      mathFormula: "solo_isolation_streak = consecutive_solo_queue_matches",
      meaning: isFr
        ? "Nombre de parties consécutives jouées en solo sans ami. Les joueurs qui décrochent ont en moyenne une série de 2.22 matchs solo d'affilée contre 1.44 chez les joueurs fidélisés (+54.3%)."
        : "Number of consecutive matches queued without party companions. Departing players run 2.22 solo matches on average vs 1.44 for retained players (+54.3%).",
      impact: isFr
        ? "Jouer en groupe agit comme un amortisseur psychologique : les défaites partagées avec des amis réduisent l'impact du tilt."
        : "Party play serves as an emotional buffer: shared defeats with friends dramatically soften acute tilt.",
      correlation: isFr ? "r = +0.0858 • MI = 0.0525 (Gemme #6)" : "r = +0.0858 • MI = 0.0525 (Gem #6)",
      importance: isFr ? "3.34% Importance (#10 Modèle)" : "3.34% Importance (#10 Model)"
    },
    {
      id: 'late_panic_sells',
      shortTitle: isFr ? 'Revente Panique' : 'Rage-Sell',
      name: isFr ? "Revente Panique d'Inventaire (Gemme #5)" : "Late Inventory Rage-Sell (Gem #5)",
      subtitle: isFr ? "Liquidation d'objets dans les 90s précédant la défaite" : "Panic-selling items in the final 90 seconds before loss",
      category: isFr ? 'GEMME #5' : 'GEM #5',
      categoryBadge: 'badge-rose',
      pythonFormula: `# backend/app/services/feature_service.py
late_panic_sells = 0
if not acute_match.get("player_won", False):
    duration = acute_match.get("match_duration_s", 1800)
    for sell_event in acute_match.get("item_sells", []):
        if duration - sell_event.get("time_s", 0) <= 90:
            late_panic_sells += 1`,
      mathFormula: "rage_sell_rate = Late_Panic_Sells / Matches_Lost",
      meaning: isFr
        ? "Vendre ses objets de l'inventaire dans les 90 secondes avant l'effondrement du Patron. Ce geste traduit une démission totale et constitue le signal n°1 du modèle champion (rage_sell_rate)."
        : "Selling items in the last 90 seconds of a defeat. Signals total psychological resignation and ranks #1 in our champion model (rage_sell_rate).",
      impact: isFr
        ? "Signal comportemental #1 du modèle champion Gradient Boosting (14.09% d'importance relative, MI = 0.0756)."
        : "Top #1 feature in the Gradient Boosting champion model (14.09% permutation importance, MI = 0.0756).",
      correlation: isFr ? "MI = 0.0756 (Gemme Cachée #5)" : "MI = 0.0756 (Hidden Gem #5)",
      importance: isFr ? "14.09% Importance (#1 Modèle)" : "14.09% Importance (#1 Model)"
    },
    {
      id: 'grey_screen',
      shortTitle: isFr ? 'Écran Gris' : 'Grey Screen',
      name: isFr ? "Ratio d'Écran Gris / Mort (Gemme #4)" : "Grey Screen Ratio (Gem #4)",
      subtitle: isFr ? "Temps passé mort à fixer le compte à rebours de respawn" : "Match duration spent dead watching respawn timers",
      category: isFr ? 'GEMME #4' : 'GEM #4',
      categoryBadge: 'badge-amber',
      pythonFormula: `# backend/app/services/feature_service.py
total_time_dead = sum(death.get("respawn_delay_s", 30) for death in player_deaths)
grey_screen_ratio = total_time_dead / max(1, match_duration_s)`,
      mathFormula: "grey_screen_ratio = Total_Time_Dead / Match_Duration_Seconds",
      meaning: isFr
        ? "Proportion de la partie passée mort sans pouvoir interagir avec le jeu (12.46% chez les décrocheurs vs 11.94% chez les fidélisés sur N = 8 625, +4.4%). Fixer un écran inactif alimente l'impuissance."
        : "Fraction of match time spent dead with zero player agency (12.46% for churners vs 11.94% for retained on N=8,625, +4.4%). Gazing at a monochrome screen fuels helplessness.",
      impact: isFr
        ? "Facteur d'attrition continu qui ronge la patience du joueur lors des parties en infériorité numérique."
        : "Steady attrition multiplier eroding player patience during mismatched games.",
      correlation: isFr ? "r = +0.0362 (Gemme Cachée #4)" : "r = +0.0362 (Hidden Gem #4)",
      importance: isFr ? "1.23% Importance Test (Gemme #4)" : "1.23% Test Importance (Gem #4)"
    },
    {
      id: 'teammate_support',
      shortTitle: isFr ? "Soutien d'Équipe" : 'Team Support',
      name: isFr ? "Altruisme & Soutien d'Équipe (Gemme #7)" : "Altruism & Teammate Support (Gem #7)",
      subtitle: isFr ? "Volume de soins et de boucliers octroyés aux coéquipiers" : "Healing and protective barriers given to allies",
      category: isFr ? 'GEMME #7' : 'GEM #7',
      categoryBadge: 'badge-emerald',
      pythonFormula: `# backend/app/services/feature_service.py
ally_support = acute_match.get("healing_given_to_allies", 0) + acute_match.get("shields_granted_to_allies", 0)
teammate_support_per_min = ally_support / (match_duration_s / 60.0)`,
      mathFormula: "teammate_support_rate = (Ally_Heals + Ally_Shields) / Minutes",
      meaning: isFr
        ? "Soins et barrières conférés aux 5 autres joueurs de l'équipe. Les joueurs en partance apportent -13.9% de soutien à leurs alliés (31.19 vs 36.23 PV/min). L'abandon de l'entraide précède le départ."
        : "Heals and barrier shields granted to squad mates. Churners deliver -13.9% ally support (31.19 vs 36.23 HP/min). Breakdown of team altruism marks impending departure.",
      impact: isFr
        ? "Variable protectrice : les joueurs qui continuent à soutenir leurs coéquipiers présentent une rétention significativement plus élevée."
        : "Protective factor: players actively supporting teammates maintain strong competitive resilience.",
      correlation: isFr ? "r = -0.0217 • MI = 0.0345 (Protecteur)" : "r = -0.0217 • MI = 0.0345 (Protective)",
      importance: isFr ? "-13.9% Écart Soutien (Gemme #7)" : "-13.9% Support Gap (Gem #7)"
    }
  ];

  const currentFeature = featuresList.find((f) => f.id === selectedFeature) || featuresList[0];

  return (
    <section id="psychology" className="section" aria-labelledby="psychology-title">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="badge badge-orange header-badge-margin">
            {isFr ? 'SIGNAUX COMPORTEMENTAUX SOURCE 2' : 'SOURCE 2 BEHAVIORAL SIGNALS'}
          </div>
          <h2 id="psychology-title">
            {isFr
              ? 'Les 3 Signaux En Match qui Alertent le Matchmaking'
              : 'Top 3 In-Game Signals Alerting Matchmaking'}
          </h2>
          <p>
            {isFr
              ? "Sans aucune variable de calendrier, 3 comportements observables dès la fin du match concentrent l'essentiel du signal précoce de décrochage."
              : 'With zero calendar variables, 3 observable match behaviors concentrate early churn warning signals right after Match T.'}
          </p>
        </div>

        {/* View Mode Switcher */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1.75rem'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              background: 'var(--color-paper-inset)',
              padding: '0.35rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              gap: '0.5rem'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveView('hidden_gems')}
              className={`btn ${activeView === 'hidden_gems' ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                padding: '0.55rem 1.25rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="6 3 18 3 22 9 12 22 2 9" />
              </svg>
              <span>{isFr ? 'Signaux Clés Source 2' : 'Key Source 2 Signals'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView('tilt_lab');
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('deadlock:open-tilt-sim'));
                }
              }}
              className={`btn ${activeView === 'tilt_lab' ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                padding: '0.55rem 1.25rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 3h6v5l5 9a2 2 0 0 1-1.7 3H5.7A2 2 0 0 1 4 17l5-9V3z" />
              </svg>
              <span>{isFr ? 'Formules du Simulateur & 6 Variables' : 'Simulator Formulas & 6 Signals'}</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: Top 3 Flagship Source 2 Signals + Progressive Disclosure */}
        {activeView === 'hidden_gems' && (
          <div>
            {/* Compact 1-Line Ablation Proof Strip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.65rem',
                padding: '0.75rem 1.15rem',
                background: 'var(--color-paper-2)',
                border: '1px solid var(--color-rule)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem'
              }}
            >
              <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                {isFr
                  ? '71,2 % ROC-AUC avec les 7 gemmes comportementales seules vs 58,8 % pour la visée 3D pure · N = 8 625 fenêtres'
                  : '71.2% ROC-AUC from the 7 behavioral gems alone vs 58.8% for raw 3D aim · N = 8,625 windows'}
              </span>
              <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                71.21% ROC-AUC
              </span>
            </div>

            {/* Gems Cards Grid (3 Flagship by Default, 7 Expanded) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.25rem' }}>
              {visibleGems.map((gem, idx) => {
                const gemMatch = String(gem.gem_id || '').match(/gem(\d+)/i);
                const gemNum = gemMatch ? gemMatch[1] : idx + 1;
                const churnNum = parseFloat(String(gem.churner_mean || '0').replace(/[^0-9.-]/g, '')) || 0;
                const retNum = parseFloat(String(gem.retained_mean || '0').replace(/[^0-9.-]/g, '')) || 0;
                const pairMax = Math.max(0.001, churnNum, retNum) * 1.15;
                const churnBarPct = Math.min(100, Math.max(6, (churnNum / pairMax) * 100));
                const retBarPct = Math.min(100, Math.max(6, (retNum / pairMax) * 100));
                return (
                <div
                  key={gem.gem_id}
                  className="card"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem 1.35rem',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform var(--transition-normal), border-color var(--transition-normal)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span className="badge badge-orange" style={{ fontSize: '0.6875rem' }}>
                      {isFr ? 'GEMME' : 'HIDDEN GEM'} #{gemNum}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        color: 'var(--accent-emerald)',
                        background: 'rgba(16, 185, 129, 0.1)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      {gem.p_value}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '0.35rem' }}>
                    {isFr ? gem.name_fr : gem.name_en}
                  </h4>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                    feature: <code>{gem.feature}</code>
                  </div>

                  {/* Empirical Comparison Readout + Micro-Bars */}
                  <div
                    style={{
                      background: 'var(--color-paper-inset)',
                      padding: '0.7rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.55rem'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {isFr ? 'Joueurs Churn' : 'Churners'}
                        </span>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-rose)' }}>
                          {gem.churner_mean}
                        </span>
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <span className="badge badge-amber" style={{ fontSize: '0.72rem', fontWeight: 800 }}>
                          {gem.delta_pct}
                        </span>
                        <span style={{ display: 'block', fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          {isFr ? 'Δ Écart Relatif' : 'Δ Relative Gap'}
                        </span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {isFr ? 'Fidélisés' : 'Retained'}
                        </span>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                          {gem.retained_mean}
                        </span>
                      </div>
                    </div>

                    {/* Comparative Horizontal Micro-Bars */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }} aria-hidden="true">
                      <div style={{ height: '5px', width: '100%', borderRadius: '999px', background: 'var(--color-rule)', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${churnBarPct.toFixed(1)}%`,
                            height: '100%',
                            background: 'var(--ml-churn)',
                            borderRadius: '999px'
                          }}
                        />
                      </div>
                      <div style={{ height: '5px', width: '100%', borderRadius: '999px', background: 'var(--color-rule)', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${retBarPct.toFixed(1)}%`,
                            height: '100%',
                            background: 'var(--ml-retention)',
                            borderRadius: '999px'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, marginTop: 'auto' }}>
                    {isFr ? gem.insight_fr : gem.insight_en}
                  </p>
                </div>
                );
              })}
            </div>

            {/* Expand/Collapse 4 Secondary Signals */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowAllGems((prev) => !prev)}
                aria-expanded={showAllGems}
                style={{ fontSize: '0.85rem', padding: '0.6rem 1.25rem' }}
              >
                {isFr
                  ? (showAllGems ? 'Masquer les 4 signaux secondaires ↑' : '+ Afficher les 4 autres signaux Source 2 (7 au total)')
                  : (showAllGems ? 'Hide 4 secondary signals ↑' : '+ Show 4 remaining Source 2 signals (7 total)')}
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: Feature Extraction Formulas Catalog */}
        {activeView === 'tilt_lab' && (
          <div>
            {/* Feature Selector Tabs */}
            <div className="psychology-tabs-container" role="tablist" aria-label="Behavioral Features Selector">
              {featuresList.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={selectedFeature === f.id}
                  className={`psychology-tab-btn ${selectedFeature === f.id ? 'active' : ''}`}
                  onClick={() => setSelectedFeature(f.id)}
                >
                  <span className={`badge ${f.categoryBadge} tab-badge-compact`}>
                    {f.category}
                  </span>
                  <span className="tab-btn-title">{f.shortTitle || f.id}</span>
                </button>
              ))}
            </div>

            {/* Selected Feature Deep-Dive Card */}
            <div className="glass-card feature-deep-dive-card">
              <div className="feature-deep-dive-header">
                <div>
                  <div className="feature-tag-row">
                    <span className={`badge ${currentFeature.categoryBadge}`}>
                      {currentFeature.category}
                    </span>
                    <span className="badge badge-neutral">
                      {currentFeature.correlation}
                    </span>
                    <span className="badge badge-neutral">
                      {currentFeature.importance}
                    </span>
                  </div>
                  <h3 className="feature-main-title">{currentFeature.name}</h3>
                  <p className="feature-main-subtitle">{currentFeature.subtitle}</p>
                </div>
              </div>

              <div className="feature-deep-dive-grid">
                {/* Left: Code & Formula Extraction */}
                <div className="feature-code-col">
                  <h4 className="column-subheading">
                    {isFr ? "Formule d'Extraction Python (feature_service.py)" : "Python Telemetry Extraction (feature_service.py)"}
                  </h4>
                  <div className="code-formula-box">
                    <pre style={{ margin: 0 }}><code>{currentFeature.pythonFormula}</code></pre>
                  </div>
                  <div className="math-spec-box">
                    <span className="math-spec-label">{isFr ? 'Spécification Mathématique :' : 'Mathematical Spec:'}</span>
                    <code className="math-formula-text">{currentFeature.mathFormula}</code>
                  </div>
                </div>

                {/* Right: Psychological Interpretation & Churn Impact */}
                <div className="feature-insights-col">
                  <div className="insight-block">
                    <h4 className="column-subheading">
                      <span className="insight-bullet"></span>
                      {isFr ? 'Interprétation Gaming & Psychologie Joueur' : 'Gaming Psychology & Behavioral Meaning'}
                    </h4>
                    <p className="insight-text">{currentFeature.meaning}</p>
                  </div>

                  <div className="insight-block">
                    <h4 className="column-subheading">
                      <span className="insight-bullet text-orange"></span>
                      {isFr ? "Impact Empirique sur l'Abandon (14 Jours)" : 'Empirical Impact on 14-Day Churn'}
                    </h4>
                    <p className="insight-text">{currentFeature.impact}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}