import React, { useState, useEffect, useRef } from 'react';
import { checkBackendHealth, getBackendStatusDetails } from '../services/api';
import { useDictionary } from '../context/DictionaryContext';
import { DICTIONARY_TOTAL_COUNT } from '../data/dictionaryData';

/**
 * Navbar Component (Two-Tab Architecture with Hover Popover Windows)
 *
 * Features:
 * - Tab 1 ("Principal"): Hover dropdown popover containing all 6 main study sections
 *   (Overview, Key Metrics, Psychology & Aim, ML Benchmark, Archetypes & Simulator, Architecture)
 * - Tab 2 ("Labo Items & Stun 3D"): Dedicated interactive case/tab for the Source 2
 *   Item Sequences, Stun Headshots & Hero 3D Exposure deep-dive page, with a hover preview
 *   of its 4 analytical chapters.
 * - Direct "Deadlock & Projet" modal trigger, FR/EN switcher, and slide-over Burger Drawer.
 */
export default function Navbar({
  lang,
  setLang,
  t,
  backendStatus = 'checking',
  onRefreshBackend,
  activePage = 'main',
  setActivePage
}) {
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [mainDropdownOpen, setMainDropdownOpen] = useState(false);
  const [labDropdownOpen, setLabDropdownOpen] = useState(false);
  const [itemDropdownOpen, setItemDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusInfo, setStatusInfo] = useState(() => getBackendStatusDetails());
  const [copiedCmd, setCopiedCmd] = useState(false);

  const { openDictionary, openAboutModal } = useDictionary();
  const burgerDrawerRef = useRef(null);
  const navLinksRef = useRef(null);
  const mainTimeoutRef = useRef(null);
  const labTimeoutRef = useRef(null);
  const itemTimeoutRef = useRef(null);
  const lastOpenedMenuRef = useRef({ main: 0, lab: 0, item: 0 });

  const isFr = lang === 'fr';

  const toggleLanguage = () => {
    const nextLang = lang === 'fr' ? 'en' : 'fr';
    setLang(nextLang);
  };

  // Sections inside "Principal" hover popover (aligned with 5-Act Matchmaking Narrative)
  const mainStudySections = [
    {
      href: '#hero',
      step: '01',
      label: isFr ? 'Vision Matchmaking & Impact' : 'Matchmaking Vision & Impact',
      desc: isFr ? 'Pourquoi prédire le churn optimise les files sans EOMM' : 'Why churn prediction optimizes queues with zero EOMM'
    },
    {
      href: '#kpis',
      step: '02',
      label: isFr ? 'Indicateurs Clés Source 2' : 'Source 2 Validation KPIs',
      desc: isFr ? '8 625 fenêtres, 73,2 % rappel et 0 % fuite calendaire' : '8,625 windows, 73.2% recall & 0% calendar leakage'
    },
    {
      href: '#archetypes',
      step: '03',
      label: isFr ? '4 Profils & Simulateur File' : '4 Profiles & Queue Simulator',
      desc: isFr ? 'Recommandations matchmaking 50/50 & 4 curseurs live' : '50/50 matchmaking actions & live 4-slider simulator'
    },
    {
      href: '#psychology',
      step: '04',
      label: isFr ? 'Top 3 Signaux En Match' : 'Top 3 In-Game Signals',
      desc: isFr ? 'Rage-sell, isolement solo et vulnérabilité sous stun' : 'Rage-sell, solo isolation & stun vulnerability'
    },
    {
      href: '#benchmark',
      step: '05',
      label: isFr ? 'Preuve ML & Seuil θ*' : 'ML Proof & Cutoff θ*',
      desc: isFr ? 'Variables clés, calibration θ*=0.225 & benchmark 6 modèles' : 'Top features, θ*=0.225 calibration & 6-model benchmark'
    },
    {
      href: '#architecture',
      step: '06',
      label: isFr ? 'Annexe Technique Pipeline' : 'Technical Pipeline Appendix',
      desc: isFr ? 'Architecture 5 étapes FastAPI & pistes Survie / Hawkes' : '5-stage FastAPI pipeline & Survival / Hawkes R&D'
    }
  ];

  // Chapters inside "Dynamique Héros & Churn" hover popover
  const labChapters = [
    {
      href: '#lab-step-1',
      step: '01',
      badge: isFr ? 'N = 10 000' : 'N = 10,000',
      badgeColor: 'var(--accent-rose)',
      label: isFr ? 'Comparatif Empirique (Biomarqueurs)' : 'Empirical Comparison (Biomarkers)',
      desc: isFr
        ? 'Les 5 divergences clés : Stun Headshots, Écran Gris, Isolement Solo & Rage-Sell'
        : 'Key divergences: Stun Headshots, Grey Screen, Solo Isolation & Rage-Sell'
    },
    {
      href: '#lab-step-2',
      step: '02',
      badge: '60% YAMATO',
      badgeColor: 'var(--accent-purple)',
      label: isFr ? 'Dynamique des Héros & Kits Punitifs' : 'Hero Churn Dynamics & Kits',
      desc: isFr
        ? 'Pourquoi Yamato (60%), Vindicta (45%), Lash (36%) et Seven (42%) font fuir les joueurs'
        : 'Why Yamato (60%), Vindicta (45%), Seven (42%) and Lash (36%) drive uninstalls'
    },
    {
      href: '#lab-step-heatmap',
      step: '03',
      badge: 'HEATMAP 2D',
      badgeColor: 'var(--accent-cyan)',
      label: isFr ? 'Carte Tactique : Morts & Déconnexions' : 'Tactical Heatmap: Deaths & Ragequits',
      desc: isFr
        ? 'Carte officielle de Deadlock avec filtres thermiques, sélecteur héros et curseur temporel'
        : 'Official Deadlock map with thermal filters, hero selector, and time slider'
    },
    {
      href: '#lab-step-parry',
      step: '04',
      badge: 'STUN 4.0S',
      badgeColor: 'var(--accent-rose)',
      label: isFr ? 'Biomécanique du Parry & Ragequit' : 'Parry Biomechanics & Ragequit',
      desc: isFr
        ? "Pourquoi subir un contre au corps-à-corps (4s de paralysie) fait chuter l'activité (-45,6 % APM) et déclenche l'abandon"
        : 'Why getting parried inflicts 4.0s stun, triggers -44% APM drop, and causes ragequits'
    }
  ];

  // Chapters inside "ITEM" hover popover
  const itemChapters = [
    {
      href: '#item-step-timelines',
      step: '01',
      badge: '0–35M TIMELINE',
      badgeColor: 'var(--accent-cyan)',
      label: isFr ? "Frise Chronologique des Achats" : 'Chronological Purchase Timelines',
      desc: isFr
        ? 'Autopsie minute par minute : 13 achats offensifs sans survie (Vitality), objets pièges & 4 schémas'
        : 'Minute-by-minute autopsy: 13 offensive items, Hollow Point trap & 4 error schemas'
    },
    {
      href: '#item-step-catalog',
      step: '02',
      badge: '50+ ITEMS',
      badgeColor: 'var(--accent-emerald)',
      label: isFr ? 'Catalogue Empirique & Remède IA' : 'Empirical Item Catalog & AI Remedy',
      desc: isFr
        ? 'Classement des items de Tilt (Spirit Strike 49%) vs Rétention (Cultist 10.3%) & Assistant Boutique'
        : 'Ranking of Tilt items (Spirit Strike 49%) vs Retention (Cultist 10.3%) & Shop Assistant'
    }
  ];

  const mapLabAnchorToSubTab = (anchor) => {
    if (anchor === '#lab-step-1') return 'biomarkers';
    if (anchor === '#lab-step-2') return 'heroes';
    if (anchor === '#lab-step-heatmap' || anchor === '#lab-step-3') return 'heatmap';
    if (anchor === '#lab-step-parry' || anchor === '#lab-step-4') return 'parry';
    return null;
  };

  const mapItemAnchorToSubTab = (anchor) => {
    if (anchor === '#item-step-catalog') return 'catalog';
    if (anchor === '#item-step-timelines') return 'timelines';
    return null;
  };

  const handleMainSectionClick = (e, href) => {
    if (e) e.preventDefault();
    setBurgerOpen(false);
    setMainDropdownOpen(false);
    setLabDropdownOpen(false);
    setItemDropdownOpen(false);

    const expandAndScroll = () => {
      if (href === '#architecture' && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('deadlock:expand-architecture'));
      }
      if (href) {
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    if (activePage !== 'main' && typeof setActivePage === 'function') {
      setActivePage('main');
      setTimeout(expandAndScroll, 80);
    } else if (href) {
      expandAndScroll();
    }
  };

  const handleLabClick = (e, targetAnchor = null) => {
    if (e) e.preventDefault();
    setBurgerOpen(false);
    setMainDropdownOpen(false);
    setLabDropdownOpen(false);
    setItemDropdownOpen(false);

    const subTab = mapLabAnchorToSubTab(targetAnchor);

    const notifyAndScroll = () => {
      if (targetAnchor && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('deadlock:subtab', { detail: { page: 'items-lab', anchor: targetAnchor } }));
        setTimeout(() => {
          const target = document.getElementById('lab-subtabs-anchor') || document.querySelector(targetAnchor);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 45);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    if (activePage !== 'items-lab' && typeof setActivePage === 'function') {
      setActivePage('items-lab', subTab);
      setTimeout(notifyAndScroll, 80);
    } else {
      if (subTab && typeof setActivePage === 'function') {
        setActivePage('items-lab', subTab);
      }
      notifyAndScroll();
    }
  };

  const handleItemClick = (e, targetAnchor = null) => {
    if (e) e.preventDefault();
    setBurgerOpen(false);
    setMainDropdownOpen(false);
    setLabDropdownOpen(false);
    setItemDropdownOpen(false);

    const subTab = mapItemAnchorToSubTab(targetAnchor);

    const notifyAndScroll = () => {
      if (targetAnchor && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('deadlock:subtab', { detail: { page: 'items', anchor: targetAnchor } }));
        setTimeout(() => {
          const target = document.getElementById('item-subtabs-anchor') || document.querySelector(targetAnchor);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 45);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    if (activePage !== 'items' && typeof setActivePage === 'function') {
      setActivePage('items', subTab);
      setTimeout(notifyAndScroll, 80);
    } else {
      if (subTab && typeof setActivePage === 'function') {
        setActivePage('items', subTab);
      }
      notifyAndScroll();
    }
  };

  // Hover & keyboard focus helpers for smooth UX (touch-safe for >=1024px tablets)
  const openMainMenu = () => {
    if (mainTimeoutRef.current) clearTimeout(mainTimeoutRef.current);
    setLabDropdownOpen(false);
    setItemDropdownOpen(false);
    setMainDropdownOpen((wasOpen) => {
      if (!wasOpen) lastOpenedMenuRef.current.main = Date.now();
      return true;
    });
  };

  const closeMainMenu = () => {
    mainTimeoutRef.current = setTimeout(() => {
      setMainDropdownOpen(false);
    }, 160);
  };

  const handleMainBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      if (mainTimeoutRef.current) clearTimeout(mainTimeoutRef.current);
      setMainDropdownOpen(false);
    }
  };

  const openLabMenu = () => {
    if (labTimeoutRef.current) clearTimeout(labTimeoutRef.current);
    setMainDropdownOpen(false);
    setItemDropdownOpen(false);
    setLabDropdownOpen((wasOpen) => {
      if (!wasOpen) lastOpenedMenuRef.current.lab = Date.now();
      return true;
    });
  };

  const closeLabMenu = () => {
    labTimeoutRef.current = setTimeout(() => {
      setLabDropdownOpen(false);
    }, 160);
  };

  const handleLabBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      if (labTimeoutRef.current) clearTimeout(labTimeoutRef.current);
      setLabDropdownOpen(false);
    }
  };

  const openItemMenu = () => {
    if (itemTimeoutRef.current) clearTimeout(itemTimeoutRef.current);
    setMainDropdownOpen(false);
    setLabDropdownOpen(false);
    setItemDropdownOpen((wasOpen) => {
      if (!wasOpen) lastOpenedMenuRef.current.item = Date.now();
      return true;
    });
  };

  const closeItemMenu = () => {
    itemTimeoutRef.current = setTimeout(() => {
      setItemDropdownOpen(false);
    }, 160);
  };

  const handleItemBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      if (itemTimeoutRef.current) clearTimeout(itemTimeoutRef.current);
      setItemDropdownOpen(false);
    }
  };

  // Active-tab touch/click handlers: switch page if inactive; toggle popover reliably if active
  const handleMainTriggerClick = (e) => {
    if (activePage !== 'main') {
      handleMainSectionClick(e, '#hero');
      return;
    }
    e.preventDefault();
    if (mainTimeoutRef.current) clearTimeout(mainTimeoutRef.current);
    setLabDropdownOpen(false);
    setItemDropdownOpen(false);
    if (Date.now() - lastOpenedMenuRef.current.main < 350) {
      setMainDropdownOpen(true);
    } else {
      setMainDropdownOpen((prev) => !prev);
    }
  };

  const handleLabTriggerClick = (e) => {
    if (activePage !== 'items-lab') {
      handleLabClick(e, null);
      return;
    }
    e.preventDefault();
    if (labTimeoutRef.current) clearTimeout(labTimeoutRef.current);
    setMainDropdownOpen(false);
    setItemDropdownOpen(false);
    if (Date.now() - lastOpenedMenuRef.current.lab < 350) {
      setLabDropdownOpen(true);
    } else {
      setLabDropdownOpen((prev) => !prev);
    }
  };

  const handleItemTriggerClick = (e) => {
    if (activePage !== 'items') {
      handleItemClick(e, null);
      return;
    }
    e.preventDefault();
    if (itemTimeoutRef.current) clearTimeout(itemTimeoutRef.current);
    setMainDropdownOpen(false);
    setLabDropdownOpen(false);
    if (Date.now() - lastOpenedMenuRef.current.item < 350) {
      setItemDropdownOpen(true);
    } else {
      setItemDropdownOpen((prev) => !prev);
    }
  };

  // Close popovers when tapping/clicking outside the navbar tabs on touch/desktop devices
  useEffect(() => {
    if (!mainDropdownOpen && !labDropdownOpen && !itemDropdownOpen) return;
    const handlePointerOutside = (e) => {
      if (navLinksRef.current && !navLinksRef.current.contains(e.target)) {
        setMainDropdownOpen(false);
        setLabDropdownOpen(false);
        setItemDropdownOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerOutside);
    return () => document.removeEventListener('pointerdown', handlePointerOutside);
  }, [mainDropdownOpen, labDropdownOpen, itemDropdownOpen]);

  // Sync details whenever backendStatus changes
  useEffect(() => {
    setStatusInfo(getBackendStatusDetails());
  }, [backendStatus]);

  // Close drawers/dropdowns on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (burgerOpen) setBurgerOpen(false);
        if (mainDropdownOpen) setMainDropdownOpen(false);
        if (labDropdownOpen) setLabDropdownOpen(false);
        if (itemDropdownOpen) setItemDropdownOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [burgerOpen, mainDropdownOpen, labDropdownOpen, itemDropdownOpen]);

  // Handle re-checking backend connection
  const handleRefreshConnection = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      if (typeof onRefreshBackend === 'function') {
        await onRefreshBackend();
      } else {
        await checkBackendHealth(true);
      }
    } finally {
      setStatusInfo(getBackendStatusDetails());
      setIsRefreshing(false);
    }
  };

  // Handle copying quickstart command with fallback & error silencing
  const handleCopyCmd = (cmd) => {
    if (!cmd) return;
    const copyPromise = (async () => {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(cmd);
          return true;
        } catch {
          // Fall through to execCommand fallback
        }
      }
      try {
        const textArea = document.createElement('textarea');
        textArea.value = cmd;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        textArea.style.opacity = '0';
        textArea.setAttribute('readonly', '');
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return Boolean(success);
      } catch {
        return false;
      }
    })();

    copyPromise
      .then((ok) => {
        if (ok) {
          setCopiedCmd(true);
          setTimeout(() => setCopiedCmd(false), 2000);
        }
      })
      .catch(() => {});
  };

  const isOnline = backendStatus === 'online';
  const isChecking = backendStatus === 'checking';
  const quickstartCommand = t('backendStatus.popover.quickstartCmd', lang);

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Left Side: Logo + Two Top-Level Navigation Items (Principal Dropdown + Dedicated Lab Case) */}
        <div className="navbar-left">
          <a
            href="#hero"
            className="brand-link"
            onClick={(e) => handleMainSectionClick(e, '#hero')}
            title="Deadlock Predictor Showcase"
            aria-label={isFr ? 'Accueil Showcase Deadlock Predictor' : 'Deadlock Predictor Showcase Home'}
          >
            <div className="brand-logo-icon" aria-hidden="true">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                <circle cx="12" cy="12" r="3" fill="var(--ml-retention-base)" />
              </svg>
            </div>
          </a>

          {/* Primary 3-Tab Minimalist Navigation Bar (Unboxed, No Emojis, Active Green Dot) */}
          <nav ref={navLinksRef} className="navbar-links navbar-two-tabs" aria-label="Main Navigation">
            {/* TAB 1: PRINCIPAL (Hover Popover with all 6 Main Page Sections) */}
            <div
              className="nav-dropdown-wrapper"
              onMouseEnter={openMainMenu}
              onMouseLeave={closeMainMenu}
              onBlur={handleMainBlur}
            >
              <button
                type="button"
                className={`nav-tab-trigger ${activePage === 'main' ? 'is-active' : ''}`}
                onClick={handleMainTriggerClick}
                onFocus={openMainMenu}
                aria-expanded={mainDropdownOpen}
                aria-haspopup="true"
                id="nav-tab-principal"
              >
                {activePage === 'main' && <span className="nav-tab-dot" aria-hidden="true" />}
                <span className="nav-tab-label">{t('nav.tabs.main', lang)}</span>
                <svg
                  className={`nav-tab-chevron ${mainDropdownOpen ? 'is-open' : ''}`}
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Floating Hover Window for "Principal" */}
              {mainDropdownOpen && (
                <div
                  className="nav-hover-popover"
                  role="menu"
                  aria-label={t('nav.tabs.main', lang)}
                  onMouseEnter={openMainMenu}
                  onMouseLeave={closeMainMenu}
                >
                  <div className="nav-popover-header">
                    <div className="nav-popover-header-top">
                      <span className="nav-popover-sublabel">
                        {isFr ? 'Page principale · 6 sections' : 'Main study · 6 sections'}
                      </span>
                      <span className="nav-popover-hint">
                        {isFr ? 'Cliquer pour défiler' : 'Click to scroll'}
                      </span>
                    </div>
                    <p className="nav-popover-subtitle">{t('nav.tabs.mainSub', lang)}</p>
                  </div>

                  <div className="nav-popover-grid">
                    {mainStudySections.map((sec) => (
                      <a
                        key={sec.href}
                        href={sec.href}
                        role="menuitem"
                        className="nav-popover-item"
                        onClick={(e) => handleMainSectionClick(e, sec.href)}
                      >
                        <div className="nav-popover-item-num">{sec.step}</div>
                        <div className="nav-popover-item-content">
                          <div className="nav-popover-item-title">
                            <span>{sec.label}</span>
                            <svg className="nav-popover-item-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <line x1="5" y1="12" x2="19" y2="12" />
                              <polyline points="12 5 19 12 12 19" />
                            </svg>
                          </div>
                          <div className="nav-popover-item-desc">{sec.desc}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* TAB 2: HERO DYNAMICS & CHURN */}
            <div
              className="nav-dropdown-wrapper"
              onMouseEnter={openLabMenu}
              onMouseLeave={closeLabMenu}
              onBlur={handleLabBlur}
            >
              <button
                type="button"
                className={`nav-tab-trigger ${activePage === 'items-lab' ? 'is-active' : ''}`}
                onClick={handleLabTriggerClick}
                onFocus={openLabMenu}
                aria-expanded={labDropdownOpen}
                aria-haspopup="true"
                id="nav-tab-items-lab"
              >
                {activePage === 'items-lab' && <span className="nav-tab-dot" aria-hidden="true" />}
                <span className="nav-tab-label">{t('nav.tabs.itemsLab', lang)}</span>
                <svg
                  className={`nav-tab-chevron ${labDropdownOpen ? 'is-open' : ''}`}
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Floating Hover Window for "Dynamique Héros & Churn" */}
              {labDropdownOpen && (
                <div
                  className="nav-hover-popover nav-hover-popover-lab"
                  role="menu"
                  aria-label={t('nav.tabs.itemsLab', lang)}
                  onMouseEnter={openLabMenu}
                  onMouseLeave={closeLabMenu}
                >
                  <div className="nav-popover-header">
                    <div className="nav-popover-header-top">
                      <span className="nav-popover-sublabel">
                        {isFr ? 'Dossier spécial · Replay Parser Source 2' : 'Special dossier · Source 2 Replay Parser'}
                      </span>
                      <span className="nav-popover-hint">
                        {isFr ? '4 chapitres interactifs' : '4 interactive chapters'}
                      </span>
                    </div>
                    <p className="nav-popover-subtitle">{t('nav.tabs.itemsLabSub', lang)}</p>
                  </div>

                  <div className="nav-popover-list">
                    {labChapters.map((chap) => (
                      <a
                        key={chap.href}
                        href={chap.href}
                        role="menuitem"
                        className="nav-popover-item nav-popover-item-lab"
                        onClick={(e) => handleLabClick(e, chap.href)}
                      >
                        <div className="nav-popover-item-num">{chap.step}</div>
                        <div className="nav-popover-item-content">
                          <div className="nav-popover-item-title">
                            <span>{chap.label}</span>
                            <span className="nav-popover-hint" style={{ color: chap.badgeColor }}>
                              {chap.badge}
                            </span>
                          </div>
                          <div className="nav-popover-item-desc">{chap.desc}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* TAB 3: DEDICATED ITEM TAB ("ITEM") */}
            <div
              className="nav-dropdown-wrapper"
              onMouseEnter={openItemMenu}
              onMouseLeave={closeItemMenu}
              onBlur={handleItemBlur}
            >
              <button
                type="button"
                className={`nav-tab-trigger ${activePage === 'items' ? 'is-active' : ''}`}
                onClick={handleItemTriggerClick}
                onFocus={openItemMenu}
                aria-expanded={itemDropdownOpen}
                aria-haspopup="true"
                id="nav-tab-items-case"
              >
                {activePage === 'items' && <span className="nav-tab-dot" aria-hidden="true" />}
                <span className="nav-tab-label">{t('nav.tabs.itemTab', lang)}</span>
                <svg
                  className={`nav-tab-chevron ${itemDropdownOpen ? 'is-open' : ''}`}
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Floating Hover Window for "ITEM" */}
              {itemDropdownOpen && (
                <div
                  className="nav-hover-popover nav-hover-popover-lab"
                  role="menu"
                  aria-label={t('nav.tabs.itemTab', lang)}
                  onMouseEnter={openItemMenu}
                  onMouseLeave={closeItemMenu}
                >
                  <div className="nav-popover-header">
                    <div className="nav-popover-header-top">
                      <span className="nav-popover-sublabel">
                        {isFr ? 'Télémétrie équipements · Séquences d’achats' : 'Itemization telemetry · Builds & shop sequences'}
                      </span>
                      <span className="nav-popover-hint">
                        {isFr ? '2 chapitres chronologiques' : '2 chronological chapters'}
                      </span>
                    </div>
                    <p className="nav-popover-subtitle">{t('nav.tabs.itemTabSub', lang)}</p>
                  </div>

                  <div className="nav-popover-list">
                    {itemChapters.map((chap) => (
                      <a
                        key={chap.href}
                        href={chap.href}
                        role="menuitem"
                        className="nav-popover-item nav-popover-item-lab"
                        onClick={(e) => handleItemClick(e, chap.href)}
                      >
                        <div className="nav-popover-item-num">{chap.step}</div>
                        <div className="nav-popover-item-content">
                          <div className="nav-popover-item-title">
                            <span>{chap.label}</span>
                            <span className="nav-popover-hint" style={{ color: chap.badgeColor }}>
                              {chap.badge}
                            </span>
                          </div>
                          <div className="nav-popover-item-desc">{chap.desc}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Side: What is Deadlock Pill + Sleek Language Switcher + Minimalist Burger Button */}
        <div className="navbar-actions">
          {/* Direct "C'est quoi Deadlock & le Projet ?" Trigger in Top Navigation */}
          <button
            type="button"
            className="navbar-about-btn"
            onClick={openAboutModal}
            aria-label={lang === 'fr' ? 'Découvrir Deadlock & le projet' : 'What is Deadlock & the project'}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
            </svg>
            <span>{lang === 'fr' ? 'Deadlock & Projet' : 'Deadlock & Project'}</span>
          </button>

          {/* Minimalist Lang Toggle */}
          <button
            type="button"
            className="lang-toggle-minimal"
            onClick={toggleLanguage}
            aria-label={t('nav.langToggle.ariaLabel', lang)}
            title={lang === 'fr' ? 'Switch to English' : 'Passer en Français'}
          >
            <span className={lang === 'fr' ? 'lang-text-active' : 'lang-text-inactive'}>FR</span>
            <span className="lang-text-sep">/</span>
            <span className={lang === 'en' ? 'lang-text-active' : 'lang-text-inactive'}>EN</span>
          </button>

          {/* 3-Line Minimal Hamburger Menu Button */}
          <button
            type="button"
            className="burger-menu-btn"
            onClick={() => setBurgerOpen(!burgerOpen)}
            aria-expanded={burgerOpen}
            aria-label={burgerOpen ? t('nav.menu.close', lang) : t('nav.menu.open', lang)}
            title={burgerOpen ? t('nav.menu.close', lang) : t('nav.menu.open', lang)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              {burgerOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Slide-over Burger Menu Drawer */}
      {burgerOpen && (
        <div className="burger-overlay">
          <div
            className="burger-backdrop"
            onClick={() => setBurgerOpen(false)}
            aria-hidden="true"
          />

          <aside className="burger-drawer" ref={burgerDrawerRef} role="dialog" aria-modal="true" aria-label={isFr ? 'Menu principal' : 'Main menu'}>
            {/* Header */}
            <div className="burger-drawer-header">
              <div className="burger-brand-row">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="burger-flame-icon">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                </svg>
                <span className="burger-drawer-title">{lang === 'fr' ? 'Navigation & Outils' : 'Navigation & Tools'}</span>
              </div>
              <button
                type="button"
                className="burger-drawer-close"
                onClick={() => setBurgerOpen(false)}
                aria-label={isFr ? 'Fermer' : 'Close'}
              >
                ✕
              </button>
            </div>

            <div className="burger-drawer-body">
              {/* 0. Quick View Switcher (Principal vs Hero Dynamics vs ITEM) */}
              <div className="burger-section">
                <span className="burger-section-label">
                  {isFr ? 'Espaces du Site (3 Espaces)' : 'Site Workspaces (3 Spaces)'}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="burger-card-btn"
                    style={{
                      borderColor: activePage === 'main' ? 'var(--accent-emerald)' : 'var(--border-subtle)',
                      background: activePage === 'main' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)'
                    }}
                    onClick={(e) => handleMainSectionClick(e, '#hero')}
                  >
                    <div className="burger-card-header">
                      {activePage === 'main' && <span className="nav-tab-dot" aria-hidden="true" />}
                      <div className="burger-card-titles">
                        <span className="burger-card-title">{t('nav.tabs.main', lang)}</span>
                        <span className="burger-card-sub">{t('nav.tabs.mainSub', lang)}</span>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="burger-card-btn"
                    style={{
                      borderColor: activePage === 'items-lab' ? 'var(--accent-emerald)' : 'var(--border-subtle)',
                      background: activePage === 'items-lab' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)'
                    }}
                    onClick={(e) => handleLabClick(e, null)}
                  >
                    <div className="burger-card-header">
                      {activePage === 'items-lab' && <span className="nav-tab-dot" aria-hidden="true" />}
                      <div className="burger-card-titles">
                        <span className="burger-card-title">
                          {t('nav.tabs.itemsLab', lang)}
                        </span>
                        <span className="burger-card-sub">{t('nav.tabs.itemsLabSub', lang)}</span>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="burger-card-btn"
                    style={{
                      borderColor: activePage === 'items' ? 'var(--accent-emerald)' : 'var(--border-subtle)',
                      background: activePage === 'items' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)'
                    }}
                    onClick={(e) => handleItemClick(e, null)}
                  >
                    <div className="burger-card-header">
                      {activePage === 'items' && <span className="nav-tab-dot" aria-hidden="true" />}
                      <div className="burger-card-titles">
                        <span className="burger-card-title">
                          {t('nav.tabs.itemTab', lang)}
                        </span>
                        <span className="burger-card-sub">{t('nav.tabs.itemTabSub', lang)}</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* 1. About Deadlock & Project Purpose Card */}
              <div className="burger-section">
                <span className="burger-section-label">
                  {lang === 'fr' ? 'Nouveau sur Deadlock ?' : 'New to Deadlock?'}
                </span>
                <button
                  type="button"
                  className="burger-card-btn burger-about-card"
                  onClick={() => {
                    setBurgerOpen(false);
                    openAboutModal();
                  }}
                >
                  <div className="burger-card-header">
                    <div className="burger-card-titles">
                      <span className="burger-card-title">{t('aboutModal.triggerBurger', lang)}</span>
                      <span className="burger-card-sub">
                        {t('aboutModal.triggerBurgerSub', lang)}
                      </span>
                    </div>
                  </div>
                  <span className="burger-card-arrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>{lang === 'fr' ? 'Découvrir en 1 min' : 'Discover in 1 min'}</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </button>
              </div>

              {/* 2. Interactive Dictionary Card */}
              <div className="burger-section">
                <span className="burger-section-label">
                  {lang === 'fr' ? 'Lexique & Définitions' : 'Glossary & Definitions'}
                </span>
                <button
                  type="button"
                  className="burger-card-btn burger-dict-card nav-link-dictionary"
                  onClick={() => {
                    setBurgerOpen(false);
                    openDictionary();
                  }}
                >
                  <div className="burger-card-header">
                    <div className="burger-card-titles">
                      <span className="burger-card-title">{t('dictionary.title', lang)}</span>
                      <span className="burger-card-sub">
                        {lang === 'fr' ? `${DICTIONARY_TOTAL_COUNT} termes e-sport & ML définis` : `${DICTIONARY_TOTAL_COUNT} gaming & ML terms defined`}
                      </span>
                    </div>
                  </div>
                  <span className="burger-card-arrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>{lang === 'fr' ? 'Consulter le lexique' : 'Open glossary'}</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </button>
              </div>

              {/* 3. Interactive ML Demo & Backend Status */}
              <div className="burger-section">
                <span className="burger-section-label">
                  {lang === 'fr' ? 'Moteur Prédictif ML' : 'ML Prediction Engine'}
                </span>
                <div className="burger-status-card">
                  <div className="burger-status-top">
                    <div className="burger-status-indicator">
                      <span className={`status-dot ${isOnline ? 'status-dot-green' : isChecking ? 'status-dot-checking' : 'status-dot-amber'}`} />
                      <span className="burger-status-name">
                        {isOnline
                          ? t('nav.status.online', lang)
                          : isChecking
                          ? t('nav.status.checking', lang)
                          : t('nav.status.offline', lang)}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={`btn-status-refresh-mini ${isRefreshing ? 'is-loading' : ''}`}
                      onClick={handleRefreshConnection}
                      disabled={isRefreshing}
                      title={t('backendStatus.popover.refreshButton', lang)}
                      aria-label={isFr ? 'Rafraîchir la connexion' : 'Refresh connection'}
                    >
                      <svg className={`refresh-icon ${isRefreshing ? 'animate-spin' : ''}`} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M23 4v6h-6M1 20v-6h6" />
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                      </svg>
                    </button>
                  </div>

                  <p className="burger-status-desc">
                    {isOnline
                      ? t('backendStatus.popover.onlineDesc', lang)
                      : t('backendStatus.popover.offlineDesc', lang)}
                  </p>

                  <div className="burger-status-meta">
                    <div className="burger-meta-item">
                      <span className="burger-meta-k">{t('backendStatus.popover.portLabel', lang)}</span>
                      <span className="burger-meta-v">{isOnline ? (statusInfo.port || '8000') : (isFr ? 'Démo locale' : 'Local Demo')}</span>
                    </div>
                    <div className="burger-meta-item">
                      <span className="burger-meta-k">{isFr ? 'Modèle' : 'Model'}</span>
                      <span className="burger-meta-v">Gradient Boosting (36/106f)</span>
                    </div>
                  </div>

                  {!isOnline && (
                    <div className="burger-quickstart-box" onClick={() => handleCopyCmd(quickstartCommand)} title={isFr ? 'Cliquer pour copier' : 'Click to copy'}>
                      <code>{quickstartCommand}</code>
                      <span className="burger-quickstart-tag">{copiedCmd ? (isFr ? '✓ Copié' : '✓ Copied') : (isFr ? 'Copier' : 'Copy')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Section Navigation Links (for tablet/mobile & quick jump across all 3 pages) */}
              <div className="burger-section burger-nav-section">
                <span className="burger-section-label">
                  {lang === 'fr' ? 'Sections — Onglet Principal' : 'Sections — Main Study'}
                </span>
                <nav className="burger-nav-list" aria-label={isFr ? 'Navigation Mobile Page 1' : 'Mobile Navigation Page 1'}>
                  {mainStudySections.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={(e) => handleMainSectionClick(e, item.href)}
                      className="burger-nav-link"
                    >
                      <span>{item.step}. {item.label}</span>
                      <span className="burger-nav-arrow" aria-hidden="true">↗</span>
                    </a>
                  ))}
                </nav>
              </div>

              <div className="burger-section burger-nav-section">
                <span className="burger-section-label">
                  {isFr ? 'Chapitres — Dynamique Héros & Churn' : 'Chapters — Hero Dynamics & Churn'}
                </span>
                <nav className="burger-nav-list" aria-label={isFr ? 'Navigation Mobile Page 2' : 'Mobile Navigation Page 2'}>
                  {labChapters.map((chap) => (
                    <a
                      key={chap.href}
                      href={chap.href}
                      onClick={(e) => handleLabClick(e, chap.href)}
                      className="burger-nav-link"
                    >
                      <span>{chap.step}. {chap.label}</span>
                      <span className="burger-nav-arrow" aria-hidden="true">↗</span>
                    </a>
                  ))}
                </nav>
              </div>

              <div className="burger-section burger-nav-section">
                <span className="burger-section-label">
                  {isFr ? 'Chapitres — Espace Équipements' : 'Chapters — Item & Build Telemetry'}
                </span>
                <nav className="burger-nav-list" aria-label={isFr ? 'Navigation Mobile Page 3' : 'Mobile Navigation Page 3'}>
                  {itemChapters.map((chap) => (
                    <a
                      key={chap.href}
                      href={chap.href}
                      onClick={(e) => handleItemClick(e, chap.href)}
                      className="burger-nav-link"
                    >
                      <span>{chap.step}. {chap.label}</span>
                      <span className="burger-nav-arrow" aria-hidden="true">↗</span>
                    </a>
                  ))}
                </nav>
              </div>
            </div>

            {/* Footer */}
            <div className="burger-drawer-footer">
              <div className="burger-social-row">
                <a
                  href="https://www.linkedin.com/in/matthieu-gout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="burger-social-link"
                  aria-label={t('nav.linkedin.label', lang)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
                <a
                  href="https://github.com/ofggout880"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="burger-social-link"
                  aria-label={t('nav.github.label', lang)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>GitHub</span>
                </a>
              </div>
              <button
                type="button"
                className="burger-lang-btn"
                onClick={toggleLanguage}
              >
                {lang === 'fr' ? 'EN — Switch to English' : 'Switch to French (FR)'}
              </button>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
