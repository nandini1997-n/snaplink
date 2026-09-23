const pool = require('../db/pool');
const { nanoid } = require('nanoid');
const UAParser = require('ua-parser-js');

// POST /api/links
const createLink = async (req, res) => {
  const { original_url, custom_slug, title, expires_at } = req.body;
  if (!original_url)
    return res.status(400).json({ message: 'URL is required' });

  try {
    new URL(original_url);
  } catch {
    return res.status(400).json({ message: 'Invalid URL format' });
  }

  const slug = custom_slug || nanoid(6);

  try {
    if (custom_slug) {
      const existing = await pool.query('SELECT id FROM links WHERE slug = $1', [slug]);
      if (existing.rows.length > 0)
        return res.status(409).json({ message: 'This custom slug is already taken' });
    }

    const result = await pool.query(
      `INSERT INTO links (user_id, original_url, slug, title, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, original_url, slug, title || null, expires_at || null]
    );

    const link = result.rows[0];
    link.short_url = `${process.env.BASE_URL}/${link.slug}`;
    res.status(201).json({ link });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/links
const getLinks = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*, COUNT(c.id)::int AS click_count
       FROM links l
       LEFT JOIN clicks c ON c.link_id = l.id
       WHERE l.user_id = $1
       GROUP BY l.id
       ORDER BY l.created_at DESC`,
      [req.user.id]
    );

    const links = result.rows.map(link => ({
      ...link,
      short_url: `${process.env.BASE_URL}/${link.slug}`,
    }));

    res.json({ links });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/links/:id
const deleteLink = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM links WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Link not found' });
    res.json({ message: 'Link deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/links/:id/analytics
const getAnalytics = async (req, res) => {
  const { id } = req.params;
  try {
    const linkResult = await pool.query(
      'SELECT * FROM links WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (linkResult.rows.length === 0)
      return res.status(404).json({ message: 'Link not found' });

    const link = linkResult.rows[0];
    link.short_url = `${process.env.BASE_URL}/${link.slug}`;

    // Total clicks
    const totalResult = await pool.query(
      'SELECT COUNT(*)::int AS total FROM clicks WHERE link_id = $1', [id]
    );

    // Clicks per day (last 7 days)
    const dailyResult = await pool.query(
      `SELECT DATE(clicked_at) AS date, COUNT(*)::int AS count
       FROM clicks WHERE link_id = $1 AND clicked_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(clicked_at) ORDER BY date`, [id]
    );

    // Device breakdown
    const deviceResult = await pool.query(
      `SELECT device, COUNT(*)::int AS count
       FROM clicks WHERE link_id = $1
       GROUP BY device ORDER BY count DESC`, [id]
    );

    // Browser breakdown
    const browserResult = await pool.query(
      `SELECT browser, COUNT(*)::int AS count
       FROM clicks WHERE link_id = $1
       GROUP BY browser ORDER BY count DESC LIMIT 5`, [id]
    );

    res.json({
      link,
      analytics: {
        total_clicks: totalResult.rows[0].total,
        daily_clicks: dailyResult.rows,
        devices: deviceResult.rows,
        browsers: browserResult.rows,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /:slug  (public redirect)
const redirectLink = async (req, res) => {
  const { slug } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM links WHERE slug = $1 AND is_active = true', [slug]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Link not found' });

    const link = result.rows[0];

    if (link.expires_at && new Date(link.expires_at) < new Date())
      return res.status(410).json({ message: 'This link has expired' });

    // Log the click
    const ua = UAParser(req.headers['user-agent']);
    const device = ua.device.type || 'desktop';
    const browser = ua.browser.name || 'unknown';
    const referrer = req.headers.referer || null;

    await pool.query(
      'INSERT INTO clicks (link_id, device, browser, referrer) VALUES ($1, $2, $3, $4)',
      [link.id, device, browser, referrer]
    );

    res.redirect(link.original_url);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createLink, getLinks, deleteLink, getAnalytics, redirectLink };
