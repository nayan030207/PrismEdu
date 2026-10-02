'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShieldAlert,
  ArrowLeft,
  AlertTriangle,
  TrendingUp,
  Search,
  CheckCircle2,
  Users,
  Eye,
  Activity,
  Filter,
} from 'lucide-react';

export default function RiskMonitorPage() {
  const [search, setSearch] = React.useState('');
  const [filterDept, setFilterDept] = React.useState('all');

  const monitoredStudents = [
    {
      id: 'STD001',
      name: 'Vishal More',
      dept: 'Mechanical Engineering',
      attendance: 52,
      cgpa: 5.8,
      riskScore: 82,
      trend: '+18%',
      status: 'Critical Attention',
      driver: 'Attendance drop < 55% & 2 Backlogs',
    },
    {
      id: 'STD002',
      name: 'Aarti Salunkhe',
      dept: 'Information Technology',
      attendance: 61,
      cgpa: 6.2,
      riskScore: 78,
      trend: '+15%',
      status: 'High Risk',
      driver: 'Recent test score slump',
    },
    {
      id: 'STD003',
      name: 'Karan Desai',
      dept: 'Civil Engineering',
      attendance: 48,
      cgpa: 5.4,
      riskScore: 76,
      trend: '+21%',
      status: 'Critical Attention',
      driver: 'Prolonged absenteeism & overdue fees',
    },
    {
      id: 'STD004',
      name: 'Neha Bhosale',
      dept: 'Computer Engineering',
      attendance: 59,
      cgpa: 6.8,
      riskScore: 72,
      trend: '+14%',
      status: 'High Risk',
      driver: 'Attendance warning & mentor flag',
    },
    {
      id: 'STD005',
      name: 'Rohit Pawar',
      dept: 'Electronics Engineering',
      attendance: 63,
      cgpa: 7.1,
      riskScore: 68,
      trend: '+12%',
      status: 'Moderate Risk',
      driver: 'Sudden engagement decline in lab',
    },
    {
      id: 'STD006',
      name: 'Rahul Patil',
      dept: 'Information Technology',
      attendance: 68,
      cgpa: 6.5,
      riskScore: 68,
      trend: '+23%',
      status: 'Emerging Risk',
      driver: 'Risk probability surged 23 pts',
    },
    {
      id: 'STD007',
      name: 'Sneha Jadhav',
      dept: 'Computer Engineering',
      attendance: 65,
      cgpa: 7.0,
      riskScore: 65,
      trend: '+21%',
      status: 'Emerging Risk',
      driver: 'Consecutive assignment misses',
    },
  ];

  const filtered = monitoredStudents.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.dept.toLowerCase().includes(search.toLowerCase());
    const matchesDept = filterDept === 'all' || s.dept.toLowerCase().includes(filterDept.toLowerCase());
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-rose-600" />
              Institutional Risk Monitor
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time tracking of student dropout vulnerabilities, risk surges, and algorithmic alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/dashboard">
            <Button variant="outline" size="sm" className="text-xs">
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/admin/priority-actions">
            <Button size="sm" className="text-xs bg-purple-600 hover:bg-purple-700 text-white">
              Priority Actions
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-slate-200 p-4 bg-white">
          <div className="text-xs text-slate-500 font-medium">Critical Risk Students</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">16</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Immediate intervention mandated</div>
        </Card>
        <Card className="border-slate-200 p-4 bg-white">
          <div className="text-xs text-slate-500 font-medium">High Risk Students</div>
          <div className="text-2xl font-bold text-orange-600 mt-1">68</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Active monitoring recommended</div>
        </Card>
        <Card className="border-slate-200 p-4 bg-white">
          <div className="text-xs text-slate-500 font-medium">Emerging Risk Students</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">196</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Risk increased &gt; 10% in 30 days</div>
        </Card>
        <Card className="border-slate-200 p-4 bg-white">
          <div className="text-xs text-slate-500 font-medium">Average Institutional Risk</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">42%</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">↓ 2.4% from previous semester</div>
        </Card>
      </div>

      {/* Filter and Table */}
      <Card className="border-slate-200 bg-white">
        <CardHeader className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-sm font-bold text-slate-900">Live Risk Registry</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search student or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
            >
              <option value="all">All Departments</option>
              <option value="Computer">Computer</option>
              <option value="Information Technology">IT</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
              <option value="Electronics">Electronics</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="py-3 px-4">Student Name & ID</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Attendance</th>
                <th className="py-3 px-4 text-center">CGPA</th>
                <th className="py-3 px-4 text-center">Risk Score</th>
                <th className="py-3 px-4 text-center">30-Day Trend</th>
                <th className="py-3 px-4">Primary Risk Driver</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{s.name}</div>
                    <div className="text-[11px] text-slate-400">{s.id}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{s.dept}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.attendance < 60 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                      {s.attendance}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-medium">{s.cgpa}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${s.riskScore >= 75 ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-orange-100 text-orange-700 border border-orange-200'}`}>
                      {s.riskScore}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-red-600">{s.trend}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{s.driver}</td>
                  <td className="py-3 px-4 text-right">
                    <Link href={`/admin/students`}>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-purple-600 hover:text-purple-800 hover:bg-purple-50">
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
