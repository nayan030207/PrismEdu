'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/types';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FolderKanban,
  UserPlus,
  FileSpreadsheet,
  HeartHandshake,
  BookOpen,
  Bot,
  BarChart3,
  CalendarCheck2,
  BadgePercent,
  LifeBuoy,
  Briefcase,
  Bell,
  LogOut,
  ShieldAlert,
} from 'lucide-react';

import { PrismLogo } from '@/components/ui/logo';
import { usePageLoading } from '@/components/providers/navigation-provider';
import { PasswordResetModal } from '@/components/auth/password-reset-modal';
import { KeyRound } from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  userName?: string;
  userEmail?: string;
}

export function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { startLoading } = usePageLoading();
  const [isResetOpen, setIsResetOpen] = React.useState(false);

  const handleLogout = async () => {
    startLoading('Signing out of PRISM-EDU...');
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // proceed anyway
    }
    router.push('/login');
    router.refresh();
  };

  const getNavItems = () => {
    if (role === 'admin') {
      return [
        { label: 'Institutional Overview', href: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Students Directory', href: '/admin/students', icon: Users },
        { label: 'Faculty Management', href: '/admin/faculty', icon: GraduationCap },
        { label: 'Resource Catalog', href: '/admin/resources', icon: FolderKanban },
      ];
    }
    if (role === 'faculty') {
      return [
        { label: 'Faculty Dashboard', href: '/faculty/dashboard', icon: LayoutDashboard },
        { label: 'Assigned Students', href: '/faculty/students', icon: Users },
        { label: 'Add Student (Single)', href: '/faculty/students/add', icon: UserPlus },
        { label: 'Import Students (Excel)', href: '/faculty/students/import', icon: FileSpreadsheet },
        { label: 'Import Attendance', href: '/faculty/students/import-attendance', icon: CalendarCheck2 },
        { label: 'Resource Catalog', href: '/faculty/resources', icon: FolderKanban },
        { label: 'Interventions Log', href: '/faculty/interventions', icon: HeartHandshake },
      ];
    }
    // Student navigation (Exact per Section 15 of spec)
    return [
      { label: 'Dashboard Home', href: '/student/dashboard', icon: LayoutDashboard },
      { label: 'Learning Environment', href: '/student/learning', icon: BookOpen },
      { label: 'AI Learning Agent', href: '/student/ai-learning', icon: Bot },
      { label: 'My Academic Progress', href: '/student/progress', icon: BarChart3 },
      { label: 'Attendance & Engagement', href: '/student/attendance', icon: CalendarCheck2 },
      { label: 'Financial Support', href: '/student/financial', icon: BadgePercent },
      { label: 'Personal Support', href: '/student/support', icon: LifeBuoy },
      { label: 'Career Opportunities', href: '/student/career', icon: Briefcase },
      { label: 'Notifications', href: '/student/notifications', icon: Bell },
    ];
  };

  const items = getNavItems();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-100 justify-between">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <PrismLogo size="sm" showSubtitle={false} />
        </Link>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
          {role}
        </span>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation Menu
        </div>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== `/${role}/dashboard` && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-purple-50 text-purple-700 font-semibold'
                  : 'text-slate-600 hover:bg-purple-50/50 hover:text-purple-700'
              )}
            >
              <Icon className={cn('h-4 w-4', isActive ? 'text-purple-600' : 'text-slate-400')} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* User Footer Profile & Sign Out */}
      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 mb-2">
          <div className="min-w-0 flex-1 mr-2">
            <div className="text-xs font-semibold text-slate-900 truncate">
              {userName || 'Logged In User'}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {userEmail || `${role}@prismedu.com`}
            </div>
          </div>
          <span className="shrink-0 text-[10px] uppercase font-bold bg-white text-indigo-600 border border-indigo-100 px-1.5 py-0.5 rounded">
            {role}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsResetOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            <KeyRound className="h-3 w-3 text-purple-600" />
            <span>Password</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
          >
            <LogOut className="h-3 w-3" />
            <span>Sign Out</span>
          </button>
        </div>

        <PasswordResetModal
          isOpen={isResetOpen}
          onClose={() => setIsResetOpen(false)}
          defaultEmail={userEmail}
        />
      </div>
    </aside>
  );
}
