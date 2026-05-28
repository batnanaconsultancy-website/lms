const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../db');

function signAccess(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, fullName: user.full_name },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
}

function signRefresh(userId) {
  return jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
}

async function register(req, res) {
  const { email, password, fullName, role = 'student' } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'email, password, and fullName are required' });
  }
  if (!['student', 'instructor'].includes(role)) {
    return res.status(400).json({ error: 'role must be student or instructor' });
  }

  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length) return res.status(409).json({ error: 'Email already registered' });

  const hash = await bcrypt.hash(password, 12);
  const { rows } = await query(
    'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1,$2,$3,$4) RETURNING id,email,full_name,role,created_at',
    [email.toLowerCase(), hash, fullName, role]
  );
  const user = rows[0];

  const accessToken  = signAccess(user);
  const refreshToken = signRefresh(user.id);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)',
    [user.id, refreshToken, expiresAt]
  );

  res.status(201).json({ user, accessToken, refreshToken });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const { rows } = await query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email.toLowerCase()]);
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken  = signAccess(user);
  const refreshToken = signRefresh(user.id);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)',
    [user.id, refreshToken, expiresAt]
  );

  const { password_hash, ...safeUser } = user;
  res.json({ user: safeUser, accessToken, refreshToken });
}

async function refreshToken(req, res) {
  const { refreshToken: token } = req.body;
  if (!token) return res.status(400).json({ error: 'Refresh token required' });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  const { rows: tokenRows } = await query(
    'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
    [token]
  );
  if (!tokenRows.length) return res.status(401).json({ error: 'Refresh token expired or revoked' });

  const { rows: userRows } = await query('SELECT * FROM users WHERE id = $1', [decoded.id]);
  const user = userRows[0];
  if (!user) return res.status(401).json({ error: 'User not found' });

  // Rotate refresh token
  await query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
  const newAccess  = signAccess(user);
  const newRefresh = signRefresh(user.id);
  const expiresAt  = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)',
    [user.id, newRefresh, expiresAt]);

  res.json({ accessToken: newAccess, refreshToken: newRefresh });
}

async function logout(req, res) {
  const { refreshToken: token } = req.body;
  if (token) await query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
  res.json({ message: 'Logged out' });
}

async function getMe(req, res) {
  const { rows } = await query(
    'SELECT id,email,full_name,role,avatar_url,github_username,bio,created_at FROM users WHERE id = $1',
    [req.user.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'User not found' });
  res.json({ user: rows[0] });
}

module.exports = { register, login, refreshToken, logout, getMe };
