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

  const cgpa = student ? (student.academic_cgpa ?? student.previous_gpa ?? 7.5) : 7.5;
  const backlogs = student ? (student.academic_backlogs ?? student.previous_backlogs ?? 0) : 0;
  const year = student ? (student.academic_year || 2) : 2;

  const progressData = {
    overallCourseProgress: Math.min(100, year * 25),
    cumulativeGpa: cgpa,
    completedCredits: year * 22,
    totalCreditsRequired: 160,
    semester: year * 2 - 1,
    activeBacklogs: backlogs,
    academicSummary: [
      {
        semester: 'Semester 1',
        gpa: Math.min(10, cgpa + 0.3),
        credits: 22,
        status: 'Cleared',
      },
      {
        semester: 'Semester 2',
        gpa: cgpa,
        credits: 22,
        status: backlogs > 0 ? `${backlogs} Pending Backlog(s)` : 'Cleared',
      },
    ],
    learningMilestones: [
      {
        title: 'DBMS Normalization Notes',
        type: 'Reading & Notes',
        date: '2026-09-08',
        status: 'Completed',
      },
      {
        title: 'SQL Indexing Guide',
        type: 'Technical PDF',
        date: '2026-09-10',
        status: 'Completed',
      },
      {
        title: 'DBMS Normalization Quiz',
        type: 'Assessment Quiz',
        date: '2026-09-12',
        status: 'Completed',
      },
    ],
  };

  return NextResponse.json(progressData);
}

