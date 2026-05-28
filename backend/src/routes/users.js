const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { query } = require('../db');

router.get('/profile', authenticate, async (req, res) => {
  const { rows } = await query(
    'SELECT id,email,full_name,role,avatar_url,github_username,bio FROM users WHERE id = $1',
    [req.user.id]
  );
  res.json({ user: rows[0] });
});

router.patch('/profile', authenticate, async (req, res) => {
  const { fullName, bio, githubUsername, avatarUrl } = req.body;
  const { rows } = await query(`
    UPDATE users SET
      full_name = COALESCE($1, full_name),
      bio = COALESCE($2, bio),
      github_username = COALESCE($3, github_username),
      avatar_url = COALESCE($4, avatar_url)
    WHERE id = $5
    RETURNING id, email, full_name, role, avatar_url, github_username, bio
  `, [fullName, bio, githubUsername, avatarUrl, req.user.id]);
  res.json({ user: rows[0] });
});

module.exports = router;
