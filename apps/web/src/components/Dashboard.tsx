'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface UserData {
  id: string;
  email: string;
  credits: number;
  referralCode?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUser(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="taiji">☯</div>
          <p>Loading your cosmic data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <nav className="nav-bar">
        <Link href="/" className="nav-logo">☯ FATEFUL</Link>
        <div className="nav-links">
          <Link href="/bazi" className="nav-link">命理</Link>
          <Link href="/history" className="nav-link">历史</Link>
          <Link href="/subscription" className="nav-link">订阅</Link>
          <Link href="/profile" className="nav-link">设置</Link>
        </div>
      </nav>

      <div className="dashboard-content">
        <header className="dashboard-header">
          <div className="user-welcome">
            <div className="avatar">◈</div>
            <div className="welcome-text">
              <h1>欢迎回来</h1>
              <p className="email">{user?.email}</p>
            </div>
          </div>
          <p className="mission">在AI时代找到自我、力量、平静与路径</p>
        </header>

        <div className="energy-grid">
          <Link href="/bazi" className="energy-card credits">
            <div className="card-glow"></div>
            <div className="card-icon">⚡</div>
            <div className="card-value">{user?.credits ?? 0}</div>
            <div className="card-label">
              <span className="zh">可用积分</span>
              <span className="en">Energy Credits</span>
            </div>
            <div className="card-action">
              <span>立即使用</span>
              <span className="arrow">→</span>
            </div>
          </Link>

          <Link href="/history" className="energy-card history">
            <div className="card-glow"></div>
            <div className="card-icon">◷</div>
            <div className="card-value">0</div>
            <div className="card-label">
              <span className="zh">历史记录</span>
              <span className="en">Past Readings</span>
            </div>
            <div className="card-action">
              <span>查看</span>
              <span className="arrow">→</span>
            </div>
          </Link>

          <Link href="/subscription" className="energy-card vip">
            <div className="card-glow"></div>
            <div className="card-icon">♔</div>
            <div className="card-value">FREE</div>
            <div className="card-label">
              <span className="zh">会员等级</span>
              <span className="en">Membership</span>
            </div>
            <div className="card-action">
              <span>升级</span>
              <span className="arrow">→</span>
            </div>
          </Link>

          <Link href="/referral" className="energy-card refer">
            <div className="card-glow"></div>
            <div className="card-icon">∞</div>
            <div className="card-value">+5</div>
            <div className="card-label">
              <span className="zh">邀请奖励</span>
              <span className="en">Referral Bonus</span>
            </div>
            <div className="card-action">
              <span>获取</span>
              <span className="arrow">→</span>
            </div>
          </Link>
        </div>

        <section className="quick-start">
          <h2 className="section-title">
            <span className="zh">快速开始</span>
            <span className="en">Quick Navigation</span>
          </h2>
          
          <div className="path-grid">
            <Link href="/bazi" className="path-card">
              <div className="path-icon">☰</div>
              <div className="path-content">
                <h3>八字排盘</h3>
                <p>输入出生信息，获取你的生命代码</p>
              </div>
              <div className="path-arrow">→</div>
            </Link>

            <Link href="#" className="path-card">
              <div className="path-icon">☲</div>
              <div className="path-content">
                <h3>大运流年</h3>
                <p>查看你的运势周期</p>
              </div>
              <div className="path-arrow">→</div>
            </Link>

            <Link href="#" className="path-card">
              <div className="path-icon">☵</div>
              <div className="path-content">
                <h3>命理咨询</h3>
                <p>AI深度解读分析</p>
              </div>
              <div className="path-arrow">→</div>
            </Link>
          </div>
        </section>

        <section className="cosmic-stats">
          <div className="stat-item">
            <div className="stat-symbol">☯</div>
            <div className="stat-info">
              <span className="stat-label">探索自我</span>
              <span className="stat-value">Know Your Self</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-symbol">⚡</div>
            <div className="stat-info">
              <span className="stat-label">激发力量</span>
              <span className="stat-value">Empower</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-symbol">⚛</div>
            <div className="stat-info">
              <span className="stat-label">找到平静</span>
              <span className="stat-value">Peace</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-symbol">→</div>
            <div className="stat-info">
              <span className="stat-label">指引路径</span>
              <span className="stat-value">Navigate</span>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .dashboard {
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

        .nav-links {
          display: flex;
          gap: 20px;
        }

        .nav-link {
          color: var(--foreground);
          text-decoration: none;
          font-size: 0.85rem;
          opacity: 0.7;
          transition: opacity 0.3s;
        }

        .nav-link:hover {
          opacity: 1;
          color: var(--accent);
        }

        .loading-container {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        .loading-container .taiji {
          font-size: 3rem;
          color: var(--cosmic-gold);
          animation: rotate 4s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .loading-container p {
          opacity: 0.6;
        }

        .dashboard-content {
          max-width: 900px;
          margin: 0 auto;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .user-welcome {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 12px;
        }

        .avatar {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--accent) 0%, var(--void-indigo) 100%);
          border-radius: 50%;
          font-size: 1.5rem;
          color: #fff;
        }

        .welcome-text h1 {
          font-family: var(--font-display);
          font-size: 1.75rem;
          margin-bottom: 4px;
        }

        .email {
          font-size: 0.9rem;
          opacity: 0.6;
        }

        .mission {
          font-size: 0.95rem;
          opacity: 0.6;
          color: var(--cosmic-gold);
        }

        .energy-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 48px;
        }

        .energy-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 28px 20px;
          background: rgba(26, 22, 53, 0.6);
          border: 1px solid var(--border);
          border-radius: 20px;
          text-decoration: none;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .energy-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent);
        }

        .card-glow {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .energy-card:hover .card-glow {
          opacity: 1;
        }

        .card-icon {
          font-size: 1.5rem;
          margin-bottom: 12px;
          opacity: 0.8;
        }

        .card-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--cosmic-gold);
          margin-bottom: 4px;
        }

        .card-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 16px;
        }

        .card-label .zh {
          font-size: 0.85rem;
          color: var(--foreground);
          font-family: var(--font-display);
        }

        .card-label .en {
          font-size: 0.65rem;
          opacity: 0.5;
        }

        .card-action {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: var(--accent);
          opacity: 0;
          transform: translateY(8px);
          transition: all 0.3s;
        }

        .energy-card:hover .card-action {
          opacity: 1;
          transform: translateY(0);
        }

        .quick-start {
          margin-bottom: 48px;
        }

        .section-title {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 24px;
        }

        .section-title .zh {
          font-family: var(--font-display);
          font-size: 1.25rem;
          margin-bottom: 4px;
        }

        .section-title .en {
          font-size: 0.75rem;
          opacity: 0.5;
        }

        .path-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .path-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: rgba(26, 22, 53, 0.6);
          border: 1px solid var(--border);
          border-radius: 16px;
          text-decoration: none;
          transition: all 0.3s;
        }

        .path-card:hover {
          border-color: var(--accent);
          transform: translateX(4px);
        }

        .path-icon {
          font-size: 1.5rem;
          color: var(--cosmic-gold);
        }

        .path-content {
          flex: 1;
        }

        .path-content h3 {
          font-size: 0.95rem;
          margin-bottom: 4px;
          color: var(--foreground);
        }

        .path-content p {
          font-size: 0.75rem;
          opacity: 0.5;
        }

        .path-arrow {
          color: var(--accent);
          opacity: 0;
          transform: translateX(-8px);
          transition: all 0.3s;
        }

        .path-card:hover .path-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        .cosmic-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          padding: 24px;
          background: rgba(26, 22, 53, 0.4);
          border: 1px solid var(--border);
          border-radius: 16px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-symbol {
          font-size: 1.25rem;
          color: var(--accent);
          opacity: 0.7;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.85rem;
          font-family: var(--font-display);
        }

        .stat-value {
          font-size: 0.65rem;
          opacity: 0.5;
        }

        @media (max-width: 768px) {
          .energy-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .path-grid {
            grid-template-columns: 1fr;
          }

          .cosmic-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}