import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/password';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { getDemoStudents } from '@/lib/store/demo-students';
import { getDemoFaculty } from '@/lib/store/demo-faculty';
import { checkUserPassword } from '@/lib/store/auth-credentials';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
  }

  try {
    const { old_password, new_password } = await req.json();

    // Require old password for faculty and student accounts
    if (session.role === 'faculty' || session.role === 'student') {
      if (!old_password || old_password.trim().length === 0) {
        return NextResponse.json(
          { error: 'Current password is required to change your password' },
          { status: 400 }
        );
      }

      // Find the user record to verify old password
      let dob: string | undefined;
      let fullName: string | undefined;

      if (session.role === 'student') {
        const student = getDemoStudents().find(
          (s) => s.email.toLowerCase() === session.email.toLowerCase()
        );
        dob = student?.date_of_birth;
        fullName = student?.full_name;
      } else if (session.role === 'faculty') {
        const faculty = getDemoFaculty().find(
          (f) => f.email.toLowerCase() === session.email.toLowerCase()
        );
        dob = faculty?.date_of_birth;
        fullName = faculty?.full_name;
      }

      // Also check live DB password if configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const isLiveDb =
        supabaseUrl &&
        !supabaseUrl.includes('your-project') &&
        !supabaseUrl.includes('test.supabase');

      let oldPasswordValid = false;

      if (isLiveDb) {
        try {
          const { verifyPassword } = require('@/lib/auth/password');
          const supabase = createSupabaseServiceClient();
          const { data: userRecord } = await supabase
            .from('users')
            .select('password_hash')
            .eq('email', session.email.toLowerCase())
            .single();

          if (userRecord?.password_hash) {
            oldPasswordValid = await verifyPassword(old_password, userRecord.password_hash);
          }
        } catch {
          // Fall through to credential store check
        }
      }

      // Check against the credential store (demo/runtime passwords)
      if (!oldPasswordValid) {
        oldPasswordValid = checkUserPassword(session.email, old_password, dob, fullName);
      }

      if (!oldPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect. Please try again.' },
          { status: 401 }
        );
      }
    }

    if (!new_password || new_password.trim().length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveDb =
      supabaseUrl &&
      !supabaseUrl.includes('your-project') &&
      !supabaseUrl.includes('test.supabase');

    if (isLiveDb) {
      try {
        const supabase = createSupabaseServiceClient();
        const newHash = await hashPassword(new_password);
        await supabase
          .from('users')
          .update({ password_hash: newHash })
          .eq('email', session.email);
      } catch {
        // fallback to demo store
      }
    }

    // Update in credential store (runtime)
    const { registerUserAuthCredential } = require('@/lib/store/auth-credentials');
    const credMap = (globalThis as any).__PRISM_AUTH_CREDENTIALS;
    const normEmail = session.email.toLowerCase().trim();
    if (credMap) {
      const existing = credMap.get(normEmail) || { email: normEmail };
      existing.customPassword = new_password;
      credMap.set(normEmail, existing);
    } else {
      registerUserAuthCredential(normEmail);
      const m = (globalThis as any).__PRISM_AUTH_CREDENTIALS;
      if (m) {
        const c = m.get(normEmail) || { email: normEmail };
        c.customPassword = new_password;
        m.set(normEmail, c);
      }
    }

    // Also update the demo store record
    if (session.role === 'student') {
      const student = getDemoStudents().find(
        (s) => s.email.toLowerCase() === session.email.toLowerCase()
      );
      if (student) {
        student.initialPassword = new_password;
      }
    } else if (session.role === 'faculty') {
      const faculty = getDemoFaculty().find(
        (f) => f.email.toLowerCase() === session.email.toLowerCase()
      );
      if (faculty) {
        faculty.initialPassword = new_password;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully. You can now log in using your new password.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update password' },
      { status: 500 }
    );
  }
}
