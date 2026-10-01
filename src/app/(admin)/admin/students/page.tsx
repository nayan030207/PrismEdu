'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { InsightBadge } from '@/components/ui/insight-badge';
import { Dialog } from '@/components/ui/dialog';
import { Search, UserCheck, UserX, Eye, Edit, AlertTriangle, UserPlus, FileSpreadsheet, Trash2 } from 'lucide-react';
import type { InsightLevel } from '@/lib/types';

export default function AdminStudentsPage() {
  const [students, setStudents] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState('');
  const [department, setDepartment] = React.useState('all');
  const [status, setStatus] = React.useState('all');
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedStudent, setSelectedStudent] = React.useState<any | null>(null);

  const fetchStudents = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (department !== 'all') params.set('department', department);
      if (status !== 'all') params.set('status', status);

      const res = await fetch(`/api/admin/students?${params.toString()}`);
      const data = await res.json();
      if (data.students) setStudents(data.students);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [search, department, status]);

  React.useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const toggleStatus = async (student: any) => {
    const nextStatus = student.status === 'active' ? 'inactive' : 'active';
    try {
      await fetch('/api/admin/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id, status: nextStatus }),
      });
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, status: nextStatus } : s))
      );
    } catch {
      // ignore
    }
  };

  const formatIncomeTier = (income?: number) => {
    if (income === undefined || income === null) return { label: 'Income N/A', class: 'bg-slate-100 text-slate-700' };
    if (income < 50000) return { label: `₹${income.toLocaleString()} (High Need)`, class: 'bg-red-50 text-red-700 border-red-200' };
    if (income <= 90000) return { label: `₹${income.toLocaleString()} (Moderate)`, class: 'bg-amber-50 text-amber-700 border-amber-200 font-medium' };
    return { label: `₹${income.toLocaleString()} (Stable)`, class: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Student Directory</h2>
          <p className="text-sm text-slate-500">
            Detailed student records, attendance %, academic performance, family income tiers, and risk indicators.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/students/add">
            <Button className="gap-1.5 text-xs">
              <UserPlus className="h-4 w-4" />
              <span>Add Student</span>
            </Button>
          </Link>
          <Link href="/admin/students/import">
            <Button variant="outline" className="gap-1.5 text-xs border-slate-300">
              <FileSpreadsheet className="h-4 w-4" />
              <span>Import Excel</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-slate-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student name, ID, or email..."
              className="pl-9 text-xs"
            />
          </div>

          <Select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            options={[
              { value: 'all', label: 'All Branches / Departments' },
              { value: 'Computer Science and Engineering', label: 'Computer Science (CSE)' },
              { value: 'Information Technology', label: 'Information Technology (IT)' },
              { value: 'Civil Engineering', label: 'Civil Engineering (CIVIL)' },
              { value: 'Mechanical Engineering', label: 'Mechanical Engineering (MECH)' },
              { value: 'Electrical Engineering', label: 'Electrical Engineering (EE)' },
              { value: 'Electronics and Telecommunication', label: 'Electronics & Telecom (ENTC)' },
              { value: 'Artificial Intelligence and Data Science', label: 'AI & Data Science (AI-DS)' },
            ]}
          />

          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All Account Statuses' },
              { value: 'active', label: 'Active Students' },
              { value: 'inactive', label: 'Inactive / Suspended' },
            ]}
          />
        </div>
      </Card>

      {/* Students Table */}
      <Card className="border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead>Student ID & Name</TableHead>
              <TableHead>Branch & Dept</TableHead>
              <TableHead>Attendance %</TableHead>
              <TableHead>GPA & Backlogs</TableHead>
              <TableHead>Income & Financial Tier</TableHead>
              <TableHead>Risk Signals</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                  Loading detailed student directory...
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                  No student records match the selected search criteria.
                </TableCell>
              </TableRow>
            ) : (
              students.map((s) => {
                const attPct = s.attendance_percentage || 85;
                const incomeTier = formatIncomeTier(s.family_income);
                const isHighRisk =
                  s.insight?.academic === 'attention_required' ||
                  s.insight?.academic === 'critical' ||
                  s.insight?.attendance === 'declining' ||
                  s.insight?.attendance === 'critical' ||
                  attPct < 75;

                return (
                  <TableRow key={s.id} className={isHighRisk ? 'bg-amber-50/20' : undefined}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isHighRisk && (
                          <span title="Attention Required">
                            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                          </span>
                        )}
                        <div>
                          <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                            <span>{s.full_name}</span>
                          </div>
                          <div className="font-mono text-xs font-semibold text-indigo-600">{s.student_id}</div>
                          <div className="text-[11px] text-slate-400">{s.email}</div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs text-slate-800 font-medium">{s.course}</div>
                      <div className="text-[11px] text-slate-500">{s.department}</div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            attPct < 75 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {attPct}%
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {attPct < 75 ? 'Decline Warning' : 'Regular Attendance'}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-semibold text-slate-900">GPA: {s.previous_gpa || '7.8'}</div>
                      <div className="text-[11px] text-slate-500">
                        Backlogs: <span className={s.academic_backlogs > 0 ? 'text-red-600 font-bold' : 'text-slate-600'}>{s.academic_backlogs || 0}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${incomeTier.class}`}>
                        {incomeTier.label}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <InsightBadge level={(s.insight?.academic as InsightLevel) || 'good'} category="academic" />
                        <InsightBadge level={(s.insight?.attendance as InsightLevel) || 'good'} category="attendance" />
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedStudent(s)}
                          className="h-8 px-2 text-xs"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-500" />
                        </Button>

                        <Link href={`/faculty/students/edit/${s.id}`}>
                          <Button size="sm" variant="outline" className="h-8 px-2 text-xs text-indigo-700 border-indigo-200">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </Link>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleStatus(s)}
                          className="h-8 px-2 text-xs hover:bg-red-50 hover:text-red-600 transition-colors"
                          title={s.status === 'active' ? "Remove Student" : "Restore Student"}
                        >
                          {s.status === 'active' ? (
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          ) : (
                            <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Student Profile Detail Modal */}
      {selectedStudent && (
        <Dialog
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Student Profile: ${selectedStudent.full_name}`}
          description={`Institutional record and predictive status for ${selectedStudent.student_id}`}
        >
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-xs text-slate-400">Institutional Email:</span>
                <p className="font-semibold text-slate-800">{selectedStudent.email}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Mobile Number:</span>
                <p className="font-semibold text-slate-800">{selectedStudent.mobile || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Degree Course:</span>
                <p className="font-semibold text-slate-800">{selectedStudent.course}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Department:</span>
                <p className="font-semibold text-slate-800">{selectedStudent.department}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Attendance Percentage:</span>
                <p className="font-semibold text-slate-800">{selectedStudent.attendance_percentage || 85}%</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Family Annual Income:</span>
                <p className="font-semibold text-slate-800">₹{selectedStudent.family_income ? selectedStudent.family_income.toLocaleString() : 'N/A'}</p>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                Actionable Status Indicators
              </h5>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 border rounded-lg flex items-center justify-between">
                  <span className="text-xs text-slate-600">Academic:</span>
                  <InsightBadge
                    level={(selectedStudent.insight?.academic as InsightLevel) || 'good'}
                    category="academic"
                  />
                </div>
                <div className="p-2 border rounded-lg flex items-center justify-between">
                  <span className="text-xs text-slate-600">Attendance:</span>
                  <InsightBadge
                    level={(selectedStudent.insight?.attendance as InsightLevel) || 'good'}
                    category="attendance"
                  />
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
