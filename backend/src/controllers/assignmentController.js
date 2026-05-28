const { query } = require('../db');

// ── Assignments ────────────────────────────────────────────
async function getCourseAssignments(req, res) {
  const { courseId } = req.params;
  const { rows } = await query(
    'SELECT * FROM assignments WHERE course_id = $1 ORDER BY created_at',
    [courseId]
  );
  res.json({ assignments: rows });
}

async function createAssignment(req, res) {
  const { courseId, lessonId, title, description, instructions, dueDate, maxScore, type } = req.body;
  const { rows } = await query(`
    INSERT INTO assignments (course_id, lesson_id, title, description, instructions, due_date, max_score, type)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *
  `, [courseId, lessonId || null, title, description, instructions, dueDate || null, maxScore || 100, type || 'text']);
  res.status(201).json({ assignment: rows[0] });
}

async function getAssignment(req, res) {
  const { id } = req.params;
  const { rows } = await query('SELECT * FROM assignments WHERE id = $1', [id]);
  if (!rows[0]) return res.status(404).json({ error: 'Assignment not found' });
  res.json({ assignment: rows[0] });
}

// ── Submissions ────────────────────────────────────────────
async function submitAssignment(req, res) {
  const { assignmentId, content, fileUrl, githubRepoUrl, githubRepoName } = req.body;

  const { rows: assign } = await query('SELECT * FROM assignments WHERE id = $1', [assignmentId]);
  if (!assign[0]) return res.status(404).json({ error: 'Assignment not found' });

  // Check enrollment
  const { rows: enroll } = await query(
    'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
    [req.user.id, assign[0].course_id]
  );
  if (!enroll.length) return res.status(403).json({ error: 'Not enrolled in this course' });

  const { rows } = await query(`
    INSERT INTO submissions (assignment_id, student_id, content, file_url, github_repo_url, github_repo_name, status)
    VALUES ($1,$2,$3,$4,$5,$6,'submitted')
    ON CONFLICT (assignment_id, student_id) DO UPDATE SET
      content = EXCLUDED.content,
      file_url = EXCLUDED.file_url,
      github_repo_url = EXCLUDED.github_repo_url,
      github_repo_name = EXCLUDED.github_repo_name,
      status = 'submitted',
      submitted_at = NOW()
    RETURNING *
  `, [assignmentId, req.user.id, content, fileUrl, githubRepoUrl, githubRepoName]);

  // If GitHub repo, register for sync
  if (githubRepoUrl && githubRepoName) {
    await query(`
      INSERT INTO github_repos (submission_id, student_id, repo_full_name, repo_clone_url)
      VALUES ($1,$2,$3,$4)
      ON CONFLICT DO NOTHING
    `, [rows[0].id, req.user.id, githubRepoName, githubRepoUrl]);
  }

  res.status(201).json({ submission: rows[0] });
}

async function gradeSubmission(req, res) {
  const { id } = req.params;
  const { score, feedback } = req.body;
  const { rows } = await query(`
    UPDATE submissions SET score = $1, feedback = $2, status = 'graded', graded_at = NOW(), graded_by = $3
    WHERE id = $4 RETURNING *
  `, [score, feedback, req.user.id, id]);
  if (!rows[0]) return res.status(404).json({ error: 'Submission not found' });
  res.json({ submission: rows[0] });
}

async function getMySubmissions(req, res) {
  const { rows } = await query(`
    SELECT s.*, a.title AS assignment_title, a.max_score, c.title AS course_title
    FROM submissions s
    JOIN assignments a ON s.assignment_id = a.id
    JOIN courses c ON a.course_id = c.id
    WHERE s.student_id = $1
    ORDER BY s.submitted_at DESC
  `, [req.user.id]);
  res.json({ submissions: rows });
}

async function getCourseSubmissions(req, res) {
  const { courseId } = req.params;
  const { rows } = await query(`
    SELECT s.*, u.full_name AS student_name, u.email AS student_email,
      a.title AS assignment_title, a.max_score
    FROM submissions s
    JOIN users u ON s.student_id = u.id
    JOIN assignments a ON s.assignment_id = a.id
    WHERE a.course_id = $1
    ORDER BY s.submitted_at DESC
  `, [courseId]);
  res.json({ submissions: rows });
}

module.exports = {
  getCourseAssignments, createAssignment, getAssignment,
  submitAssignment, gradeSubmission, getMySubmissions, getCourseSubmissions
};
