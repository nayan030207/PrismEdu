'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CreateInterventionModal } from '@/components/interventions/create-intervention-modal';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  RefreshCw,
  Plus,
  AlertTriangle,
  Activity,
  Zap,
} from 'lucide-react';

export default function EmergingRiskPage() {
  const [students, setStudents] = React.useState<any[]>([]);
  const [total, setTotal] = React.useState(0);
  const [threshold, setThreshold] = React.useState(8);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedStudentId, setSelectedStudentId] = React.useState('');
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/emerging-risk?limit=50');
      const data = await res.json();
      if (data.emergingStudents) setStudents(data.emergingStudents);
      if (data.total !== undefined) setTotal(data.total);
      if (data.threshold !== undefined) setThreshold(data.threshold);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getRiskLevelClass = (level: string) => {
    if (level === 'CRITICAL') return 'bg-red-100 text-red-700 border-red-200';
    if (level === 'HIGH') return 'bg-orange-100 text-orange-700 border-orange-200';
    if (level === 'MODERATE') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-emerald-50 text-emerald-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-amber-500" />
            Emerging Risk Detection
          </h2>
          <p className="text-sm text-slate-500">
            Students not yet at high risk, but whose risk score has increased by ≥{threshold} points recently.
            Early intervention now can prevent escalation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
        <Zap className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-bold text-amber-900">
            Early Intervention Opportunity
          </div>
          <p className="text-xs text-amber-700 mt-0.5">
            These students show risk indicators that are rising but haven&apos;t yet crossed the high-risk threshold.
            Timely interventions at this stage have the highest impact on reducing dropout probability.
            <strong> This list is based on actual ML predictions — not static rules.</strong>
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 border-amber-200 bg-amber-50/30">
          <div className="text-2xl font-black text-amber-700">{total}</div>
          <div className="text-xs font-medium text-amber-600">Emerging Risk Students</div>
        </Card>
        <Card className="p-4 border-slate-200">
          <div className="text-2xl font-black text-slate-900">+{threshold}pts</div>
          <div className="text-xs font-medium text-slate-500">Risk Increase Threshold</div>
        </Card>
        <Card className="p-4 border-slate-200">
          <div className="text-2xl font-black text-indigo-700">
            {students.length > 0
              ? Math.round(students.reduce((a, s) => a + s.riskChange, 0) / students.length)
              : 0}
            pts
          </div>
          <div className="text-xs font-medium text-slate-500">Avg Risk Increase</div>
        </Card>
      </div>

      {/* Student Table */}
      <Card className="border-slate-200 overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900">
            {students.length === 0 && !isLoading
              ? 'No Emerging Risk Students'
              : `${students.length} Student${students.length !== 1 ? 's' : ''} Detected`}
          </CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs">Student</TableHead>
              <TableHead className="text-xs">Department</TableHead>
              <TableHead className="text-xs text-center">Current Risk</TableHead>
              <TableHead className="text-xs text-center">Previous Risk</TableHead>
              <TableHead className="text-xs text-center">Change</TableHead>
              <TableHead className="text-xs">Primary Driver</TableHead>
              <TableHead className="text-xs text-center">Attendance</TableHead>
              <TableHead className="text-right text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">
                  <Activity className="h-6 w-6 animate-spin text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Analyzing student risk trajectories...</p>
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <TrendingDown className="h-10 w-10 text-emerald-200" />
                    <p className="text-sm font-medium text-slate-500">No emerging-risk students detected</p>
                    <p className="text-xs text-slate-400">
                      All currently tracked students have stable or improving risk indicators.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              students.map((st) => (
                <TableRow key={st.id} className="hover:bg-amber-50/20 transition-colors">
                  <TableCell>
                    <div className="font-semibold text-slate-900 text-sm">{st.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{st.studentId}</div>
                    <div className="text-[10px] text-slate-400">Year {st.academicYear}</div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 max-w-32">
                    <div className="truncate">{st.department}</div>
                    <div className="text-[11px] text-slate-400 truncate">{st.course}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full border ${getRiskLevelClass(st.riskLevel)}`}>
                      {st.currentRisk}%
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{st.riskLevel}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-xs text-slate-600 font-mono">
                      {st.previousRisk !== null ? `${st.previousRisk}%` : '—'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-0.5 text-xs font-black text-red-600">
                      <TrendingUp className="h-3 w-3" /> +{st.riskChange}pts
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-[11px] bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded font-medium">
                      {st.primaryRiskDriver}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`text-xs font-bold ${
                        st.attendanceRate < 75 ? 'text-red-600' : st.attendanceRate < 85 ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      {st.attendanceRate?.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-amber-600 hover:bg-amber-50"
                        onClick={() => {
                          setSelectedStudentId(st.id);
                          setIsCreateOpen(true);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Intervene
                      </Button>
                      <Link href={`/faculty/students/${st.id}/analysis`}>
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                          <Eye className="h-3 w-3 mr-1" /> View
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <CreateInterventionModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setSelectedStudentId('');
        }}
        onCreated={fetchData}
        initialStudentId={selectedStudentId}
      />
    </div>
  );
}
