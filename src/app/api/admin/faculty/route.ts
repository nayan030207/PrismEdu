import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { hashPassword } from '@/lib/auth/password';
import { getDemoFaculty, addDemoFaculty } from '@/lib/store/demo-faculty';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isLiveDb = supabaseUrl && !supabaseUrl.includes('your-project') && !supabaseUrl.includes('test.supabase');

  if (isLiveDb) {
    try {
      const supabase = createSupabaseServiceClient();
      const { data, error } = await supabase
        .from('faculty')
        .select('*, departments(name)');
      if (!error && data) {
        return NextResponse.json({ faculty: data });
      }
    } catch {
      // Fall through to demo
    }
  }

  return NextResponse.json({ faculty: getDemoFaculty() });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      full_name,
      email,
      employee_id,
      designation,
      specialization,
      department_id,
      mobile,
      date_of_birth,
      password: adminSetPassword,
    } = body;

    if (!full_name || !email) {
      return NextResponse.json({ error: 'Full name and email are required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveDb = supabaseUrl && !supabaseUrl.includes('your-project') && !supabaseUrl.includes('test.supabase');

    const { generateDefaultPassword } = require('@/lib/auth/password');

    // Use admin-provided password if given (and meets min length), otherwise auto-generate
    const initialPassword =
      adminSetPassword && adminSetPassword.trim().length >= 6
        ? adminSetPassword.trim()
        : generateDefaultPassword(email, date_of_birth || body.dob, full_name);

    // Register the password in the credential store immediately so it works on first login
    const credMap = (globalThis as any).__PRISM_AUTH_CREDENTIALS;
    const normEmail = email.toLowerCase().trim();
    if (credMap) {
      const existing = credMap.get(normEmail) || { email: normEmail };
      existing.customPassword = initialPassword;
      credMap.set(normEmail, existing);
    } else {
      // Initialize the map
      (globalThis as any).__PRISM_AUTH_CREDENTIALS = new Map<string, any>();
      (globalThis as any).__PRISM_AUTH_CREDENTIALS.set(normEmail, {
        email: normEmail,
        customPassword: initialPassword,
      });
    }

    if (isLiveDb) {
      try {
        const supabase = createSupabaseServiceClient();
        const passwordHash = await hashPassword(initialPassword);

        // Create user record
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            email: normEmail,
            password_hash: passwordHash,
            role: 'faculty',
            status: 'active',
          })
          .select('id')
          .single();

        if (userError) throw userError;

        // Create faculty record
        const { data: newFaculty, error: facError } = await supabase
          .from('faculty')
          .insert({
            user_id: newUser.id,
            employee_id: employee_id || `FAC-${Math.floor(100 + Math.random() * 900)}`,
            full_name,
            email: normEmail,
            mobile,
            department_id,
            designation,
            specialization,
            status: 'active',
          })
          .select()
          .single();

        if (facError) throw facError;

        addDemoFaculty({
          employee_id: newFaculty.employee_id,
          full_name,
          email: normEmail,
          mobile,
          designation,
          specialization,
          date_of_birth: date_of_birth || body.dob,
          initialPassword,
        });

        return NextResponse.json({ success: true, faculty: newFaculty, initialPassword });
      } catch {
        // Fall through to demo store addition
      }
    }

    // Demo store response
    const newFaculty = addDemoFaculty({
      employee_id,
      full_name,
      email: normEmail,
      mobile,
      designation,
      specialization,
      date_of_birth: date_of_birth || body.dob,
      initialPassword,
    });

    return NextResponse.json({ success: true, faculty: newFaculty, initialPassword });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create faculty' }, { status: 500 });
  }
}
