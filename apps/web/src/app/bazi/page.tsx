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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/bazi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          year: parseInt(year, 10),
          month: parseInt(month, 10),
          day: parseInt(day, 10),
          hour: parseInt(hour, 10),
          longitude: parseFloat(longitude),
          latitude: parseFloat(latitude),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to calculate bazi');
      }

      const data = await response.json();
      setResult(data.data);
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
          {loading ? '计算中...' : '计算八字'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

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
      `}</style>
    </div>
  );
}
  // 1. 支付
  const { clientSecret } = await fetch('/api/create-payment-intent', {
    method: 'POST',
    body: JSON.stringify({ amount: 1000 }),
  }).then((res) => res.json());
  const { paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: elements.getElement(CardElement),
    },
  });
  // 2. 调用八字 API
  const res = await fetch('/api/bazi', {
    method: 'POST',
    body: JSON.stringify({
      year,
      month,
      day,
      hour,
      longitude,
      latitude,
      paymentId: paymentIntent.id,
    }),
  });
  const data = await res.json();
  setResult(data);
};
