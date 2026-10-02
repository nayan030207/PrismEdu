import { createSupabaseServiceClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import { hashPassword } from '@/lib/auth/password';
import type { Student, AdmissionProfile, StudentImportRow } from '@/types';
import axios from 'axios';

export interface CreateStudentInput {
  student_id?: string;
  full_name: string;
  email: string;
  mobile?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  course_id?: string;
  department_id?: string;
  academic_year?: number;
  admission_year?: number;
  tenth_school_name?: string;
  tenth_board?: string;
  tenth_passing_year?: number;
  tenth_percentage?: number;
  twelfth_school_name?: string;
  twelfth_board?: string;
  twelfth_passing_year?: number;
  physics_marks?: number;
  chemistry_marks?: number;
  maths_marks?: number;
  twelfth_percentage?: number;
  jee_main_percentile?: number;
  jee_main_rank?: number;
  mht_cet_percentile?: number;
  mht_cet_rank?: number;
  category_rank?: number;
  cap_round_allotment?: string;
  previous_gpa?: number;
  previous_backlogs?: number;
  family_income?: number;
  financial_assistance?: 'required' | 'not_required' | 'under_review';
  guardian_name?: string;
  guardian_relationship?: string;
  guardian_mobile?: string;
  guardian_email?: string;
  guardian_occupation?: string;
  faculty_id?: string;
}

export async function syncUserToSupabaseAuth(email: string, password: string, fullName: string, role: string) {
  try {
    const supabaseAdmin = createSupabaseAdminClient();
    const cleanEmail = email.toLowerCase().trim();

    // 1. Attempt creating account directly in Supabase Auth Platform (auth.users)
    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: role,
      },
    });

    if (created?.user) {
      return created.user;
    }

    // 2. If user already exists in Supabase Auth, update their password & metadata directly
    if (createError) {
      const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (!listError && usersData?.users) {
        const existingUser = (usersData.users as Array<{ id: string; email?: string }>).find(
          (u) => u.email?.toLowerCase().trim() === cleanEmail
        );

        if (existingUser) {
          const { data: updated } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
            password: password,
            user_metadata: {
              full_name: fullName,
              role: role,
            },
          });
          return updated?.user;
        }
      }
    }
  } catch (err) {
    console.error('Supabase Auth sync notice:', err);
  }
  return null;
}

export class StudentService {
  private mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';

  /**
   * Method 1: Manual Student Entry (Section 4 & 5)
   */
  async registerStudentManually(input: CreateStudentInput) {
    const supabase = createSupabaseServiceClient();
    const { generateDefaultPassword } = await import('@/lib/auth/password');

    // 1. Generate unique student ID if not provided
    const studentId = input.student_id || `STU${Math.floor(1000 + Math.random() * 9000)}`;

    // 2. Default password for new student accounts in format Name@dob (e.g. Aarav@1505)
    const initialPassword = generateDefaultPassword(input.email, input.date_of_birth, input.full_name);
    const passwordHash = await hashPassword(initialPassword);

    // 3a. Directly register/sync account in Supabase Auth Platform (auth.users)
    await syncUserToSupabaseAuth(input.email, initialPassword, input.full_name, 'student');

    // 3b. Create or update database user account in public.users
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .upsert(
        {
          email: input.email.toLowerCase().trim(),
          password_hash: passwordHash,
          role: 'student',
          status: 'active',
        },
        { onConflict: 'email' }
      )
      .select('id')
      .single();

    if (userError || !newUser) {
      throw new Error(`Failed to create student user account: ${userError?.message || 'Unknown error'}`);
    }

    // 4. Create student profile linked to faculty & user
    const { data: newStudent, error: studentError } = await supabase
      .from('students')
      .insert({
        user_id: newUser.id,
        student_id: studentId,
        full_name: input.full_name,
        email: input.email.toLowerCase().trim(),
        mobile: input.mobile,
        date_of_birth: input.date_of_birth,
        gender: input.gender,
        course_id: input.course_id,
        department_id: input.department_id,
        academic_year: input.academic_year || 1,
        admission_year: input.admission_year || new Date().getFullYear(),
        faculty_id: input.faculty_id,
        status: 'active',
        current_outcome: 'enrolled',
      })
      .select('id, student_id, full_name, email')
      .single();

    if (studentError || !newStudent) {
      throw new Error(`Failed to create student profile: ${studentError?.message || 'Unknown error'}`);
    }

    // 5. Create admission profile
    await supabase.from('admission_profiles').insert({
      student_id: newStudent.id,
      tenth_school_name: input.tenth_school_name,
      tenth_board: input.tenth_board,
      tenth_passing_year: input.tenth_passing_year,
      tenth_percentage: input.tenth_percentage,
      twelfth_school_name: input.twelfth_school_name,
      twelfth_board: input.twelfth_board,
      twelfth_passing_year: input.twelfth_passing_year,
      physics_marks: input.physics_marks,
      chemistry_marks: input.chemistry_marks,
      maths_marks: input.maths_marks,
      twelfth_percentage: input.twelfth_percentage,
      jee_main_percentile: input.jee_main_percentile,
      jee_main_rank: input.jee_main_rank,
      mht_cet_percentile: input.mht_cet_percentile,
      mht_cet_rank: input.mht_cet_rank,
      category_rank: input.category_rank,
      cap_round_allotment: input.cap_round_allotment,
      previous_gpa: input.previous_gpa,
      previous_backlogs: input.previous_backlogs || 0,
      family_income: input.family_income,
      financial_assistance: input.financial_assistance || 'not_required',
      guardian_name: input.guardian_name,
      guardian_relationship: input.guardian_relationship,
      guardian_mobile: input.guardian_mobile,
      guardian_email: input.guardian_email,
      guardian_occupation: input.guardian_occupation,
    });

    // 6. Trigger initial predictive assessment & initial insights
    await this.triggerInitialPredictiveAssessment(newStudent.id, {
      tenth_percentage: input.tenth_percentage,
      twelfth_percentage: input.twelfth_percentage,
      previous_gpa: input.previous_gpa,
      previous_backlogs: input.previous_backlogs,
      family_income: input.family_income,
      financial_assistance: input.financial_assistance,
    });

    return {
      success: true,
      student: newStudent,
      initialPassword,
    };
  }

  /**
   * Method 2: Batch Excel/CSV Import Confirmation (Supports Admin, Faculty, & Student roles)
   */
  async importValidatedStudents(rows: StudentImportRow[], facultyId: string) {
    const created: any[] = [];
    const errors: { student_id: string; error: string }[] = [];
    const { addDemoStudent } = await import('@/lib/store/demo-students');
    const { addDemoFaculty } = await import('@/lib/store/demo-faculty');
    const { registerUserAuthCredential } = await import('@/lib/store/auth-credentials');

    for (const row of rows) {
      try {
        // Register user in Auth Platform with User ID = email and Password = Name@dob
        const initialPass = registerUserAuthCredential(row.email, row.date_of_birth, row.full_name);

        // Sync directly to Supabase Auth Platform (auth.users)
        await syncUserToSupabaseAuth(row.email, initialPass, row.full_name, row.role || 'student');

        if (row.role === 'faculty' || row.role === 'admin') {
          const facultyEntry = addDemoFaculty({
            employee_id: row.employee_id || row.student_id,
            full_name: row.full_name,
            email: row.email,
            mobile: row.mobile,
            date_of_birth: row.date_of_birth ? String(row.date_of_birth) : undefined,
            initialPassword: initialPass,
            designation: row.designation || (row.role === 'admin' ? 'System Administrator' : 'Assistant Professor'),
            specialization: row.specialization || 'Academic Management',
          });
          created.push({
            student_id: facultyEntry.employee_id,
            full_name: facultyEntry.full_name,
            email: facultyEntry.email,
            role: row.role,
            tempPassword: facultyEntry.initialPassword,
          });
        } else {
          // Attempt database registration
          try {
            const res = await this.registerStudentManually({
              student_id: row.student_id,
              full_name: row.full_name,
              email: row.email,
              mobile: row.mobile,
              date_of_birth: row.date_of_birth ? String(row.date_of_birth) : undefined,
              gender: row.gender as any,
              academic_year: row.academic_year,
              admission_year: row.admission_year,
              tenth_school_name: row.tenth_school_name,
              tenth_board: row.tenth_board,
              tenth_passing_year: row.tenth_passing_year,
              tenth_percentage: row.tenth_percentage,
              twelfth_school_name: row.twelfth_school_name,
              twelfth_board: row.twelfth_board,
              twelfth_passing_year: row.twelfth_passing_year,
              physics_marks: row.physics_marks,
              chemistry_marks: row.chemistry_marks,
              maths_marks: row.maths_marks,
              twelfth_percentage: row.twelfth_percentage,
              jee_main_percentile: row.jee_main_percentile,
              jee_main_rank: row.jee_main_rank,
              mht_cet_percentile: row.mht_cet_percentile,
              mht_cet_rank: row.mht_cet_rank,
              category_rank: row.category_rank,
              cap_round_allotment: row.cap_round_allotment,
              previous_gpa: row.previous_gpa,
              previous_backlogs: row.previous_backlogs,
              family_income: row.family_income,
              financial_assistance: row.financial_assistance as any,
              guardian_name: row.guardian_name,
              guardian_mobile: row.guardian_mobile,
              faculty_id: facultyId,
            });

            const { resolveBranchCourseDepartment } = await import('@/lib/utils/branch-resolver');
            const branchInfo = resolveBranchCourseDepartment(row.course_code, row.department_code);

            const demoStudent = addDemoStudent({
              student_id: row.student_id,
              full_name: row.full_name,
              email: row.email,
              mobile: row.mobile,
              date_of_birth: row.date_of_birth ? String(row.date_of_birth) : undefined,
              gender: row.gender,
              course: branchInfo.course,
              department: branchInfo.department,
              academic_year: row.academic_year,
              tenth_school_name: row.tenth_school_name,
              tenth_board: row.tenth_board,
              tenth_passing_year: row.tenth_passing_year,
              tenth_percentage: row.tenth_percentage,
              twelfth_school_name: row.twelfth_school_name,
              twelfth_board: row.twelfth_board,
              twelfth_passing_year: row.twelfth_passing_year,
              physics_marks: row.physics_marks,
              chemistry_marks: row.chemistry_marks,
              maths_marks: row.maths_marks,
              twelfth_percentage: row.twelfth_percentage,
              jee_main_percentile: row.jee_main_percentile,
              jee_main_rank: row.jee_main_rank,
              mht_cet_percentile: row.mht_cet_percentile,
              mht_cet_rank: row.mht_cet_rank,
              category_rank: row.category_rank,
              cap_round_allotment: row.cap_round_allotment,
              family_income: row.family_income,
              financial_assistance: row.financial_assistance,
              guardian_name: row.guardian_name,
              guardian_mobile: row.guardian_mobile,
            });

            created.push({
              student_id: demoStudent.student_id,
              full_name: demoStudent.full_name,
              email: demoStudent.email,
              role: 'student',
              tempPassword: demoStudent.initialPassword,
            });
          } catch {
            const { resolveBranchCourseDepartment } = await import('@/lib/utils/branch-resolver');
            const branchInfo = resolveBranchCourseDepartment(row.course_code, row.department_code);

            const demoStudent = addDemoStudent({
              student_id: row.student_id,
              full_name: row.full_name,
              email: row.email,
              mobile: row.mobile,
              date_of_birth: row.date_of_birth ? String(row.date_of_birth) : undefined,
              gender: row.gender,
              course: branchInfo.course,
              department: branchInfo.department,
              academic_year: row.academic_year,
              tenth_school_name: row.tenth_school_name,
              tenth_board: row.tenth_board,
              tenth_passing_year: row.tenth_passing_year,
              tenth_percentage: row.tenth_percentage,
              twelfth_school_name: row.twelfth_school_name,
              twelfth_board: row.twelfth_board,
              twelfth_passing_year: row.twelfth_passing_year,
              physics_marks: row.physics_marks,
              chemistry_marks: row.chemistry_marks,
              maths_marks: row.maths_marks,
              twelfth_percentage: row.twelfth_percentage,
              jee_main_percentile: row.jee_main_percentile,
              jee_main_rank: row.jee_main_rank,
              mht_cet_percentile: row.mht_cet_percentile,
              mht_cet_rank: row.mht_cet_rank,
              category_rank: row.category_rank,
              cap_round_allotment: row.cap_round_allotment,
              family_income: row.family_income,
              financial_assistance: row.financial_assistance,
              guardian_name: row.guardian_name,
              guardian_mobile: row.guardian_mobile,
            });

            created.push({
              student_id: demoStudent.student_id,
              full_name: demoStudent.full_name,
              email: demoStudent.email,
              role: 'student',
              tempPassword: demoStudent.initialPassword,
            });
          }
        }
      } catch (err: any) {
        errors.push({
          student_id: row.student_id || row.employee_id || 'UNKNOWN',
          error: err.message || 'Import error',
        });
      }
    }

    return {
      total: rows.length,
      createdCount: created.length,
      failedCount: errors.length,
      createdStudents: created,
      errors,
    };
  }

  /**
   * Run initial background predictive assessment using admission variables (Section 6)
   */
  async triggerInitialPredictiveAssessment(studentId: string, admissionData: Record<string, any>) {
    try {
      const response = await axios.post(`${this.mlServiceUrl}/predict`, {
        student_id: studentId,
        admission_data: admissionData,
      }, { timeout: 3000 });

      if (response.data && response.data.success) {
        const supabase = createSupabaseServiceClient();
        await supabase.from('predictions').insert({
          student_id: studentId,
          risk_score: response.data.risk_score,
          risk_level: response.data.risk_level,
          features_used: response.data.features || {},
        });

        // Initialize baseline faculty-facing insight levels
        const gpa = Number(admissionData.previous_gpa || 7.0);
        const backlogs = Number(admissionData.previous_backlogs || 0);
        const finAssist = admissionData.financial_assistance === 'required';

        await supabase.from('student_insights').upsert({
          student_id: studentId,
          academic_level: (gpa < 6.0 || backlogs > 1) ? 'attention_required' : 'good',
          attendance_level: 'good',
          financial_level: finAssist ? 'attention_required' : 'good',
          career_level: 'good',
          support_level: 'good',
          academic_trend: [],
          attendance_trend: [],
          engagement_trend: [],
          recent_changes: ['Initial baseline profile registered into institutional monitoring'],
          last_updated: new Date().toISOString(),
        }, { onConflict: 'student_id' });
      }
    } catch {
      // Fallback: graceful local initialization if ML service is offline
      const supabase = createSupabaseServiceClient();
      await supabase.from('student_insights').upsert({
        student_id: studentId,
        academic_level: 'good',
        attendance_level: 'good',
        financial_level: admissionData.financial_assistance === 'required' ? 'attention_required' : 'good',
        career_level: 'good',
        support_level: 'good',
        recent_changes: ['Profile registered into monitoring system'],
        last_updated: new Date().toISOString(),
      }, { onConflict: 'student_id' });
    }
  }
}

export const studentService = new StudentService();
