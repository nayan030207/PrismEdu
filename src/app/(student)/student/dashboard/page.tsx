'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Bot,
  BarChart3,
  CalendarCheck2,
  BadgePercent,
  LifeBuoy,
  Briefcase,
  Bell,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react';

import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';

export default function StudentDashboardPage() {
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/student/dashboard')
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const d = data || {
    studentName: 'Priya Patel',
    courseProgress: 72,
    attendanceRate: 76,
    recommendedResourcesCount: 2,
    scholarshipsCount: 3,
    careerOpportunitiesCount: 4,
    pendingAssignmentsCount: 1,
    pendingQuizzesCount: 1,
    recentNotifications: [],
    recommendedResources: [],
  };

  return (
    <div className="space-y-6">
      {/* Personalized Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0C182B] via-[#1E1B4B] to-[#4C1D95] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-xs font-bold text-purple-200">
            <Sparkles className="h-3.5 w-3.5 text-purple-300" />
            <span>Academic Term 2026-2027</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-xs">
            Welcome, {d.studentName}
          </h2>
          <p className="text-sm text-purple-100 font-medium leading-relaxed">
            Track your semester coursework, solve academic doubts with PRISM AI, explore institutional scholarships, and review recommended career skills.
          </p>
        </div>
      </div>

      {/* Top Banner: Recent Notifications */}
      <Card className="border-indigo-100 bg-gradient-to-r from-amber-50/50 via-indigo-50/30 to-white shadow-xs">
        <CardHeader className="py-3 px-4 border-b border-indigo-100/60 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500 text-white animate-pulse">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">Recent Notifications & Urgent Announcements</CardTitle>
              <p className="text-[11px] text-slate-500">Important academic alerts and upcoming deadlines</p>
            </div>
          </div>
          <Link href="/student/notifications">
            <Button variant="ghost" size="sm" className="text-xs text-indigo-700 hover:bg-indigo-100/50">
              View All Notifications
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900">Mentorship Follow-up</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">2h ago</span>
                </div>
                <p className="text-xs text-slate-600">
                  Dr. Sarah Mitchell scheduled an academic review for DBMS normalization on Friday.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                <BadgePercent className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900">Scholarship Application Deadline</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">Closing Soon</span>
                </div>
                <p className="text-xs text-slate-600">
                  Merit-cum-Means Post-Matric Scholarship applications close in 45 days.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary KPI Grid (Section 15 Exact Prompt Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Your Learning: 72% Course Progress */}
        <Card className="border-slate-200 p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase text-slate-500">Your Learning</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">{d.courseProgress}%</span>
              <span className="text-xs text-slate-500 font-medium">Course Progress</span>
            </div>
            <Progress value={d.courseProgress} className="h-2" />
          </div>
          <Link href="/student/learning" className="block mt-4">
            <Button variant="ghost" size="sm" className="w-full justify-between text-xs text-indigo-600 px-0 hover:bg-transparent">
              <span>Continue Coursework</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </Card>

        {/* Attendance: 76% */}
        <Card className="border-slate-200 p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase text-slate-500">Attendance</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <CalendarCheck2 className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">{d.attendanceRate}%</span>
              <span className="text-xs text-slate-500 font-medium">Overall Attendance</span>
            </div>
            <Progress
              value={d.attendanceRate}
              className="h-2"
              indicatorClassName={d.attendanceRate >= 75 ? 'bg-emerald-600' : 'bg-amber-500'}
            />
          </div>
          <Link href="/student/attendance" className="block mt-4">
            <Button variant="ghost" size="sm" className="w-full justify-between text-xs text-slate-600 px-0 hover:bg-transparent">
              <span>View Attendance Details</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </Card>

        {/* AI Learning Assistant */}
        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/40 to-white p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase text-indigo-700">AI Learning Assistant</span>
            <div className="p-2 rounded-lg bg-indigo-600 text-white">
              <Bot className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Ask any academic doubt or syllabus concept. Get step-by-step answers from course materials.
          </p>
          <Link href="/student/ai-learning" className="block">
            <Button size="sm" className="w-full gap-2 text-xs">
              <Bot className="h-3.5 w-3.5" />
              <span>Ask Your Academic Doubt</span>
            </Button>
          </Link>
        </Card>
      </div>

      {/* Secondary Quick Links Grid (Financial, Career, Support) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Financial Support: 3 scholarships available */}
        <Card className="border-slate-200 p-5 hover:border-slate-300 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <BadgePercent className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Financial Support</h4>
              <p className="text-xs text-slate-500">{d.scholarshipsCount} scholarships available</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            Institutional fee grants, Merit-cum-Means awards, and subsidized student education loans.
          </p>
          <Link href="/student/financial">
            <Button variant="outline" size="sm" className="w-full text-xs">
              Explore Scholarships & Loans
            </Button>
          </Link>
        </Card>

        {/* Career: 4 matching opportunities */}
        <Card className="border-slate-200 p-5 hover:border-slate-300 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Career Opportunities</h4>
              <p className="text-xs text-slate-500">{d.careerOpportunitiesCount} matching opportunities</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            Full-stack engineering internships, junior developer openings, and cloud certifications.
          </p>
          <Link href="/student/career">
            <Button variant="outline" size="sm" className="w-full text-xs">
              View Opportunities & Skills
            </Button>
          </Link>
        </Card>

        {/* Personal & Family Support */}
        <Card className="border-slate-200 p-5 hover:border-slate-300 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <LifeBuoy className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Personal Support</h4>
              <p className="text-xs text-slate-500">Counsellors & AI Wellness</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            Campus wellness counsellors, stress management guidance, and confidential AI companion.
          </p>
          <Link href="/student/support">
            <Button variant="outline" size="sm" className="w-full text-xs">
              Access Support Cell
            </Button>
          </Link>
        </Card>
      </div>

      {/* Recommended Learning Resources */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Recommended Learning Resources</CardTitle>
            <p className="text-xs text-slate-500">
              Tailored concept notes and quizzes to strengthen your core subjects
            </p>
          </div>
          <Link href="/student/learning">
            <Button variant="ghost" size="sm" className="text-xs text-indigo-600">
              View All Coursework
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          <div className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  Lecture Note
                </span>
                <span className="text-xs text-slate-400">DBMS</span>
              </div>
              <h5 className="text-sm font-bold text-slate-900">
                DBMS Lecture Notes - Normalization (1NF to BCNF)
              </h5>
              <p className="text-xs text-slate-500">
                Comprehensive review of functional dependencies, partial dependencies, and decomposition.
              </p>
            </div>
            <Link href="/student/learning">
              <Button size="sm" variant="outline" className="shrink-0 text-xs">
                Study Note
              </Button>
            </Link>
          </div>

          <div className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                  Quiz Assessment
                </span>
                <span className="text-xs text-slate-400">DBMS</span>
              </div>
              <h5 className="text-sm font-bold text-slate-900">
                DBMS Normalization & Relational Theory Quiz
              </h5>
              <p className="text-xs text-slate-500">
                5 interactive multiple-choice questions to self-assess your normalization mastery.
              </p>
            </div>
            <Link href="/student/learning">
              <Button size="sm" className="shrink-0 text-xs">
                Attempt Quiz
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
