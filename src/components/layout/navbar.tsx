'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Bell,
  ChevronRight,
  ChevronDown,
  Search,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import type { UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  title?: string;
  role: UserRole;
  userName?: string;
  userEmail?: string;
}

export function Navbar({ title = 'Overview', role, userName, userEmail }: NavbarProps) {
  const router = useRouter();
  const [academicYear, setAcademicYear] = React.useState('AY 2025-26');
  const [semester, setSemester] = React.useState('Semester 1');
  const [department, setDepartment] = React.useState('All Departments');
  const [searchValue, setSearchValue] = React.useState('');
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/admin/students?search=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  if (role === 'admin') {
    return (
      <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-xs sticky top-0 z-30 px-5 flex items-center justify-between gap-4">
        {/* Breadcrumb + Search */}
        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          <div className="flex items-center gap-1.5 text-xs whitespace-nowrap shrink-0">
            <span className="text-slate-400 font-normal">Admin</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <h1 className="font-semibold text-slate-800 tracking-tight">Institutional Dashboard</h1>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm hidden sm:block">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search students, faculty, interventions..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-400 transition-colors"
            />
          </form>
        </div>

        {/* Filters & Profile */}
        <div className="flex items-center gap-2 lg:gap-2.5 shrink-0">
          {/* Academic Year Filter */}
          <div className="relative hidden xl:block">
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="appearance-none bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium py-1.5 pl-2.5 pr-6 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-2xs"
            >
              <option value="AY 2025-26">AY 2025-26</option>
              <option value="AY 2024-25">AY 2024-25</option>
              <option value="AY 2023-24">AY 2023-24</option>
            </select>
            <ChevronDown className="h-3 w-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Semester Filter */}
          <div className="relative hidden lg:block">
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="appearance-none bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium py-1.5 pl-2.5 pr-6 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-2xs"
            >
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
              <option value="All Semesters">All Semesters</option>
            </select>
            <ChevronDown className="h-3 w-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Department Filter */}
          <div className="relative hidden md:block">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="appearance-none bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium py-1.5 pl-2.5 pr-6 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-2xs"
            >
              <option value="All Departments">All Departments</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Electronics Engineering">Electronics Engineering</option>
            </select>
            <ChevronDown className="h-3 w-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Date Range Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium">Sep 1, 2025 - Sep 30, 2025</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            title="Refresh dashboard data"
            className="p-1.5 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-purple-600' : ''}`} />
          </button>

          {/* Notifications Bell */}
          <Link
            href="/admin/alerts"
            title="12 priority notifications"
            className="relative p-1.5 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-white leading-none">
              12
            </span>
          </Link>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
            <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              A
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-tight">Institutional Admin</div>
              <div className="text-[10px] text-slate-400 font-normal leading-tight">admin@prismedu.com</div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  if (role === 'faculty') {
    return (
      <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-xs sticky top-0 z-30 px-5 flex items-center justify-between gap-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md hidden sm:block">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search students by name, ID, department..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-400 transition-colors"
          />
        </form>

        {/* Filters & Profile */}
        <div className="flex items-center gap-2 lg:gap-2.5 shrink-0 ml-auto">
          {/* Academic Year Filter */}
          <div className="relative hidden xl:block">
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="appearance-none bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium py-1.5 pl-2.5 pr-6 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-2xs"
            >
              <option value="AY 2025-26">AY 2025-26</option>
              <option value="AY 2024-25">AY 2024-25</option>
            </select>
            <ChevronDown className="h-3 w-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Semester Filter */}
          <div className="relative hidden lg:block">
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="appearance-none bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium py-1.5 pl-2.5 pr-6 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-2xs"
            >
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
            </select>
            <ChevronDown className="h-3 w-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Department Filter */}
          <div className="relative hidden md:block">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="appearance-none bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium py-1.5 pl-2.5 pr-6 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-2xs"
            >
              <option value="My Department">My Department</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Information Technology">Information Technology</option>
            </select>
            <ChevronDown className="h-3 w-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Notifications Bell */}
          <Link
            href="/faculty/alerts"
            title="5 new alerts"
            className="relative p-1.5 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-white leading-none">
              5
            </span>
          </Link>

          {/* Faculty Profile Chip */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
            <div className="h-8 w-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              SK
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                {userName || 'Prof. Sandeep Kulkarni'}
              </div>
              <div className="text-[10px] text-slate-400 font-normal leading-tight">
                Computer Engineering
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-xs sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400 capitalize">{role}</span>
        <ChevronRight className="h-4 w-4 text-slate-300" />
        <h1 className="font-semibold text-slate-900">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {role === 'student' && (
          <Link
            href="/student/notifications"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600" />
          </Link>
        )}
      </div>
    </header>
  );
}
