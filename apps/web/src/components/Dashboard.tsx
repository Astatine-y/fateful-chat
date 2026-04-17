'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface UserData {
  id: string;
  email: string;
  credits: number;
}

interface RecentCalculation {
  id: string;
  bazi: string;
  date: string;
  creditsUsed: number;
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
    return <div className="dashboard"><p>Loading dashboard...</p></div>;
  }

  if (error) {
    return <div className="dashboard"><p className="error">{error}</p></div>;
  }

  return (
    <div className="dashboard">
      <div className="header">
        <h1>Dashboard</h1>
        <p className="greeting">Welcome back, {user?.email}! 👋</p>
      </div>

      <div className="cards-grid">
        {/* Credits Card */}
        <div className="card credits-card">
          <div className="card-icon">💳</div>
          <div className="card-content">
            <h3>Available Credits</h3>
            <div className="card-value">{user?.credits || 0}</div>
            <Link href="/bazi" className="card-link">
              Use Credits →
            </Link>
          </div>
        </div>

        {/* Calculations Card */}
        <div className="card calculations-card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>My Calculations</h3>
            <div className="card-value">0</div>
            <Link href="/history" className="card-link">
              View History →
            </Link>
          </div>
        </div>

        {/* Buy Credits Card */}
        <div className="card buy-card">
          <div className="card-icon">⭐</div>
          <div className="card-content">
            <h3>Buy More Credits</h3>
            <p className="card-description">Add more credits to your account</p>
            <Link href="/bazi?tab=payment" className="card-link">
              Top Up →
            </Link>
          </div>
        </div>

        {/* Settings Card */}
        <div className="card settings-card">
          <div className="card-icon">⚙️</div>
          <div className="card-content">
            <h3>Account Settings</h3>
            <p className="card-description">Manage your profile</p>
            <Link href="/profile" className="card-link">
              Settings →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Start Section */}
      <div className="section">
        <h2>Quick Start</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Enter Your Birth Information</h4>
              <p>Provide your birth date, time, and location</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Get Your Bazi Analysis</h4>
              <p>Receive detailed analysis and AI interpretation</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Save & Share</h4>
              <p>Store your results and share with friends</p>
            </div>
          </div>
        </div>

        <Link href="/bazi" className="cta-button">
          Start Analysis Now
        </Link>
      </div>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 40px 20px;
        }

        .header {
          max-width: 1200px;
          margin: 0 auto 40px;
          text-align: center;
        }

        h1 {
          font-size: 32px;
          margin: 0;
          color: #333;
        }

        .greeting {
          font-size: 16px;
          color: #666;
          margin: 10px 0 0;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto 40px;
        }

        .card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          display: flex;
          gap: 16px;
          align-items: flex-start;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
        }

        .card-icon {
          font-size: 32px;
          min-width: 50px;
        }

        .card-content {
          flex: 1;
        }

        .card-content h3 {
          margin: 0 0 8px;
          font-size: 16px;
          color: #333;
        }

        .card-value {
          font-size: 28px;
          font-weight: bold;
          color: #0070f3;
          margin: 8px 0;
        }

        .card-description {
          font-size: 12px;
          color: #999;
          margin: 0;
        }

        .card-link {
          display: inline-block;
          margin-top: 12px;
          color: #0070f3;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .card-link:hover {
          color: #0051cc;
        }

        .section {
          max-width: 1200px;
          margin: 0 auto 40px;
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .section h2 {
          margin-top: 0;
          color: #333;
          font-size: 20px;
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }

        .step {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .step-number {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #0070f3;
          color: white;
          font-weight: bold;
          flex-shrink: 0;
        }

        .step-content h4 {
          margin: 0 0 4px;
          color: #333;
          font-size: 14px;
        }

        .step-content p {
          margin: 0;
          color: #999;
          font-size: 12px;
        }

        .cta-button {
          display: inline-block;
          background: #0070f3;
          color: white;
          padding: 12px 32px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s;
          margin-top: 20px;
        }

        .cta-button:hover {
          background: #0051cc;
          transform: translateX(2px);
        }

        .error {
          color: #d32f2f;
          background: #ffe6e6;
          padding: 12px;
          border-radius: 4px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
