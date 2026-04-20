'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SubscriptionPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
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
        <div className="current-plan">
          <h1>您的订阅</h1>
          <div className="plan-card active">
            <h2>{subscriptionStatus.plan === 'monthly' ? '月度会员' : '年度会员'}</h2>
            <p>无限次八字计算</p>
            <p>到期日：{new Date(subscriptionStatus.expiresAt).toLocaleDateString('zh-CN')}</p>
          </div>
          <button onClick={handleCancel} disabled={!!loading} className="cancel-btn">
            {loading === 'cancelling' ? '取消中...' : '取消订阅'}
          </button>
        </div>

        <style jsx>{`
          .subscription-page {
            min-height: 100vh;
            padding: 40px 20px;
            background: #f9fafb;
          }
          .current-plan {
            max-width: 400px;
            margin: 0 auto;
          }
          h1 {
            text-align: center;
            margin-bottom: 24px;
          }
          .plan-card {
            padding: 32px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          }
          .plan-card.active {
            border: 2px solid #10b981;
          }
          .plan-card h2 {
            margin: 0 0 12px;
            color: #10b981;
          }
          .cancel-btn {
            width: 100%;
            margin-top: 24px;
            padding: 14px;
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="subscription-page">
      <h1>升级为会员</h1>
      <p className="subtitle">解锁无限八字计算</p>

      <div className="plans">
        <div className="plan-card">
          <h2>月度会员</h2>
          <div className="price">¥79<span>/月</span></div>
          <ul>
            <li>无限次八字计算</li>
            <li>无限次AI解读</li>
            <li>优先客服支持</li>
          </ul>
          <button onClick={() => handleSubscribe('monthly')} disabled={!!loading} className="subscribe-btn">
            {loading === 'monthly' ? '处理中...' : '立即订阅'}
          </button>
        </div>

        <div className="plan-card featured">
          <div className="badge">超值</div>
          <h2>年度会员</h2>
          <div className="price">¥599<span>/年</span></div>
          <p className="savings">省 ¥349 (约8个月)</p>
          <ul>
            <li>无限次八字计算</li>
            <li>无限次AI解读</li>
            <li>优先客服支持</li>
            <li>专属主题</li>
          </ul>
          <button onClick={() => handleSubscribe('yearly')} disabled={!!loading} className="subscribe-btn">
            {loading === 'yearly' ? '处理中...' : '立即订阅'}
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <style jsx>{`
        .subscription-page {
          min-height: 100vh;
          padding: 40px 20px;
          background: #f9fafb;
        }
        h1 {
          text-align: center;
          margin-bottom: 8px;
        }
        .subtitle {
          text-align: center;
          color: #6b7280;
          margin-bottom: 32px;
        }
        .plans {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          max-width: 640px;
          margin: 0 auto;
        }
        .plan-card {
          position: relative;
          padding: 32px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .plan-card.featured {
          border: 2px solid #2563eb;
        }
        .badge {
          position: absolute;
          top: -12px;
          right: 16px;
          padding: 4px 12px;
          background: #2563eb;
          color: white;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .plan-card h2 {
          margin: 0 0 16px;
          font-size: 1.25rem;
        }
        .price {
          font-size: 2.5rem;
          font-weight: 700;
          color: #111827;
        }
        .price span {
          font-size: 1rem;
          font-weight: 400;
          color: #6b7280;
        }
        .savings {
          color: #10b981;
          font-weight: 600;
          margin: 8px 0;
        }
        .plan-card ul {
          list-style: none;
          padding: 0;
          margin: 24px 0;
        }
        .plan-card li {
          padding: 8px 0;
          color: #4b5563;
        }
        .plan-card li::before {
          content: '✓';
          margin-right: 8px;
          color: #10b981;
        }
        .subscribe-btn {
          width: 100%;
          padding: 14px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
        }
        .subscribe-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .error {
          max-width: 400px;
          margin: 24px auto 0;
          padding: 12px;
          background: #fef2f2;
          color: #dc2626;
          border-radius: 8px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}