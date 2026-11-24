import React, { useState, useEffect } from 'react';
import { useDictionary } from '../context/DictionaryContext';

export default function WelcomeDictionaryToast({ lang = 'fr', t }) {
  const [visible, setVisible] = useState(false);
  const { openDictionary, openAboutModal } = useDictionary();
  const isFr = lang === 'fr';

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem('deadlock_dict_hint_dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem('deadlock_dict_hint_dismissed', 'true');
    } catch {}
  };

  const handleOpenDict = () => {
    handleDismiss();
    openDictionary();
  };

  if (!visible) return null;

  return (
    <aside className="welcome-dict-toast" role="dialog" aria-live="polite" aria-label="Aide dictionnaire">
      <div className="welcome-dict-toast-content">
        <div className="welcome-dict-toast-header">
          <div className="welcome-dict-toast-title-row">
            <span className="welcome-dict-toast-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </span>
            <strong>{isFr ? 'Dictionnaire & Lexique interactif' : 'Interactive Glossary & Terms'}</strong>
          </div>
          <button
            type="button"
            className="welcome-dict-toast-close"
            onClick={handleDismiss}
            aria-label={isFr ? 'Fermer' : 'Close'}
          >
            ✕
          </button>
        </div>

        <p className="welcome-dict-toast-text">
          {isFr ? (
            <>
              Retrouvez toutes les définitions dans le <strong>menu burger (≡)</strong>. De plus, tous les mots soulignés en <strong>pointillés</strong> dans l'étude sont cliquables pour afficher leur explication instantanée.
            </>
          ) : (
            <>
              Access the complete glossary from the <strong>burger menu (≡)</strong>. All terms styled with <strong>dotted underlines</strong> can also be clicked directly for instant explanations.
            </>
          )}
        </p>

        <button
          type="button"
          className="welcome-dict-btn-deadlock"
          onClick={() => {
            handleDismiss();
            openAboutModal();
          }}
        >
          {t('aboutModal.triggerToast', lang) || (isFr ? 'Nouveau sur Deadlock ? Comprendre le jeu en 1 min →' : 'New to Deadlock? Learn the game in 1 min →')}
        </button>

        <div className="welcome-dict-toast-actions">
          <button
            type="button"
            className="welcome-dict-btn-open"
            onClick={handleOpenDict}
          >
            {isFr ? 'Consulter le lexique →' : 'Explore glossary →'}
          </button>
          <button
            type="button"
            className="welcome-dict-btn-dismiss"
            onClick={handleDismiss}
          >
            {isFr ? 'Compris' : 'Dismiss'}
          </button>
        </div>
      </div>
    </aside>
  );
}
