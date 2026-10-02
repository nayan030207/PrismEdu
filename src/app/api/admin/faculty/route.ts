import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { hashPassword } from '@/lib/auth/password';
import { getDemoFaculty, addDemoFaculty } from '@/lib/store/demo-faculty';
import { registerUserAuthCredential } from '@/lib/store/auth-credentials';

// ─── GET /api/admin/faculty ────────────────────────────────────────────────────
export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'all';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isLiveDb =
    supabaseUrl &&
    !supabaseUrl.includes('your-project') &&
    !supabaseUrl.includes('test.supabase');

  if (isLiveDb) {
    try {
      const supabase = createSupabaseServiceClient();
      let query = supabase.from('faculty').select('*, departments(name)').order('created_at', { ascending: false });
      if (search) query = query.ilike('full_name', `%${search}%`);
      if (status !== 'all') query = query.eq('status', status);
      const { data, error } = await query;
      if (!error && data) {
        return NextResponse.json({ faculty: data });
      }
    } catch {
      // fall through to demo
    }
  }

  let list = getDemoFaculty();
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (f) =>
        f.full_name.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        (f.employee_id || '').toLowerCase().includes(q)
    );
  }
  if (status !== 'all') list = list.filter((f) => f.status === status);

  return NextResponse.json({ faculty: list });
}

// ─── POST /api/admin/faculty ───────────────────────────────────────────────────
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
      department,
      mobile,
      date_of_birth,
      password: adminSetPassword,
    } = body;

    if (!full_name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Full name and email are required.' }, { status: 400 });
    }

    const normEmail = email.toLowerCase().trim();

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Check for duplicate email in demo store
    const existing = getDemoFaculty().find((f) => f.email === normEmail);
    if (existing) {
      return NextResponse.json({ error: `A faculty account already exists for ${normEmail}.` }, { status: 409 });
    }

    const { generateDefaultPassword } = require('@/lib/auth/password');

    // Use admin-provided password if given (≥6 chars), otherwise auto-generate
    const initialPassword =
      adminSetPassword && adminSetPassword.trim().length >= 6
        ? adminSetPassword.trim()
        : generateDefaultPassword(normEmail, date_of_birth, full_name);

    // Register credentials using the official credential helper
    // This ensures login works immediately after creation
    registerUserAuthCredential(normEmail, date_of_birth, full_name);
    // Override with the actual password chosen (admin-set or auto-generated)
    const credMap: Map<string, any> | undefined = (globalThis as any).__PRISM_AUTH_CREDENTIALS;
    if (credMap) {
      const cred = credMap.get(normEmail) || { email: normEmail };
      cred.customPassword = initialPassword;
      credMap.set(normEmail, cred);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveDb =
      supabaseUrl &&
      !supabaseUrl.includes('your-project') &&
      !supabaseUrl.includes('test.supabase');

    if (isLiveDb) {
      try {
        const supabase = createSupabaseServiceClient();
        const passwordHash = await hashPassword(initialPassword);

        // Duplicate check in live DB
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', normEmail)
          .maybeSingle();
        if (existingUser) {
          return NextResponse.json(
            { error: `A user account already exists for ${normEmail}.` },
            { status: 409 }
          );
        }

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

        if (userError) throw new Error(userError.message);

        const { data: newFaculty, error: facError } = await supabase
          .from('faculty')
          .insert({
            user_id: newUser.id,
            employee_id: employee_id || `FAC-${Math.floor(100 + Math.random() * 900)}`,
            full_name: full_name.trim(),
            email: normEmail,
            mobile: mobile?.trim() || null,
            department_id: null, // department resolution handled separately if needed
            designation: designation || 'Assistant Professor',
            specialization: specialization?.trim() || null,
            status: 'active',
          })
          .select()
          .single();

        if (facError) throw new Error(facError.message);

        // Mirror to demo store for same-session display
        addDemoFaculty({
          id: newFaculty.id,
          employee_id: newFaculty.employee_id,
          full_name: full_name.trim(),
          email: normEmail,
          mobile: mobile?.trim(),
          designation,
          specialization: specialization?.trim(),
          department: department || 'Computer Science and Engineering',
          date_of_birth,
          initialPassword,
        });

        return NextResponse.json({ success: true, faculty: newFaculty, initialPassword });
      } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Failed to create faculty in database.' }, { status: 500 });
      }
    }

    // Demo store creation
    const newFaculty = addDemoFaculty({
      employee_id: employee_id?.trim() || undefined,
      full_name: full_name.trim(),
      email: normEmail,
      mobile: mobile?.trim(),
      designation: designation || 'Assistant Professor',
      specialization: specialization?.trim(),
      department: department || 'Computer Science and Engineering',
      date_of_birth,
      initialPassword,
    });

    return NextResponse.json({ success: true, faculty: newFaculty, initialPassword });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

// ─── PATCH /api/admin/faculty ─────────────────────────────────────────────────
export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, status, designation, specialization, department, mobile } = body;

    if (!id) {
      return NextResponse.json({ error: 'Faculty ID is required.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveDb =
      supabaseUrl &&
      !supabaseUrl.includes('your-project') &&
      !supabaseUrl.includes('test.supabase');

    if (isLiveDb) {
      try {
        const supabase = createSupabaseServiceClient();
        const updates: any = {};
        if (status !== undefined) updates.status = status;
        if (designation !== undefined) updates.designation = designation;
        if (specialization !== undefined) updates.specialization = specialization;
        if (mobile !== undefined) updates.mobile = mobile;

        const { data, error } = await supabase
          .from('faculty')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true, faculty: data });
      } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
      }
    }

    // Demo store update
    const list = getDemoFaculty();
    const idx = list.findIndex((f) => f.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Faculty not found.' }, { status: 404 });
    }
    if (status !== undefined) list[idx].status = status;
    if (designation !== undefined) list[idx].designation = designation;
    if (specialization !== undefined) list[idx].specialization = specialization;
    if (department !== undefined) list[idx].department = department;
    if (mobile !== undefined) list[idx].mobile = mobile;

    return NextResponse.json({ success: true, faculty: list[idx] });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update faculty.' },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/admin/faculty ────────────────────────────────────────────────
export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Faculty ID required.' }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveDb =
      supabaseUrl &&
      !supabaseUrl.includes('your-project') &&
      !supabaseUrl.includes('test.supabase');

    if (isLiveDb) {
      try {
        const supabase = createSupabaseServiceClient();
        const { error } = await supabase.from('faculty').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true });
      } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
      }
    }

    // Demo store delete
    const list = getDemoFaculty();
    const idx = list.findIndex((f) => f.id === id);
    if (idx !== -1) list.splice(idx, 1);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete.' }, { status: 500 });
  }
}
