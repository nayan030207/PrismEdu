import { generateDefaultPassword } from '@/lib/auth/password';

export interface UserCredential {
  email: string;
  passwordHash?: string;
  customPassword?: string;
  otpCode?: string;
  otpExpiresAt?: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __PRISM_AUTH_CREDENTIALS: Map<string, UserCredential> | undefined;
}

function getCredentialsMap(): Map<string, UserCredential> {
  if (!globalThis.__PRISM_AUTH_CREDENTIALS) {
    globalThis.__PRISM_AUTH_CREDENTIALS = new Map<string, UserCredential>();
  }
  return globalThis.__PRISM_AUTH_CREDENTIALS;
}

/**
 * Automatically create/register user credentials in Auth platform upon Excel upload
 */
export function registerUserAuthCredential(email: string, dob?: string | number, fullName?: string): string {
  if (!email) return '';
  const normEmail = email.toLowerCase().trim();
  const map = getCredentialsMap();
  const initialPass = generateDefaultPassword(normEmail, dob, fullName);

  const existing = map.get(normEmail) || { email: normEmail };
  if (!existing.customPassword) {
    existing.customPassword = initialPass;
  }
  map.set(normEmail, existing);
  return existing.customPassword;
}

/**
 * Verify user password during login
 */
export function checkUserPassword(
  email: string,
  inputPass: string,
  defaultDob?: string | number,
  defaultName?: string
): boolean {
  if (!email || !inputPass) return false;
  const normEmail = email.toLowerCase().trim();
  const map = getCredentialsMap();
  const cred = map.get(normEmail);

  // 1. Check custom password set by user
  if (cred?.customPassword) {
    if (cred.customPassword === inputPass) return true;
  }

  // 2. Check Name@dob initial password formula
  const expectedPass = generateDefaultPassword(normEmail, defaultDob, defaultName);
  if (inputPass === expectedPass) return true;

  // 3. Dev fallbacks
  if (
    inputPass === 'password123' ||
    inputPass === 'passward@123' ||
    inputPass === 'faculty123' ||
    inputPass === 'student123' ||
    inputPass === 'admin123'
  ) {
    return true;
  }

  return false;
}

/**
 * Generate 6-digit email authentication OTP for password reset
 */
export function generateEmailOtp(email: string): { success: boolean; otpCode?: string; message: string } {
  if (!email || !email.includes('@')) {
    return { success: false, message: 'Please enter a valid institutional email address.' };
  }

  const normEmail = email.toLowerCase().trim();
  const map = getCredentialsMap();
  const cred = map.get(normEmail) || { email: normEmail };

  // Generate 6-digit OTP code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // Valid for 10 minutes

  cred.otpCode = otpCode;
  cred.otpExpiresAt = expiresAt;
  map.set(normEmail, cred);

  return {
    success: true,
    otpCode,
    message: `Verification code sent to ${normEmail}. (Demo OTP Code: ${otpCode})`,
  };
}

/**
 * Verify email OTP and update user password
 */
export function resetPasswordWithOtp(
  email: string,
  otpCode: string,
  newPassword: string
): { success: boolean; message: string } {
  if (!email || !otpCode || !newPassword) {
    return { success: false, message: 'Email, verification code, and new password are required.' };
  }

  const normEmail = email.toLowerCase().trim();
  const map = getCredentialsMap();
  const cred = map.get(normEmail);

  if (!cred || !cred.otpCode || !cred.otpExpiresAt) {
    return { success: false, message: 'No active OTP verification found for this email. Please request a code first.' };
  }

  if (Date.now() > cred.otpExpiresAt) {
    return { success: false, message: 'Verification code has expired. Please request a new code.' };
  }

  if (cred.otpCode.trim() !== otpCode.trim()) {
    return { success: false, message: 'Invalid 6-digit verification code. Please check and try again.' };
  }

  // Update password in Auth Platform
  cred.customPassword = newPassword;
  cred.otpCode = undefined;
  cred.otpExpiresAt = undefined;
  map.set(normEmail, cred);

  return { success: true, message: 'Password updated successfully! You can now log in with your new password.' };
}
