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
      label: 'Overview',
      items: [
        { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: 'Early Warning',
      items: [
        { label: 'Risk Monitor', href: '/admin/risk-monitor', icon: ShieldAlert },
        { label: 'Priority Actions', href: '/admin/priority-actions', icon: Zap },
        { label: 'Emerging Risk', href: '/admin/emerging-risk', icon: TrendingUp },
        { label: 'Alerts', href: '/admin/alerts', icon: Bell },
      ],
    },
    {
      label: 'Students',
      items: [
        { label: 'Student Directory', href: '/admin/students', icon: Users },
        { label: 'Risk Profiles', href: '/admin/risk-profiles', icon: Target },
        { label: 'Cohort Analysis', href: '/admin/cohorts', icon: Layers },
      ],
    },
    {
      label: 'Interventions',
      items: [
        { label: 'Intervention Center', href: '/admin/interventions', icon: HeartHandshake },
        { label: 'Assignments', href: '/admin/interventions/assignments', icon: ClipboardList },
        { label: 'Escalations', href: '/admin/interventions/escalations', icon: ArrowUpCircle },
        { label: 'Outcomes', href: '/admin/interventions/outcomes', icon: CheckCircle2 },
      ],
    },
    {
      label: 'Analytics',
      items: [
        { label: 'Institutional', href: '/admin/analytics', icon: BarChart3 },
        { label: 'Department', href: '/admin/analytics/departments', icon: Building2 },
        { label: 'Reports', href: '/admin/reports', icon: FileText },
      ],
    },
    {
      label: 'AI & Prediction',
      items: [
        { label: 'Prediction Engine', href: '/admin/ai/prediction', icon: Cpu },
        { label: 'Model Performance', href: '/admin/ai/model', icon: ActivitySquare },
        { label: 'What-If Simulation', href: '/admin/ai/simulation', icon: FlaskConical },
        { label: 'Admin Assistant', href: '/admin/ai/assistant', icon: MessageSquare },
      ],
    },
    {
      label: 'Management',
      items: [
        { label: 'Faculty Management', href: '/admin/faculty', icon: GraduationCap },
        { label: 'Resource Catalog', href: '/admin/resources', icon: FolderKanban },
        { label: 'Data Import', href: '/admin/students/import', icon: Download },
        { label: 'Data Quality', href: '/admin/data-quality', icon: Database },
      ],
    },
    {
      label: 'System',
      items: [
        { label: 'Audit Logs', href: '/admin/audit-logs', icon: ScrollText },
        { label: 'Settings', href: '/admin/settings', icon: Settings },
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

  const getFacultyNavItems = () => [
    { label: 'Faculty Dashboard', href: '/faculty/dashboard', icon: LayoutDashboard },
    { label: 'Assigned Students', href: '/faculty/students', icon: Users },
    { label: 'Add Student (Single)', href: '/faculty/students/add', icon: UserPlus },
    { label: 'Import Students (Excel)', href: '/faculty/students/import', icon: FileSpreadsheet },
    { label: 'Import Attendance', href: '/faculty/students/import-attendance', icon: CalendarCheck2 },
    { label: 'Resource Catalog', href: '/faculty/resources', icon: FolderKanban },
    { label: 'Interventions Log', href: '/faculty/interventions', icon: HeartHandshake },
  ];

  const getStudentNavItems = () => [
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

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin/dashboard' && href !== '/faculty/dashboard' && href !== '/student/dashboard' && pathname.startsWith(href));

  const toggleGroup = (label: string) => {
    setCollapsed((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
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
                            'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors',
                            active
                              ? 'bg-purple-50 text-purple-700 font-semibold'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          )}
                        >
                          <Icon className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-purple-600' : 'text-slate-400')} />
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
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
        <div className="p-3 border-t border-slate-100 shrink-0">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 mb-2">
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

  // Faculty/Student — flat nav
  const items = role === 'faculty' ? getFacultyNavItems() : getStudentNavItems();

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
