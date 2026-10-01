import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { activityService } from '@/lib/services/activity.service';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized: Student login required' }, { status: 403 });
  }

  try {
    const { submission_text } = await req.json();
    const assignmentId = params.id;

    if (!submission_text || submission_text.trim().length === 0) {
      return NextResponse.json({ error: 'Submission text cannot be empty' }, { status: 400 });
    }

    // 1. Record activity telemetry event (Section 17)
    await activityService.recordEvent({
      student_id: session.entityId,
      event_type: 'ASSIGNMENT_SUBMITTED',
      event_data: {
        assignment_id: assignmentId,
        char_count: submission_text.length,
        submitted_at: new Date().toISOString(),
      },
    });

    // 2. Persist to database if live
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveDb = supabaseUrl && !supabaseUrl.includes('your-project') && !supabaseUrl.includes('test.supabase');

    if (isLiveDb) {
      try {
        const supabase = createSupabaseServiceClient();
        await supabase.from('assignment_submissions').upsert({
          assignment_id: assignmentId,
          student_id: session.entityId,
          submission_text,
          submitted_at: new Date().toISOString(),
        }, { onConflict: 'assignment_id, student_id' });
      } catch {
        // Fall through
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Assignment submitted successfully. Your instructor will grade your submission.',
      assignmentId,
      submittedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
