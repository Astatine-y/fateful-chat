'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStripe, useElements, CardElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface BaziData {
  year: string;
  month: string;
  day: string;
  hour: string;
}

interface BaziResult {
  bazi: BaziData;
  interpretation: string;
  creditsRemaining: number;
}

function BaziForm() {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [longitude, setLongitude] = useState('120');
  const [latitude, setLatitude] = useState('30');
  const [result, setResult] = useState<BaziResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCta, setShowCta] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [emailCapture, setEmailCapture] = useState('');
  const [emailCaptured, setEmailCaptured] = useState(false);

  const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowCta(false);

    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/bazi', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          year: parseInt(year, 10),
          month: parseInt(month, 10),
          day: parseInt(day, 10),
          hour: parseInt(hour, 10),
          longitude: parseFloat(longitude),
          latitude: parseFloat(latitude),
          gender,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429 && data.upgrade) {
          setShowCta(true);
        }
        throw new Error(data.error || 'Failed to calculate bazi');
      }

      setResult(data.data);
      if (data.data?.freeDaily && !isLoggedIn) {
        setShowEmailCapture(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 99 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="bazi-page">
      <nav className="nav-bar">
        <Link href="/" className="nav-logo">☯ FATEFUL</Link>
        <Link href="/dashboard" className="nav-link">控制台</Link>
      </nav>

      <div className="bazi-container">
        <div className="form-section">
          <div className="section-header">
            <div className="symbol">☰</div>
            <h1>生命代码解析</h1>
            <p className="subtitle">Life Code Analysis</p>
          </div>

          <form onSubmit={handleSubmit} className="cosmic-form">
            <div className="input-row">
              <div className="input-group">
                <label>出生年份</label>
                <select value={year} onChange={(e) => setYear(e.target.value)} required>
                  <option value="">选择年份</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>出生月份</label>
                <select value={month} onChange={(e) => setMonth(e.target.value)} required>
                  <option value="">选择月份</option>
                  {months.map(m => <option key={m} value={m}>{m}月</option>)}
                </select>
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>出生日期</label>
                <select value={day} onChange={(e) => setDay(e.target.value)} required>
                  <option value="">选择日期</option>
                  {days.map(d => <option key={d} value={d}>{d}日</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>出生时辰</label>
                <select value={hour} onChange={(e) => setHour(e.target.value)} required>
                  <option value="">选择时辰</option>
                  {hours.map(h => <option key={h} value={h}>{h}:00</option>)}
                </select>
              </div>
            </div>

            <div className="input-row single">
              <div className="input-group gender">
                <label>性别</label>
                <div className="gender-toggle">
                  <button
                    type="button"
                    className={gender === 'male' ? 'active' : ''}
                    onClick={() => setGender('male')}
                  >
                    <span className="gender-icon">♂</span>
                    <span>男</span>
                  </button>
                  <button
                    type="button"
                    className={gender === 'female' ? 'active' : ''}
                    onClick={() => setGender('female')}
                  >
                    <span className="gender-icon">♀</span>
                    <span>女</span>
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <span className="loading">解析中...</span>
              ) : (
                <>
                  <span className="zh">开启生命密码</span>
                  <span className="en">Reveal Your Code</span>
                </>
              )}
            </button>
          </form>

          {error && <div className="error-message">{error}</div>}
          
          {showCta && (
            <div className="cta-banner">
              <p>今日免费次数已用完</p>
              <Link href="/auth/register" className="cta-button">创建账户获取5免费积分</Link>
            </div>
          )}
        </div>

        {result && (
          <div className="result-section">
            <div className="four-pillars">
              <h2 className="pillars-title">
                <span className="zh">四柱八字</span>
                <span className="en">Four Pillars</span>
              </h2>
              
              <div className="pillars-grid">
                <div className="pillar year">
                  <div className="pillar-label">年柱</div>
                  <div className="pillar-value">{result.bazi.year}</div>
                  <div className="pillar-en">Year Pillar</div>
                </div>
                <div className="pillar month">
                  <div className="pillar-label">月柱</div>
                  <div className="pillar-value">{result.bazi.month}</div>
                  <div className="pillar-en">Month Pillar</div>
                </div>
                <div className="pillar day">
                  <div className="pillar-label">日柱</div>
                  <div className="pillar-value">{result.bazi.day}</div>
                  <div className="pillar-en">Day Pillar</div>
                </div>
                <div className="pillar hour">
                  <div className="pillar-label">时柱</div>
                  <div className="pillar-value">{result.bazi.hour}</div>
                  <div className="pillar-en">Hour Pillar</div>
                </div>
              </div>
            </div>

            <div className="ai-interpretation">
              <div className="ai-header">
                <span className="ai-icon">◈</span>
                <h3>AI智能解读</h3>
                <span className="ai-badge">Neural Interpretation</span>
              </div>
              <div className="interpretation-content">
                <p>{result.interpretation}</p>
              </div>
            </div>

            <div className="credits-info">
              <span>剩余积分: {result.creditsRemaining}</span>
            </div>

            {showEmailCapture && !emailCaptured && (
              <div className="email-capture">
                <p>保存你的解读？</p>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await fetch('/api/auth/register', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        email: emailCapture, 
                        password: Math.random().toString(36).slice(-12) 
                      }),
                    });
                    if (res.ok) {
                      const data = await res.json();
                      localStorage.setItem('token', data.token);
                      setEmailCaptured(true);
                    }
                  } catch {}
                }}>
                  <input
                    type="email"
                    value={emailCapture}
                    onChange={(e) => setEmailCapture(e.target.value)}
                    placeholder="输入邮箱保存结果"
                    required
                  />
                  <button type="submit">保存</button>
                </form>
              </div>
            )}

            <button className="share-btn" onClick={() => {
              const text = `我的八字：${result.bazi.year}年 ${result.bazi.month}月 ${result.bazi.day}日 ${result.bazi.hour}时\n用FATEFUL查看你的八字！`;
              if (navigator.share) {
                navigator.share({ text });
              } else {
                navigator.clipboard.writeText(text);
              }
            }}>
              分享结果
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .bazi-page {
          min-height: 100vh;
          padding: 24px;
          position: relative;
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
        }

        .nav-logo {
          font-family: var(--font-display);
          font-size: 1.25rem;
          color: var(--cosmic-gold);
          text-decoration: none;
          letter-spacing: 0.1rem;
        }

        .nav-link {
          color: var(--foreground);
          text-decoration: none;
          font-size: 0.9rem;
          opacity: 0.7;
          transition: opacity 0.3s;
        }

        .nav-link:hover {
          opacity: 1;
        }

        .bazi-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .form-section {
          margin-bottom: 48px;
        }

        .section-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .symbol {
          font-size: 2.5rem;
          color: var(--cosmic-gold);
          margin-bottom: 16px;
        }

        .section-header h1 {
          font-family: var(--font-display);
          font-size: 2rem;
          color: var(--foreground);
          margin-bottom: 8px;
        }

        .subtitle {
          font-size: 0.9rem;
          opacity: 0.6;
        }

        .cosmic-form {
          background: rgba(26, 22, 53, 0.6);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 32px;
        }

        .input-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }

        .input-row.single {
          grid-template-columns: 1fr;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          font-size: 0.85rem;
          color: var(--muted-foreground);
        }

        .input-group select {
          padding: 14px 16px;
          background: rgba(3, 0, 20, 0.5);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--foreground);
          font-size: 1rem;
          cursor: pointer;
          transition: border-color 0.3s;
        }

        .input-group select:focus {
          outline: none;
          border-color: var(--accent);
        }

        .gender-toggle {
          display: flex;
          gap: 12px;
        }

        .gender-toggle button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px;
          background: rgba(3, 0, 20, 0.5);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--foreground);
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .gender-toggle button.active {
          background: rgba(124, 58, 237, 0.3);
          border-color: var(--accent);
        }

        .gender-icon {
          font-size: 1.25rem;
        }

        .btn-submit {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 18px;
          margin-top: 24px;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.4) 0%, rgba(79, 70, 229, 0.5) 100%);
          border: 1px solid var(--accent);
          border-radius: 16px;
          color: #fff;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(124, 58, 237, 0.4);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-submit .en {
          font-size: 0.7rem;
          opacity: 0.7;
          font-weight: 400;
        }

        .loading {
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .error-message {
          margin-top: 16px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          color: #ef4444;
          font-size: 0.9rem;
        }

        .cta-banner {
          margin-top: 24px;
          padding: 20px;
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.3);
          border-radius: 16px;
          text-align: center;
        }

        .cta-banner p {
          margin-bottom: 12px;
          color: var(--cosmic-gold);
        }

        .cta-button {
          display: inline-block;
          padding: 12px 32px;
          background: var(--cosmic-gold);
          color: #030014;
          border-radius: 30px;
          font-weight: 600;
          text-decoration: none;
        }

        .result-section {
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .four-pillars {
          background: rgba(26, 22, 53, 0.6);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 32px;
          margin-bottom: 24px;
        }

        .pillars-title {
          text-align: center;
          margin-bottom: 32px;
        }

        .pillars-title .zh {
          display: block;
          font-family: var(--font-display);
          font-size: 1.5rem;
          color: var(--cosmic-gold);
        }

        .pillars-title .en {
          font-size: 0.8rem;
          opacity: 0.5;
        }

        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .pillar {
          text-align: center;
          padding: 20px 12px;
          background: rgba(3, 0, 20, 0.4);
          border: 1px solid var(--border);
          border-radius: 16px;
          transition: all 0.3s;
        }

        .pillar:hover {
          transform: translateY(-4px);
          border-color: var(--accent);
        }

        .pillar-label {
          font-size: 0.75rem;
          color: var(--muted-foreground);
          margin-bottom: 8px;
        }

        .pillar-value {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--cosmic-gold);
          margin-bottom: 4px;
        }

        .pillar-en {
          font-size: 0.65rem;
          opacity: 0.4;
        }

        .ai-interpretation {
          background: rgba(26, 22, 53, 0.6);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .ai-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .ai-icon {
          font-size: 1.5rem;
          color: var(--accent);
        }

        .ai-header h3 {
          flex: 1;
          font-size: 1.1rem;
        }

        .ai-badge {
          font-size: 0.65rem;
          padding: 4px 10px;
          background: rgba(124, 58, 237, 0.2);
          border-radius: 20px;
          color: var(--accent);
        }

        .interpretation-content {
          padding: 16px;
          background: rgba(3, 0, 20, 0.4);
          border-radius: 12px;
          line-height: 1.8;
          font-size: 0.95rem;
        }

        .credits-info {
          text-align: center;
          padding: 12px;
          font-size: 0.9rem;
          opacity: 0.7;
        }

        .email-capture {
          padding: 20px;
          background: rgba(34, 211, 216, 0.1);
          border: 1px solid rgba(34, 211, 216, 0.3);
          border-radius: 16px;
          text-align: center;
          margin-bottom: 16px;
        }

        .email-capture p {
          margin-bottom: 12px;
          color: var(--energy-cyan);
        }

        .email-capture form {
          display: flex;
          gap: 8px;
        }

        .email-capture input {
          flex: 1;
          padding: 10px 14px;
          border-radius: 10px;
        }

        .email-capture button {
          padding: 10px 20px;
          background: var(--energy-cyan);
          color: #030014;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
        }

        .share-btn {
          width: 100%;
          padding: 14px;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--foreground);
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .share-btn:hover {
          background: rgba(255,255,255,0.05);
        }

        @media (max-width: 640px) {
          .input-row {
            grid-template-columns: 1fr;
          }

          .pillars-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

export default function BaziPage() {
  return <BaziForm />;
}
