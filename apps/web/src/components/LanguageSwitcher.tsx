'use client';

import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'zh-cn', label: '简体中文', flag: '🇨🇳' },
  { code: 'zh-tw', label: '繁體中文', flag: '🇹🇼' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'th', label: 'ไทย', flag: '🇹🇭' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState('en');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCurrentLang(i18n.language || 'en');
  }, [i18n.language]);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
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
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.875rem;
        }
        .flag {
          font-size: 1.25rem;
        }
        .language-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 4px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
        }
        .language-option:hover {
          background: #f3f4f6;
        }
        .language-option.active {
          background: #eff6ff;
          color: #2563eb;
        }
      `}</style>
    </div>
  );
}
