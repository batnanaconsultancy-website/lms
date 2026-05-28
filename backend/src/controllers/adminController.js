const { query } = require('../db');

async function getDashboardStats(req, res) {
  const [users, courses, enrollments, submissions] = await Promise.all([
    query('SELECT COUNT(*), role FROM users GROUP BY role'),
    query('SELECT COUNT(*) FILTER (WHERE is_published) AS published, COUNT(*) AS total FROM courses'),
    query('SELECT COUNT(*) FROM enrollments'),
    query("SELECT COUNT(*) FROM submissions WHERE status = 'submitted'"),
  ]);

  res.json({
    users: users.rows,
    courses: courses.rows[0],
    totalEnrollments: enrollments.rows[0].count,
    pendingSubmissions: submissions.rows[0].count,
  });
}

async function listUsers(req, res) {
  const { page = 1, limit = 20, role, search } = req.query;
  const offset = (page - 1) * limit;
  let sql = 'SELECT id, email, full_name, role, is_active, created_at FROM users WHERE 1=1';
  const params = [];
  if (role)   { params.push(role);        sql += ` AND role = $${params.length}`; }
  if (search) { params.push(`%${search}%`); sql += ` AND (email ILIKE $${params.length} OR full_name ILIKE $${params.length})`; }
  sql += ` ORDER BY created_at DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`;
  params.push(limit, offset);
  const { rows } = await query(sql, params);
  res.json({ users: rows });
}

async function toggleUserActive(req, res) {
  const { id } = req.params;
  const { rows } = await query(
    'UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING id, email, is_active',
    [id]
  );
  res.json({ user: rows[0] });
}

async function listAllCourses(req, res) {
  const { rows } = await query(`
    SELECT c.*, u.full_name AS instructor_name, COUNT(e.student_id) AS enrolled_count
    FROM courses c JOIN users u ON c.instructor_id = u.id
    LEFT JOIN enrollments e ON c.id = e.course_id
    GROUP BY c.id, u.full_name ORDER BY c.created_at DESC
  `);
  res.json({ courses: rows });
}

module.exports = { getDashboardStats, listUsers, toggleUserActive, listAllCourses };
