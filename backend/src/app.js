const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes       = require('./routes/auth');
const userRoutes       = require('./routes/users');
const courseRoutes     = require('./routes/courses');
const lessonRoutes     = require('./routes/lessons');
const enrollmentRoutes = require('./routes/enrollments');
const assignmentRoutes = require('./routes/assignments');
const submissionRoutes = require('./routes/submissions');
const progressRoutes   = require('./routes/progress');
const adminRoutes      = require('./routes/admin');
const webhookRoutes    = require('./routes/webhooks');

const app = express();

// ── Security ─────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// ── Body parsing ──────────────────────────────────────────────
// Raw body for GitHub webhook signature verification
app.use('/api/webhooks/github', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ───────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/users',       userRoutes);
app.use('/api/courses',     courseRoutes);
app.use('/api/lessons',     lessonRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/progress',    progressRoutes);
app.use('/api/admin',       adminRoutes);
app.use('/api/webhooks',    webhookRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── Error handler ─────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
