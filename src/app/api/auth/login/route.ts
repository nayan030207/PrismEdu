import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyPassword } from '@/lib/auth/password';
import { createSessionToken } from '@/lib/auth/session';
import { createSupabaseServiceClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import type { SessionUser, UserRole } from '@/lib/types';

const LoginSchema = z.object({
  email: z.string().min(1, 'Email or Student ID is required'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['admin', 'faculty', 'student']).optional(),
});

// Built-in administrative & faculty evaluation accounts
const DEMO_USERS: Record<string, { role: UserRole; name: string; entityId: string; pass: string[] }> = {
  'admin@prismedu.com': {
    role: 'admin',
    name: 'Institutional Administrator',
    entityId: 'a0000000-0000-0000-0000-000000000001',
    pass: ['admin123', 'password123', 'password@123', 'passward@123'],
  },
  'faculty@prismedu.com': {
    role: 'faculty',
    name: 'Prof. Sandeep Kulkarni',
    entityId: 'f1111111-1111-1111-1111-111111111110',
    pass: ['faculty123', 'password123', 'password@123', 'passward@123'],
  },
  'sandeep.kulkarni@prismedu.com': {
    role: 'faculty',
    name: 'Prof. Sandeep Kulkarni',
    entityId: 'f1111111-1111-1111-1111-111111111110',
    pass: ['faculty123', 'password123', 'password@123', 'passward@123'],
  },
  'faculty1@prismedu.com': {
    role: 'faculty',
    name: 'Prof. Sandeep Kulkarni',
    entityId: 'f1111111-1111-1111-1111-111111111111',
    pass: ['faculty123', 'password123', 'password@123', 'passward@123'],
  },
  'faculty2@prismedu.com': {
    role: 'faculty',
    name: 'Prof. David Reynolds',
    entityId: 'f2222222-2222-2222-2222-222222222222',
    pass: ['faculty123', 'password123', 'password@123', 'passward@123'],
  },
  'faculty.mech@prismedu.com': {
    role: 'faculty',
    name: 'Prof. Rajesh Kulkarni',
    entityId: 'f1111111-1111-1111-1111-111111111113',
    pass: ['faculty123', 'password123', 'password@123', 'passward@123'],
  },
  'faculty.civil@prismedu.com': {
    role: 'faculty',
    name: 'Dr. Sunita Deshmukh',
    entityId: 'f1111111-1111-1111-1111-111111111114',
    pass: ['faculty123', 'password123', 'password@123', 'passward@123'],
  },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input data' },
        { status: 400 }
      );
    }

    const { email: inputIdentifier, password, role: requestedRole } = parsed.data;
    let normalizedEmail = inputIdentifier.toLowerCase().trim();

    // Support logging in via Student ID (e.g. STU1001) as well as email address
    if (!normalizedEmail.includes('@')) {
      try {
        const { getDemoStudents } = require('@/lib/store/demo-students');
        const matched = getDemoStudents().find(
          (s: any) => s.student_id?.toLowerCase().trim() === normalizedEmail
        );
        if (matched?.email) {
          normalizedEmail = matched.email.toLowerCase().trim();
        }
      } catch {
        // ignore
      }
    }


    let userSession: SessionUser | null = null;

    // 1. Try Live Supabase Query if configured with valid project
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveDb = supabaseUrl && !supabaseUrl.includes('your-project') && !supabaseUrl.includes('test.supabase');

    if (isLiveDb) {
      try {
        const supabaseAdmin = createSupabaseAdminClient();
        
        // 1a. Try direct Supabase Auth Platform (auth.users) sign-in
        const { data: authResult, error: authError } = await supabaseAdmin.auth.signInWithPassword({
          email: normalizedEmail,
          password: password,
        });

        if (authResult?.user && !authError) {
          const authUser = authResult.user;
          const role = (authUser.user_metadata?.role as UserRole) || 'student';
          const name = authUser.user_metadata?.full_name || authUser.email || normalizedEmail;

          userSession = {
            userId: authUser.id,
            email: authUser.email || normalizedEmail,
            role,
            name,
            entityId: authUser.id,
            exp: Math.floor(Date.now() / 1000) + 86400,
          };
        }
      } catch {
        // Fall through to database table query
      }

      if (!userSession) {
        try {
          const supabase = createSupabaseServiceClient();
          const { data: userRecord, error: userError } = await supabase
            .from('users')
            .select('id, email, password_hash, role, status')
            .eq('email', normalizedEmail)
            .single();

          if (userRecord && !userError && userRecord.status === 'active') {
            const isPasswordValid = await verifyPassword(password, userRecord.password_hash);
            if (isPasswordValid) {
              let name = userRecord.email;
              let entityId = userRecord.id;

              if (userRecord.role === 'faculty') {
                const { data: fac } = await supabase
                  .from('faculty')
                  .select('id, full_name')
                  .eq('user_id', userRecord.id)
                  .single();
                if (fac) {
                  name = fac.full_name;
                  entityId = fac.id;
                }
              } else if (userRecord.role === 'student') {
                const { data: stu } = await supabase
                  .from('students')
                  .select('id, full_name')
                  .eq('user_id', userRecord.id)
                  .single();
                if (stu) {
                  name = stu.full_name;
                  entityId = stu.id;
                }
              }

              userSession = {
                userId: userRecord.id,
                email: userRecord.email,
                role: userRecord.role as UserRole,
                name,
                entityId,
                exp: Math.floor(Date.now() / 1000) + 86400,
              };
            }
          }
        } catch {
          // Fallback to demo credentials
        }
      }
    }

    // 2. Demo accounts fallback for rapid evaluation
    if (!userSession && DEMO_USERS[normalizedEmail]) {
      const demo = DEMO_USERS[normalizedEmail];
      if (demo.pass.includes(password)) {
        userSession = {
          userId: demo.entityId,
          email: normalizedEmail,
          role: demo.role,
          name: demo.name,
          entityId: demo.entityId,
          exp: Math.floor(Date.now() / 1000) + 86400,
        };
      }
    }

    // 2b. Check dynamically added demo students & faculty and credential registry
    if (!userSession) {
      const { checkUserPassword } = require('@/lib/store/auth-credentials');

      try {
        const { getDemoStudents } = require('@/lib/store/demo-students');
        const dynamicStudent = getDemoStudents().find(
          (s: any) => s.email.toLowerCase().trim() === normalizedEmail
        );
        if (dynamicStudent) {
          const isValid = checkUserPassword(
            normalizedEmail,
            password,
            dynamicStudent.date_of_birth,
            dynamicStudent.full_name
          );
          if (isValid) {
            userSession = {
              userId: dynamicStudent.id,
              email: normalizedEmail,
              role: 'student',
              name: dynamicStudent.full_name,
              entityId: dynamicStudent.id,
              exp: Math.floor(Date.now() / 1000) + 86400,
            };
          }
        }
      } catch {
        // ignore
      }

      try {
        const { getDemoFaculty } = require('@/lib/store/demo-faculty');
        const dynamicFaculty = getDemoFaculty().find(
          (f: any) => f.email.toLowerCase().trim() === normalizedEmail
        );
        if (dynamicFaculty) {
          const isValid = checkUserPassword(
            normalizedEmail,
            password,
            dynamicFaculty.date_of_birth,
            dynamicFaculty.full_name
          );
          if (isValid) {
            userSession = {
              userId: dynamicFaculty.id,
              email: normalizedEmail,
              role: 'faculty',
              name: dynamicFaculty.full_name,
              entityId: dynamicFaculty.id,
              exp: Math.floor(Date.now() / 1000) + 86400,
            };
          }
        }
      } catch {
        // ignore
      }
    }

    if (!userSession) {
      return NextResponse.json(
        { error: 'Invalid email or password. Please verify your institutional credentials.' },
        { status: 401 }
      );
    }

    // Explicit Role Authorization Check: Faculty accounts cannot access Admin portal, Admin accounts cannot access Faculty/Student portal, etc.
    if (requestedRole && userSession.role !== requestedRole) {
      if (requestedRole === 'admin' && userSession.role === 'faculty') {
        return NextResponse.json(
          { error: 'Access Denied: Faculty accounts do not have authority to log in to the Admin Dashboard.' },
          { status: 403 }
        );
      }
      if (requestedRole === 'admin' && userSession.role === 'student') {
        return NextResponse.json(
          { error: 'Access Denied: Student accounts do not have authority to log in to the Admin Dashboard.' },
          { status: 403 }
        );
      }
      if (requestedRole === 'faculty' && userSession.role === 'admin') {
        return NextResponse.json(
          { error: 'Access Denied: Admin accounts do not have authority to log in to the Faculty Mentorship Portal.' },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: `Access Denied: Your account is registered as ${userSession.role.toUpperCase()} and does not have authority to access the ${requestedRole.toUpperCase()} portal.` },
        { status: 403 }
      );
    }

    // Generate signed JWT token
    const token = await createSessionToken(userSession);

    const response = NextResponse.json({
      success: true,
      user: {
        email: userSession.email,
        role: userSession.role,
        name: userSession.name,
        entityId: userSession.entityId,
      },
    });

    // Set secure HTTP-only session cookie
    response.cookies.set('prism_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400, // 24 hours
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Authentication service encounter an unexpected error' },
      { status: 500 }
    );
  }
}
