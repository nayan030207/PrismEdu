'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { KeyRound, Mail, AlertCircle, X, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  /** When true, shows the "change password with old password" form for logged-in faculty/student */
  isAuthenticated?: boolean;
  userRole?: string;
  onSuccess?: (email: string, newPass: string) => void;
}

export function PasswordResetModal({
  isOpen,
  onClose,
  defaultEmail = '',
  isAuthenticated = false,
  userRole,
  onSuccess,
}: PasswordResetModalProps) {
  // Mode: 'change' (logged-in, needs old password) or 'reset' (email+OTP flow)
  const [mode, setMode] = React.useState<'change' | 'reset'>(
    isAuthenticated && (userRole === 'faculty' || userRole === 'student') ? 'change' : 'reset'
  );

  // Change-password form state
  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showOld, setShowOld] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  // Reset-password (OTP) form state
  const [step, setStep] = React.useState<'email' | 'otp'>('email');
  const [email, setEmail] = React.useState(defaultEmail);
  const [otpCode, setOtpCode] = React.useState('');
  const [resetNewPassword, setResetNewPassword] = React.useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = React.useState('');
  const [demoOtp, setDemoOtp] = React.useState<string | null>(null);

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (defaultEmail) setEmail(defaultEmail);
  }, [defaultEmail]);

  React.useEffect(() => {
    if (isOpen) {
      setMode(
        isAuthenticated && (userRole === 'faculty' || userRole === 'student') ? 'change' : 'reset'
      );
      setError(null);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setStep('email');
      setOtpCode('');
      setResetNewPassword('');
      setResetConfirmPassword('');
      setDemoOtp(null);
    }
  }, [isOpen, isAuthenticated, userRole]);

  if (!isOpen) return null;

  // ── Change Password (Old Password required) ──────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      toast.success('Password changed successfully!');
      if (onSuccess) onSuccess(email, newPassword);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error changing password');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Send OTP ─────────────────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP verification code');
      setDemoOtp(data.otpCode || null);
      setStep('otp');
      toast.success(`Verification OTP sent to ${email}`);
    } catch (err: any) {
      setError(err.message || 'Error sending verification code');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Reset Password via OTP ────────────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (resetNewPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode, newPassword: resetNewPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      toast.success('Password updated successfully! You can now log in.');
      if (onSuccess) onSuccess(email, resetNewPassword);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-purple-50 text-[#8B5CF6] border border-purple-100">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {mode === 'change' ? 'Change Password' : 'Reset Password'}
            </h3>
            <p className="text-xs text-slate-500">
              {mode === 'change'
                ? 'Enter your current password to set a new one'
                : 'Authenticate via institutional email OTP'}
            </p>
          </div>
        </div>

        {/* Mode Toggle (only for authenticated faculty/student) */}
        {isAuthenticated && (userRole === 'faculty' || userRole === 'student') && (
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg mb-4">
            <button
              type="button"
              onClick={() => { setMode('change'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'change'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Change Password
            </button>
            <button
              type="button"
              onClick={() => { setMode('reset'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'reset'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Forgot Password (OTP)
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── CHANGE PASSWORD FORM ── */}
        {mode === 'change' && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Old Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showOld ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-[#8B5CF6] focus:bg-white focus:ring-1 focus:ring-[#8B5CF6]"
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showOld ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-[#8B5CF6] focus:bg-white focus:ring-1 focus:ring-[#8B5CF6]"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showNew ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-[#8B5CF6] focus:bg-white focus:ring-1 focus:ring-[#8B5CF6]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-500 font-medium -mt-2">Passwords do not match</p>
            )}

            <Button
              type="submit"
              className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-2.5 text-xs rounded-lg shadow-md shadow-purple-500/20"
              isLoading={isLoading}
            >
              Update Password
            </Button>
          </form>
        )}

        {/* ── RESET PASSWORD (OTP) FORM ── */}
        {mode === 'reset' && step === 'email' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Institutional Email Address (User ID)
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. faculty@prismedu.com"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-[#8B5CF6] focus:bg-white focus:ring-1 focus:ring-[#8B5CF6]"
                />
                <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-2.5 text-xs rounded-lg shadow-md shadow-purple-500/20"
              isLoading={isLoading}
            >
              Send 6-Digit Email Verification Code
            </Button>
          </form>
        )}

        {mode === 'reset' && step === 'otp' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {demoOtp && (
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-purple-700">Email OTP Delivered:</span>
                  <div className="font-mono text-base font-extrabold tracking-widest text-[#8B5CF6]">{demoOtp}</div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOtpCode(demoOtp)}
                  className="text-[11px] h-7 px-2 border-purple-300 text-purple-700 hover:bg-purple-100"
                >
                  Auto-fill OTP
                </Button>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">6-Digit Email OTP Code</label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 6-digit code"
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold tracking-widest text-slate-900 focus:outline-hidden focus:border-[#8B5CF6] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                value={resetNewPassword}
                onChange={(e) => setResetNewPassword(e.target.value)}
                placeholder="Enter new custom password"
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-[#8B5CF6] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={resetConfirmPassword}
                onChange={(e) => setResetConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-[#8B5CF6] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setStep('email')} className="flex-1 text-xs">
                Change Email
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-xs py-2 rounded-lg"
                isLoading={isLoading}
              >
                Save New Password
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
