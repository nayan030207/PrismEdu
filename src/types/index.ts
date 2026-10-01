// ─────────────────────────────────────────────────────────────────────────────
// PRISM-EDU – Central Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

// ── Primitive enums ────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'faculty' | 'student';
export type AccountStatus = 'active' | 'inactive' | 'suspended';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type InterventionType =
  | 'academic'
  | 'attendance_engagement'
  | 'financial'
  | 'personal_support'
  | 'career';
export type InterventionStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled';
export type InsightLevel = 'good' | 'attention_required' | 'declining' | 'critical';
export type ResourceType = 'note' | 'pdf' | 'video' | 'assignment' | 'quiz';
export type CareerType = 'job' | 'internship' | 'certification' | 'skill_resource';
export type StudentOutcome =
  | 'enrolled'
  | 'graduated'
  | 'withdrawn'
  | 'transferred'
  | 'on_leave';
export type FinancialAssistance = 'required' | 'not_required' | 'partial';
export type RiskLevel = 'low' | 'medium' | 'high';

// ── Core entities ──────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  created_at: string;
  last_login_at?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  created_at: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  department_id: string;
  duration_years: number;
  description?: string;
}

export interface Faculty {
  id: string;
  user_id: string;
  employee_id: string;
  full_name: string;
  email: string;
  mobile?: string;
  department_id?: string;
  designation?: string;
  specialization?: string;
  status: AccountStatus;
}

export interface Student {
  id: string;
  user_id: string;
  student_id: string;
  full_name: string;
  email: string;
  mobile?: string;
  date_of_birth?: string;
  gender?: Gender;
  course_id?: string;
  department_id?: string;
  academic_year?: number;
  admission_year?: number;
  /** ID of the assigned faculty mentor */
  faculty_id?: string;
  status: AccountStatus;
  current_outcome: StudentOutcome;
  created_at: string;
}

export interface AdmissionProfile {
  id: string;
  student_id: string;
  tenth_school_name?: string;
  tenth_board?: string;
  tenth_passing_year?: number;
  tenth_percentage?: number;
  twelfth_school_name?: string;
  twelfth_board?: string;
  twelfth_passing_year?: number;
  physics_marks?: number;
  chemistry_marks?: number;
  maths_marks?: number;
  twelfth_percentage?: number;
  jee_main_percentile?: number;
  jee_main_rank?: number;
  mht_cet_percentile?: number;
  mht_cet_rank?: number;
  category_rank?: number;
  cap_round_allotment?: string;
  previous_gpa?: number;
  previous_backlogs?: number;
  family_income?: number;
  financial_assistance: FinancialAssistance;
  guardian_name?: string;
  guardian_relationship?: string;
  guardian_mobile?: string;
  guardian_email?: string;
  guardian_occupation?: string;
}

// ── Academic ───────────────────────────────────────────────────────────────

export interface Subject {
  id: string;
  course_id: string;
  name: string;
  code: string;
  semester: number;
  credits: number;
  description?: string;
}

export interface AcademicRecord {
  id: string;
  student_id: string;
  subject_id: string;
  semester: number;
  internal_marks?: number;
  external_marks?: number;
  total_marks?: number;
  grade?: string;
  backlogs?: number;
  recorded_at: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  subject_id?: string;
  date: string;
  is_present: boolean;
}

// ── Learning resources ─────────────────────────────────────────────────────

export interface LearningResource {
  id: string;
  subject_id: string;
  title: string;
  description?: string;
  type: ResourceType;
  content_url?: string;
  content_text?: string;
  duration_minutes?: number;
  is_active: boolean;
  created_at: string;
}

export interface Assignment {
  id: string;
  resource_id: string;
  subject_id: string;
  title: string;
  description?: string;
  max_marks: number;
  due_date?: string;
  created_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  submission_text?: string;
  file_url?: string;
  submitted_at: string;
  marks_obtained?: number;
  feedback?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  resource_id: string;
  subject_id: string;
  title: string;
  description?: string;
  total_questions: number;
  total_marks: number;
  duration_minutes: number;
  questions: QuizQuestion[];
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  /** Map of question id to selected option index */
  answers: Record<string, number>;
  score?: number;
  total_marks?: number;
  started_at: string;
  completed_at?: string;
  is_completed: boolean;
}

// ── Activity & engagement ──────────────────────────────────────────────────

export interface ActivityEvent {
  id: string;
  student_id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  session_id?: string;
  created_at: string;
}

// ── ML / Predictions ───────────────────────────────────────────────────────

export interface Prediction {
  id: string;
  student_id: string;
  model_version_id?: string;
  risk_score: number;
  risk_level: RiskLevel;
  features_used: Record<string, unknown>;
  predicted_at: string;
}

export interface PredictionFeatures {
  tenth_percentage: number;
  twelfth_percentage: number;
  previous_gpa: number;
  previous_backlogs: number;
  family_income: number;
  financial_assistance: string;
  attendance_rate: number;
  avg_quiz_score: number;
  assignment_completion_rate: number;
  learning_frequency: number;
  inactive_days: number;
}

// ── Insights ───────────────────────────────────────────────────────────────

export interface TrendPoint {
  date: string;
  value: number;
  label?: string;
}

export interface StudentInsight {
  id: string;
  student_id: string;
  academic_level: InsightLevel;
  attendance_level: InsightLevel;
  financial_level: InsightLevel;
  career_level: InsightLevel;
  support_level: InsightLevel;
  academic_trend: TrendPoint[];
  attendance_trend: TrendPoint[];
  engagement_trend: TrendPoint[];
  quiz_trend: TrendPoint[];
  assignment_trend: TrendPoint[];
  recent_changes: string[];
  last_updated: string;
}

// ── Interventions ──────────────────────────────────────────────────────────

export interface Intervention {
  id: string;
  student_id: string;
  faculty_id: string;
  type: InterventionType;
  description: string;
  status: InterventionStatus;
  follow_up_date?: string;
  outcome?: string;
  created_at: string;
  updated_at: string;
}

// ── Financial support ──────────────────────────────────────────────────────

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  eligibility?: string;
  benefits?: string;
  deadline?: string;
  required_documents?: string[];
  application_link?: string;
  is_active: boolean;
  min_income?: number;
  max_income?: number;
  min_percentage?: number;
}

export interface EducationalLoan {
  id: string;
  name: string;
  provider: string;
  loan_info?: string;
  eligibility?: string;
  interest_rate?: number;
  max_amount?: number;
  important_conditions?: string;
  application_link?: string;
  is_active: boolean;
}

// ── Counselling & career ───────────────────────────────────────────────────

export interface Counsellor {
  id: string;
  name: string;
  specialization?: string;
  email?: string;
  mobile?: string;
  availability?: string;
  office_location?: string;
  is_active: boolean;
}

export interface CareerOpportunity {
  id: string;
  type: CareerType;
  title: string;
  organization?: string;
  description?: string;
  required_skills?: string[];
  application_link?: string;
  deadline?: string;
  relevant_courses?: string[];
  provider?: string;
  is_active: boolean;
  created_at: string;
}

// ── Notifications ──────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

// ── API response wrappers ──────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ── Auth types ─────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  /** references faculty.id or student.id depending on role */
  entityId: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: number;
}

// ── Dashboard stats ────────────────────────────────────────────────────────

export interface AdminDashboardStats {
  totalStudents: number;
  totalFaculty: number;
  studentsRequiringAttention: number;
  academicConcerns: number;
  attendanceConcerns: number;
  financialIndicators?: number;
  personalIndicators?: number;
  careerIndicators?: number;
  financialSupportIndicators?: number;
  personalSupportIndicators?: number;
  careerSupportIndicators?: number;
  recentInterventions?: number;
  interventionSummary?: {
    total: number;
    pending?: number;
    inProgress?: number;
    completed?: number;
    byCategory: Record<string, number>;
  };
}

export interface FacultyDashboardStats {
  totalAssignedStudents: number;
  studentsRequiringAttention: number;
  academicConcerns: number;
  attendanceConcerns: number;
  financialIndicators?: number;
  personalIndicators?: number;
  careerIndicators?: number;
  financialSupportIndicators?: number;
  personalSupportIndicators?: number;
  careerSupportIndicators?: number;
  pendingInterventions: number;
  recentChanges?: RecentChange[];
}

export interface RecentChange {
  studentName: string;
  studentId: string;
  change: string;
  time: string;
  severity: 'low' | 'medium' | 'high';
}

// ── Bulk import types ──────────────────────────────────────────────────────

export interface StudentImportRow {
  role?: 'admin' | 'faculty' | 'student';
  employee_id?: string;
  designation?: string;
  specialization?: string;
  student_id: string;
  full_name: string;
  email: string;
  mobile?: string;
  date_of_birth?: string | number;
  gender?: string;
  course_code?: string;
  department_code?: string;
  academic_year?: number;
  admission_year?: number;
  tenth_school_name?: string;
  tenth_board?: string;
  tenth_passing_year?: number;
  tenth_percentage?: number;
  twelfth_school_name?: string;
  twelfth_board?: string;
  twelfth_passing_year?: number;
  physics_marks?: number;
  chemistry_marks?: number;
  maths_marks?: number;
  twelfth_percentage?: number;
  jee_main_percentile?: number;
  jee_main_rank?: number;
  mht_cet_percentile?: number;
  mht_cet_rank?: number;
  category_rank?: number;
  cap_round_allotment?: string;
  previous_gpa?: number;
  previous_backlogs?: number;
  family_income?: number;
  financial_assistance?: string;
  guardian_name?: string;
  guardian_mobile?: string;
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
}

export interface ImportDuplicate {
  row: number;
  student_id: string;
}

export interface ImportValidationResult {
  valid: StudentImportRow[];
  errors: ImportError[];
  duplicates: ImportDuplicate[];
}

export interface HeaderTagMapping {
  rawTag: string;
  normalizedTag: string;
  resolvedField: string | null;
  matched: boolean;
}

export interface ParseFileResult {
  rows: Record<string, unknown>[];
  tagMappings: HeaderTagMapping[];
  headerRowIndex: number;
}

