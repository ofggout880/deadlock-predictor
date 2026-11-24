import React, { useEffect, useRef } from 'react';
import { useDictionary } from '../context/DictionaryContext';
import GlossaryTerm from './GlossaryTerm';

/**
 * AboutDeadlockModal Component
 * Editorial overview explaining Deadlock gameplay, 3D shooter telemetry,
 * soul economy mechanics, and ML prediction objectives.
 */
export default function AboutDeadlockModal({ lang = 'fr', t, onGoToSimulator }) {
  const { isOpen, isAboutOpen, closeAboutModal, openDictionary } = useDictionary();
  const modalRef = useRef(null);
  const isFr = lang === 'fr';

  // Handle ESC key & scroll locking
  useEffect(() => {
    if (!isAboutOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isOpen) {
        closeAboutModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus on modal
    const focusTimer = setTimeout(() => {
      if (modalRef.current) {
        modalRef.current.focus();
      }
    }, 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      clearTimeout(focusTimer);
    };
  }, [isAboutOpen, isOpen, closeAboutModal]);

  if (!isAboutOpen) return null;

  const handleOpenDict = () => {
    openDictionary('deadlock');
  };

  const handleGoSimulator = () => {
    closeAboutModal();
    if (typeof onGoToSimulator === 'function') {
      onGoToSimulator();
      return;
    }
    const el = document.querySelector('#archetypes') || document.querySelector('#simulator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className="about-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAboutModal();
      }}
      role="presentation"
    >
      <div
        className="about-modal-dialog editorial-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-modal-title"
        ref={modalRef}
        tabIndex={-1}
      >
        {/* Header Bar */}
        <div className="editorial-modal-header">
          <div className="editorial-modal-header-left">
            <span className="editorial-modal-eyebrow">
              {t('aboutModal.eyebrow', lang)}
            </span>
            <h2 id="about-modal-title" className="editorial-modal-title">
              <span className="title-light">{t('aboutModal.titleLight', lang)} </span>
              <span className="title-bold">{t('aboutModal.titleBold', lang)}</span>
            </h2>
          </div>
          <button
            type="button"
            className="editorial-modal-close"
            onClick={closeAboutModal}
            aria-label={t('aboutModal.closeAria', lang)}
          >
            ✕
          </button>
        </div>

        {/* Continuous Editorial Essay Body */}
        <div className="editorial-modal-body">
          <p className="editorial-modal-lead">
            {t('aboutModal.lead', lang)}
          </p>

          <div className="editorial-modal-tags" role="list">
            <span className="editorial-tag-pill" role="listitem">Hero Shooter 6v6</span>
            <span className="editorial-tag-pill" role="listitem">{isFr ? 'Économie des Souls' : 'Soul Economy'}</span>
            <span className="editorial-tag-pill" role="listitem">{isFr ? 'Visée 3D & Headshots' : '3D Aim & Headshots'}</span>
            <span className="editorial-tag-pill" role="listitem">{isFr ? 'Gradient Boosting & Explicabilité' : 'Gradient Boosting & Explainability'}</span>
          </div>

          <div className="editorial-modal-prose">
            {/* Paragraph 1: Deadlock & Competitive Context */}
            {isFr ? (
              <p>
                Développé par <strong className="editorial-white">Valve Corporation</strong>, <GlossaryTerm termId="deadlock">Deadlock</GlossaryTerm> est un <strong className="editorial-orange">Hero Shooter tactique en 6 contre 6</strong> à la troisième personne combinant la complexité stratégique d&apos;un MOBA sur 4 lignes et la précision motrice d&apos;un jeu de tir 3D compétitif. Deux équipes de 6 héros s&apos;affrontent dans un univers occult-dieselpunk pour accumuler des <strong className="editorial-orange"><GlossaryTerm termId="souls">Souls (Âmes)</GlossaryTerm></strong>, détruire les <strong className="editorial-orange"><GlossaryTerm termId="guardians_walkers">Guardians et Walkers</GlossaryTerm></strong>, livrer la <strong className="editorial-orange"><GlossaryTerm termId="urn">Soul Urn</GlossaryTerm></strong>, et vaincre l&apos;entité finale : <strong className="editorial-white"><GlossaryTerm termId="patron">Le Patron</GlossaryTerm></strong>.
              </p>
            ) : (
              <p>
                Developed by <strong className="editorial-white">Valve Corporation</strong>, <GlossaryTerm termId="deadlock">Deadlock</GlossaryTerm> is a tactical <strong className="editorial-orange">6v6 third-person Hero Shooter</strong> marrying multi-lane strategic depth with fast-twitch 3D gunplay. Two six-player squads clash in an occult dieselpunk setting to farm <strong className="editorial-orange"><GlossaryTerm termId="souls">Souls</GlossaryTerm></strong>, breach outer <strong className="editorial-orange"><GlossaryTerm termId="guardians_walkers">Guardians and Walkers</GlossaryTerm></strong>, capture the neutral <strong className="editorial-orange"><GlossaryTerm termId="urn">Soul Urn</GlossaryTerm></strong>, and dismantle the opposing titan: <strong className="editorial-white"><GlossaryTerm termId="patron">The Patron</GlossaryTerm></strong>.
              </p>
            )}

            {/* Minimalist Unboxed Sequence Diagram */}
            <div className="editorial-sequence-strip" aria-label={isFr ? "Chaîne causale de la défaite et du tilt" : "Defeat and tilt causal sequence"}>
              <div className="seq-step">
                <span className="seq-num">01</span>
                <span className="seq-label">{isFr ? 'Perte Guardian & Retard Souls' : 'Guardian Breached & Soul Deficit'}</span>
              </div>
              <span className="seq-arrow" aria-hidden="true">→</span>
              <div className="seq-step">
                <span className="seq-num">02</span>
                <span className="seq-label">{isFr ? 'Chute de Précision (-35% Aim)' : 'Aim Collapse (-35% Headshots)'}</span>
              </div>
              <span className="seq-arrow" aria-hidden="true">→</span>
              <div className="seq-step seq-step-alert">
                <span className="seq-num">03</span>
                <span className="seq-label">{isFr ? 'Spirale de Morts & Tilt Aigu' : 'Death Streak & Acute Tilt'}</span>
              </div>
              <span className="seq-arrow" aria-hidden="true">→</span>
              <div className="seq-step seq-step-danger">
                <span className="seq-num">04</span>
                <span className="seq-label">{isFr ? 'Décrochage & Churn Joueur' : 'Session Quit & Player Churn'}</span>
              </div>
            </div>

            {/* Paragraph 2: Machine Learning Objectives */}
            {isFr ? (
              <p>
                Ce projet modélise <strong className="editorial-orange">106 signaux comportementaux purs en partie</strong> (dont <strong className="editorial-white">36 variables optimales</strong>) extraits des replays du moteur 3D Source 2 : dégradation de la visée 3D, vulnérabilité aux tirs à la tête sous étourdissement (<GlossaryTerm termId="cc_stun"><em>Stun</em></GlossaryTerm>), reventes paniques en boutique, isolement en solo et temps passé mort devant un <GlossaryTerm termId="grey_screen">écran gris</GlossaryTerm>. Notre modèle champion (<strong className="editorial-white">Gradient Boosting régularisé</strong>, 74,7 % <GlossaryTerm termId="roc_auc">ROC-AUC</GlossaryTerm>) identifie dès la fin d&apos;un match <strong className="editorial-orange">73,2 % des joueurs à risque d&apos;abandon à 14 jours (<GlossaryTerm termId="churn">Churn</GlossaryTerm>)</strong> au seuil calibré <strong className="editorial-white"><GlossaryTerm termId="threshold">θ* = 0,225</GlossaryTerm></strong>, permettant au studio de déclencher des mesures préventives bienveillantes sans jamais truquer l&apos;équité sportive.
              </p>
            ) : (
              <p>
                This study models <strong className="editorial-orange">106 pure in-game behavioral features</strong> (distilled to <strong className="editorial-orange">36 optimal signals</strong>) extracted from <strong className="editorial-white">8,625 Source-2-enriched windows</strong>, including <strong className="editorial-orange">7 Hidden Gems</strong> such as solo-queue isolation streaks, headshots taken while <GlossaryTerm termId="cc_stun">stunned</GlossaryTerm>, passive <GlossaryTerm termId="grey_screen">grey-screen</GlossaryTerm> death time, and late-game inventory panic-selling. Our regularized <strong className="editorial-white">Gradient Boosting</strong> pipeline predicts <strong className="editorial-orange"><GlossaryTerm termId="churn">14-day player churn</GlossaryTerm></strong> (<strong className="editorial-orange">74.7% <GlossaryTerm termId="roc_auc">ROC-AUC</GlossaryTerm></strong>, <strong className="editorial-orange">73.2% recall</strong> at <strong className="editorial-white"><GlossaryTerm termId="threshold">θ* = 0.225</GlossaryTerm></strong>, zero calendar leakage), empowering game studios to deploy ethical, non-punitive matchmaking interventions without ever rigging match outcomes.
              </p>
            )}

            {/* Practical Purpose Grid */}
            <div className="editorial-purpose-box">
              <div className="editorial-purpose-header">
                <span className="editorial-purpose-badge">{isFr ? 'VALEUR OPÉRATIONNELLE' : 'OPERATIONAL VALUE'}</span>
                <h3 className="editorial-purpose-title">{isFr ? 'Applications Concrètes pour les Studios de Jeux' : 'Actionable Applications for Game Studios'}</h3>
              </div>

              <div className="editorial-purpose-grid">
                <div className="editorial-purpose-item">
                  <div className="editorial-purpose-bullet">
                    <span className="purpose-num">01</span>
                    <strong className="purpose-item-title">{isFr ? 'Économie des Souls & Équilibrage' : 'Soul Economy Balancing'}</strong>
                  </div>
                  <p className="purpose-item-text">{isFr ? "Identifier les seuils d'âmes critiques où le retour devient mathématiquement impossible." : "Identify critical soul delta thresholds where comeback trajectories become mathematically improbable."}</p>
                </div>

                <div className="editorial-purpose-item">
                  <div className="editorial-purpose-bullet">
                    <span className="purpose-num">02</span>
                    <strong className="purpose-item-title">{isFr ? 'Détection Préventive du Tilt' : 'Early Tilt Mitigation'}</strong>
                  </div>
                  <p className="purpose-item-text">{isFr ? "Détecter les chutes d'adresse motrice et éviter d'apparier ensemble des joueurs en spirale de défaite." : "Detect motor aim degradation and prevent pairing multiple tilted players in the same lobby."}</p>
                </div>

                <div className="editorial-purpose-item">
                  <div className="editorial-purpose-bullet">
                    <span className="purpose-num">03</span>
                    <strong className="purpose-item-title">{isFr ? 'Matchmaking Éthique et Transparent' : 'Ethical Matchmaking'}</strong>
                  </div>
                  <p className="purpose-item-text">{isFr ? "Préserver l'équité 50/50 tout en recommandant des temps de pause lors des sessions prolongées." : "Preserve 50/50 sports integrity while suggesting healthy session breaks after punishing defeat streaks."}</p>
                </div>
              </div>
            </div>
          </div>

          <blockquote className="editorial-modal-quote">
            <p>
              {isFr
                ? "« Dans un hero shooter 3D, la frustration se lit d'abord dans le réticule de visée avant de se traduire par la désinstallation du jeu. »"
                : "“In a 3D hero shooter, frustration manifests in the crosshair long before it leads to game uninstallation.”"}
            </p>
          </blockquote>
        </div>

        {/* Clean Editorial Footer Actions */}
        <div className="editorial-modal-footer">
          <div className="editorial-modal-actions-left">
            <button
              type="button"
              className="editorial-link-btn"
              onClick={handleOpenDict}
            >
              {isFr ? 'Consulter le Dictionnaire' : 'Open Glossary'}
            </button>
            <button
              type="button"
              className="editorial-link-btn"
              onClick={handleGoSimulator}
            >
              {isFr ? 'Tester le Simulateur' : 'Launch Simulator'}
            </button>
          </div>
          <button
            type="button"
            className="editorial-close-btn-text"
            onClick={closeAboutModal}
          >
            {isFr ? 'Fermer' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
