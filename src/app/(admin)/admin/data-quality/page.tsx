'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileSpreadsheet,
  Users,
  CalendarX2,
  BookOpen,
  Activity,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function DataQualityPage() {
  const [report, setReport] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchReport = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analytics/data-quality');
      const data = await res.json();
      if (data.report) setReport(data.report);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const r = report || {};

  const completeness = r.overallCompletenessPercentage ?? 0;
  const completenessColor =
    completeness >= 90 ? 'text-emerald-700' : completeness >= 70 ? 'text-amber-700' : 'text-red-700';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Database className="h-6 w-6 text-indigo-500" /> Data Quality Center
          </h2>
          <p className="text-sm text-slate-500">
            Monitor data completeness, missing fields, and import quality for the prediction pipeline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchReport} className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Link href="/admin/students/import">
            <Button size="sm" className="gap-1.5 text-xs bg-purple-600 hover:bg-purple-700">
              <FileSpreadsheet className="h-4 w-4" /> Import Data
            </Button>
          </Link>
        </div>
      </div>

      {/* Completeness Banner */}
      <div
        className={`rounded-xl border p-4 flex items-center gap-4 ${
          completeness >= 90
            ? 'bg-emerald-50 border-emerald-200'
            : completeness >= 70
            ? 'bg-amber-50 border-amber-200'
            : 'bg-red-50 border-red-200'
        }`}
      >
        <div className={`text-4xl font-black ${completenessColor}`}>{completeness}%</div>
        <div>
          <div className={`text-sm font-bold ${completenessColor}`}>Overall Data Completeness</div>
          <p className="text-xs text-slate-600 mt-0.5">
            {completeness >= 90
              ? 'Excellent data quality. Predictions will be highly reliable.'
              : completeness >= 70
              ? 'Good data quality, but some records have missing fields. Fill in missing data for more accurate predictions.'
              : 'Data quality needs improvement. Missing critical fields may reduce prediction accuracy.'}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          title="Total Records"
          value={r.totalStudentRecords ?? 0}
          icon={<Users className="h-5 w-5" />}
          color="indigo"
        />
        <StatCard
          title="Complete Records"
          value={r.completeRecords ?? 0}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="emerald"
          description="All required fields present"
        />
        <StatCard
          title="Missing Attendance"
          value={r.missingAttendance ?? 0}
          icon={<CalendarX2 className="h-5 w-5" />}
          color={r.missingAttendance > 0 ? 'amber' : 'emerald'}
          description="No attendance rate on record"
        />
        <StatCard
          title="Missing Academic"
          value={r.missingAcademicData ?? 0}
          icon={<BookOpen className="h-5 w-5" />}
          color={r.missingAcademicData > 0 ? 'amber' : 'emerald'}
          description="No GPA/marks on record"
        />
      </div>

      {/* Field Breakdown */}
      <Card className="border-slate-200">
        <CardHeader className="pb-2 border-b border-slate-100">
          <CardTitle className="text-sm font-bold">Data Field Coverage</CardTitle>
          <p className="text-xs text-slate-500">
            How many records have each critical field populated
          </p>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {[
            {
              label: 'Attendance Rate',
              missing: r.missingAttendance ?? 0,
              total: r.totalStudentRecords ?? 1,
              impact: 'High — Attendance is the #1 predictor of dropout risk',
            },
            {
              label: 'Academic GPA / CGPA',
              missing: r.missingAcademicData ?? 0,
              total: r.totalStudentRecords ?? 1,
              impact: 'High — Academic performance is a primary risk factor',
            },
            {
              label: 'Engagement / Activity',
              missing: r.missingEngagementData ?? 0,
              total: r.totalStudentRecords ?? 1,
              impact: 'Medium — Affects engagement risk scoring',
            },
            {
              label: 'Duplicate Records',
              missing: r.duplicateRecords ?? 0,
              total: r.totalStudentRecords ?? 1,
              impact: 'Low — Potential double-counting',
            },
            {
              label: 'Invalid / Failed Imports',
              missing: r.invalidRecords ?? 0,
              total: r.totalStudentRecords ?? 1,
              impact: 'Low — Could not be processed',
            },
          ].map(({ label, missing, total, impact }) => {
            const covered = Math.max(0, total - missing);
            const pct = total > 0 ? Math.round((covered / total) * 100) : 0;
            return (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-700">{label}</span>
                    <span className="ml-2 text-slate-400">{impact}</span>
                  </div>
                  <div className="font-mono">
                    <span className={`font-bold ${pct >= 90 ? 'text-emerald-700' : pct >= 70 ? 'text-amber-700' : 'text-red-700'}`}>
                      {pct}%
                    </span>
                    {missing > 0 && (
                      <span className="text-slate-400 ml-1">({missing} missing)</span>
                    )}
                  </div>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct >= 90 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/20 transition-colors">
          <Link href="/admin/students/import" className="flex items-center gap-3">
            <FileSpreadsheet className="h-8 w-8 text-indigo-400" />
            <div>
              <div className="font-bold text-slate-900 text-sm">Import / Update Student Data</div>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload CSV or Excel to add or update student records, attendance, and academic data.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 ml-auto" />
          </Link>
        </Card>
        <Card className="p-4 border-dashed border-purple-200 hover:border-purple-400 hover:bg-purple-50/20 transition-colors">
          <Link href="/admin/ai/model" className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-purple-400" />
            <div>
              <div className="font-bold text-slate-900 text-sm">View Model Performance</div>
              <p className="text-xs text-slate-500 mt-0.5">
                See how data quality affects ML prediction accuracy, precision, and recall.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 ml-auto" />
          </Link>
        </Card>
      </div>
    </div>
  );
}
