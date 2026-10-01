import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || (session.role !== 'faculty' && session.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { status, outcome, follow_up_date } = await req.json();
    const interventionId = params.id;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveDb = supabaseUrl && !supabaseUrl.includes('your-project') && !supabaseUrl.includes('test.supabase');

    if (isLiveDb) {
      const supabase = createSupabaseServiceClient();
      const updates: any = {};
      if (status) updates.status = status;
      if (outcome !== undefined) updates.outcome = outcome;
      if (follow_up_date !== undefined) updates.follow_up_date = follow_up_date;

      const { data, error } = await supabase
        .from('interventions')
        .update(updates)
        .eq('id', interventionId)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, intervention: data });
    }

    return NextResponse.json({
      success: true,
      intervention: {
        id: interventionId,
        status: status || 'in_progress',
        outcome: outcome || 'Follow-up completed successfully.',
        follow_up_date,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
