import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDemoStudents } from '@/lib/store/demo-students';
import { getDemoInterventions } from '@/lib/store/demo-interventions';

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

  const interventions = getDemoInterventions();
  const studentInterventions = interventions.filter(
    (i) => i.studentId === currentStudent.id || i.studentName === currentStudent.full_name
  );

  const attRate = currentStudent.attendance_rate ?? currentStudent.attendance_percentage ?? 78;
  const cgpa = currentStudent.academic_cgpa ?? currentStudent.previous_gpa ?? 7.2;

  const dashboardData = {
    studentName: currentStudent.full_name,
    studentId: currentStudent.student_id,
    course: currentStudent.course,
    department: currentStudent.department,
    academicYear: currentStudent.academic_year || 2,
    courseProgress: Math.min(95, Math.round(cgpa * 10 + 5)),
    attendanceRate: attRate,
    academicCgpa: cgpa,
    backlogs: currentStudent.academic_backlogs ?? 0,
    facultyMentor: currentStudent.faculty_mentor_name || 'Dr. Sarah Mitchell',
    recommendedResourcesCount: 4,
    scholarshipsCount: currentStudent.financial_assistance === 'required' ? 3 : 2,
    careerOpportunitiesCount: 4,
    pendingAssignmentsCount: currentStudent.insight?.academic === 'critical' ? 2 : 1,
    pendingQuizzesCount: 1,
    activeInterventionsCount: studentInterventions.filter((i) => ['in_progress', 'pending'].includes(i.status)).length,
    recentNotifications: [
      {
        title: 'Weekly Attendance Status Update',
        description: `Your recorded attendance stands at ${attRate}%. Target minimum is 75%.`,
        time: 'Today',
        type: attRate < 75 ? 'warning' : 'info',
      },
      ...(studentInterventions.length > 0
        ? [
            {
              title: `Mentorship: ${studentInterventions[0].type.toUpperCase()}`,
              description: studentInterventions[0].description,
              time: 'Recent',
              type: 'alert',
            },
          ]
        : []),
    ],
    recommendedResources: [
      {
        title: 'Core Concepts & Revision Summary',
        course: currentStudent.course,
        type: 'Notes & Guide',
        duration: '45 mins',
      },
      {
        title: 'Problem Solving & Practice Worksheets',
        course: currentStudent.course,
        type: 'Interactive',
        duration: '30 mins',
      },
    ],
  };

  return NextResponse.json(dashboardData);
}
