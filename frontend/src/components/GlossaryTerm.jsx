import React from 'react';
import { useDictionary } from '../context/DictionaryContext';
import { findDictionaryTerm } from '../data/dictionaryData';

/**
 * Interactive In-Text Glossary Term Component
 * Renders an inline clickable term with subtle hover cues and amber dotted underline.
 * Clicking opens the right slide-over dictionary drawer and scrolls to the definition.
 */
export default function GlossaryTerm({
  termId,
  children,
  className = '',
  title,
  lang: propLang
}) {
  const { openDictionary, lang: ctxLang } = useDictionary();
  const termInfo = findDictionaryTerm(termId);
  const activeLang = propLang || ctxLang || (typeof document !== 'undefined' && document.documentElement?.lang === 'en' ? 'en' : 'fr');
  const isFr = activeLang === 'fr';

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openDictionary(termId);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      openDictionary(termId);
    }
  };

  const displayTitle =
    title ||
    (termInfo
      ? (isFr ? `Dictionnaire : ${termInfo.termFr}` : `Glossary: ${termInfo.termEn || termInfo.termFr}`)
      : (isFr ? 'Voir la définition dans le dictionnaire' : 'View definition in glossary'));

  const sparkle = <span className="glossary-term-sparkle" aria-hidden="true">✦</span>;
  const renderLabel = () => {
    if (typeof children !== 'string') {
      return (
        <>
          <span className="glossary-term-text">{children}</span>
          {sparkle}
        </>
      );
    }
    const lastSpaceIdx = children.lastIndexOf(' ');
    if (lastSpaceIdx === -1) {
      return (
        <span className="glossary-term-text" style={{ whiteSpace: 'nowrap' }}>
          {children}
          {sparkle}
        </span>
      );
    }
    return (
      <span className="glossary-term-text">
        {children.slice(0, lastSpaceIdx + 1)}
        <span style={{ whiteSpace: 'nowrap' }}>
          {children.slice(lastSpaceIdx + 1)}
          {sparkle}
        </span>
      </span>
    );
  };

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`glossary-term ${className}`}
      title={displayTitle}
      data-term-id={termId}
    >
      {renderLabel()}
    </span>
  );
}
