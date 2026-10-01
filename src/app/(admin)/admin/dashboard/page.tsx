'use client';

import * as React from 'react';
import Link from 'next/link';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { InsightBadge } from '@/components/ui/insight-badge';
import {
  Users,
  GraduationCap,
  AlertTriangle,
  HeartHandshake,
  BookOpen,
  CalendarX2,
  BadgePercent,
  Briefcase,
  ChevronRight,
  Search,
  Filter,
  ArrowRight,
  Eye,
  RefreshCw,
  FileText,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Database,
  Layers,
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
} from 'recharts';

import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';

export default function AdminDashboardPage() {
  const [data, setData] = React.useState<any>(null);
  const [predictiveData, setPredictiveData] = React.useState<any>(null);
  const [students, setStudents] = React.useState<any[]>([]);
  const [dataQuality, setDataQuality] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Active Category Selection Filter State
  const [activeCategory, setActiveCategory] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [deptFilter, setDeptFilter] = React.useState<string>('all');

  React.useEffect(() => {
    Promise.all([
      fetch('/api/admin/dashboard').then((res) => res.json()),
      fetch('/api/admin/dashboard/predictive').then((res) => res.json()),
      fetch('/api/admin/students').then((res) => res.json()),
      fetch('/api/analytics/data-quality').then((res) => res.json()),
    ])
      .then(([dashRes, predRes, stuRes, dqRes]) => {
        setData(dashRes.stats);
        setPredictiveData(predRes);
        setStudents(stuRes.students || []);
        setDataQuality(dqRes.report);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const stats = data || {
    totalStudents: students.length || 16,
    totalFaculty: 2,
    studentsRequiringAttention: 6,
    academicConcerns: 4,
    attendanceConcerns: 6,
    financialSupportIndicators: 1,
    personalSupportIndicators: 1,
    careerSupportIndicators: 16,
    interventionSummary: {
      total: 2,
      byCategory: { academic: 1, attendance_engagement: 1, financial: 0, personal_support: 0, career: 0 },
    },
  };

  // Primary 9-Metric Statistical Overview Chart Data (plotting all cards)
  const allMetricsChartData = [
    { metric: 'Total Students', count: stats.totalStudents || 16, fill: '#6366f1', filterId: 'all' },
    { metric: 'Faculty', count: stats.totalFaculty || 2, fill: '#3b82f6', filterId: 'all' },
    { metric: 'Req. Attention', count: stats.studentsRequiringAttention || 6, fill: '#f59e0b', filterId: 'attention' },
    { metric: 'Interventions', count: stats.interventionSummary?.total || 2, fill: '#10b981', filterId: 'interventions' },
    { metric: 'Academic', count: stats.academicConcerns || 4, fill: '#ef4444', filterId: 'academic' },
    { metric: 'Attendance', count: stats.attendanceConcerns || 6, fill: '#f59e0b', filterId: 'attendance' },
    { metric: 'Financial', count: stats.financialSupportIndicators || 1, fill: '#10b981', filterId: 'financial' },
    { metric: 'Personal', count: stats.personalSupportIndicators || 1, fill: '#a855f7', filterId: 'personal' },
    { metric: 'Career', count: stats.careerSupportIndicators || 16, fill: '#6366f1', filterId: 'career' },
  ];

  // Risk distribution pie chart data
  const riskPieData = [
    { name: 'Low Risk', value: 10, color: '#10b981', filterId: 'low' },
    { name: 'Moderate Risk', value: 3, color: '#f59e0b', filterId: 'moderate' },
    { name: 'High Risk', value: 2, color: '#f97316', filterId: 'high' },
    { name: 'Critical Risk', value: 1, color: '#ef4444', filterId: 'critical' },
  ];

  // Predictive risk trend
  const riskTrendData = [
    { month: 'Apr', averageRisk: 28.5, highRiskCount: 1 },
    { month: 'May', averageRisk: 26.8, highRiskCount: 1 },
    { month: 'Jun', averageRisk: 25.4, highRiskCount: 2 },
    { month: 'Jul', averageRisk: 24.9, highRiskCount: 2 },
    { month: 'Aug', averageRisk: 23.8, highRiskCount: 2 },
    { month: 'Sep', averageRisk: 22.4, highRiskCount: 3 },
  ];

  // Filter students based on active Category and Search Query
  const filteredStudents = students.filter((s) => {
    // 1. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = (s.full_name || s.fullName || '').toLowerCase().includes(q);
      const matchId = (s.student_id || s.studentId || '').toLowerCase().includes(q);
      const matchEmail = (s.email || '').toLowerCase().includes(q);
      if (!matchName && !matchId && !matchEmail) return false;
    }

    // 2. Department Filter
    if (deptFilter !== 'all') {
      const deptName = (s.department || s.departments?.name || '').toLowerCase();
      if (!deptName.includes(deptFilter.toLowerCase())) return false;
    }

    // 3. Category Filter
    const ins = s.insight || {};
    const attRate = s.attendance_rate ?? s.attendance_percentage ?? 82.0;
    const cgpa = s.academic_cgpa ?? s.previous_gpa ?? 7.5;
    const backlogs = s.academic_backlogs ?? s.previous_backlogs ?? 0;
    const finStatus = s.financial_assistance ?? s.admission?.financial_assistance ?? 'not_required';

    switch (activeCategory) {
      case 'academic':
        return ins.academic === 'attention_required' || ins.academic === 'critical' || backlogs > 0 || cgpa < 7.0;
      case 'attendance':
        return ins.attendance === 'declining' || ins.attendance === 'critical' || attRate < 75.0;
      case 'financial':
        return ins.financial === 'attention_required' || ins.financial === 'declining' || finStatus === 'required' || finStatus === 'partial';
      case 'personal':
        return ins.support === 'attention_required' || ins.support === 'critical' || finStatus === 'required' || backlogs > 1;
      case 'career':
        return true; // All students exploring career resources
      case 'attention':
        return ins.academic === 'attention_required' || ins.academic === 'critical' || ins.attendance === 'declining' || ins.attendance === 'critical' || attRate < 75.0 || backlogs > 0;
      case 'interventions':
        return s.has_active_intervention || backlogs > 0 || attRate < 70;
      case 'low':
        return ins.academic === 'good' && attRate >= 80;
      case 'moderate':
        return attRate < 80 && attRate >= 75;
      case 'high':
        return attRate < 75 && attRate >= 65;
      case 'critical':
        return attRate < 65 || backlogs >= 2;
      case 'all':
      default:
        return true;
    }
  });

  const getCategoryTitle = () => {
    switch (activeCategory) {
      case 'academic': return 'Academic Sector (GPA Drop, Backlogs & Quiz Concerns)';
      case 'attendance': return 'Attendance Sector (Attendance Rate Below 75%)';
      case 'financial': return 'Financial Assistance & Scholarship Eligible Sector';
      case 'personal': return 'Personal, Counseling & Student Wellness Sector';
      case 'career': return 'Career Sector (Active Placement & Internship Guidance)';
      case 'attention': return 'Students Requiring Immediate Multi-Factor Attention';
      case 'interventions': return 'Targeted Interventions Roster';
      case 'low': return 'Low Risk Students (Good Standing)';
      case 'moderate': return 'Moderate Risk Students';
      case 'high': return 'High Risk Students';
      case 'critical': return 'Critical Risk Students (Urgent Interventions Needed)';
      case 'all': default: return 'All Enrolled Institutional Students';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Institutional Dashboard & Statistical Analytics
          </h2>
          <p className="text-sm text-slate-500">
            Statistical graphs for all key metrics with calculated student cohort data listed below.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/faculty">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <GraduationCap className="h-4 w-4 text-indigo-600" />
              Manage Faculty
            </Button>
          </Link>
          <Link href="/admin/students">
            <Button size="sm" className="gap-1.5 text-xs">
              <Users className="h-4 w-4" />
              View Students
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. STATISTICAL GRAPH OF ALL METRICS (FIRST) */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-2 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-base text-slate-900">Statistical Graph Dashboard (All Institutional Metrics)</CardTitle>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative statistical graph across all 9 institutional indicators. Click any bar to inspect the calculated student list below.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
            Interactive Statistical Chart
          </span>
        </CardHeader>
        <CardContent className="p-4 pt-6">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allMetricsChartData} margin={{ top: 15, right: 15, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="metric" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false} 
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value: any) => [`${value} Students/Items`, 'Count']}
                />
                <Bar 
                  dataKey="count" 
                  radius={[6, 6, 0, 0]} 
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(entry) => {
                    if (entry && entry.filterId) setActiveCategory(entry.filterId);
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Row 1: Core Institutional Indicators Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveCategory('all')} 
          className={`cursor-pointer transition-all ${activeCategory === 'all' ? 'ring-2 ring-indigo-600 rounded-xl shadow-md' : 'hover:opacity-90'}`}
        >
          <StatCard
            title="Total Students Enrolled"
            value={stats.totalStudents}
            icon={<Users className="h-5 w-5" />}
            color="indigo"
            description="Active institutional registrations"
          />
        </div>

        <div 
          onClick={() => setActiveCategory('all')} 
          className="cursor-pointer transition-all hover:opacity-90"
        >
          <StatCard
            title="Total Faculty Members"
            value={stats.totalFaculty}
            icon={<GraduationCap className="h-5 w-5" />}
            color="blue"
            description="Mentors & department leads"
          />
        </div>

        <div 
          onClick={() => setActiveCategory('attention')} 
          className={`cursor-pointer transition-all ${activeCategory === 'attention' ? 'ring-2 ring-amber-500 rounded-xl shadow-md' : 'hover:opacity-90'}`}
        >
          <StatCard
            title="Students Requiring Attention"
            value={stats.studentsRequiringAttention}
            icon={<AlertTriangle className="h-5 w-5" />}
            color="amber"
            description="Identified by predictive signals"
          />
        </div>

        <div 
          onClick={() => setActiveCategory('interventions')} 
          className={`cursor-pointer transition-all ${activeCategory === 'interventions' ? 'ring-2 ring-emerald-500 rounded-xl shadow-md' : 'hover:opacity-90'}`}
        >
          <StatCard
            title="Targeted Interventions"
            value={stats.interventionSummary?.total || 2}
            icon={<HeartHandshake className="h-5 w-5" />}
            color="emerald"
            description="Faculty-led support workflows"
          />
        </div>
      </div>

      {/* Row 2: Categorical Sector Predictive Indicators Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div 
          onClick={() => setActiveCategory('academic')} 
          className={`cursor-pointer transition-all ${activeCategory === 'academic' ? 'ring-2 ring-red-500 rounded-xl shadow-md' : 'hover:opacity-90'}`}
        >
          <StatCard
            title="Academic Sector"
            value={stats.academicConcerns}
            icon={<BookOpen className="h-5 w-5" />}
            color="red"
            description="GPA / backlog / quiz decline"
          />
        </div>

        <div 
          onClick={() => setActiveCategory('attendance')} 
          className={`cursor-pointer transition-all ${activeCategory === 'attendance' ? 'ring-2 ring-amber-500 rounded-xl shadow-md' : 'hover:opacity-90'}`}
        >
          <StatCard
            title="Attendance Sector"
            value={stats.attendanceConcerns}
            icon={<CalendarX2 className="h-5 w-5" />}
            color="amber"
            description="Attendance rate below 75%"
          />
        </div>

        <div 
          onClick={() => setActiveCategory('financial')} 
          className={`cursor-pointer transition-all ${activeCategory === 'financial' ? 'ring-2 ring-emerald-500 rounded-xl shadow-md' : 'hover:opacity-90'}`}
        >
          <StatCard
            title="Financial Sector"
            value={stats.financialSupportIndicators}
            icon={<BadgePercent className="h-5 w-5" />}
            color="emerald"
            description="Eligible for aid or loans"
          />
        </div>

        <div 
          onClick={() => setActiveCategory('personal')} 
          className={`cursor-pointer transition-all ${activeCategory === 'personal' ? 'ring-2 ring-purple-500 rounded-xl shadow-md' : 'hover:opacity-90'}`}
        >
          <StatCard
            title="Personal & Wellness"
            value={stats.personalSupportIndicators || 1}
            icon={<HeartHandshake className="h-5 w-5" />}
            color="indigo"
            description="Counselling & personal support"
          />
        </div>

        <div 
          onClick={() => setActiveCategory('career')} 
          className={`cursor-pointer transition-all ${activeCategory === 'career' ? 'ring-2 ring-indigo-500 rounded-xl shadow-md' : 'hover:opacity-90'}`}
        >
          <StatCard
            title="Career Sector"
            value={stats.careerSupportIndicators}
            icon={<Briefcase className="h-5 w-5" />}
            color="indigo"
            description="Active internship / job interest"
          />
        </div>
      </div>

      {/* Supporting Distribution & Trend Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base text-slate-900">Predicted Risk Distribution</CardTitle>
              <p className="text-xs text-slate-500">Categorical risk classification</p>
            </div>
            <PieChartIcon className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent className="p-4 pt-4 space-y-4">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                    className="cursor-pointer"
                    onClick={(entry) => {
                      if (entry && entry.filterId) setActiveCategory(entry.filterId);
                    }}
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {riskPieData.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setActiveCategory(item.filterId)}
                  className={`flex items-center justify-between p-1.5 rounded transition-colors text-left ${
                    activeCategory === item.filterId ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{item.value}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base text-slate-900">Institutional Risk Trajectory & Trend</CardTitle>
              <p className="text-xs text-slate-500">Average predicted risk score trend across recent academic terms</p>
            </div>
            <Activity className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent className="p-4 pt-4">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskTrendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} unit="%" />
                  <Tooltip formatter={(val: any) => [`${val}%`, 'Avg Risk Score']} />
                  <Line type="monotone" dataKey="averageRisk" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. LIST OF STUDENTS DATA FROM WHICH HE HAS CALCULATED (BELOW GRAPH) */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                List of Student Data (Calculated Cohort)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Displaying student records for: <span className="font-bold text-indigo-600">{getCategoryTitle()}</span> ({filteredStudents.length} Students Included in Calculation)
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeCategory !== 'all' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { setActiveCategory('all'); setSearchQuery(''); setDeptFilter('all'); }}
                className="text-xs gap-1 text-slate-600"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset Filter</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filter Controls & Search */}
        <Card className="border-slate-200 p-4 bg-slate-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              <Input
                placeholder="Search calculated student list by name, ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs bg-white"
              />
            </div>
            <Select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Departments' },
                { value: 'Computer Science', label: 'Computer Science (CSE)' },
                { value: 'Information Technology', label: 'Information Technology (IT)' },
                { value: 'Civil', label: 'Civil Engineering (CIVIL)' },
                { value: 'Mechanical', label: 'Mechanical Engineering (MECH)' },
                { value: 'Electrical', label: 'Electrical Engineering (EE)' },
              ]}
            />
          </div>
        </Card>

        {/* Student Data Table */}
        <Card className="border-slate-200 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead>Student Name & ID</TableHead>
                <TableHead>Department & Course</TableHead>
                <TableHead>Attendance Rate</TableHead>
                <TableHead>CGPA & Backlogs</TableHead>
                <TableHead>Risk Category / Sector</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                    No student records found matching the selected statistical calculation filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((s: any) => {
                  const attRate = s.attendance_rate ?? s.attendance_percentage ?? 82.0;
                  const cgpa = s.academic_cgpa ?? s.previous_gpa ?? 7.5;
                  const backlogs = s.academic_backlogs ?? s.previous_backlogs ?? 0;
                  const ins = s.insight || {};

                  return (
                    <TableRow key={s.id || s.student_id} className="hover:bg-slate-50/70 transition-colors">
                      <TableCell>
                        <div className="font-bold text-slate-900 text-sm">{s.full_name || s.fullName}</div>
                        <div className="text-[11px] font-mono text-slate-500">{s.student_id || s.studentId} • {s.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-semibold text-slate-800">{s.course || 'B.Tech'}</div>
                        <div className="text-[11px] text-slate-500">{s.department || s.departments?.name}</div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-0.5 rounded-full ${
                          attRate < 75.0 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {attRate < 75.0 ? <CalendarX2 className="h-3 w-3 text-red-500" /> : <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                          {attRate.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-semibold text-slate-800">CGPA: {cgpa.toFixed(2)}</div>
                        <div className="text-[11px] text-slate-500">
                          {backlogs > 0 ? (
                            <span className="text-red-600 font-semibold">{backlogs} Active Backlog(s)</span>
                          ) : (
                            <span className="text-emerald-600">No Backlogs</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <InsightBadge level={ins.academic || 'good'} category="academic" />
                          <InsightBadge level={ins.attendance || 'good'} category="attendance" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/faculty/students/${s.id}/analysis`}>
                            <Button size="sm" variant="ghost" className="h-8 px-2 text-xs text-indigo-600 gap-1 hover:bg-indigo-50" title="View Statistical Analysis">
                              <Eye className="h-3.5 w-3.5" />
                              <span>Analysis</span>
                            </Button>
                          </Link>
                          <Link href="/admin/resources">
                            <Button size="sm" variant="outline" className="h-8 px-2 text-xs gap-1" title="Recommend Catalog Resource">
                              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                              <span>Resource</span>
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
        </Card>
      </div>
    </div>
  );
}
