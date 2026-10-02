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

  const dept = student?.department || 'Computer Engineering';
  const attendanceRate = student ? (student.attendance_percentage ?? student.attendance_rate ?? 85) : 85;

  const subjects = [
    {
      id: 'sub-1',
      code: 'CS301',
      name: 'Database Management Systems',
      department: dept,
      instructor: 'Dr. Sarah Mitchell',
      attendanceRate: Math.min(100, Math.max(40, attendanceRate - 2)),
      completedModules: 6,
      totalModules: 8,
      resourcesCount: 12,
    },
    {
      id: 'sub-2',
      code: 'CS302',
      name: 'Data Structures and Algorithms',
      department: dept,
      instructor: 'Prof. David Reynolds',
      attendanceRate: Math.min(100, Math.max(40, attendanceRate + 3)),
      completedModules: 7,
      totalModules: 10,
      resourcesCount: 15,
    },
    {
      id: 'sub-3',
      code: 'CS303',
      name: 'Operating Systems & System Architecture',
      department: dept,
      instructor: 'Prof. Anita Sharma',
      attendanceRate: Math.min(100, Math.max(40, attendanceRate - 1)),
      completedModules: 5,
      totalModules: 8,
      resourcesCount: 9,
    },
  ];

  return NextResponse.json({ subjects });
}

