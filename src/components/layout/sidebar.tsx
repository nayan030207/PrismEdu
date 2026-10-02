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
  AlertTriangle,
  TrendingUp,
  Zap,
  Building2,
  GitBranch,
  Target,
  ClipboardList,
  ArrowUpCircle,
  CheckCircle2,
  PieChart,
  Database,
  Download,
  Cpu,
  FlaskConical,
  FileText,
  Settings,
  ScrollText,
  ShieldCheck,
  ActivitySquare,
  Layers,
  MessageSquare,
  Sparkles,
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

interface NavGroup {
  label: string;
  items: { label: string; href: string; icon: React.ElementType; badge?: string }[];
}

function getAdminNavGroups(): NavGroup[] {
  return [
    {
      label: 'NAVIGATION MENU',
      items: [
        { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: 'EARLY WARNING',
      items: [
        { label: 'Risk Monitor', href: '/admin/risk-monitor', icon: ShieldAlert },
        { label: 'Priority Actions', href: '/admin/priority-actions', icon: Zap, badge: '12' },
        { label: 'Alerts', href: '/admin/alerts', icon: Bell, badge: '7' },
        { label: 'Risk Trends', href: '/admin/risk-trends', icon: TrendingUp },
      ],
    },
    {
      label: 'STUDENTS',
      items: [
        { label: 'Student Directory', href: '/admin/students', icon: Users },
        { label: 'Student Risk Profiles', href: '/admin/risk-profiles', icon: Target },
        { label: 'Cohort Analysis', href: '/admin/cohorts', icon: Layers },
      ],
    },
    {
      label: 'INTERVENTIONS',
      items: [
        { label: 'Intervention Center', href: '/admin/interventions', icon: HeartHandshake },
        { label: 'Assignments', href: '/admin/interventions/assignments', icon: ClipboardList },
        { label: 'Escalations', href: '/admin/interventions/escalations', icon: ArrowUpCircle },
        { label: 'Outcomes', href: '/admin/interventions/outcomes', icon: CheckCircle2 },
      ],
    },
    {
      label: 'ANALYTICS',
      items: [
        { label: 'Institutional Analytics', href: '/admin/analytics', icon: BarChart3 },
        { label: 'Department Analytics', href: '/admin/analytics/departments', icon: Building2 },
        { label: 'Cohort Analytics', href: '/admin/cohorts', icon: PieChart },
        { label: 'Reports', href: '/admin/reports', icon: FileText },
      ],
    },
    {
      label: 'AI & PREDICTION',
      items: [
        { label: 'Prediction Engine', href: '/admin/ai/prediction', icon: Cpu },
        { label: 'Model Performance', href: '/admin/ai/model', icon: ActivitySquare },
        { label: 'What-If Simulation', href: '/admin/ai/simulation', icon: FlaskConical },
        { label: 'Feature Insights', href: '/admin/ai/insights', icon: Sparkles },
      ],
    },
    {
      label: 'MANAGEMENT',
      items: [
        { label: 'Faculty Management', href: '/admin/faculty', icon: GraduationCap },
        { label: 'Resource Catalog', href: '/admin/resources', icon: FolderKanban },
        { label: 'Data Import', href: '/admin/students/import', icon: Download },
        { label: 'Integrations', href: '/admin/integrations', icon: GitBranch },
      ],
    },
    {
      label: 'SYSTEM',
      items: [
        { label: 'Notifications', href: '/admin/notifications', icon: Bell },
        { label: 'Audit Logs', href: '/admin/audit-logs', icon: ScrollText },
        { label: 'Settings', href: '/admin/settings', icon: Settings },
      ],
    },
  ];
}

function getFacultyNavGroups(): NavGroup[] {
  return [
    {
      label: 'NAVIGATION MENU',
      items: [
        { label: 'Dashboard', href: '/faculty/dashboard', icon: LayoutDashboard },
        { label: 'My Students', href: '/faculty/students', icon: Users },
        { label: 'At-Risk Students', href: '/faculty/at-risk', icon: Target, badge: '12' },
        { label: 'Interventions', href: '/faculty/interventions', icon: HeartHandshake, badge: '8' },
        { label: 'Meetings & Notes', href: '/faculty/meetings', icon: MessageSquare },
        { label: 'Attendance Insights', href: '/faculty/attendance-insights', icon: CalendarCheck2 },
        { label: 'Academic Performance', href: '/faculty/academic-performance', icon: BarChart3 },
        { label: 'Alerts', href: '/faculty/alerts', icon: Bell, badge: '5' },
      ],
    },
    {
      label: 'RESOURCES',
      items: [
        { label: 'Resource Catalog', href: '/faculty/resources', icon: FolderKanban },
        { label: 'Learning Materials', href: '/faculty/learning-materials', icon: BookOpen },
      ],
    },
    {
      label: 'REPORTS',
      items: [
        { label: 'My Reports', href: '/faculty/reports', icon: FileText },
        { label: 'Download Reports', href: '/faculty/reports/download', icon: Download },
      ],
    },
    {
      label: 'PROFILE',
      items: [
        { label: 'Profile', href: '/faculty/profile', icon: Users },
        { label: 'Settings', href: '/faculty/settings', icon: Settings },
      ],
    },
  ];
}

export function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { startLoading } = usePageLoading();
  const [isResetOpen, setIsResetOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState<string[]>([]);

  const isActive = (href: string) =>
    pathname === href ||
    (href !== '/admin/dashboard' &&
      href !== '/faculty/dashboard' &&
      href !== '/student/dashboard' &&
      pathname.startsWith(href));

  const toggleGroup = (label: string) => {
    setCollapsed((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

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

  // Admin layout with grouped navigation
  if (role === 'admin') {
    const groups = getAdminNavGroups();

    return (
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 h-screen sticky top-0">
        {/* Brand Header */}
        <div className="h-14 flex items-center px-4 border-b border-slate-100 justify-between shrink-0">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <PrismLogo size="sm" showSubtitle={false} />
          </Link>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
            admin
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {groups.map((group) => {
            const isGroupCollapsed = collapsed.includes(group.label);
            const hasActive = group.items.some((item) => isActive(item.href));

            return (
              <div key={group.label} className="mb-1">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={cn(
                    'w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors rounded',
                    hasActive ? 'text-purple-700' : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  <span>{group.label}</span>
                  <span className={cn('transition-transform text-slate-300', isGroupCollapsed && 'rotate-90')}>›</span>
                </button>

                {!isGroupCollapsed && (
                  <div className="space-y-0.5 mt-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                            active
                              ? 'bg-purple-100 text-purple-700 font-semibold shadow-xs'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          )}
                        >
                          <Icon className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-purple-700' : 'text-slate-400')} />
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto text-[10px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded-full leading-none min-w-[18px] text-center">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Need Help Card & User Footer */}
        <div className="p-3 border-t border-slate-100 shrink-0 space-y-2.5">
          <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100/80">
            <div className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5">
              <LifeBuoy className="h-3.5 w-3.5 text-purple-600" />
              <span>Need Help?</span>
            </div>
            <Link
              href="https://docs.prismedu.internal"
              target="_blank"
              className="mt-1 text-[11px] font-medium text-purple-700 hover:text-purple-900 flex items-center gap-1 transition-colors"
            >
              <span>View Documentation</span>
              <span className="text-xs">→</span>
            </Link>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
            <div className="min-w-0 flex-1 mr-2">
              <div className="text-xs font-semibold text-slate-900 truncate">{userName || 'Admin User'}</div>
              <div className="text-[11px] text-slate-500 truncate">{userEmail || 'admin@prismedu.com'}</div>
            </div>
            <span className="shrink-0 text-[10px] uppercase font-bold bg-white text-indigo-600 border border-indigo-100 px-1.5 py-0.5 rounded">
              admin
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
            isAuthenticated={true}
            userRole={role}
          />
        </div>
      </aside>
    );
  }

  // Faculty layout with grouped navigation matching the screenshot
  if (role === 'faculty') {
    const groups = getFacultyNavGroups();

    return (
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 h-screen sticky top-0">
        {/* Brand Header */}
        <div className="h-14 flex items-center px-4 border-b border-slate-100 justify-between shrink-0">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <PrismLogo size="sm" showSubtitle={false} />
          </Link>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
            faculty
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {groups.map((group) => {
            const isGroupCollapsed = collapsed.includes(group.label);
            const hasActive = group.items.some((item) => isActive(item.href));

            return (
              <div key={group.label} className="mb-1">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={cn(
                    'w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors rounded',
                    hasActive ? 'text-purple-700' : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  <span>{group.label}</span>
                  <span className={cn('transition-transform text-slate-300', isGroupCollapsed && 'rotate-90')}>›</span>
                </button>

                {!isGroupCollapsed && (
                  <div className="space-y-0.5 mt-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                            active
                              ? 'bg-purple-100 text-purple-700 font-semibold shadow-xs'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          )}
                        >
                          <Icon className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-purple-700' : 'text-slate-400')} />
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto text-[10px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded-full leading-none min-w-[18px] text-center">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-100 shrink-0 space-y-2.5">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
            <div className="min-w-0 flex-1 mr-2">
              <div className="text-xs font-semibold text-slate-900 truncate">{userName || 'Prof. Sandeep Kulkarni'}</div>
              <div className="text-[11px] text-slate-500 truncate">{userEmail || 'faculty@prismedu.com'}</div>
            </div>
            <span className="shrink-0 text-[10px] uppercase font-bold bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded">
              faculty
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
            isAuthenticated={true}
            userRole={role}
          />
        </div>
      </aside>
    );
  }

  // Student — flat nav
  const items = [
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

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 h-screen sticky top-0">
      <div className="h-16 flex items-center px-5 border-b border-slate-100 justify-between">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <PrismLogo size="sm" showSubtitle={false} />
        </Link>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
          {role}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation Menu
        </div>
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== `/${role}/dashboard` && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-purple-50 text-purple-700 font-semibold'
                  : 'text-slate-600 hover:bg-purple-50/50 hover:text-purple-700'
              )}
            >
              <Icon className={cn('h-4 w-4', active ? 'text-purple-600' : 'text-slate-400')} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 mb-2">
          <div className="min-w-0 flex-1 mr-2">
            <div className="text-xs font-semibold text-slate-900 truncate">{userName || 'Logged In User'}</div>
            <div className="text-[11px] text-slate-500 truncate">{userEmail || `${role}@prismedu.com`}</div>
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
          isAuthenticated={true}
          userRole={role}
        />
      </div>
    </aside>
  );
}
