import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'prism-secret-key-32-chars-long-minimum!'
);

const SESSION_COOKIE_NAME = 'prism_session';

export async function middleware(request: any) {
  const { pathname } = request.nextUrl;

  // Static files and internal Next.js routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/logout') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/templates')
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  let session: any = null;

  if (sessionCookie?.value) {
    try {
      const { payload } = await jwtVerify(sessionCookie.value, SECRET_KEY);
      session = payload;
    } catch {
      session = null;
    }
  }

  // Root path handling - public landing page
  if (pathname === '/') {
    return NextResponse.next();
  }

  // If visiting login while already authenticated
  if (pathname === '/login') {
    if (session) {
      if (session.role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      if (session.role === 'faculty') return NextResponse.redirect(new URL('/faculty/dashboard', request.url));
      if (session.role === 'student') return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Role based route guards
  const isAdminRoute = pathname.startsWith('/admin');
  const isFacultyRoute = pathname.startsWith('/faculty');
  const isStudentRoute = pathname.startsWith('/student');

  if (isAdminRoute || isFacultyRoute || isStudentRoute) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdminRoute && session.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (isFacultyRoute && session.role !== 'faculty') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (isStudentRoute && session.role !== 'student') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
