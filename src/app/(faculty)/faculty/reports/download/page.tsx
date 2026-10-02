'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

export default function FacultyDownloadReportsPage() {
  const [downloading, setDownloading] = React.useState<string | null>(null);

  const handleDownload = (format: string) => {
    setDownloading(format);
    setTimeout(() => {
      setDownloading(null);
      alert(`Report downloaded successfully in ${format} format.`);
    }, 1000);
  };

  return (
    <div className="space-y-5 pb-10 text-slate-800">
      <div className="flex items-center gap-2">
        <Link href="/faculty/reports" className="text-slate-400 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Download className="h-6 w-6 text-purple-600" />
            Download Cohort Data & Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">Export full student spreadsheets, attendance logs, and risk rankings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: 'Complete Student Roster (54 Students)', desc: 'Roll numbers, attendance, CGPA, risk scores, and mentor notes.', ext: 'XLSX' },
          { name: 'At-Risk Defaulter Roster', desc: '12 flagged high-risk students and detailed risk vectors.', ext: 'CSV' },
          { name: 'Intervention Audit Log', desc: '11 assigned intervention records, statuses, and completion rates.', ext: 'PDF' },
        ].map((item, idx) => (
          <Card key={idx} className="p-4 border-slate-200 bg-white flex flex-col justify-between shadow-2xs">
            <div>
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 w-fit mb-3">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">{item.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
            </div>
            <Button
              onClick={() => handleDownload(item.ext)}
              disabled={downloading === item.ext}
              size="sm"
              className="mt-4 text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              {downloading === item.ext ? 'Exporting...' : `Export as ${item.ext}`}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
