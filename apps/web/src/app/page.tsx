'use client';

// Main landing page
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Logo } from '@/components/Logo';

export default function HomePage() {
  const { t } = useTranslation('common');
  const { t: tBazi } = useTranslation('bazi');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  return (
    <main className="page cosmic-bg">
      <head>
        <title>FATEFUL - 你的AI决策操作系统 | 八字命理 Navigation OS</title>
        <meta name="description" content="融合东方玄学与AI的决策导航系统。在AI时代找到自我、力量、平静与前行的道路。" />
        <meta name="keywords" content="八字,命理,玄学,AI,决策,人生导航,易经,风水" />
        <meta property="og:title" content="FATEFUL - AI决策操作系统" />
        <meta property="og:description" content="在AI时代找到自我、力量、平静与路径" />
        <meta property="og:type" content="website" />
      </head>

      <div className="nav">
        <Logo size="sm" showText={false} />
        <Link href="/auth/login" className="nav-link">登录</Link>
        <LanguageSwitcher />
      </div>

      <section className="hero">
        <div className="symbol-container">
          <Logo size="lg" showText={false} />
        </div>
        
        <h1 className="title">
          <span className="title-zh">命</span>
        </h1>
        
        <p className="tagline">
          <span className="zh">你的AI决策操作系统</span>
          <span className="en">Your AI Decision OS</span>
        </p>
        
        <p className="mission">
          在人工智能时代，找到<span className="highlight">自我</span>、<span className="highlight">力量</span>、<span className="highlight">平静</span>与<span className="highlight">前行的路径</span>
        </p>

        <div className="cta-container">
          <Link href="/bazi" className="btn-primary">
            <span className="btn-zh">开启你的生命代码</span>
            <span className="btn-en">Reveal Your Life Code</span>
          </Link>
          <p className="cta-note">无需注册 · 每日免费测算</p>
        </div>

        <div className="manifesto">
          <div className="manifesto-item">
            <div className="icon">☰</div>
            <div className="content">
              <h3>发现自我Know Your Self</h3>
              <p>通过八字了解你的天赋秉性、人生使命与性格密码</p>
            </div>
          </div>
          <div className="manifesto-item">
            <div className="icon">⚡</div>
            <div className="content">
              <h3>激发力量Empower</h3>
              <p>识别你的能量周期，在对的时间做对的决定</p>
            </div>
          </div>
          <div className="manifesto-item">
            <div className="icon">⚛</div>
            <div className="content">
              <h3>找到平静Peace</h3>
              <p>理解命运模式，接纳当下，自在前行</p>
            </div>
          </div>
          <div className="manifesto-item">
            <div className="icon">→</div>
            <div className="content">
              <h3>指引路径Navigate</h3>
              <p>AI智能解读，为你的人生决策提供东方智慧参考</p>
            </div>
          </div>
        </div>
      </section>

      <section className="principles">
        <div className="principle">
          <span className="number">01</span>
          <h3>天人合一</h3>
          <p>Align with cosmic rhythms</p>
        </div>
        <div className="principle">
          <span className="number">02</span>
          <h3>阴阳平衡</h3>
          <p>Balance yin and yang</p>
        </div>
        <div className="principle">
          <span className="number">03</span>
          <h3>顺势而为</h3>
          <p>Flow with destiny</p>
        </div>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        .nav {
          position: fixed;
          top: 24px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          z-index: 100;
        }

        .nav-link {
          color: var(--foreground);
          text-decoration: none;
          font-size: 0.9rem;
          opacity: 0.8;
          transition: opacity 0.3s;
        }

        .nav-link:hover {
          opacity: 1;
        }

        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 60px 20px 40px;
        }

        .symbol-container {
          position: relative;
          width: 180px;
          height: 180px;
          margin-bottom: 32px;
        }

        .taiji {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 4rem;
          color: var(--cosmic-gold);
          animation: cosmicGlow 4s ease-in-out infinite;
          text-shadow: 0 0 30px var(--cosmic-gold-glow);
        }

        .orbits {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .orbit {
          position: absolute;
          border: 1px solid rgba(167, 139, 250, 0.2);
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .orbit-1 {
          width: 100%;
          height: 100%;
          animation: cosmicFloat 8s ease-in-out infinite;
        }

        .orbit-2 {
          width: 70%;
          height: 70%;
          animation: cosmicFloat 6s ease-in-out infinite reverse;
        }

        .orbit-3 {
          width: 40%;
          height: 40%;
          border-color: rgba(251, 191, 36, 0.3);
          animation: cosmicFloat 4s ease-in-out infinite;
        }

        .title {
          margin-bottom: 12px;
        }

        .title-zh {
          display: block;
          font-family: var(--font-display);
          font-size: 3rem;
          font-weight: 700;
          color: var(--cosmic-gold);
          text-shadow: 0 0 40px rgba(251, 191, 36, 0.4);
          letter-spacing: 0.5rem;
        }

        .title-en {
          display: block;
          font-size: 0.9rem;
          letter-spacing: 0.5rem;
          opacity: 0.7;
          margin-top: 8px;
        }

        .tagline {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 16px;
        }

        .tagline .zh {
          margin-right: 12px;
          padding-right: 12px;
          border-right: 1px solid var(--border);
        }

        .mission {
          font-size: 1rem;
          opacity: 0.7;
          max-width: 500px;
          line-height: 1.8;
          margin-bottom: 40px;
        }

        .highlight {
          color: var(--cosmic-gold);
          font-weight: 500;
        }

        .cta-container {
          margin-bottom: 60px;
        }

        .btn-primary {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          padding: 20px 48px;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.3) 0%, rgba(79, 70, 229, 0.4) 100%);
          border: 1px solid var(--accent);
          border-radius: 60px;
          text-decoration: none;
          transition: all 0.4s ease;
          box-shadow: 0 4px 30px rgba(124, 58, 237, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 50px rgba(124, 58, 237, 0.5);
        }

        .btn-zh {
          display: block;
          color: #fff;
          font-size: 1.25rem;
          font-weight: 600;
          font-family: var(--font-display);
        }

        .btn-en {
          display: block;
          color: rgba(255,255,255,0.7);
          font-size: 0.75rem;
          margin-top: 4px;
          letter-spacing: 0.1rem;
        }

        .cta-note {
          margin-top: 16px;
          font-size: 0.8rem;
          opacity: 0.6;
        }

        .manifesto {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          max-width: 600px;
          width: 100%;
        }

        .manifesto-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: rgba(26, 22, 53, 0.6);
          border: 1px solid var(--border);
          border-radius: 16px;
          text-align: left;
        }

        .manifesto-item .icon {
          font-size: 1.5rem;
          color: var(--cosmic-gold);
          opacity: 0.8;
        }

        .manifesto-item h3 {
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 4px;
          color: var(--foreground);
        }

        .manifesto-item p {
          font-size: 0.75rem;
          opacity: 0.6;
          line-height: 1.5;
        }

        .principles {
          display: flex;
          justify-content: center;
          gap: 48px;
          padding: 40px 20px;
          border-top: 1px solid var(--border);
          margin-top: 40px;
        }

        .principle {
          text-align: center;
        }

        .principle .number {
          display: block;
          font-size: 0.75rem;
          color: var(--accent);
          margin-bottom: 8px;
        }

        .principle h3 {
          font-size: 1rem;
          font-family: var(--font-display);
          margin-bottom: 4px;
        }

        .principle p {
          font-size: 0.75rem;
          opacity: 0.5;
        }
      `}</style>
    </main>
  );
}
