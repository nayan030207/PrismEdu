import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { activityService } from '@/lib/services/activity.service';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { event_type, duration_seconds, resource_id, course_id, metadata } = body;

    const event = await activityService.recordEvent({
      student_id: session.entityId,
      event_type: event_type || 'dashboard_view',
      session_id: `sess-${Date.now()}`,
      event_data: { duration_seconds, resource_id, course_id, ...metadata },
    });

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to record event' }, { status: 500 });
  }
}
