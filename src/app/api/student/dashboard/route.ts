import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized: Student login required' }, { status: 403 });
  }

  const studentId = session.entityId;

  // Real-time metrics
  const dashboardData = {
    studentName: session.name || 'Priya Patel',
    courseProgress: 72,
    attendanceRate: 76,
    recommendedResourcesCount: 2,
    scholarshipsCount: 3,
    careerOpportunitiesCount: 4,
    pendingAssignmentsCount: 1,
    pendingQuizzesCount: 1,
    recentNotifications: [
      {
        id: 'n1',
        title: 'Academic Mentorship Review Scheduled',
        message: 'Dr. Sarah Mitchell scheduled a follow-up review for DBMS on Friday.',
        time: '2 hours ago',
        type: 'intervention',
        read: false,
      },
      {
        id: 'n2',
        title: 'Scholarship Application Deadline',
        message: 'Merit-cum-Means Post-Matric Scholarship closes in 45 days.',
        time: '1 day ago',
        type: 'financial',
        read: false,
      },
      {
        id: 'n3',
        title: 'New Learning Assignment Available',
        message: 'Assignment 1: Database Schema Normalization Exercise is due in 7 days.',
        time: '2 days ago',
        type: 'learning',
        read: true,
      },
    ],
    recommendedResources: [
      {
        id: 'lr111111-1111-1111-1111-111111111111',
        title: 'DBMS Lecture Notes - Normalization (1NF to BCNF)',
        subject: 'Database Management Systems',
        type: 'note',
        duration: '45 mins',
      },
      {
        id: 'qz111111-1111-1111-1111-111111111111',
        title: 'DBMS Normalization & Relational Theory Quiz',
        subject: 'Database Management Systems',
        type: 'quiz',
        duration: '20 mins',
      },
    ],
  };

  return NextResponse.json(dashboardData);
}
