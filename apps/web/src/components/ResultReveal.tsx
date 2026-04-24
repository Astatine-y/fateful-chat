import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface BaziResult {
  bazi: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  interpretation: string;
  wu_xing?: string[];
  shi_shen?: string[];
}

interface ResultRevealProps {
  result: BaziResult;
  onClose: () => void;
}

export function ResultReveal({ result, onClose }: ResultRevealProps) {
  const { t, i18n } = useTranslation();
  const [phase, setPhase] = useState<'opening' | 'reading' | 'revealed'>('opening');
  const [revealProgress, setRevealProgress] = useState(0);
  
  const pillarKeys = ['yearPillar', 'monthPillar', 'dayPillar', 'hourPillar'];

  useEffect(() => {
    // Phase 1: Eye opens
    setTimeout(() => setPhase('reading'), 500);
    
    // Phase 2: Reading shows
    setTimeout(() => {
      setPhase('revealed');
      // Animate reveal progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setRevealProgress(progress);
        if (progress >= 100) clearInterval(interval);
      }, 30);
    }, 1500);
  }, []);

  const pillars = pillarKeys.map((key, index) => ({
    label: t(key),
    value: Object.values(result.bazi)[index]
  }));

  return (
    <div className="result-reveal">
      <div className={`eye-opened ${phase === 'opening' ? '' : 'opened'}`}>
        <div className="eye-glow" />
        
        {/* Light burst effect */}
        {phase === 'reading' && (
          <div className="light-burst" />
        )}

        {/* Four pillars emerge */}
        {phase === 'revealed' && (
          <div className="pillars-container">
            {pillars.map((pillar, index) => (
              <div 
                key={pillar.label}
                className="pillar-card"
                style={{
                  '--delay': `${index * 0.15}s`,
                  transform: `translateY(${revealProgress < (index + 1) * 25 ? 50 : 0}px)`,
                  opacity: revealProgress >= (index + 1) * 25 ? 1 : 0,
                } as any}
              >
                <div className="pillar-label">
                  {pillar.label}
                </div>
                <div className="pillar-value">{pillar.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interpretation reads out */}
      {phase === 'revealed' && (
        <div className="interpretation-section">
          <div className="scan-line" />
          <h3>◈ {t('aiInterpretation', { defaultValue: 'AI解读' })}</h3>
          <div className="interpretation-text">
            {result.interpretation}
          </div>
        </div>
      )}

      {/* Close / Throw back button */}
      {phase === 'revealed' && (
        <button className="throw-btn" onClick={onClose}>
          {t('exploreAgain', { defaultValue: '再探命运' })}
        </button>
      )}

      <style jsx>{`
        .result-reveal {
          position: fixed;
          inset: 0;
          background: rgba(3, 0, 20, 0.98);
          z-index: 100;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .eye-opened {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, 
            rgba(251, 191, 36, 0.9) 0%,
            rgba(234, 179, 8, 0.6) 30%,
            rgba(124, 58, 237, 0.3) 60%,
            rgba(3, 0, 20, 0) 100%
          );
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: eyeOpen 0.5s ease;
          box-shadow: 0 0 100px rgba(251, 191, 36, 0.5);
        }

        @keyframes eyeOpen {
          0% { 
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          100% { 
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        .eye-opened.opened {
          animation: eyeClose 0.5s ease forwards;
        }

        @keyframes eyeClose {
          0% { transform: scale(1); }
          100% { transform: scale(0.8); opacity: 0; }
        }

        .eye-glow {
          position: absolute;
          inset: -20px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%);
          animation: glowPulse 2s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }

        .light-burst {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: white;
          animation: burst 0.8s ease-out forwards;
        }

        @keyframes burst {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(3); opacity: 0; }
        }

        .pillars-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .pillar-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 20px;
          background: rgba(26, 22, 53, 0.9);
          border: 1px solid var(--border);
          border-radius: 20px;
          min-width: 140px;
          animation: pillarReveal 0.5s ease forwards;
          animation-delay: var(--delay);
          opacity: 0;
        }

        @keyframes pillarReveal {
          0% { 
            transform: translateY(50px) scale(0.8); 
            opacity: 0; 
          }
          100% { 
            transform: translateY(0) scale(1); 
            opacity: 1; 
          }
        }

        .pillar-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 8px;
        }

        .pillar-label .zh {
          font-family: var(--font-display);
          font-size: 0.85rem;
          color: var(--cosmic-gold);
        }

        .pillar-label .en {
          font-size: 0.6rem;
          opacity: 0.5;
        }

        .pillar-value {
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 700;
          color: #fff;
          text-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
        }

        .interpretation-section {
          margin-top: 40px;
          max-width: 500px;
          width: 100%;
          position: relative;
        }

        .interpretation-section h3 {
          font-size: 1rem;
          color: var(--accent);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .scan-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            var(--accent) 50%, 
            transparent 100%
          );
          animation: scanMove 2s linear infinite;
        }

        @keyframes scanMove {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .interpretation-text {
          padding: 20px;
          background: rgba(26, 22, 53, 0.6);
          border: 1px solid var(--border);
          border-radius: 16px;
          font-size: 0.9rem;
          line-height: 1.8;
          max-height: 250px;
          overflow-y: auto;
          animation: textReveal 1s ease 0.5s forwards;
          opacity: 0;
        }

        @keyframes textReveal {
          to { opacity: 1; }
        }

        .throw-btn {
          margin-top: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 14px 32px;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 30px;
          color: var(--foreground);
          cursor: pointer;
          transition: all 0.3s;
        }

        .throw-btn:hover {
          background: rgba(124, 58, 237, 0.2);
          border-color: var(--accent);
          transform: translateY(-2px);
        }

        .throw-btn .zh {
          font-family: var(--font-display);
          font-size: 1rem;
        }

        .throw-btn .en {
          font-size: 0.65rem;
          opacity: 0.5;
        }

        @media (max-width: 480px) {
          .pillars-container {
            grid-template-columns: 1fr;
          }
          
          .pillar-card {
            min-width: 120px;
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}

export default ResultReveal;