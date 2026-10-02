'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, ArrowLeft, TrendingUp, Users, Calendar, Download, Building } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

export default function InstitutionalAnalyticsPage() {
  const departmentData = [
    { name: 'Mechanical', low: 180, moderate: 45, high: 22, critical: 8 },
    { name: 'Civil', low: 160, moderate: 38, high: 18, critical: 4 },
    { name: 'Computer', low: 280, moderate: 35, high: 14, critical: 2 },
    { name: 'IT', low: 210, moderate: 28, high: 10, critical: 2 },
    { name: 'Electronics', low: 130, moderate: 22, high: 8, critical: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              Institutional Analytics & Trends
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Macro-level academic performance, retention trends, and cohort dropout probability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/dashboard">
            <Button variant="outline" size="sm" className="text-xs">
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/admin/analytics/departments">
            <Button size="sm" className="text-xs bg-purple-600 hover:bg-purple-700 text-white">
              Department Drilldown
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border-slate-200 bg-white p-4">
          <CardHeader className="p-0 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-900">
              Department-wise Risk Breakdown
            </CardTitle>
            <span className="text-[11px] text-slate-400">AY 2025-26</span>
          </CardHeader>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Bar dataKey="low" name="Low Risk" fill="#10B981" stackId="a" />
                <Bar dataKey="moderate" name="Moderate" fill="#F59E0B" stackId="a" />
                <Bar dataKey="high" name="High Risk" fill="#F97316" stackId="a" />
                <Bar dataKey="critical" name="Critical" fill="#EF4444" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-slate-200 bg-white p-4">
          <CardHeader className="p-0 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-900">
              Retention & Success Projection
            </CardTitle>
            <span className="text-[11px] text-emerald-600 font-semibold">93.2% Projected</span>
          </CardHeader>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { year: '2021', rate: 88.5 },
                  { year: '2022', rate: 89.8 },
                  { year: '2023', rate: 91.2 },
                  { year: '2024', rate: 92.4 },
                  { year: '2025', rate: 93.2 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="year" fontSize={11} stroke="#94a3b8" />
                <YAxis domain={[80, 100]} fontSize={11} stroke="#94a3b8" />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="rate"
                  name="Retention Rate %"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#8B5CF6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
