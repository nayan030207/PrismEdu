'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, ArrowLeft, Search, Filter, Eye } from 'lucide-react';

export default function RiskProfilesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Target className="h-6 w-6 text-purple-600" />
              Student Risk Profiles
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Deep-dive multi-dimensional risk scores, attendance decay curves, and academic backlogs.
          </p>
        </div>

        <Link href="/admin/students">
          <Button size="sm" className="text-xs bg-purple-600 hover:bg-purple-700 text-white">
            Student Directory
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200 bg-white p-5">
        <div className="text-center py-12">
          <div className="h-12 w-12 rounded-full bg-purple-100 text-purple-600 mx-auto flex items-center justify-center mb-3">
            <Target className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Student Risk Profiling Active</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            All 1,240 student profiles are continuously evaluated against 18 institutional factors.
            To view detailed individual profiles, explore the Student Directory.
          </p>
          <div className="mt-4">
            <Link href="/admin/students">
              <Button size="sm" className="text-xs">
                Explore All Profiles
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
