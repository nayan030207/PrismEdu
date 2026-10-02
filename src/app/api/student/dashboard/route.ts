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
  const normEmail = (session.email || '').toLowerCase().trim();

  const currentStudent =
    students.find(
      (s) =>
        (s.email && s.email.toLowerCase().trim() === normEmail) ||
        s.id === session.entityId ||
        s.student_id === session.entityId ||
        s.full_name?.toLowerCase() === session.name?.toLowerCase()
    ) || students[0];

  const interventions = getDemoInterventions();
  const studentInterventions = interventions.filter(
    (i) => i.studentId === currentStudent.id || i.studentName === currentStudent.full_name
  );

  const attRate = currentStudent.attendance_percentage ?? currentStudent.attendance_rate ?? 78;
  const cgpa = currentStudent.academic_cgpa ?? currentStudent.previous_gpa ?? 7.2;
  const backlogs = currentStudent.academic_backlogs ?? currentStudent.previous_backlogs ?? 0;

  const dashboardData = {
    studentName: currentStudent.full_name || session.name || 'Student',
    studentId: currentStudent.student_id || 'STU1001',
    course: currentStudent.course || 'Computer Science and Engineering',
    department: currentStudent.department || 'Department of Computer Engineering',
    academicYear: currentStudent.academic_year || 2,
    courseProgress: Math.min(95, Math.round(cgpa * 10 + 5)),
    attendanceRate: attRate,
    academicCgpa: cgpa,
    cgpa,
    backlogs,
    facultyMentor: currentStudent.faculty_mentor_name || 'Dr. Sarah Mitchell',
    recommendedResourcesCount: 4,
    scholarshipsCount: currentStudent.financial_assistance === 'required' ? 3 : 2,
    careerOpportunitiesCount: 4,
    pendingAssignmentsCount: currentStudent.insight?.academic === 'critical' ? 2 : 1,
    pendingQuizzesCount: 1,
    activeInterventionsCount: studentInterventions.filter((i) => ['in_progress', 'pending'].includes(i.status)).length,
    recentNotifications: [
      {
        id: 'n1',
        title: attRate < 75 ? 'Attendance Advisory Alert' : 'Weekly Attendance Status Update',
        description: `Your recorded attendance stands at ${attRate}%. Target minimum is 75%.`,
        message: attRate < 75
          ? `Your overall attendance is currently at ${attRate}%, which is below the required 75% threshold.`
          : `Your term performance summary is ready. Current attendance is ${attRate}%.`,
        time: 'Today',
        date: 'Recent',
        type: attRate < 75 ? 'warning' : 'info',
      },
      ...(studentInterventions.length > 0
        ? [
            {
              id: 'n2',
              title: `Mentorship: ${studentInterventions[0].type.toUpperCase()}`,
              description: studentInterventions[0].description,
              message: studentInterventions[0].description,
              time: 'Recent',
              date: 'Recent',
              type: 'alert',
            },
          ]
        : []),
    ],
    recommendedResources: [
      {
        id: 'r1',
        title: 'Core Concepts & Revision Summary',
        course: currentStudent.course,
        category: 'Academic',
        type: 'Notes & Guide',
        duration: '45 mins',
      },
      {
        id: 'r2',
        title: 'Problem Solving & Practice Worksheets',
        course: currentStudent.course,
        category: 'Tutorial',
        type: 'Interactive',
        duration: '30 mins',
      },
    ],
  };

  return NextResponse.json(dashboardData);
}
