const express = require('express');
const router = express.Router();
const UAParser = require('ua-parser-js');
const pool = require('../db');

// GET /:slug - Redirect to original URL and record click
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM links WHERE slug = $1',
      [slug]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Short link not found.' });

    const link = result.rows[0];

    // Check expiry
    if (link.expires_at && new Date(link.expires_at) < new Date())
      return res.status(410).json({ error: 'This link has expired.' });

    // Parse user agent
    const ua = UAParser(req.headers['user-agent'] || '');
    const device = ua.device.type || 'desktop';
    const browser = ua.browser.name || 'Unknown';

    // Record click (non-blocking)
    pool.query(
      'INSERT INTO clicks (link_id, device, browser) VALUES ($1, $2, $3)',
      [link.id, device, browser]
    ).catch(console.error);

    res.redirect(link.original_url);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
