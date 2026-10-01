import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized: Student login required' }, { status: 403 });
  }

  const dashboardData = {
    studentName: session.name || 'Student',
    courseProgress: 0,
    attendanceRate: 0,
    recommendedResourcesCount: 0,
    scholarshipsCount: 0,
    careerOpportunitiesCount: 0,
    pendingAssignmentsCount: 0,
    pendingQuizzesCount: 0,
    recentNotifications: [],
    recommendedResources: [],
  };

  return NextResponse.json(dashboardData);
}
