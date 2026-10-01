import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDemoStudents } from '@/lib/store/demo-students';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || (session.role !== 'faculty' && session.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = params;

  // Try live Supabase first
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isLiveDb =
    supabaseUrl &&
    !supabaseUrl.includes('your-project') &&
    !supabaseUrl.includes('test.supabase');

  if (isLiveDb) {
    try {
      const supabase = createSupabaseServiceClient();
      const { data, error } = await supabase
        .from('students')
        .select(
          '*, courses(name), departments(name), student_insights(*), admission_profiles(*), interventions(*)'
        )
        .or(`id.eq.${id},student_id.eq.${id}`)
        .single();

      if (!error && data) {
        // Flatten admission_profiles into the student object for easy access
        const admission = Array.isArray(data.admission_profiles)
          ? data.admission_profiles[0]
          : data.admission_profiles;

        const merged = {
          ...data,
          tenth_school_name: data.tenth_school_name || admission?.tenth_school_name,
          tenth_board: data.tenth_board || admission?.tenth_board,
          tenth_passing_year: data.tenth_passing_year || admission?.tenth_passing_year,
          tenth_percentage: data.tenth_percentage || admission?.tenth_percentage,
          twelfth_school_name: data.twelfth_school_name || admission?.twelfth_school_name,
          twelfth_board: data.twelfth_board || admission?.twelfth_board,
          twelfth_passing_year: data.twelfth_passing_year || admission?.twelfth_passing_year,
          twelfth_percentage: data.twelfth_percentage || admission?.twelfth_percentage,
          physics_marks: data.physics_marks || admission?.physics_marks,
          chemistry_marks: data.chemistry_marks || admission?.chemistry_marks,
          maths_marks: data.maths_marks || admission?.maths_marks,
          jee_main_percentile: data.jee_main_percentile || admission?.jee_main_percentile,
          jee_main_rank: data.jee_main_rank || admission?.jee_main_rank,
          mht_cet_percentile: data.mht_cet_percentile || admission?.mht_cet_percentile,
          mht_cet_rank: data.mht_cet_rank || admission?.mht_cet_rank,
          category_rank: data.category_rank || admission?.category_rank,
          cap_round_allotment: data.cap_round_allotment || admission?.cap_round_allotment,
          family_income: data.family_income || admission?.family_income,
          financial_assistance: data.financial_assistance || admission?.financial_assistance,
          guardian_name: data.guardian_name || admission?.guardian_name,
          guardian_mobile: data.guardian_mobile || admission?.guardian_mobile,
          previous_gpa: data.previous_gpa || admission?.previous_gpa,
          previous_backlogs: data.previous_backlogs || admission?.previous_backlogs,
        };
        return NextResponse.json({ student: merged });
      }
    } catch {
      // Fall through to demo store
    }
  }

  // Demo store fallback — find by id or student_id
  const students = getDemoStudents();
  const student = students.find((s) => s.id === id || s.student_id === id);

  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  // Normalize insight field names: both `academic` and `academic_level` should work
  const normalizedStudent = {
    ...student,
    insight: {
      ...student.insight,
      academic_level: student.insight?.academic,
      attendance_level: student.insight?.attendance,
      financial_level: student.insight?.financial,
      career_level: student.insight?.career,
    },
  };

  return NextResponse.json({ student: normalizedStudent });
}
