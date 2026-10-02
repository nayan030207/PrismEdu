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
  // 1. Top Attention & Key Highlight Students
  {
    id: 's-std001',
    student_id: 'STD001',
    full_name: 'Vishal More',
    email: 'student1@prismedu.com',
    mobile: '+91 9822010001',
    date_of_birth: '2004-04-12',
    course: 'B.Tech in Mechanical Engineering',
    department: 'Mechanical Engineering',
    academic_year: 3,
    status: 'active',
    attendance_rate: 52,
    attendance_percentage: 52,
    academic_cgpa: 5.8,
    academic_backlogs: 2,
    previous_gpa: 6.4,
    previous_backlogs: 2,
    family_income: 42000,
    financial_assistance: 'required',
    faculty_mentor_name: 'Prof. Rajesh Kulkarni',
    insight: {
      academic: 'critical',
      attendance: 'critical',
      financial: 'attention_required',
      career: 'declining',
    },
    recent_changes: ['Attendance dropped below 55%', 'Carrying 2 uncleared backlogs in Fluid Mechanics'],
  },
  {
    id: 's-std002',
    student_id: 'STD002',
    full_name: 'Aarti Salunkhe',
    email: 'student2@prismedu.com',
    mobile: '+91 9822010002',
    date_of_birth: '2004-09-18',
    course: 'B.Tech in Information Technology',
    department: 'Information Technology',
    academic_year: 2,
    status: 'active',
    attendance_rate: 61,
    attendance_percentage: 61,
    academic_cgpa: 6.2,
    academic_backlogs: 1,
    previous_gpa: 6.8,
    previous_backlogs: 1,
    family_income: 68000,
    financial_assistance: 'partial',
    faculty_mentor_name: 'Prof. David Reynolds',
    insight: {
      academic: 'attention_required',
      attendance: 'declining',
      financial: 'under_review',
      career: 'good',
    },
    recent_changes: ['Attendance decreased from 74% to 61%', 'Database mid-sem test marks dipped by 18%'],
  },
  {
    id: 's-std003',
    student_id: 'STD003',
    full_name: 'Karan Desai',
    email: 'student3@prismedu.com',
    mobile: '+91 9822010003',
    date_of_birth: '2003-12-05',
    course: 'B.Tech in Civil Engineering',
    department: 'Civil Engineering',
    academic_year: 3,
    status: 'active',
    attendance_rate: 48,
    attendance_percentage: 48,
    academic_cgpa: 5.4,
    academic_backlogs: 3,
    previous_gpa: 6.2,
    previous_backlogs: 3,
    family_income: 38000,
    financial_assistance: 'required',
    faculty_mentor_name: 'Dr. Sunita Deshmukh',
    insight: {
      academic: 'critical',
      attendance: 'critical',
      financial: 'attention_required',
      career: 'critical',
    },
    recent_changes: ['Attendance below 50% threshold', 'Active tuition installment default flag', 'Overdue intervention awaiting escalation'],
  },
  {
    id: 's-std004',
    student_id: 'STD004',
    full_name: 'Neha Bhosale',
    email: 'student4@prismedu.com',
    mobile: '+91 9822010004',
    date_of_birth: '2004-06-22',
    course: 'B.Tech in Computer Engineering',
    department: 'Computer Engineering',
    academic_year: 2,
    status: 'active',
    attendance_rate: 59,
    attendance_percentage: 59,
    academic_cgpa: 6.8,
    academic_backlogs: 1,
    previous_gpa: 7.2,
    previous_backlogs: 1,
    family_income: 85000,
    financial_assistance: 'partial',
    faculty_mentor_name: 'Dr. Sarah Mitchell',
    insight: {
      academic: 'attention_required',
      attendance: 'declining',
      financial: 'good',
      career: 'good',
    },
    recent_changes: ['Attendance dropped below 60%', 'Mentorship session in progress for DSA algorithms'],
  },
  {
    id: 's-std005',
    student_id: 'STD005',
    full_name: 'Rohit Pawar',
    email: 'student5@prismedu.com',
    mobile: '+91 9822010005',
    date_of_birth: '2003-08-14',
    course: 'B.Tech in Electronics Engineering',
    department: 'Electronics Engineering',
    academic_year: 3,
    status: 'active',
    attendance_rate: 63,
    attendance_percentage: 63,
    academic_cgpa: 7.1,
    academic_backlogs: 0,
    previous_gpa: 7.4,
    previous_backlogs: 0,
    family_income: 92000,
    financial_assistance: 'not_required',
    faculty_mentor_name: 'Dr. Amit Verma',
    insight: {
      academic: 'good',
      attendance: 'declining',
      financial: 'good',
      career: 'under_review',
    },
    recent_changes: ['Attendance dropped by 12% in current month', 'Lab attendance warning issued'],
  },

  // 2. Emerging Risk Students (Rapidly Increasing Risk)
  {
    id: 's-std006',
    student_id: 'STD006',
    full_name: 'Rahul Patil',
    email: 'rahul.patil@prismedu.com',
    mobile: '+91 9822010006',
    date_of_birth: '2004-10-10',
    course: 'B.Tech in Information Technology',
    department: 'Information Technology',
    academic_year: 2,
    status: 'active',
    attendance_rate: 68,
    attendance_percentage: 68,
    academic_cgpa: 6.5,
    academic_backlogs: 0,
    previous_gpa: 7.2,
    previous_backlogs: 0,
    family_income: 110000,
    financial_assistance: 'not_required',
    faculty_mentor_name: 'Prof. David Reynolds',
    insight: {
      academic: 'attention_required',
      attendance: 'declining',
      financial: 'good',
      career: 'good',
    },
    recent_changes: ['Risk score surged +23% in 30 days', 'Internal quiz score dropped from 78% to 58%'],
  },
  {
    id: 's-std007',
    student_id: 'STD007',
    full_name: 'Sneha Jadhav',
    email: 'sneha.jadhav@prismedu.com',
    mobile: '+91 9822010007',
    date_of_birth: '2004-03-15',
    course: 'B.Tech in Computer Engineering',
    department: 'Computer Engineering',
    academic_year: 2,
    status: 'active',
    attendance_rate: 65,
    attendance_percentage: 65,
    academic_cgpa: 7.0,
    academic_backlogs: 0,
    previous_gpa: 7.6,
    previous_backlogs: 0,
    family_income: 75000,
    financial_assistance: 'partial',
    faculty_mentor_name: 'Dr. Sarah Mitchell',
    insight: {
      academic: 'good',
      attendance: 'declining',
      financial: 'good',
      career: 'good',
    },
    recent_changes: ['Risk increased +21% in 30 days', 'Missed 2 consecutive lab assignment deadlines'],
  },
  {
    id: 's-std008',
    student_id: 'STD008',
    full_name: 'Aditya Kulkarni',
    email: 'aditya.kulkarni@prismedu.com',
    mobile: '+91 9822010008',
    date_of_birth: '2003-05-20',
    course: 'B.Tech in Mechanical Engineering',
    department: 'Mechanical Engineering',
    academic_year: 3,
    status: 'active',
    attendance_rate: 62,
    attendance_percentage: 62,
    academic_cgpa: 6.2,
    academic_backlogs: 1,
    previous_gpa: 6.8,
    previous_backlogs: 0,
    family_income: 60000,
    financial_assistance: 'partial',
    faculty_mentor_name: 'Prof. Rajesh Kulkarni',
    insight: {
      academic: 'attention_required',
      attendance: 'declining',
      financial: 'under_review',
      career: 'good',
    },
    recent_changes: ['Risk increased +19% in 30 days', 'First backlog registered in Dynamics of Machinery'],
  },
  {
    id: 's-std009',
    student_id: 'STD009',
    full_name: 'Priya Deshmukh',
    email: 'priya.deshmukh@prismedu.com',
    mobile: '+91 9822010009',
    date_of_birth: '2004-11-28',
    course: 'B.Tech in Civil Engineering',
    department: 'Civil Engineering',
    academic_year: 2,
    status: 'active',
    attendance_rate: 61,
    attendance_percentage: 61,
    academic_cgpa: 6.4,
    academic_backlogs: 1,
    previous_gpa: 7.0,
    previous_backlogs: 0,
    family_income: 55000,
    financial_assistance: 'partial',
    faculty_mentor_name: 'Dr. Sunita Deshmukh',
    insight: {
      academic: 'attention_required',
      attendance: 'declining',
      financial: 'under_review',
      career: 'declining',
    },
    recent_changes: ['Risk increased +14% in 30 days', 'Surveying field attendance dropped'],
  },
  {
    id: 's-std010',
    student_id: 'STD010',
    full_name: 'Omkar Shinde',
    email: 'omkar.shinde@prismedu.com',
    mobile: '+91 9822010010',
    date_of_birth: '2003-07-07',
    course: 'B.Tech in Electronics Engineering',
    department: 'Electronics Engineering',
    academic_year: 3,
    status: 'active',
    attendance_rate: 60,
    attendance_percentage: 60,
    academic_cgpa: 6.7,
    academic_backlogs: 0,
    previous_gpa: 7.2,
    previous_backlogs: 0,
    family_income: 88000,
    financial_assistance: 'not_required',
    faculty_mentor_name: 'Dr. Amit Verma',
    insight: {
      academic: 'good',
      attendance: 'declining',
      financial: 'good',
      career: 'under_review',
    },
    recent_changes: ['Risk increased +12% in 30 days', 'Microcontroller hardware lab absence flagged'],
  },

  // 3. Cohort Distribution (Mechanical Engineering)
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `s-mech-${i + 1}`,
    student_id: `STD-MECH-${101 + i}`,
    full_name: ['Siddharth Kadam', 'Chetan Mane', 'Ganesh Jadhav', 'Nitin Shinde', 'Mahesh Patil', 'Vikrant Pawar', 'Ajay More', 'Sameer Deshmukh', 'Ashwin Kulkarni', 'Suraj Bhosale', 'Kunal Thorat', 'Vaibhav Chavan', 'Prashant Rao', 'Mayur Gaikwad', 'Sachin Joshi'][i],
    email: `student.mech${i + 1}@prismedu.com`,
    course: 'B.Tech in Mechanical Engineering',
    department: 'Mechanical Engineering',
    academic_year: (i % 4) + 1,
    status: 'active' as const,
    attendance_rate: 60 + (i * 2),
    attendance_percentage: 60 + (i * 2),
    academic_cgpa: Number((5.5 + (i * 0.2)).toFixed(1)),
    academic_backlogs: i < 3 ? 2 : i < 6 ? 1 : 0,
    family_income: 40000 + (i * 15000),
    financial_assistance: i < 4 ? 'required' : 'not_required',
    faculty_mentor_name: 'Prof. Rajesh Kulkarni',
    insight: {
      academic: i < 4 ? 'attention_required' : 'good',
      attendance: i < 3 ? 'declining' : 'good',
      financial: i < 3 ? 'attention_required' : 'good',
      career: 'good',
    },
  })),

  // 4. Cohort Distribution (Civil Engineering)
  ...Array.from({ length: 12 }).map((_, i) => ({
    id: `s-civil-${i + 1}`,
    student_id: `STD-CIVIL-${201 + i}`,
    full_name: ['Rohan Shinde', 'Aniket Patil', 'Akash More', 'Deepak Deshmukh', 'Vikas Chavan', 'Sanket Kadam', 'Pooja Mane', 'Priya Kulkarni', 'Shubham Thorat', 'Komal Jadhav', 'Vinod Pawar', 'Sanjay Gaikwad'][i],
    email: `student.civil${i + 1}@prismedu.com`,
    course: 'B.Tech in Civil Engineering',
    department: 'Civil Engineering',
    academic_year: (i % 4) + 1,
    status: 'active' as const,
    attendance_rate: 62 + (i * 2.5),
    attendance_percentage: 62 + (i * 2.5),
    academic_cgpa: Number((5.8 + (i * 0.22)).toFixed(1)),
    academic_backlogs: i < 2 ? 2 : i < 4 ? 1 : 0,
    family_income: 45000 + (i * 18000),
    financial_assistance: i < 3 ? 'required' : 'not_required',
    faculty_mentor_name: 'Dr. Sunita Deshmukh',
    insight: {
      academic: i < 3 ? 'attention_required' : 'good',
      attendance: i < 3 ? 'declining' : 'good',
      financial: i < 3 ? 'attention_required' : 'good',
      career: 'good',
    },
  })),

  // 5. Cohort Distribution (Computer Engineering)
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `s-comp-${i + 1}`,
    student_id: `STD-COMP-${301 + i}`,
    full_name: ['Aarav Sharma', 'Ananya Singh', 'Tanvi Mehta', 'Rohan Gupta', 'Isha Kulkarni', 'Varun Shah', 'Ritika Joshi', 'Aryan Verma', 'Diya Patel', 'Kavya Rao', 'Neeraj Shinde', 'Simran Kaur', 'Aditya Nair', 'Meghna Deshmukh', 'Yash Patil'][i],
    email: `student.comp${i + 1}@prismedu.com`,
    course: 'B.Tech in Computer Engineering',
    department: 'Computer Engineering',
    academic_year: (i % 4) + 1,
    status: 'active' as const,
    attendance_rate: 75 + (i * 1.5),
    attendance_percentage: 75 + (i * 1.5),
    academic_cgpa: Number((7.0 + (i * 0.15)).toFixed(1)),
    academic_backlogs: i < 1 ? 1 : 0,
    family_income: 80000 + (i * 30000),
    financial_assistance: 'not_required',
    faculty_mentor_name: 'Dr. Sarah Mitchell',
    insight: {
      academic: 'good',
      attendance: 'good',
      financial: 'good',
      career: 'good',
    },
  })),

  // 6. Cohort Distribution (Information Technology)
  ...Array.from({ length: 12 }).map((_, i) => ({
    id: `s-it-${i + 1}`,
    student_id: `STD-IT-${401 + i}`,
    full_name: ['Pranav Joshi', 'Mihir Shinde', 'Gauri Kulkarni', 'Tejas Patil', 'Sonali More', 'Harsh Pawar', 'Pooja Kadam', 'Naveen Rao', 'Ashwini Mane', 'Kishore Deshmukh', 'Shruti Chavan', 'Amol Jadhav'][i],
    email: `student.it${i + 1}@prismedu.com`,
    course: 'B.Tech in Information Technology',
    department: 'Information Technology',
    academic_year: (i % 4) + 1,
    status: 'active' as const,
    attendance_rate: 72 + (i * 2),
    attendance_percentage: 72 + (i * 2),
    academic_cgpa: Number((6.8 + (i * 0.18)).toFixed(1)),
    academic_backlogs: i < 2 ? 1 : 0,
    family_income: 70000 + (i * 25000),
    financial_assistance: 'not_required',
    faculty_mentor_name: 'Prof. David Reynolds',
    insight: {
      academic: 'good',
      attendance: 'good',
      financial: 'good',
      career: 'good',
    },
  })),

  // 7. Cohort Distribution (Electronics Engineering & Electrical)
  ...Array.from({ length: 10 }).map((_, i) => ({
    id: `s-ece-${i + 1}`,
    student_id: `STD-ECE-${501 + i}`,
    full_name: ['Nikhil Shinde', 'Akanksha Patil', 'Sandip More', 'Rupesh Kulkarni', 'Preeti Pawar', 'Tushar Chavan', 'Manasi Jadhav', 'Bhushan Kadam', 'Pallavi Mane', 'Dhananjay Deshmukh'][i],
    email: `student.ece${i + 1}@prismedu.com`,
    course: i % 2 === 0 ? 'B.Tech in Electronics Engineering' : 'B.Tech in Electrical Engineering',
    department: i % 2 === 0 ? 'Electronics Engineering' : 'Electrical Engineering',
    academic_year: (i % 4) + 1,
    status: 'active' as const,
    attendance_rate: 76 + (i * 2),
    attendance_percentage: 76 + (i * 2),
    academic_cgpa: Number((7.1 + (i * 0.16)).toFixed(1)),
    academic_backlogs: 0,
    family_income: 85000 + (i * 20000),
    financial_assistance: 'not_required',
    faculty_mentor_name: 'Dr. Amit Verma',
    insight: {
      academic: 'good',
      attendance: 'good',
      financial: 'good',
      career: 'good',
    },
  })),
];

declare global {
  // eslint-disable-next-line no-var
  var __PRISM_DEMO_STUDENTS: DemoStudent[] | undefined;
}

if (!globalThis.__PRISM_DEMO_STUDENTS || globalThis.__PRISM_DEMO_STUDENTS.length === 0) {
  globalThis.__PRISM_DEMO_STUDENTS = [...INITIAL_DEMO_STUDENTS];
}

export function getDemoStudents(): DemoStudent[] {
  if (!globalThis.__PRISM_DEMO_STUDENTS || globalThis.__PRISM_DEMO_STUDENTS.length === 0) {
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

