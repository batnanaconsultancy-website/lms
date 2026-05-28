-- ============================================================
-- CodeForge LMS — Full Database Schema
-- Run against your Neon PostgreSQL database
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ────────────────────────────────────────────────────────────
-- USERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     VARCHAR(255) NOT NULL,
  avatar_url    TEXT,
  role          VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student','instructor','admin')),
  github_username VARCHAR(100),
  bio           TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- REFRESH TOKENS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- COURSES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instructor_id UUID NOT NULL REFERENCES users(id),
  title         VARCHAR(255) NOT NULL,
  slug          VARCHAR(255) UNIQUE NOT NULL,
  description   TEXT,
  thumbnail_url TEXT,
  level         VARCHAR(20) DEFAULT 'beginner' CHECK (level IN ('beginner','intermediate','advanced')),
  category      VARCHAR(100),
  tags          TEXT[],
  is_published  BOOLEAN DEFAULT false,
  price         DECIMAL(10,2) DEFAULT 0,
  total_duration_minutes INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- MODULES (chapters within a course)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS modules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  position    INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- LESSONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lessons (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id       UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title           VARCHAR(255) NOT NULL,
  type            VARCHAR(20) DEFAULT 'video' CHECK (type IN ('video','text','quiz','assignment')),
  content         TEXT,           -- markdown / rich text
  video_url       TEXT,
  duration_minutes INTEGER DEFAULT 0,
  position        INTEGER NOT NULL DEFAULT 0,
  is_free_preview BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- ENROLLMENTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrollments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, course_id)
);

-- ────────────────────────────────────────────────────────────
-- LESSON PROGRESS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_progress (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id    UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id    UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed    BOOLEAN DEFAULT false,
  watch_time_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, lesson_id)
);

-- ────────────────────────────────────────────────────────────
-- ASSIGNMENTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assignments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id    UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id    UUID REFERENCES lessons(id) ON DELETE SET NULL,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  instructions TEXT,
  due_date     TIMESTAMPTZ,
  max_score    INTEGER DEFAULT 100,
  type         VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text','file','github')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- SUBMISSIONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS submissions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id   UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content         TEXT,           -- text answer or notes
  file_url        TEXT,           -- uploaded file
  github_repo_url TEXT,           -- for GitHub-type assignments
  github_repo_name VARCHAR(255),
  score           INTEGER,
  feedback        TEXT,
  status          VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('draft','submitted','graded','returned')),
  submitted_at    TIMESTAMPTZ DEFAULT NOW(),
  graded_at       TIMESTAMPTZ,
  graded_by       UUID REFERENCES users(id),
  UNIQUE(assignment_id, student_id)
);

-- ────────────────────────────────────────────────────────────
-- GITHUB SYNC REPOS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS github_repos (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id    UUID REFERENCES submissions(id) ON DELETE CASCADE,
  student_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  repo_full_name   VARCHAR(255) NOT NULL,
  repo_clone_url   TEXT,
  last_commit_hash VARCHAR(40),
  last_synced_at   TIMESTAMPTZ,
  sync_status      VARCHAR(20) DEFAULT 'pending' CHECK (sync_status IN ('pending','syncing','synced','error')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- ANNOUNCEMENTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES users(id),
  title       VARCHAR(255) NOT NULL,
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- INDEXES
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_enrollments_student  ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course   ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student ON lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student  ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_github_repos_student ON github_repos(student_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course       ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module       ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_modules_course       ON modules(course_id);

-- ────────────────────────────────────────────────────────────
-- AUTO-UPDATE updated_at
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at     BEFORE UPDATE ON users     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_courses_updated_at   BEFORE UPDATE ON courses   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_lessons_updated_at   BEFORE UPDATE ON lessons   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
