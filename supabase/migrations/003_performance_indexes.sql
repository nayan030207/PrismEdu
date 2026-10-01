-- =============================================================================
-- PRISM-EDU | Migration 003 — Additional Performance Indexes
-- =============================================================================

-- Indexes for users and their specific roles (speeds up login/auth checks)
CREATE INDEX IF NOT EXISTS idx_faculty_user_id ON faculty(user_id);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);

-- Indexes for profiles and insights linked to students
CREATE INDEX IF NOT EXISTS idx_admission_profiles_student ON admission_profiles(student_id);

-- Indexes for courses and departments
CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department_id);
CREATE INDEX IF NOT EXISTS idx_faculty_department ON faculty(department_id);

-- Indexes for assignments and submissions
CREATE INDEX IF NOT EXISTS idx_assignments_resource ON assignments(resource_id);
CREATE INDEX IF NOT EXISTS idx_assignments_subject ON assignments(subject_id);
CREATE INDEX IF NOT EXISTS idx_assignments_creator ON assignments(created_by);
CREATE INDEX IF NOT EXISTS idx_assignment_subs_assignment ON assignment_submissions(assignment_id);

-- Indexes for quizzes and attempts
CREATE INDEX IF NOT EXISTS idx_quizzes_resource ON quizzes(resource_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_subject ON quizzes(subject_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_creator ON quizzes(created_by);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);

-- Indexes for resource embeddings (for fast lookup by resource)
CREATE INDEX IF NOT EXISTS idx_resource_embeddings_resource ON resource_embeddings(resource_id);

-- Indexes for predictions and models
CREATE INDEX IF NOT EXISTS idx_predictions_model ON predictions(model_version_id);
