import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDemoStudents, updateDemoStudent } from '@/lib/store/demo-students';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const students = getDemoStudents();
  const student = students.find((s) => s.id === id || s.student_id === id);

  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  return NextResponse.json({ student });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || (session.role !== 'faculty' && session.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized. Faculty or Admin privileges required.' }, { status: 403 });
  }

  try {
    const { id } = params;
    const body = await req.json();

    // Update in-memory store
    const updated = updateDemoStudent(id, body);

    // Update live database if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveDb = supabaseUrl && !supabaseUrl.includes('your-project') && !supabaseUrl.includes('test.supabase');
    if (isLiveDb) {
      try {
        const supabase = createSupabaseServiceClient();
        await supabase
          .from('students')
          .update({
            full_name: body.full_name,
            email: body.email,
            mobile: body.mobile,
            date_of_birth: body.date_of_birth,
            gender: body.gender,
            course_id: body.course_id,
            department_id: body.department_id,
            academic_year: body.academic_year,
          })
          .or(`id.eq.${id},student_id.eq.${id}`);

        await supabase
          .from('admission_profiles')
          .update({
            tenth_percentage: body.tenth_percentage,
            twelfth_percentage: body.twelfth_percentage,
            previous_gpa: body.previous_gpa,
            previous_backlogs: body.previous_backlogs,
            family_income: body.family_income,
            financial_assistance: body.financial_assistance,
            guardian_name: body.guardian_name,
            guardian_mobile: body.guardian_mobile,
          })
          .eq('student_id', id);
      } catch {
        // silent fail to store
      }
    }

    if (!updated) {
      return NextResponse.json({ error: 'Failed to find student to update' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Student record updated successfully',
      student: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: { params: { id: string } }) {
  return PUT(req, context);
}
