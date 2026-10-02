'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ArrowLeft, Download, Calendar, CheckCircle2 } from 'lucide-react';

export default function ReportsPage() {
  const [downloading, setDownloading] = React.useState<string | null>(null);

  const reports = [
    {
      id: 'REP-001',
      title: 'Monthly Institutional Dropout Risk Summary',
      date: 'September 2025',
      size: '2.4 MB',
      type: 'PDF',
    },
    {
      id: 'REP-002',
      title: 'Intervention Outcomes & Faculty Accountability Audit',
      date: 'AY 2025 - Q1',
      size: '1.8 MB',
      type: 'PDF',
    },
    {
      id: 'REP-003',
      title: 'Department-wise Attendance Deficit Register',
      date: 'Sep 2025',
      size: '890 KB',
      type: 'XLSX',
    },
    {
      id: 'REP-004',
      title: 'Predictive Model Reliability & Bias Evaluation Report',
      date: 'August 2025',
      size: '3.1 MB',
      type: 'PDF',
    },
  ];

  const handleDownload = (id: string) => {
    setDownloading(id);
    setTimeout(() => {
      setDownloading(null);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="h-6 w-6 text-purple-600" />
              Executive Reports & Exports
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official institutional dossiers, audit compliance records, and predictive analytics summaries.
          </p>
        </div>

        <Link href="/admin/dashboard">
          <Button variant="outline" size="sm" className="text-xs">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {reports.map((r) => (
          <Card key={r.id} className="border-slate-200 bg-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{r.title}</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  {r.date} · {r.size} · {r.type}
                </div>
              </div>
            </div>

            <Button
              onClick={() => handleDownload(r.id)}
              variant="outline"
              size="sm"
              className="text-xs gap-1.5"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              {downloading === r.id ? 'Downloading...' : 'Download'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
