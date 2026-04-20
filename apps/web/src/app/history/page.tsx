'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="history-page">
      <h1>计算历史</h1>
      
      {calculations.length === 0 ? (
        <div className="empty">
          <p>暂无计算记录</p>
          <a href="/bazi">开始计算</a>
        </div>
      ) : (
        <div className="list">
          {calculations.map((calc) => (
            <div key={calc._id} className="item" onClick={() => setSelected(calc)}>
              <div className="bazi">
                {calc.bazi.year} {calc.bazi.month} {calc.bazi.day} {calc.bazi.hour}
              </div>
              <div className="date">{new Date(calc.createdAt).toLocaleDateString('zh-CN')}</div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div className="detail" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setSelected(null)}>×</button>
            <h2>八字</h2>
            <div className="bazi-grid">
              <div>年柱: {selected.bazi.year}</div>
              <div>月柱: {selected.bazi.month}</div>
              <div>日柱: {selected.bazi.day}</div>
              <div>时柱: {selected.bazi.hour}</div>
            </div>
            <h3>解读</h3>
            <p className="interpretation">{selected.interpretation || '无解读'}</p>
            <button className="delete" onClick={() => deleteHistory(selected._id)}>删除</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .history-page {
          min-height: 100vh;
          padding: 24px;
          background: #f9fafb;
        }
        h1 {
          margin-bottom: 24px;
        }
        .empty {
          text-align: center;
          padding: 60px 20px;
        }
        .empty a {
          display: inline-block;
          margin-top: 16px;
          padding: 12px 24px;
          background: #2563eb;
          color: white;
          border-radius: 8px;
          text-decoration: none;
        }
        .list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .item {
          background: white;
          padding: 16px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .bazi {
          font-size: 1.125rem;
          font-weight: 600;
        }
        .date {
          color: #6b7280;
          font-size: 0.875rem;
        }
        .modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .detail {
          background: white;
          border-radius: 16px;
          padding: 24px;
          max-width: 500px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
        }
        .close {
          position: absolute;
          top: 12px;
          right: 12px;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }
        .bazi-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding: 16px 0;
        }
        .interpretation {
          padding: 16px;
          background: #f3f4f6;
          border-radius: 8px;
          white-space: pre-wrap;
          font-size: 0.875rem;
          line-height: 1.6;
        }
        .delete {
          width: 100%;
          margin-top: 16px;
          padding: 12px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}