'use client';

import { useState } from 'react';
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
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
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

  return (
    <div className="bazi-form">
      <h2>八字计算</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="出生年份"
            required
          />
          <input
            type="number"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="出生月份 (1-12)"
            min="1"
            max="12"
            required
          />
          <input
            type="number"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            placeholder="出生日期 (1-31)"
            min="1"
            max="31"
            required
          />
          <input
            type="number"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            placeholder="出生时辰 (0-23)"
            min="0"
            max="23"
            required
          />
          <input
            type="number"
            step="0.01"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="出生地经度"
            min="-180"
            max="180"
            required
          />
          <input
            type="number"
            step="0.01"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="出生地纬度"
            min="-90"
            max="90"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? '计算中...' : '计算八字 (免费每日1次)'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}
      {showCta && (
        <div className="cta">
          <p>今日免费次数已用完</p>
          <a href="/auth/register" className="cta-button">创建账户获取5免费积分</a>
        </div>
      )}

      {result && (
        <div className="result">
          <h3>八字结果</h3>
          <div className="bazi-data">
            <p>
              <strong>年柱：</strong> {result.bazi.year}
            </p>
            <p>
              <strong>月柱：</strong> {result.bazi.month}
            </p>
            <p>
              <strong>日柱：</strong> {result.bazi.day}
            </p>
            <p>
              <strong>时柱：</strong> {result.bazi.hour}
            </p>
          </div>
          <div className="interpretation">
            <h4>AI解读</h4>
            <p>{result.interpretation}</p>
          </div>
          <p className="credits">剩余次数：{result.creditsRemaining}</p>
          {showEmailCapture && !emailCaptured && (
            <div className="email-capture">
              <p>保存你的解读？输入邮箱保存结果</p>
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
                    alert('已创建账户并保存你的解读！');
                  }
                } catch {
                  alert('保存失败，请重试');
                }
              }}>
                <input
                  type="email"
                  value={emailCapture}
                  onChange={(e) => setEmailCapture(e.target.value)}
                  placeholder="输入邮箱"
                  required
                />
                <button type="submit">保存</button>
              </form>
            </div>
          )}
          <div className="share-buttons">
            <button type="button" onClick={() => {
              const text = `我的八字：${result.bazi.year}年 ${result.bazi.month}月 ${result.bazi.day}日 ${result.bazi.hour}时\n用Fateful Chat查看你的八字！`;
              if (navigator.share) {
                navigator.share({ text });
              } else {
                navigator.clipboard.writeText(text);
                alert('已复制到剪贴板！');
              }
            }} className="share-btn">
              分享结果
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState('10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe not loaded');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment intent
      const intentResponse = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          creditsToAdd: Math.floor(parseFloat(amount) / 2), // $2 per credit
        }),
      });

      if (!intentResponse.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await intentResponse.json();

      // Confirm payment
      const { error: paymentError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (paymentError) {
        setError(paymentError.message || 'Payment failed');
      } else {
        setSuccess(true);
        setAmount('10');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-form">
      <h2>充值积分</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>金额 (USD)：</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="金额"
            min="1"
            step="0.01"
            required
          />
        </div>
        <div className="form-group">
          <label>卡片信息：</label>
          <CardElement />
        </div>
        <button type="submit" disabled={!stripe || loading}>
          {loading ? '处理中...' : '支付'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">支付成功！积分已添加。</div>}
    </div>
  );
}

export default function BaziPage() {
  const [activeTab, setActiveTab] = useState<'bazi' | 'payment'>('bazi');

  return (
    <div className="bazi-page">
      <h1>八字解读系统</h1>
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'bazi' ? 'active' : ''}`}
          onClick={() => setActiveTab('bazi')}
        >
          八字计算
        </button>
        <button
          className={`tab ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment')}
        >
          充值
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'bazi' ? (
          <BaziForm />
        ) : (
          <Elements stripe={stripePromise}>
            <PaymentForm />
          </Elements>
        )}
      </div>

      <style jsx>{`
        .bazi-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .tabs {
          display: flex;
          gap: 10px;
          margin: 20px 0;
        }

        .tab {
          padding: 10px 20px;
          border: none;
          background: #f0f0f0;
          cursor: pointer;
          border-radius: 4px;
          transition: background 0.3s;
        }

        .tab.active {
          background: #0070f3;
          color: white;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin: 15px 0;
        }

        .form-group input {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        button {
          padding: 10px 20px;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error {
          color: red;
          padding: 10px;
          background: #ffe6e6;
          border-radius: 4px;
          margin: 10px 0;
        }

        .success {
          color: green;
          padding: 10px;
          background: #e6ffe6;
          border-radius: 4px;
          margin: 10px 0;
        }

        .result {
          margin-top: 20px;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 4px;
        }

        .bazi-data {
          background: white;
          padding: 15px;
          border-radius: 4px;
          margin: 10px 0;
        }

        .interpretation {
          margin-top: 15px;
          padding: 15px;
          background: white;
          border-radius: 4px;
        }

        .credits {
          font-weight: bold;
          margin-top: 10px;
        }

        .cta {
          margin-top: 15px;
          padding: 20px;
          background: #fff7ed;
          border-radius: 8px;
          text-align: center;
        }

        .cta p {
          margin-bottom: 12px;
          color: #9a3412;
        }

        .cta-button {
          display: inline-block;
          padding: 12px 24px;
          background: #ea580c;
          color: white;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
        }

        .share-buttons {
          margin-top: 16px;
          display: flex;
          gap: 12px;
        }

        .share-btn {
          padding: 10px 20px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .email-capture {
          margin-top: 16px;
          padding: 16px;
          background: #f0f9ff;
          border-radius: 8px;
          text-align: center;
        }

        .email-capture p {
          margin-bottom: 12px;
          color: #0369a1;
          font-size: 0.875rem;
        }

        .email-capture form {
          display: flex;
          gap: 8px;
        }

        .email-capture input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #bae6fd;
          border-radius: 6px;
        }

        .email-capture button {
          padding: 8px 16px;
          background: #0284c7;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

