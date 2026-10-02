'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Target, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';
import { getFacultyStudents, type FacultyStudent } from '@/lib/store/faculty-data';

export default function FacultyAtRiskPage() {
  const [students, setStudents] = React.useState<FacultyStudent[]>([]);

  React.useEffect(() => {
    fetch('/api/faculty/dashboard')
      .then((res) => res.json())
      .then((data) => {
        if (data.atRiskStudents) {
          setStudents(data.atRiskStudents);
        } else {
          setStudents(getFacultyStudents().filter((s) => s.riskCategory === 'critical' || s.riskCategory === 'high'));
        }
      })
      .catch(() => {
        setStudents(getFacultyStudents().filter((s) => s.riskCategory === 'critical' || s.riskCategory === 'high'));
      });
  }, []);

  return (
    <div className="space-y-5 pb-10 text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/faculty/dashboard" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Target className="h-6 w-6 text-purple-600" />
              At-Risk Students (My Assigned Cohort)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immediate faculty mentoring and retention escalation queue • 12 flagged students.
          </p>
        </div>

        <Link href="/faculty/interventions">
          <Button size="sm" className="text-xs bg-purple-600 hover:bg-purple-700 text-white">
            Manage Interventions
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 text-left text-[11px]">
                <th className="py-3 px-4 font-semibold">Student Name & ID</th>
                <th className="py-3 px-4 font-semibold">Year & Course</th>
                <th className="py-3 px-4 font-semibold text-center">Attendance</th>
                <th className="py-3 px-4 font-semibold text-center">CGPA</th>
                <th className="py-3 px-4 font-semibold text-center">Risk Score</th>
                <th className="py-3 px-4 font-semibold text-center">Trend</th>
                <th className="py-3 px-4 font-semibold text-center">Intervention Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`h-7 w-7 rounded-full ${st.avatarBg} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}>
                        {st.avatarInitials}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-xs">{st.full_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{st.student_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <span className="font-medium text-slate-800">{st.year}</span> · {st.course}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      st.attendance < 50 ? 'text-rose-700 bg-rose-50 border border-rose-200' : 'text-amber-700 bg-amber-50 border border-amber-200'
                    }`}>
                      {st.attendance}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-800">
                    {st.cgpa.toFixed(1)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      st.riskScore >= 75 ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-orange-100 text-orange-700 border border-orange-200'
                    }`}>
                      {st.riskScore}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-rose-600 text-xs">
                      📈 {st.trendValue}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      st.intervention === 'None'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : st.intervention === 'Pending'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : st.intervention === 'In Progress'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-purple-50 text-purple-800 border border-purple-200'
                    }`}>
                      {st.intervention}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link href={`/faculty/students/${st.student_id}`}>
                      <Button variant="outline" size="sm" className="h-7 text-xs text-purple-600 hover:text-purple-800 border-purple-200">
                        View Detail
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
