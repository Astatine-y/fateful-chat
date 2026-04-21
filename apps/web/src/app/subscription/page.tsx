'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

interface SubscriptionStatus {
  isSubscribed: boolean;
  plan?: 'monthly' | 'yearly';
  expiresAt?: string;
}

export default function SubscriptionPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login?redirect=/subscription');
    } else {
      fetchSubscriptionStatus();
    }
  }, [router]);

  const fetchSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/subscription/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSubscriptionStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch subscription status:', err);
    }
  };

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    setLoading(plan);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/subscription/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create subscription');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No redirect URL returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Subscription failed');
      setLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm('确定要取消订阅吗？')) return;

    setLoading('cancelling');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setSubscriptionStatus({ isSubscribed: false });
        alert('订阅已取消');
      }
    } catch {
      alert('取消失败，请重试');
    } finally {
      setLoading(null);
    }
  };

  if (subscriptionStatus?.isSubscribed) {
    return (
      <div className="subscription-page">
        <nav className="nav-bar">
          <Link href="/" className="nav-logo">☯ FATEFUL</Link>
          <Link href="/dashboard" className="nav-link">控制台</Link>
        </nav>

        <div className="content">
          <div className="vip-card">
            <div className="vip-glow"></div>
            <div className="vip-symbol">♔</div>
            <h1>
              <span className="zh">您当前的会员</span>
              <span className="en">Current Membership</span>
            </h1>
            <div className="plan-badge">
              {subscriptionStatus.plan === 'yearly' ? '年度会员' : '月度会员'} VIP
            </div>
            <div className="vip-features">
              <div className="feature">
                <span>✓</span> 无限次八字计算
              </div>
              <div className="feature">
                <span>✓</span> 无限次AI智能解读
              </div>
              <div className="feature">
                <span>✓</span> 优先客服支持
              </div>
            </div>
            {subscriptionStatus.expiresAt && (
              <p className="expires">
                到期日：{new Date(subscriptionStatus.expiresAt).toLocaleDateString('zh-CN')}
              </p>
            )}
            <button onClick={handleCancel} disabled={!!loading} className="cancel-btn">
              {loading === 'cancelling' ? '取消中...' : '取消订阅'}
            </button>
          </div>
        </div>

        <style jsx>{`
          .subscription-page {
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

          .content {
            max-width: 500px;
            margin: 60px auto 0;
          }

          .vip-card {
            position: relative;
            padding: 48px 32px;
            background: rgba(26, 22, 53, 0.8);
            border: 1px solid var(--cosmic-gold);
            border-radius: 24px;
            text-align: center;
            overflow: hidden;
          }

          .vip-glow {
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 50%);
            animation: pulse 4s ease-in-out infinite;
          }

          @keyframes pulse {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.1); }
          }

          .vip-symbol {
            font-size: 3rem;
            color: var(--cosmic-gold);
            margin-bottom: 16px;
          }

          h1 {
            margin-bottom: 16px;
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

          .plan-badge {
            display: inline-block;
            padding: 8px 24px;
            background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(234, 179, 8, 0.3) 100%);
            border: 1px solid var(--cosmic-gold);
            border-radius: 30px;
            color: var(--cosmic-gold);
            font-weight: 600;
            margin-bottom: 32px;
          }

          .vip-features {
            text-align: left;
            margin-bottom: 24px;
          }

          .feature {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 0;
            border-bottom: 1px solid var(--border);
          }

          .feature span {
            color: var(--mystic-teal);
          }

          .expires {
            font-size: 0.9rem;
            opacity: 0.6;
            margin-bottom: 24px;
          }

          .cancel-btn {
            padding: 14px 32px;
            background: transparent;
            border: 1px solid rgba(239, 68, 68, 0.5);
            border-radius: 12px;
            color: #ef4444;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.3s;
          }

          .cancel-btn:hover:not(:disabled) {
            background: rgba(239, 68, 68, 0.1);
          }

          .cancel-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="subscription-page">
      <nav className="nav-bar">
        <Logo size="sm" />
        <Link href="/dashboard" className="nav-link">控制台</Link>
      </nav>

      <div className="content">
        <header className="page-header">
          <div className="symbol">♔</div>
          <h1>
            <span className="zh">解锁无限可能</span>
            <span className="en">Unlock Unlimited Access</span>
          </h1>
          <p className="mission">升级为VIP，解锁无限次生命代码解析</p>
        </header>

        <div className="plans-grid">
          <div className="plan-card">
            <div className="plan-header">
              <h2>
                <span className="zh">月度会员</span>
                <span className="en">Monthly</span>
              </h2>
              <div className="price">
                <span className="amount">¥79</span>
                <span className="period">/月</span>
              </div>
            </div>
            <ul className="plan-features">
              <li><span>✓</span> 无限次八字计算</li>
              <li><span>✓</span> 无限次AI智能解读</li>
              <li><span>✓</span> 优先客服支持</li>
            </ul>
            <button onClick={() => handleSubscribe('monthly')} disabled={!!loading} className="plan-btn">
              {loading === 'monthly' ? '处理中...' : '立即订阅'}
            </button>
          </div>

          <div className="plan-card featured">
            <div className="featured-glow"></div>
            <div className="badge">最超值</div>
            <div className="plan-header">
              <h2>
                <span className="zh">年度会员</span>
                <span className="en">Yearly</span>
              </h2>
              <div className="price">
                <span className="amount">¥599</span>
                <span className="period">/年</span>
              </div>
            </div>
            <p className="savings">省 ¥349 (约8个月)</p>
            <ul className="plan-features">
              <li><span>✓</span> 无限次八字计算</li>
              <li><span>✓</span> 无限次AI智能解读</li>
              <li><span>✓</span> 优先客服支持</li>
              <li><span>✓</span> 专属主题</li>
            </ul>
            <button onClick={() => handleSubscribe('yearly')} disabled={!!loading} className="plan-btn">
              {loading === 'yearly' ? '处理中...' : '立即订阅'}
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>

      <style jsx>{`
        .subscription-page {
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

        .content {
          max-width: 800px;
          margin: 0 auto;
        }

        .page-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .symbol {
          font-size: 3rem;
          color: var(--cosmic-gold);
          margin-bottom: 20px;
        }

        h1 {
          margin-bottom: 12px;
        }

        .zh {
          display: block;
          font-family: var(--font-display);
          font-size: 2rem;
        }

        .en {
          display: block;
          font-size: 0.9rem;
          opacity: 0.6;
          margin-top: 4px;
        }

        .mission {
          font-size: 1rem;
          opacity: 0.7;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .plan-card {
          position: relative;
          padding: 32px;
          background: rgba(26, 22, 53, 0.6);
          border: 1px solid var(--border);
          border-radius: 20px;
          transition: all 0.3s;
        }

        .plan-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent);
        }

        .plan-card.featured {
          border-color: var(--cosmic-gold);
          background: rgba(26, 22, 53, 0.8);
        }

        .featured-glow {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .badge {
          position: absolute;
          top: -12px;
          right: 20px;
          padding: 6px 16px;
          background: linear-gradient(135deg, var(--cosmic-gold) 0%, #d97706 100%);
          border-radius: 20px;
          color: #030014;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .plan-header {
          margin-bottom: 24px;
        }

        .plan-header h2 {
          margin-bottom: 12px;
        }

        .zh {
          display: block;
          font-family: var(--font-display);
          font-size: 1.25rem;
          margin-bottom: 4px;
        }

        .en {
          display: block;
          font-size: 0.75rem;
          opacity: 0.5;
        }

        .price {
          display: flex;
          align-items: baseline;
        }

        .amount {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--cosmic-gold);
        }

        .period {
          font-size: 1rem;
          opacity: 0.6;
          margin-left: 4px;
        }

        .savings {
          color: var(--mystic-teal);
          font-weight: 600;
          margin-bottom: 24px;
        }

        .plan-features {
          list-style: none;
          padding: 0;
          margin-bottom: 32px;
        }

        .plan-features li {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .plan-features li span {
          color: var(--mystic-teal);
        }

        .plan-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.4) 0%, rgba(79, 70, 229, 0.5) 100%);
          border: 1px solid var(--accent);
          border-radius: 12px;
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .plan-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(124, 58, 237, 0.4);
        }

        .plan-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          margin-top: 24px;
          padding: 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          color: #ef4444;
          text-align: center;
        }

        @media (max-width: 640px) {
          .plans-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}