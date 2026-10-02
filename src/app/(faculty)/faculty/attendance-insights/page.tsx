'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarCheck2, Users, AlertTriangle } from 'lucide-react';
import { getFacultyStudents } from '@/lib/store/faculty-data';

export default function FacultyAttendanceInsightsPage() {
  const students = getFacultyStudents();
  const below65 = students.filter((s) => s.attendance < 65);

  return (
    <div className="space-y-5 pb-10 text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/faculty/dashboard" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CalendarCheck2 className="h-6 w-6 text-purple-600" />
              Attendance Insights (SE Computer Engineering)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cohort attendance analytics • 16 students flagged below 65% regulatory threshold.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/faculty/students/import-attendance">
            <Button size="sm" className="text-xs bg-purple-600 hover:bg-purple-700 text-white">
              Import Attendance
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Attendance Concern Roster ({below65.length} Students)</h3>
          <span className="text-xs text-rose-600 font-semibold bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
            Below 65% Mandatory Minimum
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 text-left text-[11px]">
                <th className="py-2.5 px-4 font-semibold">Student</th>
                <th className="py-2.5 px-4 font-semibold text-center">Recorded Attendance</th>
                <th className="py-2.5 px-4 font-semibold text-center">CGPA</th>
                <th className="py-2.5 px-4 font-semibold text-center">Risk Level</th>
                <th className="py-2.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {below65.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-4">
                    <span className="font-semibold text-slate-900">{s.full_name}</span>
                    <span className="text-slate-400 font-mono text-[10px] ml-1.5">({s.student_id})</span>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200">
                      {s.attendance}%
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-center font-semibold text-slate-800">{s.cgpa.toFixed(1)}</td>
                  <td className="py-2.5 px-4 text-center font-bold text-rose-600 uppercase text-[10px]">{s.riskCategory}</td>
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
