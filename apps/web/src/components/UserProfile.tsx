'use client';

import { useState, useEffect } from 'react';

interface UserProfile {
  id: string;
  email: string;
  credits: number;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  totalCreditsUsed: number;
  totalCalculations: number;
  createdAt: string;
  lastActiveDate: string;
  creditsRemaining: number;
}

export default function UserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data.data);
      setNewEmail(data.data.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/user/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail) {
      setError('Email cannot be empty');
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ email: newEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const data = await response.json();
      setProfile(data.data);
      setEditMode(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update email');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="profile-container"><p>Loading profile...</p></div>;
  }

  return (
    <div className="profile-container">
      <h1>User Profile</h1>

      {error && <div className="error-message">{error}</div>}

      {profile && (
        <div className="profile-card">
          <div className="profile-section">
            <h2>Account Information</h2>

            <div className="profile-field">
              <label>Email:</label>
              {editMode ? (
                <div className="email-edit">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                  <button
                    onClick={handleUpdateEmail}
                    disabled={updating}
                    className="btn-primary"
                  >
                    {updating ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setNewEmail(profile.email);
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="email-display">
                  <span>{profile.email}</span>
                  <button
                    onClick={() => setEditMode(true)}
                    className="btn-secondary"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            <div className="profile-field">
              <label>Credits Available:</label>
              <span className="credits-display">{profile.credits}</span>
            </div>

            <div className="profile-field">
              <label>Member Since:</label>
              <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {stats && (
            <div className="stats-section">
              <h2>Usage Statistics</h2>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{stats.totalCalculations}</div>
                  <div className="stat-label">Total Calculations</div>
                </div>

                <div className="stat-card">
                  <div className="stat-value">{stats.totalCreditsUsed}</div>
                  <div className="stat-label">Credits Used</div>
                </div>

                <div className="stat-card">
                  <div className="stat-value">{stats.creditsRemaining}</div>
                  <div className="stat-label">Credits Remaining</div>
                </div>

                <div className="stat-card">
                  <div className="stat-value">
                    {new Date(stats.lastActiveDate).toLocaleDateString()}
                  </div>
                  <div className="stat-label">Last Active</div>
                </div>
              </div>
            </div>
          )}

          <div className="profile-actions">
            <button
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
              className="btn-logout"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .profile-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        h1 {
          margin-bottom: 20px;
          color: #333;
        }

        .error-message {
          background: #ffe6e6;
          color: #d32f2f;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .profile-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 30px;
        }

        .profile-section,
        .stats-section {
          margin-bottom: 30px;
        }

        .profile-section h2,
        .stats-section h2 {
          font-size: 18px;
          margin-bottom: 20px;
          color: #333;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 10px;
        }

        .profile-field {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .profile-field label {
          font-weight: 600;
          color: #666;
          min-width: 150px;
        }

        .email-display,
        .credits-display {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .email-edit {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .email-edit input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          flex: 1;
        }

        .credits-display {
          font-size: 18px;
          font-weight: bold;
          color: #0070f3;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }

        .stat-card {
          background: #f9f9f9;
          border-radius: 6px;
          padding: 20px;
          text-align: center;
          border: 1px solid #f0f0f0;
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #0070f3;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .profile-actions {
          display: flex;
          gap: 10px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #f0f0f0;
        }

        button {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #0070f3;
          color: white;
        }

        .btn-primary:hover {
          background: #0051cc;
        }

        .btn-secondary {
          background: #f0f0f0;
          color: #333;
        }

        .btn-secondary:hover {
          background: #e0e0e0;
        }

        .btn-logout {
          background: #d32f2f;
          color: white;
          margin-left: auto;
        }

        .btn-logout:hover {
          background: #b71c1c;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
