import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { createSessionToken, verifySessionToken } from '@/lib/auth/session';
import { hasRole, requireRoleAccess } from '@/lib/auth/rbac';
import type { SessionUser } from '@/lib/types';

describe('Authentication & RBAC Suite', () => {
  describe('Password Hashing & Verification (bcryptjs)', () => {
    it('should properly hash passwords with salt', async () => {
      const plain = 'superSecretPassword123';
      const hash = await hashPassword(plain);
      expect(hash).not.toBe(plain);
      expect(hash.startsWith('$2')).toBe(true);
    });

    it('should verify matching password correctly', async () => {
      const plain = 'correctPassword';
      const hash = await hashPassword(plain);
      const isMatch = await verifyPassword(plain, hash);
      expect(isMatch).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const plain = 'correctPassword';
      const hash = await hashPassword(plain);
      const isMatch = await verifyPassword('wrongPassword', hash);
      expect(isMatch).toBe(false);
    });
  });

  describe('JWT Session Lifecycle (jose)', () => {
    const mockUser: Omit<SessionUser, 'exp'> = {
      userId: 'u123',
      email: 'faculty@prismedu.com',
      role: 'faculty',
      name: 'Dr. Sarah Mitchell',
      entityId: 'f123',
    };

    it('should sign and decode a valid session token', async () => {
      const token = await createSessionToken(mockUser);
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);

      const decoded = await verifySessionToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.email).toBe('faculty@prismedu.com');
      expect(decoded?.role).toBe('faculty');
    });

    it('should reject tampered or invalid token', async () => {
      const invalidToken = 'invalid.header.signature';
      const decoded = await verifySessionToken(invalidToken);
      expect(decoded).toBeNull();
    });
  });

  describe('Role-Based Access Control (RBAC)', () => {
    const adminUser: SessionUser = {
      userId: '1',
      email: 'admin@prismedu.com',
      role: 'admin',
      name: 'Admin',
      entityId: '1',
      exp: 9999999999,
    };

    const studentUser: SessionUser = {
      userId: '2',
      email: 'student@prismedu.com',
      role: 'student',
      name: 'Student',
      entityId: '2',
      exp: 9999999999,
    };

    it('should correctly authorize role access', () => {
      expect(hasRole(adminUser, 'admin')).toBe(true);
      expect(hasRole(adminUser, 'faculty')).toBe(false);
      expect(hasRole(studentUser, 'student')).toBe(true);
    });

    it('should enforce role restrictions and throw on unauthorized access', () => {
      expect(() => requireRoleAccess(studentUser, 'admin')).toThrow(/Forbidden/);
      expect(() => requireRoleAccess(null, 'admin')).toThrow(/Unauthorized/);
      expect(() => requireRoleAccess(adminUser, 'admin', 'faculty')).not.toThrow();
    });
  });
});
