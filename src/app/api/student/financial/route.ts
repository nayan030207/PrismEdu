import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { activityService } from '@/lib/services/activity.service';

const SCHOLARSHIPS: any[] = [];

const EDUCATIONAL_LOANS: any[] = [];

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Telemetry: record viewing of financial support portal (Section 17)
  await activityService.recordEvent({
    student_id: session.entityId,
    event_type: 'SCHOLARSHIP_VIEWED',
    event_data: { section: 'financial_portal', timestamp: new Date().toISOString() },
  });

  return NextResponse.json({
    scholarships: SCHOLARSHIPS,
    educationalLoans: EDUCATIONAL_LOANS,
    disclaimer: 'Note: Potential eligibility tags are advisory indicators based on your admission profile. Final eligibility and approvals are strictly determined by the official awarding bodies.',
  });
}
