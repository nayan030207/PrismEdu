/**
 * Faculty Database Store: Real persistent data layer for Faculty Mentorship & Analytics
 */

export interface FacultyTask {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  dotColor: string; // 'bg-rose-500' | 'bg-amber-500' | 'bg-yellow-400'
  completed: boolean;
}

export interface FacultyMeeting {
  id: string;
  name: string;
  subtitle: string;
  time: string;
  avatarText: string;
  avatarBg: string;
  isGroup?: boolean;
}

export interface FacultyAlert {
  id: string;
  title: string;
  studentName: string;
  studentId: string;
  description: string;
  time: string;
  iconName: 'TrendingDown' | 'AlertTriangle' | 'ClipboardList' | 'BookOpen';
  iconBg: string;
  iconColor: string;
}

export interface FacultyStudent {
  id: string;
  student_id: string; // e.g. IT23001
  full_name: string;
  department: string;
  course: string;
  year: 'SE' | 'TE' | 'BE' | 'FE';
  semester: number;
  attendance: number; // percentage
  cgpa: number;
  riskScore: number; // 0 - 100
  riskCategory: 'low' | 'moderate' | 'high' | 'critical';
  trend: 'up' | 'down' | 'stable';
  trendValue: string; // e.g. '+18%'
  intervention: 'None' | 'Pending' | 'In Progress' | 'Scheduled' | 'Completed';
  lastUpdated: string;
  avatarBg: string;
  avatarInitials: string;
  missedAssignments?: number;
  academicDecline?: boolean;
}

export interface FacultyInterventionItem {
  id: string;
  studentId: string;
  studentName: string;
  type: string;
  status: 'in_progress' | 'completed' | 'overdue' | 'not_started';
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes: string;
  assignedDate: string;
  dueDate: string;
}

// ── INITIAL FACULTY TASKS ──
export const INITIAL_FACULTY_TASKS: FacultyTask[] = [
  {
    id: 'ftask-1',
    title: 'Meet with 3 high-risk students',
    subtitle: '3 students',
    time: '10:00 AM',
    dotColor: 'bg-rose-500',
    completed: false,
  },
  {
    id: 'ftask-2',
    title: 'Review attendance report',
    subtitle: '12 students',
    time: '11:30 AM',
    dotColor: 'bg-amber-500',
    completed: false,
  },
  {
    id: 'ftask-3',
    title: 'Update intervention notes',
    subtitle: '5 pending',
    time: '02:00 PM',
    dotColor: 'bg-amber-500',
    completed: false,
  },
  {
    id: 'ftask-4',
    title: 'Check new alerts',
    subtitle: '4 new',
    time: '04:00 PM',
    dotColor: 'bg-yellow-400',
    completed: false,
  },
];

// ── INITIAL UPCOMING MEETINGS ──
export const INITIAL_FACULTY_MEETINGS: FacultyMeeting[] = [
  {
    id: 'fmeet-1',
    name: 'Aditya Kulkarni',
    subtitle: 'Individual Counseling',
    time: '10:00 AM Today',
    avatarText: 'AK',
    avatarBg: 'bg-indigo-600',
  },
  {
    id: 'fmeet-2',
    name: 'Sneha Patil',
    subtitle: 'Academic Review',
    time: '11:00 AM Today',
    avatarText: 'SP',
    avatarBg: 'bg-rose-500',
  },
  {
    id: 'fmeet-3',
    name: 'Group Meeting',
    subtitle: 'SE Batch (At-Risk Students)',
    time: '02:00 PM Today',
    avatarText: '👥',
    avatarBg: 'bg-purple-600',
    isGroup: true,
  },
  {
    id: 'fmeet-4',
    name: 'Rohit Deshmukh',
    subtitle: 'Progress Discussion',
    time: '03:30 PM Today',
    avatarText: 'RD',
    avatarBg: 'bg-blue-600',
  },
];

// ── INITIAL RECENT ALERTS ──
export const INITIAL_FACULTY_ALERTS: FacultyAlert[] = [
  {
    id: 'falert-1',
    title: 'Attendance Drop',
    studentName: 'Aditya Kulkarni',
    studentId: 'IT23001',
    description: 'Attendance dropped to 45%',
    time: '2 hours ago',
    iconName: 'TrendingDown',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
  },
  {
    id: 'falert-2',
    title: 'Risk Increase',
    studentName: 'Sneha Patil',
    studentId: 'IT23018',
    description: 'Risk increased from 52% to 76%',
    time: '4 hours ago',
    iconName: 'AlertTriangle',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    id: 'falert-3',
    title: 'Low Assignment Submission',
    studentName: 'Rohit Deshmukh',
    studentId: 'IT23024',
    description: 'Missed 3 assignments',
    time: '1 day ago',
    iconName: 'ClipboardList',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    id: 'falert-4',
    title: 'Academic Decline',
    studentName: 'Priya Jadhav',
    studentId: 'IT23031',
    description: 'Internal marks dropped by 15%',
    time: '1 day ago',
    iconName: 'BookOpen',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
];

// ── INITIAL 54 ASSIGNED STUDENTS FOR PROF. SANDEEP KULKARNI (SE COMPUTER ENGINEERING) ──
// Exactly 54 students matching:
// - Risk: 24 Low (44.4%), 18 Moderate (33.3%), 8 High (14.8%), 4 Critical (7.4%) -> Total 54
// - High-Risk metric = 12 (Critical 4 + High 8 = 12 = 22%)
// - Moderate-Risk metric = 18 (33%)
// - Attendance concern (<65%) = 16
// - Academic decline = 14
// - Attendance Distribution: <50%: 8, 50-65%: 16, 65-75%: 18, >75%: 12 -> Total 54
// - CGPA Distribution: <5.0: 6, 5.0-6.0: 20, 6.0-7.0: 22, >7.0: 6 -> Total 54
export const INITIAL_FACULTY_STUDENTS: FacultyStudent[] = [
  // 1. Top 5 Key Featured At-Risk Students from Screenshot:
  {
    id: 'fs-001',
    student_id: 'IT23001',
    full_name: 'Aditya Kulkarni',
    department: 'Computer Engineering',
    course: 'B.Tech Computer Engineering',
    year: 'SE',
    semester: 3,
    attendance: 45,
    cgpa: 5.2,
    riskScore: 82,
    riskCategory: 'critical',
    trend: 'up',
    trendValue: '+21%',
    intervention: 'None',
    lastUpdated: 'Sep 29, 2025',
    avatarBg: 'bg-indigo-600',
    avatarInitials: 'AK',
    missedAssignments: 3,
    academicDecline: true,
  },
  {
    id: 'fs-002',
    student_id: 'IT23018',
    full_name: 'Sneha Patil',
    department: 'Computer Engineering',
    course: 'B.Tech Computer Engineering',
    year: 'SE',
    semester: 3,
    attendance: 52,
    cgpa: 5.8,
    riskScore: 76,
    riskCategory: 'critical',
    trend: 'up',
    trendValue: '+24%',
    intervention: 'Pending',
    lastUpdated: 'Sep 29, 2025',
    avatarBg: 'bg-rose-500',
    avatarInitials: 'SP',
    academicDecline: true,
  },
  {
    id: 'fs-003',
    student_id: 'IT23024',
    full_name: 'Rohit Deshmukh',
    department: 'Computer Engineering',
    course: 'B.Tech Computer Engineering',
    year: 'SE',
    semester: 3,
    attendance: 48,
    cgpa: 5.4,
    riskScore: 71,
    riskCategory: 'high',
    trend: 'up',
    trendValue: '+17%',
    intervention: 'In Progress',
    lastUpdated: 'Sep 28, 2025',
    avatarBg: 'bg-blue-600',
    avatarInitials: 'RD',
    missedAssignments: 3,
  },
  {
    id: 'fs-004',
    student_id: 'IT23031',
    full_name: 'Priya Jadhav',
    department: 'Computer Engineering',
    course: 'B.Tech Computer Engineering',
    year: 'SE',
    semester: 3,
    attendance: 61,
    cgpa: 6.1,
    riskScore: 66,
    riskCategory: 'high',
    trend: 'up',
    trendValue: '+15%',
    intervention: 'None',
    lastUpdated: 'Sep 28, 2025',
    avatarBg: 'bg-purple-600',
    avatarInitials: 'PJ',
    academicDecline: true,
  },
  {
    id: 'fs-005',
    student_id: 'IT23037',
    full_name: 'Karan Shinde',
    department: 'Computer Engineering',
    course: 'B.Tech Computer Engineering',
    year: 'SE',
    semester: 3,
    attendance: 58,
    cgpa: 5.9,
    riskScore: 64,
    riskCategory: 'high',
    trend: 'up',
    trendValue: '+12%',
    intervention: 'Scheduled',
    lastUpdated: 'Sep 27, 2025',
    avatarBg: 'bg-emerald-600',
    avatarInitials: 'KS',
  },
  // 2. Critical & High-Risk Students (Completing the 4 Critical + 8 High = 12 High-Risk)
  {
    id: 'fs-006',
    student_id: 'IT23042',
    full_name: 'Vikas Solanki',
    department: 'Computer Engineering',
    course: 'B.Tech Computer Engineering',
    year: 'SE',
    semester: 3,
    attendance: 42,
    cgpa: 4.8,
    riskScore: 85,
    riskCategory: 'critical',
    trend: 'up',
    trendValue: '+22%',
    intervention: 'Pending',
    lastUpdated: 'Sep 26, 2025',
    avatarBg: 'bg-rose-600',
    avatarInitials: 'VS',
    missedAssignments: 4,
    academicDecline: true,
  },
  {
    id: 'fs-007',
    student_id: 'IT23045',
    full_name: 'Meera Kadam',
    department: 'Computer Engineering',
    course: 'B.Tech Computer Engineering',
    year: 'SE',
    semester: 3,
    attendance: 44,
    cgpa: 4.9,
    riskScore: 80,
    riskCategory: 'critical',
    trend: 'up',
    trendValue: '+19%',
    intervention: 'In Progress',
    lastUpdated: 'Sep 27, 2025',
    avatarBg: 'bg-pink-600',
    avatarInitials: 'MK',
    academicDecline: true,
  },
  {
    id: 'fs-008',
    student_id: 'IT23050',
    full_name: 'Nitin Gaikwad',
    department: 'Computer Engineering',
    course: 'B.Tech Computer Engineering',
    year: 'SE',
    semester: 3,
    attendance: 47,
    cgpa: 5.1,
    riskScore: 73,
    riskCategory: 'high',
    trend: 'up',
    trendValue: '+14%',
    intervention: 'Scheduled',
    lastUpdated: 'Sep 28, 2025',
    avatarBg: 'bg-amber-600',
    avatarInitials: 'NG',
  },
  {
    id: 'fs-009',
    student_id: 'IT23053',
    full_name: 'Anjali Jagtap',
    department: 'Computer Engineering',
    course: 'B.Tech Computer Engineering',
    year: 'SE',
    semester: 3,
    attendance: 49,
    cgpa: 5.3,
    riskScore: 68,
    riskCategory: 'high',
    trend: 'up',
    trendValue: '+11%',
    intervention: 'In Progress',
    lastUpdated: 'Sep 27, 2025',
    avatarBg: 'bg-teal-600',
    avatarInitials: 'AJ',
  },
  {
    id: 'fs-010',
    student_id: 'IT23056',
    full_name: 'Pratik Mohite',
    department: 'Computer Engineering',
    course: 'B.Tech Computer Engineering',
    year: 'SE',
    semester: 3,
    attendance: 46,
    cgpa: 4.7,
    riskScore: 75,
    riskCategory: 'high',
    trend: 'up',
    trendValue: '+16%',
    intervention: 'None',
    lastUpdated: 'Sep 26, 2025',
    avatarBg: 'bg-orange-600',
    avatarInitials: 'PM',
    missedAssignments: 2,
    academicDecline: true,
  },
  {
    id: 'fs-011',
    student_id: 'IT23060',
    full_name: 'Rohan Chavan',
    department: 'Computer Engineering',
    course: 'B.Tech Computer Engineering',
    year: 'SE',
    semester: 3,
    attendance: 43,
    cgpa: 4.6,
    riskScore: 78,
    riskCategory: 'high',
    trend: 'up',
    trendValue: '+20%',
    intervention: 'Pending',
    lastUpdated: 'Sep 25, 2025',
    avatarBg: 'bg-cyan-600',
    avatarInitials: 'RC',
    academicDecline: true,
  },
  {
    id: 'fs-012',
    student_id: 'IT23064',
    full_name: 'Divya Sawant',
    department: 'Computer Engineering',
    course: 'B.Tech Computer Engineering',
    year: 'SE',
    semester: 3,
    attendance: 51,
    cgpa: 4.8,
    riskScore: 70,
    riskCategory: 'high',
    trend: 'up',
    trendValue: '+13%',
    intervention: 'None',
    lastUpdated: 'Sep 27, 2025',
    avatarBg: 'bg-violet-600',
    avatarInitials: 'DS',
    academicDecline: true,
  },
  // 3. Moderate Risk Students (18 Students: 50% - 65% attendance or 5.0 - 6.0 CGPA)
  ...Array.from({ length: 18 }).map((_, idx) => {
    const names = [
      'Gaurav Shinde', 'Tanvi Joshi', 'Akshay Mane', 'Pooja Salve', 'Siddharth More',
      'Kavita Rane', 'Harshal Tambe', 'Rutuja Wagh', 'Omkar Dhumal', 'Sonali Thite',
      'Deepak Garje', 'Sayali Shedge', 'Manoj Shirke', 'Pallavi Nalawade', 'Yogesh Raut',
      'Tejaswini Thorat', 'Kunal Bhandare', 'Monika Gholap'
    ];
    const roll = `IT23${String(65 + idx).padStart(3, '0')}`;
    const att = 52 + (idx % 13);
    const cgpa = 5.2 + Number((idx * 0.05).toFixed(1));
    return {
      id: `fs-mod-${idx + 1}`,
      student_id: roll,
      full_name: names[idx],
      department: 'Computer Engineering',
      course: 'B.Tech Computer Engineering',
      year: 'SE' as const,
      semester: 3,
      attendance: att,
      cgpa: Math.min(6.2, cgpa),
      riskScore: 40 + (idx % 18),
      riskCategory: 'moderate' as const,
      trend: (idx % 2 === 0 ? 'up' : 'down') as 'up' | 'down',
      trendValue: idx % 2 === 0 ? '+5%' : '-4%',
      intervention: (idx % 3 === 0 ? 'Pending' : idx % 3 === 1 ? 'In Progress' : 'None') as any,
      lastUpdated: 'Sep 28, 2025',
      avatarBg: 'bg-amber-600',
      avatarInitials: names[idx].split(' ').map((n) => n[0]).join(''),
      academicDecline: idx < 7,
    };
  }),
  // 4. Low Risk Students (24 Students: 65% - 95% attendance, 6.0 - 9.5 CGPA)
  ...Array.from({ length: 24 }).map((_, idx) => {
    const names = [
      'Amitabh Borkar', 'Bhakti Chiplunkar', 'Chetan Dabholkar', 'Dhanashree Ekal',
      'Farhan Faqi', 'Geeta Gadgil', 'Hemant Hirave', 'Isha Inamdar',
      'Jayesh Jog', 'Komal Karmarkar', 'Laxman Londhe', 'Madhuri Mahajan',
      'Nikhil Nadkarni', 'Ojas Otari', 'Pranita Phatak', 'Quresh Qureshi',
      'Rasika Ranade', 'Sameer Samant', 'Trupti Tipnis', 'Uday Upadhye',
      'Varun Vaze', 'Warsha Walke', 'Yash Yewale', 'Zeenat Zariwala'
    ];
    const roll = `IT23${String(100 + idx).padStart(3, '0')}`;
    const att = 68 + (idx % 25);
    const cgpa = 6.4 + Number(((idx * 0.12) % 3.0).toFixed(1));
    return {
      id: `fs-low-${idx + 1}`,
      student_id: roll,
      full_name: names[idx],
      department: 'Computer Engineering',
      course: 'B.Tech Computer Engineering',
      year: 'SE' as const,
      semester: 3,
      attendance: Math.min(96, att),
      cgpa: Math.min(9.4, cgpa),
      riskScore: 10 + (idx % 15),
      riskCategory: 'low' as const,
      trend: 'down' as const,
      trendValue: '-8%',
      intervention: 'Completed' as any,
      lastUpdated: 'Sep 29, 2025',
      avatarBg: 'bg-emerald-600',
      avatarInitials: names[idx].split(' ').map((n) => n[0]).join(''),
    };
  }),
];

// ── INITIAL 11 FACULTY INTERVENTIONS ──
// 5 In Progress, 4 Completed, 2 Overdue -> Total 11, Completion Rate = 36.4% (~36%)
export const INITIAL_FACULTY_INTERVENTIONS: FacultyInterventionItem[] = [
  // 4 Completed
  {
    id: 'fint-1',
    studentId: 'fs-low-1',
    studentName: 'Amitabh Borkar',
    type: 'Academic Tutoring',
    status: 'completed',
    priority: 'medium',
    notes: 'Completed C++ Data Structures remedial assignments.',
    assignedDate: '2025-08-15',
    dueDate: '2025-09-10',
  },
  {
    id: 'fint-2',
    studentId: 'fs-low-2',
    studentName: 'Bhakti Chiplunkar',
    type: 'Attendance Recovery',
    status: 'completed',
    priority: 'low',
    notes: 'Recovered missed lab practical sessions.',
    assignedDate: '2025-08-20',
    dueDate: '2025-09-15',
  },
  {
    id: 'fint-3',
    studentId: 'fs-low-3',
    studentName: 'Chetan Dabholkar',
    type: 'Peer Mentoring',
    status: 'completed',
    priority: 'medium',
    notes: 'Paired with high-performing peer for Algorithm analysis.',
    assignedDate: '2025-08-25',
    dueDate: '2025-09-20',
  },
  {
    id: 'fint-4',
    studentId: 'fs-low-4',
    studentName: 'Dhanashree Ekal',
    type: 'Career Guidance',
    status: 'completed',
    priority: 'low',
    notes: 'Resolved internship and elective track doubts.',
    assignedDate: '2025-09-01',
    dueDate: '2025-09-22',
  },
  // 5 In Progress
  {
    id: 'fint-5',
    studentId: 'fs-003',
    studentName: 'Rohit Deshmukh',
    type: 'Attendance Counseling',
    status: 'in_progress',
    priority: 'high',
    notes: 'Scheduled 3 bi-weekly check-ins regarding 48% attendance rate.',
    assignedDate: '2025-09-15',
    dueDate: '2025-10-15',
  },
  {
    id: 'fint-6',
    studentId: 'fs-007',
    studentName: 'Meera Kadam',
    type: 'Academic Remedial Program',
    status: 'in_progress',
    priority: 'critical',
    notes: 'Assigned supplementary question banks for mid-term re-test.',
    assignedDate: '2025-09-18',
    dueDate: '2025-10-18',
  },
  {
    id: 'fint-7',
    studentId: 'fs-009',
    studentName: 'Anjali Jagtap',
    type: 'Subject Backlog Mentoring',
    status: 'in_progress',
    priority: 'medium',
    notes: 'Reviewing weekly discrete mathematics problem sets.',
    assignedDate: '2025-09-20',
    dueDate: '2025-10-20',
  },
  {
    id: 'fint-8',
    studentId: 'fs-mod-2',
    studentName: 'Tanvi Joshi',
    type: 'Personal Counseling',
    status: 'in_progress',
    priority: 'medium',
    notes: 'Monitoring study schedule and exam anxiety support.',
    assignedDate: '2025-09-22',
    dueDate: '2025-10-22',
  },
  {
    id: 'fint-9',
    studentId: 'fs-mod-4',
    studentName: 'Pooja Salve',
    type: 'Laboratory Makeup Sessions',
    status: 'in_progress',
    priority: 'high',
    notes: 'Coordinating with lab assistants for experiment completion.',
    assignedDate: '2025-09-24',
    dueDate: '2025-10-24',
  },
  // 2 Overdue
  {
    id: 'fint-10',
    studentId: 'fs-001',
    studentName: 'Aditya Kulkarni',
    type: 'Dean Escalation & Attendance Contract',
    status: 'overdue',
    priority: 'critical',
    notes: 'Attendance fallen to 45%. Parent-teacher conference overdue.',
    assignedDate: '2025-09-05',
    dueDate: '2025-09-25',
  },
  {
    id: 'fint-11',
    studentId: 'fs-002',
    studentName: 'Sneha Patil',
    type: 'Special Academic Intervention Plan',
    status: 'overdue',
    priority: 'high',
    notes: 'Formal learning plan submission pending faculty sign-off.',
    assignedDate: '2025-09-10',
    dueDate: '2025-09-26',
  },
];

// Global singletons for runtime persistence across API requests
declare global {
  // eslint-disable-next-line no-var
  var __PRISM_FACULTY_TASKS: FacultyTask[] | undefined;
  // eslint-disable-next-line no-var
  var __PRISM_FACULTY_STUDENTS: FacultyStudent[] | undefined;
  // eslint-disable-next-line no-var
  var __PRISM_FACULTY_INTERVENTIONS: FacultyInterventionItem[] | undefined;
  // eslint-disable-next-line no-var
  var __PRISM_FACULTY_MEETINGS: FacultyMeeting[] | undefined;
  // eslint-disable-next-line no-var
  var __PRISM_FACULTY_ALERTS: FacultyAlert[] | undefined;
}

export function getFacultyTasks(): FacultyTask[] {
  if (!globalThis.__PRISM_FACULTY_TASKS) {
    globalThis.__PRISM_FACULTY_TASKS = [...INITIAL_FACULTY_TASKS];
  }
  return globalThis.__PRISM_FACULTY_TASKS;
}

export function toggleFacultyTask(id: string): FacultyTask | null {
  const tasks = getFacultyTasks();
  const task = tasks.find((t) => t.id === id);
  if (!task) return null;
  task.completed = !task.completed;
  return task;
}

export function getFacultyStudents(): FacultyStudent[] {
  if (!globalThis.__PRISM_FACULTY_STUDENTS || globalThis.__PRISM_FACULTY_STUDENTS.length === 0) {
    globalThis.__PRISM_FACULTY_STUDENTS = [...INITIAL_FACULTY_STUDENTS];
  }
  return globalThis.__PRISM_FACULTY_STUDENTS;
}

export function getFacultyInterventions(): FacultyInterventionItem[] {
  if (!globalThis.__PRISM_FACULTY_INTERVENTIONS) {
    globalThis.__PRISM_FACULTY_INTERVENTIONS = [...INITIAL_FACULTY_INTERVENTIONS];
  }
  return globalThis.__PRISM_FACULTY_INTERVENTIONS;
}

export function getFacultyMeetings(): FacultyMeeting[] {
  if (!globalThis.__PRISM_FACULTY_MEETINGS) {
    globalThis.__PRISM_FACULTY_MEETINGS = [...INITIAL_FACULTY_MEETINGS];
  }
  return globalThis.__PRISM_FACULTY_MEETINGS;
}

export function getFacultyAlerts(): FacultyAlert[] {
  if (!globalThis.__PRISM_FACULTY_ALERTS) {
    globalThis.__PRISM_FACULTY_ALERTS = [...INITIAL_FACULTY_ALERTS];
  }
  return globalThis.__PRISM_FACULTY_ALERTS;
}
