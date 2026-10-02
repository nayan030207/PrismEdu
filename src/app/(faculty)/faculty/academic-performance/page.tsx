'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, TrendingDown, BookOpen } from 'lucide-react';
import { getFacultyStudents } from '@/lib/store/faculty-data';

export default function FacultyAcademicPerformancePage() {
  const students = getFacultyStudents();
  const declining = students.filter((s) => s.academicDecline);

  return (
    <div className="space-y-5 pb-10 text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/faculty/dashboard" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              Academic Performance & Internal Trends
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Internal marks evaluation, continuous assessments, and unit test trajectory for SE Computer Engineering.
          </p>
        </div>

        <Link href="/faculty/dashboard">
          <Button variant="outline" size="sm" className="text-xs">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Academic Decline Watchlist ({declining.length} Students)</h3>
          <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            Internal Marks Declining
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 text-left text-[11px]">
                <th className="py-2.5 px-4 font-semibold">Student</th>
                <th className="py-2.5 px-4 font-semibold text-center">CGPA</th>
                <th className="py-2.5 px-4 font-semibold text-center">Attendance</th>
                <th className="py-2.5 px-4 font-semibold text-center">Missed Assignments</th>
                <th className="py-2.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {declining.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-4">
                    <span className="font-semibold text-slate-900">{s.full_name}</span>
                    <span className="text-slate-400 font-mono text-[10px] ml-1.5">({s.student_id})</span>
                  </td>
                  <td className="py-2.5 px-4 text-center font-bold text-slate-800">{s.cgpa.toFixed(1)}</td>
                  <td className="py-2.5 px-4 text-center">{s.attendance}%</td>
                  <td className="py-2.5 px-4 text-center font-semibold text-rose-600">{s.missedAssignments || 2}</td>
                  <td className="py-2.5 px-4 text-right">
                    <Link href={`/faculty/students/${s.student_id}`}>
                      <Button variant="outline" size="sm" className="h-6 text-[11px] text-purple-600 border-purple-200">
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
