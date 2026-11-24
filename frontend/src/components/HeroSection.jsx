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
                <span>{isFr ? 'flux_télémétrie // prédiction_match_T // horizon_14j' : 'telemetry_stream // match_T_prediction // cutoff_horizon_14d'}</span>
              </div>
              <span className="mockup-version-tag">{isFr ? 'Moteur 3D Source 2 ML • 100% En Partie Pur' : 'Source 2 ML • 100% In-Game Pure'}</span>
            </div>

            {/* Inner Visual Graphic */}
            <div className="mockup-visual-body">
              <div className="mockup-grid-backdrop" aria-hidden="true"></div>
              
              {/* Telemetry Stream SVG Wave */}
              <div className="telemetry-chart-wrapper">
                {/* Desktop Telemetry Stream SVG Wave */}
                <svg className="telemetry-svg-stream telemetry-svg-desktop" viewBox="0 0 820 220" preserveAspectRatio="none" style={{ height: '180px' }}>
                  <defs>
                    <linearGradient id="streamGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#69e799" stopOpacity="0.38" />
                      <stop offset="55%" stopColor="#10b981" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="38%" stopColor="#69e799" />
                      <stop offset="52%" stopColor="#d8ec57" />
                      <stop offset="68%" stopColor="#ef4444" />
                      <stop offset="85%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </linearGradient>
                  </defs>
                  
                  {/* Telemetry Guide Grid Lines */}
                  <line x1="0" y1="52" x2="820" y2="52" stroke="rgba(239, 68, 68, 0.16)" strokeDasharray="4 4" />
                  <line x1="0" y1="100" x2="820" y2="100" stroke="rgba(216, 236, 87, 0.18)" strokeDasharray="3 3" />
                  <line x1="0" y1="145" x2="820" y2="145" stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="2 2" />

                  {/* Filled Area (Pre-T Active Window) */}
                  <path
                    d="M 0,138 C 70,132 140,146 210,138 C 280,130 350,150 420,144 C 460,140 490,162 520,140 C 538,124 550,52 560,52 L 560,220 L 0,220 Z"
                    fill="url(#streamGlow)"
                  />

                  {/* Glowing Telemetry Curve Line (Active Window M-8 -> Match T) */}
                  <path
                    d="M 0,138 C 70,132 140,146 210,138 C 280,130 350,150 420,144 C 460,140 490,162 520,140 C 538,124 550,52 560,52"
                    fill="none"
                    stroke="url(#lineGlow)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Post-T Inactivity / Churn Horizon Drop (Dashed to signify game exit, not recovery) */}
                  <path
                    d="M 560,52 C 578,80 605,158 655,182 C 705,196 760,192 820,194"
                    fill="none"
                    stroke="rgba(239, 68, 68, 0.72)"
                    strokeWidth="2.5"
                    strokeDasharray="6 5"
                    strokeLinecap="round"
                  />

                  {/* Level Guide Badges (Rendered in foreground with crisp contrast & background pill) */}
                  <g transform="translate(10, 34)">
                    <rect x="0" y="0" width="174" height="18" rx="4" fill="rgba(12, 14, 18, 0.9)" stroke="rgba(239, 68, 68, 0.35)" strokeWidth="0.8" />
                    <text x="87" y="9" fill="#f87171" fontSize="8.5" fontWeight="600" letterSpacing="0.05em" textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-mono)">
                      {isFr ? 'ZONE CRITIQUE // TILT ≥ 60' : 'CRITICAL ZONE // TILT ≥ 60'}
                    </text>
                  </g>

                  <g transform="translate(10, 82)">
                    <rect x="0" y="0" width={isFr ? 132 : 148} height="18" rx="4" fill="rgba(12, 14, 18, 0.9)" stroke="rgba(216, 236, 87, 0.42)" strokeWidth="0.8" />
                    <text x={isFr ? 66 : 74} y="9" fill="#d8ec57" fontSize="8.5" fontWeight="600" letterSpacing="0.05em" textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-mono)">
                      {isFr ? 'VIGILANCE // TILT ≥ 30' : 'WARNING // TILT ≥ 30'}
                    </text>
                  </g>

                  {/* Baseline Nominale Badge: positioned cleanly below line 145 free from curve overlap */}
                  <g transform="translate(10, 152)">
                    <rect x="0" y="0" width="134" height="18" rx="4" fill="rgba(12, 14, 18, 0.92)" stroke="rgba(148, 163, 184, 0.35)" strokeWidth="0.8" />
                    <text x="67" y="9" fill="#cbd5e1" fontSize="8.5" fontWeight="600" letterSpacing="0.05em" textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-mono)">
                      {isFr ? 'BASELINE NOMINALE' : 'NOMINAL BASELINE'}
                    </text>
                  </g>

                  {/* Post-T Inactivity Callout */}
                  <g transform="translate(658, 128)">
                    <rect x="0" y="0" width="148" height="20" rx="4" fill="rgba(239, 68, 68, 0.12)" stroke="rgba(239, 68, 68, 0.45)" strokeWidth="0.9" />
                    <text x="74" y="10" fill="#fca5a5" fontSize="8" fontWeight="700" letterSpacing="0.04em" textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-mono)">
                      {isFr ? 'CHUTE ACTIVITÉ (+14J)' : 'INACTIVITY DROP (+14D)'}
                    </text>
                  </g>

                  {/* Optimal Prediction Cutoff Line */}
                  <line x1="560" y1="58" x2="560" y2="195" stroke="rgba(105, 231, 153, 0.48)" strokeDasharray="4 4" strokeWidth="1.5" />
                  <g transform="translate(566, 168)">
                    <rect x="0" y="0" width={isFr ? 142 : 158} height="24" rx="5" fill="rgba(14, 16, 21, 0.96)" stroke="rgba(105, 231, 153, 0.65)" strokeWidth="1.2" />
                    <text x={isFr ? 71 : 79} y="12" fill="#69e799" fontSize="9" fontWeight="700" letterSpacing="0.04em" textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-mono)">
                      {isFr ? 'SEUIL θ* = 0.225' : 'CUTOFF θ* = 0.225'}
                    </text>
                  </g>

                  {/* Critical Rupture Node (Tilt Spike Peak at x=560, y=52) */}
                  <g transform="translate(560, 52)">
                    <circle cx="0" cy="0" r="14" fill="rgba(239, 68, 68, 0.2)" className="animate-ping" />
                    <circle cx="0" cy="0" r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                    <line x1="0" y1="-6" x2="0" y2="-18" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="2 2" />
                    <rect x="-80" y="-44" width="160" height="26" rx="6" fill="rgba(14, 16, 21, 0.96)" stroke="#ef4444" strokeWidth="1.2" />
                    <text x="0" y="-31" fill="#ef4444" fontSize="9.5" fontWeight="700" letterSpacing="0.05em" textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-mono)">
                      TILT : 82.5 / CRIT
                    </text>
                  </g>

                  {/* Match Timeline Indicators */}
                  <text x="70" y="212" fill="rgba(148, 163, 184, 0.65)" fontSize="8.5" fontFamily="var(--font-mono)">M - 8</text>
                  <text x="220" y="212" fill="rgba(148, 163, 184, 0.65)" fontSize="8.5" fontFamily="var(--font-mono)">M - 6</text>
                  <text x="380" y="212" fill="rgba(148, 163, 184, 0.65)" fontSize="8.5" fontFamily="var(--font-mono)">{isFr ? 'M - 4 (FATIGUE)' : 'M - 4 (FATIGUE)'}</text>
                  <text x="560" y="212" fill="rgba(239, 68, 68, 0.95)" fontSize="8.5" fontWeight="700" fontFamily="var(--font-mono)" textAnchor="middle">
                    {isFr ? 'MATCH T (RUPTURE)' : 'MATCH T (BREAKING POINT)'}
                  </text>
                  <text x="740" y="212" fill="rgba(248, 113, 113, 0.85)" fontSize="8.5" fontFamily="var(--font-mono)">{isFr ? '+14J INACTIVITÉ' : '+14D INACTIVE'}</text>
                </svg>

                {/* Mobile-Optimized Telemetry Stream SVG (Compact, Proportional, No Distortion) */}
                <svg className="telemetry-svg-stream telemetry-svg-mobile" viewBox="0 0 380 180" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="streamGlowMobile" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#69e799" stopOpacity="0.4" />
                      <stop offset="60%" stopColor="#10b981" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="lineGlowMobile" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="38%" stopColor="#69e799" />
                      <stop offset="52%" stopColor="#d8ec57" />
                      <stop offset="70%" stopColor="#ef4444" />
                      <stop offset="85%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </linearGradient>
                  </defs>

                  {/* Guide Grid Lines */}
                  <line x1="0" y1="44" x2="380" y2="44" stroke="rgba(239, 68, 68, 0.16)" strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2="380" y2="80" stroke="rgba(216, 236, 87, 0.18)" strokeDasharray="3 3" />
                  <line x1="0" y1="116" x2="380" y2="116" stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="2 2" />

                  {/* Filled Area */}
                  <path
                    d="M 0,112 C 40,110 80,118 120,112 C 160,108 195,124 220,114 C 235,102 244,44 250,44 L 250,180 L 0,180 Z"
                    fill="url(#streamGlowMobile)"
                  />

                  {/* Glowing Telemetry Curve Line */}
                  <path
                    d="M 0,112 C 40,110 80,118 120,112 C 160,108 195,124 220,114 C 235,102 244,44 250,44"
                    fill="none"
                    stroke="url(#lineGlowMobile)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Post-T Inactivity Drop (Dashed) */}
                  <path
                    d="M 250,44 C 262,68 278,125 310,148 C 335,156 355,152 380,152"
                    fill="none"
                    stroke="rgba(239, 68, 68, 0.72)"
                    strokeWidth="2.2"
                    strokeDasharray="5 4"
                    strokeLinecap="round"
                  />

                  {/* Compact Level Badges on Mobile */}
                  <g transform="translate(8, 28)">
                    <rect x="0" y="0" width="108" height="15" rx="3" fill="rgba(12, 14, 18, 0.9)" stroke="rgba(239, 68, 68, 0.35)" strokeWidth="0.8" />
                    <text x="54" y="8" fill="#f87171" fontSize="7.5" fontWeight="600" letterSpacing="0.03em" textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-mono)">
                      {isFr ? 'CRITIQUE ≥ 60' : 'CRITICAL ≥ 60'}
                    </text>
                  </g>

                  <g transform="translate(8, 66)">
                    <rect x="0" y="0" width="78" height="15" rx="3" fill="rgba(12, 14, 18, 0.9)" stroke="rgba(216, 236, 87, 0.42)" strokeWidth="0.8" />
                    <text x="39" y="8" fill="#d8ec57" fontSize="7.5" fontWeight="600" letterSpacing="0.03em" textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-mono)">
                      {isFr ? 'VIGILANCE' : 'WARNING'}
                    </text>
                  </g>

                  <g transform="translate(8, 122)">
                    <rect x="0" y="0" width="72" height="15" rx="3" fill="rgba(12, 14, 18, 0.92)" stroke="rgba(148, 163, 184, 0.35)" strokeWidth="0.8" />
                    <text x="36" y="8" fill="#cbd5e1" fontSize="7.5" fontWeight="600" letterSpacing="0.03em" textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-mono)">
                      BASELINE
                    </text>
                  </g>

                  {/* Cutoff Vertical Line */}
                  <line x1="250" y1="48" x2="250" y2="152" stroke="rgba(105, 231, 153, 0.48)" strokeDasharray="3 3" strokeWidth="1.2" />

                  {/* Threshold Annotation Pill on Mobile */}
                  <g transform="translate(254, 132)">
                    <rect x="0" y="0" width={isFr ? 112 : 118} height="20" rx="4" fill="rgba(14, 16, 21, 0.96)" stroke="rgba(105, 231, 153, 0.65)" strokeWidth="1" />
                    <text x={isFr ? 56 : 59} y="10" fill="#69e799" fontSize="7.2" fontWeight="700" letterSpacing="0.03em" textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-mono)">
                      {isFr ? 'SEUIL θ* = 0.225' : 'CUTOFF θ* = 0.225'}
                    </text>
                  </g>

                  {/* Critical Tilt Peak Node on Mobile */}
                  <g transform="translate(250, 44)">
                    <circle cx="0" cy="0" r="10" fill="rgba(239, 68, 68, 0.2)" />
                    <circle cx="0" cy="0" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                    <line x1="0" y1="-5" x2="0" y2="-15" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" />
                    <rect x="-60" y="-36" width="120" height="21" rx="4" fill="rgba(14, 16, 21, 0.96)" stroke="#ef4444" strokeWidth="1" />
                    <text x="0" y="-25" fill="#ef4444" fontSize="8" fontWeight="700" letterSpacing="0.04em" textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-mono)">
                      TILT : 82.5 / CRIT
                    </text>
                  </g>

                  {/* Clean 3-Milestone Timeline on Mobile */}
                  <text x="50" y="168" fill="rgba(148, 163, 184, 0.65)" fontSize="8" fontFamily="var(--font-mono)" textAnchor="middle">M - 3 (FATIGUE)</text>
                  <text x="250" y="168" fill="rgba(239, 68, 68, 0.95)" fontSize="8" fontWeight="700" fontFamily="var(--font-mono)" textAnchor="middle">
                    {isFr ? 'MATCH T (RUPTURE)' : 'MATCH T (BREAKING)'}
                  </text>
                  <text x="345" y="168" fill="rgba(248, 113, 113, 0.85)" fontSize="8" fontFamily="var(--font-mono)" textAnchor="middle">{isFr ? '+14J CHURN' : '+14D CHURN'}</text>
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
