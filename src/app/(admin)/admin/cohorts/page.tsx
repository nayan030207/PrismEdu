'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers, ArrowLeft, Users, TrendingUp } from 'lucide-react';

export default function CohortAnalysisPage() {
  const cohorts = [
    { name: 'First Year (2025 Entry)', total: 360, highRisk: 28, rate: '7.7%', avgGpa: 7.2 },
    { name: 'Second Year (2024 Entry)', total: 320, highRisk: 24, rate: '7.5%', avgGpa: 7.0 },
    { name: 'Third Year (2023 Entry)', total: 300, highRisk: 18, rate: '6.0%', avgGpa: 7.4 },
    { name: 'Final Year (2022 Entry)', total: 260, highRisk: 14, rate: '5.3%', avgGpa: 7.8 },
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
              <Layers className="h-6 w-6 text-purple-600" />
              Cohort Analysis
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Batch-by-batch demographic segmentation, persistence rates, and retention outcomes.
          </p>
        </div>

        <Link href="/admin/dashboard">
          <Button variant="outline" size="sm" className="text-xs">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cohorts.map((c) => (
          <Card key={c.name} className="border-slate-200 bg-white p-4">
            <h3 className="text-xs font-bold text-slate-800">{c.name}</h3>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">{c.total}</span>
              <span className="text-xs font-semibold text-rose-600">{c.highRisk} at risk ({c.rate})</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400">Average CGPA: {c.avgGpa}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
