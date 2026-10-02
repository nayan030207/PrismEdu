'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { InsightBadge } from '@/components/ui/insight-badge';
import { PriorityActionCenter } from '@/components/admin/priority-action-center';
import {
  Users,
  GraduationCap,
  AlertTriangle,
  HeartHandshake,
  BookOpen,
  CalendarX2,
  BadgePercent,
  Briefcase,
  Search,
  RefreshCw,
  Eye,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  ArrowRight,
  Database,
  Zap,
  Target,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';
import type { InsightLevel } from '@/lib/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = React.useState<any>(null);
  const [students, setStudents] = React.useState<any[]>([]);
  const [riskDistribution, setRiskDistribution] = React.useState<any[]>([]);
  const [riskTrend, setRiskTrend] = React.useState<any[]>([]);
  const [departmentRisk, setDepartmentRisk] = React.useState<any[]>([]);
  const [topRiskFactors, setTopRiskFactors] = React.useState<any[]>([]);
  const [dataQuality, setDataQuality] = React.useState<any>(null);
  const [emergingRisk, setEmergingRisk] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [lastRefresh, setLastRefresh] = React.useState<Date>(new Date());

  const [activeCategory, setActiveCategory] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [deptFilter, setDeptFilter] = React.useState('all');
  const [trendTimeframe, setTrendTimeframe] = React.useState('30d');

  const fetchAll = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [dashRes, stuRes, distRes, trendRes, deptRes, factorsRes, dqRes, emergingRes] =
        await Promise.all([
          fetch('/api/admin/dashboard').then((r) => r.json()),
          fetch('/api/admin/students').then((r) => r.json()),
          fetch('/api/analytics/risk-distribution').then((r) => r.json()),
          fetch(`/api/analytics/risk-trend?timeframe=${trendTimeframe}`).then((r) => r.json()),
          fetch('/api/analytics/risk-by-department').then((r) => r.json()),
          fetch('/api/analytics/top-risk-factors').then((r) => r.json()),
          fetch('/api/analytics/data-quality').then((r) => r.json()),
          fetch('/api/admin/emerging-risk?limit=5').then((r) => r.json()),
        ]);

      if (dashRes.stats) setStats(dashRes.stats);
      if (stuRes.students) setStudents(stuRes.students);
      if (distRes.distribution) setRiskDistribution(distRes.distribution);
      if (trendRes.trend) setRiskTrend(trendRes.trend);
      if (deptRes.departments) setDepartmentRisk(deptRes.departments);
      if (factorsRes.topFactors) setTopRiskFactors(factorsRes.topFactors);
      if (dqRes.report) setDataQuality(dqRes.report);
      if (emergingRes.emergingStudents) setEmergingRisk(emergingRes.emergingStudents);
      setLastRefresh(new Date());
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [trendTimeframe]);

  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (isLoading && !stats) return <DashboardSkeleton />;

  const s = stats || {};

  // Filter students table
  const filteredStudents = students.filter((st) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !(st.full_name || '').toLowerCase().includes(q) &&
        !(st.student_id || '').toLowerCase().includes(q) &&
        !(st.email || '').toLowerCase().includes(q)
      )
        return false;
    }
    if (deptFilter !== 'all') {
      if (!(st.department || '').toLowerCase().includes(deptFilter.toLowerCase())) return false;
    }
    const ins = st.insight || {};
    const att = st.attendance_rate ?? st.attendance_percentage ?? 82;
    const backlogs = st.academic_backlogs ?? st.previous_backlogs ?? 0;
    switch (activeCategory) {
      case 'critical': return att < 65 || backlogs >= 2;
      case 'high': return att < 75;
      case 'academic': return ins.academic === 'attention_required' || ins.academic === 'critical';
      case 'attendance': return ins.attendance === 'declining' || ins.attendance === 'critical' || att < 75;
      case 'financial': return ins.financial === 'attention_required' || ins.financial === 'declining';
      default: return true;
    }
  });

  const getRiskBadge = (cat: string) => {
    if (cat === 'CRITICAL') return 'bg-red-100 text-red-700 border-red-200';
    if (cat === 'HIGH') return 'bg-orange-100 text-orange-700 border-orange-200';
    if (cat === 'MODERATE') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-emerald-50 text-emerald-700';
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Institutional Early Warning & Intervention Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Last refreshed: {lastRefresh.toLocaleTimeString()} · Data → Prediction → Alert → Intervention → Outcome
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <Link href="/admin/faculty">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <GraduationCap className="h-4 w-4 text-indigo-600" />
              Faculty
            </Button>
          </Link>
          <Link href="/admin/students">
            <Button size="sm" className="gap-1.5 text-xs">
              <Users className="h-4 w-4" />
              Students
            </Button>
          </Link>
        </div>
      </div>

      {/* ── PRIORITY ACTION CENTER ─────────────────────────────── */}
      <PriorityActionCenter />

      {/* ── KPI CARDS ─────────────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <BarChart3 className="h-3.5 w-3.5" /> Institutional KPIs
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <div onClick={() => setActiveCategory('all')} className="cursor-pointer">
            <StatCard
              title="Total Active Students"
              value={s.totalStudents || 0}
              icon={<Users className="h-5 w-5" />}
              color="indigo"
              description="Enrolled this academic year"
            />
          </div>
          <div onClick={() => setActiveCategory('critical')} className="cursor-pointer">
            <StatCard
              title="High-Risk Students"
              value={s.highRiskStudents || 0}
              icon={<ShieldAlert className="h-5 w-5" />}
              color="red"
              description="Risk score ≥ 60% (High + Critical)"
              trend={s.highRiskStudents > 0 ? { value: `${s.criticalRiskStudents || 0} critical`, up: false } : undefined}
            />
          </div>
          <div className="cursor-pointer">
            <StatCard
              title="Emerging Risk"
              value={s.emergingRiskStudents || 0}
              icon={<TrendingUp className="h-5 w-5" />}
              color="amber"
              description="Risk rising fast (not yet high)"
            />
          </div>
          <div className="cursor-pointer">
            <StatCard
              title="Risk Increasing"
              value={s.studentsWithIncreasingRisk || 0}
              icon={<Activity className="h-5 w-5" />}
              color="amber"
              description="+15 pts since last prediction"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div onClick={() => setActiveCategory('all')} className="cursor-pointer">
            <StatCard
              title="Requiring Attention"
              value={s.studentsRequiringAttention || 0}
              icon={<AlertTriangle className="h-5 w-5" />}
              color="amber"
              description="Multi-factor risk signals"
            />
          </div>
          <div>
            <StatCard
              title="Active Interventions"
              value={s.activeInterventions || 0}
              icon={<HeartHandshake className="h-5 w-5" />}
              color="emerald"
              description="In progress or pending"
            />
          </div>
          <div>
            <StatCard
              title="Overdue Interventions"
              value={s.overdueInterventions || 0}
              icon={<CalendarX2 className="h-5 w-5" />}
              color={s.overdueInterventions > 0 ? 'red' : 'emerald'}
              description="Past follow-up date"
            />
          </div>
          <div onClick={() => setActiveCategory('all')} className="cursor-pointer">
            <StatCard
              title="Total Faculty"
              value={s.totalFaculty || 0}
              icon={<GraduationCap className="h-5 w-5" />}
              color="blue"
              description="Active mentors"
            />
          </div>
        </div>
      </div>

      {/* ── CHARTS ROW: RISK DISTRIBUTION + TREND ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Risk Distribution Pie */}
        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader className="pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900">Risk Distribution</CardTitle>
              <span className="text-[10px] text-slate-400 font-mono">{students.length} students</span>
            </div>
            <p className="text-xs text-slate-500">Click segment to filter student list</p>
          </CardHeader>
          <CardContent className="pt-4">
            {riskDistribution.length === 0 || riskDistribution.every((d) => d.count === 0) ? (
              <div className="flex flex-col items-center justify-center h-44 text-slate-400">
                <Database className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-xs font-medium">No student data available</p>
                <p className="text-[11px] text-slate-300 mt-1">Add students to see risk distribution</p>
              </div>
            ) : (
              <>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistribution.filter((d) => d.count > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={4}
                        dataKey="count"
                        onClick={(entry) => {
                          const catMap: Record<string, string> = {
                            LOW: 'all',
                            MODERATE: 'high',
                            HIGH: 'high',
                            CRITICAL: 'critical',
                          };
                          setActiveCategory(catMap[entry.category] || 'all');
                        }}
                        className="cursor-pointer"
                      >
                        {riskDistribution.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        formatter={(val: any) => [`${val} students`, 'Count']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs mt-2">
                  {riskDistribution.map((item) => (
                    <button
                      key={item.category}
                      onClick={() =>
                        setActiveCategory(
                          item.category === 'CRITICAL' ? 'critical' : item.category === 'HIGH' ? 'high' : 'all'
                        )
                      }
                      className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 text-left"
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-slate-600 text-[11px]">{item.label.split(' ')[0]}</span>
                      </div>
                      <span className="font-bold text-slate-900 font-mono">{item.count}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Risk Trend Line Chart */}
        <Card className="border-slate-200 lg:col-span-3">
          <CardHeader className="pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Institutional Risk Trajectory
                </CardTitle>
                <p className="text-xs text-slate-500">Avg predicted risk & high-risk student count</p>
              </div>
              <select
                value={trendTimeframe}
                onChange={(e) => setTrendTimeframe(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="semester">Semester</option>
                <option value="year">Academic Year</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {riskTrend.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-52 text-slate-400">
                <Activity className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-xs font-medium">No trend data available</p>
              </div>
            ) : (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={riskTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" fontSize={10} tickLine={false} stroke="#94a3b8" />
                    <YAxis fontSize={10} tickLine={false} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey="averageRisk"
                      name="Avg Risk %"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#8b5cf6' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="highRiskCount"
                      name="High-Risk Count"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#ef4444' }}
                      strokeDasharray="4 2"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── EMERGING RISK SECTION ─────────────────────────────── */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Emerging Risk Students</CardTitle>
                <p className="text-xs text-slate-500">Students not yet at high risk but whose indicators are worsening rapidly</p>
              </div>
            </div>
            <Link href="/admin/emerging-risk">
              <Button variant="outline" size="sm" className="text-xs h-8 gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {emergingRisk.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Zap className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm font-medium text-slate-500">No emerging-risk students detected</p>
              <p className="text-xs text-slate-400 mt-1">All students have stable or improving risk indicators</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="text-xs">Student</TableHead>
                  <TableHead className="text-xs">Department</TableHead>
                  <TableHead className="text-xs text-center">Current Risk</TableHead>
                  <TableHead className="text-xs text-center">Risk Change</TableHead>
                  <TableHead className="text-xs">Primary Driver</TableHead>
                  <TableHead className="text-right text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emergingRisk.map((st: any) => (
                  <TableRow key={st.id} className="hover:bg-amber-50/30">
                    <TableCell>
                      <div className="font-semibold text-slate-900 text-sm">{st.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{st.studentId}</div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">{st.department}</TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${getRiskBadge(st.riskLevel)}`}>
                        {st.currentRisk}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {st.riskChange > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-red-600">
                          <TrendingUp className="h-3 w-3" />+{st.riskChange}pts
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                        {st.primaryRiskDriver}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/faculty/students/${st.id}/analysis`}>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1 text-indigo-600">
                            <Eye className="h-3 w-3" /> View
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── DEPARTMENT RISK ANALYTICS ─────────────────────────── */}
      {departmentRisk.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader className="pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Department Risk Overview</CardTitle>
                <p className="text-xs text-slate-500">Risk concentration by department — click bar for drill-down</p>
              </div>
              <Link href="/admin/analytics/departments">
                <Button variant="outline" size="sm" className="text-xs h-8">
                  Full Analytics
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentRisk} margin={{ top: 5, right: 10, left: -20, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="department"
                    fontSize={9}
                    tickLine={false}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="moderateRisk" name="Moderate" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="highRisk" name="High" fill="#f97316" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="criticalRisk" name="Critical" fill="#ef4444" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── TOP RISK FACTORS ──────────────────────────────────── */}
      {topRiskFactors.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900">Top Institutional Risk Factors</CardTitle>
            <p className="text-xs text-slate-500">Factors contributing most to predicted dropout risk across all students</p>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {topRiskFactors.slice(0, 5).map((factor: any, i) => {
              const maxImportance = topRiskFactors[0]?.averageImportanceScore || 100;
              const pct = Math.round((factor.averageImportanceScore / maxImportance) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{factor.featureName}</span>
                    <span className="text-slate-500 font-mono">
                      {factor.affectedStudents} students · {factor.averageImportanceScore.toFixed(0)}% importance
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* ── DATA & MODEL HEALTH STRIP ─────────────────────────── */}
      {dataQuality && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4 border-slate-200 flex items-center gap-3">
            <Database className="h-5 w-5 text-indigo-400 shrink-0" />
            <div>
              <div className="text-lg font-black text-slate-900">{dataQuality.totalStudentRecords}</div>
              <div className="text-[10px] text-slate-500 font-medium">Total Records</div>
            </div>
          </Card>
          <Card className="p-4 border-slate-200 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <div>
              <div className="text-lg font-black text-emerald-700">
                {dataQuality.overallCompletenessPercentage}%
              </div>
              <div className="text-[10px] text-slate-500 font-medium">Data Completeness</div>
            </div>
          </Card>
          <Card className="p-4 border-slate-200 flex items-center gap-3">
            <CalendarX2 className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <div className="text-lg font-black text-amber-700">{dataQuality.missingAttendance}</div>
              <div className="text-[10px] text-slate-500 font-medium">Missing Attendance</div>
            </div>
          </Card>
          <Link href="/admin/data-quality" className="block">
            <Card className="p-4 border-dashed border-slate-200 flex items-center gap-3 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors cursor-pointer h-full">
              <Activity className="h-5 w-5 text-slate-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-indigo-600">Data Quality Center</div>
                <div className="text-[10px] text-slate-500">View full report →</div>
              </div>
            </Card>
          </Link>
        </div>
      )}

      {/* ── STUDENT TABLE ─────────────────────────────────────── */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Student Directory</h3>
            <p className="text-xs text-slate-500">
              Showing {filteredStudents.length} of {students.length} students
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeCategory !== 'all' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setActiveCategory('all'); setSearchQuery(''); setDeptFilter('all'); }}
                className="text-xs gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Clear Filter
              </Button>
            )}
            <Link href="/admin/students">
              <Button size="sm" className="text-xs gap-1">
                Full Directory <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Category Filters */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'critical', 'high', 'academic', 'attendance', 'financial'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                activeCategory === cat
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300'
              }`}
            >
              {cat === 'all' ? 'All Students' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Search + Filter */}
        <Card className="border-slate-200 p-3 bg-slate-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="relative sm:col-span-2">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                placeholder="Search by name, ID, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />
            </div>
            <Select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Departments' },
                { value: 'Computer Science', label: 'CSE' },
                { value: 'Information Technology', label: 'IT' },
                { value: 'Civil', label: 'Civil Engineering' },
                { value: 'Mechanical', label: 'Mechanical' },
                { value: 'Electrical', label: 'Electrical' },
              ]}
            />
          </div>
        </Card>

        <Card className="border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs">Student</TableHead>
                <TableHead className="text-xs">Department & Year</TableHead>
                <TableHead className="text-xs">Attendance</TableHead>
                <TableHead className="text-xs">CGPA / Backlogs</TableHead>
                <TableHead className="text-xs">Risk Indicators</TableHead>
                <TableHead className="text-right text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400 text-sm">
                    {students.length === 0
                      ? 'No students enrolled yet. Import or add students to begin.'
                      : 'No students match the selected filter.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.slice(0, 15).map((st: any) => {
                  const att = st.attendance_rate ?? st.attendance_percentage ?? 82;
                  const cgpa = st.academic_cgpa ?? st.previous_gpa ?? 7.5;
                  const backlogs = st.academic_backlogs ?? st.previous_backlogs ?? 0;
                  const ins = st.insight || {};
                  return (
                    <TableRow key={st.id} className="hover:bg-slate-50/70 transition-colors">
                      <TableCell>
                        <div className="font-semibold text-slate-900 text-sm">{st.full_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {st.student_id} · {st.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium text-slate-800">{st.department}</div>
                        <div className="text-[11px] text-slate-500">Year {st.academic_year || 1}</div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            att < 75
                              ? 'bg-red-50 text-red-700'
                              : att < 85
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {att.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-semibold">{cgpa.toFixed(2)}</div>
                        {backlogs > 0 ? (
                          <div className="text-[11px] text-red-600 font-medium">{backlogs} backlog(s)</div>
                        ) : (
                          <div className="text-[11px] text-emerald-600">No backlogs</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          <InsightBadge level={(ins.academic || 'good') as InsightLevel} category="academic" />
                          <InsightBadge level={(ins.attendance || 'good') as InsightLevel} category="attendance" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/faculty/students/${st.id}/analysis`}>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-indigo-600 hover:bg-indigo-50">
                              <Eye className="h-3 w-3 mr-1" /> Analysis
                            </Button>
                          </Link>
                          <Link href={`/faculty/students/${st.id}`}>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                              Profile
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          {filteredStudents.length > 15 && (
            <div className="p-3 text-center bg-slate-50 border-t border-slate-100">
              <Link href={`/admin/students?category=${activeCategory}`}>
                <Button variant="outline" size="sm" className="text-xs gap-1">
                  View all {filteredStudents.length} students <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
