import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized: Student login required' }, { status: 403 });
  }

  // Attendance metrics for Priya Patel (STU1024)
  const attendanceData = {
    overallRate: 69,
    previousRate: 82,
    rateChange: -13,
    statusIndicator: 'Attendance Decline',
    totalClasses: 45,
    attendedClasses: 31,
    missedClasses: 14,
    subjectBreakdown: [
      {
        subjectName: 'Database Management Systems',
        code: 'CS301',
        totalClasses: 18,
        attended: 12,
        rate: 67,
        status: 'warning',
      },
      {
        subjectName: 'Data Structures and Algorithms',
        code: 'CS302',
        totalClasses: 15,
        attended: 11,
        rate: 73,
        status: 'warning',
      },
      {
        subjectName: 'Operating Systems',
        code: 'CS303',
        totalClasses: 12,
        attended: 8,
        rate: 67,
        status: 'warning',
      },
    ],
    weeklyTrend: [
      { week: 'Week 1', rate: 85 },
      { week: 'Week 2', rate: 82 },
      { week: 'Week 3', rate: 74 },
      { week: 'Week 4', rate: 69 },
    ],
    engagementMetrics: {
      lastLogin: 'Today, 10:15 AM',
      learningSessionsThisWeek: 4,
      resourcesAccessedThisMonth: 12,
      activeStreakDays: 2,
      assignmentCompletionRate: 50,
      quizParticipationRate: 60,
    },
    institutionalThresholdNotice: 'Institutional Advisory: Your overall attendance is currently at 69%. Academic regulations require minimum 75% attendance for end-semester examinations. Please consult your mentor Dr. Sarah Mitchell if you need scheduling support.',
  };

  return NextResponse.json(attendanceData);
}
