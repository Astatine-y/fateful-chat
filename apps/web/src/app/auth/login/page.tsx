'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      setError('Authentication failed. Please try again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const response = await fetch('/api/auth/google');
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Google login not configured');
        setGoogleLoading(false);
      }
    } catch {
      setError('Failed to initiate Google login');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="star star-1"></div>
        <div className="star star-2"></div>
        <div className="star star-3"></div>
      </div>

      <Link href="/" className="back-home">☯ FATEFUL</Link>

      <div className="auth-container">
        <div className="auth-card">
          <div className="symbol">☯</div>
          <h1>
            <span className="zh">登录</span>
            <span className="en">Sign In</span>
          </h1>
          <p className="mission">进入你的生命代码系统</p>

          <button type="button" onClick={handleGoogleLogin} disabled={googleLoading} className="google-btn">
            {googleLoading ? (
              <span>Loading...</span>
            ) : (
              <>
                <span className="google-icon">G</span>
                <span>使用 Google 账号登录</span>
              </>
            )}
          </button>

          <div className="divider">
            <span>或</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="邮箱地址"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="密码"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? (
                <span className="loading">进入中...</span>
              ) : (
                <>
                  <span className="zh">进入系统</span>
                  <span className="en">Enter</span>
                </>
              )}
            </button>
          </form>

          {error && <div className="error-message">{error}</div>}

          <p className="footer">
            还没有账户? <Link href="/auth/register">创建账户</Link>
          </p>
        </div>

        <div className="auth-footer">
          <p>在AI时代找到自我、力量、平静与路径</p>
        </div>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        .auth-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .star {
          position: absolute;
          border-radius: 50%;
          animation: twinkle 3s ease-in-out infinite;
        }

        .star-1 {
          width: 4px;
          height: 4px;
          background: var(--cosmic-gold);
          top: 20%;
          left: 30%;
          animation-delay: 0s;
        }

        .star-2 {
          width: 3px;
          height: 3px;
          background: var(--accent);
          top: 60%;
          left: 70%;
          animation-delay: 1s;
        }

        .star-3 {
          width: 2px;
          height: 2px;
          background: var(--energy-cyan);
          top: 80%;
          left: 20%;
          animation-delay: 2s;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        .back-home {
          position: absolute;
          top: 24px;
          left: 24px;
          font-family: var(--font-display);
          font-size: 1.25rem;
          color: var(--cosmic-gold);
          text-decoration: none;
          letter-spacing: 0.1rem;
          z-index: 10;
        }

        .auth-container {
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 1;
        }

        .auth-card {
          padding: 48px 40px;
          background: rgba(26, 22, 53, 0.8);
          border: 1px solid var(--border);
          border-radius: 24px;
          backdrop-filter: blur(20px);
        }

        .symbol {
          text-align: center;
          font-size: 3rem;
          color: var(--cosmic-gold);
          margin-bottom: 20px;
          animation: cosmicGlow 3s ease-in-out infinite;
        }

        h1 {
          text-align: center;
          margin-bottom: 8px;
        }

        .zh {
          display: block;
          font-family: var(--font-display);
          font-size: 1.75rem;
        }

        .en {
          display: block;
          font-size: 0.8rem;
          opacity: 0.6;
          margin-top: 4px;
        }

        .mission {
          text-align: center;
          font-size: 0.9rem;
          opacity: 0.6;
          margin-bottom: 32px;
        }

        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 14px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--foreground);
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .google-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: var(--muted-foreground);
        }

        .google-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .google-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #4285f4, #34a853);
          border-radius: 4px;
          font-weight: 700;
          font-size: 0.8rem;
        }

        .divider {
          display: flex;
          align-items: center;
          margin: 28px 0;
          color: var(--muted-foreground);
          font-size: 0.8rem;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        .divider span {
          padding: 0 16px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group input {
          width: 100%;
          padding: 14px 18px;
          background: rgba(3, 0, 20, 0.5);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--foreground);
          font-size: 1rem;
          transition: border-color 0.3s;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--accent);
        }

        .form-group input::placeholder {
          color: var(--muted-foreground);
        }

        .primary-btn {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 16px;
          margin-top: 8px;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.4) 0%, rgba(79, 70, 229, 0.5) 100%);
          border: 1px solid var(--accent);
          border-radius: 12px;
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .primary-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(124, 58, 237, 0.4);
        }

        .primary-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .primary-btn .en {
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
          font-size: 0.85rem;
          text-align: center;
        }

        .footer {
          margin-top: 28px;
          text-align: center;
          font-size: 0.85rem;
          color: var(--muted-foreground);
        }

        .footer a {
          color: var(--cosmic-gold);
          text-decoration: none;
          margin-left: 4px;
        }

        .footer a:hover {
          text-decoration: underline;
        }

        .auth-footer {
          margin-top: 24px;
          text-align: center;
        }

        .auth-footer p {
          font-size: 0.8rem;
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}