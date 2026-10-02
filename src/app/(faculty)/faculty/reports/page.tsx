'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Download, CheckCircle2 } from 'lucide-react';

export default function FacultyReportsPage() {
  const reports = [
    { title: 'SE Computer Engineering Monthly Risk Summary (Sep 2025)', size: '1.8 MB', date: 'Sep 30, 2025' },
    { title: 'Mid-Semester Attendance & Defaulter List (Below 65%)', size: '1.2 MB', date: 'Sep 28, 2025' },
    { title: 'Intervention Outcomes & Progress Report Q3', size: '2.1 MB', date: 'Sep 25, 2025' },
    { title: 'Continuous Assessment & Internal Test Marks Report', size: '3.4 MB', date: 'Sep 20, 2025' },
  ];

  return (
    <div className="space-y-5 pb-10 text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/faculty/dashboard" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="h-6 w-6 text-purple-600" />
              Faculty Academic & Mentorship Reports
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generated reports on cohort performance, attendance deficits, and intervention efficacy.
          </p>
        </div>

        <Link href="/faculty/reports/download">
          <Button size="sm" className="text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1.5">
            <Download className="h-3.5 w-3.5" /> Export All Data
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {reports.map((r, i) => (
          <Card key={i} className="p-4 border-slate-200 bg-white hover:border-purple-200 transition-all shadow-2xs">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">{r.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">PDF · {r.size} · Generated on {r.date}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 text-purple-600 border-purple-200">
                <Download className="h-3.5 w-3.5" /> Download
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
