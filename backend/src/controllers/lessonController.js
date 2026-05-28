const { query } = require('../db');

async function getLesson(req, res) {
  const { id } = req.params;
  const { rows } = await query(`
    SELECT l.*, m.title AS module_title, c.title AS course_title, c.slug AS course_slug
    FROM lessons l
    JOIN modules m ON l.module_id = m.id
    JOIN courses c ON l.course_id = c.id
    WHERE l.id = $1
  `, [id]);
  if (!rows[0]) return res.status(404).json({ error: 'Lesson not found' });

  // Check access: must be enrolled (or instructor/admin, or free preview)
  const lesson = rows[0];
  if (!lesson.is_free_preview && req.user.role === 'student') {
    const { rows: enroll } = await query(
      'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [req.user.id, lesson.course_id]
    );
    if (!enroll.length) return res.status(403).json({ error: 'Not enrolled in this course' });
  }

  res.json({ lesson });
}

async function createLesson(req, res) {
  const { moduleId, courseId, title, type, content, videoUrl, durationMinutes, position, isFreePreview } = req.body;
  const { rows } = await query(`
    INSERT INTO lessons (module_id, course_id, title, type, content, video_url, duration_minutes, position, is_free_preview)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *
  `, [moduleId, courseId, title, type || 'video', content, videoUrl, durationMinutes || 0, position || 0, isFreePreview || false]);
  res.status(201).json({ lesson: rows[0] });
}

async function updateLesson(req, res) {
  const { id } = req.params;
  const { title, content, videoUrl, durationMinutes, position, isFreePreview } = req.body;
  const { rows } = await query(`
    UPDATE lessons SET
      title = COALESCE($1, title),
      content = COALESCE($2, content),
      video_url = COALESCE($3, video_url),
      duration_minutes = COALESCE($4, duration_minutes),
      position = COALESCE($5, position),
      is_free_preview = COALESCE($6, is_free_preview)
    WHERE id = $7 RETURNING *
  `, [title, content, videoUrl, durationMinutes, position, isFreePreview, id]);
  if (!rows[0]) return res.status(404).json({ error: 'Lesson not found' });
  res.json({ lesson: rows[0] });
}

async function deleteLesson(req, res) {
  const { id } = req.params;
  await query('DELETE FROM lessons WHERE id = $1', [id]);
  res.json({ message: 'Lesson deleted' });
}

async function createModule(req, res) {
  const { courseId, title, description, position } = req.body;
  const { rows } = await query(
    'INSERT INTO modules (course_id, title, description, position) VALUES ($1,$2,$3,$4) RETURNING *',
    [courseId, title, description, position || 0]
  );
  res.status(201).json({ module: rows[0] });
}

module.exports = { getLesson, createLesson, updateLesson, deleteLesson, createModule };
