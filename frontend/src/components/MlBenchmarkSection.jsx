import React, { useState, useEffect } from 'react';
import {
  MODEL_BENCHMARK_ROWS,
  CALIBRATED_CURVE_POINTS,
  TOP_FEATURE_IMPORTANCES,
  MOCK_ABLATION_STUDY
} from '../data/mockData';
import { translateFeature } from '../translations';
import GlossaryTerm from './GlossaryTerm';

/**
 * Interpolates metrics for any continuous threshold value [0.05, 0.95]
 */
function interpolateAtThreshold(th, points = CALIBRATED_CURVE_POINTS) {
  const pts = Array.isArray(points) && points.length > 0 ? points : CALIBRATED_CURVE_POINTS;
  if (th <= pts[0].threshold) return pts[0];
  if (th >= pts[pts.length - 1].threshold) return pts[pts.length - 1];

  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i];
    const p2 = pts[i + 1];
    if (th >= p1.threshold && th <= p2.threshold) {
      const ratio = (th - p1.threshold) / Math.max(0.0001, p2.threshold - p1.threshold);
      return {
        threshold: th,
        tpr: p1.tpr + ratio * (p2.tpr - p1.tpr),
        fpr: p1.fpr + ratio * (p2.fpr - p1.fpr),
        precision: p1.precision + ratio * (p2.precision - p1.precision),
        recall: p1.recall + ratio * (p2.recall - p1.recall),
        f1: p1.f1 + ratio * (p2.f1 - p1.f1)
      };
    }
  }
  return pts.find((p) => Math.abs(p.threshold - 0.225) < 0.01) || pts[0];
}

/**
 * Subcomponent 1: ModelComparisonTable
 */
function ModelComparisonTable({ lang, t, metricsData }) {
  const isFr = lang === 'fr';
  const datasetN = metricsData?.dataset_size ?? 8625;
  const testN = metricsData?.test_size ?? 1695;
  const datasetStr = isFr ? datasetN.toLocaleString('fr-FR') : datasetN.toLocaleString('en-US');
  const testStr = isFr ? testN.toLocaleString('fr-FR') : testN.toLocaleString('en-US');

  return (
    <div className="card benchmark-table-card" style={{ marginBottom: '2.5rem', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)' }}>
            {t('mlBenchmark.table.title', lang)}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {isFr ? (
              <>Évaluation comparative sur test indépendant <GlossaryTerm termId="ablation">sans fuite calendaire</GlossaryTerm> (N = {datasetStr} / {testStr} test)</>
            ) : (
              `Comparative test evaluation on calendar leakage-free test partition (N = ${datasetStr} / ${testStr} test)`
            )}
          </p>
        </div>
        <div className="badge badge-amber">
          <span className="badge-dot"></span>
          <span>{isFr ? 'CHAMPION : GRADIENT BOOSTING (100% IN-GAME)' : 'CHAMPION: GRADIENT BOOSTING (100% IN-GAME)'}</span>
        </div>
      </div>

      <div className="table-responsive" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table className="benchmark-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)' }}>
              <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('mlBenchmark.table.headers.model', lang)}
              </th>
              <th style={{ padding: '0.85rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                {t('mlBenchmark.table.headers.accuracy', lang)}
              </th>
              <th style={{ padding: '0.85rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                {t('mlBenchmark.table.headers.precision', lang)}
              </th>
              <th style={{ padding: '0.85rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                {t('mlBenchmark.table.headers.recall', lang)}
              </th>
              <th style={{ padding: '0.85rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                {t('mlBenchmark.table.headers.f1Score', lang)}
              </th>
              <th style={{ padding: '0.85rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                {t('mlBenchmark.table.headers.rocAuc', lang)}
              </th>
              <th style={{ padding: '0.85rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                {t('mlBenchmark.table.headers.prAuc', lang)}
              </th>
              <th style={{ padding: '0.85rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                {t('mlBenchmark.table.headers.threshold', lang)}
              </th>
              <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                {t('mlBenchmark.table.headers.status', lang)}
              </th>
            </tr>
          </thead>
          <tbody>
            {MODEL_BENCHMARK_ROWS.map((row) => {
              const isChamp = row.isChampion ?? (row.status === 'champion');
              const rowId = row.id || row.model_id;
              const name = isFr ? (row.nameFr || row.model_name_fr || row.fallbackName || t(row.nameKey, lang)) : (row.nameEn || row.model_name_en || row.fallbackName || t(row.nameKey, lang));
              const comment = isFr ? (row.commentFr || row.comment_fr || row.fallbackComment || t(row.commentKey, lang)) : (row.commentEn || row.comment_en || row.fallbackComment || t(row.commentKey, lang));
              const f1 = row.f1Score || (typeof row.f1_score === 'number' ? `${(row.f1_score * 100).toFixed(1)}%` : row.f1_score);
              const rocAuc = row.rocAuc || (typeof row.auc_score === 'number' ? `${(row.auc_score * 100).toFixed(1)}%` : row.auc_score);
              const prAuc = row.prAuc || (typeof row.pr_auc === 'number' ? `${(row.pr_auc * 100).toFixed(1)}%` : row.pr_auc);
              const status = isFr ? (row.statusFr || row.status_fr || row.fallbackStatus || (row.status === 'champion' ? 'Champion / Production' : 'Alternative')) : (row.statusEn || row.status_en || row.fallbackStatus || (row.status === 'champion' ? 'Champion / Production' : 'Alternative'));

              return (
                <tr
                  key={rowId}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: isChamp ? 'rgba(105, 231, 153, 0.05)' : 'transparent',
                    transition: 'background 0.2s ease'
                  }}
                  className={isChamp ? 'row-champion' : ''}
                >
                  <td data-label={t('mlBenchmark.table.headers.model', lang)} style={{ padding: '1rem', fontWeight: isChamp ? 700 : 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isChamp && <span style={{ color: 'var(--accent-orange)', fontSize: '1rem' }}>★</span>}
                      <span style={{ color: isChamp ? 'var(--color-ink)' : 'var(--text-primary)' }}>
                        {name}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {comment}
                    </div>
                  </td>
                  <td data-label={t('mlBenchmark.table.headers.accuracy', lang)} style={{ padding: '1rem 0.75rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {typeof row.accuracy === 'number' ? `${(row.accuracy * 100).toFixed(1)}%` : row.accuracy}
                  </td>
                  <td data-label={t('mlBenchmark.table.headers.precision', lang)} style={{ padding: '1rem 0.75rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {typeof row.precision === 'number' ? `${(row.precision * 100).toFixed(1)}%` : row.precision}
                  </td>
                  <td data-label={t('mlBenchmark.table.headers.recall', lang)} style={{ padding: '1rem 0.75rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: isChamp ? 'var(--accent-orange)' : 'inherit', fontWeight: isChamp ? 800 : 500 }}>
                      {typeof row.recall === 'number' ? `${(row.recall * 100).toFixed(1)}%` : row.recall}
                    </span>
                  </td>
                  <td data-label={t('mlBenchmark.table.headers.f1Score', lang)} style={{ padding: '1rem 0.75rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {f1}
                  </td>
                  <td data-label={t('mlBenchmark.table.headers.rocAuc', lang)} style={{ padding: '1rem 0.75rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {rocAuc}
                  </td>
                  <td data-label={t('mlBenchmark.table.headers.prAuc', lang)} style={{ padding: '1rem 0.75rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: isChamp ? 'var(--accent-orange)' : 'inherit', fontWeight: isChamp ? 800 : 500 }}>
                      {prAuc}
                    </span>
                  </td>
                  <td data-label={t('mlBenchmark.table.headers.threshold', lang)} style={{ padding: '1rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      background: isChamp ? 'rgba(105, 231, 153, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                      color: isChamp ? 'var(--accent-orange)' : 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}>
                      {typeof row.threshold === 'number' ? row.threshold.toFixed(2) : row.threshold}
                    </span>
                  </td>
                  <td data-label={t('mlBenchmark.table.headers.status', lang)} style={{ padding: '1rem', textAlign: 'right' }}>
                    <span className={`badge ${isChamp ? 'badge-orange' : 'badge-neutral'}`} style={{ fontSize: '0.72rem' }}>
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--color-paper-inset)', border: '1px solid var(--color-rule)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--accent-orange)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 18h6" />
            <path d="M10 22h4" />
            <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
          </svg>
          <span>{isFr ? 'Décision Méthodologique Champion :' : 'Champion Methodological Rationale:'}</span>
        </strong>{' '}
        {isFr
          ? "Le modèle Gradient Boosting régularisé (arbres de profondeur 3, sous-échantillonnage de 50 % des variables et 75 % des fenêtres, 36 signaux optimaux) est retenu comme champion production : il maîtrise le surapprentissage (+0.075) tout en atteignant 74.74% ROC-AUC, 50.79% PR-AUC et 73.18% de rappel au seuil θ* = 0.225 (jusqu'à 82.35% à θ = 0.19) sur 100% de signaux en match Source 2 sans fuite calendaire."
          : "The regularized Gradient Boosting champion (depth=3, colsample=0.50, subsample=0.75, 36 optimal features) is selected for production: it constrains overfit gap (+0.075) while achieving 74.74% ROC-AUC, 50.79% PR-AUC, and 73.18% recall at θ* = 0.225 (up to 82.35% at θ = 0.19) on 100% pure Source 2 in-game telemetry with zero calendar leakage."}
      </div>

      {/* --- Domain Ablation Study Table --- */}
      <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-chem-bright)', margin: 0 }}>
              {isFr ? (
                <><GlossaryTerm termId="ablation">Étude d&apos;Ablation</GlossaryTerm> des Domaines In-Game (Preuve Scientifique)</>
              ) : (
                "In-Game Domain Ablation Study (Scientific Validation)"
              )}
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
              {isFr
                ? "Évaluation isolée de chaque famille de features prouvant la supériorité des 7 Gemmes Cachées Source 2."
                : "Isolated domain benchmarking proving the standalone predictive power of the 7 Source 2 Hidden Gems."}
            </p>
          </div>
          <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
            {isFr ? '7 EXPÉRIENCES D’ABLATION' : '7 ABLATION EXPERIMENTS'}
          </span>
        </div>

        <div className="table-responsive" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="benchmark-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)' }}>
                <th style={{ padding: '0.65rem 0.75rem', color: 'var(--text-muted)' }}>{isFr ? 'Domaine Testé' : 'Tested Domain'}</th>
                <th style={{ padding: '0.65rem 0.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Features</th>
                <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>ROC-AUC</th>
                <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>PR-AUC</th>
                <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{isFr ? 'Rappel' : 'Recall'}</th>
                <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{isFr ? 'Écart Train/Test' : 'Overfit Gap'}</th>
                <th style={{ padding: '0.65rem 0.75rem', color: 'var(--text-muted)' }}>{isFr ? 'Verdict Scientifique' : 'Scientific Verdict'}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ABLATION_STUDY.map((ab) => {
                const isHighlight = ab.id === 'domain7_hidden_gems' || ab.id === 'full_enriched';
                return (
                  <tr
                    key={ab.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: isHighlight ? 'rgba(16, 185, 129, 0.06)' : 'transparent'
                    }}
                  >
                    <td data-label={isFr ? 'Domaine Testé' : 'Tested Domain'} style={{ padding: '0.75rem', fontWeight: isHighlight ? 700 : 500, color: isHighlight ? 'var(--color-ink)' : 'var(--text-primary)' }}>
                      {isFr ? ab.name_fr : ab.name_en}
                    </td>
                    <td data-label="Features" style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                      {ab.num_features}
                    </td>
                    <td data-label="ROC-AUC" style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: isHighlight ? 800 : 500, color: isHighlight ? 'var(--accent-emerald)' : 'inherit' }}>
                      {(ab.roc_auc * 100).toFixed(2)}%
                    </td>
                    <td data-label="PR-AUC" style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)', color: isHighlight ? 'var(--accent-orange)' : 'inherit' }}>
                      {(ab.pr_auc * 100).toFixed(2)}%
                    </td>
                    <td data-label={isFr ? 'Rappel' : 'Recall'} style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      {(ab.recall * 100).toFixed(1)}%
                    </td>
                    <td data-label={isFr ? 'Écart Train/Test' : 'Overfit Gap'} style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)', color: ab.overfit_gap <= 0.12 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                      {ab.overfit_gap.toFixed(3)}
                    </td>
                    <td data-label={isFr ? 'Verdict' : 'Verdict'} style={{ padding: '0.75rem', fontSize: '0.76rem', color: isHighlight ? 'var(--accent-chem-bright)' : 'var(--text-secondary)' }}>
                      {isFr ? ab.verdict_fr : ab.verdict_en}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * Subcomponent 2: InteractiveCurves (Pure React SVG)
 */
function InteractiveCurves({ lang, t, threshold, onThresholdChange, metricsData, visData }) {
  const [curveMode, setCurveMode] = useState('roc'); // 'roc' | 'pr'
  const isFr = lang === 'fr';

  const optimalTh = metricsData?.best_threshold ?? 0.225;
  const currentTh = threshold !== undefined ? threshold : optimalTh;
  const points = (Array.isArray(visData?.calibrated_curve_points) && visData.calibrated_curve_points.length > 0)
    ? visData.calibrated_curve_points
    : CALIBRATED_CURVE_POINTS;
  const currentMetrics = interpolateAtThreshold(currentTh, points);

  const rocAucDisplay = metricsData?.auc_score != null ? (metricsData.auc_score * 100).toFixed(1) : '74.7';
  const prAucDisplay = metricsData?.pr_auc != null ? (metricsData.pr_auc * 100).toFixed(1) : '50.8';
  const nTotal = visData?.n_test_total ?? metricsData?.test_size ?? 1695;
  const nChurn = visData?.n_test_churn ?? 425;
  const testPrevalence = nChurn / Math.max(1, nTotal);

  // SVG Geometry Dimensions
  const svgWidth = 500;
  const svgHeight = 320;
  const padLeft = 52;
  const padRight = 20;
  const padTop = 24;
  const padBottom = 44;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  // Coordinate transforms
  const getX = (val) => padLeft + val * chartW;
  const getY = (val) => padTop + chartH - val * chartH;

  // ROC Curve: X = fpr, Y = tpr
  const rocCoords = points.map((p) => `${getX(p.fpr)},${getY(p.tpr)}`);
  const rocPath = `M ${getX(0)},${getY(0)} L ${rocCoords.join(' L ')} L ${getX(1)},${getY(1)}`;
  const rocAreaPath = `${rocPath} L ${getX(1)},${getY(0)} L ${getX(0)},${getY(0)} Z`;

  // PR Curve: X = recall, Y = precision
  const prCoords = points.map((p) => `${getX(p.recall)},${getY(p.precision)}`);
  const prPath = `M ${prCoords.join(' L ')}`;
  const prAreaPath = `M ${getX(points[0].recall)},${getY(0)} L ${prCoords.join(' L ')} L ${getX(points[points.length - 1].recall)},${getY(0)} Z`;

  // Active Marker Coordinates
  const markerX = curveMode === 'roc' ? getX(currentMetrics.fpr) : getX(currentMetrics.recall);
  const markerY = curveMode === 'roc' ? getY(currentMetrics.tpr) : getY(currentMetrics.precision);

  // Bayes' Rule Live PPV Calculation (π_live ≈ 5.74% background churn prevalence)
  const piLive = visData?.live_prevalence ?? 0.0574;
  const livePPV = (currentMetrics.recall * piLive) / Math.max(0.0001, (currentMetrics.recall * piLive + currentMetrics.fpr * (1 - piLive)));

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* Header & Tab Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)' }}>
            {t('mlBenchmark.curves.title', lang)}
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {curveMode === 'roc'
              ? (isFr ? <><GlossaryTerm termId="roc_auc">ROC-AUC</GlossaryTerm> : {rocAucDisplay}% (Capacité discriminante)</> : `ROC-AUC: ${rocAucDisplay}% (Discriminative power)`)
              : (isFr ? <><GlossaryTerm termId="pr_auc">PR-AUC</GlossaryTerm> : {prAucDisplay}% (Précision sous asymétrie)</> : `PR-AUC: ${prAucDisplay}% (Precision under imbalance)`)}
          </p>
        </div>

        <div className="curve-tab-switch" style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-surface)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            onClick={() => setCurveMode('roc')}
            className={`tab-btn ${curveMode === 'roc' ? 'active' : ''}`}
            style={{
              background: curveMode === 'roc' ? 'var(--accent-orange)' : 'transparent',
              color: curveMode === 'roc' ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isFr ? `Courbe ROC (${rocAucDisplay}%)` : `ROC Curve (${rocAucDisplay}%)`}
          </button>
          <button
            type="button"
            onClick={() => setCurveMode('pr')}
            className={`tab-btn ${curveMode === 'pr' ? 'active' : ''}`}
            style={{
              background: curveMode === 'pr' ? 'var(--accent-cyan)' : 'transparent',
              color: curveMode === 'pr' ? 'var(--color-paper-inset)' : 'var(--text-secondary)',
              border: 'none',
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease, color 0.2s ease'
            }}
          >
            {isFr ? `Courbe PR (${prAucDisplay}%)` : `PR Curve (${prAucDisplay}%)`}
          </button>
        </div>
      </div>

      {/* Pure React SVG Canvas */}
      <div className="svg-curve-container" style={{ position: 'relative', width: '100%', flex: 1, minHeight: '240px', boxSizing: 'border-box' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          width="100%"
          height="auto"
          preserveAspectRatio="xMidYMid meet"
          style={{ display: 'block', maxWidth: '100%' }}
          role="img"
          aria-label={isFr ? 'Courbes ROC et PR de performance du modèle' : 'Model ROC and Precision-Recall curve'}
        >
          <defs>
            <linearGradient id="roc-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#69e799" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id="pr-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y labels */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((val, idx) => (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={getY(val)}
                x2={padLeft + chartW}
                y2={getY(val)}
                stroke="rgba(255, 255, 255, 0.06)"
                strokeDasharray="4 4"
              />
              <text
                x={padLeft - 8}
                y={getY(val) + 4}
                fill="var(--text-muted)"
                fontSize="10"
                textAnchor="end"
                fontFamily="var(--font-mono)"
              >
                {(val * 100).toFixed(0)}%
              </text>
            </g>
          ))}

          {/* X axis labels */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((val, idx) => (
            <text
              key={idx}
              x={getX(val)}
              y={svgHeight - padBottom + 16}
              fill="var(--text-muted)"
              fontSize="10"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
            >
              {(val * 100).toFixed(0)}%
            </text>
          ))}

          {/* Axis Titles */}
          <text
            x={padLeft + chartW / 2}
            y={svgHeight - 8}
            fill="var(--text-secondary)"
            fontSize="10"
            textAnchor="middle"
            fontWeight="600"
          >
            {curveMode === 'roc'
              ? (isFr ? 'Taux de Faux Positifs (FPR = 1 - Spécificité)' : 'False Positive Rate (FPR = 1 - Specificity)')
              : (isFr ? 'Rappel (Recall / Sensibilité)' : 'Recall (Sensitivity)')}
          </text>

          <text
            transform="rotate(-90)"
            x={-(padTop + chartH / 2)}
            y={15}
            fill="var(--text-secondary)"
            fontSize="10"
            textAnchor="middle"
            fontWeight="600"
          >
            {curveMode === 'roc'
              ? (isFr ? 'Vrais Positifs (TPR / Rappel)' : 'True Positive Rate (TPR / Recall)')
              : (isFr ? 'Précision (PPV)' : 'Precision (PPV)')}
          </text>

          {/* Baseline reference */}
          {curveMode === 'roc' ? (
            <line
              x1={getX(0)}
              y1={getY(0)}
              x2={getX(1)}
              y2={getY(1)}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeDasharray="4 4"
              strokeWidth="1.2"
            />
          ) : (
            <line
              x1={getX(0)}
              y1={getY(testPrevalence)}
              x2={getX(1)}
              y2={getY(testPrevalence)}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeDasharray="4 4"
              strokeWidth="1.2"
            />
          )}

          {/* Area Fill */}
          <path
            d={curveMode === 'roc' ? rocAreaPath : prAreaPath}
            fill={curveMode === 'roc' ? 'url(#roc-glow)' : 'url(#pr-glow)'}
          />

          {/* Curve Stroke */}
          <path
            d={curveMode === 'roc' ? rocPath : prPath}
            fill="none"
            stroke={curveMode === 'roc' ? 'var(--accent-orange)' : 'var(--accent-cyan)'}
            strokeWidth="2.5"
          />

          {/* Threshold Crosshair Reference Lines */}
          <line
            x1={markerX}
            y1={padTop}
            x2={markerX}
            y2={padTop + chartH}
            stroke="rgba(255, 255, 255, 0.25)"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          <line
            x1={padLeft}
            y1={markerY}
            x2={markerX}
            y2={markerY}
            stroke="rgba(255, 255, 255, 0.25)"
            strokeDasharray="3 3"
            strokeWidth="1"
          />

          {/* Pulsing Active Marker */}
          <circle
            cx={markerX}
            cy={markerY}
            r="8"
            fill={curveMode === 'roc' ? 'rgba(105, 231, 153, 0.25)' : 'rgba(6, 182, 212, 0.25)'}
            stroke={curveMode === 'roc' ? 'var(--accent-orange)' : 'var(--accent-cyan)'}
            strokeWidth="1.5"
          />
          <circle
            cx={markerX}
            cy={markerY}
            r="4"
            fill="#ffffff"
          />

          {/* Optimal Badge Callout */}
          <g transform={`translate(${Math.min(padLeft + chartW - 75, markerX + 8)}, ${Math.max(padTop + 12, markerY - 12)})`}>
            <rect
              x="0"
              y="-12"
              width="70"
              height="20"
              rx="4"
              fill="rgba(18, 19, 22, 0.9)"
              stroke="var(--border-subtle)"
            />
            <text
              x="35"
              y="2"
              fill={curveMode === 'roc' ? 'var(--accent-orange)' : 'var(--accent-cyan)'}
              fontSize="9"
              fontWeight="800"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
            >
              θ = {currentTh.toFixed(3).replace(/0$/, '')} {Math.abs(currentTh - optimalTh) < 0.01 ? '★' : ''}
            </text>
          </g>
        </svg>
      </div>

      {/* Interactive Threshold Slider */}
      <div style={{ marginTop: '1rem', padding: '0.85rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            <GlossaryTerm termId="threshold">
              {isFr ? 'Seuil de Décision (θ) :' : 'Decision Threshold (θ):'}
            </GlossaryTerm>{' '}
            <span style={{ color: 'var(--accent-orange)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
              {currentTh.toFixed(3).replace(/0$/, '')}
            </span>
          </label>
          <button
            type="button"
            onClick={() => onThresholdChange && onThresholdChange(optimalTh)}
            style={{
              background: Math.abs(currentTh - optimalTh) < 0.006 ? 'var(--accent-orange-alpha)' : 'transparent',
              color: 'var(--accent-orange)',
              border: '1px solid rgba(105, 231, 153, 0.35)',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isFr ? `Seuil Optimal θ* = ${optimalTh}` : `Studio Optimum θ* = ${optimalTh}`}
          </button>
        </div>

        <input
          type="range"
          min="0.05"
          max="0.90"
          step="0.005"
          value={currentTh}
          onChange={(e) => onThresholdChange && onThresholdChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            accentColor: 'var(--accent-orange)',
            cursor: 'pointer'
          }}
        />

        {/* Live Dynamic Metric Readouts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: '0.5rem', marginTop: '0.75rem', textAlign: 'center' }}>
          <div style={{ background: 'var(--bg-card)', padding: '0.4rem', borderRadius: '4px' }}>
            <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)' }}>{isFr ? 'Rappel (TPR)' : 'Recall (TPR)'}</span>
            <strong style={{ fontSize: '0.95rem', color: 'var(--accent-orange)', fontFamily: 'var(--font-mono)' }}>
              {(currentMetrics.recall * 100).toFixed(1)}%
            </strong>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '0.4rem', borderRadius: '4px' }}>
            <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)' }}>{isFr ? 'Faux Pos (FPR)' : 'False Pos (FPR)'}</span>
            <strong style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {(currentMetrics.fpr * 100).toFixed(1)}%
            </strong>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '0.4rem', borderRadius: '4px' }}>
            <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)' }}>{isFr ? 'Score F1 (Test)' : 'Test F1-Score'}</span>
            <strong style={{ fontSize: '0.95rem', color: 'var(--color-ink)', fontFamily: 'var(--font-mono)' }}>
              {(currentMetrics.f1 * 100).toFixed(1)}%
            </strong>
          </div>
          <div
            style={{ background: 'var(--bg-card)', padding: '0.4rem', borderRadius: '4px' }}
            title={isFr ? "Valeur Prédictive Positive ajustée par le théorème de Bayes à la prévalence réelle en production (5,74 %)" : "Bayes-adjusted Positive Predictive Value at real-world 5.74% live churn prevalence"}
          >
            <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {isFr ? <GlossaryTerm termId="pr_auc">PPV Prod (Bayes)</GlossaryTerm> : 'Live PPV (Bayes)'}
            </span>
            <strong style={{ fontSize: '0.95rem', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
              {(livePPV * 100).toFixed(1)}%
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Subcomponent 3: ConfusionMatrixHeatmap
 */
function ConfusionMatrixHeatmap({ lang, t, threshold = 0.225, visData }) {
  const [selectedCell, setSelectedCell] = useState('tp');
  const isFr = lang === 'fr';

  const N_TOTAL = visData?.n_test_total ?? 1695;
  const N_CHURN = visData?.n_test_churn ?? 425;
  const N_RETAINED = visData?.n_test_retained ?? (N_TOTAL - N_CHURN);

  const points = (Array.isArray(visData?.calibrated_curve_points) && visData.calibrated_curve_points.length > 0)
    ? visData.calibrated_curve_points
    : CALIBRATED_CURVE_POINTS;
  const interpolated = interpolateAtThreshold(threshold, points);
  const recall = interpolated.recall;
  const fpr = interpolated.fpr;

  const tp = Math.round(recall * N_CHURN);
  const fn = Math.max(0, N_CHURN - tp);
  const fp = Math.round(fpr * N_RETAINED);
  const tn = Math.max(0, N_RETAINED - fp);

  const currentRecall = ((tp / Math.max(1, N_CHURN)) * 100).toFixed(1);
  const currentSpec = ((tn / Math.max(1, N_RETAINED)) * 100).toFixed(1);
  const currentAcc = (((tp + tn) / Math.max(1, N_TOTAL)) * 100).toFixed(1);

  const cells = {
    tp: {
      id: 'tp',
      labelKey: 'mlBenchmark.confusionMatrix.tp.label',
      fallbackLabel: 'Vrais Positifs (TP)',
      count: tp,
      pctTotal: ((tp / N_TOTAL) * 100).toFixed(1),
      pctClass: currentRecall,
      bg: 'rgba(16, 185, 129, 0.14)',
      border: 'rgba(105, 231, 153, 0.55)',
      color: 'var(--accent-orange)',
      descFr: `Joueurs en churn imminent correctement interceptés à l'avance (Rappel de ${currentRecall}%). Déclenche des mécanismes préventifs d'équilibrage.`,
      descEn: `Imminent churners correctly intercepted in advance (${currentRecall}% Recall). Triggers preventative matchmaking rebalancing.`
    },
    fn: {
      id: 'fn',
      labelKey: 'mlBenchmark.confusionMatrix.fn.label',
      fallbackLabel: 'Faux Négatifs (FN)',
      count: fn,
      pctTotal: ((fn / N_TOTAL) * 100).toFixed(1),
      pctClass: ((fn / N_CHURN) * 100).toFixed(1),
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.55)',
      color: 'var(--accent-rose)',
      descFr: `Abandons non détectés (taux d'échappement maîtrisé à ${(100 - parseFloat(currentRecall)).toFixed(1)}%). Le joueur quitte le jeu sans alerte préventive.`,
      descEn: `Undetected churners (escape rate constrained to ${(100 - parseFloat(currentRecall)).toFixed(1)}%). Player quietly departs without preventative alert.`
    },
    fp: {
      id: 'fp',
      labelKey: 'mlBenchmark.confusionMatrix.fp.label',
      fallbackLabel: 'Faux Positifs (FP)',
      count: fp,
      pctTotal: ((fp / N_TOTAL) * 100).toFixed(1),
      pctClass: ((fp / N_RETAINED) * 100).toFixed(1),
      bg: 'rgba(216, 236, 87, 0.12)',
      border: 'rgba(216, 236, 87, 0.55)',
      color: 'var(--accent-amber)',
      descFr: "Fausses alertes sur des joueurs qui auraient continué. Grâce aux politiques bienveillantes (anti-stomp, cooldowns positifs), l'impact est neutre ou bénéfique.",
      descEn: "False alarms on players who stayed active. With non-punitive interventions (loss mitigation, positive cooldowns), impact remains safe."
    },
    tn: {
      id: 'tn',
      labelKey: 'mlBenchmark.confusionMatrix.tn.label',
      fallbackLabel: 'Vrais Négatifs (TN)',
      count: tn,
      pctTotal: ((tn / N_TOTAL) * 100).toFixed(1),
      pctClass: currentSpec,
      bg: 'rgba(56, 189, 248, 0.12)',
      border: 'rgba(56, 189, 248, 0.55)',
      color: 'var(--accent-cyan)',
      descFr: `Joueurs fidélisés correctement identifiés sans intervention superflue (Spécificité ${currentSpec}%).`,
      descEn: `Retained players correctly identified without unnecessary intervention (Specificity ${currentSpec}%).`
    }
  };

  const activeCell = cells[selectedCell] || cells.tp;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)' }}>
          {t('mlBenchmark.confusionMatrix.title', lang)}
        </h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {t('mlBenchmark.confusionMatrix.subtitle', lang)}
        </p>
      </div>

      {/* 2x2 Heatmap Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(60px, auto) repeat(2, minmax(0, 1fr))', gap: '8px', alignItems: 'center' }}>
        {/* Header row */}
        <div></div>
        <div style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-orange)', textTransform: 'uppercase' }}>
          {isFr ? 'Prédit Churn (1)' : 'Pred Churn (1)'}
        </div>
        <div style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>
          {isFr ? 'Prédit Actif (0)' : 'Pred Active (0)'}
        </div>

        {/* Row 1: Actual Churn */}
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-orange)', textAlign: 'right', paddingRight: '4px' }}>
          {isFr ? 'Réel Churn' : 'Actual Churn'}
        </div>

        {/* TP Cell */}
        <div
          onClick={() => setSelectedCell('tp')}
          style={{
            background: cells.tp.bg,
            border: `1.5px solid ${selectedCell === 'tp' ? 'var(--accent-orange)' : cells.tp.border}`,
            boxShadow: selectedCell === 'tp' ? '0 0 14px rgba(105, 231, 153, 0.35)' : 'none',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 0.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minWidth: 0
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent-orange)' }}>
            {isFr ? 'Vrais Positifs (TP)' : 'True Pos (TP)'}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-heading)', margin: '0.2rem 0' }}>
            {cells.tp.count.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {isFr ? `${cells.tp.pctTotal}% total (${cells.tp.pctClass}% rap.)` : `${cells.tp.pctTotal}% total (${cells.tp.pctClass}% rec)`}
          </div>
        </div>

        {/* FN Cell */}
        <div
          onClick={() => setSelectedCell('fn')}
          style={{
            background: cells.fn.bg,
            border: `1.5px solid ${selectedCell === 'fn' ? 'var(--accent-rose)' : cells.fn.border}`,
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 0.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.2s ease, background-color 0.2s ease',
            minWidth: 0
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent-rose)' }}>
            {isFr ? 'Faux Négatifs (FN)' : 'False Neg (FN)'}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-heading)', margin: '0.2rem 0' }}>
            {cells.fn.count.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {isFr ? `${cells.fn.pctTotal}% total (${cells.fn.pctClass}% manqués)` : `${cells.fn.pctTotal}% total (${cells.fn.pctClass}% miss)`}
          </div>
        </div>

        {/* Row 2: Actual Retained */}
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)', textAlign: 'right', paddingRight: '4px' }}>
          {isFr ? 'Réel Actif' : 'Actual Active'}
        </div>

        {/* FP Cell */}
        <div
          onClick={() => setSelectedCell('fp')}
          style={{
            background: cells.fp.bg,
            border: `1.5px solid ${selectedCell === 'fp' ? 'var(--accent-amber)' : cells.fp.border}`,
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 0.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.2s ease, background-color 0.2s ease',
            minWidth: 0
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent-amber)' }}>
            {isFr ? 'Faux Positifs (FP)' : 'False Pos (FP)'}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-heading)', margin: '0.2rem 0' }}>
            {cells.fp.count.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {isFr ? `${cells.fp.pctTotal}% total (${cells.fp.pctClass}% TFP)` : `${cells.fp.pctTotal}% total (${cells.fp.pctClass}% FPR)`}
          </div>
        </div>

        {/* TN Cell */}
        <div
          onClick={() => setSelectedCell('tn')}
          style={{
            background: cells.tn.bg,
            border: `1.5px solid ${selectedCell === 'tn' ? 'var(--accent-emerald)' : cells.tn.border}`,
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 0.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.2s ease, background-color 0.2s ease',
            minWidth: 0
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>
            {isFr ? 'Vrais Négatifs (TN)' : 'True Neg (TN)'}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-heading)', margin: '0.2rem 0' }}>
            {cells.tn.count.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {isFr ? `${cells.tn.pctTotal}% total (${cells.tn.pctClass}% spéc.)` : `${cells.tn.pctTotal}% total (${cells.tn.pctClass}% spec)`}
          </div>
        </div>
      </div>

      {/* Selected Cell Drilldown Explanation */}
      <div style={{ marginTop: '1.25rem', padding: '0.85rem 1rem', background: 'var(--bg-surface)', border: `1px solid ${activeCell.border}`, borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.35rem' }}>
          <strong style={{ color: activeCell.color, fontSize: '0.85rem' }}>
            {t(activeCell.labelKey, lang) || activeCell.fallbackLabel} ({activeCell.count.toLocaleString()} {isFr ? 'profils' : 'profiles'})
          </strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {activeCell.pctTotal}% {isFr ? 'du test set' : 'of test set'}
          </span>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
          {isFr ? activeCell.descFr : activeCell.descEn}
        </p>
      </div>

      {/* Bottom Summary Diagnostic Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem' }}>
        <div style={{ textAlign: 'center', padding: '0.4rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '4px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{isFr ? 'Rappel (Sensitivity)' : 'Recall (Sensitivity)'}</span>
          <strong style={{ fontSize: '1rem', color: 'var(--accent-orange)', fontFamily: 'var(--font-mono)' }}>{currentRecall}%</strong>
        </div>
        <div style={{ textAlign: 'center', padding: '0.4rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '4px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{isFr ? 'Spécificité (TNR)' : 'Specificity (TNR)'}</span>
          <strong style={{ fontSize: '1rem', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>{currentSpec}%</strong>
        </div>
        <div style={{ textAlign: 'center', padding: '0.4rem', background: 'var(--color-paper-inset)', borderRadius: '4px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{isFr ? 'Exactitude (Acc)' : 'Accuracy (Acc)'}</span>
          <strong style={{ fontSize: '1rem', color: 'var(--color-ink)', fontFamily: 'var(--font-mono)' }}>{currentAcc}%</strong>
        </div>
      </div>
    </div>
  );
}

/**
 * Subcomponent 4: FeatureImportanceChart (Pure React SVG)
 */
function FeatureImportanceChart({ lang, t }) {
  const [topCount, setTopCount] = useState(10); // 10 | 15
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const isFr = lang === 'fr';

  const items = TOP_FEATURE_IMPORTANCES.slice(0, topCount);

  // SVG Geometry Dimensions
  const svgWidth = 620;
  const rowHeight = 26;
  const padLeft = 205;
  const padRight = 54;
  const padTop = 12;
  const padBottom = 20;

  const svgHeight = padTop + padBottom + items.length * rowHeight;
  const chartW = svgWidth - padLeft - padRight;
  const maxVal = Math.max(0.12, ...items.map((i) => (i.importance || 0) * 1.15));
  const scaleTicks = [0, 0.25, 0.5, 0.75, 1.0].map((r) => r * maxVal);

  const getCategoryColor = (category) => {
    switch (category) {
      case 'hidden_gems':
        return 'var(--accent-chem-bright)';
      case 'economy':
        return 'var(--dl-souls)';
      case 'psychology':
        return 'var(--ml-churn)';
      case 'combat':
        return 'var(--dl-weapon)';
      case 'aim':
        return 'var(--dl-spirit)';
      default:
        return 'var(--accent-emerald)';
    }
  };

  return (
    <div className="card feature-importance-card" style={{ marginTop: '0', minWidth: 0, boxSizing: 'border-box' }}>
      {/* Header and Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 0.35rem 0' }}>
            {t('mlBenchmark.featureImportance.title', lang)}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            <span style={{ color: 'var(--ml-retention)', fontWeight: 600 }}>
              {isFr ? 'Explicabilité des arbres de décision · ' : 'Decision tree explainability · '}
            </span>
            {t('mlBenchmark.featureImportance.takeaway', lang)}
          </p>
        </div>

        {/* Toggle Top 10 / 15 */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => setTopCount(10)}
              style={{
                background: topCount === 10 ? 'var(--accent-orange)' : 'transparent',
                color: topCount === 10 ? 'var(--color-paper-inset)' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Top 10
            </button>
            <button
              type="button"
              onClick={() => setTopCount(15)}
              style={{
                background: topCount === 15 ? 'var(--accent-orange)' : 'transparent',
                color: topCount === 15 ? 'var(--color-paper-inset)' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Top 15
            </button>
          </div>
        </div>
      </div>

      {/* Pure React SVG Horizontal Bars */}
      <div style={{ width: '100%', maxWidth: '920px', margin: '0 auto', minWidth: 0, boxSizing: 'border-box', overflow: 'hidden' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          width="100%"
          height="auto"
          preserveAspectRatio="xMidYMid meet"
          style={{ display: 'block', width: '100%', maxWidth: '100%' }}
          role="img"
          aria-label={isFr ? 'Importance des variables du modèle Gradient Boosting' : 'Gradient Boosting feature importance chart'}
        >
          {/* Scale Guidelines (Dynamic to maxVal) */}
          {scaleTicks.map((val, idx) => {
            const x = padLeft + (val / maxVal) * chartW;
            return (
              <g key={idx}>
                <line
                  x1={x}
                  y1={padTop}
                  x2={x}
                  y2={svgHeight - padBottom}
                  stroke="var(--color-rule)"
                  strokeDasharray="3 3"
                />
                <text
                  x={x}
                  y={svgHeight - 4}
                  fill="var(--text-muted)"
                  fontSize="8.2"
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                >
                  {(val * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}

          {/* Horizontal Rows */}
          {items.map((item, idx) => {
            const y = padTop + idx * rowHeight;
            const barW = Math.max(4, (item.importance / maxVal) * chartW);
            const isHovered = hoveredIdx === idx;
            const catColor = getCategoryColor(item.category);
            const featKey = item.feature || item.name;
            const translatedName = translateFeature(featKey, lang) || (isFr ? (item.labelFr || featKey) : (item.labelEn || featKey));
            const barFill = idx < 3 ? 'var(--ml-retention)' : 'var(--color-ink-2)';
            const barOpacity = idx < 3 ? (isHovered ? 1 : 0.88) : (isHovered ? 0.78 : 0.42);

            return (
              <g
                key={featKey || idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ cursor: 'default' }}
              >
                {/* Row Hover Background */}
                <rect
                  x={padLeft}
                  y={y}
                  width={chartW}
                  height={rowHeight - 4}
                  fill={isHovered ? 'var(--color-paper-3)' : 'transparent'}
                  rx="3"
                />

                {/* Category indicator dot + Feature Name Label on the Left */}
                <circle cx={padLeft - 7} cy={y + 11} r="2.5" fill={catColor} opacity="0.85" />
                <text
                  x={padLeft - 15}
                  y={y + 13.5}
                  fill={isHovered ? 'var(--color-ink)' : 'var(--text-secondary)'}
                  fontSize="8.8"
                  fontWeight={idx < 3 ? 700 : 500}
                  fontFamily="var(--font-body)"
                  textAnchor="end"
                >
                  {translatedName}
                </text>

                {/* Track background */}
                <rect
                  x={padLeft}
                  y={y + 6}
                  width={chartW}
                  height="10"
                  fill="var(--color-paper-inset)"
                  stroke="var(--color-rule)"
                  strokeWidth="0.6"
                  rx="3"
                />

                {/* Bar */}
                <rect
                  x={padLeft}
                  y={y + 6}
                  width={barW}
                  height="10"
                  fill={barFill}
                  opacity={barOpacity}
                  rx="3"
                  style={{
                    transition: 'opacity 0.2s ease'
                  }}
                />

                {/* Percentage Value on the Right */}
                <text
                  x={padLeft + barW + 8}
                  y={y + 13.5}
                  fill="var(--color-ink)"
                  fontSize="8.2"
                  fontWeight="600"
                  fontFamily="var(--font-mono)"
                >
                  {(item.importance * 100).toFixed(1)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Explanatory Takeaway Footnote */}
      <div style={{ marginTop: '1.25rem', padding: '0.85rem 1rem', background: 'var(--color-paper-inset)', border: '1px solid var(--color-rule)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--accent-orange)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 18h6" />
            <path d="M10 22h4" />
            <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
          </svg>
          <span>{isFr ? 'Interprétation Comportementale :' : 'Behavioral Insight:'}</span>
        </strong>{' '}
        {t('mlBenchmark.featureImportance.takeaway', lang) || (isFr
          ? "La revente panique (14,1 %), la fatigue marathon (13,6 %), le rythme de déblocage des sorts (9,8 %), les destructions de Guardians (6,8 %) et l'isolement en solo (6,7 %) dominent largement la prédiction."
          : "Late rage-selling (14.1%), marathon session fatigue (13.6%), ability unlock pace (9.8%), Guardian kills (6.8%), and solo queue isolation (6.7%) dominate churn prediction.")}
      </div>
    </div>
  );
}

/**
 * Master MlBenchmarkSection Component
 */
export default function MlBenchmarkSection({ lang = 'fr', t, metricsData, visData }) {
  const isFr = lang === 'fr';
  const optimalTh = metricsData?.best_threshold ?? 0.225;
  const [threshold, setThreshold] = useState(optimalTh);
  const [activeBenchTab, setActiveBenchTab] = useState('importance'); // 'importance' | 'cutoff' | 'models'

  useEffect(() => {
    if (metricsData?.best_threshold != null) {
      setThreshold(metricsData.best_threshold);
    }
  }, [metricsData?.best_threshold]);

  return (
    <section id="benchmark" className="section section-alt" aria-labelledby="benchmark-title">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="badge badge-orange header-badge-margin">
            {isFr ? 'BENCHMARK SCIENTIFIQUE' : 'SCIENTIFIC BENCHMARK'}
          </div>
          <h2 id="benchmark-title">
            {isFr
              ? 'Preuve Machine Learning & Calibration Matchmaking'
              : 'Machine Learning Proof & Matchmaking Calibration'}
          </h2>
          <p>
            {isFr
              ? 'Évaluation rigoureuse sans fuite calendaire (StratifiedGroupKFold par joueur) : pourquoi le seuil θ* = 0.225 est optimal pour des interventions matchmaking bienveillantes.'
              : 'Leak-free player-grouped evaluation (StratifiedGroupKFold): why cutoff θ* = 0.225 is optimal for non-punitive matchmaking interventions.'}
          </p>
        </div>

        {/* Compact Champion Summary Strip + 3-Tab Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.85rem',
            padding: '0.75rem 1.1rem',
            background: 'var(--color-paper-2)',
            border: '1px solid var(--color-rule)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem'
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--ml-retention)', fontWeight: 700 }}>
            {isFr
              ? 'Champion Gradient Boosting · 74.7% ROC-AUC · 73.2% Rappel @ θ* = 0.225 · 0% Fuite'
              : 'Champion Gradient Boosting · 74.7% ROC-AUC · 73.2% Recall @ θ* = 0.225 · 0% Leakage'}
          </span>

          <div
            role="tablist"
            aria-label={isFr ? 'Onglets de preuve Machine Learning' : 'Machine Learning Proof Tabs'}
            style={{
              display: 'inline-flex',
              flexWrap: 'wrap',
              gap: '0.4rem',
              background: 'var(--color-paper-inset)',
              padding: '0.25rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-rule)'
            }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeBenchTab === 'importance'}
              onClick={() => setActiveBenchTab('importance')}
              className={`btn ${activeBenchTab === 'importance' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.42rem 0.85rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: 'var(--radius-sm)' }}
            >
              {isFr ? '1. Variables Clés (Top 10)' : '1. Top Signals (Top 10)'}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeBenchTab === 'cutoff'}
              onClick={() => setActiveBenchTab('cutoff')}
              className={`btn ${activeBenchTab === 'cutoff' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.42rem 0.85rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: 'var(--radius-sm)' }}
            >
              {isFr ? '2. Seuil Matchmaking (θ* = 0.225) & Matrice' : '2. Matchmaking Cutoff (θ* = 0.225) & Matrix'}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeBenchTab === 'models'}
              onClick={() => setActiveBenchTab('models')}
              className={`btn ${activeBenchTab === 'models' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.42rem 0.85rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: 'var(--radius-sm)' }}
            >
              {isFr ? '3. Comparatif des 6 Modèles & Ablation' : '3. 6-Model Benchmark & Ablation'}
            </button>
          </div>
        </div>

        {/* Panel 1: Feature Importance */}
        <div style={{ display: activeBenchTab === 'importance' ? 'block' : 'none' }}>
          <FeatureImportanceChart lang={lang} t={t} />
        </div>

        {/* Panel 2: Interactive Curves & Confusion Matrix (kept mounted for threshold reactivity) */}
        <div
          style={{
            display: activeBenchTab === 'cutoff' ? 'grid' : 'none',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
            gap: '1.75rem',
            alignItems: 'stretch'
          }}
        >
          <InteractiveCurves
            lang={lang}
            t={t}
            threshold={threshold}
            onThresholdChange={setThreshold}
            metricsData={metricsData}
            visData={visData}
          />
          <ConfusionMatrixHeatmap
            lang={lang}
            t={t}
            threshold={threshold}
            visData={visData}
          />
        </div>

        {/* Panel 3: Model Comparison Table & Ablation */}
        <div style={{ display: activeBenchTab === 'models' ? 'block' : 'none' }}>
          <ModelComparisonTable lang={lang} t={t} metricsData={metricsData} />
        </div>
      </div>
    </section>
  );
}
