import React from 'react';
import GlossaryTerm from './GlossaryTerm';
import { useDictionary } from '../context/DictionaryContext';

/**
 * HeroSection Component
 * Modernized Editorial & Asymmetric Sculpted Shape Design System
 * 
 * Features:
 * - High-contrast editorial display typography (Syne look-alike)
 * - Dual-line headline with bold/light weight contrast and free-floating side paragraph
 * - Dual-box signature studio action buttons (arrow ↗ + sparkle ✳)
 * - Signature Asymmetric Sculpted Shape Container with Telemetry Interface & Ember Fluted Slats
 * - Floating Rotating Circular Stamp Badge (16,981 Matches • 85% Recall)
 * - Minimalist Monochrome Technology Ribbon (Valve, Deadlock API, FastAPI, XGBoost, SMOTE)
 * - 3 Free-floating unboxed editorial pillars (01, 02, 03)
 */
export default function HeroSection({ lang, t }) {
  const { openAboutModal } = useDictionary();

  const handleScrollTo = (e, targetId) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isFr = lang === 'fr';

  return (
    <section id="hero" className="section hero-section" style={{ paddingBottom: '1.25rem' }} aria-labelledby="hero-title">
      <div className="container">
        
        {/* Master Headline & Free-Floating Summary Row */}
        <div className="hero-editorial-row">
          <div className="hero-title-column">
            <h1 id="hero-title" className="hero-display-title">
              {isFr ? (
                <>
                  <span className="title-light">Prédire le</span> <span className="title-bold"><GlossaryTerm termId="churn">Churn</GlossaryTerm> & le Tilt</span><br />
                  <span className="title-light">dans Deadlock par</span> <span className="title-bold title-glow">Machine Learning</span>
                </>
              ) : (
                <>
                  <span className="title-light">Predicting Player</span> <span className="title-bold"><GlossaryTerm termId="churn">Churn</GlossaryTerm> & Tilt</span><br />
                  <span className="title-light">in Deadlock via</span> <span className="title-bold title-glow">Machine Learning</span>
                </>
              )}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem', marginTop: '0.85rem' }}>
              <span className="nav-popover-sublabel" style={{ color: 'var(--ml-retention)' }}>
                {isFr ? 'Optimisation du Matchmaking par la Rétention · Télémétrie Source 2' : 'Churn-Aware Matchmaking Optimization · Source 2 Telemetry'}
              </span>
              <button
                type="button"
                className="hero-about-trigger-pill"
                onClick={openAboutModal}
                title={t('aboutModal.triggerHero', lang)}
              >
                <svg className="hero-about-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="6" width="20" height="12" rx="4" />
                  <line x1="6" y1="12" x2="10" y2="12" />
                  <line x1="8" y1="10" x2="8" y2="14" />
                  <circle cx="15.5" cy="11" r="1" fill="currentColor" />
                  <circle cx="17.5" cy="13" r="1" fill="currentColor" />
                </svg>
                <span>{t('aboutModal.triggerHero', lang)}</span>
                <svg className="hero-about-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>

          <div className="hero-desc-column">
            <p className="hero-floating-summary">
              {isFr
                ? "Prédire le risque d'abandon à 14 jours dès la fin d'un match pour optimiser le matchmaking de Deadlock : séparer les joueurs en tilt aigu, stabiliser les escouades solo et suggérer des pauses — en préservant une équité compétitive stricte à 50/50 (zéro EOMM manipulateur)."
                : "Predicting 14-day churn risk right after Match T to optimize Deadlock matchmaking: unstacking tilted solo queues, pairing frustrated players with composed teammates, and prompting timely cooldowns — while preserving strict 50/50 competitive fairness (zero predatory EOMM)."}
            </p>
          </div>
        </div>

        {/* Action Button Row (Focused 2 CTAs) */}
        <div className="hero-actions-bar">
          <a
            href="#archetypes"
            className="hero-studio-cta"
            onClick={(e) => handleScrollTo(e, '#archetypes')}
          >
            <span className="cta-icon-sq" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </span>
            <span className="cta-icon-star" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.4 7.2L21.6 12l-7.2 2.4L12 21.6l-2.4-7.2L2.4 12l7.2-2.4L12 2z" />
              </svg>
            </span>
            <span className="cta-labels">
              <span className="cta-main-text">
                {isFr ? 'Tester les 4 Profils & Simulateur' : 'Explore 4 Profiles & Simulator'}
              </span>
              <span className="cta-sub-text">
                {isFr ? 'Décisions Matchmaking en Direct' : 'Live Matchmaking Decisions'}
              </span>
            </span>
          </a>

          <a
            href="#benchmark"
            className="hero-minimal-cta"
            onClick={(e) => handleScrollTo(e, '#benchmark')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span>{isFr ? 'Preuve ML & Signaux Clés' : 'ML Proof & Top Signals'}</span>
          </a>
        </div>

        {/* TELEMETRY & MATCHMAKING DECISION LOOP VISUALIZER */}
        <div className="sculpted-showcase-frame" style={{ gridTemplateColumns: '1fr', marginBottom: '0.5rem' }} aria-label="Showcase Telemetry Visualizer">
          
          {/* Dark Glass Screen */}
          <div className="sculpted-canvas-side" style={{ borderRight: 'none', minHeight: 'auto', padding: '1.25rem clamp(1rem, 2.5vw, 2rem)', gap: '1rem' }}>
            <div className="mockup-header-bar">
              <div className="mockup-dots" aria-hidden="true">
                <span className="m-dot m-dot-red"></span>
                <span className="m-dot m-dot-amber"></span>
                <span className="m-dot m-dot-green"></span>
              </div>
              <div className="mockup-status-title">
                <span className="pulse-indicator"></span>
                <span>{isFr ? 'cohorte_source2 // taux_churn_14j_par_niveau_de_tilt (N = 8 625)' : 'source2_cohort // real_14d_churn_rate_by_tilt_tier (N = 8,625)'}</span>
              </div>
              <span className="mockup-version-tag">{isFr ? 'Données Réelles · deadlock_churn_dataset.csv' : 'Empirical Data · deadlock_churn_dataset.csv'}</span>
            </div>

            {/* Empirical 14-Day Churn Rate by Tilt Tier (Zero Stretch, Real CSV Data) */}
            <div className="mockup-visual-body" style={{ padding: '0.5rem 0 0.25rem 0' }}>
              <div className="mockup-grid-backdrop" aria-hidden="true"></div>

              <div className="telemetry-chart-wrapper" style={{ width: '100%', maxWidth: '920px', margin: '0 auto' }}>
                <svg
                  viewBox="0 0 920 262"
                  preserveAspectRatio="xMidYMid meet"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  role="img"
                  aria-label={
                    isFr
                      ? 'Taux de churn réel à 14 jours selon le niveau de Tilt sur 8 625 fenêtres : 23,1 % (<15), 26,3 % (15–30), 27,2 % (30–60), 41,1 % (≥60)'
                      : 'Empirical 14-day churn rate by Tilt tier across 8,625 windows: 23.1% (<15), 26.3% (15-30), 27.2% (30-60), 41.1% (>=60)'
                  }
                >
                  <defs>
                    <linearGradient id="heroChurnArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#69e799" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#69e799" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="heroChurnLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="48%" stopColor="#69e799" />
                      <stop offset="72%" stopColor="#d8ec57" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>

                  {/* Y-Axis Gridlines (0% to 50% 14-Day Churn Rate) */}
                  {[
                    { pct: 0, y: 204 },
                    { pct: 10, y: 170 },
                    { pct: 20, y: 136 },
                    { pct: 30, y: 102 },
                    { pct: 40, y: 68 },
                    { pct: 50, y: 34 }
                  ].map((tick) => (
                    <g key={tick.pct}>
                      <line
                        x1="62"
                        y1={tick.y}
                        x2="904"
                        y2={tick.y}
                        stroke="rgba(148, 163, 184, 0.12)"
                        strokeDasharray={tick.pct === 0 ? undefined : '3 4'}
                        strokeWidth="1"
                      />
                      <text
                        x="52"
                        y={tick.y + 4}
                        fill="rgba(148, 163, 184, 0.72)"
                        fontSize="10.5"
                        fontFamily="var(--font-mono)"
                        textAnchor="end"
                      >
                        {tick.pct}%
                      </text>
                    </g>
                  ))}

                  {/* Y-Axis Unit Label */}
                  <text
                    x="62"
                    y="18"
                    fill="rgba(148, 163, 184, 0.8)"
                    fontSize="10.5"
                    fontWeight="600"
                    fontFamily="var(--font-mono)"
                  >
                    {isFr ? 'TAUX DE CHURN RÉEL À 14 JOURS (%)' : 'EMPIRICAL 14-DAY CHURN RATE (%)'}
                  </text>

                  {/* Calibrated Matchmaking Cutoff Line at θ* = 22.5% (y = 127.5) */}
                  <line
                    x1="62"
                    y1="127.5"
                    x2="710"
                    y2="127.5"
                    stroke="rgba(105, 231, 153, 0.65)"
                    strokeDasharray="6 4"
                    strokeWidth="1.5"
                  />
                  <g transform="translate(712, 115)">
                    <rect
                      x="0"
                      y="0"
                      width="194"
                      height="25"
                      rx="5"
                      fill="rgba(11, 15, 25, 0.96)"
                      stroke="rgba(105, 231, 153, 0.55)"
                      strokeWidth="1"
                    />
                    <text
                      x="97"
                      y="12.5"
                      fill="#69e799"
                      fontSize="9.5"
                      fontWeight="700"
                      fontFamily="var(--font-mono)"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {isFr ? 'SEUIL ALERTE θ* = 22,5 %' : 'ALERT CUTOFF θ* = 22.5%'}
                    </text>
                  </g>

                  {/* 4 Real Empirical Buckets from deadlock_churn_dataset.csv (N = 8,625) */}
                  {[
                    {
                      x: 145,
                      y: 125.5,
                      rate: isFr ? '23,1 %' : '23.1%',
                      tier: isFr ? 'Tilt < 15 · Serein' : 'Tilt < 15 · Calm',
                      n: isFr ? 'n = 5 624' : 'n = 5,624',
                      fill: 'rgba(16, 185, 129, 0.22)',
                      stroke: '#10b981',
                      valColor: '#69e799'
                    },
                    {
                      x: 315,
                      y: 114.6,
                      rate: isFr ? '26,3 %' : '26.3%',
                      tier: 'Tilt 15–30 · Vigilance',
                      n: isFr ? 'n = 1 691' : 'n = 1,691',
                      fill: 'rgba(105, 231, 153, 0.20)',
                      stroke: '#69e799',
                      valColor: '#e2e8f0'
                    },
                    {
                      x: 485,
                      y: 111.5,
                      rate: isFr ? '27,2 %' : '27.2%',
                      tier: isFr ? 'Tilt 30–60 · Énervé' : 'Tilt 30–60 · Agitated',
                      n: isFr ? 'n = 1 018' : 'n = 1,018',
                      fill: 'rgba(216, 236, 87, 0.20)',
                      stroke: '#d8ec57',
                      valColor: '#d8ec57'
                    },
                    {
                      x: 655,
                      y: 64.3,
                      rate: isFr ? '41,1 %' : '41.1%',
                      tier: isFr ? 'Tilt ≥ 60 · Critique' : 'Tilt ≥ 60 · Critical',
                      n: 'n = 292',
                      fill: 'rgba(239, 68, 68, 0.26)',
                      stroke: '#ef4444',
                      valColor: '#f87171',
                      highlight: true
                    }
                  ].map((b) => (
                    <g key={b.tier}>
                      <rect
                        x={b.x - 38}
                        y={b.y}
                        width="76"
                        height={204 - b.y}
                        rx="6"
                        fill={b.fill}
                        stroke={b.stroke}
                        strokeWidth={b.highlight ? '1.6' : '1.1'}
                      />
                      <text
                        x={b.x}
                        y={b.y - 12}
                        fill={b.valColor}
                        fontSize={b.highlight ? '14' : '12.5'}
                        fontWeight="800"
                        fontFamily="var(--font-mono)"
                        textAnchor="middle"
                      >
                        {b.rate}
                      </text>
                      <text
                        x={b.x}
                        y="225"
                        fill="#e2e8f0"
                        fontSize="11"
                        fontWeight={b.highlight ? '700' : '600'}
                        fontFamily="var(--font-body)"
                        textAnchor="middle"
                      >
                        {b.tier}
                      </text>
                      <text
                        x={b.x}
                        y="242"
                        fill="rgba(148, 163, 184, 0.72)"
                        fontSize="10"
                        fontFamily="var(--font-mono)"
                        textAnchor="middle"
                      >
                        {b.n}
                      </text>
                    </g>
                  ))}

                  {/* Trend Line Connecting Real Empirical Centroids */}
                  <path
                    d="M 145,125.5 L 315,114.6 L 485,111.5 L 655,64.3"
                    fill="none"
                    stroke="url(#heroChurnLine)"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* True Circular Data Nodes */}
                  <circle cx="145" cy="125.5" r="4.5" fill="#10b981" stroke="#0b0f19" strokeWidth="2" />
                  <circle cx="315" cy="114.6" r="4.5" fill="#69e799" stroke="#0b0f19" strokeWidth="2" />
                  <circle cx="485" cy="111.5" r="4.5" fill="#d8ec57" stroke="#0b0f19" strokeWidth="2" />
                  <circle cx="655" cy="64.3" r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />

                  {/* Critical Surge Callout Pill */}
                  <g transform="translate(565, 10)">
                    <rect x="0" y="0" width="180" height="24" rx="5" fill="rgba(239, 68, 68, 0.14)" stroke="rgba(239, 68, 68, 0.55)" strokeWidth="1" />
                    <text x="90" y="12" fill="#fca5a5" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" textAnchor="middle" dominantBaseline="central">
                      {isFr ? '+78 % RISQUE VS SEREIN' : '+78% RISK VS CALM'}
                    </text>
                  </g>
                </svg>
              </div>
            </div>

            {/* Bottom Matchmaking Decision Loop Strip */}
            <div className="mockup-footer-bar">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))',
                  gap: '0.75rem',
                  width: '100%'
                }}
              >
                <div style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-rule)', background: 'var(--color-paper-inset)' }}>
                  <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ml-retention)', marginBottom: '0.2rem' }}>01</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-ink)', lineHeight: 1.4 }}>
                    {isFr ? 'Détection au Match T : P(Churn) > θ* = 0.225' : 'Match T Detection: P(Churn) > θ* = 0.225'}
                  </span>
                </div>
                <div style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-rule)', background: 'var(--color-paper-inset)' }}>
                  <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ml-retention)', marginBottom: '0.2rem' }}>02</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-ink)', lineHeight: 1.4 }}>
                    {isFr ? 'Action File : Anti-stack tilt & alliés sereins (MMR 50/50)' : 'Queue Action: Unstack tilt & calm allies (50/50 MMR)'}
                  </span>
                </div>
                <div style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-rule)', background: 'var(--color-paper-inset)' }}>
                  <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ml-retention)', marginBottom: '0.2rem' }}>03</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-ink)', lineHeight: 1.4 }}>
                    {isFr ? 'Impact : 73,2 % des départs interceptés sans truquer les matchs' : 'Impact: 73.2% of churners caught with zero match rigging'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
