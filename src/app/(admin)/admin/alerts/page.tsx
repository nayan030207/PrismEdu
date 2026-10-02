'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, ArrowLeft, AlertCircle, ShieldAlert, CheckCircle2, Clock, Filter, Eye } from 'lucide-react';

export default function AdminAlertsPage() {
  const [filter, setFilter] = React.useState('all');

  const alerts = [
    {
      id: 'ALT-101',
      title: 'Sudden Attendance Drop (>20%)',
      student: 'Vishal More (STD001)',
      department: 'Mechanical Engineering',
      severity: 'critical',
      date: 'Today, 09:30 AM',
      description: 'Attendance plunged from 72% to 52% within 14 days without leave justification.',
    },
    {
      id: 'ALT-102',
      title: 'Predicted Risk Level Surged to Critical (82%)',
      student: 'Aarti Salunkhe (STD002)',
      department: 'Information Technology',
      severity: 'critical',
      date: 'Today, 08:45 AM',
      description: 'Internal mid-semester test score dropped by 34% combined with consecutive absences.',
    },
    {
      id: 'ALT-103',
      title: 'Intervention Overdue: Academic Mentorship',
      student: 'Karan Desai (STD003)',
      department: 'Civil Engineering',
      severity: 'high',
      date: 'Yesterday, 04:15 PM',
      description: 'Action was scheduled for resolution by Sep 25, 2025. Awaiting faculty submission.',
    },
    {
      id: 'ALT-104',
      title: 'Fee Installment Default Flag',
      student: 'Sneha Jadhav (STD004)',
      department: 'Computer Engineering',
      severity: 'high',
      date: 'Sep 26, 2025',
      description: 'Notice issued for tuition installment arrears. Financial counseling recommended.',
    },
    {
      id: 'ALT-105',
      title: 'Rapid Indicator Shift Detected',
      student: 'Rahul Patil (STD006)',
      department: 'Information Technology',
      severity: 'medium',
      date: 'Sep 25, 2025',
      description: 'Risk increased by 23% in 30-day cohort simulation. Flagged as Emerging Risk.',
    },
    {
      id: 'ALT-106',
      title: 'Lab Session Non-Attendance',
      student: 'Aditya Kulkarni (STD007)',
      department: 'Mechanical Engineering',
      severity: 'medium',
      date: 'Sep 24, 2025',
      description: '3 consecutive workshop and computer lab absences registered.',
    },
    {
      id: 'ALT-107',
      title: 'Mentor Escalation Request Submitted',
      student: 'Priya Deshmukh (STD008)',
      department: 'Civil Engineering',
      severity: 'high',
      date: 'Sep 23, 2025',
      description: 'Mentor requested head of department review regarding career counseling support.',
    },
  ];

  const filtered = alerts.filter((a) => (filter === 'all' ? true : a.severity === filter));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Bell className="h-6 w-6 text-purple-600" />
              Institutional Alert Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated predictive triggers and risk events requiring institutional escalation.
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

      <div className="flex items-center gap-2">
        {['all', 'critical', 'high', 'medium'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all border ${
              filter === f
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300'
            }`}
          >
            {f === 'all' ? 'All Alerts (7)' : `${f} (${alerts.filter((a) => a.severity === f).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((item) => (
          <Card key={item.id} className="border-slate-200 bg-white p-4 hover:border-purple-200 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.severity === 'critical'
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : item.severity === 'high'
                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {item.severity}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                </div>
                <div className="text-xs font-medium text-purple-700">
                  {item.student} · <span className="text-slate-500 font-normal">{item.department}</span>
                </div>
                <p className="text-xs text-slate-600">{item.description}</p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {item.date}
                </span>
                <Link href="/admin/students">
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                    <Eye className="h-3 w-3" /> Review
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
