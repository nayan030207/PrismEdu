import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { activityService } from '@/lib/services/activity.service';

const JOBS: any[] = [];
const INTERNSHIPS: any[] = [];
const CERTIFICATIONS: any[] = [];
const SKILL_RECOMMENDATIONS: any[] = [];

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Telemetry: record career opportunities interaction (Section 17)
  await activityService.recordEvent({
    student_id: session.entityId,
    event_type: 'JOB_VIEWED',
    event_data: { section: 'career_opportunities', timestamp: new Date().toISOString() },
  });

  return NextResponse.json({
    jobs: JOBS,
    internships: INTERNSHIPS,
    certifications: CERTIFICATIONS,
    skillRecommendations: SKILL_RECOMMENDATIONS,
  });
}
