const { query } = require('../db');

async function enroll(req, res) {
  const { courseId } = req.body;
  if (!courseId) return res.status(400).json({ error: 'courseId required' });

  const { rows: course } = await query('SELECT id, is_published FROM courses WHERE id = $1', [courseId]);
  if (!course[0]) return res.status(404).json({ error: 'Course not found' });
  if (!course[0].is_published) return res.status(400).json({ error: 'Course is not published' });

  try {
    await query(
      'INSERT INTO enrollments (student_id, course_id) VALUES ($1,$2)',
      [req.user.id, courseId]
    );
    res.status(201).json({ message: 'Enrolled successfully' });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Already enrolled' });
    throw err;
  }
}

async function getMyEnrollments(req, res) {
  const { rows } = await query(`
    SELECT c.id, c.title, c.slug, c.thumbnail_url, c.level, c.category,
      u.full_name AS instructor_name,
      e.enrolled_at, e.completed_at,
      COUNT(l.id) AS total_lessons,
      COUNT(lp.id) FILTER (WHERE lp.completed = true) AS completed_lessons
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    JOIN users u ON c.instructor_id = u.id
    LEFT JOIN lessons l ON l.course_id = c.id
    LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.student_id = $1
    WHERE e.student_id = $1
    GROUP BY c.id, u.full_name, e.enrolled_at, e.completed_at
    ORDER BY e.enrolled_at DESC
  `, [req.user.id]);
  res.json({ enrollments: rows });
}

async function checkEnrollment(req, res) {
  const { courseId } = req.params;
  const { rows } = await query(
    'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
    [req.user.id, courseId]
  );
  res.json({ enrolled: rows.length > 0, enrollment: rows[0] || null });
}

module.exports = { enroll, getMyEnrollments, checkEnrollment };
