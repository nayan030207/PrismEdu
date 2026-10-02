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
  
  const student = students.find(
    (s) =>
      (s.email && s.email.toLowerCase().trim() === normEmail) ||
      s.id === session.entityId ||
      s.student_id === session.entityId
  );

  const attendanceRate = student ? (student.attendance_percentage ?? student.attendance_rate ?? 85) : 85;
  const studentName = student ? student.full_name : (session.name || 'Student');

  const dashboardData = {
    studentName,
    studentId: student?.student_id || 'STU1001',
    course: student?.course || 'Computer Science and Engineering',
    department: student?.department || 'Department of Computer Engineering',
    academicYear: student?.academic_year || 2,
    courseProgress: 76,
    attendanceRate,
    cgpa: student?.academic_cgpa ?? student?.previous_gpa ?? 7.5,
    backlogs: student?.academic_backlogs ?? student?.previous_backlogs ?? 0,
    recommendedResourcesCount: 4,
    scholarshipsCount: 2,
    careerOpportunitiesCount: 5,
    pendingAssignmentsCount: 2,
    pendingQuizzesCount: 1,
    recentNotifications: [
      {
        id: 'n1',
        title: attendanceRate < 75 ? 'Attendance Advisory Alert' : 'Academic Performance Update',
        message: attendanceRate < 75
          ? `Your overall attendance is currently at ${attendanceRate}%, which is below the required 75% threshold.`
          : `Your term performance summary is ready. Current attendance is ${attendanceRate}%.`,
        date: 'Recent',
        type: attendanceRate < 75 ? 'warning' : 'info',
      },
    ],
    recommendedResources: [
      { id: 'r1', title: 'Data Structures & Algorithms Masterclass', category: 'Academic' },
      { id: 'r2', title: 'Database Normalization Core Concepts', category: 'Tutorial' },
    ],
  };

  return NextResponse.json(dashboardData);
}

