

-- ==============================================================================-- =============================================================================
-- PRISM-EDU  |  Migration 001 — Initial Schema
-- =============================================================================

-- ── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ── ENUMS ────────────────────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('admin', 'faculty', 'student');
CREATE TYPE account_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE intervention_type AS ENUM (
  'academic', 'attendance_engagement', 'financial', 'personal_support', 'career'
);
CREATE TYPE intervention_status AS ENUM (
  'pending', 'in_progress', 'completed', 'cancelled'
);
CREATE TYPE insight_level AS ENUM (
  'good', 'attention_required', 'declining', 'critical'
);
CREATE TYPE resource_type AS ENUM (
  'note', 'pdf', 'video', 'assignment', 'quiz'
);
CREATE TYPE career_type AS ENUM (
  'job', 'internship', 'certification', 'skill_resource'
);
CREATE TYPE event_type AS ENUM (
  'LOGIN', 'LOGOUT', 'RESOURCE_OPENED', 'RESOURCE_COMPLETED',
  'VIDEO_COMPLETED', 'ASSIGNMENT_SUBMITTED', 'QUIZ_ATTEMPTED', 'QUIZ_COMPLETED',
  'AI_LEARNING_INTERACTION', 'AI_SUPPORT_INTERACTION',
  'SCHOLARSHIP_VIEWED', 'SCHOLARSHIP_SAVED', 'LOAN_VIEWED',
  'JOB_VIEWED', 'INTERNSHIP_VIEWED', 'CERTIFICATION_VIEWED',
  'ATTENDANCE_MARKED', 'LEARNING_SESSION_START', 'LEARNING_SESSION_END',
  'NOTIFICATION_READ'
);
CREATE TYPE student_outcome AS ENUM (
  'enrolled', 'graduated', 'withdrawn', 'transferred', 'on_leave'
);
CREATE TYPE financial_assistance AS ENUM (
  'required', 'not_required', 'partial'
);

-- ── DEPARTMENTS ──────────────────────────────────────────────────────────────
CREATE TABLE departments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  code        TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── USERS (auth table) ───────────────────────────────────────────────────────
CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email          TEXT UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  role           user_role NOT NULL,
  status         account_status DEFAULT 'active',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  last_login_at  TIMESTAMPTZ
);

-- ── FACULTY ──────────────────────────────────────────────────────────────────
CREATE TABLE faculty (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_id     TEXT UNIQUE NOT NULL,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  mobile          TEXT,
  department_id   UUID REFERENCES departments(id),
  designation     TEXT,
  specialization  TEXT,
  status          account_status DEFAULT 'active',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── COURSES ──────────────────────────────────────────────────────────────────
CREATE TABLE courses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  code            TEXT UNIQUE NOT NULL,
  department_id   UUID REFERENCES departments(id),
  duration_years  INTEGER DEFAULT 4,
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── STUDENTS ─────────────────────────────────────────────────────────────────
CREATE TABLE students (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id       TEXT UNIQUE NOT NULL,
  full_name        TEXT NOT NULL,
  email            TEXT NOT NULL,
  mobile           TEXT,
  date_of_birth    DATE,
  gender           gender_type,
  course_id        UUID REFERENCES courses(id),
  department_id    UUID REFERENCES departments(id),
  academic_year    INTEGER,
  admission_year   INTEGER,
  faculty_id       UUID REFERENCES faculty(id),
  status           account_status DEFAULT 'active',
  current_outcome  student_outcome DEFAULT 'enrolled',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── ADMISSION PROFILES ───────────────────────────────────────────────────────
CREATE TABLE admission_profiles (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id              UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  tenth_percentage        DECIMAL(5,2),
  twelfth_percentage      DECIMAL(5,2),
  previous_gpa            DECIMAL(4,2),
  previous_backlogs       INTEGER DEFAULT 0,
  family_income           DECIMAL(12,2),
  financial_assistance    financial_assistance DEFAULT 'not_required',
  guardian_name           TEXT,
  guardian_relationship   TEXT,
  guardian_mobile         TEXT,
  guardian_email          TEXT,
  guardian_occupation     TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ── SUBJECTS ─────────────────────────────────────────────────────────────────
CREATE TABLE subjects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id   UUID REFERENCES courses(id),
  name        TEXT NOT NULL,
  code        TEXT NOT NULL,
  semester    INTEGER,
  credits     INTEGER DEFAULT 3,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── ACADEMIC RECORDS ─────────────────────────────────────────────────────────
CREATE TABLE academic_records (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id      UUID REFERENCES subjects(id),
  semester        INTEGER NOT NULL,
  internal_marks  DECIMAL(5,2),
  external_marks  DECIMAL(5,2),
  total_marks     DECIMAL(5,2),
  grade           TEXT,
  backlogs        INTEGER DEFAULT 0,
  recorded_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── ATTENDANCE RECORDS ───────────────────────────────────────────────────────
CREATE TABLE attendance_records (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id   UUID REFERENCES subjects(id),
  date         DATE NOT NULL,
  is_present   BOOLEAN NOT NULL,
  recorded_by  UUID REFERENCES faculty(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── LEARNING RESOURCES ───────────────────────────────────────────────────────
CREATE TABLE learning_resources (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id       UUID NOT NULL REFERENCES subjects(id),
  title            TEXT NOT NULL,
  description      TEXT,
  type             resource_type NOT NULL,
  content_url      TEXT,
  content_text     TEXT,
  duration_minutes INTEGER,
  is_active        BOOLEAN DEFAULT TRUE,
  created_by       UUID REFERENCES faculty(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── RESOURCE EMBEDDINGS (RAG) ────────────────────────────────────────────────
CREATE TABLE resource_embeddings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
  chunk_text  TEXT NOT NULL,
  embedding   vector(1536),
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── LEARNING ACTIVITY ────────────────────────────────────────────────────────
CREATE TABLE learning_activity (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id          UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  resource_id         UUID REFERENCES learning_resources(id),
  opened_at           TIMESTAMPTZ DEFAULT NOW(),
  completed_at        TIMESTAMPTZ,
  progress_percent    INTEGER DEFAULT 0,
  time_spent_minutes  INTEGER DEFAULT 0
);

-- ── ASSIGNMENTS ──────────────────────────────────────────────────────────────
CREATE TABLE assignments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id  UUID NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
  subject_id   UUID NOT NULL REFERENCES subjects(id),
  title        TEXT NOT NULL,
  description  TEXT,
  max_marks    INTEGER DEFAULT 100,
  due_date     TIMESTAMPTZ,
  created_by   UUID REFERENCES faculty(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── ASSIGNMENT SUBMISSIONS ───────────────────────────────────────────────────
CREATE TABLE assignment_submissions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id   UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  submission_text TEXT,
  file_url        TEXT,
  submitted_at    TIMESTAMPTZ DEFAULT NOW(),
  marks_obtained  DECIMAL(5,2),
  feedback        TEXT,
  graded_by       UUID REFERENCES faculty(id),
  graded_at       TIMESTAMPTZ,
  UNIQUE(assignment_id, student_id)
);

-- ── QUIZZES ──────────────────────────────────────────────────────────────────
CREATE TABLE quizzes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id      UUID NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
  subject_id       UUID NOT NULL REFERENCES subjects(id),
  title            TEXT NOT NULL,
  description      TEXT,
  total_questions  INTEGER NOT NULL,
  total_marks      INTEGER NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  questions        JSONB NOT NULL DEFAULT '[]',
  created_by       UUID REFERENCES faculty(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── QUIZ ATTEMPTS ────────────────────────────────────────────────────────────
CREATE TABLE quiz_attempts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id      UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  answers      JSONB DEFAULT '{}',
  score        INTEGER,
  total_marks  INTEGER,
  started_at   TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT FALSE
);

-- ── ACTIVITY EVENTS ──────────────────────────────────────────────────────────
CREATE TABLE activity_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  event_type  event_type NOT NULL,
  event_data  JSONB DEFAULT '{}',
  session_id  TEXT,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── MODEL VERSIONS ───────────────────────────────────────────────────────────
CREATE TABLE model_versions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version           TEXT UNIQUE NOT NULL,
  description       TEXT,
  accuracy          DECIMAL(5,4),
  precision_score   DECIMAL(5,4),
  recall_score      DECIMAL(5,4),
  f1_score          DECIMAL(5,4),
  training_samples  INTEGER,
  is_active         BOOLEAN DEFAULT FALSE,
  model_path        TEXT,
  trained_at        TIMESTAMPTZ DEFAULT NOW(),
  approved_at       TIMESTAMPTZ,
  approved_by       UUID REFERENCES users(id)
);

-- ── PREDICTIONS ──────────────────────────────────────────────────────────────
CREATE TABLE predictions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id        UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  model_version_id  UUID REFERENCES model_versions(id),
  risk_score        DECIMAL(5,4) NOT NULL,
  risk_level        TEXT NOT NULL,   -- low | medium | high
  features_used     JSONB DEFAULT '{}',
  predicted_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── STUDENT INSIGHTS ─────────────────────────────────────────────────────────
CREATE TABLE student_insights (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id          UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academic_level      insight_level DEFAULT 'good',
  attendance_level    insight_level DEFAULT 'good',
  financial_level     insight_level DEFAULT 'good',
  career_level        insight_level DEFAULT 'good',
  support_level       insight_level DEFAULT 'good',
  academic_trend      JSONB DEFAULT '[]',
  attendance_trend    JSONB DEFAULT '[]',
  engagement_trend    JSONB DEFAULT '[]',
  quiz_trend          JSONB DEFAULT '[]',
  assignment_trend    JSONB DEFAULT '[]',
  recent_changes      JSONB DEFAULT '[]',
  last_updated        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id)
);

-- ── INTERVENTIONS ────────────────────────────────────────────────────────────
CREATE TABLE interventions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id     UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  faculty_id     UUID NOT NULL REFERENCES faculty(id),
  type           intervention_type NOT NULL,
  description    TEXT NOT NULL,
  status         intervention_status DEFAULT 'pending',
  follow_up_date DATE,
  outcome        TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── SCHOLARSHIPS ─────────────────────────────────────────────────────────────
CREATE TABLE scholarships (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 TEXT NOT NULL,
  provider             TEXT NOT NULL,
  eligibility          TEXT,
  benefits             TEXT,
  deadline             DATE,
  required_documents   TEXT[],
  application_link     TEXT,
  is_active            BOOLEAN DEFAULT TRUE,
  min_income           DECIMAL(12,2),
  max_income           DECIMAL(12,2),
  min_percentage       DECIMAL(5,2),
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ── EDUCATIONAL LOANS ────────────────────────────────────────────────────────
CREATE TABLE educational_loans (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 TEXT NOT NULL,
  provider             TEXT NOT NULL,
  loan_info            TEXT,
  eligibility          TEXT,
  interest_rate        DECIMAL(5,2),
  max_amount           DECIMAL(12,2),
  important_conditions TEXT,
  application_link     TEXT,
  is_active            BOOLEAN DEFAULT TRUE,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ── COUNSELLORS ──────────────────────────────────────────────────────────────
CREATE TABLE counsellors (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  specialization   TEXT,
  email            TEXT,
  mobile           TEXT,
  availability     TEXT,
  office_location  TEXT,
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── CAREER OPPORTUNITIES ─────────────────────────────────────────────────────
CREATE TABLE career_opportunities (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type              career_type NOT NULL,
  title             TEXT NOT NULL,
  organization      TEXT,
  description       TEXT,
  required_skills   TEXT[],
  application_link  TEXT,
  deadline          DATE,
  relevant_courses  TEXT[],
  provider          TEXT,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── NOTIFICATIONS ────────────────────────────────────────────────────────────
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  action_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── AI CONVERSATIONS ─────────────────────────────────────────────────────────
CREATE TABLE ai_conversations (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id        UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  agent_type        TEXT NOT NULL,   -- 'learning' | 'support'
  topics            TEXT[],
  interaction_count INTEGER DEFAULT 0,
  session_start     TIMESTAMPTZ DEFAULT NOW(),
  session_end       TIMESTAMPTZ,
  metadata          JSONB DEFAULT '{}'
);

-- ── AUDIT LOGS ───────────────────────────────────────────────────────────────
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id),
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   TEXT,
  changes     JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_students_faculty       ON students(faculty_id);
CREATE INDEX idx_students_department    ON students(department_id);
CREATE INDEX idx_students_course        ON students(course_id);
CREATE INDEX idx_attendance_student     ON attendance_records(student_id);
CREATE INDEX idx_attendance_date        ON attendance_records(date);
CREATE INDEX idx_attendance_subject     ON attendance_records(subject_id);
CREATE INDEX idx_academic_student       ON academic_records(student_id);
CREATE INDEX idx_academic_subject       ON academic_records(subject_id);
CREATE INDEX idx_activity_events_student ON activity_events(student_id);
CREATE INDEX idx_activity_events_type   ON activity_events(event_type);
CREATE INDEX idx_activity_events_created ON activity_events(created_at);
CREATE INDEX idx_predictions_student    ON predictions(student_id);
CREATE INDEX idx_predictions_created    ON predictions(predicted_at);
CREATE INDEX idx_interventions_student  ON interventions(student_id);
CREATE INDEX idx_interventions_faculty  ON interventions(faculty_id);
CREATE INDEX idx_notifications_user     ON notifications(user_id, is_read);
CREATE INDEX idx_learning_activity_student ON learning_activity(student_id);
CREATE INDEX idx_learning_activity_resource ON learning_activity(resource_id);
CREATE INDEX idx_quiz_attempts_student  ON quiz_attempts(student_id);
CREATE INDEX idx_assignment_subs_student ON assignment_submissions(student_id);
CREATE INDEX idx_subjects_course        ON subjects(course_id);
CREATE INDEX idx_resources_subject      ON learning_resources(subject_id);
CREATE INDEX idx_audit_logs_user        ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity      ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_ai_conversations_student ON ai_conversations(student_id);
-- Vector similarity index (requires pgvector)
CREATE INDEX idx_resource_embeddings_vector
  ON resource_embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ── updated_at TRIGGER FUNCTION ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER trg_departments_updated
  BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_users_updated
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_faculty_updated
  BEFORE UPDATE ON faculty
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_students_updated
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_admission_profiles_updated
  BEFORE UPDATE ON admission_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_interventions_updated
  BEFORE UPDATE ON interventions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

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

-- =============================================================================
-- PRISM-EDU Comprehensive Seed Data
-- =============================================================================

-- Clean up any existing data in reverse order of dependencies
TRUNCATE TABLE audit_logs CASCADE;
TRUNCATE TABLE ai_conversations CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE career_opportunities CASCADE;
TRUNCATE TABLE counsellors CASCADE;
TRUNCATE TABLE educational_loans CASCADE;
TRUNCATE TABLE scholarships CASCADE;
TRUNCATE TABLE interventions CASCADE;
TRUNCATE TABLE student_insights CASCADE;
TRUNCATE TABLE predictions CASCADE;
TRUNCATE TABLE model_versions CASCADE;
TRUNCATE TABLE activity_events CASCADE;
TRUNCATE TABLE quiz_attempts CASCADE;
TRUNCATE TABLE quizzes CASCADE;
TRUNCATE TABLE assignment_submissions CASCADE;
TRUNCATE TABLE assignments CASCADE;
TRUNCATE TABLE learning_activity CASCADE;
TRUNCATE TABLE resource_embeddings CASCADE;
TRUNCATE TABLE learning_resources CASCADE;
TRUNCATE TABLE attendance_records CASCADE;
TRUNCATE TABLE academic_records CASCADE;
TRUNCATE TABLE subjects CASCADE;
TRUNCATE TABLE admission_profiles CASCADE;
TRUNCATE TABLE students CASCADE;
TRUNCATE TABLE courses CASCADE;
TRUNCATE TABLE faculty CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE departments CASCADE;

-- Fixed UUIDs for predictable references
-- Password hash for 'admin123', 'faculty123', 'student123'
-- Bcrypt hash of 'password123': $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi
-- We will use this universal test hash for seamless login testing
-- Passwords:
-- admin@prismedu.com    -> password123
-- faculty1@prismedu.com  -> password123
-- faculty2@prismedu.com  -> password123
-- student1@prismedu.com  -> password123
-- student2@prismedu.com  -> password123
-- student3@prismedu.com  -> password123
-- student4@prismedu.com  -> password123
-- student5@prismedu.com  -> password123
-- student6@prismedu.com  -> password123

-- 1. DEPARTMENTS
INSERT INTO departments (id, name, code, description) VALUES
('d1111111-1111-1111-1111-111111111111', 'Computer Science and Engineering', 'CSE', 'Department of Computer Science & Software Engineering'),
('d2222222-2222-2222-2222-222222222222', 'Information Technology', 'IT', 'Department of Information Systems and Cloud Computing'),
('d3333333-3333-3333-3333-333333333333', 'Electronics and Communication', 'ECE', 'Department of Electronics and Communications');

-- 2. COURSES
INSERT INTO courses (id, name, code, department_id, duration_years, description) VALUES
('c1111111-1111-1111-1111-111111111111', 'B.Tech in Computer Science', 'BTECH-CSE', 'd1111111-1111-1111-1111-111111111111', 4, 'Undergraduate 4-year Computer Science engineering program'),
('c2222222-2222-2222-2222-222222222222', 'B.Tech in Information Technology', 'BTECH-IT', 'd2222222-2222-2222-2222-222222222222', 4, 'Undergraduate 4-year IT and Systems program');

-- 3. USERS (Admin, Faculty, Students)
-- Hash: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi (password123)
INSERT INTO users (id, email, password_hash, role, status) VALUES
-- Admin
('a0000000-0000-0000-0000-000000000001', 'admin@prismedu.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'admin', 'active'),
-- Faculty
('a1111111-0000-0000-0000-000000000001', 'faculty1@prismedu.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'faculty', 'active'),
('a1111111-0000-0000-0000-000000000002', 'faculty2@prismedu.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'faculty', 'active'),
-- Students
('a2222222-0000-0000-0000-000000000001', 'student1@prismedu.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'student', 'active'),
('a2222222-0000-0000-0000-000000000002', 'student2@prismedu.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'student', 'active'),
('a2222222-0000-0000-0000-000000000003', 'student3@prismedu.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'student', 'active'),
('a2222222-0000-0000-0000-000000000004', 'student4@prismedu.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'student', 'active'),
('a2222222-0000-0000-0000-000000000005', 'student5@prismedu.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'student', 'active'),
('a2222222-0000-0000-0000-000000000006', 'student6@prismedu.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'student', 'active');

-- 4. FACULTY PROFILES
INSERT INTO faculty (id, user_id, employee_id, full_name, email, mobile, department_id, designation, specialization, status) VALUES
('f1111111-1111-1111-1111-111111111111', 'a1111111-0000-0000-0000-000000000001', 'FAC-CSE-01', 'Dr. Sarah Mitchell', 'faculty1@prismedu.com', '+91 9876543210', 'd1111111-1111-1111-1111-111111111111', 'Associate Professor', 'Database Systems & Machine Learning', 'active'),
('f2222222-2222-2222-2222-222222222222', 'a1111111-0000-0000-0000-000000000002', 'FAC-IT-02', 'Prof. David Reynolds', 'faculty2@prismedu.com', '+91 9876543211', 'd2222222-2222-2222-2222-222222222222', 'Assistant Professor', 'Computer Networks & Distributed Systems', 'active');

-- 5. STUDENTS
INSERT INTO students (id, user_id, student_id, full_name, email, mobile, date_of_birth, gender, course_id, department_id, academic_year, admission_year, faculty_id, status, current_outcome) VALUES
-- Student 1: Aarav Sharma (Good Standing)
('b1111111-1111-1111-1111-111111111111', 'a2222222-0000-0000-0000-000000000001', 'STU1021', 'Aarav Sharma', 'student1@prismedu.com', '+91 9123456781', '2004-05-14', 'male', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 2, 2023, 'f1111111-1111-1111-1111-111111111111', 'active', 'enrolled'),
-- Student 2: Priya Patel (Attention Required: Academic & Financial)
('b2222222-2222-2222-2222-222222222222', 'a2222222-0000-0000-0000-000000000002', 'STU1024', 'Priya Patel', 'student2@prismedu.com', '+91 9123456782', '2004-08-22', 'female', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 2, 2023, 'f1111111-1111-1111-1111-111111111111', 'active', 'enrolled'),
-- Student 3: Rohan Gupta (Declining Attendance & Engagement)
('b3333333-3333-3333-3333-333333333333', 'a2222222-0000-0000-0000-000000000003', 'STU1035', 'Rohan Gupta', 'student3@prismedu.com', '+91 9123456783', '2003-11-09', 'male', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 3, 2022, 'f1111111-1111-1111-1111-111111111111', 'active', 'enrolled'),
-- Student 4: Ananya Singh (Career Active, Good Overall)
('b4444444-4444-4444-4444-444444444444', 'a2222222-0000-0000-0000-000000000004', 'STU1042', 'Ananya Singh', 'student4@prismedu.com', '+91 9123456784', '2004-01-30', 'female', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 2, 2023, 'f1111111-1111-1111-1111-111111111111', 'active', 'enrolled'),
-- Student 5: Vikram Verma (Critical: Low attendance, backlogs)
('b5555555-5555-5555-5555-555555555555', 'a2222222-0000-0000-0000-000000000005', 'STU1058', 'Vikram Verma', 'student5@prismedu.com', '+91 9123456785', '2003-03-17', 'male', 'c2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 3, 2022, 'f2222222-2222-2222-2222-222222222222', 'active', 'enrolled'),
-- Student 6: Neha Joshi (Good Standing)
('b6666666-6666-6666-6666-666666666666', 'a2222222-0000-0000-0000-000000000006', 'STU1063', 'Neha Joshi', 'student6@prismedu.com', '+91 9123456786', '2004-07-11', 'female', 'c2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 2, 2023, 'f2222222-2222-2222-2222-222222222222', 'active', 'enrolled');

-- 6. ADMISSION PROFILES
INSERT INTO admission_profiles (student_id, tenth_percentage, twelfth_percentage, previous_gpa, previous_backlogs, family_income, financial_assistance, guardian_name, guardian_relationship, guardian_mobile) VALUES
('b1111111-1111-1111-1111-111111111111', 89.40, 91.20, 8.75, 0, 850000.00, 'not_required', 'Rajesh Sharma', 'Father', '+91 9811122233'),
('b2222222-2222-2222-2222-222222222222', 72.50, 68.00, 6.20, 2, 180000.00, 'required', 'Kamlesh Patel', 'Father', '+91 9811122234'),
('b3333333-3333-3333-3333-333333333333', 78.00, 74.50, 6.90, 1, 420000.00, 'partial', 'Sunil Gupta', 'Father', '+91 9811122235'),
('b4444444-4444-4444-4444-444444444444', 94.00, 92.50, 9.10, 0, 1200000.00, 'not_required', 'Ashok Singh', 'Father', '+91 9811122236'),
('b5555555-5555-5555-5555-555555555555', 61.20, 58.40, 5.10, 4, 150000.00, 'required', 'Mahesh Verma', 'Father', '+91 9811122237'),
('b6666666-6666-6666-6666-666666666666', 86.50, 85.00, 8.40, 0, 650000.00, 'not_required', 'Deepak Joshi', 'Father', '+91 9811122238');

-- 7. SUBJECTS
INSERT INTO subjects (id, course_id, name, code, semester, credits, description) VALUES
('ee011111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Database Management Systems', 'CS301', 3, 4, 'Relational model, SQL, normalization, transactions and indexing'),
('ee022222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Data Structures and Algorithms', 'CS302', 3, 4, 'Trees, graphs, dynamic programming, sorting and searching algorithms'),
('ee033333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'Operating Systems', 'CS303', 3, 3, 'Process synchronization, memory management, virtual memory, scheduling'),
('ee044444-4444-4444-4444-444444444444', 'c1111111-1111-1111-1111-111111111111', 'Computer Networks', 'CS304', 3, 3, 'OSI model, TCP/IP, routing protocols, flow control and security');

-- 8. LEARNING RESOURCES
INSERT INTO learning_resources (id, subject_id, title, description, type, content_text, duration_minutes, is_active, created_by) VALUES
('11111111-1111-1111-1111-111111111111', 'ee011111-1111-1111-1111-111111111111', 'DBMS Lecture Notes - Normalization (1NF to BCNF)', 'Comprehensive guide on database normalization including 1NF, 2NF, 3NF, and Boyce-Codd Normal Form with practical examples.', 'note', 'Normalization is the process of organizing data in a database to reduce data redundancy and improve data integrity. 1NF requires atomic values. 2NF removes partial functional dependencies on candidate keys. 3NF removes transitive functional dependencies. BCNF is a stricter version where for every X -> Y, X must be a super key.', 45, true, 'f1111111-1111-1111-1111-111111111111'),
('11222222-2222-2222-2222-222222222222', 'ee011111-1111-1111-1111-111111111111', 'SQL Indexing and Query Optimization Handbook', 'In-depth guide covering B-tree indexes, hash indexing, explain analyze and cost-based query plan analysis.', 'pdf', 'An index is a data structure that improves the speed of data retrieval operations on a database table. B-trees keep data sorted and allow searches, sequential access, insertions, and deletions in logarithmic time.', 60, true, 'f1111111-1111-1111-1111-111111111111'),
('11333333-3333-3333-3333-333333333333', 'ee011111-1111-1111-1111-111111111111', 'Video Lecture: ACID Properties and Concurrency Control', 'Video breakdown of Atomicity, Consistency, Isolation, and Durability with 2-Phase Locking examples.', 'video', 'https://www.youtube.com/watch?v=sample-acid', 35, true, 'f1111111-1111-1111-1111-111111111111'),
('11444444-4444-4444-4444-444444444444', 'ee022222-2222-2222-2222-222222222222', 'Graph Algorithms Notes: BFS, DFS and Dijkstra', 'Complete study guide for breadth-first search, depth-first search and shortest path calculation.', 'note', 'Graph representation using adjacency matrices and lists. Dijkstra uses a priority queue for single-source shortest paths on non-negative weighted graphs in O((V + E) log V) time.', 50, true, 'f1111111-1111-1111-1111-111111111111');

-- 9. ASSIGNMENTS & QUIZZES
INSERT INTO assignments (id, resource_id, subject_id, title, description, max_marks, due_date, created_by) VALUES
('a5111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'ee011111-1111-1111-1111-111111111111', 'Assignment 1: Database Schema Normalization Exercise', 'Given a raw relational schema with candidate keys and functional dependencies, decompose it into 3NF and BCNF step by step.', 100, NOW() + INTERVAL '7 days', 'f1111111-1111-1111-1111-111111111111'),
('a5222222-2222-2222-2222-222222222222', '11444444-4444-4444-4444-444444444444', 'ee022222-2222-2222-2222-222222222222', 'Assignment 2: Dijkstra Shortest Path Implementation', 'Implement Dijkstra algorithm in C++ or Python and test against the provided benchmark graph datasets.', 100, NOW() + INTERVAL '12 days', 'f1111111-1111-1111-1111-111111111111');

INSERT INTO quizzes (id, resource_id, subject_id, title, description, total_questions, total_marks, duration_minutes, questions, created_by) VALUES
('0b111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'ee011111-1111-1111-1111-111111111111', 'DBMS Normalization & Relational Theory Quiz', 'Test your understanding of functional dependencies, keys, and 1NF through BCNF.', 5, 50, 20,
'[
  {"id": "q1", "question": "Which normal form requires eliminating partial functional dependencies on candidate keys?", "options": ["1NF", "2NF", "3NF", "BCNF"], "correct_index": 1, "explanation": "2NF mandates that all non-prime attributes are fully functionally dependent on every candidate key."},
  {"id": "q2", "question": "In 3NF, what kind of functional dependencies are prohibited for non-prime attributes?", "options": ["Trivial", "Transitive", "Multi-valued", "Partial"], "correct_index": 1, "explanation": "3NF requires that no non-prime attribute depends transitively on a candidate key."},
  {"id": "q3", "question": "For a relation to be in BCNF, for every functional dependency X -> Y:", "options": ["X must be a super key", "Y must be a super key", "X must be a prime attribute", "Y must be non-prime"], "correct_index": 0, "explanation": "BCNF requires that the determinant X is always a super key."},
  {"id": "q4", "question": "Which ACID property guarantees that all operations within a transaction either completely succeed or completely fail?", "options": ["Consistency", "Atomicity", "Isolation", "Durability"], "correct_index": 1, "explanation": "Atomicity ensures all-or-nothing execution of a transaction."},
  {"id": "q5", "question": "Which data structure is most commonly used for database indexes allowing efficient range queries?", "options": ["Hash Table", "Binary Search Tree", "B+ Tree", "Heap"], "correct_index": 2, "explanation": "B+ Trees store all keys in leaves linked sequentially, making range queries exceptionally fast."}
]'::jsonb, 'f1111111-1111-1111-1111-111111111111');

-- 10. ATTENDANCE RECORDS (Past 30 days for Priya Patel STU1024 - demonstrating decline)
DO $$
DECLARE
  dt DATE;
  s_id UUID := 'b2222222-2222-2222-2222-222222222222';
  sub_id UUID := 'ee011111-1111-1111-1111-111111111111';
  fac_id UUID := 'f1111111-1111-1111-1111-111111111111';
BEGIN
  FOR i IN 1..30 LOOP
    dt := CURRENT_DATE - (30 - i);
    -- Skip weekends
    IF EXTRACT(DOW FROM dt) NOT IN (0, 6) THEN
      -- First 15 days: mostly present (85%)
      -- Last 15 days: mostly absent (declining to 60%)
      IF i <= 15 THEN
        INSERT INTO attendance_records (student_id, subject_id, date, is_present, recorded_by)
        VALUES (s_id, sub_id, dt, (i % 6 != 0), fac_id);
      ELSE
        INSERT INTO attendance_records (student_id, subject_id, date, is_present, recorded_by)
        VALUES (s_id, sub_id, dt, (i % 2 = 0), fac_id);
      END IF;
    END IF;
  END LOOP;
END $$;

-- 11. STUDENT INSIGHTS (Pre-computed for demo)
INSERT INTO student_insights (id, student_id, academic_level, attendance_level, financial_level, career_level, support_level, academic_trend, attendance_trend, engagement_trend, quiz_trend, assignment_trend, recent_changes, last_updated) VALUES
(
  '1a111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222', -- Priya Patel (STU1024)
  'attention_required',
  'declining',
  'attention_required',
  'good',
  'good',
  '[{"date": "Aug", "value": 78}, {"date": "Sep", "value": 74}, {"date": "Oct", "value": 68}, {"date": "Nov", "value": 63}, {"date": "Dec", "value": 62}]'::jsonb,
  '[{"date": "Week 1", "value": 85}, {"date": "Week 2", "value": 82}, {"date": "Week 3", "value": 74}, {"date": "Week 4", "value": 69}]'::jsonb,
  '[{"date": "Week 1", "value": 80}, {"date": "Week 2", "value": 72}, {"date": "Week 3", "value": 60}, {"date": "Week 4", "value": 52}]'::jsonb,
  '[{"date": "Quiz 1", "value": 76}, {"date": "Quiz 2", "value": 68}, {"date": "Quiz 3", "value": 54}]'::jsonb,
  '[{"date": "Assign 1", "value": 85}, {"date": "Assign 2", "value": 70}, {"date": "Assign 3", "value": 50}]'::jsonb,
  '["Attendance has decreased from 82% to 69%", "Assignment completion has declined over the last 3 weeks", "Quiz performance has decreased in DBMS", "Learning activity on portal has reduced by 40%"]'::jsonb,
  NOW()
),
(
  '1a222222-2222-2222-2222-222222222222',
  'b1111111-1111-1111-1111-111111111111', -- Aarav Sharma (STU1021)
  'good',
  'good',
  'good',
  'good',
  'good',
  '[{"date": "Aug", "value": 84}, {"date": "Sep", "value": 86}, {"date": "Oct", "value": 88}, {"date": "Nov", "value": 90}]'::jsonb,
  '[{"date": "Week 1", "value": 92}, {"date": "Week 2", "value": 94}, {"date": "Week 3", "value": 91}, {"date": "Week 4", "value": 95}]'::jsonb,
  '[{"date": "Week 1", "value": 88}, {"date": "Week 2", "value": 90}, {"date": "Week 3", "value": 92}, {"date": "Week 4", "value": 94}]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '["Consistently high attendance above 90%", "Completed all 3 recent assignments on time"]'::jsonb,
  NOW()
),
(
  '1a333333-3333-3333-3333-333333333333',
  'b5555555-5555-5555-5555-555555555555', -- Vikram Verma (STU1058)
  'critical',
  'critical',
  'attention_required',
  'declining',
  'attention_required',
  '[{"date": "Aug", "value": 60}, {"date": "Sep", "value": 55}, {"date": "Oct", "value": 51}, {"date": "Nov", "value": 48}]'::jsonb,
  '[{"date": "Week 1", "value": 65}, {"date": "Week 2", "value": 58}, {"date": "Week 3", "value": 52}, {"date": "Week 4", "value": 47}]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '["Attendance has dropped below 50%", "4 active backlogs reported", "Has not submitted the last 2 assignments"]'::jsonb,
  NOW()
);

-- 12. PREDICTIONS (Internal ML model output)
INSERT INTO predictions (student_id, risk_score, risk_level, features_used) VALUES
('b1111111-1111-1111-1111-111111111111', 0.12, 'low', '{"gpa": 8.75, "attendance": 94, "backlogs": 0}'::jsonb),
('b2222222-2222-2222-2222-222222222222', 0.68, 'high', '{"gpa": 6.20, "attendance": 69, "backlogs": 2, "income": 180000}'::jsonb),
('b3333333-3333-3333-3333-333333333333', 0.44, 'medium', '{"gpa": 6.90, "attendance": 76, "backlogs": 1}'::jsonb),
('b4444444-4444-4444-4444-444444444444', 0.08, 'low', '{"gpa": 9.10, "attendance": 96, "backlogs": 0}'::jsonb),
('b5555555-5555-5555-5555-555555555555', 0.84, 'high', '{"gpa": 5.10, "attendance": 47, "backlogs": 4, "income": 150000}'::jsonb),
('b6666666-6666-6666-6666-666666666666', 0.15, 'low', '{"gpa": 8.40, "attendance": 91, "backlogs": 0}'::jsonb);

-- 13. SCHOLARSHIPS
INSERT INTO scholarships (name, provider, eligibility, benefits, deadline, required_documents, application_link, min_income, max_income, min_percentage) VALUES
(
  'Merit-cum-Means Post-Matric Scholarship',
  'Ministry of Minority Affairs / State Higher Education',
  'Students scoring >= 65% in qualifying examination with annual family income under ₹2,50,000.',
  '100% tuition fee waiver up to ₹70,000 per academic year plus maintenance allowance of ₹10,000.',
  CURRENT_DATE + INTERVAL '45 days',
  ARRAY['Income Certificate', 'Previous Year Marksheet', 'College ID Card', 'Bank Passbook Copy'],
  'https://scholarships.gov.in',
  0, 250000, 65.0
),
(
  'National Science & Engineering Merit Scholarship',
  'National Science Foundation',
  'Enrolled in technical/engineering degree with 12th score >= 80% and current GPA >= 7.5.',
  '₹50,000 annual scholarship for research, laptops, and technical course materials.',
  CURRENT_DATE + INTERVAL '60 days',
  ARRAY['12th Marksheet', 'College Bonafide Certificate', 'Research Interest Statement'],
  'https://scholarships.gov.in/science',
  0, 800000, 80.0
),
(
  'Pragati Scholarship Scheme for Girls',
  'AICTE (All India Council for Technical Education)',
  'Female students admitted to first or second year technical degree with family income <= ₹8,00,000.',
  '₹50,000 per annum towards college fee, books, equipment, and hostel expenses.',
  CURRENT_DATE + INTERVAL '30 days',
  ARRAY['Income Certificate', 'Admission Letter', 'Aadhaar Card', 'Tuition Fee Receipt'],
  'https://www.aicte-india.org/schemes/students-development-schemes/Pragati',
  0, 800000, 60.0
);

-- 14. EDUCATIONAL LOANS
INSERT INTO educational_loans (name, provider, loan_info, eligibility, interest_rate, max_amount, important_conditions, application_link) VALUES
(
  'Vidya Lakshmi Education Loan',
  'State Bank of India / NSDL portal',
  'Comprehensive student loan covering tuition fees, examination, library, lab charges, and hostel expenses.',
  'Indian national admitted to higher education technical program through entrance examination.',
  8.65,
  1500000.00,
  'No collateral required for loans up to ₹7.5 Lakhs. Repayment begins 1 year after course completion.',
  'https://www.vidyalakshmi.co.in'
),
(
  'Pradhan Mantri Vidya Lakshmi Student Support Loan',
  'Canara Bank',
  'Subsidized interest rate education loan for undergraduate engineering and science students.',
  'Enrolled in AICTE/UGC approved technical institution with verified family income below ₹4.5 Lakhs for interest subsidy.',
  8.25,
  1000000.00,
  'Full interest subsidy during the moratorium period (course duration + 1 year) for eligible families.',
  'https://www.canarabank.com/education-loan'
);

-- 15. COUNSELLORS
INSERT INTO counsellors (name, specialization, email, mobile, availability, office_location) VALUES
(
  'Dr. Aruna Sharma, Ph.D.',
  'Student Wellness, Academic Stress & Anxiety Management',
  'wellness.counsellor@prismedu.com',
  '+91 9822334455',
  'Mon - Fri: 10:00 AM - 4:00 PM (In-person & Confidential Video Call)',
  'Student Welfare Centre, Block B, Room 204'
),
(
  'Prof. Rajesh Ramanathan',
  'Career Transitions, Motivation & Personal Mentorship',
  'mentorship@prismedu.com',
  '+91 9822334456',
  'Tue, Thu, Sat: 2:00 PM - 5:00 PM',
  'Academic Block C, Room 112'
);

-- 16. CAREER OPPORTUNITIES
INSERT INTO career_opportunities (type, title, organization, description, required_skills, application_link, deadline, relevant_courses) VALUES
(
  'internship',
  'Full Stack Software Engineering Intern',
  'ThoughtWorks Technologies',
  'Work with experienced agile engineers building cloud-native web applications using TypeScript, React, and Node.js.',
  ARRAY['JavaScript', 'TypeScript', 'React', 'Git', 'Data Structures'],
  'https://thoughtworks.com/careers',
  CURRENT_DATE + INTERVAL '25 days',
  ARRAY['BTECH-CSE', 'BTECH-IT']
),
(
  'job',
  'Junior Backend Developer',
  'Persistent Systems',
  'Design and implement REST APIs, microservices, and database schemas with relational and NoSQL databases.',
  ARRAY['Python', 'SQL', 'PostgreSQL', 'FastAPI', 'Docker'],
  'https://persistentsystems.com/careers',
  CURRENT_DATE + INTERVAL '40 days',
  ARRAY['BTECH-CSE', 'BTECH-IT']
),
(
  'certification',
  'AWS Certified Cloud Practitioner (Academic Track)',
  'Amazon Web Services (AWS)',
  'Foundational understanding of AWS cloud services, architecture, security, and pricing with subsidized institutional exam vouchers.',
  ARRAY['Cloud Computing', 'AWS', 'Security', 'Networking'],
  'https://aws.amazon.com/certification/certified-cloud-practitioner',
  CURRENT_DATE + INTERVAL '90 days',
  ARRAY['BTECH-CSE', 'BTECH-IT']
),
(
  'skill_resource',
  'Database Internals & Advanced Normalization Masterclass',
  'PRISM Academic Career Cell',
  'Curated deep-dive into database storage engines, B+ Trees, WAL, and enterprise normalization patterns.',
  ARRAY['SQL', 'DBMS', 'Normalization', 'Indexing'],
  'https://prismedu.internal/masterclasses/dbms',
  NULL,
  ARRAY['BTECH-CSE', 'BTECH-IT']
);

-- 17. INTERVENTIONS (Sample for demo)
INSERT INTO interventions (id, student_id, faculty_id, type, description, status, follow_up_date, outcome) VALUES
(
  '1b111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222', -- Priya Patel
  'f1111111-1111-1111-1111-111111111111', -- Dr. Sarah Mitchell
  'academic',
  'Scheduled 1-on-1 tutoring on DBMS Normalization concepts. Provided structured practice worksheets.',
  'in_progress',
  CURRENT_DATE + INTERVAL '5 days',
  'Student attended first session, completed 2 practice problems with good progress.'
),
(
  '1b222222-2222-2222-2222-222222222222',
  'b2222222-2222-2222-2222-222222222222',
  'f1111111-1111-1111-1111-111111111111',
  'financial',
  'Guided student to apply for the Merit-cum-Means Scholarship. Verified necessary documents with student affairs cell.',
  'pending',
  CURRENT_DATE + INTERVAL '10 days',
  NULL
);

-- 18. NOTIFICATIONS
INSERT INTO notifications (user_id, title, message, type, is_read, action_url) VALUES
('a2222222-0000-0000-0000-000000000002', 'Academic Mentorship Session Scheduled', 'Dr. Sarah Mitchell has scheduled a follow-up review for DBMS on Friday.', 'intervention', false, '/student/support'),
('a2222222-0000-0000-0000-000000000002', 'Scholarship Deadline Approaching', 'Merit-cum-Means Post-Matric Scholarship application closes in 45 days. Review requirements today.', 'financial', false, '/student/financial'),
('a2222222-0000-0000-0000-000000000002', 'New Assignment Available', 'Assignment 1: Database Schema Normalization Exercise is due in 7 days.', 'learning', false, '/student/learning'),
('a1111111-0000-0000-0000-000000000001', 'Student Requires Attention', 'Priya Patel (STU1024) attendance declined to 69%. Academic indicators suggest intervention.', 'alert', false, '/faculty/students/b2222222-2222-2222-2222-222222222222');