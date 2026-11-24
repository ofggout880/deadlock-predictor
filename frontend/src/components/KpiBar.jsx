import React from 'react';
import { useDictionary } from '../context/DictionaryContext';

/**
 * KpiBar Component
 * Redesigned Free-Floating Horizon Layout (No Rigid Boxes)
 * 
 * Features:
 * - Monumental display typography (Syne display font)
 * - 5 Seamless horizontal metric columns floating directly on the dark obsidian canvas
 * - Subtle bottom horizon floor with warm ember neon beam
 * - Free-flowing explanatory commentary without claustrophobic card borders
 */
export default function KpiBar({ lang, t, metricsData }) {
  const { openDictionary } = useDictionary();

  const isFr = lang === 'fr';

  const datasetSizeNum = metricsData?.dataset_size ?? 8625;
  const datasetSizeVal = isFr
    ? datasetSizeNum.toLocaleString('fr-FR')
    : datasetSizeNum.toLocaleString('en-US');

  const testSizeNum = metricsData?.test_size ?? 1695;
  const testSizeVal = isFr
    ? testSizeNum.toLocaleString('fr-FR')
    : testSizeNum.toLocaleString('en-US');

  const bestThreshold = metricsData?.best_threshold != null
    ? Number(metricsData.best_threshold)
    : 0.225;
  const thStr = bestThreshold.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');

  const recallVal = metricsData?.recall != null
    ? `${(metricsData.recall * 100).toFixed(1)}%`
    : '73.2%';

  const rocAucVal = metricsData?.auc_score != null
    ? `${(metricsData.auc_score * 100).toFixed(1)}%`
    : '74.7%';

  const prAucVal = metricsData?.pr_auc != null
    ? `${(metricsData.pr_auc * 100).toFixed(1)}%`
    : '50.8%';

  const rocPrAucVal = `${rocAucVal} / ${prAucVal}`;

  const kpiData = [
    {
      id: 'datasetSize',
      val: datasetSizeVal,
      label: t('kpis.cards.datasetSize.label', lang) || (isFr ? 'Fenêtres Analysées' : 'Analyzed Windows'),
      sub: isFr
        ? `Cohorte Source 2 enrichie via l'API Deadlock (1 094 joueurs, ${datasetSizeVal} fenêtres dé-biaisées)`
        : `Source 2 Deadlock API cohort (1,094 players, ${datasetSizeVal} de-biased windows)`,
      badge: 'Deadlock API',
      badgeClass: 'badge-amber',
      highlight: false,
      termId: null
    },
    {
      id: 'windowSize',
      val: t('kpis.cards.windowSize.value', lang) || (isFr ? '20 Matchs' : '20 Matches'),
      label: t('kpis.cards.windowSize.label', lang) || (isFr ? 'Fenêtre d’Observation' : 'Observation Window'),
      sub: t('kpis.cards.windowSize.desc', lang) || (isFr ? 'Historique glissant (5 récents vs 15 baseline) avant le match pivot T' : 'Rolling behavioral window (5 recent vs 15 baseline) prior to match T'),
      badge: isFr ? 'Fenêtre Glissante ✦' : 'Rolling Window ✦',
      badgeClass: 'badge-cyan',
      highlight: false,
      termId: 'rolling_window'
    },
    {
      id: 'featuresCount',
      val: t('kpis.cards.featuresCount.value', lang) || '106',
      label: t('kpis.cards.featuresCount.label', lang) || (isFr ? 'Signaux Télémétriques' : 'Engineered Signals'),
      sub: isFr
        ? '106 signaux in-game purs (36 sélectionnés), 7 gemmes Source 2, 0 fuite calendaire'
        : '106 pure in-game signals (36 selected), 7 Source 2 gems, 0 calendar leakage',
      badge: isFr ? 'Vecteur ML' : 'ML Vector',
      badgeClass: 'badge-emerald',
      highlight: false,
      termId: null
    },
    {
      id: 'recall',
      val: recallVal,
      label: isFr ? `Rappel Churn (θ* = ${thStr})` : `Churn Recall (θ* = ${thStr})`,
      sub: isFr
        ? `${Math.round((metricsData?.recall ?? 0.7318) * 100)}% des joueurs en phase de départ sont interceptés sur test indépendant`
        : `${Math.round((metricsData?.recall ?? 0.7318) * 100)}% of departing players intercepted on leak-free test partition`,
      badge: `θ* = ${thStr} ✦`,
      badgeClass: 'badge-rose',
      highlight: true,
      termId: 'threshold'
    },
    {
      id: 'rocPrAuc',
      val: rocPrAucVal,
      label: t('kpis.cards.rocPrAuc.label', lang) || 'ROC-AUC / PR-AUC',
      sub: isFr
        ? `Capacité de discrimination calibrée sur test indépendant (N = ${testSizeVal})`
        : `Calibrated discrimination power on leak-free test set (N = ${testSizeVal})`,
      badge: `PR-AUC ${prAucVal} ✦`,
      badgeClass: 'badge-emerald',
      highlight: true,
      termId: 'pr_auc'
    }
  ];

  return (
    <section
      id="kpis"
      className="section kpi-horizon-section"
      style={{ paddingTop: '0.5rem', paddingBottom: '2.5rem' }}
      aria-label={isFr ? 'Indicateurs Clés de Validation' : 'Key Validation Metrics'}
    >
      <div className="container">
        
        {/* Subtle 1-Line Validation Strip Header */}
        <p
          style={{
            margin: '0 0 0.75rem 0',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}
        >
          {isFr
            ? 'Validation empirique Source 2 · 1 094 joueurs · 0 % fuite calendaire'
            : 'Source 2 empirical validation · 1,094 players · 0% calendar leakage'}
        </p>

        {/* Free-Floating Seamless Horizon */}
        <div className="kpi-seamless-horizon" role="region" aria-label="Key Performance Indicators">
          {kpiData.map((kpi, idx) => (
            <div
              key={kpi.id}
              className={`horizon-metric-col ${kpi.highlight ? 'horizon-highlight' : ''}`}
            >
              <div className="horizon-top-meta">
                <span className="horizon-index">0{idx + 1}</span>
                {kpi.termId ? (
                  <button
                    type="button"
                    onClick={() => openDictionary(kpi.termId)}
                    className={`badge ${kpi.badgeClass} horizon-badge`}
                    style={{ cursor: 'pointer', border: 'none' }}
                    title={isFr ? "Voir la définition dans le dictionnaire" : "View definition in dictionary"}
                  >
                    {kpi.badge}
                  </button>
                ) : (
                  <span className={`badge ${kpi.badgeClass} horizon-badge`}>
                    {kpi.badge}
                  </span>
                )}
              </div>
              
              <div className="horizon-number-row">
                <span className={`horizon-large-number glow-orange tabular-nums ${kpi.id === 'rocPrAuc' ? 'horizon-dual-val' : ''}`}>
                  {kpi.val}
                </span>
              </div>

              <div className="horizon-label">
                {kpi.label}
              </div>

              <p className="horizon-sub-text">
                {kpi.sub}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
