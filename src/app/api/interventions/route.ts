import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDemoInterventions, addDemoIntervention } from '@/lib/store/demo-interventions';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'faculty')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter') || 'all';
  const studentId = searchParams.get('student_id');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isLiveDb =
    supabaseUrl &&
    !supabaseUrl.includes('your-project') &&
    !supabaseUrl.includes('test.supabase');

  if (isLiveDb) {
    try {
      const supabase = createSupabaseServiceClient();
      const now = new Date().toISOString();

      let query = supabase
        .from('interventions')
        .select('*, students(full_name, student_id, department), faculty(full_name)', {
          count: 'exact',
        })
        .order('created_at', { ascending: false });

      if (filter === 'overdue')
        query = query.lt('follow_up_date', now).neq('status', 'completed');
      if (filter === 'active') query = query.in('status', ['pending', 'in_progress']);
      if (filter === 'completed') query = query.eq('status', 'completed');
      if (studentId) query = query.eq('student_id', studentId);
      if (session.role === 'faculty') query = query.eq('faculty_id', session.entityId);

      const { data, count, error } = await query.range(
        (page - 1) * limit,
        page * limit - 1
      );
      if (!error && data) {
        return NextResponse.json({
          interventions: data,
          total: count || 0,
          page,
          limit,
        });
      }
    } catch {
      // fallback
    }
  }

  // Demo store fallback
  let interventions = getDemoInterventions();
  const now = new Date().toISOString();

  if (filter === 'overdue') {
    interventions = interventions.filter(
      (i) => i.followUpDate && i.followUpDate < now && i.status !== 'completed'
    );
  } else if (filter === 'active') {
    interventions = interventions.filter((i) =>
      ['pending', 'in_progress'].includes(i.status)
    );
  } else if (filter === 'completed') {
    interventions = interventions.filter((i) => i.status === 'completed');
  } else if (filter === 'escalated') {
    interventions = interventions.filter((i) => i.status === 'escalated');
  }

  if (studentId) {
    interventions = interventions.filter((i) => i.studentId === studentId);
  }

  const total = interventions.length;
  const paginated = interventions.slice((page - 1) * limit, page * limit);

  // Summary for Intervention Center KPI cards
  const allInt = getDemoInterventions();
  const summary = {
    total: allInt.length,
    active: allInt.filter((i) => ['pending', 'in_progress'].includes(i.status)).length,
    completed: allInt.filter((i) => i.status === 'completed').length,
    overdue: allInt.filter(
      (i) => i.followUpDate && i.followUpDate < now && i.status !== 'completed'
    ).length,
    escalated: allInt.filter((i) => i.status === 'escalated').length,
  };

  return NextResponse.json({ interventions: paginated, total, page, limit, summary });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'faculty')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      student_id,
      student_name,
      faculty_id,
      faculty_name,
      type,
      description,
      priority,
      follow_up_date,
      risk_before,
      notes,
    } = body;

    if (!student_id || !type) {
      return NextResponse.json({ error: 'student_id and type are required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveDb =
      supabaseUrl &&
      !supabaseUrl.includes('your-project') &&
      !supabaseUrl.includes('test.supabase');

    if (isLiveDb) {
      try {
        const supabase = createSupabaseServiceClient();
        const { data, error } = await supabase
          .from('interventions')
          .insert({
            student_id,
            faculty_id: faculty_id || session.entityId,
            type,
            description,
            priority: priority || 'medium',
            status: 'pending',
            follow_up_date,
            risk_before,
            notes,
            created_by: session.userId,
          })
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ success: true, intervention: data });
        }
      } catch {
        // fallback
      }
    }

    // Demo store
    const newIntervention = addDemoIntervention({
      studentId: student_id,
      studentName: student_name || 'Student',
      facultyId: faculty_id || session.entityId,
      facultyName: faculty_name || session.name,
      type: type || 'academic',
      description: description || 'Follow-up intervention created by admin',
      priority: priority || 'medium',
      status: 'pending',
      riskBefore: risk_before,
      followUpDate: follow_up_date,
      notes,
    });

    return NextResponse.json({ success: true, intervention: newIntervention });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create intervention' }, { status: 500 });
  }
}
