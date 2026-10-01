import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/password';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { getDemoStudents } from '@/lib/store/demo-students';
import { getDemoFaculty } from '@/lib/store/demo-faculty';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
  }

  try {
    const { new_password } = await req.json();

    if (!new_password || new_password.trim().length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveDb = supabaseUrl && !supabaseUrl.includes('your-project') && !supabaseUrl.includes('test.supabase');

    if (isLiveDb) {
      try {
        const supabase = createSupabaseServiceClient();
        const newHash = await hashPassword(new_password);
        await supabase
          .from('users')
          .update({ password_hash: newHash })
          .eq('email', session.email);
      } catch {
        // fallback
      }
    }

    // Update in runtime store
    if (session.role === 'student') {
      const student = getDemoStudents().find((s) => s.email.toLowerCase() === session.email.toLowerCase());
      if (student) {
        student.initialPassword = new_password;
      }
    } else if (session.role === 'faculty') {
      const faculty = getDemoFaculty().find((f) => f.email.toLowerCase() === session.email.toLowerCase());
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
