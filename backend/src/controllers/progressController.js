const { query } = require('../db');

async function markLessonComplete(req, res) {
  const { lessonId, watchTimeSeconds } = req.body;

  const { rows: lesson } = await query('SELECT course_id FROM lessons WHERE id = $1', [lessonId]);
  if (!lesson[0]) return res.status(404).json({ error: 'Lesson not found' });

  const { rows } = await query(`
    INSERT INTO lesson_progress (student_id, lesson_id, course_id, completed, watch_time_seconds, completed_at)
    VALUES ($1,$2,$3,true,$4,NOW())
    ON CONFLICT (student_id, lesson_id) DO UPDATE SET
      completed = true,
      watch_time_seconds = GREATEST(lesson_progress.watch_time_seconds, EXCLUDED.watch_time_seconds),
      completed_at = COALESCE(lesson_progress.completed_at, NOW())
    RETURNING *
  `, [req.user.id, lessonId, lesson[0].course_id, watchTimeSeconds || 0]);

  // Check if course is now fully complete
  const { rows: totalRows } = await query(
    'SELECT COUNT(*) AS total FROM lessons WHERE course_id = $1',
    [lesson[0].course_id]
  );
  const { rows: doneRows } = await query(
    'SELECT COUNT(*) AS done FROM lesson_progress WHERE student_id = $1 AND course_id = $2 AND completed = true',
    [req.user.id, lesson[0].course_id]
  );

  if (parseInt(doneRows[0].done) >= parseInt(totalRows[0].total)) {
    await query(
      'UPDATE enrollments SET completed_at = NOW() WHERE student_id = $1 AND course_id = $2 AND completed_at IS NULL',
      [req.user.id, lesson[0].course_id]
    );
  }

  res.json({ progress: rows[0] });
}

async function getCourseProgress(req, res) {
  const { courseId } = req.params;
  const { rows } = await query(`
    SELECT lp.*, l.title AS lesson_title, l.type, l.duration_minutes
    FROM lesson_progress lp
    JOIN lessons l ON lp.lesson_id = l.id
    WHERE lp.student_id = $1 AND lp.course_id = $2
  `, [req.user.id, courseId]);

  const { rows: total } = await query(
    'SELECT COUNT(*) AS count FROM lessons WHERE course_id = $1',
    [courseId]
  );

  res.json({
    completedLessons: rows.filter(r => r.completed).length,
    totalLessons: parseInt(total[0].count),
    progress: rows,
    percentage: total[0].count > 0
      ? Math.round((rows.filter(r => r.completed).length / parseInt(total[0].count)) * 100)
      : 0,
  });
}

async function getStudentDashboardStats(req, res) {
  const studentId = req.user.id;

  const [enrollRes, completedRes, submissionsRes, streakRes] = await Promise.all([
    query('SELECT COUNT(*) FROM enrollments WHERE student_id = $1', [studentId]),
    query('SELECT COUNT(*) FROM enrollments WHERE student_id = $1 AND completed_at IS NOT NULL', [studentId]),
    query("SELECT COUNT(*) FROM submissions WHERE student_id = $1 AND status = 'graded'", [studentId]),
    query('SELECT COUNT(DISTINCT DATE(completed_at)) FROM lesson_progress WHERE student_id = $1 AND completed = true AND completed_at > NOW() - INTERVAL \'30 days\'', [studentId]),
  ]);

  res.json({
    enrolledCourses: parseInt(enrollRes.rows[0].count),
    completedCourses: parseInt(completedRes.rows[0].count),
    gradedAssignments: parseInt(submissionsRes.rows[0].count),
    activeDays: parseInt(streakRes.rows[0].count),
  });
}

module.exports = { markLessonComplete, getCourseProgress, getStudentDashboardStats };
