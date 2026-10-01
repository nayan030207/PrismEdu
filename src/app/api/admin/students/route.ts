import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { getDemoStudents, sortStudentsByRiskPriority } from '@/lib/store/demo-students';
import { matchesBranch } from '@/lib/utils/branch-resolver';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'faculty')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = (searchParams.get('search') || '').toLowerCase();
  const department = searchParams.get('department') || 'all';
  const status = searchParams.get('status') || 'all';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isLiveDb = supabaseUrl && !supabaseUrl.includes('your-project') && !supabaseUrl.includes('test.supabase');

  if (isLiveDb) {
    try {
      const supabase = createSupabaseServiceClient();
      let query = supabase.from('students').select('*, courses(name), departments(name), student_insights(*)');

      if (session.role === 'faculty') {
        query = query.eq('faculty_id', session.entityId);
      }

      const { data, error } = await query;
      if (!error && data) {
        let liveFiltered = sortStudentsByRiskPriority(data);
        if (department !== 'all') {
          liveFiltered = liveFiltered.filter((s) => matchesBranch(s, department));
        }
        return NextResponse.json({ students: liveFiltered });
      }
    } catch {
      // Fall through to demo
    }
  }

  let filtered = [...getDemoStudents()];

  if (search) {
    filtered = filtered.filter(
      (s) =>
        s.full_name.toLowerCase().includes(search) ||
        s.student_id.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search)
    );
  }

  if (department !== 'all') {
    filtered = filtered.filter((s) => matchesBranch(s, department));
  }

  if (status !== 'all') {
    filtered = filtered.filter((s) => s.status === status);
  }

  return NextResponse.json({ students: sortStudentsByRiskPriority(filtered) });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { studentId, status } = await req.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveDb = supabaseUrl && !supabaseUrl.includes('your-project') && !supabaseUrl.includes('test.supabase');

    if (isLiveDb) {
      const supabase = createSupabaseServiceClient();
      await supabase.from('students').update({ status }).eq('id', studentId);
    }

    return NextResponse.json({ success: true, studentId, status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
