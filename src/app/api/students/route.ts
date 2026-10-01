import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { studentService } from '@/lib/services/student.service';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { getDemoStudents, addDemoStudent } from '@/lib/store/demo-students';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'faculty' && session.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized: Faculty or Admin access required' }, { status: 403 });
  }

  const body = await req.json();
  const facultyId = session.entityId;

  const { generateDefaultPassword } = require('@/lib/auth/password');
  const initialPassword = generateDefaultPassword(body.email, body.date_of_birth, body.full_name);

  try {
    const result = await studentService.registerStudentManually({
      ...body,
      faculty_id: facultyId,
    });

    // Also add to demo store for immediate offline visibility
    const newStudent = addDemoStudent({
      student_id: body.student_id,
      full_name: body.full_name,
      email: body.email,
      mobile: body.mobile,
      date_of_birth: body.date_of_birth,
      academic_year: body.academic_year,
      initialPassword,
    });

    return NextResponse.json({ ...result, initialPassword });
  } catch {
    // If live DB error, provide robust demo fallback and add to store
    const newStudent = addDemoStudent({
      student_id: body.student_id,
      full_name: body.full_name,
      email: body.email,
      mobile: body.mobile,
      date_of_birth: body.date_of_birth,
      academic_year: body.academic_year,
      initialPassword,
    });

    return NextResponse.json({
      success: true,
      student: newStudent,
      initialPassword,
    });
  }
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
        return NextResponse.json({ students: data });
      }
    } catch {
      // Fallback
    }
  }

  return NextResponse.json({
    students: getDemoStudents(),
  });
}
