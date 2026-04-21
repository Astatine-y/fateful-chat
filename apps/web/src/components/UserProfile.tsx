'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface UserProfile {
  id: string;
  email: string;
  credits: number;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  totalCreditsUsed: number;
  totalCalculations: number;
  createdAt: string;
  lastActiveDate: string;
  creditsRemaining: number;
}

export default function UserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data.data);
      setNewEmail(data.data.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/user/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail) {
      setError('Email cannot be empty');
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ email: newEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const data = await response.json();
      setProfile(data.data);
      setEditMode(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update email');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <nav className="nav-bar">
          <Link href="/" className="nav-logo">☯ FATEFUL</Link>
          <Link href="/dashboard" className="nav-link">控制台</Link>
        </nav>
        <div className="loading-container">
          <div className="taiji">☯</div>
          <p>Loading your cosmic profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <nav className="nav-bar">
        <Link href="/" className="nav-logo">☯ FATEFUL</Link>
        <Link href="/dashboard" className="nav-link">控制台</Link>
      </nav>

      <div className="content">
        <header className="page-header">
          <div className="avatar">◈</div>
          <h1>
            <span className="zh">个人设置</span>
            <span className="en">Settings</span>
          </h1>
        </header>

        {error && <div className="error-message">{error}</div>}

        {profile && (
          <div className="settings-card">
            <section className="setting-section">
              <h2>
                <span className="zh">账户信息</span>
                <span className="en">Account Info</span>
              </h2>

              <div className="setting-row">
                <div className="setting-label">
                  <span className="zh">邮箱</span>
                  <span className="en">Email</span>
                </div>
                {editMode ? (
                  <div className="email-edit">
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                    <button
                      onClick={handleUpdateEmail}
                      disabled={updating}
                      className="btn-save"
                    >
                      {updating ? '保存中...' : '保存'}
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setNewEmail(profile.email);
                      }}
                      className="btn-cancel"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <div className="email-display">
                    <span>{profile.email}</span>
                    <button onClick={() => setEditMode(true)} className="btn-edit">
                      编辑
                    </button>
                  </div>
                )}
              </div>

              <div className="setting-row">
                <div className="setting-label">
                  <span className="zh">可用积分</span>
                  <span className="en">Credits</span>
                </div>
                <span className="credits-value">{profile.credits}</span>
              </div>

              <div className="setting-row">
                <div className="setting-label">
                  <span className="zh">注册时间</span>
                  <span className="en">Member Since</span>
                </div>
                <span>{new Date(profile.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>
            </section>

            {stats && (
              <section className="setting-section">
                <h2>
                  <span className="zh">使用统计</span>
                  <span className="en">Usage Statistics</span>
                </h2>

                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-value">{stats.totalCalculations}</div>
                    <div className="stat-label">
                      <span className="zh">总计算</span>
                      <span className="en">Calculations</span>
                    </div>
                  </div>

                  <div className="stat-item">
                    <div className="stat-value">{stats.totalCreditsUsed}</div>
                    <div className="stat-label">
                      <span className="zh">已使用</span>
                      <span className="en">Used</span>
                    </div>
                  </div>

                  <div className="stat-item">
                    <div className="stat-value">{stats.creditsRemaining}</div>
                    <div className="stat-label">
                      <span className="zh">剩余</span>
                      <span className="en">Remaining</span>
                    </div>
                  </div>

                  <div className="stat-item">
                    <div className="stat-value" style={{ fontSize: '1rem' }}>
                      {new Date(stats.lastActiveDate).toLocaleDateString('zh-CN')}
                    </div>
                    <div className="stat-label">
                      <span className="zh">最后活跃</span>
                      <span className="en">Last Active</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section className="setting-section danger-zone">
              <h2>
                <span className="zh">危险区域</span>
                <span className="en">Danger Zone</span>
              </h2>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/';
                }}
                className="btn-logout"
              >
                <span className="zh">退出登录</span>
                <span className="en">Logout</span>
              </button>
            </section>
          </div>
        )}
      </div>

      <style jsx>{`
        .profile-page {
          min-height: 100vh;
          padding: 24px;
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

        .content {
          max-width: 700px;
          margin: 0 auto;
        }

        .page-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .avatar {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--accent) 0%, var(--void-indigo) 100%);
          border-radius: 50%;
          font-size: 2rem;
          color: #fff;
        }

        h1 {
          margin-bottom: 0;
        }

        .zh {
          display: block;
          font-family: var(--font-display);
          font-size: 1.5rem;
        }

        .en {
          display: block;
          font-size: 0.8rem;
          opacity: 0.6;
          margin-top: 4px;
        }

        .error-message {
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          color: #ef4444;
          font-size: 0.85rem;
          margin-bottom: 24px;
        }

        .settings-card {
          background: rgba(26, 22, 53, 0.6);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 32px;
        }

        .setting-section {
          margin-bottom: 32px;
        }

        .setting-section:last-child {
          margin-bottom: 0;
        }

        .setting-section h2 {
          display: flex;
          flex-direction: column;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }

        .setting-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid var(--border);
        }

        .setting-row:last-child {
          border-bottom: none;
        }

        .setting-label {
          display: flex;
          flex-direction: column;
        }

        .setting-label .zh {
          font-size: 0.9rem;
          font-family: var(--font-display);
        }

        .setting-label .en {
          font-size: 0.7rem;
          opacity: 0.5;
        }

        .email-display {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .email-display span {
          color: var(--foreground);
          opacity: 0.9;
        }

        .email-edit {
          display: flex;
          gap: 8px;
        }

        .email-edit input {
          padding: 10px 14px;
          background: rgba(3, 0, 20, 0.5);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--foreground);
          font-size: 0.9rem;
        }

        .credits-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--cosmic-gold);
        }

        .btn-save, .btn-cancel, .btn-edit {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-save {
          background: var(--accent);
          border: none;
          color: #fff;
        }

        .btn-cancel {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--foreground);
        }

        .btn-edit {
          background: transparent;
          border: 1px solid var(--accent);
          color: var(--accent);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .stat-item {
          padding: 20px;
          background: rgba(3, 0, 20, 0.4);
          border-radius: 16px;
          text-align: center;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--cosmic-gold);
          margin-bottom: 8px;
        }

        .stat-label {
          display: flex;
          flex-direction: column;
        }

        .stat-label .zh {
          font-size: 0.85rem;
          font-family: var(--font-display);
        }

        .stat-label .en {
          font-size: 0.65rem;
          opacity: 0.5;
        }

        .danger-zone {
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }

        .danger-zone h2 .zh, .danger-zone h2 .en {
          color: #ef4444;
        }

        .btn-logout {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          width: 100%;
          padding: 16px;
          background: transparent;
          border: 1px solid rgba(239, 68, 68, 0.5);
          border-radius: 12px;
          color: #ef4444;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-logout:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .btn-logout .en {
          font-size: 0.7rem;
          opacity: 0.7;
          font-weight: 400;
        }
      `}</style>
    </div>
  );
}