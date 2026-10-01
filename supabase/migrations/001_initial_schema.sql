-- =============================================================================
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
