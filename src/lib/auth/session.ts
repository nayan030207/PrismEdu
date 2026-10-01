import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT, jwtVerify } from 'jose';
import type { UserRole, SessionUser } from '@/lib/types';

const SECRET_KEY = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'prism-secret-key-32-chars-long-minimum!'
);

const SESSION_COOKIE_NAME = 'prism_session';

/**
 * Sign a new JWT session token valid for 24 hours
 */
export async function createSessionToken(user: Omit<SessionUser, 'exp'>): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);
}

/**
 * Verify and decode an existing JWT session token
 */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

/**
 * Read the current session user from the incoming request cookies
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return null;
    return await verifySessionToken(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * Helper to inspect session from Request object in API routes
 */
export async function getSessionFromRequest(req: Request): Promise<SessionUser | null> {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`(?:^|; )${SESSION_COOKIE_NAME}=([^;]*)`));
    if (!match) return null;
    const token = decodeURIComponent(match[1]);
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Guard for server components: requires a specific role or redirects
 */
export async function requireRole(role: UserRole): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== role) {
    if (session.role === 'admin') redirect('/admin/dashboard');
    if (session.role === 'faculty') redirect('/faculty/dashboard');
    if (session.role === 'student') redirect('/student/dashboard');
    redirect('/login');
  }
  return session;
}
