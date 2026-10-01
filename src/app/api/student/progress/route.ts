import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized: Student login required' }, { status: 403 });
  }

  const progressData = {
    overallCourseProgress: 72,
    cumulativeGpa: 6.20,
    completedCredits: 44,
    totalCreditsRequired: 160,
    semester: 3,
    activeBacklogs: 2,
    academicSummary: [
      {
        semester: 'Semester 1',
        gpa: 6.80,
        credits: 22,
        status: 'Cleared',
      },
      {
        semester: 'Semester 2',
        gpa: 5.60,
        credits: 22,
        status: '2 Backlogs (Engineering Mathematics II, Basics of Electronics)',
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
        status: 'Completed (Score: 30/50)',
      },
      {
        title: 'Relational Schema Normalization Exercise',
        type: 'Assignment Submission',
        date: 'Due in 7 days',
        status: 'Pending Submission',
      },
    ],
  };

  return NextResponse.json(progressData);
}
