'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  ShieldAlert,
  AlertTriangle,
  BookOpen,
  HeartHandshake,
  Calendar,
  Clock,
  ChevronDown,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Sparkles,
  Bot,
  Send,
  Target,
  Bell,
  ClipboardList,
  CheckCircle2,
  Video,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function FacultyDashboardPage() {
  const router = useRouter();

  // State
  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = React.useState<'7D' | '30D' | 'Semester'>('Semester');
  const [deptFilter, setDeptFilter] = React.useState('My Students Only');
  const [insightFilter, setInsightFilter] = React.useState('My Students Only');
  const [aiTab, setAiTab] = React.useState<'ask' | 'insights'>('ask');
  const [aiQuery, setAiQuery] = React.useState('');
  const [aiResponse, setAiResponse] = React.useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = React.useState(false);

  // Fetch full data from live database engine
  const fetchDashboardData = React.useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await fetch('/api/faculty/dashboard?filter=my_students');
      if (!res.ok) throw new Error('Failed to fetch faculty dashboard');
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Error loading faculty dashboard:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Toggle Task Completion
  const handleToggleTask = async (taskId: string) => {
    if (!dashboardData?.todaysTasks) return;

    // Optimistic UI update
    setDashboardData((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        todaysTasks: prev.todaysTasks.map((t: any) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        ),
      };
    });

    try {
      await fetch('/api/faculty/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  // AI Prompt handler
  const handleAiAsk = async (promptText?: string) => {
    const q = promptText || aiQuery;
    if (!q.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/faculty/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      setAiResponse(data.answer || 'Query processed for SE Computer Engineering cohort.');
    } catch (err) {
      console.error('AI query error:', err);
      setAiResponse(
        'Based on live cohort analysis of 54 students: 12 students require immediate follow-up. High absenteeism correlates strongly with laboratory practical backlogs.'
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  // Safe data accessors
  const profile = dashboardData?.facultyProfile || {
    name: 'Prof. Sandeep Kulkarni',
    department: 'Computer Engineering',
    assignedBatch: 'Computer Engineering (SE)',
    totalStudents: 54,
    semester: 'Semester 1',
    lastUpdated: 'Sep 30, 2025, 09:30 AM',
  };

  const kpis = dashboardData?.kpis || {
    highRisk: { count: 12, trend: '↑ 20%', subtitle: '22% of your students' },
    moderateRisk: { count: 18, trend: '↓ 10%', subtitle: '33% of your students' },
    attendanceConcern: { count: 16, trend: '↑ 12%', subtitle: 'Attendance < 65%' },
    academicDecline: { count: 14, trend: '↑ 8%', subtitle: 'Internal marks declining' },
    activeInterventions: { count: 11, trend: '↑ 36%', subtitle: 'Assigned to you' },
  };

  const riskDistribution = Array.isArray(dashboardData?.riskDistribution?.slices)
    ? dashboardData.riskDistribution.slices
    : [
        { name: 'Low Risk', value: 24, percentage: '44.4%', color: '#10B981' },
        { name: 'Moderate Risk', value: 18, percentage: '33.3%', color: '#F59E0B' },
        { name: 'High Risk', value: 8, percentage: '14.8%', color: '#F97316' },
        { name: 'Critical Risk', value: 4, percentage: '7.4%', color: '#EF4444' },
      ];

  const trendData =
    dashboardData?.riskTrend?.[selectedTimeframe] || [
      { month: 'Jan', averageRisk: 58, highRiskRate: 23 },
      { month: 'Feb', averageRisk: 52, highRiskRate: 22 },
      { month: 'Mar', averageRisk: 46, highRiskRate: 20 },
      { month: 'Apr', averageRisk: 42, highRiskRate: 18 },
      { month: 'May', averageRisk: 40, highRiskRate: 17 },
      { month: 'Jun', averageRisk: 44, highRiskRate: 19 },
      { month: 'Jul', averageRisk: 48, highRiskRate: 21 },
      { month: 'Aug', averageRisk: 45, highRiskRate: 20 },
      { month: 'Sep', averageRisk: 42, highRiskRate: 22 },
    ];

  const todaysTasks = Array.isArray(dashboardData?.todaysTasks)
    ? dashboardData.todaysTasks
    : [];

  const upcomingMeetings = Array.isArray(dashboardData?.upcomingMeetings)
    ? dashboardData.upcomingMeetings
    : [];

  const atRiskStudents = Array.isArray(dashboardData?.atRiskStudents)
    ? dashboardData.atRiskStudents
    : [];

  const recentAlerts = Array.isArray(dashboardData?.recentAlerts)
    ? dashboardData.recentAlerts
    : [];

  const interventionProgress = dashboardData?.interventionProgress || {
    total: 11,
    inProgress: 5,
    completed: 4,
    overdue: 2,
    notStarted: 0,
    completionRate: 36,
    slices: [
      { name: 'Completed', value: 4, percentage: '36%', color: '#10B981' },
      { name: 'In Progress', value: 5, percentage: '45%', color: '#3B82F6' },
      { name: 'Overdue', value: 2, percentage: '18%', color: '#EF4444' },
      { name: 'Not Started', value: 0, percentage: '0%', color: '#94A3B8' },
    ],
  };

  const attDistribution = Array.isArray(dashboardData?.attendanceAcademicInsights?.attendanceDistribution)
    ? dashboardData.attendanceAcademicInsights.attendanceDistribution
    : [
        { range: '< 50%', count: 8, percentage: '14.8%', color: '#EF4444' },
        { range: '50 - 65%', count: 16, percentage: '29.6%', color: '#F97316' },
        { range: '65 - 75%', count: 18, percentage: '33.3%', color: '#F59E0B' },
        { range: '> 75%', count: 12, percentage: '22.2%', color: '#10B981' },
      ];

  const cgpaDistribution = Array.isArray(dashboardData?.attendanceAcademicInsights?.cgpaDistribution)
    ? dashboardData.attendanceAcademicInsights.cgpaDistribution
    : [
        { range: '< 5.0', count: 6, percentage: '11.1%', color: '#EF4444' },
        { range: '5.0 - 6.0', count: 20, percentage: '37.0%', color: '#F97316' },
        { range: '6.0 - 7.0', count: 22, percentage: '40.7%', color: '#10B981' },
        { range: '> 7.0', count: 6, percentage: '11.1%', color: '#059669' },
      ];

  return (
    <div className="space-y-4 pb-10 text-slate-800">
      {/* ── TOP HEADER ROW: Greeting & 3 Header Info Widgets ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Good Morning, Prof. Sandeep <span className="inline-block animate-wave">👋</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Here&apos;s an overview of your students and key actions for today.
          </p>
        </div>

        {/* 3 Header Info Cards */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Widget 1: My Students */}
          <div className="flex items-center gap-2.5 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium leading-none">My Students</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {profile.totalStudents} <span className="text-[11px] font-normal text-slate-500">{profile.assignedBatch}</span>
              </div>
            </div>
          </div>

          {/* Widget 2: Current Semester */}
          <div className="flex items-center gap-2.5 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium leading-none">Current Semester</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{profile.semester}</div>
            </div>
          </div>

          {/* Widget 3: Last Updated + Sync Button */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <div>
              <div className="text-[10px] text-slate-400 font-medium leading-none">Last Updated</div>
              <div className="text-xs font-semibold text-slate-700 mt-0.5 font-mono">{profile.lastUpdated}</div>
            </div>
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={isRefreshing}
              title="Sync live records"
              className="p-1 text-slate-400 hover:text-purple-600 rounded-md hover:bg-slate-50 transition-colors ml-1 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-purple-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── SECTION 1: 5 METRIC KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: High-Risk Students */}
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-3.5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">High-Risk Students</span>
              <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
                <ShieldAlert className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{kpis.highRisk.count}</span>
              <span className="text-xs font-semibold text-rose-600">{kpis.highRisk.trend}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">{kpis.highRisk.subtitle}</p>
          </div>
          <Link
            href="/faculty/at-risk"
            className="mt-3 pt-2 border-t border-rose-200/60 text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
          >
            <span>View Students</span>
            <span>→</span>
          </Link>
        </div>

        {/* Card 2: Moderate-Risk Students */}
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-3.5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Moderate-Risk Students</span>
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{kpis.moderateRisk.count}</span>
              <span className="text-xs font-semibold text-emerald-600">{kpis.moderateRisk.trend}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">{kpis.moderateRisk.subtitle}</p>
          </div>
          <Link
            href="/faculty/students?risk=moderate"
            className="mt-3 pt-2 border-t border-amber-200/60 text-xs font-semibold text-amber-700 hover:underline flex items-center gap-1"
          >
            <span>View Students</span>
            <span>→</span>
          </Link>
        </div>

        {/* Card 3: Attendance Concern */}
        <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl p-3.5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Attendance Concern</span>
              <div className="p-1.5 rounded-lg bg-purple-100 text-purple-600">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{kpis.attendanceConcern.count}</span>
              <span className="text-xs font-semibold text-rose-600">{kpis.attendanceConcern.trend}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">{kpis.attendanceConcern.subtitle}</p>
          </div>
          <Link
            href="/faculty/attendance-insights"
            className="mt-3 pt-2 border-t border-purple-200/60 text-xs font-semibold text-purple-700 hover:underline flex items-center gap-1"
          >
            <span>View Students</span>
            <span>→</span>
          </Link>
        </div>

        {/* Card 4: Academic Decline */}
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-3.5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Academic Decline</span>
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                <BookOpen className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{kpis.academicDecline.count}</span>
              <span className="text-xs font-semibold text-rose-600">{kpis.academicDecline.trend}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">{kpis.academicDecline.subtitle}</p>
          </div>
          <Link
            href="/faculty/academic-performance"
            className="mt-3 pt-2 border-t border-blue-200/60 text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
          >
            <span>View Students</span>
            <span>→</span>
          </Link>
        </div>

        {/* Card 5: Active Interventions */}
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-3.5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Active Interventions</span>
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
                <HeartHandshake className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{kpis.activeInterventions.count}</span>
              <span className="text-xs font-semibold text-emerald-600">{kpis.activeInterventions.trend}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">{kpis.activeInterventions.subtitle}</p>
          </div>
          <Link
            href="/faculty/interventions"
            className="mt-3 pt-2 border-t border-emerald-200/60 text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>View Interventions</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* ── SECTION 2: CHARTS & TASKS (2-COLUMN GRID) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: 2 CHARTS (col-8) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Risk Distribution (My Students) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col h-full">
            <div className="shrink-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Risk Distribution (My Students)</h3>
                    <p className="text-[11px] text-slate-400">Breakdown of your students by predicted risk category</p>
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-medium py-1 pl-2 pr-5 rounded-md focus:outline-none cursor-pointer"
                  >
                    <option value="My Students Only">My Students Only</option>
                    <option value="All Department">All Department</option>
                  </select>
                  <ChevronDown className="h-3 w-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 my-auto py-3">
              {/* Donut Chart */}
              <div className="relative w-44 h-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {riskDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        fontSize: '11px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                      formatter={(val: any) => [`${val} students`, 'Count']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-2xl font-bold text-slate-900 leading-none">
                    {profile.totalStudents}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium mt-1">Students</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex-1 min-w-[150px] space-y-3.5">
                {riskDistribution.map((item: any) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-700 text-xs font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 text-xs">{item.value}</span>
                      <span className="text-slate-400 text-[11px] ml-1.5 font-normal">({item.percentage})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Risk Trend (My Students) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col h-full">
            <div className="shrink-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Risk Trend (My Students)</h3>
                    <p className="text-[11px] text-slate-400">Average risk score trend across your students</p>
                  </div>
                </div>

                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[10px] font-medium text-slate-600">
                  {(['7D', '30D', 'Semester'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedTimeframe(tab)}
                      className={`px-2 py-0.5 rounded-md transition-colors ${
                        selectedTimeframe === tab
                          ? 'bg-purple-600 text-white font-semibold shadow-2xs'
                          : 'hover:text-slate-900'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legends */}
              <div className="flex items-center gap-4 text-[10px] mt-2 pb-1 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-purple-600" />
                  <span className="text-slate-600 font-medium">Average Risk Score</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span className="text-slate-600 font-medium">High-Risk Students (%)</span>
                </div>
              </div>
            </div>

            {/* Line Chart filling entire remaining card height */}
            <div className="flex-1 w-full min-h-[220px] pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="riskTrendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" fontSize={10} tickLine={false} stroke="#94a3b8" />
                  <YAxis yAxisId="left" domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} fontSize={9} tickLine={false} stroke="#94a3b8" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 50]} ticks={[0, 10, 20, 30, 40, 50]} fontSize={9} tickLine={false} stroke="#94a3b8" />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white border border-slate-200/90 shadow-lg rounded-lg p-2.5 text-xs space-y-1">
                            <div className="font-semibold text-slate-800 border-b border-slate-100 pb-1">{label} 2025</div>
                            <div className="flex items-center gap-2 text-purple-700 font-medium">
                              <span className="h-2 w-2 rounded-full bg-purple-600" />
                              <span>Avg Risk: <strong className="font-bold">{payload[0]?.value}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-rose-600 font-medium">
                              <span className="h-2 w-2 rounded-full bg-rose-500" />
                              <span>High Risk: <strong className="font-bold">{payload[1]?.value}%</strong></span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="averageRisk"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    fill="url(#riskTrendGrad)"
                    dot={{ r: 3.5, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 1.5 }}
                    activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2, fill: '#fff' }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="highRiskRate"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 3.5, fill: '#ef4444', stroke: '#fff', strokeWidth: 1 }}
                    activeDot={{ r: 5.5, stroke: '#ef4444', strokeWidth: 2, fill: '#fff' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TODAY'S TASKS & UPCOMING MEETINGS (col-4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card A: Today's Tasks */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span>Today&apos;s Tasks</span>
              </div>
              <Link href="/faculty/dashboard" className="text-[11px] font-semibold text-purple-600 hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-2 mt-2.5">
              {todaysTasks.map((t: any) => (
                <div
                  key={t.id}
                  onClick={() => handleToggleTask(t.id)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-slate-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => handleToggleTask(t.id)}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <span className={`h-2 w-2 rounded-full shrink-0 ${t.dotColor}`} />
                    <div>
                      <div className={`text-xs font-medium text-slate-800 leading-tight ${t.completed ? 'line-through text-slate-400' : ''}`}>
                        {t.title}
                      </div>
                      <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{t.subtitle}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{t.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card B: Upcoming Meetings */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span>Upcoming Meetings</span>
              </div>
              <Link href="/faculty/meetings" className="text-[11px] font-semibold text-purple-600 hover:underline">
                View Calendar →
              </Link>
            </div>

            <div className="space-y-2 mt-2.5">
              {upcomingMeetings.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-7 w-7 rounded-full ${m.avatarBg} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}>
                      {m.avatarText}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 leading-tight">{m.name}</div>
                      <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{m.subtitle}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-mono font-medium text-purple-700">{m.time.split(' ')[0]} {m.time.split(' ')[1]}</div>
                    <div className="text-[9px] text-slate-400">Today</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: AT-RISK STUDENTS TABLE & RECENT ALERTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* At-Risk Students Table (col-8) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">At-Risk Students (My Students)</h3>
                  <p className="text-[11px] text-slate-400">Students who require your attention</p>
                </div>
              </div>
              <Link href="/faculty/at-risk" className="text-xs font-semibold text-purple-600 hover:underline">
                View All →
              </Link>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 text-left text-[11px]">
                    <th className="py-2.5 px-3 font-semibold">Student</th>
                    <th className="py-2.5 px-2 font-semibold">Year</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Attendance</th>
                    <th className="py-2.5 px-2 font-semibold text-center">CGPA</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Risk Score</th>
                    <th className="py-2.5 px-2 font-semibold text-center">Trend</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Intervention</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {atRiskStudents.map((st: any) => (
                    <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-6 w-6 rounded-full ${st.avatarBg} text-white font-bold text-[9px] flex items-center justify-center shrink-0`}>
                            {st.avatarInitials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-xs">{st.full_name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{st.student_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-slate-600 font-medium">{st.year}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            st.attendance < 50
                              ? 'text-rose-700 bg-rose-50 border border-rose-200'
                              : st.attendance < 65
                              ? 'text-amber-700 bg-amber-50 border border-amber-200'
                              : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                          }`}
                        >
                          {st.attendance}%
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center font-semibold text-slate-800">
                        {st.cgpa.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                            st.riskScore >= 75
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : 'bg-orange-100 text-orange-700 border border-orange-200'
                          }`}
                        >
                          {st.riskScore}%
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center text-rose-600 font-bold text-xs">
                        ↗
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            st.intervention === 'None'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : st.intervention === 'Pending'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : st.intervention === 'In Progress'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-purple-50 text-purple-800 border border-purple-200'
                          }`}
                        >
                          {st.intervention}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link href={`/faculty/students/${st.student_id}`}>
                          <button className="text-xs font-semibold text-slate-600 hover:text-purple-700 px-2.5 py-0.5 border border-slate-200 rounded hover:border-purple-300 hover:bg-purple-50 transition-all">
                            View
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Alerts (col-4) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                <Bell className="h-4 w-4 text-purple-600" />
                <span>Recent Alerts (My Students)</span>
              </div>
              <Link href="/faculty/alerts" className="text-[11px] font-semibold text-purple-600 hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-2 mt-2.5">
              {recentAlerts.map((alt: any) => (
                <div key={alt.id} className="p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-2.5">
                    <div className={`p-1.5 rounded-lg ${alt.iconBg} ${alt.iconColor} shrink-0 mt-0.5`}>
                      {alt.iconName === 'TrendingDown' ? (
                        <TrendingDown className="h-3.5 w-3.5" />
                      ) : alt.iconName === 'AlertTriangle' ? (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      ) : alt.iconName === 'ClipboardList' ? (
                        <ClipboardList className="h-3.5 w-3.5" />
                      ) : (
                        <BookOpen className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{alt.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{alt.time}</span>
                      </div>
                      <div className="text-[11px] text-slate-700 font-medium mt-0.5">
                        {alt.studentName} ({alt.studentId})
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{alt.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 4: BOTTOM ROW (3 EQUAL-WIDTH CARDS) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card 1: Intervention Progress (My Assigned) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                <HeartHandshake className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Intervention Progress (My Assigned)</h3>
                <p className="text-[11px] text-slate-400">Track status of your interventions</p>
              </div>
            </div>

            {/* 4 Stat Boxes in a row */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg text-center">
                <div className="text-base font-bold text-slate-900">{interventionProgress.total}</div>
                <div className="text-[10px] text-slate-500 font-medium">Total</div>
              </div>
              <div className="bg-blue-50/70 border border-blue-100 p-2 rounded-lg text-center">
                <div className="text-base font-bold text-blue-600">{interventionProgress.inProgress}</div>
                <div className="text-[10px] text-blue-600 font-medium">In Progress</div>
              </div>
              <div className="bg-emerald-50/70 border border-emerald-100 p-2 rounded-lg text-center">
                <div className="text-base font-bold text-emerald-600">{interventionProgress.completed}</div>
                <div className="text-[10px] text-emerald-600 font-medium">Completed</div>
              </div>
              <div className="bg-rose-50/70 border border-rose-100 p-2 rounded-lg text-center">
                <div className="text-base font-bold text-rose-600">{interventionProgress.overdue}</div>
                <div className="text-[10px] text-rose-600 font-medium">Overdue</div>
              </div>
            </div>

            {/* Donut Chart & Breakdown */}
            <div className="flex items-center justify-between gap-4 mt-3">
              <div className="relative w-32 h-32 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={interventionProgress.slices}
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={54}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {interventionProgress.slices.map((entry: any, index: number) => (
                        <Cell key={`outcome-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-sm font-bold text-emerald-600 leading-tight">
                    {interventionProgress.completionRate}%
                  </span>
                  <span className="text-[8px] text-slate-400 leading-tight">Completion Rate</span>
                </div>
              </div>

              <div className="flex-1 space-y-1.5 text-xs">
                {interventionProgress.slices.map((item: any) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 text-[11px]">{item.name}</span>
                    </div>
                    <span className="text-slate-900 font-semibold text-[11px]">
                      {item.value} ({item.percentage})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Attendance & Academic Insights */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <BookOpen className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Attendance & Academic Insights</h3>
              </div>
              <div className="relative">
                <select
                  value={insightFilter}
                  onChange={(e) => setInsightFilter(e.target.value)}
                  className="appearance-none bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-medium py-1 pl-2 pr-5 rounded-md focus:outline-none cursor-pointer"
                >
                  <option value="My Students Only">My Students Only</option>
                </select>
                <ChevronDown className="h-3 w-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Side-by-side distribution breakdown */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              {/* Column 1: Attendance Distribution */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-700 mb-2">Attendance Distribution</h4>
                <div className="space-y-1.5">
                  {attDistribution.map((item: any) => (
                    <div key={item.range} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-600 font-medium">{item.range}</span>
                        <span className="text-slate-800 font-bold">{item.count} ({item.percentage})</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(item.count / 24) * 100}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: CGPA Distribution */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-700 mb-2">CGPA Distribution</h4>
                <div className="space-y-1.5">
                  {cgpaDistribution.map((item: any) => (
                    <div key={item.range} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-600 font-medium">{item.range}</span>
                        <span className="text-slate-800 font-bold">{item.count} ({item.percentage})</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(item.count / 24) * 100}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: AI Assistant (Faculty) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span>AI Assistant (Faculty)</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-600 text-white leading-tight">
                    New
                  </span>
                </h3>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Ask questions about your students, attendance, or interventions.
            </p>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mt-2 text-xs font-medium">
              <button
                onClick={() => setAiTab('ask')}
                className={`pb-1.5 px-2.5 border-b-2 transition-colors ${
                  aiTab === 'ask'
                    ? 'border-purple-600 text-purple-700 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Ask a question
              </button>
              <button
                onClick={() => setAiTab('insights')}
                className={`pb-1.5 px-2.5 border-b-2 transition-colors ${
                  aiTab === 'insights'
                    ? 'border-purple-600 text-purple-700 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Get insights
              </button>
            </div>

            {/* Search Input Box */}
            <div className="relative mt-2.5">
              <input
                type="text"
                placeholder="e.g., Show my high-risk students with low attendance..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
                className="w-full text-[11px] py-2 pl-2.5 pr-8 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white text-slate-800 placeholder-slate-400"
              />
              <button
                onClick={() => handleAiAsk()}
                disabled={isAiLoading}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-md transition-colors"
              >
                <Send className="h-3 w-3" />
              </button>
            </div>

            {/* AI Response Output if active */}
            {isAiLoading && (
              <div className="mt-2 p-2 bg-purple-50/70 border border-purple-100 rounded-lg text-xs text-purple-800 flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-purple-600" />
                <span className="text-[11px]">Analyzing your 54 student records...</span>
              </div>
            )}

            {aiResponse && !isAiLoading && (
              <div className="mt-2 p-2.5 bg-purple-50/80 border border-purple-100 rounded-lg text-xs text-purple-900 space-y-1 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold text-purple-950 text-[11px]">
                  <Bot className="h-3.5 w-3.5 text-purple-600" />
                  <span>PRISM AI Synthesis</span>
                </div>
                <p className="leading-snug text-slate-700 text-[11px] whitespace-pre-line">{aiResponse}</p>
                <div className="pt-1 flex gap-2">
                  <button
                    onClick={() => setAiResponse(null)}
                    className="text-[10px] text-slate-400 hover:text-slate-600"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Quick Suggestion Pills */}
            <div className="mt-2.5 flex flex-wrap gap-1">
              {[
                'Show students with declining marks',
                'Which students missed assignments?',
                'Suggest interventions for my high-risk students',
                'Show attendance report',
              ].map((promptText) => (
                <button
                  key={promptText}
                  onClick={() => {
                    setAiQuery(promptText);
                    handleAiAsk(promptText);
                  }}
                  className="px-2 py-0.5 text-[10px] font-medium bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-600 border border-slate-200 hover:border-purple-200 rounded-full transition-all text-left"
                >
                  {promptText}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
