import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

// Comprehensive demo student profile data for STU1024 (Priya Patel)
const DEMO_STUDENT_PROFILES: Record<string, any> = {
  's2222222-2222-2222-2222-222222222222': {
    id: 's2222222-2222-2222-2222-222222222222',
    student_id: 'STU1024',
    full_name: 'Priya Patel',
    email: 'student2@prismedu.com',
    mobile: '+91 9123456782',
    date_of_birth: '2004-08-22',
    gender: 'female',
    course: 'B.Tech in Computer Science',
    department: 'Computer Science and Engineering',
    academic_year: 2,
    admission_year: 2023,
    status: 'active',
    admission: {
      tenth_percentage: 72.5,
      twelfth_percentage: 68.0,
      previous_gpa: 6.20,
      previous_backlogs: 2,
      family_income: 180000,
      financial_assistance: 'required',
      guardian_name: 'Kamlesh Patel',
      guardian_relationship: 'Father',
      guardian_mobile: '+91 9811122234',
    },
    insight: {
      academic_level: 'attention_required',
      attendance_level: 'declining',
      financial_level: 'attention_required',
      career_level: 'good',
      support_level: 'good',
    },
    recent_changes: [
      'Attendance has decreased from 82% to 69%',
      'Assignment completion has declined over the last 3 weeks',
      'Quiz performance has decreased in DBMS Normalization',
      'Learning portal activity has reduced by 40%',
    ],
    trends: {
      academic: [
        { date: 'Aug', value: 78 },
        { date: 'Sep', value: 74 },
        { date: 'Oct', value: 68 },
        { date: 'Nov', value: 63 },
        { date: 'Dec', value: 62 },
      ],
      attendance: [
        { date: 'Week 1', value: 85 },
        { date: 'Week 2', value: 82 },
        { date: 'Week 3', value: 74 },
        { date: 'Week 4', value: 69 },
      ],
      learningActivity: [
        { date: 'Week 1', value: 80 },
        { date: 'Week 2', value: 72 },
        { date: 'Week 3', value: 60 },
        { date: 'Week 4', value: 52 },
      ],
      assignmentCompletion: [
        { date: 'Assign 1', value: 85 },
        { date: 'Assign 2', value: 70 },
        { date: 'Assign 3', value: 50 },
      ],
      quizPerformance: [
        { date: 'Quiz 1', value: 76 },
        { date: 'Quiz 2', value: 68 },
        { date: 'Quiz 3', value: 54 },
      ],
      engagement: [
        { date: 'W1', value: 82 },
        { date: 'W2', value: 75 },
        { date: 'W3', value: 64 },
        { date: 'W4', value: 55 },
      ],
    },
    interventions: [
      {
        id: 'iv111111-1111-1111-1111-111111111111',
        type: 'academic',
        description: 'Scheduled 1-on-1 tutoring on DBMS Normalization concepts. Provided practice worksheets.',
        status: 'in_progress',
        date: '2026-09-10',
        follow_up_date: '2026-09-20',
        outcome: 'Student attended first session, completed 2 practice problems with good progress.',
      },
      {
        id: 'iv222222-2222-2222-2222-222222222222',
        type: 'financial',
        description: 'Guided student to apply for Merit-cum-Means Scholarship. Verifying documents.',
        status: 'pending',
        date: '2026-09-12',
        follow_up_date: '2026-09-22',
        outcome: null,
      },
    ],
  },
};

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || (session.role !== 'faculty' && session.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const studentId = params.id;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isLiveDb = supabaseUrl && !supabaseUrl.includes('your-project') && !supabaseUrl.includes('test.supabase');

  if (isLiveDb) {
    try {
      const supabase = createSupabaseServiceClient();
      const { data: student, error } = await supabase
        .from('students')
        .select(`
          *,
          admission_profiles(*),
          courses(name),
          departments(name),
          student_insights(*),
          interventions(*)
        `)
        .or(`id.eq.${studentId},student_id.eq.${studentId}`)
        .single();

      if (!error && student) {
        const admission = Array.isArray(student.admission_profiles)
          ? student.admission_profiles[0]
          : student.admission_profiles || {};

        const formattedStudent = {
          ...student,
          admission,
          tenth_school_name: student.tenth_school_name || admission.tenth_school_name,
          tenth_board: student.tenth_board || admission.tenth_board,
          tenth_passing_year: student.tenth_passing_year || admission.tenth_passing_year,
          tenth_percentage: student.tenth_percentage || admission.tenth_percentage,
          twelfth_school_name: student.twelfth_school_name || admission.twelfth_school_name,
          twelfth_board: student.twelfth_board || admission.twelfth_board,
          twelfth_passing_year: student.twelfth_passing_year || admission.twelfth_passing_year,
          physics_marks: student.physics_marks || admission.physics_marks,
          chemistry_marks: student.chemistry_marks || admission.chemistry_marks,
          maths_marks: student.maths_marks || admission.maths_marks,
          twelfth_percentage: student.twelfth_percentage || admission.twelfth_percentage,
          jee_main_percentile: student.jee_main_percentile || admission.jee_main_percentile,
          jee_main_rank: student.jee_main_rank || admission.jee_main_rank,
          mht_cet_percentile: student.mht_cet_percentile || admission.mht_cet_percentile,
          mht_cet_rank: student.mht_cet_rank || admission.mht_cet_rank,
          category_rank: student.category_rank || admission.category_rank,
          cap_round_allotment: student.cap_round_allotment || admission.cap_round_allotment,
        };
        return NextResponse.json({ student: formattedStudent });
      }
    } catch {
      // Fall through to demo
    }
  }

  // Return demo profile (match by ID or student_id STU1024)
  if (DEMO_STUDENT_PROFILES[studentId]) {
    return NextResponse.json({ student: DEMO_STUDENT_PROFILES[studentId] });
  }

  const { getDemoStudents } = require('@/lib/store/demo-students');
  const demoList = getDemoStudents();
  const matched = demoList.find((s: any) => s.id === studentId || s.student_id === studentId);

  if (matched) {
    const dynamicProfile = {
      ...matched,
      id: matched.id,
      student_id: matched.student_id,
      full_name: matched.full_name,
      email: matched.email,
      mobile: matched.mobile || '+91 9876543210',
      date_of_birth: matched.date_of_birth || '2004-05-15',
      gender: matched.gender || 'female',
      course: matched.course || 'B.Tech in Computer Science',
      department: matched.department || 'Computer Science and Engineering',
      academic_year: matched.academic_year || 1,
      admission_year: matched.admission_year || 2024,
      status: matched.status || 'active',
      tenth_school_name: matched.tenth_school_name,
      tenth_board: matched.tenth_board,
      tenth_passing_year: matched.tenth_passing_year,
      tenth_percentage: matched.tenth_percentage,
      twelfth_school_name: matched.twelfth_school_name,
      twelfth_board: matched.twelfth_board,
      twelfth_passing_year: matched.twelfth_passing_year,
      physics_marks: matched.physics_marks,
      chemistry_marks: matched.chemistry_marks,
      maths_marks: matched.maths_marks,
      twelfth_percentage: matched.twelfth_percentage,
      jee_main_percentile: matched.jee_main_percentile,
      jee_main_rank: matched.jee_main_rank,
      mht_cet_percentile: matched.mht_cet_percentile,
      mht_cet_rank: matched.mht_cet_rank,
      category_rank: matched.category_rank,
      cap_round_allotment: matched.cap_round_allotment,
      admission: {
        tenth_school_name: matched.tenth_school_name,
        tenth_board: matched.tenth_board,
        tenth_passing_year: matched.tenth_passing_year,
        tenth_percentage: matched.tenth_percentage,
        twelfth_school_name: matched.twelfth_school_name,
        twelfth_board: matched.twelfth_board,
        twelfth_passing_year: matched.twelfth_passing_year,
        physics_marks: matched.physics_marks,
        chemistry_marks: matched.chemistry_marks,
        maths_marks: matched.maths_marks,
        twelfth_percentage: matched.twelfth_percentage,
        jee_main_percentile: matched.jee_main_percentile,
        jee_main_rank: matched.jee_main_rank,
        mht_cet_percentile: matched.mht_cet_percentile,
        mht_cet_rank: matched.mht_cet_rank,
        category_rank: matched.category_rank,
        cap_round_allotment: matched.cap_round_allotment,
        previous_gpa: matched.previous_gpa || 7.20,
        previous_backlogs: matched.previous_backlogs || 0,
        family_income: matched.family_income || 250000,
        financial_assistance: matched.financial_assistance || 'not_required',
        guardian_name: matched.guardian_name || 'Parent / Guardian',
        guardian_relationship: 'Father',
        guardian_mobile: matched.guardian_mobile || '+91 9876543210',
      },
      insight: matched.insight || {
        academic_level: 'good',
        attendance_level: 'good',
        financial_level: 'good',
        career_level: 'good',
        support_level: 'good',
      },
      recent_changes: matched.recent_changes || ['Student profile registered into cohort monitoring'],
      trends: matched.trends || {
        academic: [{ date: 'Aug', value: 75 }, { date: 'Sep', value: 78 }, { date: 'Oct', value: 80 }, { date: 'Nov', value: 82 }],
        attendance: [{ date: 'Week 1', value: 90 }, { date: 'Week 2', value: 88 }, { date: 'Week 3', value: 86 }, { date: 'Week 4', value: 88 }],
        learningActivity: [{ date: 'W1', value: 75 }, { date: 'W2', value: 80 }, { date: 'W3', value: 82 }, { date: 'W4', value: 85 }],
        assignmentCompletion: [{ date: 'A1', value: 90 }, { date: 'A2', value: 85 }],
        quizPerformance: [{ date: 'Q1', value: 80 }, { date: 'Q2', value: 84 }],
      },
      interventions: matched.interventions || [],
    };
    return NextResponse.json({ student: dynamicProfile });
  }

  const defaultProfile = DEMO_STUDENT_PROFILES['s2222222-2222-2222-2222-222222222222'];
  return NextResponse.json({ student: defaultProfile });
}
