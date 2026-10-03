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

// ── INITIAL DATA (CLEAN FOR IMPORT) ──
export const INITIAL_FACULTY_TASKS: FacultyTask[] = [];
export const INITIAL_FACULTY_MEETINGS: FacultyMeeting[] = [];
export const INITIAL_FACULTY_ALERTS: FacultyAlert[] = [];
export const INITIAL_FACULTY_STUDENTS: FacultyStudent[] = [];
export const INITIAL_FACULTY_INTERVENTIONS: FacultyInterventionItem[] = [];

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
  if (!globalThis.__PRISM_FACULTY_STUDENTS) {
    globalThis.__PRISM_FACULTY_STUDENTS = [];
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
