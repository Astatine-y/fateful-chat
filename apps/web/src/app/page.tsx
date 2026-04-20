'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function HomePage() {
  const { t } = useTranslation('common');
  const { t: tBazi } = useTranslation('bazi');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  return (
    <main className="page">
      <head>
        <title>八字计算 | 免费在线八字排盘 | AI智能解读</title>
        <meta name="description" content="免费在线八字排盘，AI智能解读你的命运。输入出生年月日时，获得详细的八字分析。" />
        <meta name="keywords" content="八字,八字排盘,八字测算,命理,玄学,AI解读" />
        <meta property="og:title" content="Fateful Chat - 免费八字计算" />
        <meta property="og:description" content="免费在线八字排盘，AI智能解读你的命运" />
        <meta property="og:type" content="website" />
      </head>

      <div className="header">
        <LanguageSwitcher />
      </div>

      <section className="hero">
        <div className="logo">🎯</div>
        <h1>探索你的八字命运</h1>
        <p className="subtitle">免费在线八字排盘 | AI智能解读</p>
        
        <div className="features">
          <div className="feature">
            <span className="icon">⚡</span>
            <span>每日免费计算</span>
          </div>
          <div className="feature">
            <span className="icon">🤖</span>
            <span>AI智能解读</span>
          </div>
          <div className="feature">
            <span className="icon">📱</span>
            <span>随时随地访问</span>
          </div>
        </div>

        <div className="cta-section">
          <Link href="/bazi" className="btn-primary">
            立即免费测算
          </Link>
          <p className="cta-note">无需注册，立即使用</p>
        </div>

        <div className="stats">
          <div className="stat">
            <strong>10,000+</strong>
            <span>用户</span>
          </div>
          <div className="stat">
            <strong>50,000+</strong>
            <span>解读</span>
          </div>
          <div className="stat">
            <strong>4.9</strong>
            <span>评分</span>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>如何使用</h2>
        <div className="steps">
          <div className="step">
            <div className="step-num">1</div>
            <p>输入出生信息</p>
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <p>获取八字排盘</p>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <p>AI深度解读</p>
          </div>
        </div>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px;
        }
        .header {
          position: absolute;
          top: 20px;
          right: 20px;
        }
        .hero {
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
          color: white;
        }
        .logo {
          font-size: 4rem;
          margin-bottom: 16px;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 8px;
        }
        .subtitle {
          font-size: 1.25rem;
          opacity: 0.9;
          margin-bottom: 32px;
        }
        .features {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }
        .feature {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.15);
          padding: 8px 16px;
          border-radius: 20px;
        }
        .icon {
          font-size: 1.25rem;
        }
        .cta-section {
          margin-bottom: 40px;
        }
        .btn-primary {
          display: inline-block;
          padding: 16px 40px;
          background: white;
          color: #667eea;
          border-radius: 30px;
          font-size: 1.125rem;
          font-weight: 700;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .cta-note {
          margin-top: 12px;
          font-size: 0.875rem;
          opacity: 0.8;
        }
        .stats {
          display: flex;
          justify-content: center;
          gap: 40px;
        }
        .stat {
          text-align: center;
        }
        .stat strong {
          display: block;
          font-size: 1.5rem;
        }
        .stat span {
          font-size: 0.875rem;
          opacity: 0.8;
        }
        .how-it-works {
          max-width: 600px;
          margin: 60px auto 0;
          text-align: center;
          color: white;
        }
        .how-it-works h2 {
          font-size: 1.5rem;
          margin-bottom: 24px;
        }
        .steps {
          display: flex;
          justify-content: center;
          gap: 32px;
        }
        .step {
          text-align: center;
        }
        .step-num {
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          margin: 0 auto 8px;
        }
      `}</style>
    </main>
  );
}
