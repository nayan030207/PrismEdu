import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import type { InterventionType } from '@/lib/types';

// In-memory demo store for interventions created during test session
let DEMO_INTERVENTIONS = [
  {
    id: 'iv111111-1111-1111-1111-111111111111',
    student_id: 's2222222-2222-2222-2222-222222222222',
    student_name: 'Priya Patel',
    student_code: 'STU1024',
    faculty_id: 'f1111111-1111-1111-1111-111111111111',
    type: 'academic' as InterventionType,
    description: 'Scheduled 1-on-1 tutoring on DBMS Normalization concepts. Provided practice worksheets.',
    status: 'in_progress',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    follow_up_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    outcome: 'Student attended first session, completed 2 practice problems with good progress.',
  },
  {
    id: 'iv222222-2222-2222-2222-222222222222',
    student_id: 's2222222-2222-2222-2222-222222222222',
    student_name: 'Priya Patel',
    student_code: 'STU1024',
    faculty_id: 'f1111111-1111-1111-1111-111111111111',
    type: 'financial' as InterventionType,
    description: 'Guided student to apply for Merit-cum-Means Scholarship. Verifying documents.',
    status: 'pending',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    follow_up_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    outcome: null,
  },
];

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('student_id');
  const status = searchParams.get('status');
  const type = searchParams.get('type');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isLiveDb = supabaseUrl && !supabaseUrl.includes('your-project') && !supabaseUrl.includes('test.supabase');

  if (isLiveDb) {
    try {
      const supabase = createSupabaseServiceClient();
      let query = supabase.from('interventions').select('*, students(full_name, student_id), faculty(full_name)');

      if (session.role === 'faculty') {
        query = query.eq('faculty_id', session.entityId);
      } else if (session.role === 'student') {
        query = query.eq('student_id', session.entityId);
      }

      if (studentId) query = query.eq('student_id', studentId);
      if (status && status !== 'all') query = query.eq('status', status);
      if (type && type !== 'all') query = query.eq('type', type);

      const { data, error } = await query;
      if (!error && data) {
        return NextResponse.json({ interventions: data });
      }
    } catch {
      // Fallback
    }
  }

  let list = [...DEMO_INTERVENTIONS];
  if (studentId) list = list.filter((i) => i.student_id === studentId);
  if (status && status !== 'all') list = list.filter((i) => i.status === status);
  if (type && type !== 'all') list = list.filter((i) => i.type === type);

  return NextResponse.json({ interventions: list });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'faculty' && session.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized: Faculty access required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { student_id, type, description, follow_up_date } = body;

    if (!student_id || !type || !description) {
      return NextResponse.json(
        { error: 'Student ID, intervention type, and description are required' },
        { status: 400 }
      );
    }

    const validTypes = ['academic', 'attendance_engagement', 'financial', 'personal_support', 'career'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid intervention type' }, { status: 400 });
    }

    const facultyId = session.entityId;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveDb = supabaseUrl && !supabaseUrl.includes('your-project') && !supabaseUrl.includes('test.supabase');

    if (isLiveDb) {
      const supabase = createSupabaseServiceClient();
      const { data, error } = await supabase
        .from('interventions')
        .insert({
          student_id,
          faculty_id: facultyId,
          type,
          description,
          status: 'pending',
          follow_up_date: follow_up_date || null,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, intervention: data });
    }

    // Demo store creation
    const newIntervention = {
      id: `iv-${Date.now()}`,
      student_id,
      student_name: 'Priya Patel',
      student_code: 'STU1024',
      faculty_id: facultyId,
      type: type as InterventionType,
      description,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
      follow_up_date: follow_up_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      outcome: null,
    };

    DEMO_INTERVENTIONS.unshift(newIntervention);
    return NextResponse.json({ success: true, intervention: newIntervention });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create intervention' },
      { status: 500 }
    );
  }
}
