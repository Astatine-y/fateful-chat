'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import { i18n } from './LanguageProvider';

const languages = [
  { code: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'th', label: 'ไทย', flag: '🇹🇭' },
  { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
];

export function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState('zh-CN');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('i18nextLng') || 'zh-CN';
    setCurrentLang(saved);
    i18n.changeLanguage(saved);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
    setCurrentLang(langCode);
    setIsOpen(false);
  };

  const current = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <div className="language-switcher">
      <button 
        className="language-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flag">{current.flag}</span>
        <span className="label">{current.label}</span>
      </button>
      
      {isOpen && (
        <div className="language-dropdown">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`language-option ${lang.code === currentLang ? 'active' : ''}`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <span className="flag">{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .language-switcher {
          position: relative;
        }
        .language-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.875rem;
          color: white;
        }
        .flag {
          font-size: 1.25rem;
        }
        .language-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 4px;
          background: rgba(3, 0, 20, 0.95);
          border-radius: 8px;
          border: 1px solid rgba(124, 58, 237, 0.5);
          min-width: 160px;
          z-index: 50;
          overflow: hidden;
        }
        .language-option {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 14px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 0.875rem;
          text-align: left;
          color: white;
        }
        .language-option:hover {
          background: rgba(124, 58, 237, 0.3);
        }
        .language-option.active {
          background: rgba(124, 58, 237, 0.5);
        }
      `}</style>
    </div>
  );
}