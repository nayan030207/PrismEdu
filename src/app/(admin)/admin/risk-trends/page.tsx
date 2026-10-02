'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, ArrowLeft, BarChart3, Calendar } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function RiskTrendsPage() {
  const trendData = [
    { period: 'Jan', mechanical: 14.2, civil: 11.5, computer: 9.8, it: 7.2 },
    { period: 'Feb', mechanical: 13.8, civil: 11.0, computer: 9.2, it: 6.9 },
    { period: 'Mar', mechanical: 13.1, civil: 10.4, computer: 8.8, it: 6.5 },
    { period: 'Apr', mechanical: 12.5, civil: 9.8, computer: 8.5, it: 6.4 },
    { period: 'May', mechanical: 12.0, civil: 9.5, computer: 8.2, it: 6.2 },
    { period: 'Jun', mechanical: 12.4, civil: 9.7, computer: 8.6, it: 6.3 },
    { period: 'Jul', mechanical: 12.8, civil: 9.9, computer: 8.7, it: 6.4 },
    { period: 'Aug', mechanical: 12.1, civil: 9.4, computer: 8.5, it: 6.3 },
    { period: 'Sep', mechanical: 11.7, civil: 9.1, computer: 8.4, it: 6.2 },
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
              <TrendingUp className="h-6 w-6 text-purple-600" />
              Risk Trends & Projections
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Historical progression and time-series forecasting of student risk indices across departments.
          </p>
        </div>

        <Link href="/admin/dashboard">
          <Button variant="outline" size="sm" className="text-xs">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200 bg-white p-5">
        <CardHeader className="p-0 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-900">
            Departmental Risk Trajectory (9-Month Series)
          </CardTitle>
          <span className="text-xs text-slate-500 font-medium">AY 2025-26</span>
        </CardHeader>
        <div className="h-80 mt-5">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="period" fontSize={11} stroke="#94a3b8" />
              <YAxis domain={[0, 18]} fontSize={11} stroke="#94a3b8" unit="%" />
              <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="mechanical" name="Mechanical" stroke="#EF4444" strokeWidth={2.5} />
              <Line type="monotone" dataKey="civil" name="Civil" stroke="#F97316" strokeWidth={2.5} />
              <Line type="monotone" dataKey="computer" name="Computer" stroke="#F59E0B" strokeWidth={2.5} />
              <Line type="monotone" dataKey="it" name="IT" stroke="#10B981" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
