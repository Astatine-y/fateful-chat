'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LifetimePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handlePurchase = async (platform: 'gumroad' | 'appmo' | 'stripe') => {
    setLoading(platform);
    setError(null);

    try {
      if (platform === 'gumroad') {
        window.location.href = `https://gum.co/fateful-chat-lifetime?wanted=${encodeURIComponent(window.location.href)}`;
        return;
      }
      if (platform === 'appmo') {
        window.location.href = `https://appsumo.com/products/fateful-chat-lifetime/`;
        return;
      }
      
      const token = localStorage.getItem('token');
      const res = await fetch('/api/subscription/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: 'lifetime', lifetime: true }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError('Failed to redirect. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="lifetime-page">
      <div className="hero">
        <div className="badge">限时优惠</div>
        <h1>终身会员</h1>
        <p className="subtitle">一次购买，终身无限使用</p>
      </div>

      <div className="offer">
        <div className="price-box">
          <div className="original">原价 ¥1,999</div>
          <div className="deal">¥399</div>
          <div className="discount">省80%</div>
        </div>

        <ul className="features">
          <li>✓ 无限次八字计算</li>
          <li>✓ 无限次AI智能解读</li>
          <li>✓ 终身专属客服</li>
          <li>✓ 优先体验新功能</li>
          <li>✓ 云端历史记录</li>
          <li>✓ 高级主题</li>
        </ul>

        <div className="cta">
          <button onClick={() => handlePurchase('stripe')} disabled={!!loading}>
            {loading === 'stripe' ? '处理中...' : '立即获取'}
          </button>
          <p className="guarantee">30天无理由退款</p>
        </div>
      </div>

      <div className="platforms">
        <p>也可在以下平台购买</p>
        <div className="buttons">
          <button onClick={() => handlePurchase('gumroad')} disabled={!!loading}>
            Gumroad
          </button>
          <button onClick={() => handlePurchase('appmo')} disabled={!!loading}>
            AppSumo
          </button>
        </div>
      </div>

      <div className="faq">
        <h2>常见问题</h2>
        <details>
          <summary>终身会员有什么限制？</summary>
          <p>没有任何限制。终身会员可无限使用所有功能，包括未来的新功能。</p>
        </details>
        <details>
          <summary>如何退款？</summary>
          <p>30天内可无理由退款，联系客服即可。</p>
        </details>
        <details>
          <summary>终身是多久？</summary>
          <p>只要服务存在，你就可以一直使用。</p>
        </details>
        <details>
          <summary>已有订阅能升级吗？</summary>
          <p>可以，按剩余时间折算差价。</p>
        </details>
      </div>

      {error && <div className="error">{error}</div>}

      <style jsx>{`
        .lifetime-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: white;
          padding: 40px 20px;
        }
        .hero {
          text-align: center;
          margin-bottom: 40px;
        }
        .badge {
          display: inline-block;
          padding: 8px 16px;
          background: #ff4757;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 16px;
        }
        h1 {
          font-size: 3rem;
          margin-bottom: 8px;
        }
        .subtitle {
          font-size: 1.25rem;
          opacity: 0.8;
        }
        .offer {
          max-width: 480px;
          margin: 0 auto 40px;
          background: rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 40px;
          backdrop-filter: blur(10px);
        }
        .price-box {
          text-align: center;
          margin-bottom: 32px;
        }
        .original {
          font-size: 1.25rem;
          text-decoration: line-through;
          opacity: 0.6;
        }
        .deal {
          font-size: 4rem;
          font-weight: 700;
          color: #2ed573;
        }
        .discount {
          display: inline-block;
          padding: 4px 12px;
          background: #ff4757;
          border-radius: 12px;
          font-weight: 600;
        }
        .features {
          list-style: none;
          padding: 0;
          margin: 32px 0;
        }
        .features li {
          padding: 12px 0;
          font-size: 1.125rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .cta {
          text-align: center;
        }
        .cta button {
          width: 100%;
          padding: 18px;
          background: #2ed573;
          color: #1a1a2e;
          border: none;
          border-radius: 12px;
          font-size: 1.25rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .cta button:hover {
          transform: scale(1.02);
        }
        .cta button:disabled {
          opacity: 0.6;
        }
        .guarantee {
          margin-top: 12px;
          font-size: 0.875rem;
          opacity: 0.7;
        }
        .platforms {
          text-align: center;
          margin-bottom: 40px;
        }
        .platforms p {
          margin-bottom: 16px;
          opacity: 0.7;
        }
        .platforms .buttons {
          display: flex;
          justify-content: center;
          gap: 16px;
        }
        .platforms button {
          padding: 12px 24px;
          background: rgba(255,255,255,0.1);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          cursor: pointer;
        }
        .platforms button:hover {
          background: rgba(255,255,255,0.2);
        }
        .faq {
          max-width: 600px;
          margin: 0 auto;
        }
        .faq h2 {
          text-align: center;
          margin-bottom: 24px;
        }
        .faq details {
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          margin-bottom: 12px;
          padding: 16px;
        }
        .faq summary {
          cursor: pointer;
          font-weight: 600;
        }
        .faq p {
          margin-top: 12px;
          opacity: 0.8;
          font-size: 0.875rem;
        }
        .error {
          text-align: center;
          padding: 12px;
          background: #ff4757;
          border-radius: 8px;
          margin-top: 16px;
        }
      `}</style>
    </div>
  );
}