'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

interface Calculation {
  _id: string;
  bazi: { year: string; month: string; day: string; hour: string };
  interpretation?: string;
  createdAt: string;
}

export default function HistoryPage() {
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Calculation | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login?redirect=/history');
      return;
    }
    fetchHistory();
  }, [router]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCalculations(data.calculations || []);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteHistory = async (id: string) => {
    if (!confirm('确定删除这条记录？')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setCalculations(calc => calc.filter(c => c._id !== id));
      setSelected(null);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  if (loading) {
    return (
      <div className="history-page">
        <nav className="nav-bar">
          <Link href="/" className="nav-logo">☯ FATEFUL</Link>
          <Link href="/dashboard" className="nav-link">控制台</Link>
        </nav>
        <div className="loading-container">
          <div className="taiji">☯</div>
          <p>Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <nav className="nav-bar">
        <Logo size="sm" />
        <Link href="/dashboard" className="nav-link">控制台</Link>
      </nav>

      <div className="content">
        <header className="page-header">
          <div className="symbol">
            <Logo size="lg" showText={false} />
          </div>
          <h1>
            <span className="zh">计算历史</span>
            <span className="en">Calculation History</span>
          </h1>
        </header>

        {calculations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">☰</div>
            <p>
              <span className="zh">暂无计算记录</span>
              <span className="en">No records yet</span>
            </p>
            <Link href="/bazi" className="btn-start">
              <span className="zh">开始计算</span>
              <span className="en">Start Reading</span>
            </Link>
          </div>
        ) : (
          <div className="history-list">
            {calculations.map((calc) => (
              <div 
                key={calc._id} 
                className="history-item" 
                onClick={() => setSelected(calc)}
              >
                <div className="bazi-display">
                  <div className="pillar">
                    <span className="label">年</span>
                    <span className="value">{calc.bazi.year}</span>
                  </div>
                  <div className="pillar">
                    <span className="label">月</span>
                    <span className="value">{calc.bazi.month}</span>
                  </div>
                  <div className="pillar">
                    <span className="label">日</span>
                    <span className="value">{calc.bazi.day}</span>
                  </div>
                  <div className="pillar">
                    <span className="label">时</span>
                    <span className="value">{calc.bazi.hour}</span>
                  </div>
                </div>
                <div className="meta">
                  <span className="date">{new Date(calc.createdAt).toLocaleDateString('zh-CN')}</span>
                  <span className="arrow">→</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setSelected(null)}>×</button>
              
              <div className="modal-header">
                <h2>
                  <span className="zh">八字解读</span>
                  <span className="en">Bazi Reading</span>
                </h2>
                <p className="date">{new Date(selected.createdAt).toLocaleDateString('zh-CN')}</p>
              </div>

              <div className="four-pillars">
                <div className="pillar">
                  <span className="label">年柱</span>
                  <span className="value">{selected.bazi.year}</span>
                </div>
                <div className="pillar">
                  <span className="label">月柱</span>
                  <span className="value">{selected.bazi.month}</span>
                </div>
                <div className="pillar">
                  <span className="label">日柱</span>
                  <span className="value">{selected.bazi.day}</span>
                </div>
                <div className="pillar">
                  <span className="label">时柱</span>
                  <span className="value">{selected.bazi.hour}</span>
                </div>
              </div>

              <div className="interpretation-section">
                <h3>AI解读</h3>
                <p className="interpretation-text">
                  {selected.interpretation || 'No interpretation available'}
                </p>
              </div>

              <button 
                className="delete-btn" 
                onClick={() => deleteHistory(selected._id)}
              >
                <span className="zh">删除记录</span>
                <span className="en">Delete Record</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .history-page {
          min-height: 100vh;
          padding: 24px;
          position: relative;
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

        .loading-container {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        .loading-container .taiji {
          font-size: 3rem;
          color: var(--cosmic-gold);
          animation: rotate 4s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .content {
          max-width: 600px;
          margin: 0 auto;
        }

        .page-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .symbol {
          font-size: 2.5rem;
          color: var(--cosmic-gold);
          margin-bottom: 16px;
        }

        h1 {
          margin-bottom: 0;
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

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: rgba(26, 22, 53, 0.6);
          border: 1px solid var(--border);
          border-radius: 20px;
        }

        .empty-icon {
          font-size: 3rem;
          color: var(--accent);
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .empty-state p {
          margin-bottom: 24px;
        }

        .empty-state .zh {
          font-family: var(--font-display);
          font-size: 1.25rem;
          margin-bottom: 4px;
        }

        .empty-state .en {
          font-size: 0.8rem;
          opacity: 0.5;
        }

        .btn-start {
          display: inline-flex;
          flex-direction: column;
          gap: 2px;
          padding: 14px 32px;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.4) 0%, rgba(79, 70, 229, 0.5) 100%);
          border: 1px solid var(--accent);
          border-radius: 30px;
          color: #fff;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
        }

        .btn-start:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(124, 58, 237, 0.4);
        }

        .btn-start .en {
          font-size: 0.7rem;
          opacity: 0.7;
          font-weight: 400;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: rgba(26, 22, 53, 0.6);
          border: 1px solid var(--border);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .history-item:hover {
          border-color: var(--accent);
          transform: translateX(4px);
        }

        .bazi-display {
          display: flex;
          gap: 16px;
        }

        .bazi-display .pillar {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .bazi-display .label {
          font-size: 0.65rem;
          color: var(--muted-foreground);
          margin-bottom: 2px;
        }

        .bazi-display .value {
          font-family: var(--font-display);
          font-size: 1rem;
          color: var(--cosmic-gold);
        }

        .meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .meta .date {
          font-size: 0.8rem;
          opacity: 0.6;
        }

        .meta .arrow {
          color: var(--accent);
          opacity: 0;
          transform: translateX(-8px);
          transition: all 0.3s;
        }

        .history-item:hover .meta .arrow {
          opacity: 1;
          transform: translateX(0);
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(3, 0, 20, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 100;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-card {
          background: rgba(26, 22, 53, 0.95);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 32px;
          max-width: 500px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          font-size: 1.5rem;
          color: var(--foreground);
          cursor: pointer;
          opacity: 0.6;
          transition: opacity 0.3s;
        }

        .close-btn:hover {
          opacity: 1;
        }

        .modal-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .modal-header h2 {
          margin-bottom: 8px;
        }

        .modal-header .zh {
          font-family: var(--font-display);
          font-size: 1.25rem;
        }

        .modal-header .date {
          font-size: 0.8rem;
          opacity: 0.5;
        }

        .four-pillars {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .four-pillars .pillar {
          text-align: center;
          padding: 16px 8px;
          background: rgba(3, 0, 20, 0.5);
          border: 1px solid var(--border);
          border-radius: 12px;
        }

        .four-pillars .label {
          display: block;
          font-size: 0.7rem;
          color: var(--muted-foreground);
          margin-bottom: 8px;
        }

        .four-pillars .value {
          display: block;
          font-family: var(--font-display);
          font-size: 1.1rem;
          color: var(--cosmic-gold);
        }

        .interpretation-section {
          margin-bottom: 24px;
        }

        .interpretation-section h3 {
          font-size: 0.9rem;
          margin-bottom: 12px;
          opacity: 0.8;
        }

        .interpretation-text {
          padding: 16px;
          background: rgba(3, 0, 20, 0.4);
          border-radius: 12px;
          font-size: 0.85rem;
          line-height: 1.8;
          white-space: pre-wrap;
        }

        .delete-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          width: 100%;
          padding: 14px;
          background: transparent;
          border: 1px solid rgba(239, 68, 68, 0.5);
          border-radius: 12px;
          color: #ef4444;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .delete-btn .en {
          font-size: 0.7rem;
          opacity: 0.7;
        }

        @media (max-width: 480px) {
          .bazi-display {
            gap: 8px;
          }
          
          .bazi-display .value {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}