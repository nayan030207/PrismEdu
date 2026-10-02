/**
 * In-memory interventions store for demo mode & dynamic calculation engine.
 * In production, this maps to the `interventions` Supabase table.
 */

export interface DemoIntervention {
  id: string;
  studentId: string;
  studentName: string;
  facultyId?: string;
  facultyName?: string;
  type: 'academic' | 'attendance_engagement' | 'financial' | 'personal_support' | 'career';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'escalated' | 'cancelled';
  riskBefore?: number;
  riskAfter?: number;
  outcome?: 'improved' | 'no_change' | 'increased_risk' | 'unable_to_assess' | string;
  notes?: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

const INITIAL_INTERVENTIONS: DemoIntervention[] = [
  // 7 OVERDUE CASES
  {
    id: 'int-overdue-001',
    studentId: 's-std003',
    studentName: 'Karan Desai',
    facultyId: 'f1111111-1111-1111-1111-111111111114',
    facultyName: 'Dr. Sunita Deshmukh',
    type: 'attendance_engagement',
    description: 'Mandatory counseling for prolonged absenteeism below 50% threshold.',
    priority: 'critical',
    status: 'overdue',
    riskBefore: 76,
    riskAfter: 76,
    followUpDate: '2025-09-22',
    createdAt: '2025-09-10T10:00:00Z',
    updatedAt: '2025-09-23T11:00:00Z',
  },
  {
    id: 'int-overdue-002',
    studentId: 's-std008',
    studentName: 'Aditya Kulkarni',
    facultyId: 'f1111111-1111-1111-1111-111111111113',
    facultyName: 'Prof. Rajesh Kulkarni',
    type: 'academic',
    description: 'Thermodynamics mid-term backlog review and laboratory make-up plan.',
    priority: 'high',
    status: 'overdue',
    riskBefore: 62,
    riskAfter: 62,
    followUpDate: '2025-09-23',
    createdAt: '2025-09-12T14:30:00Z',
    updatedAt: '2025-09-24T09:00:00Z',
  },
  {
    id: 'int-overdue-003',
    studentId: 's-std011',
    studentName: 'Anil Patil',
    facultyId: 'f1111111-1111-1111-1111-111111111113',
    facultyName: 'Prof. Rajesh Kulkarni',
    type: 'attendance_engagement',
    description: 'Unexcused workshop absence follow-up with parent guardian.',
    priority: 'high',
    status: 'overdue',
    riskBefore: 74,
    riskAfter: 74,
    followUpDate: '2025-09-24',
    createdAt: '2025-09-14T09:15:00Z',
    updatedAt: '2025-09-25T10:00:00Z',
  },
  {
    id: 'int-overdue-004',
    studentId: 's-std015',
    studentName: 'Manish Shinde',
    facultyId: 'f1111111-1111-1111-1111-111111111114',
    facultyName: 'Dr. Sunita Deshmukh',
    type: 'financial',
    description: 'Emergency installment waiver request verification pending HOD signoff.',
    priority: 'high',
    status: 'overdue',
    riskBefore: 68,
    riskAfter: 68,
    followUpDate: '2025-09-24',
    createdAt: '2025-09-15T11:00:00Z',
    updatedAt: '2025-09-25T12:00:00Z',
  },
  {
    id: 'int-overdue-005',
    studentId: 's-std020',
    studentName: 'Sanjay Chavan',
    facultyId: 'f1111111-1111-1111-1111-111111111113',
    facultyName: 'Prof. Rajesh Kulkarni',
    type: 'academic',
    description: 'Fluid mechanics remedial assignments check-in past target submission.',
    priority: 'medium',
    status: 'overdue',
    riskBefore: 65,
    riskAfter: 65,
    followUpDate: '2025-09-25',
    createdAt: '2025-09-16T15:00:00Z',
    updatedAt: '2025-09-26T08:00:00Z',
  },
  {
    id: 'int-overdue-006',
    studentId: 's-std023',
    studentName: 'Gaurav Thorat',
    facultyId: 'f1111111-1111-1111-1111-111111111114',
    facultyName: 'Dr. Sunita Deshmukh',
    type: 'personal_support',
    description: 'Hostel commute fatigue and medical absence review appointment.',
    priority: 'medium',
    status: 'overdue',
    riskBefore: 60,
    riskAfter: 60,
    followUpDate: '2025-09-25',
    createdAt: '2025-09-15T16:00:00Z',
    updatedAt: '2025-09-26T11:00:00Z',
  },
  {
    id: 'int-overdue-007',
    studentId: 's-std027',
    studentName: 'Nitin Gaikwad',
    facultyId: 'f1111111-1111-1111-1111-111111111113',
    facultyName: 'Prof. Rajesh Kulkarni',
    type: 'attendance_engagement',
    description: 'Second-phase attendance warning escalation to Academic Dean.',
    priority: 'critical',
    status: 'overdue',
    riskBefore: 79,
    riskAfter: 79,
    followUpDate: '2025-09-26',
    createdAt: '2025-09-17T11:00:00Z',
    updatedAt: '2025-09-27T09:00:00Z',
  },

  // 11 IN PROGRESS CASES
  {
    id: 'int-prog-001',
    studentId: 's-std004',
    studentName: 'Neha Bhosale',
    facultyId: 'f1111111-1111-1111-1111-111111111111',
    facultyName: 'Dr. Sarah Mitchell',
    type: 'attendance_engagement',
    description: 'Bi-weekly attendance tracking & mentoring on Algorithms coursework.',
    priority: 'high',
    status: 'in_progress',
    riskBefore: 72,
    followUpDate: '2025-10-05',
    createdAt: '2025-09-20T10:00:00Z',
    updatedAt: '2025-09-27T10:00:00Z',
  },
  {
    id: 'int-prog-002',
    studentId: 's-std002',
    studentName: 'Aarti Salunkhe',
    facultyId: 'f2222222-2222-2222-2222-222222222222',
    facultyName: 'Prof. David Reynolds',
    type: 'academic',
    description: '1-on-1 tutoring on Database normalization & SQL query optimization.',
    priority: 'critical',
    status: 'in_progress',
    riskBefore: 78,
    followUpDate: '2025-10-06',
    createdAt: '2025-09-22T09:00:00Z',
    updatedAt: '2025-09-28T14:00:00Z',
  },
  {
    id: 'int-prog-003',
    studentId: 's-std006',
    studentName: 'Rahul Patil',
    facultyId: 'f2222222-2222-2222-2222-222222222222',
    facultyName: 'Prof. David Reynolds',
    type: 'academic',
    description: 'Emerging risk monitoring: remedial tests and digital lecture check-ins.',
    priority: 'high',
    status: 'in_progress',
    riskBefore: 68,
    followUpDate: '2025-10-08',
    createdAt: '2025-09-24T11:00:00Z',
    updatedAt: '2025-09-28T09:00:00Z',
  },
  {
    id: 'int-prog-004',
    studentId: 's-std007',
    studentName: 'Sneha Jadhav',
    facultyId: 'f1111111-1111-1111-1111-111111111111',
    facultyName: 'Dr. Sarah Mitchell',
    type: 'academic',
    description: 'Programming lab remedial sessions and peer study partner assignment.',
    priority: 'high',
    status: 'in_progress',
    riskBefore: 65,
    followUpDate: '2025-10-07',
    createdAt: '2025-09-23T15:00:00Z',
    updatedAt: '2025-09-27T16:00:00Z',
  },
  {
    id: 'int-prog-005',
    studentId: 's-std009',
    studentName: 'Priya Deshmukh',
    facultyId: 'f1111111-1111-1111-1111-111111111114',
    facultyName: 'Dr. Sunita Deshmukh',
    type: 'career',
    description: 'Civil engineering certification path counseling and industry mentorship.',
    priority: 'medium',
    status: 'in_progress',
    riskBefore: 61,
    followUpDate: '2025-10-09',
    createdAt: '2025-09-25T14:00:00Z',
    updatedAt: '2025-09-28T11:00:00Z',
  },
  {
    id: 'int-prog-006',
    studentId: 's-std010',
    studentName: 'Omkar Shinde',
    facultyId: 'f1111111-1111-1111-1111-111111111115',
    facultyName: 'Dr. Amit Verma',
    type: 'academic',
    description: 'Embedded lab practical backlog catch-up sessions.',
    priority: 'medium',
    status: 'in_progress',
    riskBefore: 60,
    followUpDate: '2025-10-10',
    createdAt: '2025-09-26T10:00:00Z',
    updatedAt: '2025-09-28T12:00:00Z',
  },
  {
    id: 'int-prog-007',
    studentId: 's-std012',
    studentName: 'Kavita Nair',
    facultyId: 'f1111111-1111-1111-1111-111111111111',
    facultyName: 'Dr. Sarah Mitchell',
    type: 'financial',
    description: 'AICTE Pragati scholarship documentation assistance and fee deferral.',
    priority: 'high',
    status: 'in_progress',
    riskBefore: 64,
    followUpDate: '2025-10-06',
    createdAt: '2025-09-21T09:00:00Z',
    updatedAt: '2025-09-27T10:00:00Z',
  },
  {
    id: 'int-prog-008',
    studentId: 's-std016',
    studentName: 'Pooja Kadam',
    facultyId: 'f2222222-2222-2222-2222-222222222222',
    facultyName: 'Prof. David Reynolds',
    type: 'personal_support',
    description: 'Stress management sessions with Student Welfare Center counsellor.',
    priority: 'medium',
    status: 'in_progress',
    riskBefore: 58,
    followUpDate: '2025-10-12',
    createdAt: '2025-09-24T16:00:00Z',
    updatedAt: '2025-09-28T09:00:00Z',
  },
  {
    id: 'int-prog-009',
    studentId: 's-std019',
    studentName: 'Ravi Jadhav',
    facultyId: 'f1111111-1111-1111-1111-111111111113',
    facultyName: 'Prof. Rajesh Kulkarni',
    type: 'attendance_engagement',
    description: 'Workshop attendance monitoring with biometric alerts.',
    priority: 'high',
    status: 'in_progress',
    riskBefore: 69,
    followUpDate: '2025-10-08',
    createdAt: '2025-09-23T11:00:00Z',
    updatedAt: '2025-09-28T15:00:00Z',
  },
  {
    id: 'int-prog-010',
    studentId: 's-std022',
    studentName: 'Meera Rao',
    facultyId: 'f1111111-1111-1111-1111-111111111115',
    facultyName: 'Dr. Amit Verma',
    type: 'academic',
    description: 'Digital signal processing concept revision and test series.',
    priority: 'medium',
    status: 'in_progress',
    riskBefore: 55,
    followUpDate: '2025-10-14',
    createdAt: '2025-09-26T14:00:00Z',
    updatedAt: '2025-09-28T16:00:00Z',
  },
  {
    id: 'int-prog-011',
    studentId: 's-std025',
    studentName: 'Tanmay Joshi',
    facultyId: 'f1111111-1111-1111-1111-111111111114',
    facultyName: 'Dr. Sunita Deshmukh',
    type: 'attendance_engagement',
    description: 'Site visit and field survey attendance verification.',
    priority: 'medium',
    status: 'in_progress',
    riskBefore: 57,
    followUpDate: '2025-10-11',
    createdAt: '2025-09-25T11:00:00Z',
    updatedAt: '2025-09-28T10:00:00Z',
  },

  // 24 COMPLETED CASES (17 Improved, 4 No Change, 2 Increased Risk, 1 Unable to Assess)
  // 17 IMPROVED:
  ...Array.from({ length: 17 }).map((_, i) => ({
    id: `int-comp-imp-${i + 1}`,
    studentId: `s-std-comp-${i + 1}`,
    studentName: [
      'Aarav Sharma', 'Ananya Singh', 'Deepak More', 'Swati Mane', 'Suresh Reddy',
      'Kavita Deshmukh', 'Manoj Patil', 'Pankaj Shinde', 'Neha Joshi', 'Harish Kulkarni',
      'Ritu Rao', 'Varun Shah', 'Pooja Gaikwad', 'Abhishek Pawar', 'Shweta Jadhav',
      'Akash Thorat', 'Snehal Kadam'
    ][i] || `Student Imp ${i + 1}`,
    facultyId: 'f1111111-1111-1111-1111-111111111111',
    facultyName: 'Dr. Sarah Mitchell',
    type: (['academic', 'attendance_engagement', 'financial', 'personal_support'][i % 4]) as any,
    description: 'Targeted support plan successfully executed. Student attendance and grades improved.',
    priority: (['high', 'medium', 'low'][i % 3]) as any,
    status: 'completed' as const,
    riskBefore: 70 + (i % 15),
    riskAfter: 35 + (i % 10),
    outcome: 'improved' as const,
    createdAt: '2025-08-10T10:00:00Z',
    updatedAt: '2025-09-18T12:00:00Z',
    completedAt: '2025-09-18T12:00:00Z',
  })),

  // 4 NO CHANGE:
  ...Array.from({ length: 4 }).map((_, i) => ({
    id: `int-comp-nc-${i + 1}`,
    studentId: `s-std-nc-${i + 1}`,
    studentName: ['Baban Kadam', 'Kiran More', 'Smita Shinde', 'Gopal Joshi'][i],
    facultyId: 'f2222222-2222-2222-2222-222222222222',
    facultyName: 'Prof. David Reynolds',
    type: 'academic' as const,
    description: 'Remedial tutorial sessions completed; academic scores remained stable.',
    priority: 'medium' as const,
    status: 'completed' as const,
    riskBefore: 62,
    riskAfter: 61,
    outcome: 'no_change' as const,
    createdAt: '2025-08-15T10:00:00Z',
    updatedAt: '2025-09-15T12:00:00Z',
    completedAt: '2025-09-15T12:00:00Z',
  })),

  // 2 INCREASED RISK:
  {
    id: 'int-comp-ir-1',
    studentId: 's-std-ir-1',
    studentName: 'Dinesh Pawar',
    facultyId: 'f1111111-1111-1111-1111-111111111113',
    facultyName: 'Prof. Rajesh Kulkarni',
    type: 'attendance_engagement',
    description: 'Student discontinued attendance despite counseling sessions.',
    priority: 'critical',
    status: 'completed',
    riskBefore: 65,
    riskAfter: 82,
    outcome: 'increased_risk',
    createdAt: '2025-08-20T10:00:00Z',
    updatedAt: '2025-09-20T12:00:00Z',
    completedAt: '2025-09-20T12:00:00Z',
  },
  {
    id: 'int-comp-ir-2',
    studentId: 's-std-ir-2',
    studentName: 'Vikas Bhosale',
    facultyId: 'f1111111-1111-1111-1111-111111111114',
    facultyName: 'Dr. Sunita Deshmukh',
    type: 'academic',
    description: 'Failed two consecutive make-up examinations.',
    priority: 'high',
    status: 'completed',
    riskBefore: 60,
    riskAfter: 76,
    outcome: 'increased_risk',
    createdAt: '2025-08-22T10:00:00Z',
    updatedAt: '2025-09-22T12:00:00Z',
    completedAt: '2025-09-22T12:00:00Z',
  },

  // 1 UNABLE TO ASSESS:
  {
    id: 'int-comp-ua-1',
    studentId: 's-std-ua-1',
    studentName: 'Archana Deshmukh',
    facultyId: 'f1111111-1111-1111-1111-111111111115',
    facultyName: 'Dr. Amit Verma',
    type: 'personal_support',
    description: 'Medical leave on doctor recommendation; assessment postponed to next semester.',
    priority: 'low',
    status: 'completed',
    riskBefore: 50,
    riskAfter: 50,
    outcome: 'unable_to_assess',
    createdAt: '2025-08-25T10:00:00Z',
    updatedAt: '2025-09-25T12:00:00Z',
    completedAt: '2025-09-25T12:00:00Z',
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __PRISM_INTERVENTIONS_DB: DemoIntervention[] | undefined;
}

if (!globalThis.__PRISM_INTERVENTIONS_DB || globalThis.__PRISM_INTERVENTIONS_DB.length === 0) {
  globalThis.__PRISM_INTERVENTIONS_DB = [...INITIAL_INTERVENTIONS];
}

export function getDemoInterventions(): DemoIntervention[] {
  if (!globalThis.__PRISM_INTERVENTIONS_DB || globalThis.__PRISM_INTERVENTIONS_DB.length === 0) {
    globalThis.__PRISM_INTERVENTIONS_DB = [...INITIAL_INTERVENTIONS];
  }
  return globalThis.__PRISM_INTERVENTIONS_DB;
}

export function addDemoIntervention(
  intervention: Omit<DemoIntervention, 'id' | 'createdAt' | 'updatedAt'>
): DemoIntervention {
  const now = new Date().toISOString();
  const newIntervention: DemoIntervention = {
    ...intervention,
    id: `int-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: now,
    updatedAt: now,
  };
  getDemoInterventions().unshift(newIntervention);
  return newIntervention;
}

export function updateDemoIntervention(
  id: string,
  updates: Partial<DemoIntervention>
): DemoIntervention | null {
  const interventions = getDemoInterventions();
  const index = interventions.findIndex((i) => i.id === id);
  if (index === -1) return null;

  interventions[index] = {
    ...interventions[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return interventions[index];
}
