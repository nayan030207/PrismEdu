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

export const INITIAL_DEMO_STUDENTS: DemoStudent[] = [
  {
    id: 's-1024',
    student_id: 'STU1024',
    full_name: 'Rahul Sharma',
    email: 'rahul.sharma@prismedu.com',
    mobile: '9145498218',
    course: 'B.Tech in Computer Science',
    department: 'Computer Science and Engineering',
    academic_year: 2,
    status: 'active',
    attendance_percentage: 73.85,
    previous_gpa: 6.8,
    previous_backlogs: 1,
    family_income: 90000,
    financial_assistance: 'partial',
    insight: { academic: 'attention_required', attendance: 'declining', financial: 'under_review', career: 'good' },
    recent_changes: ['Attendance dropped to 73.85% (below 75% threshold)'],
  },
  {
    id: 's-1025',
    student_id: 'STU1025',
    full_name: 'Neha Sharma',
    email: 'neha.sharma@prismedu.com',
    mobile: '9390158621',
    course: 'B.Tech in Computer Science',
    department: 'Computer Science and Engineering',
    academic_year: 2,
    status: 'active',
    attendance_percentage: 87.69,
    previous_gpa: 8.5,
    previous_backlogs: 0,
    family_income: 350000,
    financial_assistance: 'not_required',
    insight: { academic: 'good', attendance: 'good', financial: 'good', career: 'good' },
    recent_changes: ['Regular attendance maintaining 87.69%'],
  },
  {
    id: 's-1026',
    student_id: 'STU1026',
    full_name: 'Arjun More',
    email: 'arjun.more@prismedu.com',
    mobile: '9004097021',
    course: 'B.Tech in Information Technology',
    department: 'Information Technology',
    academic_year: 2,
    status: 'active',
    attendance_percentage: 82.22,
    previous_gpa: 7.9,
    previous_backlogs: 0,
    family_income: 45000,
    financial_assistance: 'required',
    insight: { academic: 'good', attendance: 'good', financial: 'attention_required', career: 'good' },
    recent_changes: ['Eligible for Post-Matric Financial Aid grant'],
  },
  {
    id: 's-1027',
    student_id: 'STU1027',
    full_name: 'Anushka Joshi',
    email: 'anushka.joshi@prismedu.com',
    mobile: '9642337085',
    course: 'B.Tech in Information Technology',
    department: 'Information Technology',
    academic_year: 3,
    status: 'active',
    attendance_percentage: 83.0,
    previous_gpa: 8.2,
    previous_backlogs: 0,
    family_income: 120000,
    financial_assistance: 'not_required',
    insight: { academic: 'good', attendance: 'good', financial: 'good', career: 'good' },
    recent_changes: ['Enrolled in Advanced Database Systems'],
  },
  {
    id: 's-1028',
    student_id: 'STU1028',
    full_name: 'Siddhant Dhole',
    email: 'siddhant.dhole@prismedu.com',
    mobile: '9562713610',
    course: 'B.Tech in Computer Science',
    department: 'Computer Science and Engineering',
    academic_year: 2,
    status: 'active',
    attendance_percentage: 49.33,
    previous_gpa: 5.9,
    previous_backlogs: 2,
    family_income: 900000,
    financial_assistance: 'not_required',
    insight: { academic: 'critical', attendance: 'declining', financial: 'good', career: 'good' },
    recent_changes: ['Critical alert: Attendance 49.33% and 2 backlogs'],
  },
  {
    id: 's-1029',
    student_id: 'STU1029',
    full_name: 'Tanvi Thakur',
    email: 'tanvi.thakur@prismedu.com',
    mobile: '9455886138',
    course: 'B.Tech in Artificial Intelligence & Data Science',
    department: 'Artificial Intelligence and Data Science',
    academic_year: 2,
    status: 'active',
    attendance_percentage: 81.25,
    previous_gpa: 8.1,
    previous_backlogs: 0,
    family_income: 75000,
    financial_assistance: 'partial',
    insight: { academic: 'good', attendance: 'good', financial: 'under_review', career: 'good' },
    recent_changes: ['Scholarship document verification pending'],
  },
  {
    id: 's-1030',
    student_id: 'STU1030',
    full_name: 'Ishaan Dhole',
    email: 'ishaan.dhole@prismedu.com',
    mobile: '9095285990',
    course: 'B.Tech in Artificial Intelligence & Data Science',
    department: 'Artificial Intelligence and Data Science',
    academic_year: 2,
    status: 'active',
    attendance_percentage: 78.0,
    previous_gpa: 7.6,
    previous_backlogs: 0,
    family_income: 900000,
    financial_assistance: 'not_required',
    insight: { academic: 'good', attendance: 'good', financial: 'good', career: 'good' },
    recent_changes: ['Completed Machine Learning Lab Assignment'],
  },
  {
    id: 's-1031',
    student_id: 'STU1031',
    full_name: 'Tanvi Mane',
    email: 'tanvi.mane@prismedu.com',
    mobile: '9787823191',
    course: 'B.Tech in Electrical Engineering',
    department: 'Electrical Engineering',
    academic_year: 3,
    status: 'active',
    attendance_percentage: 75.0,
    previous_gpa: 7.4,
    previous_backlogs: 0,
    family_income: 900000,
    financial_assistance: 'not_required',
    insight: { academic: 'good', attendance: 'good', financial: 'good', career: 'good' },
    recent_changes: ['Power Systems Lab submission completed'],
  },
  {
    id: 's-1032',
    student_id: 'STU1032',
    full_name: 'Aditya Mane',
    email: 'aditya.mane@prismedu.com',
    mobile: '9448370778',
    course: 'B.Tech in Civil Engineering',
    department: 'Civil Engineering',
    academic_year: 3,
    status: 'active',
    attendance_percentage: 89.41,
    previous_gpa: 8.4,
    previous_backlogs: 0,
    family_income: 120000,
    financial_assistance: 'not_required',
    insight: { academic: 'good', attendance: 'good', financial: 'good', career: 'good' },
    recent_changes: ['Structural Design Project submitted'],
  },
  {
    id: 's-1033',
    student_id: 'STU1033',
    full_name: 'Aditi Gaikwad',
    email: 'aditi.gaikwad@prismedu.com',
    mobile: '9941747248',
    course: 'B.Tech in Electrical Engineering',
    department: 'Electrical Engineering',
    academic_year: 2,
    status: 'active',
    attendance_percentage: 76.92,
    previous_gpa: 7.7,
    previous_backlogs: 0,
    family_income: 120000,
    financial_assistance: 'not_required',
    insight: { academic: 'good', attendance: 'good', financial: 'good', career: 'good' },
    recent_changes: ['Control Systems quiz passed'],
  },
  {
    id: 's-1034',
    student_id: 'STU1034',
    full_name: 'Kavya Shinde',
    email: 'kavya.shinde@prismedu.com',
    mobile: '9451037026',
    course: 'B.Tech in Artificial Intelligence & Data Science',
    department: 'Artificial Intelligence and Data Science',
    academic_year: 2,
    status: 'active',
    attendance_percentage: 66.25,
    previous_gpa: 6.4,
    previous_backlogs: 1,
    family_income: 200000,
    financial_assistance: 'not_required',
    insight: { academic: 'attention_required', attendance: 'declining', financial: 'good', career: 'good' },
    recent_changes: ['Attendance 66.25% - Mentorship check-in scheduled'],
  },
  {
    id: 's-1035',
    student_id: 'STU1035',
    full_name: 'Aditya Gaikwad',
    email: 'aditya.gaikwad2@prismedu.com',
    mobile: '9193045954',
    course: 'B.Tech in Civil Engineering',
    department: 'Civil Engineering',
    academic_year: 2,
    status: 'active',
    attendance_percentage: 58.75,
    previous_gpa: 6.2,
    previous_backlogs: 0,
    family_income: 500000,
    financial_assistance: 'not_required',
    insight: { academic: 'good', attendance: 'declining', financial: 'good', career: 'good' },
    recent_changes: ['Attendance warning issued (58.75%)'],
  },
  {
    id: 's-1036',
    student_id: 'STU1036',
    full_name: 'Pooja Wagh',
    email: 'pooja.wagh@prismedu.com',
    mobile: '9889725744',
    course: 'B.Tech in Artificial Intelligence & Data Science',
    department: 'Artificial Intelligence and Data Science',
    academic_year: 2,
    status: 'active',
    attendance_percentage: 65.88,
    previous_gpa: 6.9,
    previous_backlogs: 0,
    family_income: 500000,
    financial_assistance: 'not_required',
    insight: { academic: 'good', attendance: 'declining', financial: 'good', career: 'good' },
    recent_changes: ['Attendance below 75% threshold (65.88%)'],
  },
  {
    id: 's-1037',
    student_id: 'STU1037',
    full_name: 'Neha Pawar',
    email: 'neha.pawar@prismedu.com',
    mobile: '9033890845',
    course: 'B.Tech in Information Technology',
    department: 'Information Technology',
    academic_year: 2,
    status: 'active',
    attendance_percentage: 82.0,
    previous_gpa: 7.8,
    previous_backlogs: 0,
    family_income: 200000,
    financial_assistance: 'not_required',
    insight: { academic: 'good', attendance: 'good', financial: 'good', career: 'good' },
    recent_changes: ['Network Security lab completed'],
  },
  {
    id: 's-1038',
    student_id: 'STU1038',
    full_name: 'Rohan Kulkarni',
    email: 'rohan.kulkarni@prismedu.com',
    mobile: '9823019283',
    course: 'B.Tech in Mechanical Engineering',
    department: 'Mechanical Engineering',
    academic_year: 3,
    status: 'active',
    attendance_percentage: 71.0,
    previous_gpa: 6.7,
    previous_backlogs: 1,
    family_income: 85000,
    financial_assistance: 'partial',
    insight: { academic: 'attention_required', attendance: 'declining', financial: 'under_review', career: 'good' },
    recent_changes: ['Thermodynamics mid-term remedial assigned'],
  },
  {
    id: 's-1039',
    student_id: 'STU1039',
    full_name: 'Siddharth Joshi',
    email: 'siddharth.joshi@prismedu.com',
    mobile: '9765412390',
    course: 'B.Tech in Electronics & Telecommunication',
    department: 'Electronics and Telecommunication',
    academic_year: 3,
    status: 'active',
    attendance_percentage: 84.0,
    previous_gpa: 8.0,
    previous_backlogs: 0,
    family_income: 150000,
    financial_assistance: 'not_required',
    insight: { academic: 'good', attendance: 'good', financial: 'good', career: 'good' },
    recent_changes: ['DSP Signal Processing Lab cleared'],
  },
];

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
    (s) => s.student_id === newStudent.student_id || s.email === newStudent.email
  );

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

  return current[index];
}
