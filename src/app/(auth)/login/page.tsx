'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, GraduationCap, Users, Lock, ArrowLeft } from 'lucide-react';
import type { UserRole } from '@/lib/types';
import { PrismLogo } from '@/components/ui/logo';

import { PasswordResetModal } from '@/components/auth/password-reset-modal';
import { usePageLoading } from '@/components/providers/navigation-provider';

export default function LoginPage() {
  const router = useRouter();
  const { startLoading } = usePageLoading();
  const [selectedRole, setSelectedRole] = React.useState<UserRole>('faculty');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = React.useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      // Route to destination based on authenticated user role
      const role = data.user.role;
      startLoading('Authenticating & loading dashboard...');
      if (role === 'admin') router.push('/admin/dashboard');
      else if (role === 'faculty') router.push('/faculty/dashboard');
      else if (role === 'student') router.push('/student/dashboard');
      else router.push('/');

      router.refresh();
    } catch (err: any) {
      const msg = err?.message === 'Failed to fetch'
        ? 'Unable to connect to authentication server. Please verify your connection or try again.'
        : err?.message || 'Login failed. Please verify your credentials and try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getRolePlaceholder = () => {
    switch (selectedRole) {
      case 'admin':
        return 'admin@prismedu.com';
      case 'faculty':
        return 'faculty@prismedu.com';
      case 'student':
        return 'student@prismedu.com';
      default:
        return 'your.email@prismedu.com';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Top Back Navigation Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#8B5CF6] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to PRISM-EDU Landing Page</span>
          </Link>
        </div>

        {/* Official PRISM-EDU Logo Header */}
        <div className="text-center flex flex-col items-center justify-center space-y-2">
          <PrismLogo size="xl" showSubtitle={true} variant="color" className="justify-center" />
        </div>

        {/* Account Role Selector Tabs */}
        <div className="bg-white p-1.5 rounded-xl border border-slate-200 flex gap-1 shadow-xs">
          <button
            type="button"
            onClick={() => handleRoleSelect('admin')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              selectedRole === 'admin'
                ? 'bg-[#8B5CF6] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0C182B] hover:bg-slate-100'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Admin</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('faculty')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              selectedRole === 'faculty'
                ? 'bg-[#8B5CF6] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0C182B] hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Faculty</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('student')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              selectedRole === 'student'
                ? 'bg-[#8B5CF6] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0C182B] hover:bg-slate-100'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Student</span>
          </button>
        </div>

        {/* Login Form Card */}
        <Card className="border-slate-200 bg-white shadow-xl text-slate-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-[#0C182B]">
              Institutional Sign In
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs">
              Enter your verified institutional email address and account password to log in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">
                  Institutional Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={getRolePlaceholder()}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#8B5CF6] focus:bg-white focus:ring-1 focus:ring-[#8B5CF6] transition-all"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#8B5CF6] focus:bg-white focus:ring-1 focus:ring-[#8B5CF6] transition-all"
                />
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(true)}
                    className="text-xs font-semibold text-[#8B5CF6] hover:text-[#7C3AED] hover:underline"
                  >
                    Forgot or Change Password?
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-3 rounded-lg transition-all shadow-md shadow-purple-500/20"
                isLoading={isLoading}
              >
                <Lock className="mr-2 h-4 w-4" />
                Sign In to Portal
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Email Authenticated Password Reset Modal */}
        <PasswordResetModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          defaultEmail={email}
          onSuccess={(resetEmail, newPass) => {
            setEmail(resetEmail);
            setPassword(newPass);
          }}
        />
      </div>
    </div>
  );
}
