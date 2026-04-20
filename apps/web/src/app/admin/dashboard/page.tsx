'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Stats {
  totalUsers: number;
  totalCalculations: number;
  activeToday: number;
  totalRevenue: number;
  subscriptionCount: number;
  recentUsers: any[];
  recentCalculations: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        router.push('/admin');
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header>
        <h1>管理后台</h1>
        <button onClick={logout}>退出登录</button>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats?.totalUsers || 0}</div>
          <div className="stat-label">总用户</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalCalculations || 0}</div>
          <div className="stat-label">总计算</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.activeToday || 0}</div>
          <div className="stat-label">今日活跃</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.subscriptionCount || 0}</div>
          <div className="stat-label">订阅用户</div>
        </div>
      </div>

      <div className="sections">
        <section>
          <h2>最近注册用户</h2>
          <table>
            <thead>
              <tr>
                <th>邮箱</th>
                <th>积分</th>
                <th>订阅</th>
                <th>注册时间</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentUsers?.map((user: any) => (
                <tr key={user._id}>
                  <td>{user.email}</td>
                  <td>{user.credits}</td>
                  <td>{user.isSubscribed ? '✓' : '-'}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString('zh-CN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2>最近计算</h2>
          <table>
            <thead>
              <tr>
                <th>用户ID</th>
                <th>八字</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentCalculations?.map((calc: any) => (
                <tr key={calc._id}>
                  <td>{calc.userId || '游客'}</td>
                  <td>{calc.bazi?.year} {calc.bazi?.month}</td>
                  <td>{new Date(calc.createdAt).toLocaleDateString('zh-CN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background: #f3f4f6;
          padding: 24px;
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        header h1 {
          margin: 0;
        }
        header button {
          padding: 8px 16px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
        }
        .stat-label {
          color: #6b7280;
          font-size: 0.875rem;
        }
        .sections {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }
        section {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        h2 {
          margin: 0 0 16px;
          font-size: 1.125rem;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        th {
          font-weight: 600;
          color: #6b7280;
          font-size: 0.75rem;
          text-transform: uppercase;
        }
        td {
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}