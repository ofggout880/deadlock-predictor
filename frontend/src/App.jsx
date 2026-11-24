import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import KpiBar from './components/KpiBar';
import PsychologySection from './components/PsychologySection';
import MlBenchmarkSection from './components/MlBenchmarkSection';
import SimulatorSection from './components/SimulatorSection';
import ItemsSection from './components/ItemsSection';
import ItemTelemetrySection from './components/ItemTelemetrySection';
import ArchitectureSection from './components/ArchitectureSection';
import DictionaryDrawer from './components/DictionaryDrawer';
import AboutDeadlockModal from './components/AboutDeadlockModal';
import { DictionaryProvider } from './context/DictionaryContext';
import { t } from './translations';
import { checkBackendHealth, getMlMetrics, getMlVisualizations } from './services/api';
import { MOCK_METRICS, MOCK_VISUALIZATIONS } from './data/mockData';

/**
 * Root Error Boundary Component
 * Catches render errors and provides localized recovery interface
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Showcase Error Boundary intercepted error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const isFr = this.props.lang === 'fr';
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-card">
            <h2>{isFr ? 'Une erreur est survenue' : 'An error occurred'}</h2>
            <p>
              {isFr
                ? "Une anomalie d'affichage s'est produite. Veuillez actualiser la page."
                : 'A rendering exception occurred. Please refresh the page.'}
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => window.location.reload()}
            >
              {isFr ? 'Recharger la page' : 'Reload Page'}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const HERO_SUBTABS = ['biomarkers', 'heroes', 'heatmap', 'parry'];
const ITEM_SUBTABS = ['timelines', 'catalog'];

function parseLocationHash(hash) {
  const raw = (hash || '').replace(/^#/, '');
  if (raw.startsWith('/heroes')) {
    const seg = raw.split('/')[2];
    return {
      page: 'items-lab',
      heroSubTab: HERO_SUBTABS.includes(seg) ? seg : 'biomarkers',
      itemSubTab: null
    };
  }
  if (raw.startsWith('/items')) {
    const seg = raw.split('/')[2];
    return {
      page: 'items',
      heroSubTab: null,
      itemSubTab: ITEM_SUBTABS.includes(seg) ? seg : 'timelines'
    };
  }
  return { page: 'main', heroSubTab: null, itemSubTab: null };
}

function buildLocationHash(page, subTab) {
  if (page === 'items-lab') {
    return `#/heroes/${HERO_SUBTABS.includes(subTab) ? subTab : 'biomarkers'}`;
  }
  if (page === 'items') {
    return `#/items/${ITEM_SUBTABS.includes(subTab) ? subTab : 'timelines'}`;
  }
  return '#/main';
}

/**
 * Root Application Component
 * Manages:
 * - Persistent language state ('fr' / 'en') saved to localStorage
 * - URL hash routing ('#/main', '#/heroes/<subtab>', '#/items/<subtab>') with Back/Forward & deep-link support
 * - Reading progress bar, Page 1 scroll-spy rail, and Back-to-top navigation
 * - Backend health status polling ('online' | 'offline' | 'checking')
 */
export default function App() {
  // 1. Language State with LocalStorage Persistence
  const [lang, setLang] = useState(() => {
    try {
      const savedLang = localStorage.getItem('deadlock_showcase_lang') || localStorage.getItem('dota2_showcase_lang');
      if (savedLang === 'fr' || savedLang === 'en') return savedLang;
      if (typeof navigator !== 'undefined' && navigator.language?.startsWith('en')) {
        return 'en';
      }
    } catch {
      // LocalStorage access may fail in restricted sandboxes
    }
    return 'fr';
  });

  // 2. Active Workspace Tab & Sub-Tab Synchronized with URL Hash
  const initialRoute =
    typeof window !== 'undefined'
      ? parseLocationHash(window.location.hash)
      : { page: 'main', heroSubTab: 'biomarkers', itemSubTab: 'timelines' };

  const [activePage, setActivePageState] = useState(initialRoute.page);
  const [heroSubTab, setHeroSubTab] = useState(initialRoute.heroSubTab || 'biomarkers');
  const [itemSubTab, setItemSubTab] = useState(initialRoute.itemSubTab || 'timelines');

  // Reading progress & Back-to-top state
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const setActivePage = (nextPage, nextSubTab = null) => {
    let resolvedSubTab = nextSubTab;
    if (nextPage === 'items-lab') {
      resolvedSubTab = HERO_SUBTABS.includes(nextSubTab) ? nextSubTab : heroSubTab;
      setHeroSubTab(resolvedSubTab);
    } else if (nextPage === 'items') {
      resolvedSubTab = ITEM_SUBTABS.includes(nextSubTab) ? nextSubTab : itemSubTab;
      setItemSubTab(resolvedSubTab);
    }

    setActivePageState(nextPage);

    if (typeof window !== 'undefined') {
      const targetHash = buildLocationHash(nextPage, resolvedSubTab);
      if (window.location.hash !== targetHash) {
        window.history.pushState({ page: nextPage, subTab: resolvedSubTab }, '', targetHash);
      }
    }
  };

  const handleHeroSubTabChange = (subTab) => {
    if (!HERO_SUBTABS.includes(subTab)) return;
    setHeroSubTab(subTab);
    if (typeof window !== 'undefined' && activePage === 'items-lab') {
      const targetHash = buildLocationHash('items-lab', subTab);
      if (window.location.hash !== targetHash) {
        window.history.pushState({ page: 'items-lab', subTab }, '', targetHash);
      }
    }
  };

  const handleItemSubTabChange = (subTab) => {
    if (!ITEM_SUBTABS.includes(subTab)) return;
    setItemSubTab(subTab);
    if (typeof window !== 'undefined' && activePage === 'items') {
      const targetHash = buildLocationHash('items', subTab);
      if (window.location.hash !== targetHash) {
        window.history.pushState({ page: 'items', subTab }, '', targetHash);
      }
    }
  };

  const handleGoToSimulator = () => {
    if (activePage !== 'main') {
      setActivePage('main');
      setTimeout(() => {
        const el = document.querySelector('#archetypes') || document.querySelector('#simulator');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.querySelector('#archetypes') || document.querySelector('#simulator');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Sync browser Back/Forward (popstate) and direct hash changes (hashchange)
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const syncFromHash = () => {
      const parsed = parseLocationHash(window.location.hash);
      setActivePageState(parsed.page);
      if (parsed.heroSubTab) setHeroSubTab(parsed.heroSubTab);
      if (parsed.itemSubTab) setItemSubTab(parsed.itemSubTab);
    };
    window.addEventListener('popstate', syncFromHash);
    window.addEventListener('hashchange', syncFromHash);
    return () => {
      window.removeEventListener('popstate', syncFromHash);
      window.removeEventListener('hashchange', syncFromHash);
    };
  }, []);

  // Reading progress bar, Page 1 scroll-spy & Back-to-top visibility
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    let rafId = null;

    const updateScrollMetrics = () => {
      rafId = null;
      const doc = document.documentElement;
      const maxScroll = Math.max(0, doc.scrollHeight - window.innerHeight);
      const y = window.scrollY || window.pageYOffset || 0;
      const pct = maxScroll > 0 ? Math.min(100, Math.max(0, (y / maxScroll) * 100)) : 0;
      setScrollProgress(pct);
      setShowBackToTop(y > 480);
    };

    const onScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateScrollMetrics);
      }
    };

    updateScrollMetrics();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [activePage]);

  // Sync language state to localStorage
  const handleSetLang = (newLang) => {
    setLang(newLang);
    try {
      localStorage.setItem('deadlock_showcase_lang', newLang);
      document.documentElement.lang = newLang;
    } catch {
      // Ignore storage errors
    }
  };

  // Sync HTML lang attribute on mount and change
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  // 3. Backend Health & ML State Management
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking' | 'online' | 'offline'
  const [mlMetrics, setMlMetrics] = useState(MOCK_METRICS);
  const [mlVisualizations, setMlVisualizations] = useState(MOCK_VISUALIZATIONS);

  const refreshBackend = async () => {
    try {
      const isHealthy = await checkBackendHealth(true);
      setBackendStatus(isHealthy ? 'online' : 'offline');
      if (isHealthy) {
        const [metricsData, visData] = await Promise.all([
          getMlMetrics(),
          getMlVisualizations()
        ]);
        if (metricsData) setMlMetrics(metricsData);
        if (visData) setMlVisualizations(visData);
      }
      return isHealthy;
    } catch {
      setBackendStatus('offline');
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function verifyBackend() {
      try {
        const isHealthy = await checkBackendHealth();
        if (isMounted) {
          setBackendStatus(isHealthy ? 'online' : 'offline');
        }
        if (isHealthy) {
          const [metricsData, visData] = await Promise.all([
            getMlMetrics(),
            getMlVisualizations()
          ]);
          if (isMounted) {
            if (metricsData) setMlMetrics(metricsData);
            if (visData) setMlVisualizations(visData);
          }
        }
      } catch {
        if (isMounted) {
          setBackendStatus('offline');
        }
      }
    }
    verifyBackend();
    return () => {
      isMounted = false;
    };
  }, []);

  const isFr = lang === 'fr';

  return (
    <ErrorBoundary lang={lang}>
      <DictionaryProvider lang={lang}>
        <div className="app-shell">
          {/* Subtle Top Reading Progress Bar */}
          <div className="reading-progress-track" aria-hidden="true">
            <div className="reading-progress-fill" style={{ width: `${scrollProgress.toFixed(1)}%` }} />
          </div>

          {/* Sticky Header Shell with Principal Hover Dropdown & Dedicated Lab Tab */}
          <Navbar
            lang={lang}
            setLang={handleSetLang}
            t={t}
            backendStatus={backendStatus}
            onRefreshBackend={refreshBackend}
            activePage={activePage}
            setActivePage={setActivePage}
          />

          {/* Main Content Area */}
          <main id="main-content" className="app-main">
            {activePage === 'main' ? (
              <div className="page-transition-enter" key="main-view">
                <HeroSection lang={lang} t={t} />

                <KpiBar lang={lang} t={t} metricsData={mlMetrics} />

                {/* Act 2: Interactive Matchmaking Profiles & 4-Slider Simulator */}
                <SimulatorSection lang={lang} t={t} backendStatus={backendStatus} />

                {/* Act 3: Top 3 In-Game Behavioral Signals */}
                <PsychologySection lang={lang} t={t} />

                {/* Act 4: ML Benchmark & Cutoff Calibration Tabs */}
                <MlBenchmarkSection
                  lang={lang}
                  t={t}
                  metricsData={mlMetrics}
                  visData={mlVisualizations}
                />

                {/* Act 5a: 2-Card Complementary Matchmaking Dossiers */}
                <section className="section" style={{ paddingTop: '1rem', paddingBottom: '1.5rem' }}>
                  <div className="container">
                    <p
                      style={{
                        margin: '0 0 0.85rem 0',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em'
                      }}
                    >
                      {isFr
                        ? 'VOLETS COMPLÉMENTAIRES · FACTEURS DE CHURN SPÉCIFIQUES AU JEU'
                        : 'COMPLEMENTARY DOSSIERS · GAME-SPECIFIC CHURN DRIVERS'}
                    </p>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                        gap: '1.25rem'
                      }}
                    >
                      <div
                        className="card"
                        style={{
                          background: 'var(--color-paper-2)',
                          border: '1px solid var(--color-rule)',
                          borderRadius: 'var(--radius-lg)',
                          padding: '1.35rem 1.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '1rem'
                        }}
                      >
                        <div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ml-retention)', fontWeight: 700 }}>
                            01 · {isFr ? 'VOLET COMPLÉMENTAIRE' : 'COMPLEMENTARY DOSSIER'}
                          </span>
                          <h3 style={{ margin: '0.35rem 0 0.5rem 0', fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-ink)' }}>
                            {isFr ? 'Dynamique Héros & Churn' : 'Hero Dynamics & Churn'}
                          </h3>
                          <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                            {isFr
                              ? "Certains kits de héros génèrent jusqu'à 60 % de churn (Yamato, Vindicta, Seven, Lash) via les tirs à la tête sous stun et la punition de parade — un signal clé pour un matchmaking sensible aux compositions."
                              : 'Certain hero kits drive up to 60% churn (Yamato, Vindicta, Seven, Lash) through stun headshots and parry punishment — a crucial signal for matchup-aware matchmaking.'}
                          </p>
                        </div>
                        <div>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                              setActivePage('items-lab');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                          >
                            {isFr ? 'Ouvrir Dynamique Héros →' : 'Open Hero Dynamics →'}
                          </button>
                        </div>
                      </div>

                      <div
                        className="card"
                        style={{
                          background: 'var(--color-paper-2)',
                          border: '1px solid var(--color-rule)',
                          borderRadius: 'var(--radius-lg)',
                          padding: '1.35rem 1.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '1rem'
                        }}
                      >
                        <div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ml-retention)', fontWeight: 700 }}>
                            02 · {isFr ? 'VOLET COMPLÉMENTAIRE' : 'COMPLEMENTARY DOSSIER'}
                          </span>
                          <h3 style={{ margin: '0.35rem 0 0.5rem 0', fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-ink)' }}>
                            {isFr ? 'Focus Items, Morts & Ragequit' : 'Item Focus, Deaths & Ragequit'}
                          </h3>
                          <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                            {isFr
                              ? 'Quels achats et erreurs de boutique (0 % Vitality à 30 min, Spirit Strike, Hollow Point) provoquent morts en chaîne, reventes panique, ragequit et abandon à 14 jours.'
                              : 'Which item builds and shop mistakes (0% Vitality at 30m, Spirit Strike, Hollow Point) trigger death spirals, panic sells, ragequits, and 14-day churn.'}
                          </p>
                        </div>
                        <div>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                              setActivePage('items');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                          >
                            {isFr ? 'Ouvrir Focus Items →' : 'Open Item Focus →'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Act 5b: Collapsed Technical Appendix */}
                <ArchitectureSection lang={lang} t={t} />
              </div>
            ) : activePage === 'items' ? (
              <div className="page-transition-enter" key="items-telemetry-view">
                <ItemTelemetrySection
                  lang={lang}
                  t={t}
                  activeSubTab={itemSubTab}
                  onSubTabChange={handleItemSubTabChange}
                  onBackToMain={() => {
                    setActivePage('main');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onGoToHeroes={() => {
                    setActivePage('items-lab');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            ) : (
              <div className="page-transition-enter" key="items-lab-view">
                <ItemsSection
                  lang={lang}
                  t={t}
                  activeSubTab={heroSubTab}
                  onSubTabChange={handleHeroSubTabChange}
                  onBackToMain={() => {
                    setActivePage('main');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onGoToItems={() => {
                    setActivePage('items');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </main>

          {/* Clean Back-to-Top Button (appears after scrolling 480px) */}
          {showBackToTop && (
            <button
              type="button"
              className="back-to-top-btn"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label={isFr ? 'Retour en haut de page' : 'Back to top'}
              title={isFr ? 'Retour en haut de page' : 'Back to top'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
              <span>{isFr ? 'Haut' : 'Top'}</span>
            </button>
          )}

          {/* Global Slide-over Dictionary Drawer */}
          <DictionaryDrawer lang={lang} t={t} />

          {/* About Deadlock & Project Purpose Modal */}
          <AboutDeadlockModal lang={lang} t={t} onGoToSimulator={handleGoToSimulator} />

          {/* Footer Shell */}
          <Footer lang={lang} t={t} />
        </div>
      </DictionaryProvider>
    </ErrorBoundary>
  );
}
