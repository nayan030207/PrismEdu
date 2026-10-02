import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDemoStudents } from '@/lib/store/demo-students';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized: Student login required' }, { status: 403 });
  }

  const students = getDemoStudents();
  const normEmail = (session.email || '').toLowerCase().trim();

  const student =
    students.find(
      (s) =>
        (s.email && s.email.toLowerCase().trim() === normEmail) ||
        s.id === session.entityId ||
        s.student_id === session.entityId ||
        s.full_name?.toLowerCase() === session.name?.toLowerCase()
    ) || students[0];

  const overallRate = student.attendance_percentage ?? student.attendance_rate ?? 78;
  const previousRate = Math.min(100, Math.max(40, overallRate + (overallRate < 75 ? 12 : -3)));
  const rateChange = overallRate - previousRate;

  const totalClasses = 60;
  const attendedClasses = Math.round(totalClasses * (overallRate / 100));
  const missedClasses = Math.max(0, totalClasses - attendedClasses);

  const sub1Rate = Math.min(100, Math.max(30, overallRate - 3));
  const sub2Rate = Math.min(100, Math.max(30, overallRate + 4));
  const sub3Rate = Math.min(100, Math.max(30, overallRate - 1));

  const attendanceData = {
    overallRate,
    previousRate,
    rateChange,
    statusIndicator: overallRate < 65 ? 'Critical Deficit' : overallRate < 75 ? 'Attendance Decline' : 'Good Standing',
    totalClasses,
    attendedClasses,
    missedClasses,
    subjectBreakdown: [
      { subjectName: 'Database Management Systems', code: 'CS301', totalClasses: 20, attended: Math.round(20 * (sub1Rate / 100)), rate: sub1Rate },
      { subjectName: 'Data Structures and Algorithms', code: 'CS302', totalClasses: 20, attended: Math.round(20 * (sub2Rate / 100)), rate: sub2Rate },
      { subjectName: 'Operating Systems', code: 'CS303', totalClasses: 20, attended: Math.round(20 * (sub3Rate / 100)), rate: sub3Rate },
    ],
    weeklyTrend: [
      { week: 'Week 1', rate: Math.min(100, previousRate + 5) },
      { week: 'Week 2', rate: previousRate },
      { week: 'Week 3', rate: Math.round((previousRate + overallRate) / 2) },
      { week: 'Week 4', rate: overallRate },
    ],
    engagementMetrics: {
      lastLogin: 'Today, 09:15 AM',
      learningSessionsThisWeek: 5,
      resourcesAccessedThisMonth: 14,
      activeStreakDays: overallRate > 70 ? 4 : 1,
      assignmentCompletionRate: student.academic_backlogs ? 70 : 88,
      quizParticipationRate: 90,
    },
    institutionalThresholdNotice:
      overallRate < 75
        ? `Institutional Advisory: Your overall attendance is currently at ${overallRate}%. Academic regulations require a minimum of 75% attendance for end-semester examinations.`
        : 'Good Standing: Your attendance satisfies institutional examination requirements (>= 75%).',
  };

  return NextResponse.json(attendanceData);
}
