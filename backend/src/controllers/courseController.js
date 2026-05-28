const slugify = require('slugify');
const { query } = require('../db');

async function listCourses(req, res) {
  const { category, level, search, page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;
  let sql = `
    SELECT c.*, u.full_name AS instructor_name, u.avatar_url AS instructor_avatar,
      COUNT(DISTINCT e.student_id) AS enrolled_count
    FROM courses c
    JOIN users u ON c.instructor_id = u.id
    LEFT JOIN enrollments e ON c.id = e.course_id
    WHERE c.is_published = true
  `;
  const params = [];
  if (category) { params.push(category); sql += ` AND c.category = $${params.length}`; }
  if (level)    { params.push(level);    sql += ` AND c.level = $${params.length}`; }
  if (search)   { params.push(`%${search}%`); sql += ` AND (c.title ILIKE $${params.length} OR c.description ILIKE $${params.length})`; }
  sql += ` GROUP BY c.id, u.full_name, u.avatar_url ORDER BY c.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const { rows } = await query(sql, params);
  res.json({ courses: rows, page: Number(page), limit: Number(limit) });
}

async function getCourse(req, res) {
  const { slug } = req.params;
  const { rows } = await query(`
    SELECT c.*, u.full_name AS instructor_name, u.avatar_url AS instructor_avatar, u.bio AS instructor_bio,
      COUNT(DISTINCT e.student_id) AS enrolled_count
    FROM courses c
    JOIN users u ON c.instructor_id = u.id
    LEFT JOIN enrollments e ON c.id = e.course_id
    WHERE c.slug = $1
    GROUP BY c.id, u.full_name, u.avatar_url, u.bio
  `, [slug]);

  if (!rows[0]) return res.status(404).json({ error: 'Course not found' });
  const course = rows[0];

  // Fetch modules + lessons
  const { rows: modules } = await query(
    'SELECT * FROM modules WHERE course_id = $1 ORDER BY position',
    [course.id]
  );
  for (const mod of modules) {
    const { rows: lessons } = await query(
      'SELECT id, title, type, duration_minutes, position, is_free_preview FROM lessons WHERE module_id = $1 ORDER BY position',
      [mod.id]
    );
    mod.lessons = lessons;
  }
  course.modules = modules;
  res.json({ course });
}

async function createCourse(req, res) {
  const { title, description, level, category, tags, price } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });

  const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  const { rows } = await query(`
    INSERT INTO courses (instructor_id, title, slug, description, level, category, tags, price)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *
  `, [req.user.id, title, slug, description, level || 'beginner', category, tags || [], price || 0]);

  res.status(201).json({ course: rows[0] });
}

async function updateCourse(req, res) {
  const { id } = req.params;
  const { title, description, level, category, tags, price, is_published, thumbnail_url } = req.body;

  const { rows: existing } = await query('SELECT * FROM courses WHERE id = $1', [id]);
  if (!existing[0]) return res.status(404).json({ error: 'Course not found' });
  if (existing[0].instructor_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorised' });
  }

  const { rows } = await query(`
    UPDATE courses SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      level = COALESCE($3, level),
      category = COALESCE($4, category),
      tags = COALESCE($5, tags),
      price = COALESCE($6, price),
      is_published = COALESCE($7, is_published),
      thumbnail_url = COALESCE($8, thumbnail_url)
    WHERE id = $9 RETURNING *
  `, [title, description, level, category, tags, price, is_published, thumbnail_url, id]);

  res.json({ course: rows[0] });
}

async function deleteCourse(req, res) {
  const { id } = req.params;
  const { rows } = await query('SELECT instructor_id FROM courses WHERE id = $1', [id]);
  if (!rows[0]) return res.status(404).json({ error: 'Course not found' });
  if (rows[0].instructor_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorised' });
  }
  await query('DELETE FROM courses WHERE id = $1', [id]);
  res.json({ message: 'Course deleted' });
}

async function getMyCourses(req, res) {
  const { rows } = await query(`
    SELECT c.*, u.full_name AS instructor_name,
      COUNT(DISTINCT e2.student_id) AS enrolled_count
    FROM courses c
    JOIN users u ON c.instructor_id = u.id
    LEFT JOIN enrollments e2 ON c.id = e2.course_id
    WHERE c.instructor_id = $1
    GROUP BY c.id, u.full_name
    ORDER BY c.created_at DESC
  `, [req.user.id]);
  res.json({ courses: rows });
}

module.exports = { listCourses, getCourse, createCourse, updateCourse, deleteCourse, getMyCourses };
