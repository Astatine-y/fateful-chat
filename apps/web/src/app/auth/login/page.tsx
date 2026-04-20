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
      <div className="auth-card">
        <h1>登录</h1>
        <p className="subtitle">登录您的账户</p>

        <button type="button" onClick={handleGoogleLogin} disabled={googleLoading} className="google-btn">
          {googleLoading ? '加载中...' : '使用 Google 账号登录'}
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
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        <p className="footer">
          还没有账户? <Link href="/auth/register">创建账户</Link>
        </p>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #f9fafb;
        }

        .auth-card {
          width: 100%;
          max-width: 400px;
          padding: 40px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        h1 {
          margin: 0 0 8px;
          font-size: 1.75rem;
          text-align: center;
        }

        .subtitle {
          margin-bottom: 24px;
          color: #6b7280;
          text-align: center;
        }

        .google-btn {
          width: 100%;
          padding: 12px;
          background: #4285f4;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          margin-bottom: 16px;
        }

        .google-btn:disabled {
          opacity: 0.6;
        }

        .divider {
          display: flex;
          align-items: center;
          margin: 20px 0;
          color: #9ca3af;
          font-size: 0.875rem;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }

        .divider span {
          padding: 0 12px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
        }

        .primary-btn {
          width: 100%;
          padding: 14px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 8px;
        }

        .primary-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error {
          margin-top: 16px;
          padding: 12px;
          background: #fef2f2;
          color: #dc2626;
          border-radius: 8px;
          font-size: 0.875rem;
        }

        .footer {
          margin-top: 24px;
          text-align: center;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .footer a {
          color: #2563eb;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}