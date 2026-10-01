import type { UserRole, SessionUser } from '@/lib/types';

export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  admin: '/admin/dashboard',
  faculty: '/faculty/dashboard',
  student: '/student/dashboard',
};

/**
 * Checks if a session user possesses the required role
 */
export function hasRole(user: SessionUser | null, ...roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

/**
 * Asserts that the user possesses one of the allowed roles, otherwise throws an error
 */
export function requireRoleAccess(user: SessionUser | null, ...roles: UserRole[]): void {
  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }
  if (!roles.includes(user.role)) {
    throw new Error(`Forbidden: Insufficient privileges for role '${user.role}'`);
  }
}
