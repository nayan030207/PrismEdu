import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDemoStudents } from '@/lib/store/demo-students';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized: Student login required' }, { status: 403 });
  }

  const students = getDemoStudents();
  const currentStudent =
    students.find(
      (s) =>
        s.email?.toLowerCase().trim() === session.email?.toLowerCase().trim() ||
        s.id === session.entityId ||
        s.full_name?.toLowerCase() === session.name?.toLowerCase()
    ) || students[0];

  const overallRate = currentStudent.attendance_rate ?? currentStudent.attendance_percentage ?? 78;
  const totalClasses = 120;
  const attendedClasses = Math.round((overallRate / 100) * totalClasses);
  const missedClasses = totalClasses - attendedClasses;

  const attendanceData = {
    overallRate,
    previousRate: Math.min(100, overallRate + 6),
    rateChange: -6,
    statusIndicator: overallRate < 65 ? 'Critical Deficit' : overallRate < 75 ? 'Warning (<75%)' : 'Good Standing',
    totalClasses,
    attendedClasses,
    missedClasses,
    subjectBreakdown: [
      { subject: 'Applied Core Theory', attended: Math.round(attendedClasses * 0.35), total: 40, percentage: overallRate },
      { subject: 'Laboratory & Practical', attended: Math.round(attendedClasses * 0.25), total: 30, percentage: Math.max(40, overallRate - 4) },
      { subject: 'Engineering Workshop', attended: Math.round(attendedClasses * 0.22), total: 25, percentage: Math.min(95, overallRate + 5) },
      { subject: 'Tutorial & Problem Session', attended: Math.round(attendedClasses * 0.18), total: 25, percentage: overallRate },
    ],
    weeklyTrend: [
      { week: 'Week 1', rate: Math.min(100, overallRate + 8) },
      { week: 'Week 2', rate: Math.min(100, overallRate + 5) },
      { week: 'Week 3', rate: overallRate },
      { week: 'Week 4', rate: overallRate },
    ],
    engagementMetrics: {
      lastLogin: 'Today, 09:15 AM',
      learningSessionsThisWeek: 6,
      resourcesAccessedThisMonth: 18,
      activeStreakDays: overallRate > 70 ? 4 : 1,
      assignmentCompletionRate: currentStudent.academic_backlogs ? 70 : 92,
      quizParticipationRate: 85,
    },
    institutionalThresholdNotice:
      overallRate < 75
        ? 'Notice: Your current attendance is below the institutional requirement of 75%. Please contact your faculty mentor.'
        : 'Good job: You are above the mandatory institutional 75% attendance threshold.',
  };

  return NextResponse.json(attendanceData);
}
