'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReferralPage() {
  const [loading, setLoading] = useState(true);
  const [referralData, setReferralData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login?redirect=/referral');
      return;
    }
    fetchReferralData();
  }, [router]);

  const fetchReferralData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/referral', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReferralData(data);
      }
    } catch (err) {
      console.error('Failed to fetch referral data:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!referralData) return;
    const link = `${referralData.frontendUrl}/auth/register?ref=${referralData.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="referral-page">
      <h1>邀请好友</h1>
      <p className="subtitle">邀请朋友，双方都获得积分奖励</p>

      <div className="referral-card">
        <div className="code-section">
          <p>你的邀请码</p>
          <div className="code">{referralData?.referralCode}</div>
        </div>

        <div className="link-section">
          <p>分享链接</p>
          <div className="link-box">
            <code>{referralData?.frontendUrl}/auth/register?ref={referralData?.referralCode}</code>
            <button onClick={copyReferralLink}>{copied ? '已复制!' : '复制'}</button>
          </div>
        </div>

        <div className="stats">
          <div className="stat">
            <strong>{referralData?.referralCount || 0}</strong>
            <span>已邀请</span>
          </div>
          <div className="stat">
            <strong>+{(referralData?.referralCount || 0) * 2}</strong>
            <span>获得积分</span>
          </div>
        </div>
      </div>

      <div className="rewards">
        <h2>奖励规则</h2>
        <ul>
          <li>每成功邀请1位朋友，双方各获得 <strong>2 积分</strong></li>
          <li>被邀请人获得 <strong>5 免费积分</strong></li>
          <li>邀请无上限，积分无上限</li>
        </ul>
      </div>

      <style jsx>{`
        .referral-page {
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
        .referral-card {
          max-width: 480px;
          margin: 0 auto;
          padding: 32px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .code-section {
          text-align: center;
          margin-bottom: 24px;
        }
        .code-section p {
          color: #6b7280;
          margin-bottom: 8px;
        }
        .code {
          font-size: 2rem;
          font-weight: 700;
          color: #2563eb;
          letter-spacing: 4px;
        }
        .link-section {
          margin-bottom: 24px;
        }
        .link-section p {
          color: #6b7280;
          margin-bottom: 8px;
        }
        .link-box {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .link-box code {
          flex: 1;
          padding: 12px;
          background: #f3f4f6;
          border-radius: 8px;
          font-size: 0.75rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .link-box button {
          padding: 12px 20px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          white-space: nowrap;
        }
        .stats {
          display: flex;
          justify-content: center;
          gap: 40px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }
        .stat {
          text-align: center;
        }
        .stat strong {
          display: block;
          font-size: 1.5rem;
          color: #10b981;
        }
        .stat span {
          font-size: 0.875rem;
          color: #6b7280;
        }
        .rewards {
          max-width: 480px;
          margin: 32px auto 0;
          padding: 24px;
          background: white;
          border-radius: 16px;
        }
        .rewards h2 {
          font-size: 1.125rem;
          margin-bottom: 16px;
        }
        .rewards ul {
          list-style: none;
          padding: 0;
        }
        .rewards li {
          padding: 8px 0;
          color: #4b5563;
        }
        .rewards li strong {
          color: #10b981;
        }
      `}</style>
    </div>
  );
}