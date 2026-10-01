'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { BarChart3, GraduationCap, Award, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export default function StudentProgressPage() {
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/student/progress')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const p = data || {
    overallCourseProgress: 72,
    cumulativeGpa: 6.20,
    completedCredits: 44,
    totalCreditsRequired: 160,
    semester: 3,
    activeBacklogs: 2,
    academicSummary: [
      { semester: 'Semester 1', gpa: 6.80, credits: 22, status: 'Cleared' },
      { semester: 'Semester 2', gpa: 5.60, credits: 22, status: '2 Backlogs (Maths II, Electronics)' },
    ],
    learningMilestones: [
      { title: 'DBMS Normalization Notes', type: 'Notes', date: '2026-09-08', status: 'Completed' },
      { title: 'SQL Indexing Guide', type: 'PDF', date: '2026-09-10', status: 'Completed' },
      { title: 'DBMS Normalization Quiz', type: 'Quiz', date: '2026-09-12', status: 'Completed (30/50)' },
      { title: 'Relational Schema Normalization Exercise', type: 'Assignment', date: 'Due in 7 days', status: 'Pending' },
    ],
  };

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading progress data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Progress</h2>
        <p className="text-sm text-slate-500">
          Track degree credits, semester GPA milestones, and coursework learning completion.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase">Cumulative GPA</span>
          <p className="text-3xl font-bold text-slate-900 mt-2">{p.cumulativeGpa} / 10</p>
          <span className="text-xs text-slate-400 mt-1 block">Across Semesters 1 & 2</span>
        </Card>

        <Card className="p-5 border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase">Degree Credits</span>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {p.completedCredits} <span className="text-base text-slate-400 font-normal">/ {p.totalCreditsRequired}</span>
          </p>
          <Progress value={(p.completedCredits / p.totalCreditsRequired) * 100} className="h-1.5 mt-2" />
        </Card>

        <Card className="p-5 border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase">Current Term</span>
          <p className="text-3xl font-bold text-slate-900 mt-2">Semester {p.semester}</p>
          <span className="text-xs text-slate-400 mt-1 block">B.Tech Computer Science</span>
        </Card>

        <Card className={`p-5 ${p.activeBacklogs > 0 ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200'}`}>
          <span className="text-xs font-semibold text-slate-500 uppercase">Active Backlogs</span>
          <p className={`text-3xl font-bold mt-2 ${p.activeBacklogs > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
            {p.activeBacklogs}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            {p.activeBacklogs > 0 ? 'Remedial tutoring advised' : 'All cleared'}
          </span>
        </Card>
      </div>

      {/* Semester Academic Records */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base">Semester Performance History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Semester Term</TableHead>
                <TableHead>Term GPA</TableHead>
                <TableHead>Earned Credits</TableHead>
                <TableHead>Transcript Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {p.academicSummary.map((sem: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell className="font-bold text-sm text-slate-900">{sem.semester}</TableCell>
                  <TableCell className="font-mono font-semibold text-sm">{sem.gpa}</TableCell>
                  <TableCell className="text-xs text-slate-600">{sem.credits} Credits</TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        sem.status.includes('Backlog')
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {sem.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Coursework & Learning Milestones */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base">Learning Milestones & Resource Progress</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {p.learningMilestones.map((m: any, idx: number) => (
            <div key={idx} className="p-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span
                  className={`p-1.5 rounded-lg ${
                    m.status.includes('Completed')
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {m.status.includes('Completed') ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </span>
                <div>
                  <h5 className="font-semibold text-slate-900 text-sm">{m.title}</h5>
                  <span className="text-[11px] text-slate-400">{m.type} • {m.date}</span>
                </div>
              </div>
              <span
                className={`font-semibold text-xs ${
                  m.status.includes('Completed') ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {m.status}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
