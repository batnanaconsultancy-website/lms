-- ============================================================
-- Demo seed data — run AFTER 001_initial_schema.sql
-- ============================================================

-- Admin user (password: Admin1234!)
INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@codeforge.dev',
 crypt('Admin1234!', gen_salt('bf')),
 'Admin User', 'admin')
ON CONFLICT DO NOTHING;

-- Instructor (password: Instructor1!)
INSERT INTO users (email, password_hash, full_name, role, bio) VALUES
('instructor@codeforge.dev',
 crypt('Instructor1!', gen_salt('bf')),
 'Jane Doe', 'instructor',
 'Senior software engineer with 10 years of experience in web development.')
ON CONFLICT DO NOTHING;

-- Student (password: Student123!)
INSERT INTO users (email, password_hash, full_name, role) VALUES
('student@codeforge.dev',
 crypt('Student123!', gen_salt('bf')),
 'John Smith', 'student')
ON CONFLICT DO NOTHING;

-- Sample course
WITH inst AS (SELECT id FROM users WHERE email='instructor@codeforge.dev')
INSERT INTO courses (instructor_id, title, slug, description, level, category, tags, is_published)
SELECT
  inst.id,
  'Full-Stack JavaScript Bootcamp',
  'fullstack-js-bootcamp',
  'Master Node.js, React, and PostgreSQL from scratch. Build 5 real-world projects.',
  'beginner',
  'Web Development',
  ARRAY['javascript','nodejs','react','postgresql'],
  true
FROM inst
ON CONFLICT DO NOTHING;

-- Module 1
WITH c AS (SELECT id FROM courses WHERE slug='fullstack-js-bootcamp')
INSERT INTO modules (course_id, title, position)
SELECT id, 'Introduction to JavaScript', 1 FROM c
ON CONFLICT DO NOTHING;

-- Module 2
WITH c AS (SELECT id FROM courses WHERE slug='fullstack-js-bootcamp')
INSERT INTO modules (course_id, title, position)
SELECT id, 'Node.js & Express', 2 FROM c
ON CONFLICT DO NOTHING;

-- Lessons for Module 1
WITH m AS (SELECT id FROM modules WHERE title='Introduction to JavaScript')
INSERT INTO lessons (module_id, course_id, title, type, content, duration_minutes, position, is_free_preview)
SELECT
  m.id,
  (SELECT course_id FROM modules WHERE title='Introduction to JavaScript'),
  unnest(ARRAY['Variables and Data Types','Functions and Scope','Async/Await']),
  'video',
  'Lesson content here.',
  unnest(ARRAY[15, 20, 25]),
  unnest(ARRAY[1, 2, 3]),
  true
FROM m
ON CONFLICT DO NOTHING;
