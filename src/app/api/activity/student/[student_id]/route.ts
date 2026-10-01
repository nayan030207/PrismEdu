import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { activityService } from '@/lib/services/activity.service';

export async function GET(
  req: Request,
  { params }: { params: { student_id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { student_id } = params;
  const events = await activityService.getStudentEvents(student_id);

  return NextResponse.json({ events });
}
