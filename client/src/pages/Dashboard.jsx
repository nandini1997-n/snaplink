import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ original_url: '', custom_slug: '', title: '', expires_at: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);

  const fetchLinks = useCallback(async () => {
    try {
      const res = await api.get('/api/links');
      setLinks(res.data.links);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await api.post('/api/links', form);
      setForm({ original_url: '', custom_slug: '', title: '', expires_at: '' });
      await fetchLinks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create link');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this link?')) return;
    try {
      await api.delete(`/api/links/${id}`);
      setLinks(links.filter(l => l.id !== id));
    } catch (err) {
      alert('Failed to delete link');
    }
  };

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const totalClicks = links.reduce((acc, l) => acc + (l.click_count || 0), 0);

  return (
    <div className="dashboard">
      <nav className="navbar">
        <span className="logo">🔗 SnapLink</span>
        <div className="nav-right">
          <span className="user-name">Hi, {user?.name}</span>
          <button className="btn-ghost" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-num">{links.length}</div>
            <div className="stat-label">Total Links</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{totalClicks}</div>
            <div className="stat-label">Total Clicks</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{links.filter(l => l.is_active).length}</div>
            <div className="stat-label">Active Links</div>
          </div>
        </div>

        <div className="create-section">
          <h2>Shorten a URL</h2>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleCreate} className="create-form">
            <input
              type="url"
              placeholder="Paste your long URL here..."
              value={form.original_url}
              onChange={e => setForm({ ...form, original_url: e.target.value })}
              required
              className="url-input"
            />
            <div className="form-row">
              <input
                type="text"
                placeholder="Custom slug (optional)"
                value={form.custom_slug}
                onChange={e => setForm({ ...form, custom_slug: e.target.value })}
              />
              <input
                type="text"
                placeholder="Title (optional)"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
              <input
                type="date"
                placeholder="Expires at"
                value={form.expires_at}
                onChange={e => setForm({ ...form, expires_at: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={creating}>
              {creating ? 'Creating...' : 'Shorten →'}
            </button>
          </form>
        </div>

        <div className="links-section">
          <h2>Your Links</h2>
          {loading ? (
            <div className="loading">Loading your links...</div>
          ) : links.length === 0 ? (
            <div className="empty">No links yet. Create your first one above!</div>
          ) : (
            <div className="links-table-wrap">
              <table className="links-table">
                <thead>
                  <tr>
                    <th>Title / URL</th>
                    <th>Short Link</th>
                    <th>Clicks</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map(link => (
                    <tr key={link.id}>
                      <td>
                        <div className="link-title">{link.title || 'Untitled'}</div>
                        <div className="link-original" title={link.original_url}>
                          {link.original_url.length > 50
                            ? link.original_url.slice(0, 50) + '...'
                            : link.original_url}
                        </div>
                      </td>
                      <td>
                        <div className="short-url-cell">
                          <a href={link.short_url} target="_blank" rel="noreferrer" className="short-link">
                            /{link.slug}
                          </a>
                          <button
                            className="btn-copy"
                            onClick={() => handleCopy(link.short_url, link.id)}
                          >
                            {copied === link.id ? '✓ Copied' : 'Copy'}
                          </button>
                        </div>
                      </td>
                      <td><span className="click-badge">{link.click_count || 0}</span></td>
                      <td className="date-cell">{new Date(link.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="action-btns">
                          <Link to={`/analytics/${link.id}`} className="btn-analytics">Analytics</Link>
                          <button className="btn-delete" onClick={() => handleDelete(link.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
