-- =============================================================================
-- PRISM-EDU  |  Migration 002 — Row Level Security
-- =============================================================================
-- Strategy:
--   • Admin  → full access to everything
--   • Faculty → read/write their assigned students; read-only on reference data
--   • Student → read/write only their own records
-- =============================================================================

-- Helper: get calling user's role from the users table
CREATE OR REPLACE FUNCTION auth_role()
RETURNS user_role
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM users WHERE id = auth.uid()
$$;

-- Helper: get calling user's student record id
CREATE OR REPLACE FUNCTION auth_student_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT id FROM students WHERE user_id = auth.uid() LIMIT 1
$$;

-- Helper: get calling user's faculty record id
CREATE OR REPLACE FUNCTION auth_faculty_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT id FROM faculty WHERE user_id = auth.uid() LIMIT 1
$$;

-- Helper: check if student is assigned to calling faculty
CREATE OR REPLACE FUNCTION faculty_owns_student(p_student_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM students
    WHERE id = p_student_id
      AND faculty_id = auth_faculty_id()
  )
$$;

-- =============================================================================
-- Enable RLS
-- =============================================================================
ALTER TABLE users                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty               ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses               ENABLE ROW LEVEL SECURITY;
ALTER TABLE students              ENABLE ROW LEVEL SECURITY;
ALTER TABLE admission_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects              ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_records      ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records    ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources    ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_embeddings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_activity     ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_versions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_insights      ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships          ENABLE ROW LEVEL SECURITY;
ALTER TABLE educational_loans     ENABLE ROW LEVEL SECURITY;
ALTER TABLE counsellors           ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_opportunities  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs            ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- USERS
-- =============================================================================
-- Own row
CREATE POLICY users_select_own ON users
  FOR SELECT USING (id = auth.uid());

-- Admin can see all
CREATE POLICY users_select_admin ON users
  FOR SELECT USING (auth_role() = 'admin');

-- Admin can insert/update/delete
CREATE POLICY users_all_admin ON users
  FOR ALL USING (auth_role() = 'admin');

-- =============================================================================
-- DEPARTMENTS  (reference data — readable by all authenticated users)
-- =============================================================================
CREATE POLICY departments_select_all ON departments
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY departments_mutate_admin ON departments
  FOR ALL USING (auth_role() = 'admin');

-- =============================================================================
-- FACULTY
-- =============================================================================
-- Faculty can view their own record; admin can view all
CREATE POLICY faculty_select ON faculty
  FOR SELECT USING (
    user_id = auth.uid()
    OR auth_role() = 'admin'
    OR auth_role() = 'faculty'   -- faculty see all colleagues (for assignment display)
  );

-- Admin manages faculty
CREATE POLICY faculty_mutate_admin ON faculty
  FOR ALL USING (auth_role() = 'admin');

-- Faculty can update their own profile
CREATE POLICY faculty_update_own ON faculty
  FOR UPDATE USING (user_id = auth.uid());

-- =============================================================================
-- COURSES  (reference data)
-- =============================================================================
CREATE POLICY courses_select_all ON courses
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY courses_mutate_admin ON courses
  FOR ALL USING (auth_role() = 'admin');

-- =============================================================================
-- STUDENTS
-- =============================================================================
-- Student: own record only
CREATE POLICY students_select_own ON students
  FOR SELECT USING (user_id = auth.uid());

-- Faculty: their assigned students
CREATE POLICY students_select_faculty ON students
  FOR SELECT USING (
    auth_role() = 'faculty' AND faculty_id = auth_faculty_id()
  );

-- Admin: all
CREATE POLICY students_select_admin ON students
  FOR SELECT USING (auth_role() = 'admin');

-- Admin manages students
CREATE POLICY students_mutate_admin ON students
  FOR ALL USING (auth_role() = 'admin');

-- Student can update limited own fields (mobile, etc.) — controlled at app layer
CREATE POLICY students_update_own ON students
  FOR UPDATE USING (user_id = auth.uid());

-- =============================================================================
-- ADMISSION PROFILES
-- =============================================================================
CREATE POLICY admission_profiles_select ON admission_profiles
  FOR SELECT USING (
    auth_role() = 'admin'
    OR student_id = auth_student_id()
    OR faculty_owns_student(student_id)
  );

CREATE POLICY admission_profiles_mutate_admin ON admission_profiles
  FOR ALL USING (auth_role() = 'admin');

-- =============================================================================
-- SUBJECTS  (reference data)
-- =============================================================================
CREATE POLICY subjects_select_all ON subjects
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY subjects_mutate_admin ON subjects
  FOR ALL USING (auth_role() IN ('admin', 'faculty'));

-- =============================================================================
-- ACADEMIC RECORDS
-- =============================================================================
CREATE POLICY academic_records_select ON academic_records
  FOR SELECT USING (
    auth_role() = 'admin'
    OR student_id = auth_student_id()
    OR faculty_owns_student(student_id)
  );

CREATE POLICY academic_records_insert_faculty ON academic_records
  FOR INSERT WITH CHECK (
    auth_role() IN ('admin', 'faculty')
  );

CREATE POLICY academic_records_mutate_admin ON academic_records
  FOR ALL USING (auth_role() = 'admin');

-- =============================================================================
-- ATTENDANCE RECORDS
-- =============================================================================
CREATE POLICY attendance_select ON attendance_records
  FOR SELECT USING (
    auth_role() = 'admin'
    OR student_id = auth_student_id()
    OR (auth_role() = 'faculty' AND faculty_owns_student(student_id))
  );

CREATE POLICY attendance_insert_faculty ON attendance_records
  FOR INSERT WITH CHECK (
    auth_role() IN ('admin', 'faculty')
  );

CREATE POLICY attendance_mutate_admin ON attendance_records
  FOR ALL USING (auth_role() = 'admin');

-- =============================================================================
-- LEARNING RESOURCES
-- =============================================================================
-- All authenticated users can read active resources
CREATE POLICY learning_resources_select ON learning_resources
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (is_active = TRUE OR auth_role() IN ('admin', 'faculty'))
  );

CREATE POLICY learning_resources_mutate_faculty ON learning_resources
  FOR ALL USING (auth_role() IN ('admin', 'faculty'));

-- =============================================================================
-- RESOURCE EMBEDDINGS
-- =============================================================================
CREATE POLICY resource_embeddings_select ON resource_embeddings
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY resource_embeddings_mutate ON resource_embeddings
  FOR ALL USING (auth_role() IN ('admin', 'faculty'));

-- =============================================================================
-- LEARNING ACTIVITY
-- =============================================================================
CREATE POLICY learning_activity_select ON learning_activity
  FOR SELECT USING (
    auth_role() = 'admin'
    OR student_id = auth_student_id()
    OR (auth_role() = 'faculty' AND faculty_owns_student(student_id))
  );

CREATE POLICY learning_activity_insert_student ON learning_activity
  FOR INSERT WITH CHECK (student_id = auth_student_id() OR auth_role() = 'admin');

CREATE POLICY learning_activity_update_student ON learning_activity
  FOR UPDATE USING (student_id = auth_student_id() OR auth_role() = 'admin');

-- =============================================================================
-- ASSIGNMENTS
-- =============================================================================
CREATE POLICY assignments_select ON assignments
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY assignments_mutate_faculty ON assignments
  FOR ALL USING (auth_role() IN ('admin', 'faculty'));

-- =============================================================================
-- ASSIGNMENT SUBMISSIONS
-- =============================================================================
CREATE POLICY assignment_submissions_select ON assignment_submissions
  FOR SELECT USING (
    auth_role() = 'admin'
    OR student_id = auth_student_id()
    OR auth_role() = 'faculty'
  );

CREATE POLICY assignment_submissions_insert_student ON assignment_submissions
  FOR INSERT WITH CHECK (student_id = auth_student_id());

CREATE POLICY assignment_submissions_update_student ON assignment_submissions
  FOR UPDATE USING (student_id = auth_student_id() OR auth_role() IN ('admin', 'faculty'));

-- =============================================================================
-- QUIZZES
-- =============================================================================
CREATE POLICY quizzes_select ON quizzes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY quizzes_mutate_faculty ON quizzes
  FOR ALL USING (auth_role() IN ('admin', 'faculty'));

-- =============================================================================
-- QUIZ ATTEMPTS
-- =============================================================================
CREATE POLICY quiz_attempts_select ON quiz_attempts
  FOR SELECT USING (
    auth_role() = 'admin'
    OR student_id = auth_student_id()
    OR auth_role() = 'faculty'
  );

CREATE POLICY quiz_attempts_insert_student ON quiz_attempts
  FOR INSERT WITH CHECK (student_id = auth_student_id());

CREATE POLICY quiz_attempts_update_student ON quiz_attempts
  FOR UPDATE USING (student_id = auth_student_id() OR auth_role() = 'admin');

-- =============================================================================
-- ACTIVITY EVENTS
-- =============================================================================
CREATE POLICY activity_events_select ON activity_events
  FOR SELECT USING (
    auth_role() = 'admin'
    OR student_id = auth_student_id()
    OR (auth_role() = 'faculty' AND faculty_owns_student(student_id))
  );

CREATE POLICY activity_events_insert_student ON activity_events
  FOR INSERT WITH CHECK (student_id = auth_student_id() OR auth_role() = 'admin');

-- =============================================================================
-- MODEL VERSIONS (admin + faculty read)
-- =============================================================================
CREATE POLICY model_versions_select ON model_versions
  FOR SELECT USING (auth_role() IN ('admin', 'faculty'));

CREATE POLICY model_versions_mutate_admin ON model_versions
  FOR ALL USING (auth_role() = 'admin');

-- =============================================================================
-- PREDICTIONS
-- =============================================================================
CREATE POLICY predictions_select ON predictions
  FOR SELECT USING (
    auth_role() = 'admin'
    OR student_id = auth_student_id()
    OR (auth_role() = 'faculty' AND faculty_owns_student(student_id))
  );

CREATE POLICY predictions_mutate_admin ON predictions
  FOR ALL USING (auth_role() = 'admin');

-- =============================================================================
-- STUDENT INSIGHTS
-- =============================================================================
CREATE POLICY student_insights_select ON student_insights
  FOR SELECT USING (
    auth_role() = 'admin'
    OR student_id = auth_student_id()
    OR (auth_role() = 'faculty' AND faculty_owns_student(student_id))
  );

CREATE POLICY student_insights_mutate_admin ON student_insights
  FOR ALL USING (auth_role() = 'admin');

-- =============================================================================
-- INTERVENTIONS
-- =============================================================================
CREATE POLICY interventions_select ON interventions
  FOR SELECT USING (
    auth_role() = 'admin'
    OR student_id = auth_student_id()
    OR (auth_role() = 'faculty' AND faculty_id = auth_faculty_id())
  );

CREATE POLICY interventions_insert_faculty ON interventions
  FOR INSERT WITH CHECK (
    auth_role() IN ('admin', 'faculty')
    AND (auth_role() = 'admin' OR faculty_owns_student(student_id))
  );

CREATE POLICY interventions_update_faculty ON interventions
  FOR UPDATE USING (
    auth_role() = 'admin'
    OR (auth_role() = 'faculty' AND faculty_id = auth_faculty_id())
  );

CREATE POLICY interventions_delete_admin ON interventions
  FOR DELETE USING (auth_role() = 'admin');

-- =============================================================================
-- SCHOLARSHIPS  (public read for students)
-- =============================================================================
CREATE POLICY scholarships_select ON scholarships
  FOR SELECT USING (auth.uid() IS NOT NULL AND (is_active = TRUE OR auth_role() = 'admin'));

CREATE POLICY scholarships_mutate_admin ON scholarships
  FOR ALL USING (auth_role() = 'admin');

-- =============================================================================
-- EDUCATIONAL LOANS  (public read)
-- =============================================================================
CREATE POLICY educational_loans_select ON educational_loans
  FOR SELECT USING (auth.uid() IS NOT NULL AND (is_active = TRUE OR auth_role() = 'admin'));

CREATE POLICY educational_loans_mutate_admin ON educational_loans
  FOR ALL USING (auth_role() = 'admin');

-- =============================================================================
-- COUNSELLORS  (public read)
-- =============================================================================
CREATE POLICY counsellors_select ON counsellors
  FOR SELECT USING (auth.uid() IS NOT NULL AND (is_active = TRUE OR auth_role() = 'admin'));

CREATE POLICY counsellors_mutate_admin ON counsellors
  FOR ALL USING (auth_role() = 'admin');

-- =============================================================================
-- CAREER OPPORTUNITIES  (public read)
-- =============================================================================
CREATE POLICY career_opportunities_select ON career_opportunities
  FOR SELECT USING (auth.uid() IS NOT NULL AND (is_active = TRUE OR auth_role() = 'admin'));

CREATE POLICY career_opportunities_mutate_admin ON career_opportunities
  FOR ALL USING (auth_role() = 'admin');

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================
-- Users can only see their own notifications
CREATE POLICY notifications_select_own ON notifications
  FOR SELECT USING (user_id = auth.uid() OR auth_role() = 'admin');

CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE USING (user_id = auth.uid() OR auth_role() = 'admin');

CREATE POLICY notifications_insert ON notifications
  FOR INSERT WITH CHECK (auth_role() IN ('admin', 'faculty'));

CREATE POLICY notifications_delete ON notifications
  FOR DELETE USING (user_id = auth.uid() OR auth_role() = 'admin');

-- =============================================================================
-- AI CONVERSATIONS
-- =============================================================================
CREATE POLICY ai_conversations_select ON ai_conversations
  FOR SELECT USING (
    auth_role() = 'admin'
    OR student_id = auth_student_id()
    OR (auth_role() = 'faculty' AND faculty_owns_student(student_id))
  );

CREATE POLICY ai_conversations_insert_student ON ai_conversations
  FOR INSERT WITH CHECK (student_id = auth_student_id() OR auth_role() = 'admin');

CREATE POLICY ai_conversations_update ON ai_conversations
  FOR UPDATE USING (student_id = auth_student_id() OR auth_role() = 'admin');

-- =============================================================================
-- AUDIT LOGS  (admin only)
-- =============================================================================
CREATE POLICY audit_logs_select_admin ON audit_logs
  FOR SELECT USING (auth_role() = 'admin');

CREATE POLICY audit_logs_insert ON audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
