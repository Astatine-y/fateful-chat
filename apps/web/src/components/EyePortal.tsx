'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { useTranslation } from 'react-i18next';

interface EyePortalProps {
  onSubmit: (data: {
    year: string;
    month: string;
    day: string;
    hour: string;
    gender: 'male' | 'female';
  }) => void;
  loading?: boolean;
}

export function EyePortal({ onSubmit, loading = false }: EyePortalProps) {
  const { t, i18n } = useTranslation();
  const [activeField, setActiveField] = useState<string | null>(null);
  
  const languages = [
    { code: 'zh-CN', label: '中' },
    { code: 'en', label: 'EN' },
    { code: 'ja', label: '日' },
    { code: 'ko', label: '한' },
    { code: 'es', label: 'ES' },
    { code: 'fr', label: 'FR' },
    { code: 'vi', label: 'VN' },
    { code: 'th', label: 'TH' },
    { code: 'id', label: 'ID' },
  ];
  
  const savedLang = typeof window !== 'undefined' ? localStorage.getItem('i18nextLng') || 'zh-CN' : 'zh-CN';
  const initialIndex = languages.findIndex(l => l.code === savedLang);
  const [langIndex, setLangIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  
  const toggleLanguage = () => {
    const nextIndex = (langIndex + 1) % languages.length;
    setLangIndex(nextIndex);
    const lang = languages[nextIndex].code;
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
    setActiveField(activeField ? null : 'lang');
  };
  
  const currentLang = languages[langIndex];
  
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  // Tick sound using Web Audio API
  const playTick = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    } catch (e) {
      // Silent fail
    }
  };

  const handleFieldFocus = (field: string) => {
    playTick();
    setActiveField(field);
  };

  const filledCount = () => {
    let count = 0;
    if (year) count++;
    if (month) count++;
    if (day) count++;
    if (hour) count++;
    if (gender) count++;
    return count;
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 99 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!year || !month || !day || !hour) return;
    onSubmit({ year, month, day, hour, gender });
  };

const allFieldsSelected = year && month && day && hour;
  
  return (
    <div className="eye-portal">
      <nav className="nav-bar">
        <Logo size="md" />
        <div className="nav-right">
          <button onClick={toggleLanguage} className="lang-toggle">
            {currentLang.label}
          </button>
          <Link href="/dashboard" className="nav-link">
            {t('dashboard', { defaultValue: 'Dashboard' })}
          </Link>
        </div>
      </nav>

      <div className="portal-container">
        <div className="eye-wrapper">
          {/* Eye outer ring */}
          <div className="eye-outer">
            {/* Iris with glow */}
            <div className={`iris ${activeField ? 'focused' : ''}`}>
              <div className="pupil">
                {/* Time machine selector ring */}
                <div className="selector-ring">
                  <div className="tick-marks">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="tick" style={{ transform: `rotate(${i * 30}deg)` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Eye reflection/glint */}
            <div className="eye-glint" />
          </div>

          {/* Input panel slides from bottom */}
          <div className={`input-panel ${activeField ? 'active' : ''}`}>
            {activeField === 'year' && (
              <div className="scroller year-scroller">
                <h3>{t('selectYear', { defaultValue: 'Select Year' })}</h3>
                <div className="scroll-track">
                  {years.map(y => (
                    <button
                      key={y}
                      className={`scroll-item ${year === String(y) ? 'selected' : ''}`}
                      onClick={() => {
                        playTick();
                        setYear(String(y));
                        setActiveField(null);
                      }}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeField === 'month' && (
              <div className="scroller month-scroller">
                <h3>{t('selectMonth', { defaultValue: 'Select Month' })}</h3>
                <div className="scroll-track">
                  {months.map(m => (
                    <button
                      key={m}
                      className={`scroll-item ${month === String(m) ? 'selected' : ''}`}
                      onClick={() => {
                        playTick();
                        setMonth(String(m));
                        setActiveField(null);
                      }}
                    >
                      {m}月
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeField === 'day' && (
              <div className="scroller day-scroller">
                <h3>{t('selectDay', { defaultValue: 'Select Day' })}</h3>
                <div className="scroll-track">
                  {days.map(d => (
                    <button
                      key={d}
                      className={`scroll-item ${day === String(d) ? 'selected' : ''}`}
                      onClick={() => {
                        playTick();
                        setDay(String(d));
                        setActiveField(null);
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeField === 'hour' && (
              <div className="scroller hour-scroller">
                <h3>{t('selectHour', { defaultValue: 'Select Hour' })}</h3>
                <div className="scroll-track">
                  {hours.map(h => (
                    <button
                      key={h}
                      className={`scroll-item ${hour === String(h) ? 'selected' : ''}`}
                      onClick={() => {
                        playTick();
                        setHour(String(h));
                        setActiveField(null);
                      }}
                    >
                      {h}:00
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeField === 'gender' && (
              <div className="scroller gender-scroller">
                <h3>{t('gender', { defaultValue: 'Select Gender' })}</h3>
                <div className="scroll-track">
                  <button
                    className={`scroll-item ${gender === 'male' ? 'selected' : ''}`}
                    onClick={() => {
                      playTick();
                      setGender('male');
                      setActiveField(null);
                    }}
                  >
                    ♂ 男
                  </button>
                  <button
                    className={`scroll-item ${gender === 'female' ? 'selected' : ''}`}
                    onClick={() => {
                      playTick();
                      setGender('female');
                      setActiveField(null);
                    }}
                  >
                    ♀ 女
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Field selection buttons around the eye */}
        <div className="field-selectors">
          <button
            className={`field-btn year ${activeField === 'year' ? 'active' : ''} ${year ? 'filled' : ''}`}
            style={{ '--angle': '0deg' } as any}
            onClick={() => handleFieldFocus('year')}
          >
            <span className="label">年</span>
            <span className="value">{year || '?'}</span>
          </button>

          <button
            className={`field-btn month ${activeField === 'month' ? 'active' : ''} ${month ? 'filled' : ''}`}
            style={{ '--angle': '60deg' } as any}
            onClick={() => handleFieldFocus('month')}
          >
            <span className="label">月</span>
            <span className="value">{month || '?'}</span>
          </button>

          <button
            className={`field-btn day ${activeField === 'day' ? 'active' : ''} ${day ? 'filled' : ''}`}
            style={{ '--angle': '120deg' } as any}
            onClick={() => handleFieldFocus('day')}
          >
            <span className="label">日</span>
            <span className="value">{day || '?'}</span>
          </button>

          <button
            className={`field-btn hour ${activeField === 'hour' ? 'active' : ''} ${hour ? 'filled' : ''}`}
            style={{ '--angle': '180deg' } as any}
            onClick={() => handleFieldFocus('hour')}
          >
            <span className="label">时</span>
            <span className="value">{hour || '?'}</span>
          </button>

          <button
            className={`field-btn gender ${activeField === 'gender' ? 'active' : ''} ${gender ? 'filled' : ''}`}
            style={{ '--angle': '240deg' } as any}
            onClick={() => handleFieldFocus('gender')}
          >
            <span className="label">性</span>
            <span className="value">{gender === 'male' ? '♂' : gender === 'female' ? '♀' : '?'}</span>
          </button>
        </div>

        {/* Reveal button */}
        <button
          className={`reveal-btn ${allFieldsSelected ? 'ready' : ''} ${loading ? 'loading' : ''}`}
          onClick={handleSubmit}
          disabled={!allFieldsSelected || loading}
        >
          {loading ? (
            <span className="loading-dots">
              <span>.</span><span>.</span><span>.</span>
            </span>
          ) : (
            <span className="btn-text">{t('reveal', { defaultValue: 'Reveal Your Destiny' })}</span>
          )}
        </button>

        {/* Progress ring */}
        <div className="progress-ring">
          <svg viewBox="0 0 100 100">
            <circle className="bg" cx="50" cy="50" r="45" />
            <circle 
              className="progress" 
              cx="50" 
              cy="50" 
              r="45"
              style={{
                strokeDasharray: `${(filledCount() / 5) * 283} 283`
              }} 
            />
          </svg>
        </div>
      </div>

      <style jsx>{`
        .eye-portal {
          min-height: 100vh;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        .nav-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          margin: -24px -24px 40px;
          background: rgba(3, 0, 20, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border);
          position: relative;
          z-index: 10;
        }
        
        .nav-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .lang-toggle {
          padding: 8px 12px;
          background: rgba(124, 58, 237, 0.3);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--cosmic-gold);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .lang-toggle:hover {
          background: rgba(124, 58, 237, 0.5);
          transform: scale(1.05);
        }

        .nav-link {
          color: var(--foreground);
          text-decoration: none;
          font-size: 0.9rem;
          opacity: 0.7;
        }

.portal-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 120px);
          padding: 20px 0;
        }

        .eye-wrapper {
          position: relative;
          width: 280px;
          height: 280px;
          margin-bottom: 40px;
        }

        .eye-outer {
          position: relative;
          width: 220px;
          height: 220px;
          margin: 0 auto 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(79, 70, 229, 0.3) 50%, rgba(124, 58, 237, 0.2) 100%);
          border: 3px solid rgba(167, 139, 250, 0.5);
          box-shadow: 
            0 0 60px rgba(124, 58, 237, 0.3),
            inset 0 0 60px rgba(124, 58, 237, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: eyePulse 4s ease-in-out infinite;
        }

        @keyframes eyePulse {
          0%, 100% { 
            box-shadow: 0 0 60px rgba(124, 58, 237, 0.3),
            inset 0 0 60px rgba(124, 58, 237, 0.2);
          }
          50% { 
            box-shadow: 0 0 80px rgba(124, 58, 237, 0.5),
            inset 0 0 80px rgba(124, 58, 237, 0.3);
          }
        }

        .iris {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: radial-gradient(circle at 40% 40%, 
            rgba(34, 211, 216, 0.8) 0%,
            rgba(124, 58, 237, 0.6) 40%,
            rgba(79, 70, 229, 0.8) 100%
          );
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.5s ease;
          box-shadow: 0 0 40px rgba(34, 211, 216, 0.5);
        }

        .iris.focused {
          transform: scale(1.1);
          box-shadow: 0 0 60px rgba(251, 191, 36, 0.6);
        }

        .pupil {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #030014 0%, #1a0a30 100%);
          box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .selector-ring {
          position: absolute;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 2px dashed rgba(167, 139, 250, 0.3);
          animation: rotateSlow 20s linear infinite;
        }

        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .tick-marks {
          position: absolute;
          inset: -5px;
        }

        .tick {
          position: absolute;
          width: 2px;
          height: 6px;
          background: rgba(167, 139, 250, 0.5);
          top: 0;
          left: 50%;
          transform-origin: 0 50px;
        }

        .eye-glint {
          position: absolute;
          top: 25%;
          left: 30%;
          width: 20px;
          height: 12px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          filter: blur(2px);
          animation: glintPulse 3s ease-in-out infinite;
        }

        @keyframes glintPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }

        .field-selectors {
          position: absolute;
          width: 320px;
          height: 320px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .field-btn {
          position: absolute;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(26, 22, 53, 0.9);
          border: 2px solid var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          transform: rotate(var(--angle)) translateY(-130px) rotate(calc(var(--angle) * -1));
        }

        .field-btn .label {
          font-size: 0.65rem;
          opacity: 0.6;
        }

        .field-btn .value {
          font-size: 1rem;
          font-weight: 700;
          color: var(--cosmic-gold);
        }

        .field-btn.filled {
          border-color: var(--accent);
          box-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
        }

        .field-btn:hover {
          transform: rotate(var(--angle)) translateY(-130px) rotate(calc(var(--angle) * -1)) scale(1.1);
        }

        .field-btn.active {
          border-color: var(--cosmic-gold);
          animation: fieldPulse 0.5s ease infinite;
        }

        @keyframes fieldPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.4); }
          50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.6); }
        }

        .input-panel {
          position: absolute;
          bottom: -300px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 320px;
          background: rgba(26, 22, 53, 0.95);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 20px;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 20;
        }

        .input-panel.active {
          bottom: -350px;
          box-shadow: 0 -20px 60px rgba(124, 58, 237, 0.3);
        }

        .scroller {
          max-height: 250px;
          overflow: hidden;
        }

        .scroller h3 {
          text-align: center;
          font-family: var(--font-display);
          margin-bottom: 16px;
          color: var(--cosmic-gold);
        }

        .scroll-track {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          max-height: 200px;
          overflow-y: auto;
        }

        .scroll-item {
          min-width: 60px;
          padding: 12px 16px;
          background: rgba(3, 0, 20, 0.5);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--foreground);
          cursor: pointer;
          transition: all 0.2s;
        }

        .scroll-item:hover {
          border-color: var(--accent);
        }

        .scroll-item.selected {
          background: var(--accent);
          border-color: var(--accent);
        }

        .gender-scroller {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        .reveal-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          width: 220px;
          padding: 20px 40px;
          background: rgba(26, 22, 53, 0.8);
          border: 2px solid var(--border);
          border-radius: 50px;
          color: var(--foreground);
          cursor: pointer;
          transition: all 0.4s ease;
          margin-top: 40px;
          z-index: 5;
        }

        .reveal-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .reveal-btn.ready {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.5) 0%, rgba(79, 70, 229, 0.6) 100%);
          border-color: var(--cosmic-gold);
          animation: readyPulse 2s ease-in-out infinite;
        }

        .reveal-btn.ready:hover {
          transform: scale(1.05);
          box-shadow: 0 0 40px rgba(251, 191, 36, 0.4);
        }

        @keyframes readyPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.3); }
          50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.5); }
        }

        .reveal-btn .zh {
          font-family: var(--font-display);
          font-size: 1.1rem;
        }

        .reveal-btn .en {
          font-size: 0.65rem;
          opacity: 0.6;
        }

        .loading-dots span {
          animation: dotPulse 1.4s infinite;
        }

        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.3; }
          40% { opacity: 1; }
        }

        .progress-ring {
          position: absolute;
          bottom: -60px;
          width: 60px;
          height: 60px;
        }

        .progress-ring svg {
          transform: rotate(-90deg);
        }

        .progress-ring circle {
          fill: none;
          stroke-width: 4;
        }

        .progress-ring .bg {
          stroke: rgba(61, 49, 102, 0.3);
        }

        .progress-ring .progress {
          stroke: var(--cosmic-gold);
          stroke-linecap: round;
          stroke-dasharray: ${(filledCount() / 5) * 283} 283;
          transition: stroke-dasharray 0.5s ease;
        }
      `}</style>
    </div>
  );
}

export default EyePortal;