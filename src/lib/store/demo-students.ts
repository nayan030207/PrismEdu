import { generateDefaultPassword } from '@/lib/auth/password';
import { resolveBranchCourseDepartment } from '@/lib/utils/branch-resolver';

export interface DemoStudent {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  mobile?: string;
  date_of_birth?: string;
  gender?: string;
  initialPassword?: string;
  course: string;
  department: string;
  academic_year: number;
  status: 'active' | 'inactive';
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
  attendance_percentage?: number;
  attendance_rate?: number;
  academic_cgpa?: number;
  academic_backlogs?: number;
  faculty_mentor_name?: string;
  admission?: { previous_gpa?: number; financial_assistance?: string };
  family_income?: number;
  financial_assistance?: string;
  guardian_name?: string;
  guardian_relationship?: string;
  guardian_mobile?: string;
  insight: {
    academic: string;
    attendance: string;
    financial: string;
    career: string;
  };
  recent_changes?: string[];
}

/**
 * Income classification rule:
 * - Income < ₹50,000/yr -> Assistance Required (Level: attention_required)
 * - Income ₹50,000 - ₹90,000/yr -> Moderately Stable (Level: under_review)
 * - Income > ₹90,000/yr -> Financially Stable (Level: good)
 */
export function getFinancialStatusFromIncome(income?: number): {
  assistance: string;
  level: string;
} {
  if (income === undefined || income === null || isNaN(income)) {
    return { assistance: 'not_required', level: 'good' };
  }
  if (income < 50000) {
    return { assistance: 'required', level: 'attention_required' };
  }
  if (income >= 50000 && income <= 90000) {
    return { assistance: 'partial', level: 'under_review' };
  }
  return { assistance: 'not_required', level: 'good' };
}

/**
 * Sort students by risk priority so students requiring attention are placed at the VERY TOP.
 */
export function sortStudentsByRiskPriority(students: DemoStudent[]): DemoStudent[] {
  return [...students].sort((a, b) => {
    const getRiskScore = (s: DemoStudent) => {
      let score = 0;
      const ins = (s.insight || {}) as any;
      if (ins.academic === 'critical' || ins.academic === 'attention_required') score += 100;
      if (ins.attendance === 'critical' || ins.attendance === 'declining' || ins.attendance === 'attention_required') score += 80;
      if (ins.financial === 'attention_required' || ins.financial === 'critical') score += 60;
      if (ins.financial === 'under_review') score += 30;
      if (s.attendance_percentage !== undefined && s.attendance_percentage < 75) score += 50;
      if (s.previous_backlogs !== undefined && s.previous_backlogs > 0) score += 40;
      return score;
    };
    return getRiskScore(b) - getRiskScore(a);
  });
}

export const INITIAL_DEMO_STUDENTS: DemoStudent[] = [];

declare global {
  // eslint-disable-next-line no-var
  var __PRISM_DEMO_STUDENTS: DemoStudent[] | undefined;
}

if (!globalThis.__PRISM_DEMO_STUDENTS) {
  globalThis.__PRISM_DEMO_STUDENTS = [...INITIAL_DEMO_STUDENTS];
}

export function getDemoStudents(): DemoStudent[] {
  if (!globalThis.__PRISM_DEMO_STUDENTS) {
    globalThis.__PRISM_DEMO_STUDENTS = [...INITIAL_DEMO_STUDENTS];
  }
  return sortStudentsByRiskPriority(globalThis.__PRISM_DEMO_STUDENTS);
}

export function addDemoStudent(student: Partial<DemoStudent> & { full_name: string; email: string }): DemoStudent {
  const generatedPass = generateDefaultPassword(student.email, student.date_of_birth, student.full_name);
  const incomeRule = getFinancialStatusFromIncome(student.family_income);
  const branchInfo = resolveBranchCourseDepartment(student.department || student.course);

  const newStudent: DemoStudent = {
    id: student.id || `s-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    student_id: student.student_id || `STU${Math.floor(1000 + Math.random() * 9000)}`,
    full_name: student.full_name,
    email: student.email,
    mobile: student.mobile || '+91 9876543210',
    date_of_birth: student.date_of_birth || '2004-05-15',
    gender: student.gender || '',
    initialPassword: student.initialPassword || generatedPass,
    course: student.course || branchInfo.course,
    department: student.department || branchInfo.department,
    academic_year: student.academic_year || 1,
    status: student.status || 'active',
    tenth_school_name: student.tenth_school_name || '',
    tenth_board: student.tenth_board || '',
    tenth_passing_year: student.tenth_passing_year || 0,
    tenth_percentage: student.tenth_percentage || 0,
    twelfth_school_name: student.twelfth_school_name || '',
    twelfth_board: student.twelfth_board || '',
    twelfth_passing_year: student.twelfth_passing_year || 0,
    physics_marks: student.physics_marks || 0,
    chemistry_marks: student.chemistry_marks || 0,
    maths_marks: student.maths_marks || 0,
    twelfth_percentage: student.twelfth_percentage || 0,
    jee_main_percentile: student.jee_main_percentile || 0,
    jee_main_rank: student.jee_main_rank || 0,
    mht_cet_percentile: student.mht_cet_percentile || 0,
    mht_cet_rank: student.mht_cet_rank || 0,
    category_rank: student.category_rank || 0,
    cap_round_allotment: student.cap_round_allotment || '',
    previous_gpa: student.previous_gpa || 7.5,
    previous_backlogs: student.previous_backlogs || 0,
    attendance_percentage: student.attendance_percentage || 85,
    family_income: student.family_income || 0,
    financial_assistance: student.financial_assistance || incomeRule.assistance,
    guardian_name: student.guardian_name || '',
    guardian_relationship: student.guardian_relationship || 'Father',
    guardian_mobile: student.guardian_mobile || '',
    insight: student.insight || {
      academic: (student.previous_backlogs && student.previous_backlogs > 0) ? 'attention_required' : 'good',
      attendance: (student.attendance_percentage && student.attendance_percentage < 75) ? 'declining' : 'good',
      financial: incomeRule.level,
      career: 'good',
    },
    recent_changes: student.recent_changes || ['Initial baseline profile registered into cohort monitoring'],
  };

  const current = globalThis.__PRISM_DEMO_STUDENTS || [];
  const existingIdx = current.findIndex(
    (s) => s.student_id === newStudent.student_id || s.email.toLowerCase().trim() === newStudent.email.toLowerCase().trim()
  );

  // Invalidate predictions cache so graphs recalculate dynamically
  try {
    const { predictiveMlService } = require('@/lib/services/predictive-ml.service');
    const { featureEngineeringService } = require('@/lib/services/feature-engineering.service');
    predictiveMlService.clearPredictionCache(newStudent.id);
    featureEngineeringService.clearSnapshotCache(newStudent.id);
  } catch {
    // ignore
  }

  if (existingIdx !== -1) {
    current[existingIdx] = { ...current[existingIdx], ...newStudent };
    return current[existingIdx];
  }

  current.unshift(newStudent);
  return newStudent;
}

export function updateDemoStudent(idOrStudentId: string, updates: Partial<DemoStudent>): DemoStudent | null {
  const current = globalThis.__PRISM_DEMO_STUDENTS || [];
  const index = current.findIndex(
    (s) => s.id === idOrStudentId || s.student_id.toLowerCase().trim() === idOrStudentId.toLowerCase().trim()
  );
  if (index === -1) return null;

  if (updates.family_income !== undefined) {
    const incomeRule = getFinancialStatusFromIncome(updates.family_income);
    updates.financial_assistance = incomeRule.assistance;
    updates.insight = {
      ...(current[index].insight || {}),
      financial: incomeRule.level,
    } as any;
  }

  if (updates.attendance_percentage !== undefined) {
    const att = updates.attendance_percentage;
    const attLevel = att < 75 ? 'declining' : 'good';
    updates.insight = {
      ...(current[index].insight || {}),
      attendance: attLevel,
    } as any;
  }

  const existingRecent = current[index].recent_changes || [];
  const newRecent = updates.recent_changes
    ? [...updates.recent_changes, ...existingRecent]
    : existingRecent;

  current[index] = {
    ...current[index],
    ...updates,
    recent_changes: newRecent,
    insight: {
      ...current[index].insight,
      ...(updates.insight || {}),
    },
  };

  // Invalidate predictions cache so graphs recalculate dynamically
  try {
    const { predictiveMlService } = require('@/lib/services/predictive-ml.service');
    const { featureEngineeringService } = require('@/lib/services/feature-engineering.service');
    predictiveMlService.clearPredictionCache(current[index].id);
    featureEngineeringService.clearSnapshotCache(current[index].id);
  } catch {
    // ignore
  }

  return current[index];
}

