'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowLeft, BarChart2 } from 'lucide-react';

export default function FeatureInsightsPage() {
  const topFeatures = [
    { feature: 'Attendance Rate in Core Engineering Courses', importance: '28.4%', direction: 'Inverse' },
    { feature: 'Cumulative Grade Point Average (CGPA)', importance: '24.1%', direction: 'Inverse' },
    { feature: 'Count of Uncleared Backlogs', importance: '19.6%', direction: 'Direct' },
    { feature: 'LMS Platform Login Frequency & Engagement', importance: '12.8%', direction: 'Inverse' },
    { feature: 'Tuition Fee Arrears & Financial Aid Status', importance: '8.7%', direction: 'Direct' },
    { feature: 'Hostel Distance & Commute Fatigue Index', importance: '6.4%', direction: 'Direct' },
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
              <Sparkles className="h-6 w-6 text-purple-600" />
              Feature Importance & Model Insights
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            SHAP value distributions and ranking of key variables that drive institutional risk predictions.
          </p>
        </div>

        <Link href="/admin/dashboard">
          <Button variant="outline" size="sm" className="text-xs">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200 bg-white p-5">
        <CardHeader className="p-0 pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900">
            Global Feature Weight Contribution (SHAP Importance)
          </CardTitle>
        </CardHeader>
        <div className="divide-y divide-slate-100 mt-3">
          {topFeatures.map((f, i) => (
            <div key={i} className="py-3 flex items-center justify-between text-xs">
              <div className="font-semibold text-slate-800">{f.feature}</div>
              <div className="flex items-center gap-4">
                <span className="text-slate-400">Correlation: {f.direction}</span>
                <span className="font-bold text-purple-600 font-mono">{f.importance}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
