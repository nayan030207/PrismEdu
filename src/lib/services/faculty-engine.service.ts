import {
  getFacultyStudents,
  getFacultyTasks,
  getFacultyMeetings,
  getFacultyAlerts,
  getFacultyInterventions,
  type FacultyStudent,
  type FacultyTask,
  type FacultyMeeting,
  type FacultyAlert,
} from '@/lib/store/faculty-data';

export interface FacultyDashboardPayload {
  facultyProfile: {
    name: string;
    department: string;
    assignedBatch: string;
    totalStudents: number;
    semester: string;
    lastUpdated: string;
  };
  kpis: {
    highRisk: { count: number; trend: string; trendColor: string; subtitle: string };
    moderateRisk: { count: number; trend: string; trendColor: string; subtitle: string };
    attendanceConcern: { count: number; trend: string; trendColor: string; subtitle: string };
    academicDecline: { count: number; trend: string; trendColor: string; subtitle: string };
    activeInterventions: { count: number; trend: string; trendColor: string; subtitle: string };
  };
  riskDistribution: {
    totalStudents: number;
    slices: Array<{ name: string; value: number; percentage: string; color: string }>;
  };
  riskTrend: Record<string, Array<{ month: string; averageRisk: number; highRiskRate: number }>>;
  todaysTasks: FacultyTask[];
  upcomingMeetings: FacultyMeeting[];
  atRiskStudents: FacultyStudent[];
  recentAlerts: FacultyAlert[];
  interventionProgress: {
    total: number;
    inProgress: number;
    completed: number;
    overdue: number;
    notStarted: number;
    completionRate: number;
    slices: Array<{ name: string; value: number; percentage: string; color: string }>;
  };
  attendanceAcademicInsights: {
    attendanceDistribution: Array<{
      range: string;
      count: number;
      percentage: string;
      color: string;
    }>;
    cgpaDistribution: Array<{
      range: string;
      count: number;
      percentage: string;
      color: string;
    }>;
  };
}

export class FacultyEngineService {
  /**
   * Dynamically calculate dashboard analytics for the faculty cohort
   */
  async getFacultyDashboard(filter = 'my_students'): Promise<FacultyDashboardPayload> {
    const students = getFacultyStudents();
    const tasks = getFacultyTasks();
    const meetings = getFacultyMeetings();
    const alerts = getFacultyAlerts();
    const interventions = getFacultyInterventions();

    const totalStudents = students.length || 54;

    // 1. Calculate risk groups
    const criticalCount = students.filter((s) => s.riskCategory === 'critical').length;
    const highCount = students.filter((s) => s.riskCategory === 'high').length;
    const moderateCount = students.filter((s) => s.riskCategory === 'moderate').length;
    const lowCount = students.filter((s) => s.riskCategory === 'low').length;

    const highRiskCombined = criticalCount + highCount; // 12 students (22%)
    const attendanceConcernCount = students.filter((s) => s.attendance < 65).length; // 16 students
    const academicDeclineCount = students.filter((s) => s.academicDecline).length; // 14 students
    const activeInterventionsCount = interventions.filter(
      (i) => i.status === 'in_progress' || i.status === 'overdue' || i.status === 'not_started'
    ).length || 11;

    // 2. Risk Distribution Donut & Legend
    const slices = [
      {
        name: 'Low Risk',
        value: lowCount,
        percentage: `${((lowCount / totalStudents) * 100).toFixed(1)}%`,
        color: '#10B981',
      },
      {
        name: 'Moderate Risk',
        value: moderateCount,
        percentage: `${((moderateCount / totalStudents) * 100).toFixed(1)}%`,
        color: '#F59E0B',
      },
      {
        name: 'High Risk',
        value: highCount,
        percentage: `${((highCount / totalStudents) * 100).toFixed(1)}%`,
        color: '#F97316',
      },
      {
        name: 'Critical Risk',
        value: criticalCount,
        percentage: `${((criticalCount / totalStudents) * 100).toFixed(1)}%`,
        color: '#EF4444',
      },
    ];

    // 3. Risk Trend by Timeframe
    const riskTrend = {
      Semester: [
        { month: 'Jan', averageRisk: 58, highRiskRate: 23 },
        { month: 'Feb', averageRisk: 52, highRiskRate: 22 },
        { month: 'Mar', averageRisk: 46, highRiskRate: 20 },
        { month: 'Apr', averageRisk: 42, highRiskRate: 18 },
        { month: 'May', averageRisk: 40, highRiskRate: 17 },
        { month: 'Jun', averageRisk: 44, highRiskRate: 19 },
        { month: 'Jul', averageRisk: 48, highRiskRate: 21 },
        { month: 'Aug', averageRisk: 45, highRiskRate: 20 },
        { month: 'Sep', averageRisk: 42, highRiskRate: 22 },
      ],
      '7D': [
        { month: 'Day 1', averageRisk: 43, highRiskRate: 22 },
        { month: 'Day 2', averageRisk: 43, highRiskRate: 22 },
        { month: 'Day 3', averageRisk: 42, highRiskRate: 22 },
        { month: 'Day 4', averageRisk: 42, highRiskRate: 21 },
        { month: 'Day 5', averageRisk: 41, highRiskRate: 22 },
        { month: 'Day 6', averageRisk: 42, highRiskRate: 22 },
        { month: 'Day 7', averageRisk: 42, highRiskRate: 22 },
      ],
      '30D': [
        { month: 'W1', averageRisk: 45, highRiskRate: 23 },
        { month: 'W2', averageRisk: 44, highRiskRate: 22 },
        { month: 'W3', averageRisk: 43, highRiskRate: 22 },
        { month: 'W4', averageRisk: 42, highRiskRate: 22 },
      ],
    };

    // 4. Interventions Progress
    const completedInt = interventions.filter((i) => i.status === 'completed').length;
    const inProgressInt = interventions.filter((i) => i.status === 'in_progress').length;
    const overdueInt = interventions.filter((i) => i.status === 'overdue').length;
    const notStartedInt = interventions.filter((i) => i.status === 'not_started').length;
    const totalInt = interventions.length || 11;
    const completionRate = Math.round((completedInt / totalInt) * 100);

    const intSlices = [
      {
        name: 'Completed',
        value: completedInt,
        percentage: `${Math.round((completedInt / totalInt) * 100)}%`,
        color: '#10B981',
      },
      {
        name: 'In Progress',
        value: inProgressInt,
        percentage: `${Math.round((inProgressInt / totalInt) * 100)}%`,
        color: '#3B82F6',
      },
      {
        name: 'Overdue',
        value: overdueInt,
        percentage: `${Math.round((overdueInt / totalInt) * 100)}%`,
        color: '#EF4444',
      },
      {
        name: 'Not Started',
        value: notStartedInt,
        percentage: `${Math.round((notStartedInt / totalInt) * 100)}%`,
        color: '#94A3B8',
      },
    ];

    // 5. Attendance & CGPA distributions
    const attUnder50 = students.filter((s) => s.attendance < 50).length;
    const att50to65 = students.filter((s) => s.attendance >= 50 && s.attendance < 65).length;
    const att65to75 = students.filter((s) => s.attendance >= 65 && s.attendance <= 75).length;
    const attOver75 = students.filter((s) => s.attendance > 75).length;

    const attendanceDistribution = [
      {
        range: '< 50%',
        count: attUnder50,
        percentage: `${((attUnder50 / totalStudents) * 100).toFixed(1)}%`,
        color: '#EF4444',
      },
      {
        range: '50 - 65%',
        count: att50to65,
        percentage: `${((att50to65 / totalStudents) * 100).toFixed(1)}%`,
        color: '#F97316',
      },
      {
        range: '65 - 75%',
        count: att65to75,
        percentage: `${((att65to75 / totalStudents) * 100).toFixed(1)}%`,
        color: '#F59E0B',
      },
      {
        range: '> 75%',
        count: attOver75,
        percentage: `${((attOver75 / totalStudents) * 100).toFixed(1)}%`,
        color: '#10B981',
      },
    ];

    const cgpaUnder5 = students.filter((s) => s.cgpa < 5.0).length;
    const cgpa5to6 = students.filter((s) => s.cgpa >= 5.0 && s.cgpa < 6.0).length;
    const cgpa6to7 = students.filter((s) => s.cgpa >= 6.0 && s.cgpa <= 7.0).length;
    const cgpaOver7 = students.filter((s) => s.cgpa > 7.0).length;

    const cgpaDistribution = [
      {
        range: '< 5.0',
        count: cgpaUnder5,
        percentage: `${((cgpaUnder5 / totalStudents) * 100).toFixed(1)}%`,
        color: '#EF4444',
      },
      {
        range: '5.0 - 6.0',
        count: cgpa5to6,
        percentage: `${((cgpa5to6 / totalStudents) * 100).toFixed(1)}%`,
        color: '#F97316',
      },
      {
        range: '6.0 - 7.0',
        count: cgpa6to7,
        percentage: `${((cgpa6to7 / totalStudents) * 100).toFixed(1)}%`,
        color: '#10B981',
      },
      {
        range: '> 7.0',
        count: cgpaOver7,
        percentage: `${((cgpaOver7 / totalStudents) * 100).toFixed(1)}%`,
        color: '#059669',
      },
    ];

    // 6. At-risk students prioritized
    const atRiskStudents = students
      .filter((s) => s.riskCategory === 'critical' || s.riskCategory === 'high')
      .slice(0, 5);

    return {
      facultyProfile: {
        name: 'Prof. Sandeep Kulkarni',
        department: 'Computer Engineering',
        assignedBatch: 'Computer Engineering (SE)',
        totalStudents,
        semester: 'Semester 1',
        lastUpdated: 'Sep 30, 2025, 09:30 AM',
      },
      kpis: {
        highRisk: {
          count: highRiskCombined,
          trend: '↑ 20%',
          trendColor: 'text-rose-600',
          subtitle: `${Math.round((highRiskCombined / totalStudents) * 100)}% of your students`,
        },
        moderateRisk: {
          count: moderateCount,
          trend: '↓ 10%',
          trendColor: 'text-emerald-600',
          subtitle: `${Math.round((moderateCount / totalStudents) * 100)}% of your students`,
        },
        attendanceConcern: {
          count: attendanceConcernCount,
          trend: '↑ 12%',
          trendColor: 'text-rose-600',
          subtitle: 'Attendance < 65%',
        },
        academicDecline: {
          count: academicDeclineCount,
          trend: '↑ 8%',
          trendColor: 'text-rose-600',
          subtitle: 'Internal marks declining',
        },
        activeInterventions: {
          count: activeInterventionsCount,
          trend: '↑ 36%',
          trendColor: 'text-emerald-600',
          subtitle: 'Assigned to you',
        },
      },
      riskDistribution: {
        totalStudents,
        slices,
      },
      riskTrend,
      todaysTasks: tasks,
      upcomingMeetings: meetings,
      atRiskStudents,
      recentAlerts: alerts,
      interventionProgress: {
        total: totalInt,
        inProgress: inProgressInt,
        completed: completedInt,
        overdue: overdueInt,
        notStarted: notStartedInt,
        completionRate,
        slices: intSlices,
      },
      attendanceAcademicInsights: {
        attendanceDistribution,
        cgpaDistribution,
      },
    };
  }

  /**
   * Process natural language queries from Faculty AI Assistant
   */
  async processAiQuery(query: string): Promise<string> {
    const q = query.toLowerCase();
    const students = getFacultyStudents();

    if (q.includes('declining marks') || q.includes('academic decline') || q.includes('marks')) {
      const declining = students.filter((s) => s.academicDecline);
      const names = declining.slice(0, 4).map((s) => `${s.full_name} (${s.student_id})`).join(', ');
      return `Found ${declining.length} students showing internal marks decline in SE Computer Engineering: ${names}. Key driver is mid-term unit test performance in Data Structures and Digital Electronics.`;
    }

    if (q.includes('missed') || q.includes('assignment') || q.includes('assignments')) {
      const missed = students.filter((s) => (s.missedAssignments || 0) > 0);
      const details = missed
        .map((s) => `${s.full_name} (${s.student_id}, missed ${s.missedAssignments})`)
        .join('; ');
      return `${missed.length} students have missed assignment deadlines: ${details}. Suggest issuing a batch reminder or granting a 48-hour extension window.`;
    }

    if (q.includes('suggest') || q.includes('intervention') || q.includes('high-risk')) {
      return `Recommended interventions for your top high-risk students:\n1. Aditya Kulkarni (IT23001, 82% risk) -> Mandatory Dean Escalation & parent conference regarding 45% attendance.\n2. Sneha Patil (IT23018, 76% risk) -> Academic remedial coaching in discrete mathematics and peer-pairing.\n3. Rohit Deshmukh (IT23024, 71% risk) -> Lab make-up sessions to recover missed practical credits.`;
    }

    if (q.includes('report') || q.includes('attendance report')) {
      return `Attendance Summary for SE Computer Engineering (54 Students):\n• Average Attendance: 67.4%\n• Below 50% Critical: 8 students (14.8%)\n• 50% - 65% Warning: 16 students (29.6%)\n• Compliant (>75%): 12 students (22.2%)\nClick 'Download Reports' in the sidebar for the full Excel roster.`;
    }

    return `Based on live analysis of your 54 assigned students in SE Computer Engineering: 12 students require active intervention. The highest correlation with dropout probability is consecutive laboratory absences. Recommended action: Confirm today's meetings with Aditya Kulkarni and Sneha Patil.`;
  }
}

export const facultyEngineService = new FacultyEngineService();
