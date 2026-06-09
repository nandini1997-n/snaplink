import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../api/axios';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6'];

export default function Analytics() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/links/${id}/analytics`)
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-full">Loading analytics...</div>;
  if (error) return <div className="error-full">{error}</div>;

  const { link, analytics } = data;

  return (
    <div className="analytics-page">
      <nav className="navbar">
        <span className="logo">🔗 SnapLink</span>
        <Link to="/dashboard" className="btn-ghost">← Back to Dashboard</Link>
      </nav>

      <div className="analytics-content">
        <div className="analytics-header">
          <h1>{link.title || 'Link Analytics'}</h1>
          <div className="link-meta">
            <a href={link.short_url} target="_blank" rel="noreferrer" className="short-link-big">
              {link.short_url}
            </a>
            <span className="arrow">→</span>
            <span className="original-small">{link.original_url}</span>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-card highlight">
            <div className="stat-num">{analytics.total_clicks}</div>
            <div className="stat-label">Total Clicks</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{analytics.devices.length > 0 ? analytics.devices[0].device : '—'}</div>
            <div className="stat-label">Top Device</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{analytics.browsers.length > 0 ? analytics.browsers[0].browser : '—'}</div>
            <div className="stat-label">Top Browser</div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card wide">
            <h3>Clicks — Last 7 Days</h3>
            {analytics.daily_clicks.length === 0 ? (
              <div className="chart-empty">No click data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={analytics.daily_clicks}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} name="Clicks" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="chart-card">
            <h3>Devices</h3>
            {analytics.devices.length === 0 ? (
              <div className="chart-empty">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={analytics.devices} dataKey="count" nameKey="device" cx="50%" cy="50%" outerRadius={70} label>
                    {analytics.devices.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="chart-card">
            <h3>Top Browsers</h3>
            <div className="browser-list">
              {analytics.browsers.length === 0 ? (
                <div className="chart-empty">No data yet</div>
              ) : analytics.browsers.map((b, i) => (
                <div key={i} className="browser-row">
                  <span className="browser-name">{b.browser}</span>
                  <div className="browser-bar-wrap">
                    <div
                      className="browser-bar"
                      style={{ width: `${(b.count / analytics.total_clicks) * 100}%` }}
                    />
                  </div>
                  <span className="browser-count">{b.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
