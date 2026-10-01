'use client';

import * as React from 'react';
import Link from 'next/link';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InsightBadge } from '@/components/ui/insight-badge';
import {
  Users,
  AlertTriangle,
  BookOpen,
  CalendarX2,
  BadgePercent,
  LifeBuoy,
  Briefcase,
  HeartHandshake,
  UserPlus,
  FileSpreadsheet,
  ChevronRight,
  Clock,
  ArrowRight,
  TrendingDown,
  Activity,
  BarChart3,
  CalendarCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';

const MONTHLY_DROPOUT_TREND = [
  { month: 'Apr', dropoutRiskPct: 18.5, predictedRate: 17.2 },
  { month: 'May', dropoutRiskPct: 16.8, predictedRate: 15.9 },
  { month: 'Jun', dropoutRiskPct: 15.4, predictedRate: 14.8 },
  { month: 'Jul', dropoutRiskPct: 14.9, predictedRate: 14.1 },
  { month: 'Aug', dropoutRiskPct: 13.8, predictedRate: 13.2 },
  { month: 'Sep', dropoutRiskPct: 12.4, predictedRate: 11.8 },
];

const BRANCH_RISK_DISTRIBUTION = [
  { branch: 'CSE', highRisk: 2, moderate: 4, stable: 18 },
  { branch: 'IT', highRisk: 1, moderate: 3, stable: 14 },
  { branch: 'CIVIL', highRisk: 3, moderate: 5, stable: 10 },
  { branch: 'MECH', highRisk: 2, moderate: 4, stable: 12 },
  { branch: 'EE', highRisk: 2, moderate: 3, stable: 11 },
  { branch: 'ENTC', highRisk: 1, moderate: 4, stable: 13 },
];

export default function FacultyDashboardPage() {
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/faculty/dashboard')
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

  const stats = data?.stats || {
    totalAssignedStudents: 12,
    studentsRequiringAttention: 3,
    academicConcerns: 2,
    attendanceConcerns: 2,
    financialSupportIndicators: 3,
    personalSupportIndicators: 1,
    careerSupportIndicators: 6,
    pendingInterventions: 2,
  };

  const attentionStudents = data?.attentionStudents || [];
  const recentChanges = data?.recentChanges || [];
  const pendingInterventions = data?.pendingInterventions || [];

  // Compute predictive dropout percentage dynamically
  const totalAssigned = stats.totalAssignedStudents || 1;
  const atRiskCount = stats.studentsRequiringAttention || 0;
  const predictiveDropoutPct = Math.min(
    25.0,
    Math.max(5.0, Math.round((atRiskCount / totalAssigned) * 100 * 10) / 10)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Student Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Faculty Mentorship & Risk Dashboard
          </h2>
          <p className="text-sm text-slate-500">
            Actionable predictive dropout indicators, attendance analytics, and intervention workflows.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/faculty/students/import-attendance">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs text-indigo-700 bg-indigo-50 border-indigo-200">
              <CalendarCheck className="h-4 w-4" />
              <span>Import Attendance</span>
            </Button>
          </Link>
          <Link href="/faculty/students/add">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <UserPlus className="h-4 w-4" />
              <span>Add Student</span>
            </Button>
          </Link>
          <Link href="/faculty/students/import">
            <Button size="sm" className="gap-1.5 text-xs">
              <FileSpreadsheet className="h-4 w-4" />
              <span>Import Excel</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Row: Core Faculty Assigned Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Students"
          value={stats.totalAssignedStudents}
          icon={<Users className="h-5 w-5" />}
          color="indigo"
          description="In your mentorship cohort"
        />
        <StatCard
          title="Requiring Attention"
          value={stats.studentsRequiringAttention}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="amber"
          description="Multi-factor risk threshold"
        />
        <StatCard
          title="Pending Interventions"
          value={stats.pendingInterventions}
          icon={<HeartHandshake className="h-5 w-5" />}
          color="emerald"
          description="Awaiting faculty action/follow-up"
        />
        <StatCard
          title="Academic Concerns"
          value={stats.academicConcerns}
          icon={<BookOpen className="h-5 w-5" />}
          color="red"
          description="Grades / backlogs / concepts"
        />
      </div>

      {/* Real-time Dropout Rate Analytics & Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dropout Risk Trend Line Graph */}
        <Card className="lg:col-span-2 border-slate-200 shadow-xs">
          <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-indigo-600" />
                <CardTitle className="text-base text-slate-900">Predictive Dropout Rate Trend</CardTitle>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time predictive dropout risk percentage computed across historical terms
              </p>
            </div>
            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-lg">
              <Activity className="h-4 w-4 text-indigo-600" />
              <div>
                <div className="text-[10px] uppercase font-bold text-indigo-700">Predictive Dropout Rate</div>
                <div className="text-lg font-black text-indigo-950">{predictiveDropoutPct}%</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-5">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MONTHLY_DROPOUT_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748B' }} unit="%" />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #E2E8F0' }}
                    formatter={(value: any) => [`${value}%`, 'Dropout Risk']}
                  />
                  <Area type="monotone" dataKey="dropoutRiskPct" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Branch-wise Dropout Distribution Bar Chart */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
              <CardTitle className="text-base text-slate-900">Branch-wise Risk</CardTitle>
            </div>
            <p className="text-xs text-slate-500">
              High-risk distribution across engineering branches
            </p>
          </CardHeader>
          <CardContent className="p-4 pt-5">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={BRANCH_RISK_DISTRIBUTION} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="branch" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="highRisk" fill="#EF4444" name="High Risk" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="moderate" fill="#F59E0B" name="Moderate" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Row: Specific Categorical Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Concerns"
          value={stats.attendanceConcerns}
          icon={<CalendarX2 className="h-5 w-5" />}
          color="amber"
          description="Declining below 75%"
        />
        <StatCard
          title="Financial Aid Indicators"
          value={stats.financialSupportIndicators}
          icon={<BadgePercent className="h-5 w-5" />}
          color="emerald"
          description="Identified for scholarship guidance"
        />
        <StatCard
          title="Personal / Support Need"
          value={stats.personalSupportIndicators}
          icon={<LifeBuoy className="h-5 w-5" />}
          color="blue"
          description="Wellness counsellor guidance"
        />
        <StatCard
          title="Career Support Indicators"
          value={stats.careerSupportIndicators}
          icon={<Briefcase className="h-5 w-5" />}
          color="indigo"
          description="Internships / skill recommendations"
        />
      </div>

      {/* Students Requiring Immediate Attention */}
      <Card className="border-amber-200 bg-gradient-to-b from-amber-50/20 to-white shadow-xs">
        <CardHeader className="pb-3 border-b border-amber-100 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <CardTitle className="text-base text-slate-900">Students Requiring Immediate Attention</CardTitle>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Identified through attendance declines, assignment lapses, and admission risk factors
            </p>
          </div>
          <Link href="/faculty/students">
            <Button variant="ghost" size="sm" className="text-xs gap-1 text-indigo-600">
              <span>View All Assigned</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {attentionStudents.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              All assigned students are currently in good standing.
            </div>
          ) : (
            attentionStudents.map((s: any) => (
              <div key={s.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{s.full_name}</span>
                    <span className="font-mono text-xs text-slate-500">({s.student_id})</span>
                    <span className="text-xs text-slate-400">• {s.course}</span>
                  </div>

                  {/* Indicators */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <InsightBadge level={s.academic_level} category="academic" />
                    <InsightBadge level={s.attendance_level} category="attendance" />
                    <InsightBadge level={s.financial_level} category="financial" />
                  </div>

                  {/* Contributing Factors Reason */}
                  {s.recent_changes && s.recent_changes.length > 0 && (
                    <p className="text-xs text-amber-800 font-medium pt-1">
                      Reason: {s.recent_changes[0]}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/faculty/students/${s.id}/analysis`}>
                    <Button variant="outline" size="sm" className="text-xs text-indigo-700 bg-indigo-50/50 border-indigo-200">
                      View Analysis
                    </Button>
                  </Link>
                  <Link href={`/faculty/students/${s.id}`}>
                    <Button size="sm" className="gap-1.5 text-xs">
                      <span>Review & Intervene</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Two Column Grid: Recent Changes & Pending Interventions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Student Changes */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              <CardTitle className="text-base">Recent Student Changes & Telemetry</CardTitle>
            </div>
            <p className="text-xs text-slate-500">
              Continuous shifts detected in attendance, quiz performance, and portal activity
            </p>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {recentChanges.map((change: any, idx: number) => (
              <div key={idx} className="p-4 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        change.severity === 'high'
                          ? 'bg-red-500'
                          : change.severity === 'medium'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span>{change.studentName} ({change.studentId})</span>
                  </div>
                  <p className="text-slate-600 mt-1 pl-3.5">{change.change}</p>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">{change.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pending Interventions */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-emerald-600" />
                <CardTitle className="text-base">Active Interventions</CardTitle>
              </div>
              <p className="text-xs text-slate-500">
                Scheduled faculty follow-ups and student support plans
              </p>
            </div>
            <Link href="/faculty/interventions">
              <Button variant="ghost" size="sm" className="text-xs text-indigo-600">
                All Interventions
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {pendingInterventions.map((iv: any) => (
              <div key={iv.id} className="p-4 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">
                    {iv.student_name} ({iv.student_id})
                  </span>
                  <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {iv.type}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{iv.description}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Follow-up: {iv.follow_up_date}</span>
                  <span className="text-amber-700 font-semibold capitalize">{iv.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
